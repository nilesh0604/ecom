import type { Order } from '@/types';
import { formatCurrency } from '@/utils';
import { Link } from 'react-router-dom';

interface OrderHistoryListProps {
  orders: Order[];
  loading?: boolean;
  onOrderClick?: (orderId: string) => void;
}

/**
 * OrderHistoryList Component
 *
 * Displays a list of user's past orders.
 * Shows order ID, date, status, and total.
 *
 * Features:
 * - Responsive table/card layout
 * - Status badges with colors
 * - Click to view order details
 * - Empty state handling
 * - Loading skeleton
 */

const OrderHistoryList = ({ orders, loading, onOrderClick }: OrderHistoryListProps) => {
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
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          When you place orders, they'll appear here.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article
          key={order.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer"
          onClick={() => onOrderClick?.(order.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOrderClick?.(order.id);
            }
          }}
        >
          {/* Order Header */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyles(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Content */}
          <div className="p-4">
            {/* Product Thumbnails */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {order.products.slice(0, 4).map((item, index) => (
                  <img
                    key={item.id}
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-10 h-10 rounded-lg object-cover border-2 border-white dark:border-gray-800"
                    style={{ zIndex: 4 - index }}
                  />
                ))}
                {order.products.length > 4 && (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                    +{order.products.length - 4}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Order Summary */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(order.total)}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrderClick?.(order.id);
              }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              View Details
            </button>
            {order.status === 'delivered' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle reorder
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Buy Again
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default OrderHistoryList;
