# Mobile App ↔ Web Dashboard — Sync & Integration Test Plan

**Date:** 2026-03-02
**Scope:** End-to-end data sync between POS-App (mobile) and the backend services,
and cross-verification that data created in one system appears correctly in the other.
**Runner:** Maestro (mobile) + Playwright (web) for cross-system assertions
**Status:** PLANNING — implementation follows this document

---

## Architecture Reference

```
POS-App (Mobile)                  Backend Services
│                                  │
├─ SyncEngine ──────── pull 30s ──►│ API Gateway :8080
│   ├─ PullSyncService             │   ├─ Menu Service :5003  (/api/sync/menu/sync/pull|push)
│   ├─ OrderSyncProcessor          │   ├─ Core Service :5005  (/api/orders/sync/pull|push)
│   ├─ KitchenSyncProcessor        │   │                       (/api/tables/sync/pull|push)
│   └─ PaymentSyncProcessor        │   │                       (/api/kitchen/sync/pull|push)
│                                  │   └─ Auth Service :3000  (/api/users)
├─ WebSocketSyncManager ─── WS ──►│ Core Service WS :5005
│                                  │
└─ SQLite (local store)            └─ PostgreSQL (source of truth)
```

**Sync intervals:**
- Push: every 10 seconds
- Pull: every 30 seconds
- WebSocket: real-time (instant)

---

## Prerequisites — Services Required

```bash
# Terminal 1 — Auth Service
cd POS-Authentication && bun run dev       # port 3000

# Terminal 2 — Core + Menu Services
cd POS-Services && bun run dev:core        # port 5005
cd POS-Services && bun run dev:menu        # port 5003

# Terminal 3 — API Gateway
cd POS-API-Gateway && bun run dev          # port 8080

# Terminal 4 — Web Dashboard
cd POS-Authentication-Frontend && bun run dev   # port 5173

# Terminal 5 — Mobile App
cd POS-App && EXPO_PUBLIC_API_URL=http://10.0.2.2:8080 \
              EXPO_PUBLIC_WS_URL=ws://10.0.2.2:5005 \
              bun expo start --clear              # port 8081

# Android Emulator
# Start via Android Studio → open Pixel emulator
# Gateway is reachable at 10.0.2.2:8080 from emulator
```

---

## Test Users

| System | Role | Credential | Password |
|--------|------|-----------|----------|
| Web Dashboard | system_admin | `admin@system.com` | `SuperAdmin123!` |
| Web Dashboard | store_admin | `admin@demo-store.com` | `StoreAdmin123!` |
| Mobile App | manager | `manager@foodcorner.com` | `manager123` |
| Mobile App | staff | `EMP001` | `staff123` |
| Mobile App | kitchen | `CHEF001` | `kitchen123` |

---

## Test Phases Overview

| Phase | Focus | Tests | Maestro Files |
|-------|-------|------:|---------------|
| Phase 1 | Menu Sync (pull) | 8 | `sync_01_*` (expand existing) |
| Phase 2 | Order Sync (push from mobile) | 7 | `sync_02_*` (expand existing) |
| Phase 3 | Table & Area Sync | 8 | `sync_06_*` to `sync_08_*` |
| Phase 4 | Kitchen Ticket Sync | 6 | `sync_09_*` to `sync_10_*` |
| Phase 5 | Payment/Billing Sync | 5 | `sync_11_*` to `sync_12_*` |
| Phase 6 | WebSocket Real-time | 6 | `sync_03_*`, `sync_04_*` (expand) |
| Phase 7 | Offline → Online Resume | 5 | `sync_05_*` (expand) |
| Phase 8 | Cross-system CRUD Verification | 10 | `sync_13_*` to `sync_15_*` |
| **Total** | | **55** | |

---

## Phase 1 — Menu Sync (Pull from Backend)

**Goal:** Verify that menu data created/updated on the web dashboard appears in the mobile app
within one pull cycle (30s) or immediately on first login.

### TC-SYNC-01: Initial menu pull on login
**File:** `.maestro/sync_01_menu_pull.yaml` (extend existing)
**Steps:**
1. Clear app data (`adb shell pm clear host.exp.exponent`)
2. Start app (SyncEngine starts on auth → fullSync triggered)
3. Login as manager (`manager@foodcorner.com / manager123`)
4. Wait 10 seconds for initial fullSync to complete
5. Navigate to Menu screen
6. Assert at least one category is visible (pulled from backend)
7. Assert at least one menu item is visible
8. Take screenshot: `sync_01_initial_pull.png`

