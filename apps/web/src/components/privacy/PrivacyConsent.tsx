import { Button } from '@/components/ui';
import { useEffect, useState } from 'react';

/**
 * PrivacyConsent - Cookie consent, marketing preferences, data requests
 *
 * Features:
 * - Cookie consent banner (GDPR/CCPA compliant)
 * - Granular cookie preferences
 * - Marketing opt-in/out management
 * - Data export/delete request
 */

// ============================================================================
// Types
// ============================================================================

export interface CookiePreferences {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface MarketingPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  postal: boolean;
}

export interface DataRequestType {
  type: 'export' | 'delete';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date | string;
  completedAt?: Date | string;
  downloadUrl?: string;
}

// ============================================================================
// Cookie Consent Banner
// ============================================================================

export interface CookieConsentBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onManage: () => void;
  isVisible: boolean;
  variant?: 'banner' | 'modal';
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  className?: string;
}

export const CookieConsentBanner = ({
  onAcceptAll,
  onRejectAll,
  onManage,
  isVisible,
  variant = 'banner',
  privacyPolicyUrl = '/privacy',
  cookiePolicyUrl = '/cookies',
  className = '',
}: CookieConsentBannerProps) => {
  if (!isVisible) return null;

  if (variant === 'modal') {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 z-40" />

        {/* Modal */}
        <div
          className={`fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 p-6 ${className}`}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                We value your privacy
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                We use cookies to enhance your browsing experience, serve personalized ads or
                content, and analyze our traffic. By clicking "Accept All", you consent to our use
                of cookies.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" fullWidth onClick={onAcceptAll}>
              Accept All
            </Button>
            <Button variant="secondary" fullWidth onClick={onManage}>
              Manage Preferences
            </Button>
            <Button variant="ghost" fullWidth onClick={onRejectAll}>
              Reject All
            </Button>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            By continuing, you agree to our{' '}
            <a href={privacyPolicyUrl} className="underline hover:no-underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href={cookiePolicyUrl} className="underline hover:no-underline">
              Cookie Policy
            </a>
            .
          </p>
        </div>
      </>
    );
  }

  // Banner variant
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We use cookies to improve your experience. By continuing to browse, you accept our{' '}
              <a href={cookiePolicyUrl} className="underline hover:no-underline">
                cookie policy
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={onRejectAll}>
              Reject
            </Button>
            <Button variant="secondary" size="sm" onClick={onManage}>
              Manage
            </Button>
            <Button variant="primary" size="sm" onClick={onAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Cookie Preferences Modal
// ============================================================================

export interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: CookiePreferences;
  onSave: (preferences: CookiePreferences) => void;
  className?: string;
}

