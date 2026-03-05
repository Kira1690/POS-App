# Test Suite Progress

> Last updated: 2026-02-28 (session 6: Kitchen Station Override feature + QA 18)
> Legend: ✅ Done | 🔄 In Progress | ⏳ Pending | ❌ Blocked

---

## Summary

| Layer | Total | Done | In Progress | Pending |
|-------|-------|------|-------------|---------|
| Unit Tests (Jest) | 176 | 91 | 0 | 85 |
| Integration Tests (Jest) | 78 | 0 | 0 | 78 |
| E2E Offline (Maestro) | 71 | 17 | 0 | 54 |
| E2E Online (Maestro) | 36 | 4 | 0 | 32 |
| **Total** | **361** | **112** | **0** | **249** |

> E2E count updated: QA 18 adds 7 test cases (TC-1 through TC-7)

---

## By Feature

### 01 — Authentication
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (CoreAuthService) | 11 | 0 | pending |
| Unit (AuthStorageService) | 8 | 0 | pending |
| Unit (dummyData helpers) | 5 | 0 | pending |
| Integration (screens) | 9 | 0 | pending |
| E2E Offline | 10 | 7 | full_offline_test.yaml + 6 individual flows passing |
| E2E Online | 5 | 0 | pending |

**Passing Maestro flows:**
- `01_staff_login_offline.yaml` ✅ written
- `02_manager_login_offline.yaml` ✅ written
- `03_kitchen_staff_login_offline.yaml` ✅ written
- `04_admin_login_offline.yaml` ✅ written
- `07_superadmin_login_offline.yaml` ✅ written
- `08_session_persists_across_restart.yaml` ✅ written
- `full_offline_test.yaml` ✅ **PASSING** (7 steps)

---

### 02 — Dashboard
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (DashboardScreen) | 11 | 0 | pending |
| Unit (ManagerDashboard) | 5 | 0 | pending |
| Unit (StaffDashboard) | 5 | 0 | pending |
| Unit (KitchenDashboard) | 8 | 0 | pending |
| Integration | 10 | 0 | pending |
| E2E Offline | 9 | 3 | full_offline_test covers tabs 01-02 |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Manager Dashboard tab loads ✅
- "Key Metrics" visible ✅
- "Analytics Overview" visible ✅

---

### 03 — Order Management
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (UnifiedOrderStorageService) | 8 | 0 | pending |
| Unit (UnifiedOrderContext) | 10 | 0 | pending |
| Unit (Order calculations) | 6 | 0 | pending |
| Integration | 9 | 0 | pending |
| E2E Offline | 11 | 2 | full_offline_test covers tab load + empty state |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Order Management tab loads ✅
- "No Orders Found" / empty state ✅

---

### 04 — Kitchen
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (KitchenStorageService) | 9 | 0 | pending |
| Unit (EnhancedKitchenContext) | 9 | 0 | pending |
| Unit (KitchenTicketCard) | 7 | 0 | pending |
| Integration | 13 | 0 | pending |
| E2E Offline | 9 | 2 | full_offline_test covers tab load |
| E2E Online | 3 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Kitchen tab loads ✅
- "Kitchen Display" visible ✅

---

### 05 — Table Management
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (TableStorageService) | 13 | 0 | pending |
| Unit (TableContext) | 6 | 0 | pending |
| Unit (Table stats) | 4 | 0 | pending |
| Integration | 15 | 0 | pending |
| E2E Offline | 10 | 0 | pending |
| E2E Online | 3 | 0 | pending |

---

### 06 — Menu Management
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (MenuStorageService) | 15 | 0 | pending |
| Unit (MenuContext) | 4 | 0 | pending |
| Unit (Price calculations) | 4 | 0 | pending |
| Integration | 16 | 0 | pending |
| E2E Offline | 8 | 1 | full_offline_test covers tab load |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Menu tab loads ✅

---

