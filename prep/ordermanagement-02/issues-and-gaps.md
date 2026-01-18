# Issues and Gaps Analysis - Order Management System

## Issue Tracking Summary

| ID | Severity | Category | Status | Issue |
|----|----------|----------|--------|-------|
| ISS-001 | **CRITICAL** | Order Validation | OPEN | Multiple orders can be placed on same table |
| ISS-002 | **CRITICAL** | Table Status | OPEN | Tables don't mark OCCUPIED when orders placed |
| ISS-003 | **CRITICAL** | Kitchen Integration | OPEN | Kitchen tickets never created from orders |
| ISS-004 | **HIGH** | Table Status | OPEN | Tables don't release on order cancellation |
| ISS-005 | **HIGH** | Data Sources | OPEN | Three conflicting table data sources |
| ISS-006 | **HIGH** | Persistence | OPEN | Table status changes not persisted |
| ISS-007 | **MEDIUM** | Event System | OPEN | Missing event handlers in contexts |
| ISS-008 | **MEDIUM** | Code Quality | OPEN | Unused validation function exists |

---

## ISS-001: Multiple Orders Per Table (CRITICAL)

### Description
Users can place unlimited orders on the same table without any validation or error. This breaks core restaurant POS functionality.

### Severity: CRITICAL
This is a fundamental business logic failure. Real restaurants cannot have multiple active orders on a single table.

### Root Cause
The `submitToKitchen()` function in `UnifiedOrderContext.tsx` does not check for existing active orders before creating a new one.

### Evidence

**File:** `src/context/unified-order/UnifiedOrderContext.tsx`

```typescript
// Lines 371-442
const submitToKitchen = useCallback(async (): Promise<...> => {
  const currentState = stateRef.current;

  // Current validation (INCOMPLETE)
  if (!currentState.selectedTable || currentState.cart.length === 0) {
    return { success: false, error: 'No items in cart or table not selected' };
  }

  // ❌ MISSING: This check should exist but doesn't
  // const existingOrder = getActiveOrderForTable(currentState.selectedTable.id);
  // if (existingOrder) {
  //   return { success: false, error: 'Table has active order' };
  // }

  // Order is created without validation
  const order: UnifiedOrder = { ... };
});
```

### Reproduction Steps
1. Select Table T-1 (status: AVAILABLE)
2. Add items: Burger, Fries
3. Click "Send to Kitchen" → Order #001 created
4. Add items: Soda, Dessert (cart clears but table still selected)
5. Click "Send to Kitchen" → Order #002 created
6. **Result:** Table T-1 has TWO active orders

### Impact
- Billing confusion (which order to bill?)
- Kitchen confusion (multiple tickets for same table)
- Inventory tracking errors
- Revenue reporting inaccurate

### Fix Required

```typescript
// In submitToKitchen(), add before order creation:
const existingOrder = currentState.activeOrders.find(
  (o) => o.tableId === currentState.selectedTable!.id
);

if (existingOrder) {
  return {
    success: false,
    error: `Table already has active order: ${existingOrder.orderNumber}. Please complete or cancel it first.`,
    existingOrderId: existingOrder.id,
  };
}
```

---

## ISS-002: Tables Don't Mark OCCUPIED (CRITICAL)

### Description
When an order is placed on a table, the table status remains "AVAILABLE" instead of changing to "OCCUPIED".

### Severity: CRITICAL
This enables ISS-001 and causes confusion about which tables are in use.

### Root Cause
`TableProvider` does not have an event handler for `ORDER_CREATED` events.

### Evidence

**File:** `src/context/table/TableProvider.tsx`

