import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      // Focus the close button when menu opens
      firstFocusableRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800'
    }`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      aria-modal="true"
      role="dialog"
      aria-label="Mobile navigation menu"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={menuRef}
        className="fixed inset-y-0 left-0 w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        data-testid="mobile-menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <NavLink
            to="/"
            className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
            onClick={onClose}
          >
            eCom
          </NavLink>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close menu"
            data-testid="mobile-menu-close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2" aria-label="Mobile navigation">
          <NavLink to="/" className={navLinkClasses} onClick={onClose} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClasses} onClick={onClose}>
            Products
          </NavLink>
          <NavLink to="/cart" className={navLinkClasses} onClick={onClose}>
            Cart
          </NavLink>
          <NavLink to="/checkout" className={navLinkClasses} onClick={onClose}>
            Checkout
          </NavLink>
        </nav>

        {/* Auth Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <NavLink
            to="/auth/login"
            className="block w-full px-4 py-3 text-center text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            onClick={onClose}
          >
            Login
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
