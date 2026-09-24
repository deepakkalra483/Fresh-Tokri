import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAllAdminOrders, 
  fetchAdminOrders, 
  updateOrderStatusThunk 
} from '../features/adminOrders/adminOrdersSlice';
import { Bike, Navigation, Phone, CheckCircle2, MapPin, Zap, Sun } from 'lucide-react';

export default function DeliveryPartnerPage() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllAdminOrders);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Active deliveries for Rahul (Rider)
  const activeDeliveries = orders.filter(o => o.status === 'on_way' || o.status === 'packed');

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      
      {/* Rider Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-extrabold text-xl shadow-xs">
            🛵
          </div>
          <div>
            <h2 className="text-sm font-extrabold">Rahul Sharma (Rider)</h2>
            <p className="text-[10px] text-emerald-400 font-bold">Active Duty • 4.9 ★ Rating</p>
          </div>
        </div>

        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
          ONLINE
        </span>
      </div>

      {/* Deliveries Feed Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Assigned Delivery Jobs</h3>
        <span className="text-[10px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-full">
          {activeDeliveries.length} active
        </span>
      </div>

      {/* Delivery Cards */}
      <div className="space-y-3">
        {activeDeliveries.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-medium">
            No active delivery dispatches assigned currently.
          </div>
        ) : (
          activeDeliveries.map((order) => (
            <div 
              key={order.id || order.orderId}
              className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 space-y-3"
            >
              
              {/* Order Mode & ID */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    order.mode === 'instant' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {order.mode === 'instant' ? '⚡ INSTANT (15 MIN)' : '🌅 NEXT MORNING'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">{order.id || order.orderId}</span>
                </div>

                <span className="text-xs font-extrabold text-slate-900">Collect ₹{order.totalPaid}</span>
              </div>

              {/* Customer Info & Address */}
              <div className="space-y-1 text-xs">
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Customer: {order.customerName}</span>
                  <a 
                    href={`tel:${order.phone}`}
                    className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-2xs hover:bg-emerald-700 transition"
                  >
                    <Phone size={13} />
                  </a>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-100 p-2.5 rounded-xl flex items-start gap-2 text-emerald-950 font-semibold text-[11px]">
                  <MapPin size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">{order.address || order.deliveryAddress}</div>
                    <span className="text-[9px] text-emerald-700 font-extrabold uppercase">Payment: {order.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-1 flex items-center gap-2">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(order.address || order.deliveryAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                >
                  <Navigation size={13} />
                  <span>Open Maps</span>
                </a>

                <button
                  onClick={() => dispatch(updateOrderStatusThunk({ id: order.id || order.orderId, status: 'delivered' }))}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition"
                >
                  <CheckCircle2 size={14} />
                  <span>Complete Delivery</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

