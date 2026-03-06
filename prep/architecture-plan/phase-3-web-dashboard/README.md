# Phase 3: Web Dashboard Expansion

## Objective
Extend POS-Authentication-Frontend to let managers/admins create and manage menus, view tables, monitor orders, and manage staff — all syncing to the POS mobile app via the backend.

---

## Scope: What Web Dashboard Can Do

### Full CRUD (Same as Mobile)
- Menu categories (create, edit, delete, reorder)
- Menu items (create, edit, delete, pricing, availability)
- Modifier groups and options
- Combo deals
- Users/staff (already exists)
- Store settings (already exists)

### View + Limited Edit
- Tables (create basic, view status — no drag-drop floor plan)
- Orders (view live board, cancel — no create)
- Kitchen (view ticket status, monitor — no ticket management)
- Inventory (view stock, adjust — no full PO system)
- Customers (view profiles, search)

### Full Management (Web-Only Features)
- Reports (detailed analytics, export)
- Audit logs (already exists)
- Staff scheduling
- Role/permission management
- Store configuration

---

## New Pages to Build

### 3.1 Menu Management (`/menu`)

The highest-priority new page. Managers create menus here, and changes sync to all POS devices.

**Sub-routes**:
```
/menu                    — Overview (category tabs + item grid)
/menu/categories         — Category management
/menu/items/new          — Create menu item
/menu/items/:id/edit     — Edit menu item
/menu/modifiers          — Modifier groups
/menu/combos             — Combo deals
```

**API Calls** (through API Gateway → Menu Service):
```
GET    /api/menu/categories              — List categories
POST   /api/menu/categories              — Create category
PUT    /api/menu/categories/:id          — Update category
DELETE /api/menu/categories/:id          — Delete category

GET    /api/menu/items                   — List items (with filters)
POST   /api/menu/items                   — Create item
PUT    /api/menu/items/:id               — Update item
DELETE /api/menu/items/:id               — Delete item
PATCH  /api/menu/items/bulk/status       — Bulk toggle availability
PATCH  /api/menu/items/bulk/price        — Bulk price update

GET    /api/menu/modifier-groups         — List modifier groups
POST   /api/menu/modifier-groups         — Create modifier group
PUT    /api/menu/modifier-groups/:id     — Update
POST   /api/menu/modifier-groups/:gid/options — Add option

GET    /api/menu/combos                  — List combos
POST   /api/menu/combos                  — Create combo
PUT    /api/menu/combos/:id              — Update combo
```

**Zustand Store**: `menuStore.ts`
```typescript
interface MenuStore {
  categories: Category[];
  menuItems: MenuItem[];
  modifierGroups: ModifierGroup[];
  combos: ComboDeal[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryRequest) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryRequest) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  fetchMenuItems: (filters?: MenuItemFilters) => Promise<void>;
  createMenuItem: (data: CreateMenuItemRequest) => Promise<void>;
  updateMenuItem: (id: string, data: UpdateMenuItemRequest) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;

  fetchModifierGroups: () => Promise<void>;
  createModifierGroup: (data: CreateModifierGroupRequest) => Promise<void>;

  fetchCombos: () => Promise<void>;
  createCombo: (data: CreateComboRequest) => Promise<void>;
}
```

**When manager saves a menu item on web**:
```
1. POST /api/menu/items → Menu Service saves to PostgreSQL
2. Menu Service publishes Kafka event 'menu-events'
3. Core Service receives → broadcasts WebSocket { channel: 'menu', event: 'item_created' }
4. POS App receives WebSocket → updates local SQLite → UI refreshes
```

### 3.2 Live Orders Dashboard (`/orders`)

View-only order monitoring with Kanban board.

**Sub-routes**:
```
/orders                  — Kanban board (columns by status)
/orders/:id              — Order detail (slide-out panel)
```

**API Calls**:
```
GET    /api/orders                       — List orders (with status filter)
GET    /api/orders/:id                   — Order detail with items
PATCH  /api/orders/:id/status            — Cancel order (manager action)
GET    /api/orders/active                — Active orders only
```

**Real-time**: WebSocket subscription to `orders` channel for live updates.

### 3.3 Tables View (`/tables`)

