import { configureStore } from '@reduxjs/toolkit';
import adminOrdersReducer from '../features/adminOrders/adminOrdersSlice';
import adminProductsReducer from '../features/adminProducts/adminProductsSlice';
import customersReducer from '../features/customers/customersSlice';

export const store = configureStore({
  reducer: {
    adminOrders: adminOrdersReducer,
    adminProducts: adminProductsReducer,
    customers: customersReducer,
  },
});

