import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type SocialProvider = 'google' | 'apple' | 'facebook';

interface SocialAuthButtonsProps {
  mode: 'login' | 'register';
  onSuccess?: (provider: SocialProvider, userData: SocialAuthData) => void;
  onError?: (provider: SocialProvider, error: string) => void;
  className?: string;
  disabled?: boolean;
}

export interface SocialAuthData {
  provider: SocialProvider;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
  accessToken: string;
}

// ============================================================================
// SOCIAL AUTH BUTTONS COMPONENT
// ============================================================================

/**
 * SocialAuthButtons Component
 *
 * Provides social login/signup options.
 *
 * Features:
 * - Continue with Google
 * - Continue with Apple
 * - Continue with Facebook (optional)
 * - Loading states for each provider
 * - Error handling
 *
 * Note: In production, these would integrate with actual OAuth providers.
 * This implementation shows the UI and mocks the auth flow.
 */
const SocialAuthButtons = ({
  mode,
  onSuccess,
  onError,
  className = '',
  disabled = false,
}: SocialAuthButtonsProps) => {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const actionText = mode === 'login' ? 'Continue' : 'Sign up';

  // Simulate OAuth flow
  const handleSocialAuth = async (provider: SocialProvider) => {
    if (disabled || loadingProvider) return;

    setLoadingProvider(provider);

    try {
      // In production, this would:
      // 1. Open OAuth popup or redirect
      // 2. Handle OAuth callback
      // 3. Exchange code for tokens
      // 4. Fetch user profile

      // Simulate OAuth delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful auth response
      const mockUserData: SocialAuthData = {
        provider,
        providerId: `${provider}-${Date.now()}`,
        email: `user@${provider}.com`,
        firstName: 'John',
        lastName: 'Doe',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        accessToken: `mock-${provider}-token-${Date.now()}`,
      };

      onSuccess?.(provider, mockUserData);
    } catch {
      onError?.(provider, `Failed to authenticate with ${provider}`);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Google */}
      <button
        type="button"
        onClick={() => handleSocialAuth('google')}
        disabled={disabled || loadingProvider !== null}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        data-testid="google-login-button"
      >
        {loadingProvider === 'google' ? (
          <LoadingSpinner />
        ) : (
          <>
            <GoogleIcon />
            <span className="font-medium">{actionText} with Google</span>
          </>
        )}
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={() => handleSocialAuth('apple')}
        disabled={disabled || loadingProvider !== null}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-black text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        data-testid="apple-login-button"
      >
        {loadingProvider === 'apple' ? (
          <LoadingSpinner light />
        ) : (
          <>
            <AppleIcon />
            <span className="font-medium">{actionText} with Apple</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            or {mode === 'login' ? 'sign in' : 'sign up'} with email
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ONE-TAP SIGN IN COMPONENT
// ============================================================================

interface OneTapSignInProps {
  onSuccess?: (userData: SocialAuthData) => void;
  onDismiss?: () => void;
}

/**
 * OneTapSignIn Component
 *
 * Shows a Google One-Tap sign-in prompt.
 * Appears as a floating card in the corner.
 */
export const OneTapSignIn = ({ onSuccess, onDismiss }: OneTapSignInProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isVisible) return null;

  const handleSignIn = async () => {
    setLoading(true);
    // Simulate sign-in
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUserData: SocialAuthData = {
      provider: 'google',
      providerId: `google-${Date.now()}`,
      email: 'user@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=onetap',
      accessToken: `mock-google-token-${Date.now()}`,
    };

    onSuccess?.(mockUserData);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className="fixed right-4 top-20 z-50 w-80 animate-slide-in-right rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-800">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Dismiss"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <GoogleIcon />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Sign in with Google
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Use your Google account
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? <LoadingSpinner /> : 'Continue as John'}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

// ============================================================================
// ACCOUNT LINKING COMPONENT
// ============================================================================

interface AccountLinkingProps {
  existingEmail: string;
  newProvider: SocialProvider;
  onLink: () => void;
  onCancel: () => void;
}

/**
 * AccountLinking Component
 *
 * Prompts user to link social account with existing email account.
 */
export const AccountLinking = ({
  existingEmail,
  newProvider,
  onLink,
  onCancel,
}: AccountLinkingProps) => {
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onLink();
  };

  const providerName = newProvider.charAt(0).toUpperCase() + newProvider.slice(1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <svg
            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <h3 className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-white">
        Account Already Exists
      </h3>

      <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
        An account with <strong>{existingEmail}</strong> already exists. Would you like to link
        your {providerName} account to it?
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleLink}
          disabled={loading}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : `Link ${providerName} Account`}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-300 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Use Different Email
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

const LoadingSpinner = ({ light = false }: { light?: boolean }) => (
  <svg
    className={`h-5 w-5 animate-spin ${light ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============================================================================
// SOCIAL ICONS
// ============================================================================

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export default SocialAuthButtons;
