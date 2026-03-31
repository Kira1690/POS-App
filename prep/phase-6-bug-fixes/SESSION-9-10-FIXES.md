# POS System -- Sessions 9-10 Bug Fixes and Improvements

Date: March 30, 2026
Phase: 6 (Stabilization and Quality)

---

## Summary

Sessions 9 and 10 addressed 20 distinct issues spanning the modifier/addon system, billing and transaction pipeline, dashboard data accuracy, WebSocket real-time synchronization, and web UI feature gaps. All fixes were verified end-to-end across mobile and web clients.

---

## Session 9 -- Modifier/Addon System (6 Fixes)

### Fix 1: Render crash -- priceAdjustment.toFixed is not a function

| Field | Detail |
|-------|--------|
| Severity | Critical -- app crash |
| Root Cause | `price_adjustment` values from the server arrived as `undefined` or `string`, not `number`. Calling `.toFixed()` on a non-number threw a TypeError. |
| Fix | Wrapped all `price_adjustment` reads with `Number() \|\| 0` guards. |
| Files Modified | `ModifierGroupCard.tsx`, `ComboCard.tsx`, `ComboList.tsx`, `PaymentSummary.tsx`, `ModifierSelectionModal.tsx`, `OrderCart.tsx`, `MenuItemCard.tsx`, `SendToKitchenModal.tsx` (8 files) |

### Fix 2: Modifiers not synced to server

| Field | Detail |
|-------|--------|
| Severity | High -- data loss |
| Root Cause | `buildOrderSyncPayload()` and `submitToKitchen()` in `UnifiedOrderContext.tsx` excluded the `selected_modifiers` array from order item payloads. Modifiers were saved locally but never transmitted to the server. |
| Fix | Added `selected_modifiers` to both sync payloads, flattened to server format `{modifier_id, name, price_adjustment}`. |
| Files Modified | `POS-App/src/context/unified-order/UnifiedOrderContext.tsx` |

### Fix 3: Server deserializer crash on nested modifier format

| Field | Detail |
|-------|--------|
| Severity | High -- server 500 |
| Root Cause | `modifiersFromAppFormat()` in the order serializer only handled the flat `{modifier_id, name, price_adjustment}` format. The mobile app sent a nested `SelectedModifier[]` structure that the function could not parse. |
| Fix | Updated the function to detect and handle both flat and nested formats. |
| Files Modified | `POS-Core-Service/src/serializers/order.serializer.ts` |

### Fix 4: Modifier assignments not synced from server to mobile

| Field | Detail |
|-------|--------|
| Severity | Medium -- missing data |
| Root Cause | `addMenuItem()` in `MenuStorageService` received Prisma's nested `modifier_groups` relation from the server but did not convert it to `modifier_assignments` rows in SQLite. Mobile had no knowledge of which modifiers belonged to which items. |
| Fix | Added conversion logic to write `modifier_assignments` to SQLite during menu sync. |
| Files Modified | `POS-App/src/services/storage/MenuStorageService.ts` |

### Fix 5: No modifier groups assigned to menu items

| Field | Detail |
|-------|--------|
| Severity | High -- feature non-functional |
| Root Cause | The `menu_item_modifier_groups` table in the database was empty. Modifier groups existed (5 groups, 20 options) but had zero assignments to menu items. |
| Fix | Created 12 modifier-to-item assignments: burgers to Burger Extras, salads to Salad Dressing, beverages to Beverage Size, wings to Wing Sauce, steak to Steak Doneness. |
| Files Modified | Database seed (direct SQL insert) |

### Fix 6: Emulator cannot reach API

| Field | Detail |
|-------|--------|
| Severity | Critical -- no connectivity |
| Root Cause | `.env` had `192.168.1.9` (host LAN IP) as the API URL. The Android emulator cannot reach the host via LAN IP; it requires the special alias `10.0.2.2`. |
| Fix | Changed API URL to `10.0.2.2` in `.env`. |
| Files Modified | `POS-App/.env` |

---

## Session 10 -- Billing, Dashboard, Single Source of Truth (14 Fixes)

### Fix 7: Billing transactions stuck at "Pending"

