import { Button } from '@/components/ui';
import Input from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
    formatCardNumber,
    formatExpiryDate,
    getCardType,
    paymentSchema,
    type PaymentFormData,
} from './checkoutSchemas';

interface PaymentFormProps {
  defaultValues?: Partial<PaymentFormData>;
  onSubmit: (data: PaymentFormData) => void;
}

/**
 * PaymentForm Component
 *
 * Step 2 of checkout - collects payment details.
 *
 * Features:
 * - Card number formatting with spaces
 * - Expiry date auto-formatting (MM/YY)
 * - Luhn algorithm validation
 * - Card type detection (Visa, Mastercard, etc.)
 * - CVV input masking
 *
 * Security Note:
 * In production, card details should be collected via a PCI-compliant
 * provider (Stripe Elements, Braintree, etc.) rather than raw inputs.
 * This implementation is for demonstration purposes only.
 */
const PaymentForm = ({ defaultValues, onSubmit }: PaymentFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      ...defaultValues,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch is needed for card type detection
  const cardNumber = watch('cardNumber');
  const cardType = getCardType(cardNumber || '');

  const CardIcon = () => {
    const iconClasses = 'h-6 w-8 text-gray-400';

    switch (cardType) {
      case 'visa':
        return (
          <svg className={iconClasses} viewBox="0 0 32 24" fill="currentColor">
            <rect width="32" height="24" rx="4" fill="#1A1F71" />
            <text x="16" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              VISA
            </text>
          </svg>
        );
      case 'mastercard':
        return (
          <svg className={iconClasses} viewBox="0 0 32 24" fill="currentColor">
            <rect width="32" height="24" rx="4" fill="#EB001B" />
            <circle cx="12" cy="12" r="7" fill="#EB001B" />
            <circle cx="20" cy="12" r="7" fill="#F79E1B" />
          </svg>
        );
      case 'amex':
        return (
          <svg className={iconClasses} viewBox="0 0 32 24" fill="currentColor">
            <rect width="32" height="24" rx="4" fill="#006FCF" />
            <text x="16" y="15" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">
              AMEX
            </text>
          </svg>
        );
      default:
        return (
          <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth="2" />
            <line x1="1" y1="10" x2="23" y2="10" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Payment Details
      </h2>

      {/* Security Notice */}
      <div className="mb-6 flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Your payment information is secure and encrypted.</span>
      </div>

      <div className="space-y-4">
        {/* Card Number */}
        <Controller
          name="cardNumber"
          control={control}
          render={({ field }) => (
            <Input
              label="Card Number"
              placeholder="4111 1111 1111 1111"
              autoComplete="cc-number"
              inputMode="numeric"
              autoFocus
              required
              error={errors.cardNumber?.message}
              rightIcon={<CardIcon />}
              value={formatCardNumber(field.value)}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                if (formatted.replace(/\s/g, '').length <= 19) {
                  field.onChange(formatted);
                }
              }}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />

        {/* Cardholder Name */}
        <Input
          label="Cardholder Name"
          placeholder="JOHN DOE"
          autoComplete="cc-name"
          required
          error={errors.cardName?.message}
          {...register('cardName')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Expiry Date */}
          <Controller
            name="expiryDate"
            control={control}
            render={({ field }) => (
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                autoComplete="cc-exp"
                inputMode="numeric"
                required
                error={errors.expiryDate?.message}
                value={field.value}
                onChange={(e) => {
                  const formatted = formatExpiryDate(e.target.value);
                  if (formatted.length <= 5) {
                    field.onChange(formatted);
                  }
                }}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />

          {/* CVV */}
          <Input
            type="password"
            label="CVV"
            placeholder="•••"
            autoComplete="cc-csc"
            inputMode="numeric"
            maxLength={4}
            required
            error={errors.cvv?.message}
            helperText="3 or 4 digits on the back of your card"
            {...register('cvv')}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Review Order
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
