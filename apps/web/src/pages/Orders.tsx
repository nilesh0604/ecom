import { OrderDetails, OrderHistoryList } from '@/components/orders';
import type { Order } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Orders Page
 *
 * Displays user's order history with ability to view details.
 * Protected route - requires authentication.
 *
 * Features:
 * - List of all orders
 * - Click to view order details
 * - Filter by status
 * - Mock data for demonstration
 */

// Mock orders data for demonstration
// In a real app, this would come from an API call
const mockOrders: Order[] = [
  {
    id: 'ord-001-abc-def-123',
    userId: 1,
    products: [
      {
        id: 1,
        title: 'iPhone 15 Pro Max',
        price: 1499,
        quantity: 1,
        total: 1499,
        discountPercentage: 5,
        discountedTotal: 1424.05,
        thumbnail: 'https://cdn.dummyjson.com/products/images/smartphones/iPhone%2015%20Pro%20Max/thumbnail.png',
      },
      {
        id: 2,
        title: 'AirPods Pro',
        price: 249,
        quantity: 2,
        total: 498,
        discountPercentage: 10,
        discountedTotal: 448.2,
        thumbnail: 'https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20AirPods%20Max%20Silver/thumbnail.png',
      },
    ],
    total: 1872.25,
    status: 'delivered',
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-20T14:00:00Z',
  },
  {
    id: 'ord-002-xyz-789-456',
    userId: 1,
    products: [
      {
        id: 3,
        title: 'MacBook Pro 16"',
        price: 2499,
        quantity: 1,
        total: 2499,
        discountPercentage: 0,
        discountedTotal: 2499,
        thumbnail: 'https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png',
      },
    ],
    total: 2499,
    status: 'shipped',
    createdAt: '2024-12-22T09:15:00Z',
    updatedAt: '2024-12-23T11:30:00Z',
  },
  {
    id: 'ord-003-mno-321-654',
    userId: 1,
    products: [
      {
        id: 4,
        title: 'Nike Air Max',
        price: 179,
        quantity: 1,
        total: 179,
        discountPercentage: 15,
        discountedTotal: 152.15,
        thumbnail: 'https://cdn.dummyjson.com/products/images/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/thumbnail.png',
      },
      {
        id: 5,
        title: 'Running Shorts',
        price: 45,
        quantity: 2,
        total: 90,
        discountPercentage: 0,
        discountedTotal: 90,
        thumbnail: 'https://cdn.dummyjson.com/products/images/mens-shirts/Blue%20&%20Black%20Check%20Shirt/thumbnail.png',
      },
    ],
    total: 242.15,
    status: 'processing',
    createdAt: '2024-12-24T08:00:00Z',
    updatedAt: '2024-12-24T08:00:00Z',
  },
];

type StatusFilter = 'all' | Order['status'];

const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return mockOrders;
    return mockOrders.filter((order) => order.status === statusFilter);
  }, [statusFilter]);

  // Get selected order
  const selectedOrder = useMemo(
    () => mockOrders.find((order) => order.id === selectedOrderId),
    [selectedOrderId]
  );

  const handleOrderClick = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedOrderId(null);
  }, []);

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <>
      <Helmet>
        <title>My Orders - eCom</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Orders
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            View and track your order history
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Order status">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  statusFilter === filter.value
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {filter.label}
                {filter.value === 'all' && (
                  <span className="ml-2 py-0.5 px-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {mockOrders.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order List */}
          <div className={selectedOrder ? 'hidden lg:block' : ''}>
            <OrderHistoryList
              orders={filteredOrders}
              onOrderClick={handleOrderClick}
            />
          </div>

          {/* Order Details Panel */}
          {selectedOrder ? (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <OrderDetails
                order={selectedOrder}
                onClose={handleCloseDetails}
              />
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                  Select an order
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Click on an order to view its details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;
