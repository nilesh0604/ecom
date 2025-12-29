import { z } from 'zod';

/**
 * Checkout Validation Schemas
 *
 * Using Zod for runtime validation of checkout forms.
 * Benefits:
 * - Type-safe: automatically infers TypeScript types
 * - Reusable: same schemas can be used on backend (Node.js)
 * - Custom messages: user-friendly error messages
 * - Composable: build complex schemas from simple ones
 */

// ============================================================================
// SHIPPING FORM SCHEMA
// ============================================================================

export const shippingSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[+]?[\d\s().-]{7,20}$/,
      'Please enter a valid phone number'
    ),

  address: z
    .string()
    .min(1, 'Street address is required')
    .min(5, 'Please enter a complete address')
    .max(200, 'Address must be less than 200 characters'),

  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),

  state: z
    .string()
    .min(1, 'State/Province is required')
    .max(100, 'State must be less than 100 characters'),

  zipCode: z
    .string()
    .min(1, 'ZIP/Postal code is required')
    .regex(/^[A-Za-z0-9\s-]{3,10}$/, 'Please enter a valid ZIP/Postal code'),

  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters'),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

// ============================================================================
// GIFT OPTIONS SCHEMA
// ============================================================================

/**
 * Gift wrapping options available for orders
 */
export const GIFT_WRAPPING_OPTIONS = [
  { id: 'none', name: 'No gift wrapping', price: 0 },
  { id: 'standard', name: 'Standard Gift Wrap', price: 4.99, description: 'Elegant paper wrap with ribbon' },
  { id: 'premium', name: 'Premium Gift Box', price: 9.99, description: 'Luxury gift box with bow and tissue paper' },
] as const;

export type GiftWrappingId = typeof GIFT_WRAPPING_OPTIONS[number]['id'];

export const giftOptionsSchema = z.object({
  isGift: z.boolean(),
  
  giftWrapping: z.enum(['none', 'standard', 'premium']),
  
  giftMessage: z
    .string()
    .max(250, 'Gift message must be less than 250 characters'),
  
  giftReceipt: z.boolean(),
  
  deliverToDifferentAddress: z.boolean(),
  
  recipientName: z
    .string()
    .max(100, 'Recipient name must be less than 100 characters')
    .optional(),
  
  recipientEmail: z
    .string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
});

export type GiftOptionsFormData = z.infer<typeof giftOptionsSchema>;

// ============================================================================
// PAYMENT FORM SCHEMA
// ============================================================================

/**
 * Luhn Algorithm Check
 * Validates credit card numbers (used by Visa, Mastercard, etc.)
 *
 * Note: In production, never validate card details client-side.
 * Use PCI-compliant providers like Stripe or Braintree.
 * This is for demonstration/mock purposes only.
 */
const luhnCheck = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const digits = cardNumber.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .transform((val) => val.replace(/\s/g, ''))
    .refine((val) => val.length >= 13 && val.length <= 19, {
      message: 'Card number must be between 13 and 19 digits',
    })
    .refine((val) => luhnCheck(val), {
      message: 'Please enter a valid card number',
    }),

  cardName: z
    .string()
    .min(1, 'Cardholder name is required')
    .min(3, 'Please enter the full name on the card')
    .max(100, 'Name must be less than 100 characters'),

  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Use MM/YY format')
    .refine(
      (val) => {
        const [month, year] = val.split('/');
        const expiry = new Date(2000 + parseInt(year, 10), parseInt(month, 10));
        return expiry > new Date();
      },
      { message: 'Card has expired' }
    ),

  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// ============================================================================
// COMBINED CHECKOUT DATA TYPE
// ============================================================================

export interface CheckoutData {
  shipping: ShippingFormData;
  payment: PaymentFormData;
}

// ============================================================================
// UTILITY: Card formatting helpers
// ============================================================================

/**
 * Format card number with spaces (e.g., "4111 1111 1111 1111")
 */
export const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
};

/**
 * Format expiry date as MM/YY
 */
export const formatExpiryDate = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
};

/**
 * Get card type from number (for icons)
 */
export const getCardType = (
  cardNumber: string
): 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown' => {
  const digits = cardNumber.replace(/\s/g, '');

  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';

  return 'unknown';
};

// Export Luhn check for testing
export { luhnCheck };
