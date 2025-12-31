# Order Management - Data Flow & Architecture

## Overview

This document details the data flow architecture for the Order Management system, including storage patterns, context structure, and integration points with other systems.

---

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    APPLICATION DATA FLOW                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│                                         ┌─────────────────┐                                             │
│                                         │   ASYNC STORAGE │                                             │
│                                         │  (Persistence)  │                                             │
│                                         └────────┬────────┘                                             │
│                                                  │                                                       │
│         ┌────────────────────────────────────────┼────────────────────────────────────────┐             │
│         │                                        │                                        │             │
│         ▼                                        ▼                                        ▼             │
│  ┌─────────────┐                         ┌─────────────┐                         ┌─────────────┐        │
│  │   MENU      │                         │   ORDER     │                         │   TABLE     │        │
│  │  CONTEXT    │◀────────────────────────│  CONTEXT    │─────────────────────────▶│  CONTEXT    │        │
│  │             │    Menu items for       │             │    Table status          │             │        │
│  │ - Categories│    order creation       │ - Orders[]  │    updates               │ - Tables[]  │        │
│  │ - Items     │                         │ - Cart      │                          │ - Areas[]   │        │
│  │ - Modifiers │                         │ - Tickets   │                          │ - Status    │        │
│  │ - Combos    │                         │             │                          │             │        │
│  └──────┬──────┘                         └──────┬──────┘                          └──────┬──────┘        │
│         │                                       │                                        │               │
│         │                                       │                                        │               │
│         │              ┌────────────────────────┴────────────────────────┐               │               │
│         │              │                                                 │               │               │
│         │              ▼                                                 ▼               │               │
│         │       ┌─────────────┐                                  ┌─────────────┐        │               │
│         │       │   KITCHEN   │                                  │   PAYMENT   │        │               │
│         │       │  CONTEXT    │                                  │  CONTEXT    │        │               │
│         │       │             │                                  │             │        │               │
│         │       │ - Tickets[] │                                  │ - Payments  │        │               │
│         │       │ - Stations  │                                  │ - Splits    │        │               │
│         │       │ - Status    │                                  │ - Receipts  │        │               │
│         │       └──────┬──────┘                                  └──────┬──────┘        │               │
│         │              │                                                │               │               │
│         │              │                                                │               │               │
│         ▼              ▼                                                ▼               ▼               │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                                        UI COMPONENTS                                                 ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              ││
│  │  │  Ordering   │  │   Kitchen   │  │    Bill     │  │   Payment   │  │  Dashboard  │              ││
│  │  │   Screen    │  │   Display   │  │   Screen    │  │   Screen    │  │   Screen    │              ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘              ││
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Storage Layer

### AsyncStorage Keys

```typescript
// Storage key constants
export const STORAGE_KEYS = {
  // Order Data
  ORDERS: '@pos/orders',
  ACTIVE_ORDERS: '@pos/active_orders',
  ORDER_HISTORY: '@pos/order_history',
  ORDER_DRAFTS: '@pos/order_drafts',

  // Kitchen Data
  KITCHEN_TICKETS: '@pos/kitchen_tickets',
  STATION_CONFIG: '@pos/station_config',

  // Payment Data
  PENDING_PAYMENTS: '@pos/pending_payments',
  PAYMENT_HISTORY: '@pos/payment_history',
  SPLIT_BILLS: '@pos/split_bills',

  // Sync Data
  LAST_SYNC: '@pos/last_sync',
  PENDING_SYNC: '@pos/pending_sync',
  SYNC_QUEUE: '@pos/sync_queue',
} as const;
```

### Storage Service Architecture

```
src/services/storage/
├── StorageService.ts              # Base storage utilities
├── OrderStorageService.ts         # Order-specific storage
├── KitchenStorageService.ts       # Kitchen ticket storage
├── PaymentStorageService.ts       # Payment data storage
└── SyncService.ts                 # Sync queue management
```

### OrderStorageService

