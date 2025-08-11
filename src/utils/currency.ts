/**
 * Currency formatting utilities
 */

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  if (currency === 'INR') {
    return `₹${amount.toFixed(2)}`;
  }
  
  // For other currencies, use Intl.NumberFormat
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and parse
  const numberString = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(numberString) || 0;
};