export const CookiePreferencesModal = ({
  isOpen,
  onClose,
  preferences,
  onSave,
  className = '',
}: CookiePreferencesModalProps) => {
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  if (!isOpen) return null;

  const cookieCategories = [
    {
      key: 'necessary' as const,
      title: 'Strictly Necessary',
      description:
        'These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
      required: true,
    },
    {
      key: 'analytics' as const,
      title: 'Analytics',
      description:
        'These cookies help us understand how visitors interact with our website, helping us improve our services and user experience.',
      required: false,
    },
    {
      key: 'marketing' as const,
      title: 'Marketing',
      description:
        'These cookies are used to track visitors across websites to display relevant advertisements based on your interests.',
      required: false,
    },
    {
      key: 'personalization' as const,
      title: 'Personalization',
      description:
        'These cookies allow us to remember your preferences and settings to provide a personalized experience.',
      required: false,
    },
  ];

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary cookies
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(localPreferences);
    onClose();
  };

  const handleAcceptAll = () => {
    const allEnabled: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    onSave(allEnabled);
    onClose();
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    onSave(onlyNecessary);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div
        className={`fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col max-h-[90vh] ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cookie Preferences</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage your cookie preferences below. You can enable or disable different categories of
            cookies. Note that blocking some types of cookies may impact your experience.
          </p>

          <div className="space-y-6">
            {cookieCategories.map((category) => (
              <div
                key={category.key}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{category.title}</h3>
                    {category.required && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (Always Active)
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localPreferences[category.key]}
                    onChange={() => handleToggle(category.key)}
                    disabled={category.required}
                    className="sr-only peer"
                  />
                  <div
                    className={`
                      w-11 h-6 rounded-full peer transition-colors
                      ${
                        category.required
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                          : localPreferences[category.key]
                            ? 'bg-black dark:bg-white'
                            : 'bg-gray-300 dark:bg-gray-600'
                      }
                      after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                      after:bg-white dark:after:bg-gray-900 after:rounded-full after:h-5 after:w-5
                      after:transition-all peer-checked:after:translate-x-full
                    `}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={handleRejectAll}>
            Reject All
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" onClick={handleAcceptAll}>
            Accept All
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// Marketing Preferences
// ============================================================================

export interface MarketingPreferencesFormProps {
  preferences: MarketingPreferences;
  onSave: (preferences: MarketingPreferences) => Promise<void>;
  email?: string;
  phone?: string;
  className?: string;
}

export const MarketingPreferencesForm = ({
  preferences,
  onSave,
  email,
  phone,
  className = '',
}: MarketingPreferencesFormProps) => {
  const [localPreferences, setLocalPreferences] = useState<MarketingPreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const channels = [
    {
      key: 'email' as const,
      title: 'Email',
      description: 'Receive promotional emails, newsletters, and special offers.',
      value: email ? `Currently: ${email}` : undefined,
    },
    {
      key: 'sms' as const,
      title: 'SMS / Text Messages',
      description: 'Get text alerts about orders, promotions, and exclusive deals.',
      value: phone ? `Currently: ${phone}` : undefined,
    },
    {
      key: 'push' as const,
      title: 'Push Notifications',
      description: 'Receive browser notifications about sales and new arrivals.',
    },
    {
      key: 'postal' as const,
      title: 'Postal Mail',
      description: 'Receive catalogs and promotional materials by mail.',
    },
  ];

  const handleToggle = (key: keyof MarketingPreferences) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localPreferences);
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    const allDisabled: MarketingPreferences = {
      email: false,
      sms: false,
      push: false,
      postal: false,
    };
    setLocalPreferences(allDisabled);
    setIsSaving(true);
    try {
      await onSave(allDisabled);
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Marketing Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Choose how you'd like to hear from us. You can update these preferences at any time.
        </p>
      </div>

      <div className="space-y-4">
        {channels.map((channel) => (
          <div
            key={channel.key}
            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">{channel.title}</h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {channel.description}
              </p>
              {channel.value && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{channel.value}</p>
              )}
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences[channel.key]}
                onChange={() => handleToggle(channel.key)}
                className="sr-only peer"
              />
              <div
                className={`
                  w-11 h-6 rounded-full peer transition-colors
                  ${
                    localPreferences[channel.key]
                      ? 'bg-black dark:bg-white'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }
                  after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                  after:bg-white dark:after:bg-gray-900 after:rounded-full after:h-5 after:w-5
                  after:transition-all peer-checked:after:translate-x-full
                `}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" onClick={handleUnsubscribeAll} disabled={isSaving}>
          Unsubscribe from All
        </Button>
        <div className="flex-1" />
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          {saved ? '✓ Saved' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// Data Privacy Request
// ============================================================================

export interface DataPrivacyRequestProps {
  existingRequests?: DataRequestType[];
  onRequestExport: () => Promise<void>;
  onRequestDelete: () => Promise<void>;
  className?: string;
}

export const DataPrivacyRequest = ({
  existingRequests = [],
  onRequestExport,
  onRequestDelete,
  className = '',
}: DataPrivacyRequestProps) => {
  const [isRequesting, setIsRequesting] = useState<'export' | 'delete' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = async () => {
    setIsRequesting('export');
    try {
      await onRequestExport();
    } finally {
      setIsRequesting(null);
    }
  };

  const handleDelete = async () => {
    setIsRequesting('delete');
    try {
      await onRequestDelete();
    } finally {
      setIsRequesting(null);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: DataRequestType['status']) => {
    const colors = {
      pending: 'text-amber-600 dark:text-amber-400',
      processing: 'text-blue-600 dark:text-blue-400',
      completed: 'text-green-600 dark:text-green-400',
      rejected: 'text-red-600 dark:text-red-400',
    };
    return colors[status];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Data Rights</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          You have the right to access, export, or request deletion of your personal data.
        </p>
      </div>

      {/* Request Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Data */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Export My Data</h4>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Request a copy of all your personal data. You'll receive a downloadable file within 30
            days.
          </p>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleExport}
            isLoading={isRequesting === 'export'}
          >
            Request Export
          </Button>
        </div>

        {/* Delete Data */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">Delete My Data</h4>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Request permanent deletion of your personal data. This action cannot be undone.
          </p>

          <Button variant="ghost" fullWidth onClick={() => setShowDeleteConfirm(true)}>
            Request Deletion
          </Button>
        </div>
      </div>

      {/* Existing Requests */}
      {existingRequests.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Requests</h4>
          <div className="space-y-3">
            {existingRequests.map((request, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    Data {request.type}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Requested {formatDate(request.requestedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium capitalize ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>

                  {request.status === 'completed' && request.downloadUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(request.downloadUrl, '_blank')}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Your Data?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                This will permanently delete all your personal data, including order history,
                addresses, and preferences. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleDelete}
                isLoading={isRequesting === 'delete'}
                className="!bg-red-600 hover:!bg-red-700"
              >
                Delete Data
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// Consent Manager Hook
// ============================================================================

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export const useConsentManager = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });

  useEffect(() => {
    // Check for existing consent
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const storedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (storedConsent !== null) {
      setHasConsent(storedConsent === 'true');
    }

    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch {
        // Invalid stored preferences, use defaults
      }
    }
  }, []);

  const acceptAll = () => {
    const allEnabled: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(allEnabled);
    setHasConsent(true);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allEnabled));
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(onlyNecessary);
    setHasConsent(true);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(onlyNecessary));
  };

  const savePreferences = (newPreferences: CookiePreferences) => {
    setPreferences({ ...newPreferences, necessary: true });
    setHasConsent(true);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
  };

  const resetConsent = () => {
    setHasConsent(null);
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
  };

  return {
    hasConsent,
    preferences,
    acceptAll,
    rejectAll,
    savePreferences,
    resetConsent,
    showBanner: hasConsent === null,
  };
};
