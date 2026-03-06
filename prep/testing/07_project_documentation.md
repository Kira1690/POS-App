# POS System — Complete Project Documentation

## Last Updated: 2026-03-06

---

## 1. System Architecture

### Microservices

| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| API Gateway | 8080 | Express/Bun | Route proxying, auth middleware |
| Auth Service | 3000 | Node.js/Prisma/PostgreSQL | JWT auth, RBAC, user management |
| Core Service | 5005 | Node.js/Prisma/PostgreSQL | Orders, tables, billing, reports, kitchen |
| Menu Service | 5003 | Node.js/Prisma/PostgreSQL | Menu items, categories, modifiers, combos |
| Web Dashboard | 5173 | React/Vite/Tailwind | Admin/management web interface |
| Mobile POS App | 8081 (Metro) | React Native/Expo SDK 53 | Tablet POS for restaurant staff |

### Repositories

| Repository | Branch | Description |
|------------|--------|-------------|
| `POS-API-Gateway` | main | Express gateway proxying to all services |
| `POS-Authentication` | main | Auth microservice (JWT, Prisma, PostgreSQL) |
| `POS-Authentication-Frontend` | main | React web dashboard (Vite + Tailwind) |
| `POS-Services/POS-Core-Service` | main | Orders, tables, billing, reports, kitchen |
| `POS-Services/POS-Menu-Service` | main | Menu management microservice |
| `POS-App` | feature/testing-01 | React Native mobile POS app |

---

## 2. Web Dashboard (POS-Authentication-Frontend)

### Tech Stack
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS (indigo primary)
- Zustand state management
- Recharts for analytics
- lucide-react icons
- react-hook-form for forms

### Pages (16 total)

| Route | Page | Roles | Description |
|-------|------|-------|-------------|
| `/` | Dashboard | all admin | Overview stats, quick actions |
| `/menu` | MenuPage | admin, store_admin | 4-tab CRUD: Categories, Items, Modifiers, Combos |
| `/orders` | OrdersPage | admin, store_admin | Live order board with WebSocket |
| `/tables` | TablesPage | admin, store_admin | Floor plan grid view |
| `/kitchen` | KitchenPage | admin, store_admin | Kanban ticket board |
| `/staff` | StaffPage | admin, store_admin | Staff list with role filter |
| `/billing` | BillingPage | admin, store_admin | Transaction list + status updates |
| `/customers` | CustomersPage | admin, store_admin | Customer directory |
| `/discounts` | DiscountsPage | admin, store_admin | Discount CRUD management |
| `/reports` | ReportsPage | admin, store_admin | Sales analytics, top items, staff performance |
| `/report-emails` | ReportSubscriptions | admin, store_admin | Email report scheduling |
| `/users` | UsersPage | system_admin | User account management |
| `/stores` | StoresPage | admin, store_admin | Multi-store management |
| `/logs` | LogsPage | system_admin | Audit logs |
| `/store-report-settings` | StoreReportSettings | system_admin | Store report config |
| `/account` | AccountPage | all | User profile settings |

### State Management (Zustand Stores)

| Store | File | Data |
|-------|------|------|
| authStore | `stores/authStore.ts` | User session, tokens, permissions |
| menuStore | `stores/menuStore.ts` | Categories, items, modifiers, combos |
| ordersStore | `stores/ordersStore.ts` | Orders with real-time updates |
| tablesStore | `stores/tablesStore.ts` | Table layout and status |
| kitchenStore | `stores/kitchenStore.ts` | Kitchen tickets/queue |
| billingStore | `stores/billingStore.ts` | Transactions, payment status |
| customersStore | `stores/customersStore.ts` | Customer directory |
| discountStore | `stores/discountStore.ts` | Discount rules |
| reportsStore | `stores/reportsStore.ts` | Analytics data |
| usersStore | `stores/usersStore.ts` | User accounts (admin) |
| websocketStore | `stores/websocketStore.ts` | WS connection state |

