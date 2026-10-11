/**
 * App.jsx
 * Root component — manages:
 * 1. Firebase Auth state listener (onAuthStateChanged → setAuthUser)
 * 2. Inventory + Categories real-time listeners (always on — no auth required)
 * 3. Orders real-time listener — starts only after login
 * 4. URL-based routing:
 *    - /admin-deepak  → Admin login screen → Admin shell
 *    - everything else → Customer shell (no auth gate — browse freely)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Auth
import {
  setAuthUser,
  selectIsLoggedIn,
  selectIsAdmin,
  selectAuthLoading,
  selectCurrentUser,
  selectOTPModalOpen,
  openOTPModal,
  setUserAfterOTP,
} from './features/auth/authSlice';
import { subscribeToAuthState } from './firebase/authService';

// Inventory
import { setProductsList } from './features/products/productsSlice';
import { subscribeToInventory, seedInventoryIfEmpty } from './firebase/inventoryService';

// Categories
import { setCategoriesList } from './features/categories/categoriesSlice';
import { subscribeToCategories, seedCategoriesIfEmpty } from './firebase/categoriesService';

// Orders
import { setOrders, clearOrders, submitOrder } from './features/orders/ordersSlice';
import { clearCart, selectCartItems, closeCheckout } from './features/cart/cartSlice';
import { selectDeliveryMode } from './features/deliveryMode/deliveryModeSlice';
import { selectActiveAddress } from './features/address/addressSlice';
import { subscribeToAllOrders, subscribeToUserOrders } from './firebase/orderService';

// Layout
import StickyHeader from './components/layout/StickyHeader';
import FloatingCartBar from './components/layout/FloatingCartBar';
import BottomNavbar from './components/layout/BottomNavbar';

// Modals
import CheckoutDrawer from './components/checkout/CheckoutDrawer';
import ProductDetailsModal from './components/home/ProductDetailsModal';
import AddressModal from './components/address/AddressModal';
import OTPModal from './components/auth/OTPModal';

// Auth Screens
import AdminLoginScreen from './components/auth/AdminLoginScreen';

// Customer Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
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
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-0 md:p-4 font-sans antialiased select-none">
      <div className="w-full max-w-md h-screen md:h-[850px] md:max-h-[900px] bg-slate-50 md:rounded-3xl shadow-xl relative overflow-hidden flex flex-col border-0 md:border border-slate-200">
        {header}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
        {bottomNav}
      </div>
    </div>
  );
}

// ── Customer App ───────────────────────────────────────────────────────────────
function CustomerApp({ onOrderPlaced }) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Shell
      header={activeTab === 'home' ? <StickyHeader onTabChange={setActiveTab} /> : null}
      bottomNav={<BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {activeTab === 'home'       && <HomePage />}
      {activeTab === 'categories' && <CategoriesPage onBackToHome={() => setActiveTab('home')} />}
      {activeTab === 'orders'     && <OrdersPage />}
      {activeTab === 'profile'    && <CustomerProfile />}

      <FloatingCartBar />
      <CheckoutDrawer onOrderPlaced={() => { onOrderPlaced?.(); setActiveTab('orders'); }} />
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
  const otpOpen     = useSelector(selectOTPModalOpen);

  // For post-OTP order submission
  const cartItems   = useSelector(selectCartItems);
  const mode        = useSelector(selectDeliveryMode);
  const address     = useSelector(selectActiveAddress);
  const products    = useSelector((state) => state.products.productsList);

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

  // ── 3. Orders listener (only when logged in) ───────────────────────────────
  useEffect(() => {
    if (unsubOrders.current) {
      unsubOrders.current();
      unsubOrders.current = null;
    }

    if (!isLoggedIn || !currentUser) {
      dispatch(clearOrders());
      return;
    }

    if (isAdmin) {
      unsubOrders.current = subscribeToAllOrders((orders) => dispatch(setOrders(orders)));
    } else {
      unsubOrders.current = subscribeToUserOrders(currentUser.uid, (orders) => dispatch(setOrders(orders)));
    }

    return () => { if (unsubOrders.current) unsubOrders.current(); };
  }, [isLoggedIn, isAdmin, currentUser?.uid, dispatch]);

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

  /**
   * Called by OTPModal after successful phone verification.
   * If there was a pending 'checkout' action, we immediately submit the order.
   */
  const handleOTPSuccess = (profile, pendingAction) => {
    if (pendingAction === 'checkout' && address) {
      const formattedItems = Object.entries(cartItems).map(([id, qty]) => {
        const p = products.find((x) => x.id === id);
        if (!p) return null;
        const price = mode === 'instant' ? p.priceInstant : p.priceMorning;
        return { id: p.id, name: `${p.name} (${p.weight})`, price, qty };
      }).filter(Boolean);

      const totals = formattedItems.reduce(
        (acc, item) => ({ ...acc, finalTotal: acc.finalTotal + item.price * item.qty }),
        { finalTotal: 0 }
      );

      dispatch(submitOrder({
        userId:          profile.uid,
        customerName:    profile.name || profile.phone || 'Customer',
        items:           formattedItems,
        mode,
        total:           totals.finalTotal,
        paymentMethod:   'COD',
        deliveryAddress: `${address.label} (${address.tag}) • ${address.flat}, ${address.area}`,
      }));
      dispatch(clearCart());
      dispatch(closeCheckout());
    }
  };

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

        {/* ── All other routes → Customer shell (no auth gate) ── */}
        <Route
          path="*"
          element={<CustomerApp onOrderPlaced={null} />}
        />
      </Routes>

      {/* OTP Modal — rendered at root level so it floats above everything */}
      <OTPModal onLoginSuccess={handleOTPSuccess} />
    </>
  );
}
