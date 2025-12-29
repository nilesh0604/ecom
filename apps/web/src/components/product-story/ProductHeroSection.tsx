import React, { useEffect, useRef, useState } from 'react';

interface ProductHeroSectionProps {
  title: string;
  tagline: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  productImage?: string;
  price?: number;
  ctaText?: string;
  onCtaClick?: () => void;
  features?: { icon: React.ReactNode; text: string }[];
  badge?: string;
  theme?: 'light' | 'dark';
}

export const ProductHeroSection: React.FC<ProductHeroSectionProps> = ({
  title,
  tagline,
  description,
  backgroundImage,
  backgroundVideo,
  productImage,
  price,
  ctaText = 'Buy Now',
  onCtaClick,
  features = [],
  badge,
  theme = 'dark',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, that's okay
      });
    }
  }, []);

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundVideo ? (
        <video
          ref={videoRef}
          src={backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Overlay */}
      <div
        className={`absolute inset-0 ${
          theme === 'dark' ? 'bg-black/50' : 'bg-white/70'
        }`}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {badge && (
          <span className="inline-block bg-primary-600 text-white text-sm font-medium px-4 py-1 rounded-full mb-6 animate-bounce-subtle">
            {badge}
          </span>
        )}

        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold ${textColor} mb-4 animate-fade-in-up`}
        >
          {title}
        </h1>

        <p
          className={`text-xl sm:text-2xl md:text-3xl ${mutedTextColor} mb-6 animate-fade-in-up animation-delay-100`}
        >
          {tagline}
        </p>

        {description && (
          <p
            className={`max-w-2xl mx-auto text-lg ${mutedTextColor} mb-8 animate-fade-in-up animation-delay-200`}
          >
            {description}
          </p>
        )}

        {productImage && (
          <div className="relative max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-300">
            <img
              src={productImage}
              alt={title}
              className="w-full h-auto drop-shadow-2xl"
            />
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up animation-delay-400">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${mutedTextColor}`}
              >
                <span className="text-primary-500">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-500">
          {price !== undefined && (
            <span className={`text-3xl font-bold ${textColor}`}>
              ${price.toFixed(2)}
            </span>
          )}
          <button
            onClick={onCtaClick}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {ctaText}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className={`w-6 h-6 ${mutedTextColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
};

export default ProductHeroSection;
