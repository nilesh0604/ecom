import { Button } from '@/components/ui';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * HeroSection Component
 *
 * Full-screen hero section with video/image background for DTC brand experience.
 *
 * Features:
 * - Full-screen video/image hero
 * - Scroll-triggered animations
 * - Brand messaging overlays
 * - Multiple hero slides (optional)
 * - Dark mode support
 */

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage: string;
  backgroundVideo?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Crafted for Excellence',
    subtitle: 'NEW COLLECTION',
    description: 'Discover our latest collection of premium products designed with precision and care.',
    ctaText: 'Shop New Arrivals',
    ctaLink: '/products?sort=newest',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '/about',
    backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
  },
  {
    id: 2,
    title: 'Quality That Speaks',
    subtitle: 'PREMIUM MATERIALS',
    description: 'Every product is crafted using only the finest materials sourced responsibly.',
    ctaText: 'Explore Collection',
    ctaLink: '/products',
    backgroundImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&q=80',
  },
  {
    id: 3,
    title: 'Your Style, Your Story',
    subtitle: 'LIMITED EDITION',
    description: 'Express yourself with our exclusive limited edition pieces.',
    ctaText: 'Shop Limited Edition',
    ctaLink: '/products?category=limited',
    backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Auto-advance slides
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
      {/* Background Image/Video */}
      {HERO_SLIDES.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {s.backgroundVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source src={s.backgroundVideo} type="video/mp4" />
            </video>
          ) : (
            <img
              src={s.backgroundImage}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ))}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Subtitle */}
            <p
              className={`mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {slide.subtitle}
            </p>

            {/* Title */}
            <h1
              className={`text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {slide.title}
            </h1>

            {/* Description */}
            <p
              className={`mt-6 text-lg text-gray-300 sm:text-xl transition-all duration-700 delay-200 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {slide.description}
            </p>

            {/* CTAs */}
            <div
              className={`mt-10 flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <Link to={slide.ctaLink}>
                <Button size="lg" className="px-8">
                  {slide.ctaText}
                </Button>
              </Link>
              {slide.secondaryCtaLink && (
                <Link to={slide.secondaryCtaLink}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  >
                    {slide.secondaryCtaText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:block">
        <div className="flex flex-col items-center gap-2 text-white/75">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-white/75 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
