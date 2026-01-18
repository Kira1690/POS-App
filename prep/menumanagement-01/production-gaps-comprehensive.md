# Production Gaps - Comprehensive Analysis
## Date: January 18, 2026

---

## Executive Summary

**Overall Production Readiness: 52%**

This document captures ALL production gaps identified during the comprehensive audit across:
- Storage Architecture
- Menu/Modifier/Combo System
- Order/Kitchen Flow
- Table Management
- Billing/Payment
- UI/UX

---

## GAP CATEGORY 1: STORAGE INITIALIZATION

### GAP-STORAGE-001: Missing Storage Service Initializations
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:** `/src/providers/OptimizedAppProviders.tsx`

**Current State:**
```typescript
// Only these are initialized:
await Promise.all([
  orderStorageService.initialize(),
  kitchenStorageService.initialize(),
]);
```

**Missing Initializations:**
- `tableStorageService.initialize(restaurantId)`
- `paymentStorageService.initialize()`
- `menuStorageService` (implicit but should be explicit)

**Impact:**
- Table data lost on app restart
- Payment/billing data lost on app restart
- Settings changes not persisted

**Fix Required:**
```typescript
await Promise.all([
  orderStorageService.initialize(),
  kitchenStorageService.initialize(),
  tableStorageService.initialize(restaurantId),
  paymentStorageService.initialize(),
  menuStorageService.initialize(restaurantId),
]);
```

---

### GAP-STORAGE-002: BillSplitContext No Storage Persistence
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:** `/src/context/billing/BillSplitContext.tsx`

**Current State:**
- BillSplitContext uses in-memory state only
- `paymentStorageService` exists but NEVER called
- Bill splits lost on app restart

**Impact:**
- Split bill configurations disappear on restart
- No recovery of in-progress splits

**Fix Required:**
- Add `paymentStorageService` integration
- Load splits on context mount
- Auto-save on state changes

---

### GAP-STORAGE-003: Table Settings Not Persisted
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:**
- `/src/screens/tables/TableManagementScreen.tsx`
- `/src/context/tableManagement/TableManagementContext.tsx`

**Current State:**
- Settings screens use local `useState` with `MOCK_TABLES`
- Changes never saved to `tableStorageService`
- Two separate table contexts with no sync

**Impact:**
- Table configuration changes lost on restart
- Settings vs Runtime data mismatch

**Fix Required:**
- Connect settings to `tableStorageService`
- Unify or sync table contexts

---

## GAP CATEGORY 2: MENU CONTEXT ISSUES

### GAP-MENU-001: Undefined loadExtendedMenuData Function
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:** `/src/context/menu/MenuContext.tsx`

**Current State (Line 916):**
```typescript
const assignModifiersToMenuItem = useCallback(
  async (menuItemId: string, modifierGroupIds: string[]): Promise<void> => {
    await menuStorageService.assignModifiersToMenuItem(menuItemId, modifierGroupIds);
    await loadExtendedMenuData();  // ❌ UNDEFINED!
    emitEvent('MODIFIERS_ASSIGNED', { menuItemId, modifierGroupIds });
  },
  [emitEvent, loadExtendedMenuData]  // loadExtendedMenuData not defined
);
```

**Impact:**
- Cannot assign modifiers to menu items
- Runtime error when attempting modifier assignment
- Entire modifier flow broken

**Fix Required:**
```typescript
// Define loadExtendedMenuData function
const loadExtendedMenuData = useCallback(async () => {
  const storedData = await menuStorageService.getMenuData(restaurantId);
  if (storedData) {
    dispatch({
      type: 'SET_EXTENDED_DATA',
      payload: {
        categoriesWithStats: storedData.categories,
        menuItemsExtended: storedData.menuItems,
        modifierGroups: storedData.modifierGroups,
        combos: storedData.combos,
      },
    });
  }
}, [restaurantId]);
```

---

## GAP CATEGORY 3: TYPE MISMATCHES

### GAP-TYPE-001: ModifierSelectionModal Wrong Type Structure
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:** `/src/screens/orders/components/ModifierSelectionModal.tsx`

**Current State (Creates FLAT structure):**
```typescript
map((opt) => ({
  groupId: group.id,
  groupName: group.name,
  optionId: opt.id,           // ❌ Should be inside options array
  name: opt.name,             // ❌ Loose field
  priceAdjustment: opt.price_adjustment,
  quantity: 1,
}))
```

