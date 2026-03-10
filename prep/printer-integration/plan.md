# Printer Integration -- Master Plan

## Overview
Full integration of Epson ESC/POS network printers across the entire POS app.
Connects receipt printing, kitchen KOT printing, per-station multi-printer support,
auto-print on send-to-kitchen, and a redesigned Settings UI.

**Status**: PLANNING COMPLETE -- READY FOR IMPLEMENTATION

---

## Architecture

```
PrinterContext (NEW -- single source of truth)
  |-- printerStorageService    --> SQLite (printer_settings, station_printers)
  |-- epsonPrinterService      --> TCP via NativeTcpSocket (ESC/POS bytes)
  |
  |-- printReceipt(order)      --> loads receipt printer config, sends to Epson
  |-- printKOT(order)          --> loads kitchen printer config, sends to Epson
  |-- printStationKOT(order, station) --> loads per-station printer, sends filtered items
  |-- testPrinter(ip, port)    --> ESC/POS init test
  |-- printTestPage(ip, port)  --> full test page with cut
  |
  Consumers:
    PaymentConfirmationScreen  --> printReceipt (already working, migrate to context)
    OrderDetailsScreen         --> printKOT, printReceipt
    POSOrderScreen             --> printKOT
    OrderManagementScreen      --> printKOT
    OrderCartPanel / BillPanel --> printKOT
    SendToKitchenModal         --> auto printStationKOT on confirm
    KitchenDisplayScreen       --> reprint KOT per ticket
    ReceiptPreviewScreen       --> printReceipt (replace mock)
    PrinterSettingsPanel       --> testPrinter, printTestPage, save config
```

## Current State (What Exists)

| Component | File | Status |
|-----------|------|--------|
| EpsonPrinterService | `src/services/printer/EpsonPrinterService.ts` | COMPLETE -- TCP/ESC-POS, 4 methods |
| PrinterStorageService | `src/services/storage/PrinterStorageService.ts` | PARTIAL -- single receipt + single kitchen |
| PrinterSettingsPanel | `src/screens/settings/components/PrinterSettingsPanel.tsx` | PARTIAL -- basic form, poor UX |
| NativeTcpSocket | `src/services/trx/pos/NativeTcpSocket.ts` | COMPLETE -- lazy init, availability check |
| DB v6 migration | `src/services/database/DatabaseService.ts:226-261` | COMPLETE -- printer_settings table |
| KitchenConfigContext | `src/context/kitchen/KitchenConfigContext.tsx` | COMPLETE -- station CRUD |
| KitchenStation type | `src/types/order-extended.types.ts:12-18` | COMPLETE -- 6 stations |

---

## Phases

### Phase 1: PrinterContext + Storage Schema (Foundation)
**Goal**: Single context that all screens use for printing. Extend DB to support per-station printers.

#### 1A. Extend DB Schema (v7 migration)

**File**: `src/services/database/DatabaseService.ts`

New table `station_printers`:
```sql
CREATE TABLE IF NOT EXISTS station_printers (
  id TEXT PRIMARY KEY,
  station TEXT NOT NULL,          -- 'hot_kitchen', 'cold_kitchen', etc.
  printer_name TEXT NOT NULL,     -- user-friendly label
  ip_address TEXT NOT NULL,
  port INTEGER DEFAULT 9100,
  enabled INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL,
  UNIQUE(station)                 -- one printer per station
);
```

Keep existing `printer_settings` table for receipt + default kitchen printer.
`station_printers` overrides: if a station has a row here, use that IP; otherwise fall back to the default kitchen printer.

#### 1B. Extend PrinterStorageService

**File**: `src/services/storage/PrinterStorageService.ts`

Add methods:
- `getStationPrinters(): Promise<StationPrinter[]>`
- `getStationPrinter(station: KitchenStation): Promise<StationPrinter | null>`
- `saveStationPrinter(printer: StationPrinter): Promise<void>`
- `deleteStationPrinter(station: KitchenStation): Promise<void>`

New type:
```typescript
interface StationPrinter {
  id: string;
  station: KitchenStation;
  printer_name: string;
  ip_address: string;
  port: number;
  enabled: boolean;
}
```

#### 1C. Create PrinterContext

**File**: `src/context/printer/PrinterContext.tsx` (NEW)

