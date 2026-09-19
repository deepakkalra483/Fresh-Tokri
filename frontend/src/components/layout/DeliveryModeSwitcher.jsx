import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDeliveryMode, setMode } from '../../features/deliveryMode/deliveryModeSlice';
import { Zap, Sun, Bike, Sprout } from 'lucide-react';

export default function DeliveryModeSwitcher() {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectDeliveryMode);

  return (
    <div className="bg-white px-3.5 pb-2">
      {/* Segmented Control Pill */}
      <div className="bg-slate-100 p-1 rounded-2xl flex relative border border-slate-200/80">
        
        {/* Mode 1: Instant */}
        <button
          onClick={() => dispatch(setMode('instant'))}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center ${
            currentMode === 'instant'
              ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Zap size={13} className={currentMode === 'instant' ? 'text-yellow-300 fill-yellow-300' : 'text-rose-500'} />
            <span className="text-[11px]">Instant Delivery</span>
          </div>
          <span className="text-[9px] font-normal opacity-90">15-20 Mins Express</span>
        </button>

        {/* Mode 2: Next Morning */}
        <button
          onClick={() => dispatch(setMode('morning'))}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center ${
            currentMode === 'morning'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-1">
            <Sun size={13} className={currentMode === 'morning' ? 'text-amber-300 fill-amber-300' : 'text-amber-500'} />
            <span className="text-[11px]">Next Morning</span>
            <span className={`font-extrabold text-[8px] px-1 py-0.2 rounded ${
              currentMode === 'morning' ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
            }`}>
              SAVE 20%
            </span>
          </div>
          <span className="text-[9px] font-normal opacity-90">Farm Picked Tonight</span>
        </button>

      </div>

      {/* Dynamic Delivery Info Sub-Banner */}
      <div className={`mt-1.5 px-3 py-1.5 rounded-xl border flex items-center justify-between text-[11px] transition-colors ${
        currentMode === 'instant'
          ? 'bg-rose-50/80 border-rose-100 text-rose-800'
          : 'bg-emerald-50/80 border-emerald-100 text-emerald-800'
      }`}>
        <div className="flex items-center gap-1.5 font-medium">
          {currentMode === 'instant' ? (
            <>
              <Bike size={14} className="text-rose-600" />
              <span>Instant Darkstore Dispatch Active</span>
            </>
          ) : (
            <>
              <Sprout size={14} className="text-emerald-600" />
              <span className="font-bold">Next Morning Farm Harvest (20% Off Applied)</span>
            </>
          )}
        </div>

        {currentMode === 'instant' ? (
          <span className="text-[10px] font-extrabold bg-rose-200/60 px-1.5 py-0.5 rounded text-rose-900">
            15-20 MINS
          </span>
        ) : (
          <span className="text-[10px] font-extrabold bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-900">
            6 AM - 9 AM
          </span>
        )}
      </div>
    </div>
  );
}

