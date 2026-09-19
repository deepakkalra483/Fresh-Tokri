import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveOrder } from '../../features/orders/ordersSlice';
import { Check, Box, Bike, Home, Phone, MapPin, Zap, Sun } from 'lucide-react';

export default function LiveOrderTracker() {
  const activeOrder = useSelector(selectActiveOrder);

  if (!activeOrder) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
        No active order currently in progress.
      </div>
    );
  }

  const { id, mode, eta, rider, items, totalPaid } = activeOrder;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Active Order Status</h2>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
          Order #{id}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 space-y-3">
        
        {/* Mode & ETA Header */}
        <div className="flex items-center justify-between bg-rose-50 border border-rose-100 p-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
              {mode === 'instant' ? <Zap size={12} className="fill-white" /> : <Sun size={12} className="fill-white" />}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">
                {mode === 'instant' ? 'Instant Express Delivery' : 'Next Morning Harvest Slot'}
              </div>
              <div className="text-[10px] text-slate-500">
                ETA: <span className="text-rose-600 font-extrabold">{eta}</span>
              </div>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {/* Step Progress Visualizer */}
        <div className="py-1">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-3 right-3 top-3 h-1 bg-slate-200 -z-0">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '66%' }}></div>
            </div>

            {/* Step 1: Received */}
            <div className="flex flex-col items-center z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                <Check size={12} />
              </div>
              <span className="text-[9px] font-bold mt-1 text-slate-700">Received</span>
            </div>

            {/* Step 2: Packed */}
            <div className="flex flex-col items-center z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                <Box size={12} />
              </div>
              <span className="text-[9px] font-bold mt-1 text-slate-700">Packed</span>
            </div>

            {/* Step 3: On Way */}
            <div className="flex flex-col items-center z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm animate-pulse">
                <Bike size={12} />
              </div>
              <span className="text-[9px] font-extrabold mt-1 text-emerald-700">On Way</span>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center z-10">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                <Home size={12} />
              </div>
              <span className="text-[9px] font-medium mt-1 text-slate-400">Delivered</span>
            </div>
          </div>
        </div>

        {/* Simulated Map View */}
        <div className="h-40 bg-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-200">
          <div className="absolute inset-0 bg-emerald-50/70 flex flex-col justify-around p-2">
            <div className="w-full h-1.5 bg-slate-300/50 rounded"></div>
            <div className="w-4/5 h-1.5 bg-slate-300/50 rounded"></div>
            <div className="w-full h-1.5 bg-slate-300/50 rounded"></div>
          </div>

          <div className="absolute top-6 right-8 text-rose-600 text-xl flex flex-col items-center">
            <MapPin size={20} className="fill-rose-600 text-white" />
            <span className="text-[8px] bg-slate-900 text-white font-bold px-1 rounded shadow-2xs">Your Home</span>
          </div>

          <div className="absolute bottom-8 left-10 text-emerald-700 text-lg flex flex-col items-center animate-bounce">
            <div className="bg-white p-1.5 rounded-full shadow-md border border-emerald-500">
              <Bike size={16} className="text-emerald-600" />
            </div>
            <span className="text-[8px] bg-emerald-700 text-white font-bold px-1 rounded shadow-2xs">
              {rider.name}
            </span>
          </div>
        </div>

        {/* Rider Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm border border-slate-200">
              {rider.avatar}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">{rider.name}</h4>
              <p className="text-[10px] text-slate-500">Delivery Partner • {rider.rating}</p>
            </div>
          </div>
          <a 
            href={`tel:${rider.phone}`}
            className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-2xs hover:bg-emerald-700 transition"
          >
            <Phone size={14} />
          </a>
        </div>

        {/* Items Summary */}
        <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1 border border-slate-100">
          <div className="font-bold text-slate-800 text-[11px] mb-1">Tokri Summary:</div>
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-slate-600 text-[10px]">
              <span>{item.qty}x {item.name}</span>
              <span className="font-bold text-slate-900">₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="flex justify-between text-slate-900 font-extrabold text-[11px] pt-1 border-t border-slate-200">
            <span>Total Amount Paid</span>
            <span>₹{totalPaid}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

