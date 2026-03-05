/**
 * Unified Order Types
 * Single source of truth for order status and data structures
 *
 * Core Principle: ONE Order, ONE Status, ONE Source of Truth
 *
 * Status Flow:
 * draft → confirmed → preparing → ready → served → paid
 *                                              ↓
 *                                    [table becomes available]
 */

import { KitchenStation, SelectedModifier as SelectedModifierImport } from './order-extended.types';
import { AllergenType, DietaryTag } from './menu-management-extended.types';

// Re-export types used in the unified system
export type { KitchenStation };
export type SelectedModifier = SelectedModifierImport;

// ============== UNIFIED STATUS TYPES ==============

/**
 * Single unified order status - replaces 3 different status systems
 * Kitchen is the ONLY source of status updates (except payment)
 */
export type UnifiedOrderStatus =
  | 'draft'       // Order being created, not yet submitted
  | 'confirmed'   // Submitted to kitchen
  | 'preparing'   // Kitchen actively working on it
  | 'ready'       // Kitchen completed, waiting to be served
  | 'served'      // Delivered to customer, payment button appears
  | 'paid'        // Payment completed, table released
  | 'cancelled';  // Order cancelled

/**
 * Item-level status for granular kitchen tracking
 */
export type UnifiedItemStatus =
  | 'pending'     // Not yet started
  | 'preparing'   // Being prepared
  | 'ready'       // Ready to serve
  | 'served'      // Delivered to customer
  | 'cancelled';  // Item cancelled

/**
 * Payment status (separate from order status)
 */
export type UnifiedPaymentStatus =
  | 'pending'     // Payment not started
  | 'partial'     // Partial payment received
  | 'paid'        // Fully paid
  | 'refunded';   // Payment refunded

// ============== STATUS LABELS AND COLORS ==============

export const UNIFIED_ORDER_STATUS_LABELS: Record<UnifiedOrderStatus, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export const UNIFIED_ORDER_STATUS_COLORS: Record<UnifiedOrderStatus, string> = {
  draft: '#6B7280',      // Gray
  confirmed: '#3B82F6',  // Blue
  preparing: '#F59E0B',  // Amber
  ready: '#10B981',      // Green
  served: '#8B5CF6',     // Purple
  paid: '#059669',       // Emerald
  cancelled: '#EF4444',  // Red
};

export const UNIFIED_ITEM_STATUS_LABELS: Record<UnifiedItemStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
};

// ============== VALID STATUS TRANSITIONS ==============

/**
 * Defines valid status transitions
 * Prevents invalid state changes
 */
export const VALID_STATUS_TRANSITIONS: Record<UnifiedOrderStatus, UnifiedOrderStatus[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served', 'cancelled'],
  served: ['paid'],
  paid: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export const isValidStatusTransition = (
  currentStatus: UnifiedOrderStatus,
  newStatus: UnifiedOrderStatus
): boolean => {
  return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
};

// ============== UNIFIED ORDER ITEM ==============

export interface UnifiedOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;

  // Item Info
  name: string;
  description?: string;
  category: string;
  categoryId: string;
  imageUrl?: string;

  // Pricing
  basePrice: number;
  quantity: number;
  modifierTotal: number;
  itemTotal: number; // (basePrice + modifierTotal) * quantity

  // Modifiers - embedded directly
  selectedModifiers: SelectedModifier[];

  // Dietary & Allergens
  dietaryTags: DietaryTag[];
  allergens: AllergenType[];
  hasAllergenWarning: boolean;

  // Kitchen - embedded, no separate tickets
  kitchenStation: KitchenStation;
  itemStatus: UnifiedItemStatus;
  estimatedPrepTime?: number;
  actualPrepTime?: number;
  preparedBy?: string;
  preparedAt?: string;

  // Notes
  specialInstructions?: string;
  kitchenNotes?: string;

  // Item-level discount
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;

  // Combo support
  isComboItem: boolean;
  comboId?: string;
  comboName?: string;
  comboDiscount?: number;

  // Timestamps
  addedAt: string;
  modifiedAt?: string;
}

// ============== UNIFIED ORDER ==============

export interface UnifiedOrder {
  id: string;
  orderNumber: string; // ORD-YYYYMMDD-XXXX format
  restaurantId: string;

  // Table & Customer
  tableId: string;
  tableName: string;
  guestCount: number;
  customerId?: string;

  // Staff
  createdBy: string;
  createdByName: string;
  servedBy?: string;
  servedByName?: string;

  // Items
  items: UnifiedOrderItem[];

  // Financials
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;

  // SINGLE source of truth for status
  status: UnifiedOrderStatus;
  paymentStatus: UnifiedPaymentStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;   // When confirmed (sent to kitchen)
  preparingAt?: string;   // When kitchen started
  readyAt?: string;       // When food ready
  servedAt?: string;      // When delivered to customer
  paidAt?: string;        // When payment completed
  cancelledAt?: string;   // If cancelled

