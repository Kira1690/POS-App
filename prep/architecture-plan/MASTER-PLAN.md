# POS Application - Master Plan (Updated)

## Priority: SYNC FIRST, Everything Else Follows

The #1 goal is making the SQLite database on the POS mobile app sync perfectly with the PostgreSQL backend. **No schema changes.** Work with what exists.

---

## What Exists Today (POS-App SQLite)

### SQLite Schema (Version 4) — 20+ Tables

**Reference Tables (Server → Client, read-only on mobile)**:
- `restaurants`, `users`, `table_areas`, `tables`
- `menu_categories`, `menu_items`, `modifier_groups`, `modifier_options`
- `menu_item_modifier_assignments`, `combo_deals`, `combo_items`

**Transactional Tables (Bidirectional sync, `pending_sync` flag)**:
- `orders` (with `pending_sync`, `synced_at`)
- `order_items` (synced as part of order payload)
- `kitchen_tickets` (with `pending_sync`, `synced_at`)
- `payment_records` (with `pending_sync`, `synced_at`)
- `payment_transactions` (with `pending_sync`, `synced_at`)
- `bill_splits`, `receipts`

**Local-Only Tables (Never sync)**:
- `carts`, `station_configs`, `auth_session`, `payment_config`, `terminal_settings`

**Sync Infrastructure Tables (Already built)**:
- `sync_queue` (priority-based queue with retry logic)
- `sync_errors` (error tracking with resolution)
- `sync_metadata` (last sync timestamps, schema version)

### What's Already Built for Sync
- `SyncQueueService` with priority queue, exponential backoff, batch processing
- `pending_sync = 1` flag on transactional tables
- `getUnsyncedOrders()`, `getUnsyncedTickets()`, `getUnsyncedPayments()` methods
- `markAsSynced()` methods on all storage services
- Backend has `/api/orders/sync/pull` and `/api/orders/sync/push` endpoints
- Backend has `/api/sync/menu/sync/pull` and `/api/sync/menu/sync/push` endpoints
- Kafka event bus for inter-service communication
- WebSocket server on Core Service for real-time pushes

### What's NOT Working Yet
1. **Sync processors not connected** — SyncQueueService has `processBatch(callback)` but no actual API-calling processor is wired up
2. **Pull sync not running** — No periodic pull from server to get reference data updates
3. **WebSocket not connected** — Real WebSocket service exists but app uses mocks
4. **Mock services in use** — Menu and Table API clients export mock implementations
5. **Backend sync endpoints need verification** — Pull/push endpoints exist but may need alignment with SQLite schema

---

## Architecture — How Sync Will Work

```
┌──────────────────────────────────────────────────────────────┐
│                      POS MOBILE APP                           │
│                                                               │
│  ┌─────────┐    ┌──────────────┐    ┌───────────────────┐   │
│  │ Context  │◄──►│   Storage    │◄──►│    SQLite DB      │   │
│  │Providers │    │  Services    │    │  (pos_app.db)     │   │
│  └────┬─────┘    └──────┬───────┘    └───────────────────┘   │
│       │                 │                                     │
│       │          ┌──────▼───────┐                            │
│       │          │  SyncEngine  │  ◄── NEW: orchestrator     │
│       │          │              │                             │
│       │          │ ┌──────────┐ │                            │
│       │          │ │SyncQueue │ │  ◄── EXISTS: push queue    │
│       │          │ │Service   │ │                             │
│       │          │ └──────────┘ │                            │
│       │          │ ┌──────────┐ │                            │
│       │          │ │PullSync  │ │  ◄── NEW: pull scheduler   │
│       │          │ │Scheduler │ │                             │
│       │          │ └──────────┘ │                            │
│       │          │ ┌──────────┐ │                            │
│       │          │ │WebSocket │ │  ◄── EXISTS: needs wiring  │
│       │          │ │Listener  │ │                             │
│       │          │ └──────────┘ │                            │
│       │          └──────┬───────┘                            │
│       │                 │                                     │
└───────┼─────────────────┼─────────────────────────────────────┘
        │                 │
        │          ┌──────▼───────┐
        │          │  API Gateway │  (port 8080)
        │          └──────┬───────┘
        │                 │
        │     ┌───────────┼───────────────┐
        │     ▼           ▼               ▼
        │  Auth Svc    Core Svc       Menu Svc
        │  (3000)      (5005)         (5003)
        │              WebSocket
        │              Kafka
        │                 │
        │          ┌──────▼───────┐
        │          │  PostgreSQL  │
        │          └──────────────┘
        │
┌───────▼──────────────────────────────────────────────────────┐
│                     WEB DASHBOARD                             │
│  (React + Vite + Zustand)                                    │
│                                                               │
│  Manager/Admin creates:                                       │
│  - Users, Menu items, Categories                              │
│  - Store settings, Reports                                    │
│                                                               │
│  Changes → API → PostgreSQL → Kafka Event → WebSocket Push   │
│  → POS App receives update → Updates SQLite                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Phases (Reordered by Priority)

| Phase | Name | What | Priority |
|-------|------|------|----------|
| 1 | **Sync Engine** | Wire up push/pull sync, connect WebSocket, replace mocks | CRITICAL |
| 2 | **Backend Schema Alignment** | Ensure PostgreSQL matches SQLite field-for-field | CRITICAL |
| 3 | **Web Dashboard Expansion** | Add menu, table, order pages to web dashboard | HIGH |
| 4 | **Role Access** | Enforce RBAC across API + both frontends | HIGH |
| 5 | **Real-Time Events** | Kafka → WebSocket pipeline for live updates | MEDIUM |
| 6 | **Testing & Polish** | End-to-end sync tests, offline scenarios | MEDIUM |

> **NOTE: SBOS (Payroll/Scheduling) is OUT OF SCOPE.** We are not integrating payroll, scheduling, tip management, or any SBOS features. Simple user management through the existing Auth Service is sufficient. SBOS remains a separate standalone system.

---

## Control Authority

| Feature | Web Dashboard | POS Mobile App |
|---------|:---:|:---:|
| Create users/staff | Full | - |
| Create/edit menu items | Full | Full (same detail) |
| Create/edit categories | Full | Full |
| Create/edit modifiers | Full | Full |
| Create/edit combo deals | Full | Full |
| Create tables | Basic | Full (position, shape, areas) |
| Manage floor plan | View only | Full (drag-drop) |
| Create orders | - | Full |
| Kitchen management | View/Monitor | Full (ticket status) |
| Process payments | - | Full |
| View reports | Full | Full |
| Store settings | Full | Read-only |
| Inventory | Full | View |

---

## File References

- Phase 1 (Sync Engine): `./phase-1-sync-engine/README.md`
- Phase 2 (Schema Alignment): `./phase-2-schema-alignment/README.md`
- Phase 3 (Web Dashboard): `./phase-3-web-dashboard/README.md`
- Phase 4 (Role Access): `./phase-4-role-access/README.md`
- Phase 5 (Real-Time): `./phase-5-realtime-events/README.md`
- Phase 6 (Testing): `./phase-6-testing/README.md`
