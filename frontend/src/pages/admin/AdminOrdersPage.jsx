import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllOrders, updateOrderStatusThunk } from '../../features/orders/ordersSlice';
import {
  ClipboardList, Package, Bike, CheckCircle2, Clock, Filter,
  ChevronDown, ChevronUp, ShoppingBag, Phone, MapPin
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'placed',    label: 'Order Received', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-500' },
  { value: 'packed',    label: 'Being Packed',   color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-500' },
  { value: 'on_way',    label: 'Out for Delivery',color:'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200',dot:'bg-emerald-500 animate-pulse' },
  { value: 'delivered', label: 'Delivered ✓',    color: 'text-slate-500',  bg: 'bg-slate-50 border-slate-200',   dot: 'bg-slate-400' },
];

const STATUS_FLOW = ['placed', 'packed', 'on_way', 'delivered'];

function getNext(status) {
  const i = STATUS_FLOW.indexOf(status);
  return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
}

const NEXT_LABEL = {
  placed:    '📦 Mark as Packed',
  packed:    '🚴 Out for Delivery',
  on_way:    '✅ Mark Delivered',
  delivered: null,
};

export default function AdminOrdersPage() {
  const dispatch  = useDispatch();
  const allOrders = useSelector(selectAllOrders);

  const [filter, setFilter]     = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filteredOrders = filter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === filter);

  const advanceStatus = (order) => {
    const nextStatus = getNext(order.status);
    if (nextStatus && order.id) {
      // Write to Firestore — real-time listener updates all clients
      dispatch(updateOrderStatusThunk({ docId: order.id, status: nextStatus }));
    }
  };

  const cfg = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = allOrders.filter(o => o.status === s.value).length;
    return acc;
  }, {});

  return (
    <div className="pb-28 space-y-3">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList size={13} className="text-emerald-600" /> Orders Management
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">{allOrders.length} total orders</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'all', label: 'All', count: allOrders.length, color: 'emerald' },
            { id: 'placed',    label: 'New',      count: counts.placed,    color: 'blue'    },
            { id: 'packed',    label: 'Packing',  count: counts.packed,    color: 'amber'   },
            { id: 'on_way',    label: 'On Way',   count: counts.on_way,    color: 'emerald' },
            { id: 'delivered', label: 'Done',     count: counts.delivered, color: 'slate'   },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {tab.label} {tab.count > 0 && <span className="ml-0.5 opacity-80">({tab.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="px-3 space-y-2">
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center space-y-3">
            <ShoppingBag size={32} className="text-slate-300" />
            <p className="text-xs text-slate-400 font-semibold">No orders in this category</p>
          </div>
        )}

        {filteredOrders.map(order => {
          const c = cfg(order.status);
          const isExpanded = expanded === (order.id || order.orderId);
          const nextStatus = getNext(order.status);
          const itemCount = order.items?.length || 0;

          return (
            <div key={order.id || order.orderId} className={`bg-white rounded-2xl border shadow-2xs overflow-hidden transition-all ${
              order.status !== 'delivered' ? 'border-emerald-200' : 'border-slate-200'
            }`}>
              {/* Order header */}
              <div
                className="p-3 cursor-pointer flex items-start gap-2.5"
                onClick={() => setExpanded(isExpanded ? null : (order.id || order.orderId))}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                  <ShoppingBag size={14} className="text-emerald-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-slate-900">
                      Order #{order.id || order.orderId}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">₹{order.totalPaid}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${c.bg} ${c.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {c.label}
                    </div>
                    <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                      <Clock size={8} /> {order.placedAt || '—'}
                    </span>
                    <span className="text-[9px] text-slate-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  </div>

                  {order.deliveryAddress && (
                    <p className="text-[9px] text-slate-400 mt-0.5 truncate flex items-center gap-0.5">
                      <MapPin size={8} /> {order.deliveryAddress}
                    </p>
                  )}
                </div>

                <div className="text-slate-300 flex-shrink-0 mt-0.5">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-3 space-y-2.5 bg-slate-50/60">
                  {/* Items list */}
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wide mb-1.5">Items Ordered</p>
                    <div className="space-y-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-700 font-semibold">{item.qty}× {item.name}</span>
                          <span className="text-slate-500">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-900 border-t border-slate-200 pt-1.5 mt-1.5">
                      <span>Total Paid</span>
                      <span>₹{order.totalPaid}</span>
                    </div>
                  </div>

                  {/* Rider info */}
                  {order.rider && (
                    <div className="bg-white rounded-xl border border-slate-200 p-2 flex items-center gap-2">
                      <div className="text-xl">{order.rider.avatar || '🚴'}</div>
                      <div className="flex-1">
                        <p className="text-[10px] font-extrabold text-slate-800">{order.rider.name}</p>
                        <p className="text-[9px] text-slate-400">{order.rider.rating}</p>
                      </div>
                      {order.rider.phone && (
                        <a
                          href={`tel:${order.rider.phone}`}
                          className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition"
                        >
                          <Phone size={11} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Advance status button */}
                  {nextStatus && (
                    <button
                      onClick={() => advanceStatus(order)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-[11px] py-2.5 rounded-xl transition active:scale-95 shadow-sm"
                    >
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-[10px] font-bold py-1">
                      <CheckCircle2 size={13} /> Order Completed
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
