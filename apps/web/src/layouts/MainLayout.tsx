import { CartDrawer } from '@/components/cart';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Footer, MobileMenu, Navbar } from '@/components/layout';
import { ToastContainer } from '@/components/ui';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Skip Links for Keyboard Navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-white dark:focus:bg-gray-800 focus:px-4 focus:py-2 focus:text-indigo-600 dark:focus:text-indigo-400 focus:shadow-lg focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Skip to main content
        </a>
        <a
          href="#footer"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 focus:z-[200] focus:bg-white dark:focus:bg-gray-800 focus:px-4 focus:py-2 focus:text-indigo-600 dark:focus:text-indigo-400 focus:shadow-lg focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Skip to footer
        </a>

        <Navbar
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onCartClick={() => setIsCartDrawerOpen(true)}
        />
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <CartDrawer
          isOpen={isCartDrawerOpen}
          onClose={() => setIsCartDrawerOpen(false)}
        />
        <ToastContainer />

        <main id="main-content" className="flex-1" tabIndex={-1}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