```typescript
// src/services/storage/OrderStorageService.ts

interface OrderStorageService {
  // Orders
  saveOrder(order: Order): Promise<void>;
  getOrder(orderId: string): Promise<Order | null>;
  getActiveOrders(): Promise<Order[]>;
  getOrderHistory(filters: OrderFilters): Promise<Order[]>;
  updateOrder(orderId: string, updates: Partial<Order>): Promise<void>;
  deleteOrder(orderId: string): Promise<void>;

  // Drafts (orders not yet submitted)
  saveDraft(order: OrderDraft): Promise<void>;
  getDrafts(): Promise<OrderDraft[]>;
  deleteDraft(draftId: string): Promise<void>;

  // Bulk operations
  saveOrders(orders: Order[]): Promise<void>;
  clearOldOrders(beforeDate: Date): Promise<void>;

  // Sync
  getUnsyncedOrders(): Promise<Order[]>;
  markAsSynced(orderIds: string[]): Promise<void>;
}
```

---

## Context Architecture

### Order Context (Refactored)

```typescript
// src/context/order/OrderContext.tsx

interface OrderState {
  // Current Order Session
  currentOrder: Order | null;
  cart: OrderItem[];
  selectedTable: Table | null;

  // Order Items
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartItemCount: number;

  // All Orders
  orders: Order[];
  activeOrders: Order[];
  orderHistory: Order[];

  // Filters & Search
  searchQuery: string;
  statusFilter: OrderStatus | 'all';
  dateFilter: DateRange | null;

  // Kitchen Tickets (linked)
  kitchenTickets: KitchenTicket[];

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Sync State
  lastSynced: Date | null;
  pendingSyncCount: number;
}

interface OrderActions {
  // Order Creation
  createOrder(table: Table, guestCount?: number): void;
  setSelectedTable(table: Table): void;
  clearCurrentOrder(): void;

  // Cart Operations
  addToCart(item: MenuItemExtended, modifiers: SelectedModifier[], quantity: number, notes?: string): void;
  updateCartItem(itemId: string, updates: Partial<OrderItem>): void;
  updateCartItemQuantity(itemId: string, quantity: number): void;
  updateCartItemModifiers(itemId: string, modifiers: SelectedModifier[]): void;
  removeFromCart(itemId: string): void;
  clearCart(): void;

  // Combo Operations
  addComboToCart(combo: ComboDeal, selections: ComboSelection[]): void;

  // Order Submission
  submitOrderToKitchen(): Promise<SubmitResult>;
  addItemsToExistingOrder(orderId: string): Promise<void>;

  // Order Management
  loadOrders(filters?: OrderFilters): Promise<void>;
  loadActiveOrders(): Promise<void>;
  refreshOrders(): Promise<void>;

  // Order Status
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  cancelOrder(orderId: string, reason: string): Promise<void>;

  // Item Status (from kitchen)
  updateItemStatus(orderId: string, itemId: string, status: OrderItemStatus): void;

  // Search & Filter
  setSearchQuery(query: string): void;
  setStatusFilter(status: OrderStatus | 'all'): void;
  setDateFilter(range: DateRange | null): void;

  // Sync
  syncOrders(): Promise<void>;
}

type OrderContextValue = OrderState & OrderActions;
```

### Kitchen Context

```typescript
// src/context/kitchen/KitchenContext.tsx

interface KitchenState {
  // Tickets
  tickets: KitchenTicket[];
  ticketsByStation: Record<KitchenStation, KitchenTicket[]>;

  // Station
  selectedStation: KitchenStation | 'all';
  stations: KitchenStation[];

  // Stats
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  overdueCount: number;

  // UI State
  isLoading: boolean;
  error: string | null;
}

interface KitchenActions {
  // Tickets
  loadTickets(): Promise<void>;
  refreshTickets(): Promise<void>;

  // Station Filter
  setSelectedStation(station: KitchenStation | 'all'): void;

  // Ticket Status
  startTicket(ticketId: string): Promise<void>;
  completeTicket(ticketId: string): Promise<void>;
  delayTicket(ticketId: string, reason: string): Promise<void>;

  // Item Status
  updateItemStatus(ticketId: string, itemId: string, status: OrderItemStatus): Promise<void>;
  markItemReady(ticketId: string, itemId: string): Promise<void>;

  // Notifications
  acknowledgeAlert(ticketId: string): void;
}

type KitchenContextValue = KitchenState & KitchenActions;
```