Basic table management. Create tables, view status. No floor plan editor (that's mobile-only).

**Sub-routes**:
```
/tables                  — Table grid with status indicators
/tables/new              — Create table form
/tables/:id              — Table detail
```

**API Calls**:
```
GET    /api/tables                       — List tables
POST   /api/tables                       — Create table
PUT    /api/tables/:id                   — Update table
DELETE /api/tables/:id                   — Delete table
```

### 3.4 Kitchen Monitor (`/kitchen`)

Read-only kitchen dashboard showing ticket status and metrics.

```
/kitchen                 — Live ticket board (grouped by station)
```

**API Calls**:
```
GET    /api/kitchen/tickets              — List active tickets
GET    /api/reports/kitchen-performance  — Kitchen metrics
```

### 3.5 Staff Management (`/staff`)

Create and manage restaurant staff.

```
/staff                   — Staff directory
/staff/new               — Create staff member (uses admin auth API)
/staff/:id               — Staff detail + role assignment
```

**API Calls** (existing):
```
POST   /api/auth/admin/register          — Create user
GET    /api/auth/list                    — List users
PUT    /api/auth/admin/user/:id          — Update user
POST   /api/auth/admin/user/:id/restaurant — Assign to restaurant
```

### 3.6 Reports (`/reports`)

Enhanced reporting with charts.

```
/reports                 — Reports hub
/reports/sales           — Sales analytics
/reports/items           — Item sales breakdown
/reports/staff           — Staff performance
```

**API Calls**:
```
GET    /api/reports/daily-sales          — Daily sales data
GET    /api/reports/item-sales           — Item-level data
GET    /api/reports/staff-performance    — Staff metrics
```

---

## Files to Create

```
POS-Authentication-Frontend/src/
├── pages/
│   ├── menu/
│   │   ├── MenuPage.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── MenuItemForm.tsx
│   │   ├── MenuItemGrid.tsx
│   │   ├── ModifierGroupManager.tsx
│   │   └── ComboManager.tsx
│   ├── orders/
│   │   ├── OrdersPage.tsx
│   │   ├── OrderBoard.tsx
│   │   ├── OrderCard.tsx
│   │   └── OrderDetail.tsx
│   ├── tables/
│   │   ├── TablesPage.tsx
│   │   ├── TableGrid.tsx
│   │   └── TableForm.tsx
│   ├── kitchen/
│   │   └── KitchenMonitor.tsx
│   ├── staff/
│   │   ├── StaffPage.tsx
│   │   └── StaffForm.tsx
│   └── reports/
│       ├── ReportsPage.tsx
│       ├── SalesReport.tsx
│       └── ItemReport.tsx
├── stores/
│   ├── menuStore.ts
│   ├── ordersStore.ts
│   ├── tablesStore.ts
│   ├── kitchenStore.ts
│   ├── staffStore.ts
│   └── reportsStore.ts
├── services/
│   ├── menuService.ts
│   ├── orderService.ts
│   ├── tableService.ts
│   ├── kitchenService.ts
│   ├── reportsService.ts
│   └── websocketService.ts
└── components/
    ├── Menu/
    │   ├── CategoryCard.tsx
    │   ├── MenuItemCard.tsx
    │   └── ModifierEditor.tsx
    ├── Orders/
    │   ├── KanbanColumn.tsx
    │   └── OrderStatusBadge.tsx
    └── Tables/
        ├── TableStatusCard.tsx
        └── TableStatusBadge.tsx
```

## Files to Modify

```
POS-Authentication-Frontend/src/App.tsx
  → Add new routes

POS-Authentication-Frontend/src/components/Layout/Sidebar.tsx
  → Add new navigation items (role-filtered)

POS-Authentication-Frontend/src/services/apiClient.ts
  → Ensure base URL points to API Gateway
```

---

## Success Criteria

- [ ] Menu CRUD works end-to-end (web → API → PostgreSQL → Kafka → WebSocket → POS app)
- [ ] Live order board shows real-time order updates
- [ ] Table grid shows real-time table status
- [ ] Kitchen monitor shows live ticket queue
- [ ] Staff management creates users who can log in on POS app
- [ ] Reports render with charts (Recharts)
- [ ] Sidebar navigation filtered by role
- [ ] All pages responsive (desktop + tablet)