```typescript
interface PrinterContextValue {
  // Config
  config: PrinterConfig;
  stationPrinters: StationPrinter[];
  isLoading: boolean;

  // Actions
  printReceipt: (order: UnifiedOrder) => Promise<void>;
  printKOT: (order: UnifiedOrder) => Promise<void>;
  printStationKOT: (order: UnifiedOrder, station: KitchenStation) => Promise<void>;
  testPrinter: (ip: string, port: number) => Promise<boolean>;
  printTestPage: (ip: string, port: number) => Promise<void>;
  refreshConfig: () => Promise<void>;
}
```

Logic inside `printKOT`:
1. Get all active stations from `KitchenConfigContext`
2. For each station, filter order items by `item.kitchen_station`
3. Look up station-specific printer from `stationPrinters`
4. If station printer exists and enabled --> print to that IP
5. Else fall back to default kitchen printer from `config.kitchen_printer`
6. If no kitchen printer configured --> show toast "Kitchen printer not configured"

Logic inside `printReceipt`:
1. Load `config.receipt_printer`
2. If enabled + IP set --> `epsonPrinterService.printReceipt(...)`
3. Else --> show toast "Receipt printer not configured. Go to Settings > Printer Management"

#### 1D. Add PrinterProvider to app

**File**: `src/providers/OptimizedAppProviders.tsx`

Wrap inside existing provider chain (after KitchenConfigProvider, before payment providers).

**Files touched**: 4
**New files**: 1 (`PrinterContext.tsx`)

---

### Phase 2: Wire Up All Print Buttons (Integration)
**Goal**: Every "Print KOT" and "Print Receipt" button calls PrinterContext.

#### 2A. OrderDetailsScreen -- Fix empty handlePrint

**File**: `src/screens/orders/OrderDetailsScreen.tsx` (line 67-69)

Current:
```typescript
const handlePrint = useCallback((type: 'KOT' | 'Receipt') => {
  // Print functionality would be implemented here
}, [order]);
```

Fix:
```typescript
const { printKOT, printReceipt } = usePrinter();

const handlePrint = useCallback(async (type: 'KOT' | 'Receipt') => {
  if (!order) return;
  const unifiedOrder = toUnifiedOrder(order);  // convert Order -> UnifiedOrder
  if (type === 'KOT') {
    await printKOT(unifiedOrder);
  } else {
    await printReceipt(unifiedOrder);
  }
}, [order, printKOT, printReceipt]);
```

#### 2B. POSOrderScreen -- Fix toast-only handlePrint

**File**: `src/screens/orders/POSOrderScreen.tsx` (line 619-625)

Current: shows toast "Printing Kitchen Order Ticket" -- does nothing.

Fix: use `printKOT` from context. Build a temporary UnifiedOrder from the current cart + table state.

#### 2C. OrderManagementScreen -- Fix toast-only onPrintKOT

**File**: `src/screens/orders/OrderManagementScreen.tsx` (line 503-509)

Current: shows toast "Printing KOT for {orderNumber}" -- does nothing.

Fix: call `printKOT(item)` where `item` is already a `UnifiedOrder`.

#### 2D. OrderCartPanel -- Fix empty TODO

**File**: `src/components/business/menu/OrderCartPanel.tsx` (line 341-342)

Current: `// TODO: Implement print KOT`

Fix: Accept `onPrintKOT` prop from parent, wire to PrinterContext in POSOrderScreen.

#### 2E. BillPanel -- Fix delegated Print KOT

**File**: `src/components/business/order/BillPanel.tsx` (line 316-320)

Current: calls `onPrint` which goes back to POSOrderScreen's toast handler.

Fix: Will automatically work once POSOrderScreen's handler is fixed (2B).

#### 2F. PaymentConfirmationScreen -- Migrate to PrinterContext

**File**: `src/screens/payment/PaymentConfirmationScreen.tsx` (line 121-152)

Current: manually loads printerStorageService + calls epsonPrinterService inline.

Fix: Replace with `printReceipt(order)` from PrinterContext. Removes 30 lines of duplicated logic.

#### 2G. ReceiptPreviewScreen -- Replace mock with real printer

**File**: `src/screens/receipt/ReceiptPreviewScreen.tsx` (line 167-170)

Current: calls `receiptService.printReceipt()` which is a fake delay.

Fix: call `printReceipt(order)` from PrinterContext. Keep `receiptService` for receipt generation only.