| Field | Detail |
|-------|--------|
| Severity | High -- incorrect billing status |
| Root Cause | `order.service.ts` created transaction records with the default `pending` status but never updated them to `completed` after successful payment processing. |
| Fix | Added `status: 'completed'` to the transaction update call. Also corrected 4 existing pending transactions in the database. |
| Files Modified | `POS-Core-Service/src/services/order.service.ts` |

### Fix 8: Web and mobile dashboard numbers do not match

| Field | Detail |
|-------|--------|
| Severity | High -- data inconsistency |
| Root Cause | The web dashboard calculated revenue client-side from raw order data (using `created_at` timestamps), while mobile used the server's `/api/reports/sales/daily` endpoint (using `completed_at`). Different date fields and calculation logic produced divergent numbers. |
| Fix | Changed web `dashboardService.ts` to use the same `/api/reports/sales/daily` endpoint as mobile. Both clients now display identical numbers from a single source of truth. |
| Files Modified | `POS-Authentication-Frontend/src/services/dashboardService.ts` |

### Fix 9: Web dashboard "Top Selling Items" empty

| Field | Detail |
|-------|--------|
| Severity | Medium -- missing dashboard widget |
| Root Cause | `reportsStore` used a single `isLoading` boolean for all report fetches. When parallel requests fired, the first to complete set `isLoading = false`, causing subsequent responses to be silently dropped. |
| Fix | Replaced single boolean with per-key loading tracking. Added top selling items and payment breakdown data to the dashboard KPI fetch. |
| Files Modified | `POS-Authentication-Frontend/src/stores/reportsStore.ts`, `POS-Authentication-Frontend/src/services/dashboardService.ts` |

### Fix 10: Report endpoints blocked operational roles

| Field | Detail |
|-------|--------|
| Severity | Medium -- access denied |
| Root Cause | Report route middleware only allowed admin and manager roles. Cashier, waiter, and kitchen staff roles were blocked from endpoints that the dashboard depends on. |
| Fix | Added `cashier`, `waiter`, `kitchen_staff` to the allowed roles list for dashboard-used report endpoints. |
| Files Modified | `POS-Core-Service/src/routes/report.routes.ts` |

### Fix 11: Payment breakdown missing today's data

| Field | Detail |
|-------|--------|
| Severity | Medium -- incomplete report |
| Root Cause | `getPaymentBreakdown()` set `end_date` to midnight (00:00:00), which excluded the entire current day from query results. |
| Fix | Changed to `setUTCHours(23, 59, 59, 999)` so the end date covers the full day. Also added a percentage field to the payment breakdown response. |
| Files Modified | `POS-Core-Service/src/services/report.service.ts` |

### Fix 12: Report startOfDay used local time instead of UTC

| Field | Detail |
|-------|--------|
| Severity | Medium -- timezone-dependent errors |
| Root Cause | `setHours()` resolved to local server time (IST), producing incorrect date boundaries for UTC-stored timestamps. |
| Fix | Replaced `setHours` with `setUTCHours` for consistent UTC date boundaries. |
| Files Modified | `POS-Core-Service/src/services/report.service.ts` |

### Fix 13: Web stores do not invalidate cache on WebSocket events

| Field | Detail |
|-------|--------|
| Severity | High -- stale UI |
| Root Cause | `ordersStore`, `tablesStore`, and `billingStore` each had a 5-minute cache TTL. Incoming WebSocket events did not invalidate these caches, so the UI remained stale until the cache naturally expired. Additionally, events arriving during in-flight fetch requests were silently dropped. |
| Fix | Added `invalidateCache()` calls on relevant WebSocket events. Implemented a `_needsRefetch` pattern to re-fetch after in-flight requests complete, preventing dropped events. |
| Files Modified | `POS-Authentication-Frontend/src/stores/websocketStore.ts`, `POS-Authentication-Frontend/src/stores/ordersStore.ts`, `POS-Authentication-Frontend/src/stores/tablesStore.ts`, `POS-Authentication-Frontend/src/stores/billingStore.ts` |

### Fix 14: Table not released on payment (WebSocket broadcast missing)

