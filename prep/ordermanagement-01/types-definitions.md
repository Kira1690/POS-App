# Order Management System - Type Definitions

**Version:** 2.0
**Date:** January 15, 2026

This document contains all TypeScript type definitions required for the Order Management System implementation.

---

## 1. Base Types

### 1.1 Common Types

```typescript
// src/types/common.types.ts

// Unique identifier generator prefixes
export type EntityPrefix = 'ORD' | 'TKT' | 'BIL' | 'PAY' | 'RCP' | 'GST' | 'SPL' | 'TBL';

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Query filters
export interface QueryFilter<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
```

---

## 2. Order Types

### 2.1 Order Entity

```typescript
// src/types/order.types.ts

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export interface Order extends BaseEntity {
  // Identification
  orderNumber: string;           // ORD-YYYYMMDD-XXXX
  restaurantId: string;

  // Table info
  tableId: string;
  tableName: string;

  // Customer info (optional for dine-in)
  customerId?: string;
  customerName?: string;
  customerPhone?: string;

  // Staff
  createdBy: string;
  createdByName: string;
  servedBy?: string;
  servedByName?: string;

  // Order details
  orderType: OrderType;
  guestCount?: number;
  items: OrderItem[];

  // Financials
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountReason?: string;
  tipAmount: number;
  serviceCharge: number;
  totalAmount: number;

  // Status
  status: OrderStatus;

  // Timestamps
  submittedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  // Notes
  specialInstructions?: string;
  internalNotes?: string;

  // Payment tracking
  paymentStatus: PaymentStatus;
  billId?: string;
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  menuItemId: string;

  // Item details
  name: string;
  category: string;
  categoryId: string;

  // Pricing
  basePrice: number;
  quantity: number;
  modifierTotal: number;
  discountAmount: number;
  totalPrice: number;

  // Modifiers
  selectedModifiers: SelectedModifier[];

  // Kitchen
  kitchenStation: KitchenStation;
  itemStatus: OrderItemStatus;
  prepTime?: number;

  // Dietary info
  dietaryTags: string[];
  allergens: string[];

  // Notes
  specialInstructions?: string;

  // Combo
  isComboItem: boolean;
  comboId?: string;
  comboDiscount?: number;
  parentComboItemId?: string;
}

export type OrderItemStatus =
  | 'pending'
  | 'sent_to_kitchen'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface SelectedModifier {
  modifierGroupId: string;
  modifierGroupName: string;
  modifierId: string;
  modifierName: string;
  priceAdjustment: number;
  quantity: number;
}

// DTOs
export interface CreateOrderDTO {
  tableId: string;
  tableName: string;
  orderType: OrderType;
  guestCount?: number;
  items: CreateOrderItemDTO[];
  specialInstructions?: string;
}

export interface CreateOrderItemDTO {
  menuItemId: string;
  quantity: number;
  selectedModifiers?: SelectedModifier[];
  specialInstructions?: string;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  items?: OrderItem[];
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  discountReason?: string;
  tipAmount?: number;
  specialInstructions?: string;
  internalNotes?: string;
}
```

---

## 3. Kitchen Ticket Types

### 3.1 Kitchen Entities

