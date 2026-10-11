/**
 * OTPModal.jsx
 * Phone number → OTP verification → optional name → done.
 * Uses Firebase Phone Auth with invisible reCAPTCHA.
 * Supports WebOTP API (auto-fill on Android Chrome).
 * After successful login, dispatches setUserAfterOTP and triggers
 * the pending action (e.g. submit the order).
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeOTPModal,
  setUserAfterOTP,
  selectOTPModalOpen,
  selectOTPPendingAction,
} from '../../features/auth/authSlice';
import { sendOTP, verifyOTP, createOrUpdateUserProfile } from '../../firebase/authService';
import {
  Phone, ArrowRight, X, Loader2, ShieldCheck, MessageSquare, User, ChevronLeft,
} from 'lucide-react';

const STEPS = { PHONE: 'phone', OTP: 'otp', NAME: 'name' };

export default function OTPModal({ onLoginSuccess }) {
  const dispatch  = useDispatch();
  const isOpen    = useSelector(selectOTPModalOpen);
  const pending   = useSelector(selectOTPPendingAction);

  const [step,               setStep]               = useState(STEPS.PHONE);
  const [phone,              setPhone]              = useState('');
  const [otp,                setOtp]                = useState('');
  const [name,               setName]               = useState('');
  const [loading,            setLoading]            = useState(false);
  const [error,              setError]              = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendTimer,        setResendTimer]        = useState(0);

  const otpInputRef = useRef(null);
  const timerRef    = useRef(null);

  // ── WebOTP API: auto-fill OTP from SMS on Android Chrome ─────────────────
  useEffect(() => {
    if (step !== STEPS.OTP) return;
    if (!('OTPCredential' in window)) return;

    const abortController = new AbortController();
    navigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: abortController.signal })
      .then((cred) => {
        if (cred?.code) {
          setOtp(cred.code);
        }
      })
      .catch(() => {}); // silently ignore if denied or unsupported

    return () => abortController.abort();
  }, [step]);

  // ── Resend countdown timer ────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Reset on open/close ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setStep(STEPS.PHONE);
      setPhone('');
      setOtp('');
      setName('');
      setError('');
      setLoading(false);
      setConfirmationResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullPhone = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
      const result = await sendOTP(fullPhone, 'recaptcha-container');
      setConfirmationResult(result);
      setStep(STEPS.OTP);
      startResendTimer();
      // Focus OTP input after transition
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      console.error(err);
      setError(
        err.code === 'auth/invalid-phone-number'
          ? 'Invalid phone number. Include country code or use 10-digit Indian number.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please wait and try again.'
          : 'Could not send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      const profile = await verifyOTP(confirmationResult, otp, ''); // name added in next step
      // Move to optional name step
      setStep(STEPS.NAME);
      // Store profile temporarily — will finalize in handleFinish
      setConfirmationResult({ ...confirmationResult, _profile: profile });
    } catch (err) {
      setError(
        err.code === 'auth/invalid-verification-code'
          ? 'Incorrect OTP. Please check and try again.'
          : err.code === 'auth/code-expired'
          ? 'OTP expired. Please request a new one.'
          : 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Save name (optional) and finish ───────────────────────────────
  const handleFinish = async (skipName = false) => {
    setLoading(true);
    setError('');
    try {
      const profile = confirmationResult?._profile;
      if (!profile) throw new Error('Session lost. Please try again.');

      // If name provided, save it
      let finalProfile = profile;
      if (!skipName && name.trim()) {
        finalProfile = await createOrUpdateUserProfile(profile.uid, { name: name.trim() });
      }

      dispatch(setUserAfterOTP(finalProfile));
      if (onLoginSuccess) onLoginSuccess(finalProfile, pending);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => dispatch(closeOTPModal());

  // ── OTP input: auto-submit when 6 digits entered ──────────────────────────
  const handleOtpChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    if (digits.length === 6) {
      // auto-submit after brief delay so user sees the filled input
      setTimeout(() => handleVerifyOTP(), 300);
    }
  };

  return (
    <>
      {/* Invisible reCAPTCHA anchor — Firebase needs this div in DOM */}
      <div id="recaptcha-container" />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 z-50 flex flex-col justify-end"
        onClick={handleClose}
      >
        {/* Sheet */}
        <div
          className="bg-white rounded-t-3xl p-5 max-w-[412px] mx-auto w-full shadow-2xl space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step !== STEPS.PHONE && (
                <button
                  onClick={() => { setStep(step === STEPS.NAME ? STEPS.OTP : STEPS.PHONE); setError(''); }}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                >
                  <ChevronLeft size={15} />
                </button>
              )}
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                {step === STEPS.PHONE ? <Phone size={14} className="text-emerald-700" /> :
                 step === STEPS.OTP   ? <MessageSquare size={14} className="text-emerald-700" /> :
                                        <User size={14} className="text-emerald-700" />}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {step === STEPS.PHONE ? 'Enter your phone number' :
                 step === STEPS.OTP   ? 'Enter OTP' :
                                        "What's your name?"}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              <X size={14} />
            </button>
          </div>

          {/* ── PHONE STEP ── */}
          {step === STEPS.PHONE && (
            <form onSubmit={handleSendOTP} className="space-y-3">
              <p className="text-xs text-slate-500">
                We'll send a one-time code to verify your number. No password needed.
              </p>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <span className="text-sm font-bold text-slate-600 flex-shrink-0">🇮🇳 +91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                  autoFocus
                  maxLength={10}
                  className="flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-400"
                />
              </div>

              {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading || phone.replace(/\s/g, '').length < 10}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                By continuing, you agree to our terms of service.
              </p>
            </form>
          )}

          {/* ── OTP STEP ── */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOTP} className="space-y-3">
              <p className="text-xs text-slate-500">
                OTP sent to <span className="font-bold text-slate-800">+91 {phone}</span>
              </p>

              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"   /* WebOTP API hint */
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                maxLength={6}
                className="w-full text-center text-2xl font-extrabold tracking-[0.5em] bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-4 outline-none transition-all text-slate-900"
              />

              {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              {/* Resend */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-[11px] text-slate-400">
                    Resend OTP in <span className="font-bold text-slateald-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="text-[11px] text-emerald-600 font-bold underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── NAME STEP ── */}
          {step === STEPS.NAME && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                <p className="text-[11px] text-emerald-800 font-semibold">
                  Phone verified! ✓ You're logged in.
                </p>
              </div>

              <p className="text-xs text-slate-500">
                What should we call you? (Optional — helps us personalise your orders)
              </p>

              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium outline-none transition-all"
              />

              {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

              <button
                onClick={() => handleFinish(false)}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Please wait...' : 'Continue'}
              </button>

              <button
                type="button"
                onClick={() => handleFinish(true)}
                disabled={loading}
                className="w-full text-[11px] text-slate-400 underline text-center"
              >
                Skip, continue without name
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
