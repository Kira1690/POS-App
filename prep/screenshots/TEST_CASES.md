# POS Sync Integration Test Cases
**Account:** `testadmin@foodcorner.com` / `TestAdmin123!` (store_admin, created via web app)
**Date:** 2026-03-03
**Rule:** Every test must produce a matched pair — one mobile screenshot + one web screenshot showing the same data.

---

## TC-01: Menu Pull Sync
**What:** App pulls menu categories and items from the Menu Service on login.
**Expected:** Same categories visible in mobile app menu AND in web dashboard Menu page.

| Step | Action | Screenshot |
|------|--------|-----------|
| 1 | Web: Login as testadmin, open Menu page — note category count | `web/tc01_web_menu_before.png` |
| 2 | Mobile: Login as testadmin, navigate to Menu screen | `mobile/tc01_mobile_menu.png` |
| 3 | Web: Refresh Menu page — confirm same categories | `web/tc01_web_menu_after.png` |

**Pass Criteria:** Category count matches between web (34) and mobile.

---

## TC-02: Order Push Sync
**What:** Create order on mobile → SyncEngine pushes to Core Service → appears on web Orders page.
**Expected:** Order created on mobile (with order number) appears on web Orders page.

| Step | Action | Screenshot |
|------|--------|-----------|
| 1 | Web: Open Orders page — note current order count (baseline) | `web/tc02_web_orders_before.png` |
| 2 | Mobile: Select Table T1, create new order, add 1 menu item | `mobile/tc02_mobile_table_select.png` |
| 3 | Mobile: Submit order to kitchen | `mobile/tc02_mobile_order_placed.png` |
| 4 | Mobile: Wait 12s for SyncEngine push interval | — |
| 5 | Web: Refresh Orders page — new order appears | `web/tc02_web_orders_after.png` |

**Pass Criteria:** Order number visible on web that wasn't there before.

---

## TC-03: Customer Sync
**What:** Customer created on mobile (during order) appears in web Customers page.
**Expected:** Customer record appears in web after order sync.

| Step | Action | Screenshot |
|------|--------|-----------|
| 1 | Web: Open Customers page — note count | `web/tc03_web_customers_before.png` |
| 2 | Mobile: Create order with customer info | `mobile/tc03_mobile_order_with_customer.png` |
| 3 | Web: Refresh Customers — customer appears | `web/tc03_web_customers_after.png` |

---

## TC-04: Tables Status Sync
**What:** Tables occupied on mobile appear as occupied on web.
**Expected:** Table T1 shows as occupied/active on web Tables page after mobile claims it.

| Step | Action | Screenshot |
|------|--------|-----------|
| 1 | Web: Open Tables page — note T1 status | `web/tc04_web_tables_before.png` |
| 2 | Mobile: Select Table T1 and open an order | `mobile/tc04_mobile_table_occupied.png` |
| 3 | Web: Refresh Tables — T1 shows occupied | `web/tc04_web_tables_after.png` |

---

## TC-05: Billing/Payment Sync
**What:** Payment completed on mobile appears in web Billing page.
**Expected:** Transaction with amount visible in web Billing after mobile completes payment.

| Step | Action | Screenshot |
|------|--------|-----------|
| 1 | Web: Open Billing page — note 0 transactions | `web/tc05_web_billing_before.png` |
| 2 | Mobile: Complete payment on existing order | `mobile/tc05_mobile_payment.png` |
| 3 | Web: Refresh Billing — transaction appears | `web/tc05_web_billing_after.png` |

---

## Execution Order
1. TC-01 (Menu Pull) — no side effects, safe to run first
2. TC-04 (Tables) — claim a table
3. TC-02 (Order Push) — create order on that table
4. TC-05 (Billing) — pay for that order
5. TC-03 (Customers) — verify customer from order

## Screenshot Naming Convention
- `sync/` — paired proof screenshots (mobile + web side by side)
- `web/` — web dashboard screenshots
- `mobile/` — mobile app screenshots (via adb screencap)
