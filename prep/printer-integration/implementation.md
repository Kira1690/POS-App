# Printer Integration -- Implementation Reference

**Completed**: 2026-03-08
**Branch**: feature/testing-02
**Printer target**: Epson TM-T88VI (ESC/POS over TCP port 9100)

---

## Architecture

```
PrinterContext  (src/context/printer/PrinterContext.tsx)
  |
  |-- printerStorageService   src/services/storage/PrinterStorageService.ts
  |     SQLite tables: printer_settings, station_printers
  |
  |-- epsonPrinterService     src/services/printer/EpsonPrinterService.ts
  |     TCP via NativeTcpSocket (same dep as TRX terminal)
  |     ESC/POS byte protocol
  |
  Consumers:
    POSOrderScreen             printKOT (auto on send, manual button)
    OrderDetailsScreen         printKOT / printReceipt
    OrderManagementScreen      printKOT
    OrderCartPanel             printKOT (via onPrintKOT prop)
    BillPanel                  printKOT (via prop from POSOrderScreen)
    PaymentConfirmationScreen  printReceipt
    ReceiptPreviewScreen       printReceipt
    KitchenDisplayScreen       printStationKOT (reprint per ticket)
    PrinterSettingsPanel       testPrinter, printTestPage, save config
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/services/printer/EpsonPrinterService.ts` | Fixed 3 connection bugs + retry + caching + station header + modifier prices on receipt |
| `src/services/database/DatabaseService.ts` | v7 migration: station_printers table |
| `src/services/storage/PrinterStorageService.ts` | Added StationPrinter interface + CRUD |
| `src/context/printer/PrinterContext.tsx` | **NEW** -- central print context |
| `src/providers/OptimizedAppProviders.tsx` | Added PrinterProvider to chain |
| `src/screens/orders/OrderDetailsScreen.tsx` | Wired handlePrint to usePrinter() |
| `src/screens/orders/POSOrderScreen.tsx` | Wired print + auto-print on send to kitchen |
| `src/screens/orders/OrderManagementScreen.tsx` | Wired onPrintKOT |
| `src/components/business/menu/OrderCartPanel.tsx` | Added onPrintKOT prop + wired button |
| `src/screens/payment/PaymentConfirmationScreen.tsx` | Migrated to PrinterContext.printReceipt |
| `src/screens/receipt/ReceiptPreviewScreen.tsx` | Replaced mock with PrinterContext.printReceipt |
| `src/screens/orders/KitchenDisplayScreen.tsx` | Added reprint button per ticket |
| `src/hooks/usePrinterSettings.ts` | **NEW** -- settings state hook |
| `src/screens/settings/components/printer/StationPrinterRow.tsx` | **NEW** -- expandable station row |
| `src/screens/settings/components/PrinterSettingsPanel.tsx` | Full rewrite |
| `src/context/unified-order/UnifiedOrderContext.tsx` | Added logEvent for ready/served transitions |
| `src/screens/settings/components/SystemLogsSettings.tsx` | Full rewrite -- real SQLite data |

---

## KOT Routing Logic

### Single printer mode (no station printers configured)
All items from the order go to one ticket on the default kitchen printer.

```
Order: 2x Paneer Butter Masala (Hot Kitchen)
       1x Dal Makhani (Hot Kitchen)
       3x Coffee (Beverages)

→ One ticket to default kitchen printer (all items)
```

### Multi-printer mode (station printers configured)
Items are grouped by `item.kitchenStation`. Each group goes to its station's printer.
Items whose station has no assigned printer fall back to the default kitchen printer.

```
Station printers: hot_kitchen=192.168.1.107, beverages=192.168.1.108
Default kitchen:  192.168.1.106

Order: 2x Paneer Butter Masala (kitchenStation=hot_kitchen)
       1x Dal Makhani           (kitchenStation=hot_kitchen)
       3x Coffee                (kitchenStation=beverages)
       1x Garlic Naan           (kitchenStation=grill, no station printer)

→ Ticket 1 → 192.168.1.107  Hot Kitchen items (Paneer, Dal)
→ Ticket 2 → 192.168.1.108  Beverages items (Coffee)
→ Ticket 3 → 192.168.1.106  Fallback items (Garlic Naan)
```

All print jobs run in parallel via `Promise.allSettled()`. Partial failures show a warning toast listing which stations failed without blocking the others.

### Auto-print on send to kitchen
After `createOrder()` and `addItemsToOrder()` succeed in POSOrderScreen, `printKOT()` fires fire-and-forget. Print failures show a warning toast but do not block the UI flow.

