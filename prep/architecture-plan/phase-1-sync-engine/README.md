# Phase 1: Sync Engine (CRITICAL — Do First)

## Objective
Wire up the existing sync infrastructure so SQLite ↔ PostgreSQL data flows correctly. The pieces exist — they just need to be connected.

---

## What Already Exists

### On the Mobile App (POS-App)
```
SyncQueueService          — Priority queue with retry, exponential backoff
├── enqueue()             — Add item to sync queue
├── processBatch()        — Process N items with callback
├── markInProgress()      — Lock item during processing
├── markCompleted()       — Mark done
├── markFailed()          — Mark failed with backoff
└── getStats()            — Queue statistics

Storage Services          — Each has sync helpers
├── unifiedOrderStorageService.getUnsyncedOrders()
├── unifiedOrderStorageService.markAsSynced(ids)
├── kitchenStorageService.getUnsyncedTickets()
├── kitchenStorageService.markTicketsAsSynced(ids)
├── paymentStorageService.getUnsyncedPayments()
└── paymentStorageService.markPaymentsAsSynced(ids)

Tables with pending_sync flag:
├── orders                → pending_sync INTEGER, synced_at TEXT
├── kitchen_tickets       → pending_sync INTEGER, synced_at TEXT
├── payment_records       → pending_sync INTEGER, synced_at TEXT
└── payment_transactions  → pending_sync INTEGER, synced_at TEXT
```

### On the Backend
```
Core Service (port 5005):
├── POST /api/orders/sync/pull    — Pull order changes since timestamp
├── POST /api/orders/sync/push    — Push local order changes to server

Menu Service (port 5003):
├── POST /api/sync/menu/sync/pull     — Pull menu changes
├── POST /api/sync/menu/sync/push     — Push menu changes
├── POST /api/sync/inventory/sync/pull
└── POST /api/sync/inventory/sync/push

WebSocket Server (Core Service):
├── Channel: 'orders'     — Order updates
├── Channel: 'tables'     — Table status
├── Channel: 'kitchen'    — Kitchen tickets
└── Channel: 'billing'    — Payment updates

Kafka Topics:
├── core-order-events
├── core-kitchen-events
├── core-table-events
├── core-billing-events
└── menu-events
```

---

## What Needs To Be Built

### 1.1 SyncEngine Service (NEW — Orchestrator)

**File**: `POS-App/src/services/sync/SyncEngine.ts`

This is the missing piece that connects everything:

```typescript
class SyncEngine {
  private isRunning = false;
  private pullInterval: NodeJS.Timer | null = null;
  private pushInterval: NodeJS.Timer | null = null;
  private wsConnection: WebSocket | null = null;

  // ---- LIFECYCLE ----

  async start(restaurantId: string, authToken: string): Promise<void> {
    // 1. Connect WebSocket for real-time push from server
    // 2. Start periodic pull (every 30s for reference data)
    // 3. Start periodic push (every 10s for transactional data)
    // 4. Do initial full pull on start
  }

  async stop(): Promise<void> {
    // Disconnect WebSocket, clear intervals
  }

  // ---- PUSH: Mobile → Server ----

  async pushPendingChanges(): Promise<PushResult> {
    // 1. Get unsynced orders from storage
    // 2. Get unsynced kitchen tickets
    // 3. Get unsynced payments
    // 4. For each, call the appropriate API endpoint
    // 5. On success, mark as synced
    // 6. On failure, SyncQueueService handles retry
  }

  // ---- PULL: Server → Mobile ----

  async pullReferenceData(): Promise<PullResult> {
    // 1. Get last_sync timestamps from sync_metadata
    // 2. Call menu/sync/pull with last timestamp
    // 3. Update local SQLite with new/changed items
    // 4. Call tables pull (or dedicated endpoint)
    // 5. Update sync_metadata timestamps
  }

  async pullTransactionalData(): Promise<PullResult> {
    // Pull orders updated by other devices/web dashboard
    // (e.g., manager cancelled an order from web)
  }

  // ---- REAL-TIME: WebSocket Listener ----

  private onWebSocketMessage(message: WebSocketMessage): void {
    // Route to appropriate handler:
    // 'menu' channel → update local menu items in SQLite
    // 'orders' channel → update local order if exists
    // 'tables' channel → update local table status
    // 'kitchen' channel → update local kitchen ticket
  }

  // ---- INITIAL SYNC (on login/app start) ----

  async fullSync(): Promise<void> {
    // 1. Pull ALL reference data (menu, tables, users, areas)
    // 2. Pull transactional data updated since last sync
    // 3. Push ALL pending local changes
    // 4. Resolve any conflicts
  }
}
```

