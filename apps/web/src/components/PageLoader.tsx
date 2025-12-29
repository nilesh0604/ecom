import { Spinner } from '@/components/ui';

/**
 * PageLoader - Full-page loading indicator component
 * 
 * Displays a centered loading spinner while page content is being loaded.
 * Used for route transitions and lazy-loaded components.
 * 
 * Features:
 * - Centered spinner with accessible label
 * - Minimum height to prevent layout shift
 * - Works with Suspense boundaries
 * 
 * @example
 * ```tsx
 * // With React Suspense
 * <Suspense fallback={<PageLoader />}>
 *   <LazyLoadedPage />
 * </Suspense>
 * 
 * // Conditional rendering
 * {isLoading ? <PageLoader /> : <PageContent />}
 * ```
 * 
 * @returns {JSX.Element} Centered spinner component
 */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Spinner size="lg" label="Loading page..." />
  </div>
);

export default PageLoader;
