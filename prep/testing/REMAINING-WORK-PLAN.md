# POS — Remaining Work Plan

## Source: Gantt Chart v4 Gap Analysis (2026-03-05)

After auditing all 22 Gantt chart tasks against the codebase, **all core features are implemented**. What remains are: wiring gaps (features built but not connected on some screens), stub alerts blocking users, and 3 unbuilt minor features.

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| P0 | Blocker — user sees "coming soon" for a feature that exists |
| P1 | High — missing feature from Gantt chart |
| P2 | Medium — polish/integration gap found during QA |
| P3 | Low — nice-to-have, not in original sprint |

---

## Remaining Items (11 tasks)

### P0 — Wire Existing Features (Remove "Coming Soon" Stubs)

#### Task 1: Wire Discount to POSOrderScreen
**File:** `POS-App/src/screens/orders/POSOrderScreen.tsx` (line ~673-676)
**Current:** Shows "Discount feature coming soon" alert
**Fix:** Import `DiscountModal` (already exists at `src/screens/orders/modals/DiscountModal.tsx`) and wire it the same way `BillScreen.tsx` does (line 720).
**Steps:**
1. Add `DiscountModal` import
2. Add state: `const [showDiscount, setShowDiscount] = useState(false);`
3. Replace the "coming soon" `showToast` with `setShowDiscount(true)`
4. Add `<DiscountModal>` to JSX with `onApply` updating the current order's discount via `UnifiedOrderContext`
5. Verify: Tap "Discount" button on POS screen → modal opens with percentage/fixed options
**Est:** 1-2 hours

#### Task 2: Wire Split Bill to POSOrderScreen
**File:** `POS-App/src/screens/orders/POSOrderScreen.tsx` (line ~681-684)
**Current:** Shows "Split bill feature coming soon" alert
**Fix:** Navigate to `BillSplitScreen` (already exists at `src/screens/billing/BillSplitScreen.tsx`).
**Steps:**
1. Replace the "coming soon" `showToast` with navigation: `navigation.navigate('BillSplit', { orderId: currentOrder.id })`
2. Ensure `BillSplit` route exists in the Orders stack navigator
3. Verify: Tap "Split Bill" on POS screen → BillSplitScreen opens with equal/items/payment tabs
**Est:** 1 hour

#### Task 3: Remove Floor Plan Editor Stub
**File:** `POS-App/src/screens/settings/components/tableManagement/TablesSettings.tsx` (line 400)
**Current:** Shows "Floor Plan Editor (Phase 3)" alert
**Fix:** Either hide the button or implement a basic drag-and-drop floor plan.
**Recommendation:** Hide button for now (Phase 3 feature). Add `// Phase 3` comment.
**Steps:**
1. Wrap the Floor Plan button in a conditional: `{false && <Button ... />}`
2. Or change button text to "Floor Plan Editor" with `disabled={true}` prop
**Est:** 15 minutes

---

### P1 — Build Missing Features

#### Task 4: Menu Item Edit Modal
**File:** `POS-App/src/screens/menu-management/MenuItemsScreen.tsx` (line 174-176)
**Current:** Shows "Edit functionality coming soon" alert when tapping Edit on a menu item
**Fix:** Build `MenuItemEditModal` component similar to the existing create flow.
**Steps:**
1. Create `src/screens/menu-management/modals/MenuItemEditModal.tsx`
2. Props: `{ visible, item: MenuItem, onSave, onCancel }`
3. Pre-populate form with existing item data (name, price, category, description, availability)
4. On save: call `menuApiClient.updateItem(item.id, data)` or update local storage
5. Wire into `MenuItemsScreen.tsx` replacing the "coming soon" alert
6. Verify: Tap Edit on any menu item → modal opens with pre-filled data → save updates the item
**Est:** 3-4 hours

#### Task 5: Menu Bulk Operations
**File:** `POS-App/src/screens/menu-management/MenuManagementScreen.tsx` (line 227)
**Current:** Shows "Bulk operations feature coming soon"
**Recommendation:** Low priority. Either remove the button or implement basic bulk:
- Select multiple items → bulk enable/disable availability
- Select multiple items → bulk delete
**Est:** 4-6 hours (or 15 min to hide button)

#### Task 6: Menu Import
**File:** `POS-App/src/screens/menu-management/MenuManagementScreen.tsx` (line 234)
**Current:** Shows "Menu import feature coming soon"
**Recommendation:** Low priority. CSV/JSON import of menu items.
**Est:** 6-8 hours (or 15 min to hide button)

