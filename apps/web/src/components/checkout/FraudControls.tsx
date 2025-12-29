import { Badge, Button } from '@/components/ui';
import { useState } from 'react';

/**
 * FraudControls - Components for fraud detection and risk management
 *
 * Features:
 * - Risk scoring display (for admin/internal views)
 * - Velocity checks indicators
 * - Manual review state management
 * - Verification challenges for customers
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskSignal {
  type: string;
  description: string;
  severity: RiskLevel;
  score: number;
}

export interface RiskAssessment {
  overallScore: number;
  level: RiskLevel;
  signals: RiskSignal[];
  requiresManualReview: boolean;
  requiresVerification: boolean;
  timestamp: Date | string;
}

/**
 * RiskScoreBadge - Visual indicator for risk level
 */
export interface RiskScoreBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export const RiskScoreBadge = ({
  level,
  score,
  showScore = true,
  className = '',
}: RiskScoreBadgeProps) => {
  const config = {
    low: {
      variant: 'success' as const,
      label: 'Low Risk',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    medium: {
      variant: 'warning' as const,
      label: 'Medium Risk',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    high: {
      variant: 'error' as const,
      label: 'High Risk',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    critical: {
      variant: 'error' as const,
      label: 'Critical Risk',
      color: 'text-red-800 dark:text-red-300',
      bgColor: 'bg-red-200 dark:bg-red-900/50',
    },
  };

  const { label, color, bgColor } = config[level];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} ${className}`}>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      {showScore && score !== undefined && (
        <span className={`text-xs font-bold ${color}`}>{score}</span>
      )}
    </div>
  );
};

/**
 * RiskAssessmentPanel - Admin panel showing risk details
 */
export interface RiskAssessmentPanelProps {
  assessment: RiskAssessment;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestVerification?: () => void;
  isProcessing?: boolean;
  className?: string;
}

export const RiskAssessmentPanel = ({
  assessment,
  onApprove,
  onReject,
  onRequestVerification,
  isProcessing = false,
  className = '',
}: RiskAssessmentPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: RiskLevel) => {
    const colors = {
      low: 'text-green-600 dark:text-green-400',
      medium: 'text-amber-600 dark:text-amber-400',
      high: 'text-red-600 dark:text-red-400',
      critical: 'text-red-800 dark:text-red-300',
    };
    return colors[severity];
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Risk Assessment</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Evaluated at {formatDate(assessment.timestamp)}
          </p>
        </div>
        <RiskScoreBadge level={assessment.level} score={assessment.overallScore} />
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap gap-2 mt-4">
        {assessment.requiresManualReview && (
          <Badge variant="warning">⚠️ Manual Review Required</Badge>
        )}
        {assessment.requiresVerification && (
          <Badge variant="info">🔐 Verification Needed</Badge>
        )}
      </div>

      {/* Risk signals */}
      {assessment.signals.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {assessment.signals.length} Risk Signals
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {assessment.signals.map((signal, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div
                    className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                      signal.severity === 'low'
                        ? 'bg-green-500'
                        : signal.severity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{signal.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{signal.description}</p>
                  </div>
                  <span className={`text-sm font-medium ${getSeverityColor(signal.severity)}`}>
                    +{signal.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(onApprove || onReject || onRequestVerification) && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onApprove && (
            <Button
              variant="primary"
              size="sm"
              onClick={onApprove}
              disabled={isProcessing}
              isLoading={isProcessing}
            >
              Approve Order
            </Button>
          )}
          {onRequestVerification && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRequestVerification}
              disabled={isProcessing}
            >
              Request Verification
            </Button>
          )}
          {onReject && (
            <Button variant="ghost" size="sm" onClick={onReject} disabled={isProcessing}>
              Reject Order
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * VelocityCheckIndicator - Shows velocity limit status
 */
export interface VelocityCheck {
  type: 'orders' | 'cards' | 'addresses' | 'amount';
  current: number;
  limit: number;
  timeWindow: string;
  exceeded: boolean;
}

export interface VelocityCheckIndicatorProps {
  checks: VelocityCheck[];
  className?: string;
}

export const VelocityCheckIndicator = ({ checks, className = '' }: VelocityCheckIndicatorProps) => {
  const exceededChecks = checks.filter((c) => c.exceeded);

  if (exceededChecks.length === 0) {
    return null;
  }

  const getCheckLabel = (type: VelocityCheck['type']) => {
    const labels = {
      orders: 'Orders',
      cards: 'Payment methods',
      addresses: 'Addresses',
      amount: 'Total spend',
    };
    return labels[type];
  };

  return (
    <div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
        <div className="flex-1">
          <h4 className="font-medium text-red-800 dark:text-red-200">Velocity Limits Exceeded</h4>
          <ul className="mt-2 space-y-1">
            {exceededChecks.map((check, index) => (
              <li key={index} className="text-sm text-red-700 dark:text-red-300">
                • {getCheckLabel(check.type)}: {check.current} / {check.limit} in {check.timeWindow}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * VerificationChallenge - Customer-facing verification component
 */
export type VerificationType = 'email' | 'phone' | 'card' | 'document';

export interface VerificationChallengeProps {
  type: VerificationType;
  maskedValue?: string;
  onSubmit: (code: string) => Promise<boolean>;
  onResend?: () => void;
  className?: string;
}

export const VerificationChallenge = ({
  type,
  maskedValue,
  onSubmit,
  onResend,
  className = '',
}: VerificationChallengeProps) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const getTypeConfig = () => {
    const configs = {
      email: {
        title: 'Verify your email',
        description: `We sent a 6-digit code to ${maskedValue || 'your email'}`,
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      phone: {
        title: 'Verify your phone',
        description: `We sent a 6-digit code to ${maskedValue || 'your phone'}`,
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      card: {
        title: 'Verify your payment',
        description: 'Enter the code from your card statement',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        ),
      },
      document: {
        title: 'Identity verification',
        description: 'Enter the code from your ID document',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
            />
          </svg>
        ),
      },
    };
    return configs[type];
  };

  const config = getTypeConfig();

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      document.getElementById(`code-${nextIndex}`)?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value.replace(/\D/g, '');
      setCode(newCode);
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
    setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit(fullCode);
      if (!success) {
        setError('Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        document.getElementById('code-0')?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    await onResend?.();
    setTimeout(() => setIsResending(false), 30000); // 30s cooldown
  };

  return (
    <div className={`max-w-md mx-auto text-center ${className}`}>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
          {config.icon}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{config.title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{config.description}</p>

      {/* Code input */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-12 h-14 text-center text-2xl font-bold border rounded-lg
                focus:outline-none focus:ring-2
                ${
                  error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white'
                }
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              `}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          disabled={code.some((d) => !d)}
          className="mt-6"
        >
          Verify
        </Button>
      </form>

      {/* Resend */}
      {onResend && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-50"
          >
            {isResending ? "Code sent! Check your inbox" : "Didn't receive a code? Resend"}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * ManualReviewBanner - Customer-facing banner when order is under review
 */
export interface ManualReviewBannerProps {
  orderId: string;
  estimatedReviewTime?: string;
  contactEmail?: string;
  className?: string;
}

export const ManualReviewBanner = ({
  orderId,
  estimatedReviewTime = '24 hours',
  contactEmail = 'support@example.com',
  className = '',
}: ManualReviewBannerProps) => {
  return (
    <div
      className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
          <svg
            className="w-6 h-6 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            Order Under Review
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Your order <span className="font-medium">#{orderId}</span> is being reviewed by our
            team. This usually takes up to {estimatedReviewTime}.
          </p>

          <div className="mt-4 space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <p>What happens next:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>We'll verify your order details</li>
              <li>You'll receive an email confirmation once approved</li>
              <li>Your payment will only be charged upon approval</li>
            </ul>
          </div>

          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            Questions? Contact us at{' '}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium underline hover:no-underline"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * OrderBlockedBanner - Shown when order is blocked due to fraud
 */
export interface OrderBlockedBannerProps {
  reason?: string;
  contactEmail?: string;
  className?: string;
}

export const OrderBlockedBanner = ({
  reason = 'security reasons',
  contactEmail = 'support@example.com',
  className = '',
}: OrderBlockedBannerProps) => {
  return (
    <div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-red-800 dark:text-red-200">
            Unable to Process Order
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            We were unable to process your order due to {reason}. Your payment was not charged.
          </p>

          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            If you believe this is an error, please contact us at{' '}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium underline hover:no-underline"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