### 07 — Payment
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (PaymentStorageService) | 8 | 0 | pending |
| Unit (Payment calculations) | 9 | 0 | pending |
| Unit (PaymentContext) | 5 | 0 | pending |
| Integration | 15 | 0 | pending |
| E2E Offline | 9 | 0 | pending |
| E2E Online | 4 | 0 | pending |

---

### 08 — Settings
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (Settings helpers) | 8 | 0 | pending |
| Unit (AuthStorageService settings) | 6 | 0 | pending |
| Integration | 19 | 0 | pending |
| E2E Offline | 9 | 1 | full_offline_test covers tab load |
| E2E Online | 4 | 0 | pending |

**Passing assertions in full_offline_test.yaml:**
- Settings tab loads ✅

---

---

### 12 — TRX Payment Terminal
| Category | Tests | Done | Notes |
|----------|-------|------|-------|
| Unit (MMLMessageBuilder) | 21 | 21 | ✅ ALL PASSING |
| Unit (MMLResponseParser) | 28 | 28 | ✅ ALL PASSING (includes live terminal X3 response) |
| Unit (AmountCalculatorService) | 42 | 42 | ✅ ALL PASSING |
| Integration | 13 | 0 | pending |
| E2E Offline (Maestro) | 9 | 9 | trx_settings_smoke.yaml + trx_payment_flow.yaml |
| E2E Online (live terminal) | 6 | 4 | ✅ Full SALE approved, Card→TRX routing, persist, progress modal |

**Live terminal — PAYMENTS WORKING:**
- `192.168.1.12:1180` ✅ Payments approved
- First successful SALE: Visa ****3619, TRX377, $5.44, 10.5s response
- Card Payment → TRX routing: ✅ no mock fallback
- Terminal persist after reload: ✅ SQLite restore (migrated from AsyncStorage)
- Payment progress modal: ✅ ExpoBlurView fix applied
- **Bug 6 fix verified** — all 5 test scenarios pass (fresh connect, hot reload x2, app restart, reconnect, emulator restart)

**Passing Jest tests (91 total):**
- `MMLMessageBuilder.test.ts` ✅ 21/21
- `MMLResponseParser.test.ts` ✅ 28/28
- `AmountCalculatorService.test.ts` ✅ 42/42

**Automated test script:**
- `scripts/test-trx-full-flow.sh` — Full flow (setup + payment)
- `scripts/test-trx-full-flow.sh --skip-setup` — Payment only (terminal in storage)

---

## Issues Fixed During Testing Session — 2026-02-28

### CRITICAL FIX: expo-sqlite Fast Refresh Stale Handle
**Symptom**: After hot reload / Fast Refresh, ALL app data appeared "lost" — login screen shown, menu empty, orders gone.
**Root Cause**: expo-sqlite's native database handle (`NativeDatabase`) becomes stale after Fast Refresh. The JS object still references a native pointer that was invalidated. Any call to `prepareAsync` or `execAsync` throws `java.lang.NullPointerException`.
**Impact**: Every database operation fails silently — auth can't restore session, menu can't load, orders can't be queried.
**Fix** (3 files):
1. `src/services/database/DatabaseService.ts`:
   - Added `SELECT 1` connection validation in `initialize()` before returning cached `this.db`
   - If validation fails (stale handle), sets `this.db = null` and re-opens the database
   - Changed singleton export to use `global.__databaseServiceInstance` pattern so the same instance survives Fast Refresh (module re-evaluation creates new instances otherwise)
2. `src/services/database/DatabaseProvider.tsx`:
   - Added `initDoneRef` to track initialization per JS session
   - On `NativeDatabase` error in dev mode, calls `DevSettings.reload()` to force full app reload (native module is unrecoverable via Fast Refresh alone)
   - Clears `isReady` state on error to prevent stale rendering
