/**
 * Billing Types
 * Types for bill presentation, bill splitting, and payment processing
 */

import { ExtendedOrderItem } from './order-extended.types';

// ============== SPLIT TYPE ==============

export type SplitType =
  | 'none'
  | 'equal'
  | 'by_items'
  | 'by_payment_method';

export const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
  none: 'No Split',
  equal: 'Split Equally',
  by_items: 'Split by Items',
  by_payment_method: 'Split by Payment',
};

export const SPLIT_TYPE_DESCRIPTIONS: Record<SplitType, string> = {
  none: 'Single payment for entire bill',
  equal: 'Divide total equally among guests',
  by_items: 'Assign items to each guest',
  by_payment_method: 'Pay with multiple payment methods',
};

// ============== PAYMENT METHOD ==============

export type ExtendedPaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'gift_card'
  | 'mobile_payment'
  | 'credit';

export const PAYMENT_METHOD_LABELS: Record<ExtendedPaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  gift_card: 'Gift Card',
  mobile_payment: 'Mobile Payment',
  credit: 'Credit',
};

export const PAYMENT_METHOD_ICONS: Record<ExtendedPaymentMethod, string> = {
  cash: 'cash',
  card: 'credit-card',
  upi: 'qrcode',
  gift_card: 'gift',
  mobile_payment: 'cellphone',
  credit: 'account-credit-card',
};

// ============== ASSIGNED ITEM ==============

export interface AssignedItem {
  itemId: string;
  itemName: string;
  quantity: number;
  amount: number;
  isShared: boolean;
  sharedWith?: string[]; // Guest IDs
  sharePercentage?: number; // If shared, what percentage this guest pays
}

// ============== GUEST SPLIT ==============

export interface GuestSplit {
  id: string;
  name: string;
  color?: string; // For visual identification

  // Assigned items (for by_items split)
  assignedItems: AssignedItem[];

  // Shared items portion
  sharedItemsAmount: number;

  // Totals
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  total: number;

  // Payment
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
  paymentMethod?: ExtendedPaymentMethod;
  transactionId?: string;
  paidAt?: string;
  paidAmount?: number;
}

// ============== PAYMENT METHOD SPLIT ==============

export interface PaymentMethodSplit {
  id: string;
  method: ExtendedPaymentMethod;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  processedAt?: string;
  error?: string;

  // For card payments
  cardLastFour?: string;
  cardBrand?: string;

  // For UPI
  upiId?: string;

  // For gift card
  giftCardNumber?: string;
  giftCardBalance?: number;
}

// ============== BILL SPLIT ==============

export interface BillSplit {
  orderId: string;
  orderNumber: string;
  splitType: SplitType;

  // Original bill totals
  originalSubtotal: number;
  originalTaxAmount: number;
  originalTipAmount: number;
  originalTotal: number;

  // For equal split
  guestCount?: number;
  amountPerGuest?: number;

  // Guests
  guests: GuestSplit[];

  // For payment method split
  paymentSplits?: PaymentMethodSplit[];

  // Unassigned items (for by_items split)
  unassignedItems: string[]; // Item IDs

  // Totals tracking
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Status
  isComplete: boolean;
  completedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============== BILL DISPLAY ==============

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  basePrice: number;
  modifierTotal: number;
  itemTotal: number;
  modifiers: string[]; // Display strings
  specialInstructions?: string;

  // For split tracking
  isAssigned: boolean;
  assignedTo?: string; // Guest ID
  isShared: boolean;
  sharedWith?: string[]; // Guest IDs
}

export interface Bill {
  orderId: string;
  orderNumber: string;
  tableId: string;
  tableName: string;
  guestCount: number;

  // Items
  items: BillItem[];

  // Financials
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  tipAmount: number;
  tipPercentage?: number;
  totalAmount: number;

  // Payment status
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  remainingAmount: number;

  // Split info
  splitType: SplitType;
  splitDetails?: BillSplit;

  // Staff
  servedBy: string;
  servedByName: string;

  // Timestamps
  createdAt: string;
  printedAt?: string;
}

// ============== TIP OPTIONS ==============

export interface TipOption {
  percentage: number;
  label: string;
}

export const DEFAULT_TIP_OPTIONS: TipOption[] = [
  { percentage: 10, label: '10%' },
  { percentage: 15, label: '15%' },
  { percentage: 18, label: '18%' },
  { percentage: 20, label: '20%' },
];

// ============== DISCOUNT ==============

export interface DiscountRequest {
  type: 'percentage' | 'fixed';
  value: number;
  reason?: string;
  authorizedBy?: string;
}

