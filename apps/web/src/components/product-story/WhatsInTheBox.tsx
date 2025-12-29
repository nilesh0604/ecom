import React from 'react';

interface BoxItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity?: number;
}

interface WhatsInTheBoxProps {
  items: BoxItem[];
  productImageUrl?: string;
  layout?: 'grid' | 'list' | 'visual';
  title?: string;
  className?: string;
}

export const WhatsInTheBox: React.FC<WhatsInTheBoxProps> = ({
  items,
  productImageUrl,
  layout = 'visual',
  title = "What's in the Box",
  className = '',
}) => {
  if (layout === 'list') {
    return (
      <div className={`py-12 ${className}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-primary-600 mr-2">
                        {item.quantity}×
                      </span>
                    )}
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={`py-16 bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            {title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center"
              >
                {item.imageUrl ? (
                  <div className="aspect-square mb-4 flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-square mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                {item.quantity && item.quantity > 1 && (
                  <span className="text-sm text-primary-600">
                    Qty: {item.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Visual layout - exploded view style
  return (
    <div className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {title}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Everything you need to get started
        </p>

        <div className="relative">
          {/* Main product image */}
          {productImageUrl && (
            <div className="flex justify-center mb-12">
              <div className="relative">
                <img
                  src={productImageUrl}
                  alt="Package contents"
                  className="max-w-md w-full"
                />
                {/* Connection lines would go here in a real implementation */}
              </div>
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full aspect-square object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">
                        {getItemEmoji(item.name)}
                      </span>
                    </div>
                  )}
                  {item.quantity && item.quantity > 1 && (
                    <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to get emoji based on item name
function getItemEmoji(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('cable') || lowerName.includes('charger')) return '🔌';
  if (lowerName.includes('manual') || lowerName.includes('guide')) return '📖';
  if (lowerName.includes('adapter')) return '🔋';
  if (lowerName.includes('case') || lowerName.includes('pouch')) return '👝';
  if (lowerName.includes('earbuds') || lowerName.includes('headphone')) return '🎧';
  if (lowerName.includes('sticker')) return '🏷️';
  if (lowerName.includes('tool')) return '🔧';
  return '📦';
}

export default WhatsInTheBox;
