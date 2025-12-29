import { Button } from '@/components/ui';
import { formatCurrency } from '@/utils/formatCurrency';
import { Link } from 'react-router-dom';

/**
 * CartSummary - Displays cart totals and checkout CTA
 * 
 * Features:
 * - Subtotal, discounts, tax, shipping breakdown
 * - Checkout button
 * - Savings highlight
 */

interface CartSummaryProps {
  subtotal: number;
  discountedTotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  orderTotal: number;
  itemCount: number;
  onCheckout?: () => void;
}

const CartSummary = ({
  subtotal,
  discountedTotal,
  estimatedTax,
  estimatedShipping,
  orderTotal,
  itemCount,
}: CartSummaryProps) => {
  const savings = subtotal - discountedTotal;
  const hasSavings = savings > 0;
  const hasFreeShipping = estimatedShipping === 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Order Summary
      </h2>

      {/* Summary Lines */}
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Discounts */}
        {hasSavings && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">
              Discounts
            </span>
            <span className="text-green-600 dark:text-green-400">
              -{formatCurrency(savings)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Estimated Shipping
          </span>
          <span className={hasFreeShipping ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}>
            {hasFreeShipping ? 'FREE' : formatCurrency(estimatedShipping)}
          </span>
        </div>

        {/* Free Shipping Threshold Message */}
        {!hasFreeShipping && (
          <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded p-2">
            Add {formatCurrency(50 - discountedTotal)} more for free shipping!
          </p>
        )}

        {/* Estimated Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Estimated Tax
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(estimatedTax)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

      {/* Order Total */}
      <div className="flex justify-between">
        <span className="text-base font-bold text-gray-900 dark:text-white">
          Order Total
        </span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formatCurrency(orderTotal)}
        </span>
      </div>

      {/* Savings Banner */}
      {hasSavings && (
        <div className="mt-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">
            🎉 You're saving {formatCurrency(savings)} on this order!
          </p>
        </div>
      )}

      {/* Checkout Button */}
      <div className="mt-6">
        <Link to="/checkout">
          <Button fullWidth size="lg">
            Proceed to Checkout
          </Button>
        </Link>
      </div>

      {/* Continue Shopping Link */}
      <div className="mt-4 text-center">
        <Link
          to="/products"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;
