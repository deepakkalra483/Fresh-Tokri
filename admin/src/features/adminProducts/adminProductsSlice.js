import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchProductsAPI, 
  createProductAPI, 
  updateProductAPI, 
  deleteProductAPI 
} from '../../services/api';

const mockProducts = [
  { id: 'p1', name: 'Fresh Organic Farm Tomatoes', weight: '1 kg', category: 'vegetables', priceInstant: 48, priceMorning: 38, oldPrice: 55, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', inStock: true, discount: '20% OFF' },
  { id: 'p2', name: 'Shimla Red Royal Apples', weight: '500 g', category: 'fruits', priceInstant: 90, priceMorning: 70, oldPrice: 110, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', inStock: true, discount: '22% OFF' },
  { id: 'p3', name: 'Baby Leaf Spinach (Palak)', weight: '250 g', category: 'vegetables', priceInstant: 25, priceMorning: 18, oldPrice: 32, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', inStock: true, discount: '28% OFF' },
  { id: 'p4', name: 'Robusta Ripe Bananas', weight: '1 Dozen', category: 'fruits', priceInstant: 60, priceMorning: 48, oldPrice: 75, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', inStock: true, discount: '20% OFF' },
  { id: 'p5', name: 'Crispy Green Cucumbers', weight: '500 g', category: 'vegetables', priceInstant: 30, priceMorning: 22, oldPrice: 38, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80', inStock: true, discount: '26% OFF' },
  { id: 'p6', name: 'Organic Green Broccoli', weight: '1 Pc (400g)', category: 'exotic', priceInstant: 85, priceMorning: 65, oldPrice: 105, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', inStock: true, discount: '24% OFF' }
];

export const fetchAdminProducts = createAsyncThunk(
  'adminProducts/fetchAdminProducts',
  async (_, { rejectWithValue }) => {
    const data = await fetchProductsAPI();
    if (data) return data;
    return mockProducts;
  }
);

export const createProductThunk = createAsyncThunk(
  'adminProducts/createProductThunk',
  async (productData, { dispatch }) => {
    const res = await createProductAPI(productData);
    if (res) return res;
    return { id: `p-${Date.now()}`, inStock: true, ...productData };
  }
);

export const updateProductThunk = createAsyncThunk(
  'adminProducts/updateProductThunk',
  async (productData, { dispatch }) => {
    const targetId = productData.id || productData.productId;
    const res = await updateProductAPI(targetId, productData);
    if (res) return res;
    return productData;
  }
);

export const deleteProductThunk = createAsyncThunk(
  'adminProducts/deleteProductThunk',
  async (id, { dispatch }) => {
    await deleteProductAPI(id);
    return id;
  }
);

const initialState = {
  products: mockProducts,
  isAddModalOpen: false,
  editingProduct: null,
  status: 'idle',
};

export const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const newProduct = { id: `p-${Date.now()}`, inStock: true, ...action.payload };
      state.products.unshift(newProduct);
      state.isAddModalOpen = false;
    },
    updateProduct: (state, action) => {
      const targetId = action.payload.id || action.payload.productId;
      const index = state.products.findIndex(p => p.id === targetId || p.productId === targetId);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...action.payload };
      }
      state.isAddModalOpen = false;
      state.editingProduct = null;
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload && p.productId !== action.payload);
    },
    toggleStock: (state, action) => {
      const product = state.products.find(p => p.id === action.payload || p.productId === action.payload);
      if (product) product.inStock = !product.inStock;
    },
    openAddModal: (state) => {
      state.editingProduct = null;
      state.isAddModalOpen = true;
    },
    openEditModal: (state, action) => {
      state.editingProduct = action.payload;
      state.isAddModalOpen = true;
    },
    closeModal: (state) => {
      state.isAddModalOpen = false;
      state.editingProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.products = action.payload;
        }
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.isAddModalOpen = false;
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const targetId = action.payload.id || action.payload.productId;
        const index = state.products.findIndex(p => p.id === targetId || p.productId === targetId);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...action.payload };
        }
        state.isAddModalOpen = false;
        state.editingProduct = null;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload && p.productId !== action.payload);
      });
  }
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  openAddModal,
  openEditModal,
  closeModal
} = adminProductsSlice.actions;

export const selectAdminProducts = (state) => state.adminProducts.products;
export const selectIsAddModalOpen = (state) => state.adminProducts.isAddModalOpen;
export const selectEditingProduct = (state) => state.adminProducts.editingProduct;

export default adminProductsSlice.reducer;
