/**
 * SubscriptionPlanCard Component
 * Display subscription plan with pricing and features
 * DTC Feature: Subscription Commerce (6.1)
 */

import React from 'react';

interface SubscriptionFrequency {
  id: string;
  label: string;
  interval: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  price: number;
  discount?: number; // percentage discount
}

export interface SubscriptionPlanCardProps {
  id: string;
  name: string;
  description?: string;
  image?: string;
  frequencies: SubscriptionFrequency[];
  features?: string[];
  selectedFrequency?: string;
  onFrequencyChange?: (frequencyId: string) => void;
  onSubscribe?: (frequencyId: string) => void;
  popular?: boolean;
  comingSoon?: boolean;
  className?: string;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  name,
  description,
  image,
  frequencies,
  features = [],
  selectedFrequency,
  onFrequencyChange,
  onSubscribe,
  popular = false,
  comingSoon = false,
  className = '',
}) => {
  const [activeFrequency, setActiveFrequency] = React.useState(
    selectedFrequency || frequencies[0]?.id
  );

  const currentFreq = frequencies.find((f) => f.id === activeFrequency) || frequencies[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleFrequencyChange = (frequencyId: string) => {
    setActiveFrequency(frequencyId);
    onFrequencyChange?.(frequencyId);
  };

  const getIntervalLabel = (interval: string) => {
    const labels: Record<string, string> = {
      weekly: 'week',
      biweekly: '2 weeks',
      monthly: 'month',
      quarterly: 'quarter',
    };
    return labels[interval] || interval;
  };

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden border-2 transition-all ${
        popular ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      } ${className}`}
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          Most Popular
        </div>
      )}

      {/* Coming Soon Overlay */}
      {comingSoon && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
          <span className="px-4 py-2 bg-gray-900 text-white font-medium rounded-full">
            Coming Soon
          </span>
        </div>
      )}

      {/* Image */}
      {image && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}

        {/* Frequency Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Frequency
          </label>
          <div className="grid grid-cols-2 gap-2">
            {frequencies.map((freq) => (
              <button
                key={freq.id}
                onClick={() => handleFrequencyChange(freq.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                  activeFrequency === freq.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {freq.label}
                {freq.discount && (
                  <span className="block text-xs text-green-600 font-normal">
                    Save {freq.discount}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(currentFreq?.price || 0)}
            </span>
            <span className="text-gray-500">
              / {getIntervalLabel(currentFreq?.interval || 'month')}
            </span>
          </div>
          {currentFreq?.discount && (
            <p className="text-sm text-green-600 mt-1">
              You save {currentFreq.discount}% with this plan
            </p>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
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
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Subscribe Button */}
        <button
          onClick={() => onSubscribe?.(activeFrequency)}
          disabled={comingSoon}
          className={`w-full py-3 font-medium rounded-lg transition-colors ${
            popular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          } disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          Subscribe Now
        </button>

        {/* Fine Print */}
        <p className="text-xs text-gray-500 text-center mt-3">
          Cancel or modify anytime. Free shipping included.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;