```typescript
// src/types/kitchen-ticket.types.ts

export type KitchenStation =
  | 'hot_kitchen'
  | 'cold_kitchen'
  | 'grill'
  | 'desserts'
  | 'beverages'
  | 'bar'
  | 'pastry';

export type TicketStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export type TicketPriority =
  | 'urgent'
  | 'high'
  | 'normal'
  | 'low';

export interface KitchenTicket extends BaseEntity {
  orderId: string;
  orderNumber: string;

  // Table info
  tableId: string;
  tableName: string;

  // Station
  station: KitchenStation;
  stationName: string;

  // Items for this station
  items: KitchenTicketItem[];

  // Status & Priority
  status: TicketStatus;
  priority: TicketPriority;

  // Timing
  startedAt?: string;
  completedAt?: string;
  estimatedPrepTime: number;  // in minutes
  actualPrepTime?: number;

  // Flags
  hasAllergens: boolean;
  allergenWarnings: string[];
  isRush: boolean;
  isOverdue: boolean;

  // Notes
  specialInstructions?: string;

  // Staff
  assignedTo?: string;
  assignedToName?: string;
  completedBy?: string;
}

export interface KitchenTicketItem {
  id: string;
  orderItemId: string;
  menuItemId: string;

  // Item details
  name: string;
  quantity: number;

  // Modifiers
  modifiers: KitchenModifier[];

  // Instructions
  specialInstructions?: string;

  // Dietary
  allergens: string[];
  dietaryTags: string[];

  // Status
  status: OrderItemStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface KitchenModifier {
  id: string;
  name: string;
  quantity: number;
}

// Station configuration
export interface StationConfig {
  station: KitchenStation;
  displayName: string;
  color: string;
  categories: string[];  // Category IDs that route to this station
  defaultPrepTime: number;  // in minutes
  maxCapacity: number;  // Max tickets at once
}

// DTOs
export interface CreateKitchenTicketDTO {
  orderId: string;
  orderNumber: string;
  tableId: string;
  tableName: string;
  station: KitchenStation;
  items: KitchenTicketItem[];
  priority?: TicketPriority;
  specialInstructions?: string;
}

export interface UpdateTicketStatusDTO {
  status: TicketStatus;
  completedBy?: string;
}

// Stats
export interface KitchenStats {
  pending: number;
  preparing: number;
  ready: number;
  served: number;
  total: number;
  averagePrepTime: number;
  overdueCount: number;
}
```

---

## 4. Bill & Split Types

### 4.1 Bill Entity

```typescript
// src/types/bill.types.ts

export type BillStatus =
  | 'draft'
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded'
  | 'voided';

export interface Bill extends BaseEntity {
  orderId: string;
  orderNumber: string;

  // Table info
  tableId: string;
  tableName: string;

  // Items
  items: BillItem[];

  // Summary
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountReason?: string;
  serviceCharge: number;
  tipAmount: number;
  totalAmount: number;

  // Rounding
  roundingAdjustment: number;
  finalAmount: number;

  // Status
  status: BillStatus;

  // Split info
  isSplit: boolean;
  splitType?: SplitType;
  splitId?: string;

  // Payment tracking
  paidAmount: number;
  remainingAmount: number;

  // Staff
  generatedBy: string;
  generatedByName: string;

  // Timestamps
  paidAt?: string;
}

export interface BillItem {
  id: string;
  orderItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: BillModifier[];
  modifierTotal: number;
  totalPrice: number;
}

export interface BillModifier {
  name: string;
  price: number;
}
```

### 4.2 Bill Split Types

```typescript
// src/types/bill-split.types.ts

export type SplitType = 'equal' | 'by_items' | 'by_payment' | 'custom';

export type SplitStatus = 'pending' | 'partial' | 'completed';

export interface BillSplit extends BaseEntity {
  orderId: string;
  billId: string;

  // Split configuration
  splitType: SplitType;
  guestCount: number;

  // Guest splits
  guestSplits: GuestSplit[];

  // Totals
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Status
  status: SplitStatus;

  // Timestamps
  completedAt?: string;
}

export interface GuestSplit extends BaseEntity {
  splitId: string;

  // Guest info
  guestNumber: number;
  guestName: string;

  // Assigned items (for by_items split)
  items: SplitItem[];

  // Shared items
  sharedItems: SharedSplitItem[];

  // Financials
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  serviceCharge: number;
  totalAmount: number;

  // Payment
  paymentMethod?: PaymentMethod;
  paymentStatus: GuestPaymentStatus;
  paidAmount: number;
  paidAt?: string;
  paymentId?: string;
}

export type GuestPaymentStatus = 'unpaid' | 'processing' | 'paid' | 'failed';

export interface SplitItem {
  id: string;
  orderItemId: string;
  billItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers: string[];
}

export interface SharedSplitItem extends SplitItem {
  sharedWithGuestIds: string[];
  sharedWithGuestNumbers: number[];
  shareCount: number;
  shareAmount: number;  // Amount per guest
}

// DTOs
export interface CreateBillSplitDTO {
  billId: string;
  splitType: SplitType;
  guestCount: number;
  guestAssignments?: GuestItemAssignment[];
}

export interface GuestItemAssignment {
  guestNumber: number;
  guestName: string;
  itemIds: string[];
  sharedItemIds?: string[];
}

export interface UpdateGuestPaymentDTO {
  guestSplitId: string;
  paymentMethod: PaymentMethod;
  amount: number;
}
```

