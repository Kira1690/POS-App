# Permission Matrix QA Results

## Web Dashboard — Route × Role Matrix

**Legend:** ✅ Permitted (page loads) | ❌ Blocked (redirected) | 🔲 Not tested | ⚠️ Bug

**Test Date:** 2026-03-06
**Method:** Playwright e2e tests (74 passed) + Automated page screenshot capture

Routes tested: `/`, `/menu`, `/orders`, `/tables`, `/kitchen`, `/staff`, `/billing`,
`/customers`, `/discounts`, `/reports`, `/report-emails`, `/users`, `/stores`, `/logs`, `/store-report-settings`, `/account`

| Route | super_admin | system_admin | store_admin | manager | waiter | kitchen_staff | cashier |
|-------|------------|-------------|-------------|---------|--------|---------------|---------|
| `/` | 🔲 | ✅ | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |
| `/menu` | 🔲 | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/orders` | 🔲 | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/tables` | 🔲 | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/kitchen` | 🔲 | ✅ | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |
| `/staff` | 🔲 | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/billing` | 🔲 | ✅ | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |
| `/customers` | 🔲 | ✅ | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |
| `/discounts` | 🔲 | ✅ | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |
| `/reports` | 🔲 | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/report-emails` | 🔲 | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/users` | 🔲 | ✅ | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |
| `/stores` | 🔲 | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/logs` | 🔲 | ✅ | ❌ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/store-report-settings` | 🔲 | ✅ | ❌ | 🔲 | 🔲 | 🔲 | 🔲 |
| `/account` | 🔲 | ✅ | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |

_system_admin and store_admin roles verified via Playwright tests (74 tests passed)._
_store_admin blocked from /logs and /store-report-settings as expected (shows "Insufficient Permissions")._

---

## Web — Data Scoping Tests

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| system_admin sees all pages | All pages accessible | 15/15 pages load with data (verified via screenshots) | ✅ |
| store_admin blocked from admin-only pages | /logs, /store-report-settings blocked | Insufficient Permissions shown (Playwright e2e verified) | ✅ |
| system_admin sees store filter dropdown | Both stores listed | | 🔲 |

---

## Mobile App — Screen × Role Matrix

**Legend:** ✅ Accessible | ❌ Blocked | 🔲 Not tested

| Screen | store_admin | manager | waiter | kitchen_staff | cashier |
|--------|------------|---------|--------|---------------|---------|
| POS Order Screen | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Table Selection (area tabs) | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Order Management | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Kitchen Operations | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Settings (all tabs) | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Discount Modal | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Split Bill Screen | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Payment Screens | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |

_Mobile tested with active session via ADB on Android emulator._

---

## Playwright Test Results

**Total: 74 passed, 0 failed** (3.1 minutes)

| Spec File | Tests | Status |
|-----------|-------|--------|
| billing.spec.ts | 10 | ✅ |
| customers.spec.ts | 8 | ✅ |
| dashboard.spec.ts | 5 | ✅ |
| kitchen.spec.ts | 4 | ✅ |
| logs.spec.ts | 5 | ✅ |
| menu.spec.ts | 4 | ✅ |
| orders.spec.ts | 5 | ✅ |
| report-emails.spec.ts | 9 | ✅ |
| reports.spec.ts | 5 | ✅ |
| staff.spec.ts | 4 | ✅ |
| stores.spec.ts | 6 | ✅ |
| tables.spec.ts | 4 | ✅ |

---

## Known Expected Access Pattern

| Role | Web Pages | Mobile Screens |
|------|-----------|----------------|
| super_admin | All pages | N/A (web-only) |
| system_admin | All pages | N/A (web-only) |
| store_admin | All pages for their store (blocked: /logs, /store-report-settings) | All settings + all operations |
| manager | menu, orders, tables, kitchen, staff, reports, customers | Orders, Tables, Kitchen, Settings |
| waiter | orders, tables | Orders, Tables |
| kitchen_staff | kitchen | Kitchen only |
| cashier | orders, billing | Orders, Payment screens |

---

## Bugs Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| 1 | `table.section.toLowerCase is not a function` in TableSelectionModal when section is undefined | Medium | ✅ Fixed — added `typeof section !== 'string'` guard |
| 2 | Discount modal shows Original Amount $0.00 when editing existing order | Low | Known — editing mode uses different total calculation |
| 3 | "Already Ordered" item shows $NaN on POS screen in edit mode | Low | Known — price display in edit mode needs fix |
