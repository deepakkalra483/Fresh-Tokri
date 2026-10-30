import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedProduct, selectIsDetailsModalOpen, closeProductDetails } from '../../features/products/productsSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { selectCartItems, addToCart, removeFromCart } from '../../features/cart/cartSlice';
import { X, Heart, Plus, Minus } from 'lucide-react';

export default function ProductDetailsModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsDetailsModalOpen);
  const product = useSelector(selectSelectedProduct);
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);

  const [isFav, setIsFav] = useState(false);

  if (!isOpen || !product) return null;

  const qty = cartItems[product.id] || 0;
  const price = currentMode === 'instant' ? product.priceInstant : product.priceMorning;
  const oldPrice = product.oldPrice || (currentMode === 'morning' ? product.priceInstant : null);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.78)', backdropFilter: 'blur(3px)' }}
      onClick={() => dispatch(closeProductDetails())}
    >
      <div
        className="bg-white rounded-t-3xl shadow-2xl max-w-[412px] mx-auto w-full flex flex-col"
        style={{ maxHeight: '82dvh' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Sticky header ── */}
        <div className="flex-shrink-0 bg-white rounded-t-3xl px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Product Details
          </span>
          {/* Prominent close button — dark, large, always visible */}
          <button
            onClick={() => dispatch(closeProductDetails())}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-700 active:scale-90 flex items-center justify-center text-white shadow-md transition-all"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* Hero Image Section */}
          <div className="px-6 py-4 bg-gradient-to-b from-slate-50 to-white flex flex-col items-center relative">
            <button
              onClick={() => setIsFav(!isFav)}
              className="absolute top-2 right-6 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Heart size={18} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
            </button>

            {/* Hero Image */}
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 relative mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Emoji fallback */}
              <div className="hidden absolute inset-0 items-center justify-center text-7xl bg-emerald-50 select-none">
                {product.emoji || '🥦'}
              </div>
            </div>

            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${currentMode === 'morning' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
              {product.tag} • {currentMode === 'morning' ? 'SAVE 20%' : 'INSTANT DELIVERY'}
            </span>
          </div>

          {/* Info Content */}
          <div className="px-5 space-y-3.5 pb-8">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">{product.weight}</p>
            </div>

            {/* Pricing Row */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-slate-900">₹{price}</span>
                  {oldPrice && (
                    <span className="text-xs text-slate-400 line-through">₹{oldPrice}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {currentMode === 'morning' ? '🌅 Farm Direct Sourced Price' : '⚡ Darkstore Instant Price'}
                </p>
              </div>

              {qty === 0 ? (
                <button
                  onClick={() => dispatch(addToCart(product.id))}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
                >
                  + ADD TO TOKRI
                </button>
              ) : (
                <div className="flex items-center bg-emerald-600 text-white rounded-xl text-xs font-bold px-3 py-1.5 gap-3 shadow">
                  <button
                    onClick={() => dispatch(removeFromCart(product.id))}
                    className="px-1 hover:opacity-75 active:scale-90 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-extrabold text-sm">{qty}</span>
                  <button
                    onClick={() => dispatch(addToCart(product.id))}
                    className="px-1 hover:opacity-75 active:scale-90 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Quality & Origin */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Freshness & Origin</h3>
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">🥬</span>
                <div>
                  <p className="text-xs font-extrabold text-emerald-900">Direct from Sabzi Mandi</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    Farm-picked daily · Delivered fresh to your door
                  </p>
                </div>
              </div>
            </div>

            {/* Description — only shown if product has one */}
            {product.description && product.description.trim() && (
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">About</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
