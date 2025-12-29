import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import React from 'react';

/**
 * VirtualList Component
 * 
 * A reusable virtualized list component that efficiently renders large datasets
 * by only rendering items currently visible in the viewport.
 * 
 * Interview Discussion Points:
 * - Performance: O(visible items) instead of O(total items) for rendering
 * - Memory: Only creates DOM nodes for visible items + buffer
 * - Trade-offs: Increased complexity, requires fixed/known heights
 * - When to use: Lists with 100+ items, infinite scroll, large data tables
 * 
 * @example
 * ```tsx
 * <VirtualList
 *   items={products}
 *   itemHeight={80}
 *   height={600}
 *   renderItem={(product, index) => (
 *     <ProductCard key={product.id} product={product} />
 *   )}
 * />
 * ```
 */

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Fixed height of each item in pixels */
  itemHeight: number;
  /** Height of the scrollable container */
  height: number;
  /** Width of the container (default: 100%) */
  width?: string | number;
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Number of items to render outside visible area */
  overscan?: number;
  /** Custom className for the container */
  className?: string;
  /** Custom className for each item wrapper */
  itemClassName?: string;
  /** Callback when scroll position changes */
  onScroll?: (scrollOffset: number) => void;
  /** Key extractor function */
  getKey?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  width = '100%',
  renderItem,
  overscan = 5,
  className = '',
  itemClassName = '',
  onScroll,
  getKey,
}: VirtualListProps<T>) {
  const { virtualItems, totalHeight, containerRef, scrollOffset } = useVirtualScroll({
    itemCount: items.length,
    itemHeight,
    overscan,
  });

  // Call onScroll callback when scroll position changes
  React.useEffect(() => {
    onScroll?.(scrollOffset);
  }, [scrollOffset, onScroll]);

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={`overflow-auto ${className}`}
      style={{ height, width }}
      role="list"
      aria-label="Virtual scrolling list"
    >
      <div
        style={{
          height: totalHeight,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = getKey ? getKey(item, virtualItem.index) : virtualItem.index;

          return (
            <div
              key={key}
              role="listitem"
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualList;
