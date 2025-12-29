import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './themeTypes';

/**
 * useTheme - Custom hook for accessing theme context
 * 
 * Provides access to the current theme and theme control functions.
 * Must be used within a ThemeProvider component.
 * 
 * @returns {ThemeContextValue} Theme context value with theme state and controls
 * @throws {Error} If used outside of ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleTheme, setTheme } = useTheme();
 * 
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @see {@link ThemeProvider} for setting up the theme context
 * @see {@link ThemeContextValue} for available properties and methods
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
