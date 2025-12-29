import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Redux Store Hooks
 * 
 * Type-safe hooks for accessing Redux store in components.
 * These hooks provide full TypeScript support for state and dispatch.
 * 
 * @module store/hooks
 * 
 * Why typed hooks:
 * - Provides autocomplete for state properties
 * - Type-checks action creators at compile time
 * - Reduces boilerplate in components
 * - Prevents runtime errors from incorrect state access
 */

/**
 * useAppDispatch - Typed dispatch hook for Redux actions
 * 
 * Use this instead of plain `useDispatch` for type safety.
 * 
 * @returns {AppDispatch} Typed dispatch function
 * 
 * @example
 * ```tsx
 * const dispatch = useAppDispatch();
 * dispatch(addCartItem(product)); // Type-checked!
 * ```
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * useAppSelector - Typed selector hook for Redux state
 * 
 * Use this instead of plain `useSelector` for type safety.
 * 
 * @template TSelected - Type of the selected state slice
 * @param {(state: RootState) => TSelected} selector - State selector function
 * @returns {TSelected} Selected state value
 * 
 * @example
 * ```tsx
 * // Direct state access
 * const items = useAppSelector(state => state.cart.items);
 * 
 * // With memoized selector
 * const cartTotal = useAppSelector(selectCartTotal);
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
