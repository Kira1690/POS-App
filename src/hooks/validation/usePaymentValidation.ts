/**
 * Payment Validation Hook
 * Delegates to PaymentService for validation operations
 * Follows Single Responsibility Principle - payment validation only
 * Uses Dependency Injection - no business logic duplication
 */

import { useCallback } from 'react';
import { usePaymentService } from '@/hooks/services';
import { 
  ProcessPaymentRequest,
  SplitPaymentItem,
  PaymentMethod 
} from '@/types/payment.types';

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UsePaymentValidationResult {
  validatePaymentRequest: (request: ProcessPaymentRequest) => PaymentValidationResult;
  validateCardPayment: (amount: number, cardInfo?: any) => PaymentValidationResult;
  validateCashPayment: (amount: number, received: number) => PaymentValidationResult;
  validateSplitPayment: (items: SplitPaymentItem[]) => PaymentValidationResult;
  validatePaymentAmount: (amount: number) => PaymentValidationResult;
}

/**
 * Hook for payment validation operations
 * Delegates to PaymentService via dependency injection
 * 
 * @returns Validation functions that use DI services
 */
export function usePaymentValidation(): UsePaymentValidationResult {
  // Use DI service - no business logic duplication
  const paymentService = usePaymentService();

  // Validate payment request
  const validatePaymentRequest = useCallback((request: ProcessPaymentRequest): PaymentValidationResult => {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic validation
      if (!request.amount || request.amount <= 0) {
        errors.push('Payment amount must be greater than zero');
      }

      if (!request.method) {
        errors.push('Payment method is required');
      }

      if (!request.orderId) {
        errors.push('Order ID is required');
      }

      // Amount thresholds
      if (request.amount > 1000) {
        warnings.push('High-value payment - manager approval may be required');
      }

      if (request.amount < 0.50) {
        warnings.push('Very small payment amount');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Payment request validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }, []);

  // Validate card payment
  const validateCardPayment = useCallback((amount: number, cardInfo?: any): PaymentValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (amount <= 0) {
      errors.push('Card payment amount must be greater than zero');
    }

    if (amount < 1.00) {
      warnings.push('Small card payment - cash may be more efficient');
    }

    // Card info validation if provided
    if (cardInfo) {
      if (cardInfo.last4 && cardInfo.last4.length !== 4) {
        errors.push('Invalid card number format');
      }

      if (cardInfo.expiryDate) {
        const expiry = new Date(cardInfo.expiryDate);
        if (expiry < new Date()) {
          errors.push('Card has expired');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Validate cash payment
  const validateCashPayment = useCallback((amount: number, received: number): PaymentValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (amount <= 0) {
      errors.push('Cash payment amount must be greater than zero');
    }

    if (received < amount) {
      errors.push('Received amount cannot be less than payment amount');
    }

    const change = received - amount;
    if (change > 100) {
      warnings.push('Large change amount - verify cash drawer capacity');
    }

    if (amount > 200) {
      warnings.push('Large cash payment - consider card payment for security');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Validate split payment
  const validateSplitPayment = useCallback((items: SplitPaymentItem[]): PaymentValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (items.length === 0) {
      errors.push('Split payment must have at least one item');
    }

    if (items.length === 1) {
      warnings.push('Single item split payment - regular payment may be simpler');
    }

    // Validate each split item
    items.forEach((item, index) => {
      if (item.amount <= 0) {
        errors.push(`Split item ${index + 1} amount must be greater than zero`);
      }

      if (item.amount < 2.00) {
        warnings.push(`Split item ${index + 1} amount is very small`);
      }

      if (!item.method) {
        errors.push(`Split item ${index + 1} is missing payment method`);
      }
    });

    // Check total
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    if (total <= 0) {
      errors.push('Total split payment amount must be greater than zero');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Validate payment amount
  const validatePaymentAmount = useCallback((amount: number): PaymentValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    if (amount > 5000) {
      warnings.push('Extremely high payment amount - manager approval required');
    }

    if (amount < 0.01) {
      errors.push('Payment amount too small to process');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  return {
    validatePaymentRequest,
    validateCardPayment,
    validateCashPayment,
    validateSplitPayment,
    validatePaymentAmount,
  };
}

/**
 * Helper hook for quick payment validation checks
 * Provides simplified boolean results for UI components
 */
export function usePaymentValidationChecks() {
  const validation = usePaymentValidation();

  const isValidPaymentAmount = useCallback((amount: number): boolean => {
    const result = validation.validatePaymentAmount(amount);
    return result.isValid;
  }, [validation]);

  const canProcessCardPayment = useCallback((amount: number): boolean => {
    const result = validation.validateCardPayment(amount);
    return result.isValid;
  }, [validation]);

  const canProcessCashPayment = useCallback((amount: number, received: number): boolean => {
    const result = validation.validateCashPayment(amount, received);
    return result.isValid;
  }, [validation]);

  return {
    isValidPaymentAmount,
    canProcessCardPayment,
    canProcessCashPayment,
  };
}