import React, { useCallback, useState } from 'react';

type CustomizationType = 'engraving' | 'monogram';

interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  preview?: string;
}

interface EngravingInputProps {
  type: CustomizationType;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  fonts?: FontOption[];
  selectedFont?: string;
  onFontChange?: (fontId: string) => void;
  price?: number;
  placeholder?: string;
  previewPosition?: 'top' | 'bottom' | 'side';
}

const DEFAULT_FONTS: FontOption[] = [
  { id: 'script', name: 'Script', fontFamily: "'Dancing Script', cursive" },
  { id: 'serif', name: 'Classic', fontFamily: "'Playfair Display', serif" },
  { id: 'sans', name: 'Modern', fontFamily: "'Inter', sans-serif" },
  { id: 'mono', name: 'Block', fontFamily: "'Roboto Mono', monospace" },
];

const MONOGRAM_PATTERNS = [
  { id: 'traditional', name: 'Traditional (FLI)', description: 'First, Last (larger), Initial' },
  { id: 'modern', name: 'Modern (FIL)', description: 'First, Initial, Last' },
  { id: 'stacked', name: 'Stacked', description: 'Initials stacked vertically' },
];

export const EngravingInput: React.FC<EngravingInputProps> = ({
  type,
  value,
  onChange,
  maxLength = type === 'monogram' ? 3 : 20,
  fonts = DEFAULT_FONTS,
  selectedFont = 'script',
  onFontChange,
  price,
  placeholder,
  previewPosition = 'top',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [monogramPattern, setMonogramPattern] = useState('traditional');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      if (type === 'monogram') {
        // Only allow letters for monogram
        newValue = newValue.replace(/[^a-zA-Z]/g, '').toUpperCase();
      }

      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    },
    [maxLength, onChange, type]
  );

  const selectedFontOption = fonts.find((f) => f.id === selectedFont) || fonts[0];

  const renderPreview = () => {
    if (!value) return null;

    if (type === 'monogram') {
      const letters = value.split('');
      return (
        <div className="flex items-center justify-center gap-1">
          {monogramPattern === 'traditional' && letters.length >= 3 ? (
            <>
              <span className="text-2xl">{letters[0]}</span>
              <span className="text-4xl font-bold">{letters[1]}</span>
              <span className="text-2xl">{letters[2]}</span>
            </>
          ) : monogramPattern === 'stacked' ? (
            <div className="flex flex-col items-center leading-tight">
              {letters.map((letter, idx) => (
                <span key={idx} className="text-xl">
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-3xl tracking-wider">{value}</span>
          )}
        </div>
      );
    }

    return (
      <span
        className="text-xl"
        style={{ fontFamily: selectedFontOption.fontFamily }}
      >
        {value}
      </span>
    );
  };

  const PreviewBox = () => (
    <div
      className={`
        bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
        rounded-lg p-6 flex items-center justify-center min-h-[100px]
        border-2 border-dashed border-gray-300 dark:border-gray-600
        ${value ? '' : 'text-gray-400 dark:text-gray-500'}
      `}
    >
      {value ? (
        <div style={{ fontFamily: selectedFontOption.fontFamily }}>
          {renderPreview()}
        </div>
      ) : (
        <span className="text-sm">
          {type === 'monogram' ? 'Enter your initials' : 'Your text will appear here'}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {type === 'monogram' ? 'Monogram' : 'Engraving'}
        </label>
        {price !== undefined && price > 0 && (
          <span className="text-sm text-primary-600">+${price.toFixed(2)}</span>
        )}
      </div>

      {previewPosition === 'top' && <PreviewBox />}

      <div className="space-y-3">
        {/* Text Input */}
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              placeholder ||
              (type === 'monogram' ? 'ABC' : 'Enter your text')
            }
            maxLength={maxLength}
            className={`
              w-full px-4 py-3 rounded-lg border-2 transition-all
              ${
                isFocused
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-300 dark:border-gray-600'
              }
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400
              focus:outline-none
              ${type === 'monogram' ? 'text-center text-2xl tracking-widest uppercase' : ''}
            `}
            style={
              type !== 'monogram'
                ? { fontFamily: selectedFontOption.fontFamily }
                : undefined
            }
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {value.length}/{maxLength}
          </span>
        </div>

        {/* Font Selection */}
        {type === 'engraving' && onFontChange && (
          <div className="space-y-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Font Style</span>
            <div className="flex flex-wrap gap-2">
              {fonts.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onFontChange(font.id)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all text-sm
                    ${
                      selectedFont === font.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }
                  `}
                  style={{ fontFamily: font.fontFamily }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Monogram Pattern Selection */}
        {type === 'monogram' && (
          <div className="space-y-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Monogram Style
            </span>
            <div className="grid grid-cols-3 gap-2">
              {MONOGRAM_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => setMonogramPattern(pattern.id)}
                  className={`
                    px-3 py-2 rounded-lg border-2 transition-all text-xs text-center
                    ${
                      monogramPattern === pattern.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }
                  `}
                >
                  <span className="block font-medium">{pattern.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {previewPosition === 'bottom' && <PreviewBox />}

      {/* Guidelines */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {type === 'monogram' ? (
          <>
            Enter up to 3 initials. Traditional monograms use First, Last (center,
            larger), Middle initial order.
          </>
        ) : (
          <>
            Special characters may not be available in all fonts. Preview shows
            approximate appearance.
          </>
        )}
      </p>
    </div>
  );
};

export default EngravingInput;
