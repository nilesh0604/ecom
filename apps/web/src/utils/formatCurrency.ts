/**
 * Format a number as currency
 * 
 * Why we centralize formatting:
 * - Ensures consistent currency display across the entire app
 * - Easy to change locale or currency globally
 * - Handles edge cases (undefined, negative) in one place
 * - Uses browser's Intl API for proper locale-aware formatting
 * 
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string (e.g., "$29.99")
 * 
 * Example usage:
 * formatCurrency(29.99) // "$29.99"
 * formatCurrency(1000) // "$1,000.00"
 * formatCurrency(29.99, 'EUR', 'de-DE') // "29,99 €"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  // Handle edge cases
  if (amount === undefined || amount === null || isNaN(amount)) {
    return formatCurrency(0, currency, locale);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discounted price
 * 
 * @param price - Original price
 * @param discountPercentage - Discount as a percentage (e.g., 15 for 15%)
 * @returns The price after discount
 * 
 * Example:
 * calculateDiscountedPrice(100, 15) // 85
 */
export function calculateDiscountedPrice(
  price: number,
  discountPercentage: number
): number {
  if (discountPercentage <= 0) return price;
  return price * (1 - discountPercentage / 100);
}

/**
 * Format discount percentage for display
 * 
 * @param percentage - Discount percentage
 * @returns Formatted string (e.g., "-15%")
 */
export function formatDiscount(percentage: number): string {
  return `-${Math.round(percentage)}%`;
}