**Expected:** Categories and items from backend PostgreSQL appear in app within 10s of login.

---

### TC-SYNC-02: Web creates category → appears in mobile
**File:** `.maestro/sync_06_web_category_to_mobile.yaml`
**Steps:**
1. [WEB] Login as system_admin → `/menu` → Categories tab
2. [WEB] Create category: `Sync Test Cat {timestamp}`
3. [MOBILE] App already open with manager logged in
4. Wait 35 seconds (pull interval = 30s + 5s buffer)
5. [MOBILE] Navigate to Menu → Categories
6. Assert `Sync Test Cat {timestamp}` is visible
7. Take screenshot: `sync_06_category_synced.png`

**Expected:** Category appears in mobile within 35 seconds of creation on web.

---

### TC-SYNC-03: Web creates menu item → appears in mobile
**File:** `.maestro/sync_07_web_item_to_mobile.yaml`
**Steps:**
1. [WEB] Login → `/menu` → Menu Items tab → Add Menu Item
2. [WEB] Create item: name=`Sync Latte`, price=`5.99`, category=`Beverages`
3. [MOBILE] Wait 35 seconds
4. [MOBILE] Navigate to Menu → Items
5. Assert `Sync Latte` is visible with price `5.99`
6. Take screenshot: `sync_07_item_synced.png`

**Expected:** Menu item (name, price, category) syncs to mobile within 35s.

---

### TC-SYNC-04: Web updates menu item price → mobile reflects new price
**File:** `.maestro/sync_07b_web_item_update.yaml`
**Steps:**
1. [WEB] Update `Sync Latte` price from `5.99` to `6.99`
2. [MOBILE] Wait 35 seconds
3. [MOBILE] Navigate to Menu Items → find `Sync Latte`
4. Assert price shows `6.99` (not `5.99`)
5. Take screenshot: `sync_07b_item_update_synced.png`

---

### TC-SYNC-05: Web creates modifier group → appears in mobile
**File:** `.maestro/sync_08_web_modifier_to_mobile.yaml`
**Steps:**
1. [WEB] `/menu` → Modifier Groups tab → Add Modifier Group
2. [WEB] Create group: `Milk Options` with options: `Whole`, `Skim`, `Oat`
3. [WEB] Assign modifier group to `Sync Latte`
4. [MOBILE] Wait 35 seconds
5. [MOBILE] POS → add `Sync Latte` to order → assert modifier selection dialog appears
6. Assert `Whole`, `Skim`, `Oat` options visible
7. Take screenshot: `sync_08_modifier_synced.png`

---

### TC-SYNC-06: Web deactivates item → mobile hides it
**File:** `.maestro/sync_09_web_item_deactivate.yaml`
**Steps:**
1. [WEB] Find `Sync Latte` → toggle `is_active` to false
2. [MOBILE] Wait 35 seconds
3. [MOBILE] Navigate to Menu Items
4. Assert `Sync Latte` is NOT visible (or marked unavailable)
5. Take screenshot: `sync_09_item_deactivated.png`

---

### TC-SYNC-07: Web creates combo → appears in mobile POS
**File:** `.maestro/sync_10_web_combo_to_mobile.yaml`
**Steps:**
1. [WEB] `/menu` → Combos tab → Add Combo
2. [WEB] Create: `Sync Combo Deal`, price=`12.99`
3. [MOBILE] Wait 35 seconds → navigate to POS order entry
4. Assert `Sync Combo Deal` is available for selection
5. Take screenshot: `sync_10_combo_synced.png`

---

### TC-SYNC-08: Manual pull-to-refresh forces immediate sync
**File:** `.maestro/sync_10b_manual_refresh.yaml`
**Steps:**
1. [WEB] Create new category `Instant Refresh Cat`
2. [MOBILE] Pull-to-refresh on Menu screen (swipe down)
3. Assert `Instant Refresh Cat` appears within 5 seconds (no 30s wait)
4. Take screenshot: `sync_10b_manual_refresh.png`

---

## Phase 2 — Order Sync (Push from Mobile → Backend)

**Goal:** Verify that orders created on mobile are pushed to the backend within 10 seconds and visible on the web dashboard.

### TC-SYNC-09: Mobile creates order → appears on web dashboard
**File:** `.maestro/sync_02_order_push.yaml` (extend existing)
**Steps:**
1. [MOBILE] Login as manager → Tables → Select `T-1`
2. [MOBILE] New Order → Add `Sync Latte` (qty: 1) → Place Order
3. [MOBILE] Wait 12 seconds (push interval = 10s + 2s buffer)
4. [WEB] Login as system_admin → `/orders`
5. Assert order from T-1 with `Sync Latte` appears in orders list
6. Assert order status is `pending` or `confirmed`
7. Screenshots: `sync_09_mobile_order_placed.png`, `sync_09_web_order_visible.png`