**Files touched**: 7
**New files**: 0

---

### Phase 3: Auto-Print KOT on Send to Kitchen
**Goal**: When "Confirm" is tapped in SendToKitchenModal, automatically print KOT to kitchen printer(s).

#### 3A. Add auto-print to kitchen send flow

**Where**: The `onConfirm` callback comes from POSOrderScreen's `handleSendToKitchen`.

**File**: `src/screens/orders/POSOrderScreen.tsx`

After `createOrder()` or `addItemsToOrder()` succeeds:
```typescript
// Auto-print KOT if kitchen printer is configured
const { printKOT, config } = usePrinter();
if (config.kitchen_printer.enabled) {
  // Fire-and-forget -- don't block the UI
  printKOT(createdOrder).catch(() => {
    showToast({ type: 'warning', title: 'Print Failed', message: 'KOT could not be printed' });
  });
}
```

#### 3B. Per-station printing in PrinterContext.printKOT

When `printKOT(order)` is called:
1. Group items by `item.kitchen_station`
2. For each station group:
   a. Check `stationPrinters` for a station-specific printer
   b. If found --> create a filtered order with only that station's items --> `epsonPrinterService.printKitchenTicket(stationIP, port, filteredOrder)`
   c. If not found --> use default kitchen printer
3. If no printer at all --> single consolidated KOT to default kitchen printer
4. Each station ticket shows ONLY that station's items (kitchen staff don't need to see bar items)

**Files touched**: 2
**New files**: 0

---

### Phase 4: Kitchen Display Reprint Button
**Goal**: Kitchen staff can reprint any ticket from the Kitchen Display.

**File**: `src/screens/orders/KitchenDisplayScreen.tsx`

Add a printer icon button to each kitchen ticket card, next to the status action buttons:

```
[Start Preparing]  [Reprint]    <-- for pending tickets
[Mark Ready]       [Reprint]    <-- for preparing tickets
```

Implementation:
- Import `usePrinter` from PrinterContext
- Add `handleReprint(order, station)` callback
- Calls `printStationKOT(order, station)` which prints only that station's items
- Shows brief toast "Reprinting KOT..."

**Files touched**: 1
**New files**: 0

---

### Phase 5: Redesign Printer Settings UI
**Goal**: Professional settings panel matching Apple-style design, with per-station printer assignment.

#### 5A. Redesign PrinterSettingsPanel

**File**: `src/screens/settings/components/PrinterSettingsPanel.tsx` (REWRITE)

Current problems:
- Flat form with 10 raw useState calls
- No visual hierarchy between receipt/kitchen sections
- Test button outside the section card (looks orphaned)
- No per-station printer support
- No print test page button (only connection test)
- No connection status indicator (only momentary flash)
- No "last tested" timestamp
- Paper size chips are tiny and hard to tap

New design:

```
+--------------------------------------------------+
|  RECEIPT PRINTER                                  |
|  +----------------------------------------------+|
|  | Enable         [=====O]                      ||
|  | IP Address     [ 192.168.1.105          ]    ||
|  | Port           [ 9100                   ]    ||
|  | Paper Size     [ 58mm ]  [*80mm*]            ||
|  +----------------------------------------------+|
|  | [Test Connection]  [Print Test Page]          ||
|  | Status: Connected (tested 2m ago)             ||
|  +----------------------------------------------+|
|                                                   |
|  KITCHEN PRINTERS                                 |
|  +----------------------------------------------+|
|  | Default Kitchen Printer                       ||
|  | Enable         [=====O]                      ||
|  | IP Address     [ 192.168.1.106          ]    ||
|  | Port           [ 9100                   ]    ||
|  +----------------------------------------------+|
|  | [Test Connection]  [Print Test Page]          ||
|  +----------------------------------------------+|
|                                                   |
|  STATION-SPECIFIC PRINTERS (optional overrides)  |
|  +----------------------------------------------+|
|  | Hot Kitchen    192.168.1.107   [Test] [Edit] ||
|  | Cold Kitchen   (uses default)         [Add]  ||
|  | Grill          192.168.1.108   [Test] [Edit] ||
|  | Desserts       (uses default)         [Add]  ||
|  | Beverages      192.168.1.109   [Test] [Edit] ||
|  | Bar            (uses default)         [Add]  ||
|  +----------------------------------------------+|
|                                                   |
|  [====== Save Settings ======]                   |
+--------------------------------------------------+
```

