# Data Flow Analysis - Order Management System

## Overview

This document traces the complete data flow through the system, identifying where flows are broken and what should happen vs what actually happens.

---

## Flow 1: Order Creation (BROKEN)

### Expected Flow

```mermaid
flowchart TD
    subgraph User["User Actions"]
        U1["Select Table"] --> U2["Add Items to Cart"]
        U2 --> U3["Send to Kitchen"]
    end

    subgraph Validation["Validation Layer"]
        V1{"Table has<br/>active order?"}
        V2{"Cart has items?"}
        V3{"Table selected?"}
    end

    subgraph OrderCreation["Order Creation"]
        O1["Generate Order ID"]
        O2["Create UnifiedOrder"]
        O3["Save to Storage"]
        O4["Update Context State"]
        O5["Emit ORDER_CREATED"]
    end

    subgraph TableUpdate["Table Update"]
        T1["Receive ORDER_CREATED"]
        T2["Mark Table OCCUPIED"]
        T3["Persist Status"]
    end

    subgraph KitchenUpdate["Kitchen Update"]
        K1["Receive ORDER_CREATED"]
        K2["Route Items by Station"]
        K3["Create Kitchen Tickets"]
        K4["Save to KitchenStorage"]
    end

    U3 --> V1
    V1 -->|"Yes"| ERROR["Error: Table occupied"]
    V1 -->|"No"| V2
    V2 -->|"No"| ERROR2["Error: Cart empty"]
    V2 -->|"Yes"| V3
    V3 -->|"No"| ERROR3["Error: No table"]
    V3 -->|"Yes"| O1

    O1 --> O2 --> O3 --> O4 --> O5

    O5 --> T1 --> T2 --> T3
    O5 --> K1 --> K2 --> K3 --> K4

    style Validation fill:#90EE90
    style TableUpdate fill:#90EE90
    style KitchenUpdate fill:#90EE90
```

### Actual Flow (BROKEN)

```mermaid
flowchart TD
    subgraph User["User Actions"]
        U1["Select Table"] --> U2["Add Items to Cart"]
        U2 --> U3["Send to Kitchen"]
    end

    subgraph Validation["Validation Layer (INCOMPLETE)"]
        V2{"Cart has items?"}
        V3{"Table selected?"}
    end

    subgraph OrderCreation["Order Creation"]
        O1["Generate Order ID"]
        O2["Create UnifiedOrder"]
        O3["Save to Storage"]
        O4["Update Context State"]
        O5["Emit ORDER_CREATED"]
    end

    subgraph TableUpdate["Table Update (MISSING)"]
        T1["NO HANDLER"]
        T2["Table stays AVAILABLE"]
    end

    subgraph KitchenUpdate["Kitchen Update (MISSING)"]
        K1["NO HANDLER"]
        K2["No tickets created"]
    end

    U3 --> V2
    V2 -->|"No"| ERROR2["Error: Cart empty"]
    V2 -->|"Yes"| V3
    V3 -->|"No"| ERROR3["Error: No table"]
    V3 -->|"Yes"| O1

    O1 --> O2 --> O3 --> O4 --> O5

    O5 -.->|"IGNORED"| T1 --> T2
    O5 -.->|"IGNORED"| K1 --> K2

    style Validation fill:#FFB6C1
    style TableUpdate fill:#FFB6C1
    style KitchenUpdate fill:#FFB6C1
    style T1 fill:#FF6B6B
    style K1 fill:#FF6B6B
```

### Code Trace

**File:** `src/context/unified-order/UnifiedOrderContext.tsx`

```typescript
// Line 371-442: submitToKitchen()
const submitToKitchen = useCallback(async (): Promise<...> => {
  const currentState = stateRef.current;

  // VALIDATION (INCOMPLETE)
  if (!currentState.selectedTable || currentState.cart.length === 0) {
    return { success: false, error: 'No items in cart or table not selected' };
  }

  // ❌ MISSING: Check for existing active order on this table
  // const existingOrder = currentState.activeOrders.find(
  //   o => o.tableId === currentState.selectedTable!.id
  // );
  // if (existingOrder) {
  //   return { success: false, error: 'Table already has active order' };
  // }

  // Create order (no validation)
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const orderNumber = generateOrderNumber();

  const order: UnifiedOrder = {
    id: orderId,
    orderNumber,
    tableId: currentState.selectedTable.id,  // ← No validation!
    // ... rest of order
  };

  await unifiedOrderStorageService.saveOrder(order);
  dispatch({ type: 'ADD_ORDER', payload: order });

  // Emit event - but no one handles it properly
  orderEventEmitter.emit('ORDER_CREATED', orderId, {
    orderNumber,
    tableId: order.tableId,
  });

  return { success: true, orderId, orderNumber };
}, []);
```

