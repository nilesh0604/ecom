import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

interface OrderConfirmationProps {
  orderId: string;
  email: string;
}

/**
 * OrderConfirmation Component
 *
 * Step 4 of checkout - success screen after order is placed.
 *
 * Features:
 * - Animated success checkmark
 * - Order ID for reference
 * - Email confirmation notice
 * - Navigation to continue shopping or view orders
 */
const OrderConfirmation = ({ orderId, email }: OrderConfirmationProps) => {
  return (
    <div className="py-8 text-center">
      {/* Success Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <svg
          className="h-10 w-10 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Success Message */}
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Order Confirmed!
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Thank you for your purchase
      </p>

      {/* Order Details */}
      <div className="mx-auto mb-8 max-w-sm rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
          <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
            {orderId}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Confirmation sent to
          </p>
          <p className="font-medium text-gray-900 dark:text-white">{email}</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto mb-8 max-w-md rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-left text-sm dark:border-indigo-800 dark:bg-indigo-900/20">
        <div className="flex gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-indigo-700 dark:text-indigo-300">
            <p className="font-medium">What happens next?</p>
            <ul className="mt-2 space-y-1">
              <li>• You&apos;ll receive an email confirmation shortly</li>
              <li>• We&apos;ll notify you when your order ships</li>
              <li>• Estimated delivery: 3-5 business days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link to="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
        <Link to="/orders">
          <Button variant="secondary" size="lg">
            View Order History
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
