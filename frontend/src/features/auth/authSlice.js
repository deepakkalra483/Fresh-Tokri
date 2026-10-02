/**
 * authSlice.js
 * Manages authentication state via Firebase Auth + Firestore user profiles.
 * role is read from Firestore `users/{uid}.role` — set 'admin' manually in console.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from '../../firebase/authService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await signInWithEmail(email, password);
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Incorrect email or password.'
        : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please try again later.'
            : err.message || 'Login failed. Please try again.';
      return rejectWithValue(msg);
    }
  }
);

export const signupWithEmail = createAsyncThunk(
  'auth/signupWithEmail',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      return await signUpWithEmail(email, password, name);
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists. Please login.'
        : err.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters.'
          : err.message || 'Sign up failed. Please try again.';
      return rejectWithValue(msg);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await signOutUser();
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  isLoggedIn:  false,
  isAdmin:     false,
  user:        null,  // { uid, name, email, role }
  loginError:  null,
  authLoading: true,  // true while Firebase resolves initial auth state
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by App.jsx from the onAuthStateChanged listener
    setAuthUser: (state, action) => {
      const profile = action.payload; // { uid, name, email, role } | null
      if (profile) {
        state.isLoggedIn  = true;
        state.isAdmin     = profile.role === 'admin';
        state.user        = profile;
      } else {
        state.isLoggedIn  = false;
        state.isAdmin     = false;
        state.user        = null;
      }
      state.authLoading = false;
      state.loginError  = null;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.loginError  = null;
        state.authLoading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        const profile     = action.payload;
        state.isLoggedIn  = true;
        state.isAdmin     = profile.role === 'admin';
        state.user        = profile;
        state.loginError  = null;
        state.authLoading = false;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loginError  = action.payload;
        state.authLoading = false;
      });

    // Sign up
    builder
      .addCase(signupWithEmail.pending, (state) => {
        state.loginError  = null;
        state.authLoading = true;
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        const profile     = action.payload;
        state.isLoggedIn  = true;
        state.isAdmin     = profile.role === 'admin';
        state.user        = profile;
        state.loginError  = null;
        state.authLoading = false;
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.loginError  = action.payload;
        state.authLoading = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isLoggedIn  = false;
      state.isAdmin     = false;
      state.user        = null;
      state.authLoading = false;
    });
  },
});

export const { setAuthUser, clearLoginError } = authSlice.actions;

export const selectIsLoggedIn  = (state) => state.auth.isLoggedIn;
export const selectIsAdmin     = (state) => state.auth.isAdmin;
export const selectCurrentUser = (state) => state.auth.user;
export const selectLoginError  = (state) => state.auth.loginError;
export const selectAuthLoading = (state) => state.auth.authLoading;

export default authSlice.reducer;
