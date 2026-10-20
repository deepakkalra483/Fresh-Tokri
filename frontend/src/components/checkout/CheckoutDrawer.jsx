/**
 * CheckoutDrawer.jsx
 * WhatsApp-first checkout — no login, no Firestore order.
 *
 * Flow:
 *   1. Show cart summary + delivery mode
 *   2. Collect phone (10-digit, saved to localStorage for next time)
 *   3. Collect address — GPS (Google Maps link) or typed text
 *   4. Build pre-filled WhatsApp message → open wa.me link
 *
 * WhatsApp business number: +91 8901058909
 */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsCheckoutOpen, closeCheckout,
  selectCartTotals, selectCartItems, clearCart,
} from '../../features/cart/cartSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { selectActiveAddress, setActiveAddress } from '../../features/address/addressSlice';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import {
  X, ShoppingBasket, Zap, Sun, Navigation, Loader2,
  AlertCircle, MapPin, MessageCircle,
  ChevronDown, ChevronUp, Edit2,
} from 'lucide-react';

const WA_NUMBER = '918901058909'; // +91 8901058909
const ADDR_KEY  = 'ft_customer_address';

// ── helpers ──────────────────────────────────────────────────────────────────
function buildWhatsAppMessage({ items, total, mode, address, mapsLink }) {
  const modeLabel = mode === 'instant'
    ? '⚡ Instant Delivery (15–20 mins)'
    : '🌅 Next Morning (6–9 AM, 20% off)';

  const itemLines = items
    .map((i) => `  • ${i.name} × ${i.qty}  —  ₹${(i.price * i.qty)}`)
    .join('\n');

  const locationLine = mapsLink
    ? `📍 Location: ${mapsLink}\n   ${address}`
    : `📍 Address: ${address}`;

  return (
    `🛒 *New Order — Fresh Tokri*\n\n` +
    `📦 *Items:*\n${itemLines}\n\n` +
    `💰 *Total: ₹${total}*\n` +
    `🚚 ${modeLabel}\n\n` +
    `${locationLine}`
  );
}