### API Services

| Service | File | Endpoints |
|---------|------|-----------|
| apiClient | `services/apiClient.ts` | Axios singleton, cookie auth, auto-refresh |
| menuService | `services/menuService.ts` | `/api/menu/*`, `/api/categories/*` |
| orderService | `services/orderService.ts` | `/api/orders/*` |
| tableService | `services/tableService.ts` | `/api/tables/*`, `/api/sections/*` |
| kitchenService | `services/kitchenService.ts` | `/api/kitchen/*` |
| billingService | `services/billingService.ts` | `/api/billing/*` |
| customersService | `services/customersService.ts` | `/api/customers/*` |
| discountService | `services/discountService.ts` | `/api/billing/discounts/*` |
| reportsService | `services/reportsService.ts` | `/api/reports/*` |

### E2E Tests (Playwright)

**Total: 261+ tests across 25+ spec files**

| Category | Specs | Tests |
|----------|-------|-------|
| Core pages | 12 files | 74 tests (billing, customers, dashboard, kitchen, logs, menu, orders, report-emails, reports, staff, stores, tables) |
| QA automation | 5 files | 50+ tests (create-qa-accounts, permission-matrix, sync-verification, page-comparison, settings-sync) |
| Stress tests | 2 files | token-refresh-stress, network-error-verification |
| Production setup | 1 file | production-setup (7 tests) |

---

## 3. Mobile POS App (POS-App)

### Tech Stack
- React Native 0.79.5 + Expo SDK 53
- TypeScript (strict mode)
- React Navigation 6 (Stack, Tabs, Drawer)
- expo-sqlite for local database
- Context API + useReducer
- Axios with interceptors

### Screens

| Tab | Screen | Features |
|-----|--------|----------|
| Dashboard | DashboardScreen | Order stats, quick actions, restaurant info |
| Order Management | OrderManagementScreen | Order list, status filters, payment filters |
| Order Management | POSOrderScreen | Item grid, cart panel, table select, discount, split bill |
| Order Management | BillScreen | Order summary, discount, payment initiation |
| Order Management | BillSplitScreen | Equal/items/payment split modes |
| Order Management | PaymentScreen | Cash/card/mobile/gift card processing |
| Kitchen Operations | KitchenScreen | Order queue, status updates, timer |
| Settings | SettingsScreen | 6 tabs: General, Tables, Menu, Printer, Staff, Sync |

### Offline Architecture

The app is designed **offline-first** with these mechanisms:

1. **Dummy Authentication** (`dummyData.ts`)
   - Pre-configured credentials work without network
   - `manager@foodcorner.com / manager123` — primary test account
   - Falls back to AsyncStorage cached sessions on network failure

2. **SQLite Storage Services**
   - `MenuStorageService` — Categories, items, modifiers, combos
   - `TableStorageService` — Tables, areas/sections
   - `UnifiedOrderStorageService` — Orders, payments, sync queue

3. **Mock Data Seeding**
   - `SEED_DEMO_DATA: true` in `config.ts` enables auto-seeding
   - 5 menu categories + 7 items seeded on first launch
   - 30 tables + 4 area sections seeded on first launch
   - Controlled by `DEV_FLAGS.SEED_DEMO_DATA`

4. **Sync Engine** (when online)
   - Push: local changes → API Gateway every 10 seconds
   - Pull: server data → SQLite cache
   - Queue-based with retry logic
   - Auto-reconnect on network restore

### Key Services

| Service | Purpose |
|---------|---------|
| CoreAuthService | Login flow: dummy → API → AsyncStorage fallback |
| MenuStorageService | SQLite CRUD for menu data + seeding |
| TableStorageService | SQLite CRUD for tables/areas + seeding |
| UnifiedOrderStorageService | Order persistence + payment tracking |
| SyncEngine | Bidirectional sync with server |
| PaymentService | Cash/card payment processing |