---

## 5. Payment Types

### 5.1 Payment Entity

```typescript
// src/types/payment.types.ts

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'wallet'
  | 'gift_card'
  | 'loyalty_points';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';

export interface Payment extends BaseEntity {
  // References
  orderId: string;
  billId: string;
  splitId?: string;
  guestSplitId?: string;

  // Payment details
  method: PaymentMethod;
  amount: number;

  // Cash specific
  receivedAmount?: number;
  changeAmount?: number;

  // Card specific
  cardBrand?: CardBrand;
  cardLast4?: string;
  cardExpiry?: string;
  authCode?: string;

  // UPI specific
  upiId?: string;
  upiTransactionId?: string;

  // Transaction
  transactionId: string;
  externalTransactionId?: string;

  // Status
  status: PaymentStatus;
  failureReason?: string;

  // Timestamps
  processedAt?: string;
  refundedAt?: string;

  // Staff
  processedBy: string;
  processedByName: string;

  // Refund info
  isRefunded: boolean;
  refundAmount?: number;
  refundReason?: string;
  refundTransactionId?: string;
}

export interface SplitPaymentSession {
  id: string;
  billSplitId: string;

  // Payments in this session
  payments: Payment[];

  // Progress
  totalDue: number;
  totalPaid: number;
  remaining: number;

  // Status
  status: SplitStatus;
  currentGuestIndex: number;

  // Timestamps
  startedAt: string;
  completedAt?: string;
}

// DTOs
export interface ProcessPaymentDTO {
  orderId: string;
  billId: string;
  method: PaymentMethod;
  amount: number;
  receivedAmount?: number;  // For cash
  splitId?: string;
  guestSplitId?: string;
}

export interface ProcessCardPaymentDTO extends ProcessPaymentDTO {
  cardToken?: string;  // For tokenized cards
  cardLast4?: string;
  cardExpiry?: string;
}

export interface RefundPaymentDTO {
  paymentId: string;
  amount: number;
  reason: string;
}

// Cash calculation helper
export interface CashPaymentCalculation {
  amountDue: number;
  receivedAmount: number;
  changeAmount: number;
  quickAmounts: number[];  // Suggested amounts
}
```

---

## 6. Receipt Types

### 6.1 Receipt Entity

