/**
 * AdminLoginScreen.jsx
 * Private login page for admin — only reachable via /admin-deepak URL.
 * Uses email + password (Firebase Email Auth).
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  adminLoginWithEmail,
  clearLoginError,
  selectLoginError,
  selectAuthLoading,
} from '../../features/auth/authSlice';
import { Leaf, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLoginScreen() {
  const dispatch = useDispatch();
  const loginError = useSelector(selectLoginError);
  const authLoading = useSelector(selectAuthLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearLoginError());
    dispatch(adminLoginWithEmail({ email: email.trim(), password }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl mb-3">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-xs mt-1">Dr. Bhindi · Restricted Access</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
          <h2 className="text-base font-bold text-white mb-4 text-center">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@freshtokri.com"
                required
                autoComplete="email"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400 focus:bg-white/15 transition"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400 focus:bg-white/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-300 bg-rose-500/20 border border-rose-400/30 rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm shadow-lg transition-all active:scale-95 mt-1 flex items-center justify-center gap-2"
            >
              {authLoading
                ? <><Loader2 size={15} className="animate-spin" /> Please wait...</>
                : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Subtle branding */}
        <div className="flex items-center justify-center gap-2 mt-6 opacity-30">
          <Leaf size={12} className="text-emerald-400" />
          <p className="text-[10px] text-white">Dr. Bhindi · Admin Only</p>
        </div>
      </div>
    </div>
  );
}
