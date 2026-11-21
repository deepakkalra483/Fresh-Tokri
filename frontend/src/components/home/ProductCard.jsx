import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import {
  selectCartItems,
  openWeightModal,
  removeProductCompletely,
} from '../../features/cart/cartSlice';
import { openProductDetails } from '../../features/products/productsSlice';
import { Plus, Trash2, SlidersHorizontal } from 'lucide-react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);

  // Find all cart entries for this product
  const productCartEntries = Object.entries(cartItems).filter(([k, val]) => {
    return val?.id === product.id || k === product.id || k.startsWith(`${product.id}_`);
  });

  const totalQty = productCartEntries.reduce((sum, [_, val]) => {
    const q = typeof val === 'number' ? val : (val?.quantity || 0);
    return sum + q;
  }, 0);

  const firstEntry = productCartEntries[0];
  const firstVariantWeight =
    firstEntry && typeof firstEntry[1] === 'object'
      ? firstEntry[1].selectedWeight
      : null;

  const price = currentMode === 'instant' ? product.priceInstant : product.priceMorning;
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
          {firstVariantWeight ? `Added: ${firstVariantWeight}` : product.weight}
        </span>

        {/* Product name */}
        <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight truncate group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        {/* Price row + Add / Change / Remove button */}
        <div className="flex items-center justify-between mt-0.5" onClick={(e) => e.stopPropagation()}>
          <div>
            <span className="text-xs font-extrabold text-slate-900">₹{price}</span>
            {oldPrice && (
              <span className="text-[9px] text-slate-400 line-through ml-1">₹{oldPrice}</span>
            )}
          </div>

          {totalQty === 0 ? (
            <button
              onClick={() => dispatch(openWeightModal(product))}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-0.5"
            >
              <Plus size={10} />
              Add
            </button>
          ) : (
            /* When in cart, show Change Size button + Remove button */
            <div className="flex items-center gap-1">
              <button
                onClick={() => dispatch(openWeightModal(product))}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[9px] font-black px-1.5 py-1 flex items-center gap-0.5 shadow-2xs active:scale-95 transition"
                title="Change size or quantity"
              >
                <span>{firstVariantWeight ? firstVariantWeight : `${totalQty} Added`}</span>
                <SlidersHorizontal size={8} />
              </button>

              <button
                onClick={() => dispatch(removeProductCompletely(product.id))}
                className="w-5 h-5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center transition active:scale-90"
                title="Remove from cart"
              >
                <Trash2 size={10} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
