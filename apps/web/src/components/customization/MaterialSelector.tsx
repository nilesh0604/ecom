import React from 'react';

interface MaterialOption {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  priceModifier: number;
  inStock: boolean;
  features?: string[];
}

interface MaterialSelectorProps {
  materials: MaterialOption[];
  selectedMaterial: string | null;
  onMaterialSelect: (materialId: string) => void;
  layout?: 'cards' | 'list';
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  materials,
  selectedMaterial,
  onMaterialSelect,
  layout = 'cards',
}) => {
  if (layout === 'list') {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Material
        </label>
        <div className="space-y-2" role="radiogroup" aria-label="Select material">
          {materials.map((material) => (
            <button
              key={material.id}
              type="button"
              onClick={() => material.inStock && onMaterialSelect(material.id)}
              disabled={!material.inStock}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all
                ${
                  selectedMaterial === material.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }
                ${!material.inStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-checked={selectedMaterial === material.id}
              role="radio"
            >
              <div className="flex items-center gap-3">
                {material.imageUrl && (
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="text-left">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {material.name}
                  </span>
                  {material.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {material.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {material.priceModifier !== 0 && (
                  <span
                    className={`text-sm font-medium ${
                      material.priceModifier > 0
                        ? 'text-primary-600'
                        : 'text-green-600'
                    }`}
                  >
                    {material.priceModifier > 0 ? '+' : ''}
                    ${Math.abs(material.priceModifier).toFixed(2)}
                  </span>
                )}
                {!material.inStock && (
                  <span className="block text-xs text-red-500">Out of stock</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Material
      </label>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label="Select material"
      >
        {materials.map((material) => (
          <button
            key={material.id}
            type="button"
            onClick={() => material.inStock && onMaterialSelect(material.id)}
            disabled={!material.inStock}
            className={`
              relative flex flex-col items-center p-4 rounded-lg border-2 transition-all
              ${
                selectedMaterial === material.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }
              ${!material.inStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-checked={selectedMaterial === material.id}
            role="radio"
          >
            {material.imageUrl ? (
              <img
                src={material.imageUrl}
                alt={material.name}
                className="w-16 h-16 rounded-lg object-cover mb-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center">
                <span className="text-2xl">🧱</span>
              </div>
            )}

            <span className="font-medium text-gray-900 dark:text-white text-center">
              {material.name}
            </span>

            {material.priceModifier !== 0 && (
              <span
                className={`text-sm ${
                  material.priceModifier > 0
                    ? 'text-primary-600'
                    : 'text-green-600'
                }`}
              >
                {material.priceModifier > 0 ? '+' : ''}
                ${Math.abs(material.priceModifier).toFixed(2)}
              </span>
            )}

            {material.features && material.features.length > 0 && (
              <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                {material.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {selectedMaterial === material.id && (
              <span className="absolute top-2 right-2">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}

            {!material.inStock && (
              <span className="absolute top-2 left-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Sold out
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaterialSelector;
