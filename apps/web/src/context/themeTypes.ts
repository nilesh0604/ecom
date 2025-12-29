import { createContext } from 'react';

/**
 * Theme Types and Context Definition
 * 
 * Provides type-safe theme management for the application.
 * Supports 'light' and 'dark' themes with system preference detection.
 * 
 * @module context/themeTypes
 */

/**
 * Available theme options
 * @typedef {'light' | 'dark'} Theme
 */
export type Theme = 'light' | 'dark';

/**
 * Theme context value interface
 * 
 * @interface ThemeContextValue
 * @property {Theme} theme - Current active theme
 * @property {() => void} toggleTheme - Toggle between light and dark themes
 * @property {(theme: Theme) => void} setTheme - Set a specific theme
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme } = useTheme();
 * 
 * // Toggle theme
 * toggleTheme();
 * 
 * // Set specific theme
 * setTheme('dark');
 * ```
 */
export interface ThemeContextValue {
  /** Current active theme ('light' or 'dark') */
  theme: Theme;
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
  /** Set a specific theme */
  setTheme: (theme: Theme) => void;
}

/**
 * Theme React Context
 * 
 * Provides theme state to the component tree.
 * Must be used within a ThemeProvider component.
 * 
 * @see {@link ThemeProvider} for providing theme context
 * @see {@link useTheme} for consuming theme context
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