**Expected:** Order pushed to backend within 10s; visible on web dashboard.

---

### TC-SYNC-10: Mobile order update → backend reflects change
**File:** `.maestro/sync_11_order_update.yaml`
**Steps:**
1. [MOBILE] Open existing order on T-1
2. [MOBILE] Add 1 more item: `Espresso`
3. [MOBILE] Confirm updated order
4. Wait 12 seconds
5. [WEB] Refresh `/orders` → find T-1 order
6. Assert `Espresso` appears in order items
7. Assert order total updated

---

### TC-SYNC-11: Mobile creates multiple orders concurrently → all synced
**File:** `.maestro/sync_12_concurrent_orders.yaml`
**Steps:**
1. [MOBILE] Create Order A on T-1, Order B on T-2 in quick succession
2. Wait 12 seconds
3. [WEB] `/orders` — assert both orders appear
4. Assert no data corruption (correct items in each order)
5. Take screenshot: `sync_12_concurrent_orders.png`

---

### TC-SYNC-12: Mobile sends order → web dashboard shows correct total
**File:** `.maestro/sync_13_order_total_accuracy.yaml`
**Steps:**
1. [MOBILE] Create order: 2× `Sync Latte` ($5.99 each) = $11.98 subtotal
2. Add any applicable modifier (record expected total)
3. Wait 12 seconds
4. [WEB] `/orders` → open the order
5. Assert total matches expected ($11.98 or with modifier)
6. Take screenshot: `sync_13_total_accurate.png`

---

### TC-SYNC-13: Web creates order → appears in mobile order list
**File:** `.maestro/sync_14_web_order_to_mobile.yaml`
**Steps:**
1. [WEB] Login → `/orders` → create order via API (or if UI supports it)
2. [MOBILE] Wait 35 seconds (pull interval)
3. [MOBILE] Navigate to Orders list
4. Assert order created on web appears in mobile
5. Take screenshot: `sync_14_web_order_to_mobile.png`

---

### TC-SYNC-14: Cancel order on mobile → backend marks cancelled
**File:** `.maestro/sync_15_cancel_order.yaml`
**Steps:**
1. [MOBILE] Create order on T-3
2. [MOBILE] Cancel the order before payment
3. Wait 12 seconds
4. [WEB] `/orders` → verify order status is `cancelled`
5. Take screenshot: `sync_15_cancel_synced.png`

---

### TC-SYNC-15: Order status progression syncs both ways
**File:** `.maestro/sync_16_status_progression.yaml`
**Steps:**
1. [MOBILE] Create order → confirm → status: `confirmed`
2. [WEB] Verify status is `confirmed`
3. [WEB] Change status to `ready`
4. [MOBILE] Wait 35 seconds → verify order shows `ready`
5. Take screenshot for each step

---

## Phase 3 — Table & Area Sync

**Goal:** Verify table layout, table areas, and table status sync between web dashboard and mobile.

### TC-SYNC-16: Web creates table area → appears in mobile floor plan
**File:** `.maestro/sync_17_table_area_sync.yaml`
**Steps:**
1. [WEB] Login → `/tables` → Create new area: `Patio`
2. [MOBILE] Wait 35 seconds
3. [MOBILE] Navigate to Tables → floor plan
4. Assert `Patio` area tab/section is visible
5. Take screenshot: `sync_17_area_synced.png`

---

### TC-SYNC-17: Web adds table to area → appears in mobile
**File:** `.maestro/sync_18_table_sync.yaml`
**Steps:**
1. [WEB] `/tables` → Create table in `Patio` area: `P-1`, capacity: 4
2. [MOBILE] Wait 35 seconds
3. [MOBILE] Tables → select `Patio` area
4. Assert `P-1` table card is visible
5. Take screenshot: `sync_18_table_synced.png`

---

### TC-SYNC-18: Mobile marks table occupied → web shows status
**File:** `.maestro/sync_19_table_status_push.yaml`
**Steps:**
1. [MOBILE] Tables → select `T-1` → Start Order (table becomes occupied)
2. Wait 12 seconds
3. [WEB] `/tables` → verify `T-1` status is `occupied`
4. Take screenshot: `sync_19_table_occupied.png`

---

