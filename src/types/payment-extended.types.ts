/**
 * Payment Extended Types
 * Enhanced payment types with receipt generation, transaction tracking, and refunds
 */

import { BaseEntity } from './common.types';
import { ExtendedPaymentMethod, BillSplit, GuestSplit, PaymentMethodSplit } from './billing.types';
import { ExtendedOrder, ExtendedOrderItem } from './order-extended.types';

// ============== PAYMENT STATUS ==============

export type PaymentTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partial_refund';

export const PAYMENT_STATUS_LABELS: Record<PaymentTransactionStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  partial_refund: 'Partially Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentTransactionStatus, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  completed: '#10B981',
  failed: '#EF4444',
  cancelled: '#6B7280',
  refunded: '#8B5CF6',
  partial_refund: '#EC4899',
};

// ============== PAYMENT TRANSACTION ==============

export interface PaymentTransaction extends BaseEntity {
  id: string;
  orderId: string;
  orderNumber: string;

  // Amount
  amount: number;
  currency: string;

  // Method
  method: ExtendedPaymentMethod;

  // Status
  status: PaymentTransactionStatus;
  statusMessage?: string;

  // Transaction details
  transactionId?: string;
  authorizationCode?: string;
  referenceNumber?: string;

  // Card details (masked)
  cardLastFour?: string;
  cardBrand?: string;
  cardHolderName?: string;

  // UPI details
  upiId?: string;
  upiTransactionRef?: string;

  // Gift card details
  giftCardNumber?: string;
  giftCardBalanceBefore?: number;
  giftCardBalanceAfter?: number;

  // Cash details
  cashReceived?: number;
  changeGiven?: number;

  // Split payment info
  isSplitPayment: boolean;
  splitPaymentIndex?: number;
  guestId?: string;
  guestName?: string;

  // Staff
  processedBy: string;
  processedByName: string;

  // Timestamps
  createdAt: string;
  processedAt?: string;
  completedAt?: string;

  // Refund info
  isRefunded: boolean;
  refundedAmount?: number;
  refundedAt?: string;
  refundReason?: string;
  refundTransactionId?: string;

  // Sync
  syncedAt?: string;
  pendingSync: boolean;
}

// ============== PAYMENT RECORD ==============

export interface PaymentRecord extends BaseEntity {
  id: string;
  orderId: string;
  orderNumber: string;

  // Restaurant & Table
  restaurantId: string;
  tableId: string;
  tableName: string;

  // Amounts
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;

  // Payment Info
  paymentMethod: ExtendedPaymentMethod;
  isSplitPayment: boolean;

  // Transactions
  transactions: PaymentTransaction[];

  // Status
  status: PaymentTransactionStatus;
  paidAmount: number;
  remainingAmount: number;

  // Split details
  splitType?: string;
  guestPayments?: GuestSplit[];
  paymentMethodSplits?: PaymentMethodSplit[];

  // Staff
  processedBy: string;
  processedByName: string;

  // Timestamps
  createdAt: string;
  completedAt?: string;

  // Receipt
  receiptId?: string;
  receiptPrinted: boolean;
  receiptPrintedAt?: string;
  receiptEmailed: boolean;
  receiptEmailedTo?: string;
  receiptEmailedAt?: string;

  // Sync
  syncedAt?: string;
  pendingSync: boolean;
}

// ============== RECEIPT ==============

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  total: number;
}

export interface ReceiptPaymentInfo {
  method: ExtendedPaymentMethod;
  amount: number;
  transactionId?: string;
  cardLastFour?: string;
  cashReceived?: number;
  changeGiven?: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  orderId: string;
  orderNumber: string;

  // Restaurant Info
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantTaxId?: string;

  // Table Info
  tableId: string;
  tableName: string;
  guestCount: number;

  // Line Items
  items: ReceiptLineItem[];

  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  discountReason?: string;
  tipAmount: number;
  totalAmount: number;

  // Payment Info
  payments: ReceiptPaymentInfo[];
  isSplitPayment: boolean;

  // Guest info (for split receipts)
  guestId?: string;
  guestName?: string;
  guestTotal?: number;