**Expected Structure (from order-extended.types.ts):**
```typescript
interface SelectedModifier {
  groupId: string;
  groupName: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  options: SelectedModifierOption[];  // ✅ Options in array
}

interface SelectedModifierOption {
  optionId: string;
  optionName: string;
  priceAdjustment: number;
  quantity: number;
  totalPrice: number;
}
```

**Impact:**
- Cart receives incompatible modifier data
- Price calculations fail (accessing undefined properties)
- Kitchen tickets missing modifier details

**Fix Required:**
- Rebuild modifier selection to create proper nested structure
- Update price calculation to use `options` array

---

### GAP-TYPE-002: ComboSelectionModal Wrong ComboDeal Type
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:** `/src/screens/orders/modals/ComboSelectionModal.tsx`

**Current State (Local definition):**
```typescript
// Modal defines locally:
interface ComboDeal {
  components: ComboComponent[];  // ❌ Wrong!
}
```

**Actual Type (menu-management-extended.types.ts):**
```typescript
interface ComboDeal {
  combo_items: ComboItem[];  // ✅ Actual field name
}
```

**Impact:**
- Modal UI won't render combo items
- Can't select combo options
- Combo ordering completely broken

**Fix Required:**
- Remove local type definition
- Import from `@/types/menu-management-extended.types`
- Update component to use `combo_items`

---

### GAP-TYPE-003: Combo-to-Cart Conversion Not Implemented
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:** `/src/screens/orders/POSOrderScreen.tsx`

**Current State (Lines 170-201):**
```typescript
const handleComboConfirm = useCallback((comboData: any) => {
  try {
    setIsComboModalVisible(false);  // Just closes modal
    // ❌ NEVER ADDS COMBO ITEMS TO CART!
  } catch (error) {
    setError(`Failed to add combo: ${error}`);
  }
}, [setError]);
```

**Impact:**
- Combos can be selected but never added to order
- Complete combo ordering flow broken

**Fix Required:**
- Convert combo selections to ExtendedOrderItem[]
- Add each combo item to cart with proper pricing
- Mark items as combo members

---

## GAP CATEGORY 4: TAX CONFIGURATION

### GAP-TAX-001: Tax Rate Hardcoded in Multiple Files
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:**
- `/src/services/billing/PaymentService.ts` (0.0825)
- `/src/services/billing/CardPaymentService.ts` (0.0825)
- `/src/services/billing/CashPaymentService.ts` (0.0825)
- `/src/services/billing/SplitPaymentService.ts` (0.0825)
- `/src/services/repositories/BillRepository.ts` (0.0825)
- `/src/context/billing/billSplitReducer.ts` (0.1 - DIFFERENT!)

**Impact:**
- Inconsistent tax calculations (8.25% vs 10%)
- Cannot change tax rate without code deployment
- Legal/compliance risk

**Fix Required:**
- Create TaxConfigurationService
- Load tax rate from RestaurantProfile settings
- All services use single source

---

### GAP-TAX-002: Tax Rate Missing from Settings UI
**Severity:** HIGH
**Status:** OPEN
**Files Affected:** `/src/screens/settings/components/PaymentConfigurationSettings.tsx`

**Current State:**
- No tax rate input field
- No persistence logic for tax changes
- RestaurantProfile.sales_tax_rate exists but unused

**Fix Required:**
- Add tax rate input to PaymentConfigurationSettings
- Validate tax percentage (0-100%)
- Persist to RestaurantProfile

---

## GAP CATEGORY 5: CONTEXT SYNCHRONIZATION

### GAP-SYNC-001: Kitchen to POS Status Not Synced
**Severity:** CRITICAL
**Status:** OPEN
**Files Affected:**
- `/src/context/kitchen/EnhancedKitchenContext.tsx`
- `/src/services/storage/OrderStorageService.ts`

**Current State:**
```
POS → Kitchen: ✅ Orders create tickets
Kitchen → POS: ❌ Status changes NOT synced back
```

**Impact:**
- POS shows "pending" when kitchen marks "ready"
- No notifications to staff when order ready
- Manual status checking required

**Fix Required:**
- When ticket status updated, also update order status
- Add event bridge between kitchen and order contexts
- Notification system for status changes

---

### GAP-SYNC-002: Table Contexts Not Unified
**Severity:** HIGH
**Status:** OPEN
**Files Affected:**
- `/src/context/table/TableContext.tsx`
- `/src/context/table/TableProvider.tsx`
- `/src/context/tableManagement/TableManagementContext.tsx`