// ============== BILL ACTIONS ==============

export interface ApplyDiscountRequest {
  orderId: string;
  discount: DiscountRequest;
}

export interface ApplyTipRequest {
  orderId: string;
  tipAmount?: number;
  tipPercentage?: number;
}

export interface InitiateSplitRequest {
  orderId: string;
  splitType: SplitType;
  guestCount?: number;
}

export interface AssignItemToGuestRequest {
  orderId: string;
  itemId: string;
  guestId: string;
  isShared?: boolean;
  sharedWith?: string[];
}

export interface ProcessGuestPaymentRequest {
  orderId: string;
  guestId: string;
  paymentMethod: ExtendedPaymentMethod;
  amount: number;
}

// ============== SPLIT CALCULATION RESULT ==============

export interface EqualSplitResult {
  guestCount: number;
  amountPerGuest: number;
  remainder: number; // Cents that can't be evenly divided
  guests: GuestSplit[];
}

export interface ItemSplitResult {
  guests: GuestSplit[];
  unassignedItems: string[];
  totalAssigned: number;
  totalUnassigned: number;
  isValid: boolean;
  validationErrors: string[];
}

export interface PaymentSplitResult {
  payments: PaymentMethodSplit[];
  totalAllocated: number;
  remaining: number;
  isValid: boolean;
  validationErrors: string[];
}

// ============== GUEST COLORS ==============

export const GUEST_COLORS = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

// ============== HELPER FUNCTIONS ==============

export const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSplitId = (): string => {
  return `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getGuestColor = (index: number): string => {
  return GUEST_COLORS[index % GUEST_COLORS.length];
};

export const calculateEqualSplit = (
  totalAmount: number,
  guestCount: number,
  taxAmount: number
): EqualSplitResult => {
  const amountPerGuest = Math.floor((totalAmount * 100) / guestCount) / 100;
  const remainder = Math.round((totalAmount - amountPerGuest * guestCount) * 100) / 100;
  const taxPerGuest = Math.floor((taxAmount * 100) / guestCount) / 100;

  const guests: GuestSplit[] = Array.from({ length: guestCount }, (_, i) => ({
    id: generateGuestId(),
    name: `Guest ${i + 1}`,
    color: getGuestColor(i),
    assignedItems: [],
    sharedItemsAmount: 0,
    subtotal: amountPerGuest - taxPerGuest,
    taxAmount: taxPerGuest,
    tipAmount: 0,
    total: i === 0 ? amountPerGuest + remainder : amountPerGuest, // First guest pays remainder
    paymentStatus: 'pending',
  }));

  return {
    guestCount,
    amountPerGuest,
    remainder,
    guests,
  };
};

export const calculateItemTotal = (item: BillItem): number => {
  return item.itemTotal;
};

export const calculateGuestTotal = (guest: GuestSplit): number => {
  const itemsTotal = guest.assignedItems.reduce((sum, item) => {
    if (item.isShared && item.sharePercentage) {
      return sum + item.amount * (item.sharePercentage / 100);
    }
    return sum + item.amount;
  }, 0);

  return itemsTotal + guest.sharedItemsAmount + guest.taxAmount + guest.tipAmount;
};

export const validateItemSplit = (
  items: BillItem[],
  guests: GuestSplit[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check all items are assigned
  const assignedItemIds = new Set<string>();
  guests.forEach((guest) => {
    guest.assignedItems.forEach((item) => {
      assignedItemIds.add(item.itemId);
    });
  });

  const unassigned = items.filter((item) => !assignedItemIds.has(item.id));
  if (unassigned.length > 0) {
    errors.push(`${unassigned.length} item(s) not assigned to any guest`);
  }

  // Check totals match
  const guestTotal = guests.reduce((sum, guest) => sum + guest.total, 0);
  const billTotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  if (Math.abs(guestTotal - billTotal) > 0.01) {
    errors.push('Guest totals do not match bill total');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePaymentSplit = (
  totalAmount: number,
  payments: PaymentMethodSplit[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const totalAllocated = payments.reduce((sum, p) => sum + p.amount, 0);

  if (totalAllocated < totalAmount) {
    errors.push(`$${(totalAmount - totalAllocated).toFixed(2)} remaining to allocate`);
  }

  if (totalAllocated > totalAmount) {
    errors.push(`$${(totalAllocated - totalAmount).toFixed(2)} over allocated`);
  }

  payments.forEach((payment, index) => {
    if (payment.amount <= 0) {
      errors.push(`Payment ${index + 1} must have a positive amount`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
