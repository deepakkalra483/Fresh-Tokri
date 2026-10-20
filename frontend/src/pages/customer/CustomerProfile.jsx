import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectCurrentUser } from '../../features/auth/authSlice';
import {
  LogOut, UserRound, Phone, MapPin, Navigation,
  Bell, HelpCircle, Shield, ChevronRight, Edit2,
} from 'lucide-react';

const PHONE_KEY = 'ft_customer_phone';
const ADDR_KEY  = 'ft_customer_address';

export default function CustomerProfile() {
  const dispatch = useDispatch();
  const user     = useSelector(selectCurrentUser);

  // Load saved info from localStorage (set during WhatsApp checkout)
  const savedPhone = localStorage.getItem(PHONE_KEY) || '';
  const savedAddr  = (() => {
    try { return JSON.parse(localStorage.getItem(ADDR_KEY) || 'null'); } catch { return null; }
  })();

  const displayName = user?.name || (savedPhone ? `+91 ${savedPhone}` : 'Guest');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'G';

  return (
    <div className="pb-6 space-y-4">

      {/* ── Profile Hero ── */}
      <div className="mx-3 mt-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-extrabold text-xl shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold truncate">{displayName}</h2>
            {savedPhone && (
              <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                <Phone size={10} /> +91 {savedPhone}
              </p>
            )}
            <span className="text-[9px] bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Customer
            </span>
          </div>
        </div>
      </div>

      {/* ── Saved Address ── */}
      <div className="px-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">
          Delivery Address
        </p>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {savedAddr ? (
            <div className="flex items-start gap-3 px-3 py-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {savedAddr.coords
                  ? <Navigation size={14} className="text-emerald-600" />
                  : <MapPin size={14} className="text-emerald-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  {savedAddr.coords ? 'GPS Location' : 'Saved Address'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {savedAddr.text || (savedAddr.coords
                    ? `${savedAddr.coords.lat?.toFixed(4)}, ${savedAddr.coords.lng?.toFixed(4)}`
                    : 'No address saved')}
                </p>
                {savedAddr.coords && (
                  <a
                    href={`https://maps.google.com/maps?q=${savedAddr.coords.lat},${savedAddr.coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-600 font-bold underline mt-0.5 block"
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem(ADDR_KEY);
                  window.location.reload();
                }}
                className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                title="Remove saved address"
              >
                <Edit2 size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-3 text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <MapPin size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">No address saved yet</p>
                <p className="text-[10px] text-slate-400">
                  Address is saved automatically when you place an order.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Account menu ── */}
      <div className="px-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">
          More
        </p>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {[
            { icon: Bell,       label: 'Notifications',   sub: 'Order & offer alerts' },
            { icon: HelpCircle, label: 'Help & Support',  sub: 'FAQs and contact us' },
            { icon: Shield,     label: 'Privacy Policy',  sub: 'How we handle your data' },
          ].map(item => {
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

      {/* ── App info ── */}
      <div className="px-3 text-center">
        <p className="text-[10px] text-slate-400">Fresh Tokri v1.0.0</p>
        <p className="text-[9px] text-slate-300 mt-0.5">Farm-fresh, delivered to your door 🌿</p>
      </div>

      {/* ── Sign out ── */}
      {user && (
        <div className="px-3">
          <button
            onClick={() => dispatch(logoutUser())}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs py-3 rounded-2xl transition active:scale-95"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
