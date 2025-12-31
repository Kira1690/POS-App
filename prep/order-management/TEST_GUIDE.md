# Order Management System - Comprehensive Test Guide

## Overview

This guide provides step-by-step instructions for testing all features of the Order Management system, including ordering flow, kitchen management, and bill splitting.

---

## Prerequisites

### 1. Start the Application
```bash
cd /home/kira/Documents/GitHub/Food-Application/POS-App
bun expo start --clear
```

### 2. Test Credentials
Use the following credentials to log in:
- **Staff Login**: `EMP001` / `staff123`
- **Manager Login**: `manager@foodcorner.com` / `manager123`

---

## Test Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Table       │ --> │  Ordering    │ --> │  Kitchen     │ --> │  Bill &      │
│  Selection   │     │  Screen      │     │  Display     │     │  Payment     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Test Scenarios

### SCENARIO 1: Complete Order Flow (End-to-End)

#### Step 1: Navigate to Orders Tab
1. Open the app and log in
2. Tap the **"Orders"** tab in the bottom navigation
3. You should see the Order Management screen

#### Step 2: Create New Order
1. Tap **"New Order"** button or select an available table
2. Select a table (e.g., "Table 5")
3. Enter guest count (optional)
4. Tap **"Start Order"**

#### Step 3: Ordering Screen - Category Navigation
**Test the left category sidebar:**
- [ ] Verify "All Items" shows all menu items
- [ ] Tap "Appetizers" - verify filtered items
- [ ] Tap "Main Course" - verify items change
- [ ] Tap "Desserts" - verify dessert items show
- [ ] Tap "Beverages" - verify drinks show
- [ ] Verify category icons are displayed correctly

#### Step 4: Ordering Screen - Menu Item Grid
**Test the center panel:**
- [ ] Verify items display with name, price, image placeholder
- [ ] Verify dietary tags show (V = Vegetarian, GF = Gluten Free)
- [ ] Verify allergen warnings display on applicable items
- [ ] Use search bar to search "chicken" - verify filtering
- [ ] Clear search - verify all items return
- [ ] Toggle view mode (grid/compact) using top buttons
- [ ] Verify item count updates correctly

#### Step 5: Add Items to Cart
**Test item selection:**
1. Tap "Spring Rolls" - modifier modal should appear
   - [ ] Verify modifier options show (Size: Regular, Large)
   - [ ] Select "Large (6 pcs)" - verify price updates
   - [ ] Adjust quantity to 2
   - [ ] Add special instructions: "Extra crispy"
   - [ ] Tap "Add to Cart"
   - [ ] Verify cart updates with item

2. Tap "Chicken Wings" (has sauce modifier)
   - [ ] Verify sauce options (BBQ, Buffalo, Honey Garlic)
   - [ ] Select "Buffalo"
   - [ ] Tap "Add to Cart"

3. Tap "Ribeye Steak" (no modifiers)
   - [ ] Verify item adds directly without modal
   - [ ] Item should appear in cart

#### Step 6: Cart Management (Right Panel)
**Test cart functionality:**
- [ ] Verify table name displays at top
- [ ] Verify guest count displays (if entered)
- [ ] Verify all added items appear in cart
- [ ] Verify modifiers show under each item
- [ ] Verify unit price and item total display correctly

**Quantity adjustments:**
- [ ] Tap "+" on Spring Rolls - verify quantity increases to 3
- [ ] Tap "-" on Spring Rolls - verify quantity decreases to 2
- [ ] Tap "-" until quantity is 0 - item should be removed

**Edit item:**
- [ ] Tap pencil icon on Chicken Wings
- [ ] Modifier modal should reopen
- [ ] Change sauce to "Honey Garlic"
- [ ] Confirm - verify cart updates

**Remove item:**
- [ ] Tap trash icon on an item
- [ ] Verify item is removed from cart

**Clear cart:**
- [ ] Add multiple items
- [ ] Tap clear button (sweep icon) in header
- [ ] Confirm clearing - verify cart is empty

#### Step 7: Order Summary
**Verify pricing calculations:**
- [ ] Subtotal shows sum of all items
- [ ] Tax shows 10% of subtotal
- [ ] Total shows subtotal + tax
- [ ] Modifier price adjustments reflected correctly

#### Step 8: Send to Kitchen
1. With items in cart, tap **"Send to Kitchen"**
2. **Send to Kitchen Modal** should appear:
   - [ ] Verify table name displays
   - [ ] Verify item count displays
   - [ ] Verify **Ticket Routing** section shows items grouped by station:
     - Hot Kitchen (for fried items, main courses)
     - Grill Station (for steaks)
     - Desserts (for dessert items)
     - Beverages (for drinks)
   - [ ] Verify allergen warning shows if applicable
   - [ ] Verify order total displays

3. Tap **"Confirm & Send"**
   - [ ] Verify loading indicator appears
   - [ ] Verify success message shows
   - [ ] Verify order number is generated
   - [ ] Verify navigation back to Order Management

---

### SCENARIO 2: Kitchen Display

#### Step 1: Navigate to Kitchen Tab
1. Tap **"Kitchen"** in bottom navigation
2. Kitchen Display Screen should load

#### Step 2: View Kitchen Tickets
- [ ] Verify tickets display in columns/cards
- [ ] Verify order number shows on each ticket
- [ ] Verify table name shows
- [ ] Verify item list shows with quantities
- [ ] Verify ticket priority indicator (normal/rush/vip)
- [ ] Verify time elapsed shows

#### Step 3: Ticket Status Updates
- [ ] Find a ticket in "Pending" status
- [ ] Tap **"Start"** - status should change to "Preparing"
- [ ] Timer should continue running
- [ ] Tap **"Ready"** - status should change to "Ready"
- [ ] Ticket should move to completed section

