/**
 * Authentication Redux Slice
 * 
 * Manages user authentication state including login status, user data,
 * and authentication tokens.
 * 
 * @module store/slices/authSlice
 * 
 * State Structure:
 * - user: Current logged-in user data (null if not logged in)
 * - token: JWT access token for API authentication
 * - refreshToken: Token for refreshing expired access tokens
 * - isAuthenticated: Boolean indicating login status
 * - loading: Auth operation in progress
 * - error: Error message from failed auth operation
 * 
 * Persistence:
 * - Tokens are stored in localStorage for session persistence
 * - User data is re-fetched on app load via token validation
 * 
 * @example
 * ```tsx
 * // Set auth state after login
 * dispatch(setAuthSuccess({ user, token, refreshToken }));
 * 
 * // Logout user
 * dispatch(logout());
 * ```
 */
import type { User } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Authentication state interface
 * @interface AuthState
 */
export interface AuthState {
  /** Current authenticated user (null if not logged in) */
  user: User | null;
  /** JWT access token for API requests */
  token: string | null;
  /** Refresh token for obtaining new access tokens */
  refreshToken: string | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether auth operation is in progress */
  loading: boolean;
  /** Error message from failed auth operation */
  error: string | null;
}

/**
 * Payload for successful authentication
 * @interface AuthSuccessPayload
 */
export interface AuthSuccessPayload {
  /** Authenticated user data */
  user: User;
  /** Optional access token (omitted for token refresh) */
  token?: string;
  /** Optional refresh token */
  refreshToken?: string;
}

const initialToken = localStorage.getItem('authToken');
const initialRefreshToken = localStorage.getItem('refreshToken');

const initialState: AuthState = {
  user: null,
  token: initialToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthPending(state) {
      state.loading = true;
      state.error = null;
    },
    setAuthSuccess(state, action: PayloadAction<AuthSuccessPayload>) {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      if (action.payload.token) {
        state.token = action.payload.token;
        localStorage.setItem('authToken', action.payload.token);
      }

      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setAuthPending, setAuthSuccess, setAuthError, logout } =
  authSlice.actions;

export default authSlice.reducer;
