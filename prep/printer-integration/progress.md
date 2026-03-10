# Printer Integration -- Progress Tracker

**Status: COMPLETE** (branch: feature/testing-02, completed 2026-03-08)

## Phase 1: Foundation
- [x] 1A: DB v7 migration -- station_printers table
- [x] 1B: PrinterStorageService -- station printer CRUD methods
- [x] 1C: PrinterContext -- new context with printReceipt/printKOT/printStationKOT
- [x] 1D: OptimizedAppProviders -- add PrinterProvider to chain

## Phase 2: Wire Up All Print Buttons
- [x] 2A: OrderDetailsScreen -- fix empty handlePrint
- [x] 2B: POSOrderScreen -- fix toast-only handlePrint
- [x] 2C: OrderManagementScreen -- fix toast-only onPrintKOT
- [x] 2D: OrderCartPanel -- wire TODO to onPrintKOT prop
- [x] 2E: BillPanel -- auto-fixed by 2B
- [x] 2F: PaymentConfirmationScreen -- migrate to PrinterContext
- [x] 2G: ReceiptPreviewScreen -- replace mock with real printer

## Phase 3: Auto-Print on Send to Kitchen
- [x] 3A: POSOrderScreen -- auto-print after createOrder/addItemsToOrder
- [x] 3B: PrinterContext -- per-station routing in printKOT

## Phase 4: Kitchen Display Reprint
- [x] 4A: KitchenDisplayScreen -- add reprint button per ticket

## Phase 5: Settings UI Redesign
- [x] 5A: PrinterSettingsPanel -- full rewrite with station printers
- [x] 5B: usePrinterSettings hook -- extract state management
- [x] 5C: StationPrinterRow component -- expandable station row

## Phase 6: Service Hardening
- [x] 6A: EpsonPrinterService -- fix socket timeout leak (client.destroy() in timer handler)
- [x] 6B: EpsonPrinterService -- fix write callback error handling (check err param, reject if set)
- [x] 6C: EpsonPrinterService -- add settled flag to prevent double-reject on error+timeout race
- [x] 6D: EpsonPrinterService -- add retry with backoff (2 retries: 500ms / 1000ms)
- [x] 6E: EpsonPrinterService -- add connection status caching (lastStatus Map + getLastStatus())
- [x] 6F: EpsonPrinterService -- station header on kitchen tickets
- [x] 6G: EpsonPrinterService -- parallel multi-station printing (Promise.allSettled)

## Bugs Found & Fixed During Testing (2026-03-08)
- [x] Receipt: modifier prices not shown for paid add-ons
      Fix: `opt.priceAdjustment > 0` now appends `+$X.XX` inline on modifier line
- [x] ActivityLog: `ready` and `served` events never logged
      Fix: added logEvent to `updateOrderStatus` and `updateItemStatus` in UnifiedOrderContext
- [x] Settings UI: IP/Port inputs had no visual affordance (indistinguishable from static text)
      Fix: added background, border, padding to textInput style in PrinterSettingsPanel
- [x] SystemLogsSettings: was showing 8 hardcoded mock entries from Jan 2024
      Fix: complete rewrite -- reads from activityLogService.getEvents() via SQLite

## Maestro Tests
- [x] qa_30: Printer settings persistence
- [x] qa_31: Print KOT from all screens
- [x] qa_32: Auto-print on send to kitchen
- [x] qa_33: Kitchen display reprint
- [x] qa_34: Station printer configuration
- [x] qa_35: Receipt print on payment

## System Logs Test Coverage (verified on device 2026-03-08)
- [x] All 8 activity event types present: order_created, sent_to_kitchen, ready, served,
      paid, cancelled, discount_applied, items_transferred
- [x] Category filters: All / Orders / Kitchen / Payment
- [x] Time filters: Today / Last 1h / This Week
- [x] Search: by table name, order number, event label, description
- [x] Stats row: Total / Errors / Warnings / Info update with active filters
- [x] Refresh button reloads from SQLite
- [x] Level badges: ERROR (cancelled), WARNING (discount_applied), INFO (all others)
