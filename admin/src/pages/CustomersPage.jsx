import React from 'react';
import { useSelector } from 'react-redux';
import { selectCustomers } from '../features/customers/customersSlice';
import { Users, Phone, Mail, MapPin } from 'lucide-react';

export default function CustomersPage() {
  const customers = useSelector(selectCustomers);

  return (
    <div className="p-4 space-y-3 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Customer Directory</h2>
          <p className="text-[11px] text-slate-500 font-medium">Registered customers, total orders, and purchase history</p>
        </div>
        <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-2.5 py-1 rounded-lg">
          {customers.length} users
        </span>
      </div>

      {/* Customer Cards */}
      <div className="space-y-2">
        {customers.map((c) => (
          <div 
            key={c.id}
            className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm border border-emerald-200">
                {c.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">{c.name}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {c.address}</span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-extrabold text-emerald-700 block">₹{c.totalSpent}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{c.totalOrders} orders</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

