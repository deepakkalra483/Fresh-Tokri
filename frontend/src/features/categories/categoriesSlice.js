/**
 * categoriesSlice.js
 * Manages product categories state. Categories come from Firestore `inventory/categories`
 * via a real-time listener started in App.jsx.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveCategoriesToFirestore, DEFAULT_CATEGORIES } from '../../firebase/categoriesService';

// ── Save categories thunk (Admin only) ────────────────────────────────────────
export const saveCategories = createAsyncThunk(
  'categories/saveCategories',
  async (categoriesList) => {
    await saveCategoriesToFirestore(categoriesList);
    return categoriesList;
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────
const initialState = {
  list:   DEFAULT_CATEGORIES,   // populated by real-time Firestore listener
  status: 'loading',            // 'loading' | 'ready' | 'error' | 'saving'
};

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Called from App.jsx onSnapshot callback
    setCategoriesList: (state, action) => {
      state.list   = action.payload || DEFAULT_CATEGORIES;
      state.status = 'ready';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveCategories.pending,   (state) => { state.status = 'saving'; })
      .addCase(saveCategories.fulfilled, (state) => { state.status = 'ready'; })
      .addCase(saveCategories.rejected,  (state) => { state.status = 'error'; });
  },
});

export const { setCategoriesList } = categoriesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCategories       = (state) => state.categories.list;
export const selectCategoriesStatus = (state) => state.categories.status;

export default categoriesSlice.reducer;
