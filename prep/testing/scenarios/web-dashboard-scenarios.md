# Web Dashboard — Test Scenarios

## Phase 0: Setup (run-once)

### S0.1 — Create QA Test Users via Dashboard UI
**File:** `e2e/setup/create-test-users.spec.ts`
**Role:** system_admin
**Steps:**
1. Login as `admin@system.com`
2. Navigate to `/users/create`
3. Create `qa.sysadmin@pos.test` (system_admin)
4. Create `qa.storeadmin@pos.test` (store_admin, Demo Store)
5. Create `qa.user@pos.test` (user, Demo Store)
6. Verify all 3 appear in `/users` list

---

## Phase 1: Authentication

### S1.1 — Login system_admin
**File:** `e2e/auth/login.spec.ts`
- Fill email `admin@system.com`, password `SuperAdmin123!`
- Click Sign In
- Assert redirect to `/`
- Assert user name visible in header/sidebar

### S1.2 — Login store_admin
- Fill `admin@demo-store.com` / `StoreAdmin123!`
- Assert redirect to `/`
- Assert store context visible

### S1.3 — Login user
- Fill `user@demo-store.com` / `User123!`
- Assert redirect to `/`

### S1.4 — Login with wrong password
- Fill valid email, wrong password
- Assert error message visible
- Assert stays on `/login`

### S1.5 — Login with non-existent email
- Fill `nobody@nowhere.com` / any password
- Assert error message

### S1.6 — Logout system_admin
- Login as system_admin
- Click logout button
- Assert redirect to `/login`
- Assert `/` redirects to `/login` while unauthenticated

### S1.7 — Session persistence after page reload
**File:** `e2e/auth/session.spec.ts`
- Login as any role
- Hard reload (`page.reload()`)
- Assert still authenticated (no redirect to login)

### S1.8 — Protected route redirect when unauthenticated
- Navigate to `/users` without login
- Assert redirect to `/login`

---

## Phase 2: User Management (system_admin only)

### S2.1 — View all users
**File:** `e2e/users/user-management.spec.ts`
- Login as system_admin
- Navigate to `/users`
- Assert table has at least 3 rows (seeded users)
- Assert columns: username, email, role, store, created

### S2.2 — Create user (system_admin role)
- Navigate to `/users/create`
- Fill: username `testsysadmin2`, email `test.sys2@pos.test`, password `TestAdmin123!`, role `system_admin`
- Click Create
- Assert redirect to `/users` or success message
- Assert new user in list

### S2.3 — Create user (store_admin role)
- Fill: username `teststoreadmin2`, email `test.store2@pos.test`, password `TestStore123!`, role `store_admin`, store `Demo Store`
- Assert created successfully

### S2.4 — Create user (user role)
- Fill: username `testuser2`, email `test.user2@pos.test`, password `TestUser123!`, role `user`, store `Demo Store`
- Assert created successfully

### S2.5 — View user detail
- Click on a user row or detail link
- Assert `/users/:id` shows user data

### S2.6 — Edit user (change username)
- Navigate to `/users/:id/edit`
- Change username to something new
- Save
- Assert success

### S2.7 — store_admin cannot access /users
**File:** `e2e/users/role-access.spec.ts`
- Login as store_admin
- Navigate to `/users`
- Assert redirect or 403 message

### S2.8 — user role cannot access /users
- Login as user
- Navigate to `/users`
- Assert redirect or 403 message

### S2.9 — system_admin only: /logs accessible
- Login as system_admin
- Navigate to `/logs`
- Assert page loads (not redirected)

### S2.10 — store_admin cannot access /logs
- Login as store_admin
- Navigate to `/logs`
- Assert redirected or access denied

---

## Phase 3: Page Tests by Role

### Dashboard (S3.x)
**File:** `e2e/pages/dashboard.spec.ts`

- S3.1: system_admin sees full navigation sidebar
- S3.2: store_admin navigation excludes Users, Stores (admin-only items)
- S3.3: user navigation is most restricted

### Menu Management (S4.x)
**File:** `e2e/pages/menu.spec.ts`

- S4.1: system_admin views /menu — all 4 tabs visible (Categories, Items, Modifiers, Combos)
- S4.2: Create category — fill name, click save, assert appears in list
- S4.3: Create menu item — fill name, price, category, save, assert in list
- S4.4: Edit category name
- S4.5: Delete category (with confirmation)
- S4.6: store_admin can access /menu
- S4.7: user can access /menu

### Orders (S5.x)
**File:** `e2e/pages/orders.spec.ts`

- S5.1: /orders loads for system_admin
- S5.2: Order list or empty state visible
- S5.3: store_admin can view orders
- S5.4: user can view orders

### Tables (S6.x)
**File:** `e2e/pages/tables.spec.ts`

- S6.1: /tables loads, floor plan or table grid visible
- S6.2: Table status badges visible
- S6.3: All 3 roles can access /tables

### Kitchen (S7.x)
**File:** `e2e/pages/kitchen.spec.ts`

- S7.1: /kitchen loads for system_admin
- S7.2: Kanban columns or empty state visible
- S7.3: All 3 roles can access /kitchen

### Reports (S8.x)
**File:** `e2e/pages/reports.spec.ts`

- S8.1: /reports loads with chart area visible
- S8.2: Date range selector visible
- S8.3: All 3 roles can access /reports

### Staff (S9.x)
**File:** `e2e/pages/staff.spec.ts`

- S9.1: /staff loads for system_admin
- S9.2: Staff list or empty state visible
- S9.3: All 3 roles can access /staff

### Stores (S10.x)
**File:** `e2e/pages/stores.spec.ts`

- S10.1: system_admin views /stores — list with Demo Store
- S10.2: Create store — fill name, slug, save
- S10.3: store_admin cannot access /stores (list)
- S10.4: store_admin can view own store `/stores/:id`
- S10.5: Edit store details (system_admin)

---

## Phase 4: Account & Settings

### S11.x — Account Settings
**File:** `e2e/account/account-settings.spec.ts`

- S11.1: /account loads — Profile tab visible
- S11.2: Update display name — fill, save, assert success
- S11.3: Sessions tab — active sessions listed
- S11.4: Change password — current + new + confirm, save
- S11.5: /report-emails loads — email subscription settings
- S11.6: system_admin only: /store-report-settings loads
