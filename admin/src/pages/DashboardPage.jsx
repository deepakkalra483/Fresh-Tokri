import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllAdminOrders, fetchAdminOrders } from '../features/adminOrders/adminOrdersSlice';
import { selectAdminProducts, fetchAdminProducts } from '../features/adminProducts/adminProductsSlice';
import { selectCustomers } from '../features/customers/customersSlice';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Zap, Sun } from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllAdminOrders);
  const products = useSelector(selectAdminProducts);
  const customers = useSelector(selectCustomers);

  useEffect(() => {
    dispatch(fetchAdminOrders());
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPaid, 0);
  const instantOrders = orders.filter(o => o.mode === 'instant').length;
  const morningOrders = orders.filter(o => o.mode === 'morning').length;
  const pendingOrders = orders.filter(o => o.status === 'placed' || o.status === 'packed').length;

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      
      {/* Page Title */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Store Analytics Overview</h2>
        <p className="text-[11px] text-slate-500 font-medium">Real-time revenue, dispatches, and produce inventory status</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900">₹{totalRevenue}</div>
          <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp size={10} />
            <span>+18.4% today</span>
          </p>
        </div>

        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Pending Orders</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900">{pendingOrders} active</div>
          <p className="text-[9px] text-rose-600 font-bold">Needs dispatch action</p>
        </div>

        <div 
          onClick={() => onNavigate('products')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Produce Catalog</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package size={15} />
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900">{products.length} items</div>
          <p className="text-[9px] text-slate-500 font-medium">Available in stock</p>
        </div>

        <div 
          onClick={() => onNavigate('customers')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Customers</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center">
              <Users size={15} />
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900">{customers.length} registered</div>
          <p className="text-[9px] text-emerald-600 font-bold">100% Retention rate</p>
        </div>

      </div>

      {/* Dual Delivery Mode Performance Breakdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Dual Delivery Pipeline Performance
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          
          <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-rose-700">
              <Zap size={14} class="fill-rose-700" />
              <span>⚡ Instant Express (15 Min)</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{instantOrders} orders</div>
            <p className="text-[10px] text-slate-500 font-medium">Dispatched via local darkstores</p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-emerald-700">
              <Sun size={14} class="fill-emerald-700" />
              <span>🌅 Next Morning Harvest (20% Off)</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{morningOrders} orders</div>
            <p className="text-[10px] text-slate-500 font-medium">Farm direct Sourced tonight</p>
          </div>

        </div>
      </div>

    </div>
  );
}

