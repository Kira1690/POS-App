# Order Management System - Master Plan

## Overview

This document outlines the comprehensive plan for implementing a new Order Management System that integrates with the existing Menu Management, Kitchen Management, Table Management, and Payment systems. The new system will replace the legacy order flow with a modern, feature-rich solution.

---

## Project Objectives

### Primary Goals
1. **Seamless Menu Integration**: Connect new Menu Management system (with modifiers, combos, nutritional info) to order creation
2. **Enhanced Order Flow**: Simplified order taking with modifier selection, combo deals, and dietary tag display
3. **Kitchen Ticket Routing**: Route tickets to appropriate kitchen stations based on category (non-veg, desserts, etc.)
4. **Bill Management**: Full bill splitting by people and payment methods
5. **AsyncStorage Persistence**: Offline-capable with sync to future API
6. **Dashboard Integration**: Real-time order stats and analytics

### Secondary Goals
- Real-time order status updates across all screens
- Allergen and dietary warnings throughout flow
- Print KOT (Kitchen Order Ticket) per station
- Order history and search
- Future API integration readiness

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           POS APPLICATION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │    TABLES    │───▶│   ORDERING   │───▶│   KITCHEN    │───▶│  BILLING  │ │
│  │  Management  │    │    Screen    │    │   Display    │    │  Payment  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘ │
│         │                   │                   │                   │       │
│         ▼                   ▼                   ▼                   ▼       │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                     SHARED CONTEXTS & STATE                              │
│  ├──────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│  │ TableContext │ OrderContext │ MenuContext  │KitchenContext│PaymentCtx  │
│  └──────────────┴──────────────┴──────────────┴──────────────┴────────────┤
│         │                   │                   │                   │       │
│         ▼                   ▼                   ▼                   ▼       │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                     STORAGE LAYER (AsyncStorage)                         │
│  ├──────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│  │    Tables    │    Orders    │     Menu     │   Kitchen    │  Payments  │
│  │    Data      │    Data      │     Data     │   Tickets    │   Data     │
│  └──────────────┴──────────────┴──────────────┴──────────────┴────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                     FUTURE: API INTEGRATION LAYER                        │
│  └─────────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Order Creation Flow
- Select table from Table Management
- Browse menu items by category (from Menu Management)
- Select modifiers for each item
- Add combo deals with substitution options
- View dietary tags and allergen warnings
- Add special instructions per item
- Real-time bill calculation with modifier pricing

### 2. Kitchen Ticket System
- Automatic ticket routing by category/station
- Station types: Hot Kitchen, Cold Kitchen, Grill, Desserts, Beverages, Bar
- Color-coded priority system
- Prep time tracking
- Item-level status updates
- Allergen warnings on tickets

### 3. Bill Management
- Itemized bill with modifiers
- Bill splitting by:
  - Equal split among guests
  - Custom split by items
  - Split by payment methods (partial cash + card)
- Tax calculation
- Discount application
- Tip management

### 4. Payment Processing
- Multiple payment methods (Cash, Card, UPI, Split)
- Split payment across methods
- Change calculation for cash
- Receipt printing
- Order completion and table release

---

## Integration Points

### Menu Management Integration
```
Menu Management (Settings)
        │
        ▼
┌───────────────────────┐
│    MenuContext        │
│  - categories         │
│  - menuItems          │
│  - modifierGroups     │
│  - combos             │
│  - dietaryTags        │
└───────────────────────┘
        │
        ▼
Ordering Screen
  - Displays menu items
  - Shows modifiers
  - Handles combos
  - Shows dietary info
```

### Table Management Integration
```
Table Management
        │
        ▼
┌───────────────────────┐
│    TableContext       │
│  - tables[]           │
│  - tableStatus        │
│  - currentOrder       │
└───────────────────────┘
        │
        ▼
Order Creation
  - Links order to table
  - Updates table status
  - Shows table info on order
```

### Kitchen Integration
```
Order Submission
        │
        ▼
┌───────────────────────┐
│  Kitchen Ticket       │
│  Routing Engine       │
│  - by category        │
│  - by station         │
│  - by prep type       │
└───────────────────────┘
        │
        ├──▶ Hot Kitchen Display
        ├──▶ Cold Kitchen Display
        ├──▶ Grill Station Display
        ├──▶ Desserts Display
        └──▶ Beverages/Bar Display
```

### Dashboard Integration
```
Order Events
        │
        ▼
┌───────────────────────┐
│  Dashboard Analytics  │
│  - Active orders      │
│  - Revenue today      │
│  - Popular items      │
│  - Kitchen performance│
│  - Table turnover     │
└───────────────────────┘
```

---

## Data Models

### Core Order Structure
```typescript
interface Order {
  id: string;
  orderNumber: string;           // ORD-YYYYMMDD-XXXX
  restaurantId: string;
  tableId: string;
  tableName: string;

  // Staff
  createdBy: string;
  servedBy?: string;

  // Items
  items: OrderItem[];

  // Financials
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  discountType?: 'percentage' | 'fixed';
  tipAmount: number;
  totalAmount: number;

  // Status
  status: OrderStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
  paidAt?: string;

  // Notes
  specialInstructions?: string;

  // Payment
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  splitPayments?: SplitPayment[];
}
```