```typescript
// Lines 120-149: Event subscriptions
useEffect(() => {
  // ✓ ORDER_PAID handler exists
  const unsubscribePaid = orderEventEmitter.on('ORDER_PAID', ...);

  // ✓ SYSTEM_RESET handler exists
  const unsubscribeReset = orderEventEmitter.on('SYSTEM_RESET', ...);

  // ❌ ORDER_CREATED handler MISSING
  // ❌ ORDER_CANCELLED handler MISSING

  return () => {
    unsubscribePaid();
    unsubscribeReset();
  };
}, [updateTableStatus, refreshTables]);
```

**File:** `src/context/unified-order/UnifiedOrderContext.tsx`

```typescript
// Line 430: Event IS emitted correctly
orderEventEmitter.emit('ORDER_CREATED', orderId, {
  orderNumber,
  tableId: order.tableId,
});
```

### Impact
- Tables show as available when they have active orders
- Staff may seat guests at occupied tables
- POS allows multiple orders per table
- Floor plan view is inaccurate

### Fix Required

```typescript
// In TableProvider.tsx useEffect, add:
const unsubscribeOrderCreated = orderEventEmitter.on('ORDER_CREATED', (event) => {
  const tableId = event.data?.tableId as string;
  if (tableId) {
    updateTableStatus(tableId, { status: TableStatus.OCCUPIED })
      .then(() => {
        if (__DEV__) {
          console.log(`[TableProvider] ✅ Table ${tableId} marked OCCUPIED`);
        }
      })
      .catch((error) => {
        console.error(`[TableProvider] ❌ Failed to mark table occupied:`, error);
      });
  }
});

// Don't forget to unsubscribe in cleanup
return () => {
  unsubscribePaid();
  unsubscribeReset();
  unsubscribeOrderCreated(); // Add this
};
```

---

## ISS-003: Kitchen Tickets Never Created (CRITICAL)

### Description
When orders are submitted via `submitToKitchen()`, no kitchen tickets are created. The kitchen display shows empty.

### Severity: CRITICAL
Kitchen staff cannot see orders. No food gets prepared.

### Root Cause
There is no integration between `UnifiedOrderContext` and `EnhancedKitchenContext`. When orders are created:
1. `ORDER_CREATED` event is emitted
2. `EnhancedKitchenContext` does NOT listen for this event
3. No `KitchenTicketRouter` exists to create tickets

### Evidence

**File:** `src/context/kitchen/EnhancedKitchenContext.tsx`

```typescript
// NO event subscription for ORDER_CREATED exists
// The context only manages tickets that already exist
// There is no mechanism to CREATE tickets from orders
```

**Expected but missing file:** `src/services/kitchen/KitchenTicketRouter.ts`

### Impact
- Kitchen display is always empty
- Orders never reach kitchen staff
- No food preparation
- Complete operational failure

### Fix Required

**Option 1: Event-based (Recommended)**

Create a service that listens for ORDER_CREATED and creates tickets:

