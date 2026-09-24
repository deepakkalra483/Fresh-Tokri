import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderAPI, fetchAllOrdersAPI } from '../../services/api';

// Thunk: place new order (POST to backend)
export const submitOrder = createAsyncThunk(
  'orders/submitOrder',
  async (orderPayload) => {
    const apiResult = await createOrderAPI(orderPayload);
    if (apiResult) return apiResult;
    // Offline fallback
    return {
      id: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'placed',
      mode: orderPayload.mode || 'instant',
      eta: orderPayload.mode === 'instant' ? '15-20 Mins' : 'Tomorrow 7:00 AM',
      rider: { name: 'Vikram Singh', phone: '+91 98123 45678', rating: '4.9 ★', avatar: '🛵' },
      items: orderPayload.items || [],
      totalPaid: orderPayload.total || 0,
      paymentMethod: orderPayload.paymentMethod || 'UPI',
      deliveryAddress: orderPayload.deliveryAddress || '',
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
);

// Thunk: fetch all orders from MongoDB
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async () => {
    const data = await fetchAllOrdersAPI();
    return data || [];
  }
);

const ACTIVE_STATUSES = ['placed', 'packed', 'on_way'];

const initialState = {
  allOrders: [],       // full list from DB
  activeOrder: null,   // the most recent non-delivered order
  trackingOrderId: null, // which order is currently shown in tracker view
  fetchStatus: 'idle',
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setTrackingOrder: (state, action) => {
      state.trackingOrderId = action.payload; // order id to show in tracker
    },
    clearTrackingOrder: (state) => {
      state.trackingOrderId = null;
    },
    updateOrderStatus: (state, action) => {
      if (state.activeOrder) {
        state.activeOrder.status = action.payload;
      }
    },
    // Legacy reducer kept for compatibility
    placeNewOrder: (state, action) => {
      const { items, mode, total } = action.payload;
      const newOrder = {
        id: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'placed',
        mode,
        eta: mode === 'instant' ? '15-20 Mins' : 'Tomorrow 7:00 AM',
        rider: { name: 'Vikram Singh', phone: '+91 98123 45678', rating: '4.9 ★', avatar: '🛵' },
        items,
        totalPaid: total,
        placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      state.activeOrder = newOrder;
      state.allOrders.unshift(newOrder);
    },
  },
  extraReducers: (builder) => {
    builder
      // submitOrder: new order placed
      .addCase(submitOrder.fulfilled, (state, action) => {
        if (action.payload) {
          state.allOrders.unshift(action.payload);
          state.activeOrder = action.payload;
          state.trackingOrderId = action.payload.id || action.payload.orderId;
        }
      })
      // fetchAllOrders: load list from DB
      .addCase(fetchAllOrders.pending, (state) => {
        state.fetchStatus = 'loading';
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.allOrders = action.payload;
        // Set activeOrder = most recent non-delivered order
        const active = action.payload.find(o => ACTIVE_STATUSES.includes(o.status));
        if (active) state.activeOrder = active;
      })
      .addCase(fetchAllOrders.rejected, (state) => {
        state.fetchStatus = 'failed';
      });
  },
});

export const { setTrackingOrder, clearTrackingOrder, updateOrderStatus, placeNewOrder } = ordersSlice.actions;

export const selectAllOrders = (state) => state.orders.allOrders;
export const selectActiveOrder = (state) => state.orders.activeOrder;
export const selectTrackingOrderId = (state) => state.orders.trackingOrderId;
export const selectOrderFetchStatus = (state) => state.orders.fetchStatus;

export const selectTrackingOrder = (state) => {
  const id = state.orders.trackingOrderId;
  if (!id) return state.orders.activeOrder;
  return state.orders.allOrders.find(o => (o.id || o.orderId) === id) || state.orders.activeOrder;
};

export default ordersSlice.reducer;