**Current State:**
- TableManagementContext (Settings) - uses storage
- TableContext (Runtime) - uses API, in-memory only
- No synchronization between them

**Impact:**
- Settings changes invisible to POS
- Table data inconsistent across screens

**Fix Required:**
- Either unify contexts OR implement sync mechanism
- All table operations through single source

---

## GAP CATEGORY 6: POS INTEGRATION

### GAP-POS-001: Wrong Order Context Used
**Severity:** HIGH
**Status:** OPEN
**Files Affected:** `/src/screens/orders/POSOrderScreen.tsx`

**Current State:**
- Uses `useOrder()` from legacy OrderContext
- Should use `useEnhancedOrder()` for kitchen tickets

**Impact:**
- Orders may not create kitchen tickets
- Extended order features not available

**Fix Required:**
- Replace `useOrder()` with `useEnhancedOrder()`
- Update cart operations to use enhanced context

---

## GAP CATEGORY 7: UI/UX

### GAP-UX-001: Missing Accessibility Labels
**Severity:** HIGH
**Status:** OPEN
**Files Affected:** All screens

**Current State:**
- Zero `accessibilityLabel` attributes on interactive elements
- Touch buttons lack descriptions

**Impact:**
- Screen reader users cannot navigate
- ADA compliance violation

**Fix Required:**
- Add accessibilityLabel to ALL interactive elements
- Add accessibilityRole hints

---

### GAP-UX-002: Touch Targets Below Minimum
**Severity:** MEDIUM
**Status:** OPEN
**Files Affected:** Multiple screens

**Current State:**
- Many buttons/icons below 44x44pt minimum
- Icon-only buttons without sufficient padding

**Impact:**
- Difficult to tap accurately
- Poor tablet UX

**Fix Required:**
- Ensure all touch targets minimum 44x44
- Add padding to small icons

---

## GAP CATEGORY 8: DATA PERSISTENCE

### GAP-PERSIST-001: Cart Not Auto-Saved
**Severity:** HIGH
**Status:** OPEN
**Files Affected:** `/src/context/order/orderActions.ts`

**Current State:**
- Cart items exist only in Redux state
- `saveDraft()` exists but never called
- App crash = cart items lost

**Fix Required:**
- Auto-save cart as draft on item operations
- Restore draft on app restart

---

### GAP-PERSIST-002: Storage Cleanup Not Scheduled
**Severity:** MEDIUM
**Status:** OPEN
**Files Affected:**
- `/src/services/storage/OrderStorageService.ts`
- `/src/services/storage/KitchenStorageService.ts`

**Current State:**
- `clearOldOrders()` and `clearOldTickets()` exist
- Never scheduled or called
- Storage grows unbounded

**Fix Required:**
- Schedule cleanup on app boot
- Clear orders >30 days, tickets >7 days

---

## FIX PRIORITY ORDER

### P0 - CRITICAL (Block Production)
1. GAP-MENU-001: Define loadExtendedMenuData
2. GAP-STORAGE-001: Initialize all storage services
3. GAP-TYPE-001: Fix ModifierSelectionModal structure
4. GAP-TYPE-002: Fix ComboSelectionModal types
5. GAP-TYPE-003: Implement combo-to-cart conversion
6. GAP-TAX-001: Create TaxConfigurationService
7. GAP-SYNC-001: Implement Kitchen→POS sync

### P1 - HIGH (Before Beta)
1. GAP-STORAGE-002: BillSplitContext persistence
2. GAP-STORAGE-003: Table settings persistence
3. GAP-SYNC-002: Unify table contexts
4. GAP-POS-001: Use EnhancedOrderContext
5. GAP-UX-001: Accessibility labels
6. GAP-PERSIST-001: Cart auto-save

### P2 - MEDIUM (Before v1.0)
1. GAP-TAX-002: Tax rate in Settings UI
2. GAP-UX-002: Touch target sizes
3. GAP-PERSIST-002: Storage cleanup

---

## ESTIMATED EFFORT

| Priority | Gaps | Estimated Hours |
|----------|------|-----------------|
| P0 Critical | 7 | 20-25 hours |
| P1 High | 6 | 15-20 hours |
| P2 Medium | 3 | 8-10 hours |
| **TOTAL** | **16** | **43-55 hours** |

---

## CHANGE LOG

| Date | Gap ID | Action | Status |
|------|--------|--------|--------|
| 2026-01-18 | ALL | Initial documentation | Created |

