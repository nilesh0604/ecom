import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ExpressCheckoutProps {
  total: number;
  currency?: string;
  onPaymentSuccess: (provider: ExpressPaymentProvider, paymentDetails: PaymentDetails) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

export type ExpressPaymentProvider = 'apple_pay' | 'google_pay' | 'paypal';

export interface PaymentDetails {
  provider: ExpressPaymentProvider;
  transactionId: string;
  email?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// ============================================================================
// EXPRESS CHECKOUT COMPONENT
// ============================================================================

/**
 * ExpressCheckout Component
 *
 * Provides one-click payment options for faster checkout.
 *
 * Features:
 * - Apple Pay (for Safari/iOS)
 * - Google Pay
 * - PayPal Express
 * - Auto-detect available payment methods
 * - Consistent styling across providers
 *
 * Note: In production, these would integrate with actual payment APIs.
 * This implementation shows the UI and mocks the payment flow.
 */
const ExpressCheckout = ({
  total,
  currency = 'USD',
  onPaymentSuccess,
  onPaymentError,
  className = '',
}: ExpressCheckoutProps) => {
  const [processingProvider, setProcessingProvider] = useState<ExpressPaymentProvider | null>(
    null
  );

  // Check if Apple Pay is available (Safari on macOS/iOS)
  const isApplePayAvailable = () => {
    // In production: window.ApplePaySession?.canMakePayments()
    return (
      typeof window !== 'undefined' &&
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    );
  };

  // Check if Google Pay is available
  const isGooglePayAvailable = () => {
    // In production: use Google Pay API isReadyToPay()
    return true; // Show for demo purposes
  };

  // Simulate payment processing
  const processPayment = async (provider: ExpressPaymentProvider): Promise<PaymentDetails> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate success (in production, this would call actual payment APIs)
    return {
      provider,
      transactionId: `${provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      email: 'customer@example.com',
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
    };
  };

  const handleExpressPayment = async (provider: ExpressPaymentProvider) => {
    setProcessingProvider(provider);

    try {
      const paymentDetails = await processPayment(provider);
      onPaymentSuccess(provider, paymentDetails);
    } catch {
      onPaymentError?.(`${provider} payment failed. Please try again.`);
    } finally {
      setProcessingProvider(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Apple Pay */}
      {isApplePayAvailable() && (
        <button
          type="button"
          onClick={() => handleExpressPayment('apple_pay')}
          disabled={processingProvider !== null}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Pay ${formatCurrency(total)} with Apple Pay`}
        >
          {processingProvider === 'apple_pay' ? (
            <LoadingSpinner />
          ) : (
            <>
              <ApplePayIcon />
              <span className="font-medium">Pay</span>
            </>
          )}
        </button>
      )}

      {/* Google Pay */}
      {isGooglePayAvailable() && (
        <button
          type="button"
          onClick={() => handleExpressPayment('google_pay')}
          disabled={processingProvider !== null}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-900 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          aria-label={`Pay ${formatCurrency(total)} with Google Pay`}
        >
          {processingProvider === 'google_pay' ? (
            <LoadingSpinner />
          ) : (
            <>
              <GooglePayIcon />
            </>
          )}
        </button>
      )}

      {/* PayPal */}
      <button
        type="button"
        onClick={() => handleExpressPayment('paypal')}
        disabled={processingProvider !== null}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FFC439] text-[#003087] transition-all hover:bg-[#f0b72f] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Pay ${formatCurrency(total)} with PayPal`}
      >
        {processingProvider === 'paypal' ? <LoadingSpinner dark /> : <PayPalIcon />}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            or pay with card
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

const LoadingSpinner = ({ dark = false }: { dark?: boolean }) => (
  <svg
    className={`h-5 w-5 animate-spin ${dark ? 'text-[#003087]' : 'text-white'}`}
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
// PAYMENT ICONS
// ============================================================================

const ApplePayIcon = () => (
  <svg className="h-5 w-8" viewBox="0 0 50 20" fill="currentColor">
    <path d="M9.6 5.3c-.6.7-1.5 1.2-2.4 1.1-.1-.9.3-1.9.9-2.5.6-.7 1.6-1.1 2.3-1.1.1.9-.3 1.8-.8 2.5zm.8 1.3c-1.3-.1-2.5.8-3.1.8s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2.1-1.4 2.5-.4 6.3 1 8.4.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7 1.2 0 1.5.7 2.6.7 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0-.1-2.2-.8-2.2-3.3 0-2.1 1.7-3 1.8-3.1-1-1.5-2.5-1.6-2.9-1.9z" />
    <path d="M21.2 4.3v14.4h2.2v-4.9h3.1c2.8 0 4.8-1.9 4.8-4.8s-1.9-4.7-4.7-4.7h-5.4zm2.2 1.9h2.6c1.9 0 3 1 3 2.8s-1.1 2.9-3 2.9h-2.6V6.2z" />
    <path d="M38.5 18.9c1.4 0 2.6-.7 3.2-1.8h0v1.7h2v-7.4c0-2-1.6-3.3-4.1-3.3-2.3 0-4 1.3-4.1 3.1h2c.2-.8.9-1.4 2-1.4 1.3 0 2 .6 2 1.7v.8l-2.7.2c-2.5.1-3.8 1.2-3.8 3 0 1.8 1.4 3.1 3.5 3.4zm.6-1.7c-1.1 0-1.9-.5-1.9-1.4 0-.9.7-1.4 2-1.5l2.4-.1v.8c0 1.3-1.1 2.2-2.5 2.2z" />
    <path d="M46.2 22.6c2.1 0 3.1-1.6 4-4l3.8-10.5h-2.3l-2.5 8.1h0l-2.5-8.1h-2.4l3.7 10.2-.2.6c-.3 1-1 1.5-2 1.5h-.7v1.9h1.1z" />
  </svg>
);

const GooglePayIcon = () => (
  <svg className="h-5 w-16" viewBox="0 0 80 32" fill="none">
    {/* Google "G" icon */}
    <path
      d="M16 6.4c2.4 0 4 .8 5.2 1.9l3.9-3.9C22.4 1.8 19.4.4 16 .4 9.8.4 4.5 4.3 2 9.7l4.6 3.6C7.8 9.2 11.5 6.4 16 6.4z"
      fill="#EA4335"
    />
    <path
      d="M31.2 16.4c0-1.1-.1-2.2-.3-3.2H16v6h8.6c-.4 2-1.5 3.7-3.1 4.8l4.8 3.7c2.8-2.6 4.4-6.4 4.9-11.3z"
      fill="#4285F4"
    />
    <path
      d="M6.6 19.1c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5L2 6.5C.7 9.1 0 12 0 15s.7 5.9 2 8.5l4.6-3.6v-.8z"
      fill="#FBBC05"
    />
    <path
      d="M16 31.6c3.4 0 6.3-1.1 8.4-3l-4.8-3.7c-1.3.9-3 1.4-4.8 1.4-3.7 0-6.8-2.5-7.9-5.9L2 24c2.5 5 7.8 7.6 14 7.6z"
      fill="#34A853"
    />
    {/* "Pay" text */}
    <text x="38" y="22" fontSize="14" fontWeight="500" fill="currentColor">
      Pay
    </text>
  </svg>
);

const PayPalIcon = () => (
  <svg className="h-5 w-20" viewBox="0 0 100 24" fill="none">
    <path
      d="M37.8 4.8h-6.5c-.4 0-.8.3-.9.7l-2.6 16.8c-.1.3.2.6.5.6h3.1c.4 0 .8-.3.9-.7l.7-4.5c.1-.4.5-.7.9-.7h2c4.3 0 6.8-2.1 7.4-6.2.3-1.8 0-3.2-.8-4.2-.9-1.1-2.6-1.8-4.7-1.8zm.8 6.1c-.4 2.4-2.1 2.4-3.8 2.4h-1l.7-4.3c0-.2.2-.4.5-.4h.4c1.2 0 2.3 0 2.8.7.4.4.5 1 .4 1.6z"
      fill="#003087"
    />
    <path
      d="M56.8 10.8h-3.1c-.2 0-.4.2-.5.4l-.1.8-.2-.3c-.7-1-2.2-1.3-3.7-1.3-3.4 0-6.4 2.6-7 6.3-.3 1.8.1 3.6 1.2 4.8 1 1.1 2.4 1.6 4.1 1.6 2.9 0 4.5-1.9 4.5-1.9l-.1.8c-.1.3.2.6.5.6h2.8c.4 0 .8-.3.9-.7l1.7-10.5c.1-.4-.2-.6-.5-.6h-.5zm-4.5 6.1c-.3 1.8-1.7 3-3.5 3-.9 0-1.6-.3-2.1-.8-.4-.5-.6-1.3-.5-2.1.3-1.8 1.7-3 3.5-3 .9 0 1.6.3 2.1.8.4.5.6 1.3.5 2.1z"
      fill="#003087"
    />
    <path
      d="M73.4 10.8h-3.1c-.3 0-.5.1-.7.3l-3.9 5.8-1.7-5.5c-.1-.4-.5-.6-.9-.6H60c-.3 0-.6.4-.5.7l3.1 9.2-3 4.2c-.2.3.1.8.5.8h3.1c.3 0 .5-.1.7-.3l9.5-13.7c.2-.4-.1-.9-.5-.9h.5z"
      fill="#003087"
    />
    <path
      d="M84.8 4.8h-6.5c-.4 0-.8.3-.9.7l-2.6 16.8c-.1.3.2.6.5.6h3.3c.3 0 .5-.2.6-.5l.7-4.7c.1-.4.5-.7.9-.7h2c4.3 0 6.8-2.1 7.4-6.2.3-1.8 0-3.2-.8-4.2-.9-1.1-2.5-1.8-4.6-1.8zm.8 6.1c-.4 2.4-2.1 2.4-3.8 2.4h-1l.7-4.3c0-.2.2-.4.5-.4h.4c1.2 0 2.3 0 2.8.7.4.4.5 1 .4 1.6z"
      fill="#0070BA"
    />
    <path
      d="M103.8 10.8h-3.1c-.2 0-.4.2-.5.4l-.1.8-.2-.3c-.7-1-2.2-1.3-3.7-1.3-3.4 0-6.4 2.6-7 6.3-.3 1.8.1 3.6 1.2 4.8 1 1.1 2.4 1.6 4.1 1.6 2.9 0 4.5-1.9 4.5-1.9l-.1.8c-.1.3.2.6.5.6h2.8c.4 0 .8-.3.9-.7l1.7-10.5c.1-.4-.2-.6-.5-.6h-0.5zm-4.5 6.1c-.3 1.8-1.7 3-3.5 3-.9 0-1.6-.3-2.1-.8-.4-.5-.6-1.3-.5-2.1.3-1.8 1.7-3 3.5-3 .9 0 1.6.3 2.1.8.4.5.6 1.3.5 2.1z"
      fill="#0070BA"
    />
  </svg>
);

export default ExpressCheckout;
