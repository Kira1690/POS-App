# Mobile App — Maestro Test Scenarios

## Existing Tests (52 files — reference only)

All existing tests work offline with dummy credentials and cover:
- Login for all 5 roles
- Menu category/item/modifier CRUD
- POS order flow (portrait + landscape)
- Kitchen operations (CONFIRMED → PREPARING → READY → SERVED)
- Payment: cash, card, split equal, split by items, split 3 guests, combine bills
- Cancel order → kitchen cleanup
- Dashboard order cards
- Table area selection
- Session persistence
- DB persistence across restarts
- TRX terminal configuration + payment

---

## New Tests to Create (Online / Sync Mode)

These require all backend services running at their default ports.

### M-SYNC-01: Menu Pull Sync
**File:** `.maestro/sync_01_menu_pull.yaml`
1. Start with clean app
2. Login as manager
3. Wait for SyncEngine to pull menu from backend (`/api/sync/menu/sync/pull`)
4. Navigate to Menu
5. Assert categories from backend database are visible
6. Take screenshot

### M-SYNC-02: Order Push Sync
**File:** `.maestro/sync_02_order_push.yaml`
1. Login as manager
2. Create a new POS order on Table T-1 (Latte, qty 1)
3. Confirm order
4. Wait 15 seconds (push interval)
5. Assert order appears in POS-Services Core DB (via web dashboard `/orders`)
6. Take screenshot

### M-SYNC-03: Menu WS Real-time Update
**File:** `.maestro/sync_03_menu_ws.yaml`
1. App open, manager logged in, on Menu page
2. (External) Create new menu item via web dashboard
3. Wait 30s (pull interval) or wait for WS push
4. Pull-to-refresh on Menu page
5. Assert new item visible without app restart

### M-SYNC-04: Table WS Real-time Update
**File:** `.maestro/sync_04_table_ws.yaml`
1. App open, manager on Tables page
2. (External) Change table status via API
3. Assert table status badge updates within 30s

### M-SYNC-05: Offline → Online Resume
**File:** `.maestro/sync_05_offline_resume.yaml`
1. Login as manager with backend running
2. Disconnect network (airplane mode)
3. Create a POS order → confirm
4. Reconnect network
5. Manually trigger sync (if UI button exists)
6. Assert order appears in backend within 30s

---

## Role-Specific Scenarios to Verify

### Restaurant Staff (EMP001)
- M-ROLE-01: Login → Staff Dashboard visible
- M-ROLE-02: Can access POS order entry
- M-ROLE-03: Can process payment
- M-ROLE-04: Cannot access Menu management (tab hidden)
- M-ROLE-05: Cannot access Settings
- M-ROLE-06: Cannot access Reports

### Kitchen Staff (CHEF001)
- M-ROLE-07: Login → Kitchen Display visible by default
- M-ROLE-08: Can change ticket status (CONFIRMED → PREPARING)
- M-ROLE-09: Cannot access POS order entry
- M-ROLE-10: Cannot process payments
- M-ROLE-11: Cannot access Menu management

### Manager (manager@foodcorner.com)
- M-ROLE-12: Login → Full Dashboard
- M-ROLE-13: Can access all tabs: POS, Kitchen, Menu, Reports, Staff, Settings
- M-ROLE-14: Can add menu item
- M-ROLE-15: Can configure kitchen stations
- M-ROLE-16: Can view reports

### Admin (admin@foodcorner.com)
- M-ROLE-17: Login → Full Dashboard (same as manager but admin badge)
- M-ROLE-18: All manager capabilities

### Superadmin (superadmin@foodpos.com)
- M-ROLE-19: Login → Superadmin Dashboard
- M-ROLE-20: Multi-restaurant management visible

---

## Regression Scenarios

These cover known past bugs:

### R-01: TRX Card Payment opens correct modal
**File:** `qa_19_split_card_cash.yaml` (existing)
- Split payment card portion must open TRXPaymentModal, not generic modal
- Bug: Previously opened wrong modal

### R-02: Cancel order removes from Kitchen Display
**File:** `qa_11_cancel_removes_from_kitchen.yaml` (existing)
- Cancel order on POS → ticket disappears from Kitchen Display
- Bug: Previously remained stuck

### R-03: Session persists across app restart
**File:** `08_session_persists_across_restart.yaml` (existing)
- Force close and reopen app → manager still logged in

### R-04: DB persistence after pm clear
**Files:** `test_persistence_setup.yaml` + `test_persistence_verify.yaml` (existing)
- Data created before clear should not persist (fresh state)

### R-05: Modifier modal does not break POS flow
**File:** `handle_modifier_modal.yaml` (helper, used by many tests)
- Selecting modifier and closing modal correctly adds item to order

### R-06: Combine bills merges correctly
**File:** `qa_23_combine_bills.yaml` (existing)
- T-1 order merged into B-1 → T-1 cancelled, B-1 has all items

### R-07: Sync status shows 'offline' with dummy credentials
**New test needed — visual assertion**
- Login with manager (dummy) → sync indicator shows 'offline' or nothing
- No network error toast appears

---

## Execution Matrix

| Suite | Roles Tested | Backend Required | Est. Duration |
|-------|-------------|-----------------|---------------|
| `full_offline_test.yaml` | manager | No | 5 min |
| `qa_full_suite.yaml` | manager | No | 25 min |
| All 5 role login tests | all 5 | No | 5 min |
| `sync_full_suite.yaml` (new) | manager | Yes (all) | 10 min |
| Role-specific M-ROLE tests | all 5 | No | 15 min |
| Regression suite | manager | No | 15 min |
