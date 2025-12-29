import React, { useCallback, useEffect, useState } from 'react';
import { ColorSelector } from './ColorSelector';
import { CustomizationPriceSummary } from './CustomizationPriceSummary';
import { EngravingInput } from './EngravingInput';
import { MaterialSelector } from './MaterialSelector';

// Types
interface ColorOption {
  id: string;
  name: string;
  value: string;
  hex: string;
  imageUrl?: string;
  inStock: boolean;
  priceModifier?: number;
}

interface MaterialOption {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  priceModifier: number;
  inStock: boolean;
  features?: string[];
}

interface CustomizationConfig {
  colors?: ColorOption[];
  materials?: MaterialOption[];
  engraving?: {
    enabled: boolean;
    maxLength: number;
    price: number;
  };
  monogram?: {
    enabled: boolean;
    price: number;
  };
}

interface CustomizationState {
  color: string | null;
  material: string | null;
  engraving: string;
  engravingFont: string;
  monogram: string;
}

interface ProductCustomizerProps {
  productId: string;
  productName: string;
  basePrice: number;
  config: CustomizationConfig;
  productImages?: Record<string, string>; // colorId -> imageUrl
  initialState?: Partial<CustomizationState>;
  onCustomizationChange?: (state: CustomizationState, totalPrice: number) => void;
  onAddToCart?: (state: CustomizationState, totalPrice: number) => void;
}

export const ProductCustomizer: React.FC<ProductCustomizerProps> = ({
  productId,
  productName,
  basePrice,
  config,
  productImages = {},
  initialState,
  onCustomizationChange,
  onAddToCart,
}) => {
  const [state, setState] = useState<CustomizationState>({
    color: initialState?.color ?? config.colors?.[0]?.id ?? null,
    material: initialState?.material ?? config.materials?.[0]?.id ?? null,
    engraving: initialState?.engraving ?? '',
    engravingFont: initialState?.engravingFont ?? 'script',
    monogram: initialState?.monogram ?? '',
  });

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'color' | 'material' | 'personalize'>('color');

  // Calculate customization prices
  const getCustomizations = useCallback(() => {
    const customizations = [];

    if (state.color && config.colors) {
      const colorOption = config.colors.find((c) => c.id === state.color);
      if (colorOption?.priceModifier) {
        customizations.push({
          type: 'color',
          name: 'Color',
          value: colorOption.name,
          price: colorOption.priceModifier,
        });
      }
    }

    if (state.material && config.materials) {
      const materialOption = config.materials.find((m) => m.id === state.material);
      if (materialOption?.priceModifier) {
        customizations.push({
          type: 'material',
          name: 'Material',
          value: materialOption.name,
          price: materialOption.priceModifier,
        });
      }
    }

    if (state.engraving && config.engraving?.enabled) {
      customizations.push({
        type: 'engraving',
        name: 'Engraving',
        value: state.engraving,
        price: config.engraving.price,
      });
    }

    if (state.monogram && config.monogram?.enabled) {
      customizations.push({
        type: 'monogram',
        name: 'Monogram',
        value: state.monogram,
        price: config.monogram.price,
      });
    }

    return customizations;
  }, [state, config]);

  const customizations = getCustomizations();
  const totalPrice = basePrice + customizations.reduce((sum, c) => sum + c.price, 0);

  // Update image based on color selection
  useEffect(() => {
    if (state.color && productImages[state.color]) {
      setCurrentImage(productImages[state.color]);
    }
  }, [state.color, productImages]);

  // Notify parent of changes
  useEffect(() => {
    onCustomizationChange?.(state, totalPrice);
  }, [state, totalPrice, onCustomizationChange]);

  const handleAddToCart = () => {
    onAddToCart?.(state, totalPrice);
  };

  const hasPersonalization = config.engraving?.enabled || config.monogram?.enabled;
  const tabs = [
    ...(config.colors?.length ? [{ id: 'color' as const, label: 'Color' }] : []),
    ...(config.materials?.length ? [{ id: 'material' as const, label: 'Material' }] : []),
    ...(hasPersonalization ? [{ id: 'personalize' as const, label: 'Personalize' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Product Preview */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl aspect-square flex items-center justify-center overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage}
            alt={productName}
            className="w-full h-full object-contain transition-opacity duration-300"
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-600">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Engraving/Monogram Preview Overlay */}
        {(state.engraving || state.monogram) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">
              {state.engraving || state.monogram}
            </span>
          </div>
        )}
      </div>

      {/* Customization Tabs */}
      {tabs.length > 1 && (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-3 text-sm font-medium transition-colors relative
                ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'color' && config.colors && (
          <ColorSelector
            colors={config.colors}
            selectedColor={state.color}
            onColorSelect={(colorId) => setState((s) => ({ ...s, color: colorId }))}
            size="lg"
          />
        )}

        {activeTab === 'material' && config.materials && (
          <MaterialSelector
            materials={config.materials}
            selectedMaterial={state.material}
            onMaterialSelect={(materialId) =>
              setState((s) => ({ ...s, material: materialId }))
            }
            layout="cards"
          />
        )}

        {activeTab === 'personalize' && (
          <div className="space-y-6">
            {config.engraving?.enabled && (
              <EngravingInput
                type="engraving"
                value={state.engraving}
                onChange={(value) => setState((s) => ({ ...s, engraving: value }))}
                maxLength={config.engraving.maxLength}
                selectedFont={state.engravingFont}
                onFontChange={(fontId) =>
                  setState((s) => ({ ...s, engravingFont: fontId }))
                }
                price={config.engraving.price}
              />
            )}

            {config.monogram?.enabled && (
              <EngravingInput
                type="monogram"
                value={state.monogram}
                onChange={(value) => setState((s) => ({ ...s, monogram: value }))}
                price={config.monogram.price}
              />
            )}
          </div>
        )}
      </div>

      {/* Price Summary */}
      <CustomizationPriceSummary
        basePrice={basePrice}
        customizations={customizations}
        showBreakdown={true}
      />

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Add to Cart - ${totalPrice.toFixed(2)}
      </button>
    </div>
  );
};

export default ProductCustomizer;
