import { createSlice } from '@reduxjs/toolkit';

/**
 * Cart Item structure in items map:
 * key: cartKey (e.g. "p1_500 gm" or "p1")
 * value: {
 *   id: string (productId),
 *   selectedWeight: string (e.g. "500 gm", "1 kg", "2 pcs"),
 *   unitPrice: number,
 *   quantity: number,
 * }
 *
 * For backward compatibility, if a number is encountered, it is treated as quantity with product's default weight.
 */

const initialState = {
  items: {}, // { [cartKey]: { id, selectedWeight, unitPrice, quantity } }
  isCheckoutOpen: false,
  // Variant modal state for selecting weight
  weightModalProduct: null, // product object or null
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Opens the weight selector popup for a product
    openWeightModal: (state, action) => {
      state.weightModalProduct = action.payload;
    },
    closeWeightModal: (state) => {
      state.weightModalProduct = null;
    },
    // Adds a variant with specific weight & price to cart
    addVariantToCart: (state, action) => {
      const { product, selectedWeight, unitPrice, quantity = 1 } = action.payload;
      const weight = selectedWeight || product.weight || '500 gm';
      const cartKey = `${product.id}_${weight}`;

      if (state.items[cartKey]) {
        state.items[cartKey].quantity += quantity;
      } else {
        state.items[cartKey] = {
          id: product.id,
          selectedWeight: weight,
          unitPrice: Number(unitPrice) || product.priceInstant || 0,
          quantity: quantity,
        };
      }
    },
    // Simple addToCart (either increments existing key or opens modal if handled by UI)
    addToCart: (state, action) => {
      const cartKey = action.payload;
      // If it exists in items directly as cartKey
      if (state.items[cartKey]) {
        if (typeof state.items[cartKey] === 'number') {
          state.items[cartKey] += 1;
        } else {
          state.items[cartKey].quantity += 1;
        }
        return;
      }

      // If payload is productId, find any existing item with this id
      const existingKey = Object.keys(state.items).find(
        (k) => state.items[k]?.id === cartKey || k === cartKey
      );
      if (existingKey) {
        if (typeof state.items[existingKey] === 'number') {
          state.items[existingKey] += 1;
        } else {
          state.items[existingKey].quantity += 1;
        }
      }
    },
    removeFromCart: (state, action) => {
      const cartKey = action.payload;
      // Find key or first item matching productId
      let targetKey = state.items[cartKey] ? cartKey : null;
      if (!targetKey) {
        targetKey = Object.keys(state.items).find(
          (k) => state.items[k]?.id === cartKey || k === cartKey
        );
      }

      if (targetKey && state.items[targetKey]) {
        if (typeof state.items[targetKey] === 'number') {
          state.items[targetKey] -= 1;
          if (state.items[targetKey] <= 0) delete state.items[targetKey];
        } else {
          state.items[targetKey].quantity -= 1;
          if (state.items[targetKey].quantity <= 0) {
            delete state.items[targetKey];
          }
        }
      }
    },
    // Remove all variants of a product
    removeProductCompletely: (state, action) => {
      const productId = action.payload;
      Object.keys(state.items).forEach((k) => {
        if (state.items[k]?.id === productId || k === productId || k.startsWith(`${productId}_`)) {
          delete state.items[k];
        }
      });
    },
    setItemQuantity: (state, action) => {
      const { cartKey, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.items[cartKey];
      } else if (state.items[cartKey]) {
        if (typeof state.items[cartKey] === 'number') {
          state.items[cartKey] = quantity;
        } else {
          state.items[cartKey].quantity = quantity;
        }
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
  openWeightModal,
  closeWeightModal,
  addVariantToCart,
  addToCart,
  removeFromCart,
  removeProductCompletely,
  setItemQuantity,
  clearCart,
  openCheckout,
  closeCheckout,
  toggleCheckout,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectIsCheckoutOpen = (state) => state.cart.isCheckoutOpen;
export const selectWeightModalProduct = (state) => state.cart.weightModalProduct;

export const selectCartTotals = (state) => {
  const items = state.cart.items || {};
  const products = state.products.productsList || [];
  const mode = state.deliveryMode.mode;

  let totalQty = 0;
  let subtotalInstant = 0;
  let subtotalMorning = 0;

  Object.entries(items).forEach(([key, val]) => {
    let productId = key;
    let qty = 1;
    let storedWeight = null;
    let storedPrice = null;

    if (typeof val === 'number') {
      qty = val;
    } else if (val && typeof val === 'object') {
      productId = val.id;
      qty = val.quantity;
      storedWeight = val.selectedWeight;
      storedPrice = val.unitPrice;
    }

    const product = products.find((p) => p.id === productId);
    if (product && qty > 0) {
      totalQty += qty;

      // Base price calculation
      let priceForInstant = product.priceInstant;
      let priceForMorning = product.priceMorning;

      // If a specific unitPrice was chosen with custom/selected weight
      if (storedPrice !== null && storedPrice !== undefined) {
        priceForInstant = storedPrice;
        // In morning mode, morning is either 20% off or calculated morning rate
        priceForMorning = Math.round(storedPrice * 0.8);
      }

      subtotalInstant += priceForInstant * qty;
      subtotalMorning += priceForMorning * qty;
    }
  });

  const finalTotal = mode === 'instant' ? subtotalInstant : subtotalMorning;
  const totalSavings = mode === 'morning' ? Math.max(0, subtotalInstant - subtotalMorning) : 0;

  return {
    totalQty,
    subtotalInstant,
    subtotalMorning,
    finalTotal,
    totalSavings,
  };
};

export default cartSlice.reducer;

