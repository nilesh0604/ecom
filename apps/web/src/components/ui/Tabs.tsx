import {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

/**
 * Tabs - Compound Component Pattern
 *
 * Demonstrates the compound component pattern for interviews.
 * Uses React Context to share state between parent and children.
 *
 * Key Interview Points:
 * - Context for implicit state sharing
 * - Flexible composition API
 * - Type-safe children validation
 * - Accessible by default (ARIA roles)
 *
 * @example
 * ```tsx
 * <Tabs defaultTab="overview">
 *   <Tabs.List>
 *     <Tabs.Tab id="overview">Overview</Tabs.Tab>
 *     <Tabs.Tab id="specs">Specifications</Tabs.Tab>
 *     <Tabs.Tab id="reviews">Reviews</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panels>
 *     <Tabs.Panel id="overview">
 *       <p>Product overview content...</p>
 *     </Tabs.Panel>
 *     <Tabs.Panel id="specs">
 *       <p>Technical specifications...</p>
 *     </Tabs.Panel>
 *     <Tabs.Panel id="reviews">
 *       <p>Customer reviews...</p>
 *     </Tabs.Panel>
 *   </Tabs.Panels>
 * </Tabs>
 * ```
 *
 * Pattern Benefits:
 * - Clean, declarative API
 * - Flexible ordering of elements
 * - State encapsulated in parent
 * - Easy to extend with new features
 *
 * @see https://kentcdodds.com/blog/compound-components-with-react-hooks
 */

// ============================================
// Context
// ============================================

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs parent');
  }
  return context;
}

// ============================================
// Main Tabs Component
// ============================================

interface TabsProps {
  /** Default active tab ID */
  defaultTab: string;
  /** Controlled active tab (optional) */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Tab content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Root Tabs component - provides context for all child components
 */
function Tabs({
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className = '',
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);

  // Support both controlled and uncontrolled modes
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const setActiveTab = useCallback(
    (id: string) => {
      if (controlledActiveTab === undefined) {
        setInternalActiveTab(id);
      }
      onTabChange?.(id);
    },
    [controlledActiveTab, onTabChange]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ activeTab, setActiveTab }),
    [activeTab, setActiveTab]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

// ============================================
// Tab List Component
// ============================================

interface TabsListProps {
  children: ReactNode;
  className?: string;
  /** Aria label for the tab list */
  ariaLabel?: string;
}

/**
 * Container for Tab buttons - renders as role="tablist"
 */
function TabsList({
  children,
  className = '',
  ariaLabel = 'Tabs',
}: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================
// Individual Tab Button
// ============================================

interface TabProps {
  /** Unique identifier for this tab */
  id: string;
  /** Tab label content */
  children: ReactNode;
  /** Disable this tab */
  disabled?: boolean;
  className?: string;
}

/**
 * Individual tab button - handles selection and ARIA
 */
function Tab({ id, children, disabled = false, className = '' }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        px-4 py-2 text-sm font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${
          isActive
            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
            : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
        }
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ============================================
// Panels Container
// ============================================

interface TabsPanelsProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for Tab panels - only renders the active panel
 */
function TabsPanels({ children, className = '' }: TabsPanelsProps) {
  const { activeTab } = useTabsContext();

  // Find and render only the active panel
  const activePanel = Children.toArray(children).find((child) => {
    if (isValidElement(child) && child.props.id === activeTab) {
      return true;
    }
    return false;
  });

  return <div className={`mt-4 ${className}`}>{activePanel}</div>;
}

// ============================================
// Individual Panel
// ============================================

interface TabPanelProps {
  /** Must match a Tab's id */
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Individual tab panel - renders content for a specific tab
 */
function TabPanel({ id, children, className = '' }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================
// Compound Component Export
// ============================================

/**
 * Compound component pattern:
 * Attach sub-components as static properties
 *
 * This allows the clean API:
 *   <Tabs.List>, <Tabs.Tab>, <Tabs.Panels>, <Tabs.Panel>
 */
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panels = TabsPanels;
Tabs.Panel = TabPanel;

export default Tabs;

// Also export individual components for flexibility
export { Tab, TabPanel, TabsList, TabsPanels };
export type { TabPanelProps, TabProps, TabsListProps, TabsPanelsProps, TabsProps };