---

## 4. API Gateway Routes

### Auth Service Proxy (`/api/auth/*`)
- POST `/api/auth/login` — Login
- POST `/api/auth/register` — Register
- POST `/api/auth/refresh-token` — Token refresh
- GET `/api/auth/users` — User listing
- Various user/store management endpoints

### Core Service Proxy
- `/api/orders/*` — Order CRUD + status updates
- `/api/tables/*` — Table management
- `/api/sections/*` — Section/area management
- `/api/kitchen/*` — Kitchen operations
- `/api/customers/*` — Customer directory
- `/api/billing/*` — Transactions + discounts
- `/api/reports/*` — Sales analytics
- `/api/reservations/*` — Table reservations
- `/api/sync/orders` — Mobile sync endpoint

### Menu Service Proxy
- `/api/menu/*` — Menu items
- `/api/categories/*` — Categories
- `/api/modifiers/*` — Modifier groups
- `/api/combos/*` — Combo deals
- `/api/inventory/*` — Inventory tracking
- `/api/sync/menu` — Menu sync endpoint

---

## 5. Role-Based Access Control

### Roles

| Role | Web Access | Mobile Access |
|------|-----------|---------------|
| super_admin | All pages | N/A |
| system_admin | All pages | N/A |
| store_admin | All except /logs, /store-report-settings | All screens |
| manager | menu, orders, tables, kitchen, staff, reports, customers | All screens |
| waiter | orders, tables | Orders, Tables |
| kitchen_staff | kitchen | Kitchen only |
| cashier | orders, billing | Orders, Payment |

### Verified Permissions (Playwright e2e)
- system_admin: 15/15 pages accessible ✅
- store_admin: 13/15 pages (blocked from /logs, /store-report-settings) ✅
- 74 permission tests passed

---

## 6. Database Schema

### Auth Service (PostgreSQL via Prisma)
- Users, Roles, Permissions, Sessions, Restaurants, Stores

### Core Service (PostgreSQL via Prisma)
- Orders, OrderItems, Tables, Sections, Customers, Transactions, Payments
- Kitchen queue, Reservations, Reports

### Menu Service (PostgreSQL via Prisma)
- Categories, MenuItems, ModifierGroups, Modifiers, Combos, ComboItems
- Inventory, Suppliers

### Mobile App (SQLite via expo-sqlite)
- menu_categories, menu_items, modifier_groups, combos
- tables, areas
- unified_orders, order_items, payments
- sync_queue

---

## 7. Test Credentials

### Development (Dummy — No Server Required)

| Email | Password | Role | Restaurant |
|-------|----------|------|-----------|
| manager@foodcorner.com | manager123 | MANAGER | The Food Corner |
| admin@foodcorner.com | admin123 | ADMIN | The Food Corner |
| superadmin@foodpos.com | super123 | SUPERADMIN | System |
| EMP001 | staff123 | STAFF | The Food Corner |
| CHEF001 | kitchen123 | KITCHEN | The Food Corner |

### QA Environment (Server Required)

| Email | Password | Role |
|-------|----------|------|
| qa.sysadmin@pos.test | Test1234 | system_admin |
| admin@system.com | SuperAdmin123! | system_admin |
| superadmin@pos.com | SuperAdmin123! | super_admin |
| admin@blueplatebistro.io | (bistro admin) | store_admin |

### Production QA

| Email | Password | Role |
|-------|----------|------|
| qa-prod-admin@blueplate.io | QAProd2026! | store_admin |
| qa-prod-manager@blueplate.io | QAProdMgr2026! | manager |
| qa-prod-waiter@blueplate.io | QAProdWtr2026! | waiter |
| qa-prod-kitchen@blueplate.io | QAProdKit2026! | kitchen_staff |
| qa-prod-cashier@blueplate.io | QAProdCsh2026! | cashier |

