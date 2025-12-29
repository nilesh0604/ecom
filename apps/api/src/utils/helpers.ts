import crypto from 'crypto';

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a random numeric code
 */
export function generateNumericCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate discount price
 */
export function calculateDiscountPrice(
  price: number,
  discountPercentage: number
): number {
  return price * (1 - discountPercentage / 100);
}

/**
 * Parse pagination parameters
 */
export function parsePagination(
  skip?: string | number,
  limit?: string | number
): { skip: number; limit: number } {
  const parsedSkip = typeof skip === 'string' ? parseInt(skip, 10) : skip;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  return {
    skip: Math.max(0, parsedSkip || 0),
    limit: Math.min(100, Math.max(1, parsedLimit || 10)),
  };
}

/**
 * Parse sort parameters
 */
export function parseSort(
  sortBy?: string,
  order?: string
): { sortBy: string; order: 'asc' | 'desc' } {
  return {
    sortBy: sortBy || 'createdAt',
    order: order === 'asc' ? 'asc' : 'desc',
  };
}

/**
 * Remove undefined values from object
 */
export function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await delay(baseDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Mask sensitive data
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
}

export function maskCardNumber(cardNumber: string): string {
  return '*'.repeat(12) + cardNumber.slice(-4);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

export default {
  generateRandomString,
  generateNumericCode,
  slugify,
  capitalize,
  formatPrice,
  calculateDiscountPrice,
  parsePagination,
  parseSort,
  removeUndefined,
  delay,
  retry,
  maskEmail,
  maskCardNumber,
  isValidEmail,
  isValidPhone,
};
