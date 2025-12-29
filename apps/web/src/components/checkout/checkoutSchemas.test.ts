import { describe, expect, it } from 'vitest';
import {
    formatCardNumber,
    formatExpiryDate,
    getCardType,
    luhnCheck,
    paymentSchema,
    shippingSchema,
} from './checkoutSchemas';

// ============================================================================
// SHIPPING SCHEMA TESTS
// ============================================================================

describe('shippingSchema', () => {
  const validShipping = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  };

  it('should validate a complete valid shipping form', () => {
    const result = shippingSchema.safeParse(validShipping);
    expect(result.success).toBe(true);
  });

  it('should reject empty required fields', () => {
    const result = shippingSchema.safeParse({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const result = shippingSchema.safeParse({
      ...validShipping,
      email: 'invalid-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should reject invalid phone numbers', () => {
    const result = shippingSchema.safeParse({
      ...validShipping,
      phone: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('phone');
    }
  });

  it('should accept various valid phone formats', () => {
    const validPhones = [
      '+1 555-123-4567',
      '(555) 123-4567',
      '555.123.4567',
      '+44 20 7123 4567',
    ];

    validPhones.forEach((phone) => {
      const result = shippingSchema.safeParse({ ...validShipping, phone });
      expect(result.success).toBe(true);
    });
  });

  it('should reject ZIP codes that are too short', () => {
    const result = shippingSchema.safeParse({
      ...validShipping,
      zipCode: '12',
    });
    expect(result.success).toBe(false);
  });

  it('should accept international postal codes', () => {
    const validZips = ['10001', 'SW1A 1AA', 'M5H 2N2'];
    validZips.forEach((zipCode) => {
      const result = shippingSchema.safeParse({ ...validShipping, zipCode });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// PAYMENT SCHEMA TESTS
// ============================================================================

describe('paymentSchema', () => {
  // Use a future date for expiry
  const futureYear = String((new Date().getFullYear() + 2) % 100).padStart(2, '0');
  
  const validPayment = {
    cardNumber: '4111111111111111',
    cardName: 'JOHN DOE',
    expiryDate: `12/${futureYear}`,
    cvv: '123',
  };

  it('should validate a complete valid payment form', () => {
    const result = paymentSchema.safeParse(validPayment);
    expect(result.success).toBe(true);
  });

  it('should reject empty required fields', () => {
    const result = paymentSchema.safeParse({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid card numbers (Luhn check)', () => {
    const result = paymentSchema.safeParse({
      ...validPayment,
      cardNumber: '1234567890123456',
    });
    expect(result.success).toBe(false);
  });

  it('should accept card numbers with spaces', () => {
    const result = paymentSchema.safeParse({
      ...validPayment,
      cardNumber: '4111 1111 1111 1111',
    });
    expect(result.success).toBe(true);
  });

  it('should reject expired cards', () => {
    const result = paymentSchema.safeParse({
      ...validPayment,
      expiryDate: '01/20', // January 2020
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid expiry format', () => {
    const invalidFormats = ['1/25', '13/25', '00/25', '12-25'];
    invalidFormats.forEach((expiryDate) => {
      const result = paymentSchema.safeParse({ ...validPayment, expiryDate });
      expect(result.success).toBe(false);
    });
  });

  it('should accept valid CVV formats', () => {
    const validCvvs = ['123', '1234']; // 3 digits or 4 digits (Amex)
    validCvvs.forEach((cvv) => {
      const result = paymentSchema.safeParse({ ...validPayment, cvv });
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid CVV', () => {
    const invalidCvvs = ['12', '12345', 'abc'];
    invalidCvvs.forEach((cvv) => {
      const result = paymentSchema.safeParse({ ...validPayment, cvv });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// LUHN ALGORITHM TESTS
// ============================================================================

describe('luhnCheck', () => {
  it('should return true for valid Visa card', () => {
    expect(luhnCheck('4111111111111111')).toBe(true);
  });

  it('should return true for valid Mastercard', () => {
    expect(luhnCheck('5500000000000004')).toBe(true);
  });

  it('should return true for valid Amex', () => {
    expect(luhnCheck('340000000000009')).toBe(true);
  });

  it('should return false for invalid card number', () => {
    expect(luhnCheck('1234567890123456')).toBe(false);
  });

  it('should handle card numbers with spaces', () => {
    expect(luhnCheck('4111 1111 1111 1111')).toBe(true);
  });

  it('should handle card numbers with dashes', () => {
    expect(luhnCheck('4111-1111-1111-1111')).toBe(true);
  });

  it('should return false for non-numeric input', () => {
    expect(luhnCheck('abcd1234567890')).toBe(false);
  });
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('formatCardNumber', () => {
  it('should format card number with spaces', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('should handle partial card numbers', () => {
    expect(formatCardNumber('411111')).toBe('4111 11');
  });

  it('should strip non-numeric characters', () => {
    expect(formatCardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
  });

  it('should handle empty input', () => {
    expect(formatCardNumber('')).toBe('');
  });
});

describe('formatExpiryDate', () => {
  it('should format expiry date as MM/YY', () => {
    expect(formatExpiryDate('1225')).toBe('12/25');
  });

  it('should handle partial input', () => {
    expect(formatExpiryDate('12')).toBe('12/');
    expect(formatExpiryDate('1')).toBe('1');
  });

  it('should strip non-numeric characters', () => {
    expect(formatExpiryDate('12/25')).toBe('12/25');
  });
});

describe('getCardType', () => {
  it('should detect Visa', () => {
    expect(getCardType('4111111111111111')).toBe('visa');
    expect(getCardType('4')).toBe('visa');
  });

  it('should detect Mastercard', () => {
    expect(getCardType('5500000000000004')).toBe('mastercard');
    expect(getCardType('2221')).toBe('mastercard');
  });

  it('should detect Amex', () => {
    expect(getCardType('340000000000009')).toBe('amex');
    expect(getCardType('37')).toBe('amex');
  });

  it('should detect Discover', () => {
    expect(getCardType('6011000000000004')).toBe('discover');
    expect(getCardType('65')).toBe('discover');
  });

  it('should return unknown for unrecognized cards', () => {
    expect(getCardType('9999999999999999')).toBe('unknown');
    expect(getCardType('')).toBe('unknown');
  });

  it('should handle card numbers with spaces', () => {
    expect(getCardType('4111 1111 1111 1111')).toBe('visa');
  });
});
