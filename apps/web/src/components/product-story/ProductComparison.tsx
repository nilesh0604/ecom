import React, { useState } from 'react';

interface ComparisonSpec {
  label: string;
  current: string;
  previous: string;
  improved?: boolean;
}

interface ComparisonProduct {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl: string;
  price: number;
  badge?: string;
}

interface ProductComparisonProps {
  currentProduct: ComparisonProduct;
  previousProduct: ComparisonProduct;
  specs: ComparisonSpec[];
  improvements?: {
    title: string;
    description: string;
    percentage?: number;
  }[];
  onSelectProduct?: (productId: string) => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  currentProduct,
  previousProduct,
  specs,
  improvements = [],
  onSelectProduct,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>(currentProduct.id);

  const handleSelect = (productId: string) => {
    setSelectedProduct(productId);
    onSelectProduct?.(productId);
  };

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Compare Models
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            See what's new and what's improved
          </p>
        </div>

        {/* Improvement Highlights */}
        {improvements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {improvements.map((improvement, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"
              >
                {improvement.percentage && (
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    {improvement.percentage}%
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {improvement.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {improvement.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {[currentProduct, previousProduct].map((product, index) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product.id)}
              className={`
                relative bg-white dark:bg-gray-800 rounded-2xl p-8 text-center transition-all
                ${
                  selectedProduct === product.id
                    ? 'ring-2 ring-primary-600 shadow-xl'
                    : 'hover:shadow-lg'
                }
              `}
            >
              {product.badge && (
                <span className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {product.badge}
                </span>
              )}

              <div className="aspect-square max-w-[200px] mx-auto mb-6">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h3>
              {product.subtitle && (
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {product.subtitle}
                </p>
              )}
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </p>

              {selectedProduct === product.id && (
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-primary-600 text-sm font-medium">
                  Selected
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Specs Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-700 font-medium text-sm">
            <div className="p-4 text-gray-500 dark:text-gray-400">Feature</div>
            <div className="p-4 text-center text-gray-900 dark:text-white">
              {currentProduct.name}
            </div>
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {previousProduct.name}
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {specs.map((spec, index) => (
              <div
                key={index}
                className="grid grid-cols-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-4 text-gray-600 dark:text-gray-400 font-medium">
                  {spec.label}
                </div>
                <div className="p-4 text-center text-gray-900 dark:text-white">
                  <span className="flex items-center justify-center gap-2">
                    {spec.current}
                    {spec.improved && (
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {spec.previous}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
