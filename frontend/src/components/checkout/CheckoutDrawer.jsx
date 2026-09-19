import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsCheckoutOpen, closeCheckout, selectCartTotals, selectCartItems, clearCart } from '../../features/cart/cartSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { selectActiveAddress } from '../../features/address/addressSlice';
import { placeNewOrder } from '../../features/orders/ordersSlice';
import { X, ShoppingBasket, Home, CheckCircle2, ArrowRight, Zap, Sun, CreditCard, Banknote } from 'lucide-react';

export default function CheckoutDrawer({ onOrderPlaced }) {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsCheckoutOpen);
  const totals = useSelector(selectCartTotals);
  const cartItems = useSelector(selectCartItems);
  const mode = useSelector(selectDeliveryMode);
  const address = useSelector(selectActiveAddress);
  const products = useSelector((state) => state.products.productsList);

  const [paymentMethod, setPaymentMethod] = useState('upi');

  if (!isOpen) return null;

  const handlePlaceOrder = () => {
    const formattedItems = Object.entries(cartItems).map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      const price = mode === 'instant' ? p.priceInstant : p.priceMorning;
      return { id: p.id, name: `${p.name} (${p.weight})`, price, qty };
    });

    dispatch(placeNewOrder({
      items: formattedItems,
      mode: mode,
      total: totals.finalTotal,
    }));

    dispatch(clearCart());
    dispatch(closeCheckout());
    if (onOrderPlaced) onOrderPlaced();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end transition-opacity">
      <div className="bg-white rounded-t-3xl p-4 max-h-[88%] overflow-y-auto space-y-3 shadow-2xl max-w-[412px] mx-auto w-full">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              <ShoppingBasket size={14} />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Express Checkout</h3>
          </div>
          <button 
            onClick={() => dispatch(closeCheckout())}
            className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Selected Mode Summary */}
        <div className="bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-200">
          {mode === 'instant' ? (
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-rose-700 text-xs">
                <Zap size={14} className="fill-rose-700" />
                <span>Instant Express Delivery (15-20 Mins)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dispatched immediately from nearest local darkstore.</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-700 text-xs">
                <Sun size={14} className="fill-emerald-700" />
                <span>Tomorrow Morning Slot (6:00 AM - 9:00 AM)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Farm harvested overnight. 20% Discount applied!</div>
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div>
          <div className="text-[11px] font-extrabold text-slate-800 mb-1 flex justify-between">
            <span>Delivering To</span>
            <span className="text-emerald-600 text-[10px] font-bold cursor-pointer">Change Address</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 p-2 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900 text-[11px]">{address.label} • {address.flat}</div>
                <div className="text-[9px] text-slate-500">{address.area}</div>
              </div>
            </div>
            <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100" />
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <div className="text-[11px] font-extrabold text-slate-800 mb-1">Select Payment Method</div>
          <div className="grid grid-cols-2 gap-2">
            <label 
              onClick={() => setPaymentMethod('upi')}
              className={`p-2 rounded-xl flex items-center gap-2 cursor-pointer text-[11px] font-extrabold transition-colors ${
                paymentMethod === 'upi' 
                  ? 'border-2 border-emerald-500 bg-emerald-50/40 text-slate-900' 
                  : 'border border-slate-200 text-slate-600'
              }`}
            >
              <CreditCard size={14} className="text-emerald-600" />
              <span>UPI (Google Pay)</span>
            </label>
            <label 
              onClick={() => setPaymentMethod('cod')}
              className={`p-2 rounded-xl flex items-center gap-2 cursor-pointer text-[11px] font-extrabold transition-colors ${
                paymentMethod === 'cod' 
                  ? 'border-2 border-emerald-500 bg-emerald-50/40 text-slate-900' 
                  : 'border border-slate-200 text-slate-600'
              }`}
            >
              <Banknote size={14} className="text-slate-400" />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Bill Breakdown */}
        <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 border border-slate-200/60">
          <div className="flex justify-between text-slate-600 text-[11px]">
            <span>Item Subtotal</span>
            <span>₹{totals.subtotalInstant}</span>
          </div>

          {mode === 'morning' && totals.totalSavings > 0 && (
            <div className="flex justify-between text-emerald-700 font-extrabold text-[11px]">
              <span>Next Morning Farm Discount (20%)</span>
              <span>-₹{totals.totalSavings}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 text-[11px]">
            <span>Delivery Fee</span>
            <span className="text-emerald-600 font-extrabold">FREE</span>
          </div>

          <div className="flex justify-between text-slate-900 font-extrabold text-xs pt-1.5 border-t border-slate-200">
            <span>Total Payable Amount</span>
            <span>₹{totals.finalTotal}</span>
          </div>
        </div>

        {/* Place Order CTA Button */}
        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.99]"
        >
          <span>PLACE ORDER NOW (₹{totals.finalTotal})</span>
          <ArrowRight size={14} />
        </button>

      </div>
    </div>
  );
}

