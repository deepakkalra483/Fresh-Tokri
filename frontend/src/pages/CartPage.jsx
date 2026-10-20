import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartTotals,
  addToCart,
  removeFromCart,
  openCheckout,
  clearCart
} from '../features/cart/cartSlice';
import { selectDeliveryMode } from '../features/deliveryMode/deliveryModeSlice';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Zap,
  Sun
} from 'lucide-react';

export default function CartPage({ onTabChange }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const mode = useSelector(selectDeliveryMode);
  const products = useSelector((state) => state.products.productsList);

  const cartProductList = Object.entries(cartItems)
    .map(([id, qty]) => {
      const p = products.find((prod) => prod.id === id);
      if (!p) return null;
      const unitPrice = mode === 'instant' ? p.priceInstant : p.priceMorning;
      return { ...p, qty, unitPrice };
    })
    .filter(Boolean);

  if (cartProductList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-[calc(100vh-140px)]">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
          <ShoppingCart size={36} />
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-1">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-6">
          Looks like you haven't added anything to your cart yet. Explore our fresh vegetables & fruits!
        </p>
        <button
          onClick={() => onTabChange('home')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <ShoppingBag size={15} /> Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 pb-24 space-y-3">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-3 shadow-xs">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Your Basket</h2>
          <p className="text-[11px] text-slate-500">
            {totals.totalQty} item{totals.totalQty > 1 ? 's' : ''} selected
          </p>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-slate-400 hover:text-rose-500 text-xs flex items-center gap-1 font-bold transition-colors"
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Mode Tag */}
      <div
        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-bold ${
          mode === 'instant'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        {mode === 'instant' ? (
          <>
            <Zap size={14} className="fill-rose-600 text-rose-600" />
            <span>Instant Delivery (15–20 mins)</span>
          </>
        ) : (
          <>
            <Sun size={14} className="fill-emerald-600 text-emerald-600" />
            <span>Next Morning Delivery (6–9 AM, 20% off)</span>
          </>
        )}
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {cartProductList.map((item) => (
          <div key={item.id} className="p-3 flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
              <p className="text-[10px] text-slate-400">{item.weight}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xs font-extrabold text-slate-900">
                  ₹{item.unitPrice * item.qty}
                </span>
                <span className="text-[10px] text-slate-400">
                  (₹{item.unitPrice} each)
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 flex-shrink-0">
              <button
                onClick={() => dispatch(removeFromCart(item.id))}
                className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Minus size={11} />
              </button>
              <span className="w-7 text-center text-xs font-black text-slate-900 tabular-nums">
                {item.qty}
              </span>
              <button
                onClick={() => dispatch(addToCart(item.id))}
                className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Button to Add More Items */}
      <button
        onClick={() => onTabChange('home')}
        className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
      >
        <Plus size={14} /> Add More Items
      </button>

      {/* Bill Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900">Bill Details</h4>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Items Total</span>
          <span className="font-semibold">₹{totals.finalTotal}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Delivery Partner Fee</span>
          <span className="text-emerald-600 font-bold">FREE</span>
        </div>
        {mode === 'morning' && totals.totalSavings > 0 && (
          <div className="flex justify-between text-xs text-emerald-700 font-medium bg-emerald-50/70 p-1.5 rounded-lg">
            <span className="flex items-center gap-1">
              <Sparkles size={12} /> Morning Savings
            </span>
            <span className="font-bold">-₹{totals.totalSavings}</span>
          </div>
        )}
        <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
          <span>To Pay</span>
          <span className="text-emerald-700">₹{totals.finalTotal}</span>
        </div>
      </div>

      {/* Checkout Button Trigger */}
      <div className="pt-2">
        <button
          onClick={() => dispatch(openCheckout())}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span>Proceed to Checkout (₹{totals.finalTotal})</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
