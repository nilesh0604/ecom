import type { Order } from '@/types';
import { formatCurrency } from '@/utils';

interface OrderDetailsProps {
  order: Order;
  onClose?: () => void;
  onReorder?: () => void;
  onCancelOrder?: () => void;
}

/**
 * OrderDetails Component
 *
 * Displays detailed view of a specific order.
 * Shows all items, shipping info, timeline, and actions.
 *
 * Features:
 * - Complete order information
 * - Order timeline/progress
 * - Item breakdown with quantities
 * - Action buttons (reorder, cancel, track)
 */

const OrderDetails = ({ order, onClose, onReorder, onCancelOrder }: OrderDetailsProps) => {
  // Status badge colors
  const getStatusStyles = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Order progress steps
  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'] as const;
  const currentStepIndex = statusSteps.indexOf(order.status as typeof statusSteps[number]);
  const isCancelled = order.status === 'cancelled';

  // Calculate totals
  const subtotal = order.products.reduce((sum, item) => sum + item.total, 0);
  const discountTotal = order.products.reduce(
    (sum, item) => sum + (item.total - item.discountedTotal),
    0
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusStyles(
              order.status
            )}`}
          >
            {order.status}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Order Progress Timeline */}
      {!isCancelled && (
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Order Progress
          </h3>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-indigo-600 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-indigo-100 dark:ring-indigo-900' : ''}`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium capitalize ${
                        isCompleted
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Notice */}
      {isCancelled && (
        <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">
              This order was cancelled on {formatDate(order.updatedAt)}
            </p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Order Items ({order.products.length})
        </h3>
        <div className="space-y-4">
          {order.products.map((item) => (
            <div key={item.id} className="flex gap-4">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.discountedTotal)}
                  </span>
                  {item.discountPercentage > 0 && (
                    <span className="text-xs text-gray-500 line-through">
                      {formatCurrency(item.total)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Discount</span>
              <span className="text-green-600 dark:text-green-400">
                -{formatCurrency(discountTotal)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Shipping</span>
            <span className="text-gray-900 dark:text-white">Free</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Tax</span>
            <span className="text-gray-900 dark:text-white">Included</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <span className="font-medium text-gray-900 dark:text-white">Total</span>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex flex-wrap gap-3">
        {order.status === 'delivered' && onReorder && (
          <button
            onClick={onReorder}
            className="flex-1 min-w-[120px] px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Buy Again
          </button>
        )}
        {order.status === 'shipped' && (
          <button className="flex-1 min-w-[120px] px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Track Package
          </button>
        )}
        {(order.status === 'pending' || order.status === 'processing') && onCancelOrder && (
          <button
            onClick={onCancelOrder}
            className="flex-1 min-w-[120px] px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            Cancel Order
          </button>
        )}
        <button className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
          Need Help?
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
