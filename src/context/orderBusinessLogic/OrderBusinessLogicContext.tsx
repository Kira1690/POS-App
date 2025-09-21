/**
 * Order Business Logic Context - Focused on cross-domain order business rules
 * Follows Single Responsibility Principle - handles business validation and rules
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { Order } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { CartItem } from '@/context/cart';
import { orderService } from '@/services/orders/orderService';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate: (order: Order, context?: any) => boolean;
  errorMessage: string;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  apply: (order: Order, context?: any) => Order;
}

export interface OrderCalculation {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  serviceFee?: number;
}

export interface OrderBusinessLogicState {
  validationRules: ValidationRule[];
  businessRules: BusinessRule[];
  taxRate: number;
  serviceFeeRate: number;
  minimumOrderAmount: number;
}

interface OrderBusinessLogicActions {
  // Validation operations
  validateOrder: (order: Order) => Promise<{ isValid: boolean; errors: string[] }>;
  validateCartItems: (items: CartItem[]) => { isValid: boolean; errors: string[] };
  
  // Business rule operations
  applyBusinessRules: (order: Order) => Promise<Order>;
  
  // Calculations
  calculateOrderTotals: (items: CartItem[], discounts?: number) => OrderCalculation;
  calculateEstimatedTime: (items: CartItem[]) => number;
  
  // Order creation coordination
  createOrderFromCart: (items: CartItem[], tableId: string, specialInstructions?: string) => Promise<Order>;
  
  // Business constraints
  checkOrderConstraints: (order: Order) => { canProceed: boolean; warnings: string[] };
  checkTimeConstraints: () => { canOrder: boolean; message?: string };
}

export interface OrderBusinessLogicContextValue extends OrderBusinessLogicState, OrderBusinessLogicActions {}

const OrderBusinessLogicContext = createContext<OrderBusinessLogicContextValue | undefined>(undefined);

// Default validation rules
const defaultValidationRules: ValidationRule[] = [
  {
    id: 'min_items',
    name: 'Minimum Items',
    description: 'Order must have at least one item',
    validate: (order) => order.items && order.items.length > 0,
    errorMessage: 'Order must contain at least one item',
  },
  {
    id: 'table_assigned',
    name: 'Table Assignment',
    description: 'Order must have a table assigned',
    validate: (order) => !!order.table_id,
    errorMessage: 'Table must be assigned to order',
  },
  {
    id: 'valid_amounts',
    name: 'Valid Amounts',
    description: 'Order amounts must be positive',
    validate: (order) => order.total_amount > 0,
    errorMessage: 'Order total must be greater than zero',
  },
];

// Default business rules
const defaultBusinessRules: BusinessRule[] = [
  {
    id: 'apply_tax',
    name: 'Apply Tax',
    description: 'Apply tax rate to subtotal',
    apply: (order) => ({
      ...order,
      tax_amount: order.subtotal * 0.0825, // 8.25% tax rate
      total_amount: order.subtotal + (order.subtotal * 0.0825) + (order.discount_amount || 0),
    }),
  },
  {
    id: 'set_order_number',
    name: 'Set Order Number',
    description: 'Generate unique order number',
    apply: (order) => ({
      ...order,
      order_number: order.order_number || `ORD-${String(Date.now()).slice(-6)}`,
    }),
  },
];

const initialBusinessLogicState: OrderBusinessLogicState = {
  validationRules: defaultValidationRules,
  businessRules: defaultBusinessRules,
  taxRate: 0.0825, // 8.25%
  serviceFeeRate: 0.03, // 3%
  minimumOrderAmount: 5.00,
};

interface OrderBusinessLogicProviderProps {
  children: ReactNode;
}

export const OrderBusinessLogicProvider: React.FC<OrderBusinessLogicProviderProps> = ({ children }) => {
  const state = initialBusinessLogicState;
  // Use exported service instance to avoid DI registration issues
  const orderServiceInstance = orderService;
  
  const validateOrder = useCallback(async (order: Order): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    
    for (const rule of state.validationRules) {
      if (!rule.validate(order)) {
        errors.push(rule.errorMessage);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }, [state.validationRules]);
  
  const validateCartItems = useCallback((items: CartItem[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (items.length === 0) {
      errors.push('Cart cannot be empty');
    }
    
    const invalidItems = items.filter(item => item.quantity <= 0 || item.price < 0);
    if (invalidItems.length > 0) {
      errors.push('All items must have valid quantity and price');
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);
  
  const applyBusinessRules = useCallback(async (order: Order): Promise<Order> => {
    let processedOrder = { ...order };
    
    for (const rule of state.businessRules) {
      processedOrder = rule.apply(processedOrder);
    }
    
    return processedOrder;
  }, [state.businessRules]);
  
  const calculateOrderTotals = useCallback((items: CartItem[], discounts = 0): OrderCalculation => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discounts;
    const taxAmount = (subtotal - discountAmount) * state.taxRate;
    const serviceFee = subtotal * state.serviceFeeRate;
    const totalAmount = subtotal + taxAmount + serviceFee - discountAmount;
    
    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      serviceFee,
    };
  }, [state.taxRate, state.serviceFeeRate]);
  
  const calculateEstimatedTime = useCallback((items: CartItem[]): number => {
    // Basic estimation: 5 minutes base + 2 minutes per item
    const baseTime = 5;
    const itemTime = items.reduce((time, item) => time + (item.quantity * 2), 0);
    return Math.max(baseTime + itemTime, 10); // Minimum 10 minutes
  }, []);
  
  const createOrderFromCart = useCallback(async (
    items: CartItem[], 
    tableId: string, 
    specialInstructions?: string
  ): Promise<Order> => {
    // Validate cart items first
    const validation = validateCartItems(items);
    if (!validation.isValid) {
      throw new Error(`Invalid cart: ${validation.errors.join(', ')}`);
    }
    
    // Calculate totals
    const totals = calculateOrderTotals(items);
    
    // Create order data
    const orderData = {
      table_id: tableId,
      items: items.map(item => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        special_instructions: item.notes,
      })),
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      discount_amount: totals.discountAmount,
      total_amount: totals.totalAmount,
      special_instructions: specialInstructions,
      estimated_completion_time: new Date(Date.now() + calculateEstimatedTime(items) * 60 * 1000).toISOString(),
    };
    
    // Create order through service
    const createdOrder = await orderServiceInstance.createOrder(orderData);
    
    // Apply business rules
    return await applyBusinessRules(createdOrder);
  }, [orderServiceInstance, validateCartItems, calculateOrderTotals, calculateEstimatedTime, applyBusinessRules]);
  
  const checkOrderConstraints = useCallback((order: Order): { canProceed: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    let canProceed = true;
    
    // Check minimum order amount
    if (order.total_amount < state.minimumOrderAmount) {
      warnings.push(`Order total is below minimum of $${state.minimumOrderAmount.toFixed(2)}`);
      canProceed = false;
    }
    
    // Check for high-value orders (warning only)
    if (order.total_amount > 500) {
      warnings.push('High-value order - please verify with customer');
    }
    
    return { canProceed, warnings };
  }, [state.minimumOrderAmount]);
  
  const checkTimeConstraints = useCallback((): { canOrder: boolean; message?: string } => {
    const now = new Date();
    const hour = now.getHours();
    
    // Example business hours: 10 AM to 10 PM
    if (hour < 10 || hour >= 22) {
      return {
        canOrder: false,
        message: 'Orders can only be placed between 10:00 AM and 10:00 PM',
      };
    }
    
    return { canOrder: true };
  }, []);
  
  const contextValue: OrderBusinessLogicContextValue = {
    ...state,
    validateOrder,
    validateCartItems,
    applyBusinessRules,
    calculateOrderTotals,
    calculateEstimatedTime,
    createOrderFromCart,
    checkOrderConstraints,
    checkTimeConstraints,
  };
  
  return (
    <OrderBusinessLogicContext.Provider value={contextValue}>
      {children}
    </OrderBusinessLogicContext.Provider>
  );
};

export const useOrderBusinessLogic = (): OrderBusinessLogicContextValue => {
  const context = useContext(OrderBusinessLogicContext);
  if (context === undefined) {
    throw new Error('useOrderBusinessLogic must be used within an OrderBusinessLogicProvider');
  }
  return context;
};