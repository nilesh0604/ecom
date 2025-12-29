import React, { type ComponentType, useEffect, useState } from 'react';

/**
 * Higher-Order Components (HOC) Examples
 * 
 * Purpose:
 * - Reuse component logic across multiple components
 * - Cross-cutting concerns: auth, logging, analytics, error handling
 * - Enhance components with additional props or behavior
 * 
 * Interview Discussion Points:
 * - HOC vs Hooks: Hooks preferred for most cases, HOCs still useful for:
 *   - Wrapping third-party components
 *   - Adding behavior without modifying component code
 *   - Cross-cutting concerns at the component level
 * - Naming convention: with* prefix (withAuth, withLoading)
 * - Static hoisting: need to copy static methods
 * - Ref forwarding: use forwardRef to pass refs through
 * 
 * Trade-offs:
 * - Wrapper hell: Multiple HOCs create deep component trees
 * - Props collision: HOC props might conflict with wrapped component
 * - TypeScript: Can be tricky to type correctly
 */

// =============================================================================
// HOC 1: withLoading - Add loading state to any component
// =============================================================================

interface WithLoadingProps {
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * HOC that shows a loading state while data is being fetched
 * 
 * @example
 * ```tsx
 * const ProductListWithLoading = withLoading(ProductList);
 * 
 * <ProductListWithLoading
 *   isLoading={loading}
 *   products={products}
 *   loadingComponent={<Skeleton count={5} />}
 * />
 * ```
 */
export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  DefaultLoader: React.FC = () => <div className="animate-pulse">Loading...</div>
) {
  const WithLoadingComponent: React.FC<P & WithLoadingProps> = ({
    isLoading = false,
    loadingComponent,
    ...props
  }) => {
    if (isLoading) {
      return <>{loadingComponent || <DefaultLoader />}</>;
    }
    return <WrappedComponent {...(props as P)} />;
  };

  // Copy display name for debugging
  WithLoadingComponent.displayName = `withLoading(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithLoadingComponent;
}

// =============================================================================
// HOC 2: withAuth - Protect components requiring authentication
// =============================================================================

interface WithAuthOptions {
  redirectTo?: string;
  fallback?: React.ReactNode;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Mock auth hook - in real app, use your auth context/hook
const useAuth = (): AuthState => {
  const token = localStorage.getItem('authToken');
  return {
    isAuthenticated: !!token,
    isLoading: false,
  };
};

/**
 * HOC that ensures user is authenticated before rendering component
 * 
 * @example
 * ```tsx
 * const ProtectedDashboard = withAuth(Dashboard, {
 *   redirectTo: '/login',
 *   fallback: <Unauthorized />,
 * });
 * ```
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { fallback = null } = options;

  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Checking authentication...</div>;
    }

    if (!isAuthenticated) {
      // In real app, you might redirect using react-router
      // if (options.redirectTo) {
      //   return <Navigate to={options.redirectTo} />;
      // }
      return <>{fallback || <div>Please log in to view this content</div>}</>;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithAuthComponent;
}

// =============================================================================
// HOC 3: withErrorBoundary - Wrap component in error boundary
// =============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * HOC that wraps component in an error boundary
 * 
 * @example
 * ```tsx
 * const SafeProductList = withErrorBoundary(ProductList, {
 *   fallback: (error) => <ErrorMessage error={error} />,
 *   onError: (error) => logToSentry(error),
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  return class WithErrorBoundary extends React.Component<P, ErrorBoundaryState> {
    static displayName = `withErrorBoundary(${
      WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
      options.onError?.(error, errorInfo);
    }

    render(): React.ReactNode {
      if (this.state.hasError) {
        const { fallback } = options;
        if (typeof fallback === 'function' && this.state.error) {
          return fallback(this.state.error);
        }
        if (fallback && typeof fallback !== 'function') {
          return fallback;
        }
        return <div>Something went wrong</div>;
      }

      return <WrappedComponent {...this.props} />;
    }
  };
}

// =============================================================================
// HOC 4: withAnalytics - Track component renders and interactions
// =============================================================================

interface AnalyticsEvent {
  type: 'mount' | 'unmount' | 'interaction';
  componentName: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// Mock analytics function
const trackEvent = (event: AnalyticsEvent) => {
  console.log('[Analytics]', event);
  // In real app: send to analytics service
};

interface WithAnalyticsOptions {
  trackMount?: boolean;
  trackUnmount?: boolean;
  componentName?: string;
}

/**
 * HOC that tracks component lifecycle for analytics
 * 
 * @example
 * ```tsx
 * const TrackedCheckout = withAnalytics(Checkout, {
 *   trackMount: true,
 *   componentName: 'CheckoutPage',
 * });
 * ```
 */
export function withAnalytics<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAnalyticsOptions = {}
) {
  const { trackMount = true, trackUnmount = false } = options;
  const componentName =
    options.componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithAnalyticsComponent: React.FC<P> = (props) => {
    useEffect(() => {
      if (trackMount) {
        trackEvent({
          type: 'mount',
          componentName,
          timestamp: Date.now(),
        });
      }

      return () => {
        if (trackUnmount) {
          trackEvent({
            type: 'unmount',
            componentName,
            timestamp: Date.now(),
          });
        }
      };
    }, []);

    return <WrappedComponent {...props} />;
  };

  WithAnalyticsComponent.displayName = `withAnalytics(${componentName})`;

  return WithAnalyticsComponent;
}

// =============================================================================
// HOC 5: withMemo - Custom memoization with comparison function
// =============================================================================

/**
 * HOC that memoizes component with custom comparison
 * 
 * @example
 * ```tsx
 * const MemoizedProductCard = withMemo(ProductCard, (prev, next) => 
 *   prev.product.id === next.product.id &&
 *   prev.product.price === next.product.price
 * );
 * ```
 */
export function withMemo<P extends object>(
  WrappedComponent: ComponentType<P>,
  areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  const MemoizedComponent = React.memo(WrappedComponent, areEqual);

  MemoizedComponent.displayName = `withMemo(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return MemoizedComponent;
}

// =============================================================================
// HOC 6: withDebounce - Debounce prop changes
// =============================================================================

interface WithDebounceOptions {
  /** Props to debounce */
  debounceProps: string[];
  /** Debounce delay in ms */
  delay?: number;
}

/**
 * HOC that debounces specific prop changes
 * Useful for search inputs or expensive re-renders
 * 
 * @example
 * ```tsx
 * const DebouncedSearch = withDebounce(SearchResults, {
 *   debounceProps: ['searchQuery'],
 *   delay: 300,
 * });
 * ```
 */
export function withDebounce<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithDebounceOptions
) {
  const { debounceProps, delay = 300 } = options;

  const WithDebounceComponent: React.FC<P> = (props) => {
    const [debouncedProps, setDebouncedProps] = useState<Partial<P>>({});

    useEffect(() => {
      const newDebouncedProps: Partial<P> = {};
      debounceProps.forEach((prop) => {
        if (prop in props) {
          newDebouncedProps[prop as keyof P] = props[prop as keyof P];
        }
      });

      const timeoutId = setTimeout(() => {
        setDebouncedProps(newDebouncedProps);
      }, delay);

      return () => clearTimeout(timeoutId);
    }, [props]);

    // Merge original props with debounced ones
    const mergedProps = { ...props, ...debouncedProps };

    return <WrappedComponent {...mergedProps} />;
  };

  WithDebounceComponent.displayName = `withDebounce(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithDebounceComponent;
}

// =============================================================================
// COMPOSING HOCS
// =============================================================================

/**
 * Utility to compose multiple HOCs
 * 
 * @example
 * ```tsx
 * const EnhancedComponent = compose(
 *   withAuth,
 *   withLoading,
 *   withAnalytics
 * )(MyComponent);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compose<R>(...funcs: Array<(arg: any) => any>): (component: R) => R {
  if (funcs.length === 0) {
    return (arg: R) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}

export default {
  withLoading,
  withAuth,
  withErrorBoundary,
  withAnalytics,
  withMemo,
  withDebounce,
  compose,
};
