import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: {}, // { [productId]: quantity }
  isCheckoutOpen: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const productId = action.payload;
      state.items[productId] = (state.items[productId] || 0) + 1;
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      if (state.items[productId]) {
        state.items[productId] -= 1;
        if (state.items[productId] <= 0) {
          delete state.items[productId];
        }
      }
    },
    setItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.items[productId];
      } else {
        state.items[productId] = quantity;
      }
    },
    clearCart: (state) => {
      state.items = {};
    },
    openCheckout: (state) => {
      state.isCheckoutOpen = true;
    },
    closeCheckout: (state) => {
      state.isCheckoutOpen = false;
    },
    toggleCheckout: (state) => {
      state.isCheckoutOpen = !state.isCheckoutOpen;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  setItemQuantity,
  clearCart,
  openCheckout,
  closeCheckout,
  toggleCheckout,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectIsCheckoutOpen = (state) => state.cart.isCheckoutOpen;

export const selectCartTotals = (state) => {
  const items = state.cart.items;
  const products = state.products.productsList;
  const mode = state.deliveryMode.mode;

  let totalQty = 0;
  let subtotalInstant = 0;
  let subtotalMorning = 0;

  Object.entries(items).forEach(([id, qty]) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      totalQty += qty;
      subtotalInstant += product.priceInstant * qty;
      subtotalMorning += product.priceMorning * qty;
    }
  });

  const finalTotal = mode === 'instant' ? subtotalInstant : subtotalMorning;
  const totalSavings = mode === 'morning' ? subtotalInstant - subtotalMorning : 0;

  return {
    totalQty,
    subtotalInstant,
    subtotalMorning,
    finalTotal,
    totalSavings,
  };
};

export default cartSlice.reducer;

