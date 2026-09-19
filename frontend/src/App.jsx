import React, { useState } from 'react';
import StickyHeader from './components/layout/StickyHeader';
import FloatingCartBar from './components/layout/FloatingCartBar';
import BottomNavbar from './components/layout/BottomNavbar';
import CheckoutDrawer from './components/checkout/CheckoutDrawer';
import ProductDetailsModal from './components/home/ProductDetailsModal';
import AddressModal from './components/address/AddressModal';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-0 md:p-4 font-sans antialiased select-none">
      
      {/* Mobile Web App Container */}
      <div className="w-full max-w-md h-screen md:h-[850px] md:max-h-[900px] bg-slate-50 md:rounded-3xl shadow-xl relative overflow-hidden flex flex-col border-0 md:border border-slate-200">
        
        {/* 100% Fixed Pinned Top Header (Location + Mode Switcher Tabs + Category Filter Bar) - Shown on Home */}
        {activeTab === 'home' && (
          <StickyHeader onTabChange={setActiveTab} />
        )}

        {/* Scrollable Content View Container (Only product items scroll underneath the header!) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'categories' && (
            <CategoriesPage onBackToHome={() => setActiveTab('home')} />
          )}
          {activeTab === 'orders' && <OrdersPage />}
          {activeTab === 'profile' && (
            <div className="p-6 text-center text-slate-500 text-xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mx-auto shadow-2xs">
                DK
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Deepak Kumar</h3>
              <p className="text-[11px] text-slate-400">+91 98765 43210</p>
            </div>
          )}
        </div>

        {/* Floating Cart Sheet */}
        <FloatingCartBar />

        {/* Modals */}
        <CheckoutDrawer onOrderPlaced={() => setActiveTab('orders')} />
        <ProductDetailsModal />
        <AddressModal />

        {/* Bottom Navigation Bar */}
        <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      </div>

    </div>
  );
}
