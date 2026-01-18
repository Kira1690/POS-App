# Current Architecture Analysis - Order Management System

## Status: BROKEN - Critical Integration Gaps Identified

---

## Executive Summary

The system has **three separate but interdependent systems** that operate in **data silos** with broken synchronization:

| System | Context | Storage | Status |
|--------|---------|---------|--------|
| Order Management | UnifiedOrderContext | UnifiedOrderStorageService | Partially Working |
| Table Management | TableProvider | TableStorageService + MockAPI | BROKEN |
| Kitchen Operations | EnhancedKitchenContext | KitchenStorageService | DISCONNECTED |

**Critical Failures:**
- Users CAN place multiple orders on the same table
- Tables DON'T mark as OCCUPIED when orders are placed
- Kitchen tickets are NEVER created from orders
- Table status changes are NOT persisted

---

## System Architecture Overview

### Current Provider Hierarchy

```mermaid
graph TB
    subgraph App["App.tsx"]
        OAP["OptimizedAppProviders"]
    end

    subgraph Providers["Provider Chain"]
        AUTH["AuthProvider"]
        TABLE["TableProvider"]
        UNIFIED["UnifiedOrderProvider"]
        BILL["BillSplitProvider"]
        PAYMENT["PaymentProvider"]
        KITCHEN["EnhancedKitchenProvider"]
    end

    OAP --> AUTH
    AUTH --> TABLE
    TABLE --> UNIFIED
    UNIFIED --> BILL
    BILL --> PAYMENT
    PAYMENT --> KITCHEN

    style UNIFIED fill:#90EE90
    style TABLE fill:#FFB6C1
    style KITCHEN fill:#FFB6C1
```

### Data Storage Architecture (FRAGMENTED)

```mermaid
graph LR
    subgraph Storage["AsyncStorage Keys"]
        OS["@unified_orders"]
        TS["@table_data"]
        KS["@kitchen_tickets"]
        PS["@payment_records"]
    end

    subgraph Services["Storage Services"]
        UOS["UnifiedOrderStorageService"]
        TSS["TableStorageService"]
        KSS["KitchenStorageService"]
        PSS["PaymentStorageService"]
    end

    subgraph Contexts["Contexts"]
        UC["UnifiedOrderContext"]
        TC["TableProvider"]
        KC["EnhancedKitchenContext"]
    end

    UC --> UOS --> OS
    TC --> TSS --> TS
    KC --> KSS --> KS

    UC -.->|"NO LINK"| KC
    UC -.->|"PARTIAL"| TC

    style UC fill:#90EE90
    style TC fill:#FFB6C1
    style KC fill:#FFB6C1
```

---

## Component Deep Dive

### 1. UnifiedOrderContext (Primary Order System)

**Location:** `src/context/unified-order/UnifiedOrderContext.tsx`

```mermaid
stateDiagram-v2
    [*] --> draft: Create Order
    draft --> confirmed: submitToKitchen()
    confirmed --> preparing: Kitchen Updates
    preparing --> ready: Kitchen Updates
    ready --> served: Kitchen Updates
    served --> paid: processPayment()
    paid --> [*]

    confirmed --> cancelled: cancelOrder()
    preparing --> cancelled: cancelOrder()
    cancelled --> [*]
```

**State Structure:**
```typescript
interface UnifiedOrderState {
  currentOrder: UnifiedOrder | null;
  selectedTable: Table | null;
  cart: CartItem[];
  orders: UnifiedOrder[];
  activeOrders: UnifiedOrder[];      // Status NOT in ['paid', 'cancelled']
  filteredOrders: UnifiedOrder[];
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Key Actions:**
| Action | What It Does | What's MISSING |
|--------|--------------|----------------|
| `submitToKitchen()` | Creates order, saves to storage | NO validation for existing orders on table |
| `updateOrderStatus()` | Updates order status | Works correctly |
| `processPayment()` | Marks paid, emits ORDER_PAID | Works correctly |
| `cancelOrder()` | Marks cancelled, emits ORDER_CANCELLED | Works correctly |
| `getActiveOrderForTable()` | Returns active order for table | EXISTS but NEVER CALLED |

### 2. TableProvider (Table Management)

**Location:** `src/context/table/TableProvider.tsx`

```mermaid
graph TB
    subgraph Sources["THREE Table Data Sources"]
        MOCK["MOCK_TABLES<br/>src/data/tables/mockTables.ts<br/>30 tables, all 'available'"]
        API["FixedMockTableApiClient<br/>12 generic tables T1-T12"]
        STORAGE["TableStorageService<br/>Seeds from MOCK_TABLES"]
    end

    subgraph Usage["Which Screens Use What"]
        POS["POSOrderScreen"] --> API
        SETTINGS["TableManagementSettings"] --> STORAGE
        DASHBOARD["DashboardFloorPlan"] --> MOCK
    end

    style MOCK fill:#FFB6C1
    style API fill:#FFB6C1
    style STORAGE fill:#FFB6C1
