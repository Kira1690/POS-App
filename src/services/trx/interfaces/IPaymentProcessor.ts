/**
 * IPaymentProcessor - Core payment processing interfaces for TRX
 */

export enum PaymentState {
  IDLE = 'IDLE',
  BUILDING_MESSAGE = 'BUILDING_MESSAGE',
  CONNECTING = 'CONNECTING',
  SENDING = 'SENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IAmountCalculator {
  calculateTax(amount: number, taxRate: number): number;
  calculateTotal(subtotal: number, tax: number): number;
  validateAmount(amount: number): ValidationResult;
  formatCurrency(amount: number): string;
  calculatePercentage(amount: number, percentage: number): number;
}

export interface IPaymentStateManager {
  getCurrentState(): PaymentState;
  transition(newState: PaymentState): boolean;
  forceReset(): void;
  isTerminalState(): boolean;
  canTransitionTo(state: PaymentState): boolean;
}