### TC-SYNC-19: Mobile completes order → table returns to available
**File:** `.maestro/sync_20_table_available.yaml`
**Steps:**
1. [MOBILE] Complete payment on T-1 order
2. Wait 12 seconds
3. [WEB] `/tables` → verify `T-1` status is `available`
4. [MOBILE] Verify `T-1` shows as available (green/empty)
5. Take screenshot: `sync_20_table_available.png`

---

### TC-SYNC-20: Table count is consistent across systems
**File:** `.maestro/sync_21_table_count.yaml`
**Steps:**
1. [WEB] Record total number of tables in `/tables`
2. [MOBILE] Record total number of tables on floor plan
3. Assert counts match
4. Take screenshot: `sync_21_table_count.png`

---

### TC-SYNC-21: Web updates table capacity → mobile reflects change
**File:** `.maestro/sync_22_table_capacity.yaml`
**Steps:**
1. [WEB] Edit `T-1` → change capacity from 2 to 6
2. [MOBILE] Wait 35 seconds
3. [MOBILE] View `T-1` details
4. Assert capacity shows `6`

---

### TC-SYNC-22: Web deletes table → removed from mobile
**File:** `.maestro/sync_23_table_delete.yaml`
**Steps:**
1. [WEB] Delete newly created `P-1` table
2. [MOBILE] Wait 35 seconds
3. [MOBILE] Patio area — assert `P-1` is no longer visible
4. Take screenshot: `sync_23_table_deleted.png`

---

## Phase 4 — Kitchen Ticket Sync

**Goal:** Verify kitchen tickets created on mobile appear in web dashboard kitchen view, and status changes sync both ways.

### TC-SYNC-23: Mobile order → kitchen ticket appears on web dashboard
**File:** `.maestro/sync_24_kitchen_ticket_web.yaml`
**Steps:**
1. [MOBILE] Create order on T-2 with `Sync Latte` → confirm order
2. (Kitchen ticket is created automatically on order confirm)
3. Wait 12 seconds
4. [WEB] `/kitchen` → verify ticket for T-2 appears in `Pending` column
5. Assert ticket shows correct items
6. Take screenshot: `sync_24_kitchen_ticket.png`

---

### TC-SYNC-24: Web marks ticket as preparing → mobile kitchen view updates
**File:** `.maestro/sync_25_kitchen_status_web_to_mobile.yaml`
**Steps:**
1. [WEB] `/kitchen` → find T-2 ticket → change status to `Preparing`
2. [MOBILE] Wait 35 seconds → navigate to Kitchen view
3. Assert T-2 ticket appears in `Preparing` column (not `Pending`)
4. Take screenshot: `sync_25_kitchen_preparing.png`

---

### TC-SYNC-25: Mobile kitchen staff marks ticket ready → web reflects
**File:** `.maestro/sync_26_kitchen_ready.yaml`
**Steps:**
1. [MOBILE] Login as kitchen staff (CHEF001)
2. [MOBILE] Find T-2 ticket → mark as `Ready`
3. Wait 12 seconds
4. [WEB] `/kitchen` → verify T-2 ticket in `Ready` column
5. Take screenshot: `sync_26_kitchen_ready.png`

---

### TC-SYNC-26: Full kitchen ticket lifecycle syncs
**File:** `.maestro/sync_27_kitchen_lifecycle.yaml`
**Steps:**
1. Create order → ticket created (Pending)
2. Kitchen marks Preparing → verify on web
3. Kitchen marks Ready → verify on web
4. Server marks Served → verify on both systems
5. Take screenshot at each step

---

### TC-SYNC-27: Multiple tickets for same table → all appear on web
**File:** `.maestro/sync_28_multi_ticket.yaml`
**Steps:**
1. [MOBILE] Place 2 orders on T-3 at different times
2. Wait 12 seconds
3. [WEB] `/kitchen` → assert 2 tickets for T-3 visible
4. Take screenshot: `sync_28_multi_ticket.png`

---

### TC-SYNC-28: Station assignment syncs
**File:** `.maestro/sync_29_station_assignment.yaml`
**Steps:**
1. [MOBILE] Create order with items for multiple stations (grill + bar)
2. Wait 12 seconds
3. [WEB] `/kitchen` → verify correct station assignments visible
4. Take screenshot: `sync_29_station.png`

---

## Phase 5 — Payment / Billing Sync

**Goal:** Verify payment records created on mobile appear in backend billing and report correctly.

### TC-SYNC-29: Cash payment → billing record in backend
**File:** `.maestro/sync_30_cash_payment.yaml`
**Steps:**
1. [MOBILE] Create order on T-4 → proceed to payment → Cash → Pay Full
2. Wait 12 seconds
3. [WEB] `/reports` → verify transaction appears in sales data
4. Assert amount, payment method (cash), and timestamp are correct
5. Take screenshot: `sync_30_cash_payment.png`