---

## Print Format Reference

### Receipt (80mm = 40 chars, 58mm = 32 chars)

```
        THE FOOD CORNER
      123 Main Street
    Tel: (555) 123-4567

========================================
Order: ORD-20260308-9999
Table: T-5
Date:  Mar 8, 2026 1:15 PM
----------------------------------------
Paneer Butter Masala           x2 $41.98
  + Hot
  + Extra Cheese  +$1.50        <-- paid modifier shows per-unit price
  + Raita  +$2.00               <-- free modifiers show no price
Coffee                         x3 $15.00
  + Large  +$0.50
Dal Makhani                    x1 $13.99
  + Mild
----------------------------------------
Subtotal:                         $69.47
Tax (10%):                         $5.70
Tip:                              $10.42
========================================
TOTAL:                            $85.59

     Thank you for dining with us!
```

**Item line format**: `{name padded} {xQty} {itemTotal}`
- `itemTotal` = `(basePrice + modifierTotal) * quantity` -- includes all modifier prices
- Modifier line: `  + {optionName}` or `  + {optionName}  +$X.XX` for paid add-ons
- Special instructions: NOT printed on receipt
- Discount line appears only when `order.discountAmount > 0`
- Tip line appears only when `order.tipAmount > 0`

### KOT (32 chars, same width for both paper sizes)

```
         KITCHEN ORDER           <-- or station name e.g. "HOT KITCHEN"
Table: T-5
Order: ORD-20260308-9999
1:15 PM
================================
2x Paneer Butter Masala          <-- BOLD in real print
   - Hot
   - Extra Cheese
   * No garlic please            <-- special instructions
1x Dal Makhani
   - Mild
3x Coffee
   - Large
================================
```

**Item line format**: `{qty}x {name}` (BOLD via ESC/POS BOLD_ON)
- Modifier line: `   - {optionName}` (no prices on KOT)
- Special instructions: `   * {text}` (KOT only, NOT on receipt)
- Station ticket: header shows station label (e.g. HOT KITCHEN, BEVERAGES, GRILL)
- Station ticket: only contains items where `item.kitchenStation === station`

### ESC/POS bytes used

| Command | Bytes | Effect |
|---------|-------|--------|
| INIT | `1B 40` | Reset printer |
| CENTER | `1B 61 01` | Center align |
| LEFT | `1B 61 00` | Left align |
| BOLD_ON | `1B 45 01` | Bold text |
| BOLD_OFF | `1B 45 00` | Normal text |
| LARGE_ON | `1B 21 30` | Double width+height |
| LARGE_OFF | `1B 21 00` | Normal size |
| LF | `0A` | Line feed |
| CUT | `1D 56 41 00` | Partial cut |

---

## Connection & Retry

- Timeout: 3000ms per attempt
- Retries: 2 (delays: 500ms, 1000ms)
- Status cache: `lastStatus` Map keyed by IP -- used to show last-known status in Settings UI without re-pinging
- Socket: `client.destroy()` called on both success and all failure paths (no leaks)
- Double-settle guard: `settled` flag prevents double-reject on simultaneous error+timeout

---

## Settings UI

### Printer Settings screen (Settings > Printer Management)

Three sections:

1. **Receipt Printer** -- enable toggle, IP, port, paper size (58mm / 80mm), Test + Print Test Page buttons, persistent status with timestamp
2. **Default Kitchen Printer** -- enable toggle, IP, port, Test + Print Test Page buttons, persistent status
3. **Station Printers** -- lists all active kitchen stations from KitchenConfigContext. Each row: collapsed shows IP or "(uses default)", expanded shows IP+port inputs, Test, Print Test, Save, Remove buttons.

State managed by `usePrinterSettings` hook (`src/hooks/usePrinterSettings.ts`).
Station rows rendered by `StationPrinterRow` (`src/screens/settings/components/printer/StationPrinterRow.tsx`).

### System Logs screen (Settings > System Logs)

Live viewer reading from SQLite `activity_logs` table via `activityLogService.getEvents()`.

**Event types and their categories/levels**:

| Event | Category | Level | Icon |
|-------|----------|-------|------|
| order_created | Orders | INFO | receipt |
| cancelled | Orders | ERROR | close-circle |
| items_transferred | Orders | INFO | transfer |
| discount_applied | Orders | WARNING | tag |
| sent_to_kitchen | Kitchen | INFO | chef-hat |
| ready | Kitchen | INFO | check-circle |
| served | Kitchen | INFO | silverware |
| paid | Payment | INFO | cash-check |
| print_receipt_ok | Printer | INFO | printer-check |
| print_receipt_fail | Printer | ERROR | printer-alert |
| print_kot_ok | Printer | INFO | printer-check |
| print_kot_fail | Printer | ERROR | printer-alert |
| printer_test_ok | Printer | INFO | printer-check |
| printer_test_fail | Printer | ERROR | printer-off |

