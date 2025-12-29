import { useCallback, useState } from 'react';

/**
 * useOptimistic - Hook for optimistic UI updates with rollback
 *
 * Demonstrates the optimistic update pattern for interviews.
 * Updates UI immediately, then syncs with server, rolling back on failure.
 *
 * Interview Discussion Points:
 * - Optimistic updates improve perceived performance
 * - Must handle rollback on server failure
 * - Consider conflict resolution strategies
 * - Works well with eventual consistency
 *
 * Use Cases:
 * - Add to cart (show immediately, sync later)
 * - Like/favorite buttons
 * - Toggle switches
 * - Quantity updates
 *
 * Trade-offs:
 * - Better UX (instant feedback)
 * - More complex error handling
 * - Potential for UI/server state mismatch
 * - Need to communicate failures to user
 *
 * @example
 * ```tsx
 * function AddToCartButton({ product }) {
 *   const { execute, isLoading, error } = useOptimistic();
 *
 *   const handleClick = () => {
 *     execute({
 *       // Optimistic update (runs immediately)
 *       optimisticUpdate: () => {
 *         dispatch(addCartItem(product));
 *         toast.success('Added to cart!');
 *       },
 *       // Server sync (runs after)
 *       serverAction: async () => {
 *         await cartService.addItem(product.id);
 *       },
 *       // Rollback on failure
 *       rollback: () => {
 *         dispatch(removeCartItem(product.id));
 *         toast.error('Failed to add. Please try again.');
 *       },
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={isLoading}>
 *       Add to Cart
 *     </button>
 *   );
 * }
 * ```
 *
 * @see https://react.dev/reference/react/useOptimistic (React 19)
 */

interface OptimisticAction {
  /** Function to execute immediately (optimistic update) */
  optimisticUpdate: () => void;
  /** Async function to sync with server */
  serverAction: () => Promise<void>;
  /** Function to rollback optimistic update on failure */
  rollback: () => void;
  /** Optional callback on success */
  onSuccess?: () => void;
}

interface UseOptimisticResult {
  /** Execute an optimistic action */
  execute: (action: OptimisticAction) => Promise<void>;
  /** Whether server sync is in progress */
  isLoading: boolean;
  /** Error from last failed action */
  error: Error | null;
  /** Clear the error state */
  clearError: () => void;
}

/**
 * Hook for optimistic updates with automatic rollback
 *
 * @returns Methods and state for optimistic updates
 */
function useOptimistic(): UseOptimisticResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (action: OptimisticAction) => {
    const { optimisticUpdate, serverAction, rollback, onSuccess } = action;

    // Clear previous error
    setError(null);

    // Step 1: Apply optimistic update immediately
    try {
      optimisticUpdate();
    } catch (optimisticError) {
      // If optimistic update fails, don't proceed
      console.error('Optimistic update failed:', optimisticError);
      setError(optimisticError as Error);
      return;
    }

    // Step 2: Sync with server
    setIsLoading(true);

    try {
      await serverAction();
      // Success! Optimistic update was correct
      onSuccess?.();
    } catch (serverError) {
      // Step 3: Server failed, rollback optimistic update
      console.error('Server sync failed, rolling back:', serverError);
      setError(serverError as Error);

      try {
        rollback();
      } catch (rollbackError) {
        // Critical: rollback failed, log for debugging
        console.error('Rollback failed:', rollbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    clearError,
  };
}

export default useOptimistic;
export type { OptimisticAction, UseOptimisticResult };