#### Step 4: Filter Tickets
- [ ] Filter by station (Hot Kitchen, Grill, etc.)
- [ ] Verify only relevant tickets show
- [ ] Filter by status (Pending, Preparing, Ready)
- [ ] Clear filters - all tickets should show

---

### SCENARIO 3: Bill Screen & Splitting

#### Step 1: Navigate to Bill
1. From Order Management, select an order with status "Served" or "Ready"
2. Tap **"View Bill"** or navigate to the bill

#### Step 2: Bill Review
- [ ] Verify order info displays (Order #, Table, Items count)
- [ ] Verify itemized list shows all items
- [ ] Verify modifiers show under items with price adjustments
- [ ] Verify subtotal calculation
- [ ] Verify tax calculation (10%)
- [ ] Verify total calculation

#### Step 3: Tip Selection
- [ ] Tap "No Tip" - verify total stays same
- [ ] Tap "15%" - verify tip amount and new total
- [ ] Tap "18%" - verify tip amount updates
- [ ] Tap "20%" - verify tip amount updates
- [ ] Tap "25%" - verify tip amount updates

#### Step 4: Split Bill Options
**Test Split Equally:**
1. Tap **"Split Equally"** option
2. Should navigate to split configuration
3. Select number of guests (e.g., 4)
4. Verify each guest's share displays
5. Verify total of all shares equals order total

**Test Split by Items:**
1. Tap **"Split by Items"** option
2. Should show item assignment interface
3. Assign items to different guests
4. Verify guest totals update based on assigned items

**Test Multiple Payments:**
1. Tap **"Multiple Payments"** option
2. Should allow specifying different payment amounts
3. Verify remaining balance updates

#### Step 5: Full Payment
1. Return to main bill view
2. Tap **"Pay [Total Amount]"** button
3. Should navigate to Payment Processing screen

---

### SCENARIO 4: AsyncStorage Persistence

#### Step 1: Create Draft Order
1. Start a new order
2. Add several items to cart
3. Tap back button
4. Select "Save Draft" option
5. Close the app completely

#### Step 2: Verify Persistence
1. Reopen the app
2. Navigate to Orders tab
3. Find saved draft order
4. Open draft order
5. Verify all items are preserved
6. Verify modifiers are preserved
7. Verify notes are preserved

---

### SCENARIO 5: Error Handling

#### Test Network Errors
1. Turn off device network
2. Try to send order to kitchen
3. Verify error message displays
4. Turn network back on
5. Retry - verify order submits

#### Test Invalid Actions
1. Try to send empty cart to kitchen
   - [ ] Button should be disabled or show error
2. Try to checkout with $0 order
   - [ ] Should prevent action or show warning

---

## Data Flow Validation

### Order Context Flow
```
User Action -> useEnhancedOrder -> dispatch -> enhancedOrderReducer -> new state -> UI Update
```

**Test Points:**
- [ ] Adding item updates cart immediately
- [ ] Quantity changes reflect in UI
- [ ] Totals recalculate automatically
- [ ] Submit creates order and tickets

### Kitchen Context Flow
```
Order Submitted -> TicketRoutingService -> EnhancedKitchenContext -> Kitchen Display
```

**Test Points:**
- [ ] Tickets route to correct stations
- [ ] Items group by category
- [ ] Priority scores calculate correctly
- [ ] Status updates persist

### Bill Split Context Flow
```
Order -> BillSplitContext -> Guest splits -> Payment tracking
```

**Test Points:**
- [ ] Split calculations are accurate
- [ ] Guest assignments persist
- [ ] Payment status tracks correctly

---

## Known Limitations

1. **Mock Data**: The ordering screen uses mock menu items. Real API integration pending.
2. **Offline Mode**: Full offline support pending backend sync implementation.
3. **Print Function**: Print button placeholder - actual printing not implemented.
4. **Bill Split Navigation**: BillSplit screen placeholder - full UI pending.

---

## Troubleshooting

### App Not Starting
```bash
# Kill all Metro/Expo processes
pkill -9 -f "expo|metro"

# Clear caches
rm -rf node_modules/.cache .expo

# Restart
bun expo start --clear
```

### Theme Errors
If you see "Cannot read property 'colors' of undefined":
1. Ensure ThemeProvider wraps the app in App.tsx
2. Check `src/constants/theme.ts` exports `theme`

### Context Errors
If you see "useXXX must be used within Provider":
1. Check MainNavigator.tsx for correct provider wrapping
2. Ensure screens are inside the provider hierarchy

---

## Test Checklist Summary

### Core Functionality
- [ ] Login and navigation works
- [ ] Category sidebar displays and filters
- [ ] Menu items display with correct info
- [ ] Modifier selection works
- [ ] Cart add/update/remove works
- [ ] Pricing calculations correct
- [ ] Send to kitchen creates tickets
- [ ] Kitchen display shows tickets
- [ ] Ticket status updates work
- [ ] Bill displays order summary
- [ ] Tip selection works
- [ ] Split options navigate correctly

### Data Persistence
- [ ] Draft orders save
- [ ] Draft orders restore
- [ ] Order history persists

### Error States
- [ ] Empty cart handled
- [ ] Network errors handled
- [ ] Invalid input handled

---

## Version Information
- **Implementation Date**: December 2025
- **POS App Version**: See package.json
- **React Native**: 0.79.5
- **Expo SDK**: 53

---

## Support

For issues or questions about testing:
1. Check console for error messages
2. Review the implementation in `src/screens/orders/`
3. Check context providers in `src/context/`
4. Review navigation in `src/navigation/MainNavigator.tsx`
