import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  variant?: string;
}

type ReturnReason =
  | 'wrong_size'
  | 'defective'
  | 'not_as_described'
  | 'changed_mind'
  | 'arrived_late'
  | 'other';

interface ReturnItem {
  itemId: string;
  quantity: number;
  reason: ReturnReason;
  condition: 'unopened' | 'opened' | 'used';
  notes?: string;
}

type ReturnStep = 'select_items' | 'reason' | 'shipping' | 'confirm' | 'success';

// ============================================================================
// CONSTANTS
// ============================================================================

const RETURN_REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'wrong_size', label: 'Wrong size or fit' },
  { value: 'defective', label: 'Item is defective or damaged' },
  { value: 'not_as_described', label: 'Item not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'arrived_late', label: 'Arrived too late' },
  { value: 'other', label: 'Other reason' },
];

const MOCK_ORDER_ITEMS: OrderItem[] = [
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
];

// ============================================================================
// RETURNS PORTAL PAGE
// ============================================================================

/**
 * ReturnsPortal Page
 *
 * Self-service returns initiation for customers.
 *
 * Features:
 * - Select items to return
 * - Return reason selection
 * - Condition assessment
 * - Prepaid label generation
 * - Return tracking preview
 */
const ReturnsPortal = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [currentStep, setCurrentStep] = useState<ReturnStep>('select_items');
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [returnDetails, setReturnDetails] = useState<Map<string, ReturnItem>>(new Map());
  const [shippingMethod, setShippingMethod] = useState<'prepaid' | 'self'>('prepaid');
  const [returnId, setReturnId] = useState<string>('');

  const handleItemToggle = (itemId: string, maxQty: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(itemId)) {
        newMap.delete(itemId);
      } else {
        newMap.set(itemId, maxQty);
      }
      return newMap;
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(itemId, quantity);
      return newMap;
    });
  };

  const handleReasonChange = (
    itemId: string,
    field: keyof ReturnItem,
    value: ReturnItem[keyof ReturnItem]
  ) => {
    setReturnDetails((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || {
        itemId,
        quantity: selectedItems.get(itemId) || 1,
        reason: 'changed_mind' as ReturnReason,
        condition: 'opened' as const,
      };
      newMap.set(itemId, { ...existing, [field]: value });
      return newMap;
    });
  };

  const handleSubmitReturn = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newReturnId = `RET-${Date.now().toString(36).toUpperCase()}`;
    setReturnId(newReturnId);
    setCurrentStep('success');
  };

  const calculateRefundTotal = () => {
    let total = 0;
    selectedItems.forEach((qty, itemId) => {
      const item = MOCK_ORDER_ITEMS.find((i) => i.id === itemId);
      if (item) {
        total += item.price * qty;
      }
    });
    return total;
  };

  const steps = [
    { key: 'select_items', label: 'Select Items' },
    { key: 'reason', label: 'Reason' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'confirm', label: 'Confirm' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select_items':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select items to return
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose which items from your order you'd like to return.
            </p>

            <div className="mt-6 space-y-4">
              {MOCK_ORDER_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className={`
                    flex items-center gap-4 rounded-xl border-2 p-4 transition-all
                    ${
                      selectedItems.has(item.id)
                        ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleItemToggle(item.id, item.quantity)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    {item.variant && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant}</p>
                    )}
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  {selectedItems.has(item.id) && item.quantity > 1 && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">Qty:</label>
                      <select
                        value={selectedItems.get(item.id)}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
                      >
                        {Array.from({ length: item.quantity }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep('reason')}
                disabled={selectedItems.size === 0}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'reason':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Why are you returning these items?
            </h2>

            {Array.from(selectedItems.keys()).map((itemId) => {
              const item = MOCK_ORDER_ITEMS.find((i) => i.id === itemId);
              if (!item) return null;

              return (
                <div
                  key={itemId}
                  className="rounded-xl border border-gray-200 p-6 dark:border-gray-700"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {selectedItems.get(itemId)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reason for return
                      </label>
                      <select
                        value={returnDetails.get(itemId)?.reason || 'changed_mind'}
                        onChange={(e) =>
                          handleReasonChange(itemId, 'reason', e.target.value as ReturnReason)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700"
                      >
                        {RETURN_REASONS.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Item condition
                      </label>
                      <div className="flex gap-4">
                        {[
                          { value: 'unopened', label: 'Unopened' },
                          { value: 'opened', label: 'Opened' },
                          { value: 'used', label: 'Used' },
                        ].map((condition) => (
                          <label
                            key={condition.value}
                            className={`
                              flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all
                              ${
                                (returnDetails.get(itemId)?.condition || 'opened') ===
                                condition.value
                                  ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                                  : 'border-gray-200 dark:border-gray-600'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name={`condition-${itemId}`}
                              value={condition.value}
                              checked={
                                (returnDetails.get(itemId)?.condition || 'opened') ===
                                condition.value
                              }
                              onChange={() =>
                                handleReasonChange(
                                  itemId,
                                  'condition',
                                  condition.value as 'unopened' | 'opened' | 'used'
                                )
                              }
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{condition.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Additional notes (optional)
                      </label>
                      <textarea
                        value={returnDetails.get(itemId)?.notes || ''}
                        onChange={(e) => handleReasonChange(itemId, 'notes', e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Tell us more about why you're returning this item..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep('select_items')}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('shipping')}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              How would you like to return your items?
            </h2>

            <div className="space-y-4">
              <label
                className={`
                  flex cursor-pointer items-start gap-4 rounded-xl border-2 p-6 transition-all
                  ${
                    shippingMethod === 'prepaid'
                      ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="prepaid"
                  checked={shippingMethod === 'prepaid'}
                  onChange={() => setShippingMethod('prepaid')}
                  className="mt-1 h-5 w-5 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Prepaid Return Label
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                      Free
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    We'll email you a prepaid shipping label. Just print it and drop off your
                    package at any UPS location.
                  </p>
                </div>
              </label>

              <label
                className={`
                  flex cursor-pointer items-start gap-4 rounded-xl border-2 p-6 transition-all
                  ${
                    shippingMethod === 'self'
                      ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="self"
                  checked={shippingMethod === 'self'}
                  onChange={() => setShippingMethod('self')}
                  className="mt-1 h-5 w-5 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Ship It Yourself
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Your cost
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Use your preferred carrier and pay for shipping yourself. Keep your receipt for
                    reimbursement if eligible.
                  </p>
                </div>
              </label>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Return Policy</p>
                  <p className="mt-1">
                    Items must be returned within 30 days of delivery. Items should be in original
                    packaging when possible.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep('reason')}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('confirm')}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Confirm your return
            </h2>

            {/* Items Summary */}
            <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-700">
              <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Items to Return</h3>
              <div className="space-y-3">
                {Array.from(selectedItems.keys()).map((itemId) => {
                  const item = MOCK_ORDER_ITEMS.find((i) => i.id === itemId);
                  if (!item) return null;
                  const qty = selectedItems.get(itemId) || 1;

                  return (
                    <div key={itemId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {qty}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${(item.price * qty).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Refund Summary */}
            <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
              <div className="flex justify-between text-lg font-medium text-gray-900 dark:text-white">
                <span>Estimated Refund</span>
                <span>${calculateRefundTotal().toFixed(2)}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Refunds are typically processed within 3-5 business days after we receive your
                return.
              </p>
            </div>

            {/* Shipping Method */}
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Return Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {shippingMethod === 'prepaid' ? 'Prepaid Label (Free)' : 'Self-shipped'}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep('shipping')}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitReturn}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Submit Return Request
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="py-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-10 w-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Return Request Submitted!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your return ID is <span className="font-medium">{returnId}</span>
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-xl bg-gray-50 p-6 text-left dark:bg-gray-800">
              <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Next Steps</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                    1
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Check your email for the prepaid return label
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                    2
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Pack your items securely and attach the label
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                    3
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Drop off at any UPS location
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                    4
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Refund processed within 3-5 business days of receipt
                  </span>
                </li>
              </ol>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                to={`/orders/${orderId}`}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back to Order
              </Link>
              <Link
                to="/"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        );
    }
  };

  if (currentStep === 'success') {
    return (
      <>
        <Helmet>
          <title>Return Confirmed | Your Store</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
          <div className="mx-auto max-w-2xl px-4">{renderStepContent()}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Return Items - Order {orderId} | Your Store</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to={`/orders/${orderId}`}
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Order
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Start a Return</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Order {orderId}</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`
                      flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                      ${
                        index <= currentStepIndex
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                      }
                    `}
                  >
                    {index < currentStepIndex ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`ml-2 hidden text-sm font-medium sm:block ${
                      index <= currentStepIndex
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 hidden h-0.5 flex-1 sm:block ${
                        index < currentStepIndex
                          ? 'bg-indigo-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnsPortal;
