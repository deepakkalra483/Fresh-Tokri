import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveAddress } from '../../features/address/addressSlice';
import { MapPin, ChevronDown, Truck } from 'lucide-react';

export default function Header({ onTabChange }) {
  const activeAddress = useSelector(selectActiveAddress);

  return (
    <header className="bg-white sticky top-0 z-30 border-b border-slate-100 shadow-2xs">
      <div className="px-3.5 pt-2.5 pb-2 flex items-center justify-between">
        {/* Address Selector */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:bg-emerald-100 transition-colors">
            <MapPin size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-slate-900 leading-none">
                Delivery to {activeAddress.label}
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px] mt-0.5">
              {activeAddress.flat}, {activeAddress.area}
            </p>
          </div>
        </div>

        {/* User Actions & Quick Tracker */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onTabChange('orders')}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center relative hover:bg-slate-200 transition-colors"
            title="Track Order"
          >
            <Truck size={14} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
          </button>

          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
            DK
          </div>
        </div>
      </div>
    </header>
  );
}

