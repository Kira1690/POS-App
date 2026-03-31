# Sprint 4 Bug Tracker

## Overview

| Metric | Count |
|--------|-------|
| Total bugs identified | 35 |
| Bugs fixed and verified | 35 |
| Critical | 12 |
| High | 12 |
| Medium | 11 |
| Repos affected | 5 (POS-App, Web Frontend, Core Service, Menu Service, API Gateway) |

---

## Phase 1: Sprint 4 Core Bugs (#9 - #15)

_Sessions 1-5 (March 27-29, 2026)_

| # | Bug | Severity | Status |
|---|-----|----------|--------|
| 9 | Schema misalignment between server, mobile, and web table/section fields | Critical | Fixed |
| 10 | Cold boot sync taking 30+ seconds due to full table initialization | High | Fixed |
| 11 | Cross-device sync broken — orders created on mobile not appearing on web | Critical | Fixed |
| 12 | TRX terminal tax calculation wrong — $0 CC surcharge on card payments | Critical | Fixed |
| 13 | TRX amount mismatch — terminal charged different amount than displayed | Critical | Fixed |
| 14 | TCP subnet check failing for emulator-to-terminal connectivity | Medium | Fixed |
| 15 | Playwright test regressions after Sprint 3 web changes | High | Fixed |

**Verification:** Playwright 452 passed, 0 failed, 8 skipped. Two real TRX terminal payments verified ($21.44 + $22.08).

---

## Phase 2: Critical Demo Bugs (#16 - #22)

_Sessions 7-8 (March 30, 2026) — "Phase 6: Fucked Up Bugs"_

| # | Bug | Severity | Root Cause | Files Modified |
|---|-----|----------|------------|----------------|
| 16 | Kitchen status reverts immediately after tapping Start/Ready | Critical | Bottom tab `MainNavigator.tsx` used old `KitchenDisplayScreen` (sync-engine based) instead of `KitchenStaffDashboard` (direct API). Sync poll overwrote optimistic UI updates. | `MainNavigator.tsx`, `KitchenStaffDashboard.tsx`, `UnifiedOrderContext.tsx` |
| 17 | Billing not tracked when paying from Order Management list | Critical | Three causes: (1) `processCardPayment`/`processSplitPayment` had no sync logic, (2) `processPayment` rejected 'ready' orders silently, (3) `OrderManagementScreen` didn't pass order object to Bill navigation. | `PaymentService.ts`, `UnifiedOrderContext.tsx`, `unifiedOrderReducer.ts`, `OrderManagementScreen.tsx` |
| 18 | Web dashboard KPIs never update after payment | High | `websocketStore.ts` didn't call `dashboardStore.fetchKPIs()` on billing/order WS events. | `websocketStore.ts` |
| 19 | Reports showing $0 revenue — timezone bug | High | `report.service.ts` used `setHours(23,59,59)` (local IST = UTC+5:30) instead of `setUTCHours`, shifting end-of-day boundary to 18:29 UTC. | `report.service.ts` (4 occurrences) |
| 20 | Table selection modal stuck on "Loading..." | High | `refreshTables()` promise stuck forever from dedup guard that never resolved. | `OrderManagementScreen.tsx`, `TableSelectionModal.tsx`, `TableActions.ts` |
| 21 | PROCESS_PAYMENT reducer rejecting 'ready' orders | Medium | Reducer only accepted `status === 'served'` but `canAcceptPayment` allowed both 'ready' and 'served'. | `unifiedOrderReducer.ts` |
| 22 | Web dashboard auto-merge on WS status change | Medium | Blind `fetchOrders()` on every WS event instead of merging status data in-place. | `websocketStore.ts`, `ordersStore.ts` |

**Verification:** Kitchen confirmed-preparing-ready-served all held with no revert. DB and web in sync. Payment tracked from both order detail and order list views.

---

## Phase 3: Modifier/Addon System (#23 - #28)

_Session 9 (March 30, 2026)_

| # | Bug | Severity | Root Cause | Files Modified |
|---|-----|----------|------------|----------------|
| 23 | Render crash: `priceAdjustment.toFixed is not a function` | Critical | `price_adjustment` from server Prisma Decimal type arrives as string or undefined. Direct `.toFixed()` call crashes. | `ModifierGroupCard.tsx`, `ComboCard.tsx`, `ComboList.tsx`, `PaymentSummary.tsx`, `ModifierSelectionModal.tsx`, `OrderCart.tsx`, `MenuItemCard.tsx`, `SendToKitchenModal.tsx` |
| 24 | Modifiers not synced to server on order submission | Critical | `buildOrderSyncPayload()` and `submitToKitchen()` in `UnifiedOrderContext.tsx` excluded `selected_modifiers` from order items payload. | `UnifiedOrderContext.tsx` |
| 25 | Server deserializer crash on nested modifier format | High | `modifiersFromAppFormat()` only handled flat `{modifier_id, name, price_adjustment}` format, not nested `SelectedModifier[]` with `{groupId, options: [{optionId}]}`. | `order.serializer.ts` (Core Service) |
| 26 | Modifier assignments not synced from server to mobile SQLite | High | `addMenuItem()` in `MenuStorageService` didn't convert Prisma's nested `modifier_groups` relation data into `modifier_assignments` in SQLite. | `MenuStorageService.ts` |
| 27 | No modifier groups assigned to menu items in database | Medium | `menu_item_modifier_groups` table was empty — modifier groups existed but were never linked to items. | DB: 12 assignments created |
| 28 | Emulator cannot reach API — wrong .env URL | Medium | `.env` had LAN IP `192.168.1.9` instead of Android emulator localhost alias `10.0.2.2`. | `POS-App/.env` |

