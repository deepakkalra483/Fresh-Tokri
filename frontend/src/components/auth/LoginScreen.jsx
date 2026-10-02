import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginWithEmail,
  signupWithEmail,
  clearLoginError,
  selectLoginError,
  selectAuthLoading,
} from '../../features/auth/authSlice';
import { Leaf, Eye, EyeOff, ShieldCheck, UserRound, Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const dispatch    = useDispatch();
  const loginError  = useSelector(selectLoginError);
  const authLoading = useSelector(selectAuthLoading);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearLoginError());
    if (isSignup) {
      dispatch(signupWithEmail({ email: email.trim(), password, name: name.trim() }));
    } else {
      dispatch(loginWithEmail({ email: email.trim(), password }));
    }
  };

  const fillAdmin = () => {
    setEmail('admin@freshtokri.com');
    setPassword('admin123');
    setIsSignup(false);
  };

  const fillDemo = () => {
    setEmail('demo@customer.com');
    setPassword('demo123456');
    setIsSignup(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl mb-3">
            <Leaf size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Fresh Tokri</h1>
          <p className="text-emerald-300 text-xs mt-1">Farm-fresh veggies & fruits at your door</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4 text-center">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <div>
                <label className="text-xs text-emerald-200 font-semibold mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-emerald-400 focus:bg-white/15 transition"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-emerald-200 font-semibold mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-emerald-400 focus:bg-white/15 transition"
              />
            </div>

            <div>
              <label className="text-xs text-emerald-200 font-semibold mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-white/40 outline-none focus:border-emerald-400 focus:bg-white/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
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
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl text-sm shadow-lg transition-all active:scale-95 mt-1 flex items-center justify-center gap-2"
            >
              {authLoading
                ? <><Loader2 size={15} className="animate-spin" /> Please wait...</>
                : isSignup ? 'Create Account' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-white/50 mt-4">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignup(!isSignup); dispatch(clearLoginError()); }}
              className="text-emerald-300 font-semibold hover:underline"
            >
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Quick Access */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={fillAdmin}
            className="flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-2xl py-2.5 px-3 text-xs text-amber-200 font-semibold transition"
          >
            <ShieldCheck size={14} />
            Admin Credentials
          </button>
          <button
            onClick={fillDemo}
            className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-2xl py-2.5 px-3 text-xs text-blue-200 font-semibold transition"
          >
            <UserRound size={14} />
            Demo Customer
          </button>
        </div>

        <p className="text-center text-[10px] text-white/25 mt-6">
          Powered by Firebase · Fresh Tokri v1.0
        </p>
      </div>
    </div>
  );
}