```

**Event Subscriptions:**
```mermaid
graph LR
    subgraph Events["orderEventEmitter Events"]
        E1["ORDER_CREATED"]
        E2["ORDER_PAID"]
        E3["ORDER_CANCELLED"]
        E4["SYSTEM_RESET"]
    end

    subgraph TableProvider["TableProvider Handlers"]
        H2["Handler: Mark AVAILABLE"]
        H4["Handler: Refresh Tables"]
    end

    E1 -.->|"NO HANDLER"| X1["Table stays AVAILABLE"]
    E2 --> H2
    E3 -.->|"NO HANDLER"| X3["Table stays OCCUPIED"]
    E4 --> H4

    style E1 fill:#FFB6C1
    style E3 fill:#FFB6C1
    style X1 fill:#FFB6C1
    style X3 fill:#FFB6C1
```

### 3. EnhancedKitchenContext (Kitchen Operations)

**Location:** `src/context/kitchen/EnhancedKitchenContext.tsx`

```mermaid
graph TB
    subgraph Kitchen["EnhancedKitchenContext"]
        STATE["State: tickets[], selectedStation"]
        STORAGE["KitchenStorageService"]
        ACTIONS["updateTicketStatus(), bumpTicket()"]
    end

    subgraph Sync["Kitchen → Order Sync"]
        direction LR
        TICKET["Ticket Status Change"]
        CALC["Calculate Order Status"]
        UPDATE["Update Order Storage"]
        EMIT["Emit ORDER_STATUS_CHANGED"]
    end

    ACTIONS --> TICKET --> CALC --> UPDATE --> EMIT

    subgraph Missing["MISSING: Order → Kitchen Sync"]
        ORDER["Order Created"]
        CREATE["Create Kitchen Tickets"]
    end

    ORDER -.->|"NEVER HAPPENS"| CREATE

    style Missing fill:#FFB6C1
```

---

## Event System Architecture

### Event Flow Diagram

```mermaid
sequenceDiagram
    participant POS as POSOrderScreen
    participant UOC as UnifiedOrderContext
    participant EE as orderEventEmitter
    participant TP as TableProvider
    participant KC as EnhancedKitchenContext

    Note over POS,KC: ORDER CREATION FLOW (BROKEN)

    POS->>UOC: submitToKitchen()
    Note right of UOC: NO validation for<br/>existing orders!
    UOC->>UOC: Create UnifiedOrder
    UOC->>EE: emit('ORDER_CREATED')

    EE-->>TP: ORDER_CREATED event
    Note right of TP: NO HANDLER!<br/>Table stays AVAILABLE

    EE-->>KC: ORDER_CREATED event
    Note right of KC: NO HANDLER!<br/>No tickets created

    Note over POS,KC: PAYMENT FLOW (WORKING)

    POS->>UOC: processPayment()
    UOC->>EE: emit('ORDER_PAID')
    EE->>TP: ORDER_PAID event
    TP->>TP: Mark table AVAILABLE ✓
```

### Event Types and Handlers

```mermaid
graph TB
    subgraph Events["Events Emitted"]
        OC["ORDER_CREATED"]
        OSC["ORDER_STATUS_CHANGED"]
        OP["ORDER_PAID"]
        OCAN["ORDER_CANCELLED"]
        SR["SYSTEM_RESET"]
    end

    subgraph Handlers["Event Handlers"]
        subgraph TP["TableProvider"]
            TPH1["✓ ORDER_PAID → AVAILABLE"]
            TPH2["✓ SYSTEM_RESET → Refresh"]
        end

        subgraph UOC["UnifiedOrderContext"]
            UOCH1["✓ ORDER_STATUS_CHANGED"]
            UOCH2["✓ SYSTEM_RESET → Reset State"]
        end

        subgraph KC["EnhancedKitchenContext"]
            KCH1["(none)"]
        end
    end

    OC -.->|"MISSING"| TP
    OC -.->|"MISSING"| KC
    OSC --> UOCH1
    OP --> TPH1
    OCAN -.->|"MISSING"| TP
    SR --> TPH2
    SR --> UOCH2

    style OC fill:#FFB6C1
    style OCAN fill:#FFB6C1
    style KCH1 fill:#FFB6C1
