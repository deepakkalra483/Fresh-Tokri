import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart, openCheckout } from '../features/cart/cartSlice';
import {
  ShoppingBag, Clock, Zap, Sun, MapPin, Navigation,
  MessageCircle, ChevronDown, ChevronUp, RefreshCw, Trash2,
} from 'lucide-react';

const ORDERS_KEY = 'ft_orders';

// ── helpers ──────────────────────────────────────────────────────────────────
function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

// ── Single Order Card ─────────────────────────────────────────────────────────
function OrderCard({ order, onReorder }) {
  const [expanded, setExpanded] = useState(false);

  const isInstant = order.mode === 'instant';
  const itemCount = order.items?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

      {/* Top colour stripe by delivery mode */}
      <div className={`h-1 w-full ${isInstant
        ? 'bg-gradient-to-r from-rose-400 to-rose-500'
        : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
      />

      <div className="p-3 space-y-2.5">

        {/* Row 1: Order ID + total */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={14} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[12px] font-extrabold text-slate-900 tracking-tight">
                {order.id}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                <Clock size={9} />
                <span>{order.placedAt}</span>
                <span>·</span>
                {isInstant ? (
                  <>
                    <Zap size={9} className="text-rose-500" />
                    <span className="text-rose-600 font-bold">Instant</span>
                  </>
                ) : (
                  <>
                    <Sun size={9} className="text-amber-500" />
                    <span className="text-amber-600 font-bold">Morning</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-extrabold text-slate-900">₹{order.totalPaid}</p>
            <p className="text-[10px] text-slate-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Row 2: Status */}
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <MessageCircle size={10} />
            Sent via WhatsApp
          </div>
        </div>

        {/* Row 3: Items — collapsible */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-700"
          >
            <span className="truncate pr-2">
              {order.items?.slice(0, 2).map((it, i) => (
                <span key={i}>{i > 0 ? ' · ' : ''}{it.qty}× {it.name}</span>
              ))}
              {itemCount > 2 && (
                <span className="text-slate-400"> +{itemCount - 2} more</span>
              )}
            </span>
            {expanded
              ? <ChevronUp size={13} className="text-slate-400 flex-shrink-0" />
              : <ChevronDown size={13} className="text-slate-400 flex-shrink-0" />}
          </button>

          {expanded && (
            <div className="border-t border-slate-100 px-3 py-2 space-y-1">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-[11px] text-slate-600">
                  <span className="font-medium">
                    {item.name}{' '}
                    <span className="text-slate-400">×{item.qty}</span>
                  </span>
                  <span className="font-bold">₹{item.price * item.qty}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-extrabold text-slate-900 pt-1.5 border-t border-slate-100 mt-1">
                <span>Total Paid</span>
                <span className="text-emerald-700">₹{order.totalPaid}</span>
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Address */}
        {order.address && (
          <div className="flex items-start gap-2 text-[10px] text-slate-500">
            {order.mapsLink
              ? <Navigation size={11} className="text-blue-500 mt-0.5 flex-shrink-0" />
              : <MapPin size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
            }
            <span className="leading-relaxed">
              {order.address}
              {order.mapsLink && (
                <a
                  href={order.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 text-blue-500 font-bold underline"
                >
                  Map →
                </a>
              )}
            </span>
          </div>
        )}

        {/* Row 5: Reorder */}
        <button
          onClick={() => onReorder(order)}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[11px] font-extrabold rounded-xl shadow-sm transition-all"
        >
          <RefreshCw size={12} />
          Reorder Same Items
        </button>

      </div>
    </div>
  );
}

// ── Main Orders Page ──────────────────────────────────────────────────────────
export default function OrdersPage() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);

  // Load on mount; refresh when window gains focus (user came back from WhatsApp)
  useEffect(() => {
    setOrders(loadOrders());
    const onFocus = () => setOrders(loadOrders());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleReorder = (order) => {
    // Re-add each item to Redux cart by product ID stored in the order
    order.items.forEach((item) => {
      const id = item.productId || item.id;
      if (id) {
        for (let i = 0; i < item.qty; i++) {
          dispatch(addToCart(id));
        }
      }
    });
    dispatch(openCheckout());
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all order history from this device?')) {
      localStorage.removeItem(ORDERS_KEY);
      setOrders([]);
    }
  };

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <ShoppingBag size={32} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-base font-extrabold text-slate-800">No orders yet</p>
          <p className="text-[12px] text-slate-400 mt-1 leading-relaxed max-w-xs">
            When you place an order via WhatsApp, it will appear here on this device.
          </p>
        </div>
      </div>
    );
  }

  // ── Orders list ─────────────────────────────────────────────────────────────
  return (
    <div className="p-3 pb-8 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            My Orders
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {orders.length} order{orders.length !== 1 ? 's' : ''} on this device
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-500 font-bold transition-colors"
        >
          <Trash2 size={11} />
          Clear All
        </button>
      </div>

      {/* Cards — newest first */}
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onReorder={handleReorder}
          />
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-300 pt-2 leading-relaxed">
        Order history is stored on this device only.<br />
        Clearing browser data will remove history.
      </p>

    </div>
  );
}
