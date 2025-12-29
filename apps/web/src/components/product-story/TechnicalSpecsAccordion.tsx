import React, { useState } from 'react';

interface Specification {
  label: string;
  value: string;
}

interface SpecCategory {
  id: string;
  name: string;
  icon?: React.ReactNode;
  specs: Specification[];
}

interface TechnicalSpecsAccordionProps {
  categories: SpecCategory[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const TechnicalSpecsAccordion: React.FC<TechnicalSpecsAccordionProps> = ({
  categories,
  defaultOpenId,
  allowMultiple = false,
  className = '',
}) => {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    defaultOpenId ? new Set([defaultOpenId]) : new Set([categories[0]?.id])
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className={`py-16 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Technical Specifications
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about this product
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((category) => {
            const isOpen = openCategories.has(category.id);

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    {category.icon && (
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600">
                        {category.icon}
                      </div>
                    )}
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {category.specs.map((spec, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                          >
                            <dt className="text-gray-500 dark:text-gray-400">
                              {spec.label}
                            </dt>
                            <dd className="font-medium text-gray-900 dark:text-white text-right">
                              {spec.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Compact specs table for quick reference
export const SpecsTable: React.FC<{
  specs: Specification[];
  columns?: 1 | 2 | 3;
  className?: string;
}> = ({ specs, columns = 2, className = '' }) => {
  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 ${className}`}
    >
      <dl className={`grid ${columnClass[columns]} gap-4`}>
        {specs.map((spec, index) => (
          <div
            key={index}
            className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
          >
            <dt className="text-sm text-gray-500 dark:text-gray-400">
              {spec.label}
            </dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default TechnicalSpecsAccordion;
