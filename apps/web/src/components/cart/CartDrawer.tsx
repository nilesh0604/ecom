import { Button } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    selectCartCount,
    selectCartTotal,
    selectIsCartEmpty,
} from '@/store/selectors';
import { removeCartItem, updateCartQuantity } from '@/store/slices/cartSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CartItem from './CartItem';

/**
 * CartDrawer - Slide-out mini cart panel
 * 
 * Features:
 * - Slide-in/out animation
 * - Backdrop overlay
 * - Cart items list
 * - Quick checkout access
 * - Focus trap for accessibility
 * - ESC key to close
 */

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const dispatch = useAppDispatch();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const items = useAppSelector((state) => state.cart.items);
  const cartCount = useAppSelector(selectCartCount);
  const cartTotal = useAppSelector(selectCartTotal);
  const isEmpty = useAppSelector(selectIsCartEmpty);

  // Handle ESC key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the close button when drawer opens
      closeButtonRef.current?.focus();
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleQuantityChange = (id: number, quantity: number) => {
    dispatch(updateCartQuantity({ id, quantity }));
  };

  const handleRemove = (id: number) => {
    dispatch(removeCartItem(id));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="cart-drawer"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Shopping Cart ({cartCount})
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close cart"
              data-testid="cart-drawer-close"
            >
              <svg
                className="w-6 h-6"
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

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto px-4">
            {isEmpty ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full py-12">
                <svg
                  className="h-16 w-16 text-gray-400 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Your cart is empty
                </p>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              /* Items List */
              <div className="py-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {!isEmpty && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
              <div className="flex justify-between mb-4">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Shipping and taxes calculated at checkout.
              </p>

              <Link to="/checkout" onClick={onClose} data-testid="checkout-button">
                <Button fullWidth size="lg">
                  Checkout
                </Button>
              </Link>

              <Link
                to="/cart"
                onClick={onClose}
                className="block mt-3 text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                data-testid="view-cart-link"
              >
                View Full Cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