### Payment Context (Enhanced)

```typescript
// src/context/payment/PaymentContext.tsx

interface PaymentState {
  // Current Payment
  currentOrder: Order | null;
  paymentMethod: PaymentMethod | null;

  // Bill Split
  splitType: SplitType | null;
  splits: BillSplit | null;
  guestPayments: GuestPayment[];

  // Payment Progress
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Processing
  isProcessing: boolean;
  processingStep: ProcessingStep | null;
  error: string | null;

  // Receipt
  lastReceipt: Receipt | null;
}

interface PaymentActions {
  // Initialize
  initializePayment(order: Order): void;
  setPaymentMethod(method: PaymentMethod): void;
  clearPayment(): void;

  // Bill Splitting
  setSplitType(type: SplitType): void;
  setEqualSplit(guestCount: number): void;
  setItemSplit(assignments: ItemAssignment[]): void;
  setPaymentMethodSplit(splits: PaymentMethodSplit[]): void;

  // Guest Management
  addGuest(name?: string): void;
  removeGuest(guestId: string): void;
  assignItemToGuest(itemId: string, guestId: string): void;
  markGuestPaid(guestId: string): void;

  // Processing
  processCashPayment(received: number): Promise<PaymentResult>;
  processCardPayment(): Promise<PaymentResult>;
  processPartialPayment(amount: number, method: PaymentMethod): Promise<PaymentResult>;

  // Completion
  completePayment(): Promise<void>;
  printReceipt(): Promise<void>;
  emailReceipt(email: string): Promise<void>;
}

type PaymentContextValue = PaymentState & PaymentActions;
```

---

## Data Flow Diagrams

