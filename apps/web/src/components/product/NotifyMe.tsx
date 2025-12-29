import { Button } from '@/components/ui';
import { useToast } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Waitlist/Notify Me Schema
 */
const notifyMeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  variant: z.string().optional(),
});

type NotifyMeFormData = z.infer<typeof notifyMeSchema>;

interface NotifyMeProps {
  productId: number;
  productTitle: string;
  variants?: string[];
  onSuccess?: () => void;
}

/**
 * NotifyMe Component
 *
 * Allows customers to sign up for back-in-stock notifications.
 *
 * Features:
 * - Email capture for out-of-stock items
 * - Optional variant/size preference
 * - Success confirmation with animation
 * - Member priority messaging
 * - Demand signal for inventory planning
 */
const NotifyMe = ({ productId, productTitle, variants, onSuccess }: NotifyMeProps) => {
  const toast = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotifyMeFormData>({
    resolver: zodResolver(notifyMeSchema),
  });

  const onSubmit = async (data: NotifyMeFormData) => {
    try {
      // TODO: Integrate with backend API
      // await waitlistService.addToWaitlist({
      //   email: data.email,
      //   productId,
      //   variant: data.variant,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Notify Me submission:', {
        productId,
        productTitle,
        email: data.email,
        variant: data.variant,
      });

      setIsSubmitted(true);
      toast.success("You'll be notified when this item is back in stock!");
      onSuccess?.();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-200">
              You're on the list!
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              We'll send you an email as soon as <strong>{productTitle}</strong> is back in stock.
            </p>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              Members get priority access when items return.{' '}
              <a href="/login" className="underline hover:no-underline">
                Sign in
              </a>{' '}
              or{' '}
              <a href="/register" className="underline hover:no-underline">
                create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/30">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-amber-800 dark:text-amber-200">
            Get notified when available
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            This item is currently out of stock. Enter your email and we'll notify you when it's back.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
            {/* Variant Selection (if applicable) */}
            {variants && variants.length > 0 && (
              <div>
                <label
                  htmlFor="variant"
                  className="block text-sm font-medium text-amber-800 dark:text-amber-200"
                >
                  Preferred Size/Variant
                </label>
                <select
                  id="variant"
                  className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-amber-700 dark:bg-gray-800 dark:text-white"
                  {...register('variant')}
                >
                  <option value="">Any variant</option>
                  {variants.map((variant) => (
                    <option key={variant} value={variant}>
                      {variant}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="notify-email"
                className="block text-sm font-medium text-amber-800 dark:text-amber-200"
              >
                Email Address
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="email"
                  id="notify-email"
                  placeholder="you@example.com"
                  className={`block flex-1 rounded-md border bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 ${
                    errors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-amber-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-amber-700'
                  }`}
                  {...register('email')}
                />
                <Button type="submit" isLoading={isSubmitting} size="md">
                  Notify Me
                </Button>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Member Priority Notice */}
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <svg
                className="mr-1 inline-block h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Members get early access when items return.{' '}
              <a href="/register" className="underline hover:no-underline">
                Join free
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotifyMe;