### 1.2 Push Sync Processors (NEW — API Callers)

**File**: `POS-App/src/services/sync/processors/`

These are the callback functions that `SyncQueueService.processBatch()` calls:

```typescript
// OrderSyncProcessor.ts
async function processOrderSync(item: SyncQueueItem): Promise<boolean> {
  const order = JSON.parse(item.data);

  if (item.operation === 'create') {
    const response = await apiClient.post('/api/orders/sync/push', {
      restaurant_id: order.restaurant_id,
      device_id: getDeviceId(),
      changes: [{
        local_id: order.id,
        entity_type: 'order',
        action: 'create',
        data: {
          order_number: order.order_number,
          table_id: order.table_id,
          items: order.items,  // order_items included
          status: order.status,
          subtotal: order.subtotal,
          tax_amount: order.tax_amount,
          total_amount: order.total_amount,
          // ... all order fields
        },
        timestamp: order.created_at,
      }]
    });

    if (response.data.success) {
      // Map server ID if different
      const result = response.data.results[0];
      if (result.server_id !== order.id) {
        await updateLocalOrderId(order.id, result.server_id);
      }
      return true;
    }
    return false;
  }

  if (item.operation === 'update') {
    // Similar but with action: 'update'
  }
}

// KitchenSyncProcessor.ts
async function processKitchenSync(item: SyncQueueItem): Promise<boolean> {
  // Push kitchen ticket status to server
}

// PaymentSyncProcessor.ts
async function processPaymentSync(item: SyncQueueItem): Promise<boolean> {
  // Push payment records to server
}
```

### 1.3 Pull Sync Service (NEW — Fetches Server Changes)

**File**: `POS-App/src/services/sync/PullSyncService.ts`

```typescript
class PullSyncService {

  // Pull menu data (categories, items, modifiers, combos)
  async pullMenu(restaurantId: string): Promise<void> {
    const lastSync = await syncMetadata.get('menu_last_sync');

    const response = await apiClient.post('/api/sync/menu/sync/pull', {
      restaurant_id: restaurantId,
      last_sync_timestamp: lastSync || '1970-01-01T00:00:00Z',
      entity_types: ['categories', 'menu_items', 'modifier_groups', 'modifier_options', 'combos'],
    });

    if (response.data.success) {
      for (const change of response.data.data.changes) {
        switch (change.entity_type) {
          case 'categories':
            if (change.action === 'deleted') {
              await menuStorageService.deleteCategory(change.entity_id);
            } else {
              await menuStorageService.addOrUpdateCategory(change.data);
            }
            break;
          case 'menu_items':
            // Same pattern — upsert or delete locally
            break;
          // ... modifiers, combos
        }
      }
      await syncMetadata.set('menu_last_sync', response.data.data.server_timestamp);
    }
  }

  // Pull table/area data
  async pullTables(restaurantId: string): Promise<void> {
    const lastSync = await syncMetadata.get('table_last_sync');
    // Similar pattern — fetch changes, upsert locally
  }

  // Pull order updates (from other devices or web dashboard)
  async pullOrders(restaurantId: string): Promise<void> {
    const lastSync = await syncMetadata.get('order_last_sync');
    const response = await apiClient.post('/api/orders/sync/pull', {
      restaurant_id: restaurantId,
      last_sync_timestamp: lastSync || '1970-01-01T00:00:00Z',
      entity_types: ['orders', 'kitchen_tickets'],
    });
    // Process changes — update local orders that were modified on server
  }
}
```

### 1.4 Connect WebSocket to Real Service

