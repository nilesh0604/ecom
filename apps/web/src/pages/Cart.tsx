import { CartItem, CartSummary } from '@/components/cart';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    selectCartCount,
    selectCartSavings,
    selectCartSubtotal,
    selectCartTotal,
    selectEstimatedShipping,
    selectEstimatedTax,
    selectIsCartEmpty,
    selectOrderTotal,
} from '@/store/selectors';
import { clearCart, removeCartItem, updateCartQuantity } from '@/store/slices/cartSlice';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

/**
 * Cart Page - Full page cart view
 * 
 * Features:
 * - List of all cart items with quantity controls
 * - Order summary with totals
 * - Clear cart functionality
 * - Empty state
 * - Responsive layout
 */

const Cart = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const items = useAppSelector((state) => state.cart.items);
  const isEmpty = useAppSelector(selectIsCartEmpty);
  const itemCount = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const discountedTotal = useAppSelector(selectCartTotal);
  const savings = useAppSelector(selectCartSavings);
  const estimatedTax = useAppSelector(selectEstimatedTax);
  const estimatedShipping = useAppSelector(selectEstimatedShipping);
  const orderTotal = useAppSelector(selectOrderTotal);

  const handleQuantityChange = (id: number, quantity: number) => {
    dispatch(updateCartQuantity({ id, quantity }));
  };

  const handleRemove = (id: number) => {
    const item = items.find((i) => i.id === id);
    dispatch(removeCartItem(id));
    if (item) {
      toast.info(`${item.title} removed from cart`);
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.info('Cart cleared');
  };

  return (
    <>
      <Helmet>
        <title>{`Your Cart (${itemCount ?? 0}) - eCom`}</title>
      </Helmet>

      <section>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Your Cart
            {!isEmpty && (
              <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>

          {!isEmpty && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          /* Empty Cart State */
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
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
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Looks like you haven't added anything yet.
            </p>
            <div className="mt-6">
              <Link to="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Savings Banner (Mobile) */}
              {savings > 0 && (
                <div className="lg:hidden mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">
                    🎉 You're saving ${savings.toFixed(2)} on this order!
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary
                  subtotal={subtotal}
                  discountedTotal={discountedTotal}
                  estimatedTax={estimatedTax}
                  estimatedShipping={estimatedShipping}
                  orderTotal={orderTotal}
                  itemCount={itemCount}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Cart;
