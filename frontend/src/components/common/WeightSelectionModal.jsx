import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectWeightModalProduct,
  closeWeightModal,
  addVariantToCart,
  selectCartItems,
  removeFromCart,
  removeProductCompletely,
} from '../../features/cart/cartSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import {
  isPieceBasedProduct,
  getAvailableVariants,
  calculateVariantPrice,
  getBaseGrams,
  getBasePieceCount,
} from '../../utils/weightHelper';
import { X, Check, Plus, Minus, Trash2, Scale, Package } from 'lucide-react';

export default function WeightSelectionModal() {
  const dispatch = useDispatch();
  const product = useSelector(selectWeightModalProduct);
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState(500); // grams or piece count
  const [quantity, setQuantity] = useState(1);

  const isOpen = Boolean(product);
  const isPiece = product ? isPieceBasedProduct(product.weight) : false;

  // Active price based on delivery mode
  const basePrice = product
    ? currentMode === 'instant'
      ? product.priceInstant
      : product.priceMorning
    : 0;

  // When a product opens, initialize default variant and quantity
  useEffect(() => {
    if (product) {
      const variants = getAvailableVariants(product, basePrice);
      // Try to find if user already has this product in cart
      const existingEntries = Object.entries(cartItems).filter(([k, val]) => {
        return val?.id === product.id || k === product.id || k.startsWith(`${product.id}_`);
      });

      if (existingEntries.length > 0) {
        const [firstKey, firstVal] = existingEntries[0];
        const existingWeight = typeof firstVal === 'object' ? firstVal.selectedWeight : product.weight;
        const existingQty = typeof firstVal === 'object' ? firstVal.quantity : firstVal;
        
        const matched = variants.find((v) => v.weight === existingWeight);
        if (matched) {
          setSelectedVariant(matched);
          setIsCustom(false);
        } else {
          // Custom weight was saved
          setIsCustom(true);
          const grams = isPieceBasedProduct(existingWeight)
            ? getBasePieceCount(existingWeight)
            : getBaseGrams(existingWeight);
          setCustomValue(grams);
        }
        setQuantity(existingQty > 0 ? existingQty : 1);
      } else {
        // Default to product's own weight or first 500gm/1kg
        const defaultMatch =
          variants.find((v) => v.weight === product.weight) ||
          variants.find((v) => v.weight === '500 gm' || v.weight === '1 pc') ||
          variants[0];
        setSelectedVariant(defaultMatch || variants[0]);
        setIsCustom(false);
        setCustomValue(isPiece ? 1 : 500);
        setQuantity(1);
      }
    }
  }, [product, basePrice]);

  if (!isOpen || !product) return null;

  const variants = getAvailableVariants(product, basePrice);

  // Compute price for currently selected variant or custom
  let currentSelectedWeight = '';
  let unitPrice = 0;

  if (isCustom) {
    if (isPiece) {
      const count = Math.max(1, parseInt(customValue, 10) || 1);
      currentSelectedWeight = `${count} ${count > 1 ? 'pcs' : 'pc'}`;
      unitPrice = calculateVariantPrice(basePrice, product.weight, currentSelectedWeight, product.marketPrice1Kg);
    } else {
      const grams = Math.max(50, parseInt(customValue, 10) || 500);
      currentSelectedWeight = grams >= 1000 && grams % 1000 === 0 ? `${grams / 1000} kg` : `${grams} gm`;
      unitPrice = calculateVariantPrice(basePrice, product.weight, currentSelectedWeight, product.marketPrice1Kg);
    }
  } else if (selectedVariant) {
    currentSelectedWeight = selectedVariant.weight;
    unitPrice = selectedVariant.price;
  }

  const totalPrice = unitPrice * quantity;

  // Check if this product already exists in the cart (with any weight variant)
  const isProductInCart = Object.keys(cartItems).some(
    (k) => cartItems[k]?.id === product.id || k === product.id || k.startsWith(`${product.id}_`)
  );

  const handleSelectPreset = (v) => {
    setSelectedVariant(v);
    setIsCustom(false);
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setSelectedVariant(null);
    if (!customValue) {
      setCustomValue(isPiece ? 1 : 500);
    }
  };

  const adjustCustomValue = (delta) => {
    if (isPiece) {
      setCustomValue((prev) => Math.max(1, (parseInt(prev, 10) || 1) + delta));
    } else {
      setCustomValue((prev) => Math.max(100, (parseInt(prev, 10) || 500) + delta));
    }
  };

  const handleAddToCart = () => {
    // Clear any previous size/weight of this product so it replaces cleanly with the newly selected weight
    dispatch(removeProductCompletely(product.id));
    dispatch(
      addVariantToCart({
        product,
        selectedWeight: currentSelectedWeight,
        unitPrice,
        quantity,
      })
    );
    dispatch(closeWeightModal());
  };

  const handleRemoveProduct = () => {
    dispatch(removeProductCompletely(product.id));
    dispatch(closeWeightModal());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch(closeWeightModal())}
    >
      <div
        className="bg-white rounded-t-3xl shadow-2xl max-w-[420px] mx-auto w-full flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        style={{ maxHeight: '88dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isPiece ? (
              <Package size={16} className="text-emerald-600" />
            ) : (
              <Scale size={16} className="text-emerald-600" />
            )}
            <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
              Select {isPiece ? 'Quantity' : 'Weight / Size'}
            </span>
          </div>
          <button
            onClick={() => dispatch(closeWeightModal())}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-600 transition"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Product Mini Header */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200/60 flex-shrink-0"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100';
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded leading-none">
                {product.category || 'Fresh'}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 truncate mt-1">
                {product.name}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Base: ₹{basePrice} / {product.weight}
              </p>
            </div>
          </div>

          {/* Preset Variant Selection */}
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
              Available Options
            </label>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v) => {
                const isSelected = !isCustom && selectedVariant?.weight === v.weight;
                return (
                  <button
                    key={v.weight}
                    type="button"
                    onClick={() => handleSelectPreset(v)}
                    className={`relative p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{v.weight}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-sm font-extrabold text-emerald-700">₹{v.price}</span>
                      {currentMode === 'morning' && (
                        <span className="text-[9px] text-slate-400 font-medium">20% off</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Custom Variant Button */}
              <button
                type="button"
                onClick={handleCustomToggle}
                className={`col-span-2 p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                  isCustom
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                    : 'border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">
                      Custom {isPiece ? 'Count' : 'Weight'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      (Enter exact amount)
                    </span>
                  </div>
                  {isCustom && (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Custom Weight / Count Controls (Shown only if isCustom) */}
          {isCustom && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {isPiece ? 'Specify Pieces:' : 'Specify Grams:'}
                </span>
                <span className="text-xs font-black text-emerald-700">
                  Calculated: ₹{unitPrice}
                </span>
              </div>

              {isPiece ? (
                /* Piece custom counter */
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustCustomValue(-1)}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 shadow-xs"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="text-center">
                    <span className="text-lg font-black text-slate-900">{customValue}</span>
                    <span className="text-xs font-bold text-slate-500 ml-1">pcs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustCustomValue(1)}
                    className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center active:scale-95 shadow-xs"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                /* Weight custom controls */
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => adjustCustomValue(-250)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-700 active:scale-95 shadow-2xs"
                    >
                      -250g
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustCustomValue(-100)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-700 active:scale-95 shadow-2xs"
                    >
                      -100g
                    </button>
                    <div className="px-3 py-1 bg-white border border-emerald-400 rounded-xl text-center min-w-[90px] shadow-xs">
                      <span className="text-base font-black text-slate-900">{customValue}</span>
                      <span className="text-xs font-bold text-slate-500 ml-1">gm</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => adjustCustomValue(100)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-700 active:scale-95 shadow-2xs"
                    >
                      +100g
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustCustomValue(250)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-700 active:scale-95 shadow-2xs"
                    >
                      +250g
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity Stepper (Packs/Units) */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Number of Packs</span>
              <span className="text-[10px] text-slate-500">
                {currentSelectedWeight} × {quantity}
              </span>
            </div>

            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition"
              >
                <Minus size={13} />
              </button>
              <span className="w-10 text-center text-sm font-black text-slate-900 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center active:scale-95 transition"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
          {/* If already in cart, offer quick remove button */}
          {isProductInCart && (
            <button
              type="button"
              onClick={handleRemoveProduct}
              className="w-12 h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center active:scale-95 transition flex-shrink-0"
              title="Remove from basket"
            >
              <Trash2 size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-between px-4 transition"
          >
            <span>{isProductInCart ? 'Update Basket' : 'Add to Basket'}</span>
            <span className="bg-emerald-800/50 px-2.5 py-1 rounded-xl text-xs font-black tracking-wide">
              ₹{totalPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