```typescript
// src/types/receipt.types.ts

export type ReceiptType =
  | 'order'
  | 'payment'
  | 'split_payment'
  | 'refund'
  | 'kitchen_ticket';

export type ReceiptFormat = 'thermal' | 'a4' | 'digital';

export interface Receipt extends BaseEntity {
  // References
  orderId: string;
  billId: string;
  paymentId: string;

  // Type
  receiptType: ReceiptType;
  receiptNumber: string;  // RCP-YYYYMMDD-XXXX

  // Content sections
  header: ReceiptHeader;
  orderInfo: ReceiptOrderInfo;
  items: ReceiptItem[];
  summary: ReceiptSummary;
  paymentInfo: ReceiptPaymentInfo;
  footer: ReceiptFooter;

  // Split info (if applicable)
  splitInfo?: ReceiptSplitInfo;

  // Format
  format: ReceiptFormat;

  // Delivery
  printedAt?: string;
  emailedTo?: string;
  emailedAt?: string;
  smsTo?: string;
  smsAt?: string;
}

export interface ReceiptHeader {
  restaurantName: string;
  restaurantLogo?: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  taxId?: string;
  gstNumber?: string;
}

export interface ReceiptOrderInfo {
  orderNumber: string;
  orderDate: string;
  orderTime: string;
  tableNumber?: string;
  serverName: string;
  guestCount?: number;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers?: ReceiptModifier[];
}

export interface ReceiptModifier {
  name: string;
  price: number;
}

export interface ReceiptSummary {
  subtotal: number;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  discountLabel?: string;
  discountAmount: number;
  serviceChargeLabel?: string;
  serviceCharge: number;
  tipLabel?: string;
  tipAmount: number;
  totalLabel: string;
  totalAmount: number;
}

export interface ReceiptPaymentInfo {
  method: string;
  methodDetails?: string;  // e.g., "Visa ****1234"
  amount: number;
  receivedAmount?: number;
  changeAmount?: number;
  transactionId: string;
  transactionTime: string;
}

export interface ReceiptSplitInfo {
  guestNumber: number;
  guestName: string;
  splitType: string;
  totalGuests: number;
}

export interface ReceiptFooter {
  thankYouMessage: string;
  returnPolicy?: string;
  loyaltyMessage?: string;
  surveyUrl?: string;
  socialMedia?: string;
  customMessage?: string;
  qrCode?: string;  // Base64 encoded
}

// DTOs
export interface GenerateReceiptDTO {
  orderId: string;
  billId: string;
  paymentId: string;
  receiptType: ReceiptType;
  format?: ReceiptFormat;
  guestSplitId?: string;
}

export interface PrintReceiptDTO {
  receiptId: string;
  printerId?: string;
  copies?: number;
}

export interface EmailReceiptDTO {
  receiptId: string;
  email: string;
  subject?: string;
  message?: string;
}
```

---

## 7. Combo Types

### 7.1 Combo Entity

```typescript
// src/types/combo.types.ts

export type ComboStatus = 'active' | 'inactive' | 'scheduled' | 'expired';

export interface ComboDeal extends BaseEntity {
  restaurantId: string;

  // Basic info
  name: string;
  description: string;
  imageUrl?: string;

  // Pricing
  originalPrice: number;
  comboPrice: number;
  discountAmount: number;
  discountPercentage: number;

  // Components
  components: ComboComponent[];

  // Status & Availability
  status: ComboStatus;
  isActive: boolean;
  availableFrom?: string;
  availableUntil?: string;
  availableDays?: number[];  // 0-6 (Sunday-Saturday)
  availableStartTime?: string;  // HH:mm
  availableEndTime?: string;

  // Limits
  maxPerOrder?: number;
  dailyLimit?: number;
  totalLimit?: number;
  soldCount: number;

  // Display
  displayOrder: number;
  isHighlighted: boolean;
  badgeText?: string;  // e.g., "Best Value"
}

export interface ComboComponent {
  id: string;
  comboId: string;

  // Component details
  name: string;  // e.g., "Select 2 Burgers"
  description?: string;

  // Selection rules
  categoryId?: string;  // Optional category filter
  requiredQuantity: number;
  minQuantity: number;
  maxQuantity: number;

  // Options
  options: ComboOption[];

  // Display
  displayOrder: number;
}

export interface ComboOption {
  id: string;
  componentId: string;
  menuItemId: string;

  // Item details (denormalized for display)
  name: string;
  description?: string;
  imageUrl?: string;

  // Pricing
  priceAdjustment: number;  // 0 for included, +/- for upgrades/downgrades
  isDefault: boolean;
  isAvailable: boolean;

  // Display
  displayOrder: number;
}

// For cart/order
export interface SelectedCombo {
  comboId: string;
  comboName: string;
  comboPrice: number;
  originalPrice: number;
  discountAmount: number;
  selectedComponents: SelectedComboComponent[];
}

export interface SelectedComboComponent {
  componentId: string;
  componentName: string;
  selections: SelectedComboOption[];
}

export interface SelectedComboOption {
  optionId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  priceAdjustment: number;
  modifiers?: SelectedModifier[];
}

// DTOs
export interface AddComboToCartDTO {
  comboId: string;
  selections: ComboSelectionDTO[];
}

export interface ComboSelectionDTO {
  componentId: string;
  optionId: string;
  menuItemId: string;
  quantity: number;
  modifiers?: SelectedModifier[];
}
```

