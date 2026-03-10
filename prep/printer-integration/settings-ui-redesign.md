# Printer Settings UI Redesign

## Current Problems

### 1. Poor Visual Hierarchy
- Receipt and Kitchen sections look identical -- no visual distinction
- Section headers are small uppercase text that blends in
- No icons in section headers

### 2. Orphaned Test Buttons
- "Test Receipt Printer" button sits OUTSIDE the receipt section card
- Same for kitchen -- creates visual disconnect between config and its action
- Should be INSIDE the section card as part of the workflow

### 3. No Print Test Page
- Only tests TCP connection (sends ESC/POS INIT bytes)
- Users expect to see something print when they tap "Test"
- Need both: "Test Connection" (quick) and "Print Test Page" (prints paper)

### 4. No Connection Persistence
- Status shows momentarily then resets on next render
- No "last tested" timestamp
- User has to re-test every time they open settings

### 5. Tiny Paper Size Chips
- 58mm/80mm chips are too small to tap reliably
- No visual indication of what paper size means

### 6. No Station Printers
- Can only configure one kitchen printer
- Real restaurants have different printers per kitchen station
- No way to route hot kitchen orders to one printer and bar orders to another

### 7. Raw useState Anti-Pattern
- 10 separate useState calls instead of a custom hook
- Component is 336 lines (should be <200 for a settings panel)
- No separation of logic and presentation

---

## New Design

### Layout Structure

```
ScrollView
  +-- SectionCard: "Receipt Printer"
  |     +-- Toggle row: Enable
  |     +-- Input row: IP Address
  |     +-- Input row: Port
  |     +-- Chip row: Paper Size (58mm / 80mm) -- larger chips
  |     +-- Divider
  |     +-- Action row: [Test Connection] [Print Test Page]
  |     +-- Status row: "Connected" / "Failed" / "Not tested" + timestamp
  |
  +-- SectionCard: "Default Kitchen Printer"
  |     +-- Toggle row: Enable
  |     +-- Input row: IP Address
  |     +-- Input row: Port
  |     +-- Divider
  |     +-- Action row: [Test Connection] [Print Test Page]
  |     +-- Status row
  |
  +-- SectionCard: "Station Printers"
  |     +-- Info text: "Assign dedicated printers to kitchen stations.
  |     |               Stations without a printer use the default above."
  |     +-- StationPrinterRow: Hot Kitchen
  |     +-- StationPrinterRow: Cold Kitchen
  |     +-- StationPrinterRow: Grill
  |     +-- StationPrinterRow: Desserts
  |     +-- StationPrinterRow: Beverages
  |     +-- StationPrinterRow: Bar
  |     (only shows stations that are active in KitchenConfigContext)
  |
  +-- Save Button
```

### SectionCard Component

Apple-style card with:
- Header with icon + title + optional badge
- Content rows with consistent padding
- Integrated action buttons at bottom
- Connection status inline

```
+--------------------------------------------------+
| [printer-icon]  RECEIPT PRINTER                   |
|--------------------------------------------------|
| Enable Receipt Printer          [==========O]    |
| IP Address              [ 192.168.1.105     ]    |
| Port                    [ 9100              ]    |
| Paper Size              [ 58mm ]  [**80mm**]     |
|--------------------------------------------------|
| [Test Connection]    [Print Test Page]            |
| Status: Connected -- tested 3 minutes ago        |
+--------------------------------------------------+
```

### StationPrinterRow Component

Two states: collapsed and expanded.

**Collapsed (no printer assigned)**:
```
+--------------------------------------------------+
| [fire-icon] Hot Kitchen     (uses default)  [Add] |
+--------------------------------------------------+
```

**Collapsed (printer assigned)**:
```
+--------------------------------------------------+
| [fire-icon] Hot Kitchen   192.168.1.107  [Connected] [Edit] |
+--------------------------------------------------+
```

**Expanded (editing)**:
```
+--------------------------------------------------+
| [fire-icon] Hot Kitchen                           |
|   Printer Name    [ Hot Kitchen Printer     ]     |
|   IP Address      [ 192.168.1.107           ]     |
|   Port            [ 9100                    ]     |
|   [Test] [Print Test] [Remove]         [Save]     |
+--------------------------------------------------+
```

### Paper Size Chips -- Improved

Current: tiny text chips.
New: larger toggle buttons with descriptive text.

```
+-------------------+  +-------------------+
|      58mm         |  |    ** 80mm **      |
|   Narrow Roll     |  |   Standard Roll   |
|   32 chars/line   |  |   40 chars/line   |
+-------------------+  +-------------------+
```

### Connection Status Styling

| State | Display | Color |
|-------|---------|-------|
| Not tested | "Not tested" | `onSurfaceSecondary` |
| Testing | [ActivityIndicator] "Testing..." | `primary` |
| Connected | "Connected -- 3m ago" | `success` |
| Failed | "Connection failed -- 3m ago" | `error` |

Status persists in component state with timestamp. Resets only on new test.

---

## Component Structure

```
PrinterSettingsPanel (rewritten)
  +-- usePrinterSettings()         -- custom hook for all state
  +-- useKitchenConfig()           -- get active stations list
  |
  +-- PrinterSectionCard           -- receipt printer section
  |     +-- Toggle, Inputs, Chips
  |     +-- PrinterTestActions     -- test + print test page buttons
  |     +-- PrinterStatusBadge    -- connection status with timestamp
  |
  +-- PrinterSectionCard           -- kitchen printer section
  |     +-- Toggle, Inputs
  |     +-- PrinterTestActions
  |     +-- PrinterStatusBadge
  |
  +-- StationPrintersSection       -- station printers list
  |     +-- StationPrinterRow (per active station)
  |           +-- collapsed: station name + IP + status + edit
  |           +-- expanded: name + IP + port + test + remove + save
  |
  +-- SaveButton
```

### File Breakdown

| File | Lines (est.) | Purpose |
|------|-------------|---------|
| `PrinterSettingsPanel.tsx` | ~200 | Main panel layout + sections |
| `usePrinterSettings.ts` | ~120 | All state management + actions |
| `StationPrinterRow.tsx` | ~150 | Expandable station printer row |

Total: ~470 lines across 3 files (vs current 336 lines in 1 file).
Better separation of concerns, more maintainable.

---

## testIDs (Accessibility / Maestro)

### Receipt Printer Section
- `toggle-receipt-printer` (existing)
- `input-receipt-ip` (existing)
- `input-receipt-port` (existing)
- `chip-paper-58` (existing)
- `chip-paper-80` (existing)
- `btn-test-receipt` (existing)
- `btn-test-page-receipt` (NEW)
- `status-receipt-printer` (NEW)

### Kitchen Printer Section
- `toggle-kitchen-printer` (existing)
- `input-kitchen-ip` (existing)
- `input-kitchen-port` (existing)
- `btn-test-kitchen` (existing)
- `btn-test-page-kitchen` (NEW)
- `status-kitchen-printer` (NEW)

### Station Printers
- `btn-station-add-{station}` (NEW) -- e.g., `btn-station-add-hot_kitchen`
- `btn-station-edit-{station}` (NEW)
- `btn-station-remove-{station}` (NEW)
- `btn-station-test-{station}` (NEW)
- `btn-station-save-{station}` (NEW)
- `input-station-ip-{station}` (NEW)
- `input-station-port-{station}` (NEW)
- `input-station-name-{station}` (NEW)

### Global
- `btn-save-printer-settings` (existing)
