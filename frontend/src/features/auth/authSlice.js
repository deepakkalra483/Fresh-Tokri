/**
 * authSlice.js
 * Manages authentication state.
 * - Customers: phone OTP via Firebase Phone Auth
 * - Admin: email/password (accessed via secret URL /admin-deepak)
 * role is stored in Firestore `users/{uid}.role`
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithEmail, signOutUser } from '../../firebase/authService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

/** Admin-only: email + password login */
export const adminLoginWithEmail = createAsyncThunk(
  'auth/adminLoginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await signInWithEmail(email, password);
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect email or password.'
          : err.code === 'auth/user-not-found'
          ? 'No admin account found.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Try again later.'
          : err.message || 'Login failed.';
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
  user:        null,       // { uid, name, phone, role }
  loginError:  null,
  authLoading: true,       // true while Firebase resolves initial session
  // OTP modal state
  otpModalOpen:     false,
  otpPendingAction: null,  // 'checkout' | null — what to do after login
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called by onAuthStateChanged listener in App.jsx */
    setAuthUser: (state, action) => {
      const profile = action.payload;
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
    /** Open the OTP modal. Pass action = 'checkout' to auto-submit order after login. */
    openOTPModal: (state, action) => {
      state.otpModalOpen     = true;
      state.otpPendingAction = action.payload || null;
    },
    closeOTPModal: (state) => {
      state.otpModalOpen     = false;
      state.otpPendingAction = null;
    },
    /** Called after phone sign-in succeeds — sets user without full page reload */
    setUserAfterOTP: (state, action) => {
      const profile = action.payload;
      state.isLoggedIn     = true;
      state.isAdmin        = profile.role === 'admin';
      state.user           = profile;
      state.otpModalOpen   = false;
      state.otpPendingAction = null;
      state.authLoading    = false;
    },
  },
  extraReducers: (builder) => {
    // Admin email login
    builder
      .addCase(adminLoginWithEmail.pending, (state) => {
        state.loginError  = null;
        state.authLoading = true;
      })
      .addCase(adminLoginWithEmail.fulfilled, (state, action) => {
        const profile     = action.payload;
        state.isLoggedIn  = true;
        state.isAdmin     = profile.role === 'admin';
        state.user        = profile;
        state.loginError  = null;
        state.authLoading = false;
      })
      .addCase(adminLoginWithEmail.rejected, (state, action) => {
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

export const {
  setAuthUser,
  clearLoginError,
  openOTPModal,
  closeOTPModal,
  setUserAfterOTP,
} = authSlice.actions;

export const selectIsLoggedIn      = (state) => state.auth.isLoggedIn;
export const selectIsAdmin         = (state) => state.auth.isAdmin;
export const selectCurrentUser     = (state) => state.auth.user;
export const selectLoginError      = (state) => state.auth.loginError;
export const selectAuthLoading     = (state) => state.auth.authLoading;
export const selectOTPModalOpen    = (state) => state.auth.otpModalOpen;
export const selectOTPPendingAction = (state) => state.auth.otpPendingAction;

export default authSlice.reducer;
