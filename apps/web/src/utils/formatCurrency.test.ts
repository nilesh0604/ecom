import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateDiscountedPrice,
  formatDiscount,
} from './formatCurrency';

describe('formatCurrency', () => {
  it('formats a standard price correctly', () => {
    expect(formatCurrency(29.99)).toBe('$29.99');
  });

  it('formats larger numbers with commas', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(29.999)).toBe('$30.00');
    expect(formatCurrency(29.994)).toBe('$29.99');
  });

  it('handles undefined/null/NaN by returning $0.00', () => {
    expect(formatCurrency(undefined as unknown as number)).toBe('$0.00');
    expect(formatCurrency(null as unknown as number)).toBe('$0.00');
    expect(formatCurrency(NaN)).toBe('$0.00');
  });

  it('supports different currencies', () => {
    expect(formatCurrency(29.99, 'EUR', 'de-DE')).toMatch(/29,99/);
    expect(formatCurrency(29.99, 'GBP', 'en-GB')).toMatch(/£29\.99/);
  });
});

describe('calculateDiscountedPrice', () => {
  it('calculates discounted price correctly', () => {
    expect(calculateDiscountedPrice(100, 15)).toBe(85);
    expect(calculateDiscountedPrice(100, 50)).toBe(50);
    expect(calculateDiscountedPrice(100, 100)).toBe(0);
  });

  it('returns original price when discount is 0', () => {
    expect(calculateDiscountedPrice(100, 0)).toBe(100);
  });

  it('returns original price when discount is negative', () => {
    expect(calculateDiscountedPrice(100, -10)).toBe(100);
  });

  it('handles decimal prices', () => {
    expect(calculateDiscountedPrice(99.99, 10)).toBeCloseTo(89.991);
  });
});

describe('formatDiscount', () => {
  it('formats discount percentage correctly', () => {
    expect(formatDiscount(15)).toBe('-15%');
    expect(formatDiscount(50)).toBe('-50%');
  });

  it('rounds decimal percentages', () => {
    expect(formatDiscount(15.7)).toBe('-16%');
    expect(formatDiscount(15.3)).toBe('-15%');
  });

  it('handles zero discount', () => {
    expect(formatDiscount(0)).toBe('-0%');
  });
});