```typescript
// src/services/kitchen/KitchenTicketCreator.ts
import { orderEventEmitter } from '@/context/unified-order';
import { unifiedOrderStorageService } from '@/services/storage';
import { kitchenStorageService } from '@/services/storage';

export const initializeKitchenTicketCreator = () => {
  orderEventEmitter.on('ORDER_CREATED', async (event) => {
    const orderId = event.orderId;
    const order = await unifiedOrderStorageService.getOrder(orderId);

    if (!order) return;

    // Group items by kitchen station
    const itemsByStation = groupByStation(order.items);

    // Create ticket for each station
    for (const [station, items] of Object.entries(itemsByStation)) {
      const ticket: KitchenTicket = {
        id: `ticket_${orderId}_${station}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        tableId: order.tableId,
        tableName: order.tableName,
        station: station as KitchenStation,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          modifiers: item.modifiers,
          specialInstructions: item.specialInstructions,
        })),
        status: 'pending',
        priority: 'normal',
        createdAt: new Date().toISOString(),
      };

      await kitchenStorageService.saveTicket(ticket);
    }
  });
};
```

**Option 2: Direct integration in submitToKitchen()**

Call ticket creation directly after order is saved.

---

## ISS-004: Tables Don't Release on Cancel (HIGH)

### Description
When an order is cancelled, the table remains in "OCCUPIED" status (if it was ever set).

### Severity: HIGH
Tables get stuck in occupied state, requiring manual intervention.

### Root Cause
`TableProvider` has no handler for `ORDER_CANCELLED` events.

### Evidence

**File:** `src/context/unified-order/UnifiedOrderContext.tsx`

```typescript
// Line 598: Event IS emitted
orderEventEmitter.emit('ORDER_CANCELLED', orderId, {
  reason,
  tableId: order.tableId,
});
```

**File:** `src/context/table/TableProvider.tsx`

```typescript
// No ORDER_CANCELLED handler exists
```

### Fix Required

```typescript
// In TableProvider.tsx, add:
const unsubscribeOrderCancelled = orderEventEmitter.on('ORDER_CANCELLED', (event) => {
  const tableId = event.data?.tableId as string;
  if (tableId) {
    // Check if table has other active orders before releasing
    const otherActiveOrders = await checkOtherActiveOrders(tableId, event.orderId);

    if (otherActiveOrders.length === 0) {
      updateTableStatus(tableId, { status: TableStatus.AVAILABLE });
    }
  }
});
```

---

## ISS-005: Three Table Data Sources (HIGH)

### Description
Table data comes from three different sources, causing inconsistency:

1. **MOCK_TABLES** (`src/data/tables/mockTables.ts`) - 30 tables
2. **FixedMockTableApiClient** (`src/services/api/table/`) - 12 tables
3. **TableStorageService** (`src/services/storage/`) - Seeds from MOCK_TABLES

### Severity: HIGH
Different screens show different tables. Data is inconsistent.

### Evidence

**POSOrderScreen uses:**
```typescript
// Via TableServiceClass which uses FixedMockTableApiClient
const tables = await tableService.getTables(restaurantId);
// Returns: T1, T2, ... T12 (12 tables)
```

**Settings > Table Management uses:**
```typescript
// Via TableStorageService
const tables = await tableStorageService.getTablesByRestaurant(restaurantId);
// Returns: T-1, T-2, ... (30 tables from MOCK_TABLES seed)
```

**Dashboard uses:**
```typescript
// Direct import
import { MOCK_TABLES } from '@/data/tables/mockTables';
// Returns: 30 tables
```

### Impact
- POS shows 12 tables
- Settings shows 30 tables
- Floor plan shows 30 tables
- Confusing user experience

### Fix Required

Unify all table access through TableStorageService:

```typescript
// Update TableServiceClass to use storage
class TableServiceClass implements ITableService {
  async getTables(restaurantId: string): Promise<Table[]> {
    // Use storage service instead of mock API
    return tableStorageService.getTablesByRestaurant(restaurantId);
  }
}
```

---

## ISS-006: Table Status Not Persisted (HIGH)

### Description
When table status is updated (manually or via events), the change is not persisted to storage. Status is lost on app restart.

### Severity: HIGH
Table status resets every time app is restarted.

### Evidence

**File:** `src/context/table/TableActions.ts`

```typescript
const updateTableStatus = async (tableId: string, updateData: UpdateTableStatusRequest) => {
  // Updates via service (which is mocked)
  const updatedTable = await tableService.updateTableStatus(tableId, updateData);

  // Updates local state
  dispatch({ type: 'TABLE_UPDATE', payload: updatedTable });

  // ❌ MISSING: Persist to storage
  // await tableStorageService.updateTable(updatedTable);
};
```

### Fix Required

```typescript
const updateTableStatus = async (tableId: string, updateData: UpdateTableStatusRequest) => {
  const updatedTable = await tableService.updateTableStatus(tableId, updateData);

  // Persist to storage
  await tableStorageService.updateTable(updatedTable);

  dispatch({ type: 'TABLE_UPDATE', payload: updatedTable });
};
```

---

## ISS-007: Missing Event Handlers (MEDIUM)

### Description
Several important events are emitted but not handled by relevant contexts.

### Event Coverage Matrix

| Event | Emitted By | TableProvider | KitchenContext | UnifiedOrder |
|-------|------------|---------------|----------------|--------------|
| ORDER_CREATED | UnifiedOrder | ❌ MISSING | ❌ MISSING | N/A |
| ORDER_STATUS_CHANGED | Kitchen | N/A | N/A | ✅ Handles |
| ORDER_PAID | UnifiedOrder | ✅ Handles | N/A | N/A |
| ORDER_CANCELLED | UnifiedOrder | ❌ MISSING | N/A | N/A |
| SYSTEM_RESET | clearData | ✅ Handles | N/A | ✅ Handles |

### Fix Required

Add missing handlers to TableProvider and EnhancedKitchenContext.

---

## ISS-008: Unused Validation Function (MEDIUM)

### Description
`getActiveOrderForTable()` exists in `UnifiedOrderContext` but is never called during order submission.

### Severity: MEDIUM
Code exists but isn't used, indicating incomplete implementation.

### Evidence

```typescript
// Line 574-579: Function exists
const getActiveOrderForTable = useCallback(
  (tableId: string): UnifiedOrder | undefined => {
    return state.activeOrders.find((o) => o.tableId === tableId);
  },
  [state.activeOrders]
);

