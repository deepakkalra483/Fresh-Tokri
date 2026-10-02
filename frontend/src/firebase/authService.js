/**
 * authService.js
 * Firebase Auth helpers — sign up, sign in, sign out, fetch user profile from Firestore.
 * The `users/{uid}` document stores: { name, email, role: 'admin'|'customer', createdAt }
 * Admin role is set manually in Firestore for security.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';

// ── helpers ──────────────────────────────────────────────────────────────────

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

/** Create a new user profile doc (called on first sign-up). */
const createUserProfile = async (uid, name, email) => {
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    role: 'customer',    // default; admin must be set in Firestore console
    createdAt: serverTimestamp(),
  });
  return { uid, name, email, role: 'customer' };
};

// ── Auth operations ──────────────────────────────────────────────────────────

/** Sign up a new customer and create their Firestore profile. */
export const signUpWithEmail = async (email, password, name) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const profile = await createUserProfile(cred.user.uid, name || email.split('@')[0], email);
  return profile;
};

/** Sign in and load existing Firestore profile. Creates one if missing (legacy). */
export const signInWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  let profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    profile = await createUserProfile(cred.user.uid, email.split('@')[0], email);
  }
  return profile;
};

/** Sign out the current user. */
export const signOutUser = async () => {
  await signOut(auth);
};

/**
 * Subscribe to Firebase Auth state changes.
 * On each auth change, also fetches the Firestore user profile.
 * Calls `callback({ uid, name, email, role } | null)`.
 * Returns the unsubscribe function.
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      callback(profile || { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email, role: 'customer' });
    } else {
      callback(null);
    }
  });
};
