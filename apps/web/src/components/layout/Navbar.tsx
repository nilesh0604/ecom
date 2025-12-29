import { UserProfileDropdown } from '@/components/auth';
import { useAppSelector } from '@/store/hooks';
import { selectCartCount } from '@/store/selectors';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar Component - Main application header
 * 
 * Provides primary navigation for the application including:
 * - Logo/brand link to home
 * - Desktop navigation links
 * - Cart button with item count badge
 * - User profile dropdown (when authenticated)
 * - Theme toggle (light/dark mode)
 * - Mobile menu trigger
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <Navbar
 *   onMenuClick={() => setMobileMenuOpen(true)}
 *   onCartClick={() => setCartDrawerOpen(true)}
 * />
 * ```
 * 
 * Accessibility:
 * - Uses semantic header and nav elements
 * - Includes aria-labels for icon buttons
 * - Supports keyboard navigation
 */

/**
 * Props for Navbar component
 * @interface NavbarProps
 */
interface NavbarProps {
  /** Callback when mobile menu button is clicked */
  onMenuClick: () => void;
  /** Callback when cart button is clicked */
  onCartClick: () => void;
}

const Navbar = ({ onMenuClick, onCartClick }: NavbarProps) => {
  const cartCount = useAppSelector(selectCartCount);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open menu"
            data-testid="mobile-menu-button"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <NavLink
            to="/"
            className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            eCom
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation" data-testid="desktop-nav">
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClasses}>
              Products
            </NavLink>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search Trigger (Placeholder) */}
            <button
              className="hidden sm:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search products"
              data-testid="search-button"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart - Button that opens drawer */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`Shopping cart with ${cartCount} items`}
              data-testid="cart-button"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-indigo-600 rounded-full" data-testid="cart-badge">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <UserProfileDropdown />
            ) : (
              <NavLink
                to="/auth/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                data-testid="navbar-login-button"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
