import React, { useState } from 'react';

interface ColorOption {
  id: string;
  name: string;
  value: string;
  hex: string;
  imageUrl?: string;
  inStock: boolean;
  priceModifier?: number;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string | null;
  onColorSelect: (colorId: string) => void;
  showColorName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'inline' | 'grid';
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  showColorName = true,
  size = 'md',
  layout = 'inline',
}) => {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const selectedColorOption = colors.find((c) => c.id === selectedColor);
  const displayedColor = colors.find((c) => c.id === hoveredColor) || selectedColorOption;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Color
        </label>
        {showColorName && displayedColor && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {displayedColor.name}
            {displayedColor.priceModifier && displayedColor.priceModifier > 0 && (
              <span className="ml-1 text-primary-600">
                (+${displayedColor.priceModifier.toFixed(2)})
              </span>
            )}
          </span>
        )}
      </div>

      <div
        className={`flex flex-wrap ${
          layout === 'grid' ? 'gap-3' : 'gap-2'
        }`}
        role="radiogroup"
        aria-label="Select color"
      >
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => color.inStock && onColorSelect(color.id)}
            onMouseEnter={() => setHoveredColor(color.id)}
            onMouseLeave={() => setHoveredColor(null)}
            disabled={!color.inStock}
            className={`
              relative ${sizeClasses[size]} rounded-full border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${
                selectedColor === color.id
                  ? 'border-primary-600 ring-2 ring-primary-300'
                  : 'border-gray-300 dark:border-gray-600'
              }
              ${
                !color.inStock
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:border-primary-400'
              }
            `}
            aria-label={`${color.name}${!color.inStock ? ' - Out of stock' : ''}`}
            aria-checked={selectedColor === color.id}
            role="radio"
          >
            {/* Color swatch */}
            {color.imageUrl ? (
              <img
                src={color.imageUrl}
                alt={color.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span
                className="block w-full h-full rounded-full"
                style={{ backgroundColor: color.hex }}
              />
            )}

            {/* Selected checkmark */}
            {selectedColor === color.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className={`${
                    isLightColor(color.hex) ? 'text-gray-800' : 'text-white'
                  } w-4 h-4`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}

            {/* Out of stock indicator */}
            {!color.inStock && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-full h-0.5 bg-gray-500 rotate-45 transform" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper function to determine if a color is light
function isLightColor(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export default ColorSelector;