### Order Item with Modifiers
```typescript
interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;

  // Item Details
  name: string;
  category: string;
  categoryId: string;

  // Pricing
  basePrice: number;
  quantity: number;
  modifierTotal: number;
  itemTotal: number;

  // Modifiers
  selectedModifiers: SelectedModifier[];

  // Kitchen
  kitchenStation: KitchenStation;
  status: OrderItemStatus;
  prepTime?: number;

  // Dietary
  dietaryTags: string[];
  allergens: string[];

  // Notes
  specialInstructions?: string;

  // Combo
  isComboItem: boolean;
  comboId?: string;
  comboDiscount?: number;
}

interface SelectedModifier {
  modifierGroupId: string;
  modifierGroupName: string;
  optionId: string;
  optionName: string;
  priceAdjustment: number;
  quantity: number;
}
```

### Kitchen Ticket
```typescript
interface KitchenTicket {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber: string;

  // Station
  station: KitchenStation;

  // Items for this station
  items: KitchenTicketItem[];

  // Status
  status: TicketStatus;
  priority: TicketPriority;

  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedPrepTime: number;
  actualPrepTime?: number;

  // Flags
  hasAllergens: boolean;
  isRush: boolean;
  specialInstructions?: string;
}

type KitchenStation =
  | 'hot_kitchen'
  | 'cold_kitchen'
  | 'grill'
  | 'desserts'
  | 'beverages'
  | 'bar';
```

### Bill Split Structure
```typescript
interface BillSplit {
  orderId: string;
  splitType: 'equal' | 'by_items' | 'by_amount' | 'by_payment';

  // For equal split
  numberOfGuests?: number;
  amountPerGuest?: number;

  // For item split
  guestSplits?: GuestSplit[];

  // For payment method split
  paymentSplits?: PaymentSplit[];
}

interface GuestSplit {
  guestId: string;
  guestName: string;
  items: SplitItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
}
```

---

## Screen Structure

### New/Modified Screens

```
src/screens/orders/
├── OrderingScreen.tsx              # NEW: Main order taking screen
├── components/
│   ├── CategorySidebar.tsx         # Category navigation
│   ├── MenuItemGrid.tsx            # Menu items display
│   ├── MenuItemCard.tsx            # Individual menu item
│   ├── OrderCart.tsx               # Current order items
│   ├── CartItemRow.tsx             # Cart item with modifiers
│   ├── OrderSummary.tsx            # Totals and actions
│   └── QuickActions.tsx            # Send to kitchen, print KOT
├── modals/
│   ├── ModifierSelectionModal.tsx  # Select item modifiers
│   ├── ComboSelectionModal.tsx     # Combo deal builder
│   ├── ItemNotesModal.tsx          # Special instructions
│   ├── QuantityModal.tsx           # Quantity adjustment
│   └── DiscountModal.tsx           # Apply discounts

src/screens/orders/management/
├── OrderManagementScreen.tsx       # REFACTOR: View all orders
├── OrderDetailsScreen.tsx          # REFACTOR: Order details
└── components/
    ├── OrderList.tsx               # Order list with filters
    ├── OrderCard.tsx               # Order summary card
    └── OrderTimeline.tsx           # Order status timeline

src/screens/billing/
├── BillScreen.tsx                  # NEW: Bill presentation
├── BillSplitScreen.tsx             # NEW: Split bill interface
├── components/
│   ├── BillItemList.tsx            # Itemized bill
│   ├── BillSummary.tsx             # Totals section
│   ├── SplitByGuests.tsx           # Equal split UI
│   ├── SplitByItems.tsx            # Item assignment UI
│   └── SplitByPayment.tsx          # Payment method split

src/screens/kitchen/
├── KitchenDisplayScreen.tsx        # REFACTOR: Multi-station view
├── StationView.tsx                 # Single station display
├── components/
│   ├── KitchenTicketCard.tsx       # Ticket with modifiers
│   ├── TicketItemRow.tsx           # Item with allergen warnings
│   ├── StationSelector.tsx         # Station filter/tabs
│   └── PrepTimer.tsx               # Countdown timer
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
- OrderContext refactor for new data structure
- AsyncStorage service for orders
- Basic OrderingScreen layout

### Phase 2: Menu Integration (Week 1-2)
- Category sidebar from MenuContext
- Menu item grid with dietary tags
- Modifier selection modal
- Cart with modifier display

### Phase 3: Kitchen Integration (Week 2)
- Kitchen ticket routing engine
- Station-based ticket display
- Item status updates
- Allergen warnings

### Phase 4: Bill & Payment (Week 3)
- Bill presentation screen
- Bill splitting (equal, by items, by payment)
- Payment integration
- Receipt generation

### Phase 5: Polish & Integration (Week 3-4)
- Dashboard integration
- Real-time updates
- Error handling
- Performance optimization

---

## Success Criteria

1. **Functional**: Complete order flow from table selection to payment
2. **Performance**: Order screen renders in < 100ms
3. **Reliability**: Offline-capable with data persistence
4. **Usability**: Max 3 taps to add item with modifiers
5. **Integration**: Seamless connection with all existing systems

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data migration from legacy | Create migration utility, keep legacy as fallback |
| Kitchen routing complexity | Start with simple category mapping, iterate |
| Bill split edge cases | Extensive testing, clear validation messages |
| Performance with large orders | Virtualized lists, memoization, batched updates |

---

## Related Documents

- [User Flow Documentation](./user-flow.md)
- [Wireframes](./wireframes.md)
- [Data Flow Architecture](./data-flow.md)
- [Kitchen Integration](./kitchen-integration.md)
- [Bill Splitting](./bill-splitting.md)
- [Implementation Phases](./implementation-phases.md)
- [Progress Tracking](./progress.md)
