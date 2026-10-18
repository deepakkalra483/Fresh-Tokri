/**
 * authService.js
 * Auth helpers — NO Firebase Phone Auth or Anonymous Auth needed.
 *
 * Customers : phone number collected → profile saved to Firestore with a
 *             locally-generated UID → session persisted in localStorage.
 *             Phone is verified at delivery time (not at sign-in).
 *
 * Admin     : email + password via Firebase Auth (unchanged).
 *
 * Firestore `users/{uid}` shape: { name, phone, role, createdAt, phoneVerified }
 */
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, query, collection, where, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';

// ── localStorage session key ──────────────────────────────────────────────────
const SESSION_KEY = 'ft_customer_session'; // stores { uid, name, phone, role }

export const saveCustomerSession = (profile) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
};

export const loadCustomerSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearCustomerSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// ── Firestore profile helpers ─────────────────────────────────────────────────

/** Fetch a user profile doc. Returns null if not found. */
export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { uid, ...snap.data() } : null;
  } catch (err) {
    console.error('[Auth] getUserProfile error:', err);
    return null;
  }
};

/** Create or update user profile doc in Firestore. */
export const createOrUpdateUserProfile = async (uid, fields) => {
  const ref = doc(db, 'users', uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      role: 'customer',
      createdAt: serverTimestamp(),
      phoneVerified: false,
      ...fields,
    });
  } else {
    const updates = {};
    if (fields.name)  updates.name  = fields.name;
    if (fields.phone) updates.phone = fields.phone;
    if (Object.keys(updates).length) {
      await setDoc(ref, updates, { merge: true });
    }
  }
  const snap = await getDoc(ref);
  return { uid, ...snap.data() };
};

// ── Phone-only Sign In (no Firebase Auth, no OTP) ────────────────────────────

/**
 * Register or return a customer by phone number only.
 * Generates a stable UID from the phone (so the same phone always maps to the
 * same Firestore doc) and persists the session to localStorage.
 *
 * Returns the user profile { uid, name, phone, role }.
 */
export const signInWithPhone = async (phone, name = '') => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) throw new Error('Please enter a valid 10-digit phone number.');

  const fullPhone = `+91${cleaned}`;

  // Derive a deterministic UID from the phone number so the same phone always
  // maps to the same Firestore document.
  const uid = `phone_${cleaned}`;

  // Check if Firestore doc already exists for this phone
  const existing = await getUserProfile(uid);

  let profile;
  if (existing) {
    // Returning customer — optionally update name
    profile = existing;
    if (name.trim() && name.trim() !== existing.name) {
      profile = await createOrUpdateUserProfile(uid, { name: name.trim() });
    }
  } else {
    // New customer
    profile = await createOrUpdateUserProfile(uid, {
      phone: fullPhone,
      name: name.trim() || fullPhone,
    });
  }

  saveCustomerSession(profile);
  return profile;
};

// ── Email/Password Auth (Admin only) ─────────────────────────────────────────

/** Admin sign in with email + password. */
export const signInWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  let profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    profile = { uid: cred.user.uid, email: cred.user.email, name: 'Admin', role: 'admin' };
  }
  return profile;
};

/** Sign out. Clears localStorage session for customers; Firebase sign-out for admin. */
export const signOutUser = async () => {
  clearCustomerSession();
  try { await signOut(auth); } catch (_) {}
};

// ── Auth State Listener ───────────────────────────────────────────────────────

/**
 * Subscribe to auth state.
 * - Customers: restore from localStorage immediately.
 * - Admin: use Firebase onAuthStateChanged.
 * Calls `callback(profile | null)`.
 * Returns an unsubscribe function.
 */
export const subscribeToAuthState = (callback) => {
  // Restore customer session from localStorage first (instant, no network)
  const customerSession = loadCustomerSession();
  if (customerSession) {
    // Defer slightly so Redux store is ready
    setTimeout(() => callback(customerSession), 0);
  }

  // Also listen for Firebase admin sessions
  const unsubFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Firebase user = admin (customers don't use Firebase Auth)
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile?.role === 'admin') {
        callback(profile);
      }
      // If no Firestore profile found for Firebase user, ignore
      // (customer localStorage session already handled above)
    } else {
      // Firebase signed out — only signal logout if no customer session
      if (!loadCustomerSession()) {
        callback(null);
      }
    }
  });

  return unsubFirebase;
};
