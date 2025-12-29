/**
 * Product Redux Slice
 * 
 * Manages product catalog state including product list, filters,
 * pagination, and selected product for detail view.
 * 
 * @module store/slices/productSlice
 * 
 * State Structure:
 * - items: Array of products for current view
 * - selectedProduct: Single product for detail page
 * - filters: Active filters (search, category, price, sort)
 * - pagination: Current page, limit, and total count
 * - loading/error: Async operation states
 * 
 * @example
 * ```tsx
 * // Set products from API
 * dispatch(setProducts(products));
 * 
 * // Update filters
 * dispatch(setFilters({ category: 'electronics', sortBy: 'price' }));
 * 
 * // Update pagination
 * dispatch(setPagination({ page: 2 }));
 * ```
 */
import type { Product } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

/**
 * Product sorting options
 * @typedef {('price' | 'rating' | 'newest' | null)} ProductSort
 */
type ProductSort = 'price' | 'rating' | 'newest' | null;

/**
 * Product filter state
 * @typedef ProductFilters
 */
type ProductFilters = {
  /** Search query string */
  search: string;
  /** Selected category slug */
  category: string | null;
  /** Sort field and direction */
  sortBy: ProductSort;
  /** Min and max price range */
  priceRange: [number, number] | null;
};

/**
 * Pagination state
 * @typedef ProductPagination
 */
type ProductPagination = {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
};

/**
 * Product state interface
 * @interface ProductState
 */
export interface ProductState {
  /** Array of products for current view */
  items: Product[];
  /** Selected product for detail page */
  selectedProduct: Product | null;
  /** Active product filters */
  filters: ProductFilters;
  /** Pagination state */
  pagination: ProductPagination;
  /** Whether products are loading */
  loading: boolean;
  /** Error message from failed operation */
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  filters: {
    search: '',
    category: null,
    sortBy: null,
    priceRange: null,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<ProductFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination(state, action: PayloadAction<Partial<ProductPagination>>) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setProductLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setProductError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetProductState: () => initialState,
  },
});

export const {
  setProducts,
  setSelectedProduct,
  setFilters,
  setPagination,
  setProductLoading,
  setProductError,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;