---

### TC-SYNC-30: Card payment → billing record in backend
**File:** `.maestro/sync_31_card_payment.yaml`
**Steps:**
1. [MOBILE] Create order → Card payment (use test terminal)
2. Wait 12 seconds
3. [WEB] `/reports` → verify card transaction recorded
4. Assert payment method is `card`
5. Take screenshot: `sync_31_card_payment.png`

---

### TC-SYNC-31: Split payment → two billing records
**File:** `.maestro/sync_32_split_payment.yaml`
**Steps:**
1. [MOBILE] Order with 2 guests → Split Equal → Guest 1: cash, Guest 2: card
2. Wait 12 seconds
3. [WEB] `/reports` → verify 2 separate payment records
4. Assert totals sum to correct amount
5. Take screenshot: `sync_32_split_payment.png`

---

### TC-SYNC-32: Refund/void → reflected in backend
**File:** `.maestro/sync_33_refund.yaml`
**Steps:**
1. [MOBILE] Complete payment on T-5
2. [MOBILE] Process refund (if UI supports it)
3. Wait 12 seconds
4. [WEB] `/reports` → verify refund record appears
5. Assert net amount is correct

---

### TC-SYNC-33: Daily revenue matches between reports and individual transactions
**File:** `.maestro/sync_34_revenue_reconciliation.yaml`
**Steps:**
1. Record starting revenue on web `/reports`
2. [MOBILE] Create and complete 3 orders with known amounts ($10, $20, $15)
3. Wait 35 seconds
4. [WEB] Refresh `/reports`
5. Assert new revenue = starting + $45
6. Take screenshot: `sync_34_revenue.png`

---

## Phase 6 — WebSocket Real-time Sync

**Goal:** Verify that WebSocket-pushed updates appear instantly (< 3s) without waiting for the 30s pull cycle.

### TC-SYNC-34: Web creates menu item → WS pushes to mobile instantly
**File:** `.maestro/sync_03_menu_ws.yaml` (extend existing)
**Steps:**
1. [MOBILE] App open on Menu screen, manager logged in
2. [WEB] Create new item `WS Test Item $9.99`
3. [MOBILE] Within 5 seconds (no manual refresh) — assert `WS Test Item` appears
4. Take screenshot: `sync_34_ws_menu_instant.png`

**Expected:** Item visible within 5 seconds via WebSocket, NOT requiring 30s pull.

---

### TC-SYNC-35: Table status change via WS propagates instantly
**File:** `.maestro/sync_04_table_ws.yaml` (extend existing)
**Steps:**
1. [MOBILE] Open Tables screen
2. [WEB] Change T-1 status to `reserved`
3. [MOBILE] Within 5 seconds — assert T-1 badge shows `reserved`
4. Take screenshot: `sync_35_ws_table_status.png`

---

### TC-SYNC-36: Kitchen ticket update via WS propagates instantly
**File:** `.maestro/sync_36_ws_kitchen.yaml`
**Steps:**
1. [MOBILE] Open Kitchen view (kitchen staff logged in)
2. [WEB] `/kitchen` — move a ticket to `Ready`
3. [MOBILE] Within 5 seconds — assert ticket appears in Ready column
4. Take screenshot: `sync_36_ws_kitchen.png`

---

### TC-SYNC-37: WS reconnects after disconnect
**File:** `.maestro/sync_37_ws_reconnect.yaml`
**Steps:**
1. [MOBILE] Disable WiFi for 10 seconds (emulator network off)
2. [MOBILE] Re-enable WiFi
3. [WEB] Create a new menu item (while mobile was disconnected)
4. [MOBILE] Within 35 seconds — assert new item appears (via pull or WS on reconnect)
5. Take screenshot: `sync_37_ws_reconnect.png`

---

### TC-SYNC-38: Simultaneous WS events for multiple channels
**File:** `.maestro/sync_38_ws_multi_channel.yaml`
**Steps:**
1. [WEB] Simultaneously:
   - Create a menu item
   - Change a table status
2. [MOBILE] Within 5 seconds — assert both changes visible
3. Take screenshot: `sync_38_ws_multi.png`

---

### TC-SYNC-39: WS stays connected across screen navigation
**File:** `.maestro/sync_39_ws_navigation.yaml`
**Steps:**
1. [MOBILE] Navigate between 5 different screens over 60 seconds
2. [WEB] Create menu item while app is on Kitchen screen
3. [MOBILE] Navigate back to Menu
4. Assert new item is visible (WS subscription maintained)
5. Take screenshot: `sync_39_ws_nav.png`