---

## 8. Repository & Service Interfaces

### 8.1 Repository Interface

```typescript
// src/repositories/base/IRepository.ts

export interface IRepository<T extends BaseEntity> {
  // Basic CRUD
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id' | 'createdAt'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;

  // Querying
  query(filters: QueryFilter<T>[]): Promise<T[]>;
  findOne(filters: QueryFilter<T>[]): Promise<T | null>;
  count(filters?: QueryFilter<T>[]): Promise<number>;

  // Bulk operations
  createMany(items: Omit<T, 'id' | 'createdAt'>[]): Promise<T[]>;
  updateMany(ids: string[], item: Partial<T>): Promise<T[]>;
  deleteMany(ids: string[]): Promise<void>;

  // Pagination
  paginate(params: PaginationParams, filters?: QueryFilter<T>[]): Promise<PaginatedResponse<T>>;
}
```

### 8.2 Service Interface

```typescript
// src/services/base/IService.ts

export interface IService<T, CreateDTO, UpdateDTO> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
}

// Specific service interfaces
export interface IOrderService extends IService<Order, CreateOrderDTO, UpdateOrderDTO> {
  getByTable(tableId: string): Promise<Order[]>;
  getActiveOrders(): Promise<Order[]>;
  submitToKitchen(orderId: string): Promise<Order>;
  cancelOrder(orderId: string, reason: string): Promise<Order>;
  addItemsToOrder(orderId: string, items: CreateOrderItemDTO[]): Promise<Order>;
}

export interface IKitchenService {
  createTicketsForOrder(order: Order): Promise<KitchenTicket[]>;
  getTicketsByStation(station: KitchenStation): Promise<KitchenTicket[]>;
  updateTicketStatus(ticketId: string, status: TicketStatus): Promise<KitchenTicket>;
  bumpTicket(ticketId: string): Promise<KitchenTicket>;
  getStats(): Promise<KitchenStats>;
}

export interface IBillService extends IService<Bill, CreateBillDTO, UpdateBillDTO> {
  generateFromOrder(orderId: string): Promise<Bill>;
  applyDiscount(billId: string, discount: DiscountDTO): Promise<Bill>;
  addTip(billId: string, amount: number): Promise<Bill>;
}

export interface IBillSplitService {
  createSplit(data: CreateBillSplitDTO): Promise<BillSplit>;
  calculateEqualSplit(billId: string, guestCount: number): Promise<GuestSplit[]>;
  calculateItemSplit(billId: string, assignments: GuestItemAssignment[]): Promise<GuestSplit[]>;
  updateGuestPayment(data: UpdateGuestPaymentDTO): Promise<GuestSplit>;
}

export interface IPaymentService extends IService<Payment, ProcessPaymentDTO, never> {
  processCashPayment(data: ProcessPaymentDTO): Promise<Payment>;
  processCardPayment(data: ProcessCardPaymentDTO): Promise<Payment>;
  processSplitPayment(sessionId: string, guestSplitId: string, data: ProcessPaymentDTO): Promise<Payment>;
  refundPayment(data: RefundPaymentDTO): Promise<Payment>;
  calculateCashChange(amountDue: number, received: number): CashPaymentCalculation;
}

export interface IReceiptService {
  generate(data: GenerateReceiptDTO): Promise<Receipt>;
  print(data: PrintReceiptDTO): Promise<void>;
  email(data: EmailReceiptDTO): Promise<void>;
  getByOrder(orderId: string): Promise<Receipt[]>;
}
```

---

## 9. Context State Types

### 9.1 Order Context State