---

## 8. Feature Status Matrix

| Feature | Mobile POS | Web Dashboard | Backend | Status |
|---------|-----------|---------------|---------|--------|
| Authentication (JWT) | ✅ | ✅ | ✅ | Complete |
| Offline login (dummy) | ✅ | N/A | N/A | Complete |
| Menu browsing | ✅ | ✅ | ✅ | Complete |
| Menu CRUD | ✅ (Settings) | ✅ (4-tab) | ✅ | Complete |
| Order creation | ✅ | ✅ | ✅ | Complete |
| Order management | ✅ | ✅ | ✅ | Complete |
| Table selection (area tabs) | ✅ (4 areas) | ✅ (grid) | ✅ | Complete |
| Kitchen operations | ✅ | ✅ (Kanban) | ✅ | Complete |
| Cash payment | ✅ | ✅ (view) | ✅ | Complete |
| Card payment | ✅ (UI) | ✅ (view) | ✅ | Complete |
| Split bill (equal/items/payment) | ✅ | N/A | N/A | Complete |
| Discount (order-level) | ✅ | ✅ (CRUD) | ✅ | Complete |
| Customer management | ✅ (search) | ✅ | ✅ | Complete |
| Staff management | N/A | ✅ | ✅ | Complete |
| Reports & analytics | N/A | ✅ (Recharts) | ✅ | Complete |
| Report email scheduling | N/A | ✅ | ✅ | Complete |
| Billing/transactions | ✅ | ✅ | ✅ | Complete |
| Multi-store support | N/A | ✅ | ✅ | Complete |
| Audit logs | N/A | ✅ | ✅ | Complete |
| Sync (mobile↔server) | ✅ | N/A | ✅ | Complete |
| Offline mode | ✅ | N/A | N/A | Complete |
| Responsive layouts | ✅ (3 breakpoints) | ✅ | N/A | Complete |
| WebSocket real-time | ✅ | ✅ | ✅ | Complete |
| Receipt printing | ✅ (UI) | N/A | N/A | UI Complete |
| Barcode scanning | ✅ (flag) | N/A | N/A | Flagged |

---

## 9. Known Issues

| # | Description | Location | Severity | Status |
|---|-------------|----------|----------|--------|
| 1 | Discount modal shows $0.00 in edit mode | POSOrderScreen | Low | Known |
| 2 | "Already Ordered" item shows $NaN in edit mode | POSOrderScreen | Low | Known |
| 3 | Payment receipt "+ New Order" unresponsive on first tap | PaymentReceipt | Low | Known |
| 4 | Floor Plan Editor is Phase 3 stub | TablesSettings | Info | Planned |

---

## 10. Development Setup

### Prerequisites
- Node.js 18+
- Bun runtime (for API Gateway)
- PostgreSQL
- Android SDK (for mobile emulator)
- Expo CLI

### Start All Services
```bash
# API Gateway
cd POS-API-Gateway && bun run dev

# Auth Service
cd POS-Authentication && bun run dev

# Core Service
cd POS-Services/POS-Core-Service && bun run dev

# Menu Service
cd POS-Services/POS-Menu-Service && bun run dev

# Web Dashboard
cd POS-Authentication-Frontend && npm run dev

# Mobile App
cd POS-App && npx expo start --dev-client --port 8081
```

### Android Emulator
```bash
export ANDROID_HOME=/home/kira/Android/Sdk
$ANDROID_HOME/emulator/emulator -avd POS_Tablet -no-audio -gpu swiftshader_indirect
adb reverse tcp:8081 tcp:8081  # Metro bundler
adb reverse tcp:8080 tcp:8080  # API Gateway (if needed)
```

### Run E2E Tests
```bash
cd POS-Authentication-Frontend
npx playwright test              # All tests
npx playwright test --ui         # UI mode
npx playwright test e2e/pages/   # Page tests only
```