**Current**: App exports `MockTableWebSocketService` and `DashboardWebSocketService` (mock)

**Change**: Wire up `TableWebSocketService` (real) and create a unified WebSocket manager

**File**: `POS-App/src/services/sync/WebSocketSyncManager.ts`

```typescript
class WebSocketSyncManager {
  private ws: WebSocket | null = null;

  connect(restaurantId: string) {
    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8080';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      // Subscribe to all channels for this restaurant
      this.subscribe('orders', restaurantId);
      this.subscribe('tables', restaurantId);
      this.subscribe('kitchen', restaurantId);
      this.subscribe('menu', restaurantId);
      this.subscribe('billing', restaurantId);
    };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this.handleMessage(msg);
    };
  }

  private handleMessage(msg: { channel: string; event: string; data: any }) {
    switch (msg.channel) {
      case 'menu':
        // Menu item updated on web dashboard
        // → Update local SQLite menu_items table
        // → Emit event so MenuContext refreshes
        menuStorageService.updateMenuItem(msg.data.id, msg.data);
        orderEventEmitter.emit('MENU_UPDATED', msg.data.id, msg.data);
        break;

      case 'tables':
        // Table created/updated on web dashboard
        // → Update local SQLite tables
        tableStorageService.updateTable(msg.data.id, msg.data);
        orderEventEmitter.emit('TABLE_STATUS_CHANGED', msg.data.id, msg.data);
        break;

      case 'orders':
        // Order updated on another device or web
        // → Update local SQLite orders table (if order exists locally)
        // → Only if the change is newer than local version
        break;

      case 'kitchen':
        // Kitchen ticket updated
        kitchenStorageService.updateTicket(msg.data.id, msg.data);
        break;
    }
  }
}
```

### 1.5 Replace Mock Exports with Real Implementations

**Current exports (mock)**:
```typescript
// POS-App/src/services/api/menu/MenuApiClient.ts
export const menuApiClient = new MockMenuApiClient(); // ← MOCK

// POS-App/src/services/api/table/TableApiClient.ts
export const tableApiClient = new FixedMockTableApiClient(); // ← MOCK
```

**Change to**:
```typescript
// MenuApiClient.ts
export const menuApiClient = new MenuApiClient(); // ← REAL

// TableApiClient.ts
export const tableApiClient = new TableApiClient(); // ← REAL
```

**BUT** keep mock as fallback for offline:
```typescript
import { NetworkService } from '../../network/NetworkService';

const realClient = new MenuApiClient();
const mockClient = new MockMenuApiClient(); // loads from SQLite

export const menuApiClient = new Proxy(realClient, {
  get(target, prop) {
    // If offline, fall back to mock (reads from local storage)
    if (!NetworkService.isOnline && typeof mockClient[prop] === 'function') {
      return mockClient[prop].bind(mockClient);
    }
    return target[prop];
  }
});
```

### 1.6 Wire SyncEngine into App Lifecycle

**File**: `POS-App/src/providers/OptimizedAppProviders.tsx`

```typescript
// After AuthProvider confirms login:
useEffect(() => {
  if (isAuthenticated && restaurant) {
    syncEngine.start(restaurant.id, authToken);

    return () => {
      syncEngine.stop();
    };
  }
}, [isAuthenticated, restaurant]);
```

**SyncProvider** (new context):
```typescript
// POS-App/src/context/sync/SyncProvider.tsx
export function SyncProvider({ children }) {
  const { isAuthenticated, restaurant } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Start/stop sync engine based on auth state
  // Provide sync status to UI (status bar indicator)
  // Manual sync trigger

  return (
    <SyncContext.Provider value={{ syncStatus, pendingCount, lastSyncTime, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}
```

---

## Sync Flow Diagrams

### Push Flow (Mobile → Server)

