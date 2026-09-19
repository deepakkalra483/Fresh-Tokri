import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectActiveAddress, 
  selectSavedAddresses, 
  selectIsAddressModalOpen, 
  setActiveAddress, 
  closeAddressModal 
} from '../../features/address/addressSlice';
import { X, MapPin, Search, Plus, Home, Briefcase, Heart, CheckCircle2 } from 'lucide-react';

export default function AddressModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsAddressModalOpen);
  const activeAddress = useSelector(selectActiveAddress);
  const savedAddresses = useSelector(selectSavedAddresses);

  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = savedAddresses.filter(
    (addr) =>
      addr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end transition-opacity">
      <div className="bg-white rounded-t-3xl max-h-[85%] overflow-y-auto space-y-3 p-4 shadow-2xl max-w-[412px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              <MapPin size={14} />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Select Delivery Location</h3>
          </div>
          <button 
            onClick={() => dispatch(closeAddressModal())}
            className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center pt-1">
          <Search size={14} className="absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search city, sector, flat, pincode..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 text-xs text-slate-800 font-medium pl-8 pr-3 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Use Current GPS Location Button */}
        <button className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600 fill-emerald-100 animate-pulse" />
            <span>Use Current GPS Location</span>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">AUTO DETECT</span>
        </button>

        {/* Saved Addresses List */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Saved Addresses</h4>
          
          <div className="space-y-2">
            {filtered.map((addr) => {
              const isSelected = activeAddress.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => dispatch(setActiveAddress(addr))}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {addr.tag === 'WORK' ? <Briefcase size={14} /> : addr.tag === 'FAMILY' ? <Heart size={14} /> : <Home size={14} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{addr.label}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold uppercase">
                          {addr.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">{addr.flat}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{addr.area}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Address Button */}
        <button className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition">
          <Plus size={16} />
          <span>Add New Delivery Address</span>
        </button>

      </div>
    </div>
  );
}