**Verification**: Force-stop + restart confirmed auth session, 11 orders, PAID status, 6 menu items, 3 categories, 2 modifier groups ALL persist correctly.

### Cash Payment Flow Verified
- Tested on SERVED order ORD-20260228-9402
- Flow: Order Management → Pay → Payment Processing → No Tip → Cash Payment → $20.00 tendered → Confirm → Payment Confirmation (PAID)
- Order correctly transitions to PAID status with green badge
- Table status automatically updated to "available"
- Payment persists across force-stop + restart

### Minor Issue: Receipt Auto-Generation Error
**File**: `src/screens/payment/PaymentConfirmationScreen.tsx:107`
**Error**: "Order and payment data required for receipt generation"
**Impact**: Non-blocking — payment completes successfully, only receipt auto-generation fails
**Status**: Low priority, not yet fixed

### TRX Terminal — Cannot Test in Expo Go
TCP socket module (`react-native-tcp-socket`) requires custom dev build. Expo Go doesn't have native modules. TRX connection, card payment, and terminal persistence testing deferred to custom dev build.

### Database Persistence Test Results
| Data Type | Persists After Force-Stop? | Notes |
|-----------|--------------------------|-------|
| Auth session | YES | Auto-login works after restart |
| Orders (11 total) | YES | All statuses preserved |
| PAID order status | YES | Payment state preserved |
| Menu categories (3) | YES | Drinks, Mains, Starters |
| Menu items (6) | YES | All prices and availability |
| Modifier groups (2) | YES | Cup Size, Protein |
| Table assignments | YES | Table t-027 references intact |

### Previous Fixes Applied (from plan implementation)
1. **react-native-tcp-socket patch v2**: Global socket counter (`global.__tcpSocketInstanceNumber`) + lazy `NativeEventEmitter` proxy
2. **Terminal Storage → SQLite**: `TerminalStorageService` with `saveSelectedTerminal()`, `getSelectedTerminal()`, `clearSelectedTerminal()`
3. **TerminalDiscoveryService rewrite**: Removed AsyncStorage dependency, uses SQLite only
4. **processPayment amount fix**: Removed double-tax (`amount + tax` → `amount`)
5. **testIDs added**: TRXPaymentModal (6), SplitPaymentModal (5), BillSplitScreen (2), PaymentProcessingScreen (1)
6. **DatabaseService v3 migration**: Added `terminal_settings` table

---

## Session 6 Changes (2026-02-28)

### New Feature: Kitchen Station Override (per menu item)

**Goal**: Staff can now override which kitchen station prepares a specific menu item,
instead of relying on the auto-derived station from category name.

**Files changed:**
- `src/types/menu-management-extended.types.ts` — `kitchen_station?: KitchenStation` added to `MenuItemExtended`
- `src/types/menu-management.types.ts` — `kitchen_station?: KitchenStation` added to `UpdateMenuItemRequest`
- `src/services/database/DatabaseService.ts` — DB v4 migration: `ALTER TABLE menu_items ADD COLUMN kitchen_station TEXT`; schema version bumped 3 → 4
- `src/services/storage/MenuStorageService.ts` — `MenuItemRow.kitchen_station`, `menuItemFromRow()` mapping, `saveMenuItems()` INSERT includes column
- `src/screens/settings/components/menuManagement/modals/EditMenuItemModal.tsx` — Station picker UI (horizontal chip ScrollView) in Basic tab; state + `useKitchenConfig()` integration
- `src/context/unified-order/UnifiedOrderContext.tsx` — `addToCart()` prefers `menuItem.kitchen_station ?? getStationForCategory(...)`

**testIDs added (this session):**

