import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * OptimizedImage Component
 * 
 * Purpose:
 * - Lazy load images using Intersection Observer
 * - Support responsive images with srcset
 * - Provide blur placeholder while loading
 * - Handle loading states and errors gracefully
 * 
 * Interview Discussion Points:
 * - Native lazy loading vs Intersection Observer
 * - srcset and sizes for responsive images
 * - WebP/AVIF format selection
 * - Cumulative Layout Shift (CLS) prevention
 * - Blur-up placeholder technique (like Next.js Image)
 * 
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/product.jpg"
 *   alt="Product"
 *   width={400}
 *   height={300}
 *   srcSet={{
 *     320: '/images/product-320.jpg',
 *     640: '/images/product-640.jpg',
 *     1024: '/images/product-1024.jpg',
 *   }}
 *   placeholder="blur"
 *   blurDataURL="data:image/jpeg;base64,..."
 * />
 * ```
 */

interface SrcSetConfig {
  [width: number]: string;
}

interface OptimizedImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width (for aspect ratio) */
  width?: number;
  /** Image height (for aspect ratio) */
  height?: number;
  /** Responsive image sources by width */
  srcSet?: SrcSetConfig;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Placeholder type */
  placeholder?: 'blur' | 'empty' | 'skeleton';
  /** Base64 blur data URL for blur placeholder */
  blurDataURL?: string;
  /** Whether to use native lazy loading (default: true) */
  lazy?: boolean;
  /** Root margin for Intersection Observer */
  rootMargin?: string;
  /** Priority loading (disable lazy) */
  priority?: boolean;
  /** Object fit style */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** CSS class name */
  className?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Generate srcSet string from config object
 */
function generateSrcSet(srcSetConfig: SrcSetConfig): string {
  return Object.entries(srcSetConfig)
    .map(([width, url]) => `${url} ${width}w`)
    .join(', ');
}

/**
 * Generate a simple blur placeholder SVG
 */
function generateBlurSVG(width: number, height: number, color = '#e5e7eb'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes = '100vw',
  placeholder = 'empty',
  blurDataURL,
  lazy = true,
  rootMargin = '200px',
  priority = false,
  objectFit = 'cover',
  className = '',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    priority ? 'loading' : 'idle'
  );
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !lazy) {
      setIsInView(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [lazy, priority, rootMargin]);

  // Start loading when in view
  useEffect(() => {
    if (isInView && loadingState === 'idle') {
      setLoadingState('loading');
    }
  }, [isInView, loadingState]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setLoadingState('loaded');
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setLoadingState('error');
    onError?.();
  }, [onError]);

  // Generate srcset string
  const srcSetString = srcSet ? generateSrcSet(srcSet) : undefined;

  // Placeholder styles
  const getPlaceholderStyle = (): React.CSSProperties => {
    if (placeholder === 'blur') {
      const blurSrc = blurDataURL || (width && height ? generateBlurSVG(width, height) : undefined);
      return {
        backgroundImage: blurSrc ? `url(${blurSrc})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: loadingState === 'loaded' ? 'none' : 'blur(20px)',
        transform: loadingState === 'loaded' ? 'scale(1)' : 'scale(1.1)',
      };
    }
    return {};
  };

  // Aspect ratio for preventing CLS
  const aspectRatio = width && height ? width / height : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        width: width ? `${width}px` : '100%',
        maxWidth: '100%',
      }}
    >
      {/* Placeholder */}
      {placeholder === 'skeleton' && loadingState !== 'loaded' && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          aria-hidden="true"
        />
      )}

      {placeholder === 'blur' && loadingState !== 'loaded' && (
        <div
          className="absolute inset-0 transition-all duration-500"
          style={getPlaceholderStyle()}
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          srcSet={srcSetString}
          sizes={sizes}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full transition-opacity duration-500
            ${loadingState === 'loaded' ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ objectFit }}
        />
      )}

      {/* Error state */}
      {loadingState === 'error' && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          role="img"
          aria-label={`Failed to load image: ${alt}`}
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HOOK: useImagePreload
// =============================================================================

/**
 * Hook to preload images programmatically
 * 
 * @example
 * ```tsx
 * const { preload, isLoaded } = useImagePreload();
 * 
 * // Preload on hover
 * <div onMouseEnter={() => preload('/large-image.jpg')}>
 *   Hover to preload
 * </div>
 * ```
 */
export function useImagePreload() {
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());

  const preload = useCallback((url: string): Promise<void> => {
    if (loadedUrls.has(url) || loadingUrls.has(url)) {
      return Promise.resolve();
    }

    setLoadingUrls((prev) => new Set(prev).add(url));

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedUrls((prev) => new Set(prev).add(url));
        setLoadingUrls((prev) => {
          const next = new Set(prev);
          next.delete(url);
          return next;
        });
        resolve();
      };
      img.onerror = () => {
        setLoadingUrls((prev) => {
          const next = new Set(prev);
          next.delete(url);
          return next;
        });
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }, [loadedUrls, loadingUrls]);

  const preloadMultiple = useCallback(
    (urls: string[]): Promise<void[]> => {
      return Promise.all(urls.map(preload));
    },
    [preload]
  );

  const isLoaded = useCallback(
    (url: string): boolean => loadedUrls.has(url),
    [loadedUrls]
  );

  const isLoading = useCallback(
    (url: string): boolean => loadingUrls.has(url),
    [loadingUrls]
  );

  return {
    preload,
    preloadMultiple,
    isLoaded,
    isLoading,
  };
}

// =============================================================================
// COMPONENT: ResponsivePicture
// =============================================================================

interface PictureSource {
  srcSet: string;
  media?: string;
  type?: string;
}

interface ResponsivePictureProps {
  src: string;
  alt: string;
  sources: PictureSource[];
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Picture element for art direction and format selection
 * 
 * @example
 * ```tsx
 * <ResponsivePicture
 *   src="/fallback.jpg"
 *   alt="Product"
 *   sources={[
 *     { srcSet: '/product.avif', type: 'image/avif' },
 *     { srcSet: '/product.webp', type: 'image/webp' },
 *     { srcSet: '/product-mobile.jpg', media: '(max-width: 640px)' },
 *   ]}
 * />
 * ```
 */
export function ResponsivePicture({
  src,
  alt,
  sources,
  width,
  height,
  className = '',
  loading = 'lazy',
}: ResponsivePictureProps) {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className="w-full h-full object-cover"
      />
    </picture>
  );
}

export default OptimizedImage;