---

### P2 — QA-Identified Gaps

#### Task 7: Payment Sync to Web Billing
**Context:** QA showed that mobile payments don't appear on web /billing page (SV-04 partial, SV-05 fail)
**Root Cause:** `PaymentSyncProcessor.ts` pushes to `/api/billing/sync/push` but the payment record format doesn't match what the web billing page queries.
**Fix:**
1. Check Core Service billing query: what fields/status does it filter on?
2. Update `PaymentSyncProcessor.ts` to send `status: 'completed'` and correct field names
3. Rebuild APK
4. Re-run payment flow → verify transaction appears on web /billing
**Est:** 2-3 hours

#### Task 8: Web Reports Show $0.00
**Context:** Web /reports page shows $0.00 even after completed payments (SV-08)
**Root Cause:** Reports query depends on `payment_records` having `status = 'completed'`
**Fix:** Depends on Task 7 (payment sync). Once payments sync correctly, reports should populate.
**Est:** 1 hour (verification after Task 7)

#### Task 9: Customer Sync (App → Web)
**Context:** Customer created on mobile doesn't appear on web /customers (SV-07)
**Fix:**
1. Check if customer creation enqueues to SyncQueue
2. If not, add `syncQueueService.enqueue('customer', ...)` after customer creation
3. Create `CustomerSyncProcessor.ts` similar to `OrderSyncProcessor.ts`
4. Register in `SyncEngine.pushPending()`
**Est:** 3-4 hours

---

### P3 — Polish

#### Task 10: MFA Verification
**File:** `POS-App/src/screens/auth/ManagerLoginScreen.tsx` (lines 92, 94)
**Current:** TODO comments for MFA implementation
**Status:** Not blocking — MFA is a future security enhancement
**Est:** 8-12 hours

#### Task 11: Restaurant Profile API Wiring
**File:** `POS-App/src/screens/settings/components/RestaurantProfileSettings.tsx` (lines 107, 128)
**Current:** TODO comments for real API integration + file upload
**Status:** Settings screen shows data but save doesn't persist to backend
**Est:** 3-4 hours

---

## Summary Table

| # | Task | Priority | Est. Hours | Blocking Users? |
|---|------|----------|------------|----------------|
| 1 | Wire Discount to POSOrderScreen | P0 | 1-2h | Yes — "coming soon" alert |
| 2 | Wire Split Bill to POSOrderScreen | P0 | 1h | Yes — "coming soon" alert |
| 3 | Remove Floor Plan Editor stub | P0 | 0.25h | Yes — misleading button |
| 4 | Menu Item Edit Modal | P1 | 3-4h | Yes — can't edit items |
| 5 | Menu Bulk Operations | P1 | 4-6h | No — can hide button |
| 6 | Menu Import | P1 | 6-8h | No — can hide button |
| 7 | Payment Sync to Web Billing | P2 | 2-3h | No — mobile payments work |
| 8 | Web Reports $0.00 | P2 | 1h | No — depends on Task 7 |
| 9 | Customer Sync (App→Web) | P2 | 3-4h | No — mobile customers work |
| 10 | MFA Verification | P3 | 8-12h | No — future feature |
| 11 | Restaurant Profile API | P3 | 3-4h | No — cosmetic |
| | **Total (P0+P1 only)** | | **~16h** | |
| | **Total (All)** | | **~40h** | |

---

## Recommended Execution Order

### Phase A: Quick Wins — Remove Stubs (2-3 hours)
1. Task 1: Wire DiscountModal to POSOrderScreen
2. Task 2: Wire Split Bill navigation to POSOrderScreen
3. Task 3: Hide/disable Floor Plan Editor button
4. Rebuild APK and verify all 3

### Phase B: Menu Edit (3-4 hours)
5. Task 4: Build MenuItemEditModal
6. Rebuild APK and verify

### Phase C: Sync Fixes (5-7 hours)
7. Task 7: Fix payment sync format
8. Task 8: Verify web reports populate
9. Task 9: Add customer sync processor
10. Rebuild APK, re-run Maestro QA, re-run sync verification

### Phase D: Optional (14-24 hours)
11. Task 5: Menu bulk operations (or hide button)
12. Task 6: Menu import (or hide button)
13. Task 10: MFA
14. Task 11: Restaurant profile API

### Phase E: Final QA Re-run
- Re-run full Bistro QA suite (see `BISTRO-QA-RUNBOOK.md`)
- Update HTML report with new results
- Client demo prep