// Line 371-442: submitToKitchen() doesn't use it
const submitToKitchen = useCallback(async () => {
  // ... no call to getActiveOrderForTable()
});
```

### Fix Required

Call `getActiveOrderForTable()` in `submitToKitchen()` for validation.

---

## Priority Matrix

```
                    IMPACT
           Low    Medium    High
         ┌────────┬────────┬────────┐
    Low  │        │        │ ISS-008│
         ├────────┼────────┼────────┤
  EFFORT │        │ ISS-007│ ISS-005│
  Medium │        │        │ ISS-006│
         ├────────┼────────┼────────┤
   High  │        │        │ ISS-003│
         │        │        │ ISS-004│
         └────────┴────────┴────────┘

Quick Wins (Low Effort, High Impact):
- ISS-001: Add validation check (1 line + error handling)
- ISS-002: Add ORDER_CREATED handler (10 lines)

Must Do (High Impact):
- ISS-003: Kitchen ticket creation (new service)
- ISS-005: Unify table data source
```

---

## Recommended Fix Order

### Phase 1: Critical Fixes (Day 1)

1. **ISS-001** - Add order validation in `submitToKitchen()`
2. **ISS-002** - Add `ORDER_CREATED` handler to TableProvider
3. **ISS-004** - Add `ORDER_CANCELLED` handler to TableProvider

### Phase 2: Kitchen Integration (Day 2-3)

4. **ISS-003** - Create KitchenTicketCreator service
   - Create ticket routing logic
   - Subscribe to ORDER_CREATED
   - Test end-to-end flow

### Phase 3: Data Unification (Day 4)

5. **ISS-005** - Unify table data sources
   - Update TableServiceClass to use storage
   - Remove FixedMockTableApiClient dependency
   - Update all screens to use consistent source

6. **ISS-006** - Persist table status
   - Update TableActions to save to storage
   - Test persistence across app restarts

### Phase 4: Cleanup (Day 5)

7. **ISS-007** - Review all event handlers
8. **ISS-008** - Use existing validation function

---

## Testing Checklist

After fixes are applied:

- [ ] Cannot place multiple orders on same table
- [ ] Table marks OCCUPIED when order placed
- [ ] Table marks AVAILABLE when order paid
- [ ] Table marks AVAILABLE when order cancelled
- [ ] Kitchen display shows tickets after order submission
- [ ] Kitchen status updates propagate to order
- [ ] All screens show same tables
- [ ] Table status persists after app restart
- [ ] Clear data resets all state correctly
