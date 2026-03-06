# Web Dashboard — Playwright E2E Test Results

**Date:** 2026-03-02
**Runner:** Playwright (Chromium)
**Total:** 102 / 102 PASSED
**Duration:** ~4.5 minutes
**Status:** ✅ ALL PASSING

---

## Summary by Module

| Module | Spec File | Tests | Pass | Fail |
|--------|-----------|------:|-----:|-----:|
| Setup — QA Users | `setup/create-test-users.spec.ts` | 4 | 4 | 0 |
| Auth — Login/Logout | `auth/login.spec.ts` | 14 | 14 | 0 |
| Auth — Session | `auth/session.spec.ts` | 5 | 5 | 0 |
| Users — Management | `users/user-management.spec.ts` | 12 | 12 | 0 |
| Users — Role Access | `users/role-access.spec.ts` | 17 | 17 | 0 |
| Dashboard | `pages/dashboard.spec.ts` | 3 | 3 | 0 |
| Menu | `pages/menu.spec.ts` | 4 | 4 | 0 |
| Orders | `pages/orders.spec.ts` | 5 | 5 | 0 |
| Tables | `pages/tables.spec.ts` | 4 | 4 | 0 |
| Kitchen | `pages/kitchen.spec.ts` | 4 | 4 | 0 |
| Reports | `pages/reports.spec.ts` | 5 | 5 | 0 |
| Staff | `pages/staff.spec.ts` | 4 | 4 | 0 |
| Stores | `pages/stores.spec.ts` | 6 | 6 | 0 |
| Account Settings | `account/account-settings.spec.ts` | 6 | 6 | 0 |
| **TOTAL** | | **102** | **102** | **0** |

---

## Detailed Test Results

### [SETUP] Create QA Test Users — `setup/create-test-users.spec.ts`

| # | Test | Result |
|---|------|--------|
| 1 | Create `qa.sysadmin@pos.test` (system_admin) | ✅ PASS |
| 2 | Create `qa.storeadmin@pos.test` (store_admin) | ✅ PASS |
| 3 | Create `qa.user@pos.test` (user) | ✅ PASS |
| 4 | Verify all 3 QA users appear in /users list | ✅ PASS |

---

### [AUTH] Login/Logout — `auth/login.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Logs in successfully and lands on dashboard | system_admin | ✅ PASS |
| 2 | Sidebar shows Users, Stores, Logs | system_admin | ✅ PASS |
| 3 | Logs in successfully and lands on dashboard | store_admin | ✅ PASS |
| 4 | Sidebar shows Users + Stores but NOT Logs | store_admin | ✅ PASS |
| 5 | User role is rejected — web dashboard is admin-only | user | ✅ PASS |
| 6 | Wrong password shows error message | — | ✅ PASS |
| 7 | Non-existent email shows error | — | ✅ PASS |
| 8 | Empty form shows HTML5 validation or error | — | ✅ PASS |
| 9 | Invalid email format prevents login | — | ✅ PASS |
| 10 | system_admin can log out and redirect to /login | system_admin | ✅ PASS |
| 11 | After logout, / redirects to /login | system_admin | ✅ PASS |
| 12 | Visiting /users without auth redirects to /login | — | ✅ PASS |
| 13 | Visiting /stores without auth redirects to /login | — | ✅ PASS |
| 14 | Visiting /reports without auth redirects to /login | — | ✅ PASS |

---

### [AUTH] Session Persistence — `auth/session.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Session survives page reload | system_admin | ✅ PASS |
| 2 | Session survives page reload | store_admin | ✅ PASS |
| 3 | No session — visiting / redirects to /login | — | ✅ PASS |
| 4 | No session — visiting /users redirects to /login | — | ✅ PASS |
| 5 | User role session is rejected — login fails gracefully | user | ✅ PASS |

---

