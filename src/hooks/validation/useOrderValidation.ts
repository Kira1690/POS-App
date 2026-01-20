/**
 * Order Validation Hook
 * Delegates to OrderBusinessLogicContext for validation operations
 * Follows Single Responsibility Principle - validation only
 * Uses Dependency Injection - no business logic duplication
 */

import { useCallback } from 'react';
import { useOrderBusinessLogic } from '@/context/orderBusinessLogic/OrderBusinessLogicContext';
import { Order } from '@/types/order.types';
import { CartItem } from '@/context/cart/CartContext';

export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UseOrderValidationResult {
  validateOrder: (order: Order) => Promise<OrderValidationResult>;
  validateCartItems: (items: CartItem[]) => OrderValidationResult;
  validateTableAssignment: (tableId: string) => { canAssign: boolean; message?: string };
  validateBusinessHours: () => { canOrder: boolean; message?: string };
  validateOrderConstraints: (order: Order) => OrderValidationResult;
}

/**
 * Hook for order validation operations
 * Delegates to OrderBusinessLogicContext to avoid logic duplication
 * 
 * @returns Validation functions that use dependency injection
 */
export function useOrderValidation(): UseOrderValidationResult {
  // Use DI context - no business logic duplication
  const businessLogic = useOrderBusinessLogic();

  // Validate complete order
  const validateOrder = useCallback(async (order: Order): Promise<OrderValidationResult> => {
    try {
      // Delegate to DI service
      const result = await businessLogic.validateOrder(order);
      return {
        isValid: result.isValid,
        errors: result.errors,
        warnings: [], // Context doesn't provide warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }, [businessLogic]);

  // Validate cart items before order creation
  const validateCartItems = useCallback((items: CartItem[]): OrderValidationResult => {
    try {
      // Delegate to DI service
      const result = businessLogic.validateCartItems(items);
      return {
        isValid: result.isValid,
        errors: result.errors,
        warnings: [], // Context doesn't provide warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Cart validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }, [businessLogic]);

  // Validate table assignment
  const validateTableAssignment = useCallback((tableId: string): { canAssign: boolean; message?: string } => {
    try {
      // Delegate to DI service - map isValid to canAssign
      const result = businessLogic.checkTableConstraints(tableId);
      return {
        canAssign: result.isValid,
        message: result.message,
      };
    } catch (error) {
      return {
        canAssign: false,
        message: `Table validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, [businessLogic]);

  // Validate business hours
  const validateBusinessHours = useCallback((): { canOrder: boolean; message?: string } => {
    try {
      // Delegate to DI service
      return businessLogic.checkTimeConstraints();
    } catch (error) {
      return {
        canOrder: false,
        message: `Time validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, [businessLogic]);

  // Validate order constraints
  const validateOrderConstraints = useCallback((order: Order): OrderValidationResult => {
    try {
      // Delegate to DI service - map canProceed to isValid
      const result = businessLogic.checkOrderConstraints(order);
      return {
        isValid: result.canProceed,
        errors: result.canProceed ? [] : result.warnings, // Treat warnings as errors if can't proceed
        warnings: result.canProceed ? result.warnings : [],
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Constraint validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }, [businessLogic]);

  return {
    validateOrder,
    validateCartItems,
    validateTableAssignment,
    validateBusinessHours,
    validateOrderConstraints,
  };
}

/**
 * Helper hook for quick validation checks
 * Provides simplified boolean results for UI components
 */
export function useOrderValidationChecks() {
  const validation = useOrderValidation();

  const isValidOrder = useCallback(async (order: Order): Promise<boolean> => {
    const result = await validation.validateOrder(order);
    return result.isValid;
  }, [validation]);

  const isValidCart = useCallback((items: CartItem[]): boolean => {
    const result = validation.validateCartItems(items);
    return result.isValid;
  }, [validation]);

  const canAssignTable = useCallback((tableId: string): boolean => {
    const result = validation.validateTableAssignment(tableId);
    return result.canAssign;
  }, [validation]);

  const canPlaceOrder = useCallback((): boolean => {
    const result = validation.validateBusinessHours();
    return result.canOrder;
  }, [validation]);

  return {
    isValidOrder,
    isValidCart,
    canAssignTable,
    canPlaceOrder,
  };
}