### Flow 1: Order Creation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ORDER CREATION FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   USER ACTION                 CONTEXT                      STORAGE               │
│   ───────────                 ───────                      ───────               │
│                                                                                  │
│   1. Select Table            OrderContext.                                       │
│      from Table              createOrder(table)                                  │
│      Management                    │                                             │
│                                    ▼                                             │
│                              Generate order ID                                   │
│                              Initialize cart = []                                │
│                              Set selectedTable                                   │
│                              Set status = DRAFT                                  │
│                                    │                                             │
│                                    ▼                                             │
│   2. Navigate to             Navigate to                                         │
│      Ordering Screen         OrderingScreen                                      │
│                                    │                                             │
│                                    ▼                                             │
│   3. Tap Menu Item           MenuContext provides                                │
│                              menuItems[], modifiers                              │
│                                    │                                             │
│                                    ▼                                             │
│   4. Select Modifiers        Open ModifierModal                                  │
│      (if required)           User selects options                                │
│                                    │                                             │
│                                    ▼                                             │
│   5. Add to Cart             OrderContext.                                       │
│                              addToCart(item, mods)                               │
│                                    │                                             │
│                                    ▼                                             │
│                              Create OrderItem with:          Save draft to       │
│                              - Generated itemId              AsyncStorage        │
│                              - menuItemId                    (debounced)         │
│                              - selectedModifiers                                 │
│                              - calculated prices                                 │
│                              - kitchenStation                                    │
│                                    │                                             │
│                                    ▼                                             │
│                              Update cart totals                                  │
│                              Recalculate tax                                     │
│                                    │                                             │
│                                    ▼                                             │
│   6. Repeat 3-5              Add more items...                                   │
│                                    │                                             │
│                                    ▼                                             │
│   7. Send to Kitchen         OrderContext.                                       │
│                              submitOrderToKitchen()                              │
│                                    │                                             │
│                                    ▼                                             │
│                              ┌─────────────────────────────────────────────┐    │
│                              │ Create Order from cart:                      │    │
│                              │ - Set orderNumber (ORD-YYYYMMDD-XXXX)       │    │
│                              │ - Set status = CONFIRMED                     │    │
│                              │ - Set submittedAt timestamp                  │    │
│                              │ - Calculate final totals                     │    │
│                              └─────────────────────────────────────────────┘    │
│                                    │                                             │
│                                    ▼                                             │
│                              ┌─────────────────────────────────────────────┐    │
│                              │ Generate Kitchen Tickets:                    │    │
│                              │ - Group items by kitchenStation             │    │
│                              │ - Create ticket per station                  │    │
│                              │ - Set priority based on table wait time     │    │
│                              │ - Add allergen flags                         │    │
│                              └─────────────────────────────────────────────┘    │
│                                    │                                             │
│                                    ├──────────────────▶ Save Order to            │
│                                    │                    AsyncStorage             │
│                                    │                                             │
│                                    ├──────────────────▶ Save Tickets to          │
│                                    │                    AsyncStorage             │
│                                    │                                             │
│                                    ▼                                             │
│                              Update TableContext:                                │
│                              table.status = OCCUPIED                             │
│                              table.currentOrderId = orderId                      │
│                                    │                                             │
│                                    ▼                                             │
│   8. Show Success            Clear cart                                          │
│      Navigate back           Show confirmation toast                             │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Kitchen Ticket Processing

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        KITCHEN TICKET FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ORDER SUBMITTED                                                                │
│        │                                                                         │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    TICKET GENERATION ENGINE                              │   │
│   │                                                                          │   │
│   │   Order Items                    Kitchen Tickets                         │   │
│   │   ───────────                    ───────────────                         │   │
│   │                                                                          │   │
│   │   1x Classic Burger  ─────────▶  HOT_KITCHEN Ticket                     │   │
│   │   1x Grilled Chicken ─────────▶  (2 items)                              │   │
│   │                                                                          │   │
│   │   2x Coca Cola ───────────────▶  BEVERAGES Ticket                       │   │
│   │   1x Orange Juice ────────────▶  (3 items)                              │   │
│   │                                                                          │   │
│   │   1x Chocolate Cake ──────────▶  DESSERTS Ticket                        │   │
│   │                                  (1 item)                                │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    STATION MAPPING RULES                                 │   │
│   │                                                                          │   │
│   │   Category            │  Station            │  Priority Rules           │   │
│   │   ────────────────────┼─────────────────────┼──────────────────────────│   │
│   │   Starters            │  COLD_KITCHEN       │  Normal                   │   │
│   │   Soups               │  HOT_KITCHEN        │  Normal                   │   │
│   │   Mains (Grilled)     │  GRILL              │  Normal                   │   │
│   │   Mains (Other)       │  HOT_KITCHEN        │  Normal                   │   │
│   │   Seafood             │  HOT_KITCHEN        │  High (perishable)        │   │
│   │   Desserts            │  DESSERTS           │  Low (serve last)         │   │
│   │   Beverages           │  BEVERAGES          │  High (serve first)       │   │
│   │   Bar/Alcohol         │  BAR                │  High                     │   │
│   │   Salads              │  COLD_KITCHEN       │  Normal                   │   │
│   │                                                                          │   │
│   │   Override Rules:                                                        │   │
│   │   - VIP Table: All items → HIGH priority                                │   │
│   │   - Rush Hour: Beverages → URGENT                                       │   │
│   │   - Wait > 15min: Bump priority up                                      │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ▼                                                                         │
│   KITCHEN DISPLAY                                                                │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                          │   │
│   │   HOT_KITCHEN          BEVERAGES           DESSERTS                     │   │
│   │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐              │   │
│   │   │ Ticket #1   │     │ Ticket #2   │     │ Ticket #3   │              │   │
│   │   │ PENDING     │     │ PENDING     │     │ PENDING     │              │   │
│   │   │ ─────────── │     │ ─────────── │     │ ─────────── │              │   │
│   │   │ 1x Burger   │     │ 2x Coke     │     │ 1x Cake     │              │   │
│   │   │ 1x Chicken  │     │ 1x OJ       │     │             │              │   │
│   │   └─────────────┘     └─────────────┘     └─────────────┘              │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ▼                                                                         │
│   KITCHEN STAFF ACTIONS                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                          │   │
│   │   [Start Ticket]                                                         │   │
│   │        │                                                                 │   │
│   │        ▼                                                                 │   │
│   │   Ticket status → PREPARING                                              │   │
│   │   startedAt = now()                                                      │   │
│   │   Start prep timer                                                       │   │
│   │        │                                                                 │   │
│   │        ▼                                                                 │   │
│   │   [Mark Item Ready]  (per item)                                          │   │
│   │        │                                                                 │   │
│   │        ▼                                                                 │   │
│   │   Item status → READY                                                    │   │
│   │   item.preparedAt = now()                                                │   │
│   │        │                                                                 │   │
│   │        ▼                                                                 │   │
│   │   IF all items ready:                                                    │   │
│   │        │                                                                 │   │
│   │        ▼                                                                 │   │
│   │   Ticket status → READY                                                  │   │
│   │   completedAt = now()                                                    │   │
│   │   Notify server (push notification)                                      │   │
│   │        │                                                                 │   │
│   │        ▼                                                                 │   │
│   │   Update Order:                                                          │   │
│   │   - Check if all tickets ready                                           │   │
│   │   - If yes: order.status → READY                                         │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Payment Processing

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT PROCESSING FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   START: Order ready for payment                                                 │
│        │                                                                         │
│        ▼                                                                         │
│   PaymentContext.initializePayment(order)                                        │
│        │                                                                         │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  BILL SCREEN                                                             │   │
│   │  ─────────────────────────────────────────────────────────────────────  │   │
│   │  Display:                                                                │   │
│   │  - Itemized list with modifiers                                          │   │
│   │  - Subtotal, Tax, Total                                                  │   │
│   │                                                                          │   │
│   │  Actions:                                                                │   │
│   │  [Add Discount] [Add Tip] [Split Bill] [Pay Full]                       │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ├─────────────────────────────────────────────────────────────────┐      │
│        │                                                                  │      │
│        ▼                                                                  ▼      │
│   [Pay Full]                                                        [Split Bill] │
│        │                                                                  │      │
│        ▼                                                                  ▼      │
│   ┌─────────────────┐                                    ┌─────────────────┐    │
│   │ SELECT PAYMENT  │                                    │  SPLIT OPTIONS  │    │
│   │ METHOD          │                                    │                 │    │
│   │ ─────────────── │                                    │ [Equal Split]   │    │
│   │ [Cash]          │                                    │ [By Items]      │    │
│   │ [Card]          │                                    │ [By Payment]    │    │
│   │ [UPI]           │                                    │                 │    │
│   └────────┬────────┘                                    └────────┬────────┘    │
│            │                                                      │             │
│            │              ┌───────────────────────────────────────┤             │
│            │              │                                       │             │
│            │              ▼                                       ▼             │
│            │   ┌─────────────────────┐              ┌─────────────────────┐    │
│            │   │   EQUAL SPLIT       │              │   ITEM SPLIT        │    │
│            │   │   ───────────────   │              │   ───────────────   │    │
│            │   │   # Guests: [4]     │              │   Assign items to   │    │
│            │   │   Per person: $X.XX │              │   each guest        │    │
│            │   │                     │              │                     │    │
│            │   │   Process each:     │              │   Process each:     │    │
│            │   │   Guest 1: [Cash]   │              │   Guest 1: $XX.XX   │    │
│            │   │   Guest 2: [Card]   │              │   Guest 2: $XX.XX   │    │
│            │   │   ...               │              │   ...               │    │
│            │   └─────────┬───────────┘              └─────────┬───────────┘    │
│            │             │                                    │                 │
│            │             └────────────────┬───────────────────┘                 │
│            │                              │                                      │
│            ▼                              ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                      PROCESS PAYMENT                                     │   │
│   │                                                                          │   │
│   │   CASH:                                                                  │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│   │   │ Amount Due: $56.65                                               │   │   │
│   │   │ Cash Received: [$ input]                                         │   │   │
│   │   │ Change Due: $X.XX                                                │   │   │
│   │   │ [Complete Payment]                                               │   │   │
│   │   └─────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                          │   │
│   │   CARD:                                                                  │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│   │   │ Amount: $56.65                                                   │   │   │
│   │   │ [Waiting for card...]                                            │   │   │
│   │   │                                                                  │   │   │
│   │   │ → Card detected                                                  │   │   │
│   │   │ → Processing...                                                  │   │   │
│   │   │ → Approved / Declined                                            │   │   │
│   │   └─────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ▼                                                                         │
│   ON SUCCESS:                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                          │   │
│   │   1. Create Payment Record                                               │   │
│   │      ├── paymentId                                                       │   │
│   │      ├── orderId                                                         │   │
│   │      ├── amount                                                          │   │
│   │      ├── method                                                          │   │
│   │      ├── transactionId (for card)                                        │   │
│   │      └── timestamp                                                       │   │
│   │                                                                          │   │
│   │   2. Update Order                                                        │   │
│   │      ├── status → PAID                                                   │   │
│   │      ├── paidAt = now()                                                  │   │
│   │      └── paymentId                                                       │   │
│   │                                                                          │   │
│   │   3. Update Table                                                        │   │
│   │      ├── status → AVAILABLE (or CLEANING)                                │   │
│   │      └── currentOrderId = null                                           │   │
│   │                                                                          │   │
│   │   4. Save to AsyncStorage                                                │   │
│   │      ├── payment → PAYMENT_HISTORY                                       │   │
│   │      └── order → ORDER_HISTORY                                           │   │
│   │                                                                          │   │
│   │   5. Generate Receipt                                                    │   │
│   │      ├── Create receipt data                                             │   │
│   │      └── Option: Print / Email                                           │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ▼                                                                         │
│   PAYMENT SUCCESS SCREEN                                                         │
│   [Print Receipt] [Email Receipt] [Done - Release Table]                         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Type Definitions

