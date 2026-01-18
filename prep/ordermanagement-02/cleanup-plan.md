# Legacy Code Cleanup Plan

## Files to DELETE

### Context Layer (Order)

| File | Reason | Replaced By |
|------|--------|-------------|
| `src/context/order/OrderContext.tsx` | Legacy order context | `UnifiedOrderContext.tsx` |
| `src/context/order/EnhancedOrderContext.tsx` | Duplicate order context | `UnifiedOrderContext.tsx` |
| `src/context/order/orderReducer.ts` | Legacy reducer | `unifiedOrderReducer.ts` |
| `src/context/order/orderActions.ts` | Actions merged into context | `UnifiedOrderContext.tsx` |
| `src/context/order/orderSelectors.ts` | Selectors merged into hooks | `UnifiedOrderContext.tsx` |
| `src/context/order/index.ts` | Legacy exports | `unified-order/index.ts` |

### Context Layer (Order Management)

| File | Reason | Replaced By |
|------|--------|-------------|
| `src/context/orderManagement/OrderManagementContext.tsx` | Duplicate functionality | `UnifiedOrderContext.tsx` |
| `src/context/orderManagement/index.ts` | Legacy exports | `unified-order/index.ts` |

### Context Layer (Kitchen) - KEEP BUT UPDATE

| File | Action | Notes |
|------|--------|-------|
| `src/context/kitchen/EnhancedKitchenContext.tsx` | UPDATE | Will use unified orders, not separate tickets |
| `src/context/kitchen/kitchenReducer.ts` | UPDATE | Simplify to work with unified orders |
| `src/context/kitchen/index.ts` | KEEP | Update exports |

### Storage Layer

| File | Reason | Replaced By |
|------|--------|-------------|
| `src/services/storage/OrderStorageService.ts` | Legacy storage | `UnifiedOrderStorageService.ts` |
| `src/services/storage/KitchenStorageService.ts` | Separate tickets no longer needed | Kitchen data in unified orders |

### Events Layer

| File | Reason | Replaced By |
|------|--------|-------------|
| `src/services/events/OrderEventEmitter.ts` | Separate event system | `orderEventEmitter` in unified context |

### Types (Deprecate but Keep for Reference)

| File | Action | Notes |
|------|--------|-------|
| `src/types/order.types.ts` | DEPRECATE | Add deprecation comment, keep for migration |
| `src/types/kitchen-ticket.types.ts` | KEEP PARTIAL | Kitchen stations still needed |
| `src/types/order-extended.types.ts` | DEPRECATE | Keep SelectedModifier, KitchenStation |

---

## Files to UPDATE

### Providers

| File | Changes |
|------|---------|
| `src/providers/OptimizedAppProviders.tsx` | Remove EnhancedOrderProvider, keep only UnifiedOrderProvider |
| `App.tsx` | Already updated - uses OptimizedAppProviders |

### Screens

| File | Changes |
|------|---------|
| `src/screens/orders/POSOrderScreen.tsx` | Already uses unified context |
| `src/screens/orders/OrderManagementScreen.tsx` | Already uses unified context |
| `src/screens/orders/KitchenDisplayScreen.tsx` | UPDATE to use unified context |
| `src/screens/billing/BillScreen.tsx` | Already uses unified context (with adapter) |

### Context

| File | Changes |
|------|---------|
| `src/context/billing/BillSplitContext.tsx` | Update to accept UnifiedOrder types |
| `src/context/table/TableProvider.tsx` | Already subscribes to unified events |

### Storage Index

| File | Changes |
|------|---------|
| `src/services/storage/index.ts` | Remove legacy exports, keep unified |

---

## Deletion Order (IMPORTANT)

Execute deletions in this order to avoid breaking dependencies:

```
STEP 1: Update imports in screens and providers FIRST
       (Change imports to use unified-order before deleting)

STEP 2: Update OptimizedAppProviders
       - Remove EnhancedOrderProvider
       - Remove imports from legacy contexts

STEP 3: Delete context files
       - src/context/order/ (entire folder)
       - src/context/orderManagement/ (entire folder)

STEP 4: Delete storage files
       - src/services/storage/OrderStorageService.ts
       - src/services/storage/KitchenStorageService.ts

STEP 5: Delete events file
       - src/services/events/OrderEventEmitter.ts

STEP 6: Update storage/index.ts
       - Remove legacy exports

STEP 7: Run type check and fix any remaining issues
```

---

## Pre-Deletion Verification

Before deleting, verify these files exist and are ready:

### Unified Context (MUST EXIST)
- [x] `src/context/unified-order/UnifiedOrderContext.tsx`
- [x] `src/context/unified-order/unifiedOrderReducer.ts`
- [x] `src/context/unified-order/index.ts`

### Unified Storage (MUST EXIST)
- [x] `src/services/storage/UnifiedOrderStorageService.ts`

### Unified Types (MUST EXIST)
- [x] `src/types/unified-order.types.ts`

---

## Post-Deletion Verification

After deletion, verify:

```bash
# Type check should pass (ignoring pre-existing theme issues)
npx tsc --noEmit 2>&1 | grep -v "apple\|Apple\|layer\|surfaceDisabled"

# No imports from deleted files
grep -r "from '@/context/order'" src/
grep -r "from '@/context/orderManagement'" src/
grep -r "OrderStorageService" src/
grep -r "KitchenStorageService" src/
grep -r "from '@/services/events/OrderEventEmitter'" src/
```

All above grep commands should return empty (no matches).
