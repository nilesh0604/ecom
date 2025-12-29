import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

const purchaseGiftCardSchema = z.object({
  amount: z.number().min(10, 'Minimum amount is $10').max(500, 'Maximum amount is $500'),
  customAmount: z.string().optional(),
  recipientEmail: z.string().email('Please enter a valid email'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  senderName: z.string().min(1, 'Your name is required'),
  message: z.string().max(200, 'Message must be 200 characters or less').optional(),
  deliveryDate: z.string().optional(),
  design: z.string(),
});

type PurchaseGiftCardFormData = z.infer<typeof purchaseGiftCardSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

const PRESET_AMOUNTS = [25, 50, 75, 100, 150, 200];

const GIFT_CARD_DESIGNS = [
  { id: 'classic', name: 'Classic', color: 'from-indigo-600 to-purple-600' },
  { id: 'birthday', name: 'Birthday', color: 'from-pink-500 to-rose-500' },
  { id: 'thank-you', name: 'Thank You', color: 'from-green-500 to-emerald-500' },
  { id: 'holiday', name: 'Holiday', color: 'from-red-500 to-orange-500' },
  { id: 'celebration', name: 'Celebration', color: 'from-yellow-500 to-amber-500' },
];

// ============================================================================
// PURCHASE GIFT CARD COMPONENT
// ============================================================================

interface PurchaseGiftCardProps {
  onPurchase?: (data: PurchaseGiftCardFormData) => void;
}

/**
 * PurchaseGiftCard Component
 *
 * Allows customers to purchase digital gift cards.
 *
 * Features:
 * - Preset and custom amounts
 * - Recipient details
 * - Personal message
 * - Scheduled delivery
 * - Multiple card designs
 */
export const PurchaseGiftCard = ({ onPurchase }: PurchaseGiftCardProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseGiftCardFormData>({
    resolver: zodResolver(purchaseGiftCardSchema),
    defaultValues: {
      amount: 50,
      design: 'classic',
      recipientEmail: '',
      recipientName: '',
      senderName: '',
      message: '',
    },
  });

  const selectedDesign = watch('design');

  const handleAmountSelect = (amount: number | 'custom') => {
    setSelectedAmount(amount);
    if (amount !== 'custom') {
      setValue('amount', amount);
    }
  };

  const onSubmit = async (data: PurchaseGiftCardFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onPurchase?.(data);
    setIsSubmitting(false);
  };

  const currentDesign = GIFT_CARD_DESIGNS.find((d) => d.id === selectedDesign);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Purchase a Gift Card
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Gift Card Preview */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentDesign?.color} p-8 text-white shadow-xl`}
        >
          <div className="absolute right-4 top-4 text-white/30">
            <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 00-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/80">Gift Card</p>
          <p className="mt-2 text-4xl font-bold">
            ${selectedAmount === 'custom' ? '---' : selectedAmount}
          </p>
          <p className="mt-4 text-sm text-white/80">eCom Store</p>
        </div>

        {/* Amount Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Amount
          </label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleAmountSelect(amount)}
                className={`
                  rounded-lg border-2 px-4 py-3 text-center font-medium transition-all
                  ${
                    selectedAmount === amount
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                  }
                `}
              >
                ${amount}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleAmountSelect('custom')}
            className={`
              mt-3 w-full rounded-lg border-2 px-4 py-3 text-center font-medium transition-all
              ${
                selectedAmount === 'custom'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
              }
            `}
          >
            Custom Amount
          </button>
          {selectedAmount === 'custom' && (
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 dark:border-gray-600 dark:bg-gray-800"
                  placeholder="Enter amount (10-500)"
                  min={10}
                  max={500}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Design Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Choose a Design
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {GIFT_CARD_DESIGNS.map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => setValue('design', design.id)}
                className={`
                  flex shrink-0 flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all
                  ${
                    selectedDesign === design.id
                      ? 'border-indigo-600 dark:border-indigo-500'
                      : 'border-gray-200 dark:border-gray-600'
                  }
                `}
              >
                <div
                  className={`h-12 w-20 rounded-lg bg-gradient-to-br ${design.color}`}
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {design.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Details */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Recipient Details</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recipient's Name
              </label>
              <input
                type="text"
                {...register('recipientName')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
                placeholder="John Doe"
              />
              {errors.recipientName && (
                <p className="mt-1 text-sm text-red-600">{errors.recipientName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recipient's Email
              </label>
              <input
                type="email"
                {...register('recipientEmail')}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
                placeholder="john@example.com"
              />
              {errors.recipientEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.recipientEmail.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Name
            </label>
            <input
              type="text"
              {...register('senderName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
              placeholder="Your name"
            />
            {errors.senderName && (
              <p className="mt-1 text-sm text-red-600">{errors.senderName.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Personal Message (optional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
              placeholder="Write a personal message..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Delivery Date (optional)
            </label>
            <input
              type="date"
              {...register('deliveryDate')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800"
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leave blank to send immediately
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          ) : (
            `Purchase $${selectedAmount === 'custom' ? '---' : selectedAmount} Gift Card`
          )}
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// CHECK GIFT CARD BALANCE COMPONENT
// ============================================================================

interface GiftCardBalanceProps {
  onCheck?: (code: string) => void;
}

/**
 * GiftCardBalance Component
 *
 * Allows customers to check their gift card balance.
 */
export const GiftCardBalance = ({ onCheck }: GiftCardBalanceProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setBalance(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response - in production this would be a real API call
      if (code.toUpperCase().startsWith('GC-')) {
        setBalance(Math.floor(Math.random() * 200) + 10);
        onCheck?.(code);
      } else {
        setError('Invalid gift card code. Please check and try again.');
      }
    } catch {
      setError('Failed to check balance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Check Gift Card Balance
      </h2>

      <div className="flex gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter gift card code (e.g., GC-XXXX-XXXX)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 uppercase dark:border-gray-600 dark:bg-gray-700"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={loading || !code.trim()}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {balance !== null && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-400">Current Balance:</p>
          <p className="text-3xl font-bold text-green-800 dark:text-green-300">
            ${balance.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STORE CREDIT DISPLAY COMPONENT
// ============================================================================

interface StoreCreditDisplayProps {
  balance: number;
  transactions?: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
  }>;
}

/**
 * StoreCreditDisplay Component
 *
 * Shows user's store credit balance and transaction history.
 */
export const StoreCreditDisplay = ({ balance, transactions = [] }: StoreCreditDisplayProps) => {
  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-white/80">Store Credit Balance</p>
        <p className="mt-2 text-4xl font-bold">${balance.toFixed(2)}</p>
        <p className="mt-4 text-sm text-white/80">Available for your next purchase</p>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`font-medium ${
                    tx.type === 'credit'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// APPLY GIFT CARD AT CHECKOUT COMPONENT
// ============================================================================

interface ApplyGiftCardProps {
  onApply: (code: string, balance: number) => void;
  appliedCards?: Array<{ code: string; amount: number }>;
  onRemove?: (code: string) => void;
}

/**
 * ApplyGiftCard Component
 *
 * Allows applying gift card at checkout.
 */
export const ApplyGiftCard = ({ onApply, appliedCards = [], onRemove }: ApplyGiftCardProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;

    // Check if already applied
    if (appliedCards.some((c) => c.code === code.toUpperCase())) {
      setError('This gift card has already been applied');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (code.toUpperCase().startsWith('GC-')) {
        const mockBalance = Math.floor(Math.random() * 100) + 25;
        onApply(code.toUpperCase(), mockBalance);
        setCode('');
      } else {
        setError('Invalid gift card code');
      }
    } catch {
      setError('Failed to apply gift card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Gift card code"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase dark:border-gray-600 dark:bg-gray-700"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {appliedCards.length > 0 && (
        <div className="space-y-2">
          {appliedCards.map((card) => (
            <div
              key={card.code}
              className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {card.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  -${card.amount.toFixed(2)}
                </span>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(card.code)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  PurchaseGiftCard,
  GiftCardBalance,
  StoreCreditDisplay,
  ApplyGiftCard,
};
