import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveAddress, openAddressModal } from '../../features/address/addressSlice';
import { selectDeliveryMode, setMode } from '../../features/deliveryMode/deliveryModeSlice';
import { MapPin, ChevronDown, Truck, Zap, Sun } from 'lucide-react';
import CategoryBar from '../home/CategoryBar';

export default function StickyHeader({ onTabChange }) {
  const dispatch = useDispatch();
  const activeAddress = useSelector(selectActiveAddress);
  const currentMode = useSelector(selectDeliveryMode);

  return (
    <div className="flex-shrink-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs w-full">
      
      {/* 1. Location & Profile Row */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div 
          onClick={() => dispatch(openAddressModal())}
          className="flex items-center gap-2 cursor-pointer group"
          title="Click to change delivery address"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:bg-emerald-100 transition-colors">
            <MapPin size={15} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-slate-900 leading-none">
                Delivery to {activeAddress.label}
              </span>
              <ChevronDown size={12} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px] mt-0.5">
              {activeAddress.flat}, {activeAddress.area}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onTabChange('orders')}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center relative hover:bg-slate-200 transition-colors"
            title="Track Order"
          >
            <Truck size={15} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
            DK
          </div>
        </div>
      </div>

      {/* 2. Mode Switcher Tabs (Instant vs Next Morning) */}
      <div className="px-4 py-1.5">
        <div className="bg-slate-100 p-1 rounded-2xl flex relative border border-slate-200/80">
          
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
      </div>

      {/* 3. Static Produce Category Filter Bar */}
      <CategoryBar />

    </div>
  );
}