**Level rule**: any event type ending in `_fail` → ERROR. `discount_applied` → WARNING. All others → INFO.

**Filters**: Time (Today / Last 1h / This Week), Category (All / Orders / Kitchen / Payment / Printer), Search (table name, order number, description, event label, IP address)

**Export button** (next to Refresh): calls `Share.share()` with a formatted plain-text dump of all currently-filtered events. The export includes:
- Header: export timestamp, period, category, total count
- Per event: `[HH:MM:SS] [LEVEL] Label  |  TableName · OrderNumber`
- Description line
- For printer events: `IP: {ip}:{port}`, `Station: {station}` (if not default), `Error: {msg}` (on failure)
- Footer: "End of log. Send this to your support team."

This allows non-technical clients to share the full printer diagnostic log via WhatsApp/email/Drive without needing device access.

**Inline IP display**: printer event rows show `IP: {ip}:{port} · {station}` directly in the log list so the client can see which printer was targeted without opening the export.

**`ActivityEvent.orderId` is optional**: printer test events (not tied to any order) pass `orderId: undefined` → stored as NULL in SQLite. DB insert uses `event.orderId ?? null`.

---

## Bugs Fixed During Development

### 1. Socket leak on timeout (EpsonPrinterService)
**Problem**: Timeout handler called `reject()` but did not call `client.destroy()`, leaving the TCP socket open.
**Fix**: Added `client.destroy()` inside the timeout callback before rejecting.

### 2. Write callback error ignored (EpsonPrinterService)
**Problem**: The `client.write(buffer, undefined, callback)` callback received an `err` parameter but the original code ignored it, resolving even on write failure.
**Fix**: Check `if (err) reject(err)` in the write callback.

### 3. Double-reject race (EpsonPrinterService)
**Problem**: When both the `error` event and the timeout fired simultaneously, `reject()` was called twice, causing an unhandled promise rejection crash.
**Fix**: Added a `settled` boolean flag. All resolve/reject calls go through a `settle()` wrapper that is a no-op after the first call.

### 4. Modifier prices missing on receipt (EpsonPrinterService)
**Problem**: Paid add-ons (e.g. Extra Cheese +$1.50) were printed as just `  + Extra Cheese` with no price. Customer couldn't see why item total was higher than base price.
**Fix**: When `opt.priceAdjustment > 0`, append `  +$X.XX` to the modifier line. Free modifiers (priceAdjustment === 0) show no price.

### 5. `ready` and `served` events never logged (UnifiedOrderContext)
**Problem**: `updateOrderStatus()` and `updateItemStatus()` updated SQLite and Redux but never called `activityLogService.logEvent()` for `ready`/`served` transitions. Kitchen Display status changes were completely invisible in System Logs.
**Fix**: In `updateOrderStatus`: log when `status === 'ready' || status === 'served'`. In `updateItemStatus`: compare previous vs new derived order status, log when transitioning to `ready` or `served`.

### 6. IP/Port inputs indistinguishable from labels (PrinterSettingsPanel)
**Problem**: TextInput fields had no `backgroundColor`, `borderWidth`, or padding. On dark theme they blended into the row background and looked like static text.
**Fix**: Added `backgroundColor: theme.colors.surfaceLight`, `borderWidth: 1`, `borderColor: theme.colors.outline`, `borderRadius: theme.borderRadius.sm`, `paddingHorizontal: theme.spacing.sm` to the `textInput` style.

### 7. SystemLogsSettings showed static mock data (SystemLogsSettings)
**Problem**: The entire component was built around 8 hardcoded `MOCK_LOGS` entries with dates from January 2024. Stats were also hardcoded. No SQLite read ever happened.
**Fix**: Complete rewrite. Calls `activityLogService.getEvents(getSince(timeFilter), 200)` on mount and on each filter change. Stats calculated from live events via `useMemo`.

---

## Requires Custom Dev Build

TCP sockets (`react-native-tcp-socket`) are not available in Expo Go. The printer integration only works in the custom dev build (`com.ajinkya123.POSReactNativeApp`). When run in Expo Go, `isTcpSocketAvailable()` returns `false` and all print calls throw immediately with a clear error message. The Settings UI shows an inline warning banner when TCP is unavailable.