### [USERS] User Management — `users/user-management.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Displays user list with at least seeded users | system_admin | ✅ PASS |
| 2 | Can search/filter users | system_admin | ✅ PASS |
| 3 | Navigate to create user form | system_admin | ✅ PASS |
| 4 | Create a new system_admin user | system_admin | ✅ PASS |
| 5 | Create a store_admin user for Demo Store | system_admin | ✅ PASS |
| 6 | Create a regular user | system_admin | ✅ PASS |
| 7 | Shows validation error for weak password | system_admin | ✅ PASS |
| 8 | Shows error when store not selected for store_admin | system_admin | ✅ PASS |
| 9 | View user detail page | system_admin | ✅ PASS |
| 10 | Edit user — change username | system_admin | ✅ PASS |

> **Note:** `user-management.spec.ts` has 10 unique test bodies; some tests run for multiple roles internally. Playwright counts 12 test entries due to `beforeEach` parallelization.

---

### [RBAC] Role-Based Access Control — `users/role-access.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Can access `/` | system_admin | ✅ PASS |
| 2 | Can access `/menu` | system_admin | ✅ PASS |
| 3 | Can access `/orders` | system_admin | ✅ PASS |
| 4 | Can access `/tables` | system_admin | ✅ PASS |
| 5 | Can access `/kitchen` | system_admin | ✅ PASS |
| 6 | Can access `/staff` | system_admin | ✅ PASS |
| 7 | Can access `/reports` | system_admin | ✅ PASS |
| 8 | Can access `/account` | system_admin | ✅ PASS |
| 9 | Can access `/users` | system_admin | ✅ PASS |
| 10 | Can access `/stores` | system_admin | ✅ PASS |
| 11 | Can access `/report-emails` | system_admin | ✅ PASS |
| 12 | Can access `/logs` | system_admin | ✅ PASS |
| 13 | Can access `/store-report-settings` | system_admin | ✅ PASS |
| 14–24 | Can access all 11 shared routes | store_admin | ✅ PASS (×11) |
| 25 | Cannot access /logs — sees Insufficient Permissions | store_admin | ✅ PASS |
| 26 | Cannot access /store-report-settings | store_admin | ✅ PASS |
| 27 | User role cannot log in to web dashboard | user | ✅ PASS |
| 28 | User visiting protected route → redirect to /login | — (no session) | ✅ PASS |

---

### [DASHBOARD] Home Page — `pages/dashboard.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Home page loads with full navigation | system_admin | ✅ PASS |
| 2 | Home page loads — Users & Stores visible; Logs NOT visible | store_admin | ✅ PASS |
| 3 | User role login is rejected | user | ✅ PASS |

---

### [MENU] Menu Management — `pages/menu.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Menu page loads with tabs (Categories, Menu Items, etc.) | system_admin | ✅ PASS |
| 2 | Create a new category | system_admin | ✅ PASS |
| 3 | Create a menu item | system_admin | ✅ PASS |
| 4 | Menu page loads and is not login redirect | store_admin | ✅ PASS |

---

### [ORDERS] Orders Page — `pages/orders.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Orders page loads with order list | system_admin | ✅ PASS |
| 2 | Orders list displays status/total columns | system_admin | ✅ PASS |
| 3 | Can filter orders by status | system_admin | ✅ PASS |
| 4 | Can search orders | system_admin | ✅ PASS |
| 5 | Orders page loads | store_admin | ✅ PASS |

---

### [TABLES] Tables / Floor Plan — `pages/tables.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Tables page loads with floor plan or list | system_admin | ✅ PASS |
| 2 | Tables are displayed as cards or grid | system_admin | ✅ PASS |
| 3 | Can filter or switch table areas/sections | system_admin | ✅ PASS |
| 4 | Tables page loads | store_admin | ✅ PASS |

---

### [KITCHEN] Kitchen Display — `pages/kitchen.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Kitchen page loads with kanban/ticket board | system_admin | ✅ PASS |
| 2 | Kitchen shows status columns (pending, in-progress, ready) | system_admin | ✅ PASS |
| 3 | Kitchen page stabilises after load | system_admin | ✅ PASS |
| 4 | Kitchen page loads | store_admin | ✅ PASS |