**Verification:** Modifier modal opens for items with assigned modifiers. Selected modifiers save to SQLite. Modifiers sync to server `order_item_modifiers` table with correct IDs and prices. BBQ Bacon Burger with Bacon (+$1.50) verified end-to-end.

---

## Phase 4: Single Source of Truth + Dashboard (#29 - #35)

_Session 10 (March 30-31, 2026)_

| # | Bug | Severity | Root Cause | Files Modified |
|---|-----|----------|------------|----------------|
| 29 | Billing transactions stuck at "Pending" status | Critical | `order.service.ts` created transactions with Prisma default `status: 'pending'` and the follow-up update only set payment details, not status. `addPayment()` (the only place status becomes 'completed') was never called in the payment flow. | `order.service.ts` (Core Service) |
| 30 | Web and mobile dashboard revenue numbers don't match | Critical | Web calculated revenue client-side from orders using `created_at` date. Mobile used server API using `completed_at`. Different date fields + different timezone handling = different numbers. | `dashboardService.ts` (Web) |
| 31 | Web "Top Selling Items" and "Items Sold" empty | High | `reportsStore` had single `isLoading` boolean blocking parallel fetches. When dashboard called multiple report endpoints simultaneously, only the first executed. | `reportsStore.ts`, `dashboardService.ts` (Web) |
| 32 | Report endpoints blocked operational roles | Medium | Dashboard report endpoints (`sales/summary`, `items/top-selling`, `payments/breakdown`, `revenue/trends`) restricted to manager+ roles. Cashier/waiter/kitchen_staff couldn't see dashboard KPIs. | `report.routes.ts` (Core Service) |
| 33 | Payment breakdown missing today's data | Medium | `getPaymentBreakdown()` used `new Date(query.end_date)` which resolves to midnight UTC, excluding the entire current day. Also missing `percentage` field in response. | `report.service.ts` (Core Service) |
| 34 | Table not released on payment — WebSocket broadcast missing | Critical | When order marked 'paid', server updated table to 'available' in DB but didn't broadcast `tables:status_changed` WS event. Web clients kept showing stale 'occupied' status for 5+ minutes. Sync push handler also missing Redis invalidation + WS broadcast. | `order.service.ts`, `sync.service.ts` (Core Service), `websocketStore.ts` (Web) |
| 35 | Completed orders treated as active — stale table occupancy | Critical | `isActiveOrder()` excluded `['paid', 'cancelled']` but not `'completed'`. Orders with status 'completed' kept their tables showing as occupied on mobile. Mobile showed 3 occupied but DB had 1. | `unified-order.types.ts` (POS-App) |

### Additional fixes applied as part of Phase 4

| Fix | Description | Files |
|-----|-------------|-------|
| Web order details show modifiers | Added `OrderItemModifier` type, `mapModifiers()` parsing 3 formats (relation, flat JSON, nested JSON). OrderDetailsDrawer renders modifiers under each item. | `orderService.ts`, `OrderDetailsDrawer.tsx` |
| Web menu modifier assignment UI | Menu items table has "Modifiers" column with purple badges. MenuItemForm has toggle buttons for assigning/unassigning modifier groups. | `menuService.ts`, `MenuItemForm.tsx`, `MenuPage.tsx` |
| Menu Service listing includes modifier groups | `getAll()` Prisma query now includes `modifier_groups` relation so web can show which items have modifiers. | `menuItem.service.ts` (Menu Service) |
| Mobile dashboard uses server KPIs when online | `ManagerDashboard` and `StaffDashboard` call `/api/reports/sales/daily` for authoritative numbers. Fall back to local SQLite when offline. Shows "live"/"cached" indicator. | `ManagerDashboard.tsx`, `StaffDashboard.tsx` |
| WebSocket cache invalidation across all stores | All Zustand stores (`ordersStore`, `tablesStore`, `billingStore`) now invalidate cache + refetch on WS events. `_needsRefetch` pattern prevents dropped events during in-flight fetches. | `websocketStore.ts`, `ordersStore.ts`, `tablesStore.ts`, `billingStore.ts` |
| Report start-of-day UTC consistency | `report.service.ts` start-of-day used `setHours` (local time) for start but `setUTCHours` for end, causing inconsistent date range. Fixed to `setUTCHours(0,0,0,0)`. | `report.service.ts` |