### Complete Order Type

```typescript
// src/types/order.types.ts

interface Order {
  id: string;
  orderNumber: string;               // ORD-YYYYMMDD-XXXX format
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
  items: OrderItem[];

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
  status: OrderStatus;
  paymentStatus: PaymentStatus;

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
  paymentMethod?: PaymentMethod;
  splitPayments?: SplitPaymentRecord[];

  // Sync
  syncedAt?: string;
  pendingSync: boolean;
}

type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'paid'
  | 'cancelled';

type PaymentStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded';
```

### Order Item with Full Modifier Support

```typescript
interface OrderItem {
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
  itemTotal: number;            // (basePrice + modifierTotal) * quantity

  // Modifiers
  selectedModifiers: SelectedModifier[];

  // Dietary & Allergens
  dietaryTags: DietaryTag[];
  allergens: AllergenType[];
  hasAllergenWarning: boolean;

  // Kitchen
  kitchenStation: KitchenStation;
  status: OrderItemStatus;
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

interface SelectedModifier {
  groupId: string;
  groupName: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;

  options: SelectedModifierOption[];
}

interface SelectedModifierOption {
  optionId: string;
  optionName: string;
  priceAdjustment: number;
  quantity: number;               // For "extra cheese x2"
  totalPrice: number;             // priceAdjustment * quantity
}

type OrderItemStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

type KitchenStation =
  | 'hot_kitchen'
  | 'cold_kitchen'
  | 'grill'
  | 'desserts'
  | 'beverages'
  | 'bar';
```

