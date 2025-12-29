/**
 * Sort options for product listing
 */

export type SortOption = {
  value: string;
  label: string;
};

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'title-asc', label: 'Name: A to Z' },
  { value: 'title-desc', label: 'Name: Z to A' },
];