  // Notes
  specialInstructions?: string;
  cancellationReason?: string;

  // Kitchen timing
  estimatedPrepTime?: number;
  actualPrepTime?: number;

  // Payment reference
  paymentId?: string;
  paymentMethod?: string;
  splitPayments?: UnifiedSplitPayment[];

  // Sync tracking
  syncedAt?: string;
  pendingSync: boolean;
}

// ============== SPLIT PAYMENT ==============

export interface UnifiedSplitPayment {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  processedAt?: string;
}

// ============== ORDER FILTERS ==============

export interface UnifiedOrderFilters {
  status?: UnifiedOrderStatus | 'all' | 'active';
  paymentStatus?: UnifiedPaymentStatus | 'all';
  tableId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  staffId?: string;
  searchQuery?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ============== CART STATE ==============

export interface UnifiedCartState {
  tableId: string;
  tableName: string;
  guestCount: number;
  items: UnifiedOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  totalAmount: number;
  specialInstructions?: string;
}

// ============== ORDER CREATION REQUEST ==============

export interface CreateUnifiedOrderRequest {
  tableId: string;
  tableName: string;
  guestCount?: number;
  customerId?: string;
  items: AddUnifiedItemRequest[];
  specialInstructions?: string;
}

export interface AddUnifiedItemRequest {
  menuItemId: string;
  quantity: number;
  selectedModifiers?: SelectedModifier[];
  specialInstructions?: string;
  isComboItem?: boolean;
  comboId?: string;
}

// ============== STATUS UPDATE REQUEST ==============

export interface UpdateUnifiedOrderStatusRequest {
  orderId: string;
  status: UnifiedOrderStatus;
  cancellationReason?: string;
  staffId?: string;
}

export interface UpdateUnifiedItemStatusRequest {
  orderId: string;
  itemId: string;
  status: UnifiedItemStatus;
  kitchenNotes?: string;
  preparedBy?: string;
}

// ============== SUBMIT ORDER RESULT ==============

export interface SubmitUnifiedOrderResult {
  success: boolean;
  orderId: string;
  orderNumber: string;
  estimatedPrepTime: number;
  error?: string;
}

// ============== PAYMENT REQUEST ==============

export interface ProcessUnifiedPaymentRequest {
  orderId: string;
  amount: number;
  method: string;
  transactionId?: string;
  tip?: number;
}

// ============== HELPER FUNCTIONS ==============

/**
 * Generate unique order number
 */
export const generateUnifiedOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
};

/**
 * Generate unique order item ID
 */
export const generateUnifiedOrderItemId = (): string => {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique order ID
 */
export const generateUnifiedOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate item total with modifiers
 */
export const calculateUnifiedItemTotal = (
  basePrice: number,
  modifiers: SelectedModifier[],
  quantity: number
): { modifierTotal: number; itemTotal: number } => {
  const modifierTotal = modifiers.reduce((sum, modifier) => {
    return sum + modifier.options.reduce((optSum, opt) => optSum + opt.totalPrice, 0);
  }, 0);

  const itemTotal = (basePrice + modifierTotal) * quantity;

  return { modifierTotal, itemTotal };
};

/**
 * Calculate order totals
 */
export const calculateUnifiedOrderTotals = (
  items: UnifiedOrderItem[],
  taxRate: number,
  discountType?: 'percentage' | 'fixed',
  discountValue?: number
): { subtotal: number; taxAmount: number; discountAmount: number; totalAmount: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);

  let discountAmount = 0;
  if (discountType && discountValue) {
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = Math.min(discountValue, subtotal);
    }
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * taxRate;
  const totalAmount = taxableAmount + taxAmount;

  return { subtotal, taxAmount, discountAmount, totalAmount };
};

/**
 * Check if order can accept payment (status must be 'served')
 */
export const canAcceptPayment = (order: UnifiedOrder): boolean => {
  return order.status === 'served' && order.paymentStatus !== 'paid';
};

/**
 * Check if order is active (not completed/cancelled)
 */
export const isActiveOrder = (order: UnifiedOrder): boolean => {
  return !['paid', 'cancelled'].includes(order.status);
};

/**
 * Get active statuses for filtering
 */
export const getActiveStatuses = (): UnifiedOrderStatus[] => {
  return ['draft', 'confirmed', 'preparing', 'ready', 'served'];
};

/**
 * Create empty cart state
 */
export const createEmptyCart = (
  tableId: string,
  tableName: string,
  guestCount: number = 1,
  taxRate: number = 0.1
): UnifiedCartState => ({
  tableId,
  tableName,
  guestCount,
  items: [],
  subtotal: 0,
  taxRate,
  taxAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
});