---

## Phase 7 — Offline → Online Resume

**Goal:** Verify that orders/payments created while offline are queued and pushed automatically when connectivity is restored.

### TC-SYNC-40: Create order offline → pushed when back online
**File:** `.maestro/sync_05_offline_resume.yaml` (extend existing)
**Steps:**
1. [MOBILE] Confirm app is online and synced
2. [EMULATOR] Enable airplane mode (`adb shell svc wifi disable && adb shell svc data disable`)
3. [MOBILE] Create order on T-6 → `Offline Order Item`
4. [MOBILE] Confirm order (saved to SQLite + SyncQueue)
5. Assert order visible in mobile Orders list (offline state)
6. [EMULATOR] Re-enable network (`adb shell svc wifi enable`)
7. Wait 15 seconds
8. [WEB] `/orders` — assert `Offline Order Item` appears
9. Take screenshot: `sync_40_offline_resume.png`

**Expected:** Queued order pushed to backend within 10s of network restore.

---

### TC-SYNC-41: Payment created offline → synced when online
**File:** `.maestro/sync_41_offline_payment.yaml`
**Steps:**
1. Disable network
2. [MOBILE] Process cash payment on existing order
3. Re-enable network
4. Wait 15 seconds
5. [WEB] Verify payment record appears in billing
6. Take screenshot: `sync_41_offline_payment.png`

---

### TC-SYNC-42: Multiple offline operations queue and push in order
**File:** `.maestro/sync_42_offline_queue.yaml`
**Steps:**
1. Disable network
2. [MOBILE] Create 3 orders in sequence (T-7, T-8, T-9)
3. Re-enable network
4. Wait 15 seconds
5. [WEB] Verify all 3 orders appear with correct table assignments
6. Assert orders are in correct sequence
7. Take screenshot: `sync_42_offline_queue.png`

---

### TC-SYNC-43: Menu pull resumes after offline period
**File:** `.maestro/sync_43_menu_offline_resume.yaml`
**Steps:**
1. Disable network for 45 seconds (skip one pull cycle)
2. [WEB] During offline period — create new category `Offline Period Cat`
3. Re-enable network
4. Wait 35 seconds (next pull cycle)
5. [MOBILE] Assert `Offline Period Cat` appears
6. Take screenshot: `sync_43_menu_offline_resume.png`

---

### TC-SYNC-44: App shows offline indicator when disconnected
**File:** `.maestro/sync_44_offline_indicator.yaml`
**Steps:**
1. Disable network
2. [MOBILE] Assert some offline indicator is visible (banner, icon, or status text)
3. Re-enable network
4. Assert indicator disappears
5. Take screenshot: `sync_44_offline_indicator.png`

---

## Phase 8 — Cross-System CRUD Verification

**Goal:** Full end-to-end verification that each entity type is consistent between mobile SQLite and backend PostgreSQL.

### TC-SYNC-45: Full menu consistency check
**File:** `.maestro/sync_45_menu_consistency.yaml`
**Steps:**
1. [WEB] Record: total categories count, total items count
2. [MOBILE] Navigate to Menu → record categories + items visible
3. Assert mobile counts ≥ web counts (mobile may have locally cached items)
4. Pick 3 specific items — verify name and price match on both
5. Take screenshot: `sync_45_menu_consistency.png`

---

### TC-SYNC-46: Full table consistency check
**File:** `.maestro/sync_46_table_consistency.yaml`
**Steps:**
1. [WEB] `/tables` — record all table IDs and their areas
2. [MOBILE] Floor plan — record all visible tables and areas
3. Assert all web tables appear on mobile floor plan
4. Assert area assignments match
5. Take screenshot: `sync_46_table_consistency.png`

---

### TC-SYNC-47: Order history matches between systems
**File:** `.maestro/sync_47_order_history.yaml`
**Steps:**
1. [WEB] Note last 5 orders from `/orders` (IDs + amounts)
2. [MOBILE] Navigate to Orders list
3. Assert same 5 orders are visible with matching amounts
4. Take screenshot: `sync_47_order_history.png`

---

### TC-SYNC-48: User-created data isolated by restaurant_id
**File:** `.maestro/sync_48_restaurant_isolation.yaml`
**Steps:**
1. [WEB] Create menu item specifically for restaurant_id=1
2. [MOBILE] Verify item appears (app is restaurant_id=1)
3. Verify no cross-contamination from other restaurants (if any)
4. Take screenshot: `sync_48_isolation.png`

