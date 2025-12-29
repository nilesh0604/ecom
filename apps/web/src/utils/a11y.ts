/**
 * Accessibility Utilities
 * 
 * Helpers for improving accessibility throughout the application.
 * These utilities follow WCAG 2.1 AA guidelines.
 */

/**
 * Announces a message to screen readers using an aria-live region
 * 
 * @param message - The message to announce
 * @param priority - 'polite' (waits for pause) or 'assertive' (interrupts)
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  // Check if announcer element exists, create if not
  let announcer = document.getElementById('sr-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  // Update priority if needed
  announcer.setAttribute('aria-live', priority);

  // Clear and set message (triggers announcement)
  announcer.textContent = '';
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
};

/**
 * Trap focus within an element (for modals, dialogs)
 * 
 * @param container - The element to trap focus within
 * @returns Cleanup function to remove event listeners
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab: going backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: going forward
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Generate a unique ID for accessibility labels
 */
let idCounter = 0;
export const generateA11yId = (prefix: string = 'a11y'): string => {
  return `${prefix}-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Skip link component props generator
 * Use for "Skip to main content" links
 */
export const getSkipLinkProps = (targetId: string) => ({
  href: `#${targetId}`,
  className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-white focus:px-4 focus:py-2 focus:text-indigo-600 focus:shadow-lg focus:rounded',
  children: 'Skip to main content',
});

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
} as const;

/**
 * Check if a keyboard event is an activation key (Enter or Space)
 */
export const isActivationKey = (e: KeyboardEvent | React.KeyboardEvent): boolean => {
  return e.key === KeyboardKeys.ENTER || e.key === KeyboardKeys.SPACE;
};

/**
 * Handle keyboard activation for custom interactive elements
 */
export const handleKeyboardActivation = (
  e: React.KeyboardEvent,
  handler: () => void
): void => {
  if (isActivationKey(e)) {
    e.preventDefault();
    handler();
  }
};

/**
 * Color contrast ratio calculator (for WCAG compliance checks)
 * 
 * WCAG AA requires:
 * - 4.5:1 for normal text
 * - 3:1 for large text (18pt+ or 14pt+ bold)
 * 
 * @param foreground - Foreground color in hex (e.g., '#000000')
 * @param background - Background color in hex (e.g., '#FFFFFF')
 * @returns Contrast ratio (1:1 to 21:1)
 */
export const calculateContrastRatio = (
  foreground: string,
  background: string
): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hex
      .replace('#', '')
      .match(/.{2}/g)
      ?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];
    
    const [r, g, b] = rgb.map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast meets WCAG AA standards
 */
export const meetsContrastRequirements = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};
