import React from 'react';
import { Store, Bike, LayoutDashboard, Package, Users, ShoppingBag } from 'lucide-react';

export default function AdminHeader({ activeTab, onTabChange, activeRole, onRoleChange }) {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
      
      {/* Top Brand Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-slate-900 shadow-sm">
            FT
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">Fresh Tokri Control Center</h1>
            <p className="text-[10px] text-emerald-400 font-medium">Store & Delivery Operations</p>
          </div>
        </div>

        {/* Role Toggle Switcher (Store Manager vs Delivery Partner) */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => onRoleChange('admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              activeRole === 'admin'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store size={13} />
            <span className="hidden sm:inline">Store Admin</span>
          </button>
          
          <button
            onClick={() => onRoleChange('delivery')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              activeRole === 'delivery'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike size={13} />
            <span>Delivery Agent</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Links (Only shown in Admin mode) */}
      {activeRole === 'admin' && (
        <div className="px-3 py-1.5 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('orders')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'orders' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Incoming Orders</span>
          </button>

          <button
            onClick={() => onTabChange('products')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'products' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Produce Catalog</span>
          </button>

          <button
            onClick={() => onTabChange('customers')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'customers' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Customers</span>
          </button>
        </div>
      )}

    </header>
  );
}

