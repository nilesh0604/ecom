import { Button } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
    GIFT_WRAPPING_OPTIONS,
    giftOptionsSchema,
    type GiftOptionsFormData,
} from './checkoutSchemas';

interface GiftOptionsProps {
  defaultValues?: Partial<GiftOptionsFormData>;
  onSubmit: (data: GiftOptionsFormData) => void;
  onSkip: () => void;
}

/**
 * GiftOptions Component
 *
 * Optional step in checkout - allows customers to add gift options.
 *
 * Features:
 * - "This is a gift" checkbox toggle
 * - Gift wrapping selection (free/paid options)
 * - Gift message input with character limit
 * - Gift receipt option (hides prices)
 * - Delivery to different address option
 * - Recipient notification email (optional)
 */
const GiftOptions = ({ defaultValues, onSubmit, onSkip }: GiftOptionsProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GiftOptionsFormData>({
    resolver: zodResolver(giftOptionsSchema),
    defaultValues: {
      isGift: false,
      giftWrapping: 'none',
      giftMessage: '',
      giftReceipt: false,
      deliverToDifferentAddress: false,
      recipientName: '',
      recipientEmail: '',
      ...defaultValues,
    },
  });

  const isGift = useWatch({ control, name: 'isGift' });
  const giftMessage = useWatch({ control, name: 'giftMessage' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Gift Options
      </h2>

      {/* Is this a gift toggle */}
      <div className="mb-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
            {...register('isGift')}
          />
          <div>
            <span className="text-base font-medium text-gray-900 dark:text-white">
              This order is a gift
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add gift wrapping, a personal message, or a gift receipt
            </p>
          </div>
        </label>
      </div>

      {/* Gift options (shown when isGift is true) */}
      {isGift && (
        <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          {/* Gift Wrapping Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gift Wrapping
            </label>
            <div className="space-y-3">
              {GIFT_WRAPPING_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={option.id}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      {...register('giftWrapping')}
                    />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {option.name}
                      </span>
                      {'description' in option && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Gift Message */}
          <div>
            <label
              htmlFor="giftMessage"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Gift Message (optional)
            </label>
            <textarea
              id="giftMessage"
              rows={4}
              placeholder="Enter your personal message for the recipient..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              {...register('giftMessage')}
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-red-500">{errors.giftMessage?.message}</span>
              <span className={`${(giftMessage?.length || 0) > 250 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {giftMessage?.length || 0}/250
              </span>
            </div>
          </div>

          {/* Gift Receipt */}
          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                {...register('giftReceipt')}
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Include gift receipt
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Packing slip will not show prices
                </p>
              </div>
            </label>
          </div>

          {/* Recipient Notification */}
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Recipient Notification (optional)
            </h4>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              We can send an email to the recipient when the gift ships
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="recipientName"
                  className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                >
                  Recipient Name
                </label>
                <input
                  type="text"
                  id="recipientName"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  {...register('recipientName')}
                />
                {errors.recipientName && (
                  <span className="text-xs text-red-500">{errors.recipientName.message}</span>
                )}
              </div>
              <div>
                <label
                  htmlFor="recipientEmail"
                  className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                >
                  Recipient Email
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  placeholder="recipient@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  {...register('recipientEmail')}
                />
                {errors.recipientEmail && (
                  <span className="text-xs text-red-500">{errors.recipientEmail.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
        >
          Skip Gift Options
        </Button>
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Continue to Payment
        </Button>
      </div>
    </form>
  );
};

export default GiftOptions;
