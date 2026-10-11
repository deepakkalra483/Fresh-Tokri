/**
 * authService.js
 * Firebase Auth helpers — Phone OTP (customer) + Email/Password (admin).
 * Phone Auth uses invisible reCAPTCHA (user never sees it).
 * The `users/{uid}` document stores: { name, phone, role: 'admin'|'customer', createdAt }
 * Admin role is set manually in Firestore for security.
 */
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';

// ── reCAPTCHA (invisible) ─────────────────────────────────────────────────────

let recaptchaVerifier = null;

/**
 * Initialise or reuse the invisible reCAPTCHA verifier.
 * `containerId` must be the id of a <div> rendered in the DOM.
 */
export const getRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  // Clear previous instance if it exists (avoid duplicate reCAPTCHA widgets)
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch (_) {}
    recaptchaVerifier = null;
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {}, // fires silently
  });
  return recaptchaVerifier;
};

// ── Firestore profile helpers ────────────────────────────────────────────────

/** Fetch the user profile doc from Firestore. Returns null if not found. */
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
      ...fields,
    });
  } else if (fields.name) {
    // Only update name if provided (don't overwrite role)
    await setDoc(ref, { name: fields.name }, { merge: true });
  }
  const snap = await getDoc(ref);
  return { uid, ...snap.data() };
};

// ── Phone OTP Auth ────────────────────────────────────────────────────────────

/**
 * Step 1: Send OTP to a phone number.
 * Returns a Firebase ConfirmationResult object.
 * phoneNumber must include country code e.g. "+919876543210"
 */
export const sendOTP = async (phoneNumber, containerId = 'recaptcha-container') => {
  const verifier = getRecaptchaVerifier(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return confirmationResult;
};

/**
 * Step 2: Verify the OTP and sign in.
 * Returns the user profile from Firestore (creates one if first time).
 * Optionally saves `name` to the profile.
 */
export const verifyOTP = async (confirmationResult, otp, name = '') => {
  const cred = await confirmationResult.confirm(otp);
  const { user } = cred;

  // Update Firebase Auth displayName if name provided
  if (name.trim()) {
    await updateProfile(user, { displayName: name.trim() });
  }

  // Create or fetch Firestore profile
  const profile = await createOrUpdateUserProfile(user.uid, {
    phone: user.phoneNumber,
    name: name.trim() || user.displayName || user.phoneNumber,
  });

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

/** Sign out the current user. */
export const signOutUser = async () => {
  await signOut(auth);
};

// ── Auth State Listener ───────────────────────────────────────────────────────

/**
 * Subscribe to Firebase Auth state changes.
 * On each auth change, fetches the Firestore user profile.
 * Calls `callback({ uid, name, phone, role } | null)`.
 * Returns the unsubscribe function.
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      callback(
        profile || {
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber,
          name: firebaseUser.displayName || firebaseUser.phoneNumber || 'Customer',
          role: 'customer',
        }
      );
    } else {
      callback(null);
    }
  });
};