---

## Files Modified — Complete List

### POS-App (Mobile)

| File | Bugs Fixed |
|------|-----------|
| `src/types/unified-order.types.ts` | #35 |
| `src/context/unified-order/UnifiedOrderContext.tsx` | #16, #17, #24 |
| `src/context/unified-order/unifiedOrderReducer.ts` | #21 |
| `src/context/table/TableActions.ts` | #20 |
| `src/navigation/MainNavigator.tsx` | #16 |
| `src/screens/kitchen/KitchenStaffDashboard.tsx` | #16 |
| `src/screens/orders/OrderManagementScreen.tsx` | #17, #20 |
| `src/screens/dashboard/ManagerDashboard.tsx` | #18, #30 |
| `src/screens/dashboard/StaffDashboard.tsx` | #18, #30 |
| `src/screens/orders/components/ModifierSelectionModal.tsx` | #23 |
| `src/screens/orders/components/OrderCart.tsx` | #23 |
| `src/screens/orders/components/MenuItemCard.tsx` | #23 |
| `src/screens/orders/components/SendToKitchenModal.tsx` | #23 |
| `src/screens/settings/.../ModifierGroupCard.tsx` | #23 |
| `src/screens/settings/.../ComboCard.tsx` | #23 |
| `src/screens/settings/.../ComboList.tsx` | #23 |
| `src/components/business/payment/PaymentSummary.tsx` | #23 |
| `src/components/modals/TableSelectionModal.tsx` | #20 |
| `src/services/payment/PaymentService.ts` | #17 |
| `src/services/storage/MenuStorageService.ts` | #26 |
| `.env` | #28 |

### POS-Authentication-Frontend (Web)

| File | Bugs Fixed |
|------|-----------|
| `src/services/dashboardService.ts` | #30, #31 |
| `src/services/orderService.ts` | Web modifier display |
| `src/services/menuService.ts` | Web modifier assignment |
| `src/stores/websocketStore.ts` | #18, #22, #34 |
| `src/stores/ordersStore.ts` | #22, WS cache |
| `src/stores/tablesStore.ts` | WS cache |
| `src/stores/billingStore.ts` | WS cache |
| `src/stores/reportsStore.ts` | #31 |
| `src/pages/Orders/OrderDetailsDrawer.tsx` | Web modifier display |
| `src/pages/Menu/MenuPage.tsx` | Web modifier column |
| `src/pages/Menu/MenuItemForm.tsx` | Web modifier assignment UI |

### POS-Core-Service (Backend)

| File | Bugs Fixed |
|------|-----------|
| `src/services/order.service.ts` | #29, #34 |
| `src/services/sync.service.ts` | #34 |
| `src/services/report.service.ts` | #19, #33, UTC fix |
| `src/serializers/order.serializer.ts` | #25 |
| `src/routes/report.routes.ts` | #32 |

### POS-Menu-Service

| File | Bugs Fixed |
|------|-----------|
| `src/services/menuItem.service.ts` | Menu listing modifiers |

---

## Single Source of Truth Audit

12 violations identified across 4 data domains. Status after Sprint 4:

| Domain | Violations Found | Fixed | Remaining |
|--------|-----------------|-------|-----------|
| Order Status | 4 | 3 (WS cache, dashboard sync, direct API) | 1 (failed sync silent data loss) |
| Table Status | 3 | 3 (WS broadcast, isActiveOrder, reconciliation) | 0 |
| Billing/Transactions | 3 | 2 (status completed, WS invalidation) | 1 (split payment race condition) |
| Menu/Modifiers | 2 | 2 (sync pull assignments, web display) | 0 |
| **Total** | **12** | **10** | **2** |

### Remaining items (deferred)
1. **Failed sync silent data loss** — SyncQueue retries 5x then drops silently. Needs user notification banner.
2. **Split payment race condition** — Concurrent card payments could cause duplicate fee calculation. Needs idempotency keys.

---

## Verification Summary

| Test | Result |
|------|--------|
| Playwright (web) | 453 passed, 0 failed, 7 skipped |
| Kitchen status flow | confirmed - preparing - ready - served: all hold, no revert |
| Cross-device sync | Mobile order appears on web within 5 seconds |
| Billing status | All 9 transactions show "Completed" |
| Table release on payment | Tables released immediately, WS broadcast to all clients |
| Modifier end-to-end | Select on mobile - sync to server - display on web |
| Dashboard numbers match | Mobile and web both use /api/reports/sales/daily |
| DB integrity | 1 occupied table matches active order count |