**File:** `src/context/table/TableProvider.tsx`

```typescript
// Line 120-149: Event subscriptions
useEffect(() => {
  // ✓ ORDER_PAID handler exists
  const unsubscribePaid = orderEventEmitter.on('ORDER_PAID', (event) => {
    // Handle table release
  });

  // ✓ SYSTEM_RESET handler exists
  const unsubscribeReset = orderEventEmitter.on('SYSTEM_RESET', () => {
    // Refresh tables
  });

  // ❌ ORDER_CREATED handler MISSING
  // ❌ ORDER_CANCELLED handler MISSING

  return () => {
    unsubscribePaid();
    unsubscribeReset();
  };
}, [updateTableStatus, refreshTables]);
```

---

## Flow 2: Table Status Management (BROKEN)

### Table Status State Machine

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE: Initial State

    state "Expected Transitions" as expected {
        AVAILABLE --> OCCUPIED: Order Created
        AVAILABLE --> RESERVED: Reservation Made
        RESERVED --> OCCUPIED: Guest Seated
        OCCUPIED --> AVAILABLE: Payment Complete
        OCCUPIED --> AVAILABLE: Order Cancelled
        RESERVED --> AVAILABLE: Reservation Cancelled
    }

    state "Actual Transitions (BROKEN)" as actual {
        AVAILABLE --> AVAILABLE: Order Created (NO CHANGE!)
        OCCUPIED --> AVAILABLE: Payment Complete (Works)
        OCCUPIED --> OCCUPIED: Order Cancelled (NO CHANGE!)
    }
```

### Table Update Flow

```mermaid
sequenceDiagram
    participant Order as Order Created
    participant Event as orderEventEmitter
    participant Table as TableProvider
    participant Storage as TableStorageService
    participant API as TableServiceClass

    Note over Order,API: EXPECTED FLOW
    Order->>Event: emit('ORDER_CREATED', {tableId})
    Event->>Table: ORDER_CREATED handler
    Table->>API: updateTableStatus(id, OCCUPIED)
    API->>Storage: persist status
    Storage-->>Table: updated table
    Table->>Table: dispatch TABLE_UPDATE

    Note over Order,API: ACTUAL FLOW (BROKEN)
    Order->>Event: emit('ORDER_CREATED', {tableId})
    Event--xTable: NO HANDLER EXISTS
    Note over Table: Table status unchanged!
```

### Multiple Data Sources Problem

```mermaid
graph TB
    subgraph Sources["THREE Conflicting Sources"]
        M["MOCK_TABLES<br/>(src/data/tables/mockTables.ts)"]
        A["FixedMockTableApiClient<br/>(src/services/api/table/)"]
        S["TableStorageService<br/>(src/services/storage/)"]
    end

    subgraph MockData["MOCK_TABLES Content"]
        M1["30 tables total"]
        M2["4 areas: Main, VIP, Patio, Bar"]
        M3["All status: 'available'"]
        M4["With floor plan positions"]
    end

    subgraph ApiData["FixedMockTableApiClient Content"]
        A1["12 generic tables"]
        A2["T1 through T12"]
        A3["Generic capacity 4"]
        A4["No floor plan data"]
    end

    subgraph StorageData["TableStorageService Content"]
        S1["Seeds from MOCK_TABLES"]
        S2["Persists to AsyncStorage"]
        S3["Has cache layer"]
        S4["Not consistently used"]
    end

    M --> MockData
    A --> ApiData
    S --> StorageData

    subgraph Usage["Screen Usage"]
        POS["POSOrderScreen<br/>Uses: API Client<br/>Sees: 12 tables"]
        SET["Settings > Tables<br/>Uses: Storage Service<br/>Sees: 30 tables"]
        DASH["Dashboard<br/>Uses: MOCK_TABLES<br/>Sees: 30 tables"]
    end

    ApiData --> POS
    StorageData --> SET
    MockData --> DASH

    style M fill:#FFB6C1
    style A fill:#FFB6C1
    style S fill:#FFB6C1