| testID | Element | File |
|--------|---------|------|
| `btn-edit-item-{slug}` | Edit (pencil) button per card | MenuItemCard.tsx |
| `btn-station-auto` | Auto chip in station picker | EditMenuItemModal.tsx |
| `btn-station-hot_kitchen` | Hot Kitchen chip | EditMenuItemModal.tsx |
| `btn-station-cold_kitchen` | Cold Kitchen chip | EditMenuItemModal.tsx |
| `btn-station-grill` | Grill chip | EditMenuItemModal.tsx |
| `btn-station-desserts` | Desserts chip | EditMenuItemModal.tsx |
| `btn-station-beverages` | Beverages chip | EditMenuItemModal.tsx |
| `btn-station-bar` | Bar chip | EditMenuItemModal.tsx |

**UX behavior:**
- "Auto" chip selected by default (subtitle shows derived station name, e.g. "Hot Kitchen")
- Tapping a station chip: fills with station color, persists via SQLite
- Tapping "Auto" chip: clears the override, reverts to auto-derivation
- Only **active** stations from `useKitchenConfig()` are shown (respects Kitchen Management settings)
- Station picker is a horizontal `ScrollView` — all chips accessible without scrolling on tablet

### QA 18 Script Written

**File**: `.maestro/qa_18_kitchen_station_override.yaml`

| TC | Description | testIDs used |
|----|-------------|-------------|
| TC-1 | All 4 tabs reachable via testID | `tab-edit-item-basic/pricing/modifiers/nutritional` |
| TC-2 | Auto chip visible on Basic tab | `btn-station-auto` |
| TC-3 | Garlic Bread → Hot Kitchen → Save → persist | `btn-edit-item-garlic-bread`, `btn-station-hot_kitchen`, `btn-save-item-changes` |
| TC-4 | Garlic Bread → Auto → Save → revert | `btn-station-auto`, `btn-save-item-changes` |
| TC-5 | Latte → Beverages → Save → persist | `btn-edit-item-latte`, `btn-station-beverages` |
| TC-6 | Latte → Auto → Save → revert | `btn-station-auto` |
| TC-7 | POS + Kitchen routing: Garlic Bread (Hot Kitchen) appears in kitchen | `btn-kitchen-action-start/ready/served` |

**Added to full suite**: `qa_full_suite.yaml` now runs QA 18 after QA 12.

---

## Session 2 Changes (2026-02-27)

### Bug Fixes
- ✅ **Menu data persistence** — `MenuContext.refreshMenu()` now calls `menuStorageService.initialize(restaurantId)` before `getMenuData()`. Menu data no longer lost on app restart.

### testIDs Added (38+ total)
- ✅ `DiscountModal.tsx` — 10 testIDs: type buttons, preset %, inputs, reason chips, custom reason, remove/cancel/apply
- ✅ `BillScreen.tsx` — 3 testIDs: `btn-split-by-items`, `btn-split-by-payment`, `btn-pay-full`
- ✅ `PaymentConfirmationScreen.tsx` — 5 testIDs: print, email, sms, new-order, continue
- ✅ `BillSplitScreen.tsx` — 4 testIDs: split type tabs (`tab-split-*`), `btn-pay-all`
- ✅ `PaymentProcessingScreen.tsx` — 3 testIDs: `btn-payment-back`, `btn-cancel-payment`, `btn-print-receipt-payment`
- ✅ `EditCategoryModal.tsx` — 4 testIDs: name input, active switch, cancel, save
- ✅ `EditMenuItemModal.tsx` — 5 testIDs: tabs, name input, cancel, save
- ✅ `MenuEditorToolbar.tsx` — 9 testIDs: filter, sort, view-grid/list, undo/redo, add-item, import, export

### New Documentation
- ✅ `prep/testing/testid-reference.md` — Complete testID map for all screens
- ✅ `prep/testing/manual-adb-guide.md` — ADB commands for manual testing (replaces Maestro)

## Next Actions (Priority Order)

