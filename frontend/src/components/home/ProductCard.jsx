import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { selectCartItems, addToCart, removeFromCart } from '../../features/cart/cartSlice';
import { openProductDetails } from '../../features/products/productsSlice';
import { Plus, Minus } from 'lucide-react';

export default function ProductCard({ product }) {
  const dispatch    = useDispatch();
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems   = useSelector(selectCartItems);

  const qty      = cartItems[product.id] || 0;
  const price    = currentMode === 'instant' ? product.priceInstant : product.priceMorning;
  const oldPrice = currentMode === 'morning' ? product.priceInstant : null;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/70 flex flex-col overflow-hidden hover:shadow-sm transition-all group">

      {/* ── Image section ── */}
      <div
        className="relative w-full overflow-hidden bg-slate-100"
        style={{ height: '96px' }}
        onClick={() => dispatch(openProductDetails(product))}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback emoji */}
        <div className="hidden absolute inset-0 items-center justify-center text-4xl bg-emerald-50 select-none">
          {product.emoji || '🥦'}
        </div>

        {/* Top-left: Discount / Fresh badge */}
        <div className="absolute top-1.5 left-1.5 bg-slate-900/75 backdrop-blur-sm text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-md border border-white/20 leading-none">
          {currentMode === 'morning' ? '20% OFF' : (product.discount || 'FRESH')}
        </div>

      </div>

      {/* ── Info + buy section ── */}
      <div
        className="p-1.5 flex flex-col gap-1 cursor-pointer"
        onClick={() => dispatch(openProductDetails(product))}
      >
        {/* Weight pill */}
        <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded self-start leading-none">
          {product.weight}
        </span>

        {/* Product name */}
        <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight truncate group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        {/* Price row + Add button */}
        <div className="flex items-center justify-between mt-0.5" onClick={(e) => e.stopPropagation()}>
          <div>
            <span className="text-xs font-extrabold text-slate-900">₹{price}</span>
            {oldPrice && (
              <span className="text-[9px] text-slate-400 line-through ml-1">₹{oldPrice}</span>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={() => dispatch(addToCart(product.id))}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-0.5"
            >
              <Plus size={10} />
              Add
            </button>
          ) : (
            /* When in cart, show compact qty row here too (for quick tap) */
            <div className="flex items-center bg-emerald-600 text-white rounded-xl text-[10px] font-extrabold px-1.5 py-0.5 gap-1 shadow-xs">
              <button
                onClick={() => dispatch(removeFromCart(product.id))}
                className="hover:opacity-75 active:scale-90 transition-all"
              >
                <Minus size={10} />
              </button>
              <span className="min-w-[14px] text-center tabular-nums">{qty}</span>
              <button
                onClick={() => dispatch(addToCart(product.id))}
                className="hover:opacity-75 active:scale-90 transition-all"
              >
                <Plus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
