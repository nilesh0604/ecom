import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Breadcrumbs - Navigation breadcrumb trail
 *
 * Features:
 * - Automatically generates breadcrumbs from current route
 * - Supports custom labels for routes
 * - Accessible with proper ARIA attributes
 * - Last item is not clickable (current page)
 * - Home icon for first breadcrumb
 *
 * @param customLabels - Optional custom labels for specific paths
 * @param productName - Optional product name for PDP pages
 */

interface BreadcrumbsProps {
  /** Custom labels for specific paths (e.g., { '/products': 'Shop' }) */
  customLabels?: Record<string, string>;
  /** Product name to display on product detail pages */
  productName?: string;
  /** Additional CSS classes */
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

// Default route labels
const DEFAULT_LABELS: Record<string, string> = {
  '': 'Home',
  products: 'Products',
  cart: 'Cart',
  checkout: 'Checkout',
  auth: 'Account',
  login: 'Login',
  register: 'Register',
  orders: 'Orders',
  profile: 'Profile',
};

const Breadcrumbs = ({
  customLabels = {},
  productName,
  className = '',
}: BreadcrumbsProps) => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Home', path: '/', isLast: pathSegments.length === 0 },
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Determine label
      let label = customLabels[currentPath] || DEFAULT_LABELS[segment];

      // If it's the last segment and we have a productName, use it
      if (isLast && productName) {
        label = productName;
      }

      // If no label found, format the segment
      if (!label) {
        // Check if it's a numeric ID (for product detail pages)
        if (/^\d+$/.test(segment)) {
          label = productName || `Product #${segment}`;
        } else {
          // Format segment: "my-category" -> "My Category"
          label = segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      items.push({ label, path: currentPath, isLast });
    });

    return items;
  }, [location.pathname, customLabels, productName]);

  // Don't render if only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 text-sm" role="list">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-1 text-gray-400 dark:text-gray-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}

            {crumb.isLast ? (
              <span
                className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]"
                aria-current="page"
                title={crumb.label}
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1">
                    <HomeIcon />
                    <span className="sr-only sm:not-sr-only">{crumb.label}</span>
                  </span>
                ) : (
                  crumb.label
                )}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors truncate max-w-[200px]"
                title={crumb.label}
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1">
                    <HomeIcon />
                    <span className="sr-only sm:not-sr-only">{crumb.label}</span>
                  </span>
                ) : (
                  crumb.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const HomeIcon = () => (
  <svg
    className="w-4 h-4 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

export default Breadcrumbs;
