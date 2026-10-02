import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../features/auth/authSlice';
import {
  Store, LayoutGrid, Clock, User,
  ShieldCheck, Layers, ClipboardList, Bike
} from 'lucide-react';

export default function BottomNavbar({ activeTab, onTabChange }) {
  const isAdmin = useSelector(selectIsAdmin);

  const customerTabs = [
    { id: 'home',       label: 'Shop',       icon: Store },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'orders',     label: 'Orders',     icon: Clock, badge: true },
    { id: 'profile',    label: 'Account',    icon: User },
  ];

  const adminTabs = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: ShieldCheck },
    { id: 'admin-menu',      label: 'Menu',       icon: Layers },
    { id: 'admin-orders',    label: 'Orders',     icon: ClipboardList },
    { id: 'admin-delivery',  label: 'Delivery',   icon: Bike },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <nav className="flex-shrink-0 pt-2 pb-5 px-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around z-40 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 relative transition-colors ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
              <Icon size={18} />
            </div>
            <span className="text-[10px] tracking-tight">{tab.label}</span>
            {tab.badge && (
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-0.5 right-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
