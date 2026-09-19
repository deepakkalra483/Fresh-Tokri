import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedProduct, selectIsDetailsModalOpen, closeProductDetails } from '../../features/products/productsSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { selectCartItems, addToCart, removeFromCart } from '../../features/cart/cartSlice';
import { X, Heart, ShieldCheck, Truck, Sprout, Plus, Minus, ArrowRight, Zap } from 'lucide-react';

export default function ProductDetailsModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsDetailsModalOpen);
  const product = useSelector(selectSelectedProduct);
  const currentMode = useSelector(selectDeliveryMode);
  const cartItems = useSelector(selectCartItems);

  const [isFav, setIsFav] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);

  if (!isOpen || !product) return null;

  const qty = cartItems[product.id] || 0;
  const price = currentMode === 'instant' ? product.priceInstant : product.priceMorning;
  const oldPrice = product.oldPrice || (currentMode === 'morning' ? product.priceInstant : null);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end transition-opacity">
      <div className="bg-white rounded-t-3xl max-h-[90%] overflow-y-auto space-y-4 shadow-2xl max-w-[412px] mx-auto w-full relative">
        
        {/* Top Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100 z-10">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Product Details</span>
          <button 
            onClick={() => dispatch(closeProductDetails())}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero Image Section */}
        <div className="px-6 py-4 bg-gradient-to-b from-slate-50 to-white flex flex-col items-center relative">
          <button 
            onClick={() => setIsFav(!isFav)}
            className="absolute top-2 right-6 w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-slate-400 hover:text-rose-500"
          >
            <Heart size={18} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
          </button>

          <div className="text-7xl select-none py-2 my-2 animate-bounce-short">
            {product.image}
          </div>

          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
            currentMode === 'morning' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {product.tag} • {currentMode === 'morning' ? 'SAVE 20%' : '15 MIN EXPRESS'}
          </span>
        </div>

        {/* Info Content */}
        <div className="px-5 space-y-3.5">
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition"
              >
                + ADD TO TOKRI
              </button>
            ) : (
              <div className="flex items-center bg-emerald-600 text-white rounded-xl text-xs font-bold px-3 py-1.5 gap-3 shadow-2xs">
                <button 
                  onClick={() => dispatch(removeFromCart(product.id))}
                  className="px-1 hover:opacity-75"
                >
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-sm">{qty}</span>
                <button 
                  onClick={() => dispatch(addToCart(product.id))}
                  className="px-1 hover:opacity-75"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Farm Sourcing & Quality Highlights */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Quality Assurance</h3>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 font-semibold">
                <Sprout size={16} className="text-emerald-600 flex-shrink-0" />
                <span>100% Farm Fresh</span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 font-semibold">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Zero Pesticides</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-600" />
                <span>Source Origin:</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium pl-5">{product.origin}</p>
            </div>
          </div>

          {/* Description */}
          <div className="pb-6 space-y-1">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">About Produce</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

