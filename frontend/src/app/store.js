import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

import deliveryModeReducer from '../features/deliveryMode/deliveryModeSlice';
import cartReducer         from '../features/cart/cartSlice';
import productsReducer     from '../features/products/productsSlice';
import ordersReducer       from '../features/orders/ordersSlice';
import addressReducer      from '../features/address/addressSlice';
import authReducer         from '../features/auth/authSlice';
import categoriesReducer   from '../features/categories/categoriesSlice';

// ── Persist configs ───────────────────────────────────────────────────────────

// Cart: persist items only (not the drawer open state)
const cartPersistConfig = {
  key: 'ft-cart',
  storage,
  whitelist: ['items'],
};

// Address: persist saved addresses + active address
const addressPersistConfig = {
  key: 'ft-address',
  storage,
  whitelist: ['savedAddresses', 'activeAddress'],
};

// DeliveryMode: persist selected mode (instant / morning)
const deliveryModePersistConfig = {
  key: 'ft-mode',
  storage,
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    deliveryMode: persistReducer(deliveryModePersistConfig, deliveryModeReducer),
    cart:         persistReducer(cartPersistConfig, cartReducer),
    products:     productsReducer,
    orders:       ordersReducer,
    address:      persistReducer(addressPersistConfig, addressReducer),
    auth:         authReducer,
    categories:   categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches these non-serializable actions internally
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
