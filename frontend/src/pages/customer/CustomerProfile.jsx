import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectCurrentUser } from '../../features/auth/authSlice';
import { LogOut, UserRound, Phone, MapPin, Bell, HelpCircle, Shield, ChevronRight } from 'lucide-react';

export default function CustomerProfile() {
  const dispatch = useDispatch();
  const user     = useSelector(selectCurrentUser);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const menuItems = [
    { icon: MapPin,    label: 'Saved Addresses',    sub: 'Manage delivery addresses' },
    { icon: Bell,      label: 'Notifications',      sub: 'Order & offer alerts' },
    { icon: HelpCircle,label: 'Help & Support',     sub: 'FAQs and contact us' },
    { icon: Shield,    label: 'Privacy Policy',     sub: 'How we handle your data' },
  ];

  return (
    <div className="pb-28 space-y-4">

      {/* Profile Hero */}
      <div className="mx-3 mt-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-extrabold text-xl shadow-lg">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-extrabold">{user?.name || 'Guest'}</h2>
            <p className="text-[10px] text-slate-300">{user?.email}</p>
            <span className="text-[9px] bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Customer</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">Account</p>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 transition text-left">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[9px] text-slate-400">{item.sub}</p>
                </div>
                <ChevronRight size={13} className="text-slate-300" />
              </button>
            );
          })}
        </div>
      </div>

      {/* App Info */}
      <div className="px-3 text-center">
        <p className="text-[10px] text-slate-400">Fresh Tokri v1.0.0</p>
        <p className="text-[9px] text-slate-300 mt-0.5">Farm-fresh, delivered to your door 🌿</p>
      </div>

      {/* Logout */}
      <div className="px-3">
        <button
          onClick={() => dispatch(logoutUser())}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs py-3 rounded-2xl transition active:scale-95"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
