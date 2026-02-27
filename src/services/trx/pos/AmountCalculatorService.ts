import { IAmountCalculator, ValidationResult } from '../interfaces/IPaymentProcessor';

// Single Responsibility Principle - Only handles amount calculations and validations
export class AmountCalculatorService implements IAmountCalculator {
  private readonly MIN_AMOUNT = 0.01;
  private readonly MAX_AMOUNT = 999999.99;
  private readonly CURRENCY_DECIMAL_PLACES = 2;

  calculateTax(amount: number, taxRate: number): number {
    if (!this.isValidAmount(amount) || !this.isValidTaxRate(taxRate)) return 0;
    return this.roundToCurrency(amount * taxRate);
  }

  calculateTotal(subtotal: number, tax: number): number {
    if (!this.isValidAmount(subtotal) || !this.isValidAmount(tax)) return 0;
    return this.roundToCurrency(subtotal + tax);
  }

  validateAmount(amount: number): ValidationResult {
    const errors: string[] = [];
    if (typeof amount !== 'number' || isNaN(amount)) {
      errors.push('Amount must be a valid number');
    } else {
      if (amount < this.MIN_AMOUNT) errors.push(`Amount must be at least $${this.MIN_AMOUNT.toFixed(2)}`);
      if (amount > this.MAX_AMOUNT) errors.push(`Amount cannot exceed $${this.MAX_AMOUNT.toFixed(2)}`);
      if (this.getDecimalPlaces(amount) > this.CURRENCY_DECIMAL_PLACES) {
        errors.push('Amount cannot have more than 2 decimal places');
      }
    }
    return { isValid: errors.length === 0, errors };
  }

  formatCurrency(amount: number): string {
    if (!this.isValidAmount(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: this.CURRENCY_DECIMAL_PLACES,
      maximumFractionDigits: this.CURRENCY_DECIMAL_PLACES
    }).format(amount);
  }

  parseAmountFromString(amountString: string): number {
    const cleanString = amountString.replace(/[$,\s]/g, '');
    const amount = parseFloat(cleanString);
    return isNaN(amount) ? 0 : this.roundToCurrency(amount);
  }

  splitAmount(totalAmount: number, parts: number): number[] {
    if (parts <= 0 || !this.isValidAmount(totalAmount)) return [];
    const baseAmount = Math.floor((totalAmount * 100) / parts) / 100;
    const remainder = this.roundToCurrency(totalAmount - (baseAmount * parts));
    const result = new Array(parts).fill(baseAmount);
    let remainingCents = Math.round(remainder * 100);
    for (let i = 0; i < parts && remainingCents > 0; i++) {
      result[i] += 0.01;
      remainingCents--;
    }
    return result.map(a => this.roundToCurrency(a));
  }

  calculatePercentage(amount: number, percentage: number): number {
    if (!this.isValidAmount(amount) || percentage < 0 || percentage > 100) return 0;
    return this.roundToCurrency(amount * (percentage / 100));
  }

  private isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
  }

  private isValidTaxRate(taxRate: number): boolean {
    return typeof taxRate === 'number' && !isNaN(taxRate) && isFinite(taxRate) && taxRate >= 0 && taxRate <= 1;
  }

  private roundToCurrency(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  private getDecimalPlaces(number: number): number {
    const str = number.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  }
}
