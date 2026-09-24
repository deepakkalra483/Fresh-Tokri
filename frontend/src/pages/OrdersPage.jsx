import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllOrders,
  setTrackingOrder,
  clearTrackingOrder,
  selectAllOrders,
  selectActiveOrder,
  selectTrackingOrderId,
  selectTrackingOrder,
  selectOrderFetchStatus,
} from '../features/orders/ordersSlice';
import LiveOrderTracker from '../components/orders/LiveOrderTracker';
import {
  Package, Clock, CheckCircle2, Bike, ArrowLeft,
  ChevronRight, Zap, Sun, ShoppingBag, RefreshCw
} from 'lucide-react';

// ─── Status helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  placed:    { label: 'Order Received',  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   dot: 'bg-blue-500',   icon: Package },
  packed:    { label: 'Being Packed',    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500',  icon: Package },
  on_way:    { label: 'Out for Delivery',color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500 animate-pulse', icon: Bike },
  delivered: { label: 'Delivered ✓',    color: 'text-slate-500',  bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400',  icon: CheckCircle2 },
};

const ACTIVE_STATUSES = ['placed', 'packed', 'on_way'];

function isActive(status) {
  return ACTIVE_STATUSES.includes(status);
}

// ─── Single Order Card ───────────────────────────────────────────────────────
function OrderCard({ order, isActiveOrder, onTrack }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const StatusIcon = cfg.icon;
  const itemCount = order.items?.length || 0;
  const firstItem = order.items?.[0]?.name || 'Items';

  return (
    <div className={`bg-white rounded-2xl border shadow-2xs overflow-hidden transition-all ${isActiveOrder ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'}`}>
      
      {/* Active badge */}
      {isActiveOrder && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span className="text-[10px] font-extrabold text-white uppercase tracking-wide">Active Order</span>
        </div>
      )}

      <div className="p-3 space-y-2.5">
        {/* Order ID row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <ShoppingBag size={13} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-900">Order #{order.id || order.orderId}</div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1">
                <Clock size={8} />
                {order.placedAt || '—'}
                {order.mode && (
                  <>
                    <span>•</span>
                    {order.mode === 'instant'
                      ? <><Zap size={8} className="text-rose-500" /> Instant</>
                      : <><Sun size={8} className="text-amber-500" /> Morning</>}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Amount */}
          <div className="text-right">
            <div className="text-xs font-extrabold text-slate-900">₹{order.totalPaid}</div>
            <div className="text-[9px] text-slate-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Items preview */}
        <div className="text-[10px] text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1.5 truncate border border-slate-100">
          {order.items?.slice(0, 2).map((it, i) => (
            <span key={i}>{i > 0 ? ' · ' : ''}{it.qty}× {it.name}</span>
          ))}
          {(order.items?.length || 0) > 2 && <span className="font-bold text-slate-600"> +{order.items.length - 2} more</span>}
        </div>

        {/* Status + CTA row */}
        <div className="flex items-center justify-between">
          {/* Status pill */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>

          {/* Track button only for active orders */}
          {isActive(order.status) && (
            <button
              onClick={() => onTrack(order.id || order.orderId)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition-all shadow-sm"
            >
              <Bike size={11} />
              <span>Track Order</span>
              <ChevronRight size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Orders Page ────────────────────────────────────────────────────────
export default function OrdersPage() {
  const dispatch = useDispatch();
  const allOrders = useSelector(selectAllOrders);
  const activeOrder = useSelector(selectActiveOrder);
  const trackingOrderId = useSelector(selectTrackingOrderId);
  const trackingOrder = useSelector(selectTrackingOrder);
  const fetchStatus = useSelector(selectOrderFetchStatus);

  // Fetch all orders from MongoDB on mount
  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // ─── Tracking View ──────────────────────────────────────────────────────────
  if (trackingOrderId && trackingOrder) {
    return (
      <div className="space-y-3 pb-24 p-3">
        {/* Back to orders list */}
        <button
          onClick={() => dispatch(clearTrackingOrder())}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors active:scale-95"
        >
          <ArrowLeft size={15} />
          Back to Orders
        </button>
        <LiveOrderTracker order={trackingOrder} />
      </div>
    );
  }

  // ─── Orders List View ───────────────────────────────────────────────────────
  return (
    <div className="space-y-3 pb-24 p-3">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">My Orders</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{allOrders.length} order{allOrders.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => dispatch(fetchAllOrders())}
          disabled={fetchStatus === 'loading'}
          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={13} className={fetchStatus === 'loading' ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Loading skeleton */}
      {fetchStatus === 'loading' && allOrders.length === 0 && (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="h-6 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Active order first (highlighted) */}
      {activeOrder && isActive(activeOrder.status) && (
        <OrderCard
          order={activeOrder}
          isActiveOrder
          onTrack={(id) => dispatch(setTrackingOrder(id))}
        />
      )}

      {/* Full order history list */}
      {allOrders.length > 0 ? (
        <div className="space-y-2">
          {allOrders
            // Don't re-render the active order at top in the list
            .filter(o => !activeOrder || (o.id || o.orderId) !== (activeOrder.id || activeOrder.orderId))
            .map((order) => (
              <OrderCard
                key={order.id || order.orderId}
                order={order}
                isActiveOrder={false}
                onTrack={(id) => dispatch(setTrackingOrder(id))}
              />
            ))}
        </div>
      ) : fetchStatus !== 'loading' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <ShoppingBag size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-700">No orders yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Place your first fresh order above!</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
