/**
 * ReferralCodeInput Component
 * Input field for applying referral codes at checkout
 * DTC Feature: Referral Program (6.3)
 */

import React, { useState } from 'react';

export interface ReferralCodeInputProps {
  onApply: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
  appliedCode?: string;
  appliedDiscount?: number;
  onRemove?: () => void;
  placeholder?: string;
  className?: string;
}

export const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({
  onApply,
  appliedCode,
  appliedDiscount,
  onRemove,
  placeholder = 'Enter referral code',
  className = '',
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onApply(code.trim().toUpperCase());
      if (result.success) {
        setSuccess(result.message);
        setCode('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to apply code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Applied state
  if (appliedCode) {
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">Referral code applied!</p>
              <p className="text-sm text-green-600">
                <span className="font-mono font-bold">{appliedCode}</span>
                {appliedDiscount && ` - ${formatCurrency(appliedDiscount)} off`}
              </p>
            </div>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-sm text-green-700 hover:text-green-900 font-medium"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
              setSuccess(null);
            }}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-lg font-mono uppercase focus:outline-none focus:ring-2 transition-colors ${
              error
                ? 'border-red-300 focus:ring-red-500'
                : success
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {(error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error && (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {success && (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Apply'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Success Message */}
      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </p>
      )}

      {/* Help Text */}
      <p className="mt-2 text-xs text-gray-500">
        Got a referral code from a friend? Enter it here for a discount!
      </p>
    </div>
  );
};

export default ReferralCodeInput;
