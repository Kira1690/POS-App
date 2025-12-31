/**
 * Order Extended Types
 * Enhanced order types with full modifier support, kitchen station mapping, and combo support
 */

import { BaseEntity } from './common.types';
import { AllergenType, DietaryTag, ModifierGroup, ComboDeal } from './menu-management-extended.types';
import { MenuItem } from './menu.types';

// ============== KITCHEN STATION TYPES ==============

export type KitchenStation =
  | 'hot_kitchen'
  | 'cold_kitchen'
  | 'grill'
  | 'desserts'
  | 'beverages'
  | 'bar';

export const KITCHEN_STATION_LABELS: Record<KitchenStation, string> = {
  hot_kitchen: 'Hot Kitchen',
  cold_kitchen: 'Cold Kitchen',
  grill: 'Grill Station',
  desserts: 'Desserts',
  beverages: 'Beverages',
  bar: 'Bar',
};

export const KITCHEN_STATION_ICONS: Record<KitchenStation, string> = {
  hot_kitchen: 'fire',
  cold_kitchen: 'snowflake',
  grill: 'grill',
  desserts: 'cake-variant',
  beverages: 'cup',
  bar: 'glass-cocktail',
};

// ============== ORDER STATUS TYPES ==============

export type ExtendedOrderStatus =
  | 'draft'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'paid'
  | 'cancelled';

export type ExtendedPaymentStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded';

export type ExtendedOrderItemStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

// ============== SELECTED MODIFIER TYPES ==============

export interface SelectedModifierOption {
  optionId: string;
  optionName: string;
  priceAdjustment: number;
  quantity: number;
  totalPrice: number;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  options: SelectedModifierOption[];
}

// ============== COMBO SELECTION TYPES ==============

export interface ComboItemSelection {
  comboItemId: string;
  selectedMenuItemId: string;
  selectedMenuItemName: string;
  quantity: number;
  priceOverride?: number;
  selectedModifiers?: SelectedModifier[];
}

export interface SelectedCombo {
  comboId: string;
  comboName: string;
  comboPrice: number;
  regularPrice: number;
  savingsAmount: number;
  selections: ComboItemSelection[];
}

// ============== EXTENDED ORDER ITEM ==============

export interface ExtendedOrderItem {
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

  // Modifiers
  selectedModifiers: SelectedModifier[];

  // Dietary & Allergens
  dietaryTags: DietaryTag[];
  allergens: AllergenType[];
  hasAllergenWarning: boolean;

  // Kitchen
  kitchenStation: KitchenStation;
  status: ExtendedOrderItemStatus;
  estimatedPrepTime?: number;
  actualPrepTime?: number;
  preparedBy?: string;
  preparedAt?: string;

  // Notes
  specialInstructions?: string;
  kitchenNotes?: string;

  // Combo
  isComboItem: boolean;
  comboId?: string;
  comboName?: string;
  comboDiscount?: number;

  // Timestamps
  addedAt: string;
  modifiedAt?: string;
}

// ============== EXTENDED ORDER ==============

export interface ExtendedOrder extends BaseEntity {
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
  items: ExtendedOrderItem[];

  // Financials
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;

  // Status
  status: ExtendedOrderStatus;
  paymentStatus: ExtendedPaymentStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  paidAt?: string;
  cancelledAt?: string;

  // Notes
  specialInstructions?: string;
  cancellationReason?: string;

  // Kitchen
  kitchenTicketIds: string[];
  estimatedPrepTime?: number;
  actualPrepTime?: number;

  // Payment
  paymentId?: string;
  paymentMethod?: string;
  splitPayments?: SplitPaymentRecord[];

  // Sync
  syncedAt?: string;
  pendingSync: boolean;
}

// ============== SPLIT PAYMENT RECORD ==============

export interface SplitPaymentRecord {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  processedAt?: string;
}

// ============== ORDER DRAFT ==============

export interface OrderDraft {
  id: string;
  tableId: string;
  tableName: string;
  guestCount: number;
  items: ExtendedOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

// ============== ORDER FILTERS ==============

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ExtendedOrderFilters {
  status?: ExtendedOrderStatus | 'all';
  paymentStatus?: ExtendedPaymentStatus | 'all';
  tableId?: string;
  dateRange?: DateRange;
  staffId?: string;
  searchQuery?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ============== ORDER CREATION REQUEST ==============

export interface CreateExtendedOrderRequest {
  tableId: string;
  tableName: string;
  guestCount?: number;
  customerId?: string;
  items: AddOrderItemRequest[];
  specialInstructions?: string;
}

export interface AddOrderItemRequest {
  menuItemId: string;
  quantity: number;
  selectedModifiers?: SelectedModifier[];
  specialInstructions?: string;
  isComboItem?: boolean;
  comboId?: string;
}

// ============== ORDER UPDATE REQUESTS ==============

export interface UpdateOrderStatusRequest {
  status: ExtendedOrderStatus;
  cancellationReason?: string;
}

export interface UpdateOrderItemStatusRequest {
  status: ExtendedOrderItemStatus;
  kitchenNotes?: string;
  preparedBy?: string;
}

// ============== SUBMIT ORDER RESULT ==============

export interface SubmitOrderResult {
  success: boolean;
  orderId: string;
  orderNumber: string;
  ticketIds: string[];
  estimatedPrepTime: number;
  error?: string;
}

// ============== CART STATE ==============

export interface CartState {
  items: ExtendedOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;
}

// ============== CATEGORY TO STATION MAPPING ==============

export interface CategoryStationMapping {
  categoryId: string;
  categoryName: string;
  station: KitchenStation;
  priority: 'low' | 'normal' | 'high';
  defaultPrepTime: number; // minutes
}

export const DEFAULT_CATEGORY_STATION_MAP: Record<string, KitchenStation> = {
  starters: 'cold_kitchen',
  appetizers: 'cold_kitchen',
  salads: 'cold_kitchen',
  soups: 'hot_kitchen',
  mains: 'hot_kitchen',
  entrees: 'hot_kitchen',
  grilled: 'grill',
  bbq: 'grill',
  seafood: 'hot_kitchen',
  pasta: 'hot_kitchen',
  pizza: 'hot_kitchen',
  desserts: 'desserts',
  sweets: 'desserts',
  beverages: 'beverages',
  drinks: 'beverages',
  cocktails: 'bar',
  alcohol: 'bar',
  wine: 'bar',
  beer: 'bar',
};

// ============== HELPER FUNCTIONS ==============

export const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
};

export const generateOrderItemId = (): string => {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateItemTotal = (
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

export const getStationForCategory = (
  categoryId: string,
  categoryName: string
): KitchenStation => {
  // First try by categoryId
  if (DEFAULT_CATEGORY_STATION_MAP[categoryId.toLowerCase()]) {
    return DEFAULT_CATEGORY_STATION_MAP[categoryId.toLowerCase()];
  }

  // Then try by categoryName
  const normalizedName = categoryName.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, station] of Object.entries(DEFAULT_CATEGORY_STATION_MAP)) {
    if (normalizedName.includes(key)) {
      return station;
    }
  }

  // Default to hot_kitchen
  return 'hot_kitchen';
};
