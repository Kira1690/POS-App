# Printer Integration -- File Mapping

## Exact locations of every change needed

---

### Phase 1: Foundation

#### 1A. DB v7 Migration
**File**: `src/services/database/DatabaseService.ts`
- **Line 20**: Increment `DB_VERSION` from 6 to 7
- **Line ~135**: Add v7 migration block after v6 block (after line 261)
- SQL: `CREATE TABLE IF NOT EXISTS station_printers (...)`

#### 1B. PrinterStorageService Extensions
**File**: `src/services/storage/PrinterStorageService.ts`
- **After line 21**: Add `StationPrinter` interface export
- **After line 97**: Add 4 new methods: `getStationPrinters`, `getStationPrinter`, `saveStationPrinter`, `deleteStationPrinter`

#### 1C. PrinterContext (NEW)
**File**: `src/context/printer/PrinterContext.tsx` (NEW)
- Imports: `epsonPrinterService`, `printerStorageService`, `UnifiedOrder`, `KitchenStation`
- Context value: `printReceipt`, `printKOT`, `printStationKOT`, `testPrinter`, `printTestPage`, `config`, `stationPrinters`, `refreshConfig`
- Provider: loads config on mount, provides memoized context

#### 1D. Provider Chain
**File**: `src/providers/OptimizedAppProviders.tsx`
- **Import**: Add `PrinterProvider` import
- **JSX**: Wrap after `KitchenConfigProvider`, before payment providers

---

### Phase 2: Wire Up Buttons

#### 2A. OrderDetailsScreen
**File**: `src/screens/orders/OrderDetailsScreen.tsx`
- **Line 67-69**: Replace empty `handlePrint` callback
- **Add import**: `usePrinter` from PrinterContext
- **Conversion needed**: `Order` -> `UnifiedOrder` (use existing `toUnifiedOrder` helper or cast)

#### 2B. POSOrderScreen
**File**: `src/screens/orders/POSOrderScreen.tsx`
- **Line 619-625**: Replace toast-only `handlePrint`
- **Add import**: `usePrinter` from PrinterContext
- **Need**: Build UnifiedOrder from current cart + table for KOT

#### 2C. OrderManagementScreen
**File**: `src/screens/orders/OrderManagementScreen.tsx`
- **Line 503-509**: Replace toast-only `onPrintKOT` lambda
- **Add import**: `usePrinter` from PrinterContext
- **Already has**: `UnifiedOrder` (the `item` is already a UnifiedOrder)

#### 2D. OrderCartPanel
**File**: `src/components/business/menu/OrderCartPanel.tsx`
- **Line 341-342**: `// TODO: Implement print KOT` -- wire to prop
- **Props interface**: Add `onPrintKOT?: () => void`
- **Parent (POSOrderScreen)**: Pass `onPrintKOT` prop down

#### 2E. BillPanel
**File**: `src/components/business/order/BillPanel.tsx`
- **Line 316-320**: `onPrint` prop already wired to parent
- **No change needed**: Automatically works when POSOrderScreen handler (2B) is fixed

#### 2F. PaymentConfirmationScreen
**File**: `src/screens/payment/PaymentConfirmationScreen.tsx`
- **Line 22-23**: Remove direct `epsonPrinterService` and `printerStorageService` imports
- **Line 121-152**: Replace entire `handlePrintReceipt` with `printReceipt(order)` from context
- **Saves ~30 lines** of duplicated printer config loading

#### 2G. ReceiptPreviewScreen
**File**: `src/screens/receipt/ReceiptPreviewScreen.tsx`
- **Line 167-170**: Replace `receiptService.printReceipt(receipt.id)` with context `printReceipt`
- **Add import**: `usePrinter` from PrinterContext
- **Keep**: `receiptService.generateReceipt()` for on-screen preview generation

---

### Phase 3: Auto-Print on Send to Kitchen

#### 3A. POSOrderScreen send handler
**File**: `src/screens/orders/POSOrderScreen.tsx`
- **Line 627-670**: `handleSendToKitchen` function
- **After line 639** (after `addItemsToOrder` success): Add auto-print KOT
- **After line 664** (after `createOrder` success): Add auto-print KOT
- Pattern: fire-and-forget `printKOT(order).catch(...)` to not block UI

