import React, { useMemo } from 'react';

interface CustomizationOption {
  type: string;
  name: string;
  value: string;
  price: number;
}

interface CustomizationPriceSummaryProps {
  basePrice: number;
  customizations: CustomizationOption[];
  currency?: string;
  showBreakdown?: boolean;
  className?: string;
}

export const CustomizationPriceSummary: React.FC<CustomizationPriceSummaryProps> = ({
  basePrice,
  customizations,
  currency = 'USD',
  showBreakdown = true,
  className = '',
}) => {
  const { totalCustomizationPrice, totalPrice, activeCustomizations } = useMemo(() => {
    const active = customizations.filter((c) => c.value && c.price > 0);
    const customTotal = active.reduce((sum, c) => sum + c.price, 0);
    return {
      activeCustomizations: active,
      totalCustomizationPrice: customTotal,
      totalPrice: basePrice + customTotal,
    };
  }, [basePrice, customizations]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      {showBreakdown && (
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Base Price</span>
            <span className="text-gray-900 dark:text-white">
              {formatPrice(basePrice)}
            </span>
          </div>

          {activeCustomizations.map((customization, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {customization.name}
                {customization.value && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({customization.value})
                  </span>
                )}
              </span>
              <span className="text-primary-600">
                +{formatPrice(customization.price)}
              </span>
            </div>
          ))}

          {activeCustomizations.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              No customizations added
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-900 dark:text-white">
          {showBreakdown ? 'Total' : 'Price'}
        </span>
        <div className="text-right">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(totalPrice)}
          </span>
          {totalCustomizationPrice > 0 && !showBreakdown && (
            <span className="block text-xs text-gray-500">
              Includes {formatPrice(totalCustomizationPrice)} in customizations
            </span>
          )}
        </div>
      </div>

      {activeCustomizations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Customized items are made to order and typically ship within 3-5
              business days. Customized items cannot be returned or exchanged.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Real-time price update animation component
export const AnimatedPrice: React.FC<{
  price: number;
  currency?: string;
  className?: string;
}> = ({ price, currency = 'USD', className = '' }) => {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(p);
  };

  return (
    <span
      className={`inline-block transition-all duration-300 ${className}`}
      key={price}
    >
      <span className="animate-pulse-once">{formatPrice(price)}</span>
    </span>
  );
};

export default CustomizationPriceSummary;
