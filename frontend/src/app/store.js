import { configureStore } from '@reduxjs/toolkit';
import deliveryModeReducer from '../features/deliveryMode/deliveryModeSlice';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import addressReducer from '../features/address/addressSlice';
import authReducer from '../features/auth/authSlice';
import categoriesReducer from '../features/categories/categoriesSlice';

export const store = configureStore({
  reducer: {
    deliveryMode: deliveryModeReducer,
    cart: cartReducer,
    products: productsReducer,
    orders: ordersReducer,
    address: addressReducer,
    auth: authReducer,
    categories: categoriesReducer,
  },
});