```
1. Waiter creates order on POS
   ↓
2. UnifiedOrderContext.submitToKitchen()
   → saves to SQLite (pending_sync = 1)
   → SyncQueueService.enqueue('order', orderId, 'create', orderData)
   ↓
3. SyncEngine push cycle (every 10s)
   → SyncQueueService.processBatch(orderSyncProcessor)
   → POST /api/orders/sync/push { changes: [...] }
   ↓
4. Core Service receives, saves to PostgreSQL
   → Publishes Kafka event 'ORDER_CREATED'
   → WebSocket broadcasts to all connected clients
   ↓
5. On success response:
   → SyncQueueService.markCompleted(itemId)
   → unifiedOrderStorageService.markAsSynced([orderId])
   → orders.pending_sync = 0, orders.synced_at = now
   ↓
6. Web Dashboard receives WebSocket message
   → Shows new order on order board
```

### Pull Flow (Server → Mobile)

```
1. Manager creates new menu item on Web Dashboard
   → POST /api/menu/items → saved to PostgreSQL
   → Kafka event 'menu-events' published
   → WebSocket broadcasts { channel: 'menu', event: 'item_created', data: {...} }
   ↓
2a. REAL-TIME PATH (WebSocket connected):
    → POS App WebSocketSyncManager receives message
    → menuStorageService.addMenuItem(data)
    → orderEventEmitter.emit('MENU_UPDATED')
    → MenuContext refreshes from storage
    → UI shows new item immediately
    ↓
2b. PERIODIC PATH (WebSocket disconnected / backup):
    → SyncEngine pull cycle (every 30s)
    → POST /api/sync/menu/sync/pull { last_sync_timestamp: '...' }
    → Response includes new menu item
    → menuStorageService.addMenuItem(data)
    → sync_metadata.menu_last_sync updated
```

### Conflict Resolution

```
Scenario: Two devices update same order simultaneously

Device A (POS Tablet 1):           Device B (POS Tablet 2):
  Update order status → 'preparing'   Update order item qty → 3
  pending_sync = 1                     pending_sync = 1
       ↓                                    ↓
  Push to server                       Push to server
       ↓                                    ↓
  Server applies (version 2)           Server detects conflict
       ↓                                    ↓
  Success                              Returns { status: 'conflict',
                                               server_version: 2,
                                               conflict_data: {...} }
                                            ↓
                                       SyncEngine merges:
                                       - Keep server status ('preparing')
                                       - Apply local item qty change
                                       - Push merged version
```

---

## Files to Create

```
POS-App/src/services/sync/
├── SyncEngine.ts                    — Main orchestrator
├── PullSyncService.ts              — Pull changes from server
├── WebSocketSyncManager.ts         — Real-time WebSocket handler
├── processors/
│   ├── OrderSyncProcessor.ts       — Push order changes
│   ├── KitchenSyncProcessor.ts     — Push kitchen ticket changes
│   └── PaymentSyncProcessor.ts     — Push payment changes
└── types.ts                         — Sync-related types

POS-App/src/context/sync/
├── SyncContext.tsx                   — Sync status context
└── SyncProvider.tsx                  — Sync lifecycle provider
```

## Files to Modify

```
POS-App/src/services/api/menu/MenuApiClient.ts
  → Change export from MockMenuApiClient to MenuApiClient (with offline fallback)

POS-App/src/services/api/table/TableApiClient.ts
  → Change export from FixedMockTableApiClient to TableApiClient (with offline fallback)

POS-App/src/providers/OptimizedAppProviders.tsx
  → Add SyncProvider to provider tree

POS-App/src/services/storage/MenuStorageService.ts
  → Add addOrUpdateCategory(), addOrUpdateMenuItem() upsert methods

POS-App/src/services/storage/TableStorageService.ts
  → Add addOrUpdateTable() upsert method
```

---

## Success Criteria

- [ ] Orders created on POS app appear in PostgreSQL within 10 seconds
- [ ] Menu items created on web dashboard appear on POS app within 5 seconds (WebSocket) or 30 seconds (pull)
- [ ] Tables created on web dashboard appear on POS app
- [ ] Kitchen ticket status updates sync to server
- [ ] Payment records sync to server
- [ ] Offline orders queue up and sync when network returns
- [ ] Sync status indicator shows in app (pending count, last sync time)
- [ ] No duplicate records after sync (idempotent operations)
- [ ] App starts with full sync pulling latest data
