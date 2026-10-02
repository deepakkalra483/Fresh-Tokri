import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllOrders, updateOrderStatusThunk } from '../../features/orders/ordersSlice';
import {
  Bike, MapPin, Phone, Clock, CheckCircle2, Package,
  UserRound, Navigation, ShoppingBag, Zap, Sun, AlertCircle
} from 'lucide-react';

const RIDERS = [
  { id: 'r1', name: 'Rahul Sharma',  phone: '+91 98765 43210', rating: '4.9 ★', avatar: '👨‍🦱', active: false },
  { id: 'r2', name: 'Amit Verma',    phone: '+91 87654 32109', rating: '4.7 ★', avatar: '👨‍🦳', active: false },
  { id: 'r3', name: 'Suresh Patel',  phone: '+91 76543 21098', rating: '4.8 ★', avatar: '👨‍🦰', active: false },
];

const STATUS_FILTER = [
  { id: 'all',     label: 'All Active' },
  { id: 'packed',  label: 'Ready to Ship' },
  { id: 'on_way',  label: 'Out for Delivery' },
];

export default function AdminDeliveryPage() {
  const dispatch  = useDispatch();
  const allOrders = useSelector(selectAllOrders);

  const [statusFilter, setStatusFilter] = useState('all');
  const [riderModal, setRiderModal]     = useState(null); // orderId being assigned
  const [assignments, setAssignments]   = useState({}); // { orderId: riderId }

  // Show only active delivery orders (not placed, not delivered)
  const activeOrders = allOrders.filter(o =>
    o.status === 'packed' || o.status === 'on_way'
  );

  const filtered = statusFilter === 'all'
    ? activeOrders
    : activeOrders.filter(o => o.status === statusFilter);

  const assignRider = (orderId, rider) => {
    // Find the Firestore doc id (orderId === Firestore doc ID for orders from listener)
    const order = allOrders.find(o => (o.orderId === orderId || o.id === orderId));
    const docId = order?.id || orderId;
    setAssignments(prev => ({ ...prev, [orderId]: rider.id }));
    dispatch(updateOrderStatusThunk({ docId, status: 'on_way', rider }));
    setRiderModal(null);
  };

  const markDelivered = (orderId) => {
    const order = allOrders.find(o => (o.orderId === orderId || o.id === orderId));
    const docId = order?.id || orderId;
    dispatch(updateOrderStatusThunk({ docId, status: 'delivered' }));
    setAssignments(prev => { const n = {...prev}; delete n[orderId]; return n; });
  };

  const getRider = (orderId) => {
    const rid = assignments[orderId] || null;
    return rid ? RIDERS.find(r => r.id === rid) : null;
  };

  const pendingCount = allOrders.filter(o => o.status === 'packed').length;
  const onWayCount   = allOrders.filter(o => o.status === 'on_way').length;

  return (
    <div className="pb-28 space-y-3">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-3 pt-3 pb-2">
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Bike size={13} className="text-emerald-600" /> Delivery Management
        </h2>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { label: 'Ready to Ship', count: pendingCount, color: 'amber', icon: Package },
            { label: 'Out for Delivery', count: onWayCount, color: 'emerald', icon: Bike },
            { label: 'Riders Available', count: RIDERS.length, color: 'blue', icon: UserRound },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-2xl p-2 text-center`}>
                <Icon size={14} className={`text-${s.color}-600 mx-auto mb-0.5`} />
                <div className={`text-base font-extrabold text-${s.color}-700`}>{s.count}</div>
                <div className="text-[8px] text-slate-500 leading-tight">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {STATUS_FILTER.map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full border transition ${
                statusFilter === f.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rider Fleet */}
      <div className="px-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">Delivery Fleet</p>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {RIDERS.map(rider => {
            const assignedTo = Object.entries(assignments).find(([, rid]) => rid === rider.id);
            const isBusy = !!assignedTo;
            return (
              <div key={rider.id} className={`flex-shrink-0 w-28 bg-white rounded-2xl border p-2 text-center ${isBusy ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'}`}>
                <div className="text-2xl mb-1">{rider.avatar}</div>
                <p className="text-[9px] font-extrabold text-slate-800 leading-tight">{rider.name}</p>
                <p className="text-[8px] text-slate-400">{rider.rating}</p>
                <div className={`mt-1 text-[8px] font-bold px-2 py-0.5 rounded-full ${isBusy ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isBusy ? '🔴 On Delivery' : '🟢 Available'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Orders */}
      <div className="px-3 space-y-2">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
          Active Orders ({filtered.length})
        </p>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center space-y-3">
            <CheckCircle2 size={32} className="text-emerald-300" />
            <p className="text-xs text-slate-400 font-semibold">No active deliveries right now</p>
            <p className="text-[10px] text-slate-400">All orders are delivered or awaiting packing</p>
          </div>
        )}

        {filtered.map(order => {
          const assignedRider = getRider(order.id || order.orderId);
          const isOnWay = order.status === 'on_way';
          const isPacked = order.status === 'packed';

          return (
            <div key={order.id || order.orderId} className={`bg-white rounded-2xl border shadow-2xs overflow-hidden ${isOnWay ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-amber-200'}`}>

              {/* Status banner */}
              <div className={`px-3 py-1.5 flex items-center gap-1.5 ${isOnWay ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                {isOnWay ? <Bike size={11} className="text-white" /> : <Package size={11} className="text-white" />}
                <span className="text-[9px] font-extrabold text-white uppercase tracking-wide">
                  {isOnWay ? 'Out for Delivery' : 'Packed — Awaiting Rider'}
                </span>
                {order.mode && (
                  <span className="ml-auto flex items-center gap-0.5 text-white/80 text-[8px]">
                    {order.mode === 'instant' ? <><Zap size={8} /> Instant</> : <><Sun size={8} /> Morning</>}
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2.5">
                {/* Order info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-900">Order #{order.id || order.orderId}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400">
                      <Clock size={8} /> {order.placedAt || '—'}
                      <span>·</span>
                      <ShoppingBag size={8} /> {order.items?.length || 0} items
                    </div>
                    {order.deliveryAddress && (
                      <p className="text-[9px] text-slate-500 mt-0.5 flex items-start gap-0.5">
                        <MapPin size={9} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{order.deliveryAddress}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 flex-shrink-0">₹{order.totalPaid}</span>
                </div>

                {/* Items preview */}
                <div className="text-[9px] text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                  {order.items?.slice(0,3).map((it, i) => (
                    <span key={i}>{i > 0 ? ' · ' : ''}{it.qty}× {it.name}</span>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <span className="font-bold text-slate-600"> +{order.items.length - 3} more</span>
                  )}
                </div>

                {/* Rider assignment */}
                {assignedRider ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex items-center gap-2">
                    <span className="text-lg">{assignedRider.avatar}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-extrabold text-emerald-800">{assignedRider.name}</p>
                      <p className="text-[9px] text-emerald-600">{assignedRider.rating}</p>
                    </div>
                    <a href={`tel:${assignedRider.phone}`} className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 hover:bg-emerald-200 transition">
                      <Phone size={10} />
                    </a>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center gap-2">
                    <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                    <p className="text-[9px] text-amber-700 font-semibold flex-1">No rider assigned yet</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  {!assignedRider && isPacked && (
                    <button
                      onClick={() => setRiderModal(order.id || order.orderId)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold py-2 rounded-xl flex items-center justify-center gap-1 transition active:scale-95"
                    >
                      <UserRound size={11} /> Assign Rider
                    </button>
                  )}

                  {isOnWay && (
                    <button
                      onClick={() => markDelivered(order.id || order.orderId)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-extrabold py-2 rounded-xl flex items-center justify-center gap-1 transition active:scale-95"
                    >
                      <CheckCircle2 size={11} /> Mark Delivered
                    </button>
                  )}

                  {isOnWay && (
                    <button className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-100 transition">
                      <Navigation size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rider Assignment Modal */}
      {riderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setRiderModal(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <UserRound size={16} className="text-emerald-600" /> Assign Delivery Rider
            </h3>
            <p className="text-[10px] text-slate-400">Select a rider to assign to order #{riderModal}</p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {RIDERS.map(rider => {
                const isBusy = Object.values(assignments).includes(rider.id);
                return (
                  <button
                    key={rider.id}
                    disabled={isBusy}
                    onClick={() => assignRider(riderModal, rider)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition ${
                      isBusy
                        ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                        : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400 active:scale-95'
                    }`}
                  >
                    <span className="text-2xl">{rider.avatar}</span>
                    <div className="flex-1">
                      <p className="text-xs font-extrabold text-slate-800">{rider.name}</p>
                      <p className="text-[9px] text-slate-400">{rider.rating} · {rider.phone}</p>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${isBusy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isBusy ? 'Busy' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button onClick={() => setRiderModal(null)} className="w-full border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
