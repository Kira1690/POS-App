# Table Management Settings - Detailed Wireframes

**Project:** POS Settings - Table Management System
**Created:** 2025-10-08

---

## Table of Contents
1. [Add Table Modal](#1-add-table-modal)
2. [Edit Table Modal](#2-edit-table-modal)
3. [Delete Table Confirmation](#3-delete-table-confirmation)
4. [Add Area/Section Modal](#4-add-areasection-modal)
5. [Edit Area Modal](#5-edit-area-modal)
6. [Floor Plan Editor](#6-floor-plan-editor)
7. [Collapsible Sidebar States](#7-collapsible-sidebar-states)
8. [Table Filter Bar](#8-table-filter-bar)
9. [Quick Actions Menu](#9-quick-actions-menu)

---

## 1. Add Table Modal

### Modal Structure
```
╔════════════════════════════════════════════════════════╗
║  [table-furniture]  Add New Table              [close] ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Table Information                                     ║
║  ─────────────────────────────────────────────────────║
║                                                        ║
║  Table Number *                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ T-                                       [table] │ ║
║  └──────────────────────────────────────────────────┘ ║
║  Example: T-1, T-2, VIP-1                            ║
║                                                        ║
║  Seating Capacity *                                    ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │                                                  │ ║
║  │    [-]           4           [+]                 │ ║
║  │                                                  │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Area/Section *                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Main Dining                             [chevron]│ ║
║  └──────────────────────────────────────────────────┘ ║
║  → Opens dropdown: Main Dining, VIP Lounge, Patio,   ║
║                    Bar Seating, + Add New Area        ║
║                                                        ║
║  Table Shape                                           ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ [square-outline]  Square                         │ ║
║  │ [circle-outline]  Round         (selected)       │ ║
║  │ [rectangle-outline] Rectangle                    │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Initial Position                                      ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ ⚬ Auto-assign to available space                │ ║
║  │ ○ Custom position (opens floor plan picker)     │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Notes (Optional)                                      ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │                                           0/200  │ ║
║  │                                                  │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║  [cancel-outline] Cancel    [check-circle] Add Table  ║
╚════════════════════════════════════════════════════════╝
```

### Validation Rules
- Table Number: Required, unique within restaurant
- Capacity: Required, minimum 1, maximum 20
- Area: Required, must select from existing or create new
- Shape: Optional, defaults to Round
- Position: Optional, defaults to Auto-assign

### Interaction Flow
1. User clicks "Add Table" button
2. Modal slides up from bottom
3. Focus on Table Number field
4. User fills required fields (marked with *)
5. Validation happens on blur and submit
6. Success: Modal closes, table appears in grid with animation
7. Error: Show error message below field with [alert-circle] icon

### Color Scheme (Theme-Based)
- Modal Background: `theme.colors.surface`
- Header: `theme.colors.primary` (dark)
- Input Fields: `theme.colors.surfaceVariant`
- Labels: `theme.colors.onSurface`
- Error Text: `theme.colors.error`
- Success Button: `theme.colors.success`
- Cancel Button: `theme.colors.outline` border

---

## 2. Edit Table Modal

### Modal Structure
```
╔════════════════════════════════════════════════════════╗
║  [table-furniture]  Edit Table T-5             [close] ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Table Information                                     ║
║  ─────────────────────────────────────────────────────║
║                                                        ║
║  Table Number *                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ T-5                                      [table] │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Seating Capacity *                                    ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │                                                  │ ║
║  │    [-]           8           [+]                 │ ║
║  │                                                  │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Area/Section *                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ VIP Lounge                              [chevron]│ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Table Shape                                           ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ [square-outline]  Square                         │ ║
║  │ [circle-outline]  Round                          │ ║
║  │ [rectangle-outline] Rectangle   (selected)       │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Current Status                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ [circle] Reserved                                │ ║
║  │ Reserved until: 7:30 PM                          │ ║
║  │ [calendar-clock] Change Reservation              │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Position                                              ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Row 2, Column 3                                  │ ║
║  │ [cursor-move] Adjust Position on Floor Plan      │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Notes                                                 ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Near window, best for couples            45/200  │ ║
║  │                                                  │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Table History                                         ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Last cleaned: Today at 2:15 PM                   │ ║
║  │ Last used: Today at 1:45 PM (85 min duration)    │ ║
║  │ [history] View Full History                      │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ [delete] Delete  [cancel-outline] Cancel [check] Save ║
╚════════════════════════════════════════════════════════╝
```

### Additional Features
- Pre-populated with existing table data
- Shows current reservation status (if any)
- Position adjustment button opens mini floor plan
- Table history section (last cleaned, last used)
- Delete button opens confirmation dialog

### Validation Rules
Same as Add Table Modal, plus:
- Cannot change table number if table has active orders
- Status change validates against current reservations

---

## 3. Delete Table Confirmation

### Confirmation Dialog
```
╔═══════════════════════════════════════════╗
║  [alert-circle] Delete Table T-5?         ║
╠═══════════════════════════════════════════╣
║                                           ║
║  Are you sure you want to delete this     ║
║  table? This action cannot be undone.     ║
║                                           ║
║  Table Details:                           ║
║  • Table Number: T-5                      ║
║  • Capacity: 8 seats                      ║
║  • Area: VIP Lounge                       ║
║  • Current Status: Reserved               ║
║                                           ║
║  ⚠️  WARNING:                             ║
║  This table has an active reservation     ║
║  until 7:30 PM. Deleting will cancel      ║
║  the reservation.                         ║
║                                           ║
║  Type DELETE to confirm:                  ║
║  ┌─────────────────────────────────────┐ ║
║  │                                     │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
╠═══════════════════════════════════════════╣
║  [close] Cancel    [delete] Delete Table  ║
╚═══════════════════════════════════════════╝
```

### Interaction Flow
1. Delete button clicked in Edit Table Modal
2. Confirmation dialog appears with slide animation
3. Shows table details and warnings
4. Requires typing "DELETE" to enable delete button
5. On confirm: Table removed, modal closes, success message

---

## 4. Add Area/Section Modal

### Modal Structure
```
╔════════════════════════════════════════════════════════╗
║  [map-marker-plus]  Add New Section        [close]     ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Section Information                                   ║
║  ─────────────────────────────────────────────────────║
║                                                        ║
║  Section Name *                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │                                                  │ ║
║  └──────────────────────────────────────────────────┘ ║
║  Example: Main Dining, VIP Lounge, Outdoor Patio     ║
║                                                        ║
║  Icon *                                                ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ [silverware-fork-knife] [glass-cocktail]         │ ║
║  │ [weather-sunny] [crown] [sofa] [office-building] │ ║
║  │                                                  │ ║
║  └──────────────────────────────────────────────────┘ ║
║  Selected: [silverware-fork-knife]                    ║
║                                                        ║
║  Color Indicator *                                     ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ 🟢 Success  🔵 Info  🟡 Warning  🔴 Error        │ ║
║  │ 🟣 Purple   🟠 Orange  ⚫ Primary                │ ║
║  └──────────────────────────────────────────────────┘ ║
║  Selected: Success (Green)                            ║
║                                                        ║
║  Description (Optional)                                ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │                                           0/200  │ ║
║  │                                                  │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Default Table Configuration                           ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Default Capacity:  [4]                           │ ║
║  │ Default Shape:     [Round ▾]                     │ ║
║  │ Auto-numbering:    [ON]                          │ ║
║  │ Number Prefix:     [SEC-]                        │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Preview                                               ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │  ┌─────────────────────────────────────────────┐│ ║
║  │  │ [silverware] MAIN DINING                    ││ ║
║  │  │ Tables: 0 | Capacity: 0 | Available: 0     ││ ║
║  │  └─────────────────────────────────────────────┘│ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║  [cancel-outline] Cancel  [check-circle] Add Section  ║
╚════════════════════════════════════════════════════════╝
```

### Icon Options (MaterialCommunityIcons)
- silverware-fork-knife (Main Dining)
- glass-cocktail (Bar)
- weather-sunny (Outdoor/Patio)
- crown (VIP/Premium)
- sofa (Lounge)
- office-building (Private Room)
- fireplace (Cozy/Intimate)
- water (Waterfront)

### Color Mapping (Theme Colors)
- Success (Green): `theme.colors.success`
- Info (Blue): `theme.colors.info`
- Warning (Orange): `theme.colors.warning`
- Error (Red): `theme.colors.error`
- Purple: `theme.colors.purple`
- Primary: `theme.colors.primary`

---

## 5. Edit Area Modal

### Modal Structure
```
╔════════════════════════════════════════════════════════╗
║  [map-marker]  Edit Section: VIP Lounge    [close]     ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Section Information                                   ║
║  ─────────────────────────────────────────────────────║
║                                                        ║
║  Section Name *                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ VIP Lounge                                       │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Icon *                                                ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ [crown] Selected                                 │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Color Indicator: 🟡 Warning (Orange)                 ║
║                                                        ║
║  Current Statistics                                    ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Total Tables: 4                                  │ ║
║  │ Total Capacity: 16 seats                         │ ║
║  │ Currently Available: 2                           │ ║
║  │ Currently Occupied: 1                            │ ║
║  │ Reserved: 1                                      │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Assigned Tables                                       ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ [table] T-5  (8 seats) - Reserved                │ ║
║  │ [table] T-12 (6 seats) - Available               │ ║
║  │ [table] T-15 (4 seats) - Occupied                │ ║
║  │ [table] T-20 (2 seats) - Available               │ ║
║  │                                                  │ ║
║  │ [plus-circle] Add New Table to Section           │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  Bulk Actions                                          ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ [table-refresh] Reset All Tables                 │ ║
║  │ [table-remove] Clear All Reservations            │ ║
║  │ [broom] Mark All as Cleaning                     │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║ [delete] Delete  [cancel-outline] Cancel  [check] Save║
╚════════════════════════════════════════════════════════╝
```

### Additional Features
- Shows real-time statistics
- Lists all tables in section
- Bulk actions for all tables in section
- Delete section validation (cannot delete if tables exist)

---

## 6. Floor Plan Editor

### Full Editor Interface
```
╔═══════════════════════════════════════════════════════════════════════════╗
║  Floor Plan Editor                                                        ║
║  ─────────────────────────────────────────────────────────────────────── ║
║                                                                           ║
║  Tools: [cursor-move] Select  [table-plus] Add  [delete] Remove          ║
║         [grid] Grid: ON  [magnify] Zoom: 100%  [undo] [redo]            ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                     RESTAURANT FLOOR PLAN                           │ ║
║  │                                                                     │ ║
║  │  ┌──────────────────────────────┐                                  │ ║
║  │  │  🔥 KITCHEN                  │                                  │ ║
║  │  │  (Non-seating zone)          │                                  │ ║
║  │  └──────────────────────────────┘                                  │ ║
║  │                                                                     │ ║
║  │         [T-1]    [T-2]    [T-3]         Main Dining                │ ║
║  │         4 seats  2 seats  6 seats                                  │ ║
║  │                                                                     │ ║
║  │         [T-4]    [T-5]    [T-6]                                    │ ║
║  │         4 seats  8 seats  2 seats                                  │ ║
║  │                                                                     │ ║
║  │  ┌──────────────────────────────┐                                  │ ║
║  │  │  👑 VIP LOUNGE               │                                  │ ║
║  │  │                              │                                  │ ║
║  │  │    [T-7]         [T-8]       │                                  │ ║
║  │  │    6 seats       4 seats     │                                  │ ║
║  │  └──────────────────────────────┘                                  │ ║
║  │                                                                     │ ║
║  │  🍸 BAR ━━━━━━━━━━━━━━━━━━━━━                                      │ ║
║  │     [B-1] [B-2] [B-3] [B-4]                                        │ ║
║  │                                                                     │ ║
║  │  🚪 ENTRANCE                                                        │ ║
║  │  ──────────                                                         │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  Selected: T-5 (VIP Lounge) - 8 seats                                    ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ Position: X: 250, Y: 180                                            │ ║
║  │ Rotation: 0°  [rotate-left] [rotate-right]                          │ ║
║  │ [arrow-up-down] Move  [content-copy] Duplicate  [delete] Delete     │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [content-save] Save Layout  [download] Export  [upload] Import          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### Floor Plan Features
1. **Drag-and-Drop Tables**
   - Click table to select (highlight with theme.colors.primary border)
   - Drag to new position with visual feedback
   - Snap to grid when enabled

2. **Special Zones**
   - Kitchen (non-seating, gray background)
   - Bar (linear seating)
   - Entrance (no tables)
   - VIP Sections (highlighted border)

3. **Tools**
   - Select: Default mode for moving tables
   - Add: Click to place new table
   - Delete: Click table to remove
   - Grid Toggle: Show/hide alignment grid
   - Zoom: 50%, 75%, 100%, 125%, 150%

4. **Table Representation**
   - Circle, Square, Rectangle shapes
   - Number displayed inside
   - Capacity shown below
   - Color-coded by status (available, occupied, reserved)

---

## 7. Collapsible Sidebar States

### Expanded State (Default)
```
╔═════════════════════════════════╗
║  Settings Categories            ║
║  ─────────────────────────────  ║
║  🔍 Search settings...          ║
║  ─────────────────────────────  ║
║                                 ║
║  [store] Restaurant Profile     ║  ← theme.colors.error bg
║                                 ║
║  [account-group] User Mgmt      ║  ← theme.colors.info bg
║                                 ║
║  [devices] Device & Hardware    ║  ← theme.colors.success bg
║                                 ║
║  [credit-card] Payment Config   ║  ← theme.colors.warning bg
║                                 ║
║  [table-furniture] Table Mgmt   ║  ← SELECTED (primary bg)
║                                 ║
║  [link-variant] Integrations    ║  ← theme.colors.purple bg
║                                 ║
║  [shield-lock] Security         ║  ← theme.colors.cyan bg
║                                 ║
║  [chart-line] System Logs       ║  ← theme.colors.error bg
║                                 ║
║  [help-circle] Help & Support   ║  ← theme.colors.outline bg
║                                 ║
║  ─────────────────────────────  ║
║  [chevron-left] Collapse        ║  ← Collapse button
╚═════════════════════════════════╝
Width: 280px
```

### Collapsed State
```
╔═══════╗
║  ≡    ║  ← Menu icon
║  ───  ║
║       ║
║  🏪   ║  ← Icons only, tooltip on hover
║       ║
║  👥   ║
║       ║
║  📱   ║
║       ║
║  💳   ║
║       ║
║  🍽️   ║  ← SELECTED (highlighted)
║       ║
║  🔗   ║
║       ║
║  🔒   ║
║       ║
║  📊   ║
║       ║
║  ❓   ║
║       ║
║  ───  ║
║  ›    ║  ← Expand button
╚═══════╝
Width: 64px
```

**CRITICAL:** Icons shown are VISUAL REPRESENTATION only.
**MUST USE MaterialCommunityIcons in actual implementation:**
- store (Restaurant)
- account-group (Users)
- devices (Hardware)
- credit-card-outline (Payment)
- table-furniture (Tables) ← SELECTED
- link-variant (Integrations)
- shield-lock-outline (Security)
- chart-line (Logs)
- help-circle-outline (Help)

### Tooltip on Hover (Collapsed State)
```
     ╔════════════════════════╗
     ║ Table Management       ║
╔════╝                        ╚════╗
║  🍽️                               ║
╚═══════════════════════════════════╝
```
- Appears on hover over icon
- theme.colors.surface background
- theme.colors.onSurface text
- Positioned to the right of icon

### Animation
- Transition duration: 300ms
- Easing: ease-in-out
- Width change: 280px ↔ 64px
- Text fade: opacity 1 ↔ 0
- Icon stays visible throughout

---

## 8. Table Filter Bar

### Filter Bar Layout
```
╔══════════════════════════════════════════════════════════════════════╗
║  Filter Tables:                                                      ║
║  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ [search]   ║
║  │All (12)│ │Avail(8)│ │Occup(3)│ │Rsrv(1) │ │Clean(0)│            ║
║  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘            ║
║                                                                      ║
║  Area: [All Areas ▾]   Capacity: [Any ▾]   Shape: [All ▾]          ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Filter Button States
**All Tables (Selected):**
```
┌──────────────┐
│ All Tables   │  ← theme.colors.primary bg
│    (12)      │     theme.colors.white text
└──────────────┘
```

**Available (Not Selected):**
```
┌──────────────┐
│ Available    │  ← theme.colors.surface bg
│    (8)       │     theme.colors.success border & text
└──────────────┘
```

**Occupied (Not Selected):**
```
┌──────────────┐
│ Occupied     │  ← theme.colors.surface bg
│    (3)       │     theme.colors.error border & text
└──────────────┘
```

---

## 9. Quick Actions Menu

### Floating Action Menu (Bottom Right)
```
          ╔═══════════════════════════╗
          ║ [table-plus] Add Table    ║
          ╠═══════════════════════════╣
          ║ [map-marker-plus] Add Area║
          ╠═══════════════════════════╣
          ║ [floor-plan] Edit Layout  ║
          ╠═══════════════════════════╣
          ║ [download] Export Config  ║
          ╚═══════════════════════════╝
                     ║
          ┌──────────▼──────────┐
          │         [+]         │  ← Main FAB button
          └─────────────────────┘
```

### Interaction Flow
1. User clicks main [+] button
2. Menu expands upward with stagger animation
3. Each item appears with 50ms delay
4. Click item → executes action, menu closes
5. Click outside → menu closes

---

## Color Reference Chart

### Status Colors (From Theme)
```
┌─────────────────────────────────────────────────────┐
│ Available:  theme.colors.success    (#34C759)       │
│ Occupied:   theme.colors.error      (#FF3B30)       │
│ Reserved:   theme.colors.warning    (#FF9500)       │
│ Cleaning:   theme.colors.info       (#007AFF)       │
│ Border:     theme.colors.outline    (#D1D1D6)       │
│ Background: theme.colors.background (#F2F2F7)       │
│ Surface:    theme.colors.surface    (#FFFFFF)       │
│ Text:       theme.colors.onSurface  (#1C1C1E)       │
└─────────────────────────────────────────────────────┘
```

### Area Color Indicators
```
┌─────────────────────────────────────────────────────┐
│ Success:  theme.colors.success  (Green)             │
│ Info:     theme.colors.info     (Blue)              │
│ Warning:  theme.colors.warning  (Orange)            │
│ Error:    theme.colors.error    (Red)               │
│ Purple:   theme.colors.purple   (Purple)            │
│ Primary:  theme.colors.primary  (Dark Gray)         │
└─────────────────────────────────────────────────────┘
```

---

## Accessibility Notes

### WCAG Compliance
- All text contrast ratio ≥ 4.5:1
- Interactive elements ≥ 44x44 touch target
- Screen reader labels on all icons
- Keyboard navigation support
- Focus indicators visible

### Icon Accessibility Labels
```typescript
<Icon
  name="table-furniture"
  accessibilityLabel="Table management"
  accessible={true}
/>
```

---

## Animation Specifications

### Modal Animations
- Entry: Slide up from bottom (300ms, ease-out)
- Exit: Slide down to bottom (250ms, ease-in)
- Backdrop: Fade in/out (200ms)

### Table Card Interactions
- Press: Scale 0.98 (100ms)
- Drag: Lift with shadow increase (150ms)
- Drop: Settle with bounce (200ms)

### Sidebar Collapse/Expand
- Width transition: 300ms ease-in-out
- Text fade: 200ms (staggered by 20ms)
- Icon position: 300ms ease-in-out

---

**Wireframes Status:** COMPLETE
**Last Updated:** 2025-10-08
**Next Step:** Review data-structure.md