```

---

## Flow 3: Kitchen Ticket Creation (MISSING)

### Expected Kitchen Flow

```mermaid
flowchart TD
    subgraph OrderSubmit["Order Submission"]
        O1["Order Confirmed"]
        O2["Items with Stations"]
    end

    subgraph Routing["Ticket Routing"]
        R1["KitchenTicketRouter"]
        R2["Group by Station"]
    end

    subgraph Tickets["Ticket Creation"]
        T1["Grill Ticket<br/>Burgers, Steaks"]
        T2["Fry Ticket<br/>Fries, Wings"]
        T3["Salad Ticket<br/>Salads, Starters"]
        T4["Drink Ticket<br/>Beverages"]
    end

    subgraph Storage["Persistence"]
        S1["KitchenStorageService"]
        S2["saveTicket() x N"]
    end

    subgraph Display["Kitchen Display"]
        D1["EnhancedKitchenContext"]
        D2["loadTickets()"]
        D3["Display by Station"]
    end

    O1 --> O2 --> R1 --> R2
    R2 --> T1 & T2 & T3 & T4
    T1 & T2 & T3 & T4 --> S1 --> S2
    S2 --> D1 --> D2 --> D3
```

### Actual Kitchen Flow (BROKEN)

```mermaid
flowchart TD
    subgraph OrderSubmit["Order Submission"]
        O1["Order Confirmed"]
        O2["Saved to UnifiedOrderStorage"]
    end

    subgraph Missing["MISSING COMPONENTS"]
        M1["NO KitchenTicketRouter"]
        M2["NO Ticket Creation"]
        M3["NO Station Routing"]
    end

    subgraph Display["Kitchen Display"]
        D1["EnhancedKitchenContext"]
        D2["loadTickets()"]
        D3["EMPTY - No tickets exist!"]
    end

    O1 --> O2
    O2 -.->|"NO CONNECTION"| M1
    M1 -.-> M2 -.-> M3

    D1 --> D2 --> D3

    style M1 fill:#FF6B6B
    style M2 fill:#FF6B6B
    style M3 fill:#FF6B6B
    style D3 fill:#FFB6C1
```

### Kitchen Data Model

```mermaid
erDiagram
    UnifiedOrder ||--o{ UnifiedOrderItem : contains
    UnifiedOrder {
        string id PK
        string orderNumber
        string tableId FK
        string status
        datetime createdAt
    }
    UnifiedOrderItem {
        string id PK
        string menuItemId FK
        string name
        number quantity
        string kitchenStation
        string itemStatus
    }

    KitchenTicket ||--o{ TicketItem : contains
    KitchenTicket {
        string id PK
        string orderId FK
        string station
        string status
        number priority
        datetime createdAt
    }
    TicketItem {
        string id PK
        string name
        number quantity
        string specialInstructions
    }

    UnifiedOrder ||..o{ KitchenTicket : "SHOULD create but DOESN'T"
```

---

## Flow 4: Payment Processing (WORKING)

### Payment Flow

```mermaid
flowchart TD
    subgraph Precondition["Precondition"]
        P1{"Order status<br/>= 'served'?"}
    end

    subgraph Payment["Payment Processing"]
        PAY1["Process Payment"]
        PAY2["Update Order Status → 'paid'"]
        PAY3["Save to Storage"]
        PAY4["Emit ORDER_PAID"]
    end

    subgraph TableRelease["Table Release"]
        T1["TableProvider receives event"]
        T2["updateTableStatus(tableId, AVAILABLE)"]
        T3["Dispatch TABLE_UPDATE"]
    end

    P1 -->|"No"| ERROR["Cannot process payment<br/>Order must be served first"]
    P1 -->|"Yes"| PAY1

    PAY1 --> PAY2 --> PAY3 --> PAY4
    PAY4 --> T1 --> T2 --> T3

    style Payment fill:#90EE90
    style TableRelease fill:#90EE90
```

### Payment Code Trace

**File:** `src/context/unified-order/UnifiedOrderContext.tsx`

```typescript
// Line 528-570: processPayment()
const processPayment = useCallback(
  async (orderId: string, paymentMethod: string): Promise<...> => {
    const order = state.orders.find((o) => o.id === orderId);

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // ✓ CORRECT: Validate order is served
    if (order.status !== 'served') {
      return { success: false, error: 'Order must be served before payment' };
    }

    // Update to paid
    const updatedOrder = {
      ...order,
      status: 'paid' as UnifiedOrderStatus,
      paymentMethod,
      paidAt: new Date().toISOString(),
    };

    await unifiedOrderStorageService.updateOrder(orderId, updatedOrder);
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status: 'paid' } });

    // ✓ CORRECT: Emit event with tableId
    orderEventEmitter.emit('ORDER_PAID', orderId, {
      tableId: order.tableId,
      method: paymentMethod,
      amount: order.totalAmount,
    });

    return { success: true };
  },
  [state.orders]
);
```

**File:** `src/context/table/TableProvider.tsx`

```typescript
// Line 125-135: ORDER_PAID handler (WORKING)
const unsubscribePaid = orderEventEmitter.on('ORDER_PAID', (event) => {
  const tableId = event.data?.tableId as string;
  if (tableId) {
    updateTableStatus(tableId, { status: TableStatus.AVAILABLE })
      .then(() => {
        if (__DEV__) {
          console.log(`[TableProvider] ✅ Table ${tableId} set to AVAILABLE after payment`);
        }
      })
      .catch((error) => {
        console.error(`[TableProvider] ❌ Failed to release table ${tableId}:`, error);
      });
  }
});
```

---

## Flow 5: Kitchen → Order Status Sync (WORKING)

### Kitchen Status Update Flow

```mermaid
flowchart TD
    subgraph Kitchen["Kitchen Action"]
        K1["Chef updates ticket status"]
        K2["e.g., 'pending' → 'preparing'"]
    end

    subgraph Context["EnhancedKitchenContext"]
        C1["updateTicketStatus()"]
        C2["Update KitchenStorageService"]
        C3["Get all tickets for order"]
        C4["Calculate new order status"]
    end

    subgraph OrderSync["Order Sync"]
        O1["Update OrderStorageService"]
        O2["Emit ORDER_STATUS_CHANGED"]
    end

    subgraph OrderContext["UnifiedOrderContext"]
        UC1["Receive event"]
        UC2["Map status to unified"]
        UC3["Dispatch UPDATE_ORDER_STATUS"]
    end

    K1 --> K2 --> C1 --> C2 --> C3 --> C4
    C4 --> O1 --> O2 --> UC1 --> UC2 --> UC3

    style Kitchen fill:#90EE90
    style Context fill:#90EE90
    style OrderSync fill:#90EE90
    style OrderContext fill:#90EE90