Key improvements:
- Test + Print Test Page buttons INSIDE each section card
- Connection status persists with timestamp
- Station-specific printers section shows all active kitchen stations
- Each station row: name | IP (or "uses default") | Test | Edit/Add
- Edit opens inline row expansion (not a modal) for IP + port
- Custom hook `usePrinterSettings()` replaces 10 useState calls
- Print Test Page sends actual test page to printer (not just TCP connect)

#### 5B. Create usePrinterSettings hook

**File**: `src/hooks/usePrinterSettings.ts` (NEW)

Encapsulates all printer settings state:
```typescript
interface UsePrinterSettingsReturn {
  // Receipt printer
  receiptEnabled: boolean;
  receiptIP: string;
  receiptPort: string;
  receiptPaper: '58mm' | '80mm';
  receiptStatus: ConnectionStatus;
  setReceiptEnabled: (v: boolean) => void;
  setReceiptIP: (v: string) => void;
  setReceiptPort: (v: string) => void;
  setReceiptPaper: (v: '58mm' | '80mm') => void;

  // Kitchen printer
  kitchenEnabled: boolean;
  kitchenIP: string;
  kitchenPort: string;
  kitchenStatus: ConnectionStatus;
  setKitchenEnabled: (v: boolean) => void;
  setKitchenIP: (v: string) => void;
  setKitchenPort: (v: string) => void;

  // Station printers
  stationPrinters: StationPrinter[];

  // Actions
  testReceipt: () => Promise<void>;
  testKitchen: () => Promise<void>;
  testStation: (station: KitchenStation) => Promise<void>;
  printTestPage: (ip: string, port: number) => Promise<void>;
  save: () => Promise<void>;
  saveStationPrinter: (printer: StationPrinter) => Promise<void>;
  deleteStationPrinter: (station: KitchenStation) => Promise<void>;

  // State
  hasChanges: boolean;
  isSaving: boolean;
  isLoading: boolean;
}
```

#### 5C. Station Printer Edit Row Component

**File**: `src/screens/settings/components/printer/StationPrinterRow.tsx` (NEW)

Compact row that expands inline for editing:

Collapsed: `Hot Kitchen    192.168.1.107:9100   [Connected] [Edit]`
Expanded:
```
Hot Kitchen
  IP Address  [ 192.168.1.107    ]
  Port        [ 9100             ]
  [Test]  [Print Test]  [Remove]  [Save]
```

**Files touched**: 1 (rewrite)
**New files**: 3 (`usePrinterSettings.ts`, `StationPrinterRow.tsx`, possibly `PrinterSectionCard.tsx`)

---

### Phase 6: EpsonPrinterService Improvements
**Goal**: Better error handling, connection resilience, and print queue.

#### 6A. Add retry logic

**File**: `src/services/printer/EpsonPrinterService.ts`

Current: single attempt, 3s timeout, no retry.

Add `sendBytesWithRetry(ip, port, bytes, maxRetries = 2)`:
- Attempt 1: 3s timeout
- Attempt 2: 5s timeout (if first fails)
- Log attempt count for debugging

#### 6B. Add connection status caching

Track last successful connection per IP:
```typescript
private lastConnected: Map<string, { at: Date; ok: boolean }> = new Map();
```

Expose `getLastStatus(ip: string)` for the settings UI to show "Connected 2m ago".

#### 6C. Improve kitchen ticket with station header

Current `printKitchenTicket` prints "KITCHEN ORDER" header for all stations.

Add optional station parameter:
```typescript
async printKitchenTicket(ip: string, port: number, order: UnifiedOrder, station?: KitchenStation): Promise<void>
```

When station is provided, print:
```
================================
    HOT KITCHEN
    Table: T4 | Order: #0023
    12:45 PM
================================
2x  Grilled Chicken
    - Extra Spicy
1x  Lamb Chops
    * No garlic please
================================
```

This makes tickets instantly identifiable by station.

#### 6D. Add print queue (fire-and-forget with retry)

For auto-print on send-to-kitchen, we may send to 3-4 printers simultaneously.
Use `Promise.allSettled()` to fire all station prints in parallel and report
failures via toast without blocking the UI.

**Files touched**: 1
**New files**: 0

---

