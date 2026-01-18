/**
 * Currency formatting utilities
 * Default currency: USD (United States Dollar)
 */

// Application-wide currency configuration
export const CURRENCY_CONFIG = {
  code: 'USD',
  symbol: '$',
  locale: 'en-US',
  decimalPlaces: 2,
} as const;

export const formatCurrency = (amount: number, currency: string = CURRENCY_CONFIG.code): string => {
  // Use Intl.NumberFormat for consistent formatting
  try {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: CURRENCY_CONFIG.decimalPlaces,
      maximumFractionDigits: CURRENCY_CONFIG.decimalPlaces,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${CURRENCY_CONFIG.symbol}${amount.toFixed(CURRENCY_CONFIG.decimalPlaces)}`;
  }
};

// Quick format function for common use
export const formatPrice = (amount: number): string => {
  return `${CURRENCY_CONFIG.symbol}${amount.toFixed(CURRENCY_CONFIG.decimalPlaces)}`;
};

export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and parse
  const numberString = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(numberString) || 0;
};