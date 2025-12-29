import { useCallback, useId } from 'react';
import { DEFAULT_SORT_OPTIONS, type SortOption } from './sortOptions';

/**
 * SortDropdown - Dropdown for sorting products
 *
 * Features:
 * - Multiple sort options (price, newest, rating, etc.)
 * - Keyboard accessible
 * - Clear visual indication of current sort
 * - Responsive design
 *
 * @param value - Current sort value
 * @param onChange - Callback when sort changes
 * @param options - Array of sort options
 */

interface SortDropdownProps {
  /** Current sort value */
  value: string;
  /** Callback when sort changes */
  onChange: (value: string) => void;
  /** Available sort options */
  options?: SortOption[];
  /** Additional CSS classes */
  className?: string;
}

const SortDropdown = ({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  className = '',
}: SortDropdownProps) => {
  const id = useId();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
      >
        Sort by:
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          className="appearance-none w-full min-w-[180px] px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 cursor-pointer transition-colors"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SortDropdown;