---

### TC-SYNC-49: Sync timestamp advances correctly
**File:** `.maestro/sync_49_timestamp.yaml`
**Steps:**
1. Record `last_sync_timestamp` from SyncQueueService
2. Trigger a manual sync
3. Assert `last_sync_timestamp` has advanced
4. Verify subsequent pulls only fetch delta (not full data set again)
5. Take screenshot: `sync_49_timestamp.png`

---

### TC-SYNC-50: Delete propagates from web → mobile
**File:** `.maestro/sync_50_delete_propagation.yaml`
**Steps:**
1. [WEB] Create temporary category `Delete Test Cat`
2. Wait 35 seconds → verify appears on mobile
3. [WEB] Delete `Delete Test Cat`
4. Wait 35 seconds
5. [MOBILE] Assert `Delete Test Cat` is no longer visible
6. Take screenshot: `sync_50_delete.png`

---

### TC-SYNC-51: Concurrent edits — last write wins
**File:** `.maestro/sync_51_concurrent_edit.yaml`
**Steps:**
1. [WEB] Update item `Sync Latte` price to `7.99`
2. Simultaneously [MOBILE] try to add to order
3. After 35 seconds — verify price shows `7.99` on mobile
4. No data corruption or crashes
5. Take screenshot: `sync_51_concurrent.png`

---

### TC-SYNC-52: Sync survives app restart
**File:** `.maestro/sync_52_restart_persistence.yaml`
**Steps:**
1. [MOBILE] Login, create order, wait for push
2. Force-close app (`adb shell am force-stop host.exp.exponent`)
3. Relaunch app
4. Assert previously synced data still visible
5. Assert pending sync queue persists and attempts push after restart
6. Take screenshot: `sync_52_restart.png`

---

### TC-SYNC-53: Sync doesn't duplicate data on repeated pulls
**File:** `.maestro/sync_53_no_duplicate.yaml`
**Steps:**
1. [MOBILE] Record category count before
2. Trigger 3 manual pull syncs in a row
3. Assert category count is the same (no duplicates)
4. Assert no duplicate items in any list
5. Take screenshot: `sync_53_no_duplicate.png`

---

### TC-SYNC-54: Web report totals match mobile completed orders
**File:** `.maestro/sync_54_report_reconciliation.yaml`
**Steps:**
1. [MOBILE] Complete 3 orders: $20, $35, $15 (total $70)
2. Wait 35 seconds for push + pull
3. [WEB] `/reports` → today's revenue
4. Assert today's revenue includes the $70 from mobile
5. Take screenshot: `sync_54_report.png`

---

### TC-SYNC-55: Staff user activity appears in web audit/logs
**File:** `.maestro/sync_55_audit_trail.yaml`
**Steps:**
1. [MOBILE] Staff (EMP001) creates an order
2. Wait 12 seconds
3. [WEB] `/logs` (system_admin) → verify staff activity log entry
4. Assert `EMP001` action is recorded
5. Take screenshot: `sync_55_audit.png`

---

## Execution Order

