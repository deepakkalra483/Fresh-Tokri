import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDeliveryMode } from '../features/deliveryMode/deliveryModeSlice';
import { selectCartItems, addToCart, removeFromCart } from '../features/cart/cartSlice';
import { openProductDetails } from '../features/products/productsSlice';
import { Search, Heart, Plus, Minus, ChevronLeft, ShoppingBag } from 'lucide-react';

const sidebarCategories = [
  { id: 'vegetables', label: 'Fresh Vegetables', icon: '🥬' },
  { id: 'fruits', label: 'Fresh Fruits', icon: '🍎' },
  { id: 'seasonal', label: 'Seasonal', icon: '🍌' },
  { id: 'exotics', label: 'Exotics', icon: '🥑' },
  { id: 'sprouts', label: 'Sprouts', icon: '🥗' },
  { id: 'leafies', label: 'Leafies & Herbs', icon: '🌿' },
  { id: 'flowers', label: 'Flowers & Leaves', icon: '🥦' },
];

const categoryProductsData = {
  vegetables: [
    { id: 'c1', name: 'Hybrid Tomato (Tamatar)', weight: '500 g', priceInstant: 20, priceMorning: 16, oldPrice: 24, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', emoji: '🍅' },
    { id: 'c2', name: 'Lady Finger (Bhindi)', weight: '250 g', priceInstant: 25, priceMorning: 18, oldPrice: 30, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80', emoji: '🧅' },
    { id: 'c3', name: 'Green Chilli (Hari Mirch)', weight: '500 g', priceInstant: 15, priceMorning: 12, oldPrice: 18, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', emoji: '🌶️' },
    { id: 'c4', name: 'Cluster Beans (Gawar Phali)', weight: '250 g', priceInstant: 32, priceMorning: 25, oldPrice: 38, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', emoji: '🥦' },
    { id: 'c5', name: 'Cabbage (Patta Gobhi)', weight: '500 g', priceInstant: 22, priceMorning: 18, oldPrice: 26, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', emoji: '🥬' },
    { id: 'c6', name: 'Capsicum (Shimla Mirch)', weight: '250 g', priceInstant: 28, priceMorning: 22, oldPrice: 35, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80', emoji: '𫃁' },
    { id: 'c7', name: 'Baby Potato (Chota Aloo)', weight: '500 g', priceInstant: 30, priceMorning: 24, oldPrice: 36, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', emoji: '🥔' },
    { id: 'c8', name: 'Green Peas (Matar)', weight: '250 g', priceInstant: 35, priceMorning: 28, oldPrice: 42, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', emoji: '𫃁' },
  ],
  fruits: [
    { id: 'f1', name: 'Shimla Red Apples', weight: '500 g', priceInstant: 90, priceMorning: 70, oldPrice: 110, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', emoji: '🍎' },
    { id: 'f2', name: 'Robusta Bananas', weight: '1 Dozen', priceInstant: 60, priceMorning: 48, oldPrice: 70, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', emoji: '🍌' },
    { id: 'f3', name: 'Alphonso Mangoes', weight: '1 kg', priceInstant: 250, priceMorning: 195, oldPrice: 280, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80', emoji: '🥭' },
    { id: 'f4', name: 'Sweet Oranges (Mosambi)', weight: '1 kg', priceInstant: 80, priceMorning: 62, oldPrice: 95, image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&q=80', emoji: '🍊' },
  ],
  seasonal: [
    { id: 's1', name: 'Fresh Watermelon', weight: '1 Pc (2kg)', priceInstant: 60, priceMorning: 48, oldPrice: 75, image: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?w=400&q=80', emoji: '🍉' },
    { id: 's2', name: 'Custard Apple (Sitaphal)', weight: '500 g', priceInstant: 120, priceMorning: 95, oldPrice: 140, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', emoji: '🍏' },
  ],
  exotics: [
    { id: 'e1', name: 'Hass Avocado', weight: '1 Pc', priceInstant: 140, priceMorning: 110, oldPrice: 160, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80', emoji: '🥑' },
    { id: 'e2', name: 'Organic Broccoli', weight: '400 g', priceInstant: 85, priceMorning: 65, oldPrice: 100, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', emoji: '🥦' },
  ],
  sprouts: [
    { id: 'sp1', name: 'Mixed Beans Sprout', weight: '200 g', priceInstant: 30, priceMorning: 24, oldPrice: 35, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', emoji: '🥗' },
  ],
  leafies: [
    { id: 'l1', name: 'Fresh Coriander (Dhania)', weight: '100 g', priceInstant: 15, priceMorning: 10, oldPrice: 20, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', emoji: '🌿' },
    { id: 'l2', name: 'Fresh Mint (Pudina)', weight: '100 g', priceInstant: 12, priceMorning: 9, oldPrice: 15, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', emoji: '🍃' },
  ],
  flowers: [
    { id: 'fl1', name: 'Cauliflower (Gobi)', weight: '1 Pc (500g)', priceInstant: 35, priceMorning: 26, oldPrice: 42, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', emoji: '🥦' },
  ]
};

export default function CategoriesPage({ onBackToHome }) {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);

  const [activeCategory, setActiveCategory] = useState('vegetables');
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentProducts = categoryProductsData[activeCategory] || categoryProductsData['vegetables'];

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-28">
      
      {/* Header */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <button 
          onClick={onBackToHome}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">Vegetables & Fruits</h1>
        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200">
          <Search size={16} />
        </button>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-24 bg-white border-r border-slate-200/80 overflow-y-auto custom-scrollbar flex-shrink-0 py-2">
          {sidebarCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full py-2.5 px-1.5 flex flex-col items-center gap-1 text-center relative transition-all ${
                  isActive
                    ? 'bg-emerald-50/80 text-emerald-800 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full"></span>
                )}
                
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-2xs ${
                  isActive ? 'bg-emerald-100 border border-emerald-300' : 'bg-slate-100'
                }`}>
                  {cat.icon}
                </div>
                <span className="text-[10px] leading-tight max-w-[80px] break-words">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Right Main Grid (Compact Cards) */}
        <main className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            {currentProducts.map((p) => {
              const qty = cartItems[p.id] || 0;
              const price = currentMode === 'instant' ? p.priceInstant : p.priceMorning;
              const isFav = favorites[p.id];

              return (
                <div 
                  key={p.id}
                  className="bg-white rounded-2xl p-2 shadow-2xs border border-slate-200/70 flex flex-col justify-between relative hover:shadow-xs transition-all group"
                >
                  <div 
                    onClick={() => dispatch(openProductDetails(p))}
                    className="cursor-pointer space-y-1"
                  >
                    {/* Compact Image Container */}
                    <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-100 relative border border-slate-100">
                      <img 
                        src={p.image} 
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden inset-0 w-full h-full items-center justify-center text-2xl bg-emerald-50 select-none">
                        {p.emoji || '🥬'}
                      </div>

                      {/* Heart Icon */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(p.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 backdrop-blur-xs shadow-2xs flex items-center justify-center text-slate-400 hover:text-rose-500"
                      >
                        <Heart 
                          size={11} 
                          className={isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} 
                        />
                      </button>
                    </div>

                    {/* Weight tag */}
                    <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-bold text-[9px] px-1.5 py-0.2 rounded">
                      <span>⚖️ {p.weight}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight truncate">
                      {p.name}
                    </h3>
                  </div>

                  {/* Price & Add */}
                  <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">₹{price}</div>
                      {p.oldPrice && (
                        <div className="text-[8px] text-slate-400 line-through">₹{p.oldPrice}</div>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(addToCart(p.id));
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-2xs transition flex items-center gap-0.5"
                      >
                        <ShoppingBag size={10} />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-emerald-600 text-white rounded-xl text-[10px] font-bold px-1.5 py-0.5 gap-1 shadow-2xs">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeFromCart(p.id));
                          }}
                          className="px-0.5 hover:opacity-75"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-[10px] font-extrabold">{qty}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToCart(p.id));
                          }}
                          className="px-0.5 hover:opacity-75"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </main>

      </div>
    </div>
  );
}
