# Unified Order Management System - Architecture

## Current State Analysis (BROKEN)

### Problem: Multiple Competing Systems

```
CURRENT ARCHITECTURE (PROBLEMATIC)
==================================

                    +------------------+
                    |     App.tsx      |
                    +------------------+
                            |
            +---------------+---------------+
            |                               |
    +-------v-------+               +-------v-------+
    | AuthProvider  |               | MenuProvider  |
    +---------------+               +---------------+
            |
    +-------v-----------------+
    | OptimizedAppProviders   |
    +-------------------------+
            |
    +-------v-------+     +------------------+     +-------------------+
    | TableProvider | --> | UnifiedOrder     | --> | EnhancedOrder     |
    +---------------+     | Provider (NEW)   |     | Provider (LEGACY) |
                          +------------------+     +-------------------+
                                  |                         |
                          +-------v-------+         +-------v-------+
                          | BillSplit     |         | Payment       |
                          | Provider      |         | Provider      |
                          +---------------+         +---------------+
                                                            |
                                                    +-------v-------+
                                                    | EnhancedKitchen
                                                    | Provider      |
                                                    +---------------+

PROBLEMS:
---------
1. TWO order contexts active (Unified + Enhanced) - which one is source of truth?
2. THREE storage services (unified, order, kitchen) - data out of sync
3. Events emitted to DIFFERENT event emitters - not connected
4. Kitchen uses LEGACY orderStorageService, not unified
5. BillSplit expects ExtendedOrder, gets UnifiedOrder - type mismatch
6. Clear data clears storage but contexts keep stale state
```

### Legacy Files to DELETE

```
FILES TO DELETE (LEGACY CODE)
=============================

Context Layer:
- src/context/order/OrderContext.tsx          (replaced by UnifiedOrderContext)
- src/context/order/EnhancedOrderContext.tsx  (replaced by UnifiedOrderContext)
- src/context/order/orderReducer.ts           (replaced by unifiedOrderReducer)
- src/context/order/orderActions.ts           (merged into UnifiedOrderContext)
- src/context/order/orderSelectors.ts         (merged into UnifiedOrderContext)
- src/context/orderManagement/                (entire folder - merged)

Storage Layer:
- src/services/storage/OrderStorageService.ts (replaced by UnifiedOrderStorageService)
- src/services/storage/KitchenStorageService.ts (kitchen data embedded in orders)

Events:
- src/services/events/OrderEventEmitter.ts    (replaced by unified event emitter)

Types (partial cleanup):
- src/types/order.types.ts                    (keep for backwards compat, deprecate)
- src/types/kitchen-ticket.types.ts           (kitchen embedded in unified orders)
```

---

## Target Architecture (CLEAN)

```
TARGET ARCHITECTURE (UNIFIED)
=============================

                    +------------------+
                    |     App.tsx      |
                    +------------------+
                            |
                    +-------v----------+
                    |  ThemeProvider   |
                    +------------------+
                            |
                    +-------v----------+
                    |  AuthProvider    |
                    +------------------+
                            |
                    +-------v----------+
                    |  TableProvider   |
                    +------------------+
                            |
    +-------------------+---+---+-------------------+
    |                   |       |                   |
    v                   v       v                   v
+--------+      +-------+-------+-------+      +--------+
| Menu   |      |  UnifiedOrderProvider |      | Payment|
|Provider|      |  (SINGLE SOURCE)      |      |Provider|
+--------+      +-----------------------+      +--------+
                        |
                +-------v-------+
                | NavigationContainer
                +---------------+


KEY PRINCIPLES:
---------------
1. ONE context for orders (UnifiedOrderProvider)
2. ONE storage service (UnifiedOrderStorageService)
3. ONE event emitter (orderEventEmitter from unified-order)
4. Kitchen data EMBEDDED in order items (no separate tickets)
5. Status flow: draft -> confirmed -> preparing -> ready -> served -> paid
```

---

## Data Flow Diagrams

### Order Creation Flow

```
ORDER CREATION FLOW
===================

[POS Screen]
    |
    | 1. User taps menu item
    v
[useUnifiedCart.addItem()]
    |
    | 2. Dispatch ADD_TO_CART
    v
[unifiedOrderReducer]
    |
    | 3. Update cart state, recalculate totals
    v
[UI re-renders with new cart]
    |
    | 4. User taps "Send to Kitchen"
    v
[useUnifiedOrder.submitToKitchen()]
    |
    | 5. Create UnifiedOrder with status='confirmed'
    v
[UnifiedOrderStorageService.saveOrder()]
    |
    | 6. Persist to AsyncStorage + update cache
    v
[orderEventEmitter.emit('ORDER_CREATED')]
    |
    | 7. Kitchen can pick up new orders
    v
[Navigation.goBack()]
```

### Kitchen Status Update Flow

```
KITCHEN STATUS UPDATE FLOW
==========================

[Kitchen Display Screen]
    |
    | 1. Kitchen staff taps "Bump" on order
    v
[useUnifiedOrder.updateOrderStatus(orderId, 'preparing')]
    |
    | 2. Validate status transition (confirmed -> preparing OK)
    v
[unifiedOrderReducer: UPDATE_ORDER_STATUS]
    |
    | 3. Update order.status, set preparingAt timestamp
    v
[UnifiedOrderStorageService.updateOrder()]
    |
    | 4. Persist to storage
    v
[orderEventEmitter.emit('ORDER_STATUS_CHANGED')]
    |
    | 5. Other screens receive update via context
    v
[UI updates across app]
```

### Payment Flow