### QA Maestro — Kitchen Station + Payment + TRX (immediate)
1. **Run qa_18** — Kitchen station override (new) (`maestro test .maestro/qa_18_kitchen_station_override.yaml`)
2. **Run qa_08** — Cash payment full flow (`maestro test .maestro/qa_08_cash_payment.yaml`)
3. **Run qa_09** — Split equal (2 guests, cash) (`maestro test .maestro/qa_09_split_equal.yaml`)
4. **Run qa_10** — Split payment modal (multi-method) (`maestro test .maestro/qa_10_split_payment_modal.yaml`)
5. **Run qa_12** — Kitchen management settings (`maestro test .maestro/qa_12_kitchen_management_settings.yaml`)
6. **Run qa_13** — TRX connect + persist (requires live terminal) (`maestro test .maestro/qa_13_trx_connect_persist.yaml`)
7. **Run qa_14** — DB persistence across force-stop (`maestro test .maestro/qa_14_db_persistence.yaml`)

### Already Passed
- qa_01 ✅, qa_02 ✅, qa_03 ✅, qa_04 ✅, qa_05 ✅, qa_06 ✅, qa_07 ✅, qa_11 ✅

### Jest Unit Tests (after QA passes)
7. **Write Jest unit tests** — `CoreAuthService` and `AuthStorageService`
8. **Write Jest unit tests** — `UnifiedOrderStorageService` and `UnifiedOrderContext`

---

## How to Run Tests

```bash
# Jest (unit + integration)
bun test                          # all tests
bun test --testPathPattern auth   # auth only
bun test --coverage               # with coverage report

# Type check (must pass before commit)
bun run type-check

# Lint
bun run lint

# Maestro E2E offline
maestro test .maestro/full_offline_test.yaml    # main suite
maestro test .maestro/                           # all flows

# Maestro E2E online (requires backend)
maestro test .maestro/online/
```

---

## Session 4 — TRX Terminal Connection Fix (2026-02-28)

### Issue: Terminal connection failing in POS App
The TRX terminal at 192.168.1.12:1180 was working in the reference codebase (`Food-MobileApp-Frontend/paymentprocessor`) but failing in the POS App.

### Root Cause
`TerminalDiscoveryService.addManualTerminal()` called `NetworkScanner.addManualTerminal()` which used a single `testConnection()` (3 methods, NO retries). The reference codebase used `NetworkScanner.testManualIP()` which calls `SimpleTCPTester.validateTerminal()` with 2 retries x 3 methods = 6 total attempts.

### Fix Applied
1. **Added `testManualIP()` to `NetworkScanner.ts`** — ports the retry-based validation from the reference codebase using `SimpleTCPTester.validateTerminal(ip, port, 2)`
2. **Updated `TerminalDiscoveryService.addManualTerminal()`** — now calls `networkScanner.testManualIP()` instead of `networkScanner.addManualTerminal()`
3. **Updated `TerminalDiscoveryService.selectTerminal()`** — also uses retry-based `testManualIP()` instead of single `connectAndSend.testConnection()`

### Files Changed
- `src/services/trx/pos/NetworkScanner.ts` — added `testManualIP()` method
- `src/services/trx/pos/TerminalDiscoveryService.ts` — updated `addManualTerminal()` and `selectTerminal()` to use retry path
- `app.json` — added `"scheme": "posapp"` for dev client deep linking

### Verification Results
- **Custom dev build**: `npx expo run:android` — BUILD SUCCESSFUL
- **TCP module**: `turbo=true legacy=true` — native TCP sockets available
- **Connection**: 192.168.1.12:1180 connected on method 1, validated in 4647ms
- **SQLite persistence**: Terminal saved to `terminal_settings` table
- **Force-stop + restart**: ✅ Terminal restored from SQLite — reconnected in 137ms
- **Hot reload**: ✅ `Bundled 134ms → Restoring from SQLite → Connection test passed → CONNECTED`
- **Restoration flow**: `restoreFromStorage → Found stored terminal → Validating terminal → Terminal selected and persisted`

