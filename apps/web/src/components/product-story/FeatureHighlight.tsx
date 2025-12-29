import React from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  videoUrl?: string;
}

interface FeatureHighlightProps {
  features: Feature[];
  layout?: 'grid' | 'alternating' | 'carousel';
  className?: string;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  features,
  layout = 'alternating',
  className = '',
}) => {
  if (layout === 'grid') {
    return (
      <div className={`py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {feature.imageUrl && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4">
                    <img
                      src={feature.imageUrl}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {feature.icon && (
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Alternating layout (Apple-style)
  return (
    <div className={`py-16 space-y-24 ${className}`}>
      {features.map((feature, index) => {
        const isReversed = index % 2 === 1;

        return (
          <div
            key={feature.id}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                isReversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={`space-y-6 ${isReversed ? 'lg:order-2' : ''}`}>
                {feature.icon && (
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                    {feature.icon}
                  </div>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Media */}
              <div className={`${isReversed ? 'lg:order-1' : ''}`}>
                {feature.videoUrl ? (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <video
                      src={feature.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : feature.imageUrl ? (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-2xl">
                    <img
                      src={feature.imageUrl}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureHighlight;
