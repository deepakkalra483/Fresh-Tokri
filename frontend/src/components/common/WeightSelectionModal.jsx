import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectWeightModalProduct,
  closeWeightModal,
  addVariantToCart,
  selectCartItems,
  removeProductCompletely,
} from '../../features/cart/cartSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { getAvailableVariants } from '../../utils/weightHelper';
import { X } from 'lucide-react';

export default function WeightSelectionModal() {
  const dispatch = useDispatch();
  const product = useSelector(selectWeightModalProduct);
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);

  if (!product) return null;

  // Active price based on delivery mode
  const basePrice =
    currentMode === 'instant' ? product.priceInstant : product.priceMorning;

  const variants = getAvailableVariants(product, basePrice);

  // Find if this product currently has an active weight in cart
  const existingEntries = Object.entries(cartItems).filter(([k, val]) => {
    return val?.id === product.id || k === product.id || k.startsWith(`${product.id}_`);
  });
  const currentActiveWeight =
    existingEntries.length > 0 && typeof existingEntries[0][1] === 'object'
      ? existingEntries[0][1].selectedWeight
      : null;

  const handleSelectWeight = (variant) => {
    // 1-Tap set: Clear previous weight and set the newly clicked weight immediately
    dispatch(removeProductCompletely(product.id));
    dispatch(
      addVariantToCart({
        product,
        selectedWeight: variant.weight,
        unitPrice: variant.price,
        quantity: 1,
      })
    );
    dispatch(closeWeightModal());
  };

  const handleRemove = () => {
    dispatch(removeProductCompletely(product.id));
    dispatch(closeWeightModal());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
      onClick={() => dispatch(closeWeightModal())}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] p-3 border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="min-w-0 pr-2">
            <h3 className="text-xs font-black text-slate-900 truncate">
              {product.name}
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold">
              Select weight / size
            </p>
          </div>
          <button
            onClick={() => dispatch(closeWeightModal())}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition flex-shrink-0"
            aria-label="Close"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* 4 Weights Horizontal Row */}
        <div className="grid grid-cols-4 gap-1.5">
          {variants.map((v) => {
            const isSelected = currentActiveWeight === v.weight;
            return (
              <button
                key={v.weight}
                type="button"
                onClick={() => handleSelectWeight(v)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all active:scale-95 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50/70 hover:border-emerald-400 hover:bg-white text-slate-800'
                }`}
              >
                <span className="text-[10.5px] font-black leading-tight">
                  {v.weight}
                </span>
                <span className="text-xs font-black text-emerald-700 mt-1">
                  ₹{v.price}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subtle remove link if already in cart */}
        {existingEntries.length > 0 && (
          <div className="text-center pt-2 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRemove}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition hover:underline"
            >
              Remove from basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