```

---

## Data Flow Analysis

### Order Creation Flow (CURRENT - BROKEN)

```mermaid
flowchart TD
    A[User: Select Table T-1] --> B[User: Add Items to Cart]
    B --> C[User: Click 'Send to Kitchen']
    C --> D{submitToKitchen}

    D --> E{Validation}
    E -->|"Only checks"| F["Cart empty?<br/>Table selected?"]
    F -->|Pass| G[Create UnifiedOrder]

    E -.->|"MISSING CHECK"| H["Active order on table?"]
    H -.->|"NEVER CALLED"| I[getActiveOrderForTable]

    G --> J[Save to UnifiedOrderStorageService]
    J --> K[Emit ORDER_CREATED]

    K --> L{TableProvider}
    L -->|"NO HANDLER"| M[Table stays AVAILABLE]

    K --> N{EnhancedKitchenContext}
    N -->|"NO HANDLER"| O[No tickets created]

    P[User can place ANOTHER order on T-1!]

    M --> P
    O --> P

    style H fill:#FFB6C1
    style I fill:#FFB6C1
    style M fill:#FFB6C1
    style O fill:#FFB6C1
    style P fill:#FF6B6B
```

### Table Status Lifecycle (EXPECTED vs ACTUAL)

```mermaid
graph TB
    subgraph Expected["EXPECTED Flow"]
        E1["AVAILABLE"] -->|"Order Created"| E2["OCCUPIED"]
        E2 -->|"Order Ready"| E2
        E2 -->|"Order Served"| E2
        E2 -->|"Payment Complete"| E1
        E2 -->|"Order Cancelled"| E1
    end

    subgraph Actual["ACTUAL Flow (BROKEN)"]
        A1["AVAILABLE"] -->|"Order Created"| A1
        A1 -->|"Payment Complete"| A1
        A1 -.->|"Manual Only"| A2["OCCUPIED"]
    end

    style A1 fill:#FFB6C1
    style A2 fill:#FFB6C1
```

### Kitchen Ticket Flow (EXPECTED vs ACTUAL)

```mermaid
graph TB
    subgraph Expected["EXPECTED Flow"]
        E1["Order Submitted"] --> E2["Create Tickets by Station"]
        E2 --> E3["Grill: Burger"]
        E2 --> E4["Fry: Fries"]
        E2 --> E5["Drink: Soda"]
        E3 --> E6["Kitchen Display Shows Tickets"]
        E4 --> E6
        E5 --> E6
    end

    subgraph Actual["ACTUAL Flow (BROKEN)"]
        A1["Order Submitted"] --> A2["Save to OrderStorage"]
        A2 --> A3["Kitchen Display: EMPTY"]
        A3 --> A4["No tickets ever created"]
    end

    style A3 fill:#FFB6C1
    style A4 fill:#FFB6C1
