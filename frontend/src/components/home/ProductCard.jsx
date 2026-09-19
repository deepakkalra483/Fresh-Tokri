import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { selectCartItems, addToCart, removeFromCart } from '../../features/cart/cartSlice';
import { openProductDetails } from '../../features/products/productsSlice';
import { Plus, Minus, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);

  const qty = cartItems[product.id] || 0;
  const price = currentMode === 'instant' ? product.priceInstant : product.priceMorning;
  const oldPrice = product.oldPrice || (currentMode === 'morning' ? product.priceInstant : null);

  return (
    <div className="bg-white rounded-2xl p-2 shadow-2xs border border-slate-200/70 flex flex-col justify-between relative hover:shadow-xs transition-all group">
      
      {/* Clickable Area */}
      <div 
        onClick={() => dispatch(openProductDetails(product))}
        className="cursor-pointer space-y-1"
      >
        {/* Compact Produce Image Container */}
        <div className="h-24 sm:h-28 w-full rounded-xl overflow-hidden bg-slate-100 relative border border-slate-100">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden inset-0 w-full h-full items-center justify-center text-3xl bg-emerald-50 select-none">
            {product.emoji || '🥦'}
          </div>

          {/* Top-Left Overlay Discount Badge */}
          <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-[8px] px-1.5 py-0.2 rounded-md border border-white/20">
            {currentMode === 'morning' ? '20% OFF' : (product.discount || 'FRESH')}
          </div>
        </div>

        {/* Quantity / Weight Pill Tag */}
        <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-bold text-[9px] px-1.5 py-0.2 rounded">
          <span>⚖️ {product.weight}</span>
        </div>

        {/* Compact Title */}
        <h3 
          className="text-[11px] font-extrabold text-slate-900 leading-tight truncate group-hover:text-emerald-600 transition-colors" 
          title={product.name}
        >
          {product.name}
        </h3>
      </div>

      {/* Price & Buy Button (Tight Spacing) */}
      <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between">
        <div onClick={() => dispatch(openProductDetails(product))} className="cursor-pointer">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-extrabold text-slate-900">₹{price}</span>
            {oldPrice && (
              <span className="text-[8px] text-slate-400 line-through">₹{oldPrice}</span>
            )}
          </div>
        </div>

        {qty === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(addToCart(product.id));
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-2xs transition flex items-center gap-0.5 active:scale-95"
          >
            <ShoppingBag size={10} />
            <span>Add</span>
          </button>
        ) : (
          <div className="flex items-center bg-emerald-600 text-white rounded-xl text-[10px] font-bold px-1.5 py-0.5 gap-1 shadow-2xs">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                dispatch(removeFromCart(product.id));
              }}
              className="px-0.5 hover:opacity-75"
            >
              <Minus size={10} />
            </button>
            <span className="text-[10px] font-extrabold">{qty}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                dispatch(addToCart(product.id));
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
}