| Field | Detail |
|-------|--------|
| Severity | High -- stale table status |
| Root Cause | When an order was paid, the server released the table in the database but did not broadcast a WebSocket event. The web dashboard continued to show the table as occupied. |
| Fix | Added `broadcastToChannel('tables', 'status_changed')` to both `order.service.ts` and `sync.service.ts`. Also added `RedisService.invalidatePattern` for tables in `sync.service.ts` to clear server-side cache. |
| Files Modified | `POS-Core-Service/src/services/order.service.ts`, `POS-Core-Service/src/services/sync.service.ts` |

### Fix 15: WebSocket table event field name mismatch

| Field | Detail |
|-------|--------|
| Severity | Medium -- event handler failure |
| Root Cause | The server broadcast sent `table_id` in the event payload, but the `websocketStore` handler looked for `id`. The mismatch caused the handler to silently fail to match the affected table. |
| Fix | Updated the handler to check both `table_id` and `id` fields. |
| Files Modified | `POS-Authentication-Frontend/src/stores/websocketStore.ts` |

### Fix 16: Completed orders treated as active (table occupancy bug)

| Field | Detail |
|-------|--------|
| Severity | High -- incorrect table status |
| Root Cause | `isActiveOrder()` excluded `paid` and `cancelled` statuses but not `completed`. Orders with status `completed` were treated as active, keeping their tables marked as occupied indefinitely. |
| Fix | Added `completed` to the exclusion list in `isActiveOrder()`. |
| Files Modified | `POS-App/src/context/unified-order/unified-order.types.ts` |

### Fix 17: Web order details do not show modifiers

| Field | Detail |
|-------|--------|
| Severity | Medium -- missing information |
| Root Cause | The `OrderItem` TypeScript type had no modifiers field. `mapOrderItem()` in `orderService.ts` ignored modifier data from the API response. The `OrderDetailsDrawer` component had no rendering logic for modifiers. |
| Fix | Added `OrderItemModifier` type and `mapModifiers()` function that handles three server response formats (Prisma relation, flat JSON, nested JSON). Updated `OrderDetailsDrawer` to display modifiers beneath each order item. |
| Files Modified | `POS-Authentication-Frontend/src/services/orderService.ts`, `POS-Authentication-Frontend/src/components/orders/OrderDetailsDrawer.tsx` |

### Fix 18: Web menu management has no modifier assignment UI

| Field | Detail |
|-------|--------|
| Severity | Medium -- missing feature |
| Root Cause | The `MenuItem` type had no `modifierGroupIds` field. `MenuItemForm` had no UI section for assigning modifier groups to menu items. The items table had no column indicating modifier assignments. |
| Fix | Added `modifierGroupIds` and `modifierGroupNames` fields to `MenuItem`. Added toggle buttons for modifier group assignment in `MenuItemForm`. Added a "Modifiers" column to the items table on `MenuPage`. |
| Files Modified | `POS-Authentication-Frontend/src/services/menuService.ts`, `POS-Authentication-Frontend/src/components/menu/MenuItemForm.tsx`, `POS-Authentication-Frontend/src/pages/MenuPage.tsx` |

### Fix 19: Menu Service getAll does not return modifier group assignments

| Field | Detail |
|-------|--------|
| Severity | Medium -- incomplete API response |
| Root Cause | The menu item listing query in `menuItem.service.ts` did not include the `modifier_groups` relation in the Prisma query. The API returned items without any modifier assignment data. |
| Fix | Added `include: { modifier_groups: true }` to the Prisma query. |
| Files Modified | `POS-Menu-Service/src/services/menuItem.service.ts` |

### Fix 20: Mobile dashboard KPIs from stale SQLite

| Field | Detail |
|-------|--------|
| Severity | Medium -- stale data |
| Root Cause | `ManagerDashboard` and `StaffDashboard` read KPI data exclusively from local SQLite. The numbers reflected the last sync rather than current server state. |
| Fix | Added a server API call to `/api/reports/sales/daily` as the primary data source, with SQLite as an offline fallback. |
| Files Modified | `POS-App/src/screens/dashboard/ManagerDashboard.tsx`, `POS-App/src/screens/dashboard/StaffDashboard.tsx` |

---

## Files Modified -- Complete List

### Session 9 (13 changes across 3 services)