```bash
# Phase 1 — Menu Sync (requires: Gateway + Menu Service)
maestro test .maestro/sync_01_menu_pull.yaml
maestro test .maestro/sync_06_web_category_to_mobile.yaml
maestro test .maestro/sync_07_web_item_to_mobile.yaml
maestro test .maestro/sync_07b_web_item_update.yaml
maestro test .maestro/sync_08_web_modifier_to_mobile.yaml
maestro test .maestro/sync_09_web_item_deactivate.yaml
maestro test .maestro/sync_10_web_combo_to_mobile.yaml
maestro test .maestro/sync_10b_manual_refresh.yaml

# Phase 2 — Order Sync (requires: Gateway + Core Service)
maestro test .maestro/sync_02_order_push.yaml
maestro test .maestro/sync_11_order_update.yaml
maestro test .maestro/sync_12_concurrent_orders.yaml
maestro test .maestro/sync_13_order_total_accuracy.yaml
maestro test .maestro/sync_14_web_order_to_mobile.yaml
maestro test .maestro/sync_15_cancel_order.yaml
maestro test .maestro/sync_16_status_progression.yaml

# Phase 3 — Table & Area Sync
maestro test .maestro/sync_17_table_area_sync.yaml
maestro test .maestro/sync_18_table_sync.yaml
maestro test .maestro/sync_19_table_status_push.yaml
maestro test .maestro/sync_20_table_available.yaml
maestro test .maestro/sync_21_table_count.yaml
maestro test .maestro/sync_22_table_capacity.yaml
maestro test .maestro/sync_23_table_delete.yaml

# Phase 4 — Kitchen Sync
maestro test .maestro/sync_24_kitchen_ticket_web.yaml
maestro test .maestro/sync_25_kitchen_status_web_to_mobile.yaml
maestro test .maestro/sync_26_kitchen_ready.yaml
maestro test .maestro/sync_27_kitchen_lifecycle.yaml
maestro test .maestro/sync_28_multi_ticket.yaml
maestro test .maestro/sync_29_station_assignment.yaml

# Phase 5 — Payment Sync
maestro test .maestro/sync_30_cash_payment.yaml
maestro test .maestro/sync_31_card_payment.yaml
maestro test .maestro/sync_32_split_payment.yaml
maestro test .maestro/sync_33_refund.yaml
maestro test .maestro/sync_34_revenue_reconciliation.yaml

# Phase 6 — WebSocket Real-time
maestro test .maestro/sync_03_menu_ws.yaml
maestro test .maestro/sync_04_table_ws.yaml
maestro test .maestro/sync_36_ws_kitchen.yaml
maestro test .maestro/sync_37_ws_reconnect.yaml
maestro test .maestro/sync_38_ws_multi_channel.yaml
maestro test .maestro/sync_39_ws_navigation.yaml

# Phase 7 — Offline Resume
maestro test .maestro/sync_05_offline_resume.yaml
maestro test .maestro/sync_41_offline_payment.yaml
maestro test .maestro/sync_42_offline_queue.yaml
maestro test .maestro/sync_43_menu_offline_resume.yaml
maestro test .maestro/sync_44_offline_indicator.yaml

# Phase 8 — Cross-system CRUD
maestro test .maestro/sync_45_menu_consistency.yaml
maestro test .maestro/sync_46_table_consistency.yaml
maestro test .maestro/sync_47_order_history.yaml
maestro test .maestro/sync_48_restaurant_isolation.yaml
maestro test .maestro/sync_49_timestamp.yaml
maestro test .maestro/sync_50_delete_propagation.yaml
maestro test .maestro/sync_51_concurrent_edit.yaml
maestro test .maestro/sync_52_restart_persistence.yaml
maestro test .maestro/sync_53_no_duplicate.yaml
maestro test .maestro/sync_54_report_reconciliation.yaml
maestro test .maestro/sync_55_audit_trail.yaml

# Or run the full sync suite at once:
maestro test .maestro/sync_full_suite.yaml
```

---

## Adb Helper Commands

```bash
# Clear app data (fresh start)
adb shell pm clear host.exp.exponent

# Disable network (offline simulation)
adb shell svc wifi disable
adb shell svc data disable

# Re-enable network
adb shell svc wifi enable
adb shell svc data enable

# Enable airplane mode
adb shell cmd connectivity airplane-mode enable
adb shell cmd connectivity airplane-mode disable

# Force close and relaunch app
adb shell am force-stop host.exp.exponent
adb shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1

# View Expo logs
adb logcat | grep -i expo
```

---

## Test Data Setup

All tests assume this baseline data exists in the backend (`restaurant_id=1`):

| Entity | Name | Required By |
|--------|------|-------------|
| Category | `Beverages` | TC-SYNC-03, 05 |
| Menu Item | `Sync Latte`, price $5.99, category: Beverages | TC-SYNC-09 through 13 |
| Table Area | `Main Hall` | TC-SYNC-16 through 23 |
| Table | `T-1` through `T-9` in Main Hall | All order/table tests |
| Store | `Demo Store`, restaurant_id=1 | All tests |

**Bootstrap command (run before Phase 1):**
```bash
# Verify baseline data exists
curl http://localhost:8080/api/menu/categories?restaurant_id=1 \
  -H "Authorization: Bearer <token>"

curl http://localhost:8080/api/tables?restaurant_id=1 \
  -H "Authorization: Bearer <token>"
```

---

## Pass Criteria

| Phase | Criteria |
|-------|---------|
| Menu Pull | 100% of web-created menu entities appear on mobile within 35s |
| Order Push | 100% of mobile orders appear on web within 12s |
| Table Sync | Table status consistent between systems within 35s |
| Kitchen Sync | All ticket status transitions sync within 12s |
| Payment Sync | All payment records match between systems |
| WebSocket | Real-time changes appear within 5 seconds |
| Offline Resume | All queued operations pushed within 15s of reconnect |
| Cross-system | Zero data discrepancies between mobile SQLite and backend PostgreSQL |