### Kitchen Ticket Type

```typescript
interface KitchenTicket {
  id: string;
  orderId: string;
  orderNumber: string;

  // Table Info
  tableId: string;
  tableName: string;

  // Station
  station: KitchenStation;

  // Items
  items: KitchenTicketItem[];
  itemCount: number;

  // Status
  status: TicketStatus;
  priority: TicketPriority;

  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedPrepTime: number;      // minutes
  actualPrepTime?: number;        // minutes

  // Alerts
  hasAllergens: boolean;
  allergenItems: string[];        // Item names with allergens
  isRush: boolean;
  isOverdue: boolean;

  // Notes
  specialInstructions?: string;
  delayReason?: string;
}

interface KitchenTicketItem {
  id: string;                     // Same as OrderItem.id
  name: string;
  quantity: number;

  // Modifiers (simplified for display)
  modifiers: string[];            // e.g., ["+ Bacon", "+ Jalapeño", "- Onions"]

  // Status
  status: OrderItemStatus;

  // Warnings
  allergens: AllergenType[];
  hasAllergenWarning: boolean;

  // Notes
  specialInstructions?: string;
}

type TicketStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served';

type TicketPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';
```

### Bill Split Types

```typescript
interface BillSplit {
  orderId: string;
  splitType: SplitType;

  // For equal split
  guestCount?: number;
  amountPerGuest?: number;

  // Guests
  guests: GuestSplit[];

  // For payment method split
  paymentSplits?: PaymentMethodSplit[];

  // Totals
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Status
  isComplete: boolean;
}

type SplitType =
  | 'equal'
  | 'by_items'
  | 'by_amount'
  | 'by_payment_method';

interface GuestSplit {
  id: string;
  name: string;

  // Assigned items (for by_items split)
  assignedItems: AssignedItem[];

  // Shared items portion
  sharedItemsAmount: number;

  // Totals
  subtotal: number;
  taxAmount: number;
  total: number;

  // Payment
  paymentStatus: 'pending' | 'paid';
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}

interface AssignedItem {
  itemId: string;
  itemName: string;
  amount: number;
  isShared: boolean;
  sharedWith?: string[];         // Guest IDs
}

interface PaymentMethodSplit {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  processedAt?: string;
}

type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'gift_card'
  | 'mobile_payment';
```