```

---

## Multiple Orders Per Table (BUG DEMONSTRATION)

```mermaid
sequenceDiagram
    participant U as User
    participant POS as POSOrderScreen
    participant UOC as UnifiedOrderContext
    participant Storage as OrderStorage

    Note over U,Storage: First Order (Should Work)
    U->>POS: Select Table T-1
    U->>POS: Add Burger, Fries
    U->>POS: Send to Kitchen
    POS->>UOC: submitToKitchen()
    Note right of UOC: NO validation!
    UOC->>Storage: Save Order #001
    UOC-->>POS: Success

    Note over U,Storage: Second Order (Should FAIL but doesn't!)
    U->>POS: Add Soda, Dessert
    U->>POS: Send to Kitchen
    POS->>UOC: submitToKitchen()
    Note right of UOC: Still NO validation!
    UOC->>Storage: Save Order #002
    UOC-->>POS: Success (WRONG!)

    Note over Storage: Table T-1 now has TWO active orders!
```

---

## Storage Service Architecture

### Current Storage Silos

```mermaid
graph TB
    subgraph AsyncStorage["AsyncStorage (Device)"]
        K1["@unified_orders"]
        K2["@table_data"]
        K3["@kitchen_tickets"]
        K4["@payment_records"]
        K5["@menu_data"]
    end

    subgraph Services["Storage Services (No Cross-Communication)"]
        S1["UnifiedOrderStorageService"]
        S2["TableStorageService"]
        S3["KitchenStorageService"]
        S4["PaymentStorageService"]
    end

    subgraph Caches["In-Memory Caches (Separate)"]
        C1["orderCache: Map"]
        C2["tableCache: Map"]
        C3["ticketCache: Map"]
    end

    S1 --> K1
    S1 --> C1
    S2 --> K2
    S2 --> C2
    S3 --> K3
    S3 --> C3
    S4 --> K4

    S1 -.->|"NO SYNC"| S2
    S1 -.->|"NO SYNC"| S3
    S2 -.->|"NO SYNC"| S3

    style S1 fill:#90EE90
    style S2 fill:#FFB6C1
    style S3 fill:#FFB6C1
```

### Table Data Source Confusion

```mermaid
graph TB
    subgraph Problem["THREE Sources of Truth"]
        M["MOCK_TABLES<br/>(mockTables.ts)<br/>30 tables"]
        A["FixedMockTableApiClient<br/>12 tables (T1-T12)"]
        S["TableStorageService<br/>Seeds from MOCK_TABLES"]
    end

    subgraph Screens["Different Screens Use Different Sources"]
        POS["POSOrderScreen<br/>Uses API Client"]
        SET["Settings > Tables<br/>Uses Storage"]
        DASH["Dashboard<br/>Uses MOCK_TABLES"]
    end

    POS --> A
    SET --> S
    DASH --> M

    style Problem fill:#FFB6C1
```

---

## Provider Initialization Order

```mermaid
sequenceDiagram
    participant App
    participant OAP as OptimizedAppProviders
    participant Auth as AuthProvider
    participant Table as TableProvider
    participant Order as UnifiedOrderProvider
    participant Kitchen as EnhancedKitchenProvider

    App->>OAP: Mount
    OAP->>Auth: Mount
    Auth->>Table: Mount

    Note over Table: Initialize TableStorageService
    Table->>Table: Load tables (from API/Storage)

    Table->>Order: Mount
    Note over Order: Initialize UnifiedOrderStorageService
    Order->>Order: Load orders from storage
    Order->>Order: Subscribe to events

    Order->>Kitchen: Mount
    Note over Kitchen: Initialize KitchenStorageService
    Kitchen->>Kitchen: Load tickets (EMPTY - never created!)

    Note over App,Kitchen: All providers mounted,<br/>but kitchen has no tickets
```

---

## Summary of Architectural Gaps

| Gap | Current State | Required State | Impact |
|-----|---------------|----------------|--------|
| **Order Validation** | None | Check for active orders | Multiple orders per table |
| **Table Status on Order** | No handler | ORDER_CREATED → OCCUPIED | Tables always "available" |
| **Table Status on Cancel** | No handler | ORDER_CANCELLED → AVAILABLE | Tables stuck "occupied" |
| **Kitchen Ticket Creation** | Never happens | Create on ORDER_CREATED | Empty kitchen display |
| **Table Data Source** | 3 sources | 1 unified source | Inconsistent table data |
| **Table Status Persistence** | Not persisted | Save to storage | Status lost on reload |

---

## Files Involved

### Core Files
| File | Purpose | Status |
|------|---------|--------|
| `src/context/unified-order/UnifiedOrderContext.tsx` | Order management | Works, missing validation |
| `src/context/table/TableProvider.tsx` | Table management | Missing event handlers |
| `src/context/kitchen/EnhancedKitchenContext.tsx` | Kitchen operations | Disconnected from orders |

### Storage Files
| File | Purpose | Status |
|------|---------|--------|
| `src/services/storage/UnifiedOrderStorageService.ts` | Order persistence | Working |
| `src/services/storage/TableStorageService.ts` | Table persistence | Not fully used |
| `src/services/storage/KitchenStorageService.ts` | Kitchen persistence | Empty (no tickets) |

### Data Files
| File | Purpose | Status |
|------|---------|--------|
| `src/data/tables/mockTables.ts` | Mock table data | Conflicting source |
| `src/services/api/table/FixedMockTableApiClient.ts` | Mock API | Conflicting source |
