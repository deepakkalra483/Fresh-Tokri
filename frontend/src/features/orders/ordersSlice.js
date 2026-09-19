import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeOrder: {
    id: 'FT-8924',
    status: 'on_way', // 'placed' | 'packed' | 'on_way' | 'delivered'
    mode: 'instant', // 'instant' | 'morning'
    eta: '12 Mins',
    rider: {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      rating: '4.9 ★',
      avatar: '👨‍🦱',
    },
    items: [
      { id: 'p1', name: 'Fresh Organic Tomatoes (1kg)', price: 38, qty: 1 },
      { id: 'p2', name: 'Shimla Red Apples (500g)', price: 70, qty: 1 }
    ],
    totalPaid: 108,
    placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  orderHistory: [],
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    placeNewOrder: (state, action) => {
      const { items, mode, total } = action.payload;
      const newOrder = {
        id: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'placed',
        mode: mode,
        eta: mode === 'instant' ? '15 Mins' : 'Tomorrow 7:00 AM',
        rider: {
          name: 'Vikram Singh',
          phone: '+91 98123 45678',
          rating: '4.9 ★',
          avatar: '🛵',
        },
        items: items,
        totalPaid: total,
        placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      state.activeOrder = newOrder;
      state.orderHistory.unshift(newOrder);
    },
    updateOrderStatus: (state, action) => {
      if (state.activeOrder) {
        state.activeOrder.status = action.payload;
      }
    },
  },
});

export const { placeNewOrder, updateOrderStatus } = ordersSlice.actions;

export const selectActiveOrder = (state) => state.orders.activeOrder;
export const selectOrderHistory = (state) => state.orders.orderHistory;

export default ordersSlice.reducer;

