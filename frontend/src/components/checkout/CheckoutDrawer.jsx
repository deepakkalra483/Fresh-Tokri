import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsCheckoutOpen, closeCheckout, selectCartTotals, selectCartItems, clearCart } from '../../features/cart/cartSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { selectActiveAddress, setActiveAddress, openAddressModal } from '../../features/address/addressSlice';
import { submitOrder } from '../../features/orders/ordersSlice';
import { selectCurrentUser, selectIsLoggedIn, openOTPModal } from '../../features/auth/authSlice';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { X, ShoppingBasket, Home, Briefcase, Heart, Navigation as NavIcon, CheckCircle2, ArrowRight, Zap, Sun, CreditCard, Banknote, Navigation, Loader2, AlertCircle, MapPin, LogIn } from 'lucide-react';

const tagIcon = (tag) => {
  if (tag === 'WORK')  return <Briefcase size={16} />;
  if (tag === 'OTHER') return <Heart size={16} />;
  if (tag === 'GPS')   return <NavIcon size={16} />;
  return <Home size={16} />;
};

export default function CheckoutDrawer({ onOrderPlaced }) {
  const dispatch      = useDispatch();
  const isOpen        = useSelector(selectIsCheckoutOpen);
  const totals        = useSelector(selectCartTotals);
  const cartItems     = useSelector(selectCartItems);
  const mode          = useSelector(selectDeliveryMode);
  const address       = useSelector(selectActiveAddress);
  const products      = useSelector((state) => state.products.productsList);
  const currentUser   = useSelector(selectCurrentUser);
  const isLoggedIn    = useSelector(selectIsLoggedIn);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const { status: gpsStatus, errorMsg: gpsError, requestLocation, reset: resetGps } = useGeoLocation();

  if (!isOpen) return null;

  // Address is confirmed when user has actively selected/saved one
  const isAddressConfirmed = !!address;
  const needsLocationConfirm = !isAddressConfirmed;

  const handleUseGPS = () => {
    requestLocation((result) => {
      dispatch(setActiveAddress(result));
    });
  };

  const handlePlaceOrder = () => {
    if (!address) return; // guard: must have an address

    // ── Not logged in → open OTP modal, order will be placed after login ──
    if (!isLoggedIn) {
      dispatch(closeCheckout());
      dispatch(openOTPModal('checkout'));
      return;
    }

    // ── Already logged in → place order directly ──
    const formattedItems = Object.entries(cartItems).map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      if (!p) return null;
      const price = mode === 'instant' ? p.priceInstant : p.priceMorning;
      return { id: p.id, name: `${p.name} (${p.weight})`, price, qty };
    }).filter(Boolean);

    dispatch(submitOrder({
      userId:          currentUser?.uid,
      customerName:    currentUser?.name || currentUser?.phone || 'Customer',
      items:           formattedItems,
      mode,
      total:           totals.finalTotal,
      paymentMethod,
      deliveryAddress: `${address.label} (${address.tag}) • ${address.flat}, ${address.area}`,
    }));

    dispatch(clearCart());
    dispatch(closeCheckout());
    resetGps();
    if (onOrderPlaced) onOrderPlaced();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end transition-opacity">
      <div className="bg-white rounded-t-3xl p-4 max-h-[88%] overflow-y-auto space-y-3 shadow-2xl max-w-[412px] mx-auto w-full">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              <ShoppingBasket size={14} />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Express Checkout</h3>
          </div>
          <button 
            onClick={() => { dispatch(closeCheckout()); resetGps(); }}
            className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Selected Mode Summary */}
        <div className="bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-200">
          {mode === 'instant' ? (
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-rose-700 text-xs">
                <Zap size={14} className="fill-rose-700" />
                <span>Instant Express Delivery (15-20 Mins)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dispatched immediately from nearest local darkstore.</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-700 text-xs">
                <Sun size={14} className="fill-emerald-700" />
                <span>Tomorrow Morning Slot (6:00 AM - 9:00 AM)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Farm harvested overnight. 20% Discount applied!</div>
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div>
          <div className="text-[11px] font-extrabold text-slate-800 mb-1.5 flex justify-between items-center">
            <span>📦 Delivering To</span>
            <button
              onClick={() => dispatch(openAddressModal())}
              className="text-emerald-600 text-[10px] font-bold hover:underline"
            >
              Change Address
            </button>
          </div>

          {isAddressConfirmed ? (
            /* Address confirmed — show full details clearly */
            <div className="bg-emerald-50/70 border border-emerald-300 p-3 rounded-xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                {tagIcon(address.tag)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900">{address.label}</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                    {address.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold mt-0.5 truncate">{address.flat}</p>
                <p className="text-[10px] text-slate-500 truncate">{address.area}</p>
              </div>
              <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100 flex-shrink-0 mt-0.5" />
            </div>
          ) : (
            /* No address set yet */
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                  No delivery address selected. Please set one to place your order.
                </p>
              </div>

              <button
                onClick={handleUseGPS}
                disabled={gpsStatus === 'loading'}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] ${
                  gpsStatus === 'success'
                    ? 'bg-emerald-600 text-white'
                    : gpsStatus === 'denied' || gpsStatus === 'error'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {gpsStatus === 'loading' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Navigation size={13} />
                )}
                {gpsStatus === 'loading'
                  ? 'Detecting your location...'
                  : gpsStatus === 'success'
                  ? '✓ Location Detected'
                  : 'Use My Current Location'}
              </button>

              {(gpsStatus === 'denied' || gpsStatus === 'error') && (
                <div className="flex items-start gap-1.5">
                  <AlertCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-red-600 leading-relaxed">{gpsError}</p>
                    {gpsStatus === 'denied' && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Allow from browser settings or{' '}
                        <button
                          onClick={() => dispatch(openAddressModal())}
                          className="text-emerald-600 underline font-bold"
                        >
                          pick a saved address
                        </button>.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => dispatch(openAddressModal())}
                className="w-full text-[10px] text-slate-500 underline text-center"
              >
                Or choose from saved addresses
              </button>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div>
          <div className="text-[11px] font-extrabold text-slate-800 mb-1">Select Payment Method</div>
          <div className="grid grid-cols-2 gap-2">
            <label 
              onClick={() => setPaymentMethod('UPI')}
              className={`p-2 rounded-xl flex items-center gap-2 cursor-pointer text-[11px] font-extrabold transition-colors ${
                paymentMethod === 'UPI' 
                  ? 'border-2 border-emerald-500 bg-emerald-50/40 text-slate-900' 
                  : 'border border-slate-200 text-slate-600'
              }`}
            >
              <CreditCard size={14} className="text-emerald-600" />
              <span>UPI (Google Pay)</span>
            </label>
            <label 
              onClick={() => setPaymentMethod('COD')}
              className={`p-2 rounded-xl flex items-center gap-2 cursor-pointer text-[11px] font-extrabold transition-colors ${
                paymentMethod === 'COD' 
                  ? 'border-2 border-emerald-500 bg-emerald-50/40 text-slate-900' 
                  : 'border border-slate-200 text-slate-600'
              }`}
            >
              <Banknote size={14} className="text-slate-400" />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Bill Breakdown */}
        <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 border border-slate-200/60">
          <div className="flex justify-between text-slate-600 text-[11px]">
            <span>Item Subtotal</span>
            <span>₹{totals.subtotalInstant}</span>
          </div>

          {mode === 'morning' && totals.totalSavings > 0 && (
            <div className="flex justify-between text-emerald-700 font-extrabold text-[11px]">
              <span>Next Morning Farm Discount (20%)</span>
              <span>-₹{totals.totalSavings}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 text-[11px]">
            <span>Delivery Fee</span>
            <span className="text-emerald-600 font-extrabold">FREE</span>
          </div>

          <div className="flex justify-between text-slate-900 font-extrabold text-xs pt-1.5 border-t border-slate-200">
            <span>Total Payable Amount</span>
            <span>₹{totals.finalTotal}</span>
          </div>
        </div>

        {/* Place Order CTA Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!isAddressConfirmed}
          className={`w-full font-extrabold py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.99] ${
            isAddressConfirmed
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {!isAddressConfirmed ? (
            <span>Set Delivery Address to Continue</span>
          ) : !isLoggedIn ? (
            <>
              <LogIn size={14} />
              <span>Login to Place Order (₹{totals.finalTotal})</span>
            </>
          ) : (
            <>
              <span>Place Order Now (₹{totals.finalTotal})</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>

      </div>
    </div>
  );
}
