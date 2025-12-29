import { Button } from '@/components/ui';
import { type ReactNode } from 'react';

/**
 * Checkout step identifiers
 * @typedef {'shipping' | 'gift' | 'payment' | 'review' | 'confirmation'} CheckoutStep
 */
export type CheckoutStep = 'shipping' | 'gift' | 'payment' | 'review' | 'confirmation';

/**
 * Step configuration for progress indicator
 * @interface Step
 */
interface Step {
  /** Unique step identifier */
  id: CheckoutStep;
  /** Display label for the step */
  label: string;
  /** Step number (1-indexed) */
  number: number;
}

/** Ordered list of checkout steps */
const STEPS: Step[] = [
  { id: 'shipping', label: 'Shipping', number: 1 },
  { id: 'gift', label: 'Gift', number: 2 },
  { id: 'payment', label: 'Payment', number: 3 },
  { id: 'review', label: 'Review', number: 4 },
  { id: 'confirmation', label: 'Confirm', number: 5 },
];

/**
 * Props for CheckoutWizard component
 * @interface CheckoutWizardProps
 */
interface CheckoutWizardProps {
  /** Current active step in the checkout flow */
  currentStep: CheckoutStep;
  /** Step content to render */
  children: ReactNode;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Whether back navigation is allowed (default: true) */
  canGoBack?: boolean;
}

/**
 * CheckoutWizard Component
 *
 * Multi-step checkout container with progress indicator.
 *
 * Features:
 * - Visual progress steps (numbered circles with labels)
 * - Responsive design (horizontal steps collapse on mobile)
 * - Back navigation
 * - Dark mode support
 *
 * Note: Step navigation is controlled by parent via currentStep prop.
 * Each step form handles its own "Next" action and validation.
 */
const CheckoutWizard = ({
  currentStep,
  children,
  onBack,
  canGoBack = true,
}: CheckoutWizardProps) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <nav aria-label="Checkout progress" className="mb-8">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = step.id === currentStep;
            const isUpcoming = index > currentIndex;

            return (
              <li
                key={step.id}
                className="relative flex flex-1 flex-col items-center"
              >
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className={`absolute left-0 top-4 -translate-y-1/2 h-0.5 w-full -translate-x-1/2 ${
                      isCompleted
                        ? 'bg-indigo-600 dark:bg-indigo-400'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    aria-hidden="true"
                  />
                )}

                {/* Step circle */}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : isCurrent
                        ? 'border-2 border-indigo-600 bg-white text-indigo-600 dark:border-indigo-400 dark:bg-gray-900 dark:text-indigo-400'
                        : 'border-2 border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-500'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`mt-2 text-xs font-medium sm:text-sm ${
                    isCompleted || isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isUpcoming
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
        {children}
      </div>

      {/* Back Button (shown on gift, payment and review steps) */}
      {canGoBack && currentStep !== 'shipping' && currentStep !== 'confirmation' && onBack && (
        <div className="mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="inline-flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default CheckoutWizard;
