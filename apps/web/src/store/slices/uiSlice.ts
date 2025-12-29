/**
 * UI Redux Slice
 * 
 * Manages UI state including theme, sidebar visibility, and toast notifications.
 * Provides a centralized way to control UI elements from any component.
 * 
 * @module store/slices/uiSlice
 * 
 * State Structure:
 * - theme: Current color theme ('light' or 'dark')
 * - sidebarOpen: Mobile sidebar visibility
 * - toasts: Array of active toast notifications
 * 
 * @example
 * ```tsx
 * // Set theme
 * dispatch(setTheme('dark'));
 * 
 * // Toggle sidebar
 * dispatch(toggleSidebar());
 * 
 * // Show toast notification
 * dispatch(addToast({ id: 'unique-id', type: 'success', message: 'Saved!' }));
 * ```
 */
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Toast notification types
 * @typedef {'success' | 'error' | 'info' | 'warning'} ToastType
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification interface
 * @interface Toast
 */
export interface Toast {
  /** Unique identifier for the toast */
  id: string;
  /** Visual style/severity of the toast */
  type: ToastType;
  /** Message to display */
  message: string;
  /** Duration in ms before auto-dismiss (optional) */
  duration?: number;
}

/**
 * UI state interface
 * @interface UIState
 */
export interface UIState {
  /** Current color theme */
  theme: 'light' | 'dark';
  /** Whether mobile sidebar is open */
  sidebarOpen: boolean;
  /** Array of active toast notifications */
  toasts: Toast[];
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    addToast(state, action: PayloadAction<Toast>) {
      state.toasts.push(action.payload);
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

export default uiSlice.reducer;
