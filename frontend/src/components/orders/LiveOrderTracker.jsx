import React from 'react';
import { Check, Box, Bike, Home, Phone, MapPin, Zap, Sun, Package } from 'lucide-react';

// Status progression order
const STEPS = [
  { key: 'placed',    label: 'Received', Icon: Check },
  { key: 'packed',    label: 'Packed',   Icon: Box   },
  { key: 'on_way',   label: 'On Way',   Icon: Bike  },
  { key: 'delivered', label: 'Delivered',Icon: Home  },
];

const STATUS_INDEX = { placed: 0, packed: 1, on_way: 2, delivered: 3 };

export default function LiveOrderTracker({ order }) {
  if (!order) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
        Order details not available.
      </div>
    );
  }

  const { id, orderId, mode, eta, rider, items = [], totalPaid, status = 'placed', deliveryAddress, paymentMethod } = order;
  const displayId = id || orderId;
  const currentStep = STATUS_INDEX[status] ?? 0;
  const progressPct = currentStep === 0 ? 8 : currentStep === 1 ? 40 : currentStep === 2 ? 74 : 100;
  const isDelivered = status === 'delivered';

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          {isDelivered ? 'Order Delivered ✓' : 'Live Order Tracking'}
        </h2>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
          #{displayId}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 space-y-3">

        {/* Mode & ETA Header */}
        <div className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
          isDelivered 
            ? 'bg-slate-50 border-slate-100' 
            : mode === 'instant' 
              ? 'bg-rose-50 border-rose-100' 
              : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
              isDelivered ? 'bg-emerald-500' : mode === 'instant' ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
            }`}>
              {isDelivered 
                ? <Check size={12} /> 
                : mode === 'instant' 
                  ? <Zap size={12} className="fill-white" /> 
                  : <Sun size={12} className="fill-white" />}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">
                {isDelivered ? 'Successfully Delivered' : mode === 'instant' ? 'Instant Express Delivery' : 'Next Morning Harvest Slot'}
              </div>
              <div className="text-[10px] text-slate-500">
                {isDelivered 
                  ? `Paid ₹${totalPaid} via ${paymentMethod || 'UPI'}` 
                  : <>ETA: <span className={`font-extrabold ${mode === 'instant' ? 'text-rose-600' : 'text-emerald-600'}`}>{eta}</span></>}
              </div>
            </div>
          </div>
          {!isDelivered && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />}
        </div>

        {/* Progress Steps */}
        <div className="py-1">
          <div className="flex items-center justify-between relative">
            {/* Track line background */}
            <div className="absolute left-3 right-3 top-3 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isPending = idx > currentStep;
              const StepIcon = step.Icon;

              return (
                <div key={step.key} className="flex flex-col items-center z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent && !isDelivered
                        ? 'bg-emerald-600 text-white shadow-sm animate-pulse'
                        : isDelivered
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                  }`}>
                    <StepIcon size={12} />
                  </div>
                  <span className={`text-[9px] font-bold mt-1 ${
                    (isDone || isCurrent) ? 'text-slate-700' : 'text-slate-400'
                  } ${isCurrent && !isDelivered ? 'text-emerald-700 font-extrabold' : ''}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulated Map (only for non-delivered) */}
        {!isDelivered && (
          <div className="h-36 bg-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-200">
            <div className="absolute inset-0 bg-emerald-50/70 flex flex-col justify-around p-2">
              <div className="w-full h-1.5 bg-slate-300/50 rounded" />
              <div className="w-4/5 h-1.5 bg-slate-300/50 rounded" />
              <div className="w-full h-1.5 bg-slate-300/50 rounded" />
              <div className="w-3/5 h-1.5 bg-slate-300/50 rounded" />
            </div>

            {/* Destination pin */}
            <div className="absolute top-5 right-8 text-rose-600 flex flex-col items-center">
              <MapPin size={20} className="fill-rose-600 text-white" />
              <span className="text-[8px] bg-slate-900 text-white font-bold px-1 rounded shadow-2xs">Your Home</span>
            </div>

            {/* Rider moving */}
            {status === 'on_way' && (
              <div className="absolute bottom-7 left-10 flex flex-col items-center animate-bounce">
                <div className="bg-white p-1.5 rounded-full shadow-md border border-emerald-500">
                  <Bike size={16} className="text-emerald-600" />
                </div>
                <span className="text-[8px] bg-emerald-700 text-white font-bold px-1 rounded shadow-2xs">
                  {rider?.name || 'Rider'}
                </span>
              </div>
            )}

            {/* Darkstore dot for placed/packed */}
            {(status === 'placed' || status === 'packed') && (
              <div className="absolute bottom-8 left-10 flex flex-col items-center">
                <div className="bg-white p-1.5 rounded-full shadow-md border border-slate-300">
                  <Package size={14} className="text-slate-500" />
                </div>
                <span className="text-[8px] bg-slate-700 text-white font-bold px-1 rounded shadow-2xs">Darkstore</span>
              </div>
            )}
          </div>
        )}

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5">
            <MapPin size={12} className="text-slate-400 flex-shrink-0" />
            <span className="text-[10px] text-slate-600 truncate">{deliveryAddress}</span>
          </div>
        )}

        {/* Rider Card */}
        {rider?.name && (
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm border border-slate-200">
                {rider.avatar || '🛵'}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{rider.name}</h4>
                <p className="text-[10px] text-slate-500">Delivery Partner • {rider.rating || '4.9 ★'}</p>
              </div>
            </div>
            <a
              href={`tel:${rider.phone}`}
              className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-2xs hover:bg-emerald-700 transition"
            >
              <Phone size={14} />
            </a>
          </div>
        )}

        {/* Items Summary */}
        {items.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1 border border-slate-100">
            <div className="font-bold text-slate-800 text-[11px] mb-1">Tokri Summary:</div>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-600 text-[10px]">
                <span>{item.qty}× {item.name}</span>
                <span className="font-bold text-slate-900">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="flex justify-between text-slate-900 font-extrabold text-[11px] pt-1.5 border-t border-slate-200">
              <span>Total Amount Paid</span>
              <span>₹{totalPaid}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