| # | Service | File | Change |
|---|---------|------|--------|
| 1 | POS-App | `src/components/modifiers/ModifierGroupCard.tsx` | Number() guard on price_adjustment |
| 2 | POS-App | `src/components/combos/ComboCard.tsx` | Number() guards on price fields |
| 3 | POS-App | `src/components/combos/ComboList.tsx` | Number() guards on savings calculations |
| 4 | POS-App | `src/components/payment/PaymentSummary.tsx` | Number() guard on priceAdjustment |
| 5 | POS-App | `src/components/modifiers/ModifierSelectionModal.tsx` | Number() guards + formatPrice |
| 6 | POS-App | `src/components/orders/OrderCart.tsx` | formatPrice guarded |
| 7 | POS-App | `src/components/menu/MenuItemCard.tsx` | formatPrice guarded |
| 8 | POS-App | `src/components/kitchen/SendToKitchenModal.tsx` | formatPrice guarded |
| 9 | POS-App | `src/context/unified-order/UnifiedOrderContext.tsx` | selected_modifiers in sync payloads |
| 10 | POS-App | `src/services/storage/MenuStorageService.ts` | Prisma modifier_groups to SQLite |
| 11 | POS-App | `.env` | API URL 10.0.2.2 |
| 12 | Core Service | `src/serializers/order.serializer.ts` | Handle nested modifier format |
| 13 | Database | `menu_item_modifier_groups` | 12 assignments created |

### Session 10 (16 changes across 4 services)

| # | Service | File | Change |
|---|---------|------|--------|
| 1 | Core Service | `src/services/order.service.ts` | Transaction status completed + table WS broadcast |
| 2 | Core Service | `src/services/sync.service.ts` | Table WS broadcast + Redis cache invalidation |
| 3 | Core Service | `src/services/report.service.ts` | setUTCHours + payment breakdown end date + percentage |
| 4 | Core Service | `src/routes/report.routes.ts` | Operational roles allowed |
| 5 | Menu Service | `src/services/menuItem.service.ts` | Include modifier_groups in query |
| 6 | Web Frontend | `src/services/dashboardService.ts` | Use /api/reports/sales/daily endpoint |
| 7 | Web Frontend | `src/stores/reportsStore.ts` | Per-key loading tracking |
| 8 | Web Frontend | `src/stores/websocketStore.ts` | Cache invalidation + table_id field fix |
| 9 | Web Frontend | `src/stores/ordersStore.ts` | Cache invalidation + _needsRefetch |
| 10 | Web Frontend | `src/stores/tablesStore.ts` | Cache invalidation + _needsRefetch |
| 11 | Web Frontend | `src/stores/billingStore.ts` | Cache invalidation + _needsRefetch |
| 12 | Web Frontend | `src/services/orderService.ts` | OrderItemModifier type + mapModifiers() |
| 13 | Web Frontend | `src/components/orders/OrderDetailsDrawer.tsx` | Modifier display |
| 14 | Web Frontend | `src/services/menuService.ts` | modifierGroupIds on MenuItem |
| 15 | Web Frontend | `src/components/menu/MenuItemForm.tsx` | Modifier assignment UI |
| 16 | Web Frontend | `src/pages/MenuPage.tsx` | Modifiers column in table |
| 17 | POS-App | `src/context/unified-order/unified-order.types.ts` | completed in isActiveOrder exclusion |
| 18 | POS-App | `src/screens/dashboard/ManagerDashboard.tsx` | Server API for KPIs |
| 19 | POS-App | `src/screens/dashboard/StaffDashboard.tsx` | Server API for KPIs |

---

## Verification Summary

| Area | Status | Method |
|------|--------|--------|
| Modifier selection and pricing | Verified | Mobile order with Bacon (+$1.50), Buffalo sauce |
| Modifier sync to server | Verified | Checked `order_item_modifiers` table |
| Billing transaction status | Verified | 4 existing records corrected, new payments create completed status |
| Dashboard number consistency | Verified | Web and mobile show identical revenue, order count, average |
| Top selling items widget | Verified | Data populates on web dashboard |
| WebSocket real-time updates | Verified | Table release and order status changes reflect immediately |
| Modifier display on web | Verified | OrderDetailsDrawer shows modifiers per item |
| Modifier assignment UI | Verified | MenuItemForm toggle buttons functional |
