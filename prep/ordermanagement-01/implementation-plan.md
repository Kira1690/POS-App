# Order Management System - Complete Implementation Plan

**Version:** 2.0
**Date:** January 15, 2026
**Goal:** Production-ready implementation with API-ready architecture

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API-Ready Data Flow](#2-api-ready-data-flow)
3. [Service Layer Pattern](#3-service-layer-pattern)
4. [Storage Strategy](#4-storage-strategy)
5. [Implementation Phases](#5-implementation-phases)
6. [File Structure](#6-file-structure)
7. [Type Definitions](#7-type-definitions)
8. [Component Specifications](#8-component-specifications)
9. [Testing Strategy](#9-testing-strategy)
10. [Migration Path to API](#10-migration-path-to-api)

---

## 1. Architecture Overview

### 1.1 System Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Ordering │ │ Kitchen │ │  Bill   │ │ Payment │ │  Order  │ │ Receipt │  │
│  │ Screen  │ │ Display │ │ Screen  │ │Processing│ │  Mgmt   │ │ Preview │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘  │
│       │           │           │           │           │           │         │
├───────┴───────────┴───────────┴───────────┴───────────┴───────────┴─────────┤
│                          CONTEXT LAYER (State Management)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ OrderContext│ │KitchenContext│ │ BillContext │ │PaymentContext│          │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│         │               │               │               │                    │
├─────────┴───────────────┴───────────────┴───────────────┴────────────────────┤
│                          SERVICE LAYER (Business Logic)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │OrderService │ │KitchenService│ │ BillService │ │PaymentService│          │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│         │               │               │               │                    │
├─────────┴───────────────┴───────────────┴───────────────┴────────────────────┤
│                          REPOSITORY LAYER (Data Access)                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    BaseRepository<T> (Abstract)                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐   ││
│  │  │  Interface: IRepository<T>                                        │   ││
│  │  │  - getAll(): Promise<T[]>                                        │   ││
│  │  │  - getById(id: string): Promise<T | null>                        │   ││
│  │  │  - create(item: T): Promise<T>                                   │   ││
│  │  │  - update(id: string, item: Partial<T>): Promise<T>              │   ││
│  │  │  - delete(id: string): Promise<void>                             │   ││
│  │  │  - query(filter: FilterOptions<T>): Promise<T[]>                 │   ││
│  │  └──────────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│         │                                                                    │
├─────────┴────────────────────────────────────────────────────────────────────┤
│                          STORAGE ADAPTER LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Current: AsyncStorageAdapter        Future: ApiAdapter                 ││
│  │  ┌─────────────────────────┐         ┌─────────────────────────┐       ││
│  │  │ Implements IDataAdapter │         │ Implements IDataAdapter │       ││
│  │  │ Uses: AsyncStorage      │   →→→   │ Uses: HTTP/REST API     │       ││
│  │  └─────────────────────────┘         └─────────────────────────┘       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Architecture Decisions

1. **Repository Pattern**: All data access through repositories
2. **Adapter Pattern**: Storage adapters can be swapped (AsyncStorage → API)
3. **Service Layer**: Business logic isolated from UI
4. **Context Layer**: React state management only
5. **Dependency Injection**: Services receive adapters via constructor

---

## 2. API-Ready Data Flow

### 2.1 Order Creation Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           ORDER CREATION FLOW                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  1. SELECT TABLE                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ TableGrid   │────▶│ TableService│────▶│TableRepository│                   │
│  │ Component   │     │ .selectTable│     │ .getById()   │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│         │                                        │                           │
│         ▼                                        ▼                           │
│  2. ADD ITEMS TO CART                     AsyncStorage/API                   │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ MenuItemCard│────▶│ OrderContext│                                        │
│  │ .onPress()  │     │ .addToCart()│                                        │
│  └─────────────┘     └─────────────┘                                        │
│         │                   │                                                │
│         ▼                   ▼                                                │
│  3. SELECT MODIFIERS  Cart State (local)                                    │
│  ┌─────────────┐                                                            │
│  │ ModifierModal│                                                           │
│  │ .onConfirm()│                                                            │
│  └─────────────┘                                                            │
│         │                                                                    │
│         ▼                                                                    │
│  4. SUBMIT ORDER                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │SendToKitchen│────▶│ OrderService│────▶│OrderRepository│                   │
│  │ Modal       │     │.createOrder()│    │ .create()    │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│         │                   │                    │                           │
│         │                   ▼                    ▼                           │
│         │            ┌─────────────┐     AsyncStorage/API                   │
│         │            │KitchenService│                                        │
│         └───────────▶│.createTickets│                                        │
│                      └─────────────┘                                        │
│                            │                                                 │
│                            ▼                                                 │
│                      ┌─────────────┐     ┌─────────────┐                    │
│                      │KitchenTicket│────▶│KitchenRepository│                 │
│                      │ Router      │     │ .create()    │                    │
│                      └─────────────┘     └─────────────┘                    │
│                                                 │                            │
│                                                 ▼                            │
│                                          AsyncStorage/API                   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Kitchen Ticket Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          KITCHEN TICKET FLOW                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ORDER SUBMITTED                                                              │
│       │                                                                       │
│       ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    KITCHEN TICKET ROUTER                                 │ │
│  │                                                                          │ │
│  │  Input: Order with items                                                 │ │
│  │                                                                          │ │
│  │  Process:                                                                │ │
│  │  1. Group items by kitchenStation (from menu item category)             │ │
│  │  2. Create separate ticket per station                                  │ │
│  │  3. Calculate priority based on item count and modifiers                │ │
│  │  4. Set estimated prep time                                             │ │
│  │  5. Flag allergens                                                      │ │
│  │                                                                          │ │
│  │  Output: KitchenTicket[] (one per station)                              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│       │                                                                       │
│       ├────────────────────┬────────────────────┬──────────────────────┐     │
│       ▼                    ▼                    ▼                      ▼     │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐          ┌──────────┐ │
│  │HOT KITCHEN│       │  GRILL   │        │BEVERAGES │          │ DESSERTS │ │
│  │  Ticket   │       │  Ticket  │        │  Ticket  │          │  Ticket  │ │
│  └──────────┘        └──────────┘        └──────────┘          └──────────┘ │
│       │                    │                    │                      │     │
│       └────────────────────┴────────────────────┴──────────────────────┘     │
│                                    │                                          │
│                                    ▼                                          │
│                           KitchenRepository.createMany()                     │
│                                    │                                          │
│                                    ▼                                          │
│                             AsyncStorage/API                                 │
│                                    │                                          │
│                                    ▼                                          │
│                           KitchenDisplayScreen                               │
│                           (Real-time updates)                                │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Bill & Payment Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          BILL & PAYMENT FLOW                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ORDER READY FOR BILLING                                                      │
│       │                                                                       │
│       ▼                                                                       │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ BillScreen  │────▶│ BillService │────▶│BillRepository│                    │
│  │             │     │.generateBill│     │ .create()   │                     │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│       │                                         │                            │
│       │                                         ▼                            │
│       │                                  AsyncStorage/API                    │
│       │                                                                      │
│       ├─────────────────────────────────────────────────────────────┐       │
│       │                                                              │       │
│       ▼                                                              ▼       │
│  ┌─────────────┐                                              ┌─────────────┐│
│  │ PAY FULL    │                                              │ SPLIT BILL  ││
│  └─────────────┘                                              └─────────────┘│
│       │                                                              │       │
│       │                           ┌──────────────────────────────────┤       │
│       │                           │                │                 │       │
│       │                           ▼                ▼                 ▼       │
│       │                     ┌──────────┐    ┌──────────┐     ┌──────────┐   │
│       │                     │  EQUAL   │    │ BY ITEMS │     │BY PAYMENT│   │
│       │                     │  SPLIT   │    │  SPLIT   │     │  METHOD  │   │
│       │                     └──────────┘    └──────────┘     └──────────┘   │
│       │                           │                │                 │       │
│       │                           └────────────────┴─────────────────┘       │
│       │                                           │                          │
│       │                                           ▼                          │
│       │                                    ┌─────────────┐                   │
│       │                                    │ SplitService│                   │
│       │                                    │.calculateSplit│                 │
│       │                                    └─────────────┘                   │
│       │                                           │                          │
│       └───────────────────────────────────────────┘                          │
│                                   │                                          │
│                                   ▼                                          │
│                          ┌─────────────┐                                    │
│                          │PaymentService│                                    │
│                          │.processPayment│                                   │
│                          └─────────────┘                                    │
│                                   │                                          │
│                   ┌───────────────┼───────────────┐                         │
│                   ▼               ▼               ▼                         │
│             ┌──────────┐   ┌──────────┐   ┌──────────┐                      │
│             │   CASH   │   │   CARD   │   │  SPLIT   │                      │
│             │ PAYMENT  │   │ PAYMENT  │   │ PAYMENT  │                      │
│             └──────────┘   └──────────┘   └──────────┘                      │
│                   │               │               │                         │
│                   └───────────────┴───────────────┘                         │
│                                   │                                          │
│                                   ▼                                          │
│                          ┌─────────────┐     ┌─────────────┐                │
│                          │PaymentRepository│──▶│AsyncStorage/API│            │
│                          │ .create()   │     └─────────────┘                │
│                          └─────────────┘                                    │
│                                   │                                          │
│                                   ▼                                          │
│                          ┌─────────────┐                                    │
│                          │ReceiptService│                                    │
│                          │.generateReceipt│                                  │
│                          └─────────────┘                                    │
│                                   │                                          │
│                   ┌───────────────┴───────────────┐                         │
│                   ▼                               ▼                         │
│             ┌──────────┐                   ┌──────────┐                      │
│             │  PRINT   │                   │  EMAIL   │                      │
│             │ RECEIPT  │                   │ RECEIPT  │                      │
│             └──────────┘                   └──────────┘                      │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Service Layer Pattern

### 3.1 Base Service Interface

```typescript
// src/services/base/IService.ts
interface IService<T, CreateDTO, UpdateDTO> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### 3.2 Service Implementation Pattern

```typescript
// Pattern for all services - enables easy API migration
class OrderService implements IService<Order, CreateOrderDTO, UpdateOrderDTO> {
  constructor(
    private repository: IRepository<Order>,
    private kitchenService: KitchenService,
    private tableService: TableService
  ) {}

  async create(data: CreateOrderDTO): Promise<Order> {
    // 1. Validate data
    this.validateOrder(data);

    // 2. Create order
    const order = await this.repository.create({
      ...data,
      id: generateId('ORD'),
      orderNumber: generateOrderNumber(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // 3. Create kitchen tickets (side effect)
    await this.kitchenService.createTicketsForOrder(order);

    // 4. Update table status (side effect)
    await this.tableService.updateStatus(order.tableId, 'occupied');

    return order;
  }
}
```

### 3.3 Repository Pattern (API-Ready)

```typescript
// src/repositories/base/IRepository.ts
interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  query(filter: QueryFilter<T>): Promise<T[]>;
}

// src/repositories/base/AsyncStorageRepository.ts
// Current implementation - uses AsyncStorage
class AsyncStorageRepository<T extends { id: string }> implements IRepository<T> {
  constructor(private storageKey: string) {}

  async getAll(): Promise<T[]> {
    const data = await AsyncStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  async create(item: T): Promise<T> {
    const items = await this.getAll();
    items.push(item);
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(items));
    return item;
  }
  // ... other methods
}

// src/repositories/base/ApiRepository.ts
// Future implementation - uses REST API
class ApiRepository<T extends { id: string }> implements IRepository<T> {
  constructor(private endpoint: string, private apiClient: ApiClient) {}

  async getAll(): Promise<T[]> {
    const response = await this.apiClient.get(this.endpoint);
    return response.data;
  }

  async create(item: T): Promise<T> {
    const response = await this.apiClient.post(this.endpoint, item);
    return response.data;
  }
  // ... other methods
}
```

---

## 4. Storage Strategy

### 4.1 AsyncStorage Keys Structure

```typescript
// src/constants/storageKeys.ts
export const STORAGE_KEYS = {
  // Orders
  ORDERS: '@pos/orders',
  ACTIVE_ORDER: '@pos/active_order',
  DRAFT_ORDERS: '@pos/draft_orders',

  // Kitchen
  KITCHEN_TICKETS: '@pos/kitchen_tickets',
  KITCHEN_STATIONS: '@pos/kitchen_stations',

  // Billing
  BILLS: '@pos/bills',
  BILL_SPLITS: '@pos/bill_splits',
  PAYMENTS: '@pos/payments',

  // Tables
  TABLES: '@pos/tables',
  TABLE_AREAS: '@pos/table_areas',

  // Menu
  MENU_ITEMS: '@pos/menu_items',
  CATEGORIES: '@pos/categories',
  MODIFIERS: '@pos/modifiers',
  COMBOS: '@pos/combos',

  // Receipts
  RECEIPTS: '@pos/receipts',

  // Settings
  PAYMENT_SETTINGS: '@pos/payment_settings',
  RESTAURANT_SETTINGS: '@pos/restaurant_settings',
};
```

### 4.2 Data Sync Strategy

```typescript
// src/services/sync/SyncService.ts
class SyncService {
  private pendingChanges: Map<string, PendingChange[]> = new Map();

  // Queue changes when offline
  async queueChange(entity: string, operation: 'create' | 'update' | 'delete', data: any) {
    const changes = this.pendingChanges.get(entity) || [];
    changes.push({
      id: generateId('CHG'),
      entity,
      operation,
      data,
      timestamp: new Date().toISOString(),
    });
    this.pendingChanges.set(entity, changes);
    await this.persistPendingChanges();
  }

  // Sync when online (for future API integration)
  async syncWithServer() {
    for (const [entity, changes] of this.pendingChanges) {
      for (const change of changes) {
        await this.applyChangeToServer(change);
      }
    }
    this.pendingChanges.clear();
  }
}
```

---

## 5. Implementation Phases

### Phase 1: Foundation & Infrastructure (Days 1-3)

#### 1.1 Create Base Infrastructure

| Task | File | Priority |
|------|------|----------|
| Create IRepository interface | src/repositories/base/IRepository.ts | P0 |
| Create AsyncStorageRepository | src/repositories/base/AsyncStorageRepository.ts | P0 |
| Create IService interface | src/services/base/IService.ts | P0 |
| Create BaseService class | src/services/base/BaseService.ts | P0 |
| Update storage keys | src/constants/storageKeys.ts | P0 |

#### 1.2 Create Repositories

| Task | File | Priority |
|------|------|----------|
| OrderRepository | src/repositories/OrderRepository.ts | P0 |
| KitchenTicketRepository | src/repositories/KitchenTicketRepository.ts | P0 |
| BillRepository | src/repositories/BillRepository.ts | P0 |
| PaymentRepository | src/repositories/PaymentRepository.ts | P0 |
| TableRepository | src/repositories/TableRepository.ts | P0 |

---

### Phase 2: Kitchen Ticket System (Days 4-6)

#### 2.1 Kitchen Ticket Router

| Task | File | Priority |
|------|------|----------|
| Create ticket router service | src/services/kitchen/KitchenTicketRouter.ts | P0 |
| Create station mapping config | src/config/kitchenStations.ts | P0 |
| Create ticket creation logic | src/services/kitchen/KitchenTicketService.ts | P0 |

#### 2.2 Integration with Order Flow

| Task | File | Priority |
|------|------|----------|
| Update EnhancedOrderContext | src/context/order/EnhancedOrderContext.tsx | P0 |
| Create order-to-ticket mapping | src/services/kitchen/orderToTicketMapper.ts | P0 |
| Update KitchenDisplayScreen | src/screens/orders/KitchenDisplayScreen.tsx | P1 |

#### 2.3 Kitchen Ticket Router Logic

```typescript
// src/services/kitchen/KitchenTicketRouter.ts
class KitchenTicketRouter {
  private stationMapping: Map<string, KitchenStation>;

  constructor() {
    this.stationMapping = new Map([
      ['starters', 'cold_kitchen'],
      ['mains', 'hot_kitchen'],
      ['grilled', 'grill'],
      ['desserts', 'desserts'],
      ['beverages', 'beverages'],
      ['bar', 'bar'],
    ]);
  }

  routeOrder(order: Order): KitchenTicket[] {
    // Group items by station
    const itemsByStation = this.groupItemsByStation(order.items);

    // Create ticket for each station
    const tickets: KitchenTicket[] = [];
    for (const [station, items] of itemsByStation) {
      tickets.push(this.createTicket(order, station, items));
    }

    return tickets;
  }

  private groupItemsByStation(items: OrderItem[]): Map<KitchenStation, OrderItem[]> {
    const grouped = new Map<KitchenStation, OrderItem[]>();

    for (const item of items) {
      const station = this.stationMapping.get(item.category.toLowerCase()) || 'hot_kitchen';
      const stationItems = grouped.get(station) || [];
      stationItems.push(item);
      grouped.set(station, stationItems);
    }

    return grouped;
  }

  private createTicket(order: Order, station: KitchenStation, items: OrderItem[]): KitchenTicket {
    return {
      id: generateId('TKT'),
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableName: order.tableName,
      station,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        modifiers: item.selectedModifiers,
        specialInstructions: item.specialInstructions,
        allergens: item.allergens || [],
      })),
      status: 'pending',
      priority: this.calculatePriority(items),
      estimatedPrepTime: this.calculatePrepTime(items),
      hasAllergens: items.some(item => item.allergens && item.allergens.length > 0),
      createdAt: new Date().toISOString(),
    };
  }
}
```

---

### Phase 3: Bill Splitting System (Days 7-12)

#### 3.1 Bill Split Screen & Components

| Task | File | Priority |
|------|------|----------|
| Create BillSplitScreen | src/screens/billing/BillSplitScreen.tsx | P0 |
| Create SplitByGuests | src/screens/billing/components/SplitByGuests.tsx | P0 |
| Create SplitByItems | src/screens/billing/components/SplitByItems.tsx | P0 |
| Create SplitByPayment | src/screens/billing/components/SplitByPayment.tsx | P0 |
| Create GuestCard | src/screens/billing/components/GuestCard.tsx | P1 |
| Create ItemAssignment | src/screens/billing/components/ItemAssignment.tsx | P1 |

#### 3.2 Bill Split Services

| Task | File | Priority |
|------|------|----------|
| Create BillSplitService | src/services/billing/BillSplitService.ts | P0 |
| Create EqualSplitCalculator | src/services/billing/calculators/EqualSplitCalculator.ts | P0 |
| Create ItemSplitCalculator | src/services/billing/calculators/ItemSplitCalculator.ts | P0 |
| Create PaymentSplitCalculator | src/services/billing/calculators/PaymentSplitCalculator.ts | P0 |
| Create SplitValidationService | src/services/billing/SplitValidationService.ts | P1 |

#### 3.3 Bill Split Types

```typescript
// src/types/bill-split.types.ts
interface BillSplit {
  id: string;
  orderId: string;
  billId: string;
  splitType: 'equal' | 'by_items' | 'by_payment';
  guestSplits: GuestSplit[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface GuestSplit {
  id: string;
  guestName: string;
  guestNumber: number;
  items: SplitItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: 'unpaid' | 'processing' | 'paid';
  paidAt?: string;
}

interface SplitItem {
  orderItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isShared: boolean;
  sharedWith?: string[]; // guest IDs
  sharePercentage?: number;
}
```

#### 3.4 Equal Split Calculator

```typescript
// src/services/billing/calculators/EqualSplitCalculator.ts
class EqualSplitCalculator {
  calculate(bill: Bill, guestCount: number): GuestSplit[] {
    const amountPerGuest = bill.totalAmount / guestCount;
    const remainder = bill.totalAmount - (Math.floor(amountPerGuest * 100) / 100 * guestCount);

    const guests: GuestSplit[] = [];
    for (let i = 0; i < guestCount; i++) {
      const isLastGuest = i === guestCount - 1;
      guests.push({
        id: generateId('GST'),
        guestName: `Guest ${i + 1}`,
        guestNumber: i + 1,
        items: [], // Equal split doesn't assign specific items
        subtotal: bill.subtotal / guestCount,
        taxAmount: bill.taxAmount / guestCount,
        tipAmount: bill.tipAmount / guestCount,
        totalAmount: isLastGuest
          ? amountPerGuest + remainder // Last guest gets remainder (cents)
          : Math.floor(amountPerGuest * 100) / 100,
        paymentStatus: 'unpaid',
      });
    }

    return guests;
  }
}
```

#### 3.5 Item Split Calculator

```typescript
// src/services/billing/calculators/ItemSplitCalculator.ts
class ItemSplitCalculator {
  calculate(bill: Bill, guestAssignments: GuestItemAssignment[]): GuestSplit[] {
    const guests: GuestSplit[] = [];

    for (const assignment of guestAssignments) {
      const items = this.getAssignedItems(bill, assignment);
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxRate = bill.taxAmount / bill.subtotal;
      const tipRate = bill.tipAmount / bill.subtotal;

      guests.push({
        id: generateId('GST'),
        guestName: assignment.guestName,
        guestNumber: assignment.guestNumber,
        items,
        subtotal,
        taxAmount: subtotal * taxRate,
        tipAmount: subtotal * tipRate,
        totalAmount: subtotal * (1 + taxRate + tipRate),
        paymentStatus: 'unpaid',
      });
    }

    // Handle shared items
    this.distributeSharedItems(guests, bill.sharedItems);

    return guests;
  }

  private distributeSharedItems(guests: GuestSplit[], sharedItems: SharedItem[]) {
    for (const shared of sharedItems) {
      const sharingGuests = guests.filter(g => shared.guestIds.includes(g.id));
      const shareAmount = shared.totalPrice / sharingGuests.length;

      for (const guest of sharingGuests) {
        guest.items.push({
          ...shared,
          totalPrice: shareAmount,
          isShared: true,
          sharePercentage: 100 / sharingGuests.length,
        });
        guest.subtotal += shareAmount;
        // Recalculate tax and tip
      }
    }
  }
}
```

---

### Phase 4: Payment Processing (Days 13-16)

#### 4.1 Payment Components

| Task | File | Priority |
|------|------|----------|
| Update PaymentProcessingScreen | src/screens/payment/PaymentProcessingScreen.tsx | P0 |
| Create CashPaymentPanel | src/screens/payment/components/CashPaymentPanel.tsx | P0 |
| Create CardPaymentPanel | src/screens/payment/components/CardPaymentPanel.tsx | P0 |
| Create SplitPaymentPanel | src/screens/payment/components/SplitPaymentPanel.tsx | P0 |
| Create PaymentConfirmation | src/screens/payment/PaymentConfirmationScreen.tsx | P0 |

#### 4.2 Payment Services

| Task | File | Priority |
|------|------|----------|
| Create PaymentService | src/services/payment/PaymentService.ts | P0 |
| Create CashPaymentProcessor | src/services/payment/processors/CashPaymentProcessor.ts | P0 |
| Create CardPaymentProcessor | src/services/payment/processors/CardPaymentProcessor.ts | P0 |
| Create SplitPaymentProcessor | src/services/payment/processors/SplitPaymentProcessor.ts | P0 |
| Create PaymentValidationService | src/services/payment/PaymentValidationService.ts | P1 |

#### 4.3 Payment Types

```typescript
// src/types/payment.types.ts
interface Payment {
  id: string;
  orderId: string;
  billId: string;
  method: PaymentMethod;
  amount: number;
  receivedAmount?: number; // For cash
  changeAmount?: number; // For cash
  cardLast4?: string; // For card
  transactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  processedAt?: string;
  createdAt: string;
}

interface SplitPayment {
  id: string;
  billSplitId: string;
  guestSplitId: string;
  payments: Payment[];
  totalDue: number;
  totalPaid: number;
  remaining: number;
  status: 'pending' | 'partial' | 'completed';
}

type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet';
```

---

### Phase 5: Combo & Modals (Days 17-19)

#### 5.1 Combo Selection

| Task | File | Priority |
|------|------|----------|
| Create ComboSelectionModal | src/screens/orders/modals/ComboSelectionModal.tsx | P0 |
| Create ComboItemSelector | src/screens/orders/modals/components/ComboItemSelector.tsx | P1 |
| Create ComboService | src/services/menu/ComboService.ts | P0 |

#### 5.2 Other Modals

| Task | File | Priority |
|------|------|----------|
| Create ItemNotesModal | src/screens/orders/modals/ItemNotesModal.tsx | P1 |
| Create DiscountModal | src/screens/orders/modals/DiscountModal.tsx | P1 |
| Create QuantityModal | src/screens/orders/modals/QuantityModal.tsx | P2 |

#### 5.3 Combo Types

```typescript
// src/types/combo.types.ts
interface ComboDeal {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  originalPrice: number;
  comboPrice: number;
  discountAmount: number;
  discountPercentage: number;
  components: ComboComponent[];
  isActive: boolean;
  availableFrom?: string;
  availableUntil?: string;
}

interface ComboComponent {
  id: string;
  name: string; // e.g., "Select 2 Burgers"
  category: string;
  requiredQuantity: number;
  options: ComboOption[];
  selectedOptions: SelectedComboOption[];
}

interface ComboOption {
  menuItemId: string;
  name: string;
  priceAdjustment: number; // e.g., +$3.00 for premium option
  isDefault: boolean;
}

interface SelectedComboOption {
  optionId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  priceAdjustment: number;
}
```

---

### Phase 6: Receipt System (Days 20-22)

#### 6.1 Receipt Components

| Task | File | Priority |
|------|------|----------|
| Create ReceiptPreviewScreen | src/screens/receipt/ReceiptPreviewScreen.tsx | P0 |
| Create ReceiptTemplate | src/screens/receipt/components/ReceiptTemplate.tsx | P0 |
| Create PrintButton | src/screens/receipt/components/PrintButton.tsx | P1 |
| Create EmailButton | src/screens/receipt/components/EmailButton.tsx | P1 |

#### 6.2 Receipt Services

| Task | File | Priority |
|------|------|----------|
| Create ReceiptService | src/services/receipt/ReceiptService.ts | P0 |
| Create ReceiptGenerator | src/services/receipt/ReceiptGenerator.ts | P0 |
| Create ReceiptTemplates | src/services/receipt/templates/index.ts | P1 |
| Create PrintService | src/services/receipt/PrintService.ts | P1 |
| Create EmailService | src/services/receipt/EmailService.ts | P2 |

#### 6.3 Receipt Types

```typescript
// src/types/receipt.types.ts
interface Receipt {
  id: string;
  orderId: string;
  paymentId: string;
  restaurantInfo: RestaurantInfo;
  orderInfo: OrderInfo;
  items: ReceiptItem[];
  summary: ReceiptSummary;
  paymentInfo: PaymentInfo;
  footer: ReceiptFooter;
  generatedAt: string;
  printedAt?: string;
  emailedTo?: string;
  emailedAt?: string;
}

interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers?: string[];
}

interface ReceiptSummary {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount: number;
  totalAmount: number;
}

interface ReceiptFooter {
  thankYouMessage: string;
  returnPolicy?: string;
  socialMedia?: string;
}
```

---

### Phase 7: Integration & Polish (Days 23-25)

#### 7.1 Navigation Setup

| Task | File | Priority |
|------|------|----------|
| Update navigation types | src/navigation/types.ts | P0 |
| Add BillSplit route | src/navigation/OrdersNavigator.tsx | P0 |
| Add Receipt route | src/navigation/OrdersNavigator.tsx | P0 |
| Update tab navigation | src/navigation/MainNavigator.tsx | P1 |

#### 7.2 Provider Setup

| Task | File | Priority |
|------|------|----------|
| Add BillSplitProvider | src/providers/OptimizedAppProviders.tsx | P0 |
| Add PaymentProvider | src/providers/OptimizedAppProviders.tsx | P0 |
| Update provider hierarchy | App.tsx | P0 |

#### 7.3 Context Integration

| Task | File | Priority |
|------|------|----------|
| Wire BillSplitContext | src/context/billing/BillSplitContext.tsx | P0 |
| Create PaymentContext | src/context/payment/PaymentContext.tsx | P0 |
| Update OrderContext integration | src/context/order/EnhancedOrderContext.tsx | P0 |

---

### Phase 8: Table Management Unification (Days 26-27)

#### 8.1 Table Storage

| Task | File | Priority |
|------|------|----------|
| Create TableStorageService | src/services/storage/TableStorageService.ts | P0 |
| Create TableRepository | src/repositories/TableRepository.ts | P0 |
| Migrate mock data | src/data/tables/defaultTables.ts | P1 |

#### 8.2 Table Integration

| Task | File | Priority |
|------|------|----------|
| Update TableContext | src/context/table/TableContext.tsx | P0 |
| Update TableManagementScreen | src/screens/tables/TableManagementScreen.tsx | P1 |
| Update OrderManagementScreen | src/screens/orders/OrderManagementScreen.tsx | P1 |

---

### Phase 9: Testing & Validation (Days 28-30)

#### 9.1 Unit Tests

| Task | File | Priority |
|------|------|----------|
| Test KitchenTicketRouter | src/services/kitchen/__tests__/KitchenTicketRouter.test.ts | P0 |
| Test EqualSplitCalculator | src/services/billing/__tests__/EqualSplitCalculator.test.ts | P0 |
| Test ItemSplitCalculator | src/services/billing/__tests__/ItemSplitCalculator.test.ts | P0 |
| Test PaymentService | src/services/payment/__tests__/PaymentService.test.ts | P0 |

#### 9.2 Integration Tests

| Task | File | Priority |
|------|------|----------|
| Test Order→Kitchen flow | src/__tests__/OrderKitchenIntegration.test.ts | P0 |
| Test Bill→Payment flow | src/__tests__/BillPaymentIntegration.test.ts | P0 |
| Test Split Payment flow | src/__tests__/SplitPaymentIntegration.test.ts | P0 |

---

## 6. File Structure

```
src/
├── components/
│   ├── modals/
│   │   └── TableSelectionModal.tsx ✓ (exists)
│   └── billing/
│       ├── BillItemRow.tsx (NEW)
│       ├── GuestCard.tsx (NEW)
│       └── PaymentMethodSelector.tsx (NEW)
│
├── screens/
│   ├── orders/
│   │   ├── OrderingScreen.tsx ✓
│   │   ├── OrderManagementScreen.tsx ✓
│   │   ├── KitchenDisplayScreen.tsx ✓
│   │   ├── POSOrderScreen.tsx ✓
│   │   ├── OrderDetailsScreen.tsx ✓
│   │   ├── components/
│   │   │   ├── CategorySidebar.tsx ✓
│   │   │   ├── MenuItemGrid.tsx ✓
│   │   │   ├── MenuItemCard.tsx ✓
│   │   │   ├── OrderCart.tsx ✓
│   │   │   ├── ModifierSelectionModal.tsx ✓
│   │   │   └── SendToKitchenModal.tsx ✓
│   │   └── modals/
│   │       ├── ComboSelectionModal.tsx (NEW)
│   │       ├── ItemNotesModal.tsx (NEW)
│   │       └── DiscountModal.tsx (NEW)
│   │
│   ├── billing/
│   │   ├── BillScreen.tsx ✓ (UPDATE)
│   │   ├── BillSplitScreen.tsx (NEW)
│   │   └── components/
│   │       ├── SplitByGuests.tsx (NEW)
│   │       ├── SplitByItems.tsx (NEW)
│   │       ├── SplitByPayment.tsx (NEW)
│   │       └── GuestPaymentCard.tsx (NEW)
│   │
│   ├── payment/
│   │   ├── PaymentProcessingScreen.tsx ✓ (UPDATE)
│   │   ├── PaymentConfirmationScreen.tsx (NEW)
│   │   └── components/
│   │       ├── CashPaymentPanel.tsx (NEW)
│   │       ├── CardPaymentPanel.tsx (NEW)
│   │       └── SplitPaymentPanel.tsx (NEW)
│   │
│   └── receipt/
│       ├── ReceiptPreviewScreen.tsx (NEW)
│       └── components/
│           ├── ReceiptTemplate.tsx (NEW)
│           └── ReceiptActions.tsx (NEW)
│
├── services/
│   ├── base/
│   │   ├── IService.ts (NEW)
│   │   └── BaseService.ts (NEW)
│   │
│   ├── kitchen/
│   │   ├── KitchenTicketRouter.ts (NEW)
│   │   ├── KitchenTicketService.ts (NEW)
│   │   └── orderToTicketMapper.ts (NEW)
│   │
│   ├── billing/
│   │   ├── BillService.ts (NEW)
│   │   ├── BillSplitService.ts (NEW)
│   │   └── calculators/
│   │       ├── EqualSplitCalculator.ts (NEW)
│   │       ├── ItemSplitCalculator.ts (NEW)
│   │       └── PaymentSplitCalculator.ts (NEW)
│   │
│   ├── payment/
│   │   ├── PaymentService.ts (NEW)
│   │   └── processors/
│   │       ├── CashPaymentProcessor.ts (NEW)
│   │       ├── CardPaymentProcessor.ts (NEW)
│   │       └── SplitPaymentProcessor.ts (NEW)
│   │
│   ├── receipt/
│   │   ├── ReceiptService.ts (NEW)
│   │   ├── ReceiptGenerator.ts (NEW)
│   │   ├── PrintService.ts (NEW)
│   │   └── templates/
│   │       └── defaultTemplate.ts (NEW)
│   │
│   └── storage/
│       ├── OrderStorageService.ts ✓
│       ├── KitchenStorageService.ts ✓
│       ├── MenuStorageService.ts ✓
│       ├── TableStorageService.ts (NEW)
│       ├── BillStorageService.ts (NEW)
│       └── PaymentStorageService.ts (NEW)
│
├── repositories/
│   ├── base/
│   │   ├── IRepository.ts (NEW)
│   │   └── AsyncStorageRepository.ts (NEW)
│   ├── OrderRepository.ts (NEW)
│   ├── KitchenTicketRepository.ts (NEW)
│   ├── BillRepository.ts (NEW)
│   ├── PaymentRepository.ts (NEW)
│   └── TableRepository.ts (NEW)
│
├── context/
│   ├── order/
│   │   ├── EnhancedOrderContext.tsx ✓ (UPDATE)
│   │   └── orderSelectors.ts ✓
│   ├── kitchen/
│   │   └── EnhancedKitchenContext.tsx ✓
│   ├── billing/
│   │   ├── BillSplitContext.tsx ✓ (UPDATE)
│   │   └── billSelectors.ts (NEW)
│   └── payment/
│       ├── PaymentContext.tsx (NEW)
│       └── paymentSelectors.ts (NEW)
│
├── types/
│   ├── order.types.ts ✓
│   ├── order-extended.types.ts ✓
│   ├── kitchen-ticket.types.ts ✓
│   ├── bill-split.types.ts (NEW)
│   ├── payment.types.ts (NEW)
│   ├── receipt.types.ts (NEW)
│   └── combo.types.ts (NEW)
│
├── config/
│   ├── kitchenStations.ts (NEW)
│   └── paymentMethods.ts (NEW)
│
└── constants/
    └── storageKeys.ts (UPDATE)
```

---

## 7. Type Definitions

### 7.1 Complete Type Files to Create

See `types-definitions.md` in this folder for complete type definitions.

---

## 8. Component Specifications

### 8.1 BillSplitScreen Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [<Back]  Split Bill - Table T1   │   Order #ORD-001234   │  Total: $56.65││
│  └─────────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│  SPLIT TYPE TABS                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  [Equal Split]  │  [By Items]  │  [Multiple Payments]                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│  CONTENT AREA (changes based on selected tab)                                │
│                                                                              │
│  Tab 1: Equal Split → <SplitByGuests />                                     │
│  Tab 2: By Items → <SplitByItems />                                         │
│  Tab 3: Multiple Payments → <SplitByPayment />                              │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Paid: $14.16  │  Remaining: $42.49  │  [Process Next Payment]          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Component Props Specifications

See `component-specs.md` in this folder for detailed component specifications.

---

## 9. Testing Strategy

### 9.1 Unit Test Requirements

| Service | Test Coverage |
|---------|---------------|
| KitchenTicketRouter | 100% |
| EqualSplitCalculator | 100% |
| ItemSplitCalculator | 100% |
| PaymentSplitCalculator | 100% |
| PaymentService | 100% |
| ReceiptGenerator | 100% |

### 9.2 Integration Test Scenarios

1. **Order → Kitchen Flow**
   - Create order with multiple items
   - Verify tickets created per station
   - Verify ticket appears in KitchenDisplay

2. **Bill → Split → Payment Flow**
   - Generate bill from order
   - Split equally among 3 guests
   - Process first payment (cash)
   - Process second payment (card)
   - Verify remaining balance

3. **Complete Order Lifecycle**
   - Select table
   - Add items with modifiers
   - Submit to kitchen
   - Update ticket status
   - Generate bill
   - Process payment
   - Generate receipt

---

## 10. Migration Path to API

### 10.1 Current vs Future Architecture

```
CURRENT (AsyncStorage):
┌─────────────┐     ┌─────────────────────────┐     ┌─────────────┐
│   Service   │────▶│  AsyncStorageRepository │────▶│ AsyncStorage│
└─────────────┘     └─────────────────────────┘     └─────────────┘

FUTURE (API):
┌─────────────┐     ┌─────────────────────────┐     ┌─────────────┐
│   Service   │────▶│     ApiRepository       │────▶│  REST API   │
└─────────────┘     └─────────────────────────┘     └─────────────┘
```

### 10.2 Migration Steps

1. **Create ApiRepository** implementing same IRepository interface
2. **Update DI Container** to inject ApiRepository instead of AsyncStorageRepository
3. **No changes to Services or UI** - they use repository interface
4. **Add offline sync** - queue changes when offline, sync when online

### 10.3 API Endpoint Mapping

| Entity | AsyncStorage Key | API Endpoint |
|--------|------------------|--------------|
| Orders | @pos/orders | POST /api/v1/orders |
| Kitchen Tickets | @pos/kitchen_tickets | POST /api/v1/kitchen/tickets |
| Bills | @pos/bills | POST /api/v1/billing/bills |
| Payments | @pos/payments | POST /api/v1/payments |
| Receipts | @pos/receipts | POST /api/v1/receipts |

### 10.4 Minimal API Integration Changes

```typescript
// src/config/dataSource.ts
const USE_API = process.env.EXPO_PUBLIC_USE_API === 'true';

export function createOrderRepository(): IRepository<Order> {
  if (USE_API) {
    return new ApiRepository<Order>('/api/v1/orders', apiClient);
  }
  return new AsyncStorageRepository<Order>(STORAGE_KEYS.ORDERS);
}

// Usage in service remains unchanged:
const orderService = new OrderService(
  createOrderRepository(),
  createKitchenService(),
  createTableService()
);
```

---

## Summary

### Total Implementation Scope

| Category | Files | New | Update | Hours |
|----------|-------|-----|--------|-------|
| Screens | 12 | 8 | 4 | 32 |
| Components | 18 | 15 | 3 | 24 |
| Services | 20 | 18 | 2 | 40 |
| Repositories | 6 | 6 | 0 | 12 |
| Types | 7 | 5 | 2 | 8 |
| Context | 4 | 2 | 2 | 8 |
| Tests | 10 | 10 | 0 | 16 |
| **TOTAL** | **77** | **64** | **13** | **~140 hours** |

### Timeline

| Phase | Days | Focus |
|-------|------|-------|
| 1 | 1-3 | Foundation & Infrastructure |
| 2 | 4-6 | Kitchen Ticket System |
| 3 | 7-12 | Bill Splitting System |
| 4 | 13-16 | Payment Processing |
| 5 | 17-19 | Combo & Modals |
| 6 | 20-22 | Receipt System |
| 7 | 23-25 | Integration & Polish |
| 8 | 26-27 | Table Management |
| 9 | 28-30 | Testing & Validation |

**Total: 30 working days (~6 weeks)**

---

## Next Steps

1. Review and approve this plan
2. Create type definition files
3. Create component specification files
4. Begin Phase 1 implementation

---

*This plan ensures production-ready code with minimal API integration effort.*
