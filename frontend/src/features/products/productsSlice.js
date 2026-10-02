/**
 * productsSlice.js
 * Manages product/inventory state. Products come from Firestore `inventory/menu`
 * via a real-time listener started in App.jsx.
 * Admin writes go through saveInventoryToFirestore (triggered from admin pages).
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveInventoryToFirestore } from '../../firebase/inventoryService';

// ── Save inventory thunk (Admin only) ─────────────────────────────────────────
export const saveInventory = createAsyncThunk(
  'products/saveInventory',
  async (flatProducts) => {
    await saveInventoryToFirestore(flatProducts);
    return flatProducts; // optimistic: UI already updated via listener
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const initialState = {
  productsList:     [],       // populated by real-time Firestore listener
  activeCategory:   'all',
  searchQuery:      '',
  selectedProduct:  null,
  isDetailsModalOpen: false,
  status:           'loading', // 'loading' | 'ready' | 'error'
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Called from App.jsx onSnapshot callback
    setProductsList: (state, action) => {
      state.productsList = action.payload || [];
      state.status = 'ready';
    },
    setProductsError: (state) => {
      state.status = 'error';
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    openProductDetails: (state, action) => {
      state.selectedProduct    = action.payload;
      state.isDetailsModalOpen = true;
    },
    closeProductDetails: (state) => {
      state.selectedProduct    = null;
      state.isDetailsModalOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveInventory.pending, (state) => { state.status = 'saving'; })
      .addCase(saveInventory.fulfilled, (state) => { state.status = 'ready'; })
      .addCase(saveInventory.rejected,  (state) => { state.status = 'error'; });
  },
});

export const {
  setProductsList,
  setProductsError,
  setActiveCategory,
  setSearchQuery,
  openProductDetails,
  closeProductDetails,
} = productsSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAllProducts         = (state) => state.products.productsList;
export const selectActiveCategory      = (state) => state.products.activeCategory;
export const selectSearchQuery         = (state) => state.products.searchQuery;
export const selectSelectedProduct     = (state) => state.products.selectedProduct;
export const selectIsDetailsModalOpen  = (state) => state.products.isDetailsModalOpen;
export const selectProductsStatus      = (state) => state.products.status;

export const selectFilteredProducts = (state) => {
  const { productsList, activeCategory, searchQuery } = state.products;
  return productsList.filter((p) => {
    if (p.inStock === false) return false; // hide out-of-stock for customers
    const matchesCat    = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });
};

// Unique categories derived from live product list
export const selectAvailableCategories = (state) => {
  const cats = [...new Set(state.products.productsList.map(p => p.category).filter(Boolean))];
  return cats;
};

export default productsSlice.reducer;