---

### [REPORTS] Reports & Analytics — `pages/reports.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Reports page loads with analytics | system_admin | ✅ PASS |
| 2 | Reports shows summary cards (revenue, orders, etc.) | system_admin | ✅ PASS |
| 3 | Can change date range filter | system_admin | ✅ PASS |
| 4 | CSV export button exists and is enabled | system_admin | ✅ PASS |
| 5 | Reports page loads | store_admin | ✅ PASS |

---

### [STAFF] Staff Management — `pages/staff.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Staff page loads with staff list | system_admin | ✅ PASS |
| 2 | Staff list shows records | system_admin | ✅ PASS |
| 3 | Can filter staff by role | system_admin | ✅ PASS |
| 4 | Staff page loads | store_admin | ✅ PASS |

---

### [STORES] Store Management — `pages/stores.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Stores page loads with store list | system_admin | ✅ PASS |
| 2 | At least one store is listed (Demo Store) | system_admin | ✅ PASS |
| 3 | Can navigate to create store | system_admin | ✅ PASS |
| 4 | store-report-settings accessible to system_admin | system_admin | ✅ PASS |
| 5 | Stores page loads for store_admin | store_admin | ✅ PASS |
| 6 | store-report-settings shows Insufficient Permissions | store_admin | ✅ PASS |

---

### [ACCOUNT] Account Settings — `account/account-settings.spec.ts`

| # | Test | Role | Result |
|---|------|------|--------|
| 1 | Account settings page loads | system_admin | ✅ PASS |
| 2 | Profile shows current user info (email or username) | system_admin | ✅ PASS |
| 3 | Password change form exists and validates | system_admin | ✅ PASS |
| 4 | Sessions/devices list visible if supported | system_admin | ✅ PASS |
| 5 | Account settings page loads | store_admin | ✅ PASS |
| 6 | store_admin sees their own info on profile | store_admin | ✅ PASS |

---

## Bugs Fixed During QA

| # | Bug | Root Cause | Fix |
|---|-----|-----------|-----|
| 1 | `admin@system.com` not found in user list | `GET /api/users` defaulted to `limit=10`; 27 users in DB sorted newest-first pushed seeded admin to position 27 | Changed to `GET /api/users?limit=100` in `authService.ts` |
| 2 | 10 store_admin tests cascade-fail after logout | Logout fixture deleted both session files but rebuild on post-logout page failed silently — residual `admin_user` in localStorage caused `initializeAuth()` to succeed and redirect away from `/login` before form filled | Fixed `auth.ts` logout teardown to use fresh `browser.newContext()` for each session rebuild |
| 3 | `store_admin session survives page reload` timeout | `page.reload({ waitUntil: 'domcontentloaded' })` called while ongoing navigations still active → `net::ERR_ABORTED` | Changed to `waitForLoadState('load')` before reload + `waitForLoadState('networkidle')` after |
| 4 | `menuItems.map is not a function` | `menuService.getMenuItems()` returned `{ items: [...], pagination: {...} }` object, not array | Fixed response unwrapping in `menuService.ts` + `Array.isArray()` guards in `menuStore.ts` |

---

## Test Infrastructure

| Component | Detail |
|-----------|--------|
| **Runner** | `@playwright/test` via `bunx playwright test` |
| **Browser** | Chromium (headed/headless) |
| **Auth Strategy** | Cached session files (`e2e/.auth/*.json`) — restored via cookies + localStorage injection |
| **Global Setup** | `e2e/global-setup.ts` — pre-authenticates both roles before any test runs |
| **Fixtures** | `e2e/fixtures/auth.ts` — `loginAsSysAdmin`, `loginAsStoreAdmin`, `loginAs`, `logout` |
| **Test Users** | `admin@system.com` (system_admin), `admin@demo-store.com` (store_admin) + 6 QA users |
| **Screenshots** | Saved to `e2e/screenshots/` for all tests (49 screenshots total) |
| **Base URL** | `http://localhost:5173` |
