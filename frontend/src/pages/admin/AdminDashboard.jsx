import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectCurrentUser } from '../../features/auth/authSlice';
import { selectAllProducts } from '../../features/products/productsSlice';
import { selectAllOrders } from '../../features/orders/ordersSlice';
import {
  ShieldCheck, LogOut, Package, ShoppingBag, Bike,
  CheckCircle2, TrendingUp, Layers, Users
} from 'lucide-react';

export default function AdminDashboard() {
  const dispatch  = useDispatch();
  const user      = useSelector(selectCurrentUser);
  const products  = useSelector(selectAllProducts);
  const orders    = useSelector(selectAllOrders);

  const totalRevenue  = orders.reduce((sum, o) => sum + (o.totalPaid || 0), 0);
  const deliveredCnt  = orders.filter(o => o.status === 'delivered').length;
  const activeCnt     = orders.filter(o => ['placed','packed','on_way'].includes(o.status)).length;
  const inStockCnt    = products.filter(p => p.inStock !== false).length;

  const stats = [
    { label: 'Total Products',  value: products.length, icon: Layers,       color: 'emerald' },
    { label: 'In Stock',        value: inStockCnt,       icon: Package,      color: 'blue'    },
    { label: 'Total Orders',    value: orders.length,    icon: ShoppingBag,  color: 'amber'   },
    { label: 'Active Orders',   value: activeCnt,        icon: Bike,         color: 'rose'    },
    { label: 'Delivered',       value: deliveredCnt,     icon: CheckCircle2, color: 'slate'   },
    { label: 'Total Revenue',   value: `₹${totalRevenue}`, icon: TrendingUp, color: 'emerald' },
  ];

  return (
    <div className="pb-28 space-y-4">

      {/* Admin Profile Card */}
      <div className="mx-3 mt-3 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shadow-lg border border-white/30">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wide">Admin Panel</p>
            <h2 className="text-base font-extrabold">{user?.name || 'Admin'}</h2>
            <p className="text-[10px] text-emerald-200">{user?.email}</p>
          </div>
        </div>
        <div className="mt-3 bg-white/10 rounded-2xl px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-emerald-100">Fresh Tokri Admin Dashboard</span>
          <span className="text-[9px] bg-white/20 rounded-full px-2 py-0.5 font-bold text-white">ADMIN</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">Overview</p>
        <div className="grid grid-cols-3 gap-2">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-2xs text-center">
                <div className={`w-8 h-8 rounded-xl bg-${s.color}-50 border border-${s.color}-100 flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon size={14} className={`text-${s.color}-600`} />
                </div>
                <div className="text-sm font-extrabold text-slate-900">{s.value}</div>
                <div className="text-[8px] text-slate-400 leading-tight">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders preview */}
      {orders.length > 0 && (
        <div className="px-3">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">Recent Orders</p>
          <div className="space-y-1.5">
            {orders.slice(0, 4).map(o => (
              <div key={o.id || o.orderId} className="bg-white rounded-xl border border-slate-200 px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-800">#{o.id || o.orderId}</p>
                  <p className="text-[9px] text-slate-400">{o.items?.length || 0} items · {o.placedAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-slate-900">₹{o.totalPaid}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    o.status === 'delivered' ? 'bg-slate-100 text-slate-500' :
                    o.status === 'on_way'    ? 'bg-emerald-100 text-emerald-700' :
                    o.status === 'packed'    ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-3">
        <button
          onClick={() => dispatch(logoutUser())}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs py-3 rounded-2xl transition active:scale-95"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
