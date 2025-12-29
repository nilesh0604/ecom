import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Virtual Scrolling Hook
 * 
 * Purpose:
 * - Efficiently render large lists by only rendering visible items
 * - Maintains smooth scrolling performance with thousands of items
 * - Reduces DOM nodes and memory usage significantly
 * 
 * Interview Discussion Points:
 * - Why virtual scrolling: DOM nodes are expensive, rendering 10k items = 10k DOM nodes
 * - Windowing technique: only render items in viewport + buffer
 * - Trade-offs: complexity vs performance, not ideal for SEO
 * - Alternatives: react-window, react-virtual, @tanstack/virtual
 * 
 * How it works:
 * 1. Calculate which items are visible based on scroll position
 * 2. Only render those items + a buffer for smooth scrolling
 * 3. Use absolute positioning to place items correctly
 * 4. Container height is set to total height for correct scrollbar
 * 
 * @example
 * ```tsx
 * const { virtualItems, totalHeight, containerRef } = useVirtualScroll({
 *   itemCount: 10000,
 *   itemHeight: 50,
 *   overscan: 5,
 * });
 * 
 * return (
 *   <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       {virtualItems.map(item => (
 *         <div
 *           key={item.index}
 *           style={{
 *             position: 'absolute',
 *             top: item.start,
 *             height: item.size,
 *           }}
 *         >
 *           Row {item.index}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
 */

interface VirtualScrollOptions {
  /** Total number of items in the list */
  itemCount: number;
  /** Height of each item in pixels (for fixed height) */
  itemHeight: number;
  /** Number of items to render outside visible area (buffer) */
  overscan?: number;
  /** Custom height getter for variable height items */
  getItemHeight?: (index: number) => number;
}

interface VirtualItem {
  /** Index in the original data array */
  index: number;
  /** Start position (top) in pixels */
  start: number;
  /** Size (height) in pixels */
  size: number;
}

interface VirtualScrollResult {
  /** Array of virtual items to render */
  virtualItems: VirtualItem[];
  /** Total height of the scrollable content */
  totalHeight: number;
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Current scroll offset */
  scrollOffset: number;
  /** Programmatically scroll to an index */
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  overscan = 3,
  getItemHeight,
}: VirtualScrollOptions): VirtualScrollResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate item positions for variable heights
  const getItemOffset = useCallback(
    (index: number): number => {
      if (!getItemHeight) {
        return index * itemHeight;
      }
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    },
    [itemHeight, getItemHeight]
  );

  // Get height for a specific item
  const getHeight = useCallback(
    (index: number): number => {
      return getItemHeight ? getItemHeight(index) : itemHeight;
    },
    [itemHeight, getItemHeight]
  );

  // Calculate total height of all items
  const totalHeight = getItemHeight
    ? Array.from({ length: itemCount }, (_, i) => getItemHeight(i)).reduce((a, b) => a + b, 0)
    : itemCount * itemHeight;

  // Calculate which items should be visible
  const virtualItems = (() => {
    if (itemCount === 0) return [];

    const items: VirtualItem[] = [];

    // Find start index based on scroll position
    let startIndex = 0;
    let offset = 0;

    if (!getItemHeight) {
      // Fixed height: simple calculation
      startIndex = Math.floor(scrollOffset / itemHeight);
    } else {
      // Variable height: iterate to find start
      while (offset < scrollOffset && startIndex < itemCount) {
        offset += getHeight(startIndex);
        if (offset <= scrollOffset) startIndex++;
      }
    }

    // Apply overscan (buffer before visible area)
    startIndex = Math.max(0, startIndex - overscan);

    // Find end index
    let endIndex = startIndex;
    let accumulatedHeight = getItemOffset(startIndex);

    while (accumulatedHeight < scrollOffset + containerHeight && endIndex < itemCount) {
      accumulatedHeight += getHeight(endIndex);
      endIndex++;
    }

    // Apply overscan (buffer after visible area)
    endIndex = Math.min(itemCount - 1, endIndex + overscan);

    // Build virtual items array
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        start: getItemOffset(i),
        size: getHeight(i),
      });
    }

    return items;
  })();

  // Scroll event handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollOffset(container.scrollTop);
    };

    // Set initial container height
    setContainerHeight(container.clientHeight);

    // Use ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      const container = containerRef.current;
      if (!container) return;

      const align = options?.align || 'start';
      const itemOffset = getItemOffset(index);
      const itemSize = getHeight(index);

      let scrollTo = itemOffset;

      if (align === 'center') {
        scrollTo = itemOffset - containerHeight / 2 + itemSize / 2;
      } else if (align === 'end') {
        scrollTo = itemOffset - containerHeight + itemSize;
      }

      container.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: 'smooth',
      });
    },
    [getItemOffset, getHeight, containerHeight]
  );

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollOffset,
    scrollToIndex,
  };
}

export default useVirtualScroll;