---

## Integration with Existing Systems

### Menu Context Integration

```typescript
// Order screen subscribes to menu changes
useEffect(() => {
  const unsubscribe = MenuEventEmitter.subscribe((event) => {
    switch (event.type) {
      case 'ITEM_PRICE_CHANGED':
        // Update cart items if affected
        updateCartItemPrices(event.payload);
        break;
      case 'ITEM_UNAVAILABLE':
        // Show warning for unavailable items in cart
        markCartItemsUnavailable(event.payload.itemIds);
        break;
      case 'MODIFIER_CHANGED':
        // Update affected cart items
        updateCartItemModifiers(event.payload);
        break;
    }
  });

  return unsubscribe;
}, []);
```

### Table Context Integration

```typescript
// On order creation
const createOrder = (table: Table) => {
  // Update table status
  tableContext.updateTableStatus(table.id, 'occupied');
  tableContext.setCurrentOrderId(table.id, newOrder.id);

  // Create order linked to table
  const order = {
    ...newOrder,
    tableId: table.id,
    tableName: table.table_number,
  };

  dispatch({ type: 'SET_CURRENT_ORDER', payload: order });
};

// On order completion/payment
const completeOrder = (orderId: string) => {
  const order = getOrder(orderId);

  // Release table
  tableContext.updateTableStatus(order.tableId, 'available');
  tableContext.setCurrentOrderId(order.tableId, null);
};
```

### Dashboard Integration

```typescript
// Dashboard subscribes to order updates for real-time stats
useEffect(() => {
  const unsubscribe = OrderEventEmitter.subscribe((event) => {
    switch (event.type) {
      case 'ORDER_CREATED':
        incrementActiveOrderCount();
        break;
      case 'ORDER_COMPLETED':
        decrementActiveOrderCount();
        addToRevenue(event.payload.totalAmount);
        break;
      case 'ITEM_ADDED':
        updatePopularItems(event.payload.menuItemId);
        break;
    }
  });

  return unsubscribe;
}, []);
```

---

## Sync Strategy

### Offline-First Approach

```typescript
// All data operations work offline
// Sync queue tracks changes for future API sync

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'order' | 'payment' | 'table_status';
  data: any;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
}

// When online, process sync queue
const processSync = async () => {
  const queue = await getUnsynced();

  for (const item of queue) {
    try {
      await syncToServer(item);
      await markSynced(item.id);
    } catch (error) {
      await incrementAttempt(item.id, error);
    }
  }
};
```

---

## Related Documents

- [Master Plan](./plan.md)
- [User Flow Documentation](./user-flow.md)
- [Wireframes](./wireframes.md)
- [Kitchen Integration](./kitchen-integration.md)
- [Bill Splitting](./bill-splitting.md)
- [Implementation Phases](./implementation-phases.md)
