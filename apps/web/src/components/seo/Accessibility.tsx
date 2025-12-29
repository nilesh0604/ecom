import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// SKIP LINK COMPONENT
// ============================================================================

interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

/**
 * SkipLink Component
 *
 * Provides a hidden link that becomes visible on focus, allowing keyboard
 * users to skip to main content quickly.
 */
export const SkipLink = ({ targetId = 'main-content', label = 'Skip to content' }: SkipLinkProps) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
    >
      {label}
    </a>
  );
};

// ============================================================================
// SKIP LINKS GROUP COMPONENT
// ============================================================================

interface SkipLinksProps {
  links?: Array<{
    targetId: string;
    label: string;
  }>;
}

/**
 * SkipLinks Component
 *
 * Multiple skip links for complex page layouts.
 */
export const SkipLinks = ({ links }: SkipLinksProps) => {
  const defaultLinks = [
    { targetId: 'main-content', label: 'Skip to main content' },
    { targetId: 'main-nav', label: 'Skip to navigation' },
    { targetId: 'footer', label: 'Skip to footer' },
  ];

  const skipLinks = links || defaultLinks;

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:left-4 focus-within:top-4 focus-within:z-[9999] focus-within:flex focus-within:flex-col focus-within:gap-2">
      {skipLinks.map((link) => (
        <a
          key={link.targetId}
          href={`#${link.targetId}`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white outline-none ring-2 ring-transparent focus:ring-white"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

// ============================================================================
// REDUCED MOTION HOOK
// ============================================================================

/**
 * useReducedMotion Hook
 *
 * Detects user's reduced motion preference and provides a boolean value.
 * Use this to disable or reduce animations for users who prefer reduced motion.
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// ============================================================================
// HIGH CONTRAST MODE TOGGLE
// ============================================================================

/**
 * useHighContrast Hook
 *
 * Manages high contrast mode preference with localStorage persistence.
 */
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem('high-contrast');
    if (stored === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    if (mediaQuery.matches && !stored) {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast((prev) => {
      const newValue = !prev;
      localStorage.setItem('high-contrast', String(newValue));
      if (newValue) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      return newValue;
    });
  }, []);

  return { isHighContrast, toggleHighContrast };
};

// ============================================================================
// HIGH CONTRAST TOGGLE BUTTON
// ============================================================================

interface HighContrastToggleProps {
  className?: string;
}

/**
 * HighContrastToggle Component
 *
 * Button to toggle high contrast mode.
 */
export const HighContrastToggle = ({ className = '' }: HighContrastToggleProps) => {
  const { isHighContrast, toggleHighContrast } = useHighContrast();

  return (
    <button
      type="button"
      onClick={toggleHighContrast}
      className={`
        inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors
        ${
          isHighContrast
            ? 'border-black bg-black text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }
        ${className}
      `}
      aria-pressed={isHighContrast}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeWidth={2} d="M12 2a10 10 0 000 20" fill="currentColor" />
      </svg>
      <span>High Contrast</span>
    </button>
  );
};

// ============================================================================
// FOCUS TRAP HOOK
// ============================================================================

/**
 * useFocusTrap Hook
 *
 * Traps focus within a container element (useful for modals, dialogs).
 */
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element
    firstElement?.focus();

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
};

// ============================================================================
// SCREEN READER ONLY TEXT
// ============================================================================

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * VisuallyHidden Component
 *
 * Hides content visually but keeps it accessible to screen readers.
 */
export const VisuallyHidden = ({ children, as: Component = 'span' }: VisuallyHiddenProps) => {
  return <Component className="sr-only">{children}</Component>;
};

// ============================================================================
// LIVE REGION FOR ANNOUNCEMENTS
// ============================================================================

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * LiveRegion Component
 *
 * Announces dynamic content changes to screen readers.
 */
export const LiveRegion = ({ message, politeness = 'polite' }: LiveRegionProps) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

// ============================================================================
// FOCUS VISIBLE POLYFILL HOOK
// ============================================================================

/**
 * useFocusVisible Hook
 *
 * Provides :focus-visible like behavior for older browsers.
 */
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [hadKeyboardEvent, setHadKeyboardEvent] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Escape') {
        setHadKeyboardEvent(true);
      }
    };

    const handleMouseDown = () => {
      setHadKeyboardEvent(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocusVisible(hadKeyboardEvent);
  }, [hadKeyboardEvent]);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return { isFocusVisible, handleFocus, handleBlur };
};

export default {
  SkipLink,
  SkipLinks,
  useReducedMotion,
  useHighContrast,
  HighContrastToggle,
  useFocusTrap,
  VisuallyHidden,
  LiveRegion,
  useFocusVisible,
};
