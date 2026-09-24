import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAdminProducts } from './features/adminProducts/adminProductsSlice';
import { fetchAdminOrders } from './features/adminOrders/adminOrdersSlice';
import AdminHeader from './components/layout/AdminHeader';
import DashboardPage from './pages/DashboardPage';
import OrdersManagePage from './pages/OrdersManagePage';
import ProductsManagePage from './pages/ProductsManagePage';
import DeliveryPartnerPage from './pages/DeliveryPartnerPage';
import CustomersPage from './pages/CustomersPage';

export default function App() {
  const dispatch = useDispatch();
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' | 'delivery'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'products' | 'customers'

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 select-none pb-12">
      
      {/* Top Header with Role Switcher */}
      <AdminHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeRole === 'delivery' ? (
          <DeliveryPartnerPage />
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
            {activeTab === 'orders' && <OrdersManagePage />}
            {activeTab === 'products' && <ProductsManagePage />}
            {activeTab === 'customers' && <CustomersPage />}
          </>
        )}
      </main>

    </div>
  );
}
