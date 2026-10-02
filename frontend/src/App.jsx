/**
 * App.jsx
 * Root component — manages:
 * 1. Firebase Auth state listener (onAuthStateChanged → setAuthUser)
 * 2. Inventory real-time listener (subscribeToInventory → setProductsList)
 * 3. Orders real-time listener — admin gets all orders, customer gets own orders
 * 4. Role-based UI rendering (Login | Admin Shell | Customer Shell)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Auth
import { setAuthUser, selectIsLoggedIn, selectIsAdmin, selectAuthLoading, selectCurrentUser } from './features/auth/authSlice';
import { subscribeToAuthState } from './firebase/authService';

// Inventory
import { setProductsList, setProductsError } from './features/products/productsSlice';
import { subscribeToInventory, seedInventoryIfEmpty } from './firebase/inventoryService';

// Orders
import { setOrders, clearOrders } from './features/orders/ordersSlice';
import { subscribeToAllOrders, subscribeToUserOrders } from './firebase/orderService';

// Layout
import StickyHeader from './components/layout/StickyHeader';
import FloatingCartBar from './components/layout/FloatingCartBar';
import BottomNavbar from './components/layout/BottomNavbar';

// Modals
import CheckoutDrawer from './components/checkout/CheckoutDrawer';
import ProductDetailsModal from './components/home/ProductDetailsModal';
import AddressModal from './components/address/AddressModal';

// Auth Screen
import LoginScreen from './components/auth/LoginScreen';

// Customer Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage';

import { Leaf, Loader2 } from 'lucide-react';

export default function App() {
  const dispatch    = useDispatch();
  const isLoggedIn  = useSelector(selectIsLoggedIn);
  const isAdmin     = useSelector(selectIsAdmin);
  const authLoading = useSelector(selectAuthLoading);
  const currentUser = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState('home');

  // Keep refs to unsubscribe functions so we can clean up on user change
  const unsubInventory = useRef(null);
  const unsubOrders    = useRef(null);

  // ── 1. Firebase Auth listener (runs once on mount) ───────────────────────
  useEffect(() => {
    const unsubAuth = subscribeToAuthState((profile) => {
      dispatch(setAuthUser(profile));
    });
    return () => unsubAuth();
  }, [dispatch]);

  // ── 2. Inventory listener (always on — products visible for everyone) ────
  useEffect(() => {
    // Seed Firestore with default menu if it's the first run
    seedInventoryIfEmpty();

    unsubInventory.current = subscribeToInventory((products) => {
      dispatch(setProductsList(products));
    });

    return () => {
      if (unsubInventory.current) unsubInventory.current();
    };
  }, [dispatch]);

  // ── 3. Orders listener — depends on role and login state ────────────────
  useEffect(() => {
    // Clean up old listener
    if (unsubOrders.current) {
      unsubOrders.current();
      unsubOrders.current = null;
    }

    if (!isLoggedIn || !currentUser) {
      dispatch(clearOrders());
      return;
    }

    if (isAdmin) {
      // Admin sees ALL orders in real time
      unsubOrders.current = subscribeToAllOrders((orders) => {
        dispatch(setOrders(orders));
      });
    } else {
      // Customer sees only their own orders
      unsubOrders.current = subscribeToUserOrders(currentUser.uid, (orders) => {
        dispatch(setOrders(orders));
      });
    }

    return () => {
      if (unsubOrders.current) unsubOrders.current();
    };
  }, [isLoggedIn, isAdmin, currentUser?.uid, dispatch]);

  // ── 4. Reset tab when role changes ──────────────────────────────────────
  useEffect(() => {
    setActiveTab(isAdmin ? 'admin-dashboard' : 'home');
  }, [isAdmin, isLoggedIn]);

  // ── Loading screen while Firebase resolves initial auth ─────────────────
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

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // ── App shell wrapper ────────────────────────────────────────────────────
  const Shell = ({ header, children }) => (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-0 md:p-4 font-sans antialiased select-none">
      <div className="w-full max-w-md h-screen md:h-[850px] md:max-h-[900px] bg-slate-50 md:rounded-3xl shadow-xl relative overflow-hidden flex flex-col border-0 md:border border-slate-200">
        {header}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
        <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );

  // ── Admin Shell ──────────────────────────────────────────────────────────
  if (isAdmin) {
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
      <Shell header={adminHeader}>
        {activeTab === 'admin-dashboard' && <AdminDashboard />}
        {activeTab === 'admin-menu'      && <AdminMenuPage />}
        {activeTab === 'admin-orders'    && <AdminOrdersPage />}
        {activeTab === 'admin-delivery'  && <AdminDeliveryPage />}
      </Shell>
    );
  }

  // ── Customer Shell ───────────────────────────────────────────────────────
  return (
    <Shell header={activeTab === 'home' ? <StickyHeader onTabChange={setActiveTab} /> : null}>
      {activeTab === 'home'       && <HomePage />}
      {activeTab === 'categories' && <CategoriesPage onBackToHome={() => setActiveTab('home')} />}
      {activeTab === 'orders'     && <OrdersPage />}
      {activeTab === 'profile'    && <CustomerProfile />}

      <FloatingCartBar />
      <CheckoutDrawer onOrderPlaced={() => setActiveTab('orders')} />
      <ProductDetailsModal />
      <AddressModal />
    </Shell>
  );
}
