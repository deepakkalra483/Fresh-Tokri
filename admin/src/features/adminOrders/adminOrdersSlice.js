import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchAllOrdersFromFirestore,
  updateOrderStatusInFirestore,
  assignRiderInFirestore,
} from '../../firebase/orderService';

const mockOrders = [
  {
    id: 'FT-8924',
    customerName: 'Deepak Kumar',
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Valley, Sector 62, Mohali',
    status: 'placed',
    mode: 'instant',
    items: [
      { name: 'Fresh Organic Farm Tomatoes (1kg)', qty: 1, price: 38 },
      { name: 'Shimla Red Apples (500g)', qty: 1, price: 70 },
    ],
    totalPaid: 108,
    paymentMethod: 'UPI',
    placedAt: '10:45 AM',
    rider: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
  },
  {
    id: 'FT-8925',
    customerName: 'Priya Sharma',
    phone: '+91 98123 45678',
    address: 'House #120, Sector 17, Chandigarh',
    status: 'packed',
    mode: 'morning',
    items: [
      { name: 'Weekly Salad Tokri Box (2.5kg)', qty: 1, price: 229 },
      { name: 'Fresh Alphonso Mangoes (1kg)', qty: 1, price: 195 },
    ],
    totalPaid: 424,
    paymentMethod: 'COD',
    placedAt: '09:15 AM',
    rider: { name: 'Vikram Singh', phone: '+91 98123 45678' },
  },
];

export const fetchAdminOrders = createAsyncThunk(
  'adminOrders/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    const data = await fetchAllOrdersFromFirestore();
    if (data) return data;
    return mockOrders;
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  'adminOrders/updateOrderStatusThunk',
  async ({ id, status }, { dispatch }) => {
    await updateOrderStatusInFirestore(id, status);
    return { id, status };
  }
);

export const assignRiderThunk = createAsyncThunk(
  'adminOrders/assignRiderThunk',
  async ({ id, rider }, { dispatch }) => {
    await assignRiderInFirestore(id, rider);
    return { id, rider, status: 'on_way' };
  }
);

const initialState = {
  orders: mockOrders,
  filterStatus: 'all',
  status: 'idle',
};

export const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const order = state.orders.find(o => o.id === id);
      if (order) order.status = status;
    },
    assignRider: (state, action) => {
      const { id, rider } = action.payload;
      const order = state.orders.find(o => o.id === id);
      if (order) {
        order.rider = rider;
        order.status = 'on_way';
      }
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.orders = action.payload;
        }
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const order = state.orders.find(o => o.id === action.payload.id);
        if (order) order.status = action.payload.status;
      })
      .addCase(assignRiderThunk.fulfilled, (state, action) => {
        const order = state.orders.find(o => o.id === action.payload.id);
        if (order) {
          order.rider = action.payload.rider;
          order.status = 'on_way';
        }
      });
  },
});

export const { updateOrderStatus, assignRider, setFilterStatus } = adminOrdersSlice.actions;

export const selectAllAdminOrders = (state) => state.adminOrders.orders;
export const selectFilterStatus = (state) => state.adminOrders.filterStatus;

export const selectFilteredAdminOrders = (state) => {
  const { orders, filterStatus } = state.adminOrders;
  if (filterStatus === 'all') return orders;
  return orders.filter(o => o.status === filterStatus);
};

export default adminOrdersSlice.reducer;