```

### Status Aggregation Logic

```mermaid
flowchart TD
    subgraph Tickets["Order's Kitchen Tickets"]
        T1["Grill Ticket: preparing"]
        T2["Fry Ticket: ready"]
        T3["Drink Ticket: served"]
    end

    subgraph Logic["Aggregation Logic"]
        L1{"All served?"}
        L2{"All ready or served?"}
        L3{"Any preparing?"}
        L4["Default: pending"]
    end

    subgraph Result["Order Status"]
        R1["completed (served)"]
        R2["ready"]
        R3["preparing"]
        R4["confirmed (pending)"]
    end

    Tickets --> L1
    L1 -->|"Yes"| R1
    L1 -->|"No"| L2
    L2 -->|"Yes"| R2
    L2 -->|"No"| L3
    L3 -->|"Yes"| R3
    L3 -->|"No"| L4 --> R4
```

---

## Flow 6: Clear All Data (WORKING)

### Clear Data Flow

```mermaid
flowchart TD
    subgraph Trigger["User Action"]
        U1["Settings > Clear All Data"]
    end

    subgraph Clear["clearAllOrderAndTicketData()"]
        C1["unifiedOrderStorageService.clearAll()"]
        C2["paymentStorageService.clearAll()"]
        C3["Emit SYSTEM_RESET"]
    end

    subgraph UnifiedOrder["UnifiedOrderContext"]
        UO1["Receive SYSTEM_RESET"]
        UO2["Dispatch RESET_STATE"]
        UO3["Clear all state arrays"]
    end

    subgraph Table["TableProvider"]
        T1["Receive SYSTEM_RESET"]
        T2["refreshTables()"]
        T3["Reload from API"]
    end

    U1 --> C1 --> C2 --> C3
    C3 --> UO1 --> UO2 --> UO3
    C3 --> T1 --> T2 --> T3

    style Clear fill:#90EE90
    style UnifiedOrder fill:#90EE90
    style Table fill:#90EE90
```

---

## Summary: Flow Status

| Flow | Status | Issue |
|------|--------|-------|
| Order Creation | **BROKEN** | No validation, no table update, no kitchen tickets |
| Table Status Update | **BROKEN** | No ORDER_CREATED handler, no ORDER_CANCELLED handler |
| Kitchen Ticket Creation | **MISSING** | No integration exists |
| Payment Processing | **WORKING** | Correctly releases table |
| Kitchen → Order Sync | **WORKING** | Status propagates correctly |
| Clear All Data | **WORKING** | Resets all state |

### Critical Path Failures

```mermaid
graph LR
    subgraph Working["Working Flows"]
        W1["Payment → Table Release"]
        W2["Kitchen → Order Status"]
        W3["Clear Data"]
    end

    subgraph Broken["Broken Flows"]
        B1["Order → Table OCCUPIED"]
        B2["Order → Kitchen Tickets"]
        B3["Cancel → Table AVAILABLE"]
        B4["Order Validation"]
    end

    style Working fill:#90EE90
    style Broken fill:#FF6B6B
```
