import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDeliveryMode, setMode } from '../../features/deliveryMode/deliveryModeSlice';
import { setSearchQuery, selectSearchQuery } from '../../features/products/productsSlice';
import { Search, X, Zap, Sun } from 'lucide-react';
import CategoryBar from '../home/CategoryBar';

export default function StickyHeader() {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectDeliveryMode);
  const searchQuery = useSelector(selectSearchQuery);
  const inputRef = useRef(null);

  return (
    <div className="flex-shrink-0 z-30 bg-white border-b border-slate-200/80 shadow-sm w-full">

      {/* ── Brand + Search Row ── */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">

        {/* Logo / Brand mark */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Dr. Bhindi Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[13px] font-black text-slate-900 tracking-tight leading-none">
            Dr.<span className="text-emerald-600">Bhindi</span>
          </span>
        </div>

        {/* Search bar */}
        <div
          className="flex-1 flex items-center gap-2 bg-slate-100 hover:bg-slate-50 focus-within:bg-white focus-within:border-emerald-400 border border-transparent rounded-xl px-3 py-2 transition-all cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search veggies, fruits…"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="flex-1 bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 outline-none min-w-0"
          />
          {searchQuery && (
            <button
              onClick={(e) => { e.stopPropagation(); dispatch(setSearchQuery('')); }}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Delivery Mode Switcher ── HIDDEN: launch next morning delivery later */}
      <div className="hidden px-3 pb-1.5">
        <div className="bg-slate-100 p-1 rounded-2xl flex relative border border-slate-200/80">

          <button
            onClick={() => dispatch(setMode('instant'))}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center ${currentMode === 'instant'
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

          <button
            onClick={() => dispatch(setMode('morning'))}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center ${currentMode === 'morning'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-1">
              <Sun size={13} className={currentMode === 'morning' ? 'text-amber-300 fill-amber-300' : 'text-amber-500'} />
              <span className="text-[11px]">Next Morning</span>
              <span className={`font-extrabold text-[8px] px-1 py-0.5 rounded ${currentMode === 'morning' ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
                }`}>
                SAVE 20%
              </span>
            </div>
            <span className="text-[9px] font-normal opacity-90">Farm Picked Tonight</span>
          </button>

        </div>
      </div>

      {/* ── Category Filter Bar ── */}
      <CategoryBar />

    </div>
  );
}
