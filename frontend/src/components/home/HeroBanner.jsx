import React from 'react';
import { useSelector } from 'react-redux';
import { selectDeliveryMode } from '../../features/deliveryMode/deliveryModeSlice';

export default function HeroBanner() {
  const currentMode = useSelector(selectDeliveryMode);

  if (currentMode === 'instant') {
    return (
      <div className="bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 rounded-2xl p-3.5 text-white shadow-sm relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10 max-w-[240px]">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
            ⚡ Instant Express
          </span>
          <h3 className="text-sm font-extrabold leading-tight">Fresh Produce Delivered in 15 Minutes</h3>
          <p className="text-[10px] text-rose-100 mt-1">Directly dispatched from your local neighborhood darkstore.</p>
        </div>
        <div className="text-4xl select-none z-10 pr-1">🚀</div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600 rounded-2xl p-3.5 text-white shadow-sm relative overflow-hidden space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="bg-amber-400 text-slate-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
          ⏱ CUTOFF TONIGHT: 10:00 PM
        </span>
        <span className="text-[9px] text-emerald-200 font-bold">Slot: 6 AM - 9 AM</span>
      </div>
      <div>
        <h3 className="text-xs font-extrabold text-white">Direct Farm Harvest • 20% Extra Savings</h3>
        <p className="text-[10px] text-emerald-100 mt-0.5 leading-snug">
          Harvested fresh at 4 AM based on your order & delivered straight to your door step.
        </p>
      </div>
    </div>
  );
}

