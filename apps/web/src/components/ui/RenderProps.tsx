import { useCallback, useEffect, useState } from 'react';

/**
 * Render Props Pattern Examples
 * 
 * Purpose:
 * - Share stateful logic between components using a render function
 * - Alternative to HOCs and hooks for cross-cutting concerns
 * - Provides more flexibility than HOCs for dynamic rendering
 * 
 * Interview Discussion Points:
 * - When to use: Sharing complex stateful logic, flexible UI rendering
 * - vs Hooks: Render props pre-date hooks, hooks are now preferred for most cases
 * - vs HOC: More flexible, no wrapper component naming issues
 * - Trade-offs: Can lead to "callback hell", slightly harder to type
 * 
 * Common use cases:
 * - Mouse/scroll position tracking
 * - Data fetching with different UIs
 * - Form state management
 * - Animation state
 */

// =============================================================================
// EXAMPLE 1: Mouse Position Tracker
// =============================================================================

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  children: (position: MousePosition) => React.ReactNode;
}

/**
 * Mouse Tracker using Render Props pattern
 * 
 * @example
 * ```tsx
 * <MouseTracker>
 *   {({ x, y }) => (
 *     <div>Mouse is at ({x}, {y})</div>
 *   )}
 * </MouseTracker>
 * ```
 */
export function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{children(position)}</>;
}

// =============================================================================
// EXAMPLE 2: Toggle State
// =============================================================================

interface ToggleRenderProps {
  isOn: boolean;
  toggle: () => void;
  setOn: () => void;
  setOff: () => void;
}

interface ToggleProps {
  initialValue?: boolean;
  children: (props: ToggleRenderProps) => React.ReactNode;
}

/**
 * Toggle using Render Props pattern
 * 
 * @example
 * ```tsx
 * <Toggle initialValue={false}>
 *   {({ isOn, toggle }) => (
 *     <button onClick={toggle}>
 *       {isOn ? 'ON' : 'OFF'}
 *     </button>
 *   )}
 * </Toggle>
 * ```
 */
export function Toggle({ initialValue = false, children }: ToggleProps) {
  const [isOn, setIsOn] = useState(initialValue);

  const toggle = useCallback(() => setIsOn((prev) => !prev), []);
  const setOn = useCallback(() => setIsOn(true), []);
  const setOff = useCallback(() => setIsOn(false), []);

  return <>{children({ isOn, toggle, setOn, setOff })}</>;
}

// =============================================================================
// EXAMPLE 3: Data Fetcher (Generic)
// =============================================================================

interface FetcherRenderProps<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface FetcherProps<T> {
  url: string;
  children: (props: FetcherRenderProps<T>) => React.ReactNode;
}

/**
 * Generic Data Fetcher using Render Props
 * 
 * @example
 * ```tsx
 * <Fetcher<User[]> url="/api/users">
 *   {({ data, isLoading, error }) => {
 *     if (isLoading) return <Spinner />;
 *     if (error) return <Error message={error.message} />;
 *     return <UserList users={data} />;
 *   }}
 * </Fetcher>
 * ```
 */
export function Fetcher<T>({ url, children }: FetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (isMounted) {
          setData(result);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted && (err as Error).name !== 'AbortError') {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url, fetchKey]);

  return <>{children({ data, isLoading, error, refetch })}</>;
}

// =============================================================================
// EXAMPLE 4: Window Size Tracker
// =============================================================================

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface WindowSizeTrackerProps {
  children: (size: WindowSize) => React.ReactNode;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

/**
 * Window Size Tracker using Render Props
 * 
 * @example
 * ```tsx
 * <WindowSizeTracker>
 *   {({ isMobile, width }) => (
 *     isMobile ? <MobileNav /> : <DesktopNav />
 *   )}
 * </WindowSizeTracker>
 * ```
 */
export function WindowSizeTracker({
  children,
  mobileBreakpoint = 640,
  tabletBreakpoint = 1024,
}: WindowSizeTrackerProps) {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false,
    isTablet:
      typeof window !== 'undefined'
        ? window.innerWidth >= mobileBreakpoint && window.innerWidth < tabletBreakpoint
        : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= tabletBreakpoint : false,
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setSize({
        width,
        height,
        isMobile: width < mobileBreakpoint,
        isTablet: width >= mobileBreakpoint && width < tabletBreakpoint,
        isDesktop: width >= tabletBreakpoint,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBreakpoint, tabletBreakpoint]);

  return <>{children(size)}</>;
}

// =============================================================================
// EXAMPLE 5: List with Selection (Compound Render Props)
// =============================================================================

interface SelectionState<T> {
  selected: T[];
  isSelected: (item: T) => boolean;
  toggle: (item: T) => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectedCount: number;
}

interface SelectableListProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  children: (state: SelectionState<T>) => React.ReactNode;
}

/**
 * Selectable List using Render Props
 * Manages multi-selection state for any list of items
 * 
 * @example
 * ```tsx
 * <SelectableList items={products} getKey={(p) => p.id}>
 *   {({ selected, isSelected, toggle, selectAll, clearSelection }) => (
 *     <>
 *       <button onClick={selectAll}>Select All</button>
 *       <button onClick={clearSelection}>Clear</button>
 *       {products.map(p => (
 *         <ProductCard
 *           key={p.id}
 *           product={p}
 *           selected={isSelected(p)}
 *           onToggle={() => toggle(p)}
 *         />
 *       ))}
 *       <div>Selected: {selected.length}</div>
 *     </>
 *   )}
 * </SelectableList>
 * ```
 */
export function SelectableList<T>({ items, getKey, children }: SelectableListProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const isSelected = useCallback(
    (item: T) => selectedKeys.has(getKey(item)),
    [selectedKeys, getKey]
  );

  const toggle = useCallback(
    (item: T) => {
      const key = getKey(item);
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [getKey]
  );

  const selectAll = useCallback(() => {
    setSelectedKeys(new Set(items.map(getKey)));
  }, [items, getKey]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const selected = items.filter((item) => selectedKeys.has(getKey(item)));

  return (
    <>
      {children({
        selected,
        isSelected,
        toggle,
        selectAll,
        clearSelection,
        selectedCount: selected.length,
      })}
    </>
  );
}

export default {
  MouseTracker,
  Toggle,
  Fetcher,
  WindowSizeTracker,
  SelectableList,
};
