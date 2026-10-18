/**
 * OTPModal.jsx
 * Simplified phone-only login — no OTP, no reCAPTCHA.
 * Step 1: Enter 10-digit mobile number (validated).
 * Step 2: Enter name (optional).
 * Creates a Firebase Anonymous account + Firestore profile instantly.
 * Phone verification happens at order-placement time.
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeOTPModal,
  setUserAfterOTP,
  selectOTPModalOpen,
  selectOTPPendingAction,
} from '../../features/auth/authSlice';
import { signInWithPhone, createOrUpdateUserProfile } from '../../firebase/authService';
import {
  Phone, ArrowRight, X, Loader2, CheckCircle2, User, ChevronLeft,
} from 'lucide-react';

const STEPS = { PHONE: 'phone', NAME: 'name' };

// Indian mobile numbers start with 6-9
const VALID_MOBILE_RE = /^[6-9]\d{9}$/;

export default function OTPModal({ onLoginSuccess }) {
  const dispatch = useDispatch();
  const isOpen   = useSelector(selectOTPModalOpen);
  const pending  = useSelector(selectOTPPendingAction);

  const [step,    setStep]    = useState(STEPS.PHONE);
  const [phone,   setPhone]   = useState('');
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  // Temp store the profile between step 1 → step 2
  const [draftProfile, setDraftProfile] = useState(null);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(STEPS.PHONE);
      setPhone('');
      setName('');
      setError('');
      setLoading(false);
      setDraftProfile(null);
    }
  }, [isOpen]);

  const handleClose = () => dispatch(closeOTPModal());

  // ── Validate & move to name step ─────────────────────────────────────────
  const handlePhoneSubmit = async (e) => {
    e?.preventDefault();
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!VALID_MOBILE_RE.test(cleaned)) {
      setError('Mobile number must start with 6, 7, 8, or 9.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Create / fetch Firestore profile (anonymous Firebase auth)
      const profile = await signInWithPhone(cleaned, '');
      setDraftProfile(profile);
      setStep(STEPS.NAME);
    } catch (err) {
      setError(err.message || 'Could not continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save optional name & finish ───────────────────────────────────────────
  const handleFinish = async (skipName = false) => {
    setError('');
    setLoading(true);
    try {
      let finalProfile = draftProfile;
      if (!skipName && name.trim() && draftProfile) {
        finalProfile = await createOrUpdateUserProfile(draftProfile.uid, { name: name.trim() });
      }
      dispatch(setUserAfterOTP(finalProfile));
      if (onLoginSuccess) onLoginSuccess(finalProfile, pending);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 z-50 flex flex-col justify-end"
          onClick={handleClose}
        >
          {/* Bottom Sheet */}
          <div
            className="bg-white rounded-t-3xl p-5 max-w-[412px] mx-auto w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step === STEPS.NAME && (
                  <button
                    onClick={() => { setStep(STEPS.PHONE); setError(''); }}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                  >
                    <ChevronLeft size={15} />
                  </button>
                )}
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  {step === STEPS.PHONE
                    ? <Phone size={14} className="text-emerald-700" />
                    : <User  size={14} className="text-emerald-700" />}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {step === STEPS.PHONE ? 'Enter your mobile number' : "What's your name?"}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={14} />
              </button>
            </div>

            {/* ── STEP 1: PHONE ── */}
            {step === STEPS.PHONE && (
              <form onSubmit={handlePhoneSubmit} className="space-y-3" noValidate>
                <p className="text-xs text-slate-500">
                  Enter your 10-digit Indian mobile number. No OTP needed — we'll verify at delivery.
                </p>

                {/* Phone Input */}
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all
                  ${error
                    ? 'bg-red-50 border-red-400'
                    : 'bg-slate-100 border-transparent focus-within:border-emerald-500 focus-within:bg-white'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-600 flex-shrink-0 select-none">🇮🇳 +91</span>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError('');
                    }}
                    autoFocus
                    maxLength={10}
                    className="flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-400 tracking-wide"
                  />
                  {/* Live digit counter */}
                  <span className={`text-[10px] font-bold flex-shrink-0 tabular-nums
                    ${phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {phone.length}/10
                  </span>
                </div>

                {/* Inline validation hint */}
                {!error && phone.length > 0 && phone.length < 10 && (
                  <p className="text-[11px] text-slate-400">
                    {10 - phone.length} more digit{10 - phone.length !== 1 ? 's' : ''} needed
                  </p>
                )}
                {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]"
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <ArrowRight size={16} />}
                  {loading ? 'Please wait...' : 'Continue'}
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  By continuing, you agree to our terms of service.
                </p>
              </form>
            )}

            {/* ── STEP 2: NAME ── */}
            {step === STEPS.NAME && (
              <div className="space-y-3">
                {/* Success banner */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-emerald-800 font-semibold">
                      +91 {phone} — registered! ✓
                    </p>
                    <p className="text-[10px] text-emerald-600">
                      Phone will be verified at delivery.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  What should we call you? Helps us personalise your orders.
                </p>

                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleFinish(false)}
                  className="w-full bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium outline-none transition-all"
                />

                {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

                <button
                  onClick={() => handleFinish(false)}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]"
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <ArrowRight size={16} />}
                  {loading ? 'Please wait...' : 'Start Shopping'}
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
      )}
    </>
  );
}
