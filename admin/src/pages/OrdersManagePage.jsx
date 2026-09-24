import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectFilteredAdminOrders, 
  selectFilterStatus, 
  setFilterStatus, 
  fetchAdminOrders,
  updateOrderStatusThunk, 
  assignRiderThunk 
} from '../features/adminOrders/adminOrdersSlice';
import { ShoppingBag, CheckCircle, Bike, Phone, Clock, Zap, Sun } from 'lucide-react';

export default function OrdersManagePage() {
  const dispatch = useDispatch();
  const orders = useSelector(selectFilteredAdminOrders);
  const filterStatus = useSelector(selectFilterStatus);

  useEffect(() => {
    dispatch(fetchAdminOrders());
    const timer = setInterval(() => {
      dispatch(fetchAdminOrders());
    }, 5000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const filterTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'placed', label: '🆕 Incoming (Placed)' },
    { id: 'packed', label: '📦 Packing' },
    { id: 'on_way', label: '🛵 On the Way' },
    { id: 'delivered', label: '✅ Delivered' },
  ];

  return (
    <div className="p-4 space-y-3 max-w-4xl mx-auto">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Incoming Orders Feed</h2>
          <p className="text-[11px] text-slate-500 font-medium">Accept orders, pack items, & assign delivery partners</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg">
          {orders.length} orders
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch(setFilterStatus(tab.id))}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => (
          <div 
            key={order.id || order.orderId}
            className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 space-y-3 hover:border-slate-300 transition"
          >
            
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  order.mode === 'instant' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {order.mode === 'instant' ? <Zap size={10} className="fill-rose-800" /> : <Sun size={10} className="fill-emerald-800" />}
                  {order.mode === 'instant' ? 'INSTANT 15 MIN' : 'NEXT MORNING'}
                </span>
                <span className="text-xs font-extrabold text-slate-900">{order.id || order.orderId}</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-900">₹{order.totalPaid}</span>
                <span className="text-[10px] text-slate-400 block font-medium">via {order.paymentMethod}</span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="text-xs space-y-0.5">
              <div className="font-extrabold text-slate-900 flex items-center justify-between">
                <span>👤 {order.customerName}</span>
                <a href={`tel:${order.phone}`} className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 hover:underline">
                  <Phone size={12} />
                  <span>{order.phone}</span>
                </a>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">📍 {order.address || order.deliveryAddress}</p>
            </div>

            {/* Produce Items Purchased */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-700 text-[11px]">Produce Items ({order.items.length}):</div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-600 text-[11px]">
                  <span>{item.qty}x {item.name}</span>
                  <span className="font-bold text-slate-900">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            {/* Status & Actions Row */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-slate-400 text-[11px]">Status:</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold ${
                  order.status === 'placed' ? 'bg-amber-100 text-amber-800' :
                  order.status === 'packed' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'on_way' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex items-center gap-2">
                {order.status === 'placed' && (
                  <button
                    onClick={() => dispatch(updateOrderStatusThunk({ id: order.id || order.orderId, status: 'packed' }))}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition"
                  >
                    Accept & Pack Order
                  </button>
                )}

                {order.status === 'packed' && (
                  <button
                    onClick={() => dispatch(assignRiderThunk({ id: order.id || order.orderId, rider: { name: 'Rahul Sharma', phone: '+91 98765 43210' } }))}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1"
                  >
                    <Bike size={13} />
                    <span>Assign Delivery Agent</span>
                  </button>
                )}

                {order.status === 'on_way' && (
                  <button
                    onClick={() => dispatch(updateOrderStatusThunk({ id: order.id || order.orderId, status: 'delivered' }))}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1"
                  >
                    <CheckCircle size={13} />
                    <span>Mark Delivered</span>
                  </button>
                )}

                {order.status === 'delivered' && (
                  <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle size={14} />
                    <span>Completed</span>
                  </span>
                )}
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}