```
PAYMENT FLOW
============

[Bill Screen]
    |
    | 1. Check order.status === 'served'
    v
[canAcceptPayment(order)] --> false? --> [Show "Order not ready" message]
    |
    | true
    v
[User selects payment method]
    |
    v
[useUnifiedOrder.processPayment(orderId, method)]
    |
    | 2. Validate order.status === 'served'
    v
[unifiedOrderReducer: PROCESS_PAYMENT]
    |
    | 3. Update status='paid', paymentStatus='paid', paidAt
    v
[UnifiedOrderStorageService.updateOrder()]
    |
    v
[orderEventEmitter.emit('ORDER_PAID', { tableId })]
    |
    | 4. TableProvider receives event
    v
[TableProvider: Set table status to AVAILABLE]
    |
    v
[Navigate to success screen]
```

### Clear Data Flow

```
CLEAR DATA FLOW
===============

[Settings Screen]
    |
    | 1. User taps "Clear All Order Data"
    v
[clearAllOrderAndTicketData()]
    |
    | 2. Clear unified storage (both AsyncStorage AND cache)
    v
[unifiedOrderStorageService.clearAll()]
    |
    | 3. Emit reset event
    v
[orderEventEmitter.emit('SYSTEM_RESET')]
    |
    | 4. UnifiedOrderProvider receives event
    v
[dispatch({ type: 'RESET_STATE' })]
    |
    | 5. TableProvider receives event
    v
[refreshTables() - tables show as AVAILABLE]
    |
    | 6. UI updates WITHOUT app restart
    v
[Clean slate - ready for new orders]
```

---

## Status State Machine

```
ORDER STATUS STATE MACHINE
==========================

    +-------+
    | draft |  (Order being built in cart)
    +---+---+
        |
        | [Submit to Kitchen]
        v
  +-----------+
  | confirmed |  (Sent to kitchen, waiting to start)
  +-----+-----+
        |
        | [Kitchen starts preparing]
        v
  +-----------+
  | preparing |  (Kitchen actively working)
  +-----+-----+
        |
        | [All items ready]
        v
    +-------+
    | ready |  (Food ready, waiting for server)
    +---+---+
        |
        | [Server delivers to table]
        v
   +--------+
   | served |  (Customer has food, PAY BUTTON VISIBLE)
   +----+---+
        |
        | [Payment processed]
        v
    +------+
    | paid |  (TERMINAL - Table released)
    +------+

CANCELLATION (from any non-terminal state):
-------------------------------------------
draft/confirmed/preparing/ready/served --> cancelled

RULES:
------
- Only Kitchen can change: confirmed -> preparing -> ready -> served
- Only Payment can change: served -> paid
- Anyone can cancel (with reason)
- paid and cancelled are TERMINAL states
```

---

## File Structure (After Cleanup)

```
src/
├── context/
│   ├── auth/                    # Keep - authentication
│   ├── billing/                 # Keep - bill splitting (update types)
│   ├── menu/                    # Keep - menu data
│   ├── payment/                 # Keep - payment processing
│   ├── table/                   # Keep - table management
│   └── unified-order/           # THE order context
│       ├── index.ts
│       ├── UnifiedOrderContext.tsx
│       └── unifiedOrderReducer.ts
│
├── services/
│   ├── storage/
│   │   ├── index.ts
│   │   ├── UnifiedOrderStorageService.ts  # THE order storage
│   │   ├── MenuStorageService.ts          # Keep
│   │   ├── TableStorageService.ts         # Keep
│   │   ├── PaymentStorageService.ts       # Keep
│   │   └── SyncQueueService.ts            # Keep
│   └── ...
│
├── types/
│   ├── unified-order.types.ts   # THE order types
│   ├── table.types.ts           # Keep
│   ├── menu.types.ts            # Keep
│   └── billing.types.ts         # Keep (update to use unified)
│
└── screens/
    └── orders/
        ├── POSOrderScreen.tsx           # Uses unified context
        ├── OrderManagementScreen.tsx    # Uses unified context
        └── KitchenDisplayScreen.tsx     # Uses unified context (TO UPDATE)
```

---

## Migration Checklist

```
MIGRATION CHECKLIST
===================

Phase 1: Document & Plan
[ ] Create architecture documentation (this file)
[ ] Create cleanup plan
[ ] Create implementation plan
[ ] Review and approve

Phase 2: Delete Legacy Code
[ ] Delete src/context/order/OrderContext.tsx
[ ] Delete src/context/order/EnhancedOrderContext.tsx
[ ] Delete src/context/order/orderReducer.ts
[ ] Delete src/context/order/orderActions.ts
[ ] Delete src/context/order/orderSelectors.ts
[ ] Delete src/context/orderManagement/ folder
[ ] Delete src/services/storage/OrderStorageService.ts
[ ] Delete src/services/storage/KitchenStorageService.ts
[ ] Delete src/services/events/OrderEventEmitter.ts (after migration)

Phase 3: Update Imports
[ ] Update OptimizedAppProviders.tsx - remove legacy providers
[ ] Update all screens to import from unified-order
[ ] Update all hooks to use unified context
[ ] Update storage/index.ts exports

Phase 4: Update KitchenDisplayScreen
[ ] Remove EnhancedKitchenContext usage
[ ] Use UnifiedOrderContext for order data
[ ] Update status changes to go through unified context

Phase 5: Update BillSplitContext
[ ] Accept UnifiedOrder instead of ExtendedOrder
[ ] Update item types to UnifiedOrderItem

Phase 6: Test & Verify
[ ] Test order creation flow
[ ] Test kitchen status updates
[ ] Test payment flow
[ ] Test clear data functionality
[ ] Test table release on payment

Phase 7: Cleanup
[ ] Remove unused imports
[ ] Remove unused types
[ ] Update documentation
[ ] Final type check
```
