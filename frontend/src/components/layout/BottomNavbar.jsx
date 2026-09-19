import React from 'react';
import { Store, LayoutGrid, Clock, User } from 'lucide-react';

export default function BottomNavbar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Shop', icon: Store },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: Clock, badge: true },
    { id: 'profile', label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 pt-2 pb-5 px-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around z-40 max-w-[412px] mx-auto shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 relative transition-colors ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Icon size={19} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
            {tab.badge && (
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-0 right-1"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
