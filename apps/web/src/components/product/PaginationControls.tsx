import { Button } from '@/components/ui';

/**
 * PaginationControls - Navigation for paginated product lists
 * 
 * Features:
 * - Previous/Next buttons
 * - Page number display
 * - Disabled states at boundaries
 * - Accessible with proper ARIA labels
 * - Responsive design
 * 
 * Usage:
 * <PaginationControls
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setPage(page)}
 * />
 */

interface PaginationControlsProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Optional: Show items per page info */
  totalItems?: number;
  /** Items per page (for display purposes) */
  itemsPerPage?: number;
  /** Whether to show the page numbers (default: true) */
  showPageNumbers?: boolean;
  /** Maximum number of page buttons to show */
  maxPageButtons?: number;
  /** Disable all controls (e.g., during loading) */
  disabled?: boolean;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 12,
  showPageNumbers = true,
  maxPageButtons = 5,
  disabled = false,
}: PaginationControlsProps) => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  /**
   * Generate array of page numbers to display
   * Shows ellipsis for large page counts
   */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfWindow = Math.floor(maxPageButtons / 2);

    let start = Math.max(1, currentPage - halfWindow);
    let end = Math.min(totalPages, currentPage + halfWindow);

    // Adjust if we're near the start
    if (currentPage <= halfWindow) {
      end = Math.min(totalPages, maxPageButtons - 1);
    }

    // Adjust if we're near the end
    if (currentPage > totalPages - halfWindow) {
      start = Math.max(1, totalPages - maxPageButtons + 2);
    }

    // Always show first page
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  // Calculate item range for display
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : currentPage * itemsPerPage;

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8"
      aria-label="Pagination"
      role="navigation"
    >
      {/* Items info */}
      {totalItems && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> products
        </p>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious || disabled}
          aria-label="Go to previous page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
        </Button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={disabled}
                  className={`min-w-[2.5rem] h-10 px-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}
          </div>
        )}

        {/* Mobile Page Indicator */}
        <span className="sm:hidden text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext || disabled}
          aria-label="Go to next page"
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </nav>
  );
};

export default PaginationControls;
