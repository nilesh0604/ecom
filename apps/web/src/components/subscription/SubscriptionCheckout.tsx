/**
 * SubscriptionCheckout Component
 * Checkout flow for creating a new subscription
 * DTC Feature: Subscription Commerce (6.1)
 */

import React, { useState } from 'react';

interface SubscriptionProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
  maxQuantity?: number;
}

interface Frequency {
  id: string;
  label: string;
  interval: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  discount?: number;
}

export interface SubscriptionCheckoutProps {
  products: SubscriptionProduct[];
  frequencies: Frequency[];
  defaultQuantities?: Record<number, number>;
  defaultFrequency?: string;
  onSubmit?: (data: {
    items: Array<{ productId: number; quantity: number }>;
    frequencyId: string;
    startDate?: Date;
  }) => void;
  onBack?: () => void;
  loading?: boolean;
  className?: string;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  products,
  frequencies,
  defaultQuantities = {},
  defaultFrequency,
  onSubmit,
  onBack,
  loading = false,
  className = '',
}) => {
  const [step, setStep] = useState<'products' | 'frequency' | 'review'>('products');
  const [quantities, setQuantities] = useState<Record<number, number>>(defaultQuantities);
  const [selectedFrequency, setSelectedFrequency] = useState(defaultFrequency || frequencies[0]?.id);
  const [startDate, setStartDate] = useState<string>('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const currentFreq = frequencies.find((f) => f.id === selectedFrequency);

  const selectedProducts = products.filter((p) => (quantities[p.id] || 0) > 0);

  const subtotal = selectedProducts.reduce(
    (sum, p) => sum + p.price * (quantities[p.id] || 0),
    0
  );

  const discountAmount = currentFreq?.discount ? subtotal * (currentFreq.discount / 100) : 0;
  const total = subtotal - discountAmount;

  const updateQuantity = (productId: number, qty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, qty),
    }));
  };

  const handleSubmit = () => {
    onSubmit?.({
      items: selectedProducts.map((p) => ({
        productId: p.id,
        quantity: quantities[p.id] || 1,
      })),
      frequencyId: selectedFrequency,
      startDate: startDate ? new Date(startDate) : undefined,
    });
  };

  const canProceed = () => {
    if (step === 'products') return selectedProducts.length > 0;
    if (step === 'frequency') return !!selectedFrequency;
    return true;
  };

  const getIntervalLabel = (interval: string) => {
    const labels: Record<string, string> = {
      weekly: 'Every week',
      biweekly: 'Every 2 weeks',
      monthly: 'Every month',
      quarterly: 'Every 3 months',
    };
    return labels[interval] || interval;
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Progress Steps */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[
            { key: 'products', label: 'Products' },
            { key: 'frequency', label: 'Frequency' },
            { key: 'review', label: 'Review' },
          ].map((s, index) => (
            <React.Fragment key={s.key}>
              <button
                onClick={() => {
                  const steps = ['products', 'frequency', 'review'];
                  const currentIndex = steps.indexOf(step);
                  if (steps.indexOf(s.key) <= currentIndex) {
                    setStep(s.key as 'products' | 'frequency' | 'review');
                  }
                }}
                className={`flex items-center gap-2 ${
                  step === s.key ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="hidden sm:inline font-medium">{s.label}</span>
              </button>
              {index < 2 && (
                <div className="flex-1 h-px bg-gray-200 mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {/* Products Step */}
        {step === 'products' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Select Products
              </h2>
              <p className="text-gray-600">
                Choose the products you'd like to receive regularly
              </p>
            </div>

            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                    (quantities[product.id] || 0) > 0
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-gray-600">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(product.id, (quantities[product.id] || 0) - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">
                      {quantities[product.id] || 0}
                    </span>
                    <button
                      onClick={() => {
                        const max = product.maxQuantity || 10;
                        const current = quantities[product.id] || 0;
                        if (current < max) {
                          updateQuantity(product.id, current + 1);
                        }
                      }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequency Step */}
        {step === 'frequency' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Choose Frequency
              </h2>
              <p className="text-gray-600">
                How often would you like to receive your subscription?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frequencies.map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setSelectedFrequency(freq.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedFrequency === freq.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{freq.label}</h3>
                  <p className="text-sm text-gray-500">
                    {getIntervalLabel(freq.interval)}
                  </p>
                  {freq.discount && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-sm font-medium rounded">
                      Save {freq.discount}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Start Date (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to start immediately
              </p>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Review Your Subscription
              </h2>
              <p className="text-gray-600">
                Confirm your subscription details before checkout
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Items</h3>
              <div className="space-y-2">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex justify-between">
                    <span className="text-gray-700">
                      {product.name} × {quantities[product.id]}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(product.price * (quantities[product.id] || 0))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Delivery Schedule</h3>
              <p className="text-gray-700">{currentFreq?.label}</p>
              {startDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Starting {new Date(startDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Subscription Discount ({currentFreq?.discount}%)</span>
                  <span>−{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total per delivery</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Subscription Benefits</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>✓ Free shipping on every order</li>
                <li>✓ Cancel or modify anytime</li>
                <li>✓ Skip deliveries when you need to</li>
                {discountAmount > 0 && (
                  <li>✓ Save {currentFreq?.discount}% on every order</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={() => {
            if (step === 'products') {
              onBack?.();
            } else if (step === 'frequency') {
              setStep('products');
            } else {
              setStep('frequency');
            }
          }}
          className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (step === 'products') {
              setStep('frequency');
            } else if (step === 'frequency') {
              setStep('review');
            } else {
              handleSubmit();
            }
          }}
          disabled={!canProceed() || loading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Processing...'
          ) : step === 'review' ? (
            'Start Subscription'
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
