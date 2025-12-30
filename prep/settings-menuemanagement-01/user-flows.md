# Menu Management - User Flows

## Table of Contents
1. [Navigation Flows](#1-navigation-flows)
2. [Category Management Flows](#2-category-management-flows)
3. [Menu Item Management Flows](#3-menu-item-management-flows)
4. [Modifier Management Flows](#4-modifier-management-flows)
5. [Combo Management Flows](#5-combo-management-flows)
6. [Bulk Operations Flows](#6-bulk-operations-flows)
7. [Import/Export Flows](#7-importexport-flows)
8. [Error Handling Flows](#8-error-handling-flows)

---

## 1. Navigation Flows

### 1.1 Accessing Menu Management
```
User Journey:
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│ Dashboard/Home  │ --> │ Settings Screen  │ --> │ Menu Management Section │
│                 │     │ (Sidebar)        │     │                         │
└─────────────────┘     └──────────────────┘     └─────────────────────────┘

Steps:
1. User navigates to Settings tab
2. Settings sidebar shows all categories
3. User clicks "Menu Management" in sidebar
4. Full-screen Menu Editor loads
5. Default view: Items tab with all items displayed
```

### 1.2 Tab Navigation
```
Available Tabs:
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ Categories │  │   Items    │  │ Modifiers  │  │   Combos   │
│   (8)      │  │   (76)     │  │   (4)      │  │   (3)      │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
                     ▲
                     │ (Default)

Behavior:
- Clicking tab switches content area
- Tab badge shows count of items
- Active tab is highlighted
- Unsaved changes prompt before switching
```

### 1.3 Sidebar Category Selection
```
User Action: Select category in sidebar

┌─────────────────┐
│ [+ Add]         │
│                 │
│ ALL ITEMS   ●   │ <-- Selected (highlighted)
│   76 items      │
│                 │
│ BEVERAGES       │
│   12 items      │
│                 │
│ CHINESE         │
│   18 items      │
└─────────────────┘

Result:
- Content area filters to show only items in selected category
- Stats panel updates to show category stats
- "ALL ITEMS" shows everything (default)
```

---

## 2. Category Management Flows

### 2.1 Create New Category
```
Trigger: Click [+ Add Category] button

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Add   │ --> │ Add Category Modal   │ --> │ Category Added  │
│ Button      │     │ Opens                │     │ to Sidebar      │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Modal Steps:
1. Enter category name (required)
2. Enter description (optional)
3. Set display order (auto-incremented)
4. Toggle active status (default: active)
5. Click "Create Category"

Success:
- Modal closes
- Toast: "Category created successfully"
- New category appears in sidebar
- Sidebar auto-selects new category

Failure:
- Error message in modal
- Form remains open for correction
```

### 2.2 Edit Category
```
Trigger: Click [...] menu on category row -> "Edit"

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Edit  │ --> │ Edit Category Modal  │ --> │ Category Updated│
│ Menu Item   │     │ (Pre-filled)         │     │ in Sidebar      │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Modal Features:
- Shows current item count
- Shows today's revenue
- Warning if disabling: "This will hide X items"
- Delete button at bottom left
```

### 2.3 Delete Category
```
Trigger: Edit Modal -> Delete button OR Context menu -> Delete

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Click Delete│ --> │ Confirmation Dialog   │ --> │ Category Removed│
│             │     │ (With options)        │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Confirmation Options:
1. Move items to another category (select dropdown)
2. Delete all items in category

Warning: "This action cannot be undone"

Success:
- Category removed from sidebar
- Items moved or deleted based on selection
- Toast: "Category deleted"
```

### 2.4 Reorder Categories
```
Trigger: Categories Tab -> [Reorder Mode] button

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Enter       │ --> │ Drag categories      │ --> │ Save new order  │
│ Reorder Mode│     │ to new positions     │     │                 │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Behavior:
- Drag handles appear on each category row
- Drag and drop to reorder
- Changes auto-save on drop
- Exit reorder mode button
```

---

## 3. Menu Item Management Flows

### 3.1 Create New Menu Item
```
Trigger: Click [+ Add Item] button in toolbar

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Add   │ --> │ Multi-Step Wizard    │ --> │ Item Added      │
│ Item        │     │ (4 steps)            │     │ to Grid         │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Step 1: Basic Information
├── Item name (required)
├── Category (required, dropdown)
├── Description (optional)
├── Image upload/URL
└── Preparation time

Step 2: Pricing
├── Base price (required)
├── Cost price (optional, for margin calc)
├── Availability toggle
└── Kitchen station assignment

Step 3: Modifiers
├── Select modifier groups to apply
├── Override required settings if needed
├── Allow special instructions toggle
└── Create new modifier group option

Step 4: Nutritional Info
├── Dietary tags (checkboxes)
├── Allergen warnings (checkboxes)
├── Nutritional facts (optional numbers)
└── Finish

Navigation:
- [Cancel] - Close wizard, discard changes
- [Back] - Go to previous step
- [Next] - Go to next step (validates current)
- [Create Item] - Final step only
```

### 3.2 Quick Edit Menu Item
```
Trigger: Click on item card in grid

Flow:
┌─────────────┐     ┌──────────────────────┐
│ Click Item  │ --> │ Stats Panel Updates  │
│ Card        │     │ with Item Details    │
└─────────────┘     └──────────────────────┘

Stats Panel Shows:
- Item image
- Name, price, category
- Today's orders, revenue
- Rating, last ordered
- Quick action buttons

Quick Actions:
- [Edit] - Opens full Edit Modal
- [Duplicate] - Creates copy with "Copy of" prefix
- [Toggle] - Enable/disable availability
- [Delete] - Confirmation then delete
```

### 3.3 Full Edit Menu Item
```
Trigger: Stats Panel -> [Edit] OR Item context menu -> Edit

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Edit  │ --> │ Edit Modal (same as  │ --> │ Item Updated    │
│             │     │ Add wizard, pre-fill)│     │ in Grid         │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Differences from Add:
- All fields pre-filled
- "Save Changes" instead of "Create"
- Delete button visible
- Shows creation date, last modified
```

### 3.4 Toggle Item Availability
```
Trigger: Toggle button on item card/row

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Toggle│ --> │ Instant Update       │ --> │ Order Screen    │
│             │     │ (No confirmation)    │     │ Syncs           │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Behavior:
- Immediate toggle (optimistic update)
- Card visual changes (grayed out if unavailable)
- Toast: "Item disabled" or "Item enabled"
- Real-time sync to Order screen
```

### 3.5 Delete Menu Item
```
Trigger: Context menu -> Delete OR Stats Panel -> Delete

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Click Delete│ --> │ Confirmation Dialog   │ --> │ Item Removed    │
│             │     │                       │     │ from Grid       │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Confirmation Shows:
- Item name
- Warning about active orders containing this item
- "This action cannot be undone"

Special Case - Item in Cart:
- If item is currently in any active order/cart
- Extra warning: "This item is in X active orders"
- Orders will continue with item, but new orders won't include it
```

### 3.6 Search and Filter Items
```
Trigger: Type in search bar OR select filter

Search Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Type in     │ --> │ Debounced search     │ --> │ Grid updates    │
│ Search      │     │ (300ms delay)        │     │ with results    │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Filter Options:
- Category (multi-select)
- Availability (available/unavailable/all)
- Has modifiers (yes/no/all)
- Price range (min-max slider)
- Dietary tags (multi-select)
- Allergen-free (multi-select)

Behavior:
- Filters are additive (AND logic)
- Active filter count shown on button
- "Clear All" button to reset
- URL updates with filters (shareable)
```

---

## 4. Modifier Management Flows

### 4.1 Create Modifier Group
```
Trigger: Modifiers Tab -> [+ Add Modifier Group]

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Add   │ --> │ Add Modifier Modal   │ --> │ Group Added     │
│ Group       │     │                      │     │ to List         │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Modal Fields:
1. Group name (e.g., "Size Options")
2. Description for customers
3. Selection type: Single / Multiple
4. Required toggle
5. Min/Max selections (if multiple)
6. Add options:
   - Option name
   - Price adjustment (+$, -$, or $0)
   - Default toggle
7. Apply to items (multi-select)

Success:
- Group appears in modifier list
- If items selected, assignments created
- Toast: "Modifier group created"
```

### 4.2 Add Option to Existing Group
```
Trigger: Group Details Panel -> [+ Add Option]

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Add   │ --> │ Quick Add Form       │ --> │ Option Added    │
│ Option      │     │ (Inline or modal)    │     │ to Group        │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Fields:
- Option name
- Price adjustment
- Is default
- Max quantity (if applicable)
```

### 4.3 Assign Modifiers to Items
```
Trigger: Group row -> [Assign to Items] OR Group Details -> Edit Assignment

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Assign│ --> │ Assignment Modal     │ --> │ Assignments     │
│             │     │                      │     │ Updated         │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Modal Features:
- Search items by name
- Filter by category
- Checkboxes for each item
- "Select All" / "Clear All"
- Shows currently assigned items
- Bulk actions: "Select All Beverages"

Result:
- Selected items now have modifier group
- Appears in item's modifier list
- Syncs to Order screen
```

---

## 5. Combo Management Flows

### 5.1 Create Combo Deal
```
Trigger: Combos Tab -> [+ Create Combo]

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Create│ --> │ Multi-Step Wizard    │ --> │ Combo Created   │
│ Combo       │     │ (3 steps)            │     │                 │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Step 1: Basic Info
├── Combo name
├── Description
└── Image upload

Step 2: Select Items
├── Search and add items to combo
├── Set quantity for each
├── Mark substitutable items
├── Choose substitution options
├── Running total shown
└── Item category labels (main, side, drink, dessert)

Step 3: Pricing & Availability
├── Regular total (auto-calculated)
├── Combo price (user sets)
├── Savings shown (amount + percentage)
├── Availability settings:
│   ├── Always available
│   └── Limited:
│       ├── Date range
│       ├── Days of week
│       └── Time range
└── Active toggle

Success:
- Combo card appears in grid
- Available in Order screen (if active)
```

### 5.2 Edit Combo
```
Trigger: Combo card [...] -> Edit OR Click card

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click Edit  │ --> │ Edit Wizard (same as │ --> │ Combo Updated   │
│             │     │ create, pre-filled)  │     │                 │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Additional Features:
- Show order count / revenue
- Warning if combo is currently in orders
```

---

## 6. Bulk Operations Flows

### 6.1 Multi-Select Items
```
Trigger: Click checkbox on item cards

Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Click       │ --> │ Selection count      │ --> │ Bulk Actions    │
│ Checkboxes  │     │ updates              │     │ Bar Appears     │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Selection Methods:
1. Click individual checkboxes
2. Shift+click for range selection
3. "Select All" in header
4. "Select All Visible" (respects filters)

Bulk Actions Bar Shows:
- Selection count: "3 items selected"
- [Enable] - Enable all selected
- [Disable] - Disable all selected
- [Change Category] - Move to different category
- [Update Price] - Adjust prices
- [Delete] - Delete all selected
- [x] - Clear selection
```

### 6.2 Bulk Price Update
```
Trigger: Bulk Actions Bar -> [Update Price]

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Click Update│ --> │ Bulk Edit Modal       │ --> │ Prices Updated  │
│ Price       │     │                       │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Modal Options:
- Increase by percentage: [X]%
- Decrease by percentage: [X]%
- Increase by fixed amount: $[X]
- Decrease by fixed amount: $[X]

Preview:
- Shows before/after for each selected item
- Highlights changes

Confirmation:
- Review changes
- Click "Apply Changes"
- Toast: "X items updated"
```

### 6.3 Bulk Category Change
```
Trigger: Bulk Actions Bar -> [Change Category]

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Click Change│ --> │ Category Selection    │ --> │ Items Moved     │
│ Category    │     │ Dropdown              │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Behavior:
- Select new category from dropdown
- Confirmation: "Move X items to [Category]?"
- Items disappear from current filter (if filtering by category)
- Toast: "X items moved to [Category]"
```

---

## 7. Import/Export Flows

### 7.1 Import Menu
```
Trigger: Toolbar -> [Import]

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Click Import│ --> │ Import Modal          │ --> │ Items Imported  │
│             │     │                       │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Steps:
1. Select file format (CSV, JSON, Excel)
2. Download template (optional)
3. Upload file (drag-drop or browse)
4. Preview first 5 rows
5. Configure options:
   - Skip duplicates
   - Update existing
   - Create categories if needed
6. Click "Import X Items"

Validation:
- Check required fields
- Validate price format
- Validate category references
- Show errors if any

Progress:
- Progress bar during import
- Success count / Error count
- Option to download error report
```

### 7.2 Export Menu
```
Trigger: Toolbar -> [Export]

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Click Export│ --> │ Export Modal          │ --> │ File Downloaded │
│             │     │                       │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Options:
- Format: CSV, JSON, Excel
- What to export:
  - Categories
  - Menu Items
  - Modifier Groups
  - Modifier Options
  - Combo Deals
  - Nutritional Info
- Filters:
  - Specific categories
  - Available only / All
- File name (auto-generated with date)

Click "Export" -> File downloads
```

---

## 8. Error Handling Flows

### 8.1 Network Error
```
Scenario: API call fails

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ API Fails   │ --> │ Error Message Shown   │ --> │ Retry Option    │
│             │     │                       │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Behavior:
- Toast with error message
- [Retry] button in toast
- Data remains in previous state
- Changes queued for retry
```

### 8.2 Validation Error
```
Scenario: Form validation fails

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Submit Form │ --> │ Validation Errors     │ --> │ User Corrects   │
│             │     │ Highlighted           │     │ and Resubmits   │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Behavior:
- Form stays open
- Error message under each invalid field
- Field border turns red
- Focus moves to first error
- Submit button disabled until fixed
```

### 8.3 Conflict Error (Item in Active Order)
```
Scenario: Trying to delete item that's in an active order

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Delete Item │ --> │ Conflict Warning      │ --> │ User Decides    │
│             │     │ Dialog                │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Warning Shows:
- "This item is in X active orders"
- Options:
  1. Delete anyway (orders continue with item)
  2. Disable instead of delete
  3. Cancel
```

### 8.4 Unsaved Changes Warning
```
Scenario: User tries to navigate away with unsaved changes

Flow:
┌─────────────┐     ┌───────────────────────┐     ┌─────────────────┐
│ Navigate    │ --> │ Unsaved Changes       │ --> │ User Chooses    │
│ Away        │     │ Dialog                │     │                 │
└─────────────┘     └───────────────────────┘     └─────────────────┘

Dialog:
- "You have unsaved changes"
- [Save & Continue] - Save then navigate
- [Discard] - Navigate without saving
- [Cancel] - Stay on current page
```

---

## User Personas & Common Journeys

### Restaurant Manager - Daily Menu Update
```
Journey: Update prices for lunch specials

1. Open Settings -> Menu Management
2. Go to Items tab
3. Filter by "Lunch Specials" category
4. Select all items (checkbox)
5. Click "Update Price" in bulk actions
6. Increase by 5%
7. Review preview
8. Apply changes
9. Verify in Order screen
```

### Kitchen Manager - Mark Items Unavailable
```
Journey: Mark out-of-stock items

1. Open Menu Management
2. Find item by search
3. Click toggle to disable
4. (Or) Multi-select items
5. Click "Disable" in bulk actions
6. Toast confirms
7. Order screen no longer shows items
```

### Owner - Add New Menu Section
```
Journey: Add new dessert category with items

1. Open Menu Management
2. Go to Categories tab
3. Click "+ Add Category"
4. Enter "Desserts", description
5. Create category
6. Go to Items tab
7. Click "+ Add Item"
8. Complete 4-step wizard
9. Repeat for all dessert items
10. Create combo "Dessert Sampler"
```
