import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * 
 * React Error Boundary component that prevents the entire app from crashing
 * when a component throws an error during rendering.
 * 
 * Features:
 * - Catches errors in child component tree
 * - Displays fallback UI when error occurs
 * - Logs error details to console for debugging
 * - Provides retry functionality to recover from errors
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <ProblematicComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 * 
 * @see {@link https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary React Error Boundaries}
 */

/**
 * Props for ErrorBoundary component
 * @interface ErrorBoundaryProps
 */
interface ErrorBoundaryProps {
  /** Child components to wrap and protect from errors */
  children: ReactNode;
  /** Optional custom fallback UI to display when error occurs */
  fallback?: ReactNode;
}

/**
 * Internal state for ErrorBoundary
 * @interface ErrorBoundaryState
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error captured by ErrorBoundary', { error, info });
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <button onClick={this.handleRetry} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
