import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

interface OrderStatus {
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  timestamp: string;
  description: string;
  location?: string;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface Order {
  id: string;
  status: OrderStatus['status'];
  createdAt: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  timeline: OrderStatus[];
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ORDER: Order = {
  id: 'ORD-2024-ABC123',
  status: 'shipped',
  createdAt: '2024-12-20T10:30:00Z',
  estimatedDelivery: '2024-12-28T18:00:00Z',
  carrier: 'FedEx',
  trackingNumber: '794644790108',
  timeline: [
    {
      status: 'processing',
      timestamp: '2024-12-20T10:30:00Z',
      description: 'Order confirmed',
    },
    {
      status: 'processing',
      timestamp: '2024-12-20T14:00:00Z',
      description: 'Payment verified',
    },
    {
      status: 'shipped',
      timestamp: '2024-12-21T09:15:00Z',
      description: 'Package shipped',
      location: 'Los Angeles, CA',
    },
    {
      status: 'shipped',
      timestamp: '2024-12-22T16:30:00Z',
      description: 'In transit',
      location: 'Phoenix, AZ',
    },
  ],
  items: [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      quantity: 1,
      price: 199.99,
      variant: 'Midnight Black',
    },
    {
      id: '2',
      name: 'USB-C Charging Cable',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
      quantity: 2,
      price: 19.99,
    },
  ],
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
  },
  subtotal: 239.97,
  shipping: 0,
  tax: 21.00,
  total: 260.97,
};

// ============================================================================
// ORDER TRACKING PAGE
// ============================================================================

/**
 * OrderTracking Page
 *
 * Branded order tracking experience for customers.
 *
 * Features:
 * - Visual timeline/stepper
 * - Estimated delivery countdown
 * - Carrier integration (branded)
 * - Order details and items
 * - Shipping address display
 * - Order modification options
 */
const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');

  // Fetch order data (mock)
  useEffect(() => {
    const fetchOrder = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOrder(MOCK_ORDER);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  // Update countdown timer
  useEffect(() => {
    if (!order) return;

    const updateCountdown = () => {
      const now = new Date();
      const delivery = new Date(order.estimatedDelivery);
      const diff = delivery.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Arriving today!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setCountdown(`${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`);
      } else {
        setCountdown(`${hours} hour${hours > 1 ? 's' : ''}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [order]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusStep = (status: Order['status']): number => {
    const steps = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          We couldn't find an order with ID: {orderId}
        </p>
        <Link
          to="/orders"
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View all orders
        </Link>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const steps = [
    { label: 'Order Placed', icon: '📦' },
    { label: 'Shipped', icon: '🚚' },
    { label: 'Out for Delivery', icon: '📍' },
    { label: 'Delivered', icon: '✅' },
  ];

  return (
    <>
      <Helmet>
        <title>Track Order {order.id} | Your Store</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/orders"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order {order.id}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          {/* Status Card */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800">
            {/* Delivery Countdown */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-100">Estimated Delivery</p>
                  <p className="mt-1 text-2xl font-bold">{formatDate(order.estimatedDelivery)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-indigo-100">Arriving in</p>
                  <p className="mt-1 text-2xl font-bold">{countdown}</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="p-6">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {steps.map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center">
                      <div
                        className={`
                          flex h-10 w-10 items-center justify-center rounded-full text-lg
                          transition-all duration-300
                          ${
                            index <= currentStep
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
                          }
                        `}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={`
                          mt-2 text-xs font-medium
                          ${
                            index <= currentStep
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-400'
                          }
                        `}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                      {order.carrier[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.carrier}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tracking: {order.trackingNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(order.trackingNumber)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Copy Tracking
                </button>
              </div>
            </div>
          </div>

          {/* Timeline & Order Details Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Detailed Timeline */}
            <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Shipment Updates
              </h2>
              <div className="space-y-4">
                {order.timeline.slice().reverse().map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          h-3 w-3 rounded-full
                          ${index === 0 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}
                        `}
                      />
                      {index < order.timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {event.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                        {event.location && ` • ${event.location}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant}</p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address & Actions */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Shipping Address */}
            <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Shipping Address
              </h2>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Need Help?
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to={`/returns/${order.id}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                    />
                  </svg>
                  Start Return
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Contact Support
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reorder Items
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