```typescript
// src/context/order/types.ts

export interface OrderContextState {
  // Current session
  activeOrder: Order | null;
  cart: CartItem[];
  selectedTable: Table | null;

  // All orders
  orders: Order[];

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Error
  error: string | null;

  // Filters
  statusFilter: OrderStatus | 'all';
  dateFilter: DateRange | null;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  category: string;
  categoryId: string;
  basePrice: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  modifierTotal: number;
  totalPrice: number;
  specialInstructions?: string;
  dietaryTags: string[];
  allergens: string[];
  kitchenStation: KitchenStation;
  comboId?: string;
  isComboItem: boolean;
}

export type OrderAction =
  | { type: 'SET_ACTIVE_ORDER'; payload: Order | null }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TABLE'; payload: Table | null }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATUS_FILTER'; payload: OrderStatus | 'all' }
  | { type: 'SET_DATE_FILTER'; payload: DateRange | null };
```

### 9.2 Bill Split Context State

```typescript
// src/context/billing/types.ts

export interface BillSplitContextState {
  // Current bill
  bill: Bill | null;

  // Split configuration
  splitType: SplitType | null;
  guestCount: number;

  // Guest splits
  guestSplits: GuestSplit[];
  activeGuestIndex: number;

  // Payment session
  paymentSession: SplitPaymentSession | null;

  // Progress
  totalPaid: number;
  totalRemaining: number;

  // Loading states
  isLoading: boolean;
  isProcessing: boolean;

  // Error
  error: string | null;
}

export type BillSplitAction =
  | { type: 'SET_BILL'; payload: Bill }
  | { type: 'SET_SPLIT_TYPE'; payload: SplitType }
  | { type: 'SET_GUEST_COUNT'; payload: number }
  | { type: 'SET_GUEST_SPLITS'; payload: GuestSplit[] }
  | { type: 'UPDATE_GUEST_SPLIT'; payload: GuestSplit }
  | { type: 'SET_ACTIVE_GUEST'; payload: number }
  | { type: 'SET_PAYMENT_SESSION'; payload: SplitPaymentSession }
  | { type: 'UPDATE_PAYMENT_PROGRESS'; payload: { paid: number; remaining: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };
```

### 9.3 Payment Context State

```typescript
// src/context/payment/types.ts

export interface PaymentContextState {
  // Current payment
  currentPayment: Payment | null;

  // Payment method
  selectedMethod: PaymentMethod | null;

  // Cash payment
  cashReceived: number;
  changeAmount: number;

  // Card payment
  cardProcessing: boolean;
  cardError: string | null;

  // Split payment
  splitSession: SplitPaymentSession | null;

  // History
  recentPayments: Payment[];

  // Loading states
  isProcessing: boolean;

  // Error
  error: string | null;
}

export type PaymentAction =
  | { type: 'SET_CURRENT_PAYMENT'; payload: Payment | null }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_CASH_RECEIVED'; payload: number }
  | { type: 'SET_CHANGE_AMOUNT'; payload: number }
  | { type: 'SET_CARD_PROCESSING'; payload: boolean }
  | { type: 'SET_CARD_ERROR'; payload: string | null }
  | { type: 'SET_SPLIT_SESSION'; payload: SplitPaymentSession | null }
  | { type: 'ADD_TO_HISTORY'; payload: Payment }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };
```

---

## 10. Utility Types

### 10.1 ID Generation

```typescript
// src/utils/idGenerator.ts

export function generateId(prefix: EntityPrefix): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${seq}`;
}

export function generateReceiptNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${dateStr}-${seq}`;
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TXN${timestamp}${random}`;
}
```

### 10.2 Price Calculation

```typescript
// src/utils/priceCalculator.ts

export interface PriceCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  serviceCharge: number;
  tipAmount: number;
  total: number;
}

export function calculateOrderTotal(
  items: OrderItem[],
  taxRate: number = 0.10,
  discountAmount: number = 0,
  serviceCharge: number = 0,
  tipAmount: number = 0
): PriceCalculation {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount + serviceCharge + tipAmount;

  return {
    subtotal,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount,
    serviceCharge,
    tipAmount,
    total: Math.round(total * 100) / 100,
  };
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

---

This completes all type definitions required for the Order Management System implementation.