#### 3B. PrinterContext per-station routing
**File**: `src/context/printer/PrinterContext.tsx`
- Inside `printKOT` implementation
- Group `order.items` by `item.kitchen_station`
- Look up station-specific printer from `stationPrinters`
- Fall back to `config.kitchen_printer` if no station printer
- Use `Promise.allSettled()` for parallel multi-station printing

---

### Phase 4: Kitchen Display Reprint

**File**: `src/screens/orders/KitchenDisplayScreen.tsx`
- **Ticket card render section** (~line 280-340): Add printer icon button
- **Add import**: `usePrinter` from PrinterContext
- **Add handler**: `handleReprint(order, station)` -> `printStationKOT(order, station)`
- **Button placement**: Next to status action buttons in `ticketActions` row
- **testID**: `btn-reprint-kot-{orderId}`

---

### Phase 5: Settings UI Redesign

#### 5A. PrinterSettingsPanel Rewrite
**File**: `src/screens/settings/components/PrinterSettingsPanel.tsx` (REWRITE)
- Remove all 10 `useState` calls -- use `usePrinterSettings` hook instead
- Add section cards with test + print-test buttons INSIDE each card
- Add station printers section listing all active kitchen stations
- Show persistent connection status with timestamp
- Larger tap targets for paper size chips

#### 5B. usePrinterSettings Hook (NEW)
**File**: `src/hooks/usePrinterSettings.ts`
- Loads config from `printerStorageService` on mount
- Loads station printers on mount
- Exposes all state + action methods
- Handles change tracking (`hasChanges`)
- Manages connection status persistence

#### 5C. StationPrinterRow (NEW)
**File**: `src/screens/settings/components/printer/StationPrinterRow.tsx`
- Compact row with station name, IP, status
- Expands inline for IP/port editing
- Test + Remove + Save actions
- Collapsed state: station color dot | name | IP or "(uses default)" | [Edit]

---

### Phase 6: Service Hardening

**File**: `src/services/printer/EpsonPrinterService.ts`
- **Line 38-71** (`sendBytes`): Add retry wrapper `sendBytesWithRetry`
- **After line 81**: Add `lastConnected` Map for status caching
- **Line 173** (`printKitchenTicket`): Add optional `station` param for station header
- **New method**: `printMultiStationKOT(order, stationPrinterMap)` using `Promise.allSettled()`

---

## Type Conversions Needed

Several screens have `Order` type (legacy) while printer needs `UnifiedOrder`.

Existing conversion helper in `src/screens/orders/OrderManagementScreen.tsx`:
```typescript
const toOrderFormat = (item: UnifiedOrder): Order => { ... }
```

Need inverse: `toUnifiedOrder(order: Order): UnifiedOrder` -- or just cast since
the printer only uses common fields: `orderNumber`, `tableName`, `items`, `subtotal`,
`taxAmount`, `discountAmount`, `tipAmount`, `totalAmount`, `createdAt`.

Safest approach: `printReceipt` and `printKOT` accept `UnifiedOrder | Order` and
normalize internally.

---

## Import Dependency Graph

```
PrinterContext
  +-- EpsonPrinterService (singleton)
  +-- PrinterStorageService (singleton)
  +-- KitchenConfigContext (for active station list)
  +-- NativeTcpSocket (via EpsonPrinterService, indirect)

Consuming Screens:
  OrderDetailsScreen       --> usePrinter()
  POSOrderScreen           --> usePrinter()
  OrderManagementScreen    --> usePrinter()
  KitchenDisplayScreen     --> usePrinter()
  PaymentConfirmationScreen --> usePrinter()
  ReceiptPreviewScreen     --> usePrinter()

Consuming Components:
  OrderCartPanel           --> onPrintKOT prop (from POSOrderScreen)
  BillPanel                --> onPrint prop (from POSOrderScreen)
  OrderActionPanel         --> onPrint prop (from OrderDetailsScreen)

Settings:
  PrinterSettingsPanel     --> usePrinterSettings() (direct service calls, no context)
```