### Detailed Bug Documentation
See `prep/testing/bugs/trx-tcp-connection-failures.md` — all 6 bugs with root cause, fix, and verification.

---

## Session 5 — Bug 6: NativeTcpSocket Registry Checks Fix (2026-02-28)

### Issue: TCP connections permanently broken — 6th consecutive failure

After session 4 fixes (Bugs 1-5), the terminal STILL failed to connect with:
```
[TRX][ERROR][isTcpSocketAvailable] react-native-tcp-socket module not available Module not found
```

This was the **6th time** the TCP connection fix was attempted and failed.

### Root Cause (THE REAL ONE)

`NativeTcpSocket.ts` contained `TurboModuleRegistry.get('TcpSockets')` and/or
`NativeModules.TcpSockets` verification checks. These ALWAYS return null because:

1. The `react-native-tcp-socket@6.4.1.patch` replaces ALL `NativeModules.TcpSockets` references
   in the library with lazy `getTcpSockets()` getters
2. Direct registry checks bypass the patched code path
3. In New Architecture (bridgeless mode), `NativeModules.TcpSockets` is always null
4. `TurboModuleRegistry.get('TcpSockets')` only returns non-null AFTER the patched library
   code has actually requested the native module (which happens lazily at socket use-time)

**The check was a permanent false negative — it could NEVER return true.**

### 5 Failed Fix Attempts Before Root Cause Found

| Attempt | Approach | Why It Failed |
|---------|----------|---------------|
| 1 | `TurboModuleRegistry.get` fallback | Same null — lazy getter patch bypasses registry |
| 2 | Lazy retry `tryInitialize()` on every `isAvailable()` | Same check, same false negative |
| 3 | Expo Go detection + delayed init | Still did registry check after detection |
| 4 | Remove registry check, add global singleton | Global singleton cached OLD broken instance |
| 5 | Clear global on init failure | Race condition — old module evaluated first |

### Fix Applied (Matching Reference Implementation)

**The working reference** (`Food-MobileApp-Frontend/paymentprocessor/services/pos/NativeTcpSocket.ts`)
has **ZERO registry checks**. It simply trusts the `TcpSocket` import:

```typescript
this.tcpSocket = TcpSocket as unknown as TcpSocketLib;
this.isInitialized = true;
```

The actual native binding resolves lazily inside the patched library when
`createConnection()` is called.

### Files Changed (4 files)

| File | Change |
|------|--------|
| `src/services/trx/pos/NativeTcpSocket.ts` | **Complete rewrite** — removed ALL registry checks, match reference |
| `src/services/trx/pos/TcpSocketWrapper.ts` | Updated Expo Go detection via `expo-constants` |
| `src/services/trx/pos/TerminalDiscoveryService.ts` | Global singleton (`global.__terminalDiscoveryServiceInstance`) + payment retry (3 attempts) |
| `src/services/trx/pos/SimpleTCPTester.ts` | Added `localAddress` binding via `expo-network` + `reuseAddress: true` |

### Verification Results — ALL 5 SCENARIOS PASSED

| Test | Result |
|------|--------|
| Fresh TCP connection (192.168.1.12:1180) | ✅ PASSED — "Terminal added successfully" |
| Hot reload x2 (Metro Fast Refresh) | ✅ PASSED — terminal stays connected |
| Full app restart (force-stop + relaunch) | ✅ PASSED — restored from SQLite |
| TCP reconnection after restart | ✅ PASSED — "Terminal added successfully" |
| **Full emulator restart** (kill + fresh boot) | ✅ PASSED — restored from SQLite |

### Key Lesson

> **NEVER** verify `TurboModuleRegistry.get('TcpSockets')` or `NativeModules.TcpSockets`
> when using the patched `react-native-tcp-socket`. The patch replaces all native module
> access with lazy getters. Direct registry checks bypass the patch and ALWAYS return null.
> Trust the import. The native binding resolves at socket use-time, not at check-time.