## File Map (All Changes)

| Phase | File | Action |
|-------|------|--------|
| 1A | `src/services/database/DatabaseService.ts` | Add v7 migration (station_printers table) |
| 1B | `src/services/storage/PrinterStorageService.ts` | Add station printer CRUD methods |
| 1C | `src/context/printer/PrinterContext.tsx` | NEW -- PrinterContext + PrinterProvider |
| 1D | `src/providers/OptimizedAppProviders.tsx` | Add PrinterProvider to chain |
| 2A | `src/screens/orders/OrderDetailsScreen.tsx` | Wire handlePrint to context |
| 2B | `src/screens/orders/POSOrderScreen.tsx` | Wire handlePrint to context |
| 2C | `src/screens/orders/OrderManagementScreen.tsx` | Wire onPrintKOT to context |
| 2D | `src/components/business/menu/OrderCartPanel.tsx` | Accept and use onPrintKOT prop |
| 2E | `src/components/business/order/BillPanel.tsx` | Auto-fixed by 2B |
| 2F | `src/screens/payment/PaymentConfirmationScreen.tsx` | Replace inline printer code with context |
| 2G | `src/screens/receipt/ReceiptPreviewScreen.tsx` | Replace mock with context |
| 3A | `src/screens/orders/POSOrderScreen.tsx` | Auto-print after createOrder |
| 3B | `src/context/printer/PrinterContext.tsx` | Per-station routing in printKOT |
| 4 | `src/screens/orders/KitchenDisplayScreen.tsx` | Add reprint button per ticket |
| 5A | `src/screens/settings/components/PrinterSettingsPanel.tsx` | Full rewrite |
| 5B | `src/hooks/usePrinterSettings.ts` | NEW -- settings state hook |
| 5C | `src/screens/settings/components/printer/StationPrinterRow.tsx` | NEW -- expandable row |
| 6A-D | `src/services/printer/EpsonPrinterService.ts` | Retry, caching, station header, parallel print |

**Total files touched**: 14
**New files**: 4

---

## Implementation Order

```
Phase 1 (Foundation)         ~2 sessions
  1A: DB v7 migration
  1B: PrinterStorageService extensions
  1C: PrinterContext
  1D: Provider chain

Phase 2 (Wire buttons)       ~1 session
  2A-2G: All 7 screens

Phase 3 (Auto-print)         ~1 session
  3A: Send-to-kitchen trigger
  3B: Per-station routing

Phase 4 (Kitchen reprint)    ~0.5 session
  Reprint button on KitchenDisplay

Phase 5 (Settings redesign)  ~1.5 sessions
  5A: PrinterSettingsPanel rewrite
  5B: usePrinterSettings hook
  5C: StationPrinterRow component

Phase 6 (Service hardening)  ~1 session
  6A-6D: Retry, caching, station headers, parallel print
```

---

## Testing Strategy

### Manual Testing (Maestro)

| Test | Description |
|------|-------------|
| `qa_30_printer_context.yaml` | Toggle receipt/kitchen printers, save, verify persistence |
| `qa_31_print_kot_buttons.yaml` | Tap Print KOT on every screen, verify toast or printer call |
| `qa_32_auto_print_kitchen.yaml` | Send order to kitchen, verify auto-print fires |
| `qa_33_kitchen_reprint.yaml` | Kitchen display, tap reprint on a ticket |
| `qa_34_station_printers.yaml` | Settings: add station printers, test connections |
| `qa_35_receipt_print.yaml` | Complete payment, verify receipt prints |

### Without Physical Printer

All print calls go through `EpsonPrinterService.sendBytes()` which uses TCP.
For testing without hardware:
- Use `nc -l 9100` on a local machine to simulate printer
- Or check for toast messages confirming print was attempted
- `testConnection()` will return true if any TCP server is listening on the IP:port

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| No physical printer for testing | TCP listener mock (`nc -l 9100`) |
| TCP socket unavailable in Expo Go | `isTcpSocketAvailable()` guard + fallback toast |
| Multiple station prints fail silently | `Promise.allSettled()` + per-station error toast |
| DB migration v7 on existing installs | `IF NOT EXISTS` guards, backward compatible |
| Kitchen stations not configured | Fall back to single default kitchen printer |
| Print blocks UI during send-to-kitchen | Fire-and-forget with `.catch()` error handling |