  // Staff
  servedBy: string;
  servedByName: string;
  processedBy: string;
  processedByName: string;

  // Timestamps
  orderCreatedAt: string;
  paymentCompletedAt: string;
  printedAt?: string;
  emailedTo?: string;
  emailedAt?: string;

  // Footer
  thankYouMessage?: string;
  promotionalMessage?: string;
}

// ============== RECEIPT TEMPLATE ==============

export type ReceiptType =
  | 'full'
  | 'split_guest'
  | 'split_summary'
  | 'kitchen_copy'
  | 'customer_copy';

export interface ReceiptTemplate {
  type: ReceiptType;
  showLogo: boolean;
  showAddress: boolean;
  showTaxId: boolean;
  showServerName: boolean;
  showTableNumber: boolean;
  showOrderNumber: boolean;
  showTimestamp: boolean;
  showItemModifiers: boolean;
  showPaymentDetails: boolean;
  showTipLine: boolean;
  showSignatureLine: boolean;
  showBarcode: boolean;
  showQRCode: boolean;
  thankYouMessage: string;
  promotionalMessage?: string;
  footerNotes?: string;
}

export const DEFAULT_RECEIPT_TEMPLATES: Record<ReceiptType, ReceiptTemplate> = {
  full: {
    type: 'full',
    showLogo: true,
    showAddress: true,
    showTaxId: true,
    showServerName: true,
    showTableNumber: true,
    showOrderNumber: true,
    showTimestamp: true,
    showItemModifiers: true,
    showPaymentDetails: true,
    showTipLine: false,
    showSignatureLine: false,
    showBarcode: true,
    showQRCode: false,
    thankYouMessage: 'Thank you for dining with us!',
  },
  split_guest: {
    type: 'split_guest',
    showLogo: true,
    showAddress: false,
    showTaxId: false,
    showServerName: true,
    showTableNumber: true,
    showOrderNumber: true,
    showTimestamp: true,
    showItemModifiers: true,
    showPaymentDetails: true,
    showTipLine: false,
    showSignatureLine: false,
    showBarcode: false,
    showQRCode: false,
    thankYouMessage: 'Thank you!',
  },
  split_summary: {
    type: 'split_summary',
    showLogo: true,
    showAddress: true,
    showTaxId: true,
    showServerName: true,
    showTableNumber: true,
    showOrderNumber: true,
    showTimestamp: true,
    showItemModifiers: false,
    showPaymentDetails: true,
    showTipLine: false,
    showSignatureLine: false,
    showBarcode: true,
    showQRCode: false,
    thankYouMessage: 'Thank you for dining with us!',
  },
  kitchen_copy: {
    type: 'kitchen_copy',
    showLogo: false,
    showAddress: false,
    showTaxId: false,
    showServerName: true,
    showTableNumber: true,
    showOrderNumber: true,
    showTimestamp: true,
    showItemModifiers: true,
    showPaymentDetails: false,
    showTipLine: false,
    showSignatureLine: false,
    showBarcode: false,
    showQRCode: false,
    thankYouMessage: '',
  },
  customer_copy: {
    type: 'customer_copy',
    showLogo: true,
    showAddress: true,
    showTaxId: true,
    showServerName: true,
    showTableNumber: true,
    showOrderNumber: true,
    showTimestamp: true,
    showItemModifiers: true,
    showPaymentDetails: true,
    showTipLine: true,
    showSignatureLine: true,
    showBarcode: true,
    showQRCode: true,
    thankYouMessage: 'Thank you for dining with us!',
    promotionalMessage: 'Follow us on social media!',
  },
};

// ============== PAYMENT PROCESSING ==============

export type ProcessingStep =
  | 'initializing'
  | 'validating'
  | 'processing'
  | 'awaiting_card'
  | 'awaiting_pin'
  | 'authorizing'
  | 'completing'
  | 'completed'
  | 'failed';

export const PROCESSING_STEP_MESSAGES: Record<ProcessingStep, string> = {
  initializing: 'Initializing payment...',
  validating: 'Validating payment details...',
  processing: 'Processing payment...',
  awaiting_card: 'Please insert or tap card...',
  awaiting_pin: 'Please enter PIN...',
  authorizing: 'Authorizing transaction...',
  completing: 'Completing payment...',
  completed: 'Payment completed!',
  failed: 'Payment failed',
};

