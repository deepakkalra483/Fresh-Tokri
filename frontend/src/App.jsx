/**
 * App.jsx
 * Root component — manages:
 * 1. Firebase Auth state listener (→ setAuthUser for admin sessions)
 * 2. Inventory + Categories real-time listeners (always on)
 * 3. Orders listener for admin panel
 * 4. URL-based routing:
 *    - /admin-deepak  → Admin login screen → Admin shell
 *    - everything else → Customer shell (browse freely, WhatsApp checkout)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';

// Auth
import {
  setAuthUser,
  selectIsLoggedIn,
  selectIsAdmin,
  selectAuthLoading,
  selectCurrentUser,
} from './features/auth/authSlice';
import { subscribeToAuthState } from './firebase/authService';

// Inventory
import { setProductsList } from './features/products/productsSlice';
import { subscribeToInventory, seedInventoryIfEmpty } from './firebase/inventoryService';

// Categories
import { setCategoriesList } from './features/categories/categoriesSlice';
import { subscribeToCategories, seedCategoriesIfEmpty } from './firebase/categoriesService';

// Orders (admin only)
import { setOrders, clearOrders } from './features/orders/ordersSlice';
import { subscribeToAllOrders } from './firebase/orderService';

// Layout
import StickyHeader from './components/layout/StickyHeader';
import BottomNavbar from './components/layout/BottomNavbar';

// Modals
import CheckoutDrawer from './components/checkout/CheckoutDrawer';
import ProductDetailsModal from './components/home/ProductDetailsModal';
import AddressModal from './components/address/AddressModal';
import OTPModal from './components/auth/OTPModal'; // kept for profile login

// Auth Screens
import AdminLoginScreen from './components/auth/AdminLoginScreen';

// Customer Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage';

import { Leaf, Loader2 } from 'lucide-react';

// ── App shell wrapper ──────────────────────────────────────────────────────────
function Shell({ header, children, bottomNav }) {
  return (
    <div
      className="bg-slate-100 flex flex-col items-center justify-start p-0 md:p-4 font-sans antialiased select-none"
      style={{ height: '100dvh', overflow: 'hidden' }}
    >
      <div
        className="w-full max-w-md bg-slate-50 md:rounded-3xl shadow-xl flex flex-col border-0 md:border border-slate-200 overflow-hidden"
        style={{ height: '100%', maxHeight: '900px' }}
      >
        {/* Fixed header — never scrolls */}
        {header && <div className="flex-shrink-0">{header}</div>}

        {/* Scrollable content area only */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>

        {/* Fixed bottom nav — never scrolls */}
        <div className="flex-shrink-0">{bottomNav}</div>
      </div>
    </div>
  );
}


// ── Customer App ───────────────────────────────────────────────────────────────
function CustomerApp() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Shell
      header={activeTab === 'home' ? <StickyHeader /> : null}
      bottomNav={<BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {activeTab === 'home'       && <HomePage />}
      {activeTab === 'categories' && <CategoriesPage />}
      {activeTab === 'cart'       && <CartPage onTabChange={setActiveTab} />}
      {activeTab === 'orders'     && <OrdersPage />}
      {activeTab === 'profile'    && <CustomerProfile />}

      <CheckoutDrawer />
      <ProductDetailsModal />
      <AddressModal />
    </Shell>
  );
}

// ── Admin App ──────────────────────────────────────────────────────────────────
function AdminApp({ currentUser }) {
  const [activeTab, setActiveTab] = useState('admin-dashboard');

  const adminHeader = (
    <div className="flex-shrink-0 bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 pt-safe pt-3 pb-3 flex items-center justify-between shadow-sm">
      <div>
        <span className="text-[9px] text-emerald-200 font-semibold uppercase tracking-widest">Admin Panel</span>
        <h1 className="text-sm font-extrabold text-white leading-none">Fresh Tokri</h1>
      </div>
      <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-[11px] font-extrabold text-white">
        {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
      </div>
    </div>
  );

  return (
    <Shell
      header={adminHeader}
      bottomNav={<BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {activeTab === 'admin-dashboard'  && <AdminDashboard />}
      {activeTab === 'admin-menu'       && <AdminMenuPage />}
      {activeTab === 'admin-categories' && <AdminCategoriesPage />}
      {activeTab === 'admin-orders'     && <AdminOrdersPage />}
      {activeTab === 'admin-delivery'   && <AdminDeliveryPage />}
    </Shell>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch    = useDispatch();
  const isLoggedIn  = useSelector(selectIsLoggedIn);
  const isAdmin     = useSelector(selectIsAdmin);
  const authLoading = useSelector(selectAuthLoading);
  const currentUser = useSelector(selectCurrentUser);

  const unsubInventory  = useRef(null);
  const unsubOrders     = useRef(null);
  const unsubCategories = useRef(null);

  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin-deepak';

  // ── 1. Firebase Auth listener ──────────────────────────────────────────────
  useEffect(() => {
    const unsubAuth = subscribeToAuthState((profile) => {
      dispatch(setAuthUser(profile));
    });
    return () => unsubAuth();
  }, [dispatch]);

  // ── 2. Inventory + categories (always on) ─────────────────────────────────
  useEffect(() => {
    seedInventoryIfEmpty();
    seedCategoriesIfEmpty();

    unsubInventory.current = subscribeToInventory((products) => {
      dispatch(setProductsList(products));
    });
    unsubCategories.current = subscribeToCategories((cats) => {
      dispatch(setCategoriesList(cats));
    });

    return () => {
      if (unsubInventory.current)  unsubInventory.current();
      if (unsubCategories.current) unsubCategories.current();
    };
  }, [dispatch]);

  // ── 3. Orders listener (admin only — customers order via WhatsApp) ──────────
  useEffect(() => {
    if (unsubOrders.current) {
      unsubOrders.current();
      unsubOrders.current = null;
    }

    if (!isAdmin || !currentUser) {
      dispatch(clearOrders());
      return;
    }

    unsubOrders.current = subscribeToAllOrders((orders) => dispatch(setOrders(orders)));
    return () => { if (unsubOrders.current) unsubOrders.current(); };
  }, [isAdmin, currentUser?.uid, dispatch]);

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl">
          <Leaf size={32} className="text-white" />
        </div>
        <Loader2 size={24} className="text-emerald-400 animate-spin" />
        <p className="text-emerald-300 text-xs">Loading Fresh Tokri...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* ── /admin-deepak — Secret admin route ── */}
        <Route
          path="/admin-deepak"
          element={
            isAdmin
              ? <AdminApp currentUser={currentUser} />
              : <AdminLoginScreen />
          }
        />

        {/* ── All other routes → Customer shell ── */}
        <Route
          path="*"
          element={<CustomerApp />}
        />
      </Routes>

      {/* OTP Modal — used for profile/account login if needed */}
      <OTPModal />
    </>
  );
}