// ── component ─────────────────────────────────────────────────────────────────
export default function CheckoutDrawer() {
  const dispatch  = useDispatch();
  const isOpen    = useSelector(selectIsCheckoutOpen);
  const totals    = useSelector(selectCartTotals);
  const cartItems = useSelector(selectCartItems);
  const mode      = useSelector(selectDeliveryMode);
  const products  = useSelector((s) => s.products.productsList);
  const savedAddr = useSelector(selectActiveAddress);

  // Address
  const [addrMode, setAddrMode]   = useState('gps'); // 'gps' | 'type'
  const [typedAddr, setTypedAddr] = useState('');
  const [addrErr, setAddrErr]     = useState('');
  const [gpsCoords, setGpsCoords] = useState(null); // { lat, lng, label }

  // UI
  const [showItems, setShowItems] = useState(false);
  const [sending,   setSending]   = useState(false);

  const { status: gpsStatus, geoAddress, errorMsg: gpsError, requestLocation, reset: resetGps } = useGeoLocation();

  // Restore saved address from localStorage on open
  useEffect(() => {
    if (isOpen) {
      const savedAddress = localStorage.getItem(ADDR_KEY);
      if (savedAddress) {
        try {
          const parsed = JSON.parse(savedAddress);
          setTypedAddr(parsed.text || '');
          if (parsed.coords) setGpsCoords(parsed.coords);
        } catch (_) {}
      }
    }
  }, [isOpen]);

  // When GPS resolves, store coords
  useEffect(() => {
    if (geoAddress) {
      setGpsCoords({ lat: geoAddress.lat, lng: geoAddress.lng, label: `${geoAddress.flat}, ${geoAddress.area}` });
      dispatch(setActiveAddress(geoAddress));
    }
  }, [geoAddress, dispatch]);

  if (!isOpen) return null;

  // Build formatted cart items
  const formattedItems = Object.entries(cartItems).map(([id, qty]) => {
    const p = products.find((x) => x.id === id);
    if (!p) return null;
    const price = mode === 'instant' ? p.priceInstant : p.priceMorning;
    return { id: p.id, name: `${p.name} (${p.weight})`, price, qty };
  }).filter(Boolean);

  const handleClose = () => {
    dispatch(closeCheckout());
    resetGps();
    setSending(false);
  };

  const handleSendOnWhatsApp = () => {
    // Validate address
    const hasGPS    = addrMode === 'gps' && gpsCoords;
    const hasTyped  = addrMode === 'type' && typedAddr.trim().length >= 5;
    if (!hasGPS && !hasTyped) {
      setAddrErr(
        addrMode === 'gps'
          ? 'Please detect your location first, or switch to type address.'
          : 'Please enter your full address (at least 5 characters).'
      );
      return;
    }
    setAddrErr('');

    // Save address for next time
    const addrPayload = {
      text: addrMode === 'type' ? typedAddr.trim() : (gpsCoords?.label || ''),
      coords: hasGPS ? gpsCoords : null,
    };
    localStorage.setItem(ADDR_KEY, JSON.stringify(addrPayload));

    // Build message
    const mapsLink = hasGPS
      ? `https://maps.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`
      : null;
    const addrText = hasGPS
      ? (gpsCoords.label || 'GPS Location')
      : typedAddr.trim();

    const message = buildWhatsAppMessage({
      items:    formattedItems,
      total:    totals.finalTotal,
      mode,
      address:  addrText,
      mapsLink,
    });

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

    // ── Save order to localStorage so Orders screen can display it ──────────
    const newOrder = {
      id: `FT-${Date.now()}`,
      placedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      items: formattedItems.map((i) => ({
        productId: i.id,      // ← product ID for Reorder
        name:      i.name,
        qty:       i.qty,
        price:     i.price,
      })),
      totalPaid:   totals.finalTotal,
      mode,
      address:     addrText,
      mapsLink:    mapsLink || null,
      status:      'sent_whatsapp',
    };

    const existingOrders = JSON.parse(localStorage.getItem('ft_orders') || '[]');
    localStorage.setItem('ft_orders', JSON.stringify([newOrder, ...existingOrders]));
    // ────────────────────────────────────────────────────────────────────────

    setSending(true);
    dispatch(clearCart());
    dispatch(closeCheckout());
    resetGps();

    // Open WhatsApp
    window.open(waUrl, '_blank');
    setSending(false);
  };

  const canSend = formattedItems.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl max-h-[92%] overflow-y-auto shadow-2xl max-w-[412px] mx-auto w-full">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <MessageCircle size={14} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Order via WhatsApp</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-4 pb-6 space-y-4 pt-3">

          {/* ── Delivery Mode ── */}
          <div className={`p-3 rounded-xl border text-xs ${
            mode === 'instant'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-1.5 font-extrabold">
              {mode === 'instant'
                ? <><Zap size={13} className="fill-rose-600 text-rose-600" /> Instant Delivery — 15–20 mins</>
                : <><Sun size={13} className="fill-emerald-600 text-emerald-600" /> Next Morning — 6–9 AM (20% off)</>
              }
            </div>
          </div>

          {/* ── Cart Items (collapsible) ── */}
          <div className="bg-slate-50 rounded-xl border border-slate-200">
            <button
              className="w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-extrabold text-slate-800"
              onClick={() => setShowItems((v) => !v)}
            >
              <div className="flex items-center gap-1.5">
                <ShoppingBasket size={13} className="text-emerald-600" />
                <span>{formattedItems.length} item{formattedItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700">₹{totals.finalTotal}</span>
                {showItems ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </div>
            </button>

            {showItems && (
              <div className="px-3 pb-3 space-y-1 border-t border-slate-200 pt-2">
                {formattedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-[11px] text-slate-700">
                    <span className="font-medium">{item.name} <span className="text-slate-400">×{item.qty}</span></span>
                    <span className="font-bold">₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-extrabold text-slate-900 pt-1.5 border-t border-slate-200 mt-1.5">
                  <span>Total</span>
                  <span>₹{totals.finalTotal}</span>
                </div>
                {mode === 'morning' && totals.totalSavings > 0 && (
                  <p className="text-[10px] text-emerald-700 font-bold text-right">
                    You save ₹{totals.totalSavings} with morning delivery 🎉
                  </p>
                )}
              </div>
            )}
          </div>



          {/* ── Delivery Address ── */}
          <div>
            <div className="text-[11px] font-extrabold text-slate-800 mb-1.5 flex items-center gap-1">
              <MapPin size={11} /> Delivery Address
            </div>

            {/* Toggle GPS / Type */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-2 text-[11px] font-bold">
              <button
                onClick={() => { setAddrMode('gps'); setAddrErr(''); }}
                className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
                  addrMode === 'gps'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Navigation size={12} /> Use GPS Location
              </button>
              <button
                onClick={() => { setAddrMode('type'); setAddrErr(''); }}
                className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
                  addrMode === 'type'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Edit2 size={12} /> Type Address
              </button>
            </div>

            {/* GPS panel */}
            {addrMode === 'gps' && (
              <div className="space-y-2">
                <button
                  onClick={() => requestLocation()}
                  disabled={gpsStatus === 'loading'}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] ${
                    gpsStatus === 'success'
                      ? 'bg-emerald-600 text-white'
                      : gpsStatus === 'denied' || gpsStatus === 'error'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {gpsStatus === 'loading'
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Navigation size={13} />
                  }
                  {gpsStatus === 'loading' ? 'Detecting location...'
                    : gpsStatus === 'success' ? '✓ Location Detected — tap to refresh'
                    : 'Detect My Location'}
                </button>

                {gpsStatus === 'success' && gpsCoords && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-[10px] text-blue-800">
                    <p className="font-bold mb-0.5">📍 {gpsCoords.label}</p>
                    <p className="text-blue-600">
                      A Google Maps link will be sent so we find you precisely.
                    </p>
                  </div>
                )}

                {(gpsStatus === 'denied' || gpsStatus === 'error') && (
                  <div className="flex items-start gap-1.5 text-[10px] text-red-600">
                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                    <p>{gpsError} Switch to "Type Address" instead.</p>
                  </div>
                )}
              </div>
            )}

            {/* Type address panel */}
            {addrMode === 'type' && (
              <textarea
                rows={3}
                placeholder="e.g. House 12, Shivaji Nagar, Near Bus Stand, Bhiwani 127021"
                value={typedAddr}
                onChange={(e) => { setTypedAddr(e.target.value); setAddrErr(''); }}
                className={`w-full rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium outline-none transition-all resize-none border ${
                  addrErr
                    ? 'bg-red-50 border-red-400'
                    : 'bg-slate-100 border-transparent focus:border-emerald-500 focus:bg-white'
                }`}
              />
            )}

            {addrErr && <p className="text-[11px] text-red-600 mt-1 font-medium">{addrErr}</p>}
          </div>

          {/* ── WhatsApp CTA ── */}
          <button
            onClick={handleSendOnWhatsApp}
            disabled={!canSend || sending}
            className={`w-full font-extrabold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm active:scale-[0.99] ${
              canSend
                ? 'bg-[#25D366] hover:bg-[#1ebe5d] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              // WhatsApp icon SVG inline
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            )}
            {canSend
              ? `Send Order on WhatsApp — ₹${totals.finalTotal}`
              : 'Add items to place order'}
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Tapping the button opens WhatsApp with your order pre-filled.
            Just press <strong>Send</strong> and we'll confirm within minutes.
          </p>

        </div>
      </div>
    </div>
  );
}
