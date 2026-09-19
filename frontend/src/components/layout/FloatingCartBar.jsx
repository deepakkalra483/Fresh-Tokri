import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartTotals, openCheckout } from '../../features/cart/cartSlice';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';
import { ChevronRight } from 'lucide-react';

export default function FloatingCartBar() {
  const dispatch = useDispatch();
  const totals = useSelector(selectCartTotals);
  const mode = useSelector(selectDeliveryMode);

  if (totals.totalQty === 0) return null;

  return (
    <div 
      onClick={() => dispatch(openCheckout())}
      className="fixed bottom-20 left-3 right-3 glass-dark text-white p-2.5 rounded-2xl shadow-xl z-40 flex items-center justify-between cursor-pointer border border-slate-700/60 hover:scale-[1.01] transition-transform max-w-[388px] mx-auto"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-extrabold text-xs shadow-2xs">
          {totals.totalQty}
        </div>
        <div>
          <div className="text-xs font-extrabold flex items-center gap-1.5">
            <span>₹{totals.finalTotal}</span>
            {mode === 'morning' && totals.totalSavings > 0 && (
              <span className="text-[8px] bg-amber-400 text-slate-900 px-1 py-0.2 rounded font-extrabold">
                SAVED ₹{totals.totalSavings}
              </span>
            )}
          </div>
          <p className="text-[9px] text-slate-300">Tap for 1-Click Express Checkout</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs">
        <span>Checkout</span>
        <ChevronRight size={12} />
      </div>
    </div>
  );
}
