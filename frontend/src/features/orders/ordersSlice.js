/**
 * ordersSlice.js
 * Manages order state fed by real-time Firestore listeners.
 * - Admin: all orders via subscribeToAllOrders
 * - Customer: own orders via subscribeToUserOrders
 * Listeners are started/stopped in App.jsx based on auth state.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createOrderInFirestore,
  updateOrderStatusInFirestore,
} from '../../firebase/orderService';

const ACTIVE_STATUSES = ['placed', 'packed', 'on_way'];

// ── Thunks ────────────────────────────────────────────────────────────────────

/** Place a new order — writes to Firestore, real-time listener picks it up. */
export const submitOrder = createAsyncThunk(
  'orders/submitOrder',
  async (orderPayload, { rejectWithValue }) => {
    try {
      const result = await createOrderInFirestore(orderPayload);
      if (!result) throw new Error('Failed to create order');
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Admin: advance order status in Firestore. Real-time listener updates UI. */
export const updateOrderStatusThunk = createAsyncThunk(
  'orders/updateStatus',
  async ({ docId, status, rider }, { rejectWithValue }) => {
    try {
      await updateOrderStatusInFirestore(docId, status, rider || null);
      return { docId, status };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const initialState = {
  allOrders:      [],     // all orders (admin) or user orders (customer)
  activeOrder:    null,   // most recent non-delivered order
  trackingOrderId: null,
  fetchStatus:    'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  orderError:     null,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Called by real-time listener in App.jsx
    setOrders: (state, action) => {
      const orders = action.payload || [];
      state.allOrders  = orders;
      state.fetchStatus = 'succeeded';
      // Keep activeOrder = most recent active order
      const active = orders.find(o => ACTIVE_STATUSES.includes(o.status));
      state.activeOrder = active || null;
    },
    setTrackingOrder: (state, action) => {
      state.trackingOrderId = action.payload;
    },
    clearTrackingOrder: (state) => {
      state.trackingOrderId = null;
    },
    clearOrders: (state) => {
      state.allOrders      = [];
      state.activeOrder    = null;
      state.trackingOrderId = null;
      state.fetchStatus    = 'idle';
    },
    // Legacy local status update kept for optimistic admin UI
    updateOrderStatus: (state, action) => {
      if (typeof action.payload === 'object' && action.payload.orderId) {
        const { orderId, status } = action.payload;
        const o = state.allOrders.find(x => (x.id || x.orderId) === orderId);
        if (o) o.status = status;
        if (state.activeOrder && (state.activeOrder.id || state.activeOrder.orderId) === orderId) {
          state.activeOrder.status = status;
        }
      } else if (state.activeOrder) {
        state.activeOrder.status = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // submitOrder
    builder
      .addCase(submitOrder.pending, (state) => {
        state.fetchStatus = 'loading';
        state.orderError  = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        // Real-time listener will update allOrders; set activeOrder optimistically
        const order = { ...action.payload, id: action.payload.id || action.payload.orderId };
        state.activeOrder    = order;
        state.trackingOrderId = order.id;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.orderError  = action.payload;
      });

    // updateOrderStatusThunk (optimistic update — listener will confirm)
    builder.addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
      const { docId, status } = action.payload;
      const o = state.allOrders.find(x => x.id === docId);
      if (o) o.status = status;
    });
  },
});

export const {
  setOrders,
  setTrackingOrder,
  clearTrackingOrder,
  clearOrders,
  updateOrderStatus,
  placeNewOrder,
} = ordersSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllOrders        = (state) => state.orders.allOrders;
export const selectActiveOrder      = (state) => state.orders.activeOrder;
export const selectTrackingOrderId  = (state) => state.orders.trackingOrderId;
export const selectOrderFetchStatus = (state) => state.orders.fetchStatus;
export const selectOrderError       = (state) => state.orders.orderError;

export const selectTrackingOrder = (state) => {
  const id = state.orders.trackingOrderId;
  if (!id) return state.orders.activeOrder;
  return (
    state.orders.allOrders.find(o => (o.id || o.orderId) === id) ||
    state.orders.activeOrder
  );
};

export default ordersSlice.reducer;
