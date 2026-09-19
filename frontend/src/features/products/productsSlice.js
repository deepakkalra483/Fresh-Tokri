import { createSlice } from '@reduxjs/toolkit';

const mockProducts = [
  { 
    id: 'p1', 
    name: 'Fresh Organic Tomatoes', 
    weight: '1 kg', 
    category: 'vegetables', 
    priceInstant: 48, 
    priceMorning: 38, 
    oldPrice: 55, 
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
    emoji: '🍅',
    tag: 'Farm Fresh', 
    discount: '20% OFF',
    origin: 'Sourced 4 AM from Malwa Organic Farms', 
    description: 'Hand-picked ruby red tomatoes. Grown naturally without synthetic pesticides. Perfect for curries, salads, and fresh juices.' 
  },
  { 
    id: 'p2', 
    name: 'Shimla Red Royal Apples', 
    weight: '500 g', 
    category: 'fruits', 
    priceInstant: 90, 
    priceMorning: 70, 
    oldPrice: 110, 
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
    emoji: '🍎',
    tag: 'Crispy', 
    discount: '22% OFF',
    origin: 'Direct Orchard Sourced from Kinnaur, HP', 
    description: 'Sweet, juicy, and extra crunchy red apples. Rich in fiber and natural antioxidants.' 
  },
  { 
    id: 'p3', 
    name: 'Baby Leaf Spinach (Palak)', 
    weight: '250 g', 
    category: 'vegetables', 
    priceInstant: 25, 
    priceMorning: 18, 
    oldPrice: 32, 
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    emoji: '🥬',
    tag: 'Direct Pick', 
    discount: '28% OFF',
    origin: 'Local Hydroponic Greenhouse', 
    description: 'Triple-washed tender spinach leaves. Packed with iron, folate, and essential minerals.' 
  },
  { 
    id: 'p4', 
    name: 'Robusta Ripe Bananas', 
    weight: '1 Dozen', 
    category: 'fruits', 
    priceInstant: 60, 
    priceMorning: 48, 
    oldPrice: 75, 
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
    emoji: '🍌',
    tag: 'Potassium', 
    discount: '20% OFF',
    origin: 'Kerala Certified Farmers Co-op', 
    description: 'Naturally ripened nutrient-dense bananas. High energy snack for active daily lifestyle.' 
  },
  { 
    id: 'p5', 
    name: 'Crispy Green Cucumbers', 
    weight: '500 g', 
    category: 'vegetables', 
    priceInstant: 30, 
    priceMorning: 22, 
    oldPrice: 38, 
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80',
    emoji: '🥒',
    tag: 'Cooling', 
    discount: '26% OFF',
    origin: 'Polyhouse Fresh Harvest', 
    description: 'Thin-skinned hydrative cucumbers. Great for detox salads and summer cooling.' 
  },
  { 
    id: 'p6', 
    name: 'Organic Green Broccoli', 
    weight: '1 Pc (400g)', 
    category: 'exotic', 
    priceInstant: 85, 
    priceMorning: 65, 
    oldPrice: 105, 
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
    emoji: '🥦',
    tag: 'Organic', 
    discount: '24% OFF',
    origin: 'Himalayan Organic Belts', 
    description: 'Dense green vitamin-rich broccoli florets. Superfood for immune boosting.' 
  },
  { 
    id: 'p7', 
    name: 'Weekly Salad Tokri Box', 
    weight: '2.5 kg Box', 
    category: 'combos', 
    priceInstant: 299, 
    priceMorning: 229, 
    oldPrice: 380, 
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    emoji: '🥗',
    tag: 'Super Saver', 
    discount: '23% OFF',
    origin: 'Fresh Tokri Custom Combo', 
    description: 'Curated box containing Tomatoes, Cucumbers, Onions, Carrots, and Green Chillies.' 
  },
  { 
    id: 'p8', 
    name: 'Fresh Alphonso Mangoes', 
    weight: '1 kg', 
    category: 'fruits', 
    priceInstant: 250, 
    priceMorning: 195, 
    oldPrice: 320, 
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
    emoji: '🥭',
    tag: 'Seasonal', 
    discount: '22% OFF',
    origin: 'Ratnagiri Geographical Indication Farms', 
    description: 'King of Mangoes. Aromatic, rich saffron pulp with heavenly sweetness.' 
  },
  { 
    id: 'p9', 
    name: 'Nasik Red Onions', 
    weight: '1 kg', 
    category: 'vegetables', 
    priceInstant: 35, 
    priceMorning: 28, 
    oldPrice: 42, 
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=400&q=80',
    emoji: '🧅',
    tag: 'Staple', 
    discount: '20% OFF',
    origin: 'Nasik Direct Mandi Sourced', 
    description: 'Pungent, crisp red onions. Essential staple for all Indian cooking recipes.' 
  },
  { 
    id: 'p10', 
    name: 'Fresh Yellow Potatoes', 
    weight: '1 kg', 
    category: 'vegetables', 
    priceInstant: 32, 
    priceMorning: 24, 
    oldPrice: 40, 
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    emoji: '🥔',
    tag: 'Fresh Batch', 
    discount: '25% OFF',
    origin: 'Jalandhar Agri Farms', 
    description: 'Firm skin, low moisture potatoes. Ideal for boiling, frying, and roasting.' 
  }
];

const initialState = {
  productsList: mockProducts,
  activeCategory: 'all',
  searchQuery: '',
  selectedProduct: null,
  isDetailsModalOpen: false,
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    openProductDetails: (state, action) => {
      state.selectedProduct = action.payload;
      state.isDetailsModalOpen = true;
    },
    closeProductDetails: (state) => {
      state.selectedProduct = null;
      state.isDetailsModalOpen = false;
    },
  },
});

export const {
  setActiveCategory,
  setSearchQuery,
  openProductDetails,
  closeProductDetails,
} = productsSlice.actions;

export const selectAllProducts = (state) => state.products.productsList;
export const selectActiveCategory = (state) => state.products.activeCategory;
export const selectSearchQuery = (state) => state.products.searchQuery;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectIsDetailsModalOpen = (state) => state.products.isDetailsModalOpen;

export const selectFilteredProducts = (state) => {
  const { productsList, activeCategory, searchQuery } = state.products;
  return productsList.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
};

export default productsSlice.reducer;