export interface PaymentProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
  error?: string;
}

// ============== PAYMENT REQUESTS ==============

export interface ProcessCashPaymentRequest {
  orderId: string;
  amount: number;
  cashReceived: number;
}

export interface ProcessCardPaymentRequest {
  orderId: string;
  amount: number;
  tip?: number;
}

export interface ProcessUPIPaymentRequest {
  orderId: string;
  amount: number;
  upiId?: string;
}

export interface ProcessGiftCardPaymentRequest {
  orderId: string;
  amount: number;
  giftCardNumber: string;
  giftCardPin?: string;
}

export interface ProcessSplitPaymentRequest {
  orderId: string;
  splitType: string;
  payments: {
    guestId?: string;
    method: ExtendedPaymentMethod;
    amount: number;
  }[];
}

// ============== PAYMENT RESULT ==============

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentRecordId?: string;
  receiptId?: string;
  error?: string;
  errorCode?: string;

  // For cash
  changeAmount?: number;

  // For card
  authorizationCode?: string;
  cardLastFour?: string;
}

// ============== REFUND ==============

export interface RefundRequest {
  paymentId: string;
  transactionId: string;
  amount: number;
  reason: string;
  authorizedBy: string;
}

export interface RefundResult {
  success: boolean;
  refundTransactionId?: string;
  refundedAmount?: number;
  error?: string;
}

// ============== HELPER FUNCTIONS ==============

export const generateReceiptNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RCT-${dateStr}-${random}`;
};

export const generateTransactionId = (): string => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculateChange = (total: number, received: number): number => {
  return Math.max(0, received - total);
};

export const maskCardNumber = (cardNumber: string): string => {
  if (cardNumber.length < 4) return cardNumber;
  return `**** **** **** ${cardNumber.slice(-4)}`;
};

export const getCardBrand = (cardNumber: string): string => {
  const firstDigit = cardNumber.charAt(0);
  const firstTwo = cardNumber.substring(0, 2);

  if (firstDigit === '4') return 'Visa';
  if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'Mastercard';
  if (['34', '37'].includes(firstTwo)) return 'Amex';
  if (firstTwo === '60') return 'Discover';
  return 'Card';
};

export const createReceiptFromOrder = (
  order: ExtendedOrder,
  payment: PaymentRecord,
  restaurantInfo: {
    name: string;
    address: string;
    phone: string;
    taxId?: string;
  }
): Receipt => {
  return {
    id: `receipt_${Date.now()}`,
    receiptNumber: generateReceiptNumber(),
    orderId: order.id,
    orderNumber: order.orderNumber,
    restaurantId: order.restaurantId,
    restaurantName: restaurantInfo.name,
    restaurantAddress: restaurantInfo.address,
    restaurantPhone: restaurantInfo.phone,
    restaurantTaxId: restaurantInfo.taxId,
    tableId: order.tableId,
    tableName: order.tableName,
    guestCount: order.guestCount,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.basePrice,
      modifiers: item.selectedModifiers.flatMap((m) =>
        m.options.map((o) => `${o.priceAdjustment >= 0 ? '+' : ''}${o.optionName}`)
      ),
      total: item.itemTotal,
    })),
    subtotal: order.subtotal,
    taxRate: order.taxRate,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    tipAmount: order.tipAmount,
    totalAmount: order.totalAmount,
    payments: payment.transactions.map((t) => ({
      method: t.method,
      amount: t.amount,
      transactionId: t.transactionId,
      cardLastFour: t.cardLastFour,
      cashReceived: t.cashReceived,
      changeGiven: t.changeGiven,
    })),
    isSplitPayment: payment.isSplitPayment,
    servedBy: order.servedBy || order.createdBy,
    servedByName: order.servedByName || order.createdByName,
    processedBy: payment.processedBy,
    processedByName: payment.processedByName,
    orderCreatedAt: order.createdAt,
    paymentCompletedAt: payment.completedAt || new Date().toISOString(),
    thankYouMessage: 'Thank you for dining with us!',
  };
};
