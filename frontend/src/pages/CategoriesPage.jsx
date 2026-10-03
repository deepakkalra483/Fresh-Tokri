import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDeliveryMode } from '../features/deliveryMode/deliveryModeSlice';
import { selectCartItems, addToCart, removeFromCart } from '../features/cart/cartSlice';
import { selectAllProducts, openProductDetails } from '../features/products/productsSlice';
import { selectCategories } from '../features/categories/categoriesSlice';
import { Heart, Plus, Minus, ChevronLeft, ShoppingBag, Package } from 'lucide-react';



export default function CategoriesPage({ onBackToHome }) {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);
  const allProducts = useSelector(selectAllProducts);
  const rawCategories = useSelector(selectCategories);

  // Prepend 'All Items' to the dynamic categories
  const sidebarCategories = useMemo(() => [
    { id: 'all', label: 'All Items', icon: '🛒' },
    ...rawCategories,
  ], [rawCategories]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter products from Redux (Firestore data) by selected category
  const currentProducts = useMemo(() => {
    if (activeCategory === 'all') return allProducts;
    return allProducts.filter(p => p.category === activeCategory);
  }, [allProducts, activeCategory]);

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
        <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">Shop by Category</h1>
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-700 border border-emerald-200">
          {currentProducts.length}
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar — category tabs */}
        <aside className="w-24 bg-white border-r border-slate-200/80 overflow-y-auto custom-scrollbar flex-shrink-0 py-2">
          {sidebarCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            // Count items in this category from Firestore data
            const count = cat.id === 'all'
              ? allProducts.length
              : allProducts.filter(p => p.category === cat.id).length;
            if (count === 0 && cat.id !== 'all') return null; // hide empty categories
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
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                )}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-2xs ${
                  isActive ? 'bg-emerald-100 border border-emerald-300' : 'bg-slate-100'
                }`}>
                  {cat.icon}
                </div>
                <span className="text-[9px] leading-tight max-w-[80px] break-words">{cat.label}</span>
                <span className={`text-[8px] font-bold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Right Main Grid */}
        <main className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {currentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 space-y-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <Package size={24} className="text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-500">No items in this category</p>
              <p className="text-[10px] text-slate-400">Check back soon or try another category</p>
            </div>
          ) : (
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
                      {/* Compact Image */}
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

                        {/* Discount badge */}
                        {p.discount && (
                          <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-md border border-white/20">
                            {p.discount}
                          </div>
                        )}

                        {/* Heart */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 backdrop-blur-xs shadow-2xs flex items-center justify-center"
                        >
                          <Heart
                            size={11}
                            className={isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
                          />
                        </button>
                      </div>

                      {/* Weight tag */}
                      <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-bold text-[9px] px-1.5 py-0.5 rounded">
                        <span>⚖️ {p.weight}</span>
                      </div>

                      {/* Name */}
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
                          onClick={(e) => { e.stopPropagation(); dispatch(addToCart(p.id)); }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-2xs transition flex items-center gap-0.5 active:scale-95"
                        >
                          <ShoppingBag size={10} />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center bg-emerald-600 text-white rounded-xl text-[10px] font-bold px-1.5 py-0.5 gap-1 shadow-2xs">
                          <button onClick={(e) => { e.stopPropagation(); dispatch(removeFromCart(p.id)); }} className="px-0.5 hover:opacity-75">
                            <Minus size={10} />
                          </button>
                          <span className="text-[10px] font-extrabold">{qty}</span>
                          <button onClick={(e) => { e.stopPropagation(); dispatch(addToCart(p.id)); }} className="px-0.5 hover:opacity-75">
                            <Plus size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
