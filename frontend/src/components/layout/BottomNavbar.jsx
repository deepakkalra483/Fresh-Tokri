import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAdmin } from '../../features/auth/authSlice';
import { selectCartTotals, openCheckout } from '../../features/cart/cartSlice';
import {
  Store, LayoutGrid, ShoppingCart, Clock, User,
  ShieldCheck, Layers, ClipboardList, Bike, Tag,
} from 'lucide-react';

export default function BottomNavbar({ activeTab, onTabChange }) {
  const dispatch = useDispatch();
  const isAdmin  = useSelector(selectIsAdmin);
  const totals   = useSelector(selectCartTotals);
  const cartQty  = totals.totalQty;

  const customerTabs = [
    { id: 'home',       label: 'Menu',       icon: Store },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'cart',       label: 'Cart',       icon: ShoppingCart, isCart: true },
    { id: 'orders',     label: 'Orders',     icon: Clock },
    { id: 'profile',    label: 'Profile',    icon: User },
  ];

  const adminTabs = [
    { id: 'admin-dashboard',  label: 'Dashboard',  icon: ShieldCheck },
    { id: 'admin-menu',       label: 'Menu',        icon: Layers },
    { id: 'admin-categories', label: 'Categories',  icon: Tag },
    { id: 'admin-orders',     label: 'Orders',      icon: ClipboardList },
    { id: 'admin-delivery',   label: 'Delivery',    icon: Bike },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  const handleTabPress = (tab) => {
    onTabChange(tab.id);
  };

  return (
    <nav className="flex-shrink-0 bg-white border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)', paddingTop: '8px' }}>
      <div className="flex items-end justify-around px-1">
        {tabs.map((tab) => {
          const Icon    = tab.icon;
          const isActive = !tab.isCart && activeTab === tab.id;
          const hasCart  = tab.isCart && cartQty > 0;

          if (tab.isCart) {
            // ── Centre Cart button — elevated pill ──────────────────────
            const isCartActive = activeTab === 'cart';
            return (
              <button
                key="cart"
                id="nav-tab-cart"
                onClick={() => handleTabPress(tab)}
                className="relative flex flex-col items-center -mt-5 mb-1"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                  isCartActive
                    ? 'bg-emerald-600 ring-4 ring-emerald-100 shadow-emerald-400'
                    : cartQty > 0
                    ? 'bg-emerald-600 shadow-emerald-300'
                    : 'bg-slate-800'
                }`}>
                  <ShoppingCart size={22} className="text-white" />
                  {cartQty > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow border-2 border-white">
                      {cartQty > 99 ? '99+' : cartQty}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold mt-0.5 tracking-tight ${
                  isCartActive || cartQty > 0 ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  Cart
                </span>
              </button>
            );
          }

          // ── Regular tab ─────────────────────────────────────────────
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabPress(tab)}
              className={`flex flex-col items-center gap-0.5 px-2 pb-1 transition-colors ${
                isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'font-extrabold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
