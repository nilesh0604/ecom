import { config } from '@/config';
import { useMemo } from 'react';

/**
 * Feature Flags - Runtime feature toggle system
 *
 * Demonstrates feature flag patterns for interviews.
 * Allows gradual rollout and A/B testing of features.
 *
 * Interview Discussion Points:
 * - Decouple deployment from release
 * - Enable/disable features without code changes
 * - Support for A/B testing and canary releases
 * - Kill switches for problematic features
 *
 * Implementation Patterns:
 * 1. Environment variables (this implementation)
 * 2. Remote config service (LaunchDarkly, Split.io)
 * 3. User-based targeting (percentage rollout)
 * 4. Context-based (geo, device, user segment)
 *
 * Production Considerations:
 * - Cache remote flags for performance
 * - Default values for offline/error cases
 * - Analytics for flag evaluation
 * - Audit trail for flag changes
 *
 * @example
 * ```tsx
 * // In component
 * function CheckoutPage() {
 *   const { isEnabled } = useFeatureFlags();
 *
 *   return (
 *     <div>
 *       {isEnabled('NEW_CHECKOUT_FLOW') && <NewCheckoutWizard />}
 *       {!isEnabled('NEW_CHECKOUT_FLOW') && <LegacyCheckout />}
 *
 *       {isEnabled('APPLE_PAY') && <ApplePayButton />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @module utils/featureFlags
 */

/**
 * Available feature flags
 *
 * Add new flags here as the app grows.
 * This provides type safety for flag names.
 */
export type FeatureFlag =
  | 'NEW_CHECKOUT_FLOW'
  | 'DARK_MODE'
  | 'ANALYTICS'
  | 'MOCK_DATA'
  | 'REVIEWS'
  | 'WISHLIST'
  | 'APPLE_PAY'
  | 'VIRTUAL_SCROLLING';

/**
 * Feature flag definitions with default values
 *
 * Priority (highest to lowest):
 * 1. Environment variable override
 * 2. User targeting (if implemented)
 * 3. Default value
 */
interface FlagDefinition {
  /** Default value if no override */
  defaultValue: boolean;
  /** Description for documentation */
  description: string;
  /** Environment variable key (optional) */
  envKey?: string;
}

const FLAG_DEFINITIONS: Record<FeatureFlag, FlagDefinition> = {
  NEW_CHECKOUT_FLOW: {
    defaultValue: false,
    description: 'Enable new multi-step checkout wizard',
    envKey: 'VITE_FF_NEW_CHECKOUT',
  },
  DARK_MODE: {
    defaultValue: true,
    description: 'Enable dark mode toggle',
  },
  ANALYTICS: {
    defaultValue: config.isDevelopment ? false : true,
    description: 'Enable analytics tracking',
    envKey: 'VITE_ENABLE_ANALYTICS',
  },
  MOCK_DATA: {
    defaultValue: config.isDevelopment,
    description: 'Use mock data instead of real API',
    envKey: 'VITE_ENABLE_MOCK_DATA',
  },
  REVIEWS: {
    defaultValue: true,
    description: 'Show product reviews section',
  },
  WISHLIST: {
    defaultValue: false,
    description: 'Enable wishlist functionality',
    envKey: 'VITE_FF_WISHLIST',
  },
  APPLE_PAY: {
    defaultValue: false,
    description: 'Enable Apple Pay checkout option',
    envKey: 'VITE_FF_APPLE_PAY',
  },
  VIRTUAL_SCROLLING: {
    defaultValue: false,
    description: 'Enable virtual scrolling for large lists',
    envKey: 'VITE_FF_VIRTUAL_SCROLL',
  },
};

/**
 * Check if a feature flag is enabled
 *
 * @param flag - Feature flag name
 * @returns Whether the flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const definition = FLAG_DEFINITIONS[flag];

  // Check environment variable override first
  if (definition.envKey) {
    const envValue = import.meta.env[definition.envKey];
    if (envValue !== undefined) {
      return envValue === 'true' || envValue === '1';
    }
  }

  // Fall back to default value
  return definition.defaultValue;
}

/**
 * Get all feature flags and their current values
 *
 * Useful for debugging and admin panels
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  const flags = Object.keys(FLAG_DEFINITIONS) as FeatureFlag[];

  return flags.reduce(
    (acc, flag) => {
      acc[flag] = isFeatureEnabled(flag);
      return acc;
    },
    {} as Record<FeatureFlag, boolean>
  );
}

/**
 * useFeatureFlags - React hook for feature flag access
 *
 * Provides memoized access to feature flags in components.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isEnabled, flags } = useFeatureFlags();
 *
 *   if (!isEnabled('WISHLIST')) {
 *     return null;
 *   }
 *
 *   return <WishlistButton />;
 * }
 * ```
 */
export function useFeatureFlags() {
  // Memoize all flags to prevent unnecessary re-renders
  const flags = useMemo(() => getAllFeatureFlags(), []);

  // Memoize the isEnabled function
  const isEnabled = useMemo(
    () => (flag: FeatureFlag) => flags[flag],
    [flags]
  );

  return {
    /** Check if a specific flag is enabled */
    isEnabled,
    /** All flags and their current values */
    flags,
  };
}

/**
 * Feature Flag Component Wrapper
 *
 * Conditionally renders children based on feature flag.
 * Useful for cleaner JSX without inline conditionals.
 *
 * @example
 * ```tsx
 * <FeatureGate flag="WISHLIST">
 *   <WishlistButton />
 * </FeatureGate>
 *
 * <FeatureGate flag="NEW_CHECKOUT" fallback={<LegacyCheckout />}>
 *   <NewCheckout />
 * </FeatureGate>
 * ```
 */
interface FeatureGateProps {
  /** Feature flag to check */
  flag: FeatureFlag;
  /** Content to render if flag is enabled */
  children: React.ReactNode;
  /** Content to render if flag is disabled */
  fallback?: React.ReactNode;
}

export function FeatureGate({
  flag,
  children,
  fallback = null,
}: FeatureGateProps): React.ReactNode {
  return isFeatureEnabled(flag) ? children : fallback;
}

export default { isFeatureEnabled, getAllFeatureFlags, useFeatureFlags, FeatureGate };
