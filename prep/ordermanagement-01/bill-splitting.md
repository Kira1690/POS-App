# Order Management - Bill Splitting System

## Overview

This document details the complete bill splitting functionality, including equal splits, item-based splits, and payment method splits.

---

## Bill Split Types

### 1. Equal Split
Divide the total bill equally among a specified number of guests.

### 2. Split by Items
Assign specific items to each guest - they pay for what they ordered.

### 3. Split by Payment Method
Pay portions of the bill using different payment methods (e.g., $30 cash + $26.65 card).

---

## User Flow Diagrams

### Equal Split Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          EQUAL SPLIT FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   STEP 1: Select Split Type                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   How would you like to split the bill?                                │   │
│   │                                                                         │   │
│   │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                  │   │
│   │   │   EQUAL     │   │  BY ITEMS   │   │ BY PAYMENT  │                  │   │
│   │   │   SPLIT     │   │             │   │   METHOD    │                  │   │
│   │   │     ●       │   │             │   │             │                  │   │
│   │   └─────────────┘   └─────────────┘   └─────────────┘                  │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 2: Enter Number of Guests                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   Total Bill: $56.65                                                   │   │
│   │                                                                         │   │
│   │   Number of guests:        [ - ]    4    [ + ]                         │   │
│   │                                                                         │   │
│   │   Amount per person:       $14.16                                      │   │
│   │                                                                         │   │
│   │   Note: Last guest pays $14.17 (rounding adjustment)                   │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 3: Process Each Guest Payment                                             │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   GUEST PAYMENTS                                                        │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   Guest 1:  $14.16  [Cash ▼]    ● Paid   ○ Unpaid                      │   │
│   │   Guest 2:  $14.16  [Card ▼]    ○ Paid   ● Unpaid  ← Processing        │   │
│   │   Guest 3:  $14.16  [Card ▼]    ○ Paid   ● Unpaid                      │   │
│   │   Guest 4:  $14.17  [Cash ▼]    ○ Paid   ● Unpaid                      │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   Paid: $14.16  |  Remaining: $42.49                                   │   │
│   │                                                                         │   │
│   │   [Process Next Payment: Guest 2 - Card $14.16]                        │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 4: All Guests Paid                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   ✓ ALL PAYMENTS COMPLETE                                              │   │
│   │                                                                         │   │
│   │   Guest 1:  $14.16  Cash     ✓ Paid                                    │   │
│   │   Guest 2:  $14.16  Card     ✓ Paid                                    │   │
│   │   Guest 3:  $14.16  Card     ✓ Paid                                    │   │
│   │   Guest 4:  $14.17  Cash     ✓ Paid                                    │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │   Total:    $56.65           ✓ Complete                                │   │
│   │                                                                         │   │
│   │   [Print Receipts]   [Email Receipts]   [Done - Release Table]         │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Split by Items Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SPLIT BY ITEMS FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   STEP 1: Create Guests                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   GUESTS                                            [+ Add Guest]       │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   ┌───────────┐  ┌───────────┐  ┌───────────┐                          │   │
│   │   │  Guest 1  │  │  Guest 2  │  │  Guest 3  │                          │   │
│   │   │  $0.00    │  │  $0.00    │  │  $0.00    │                          │   │
│   │   │  [Rename] │  │  [Rename] │  │  [Remove] │                          │   │
│   │   └───────────┘  └───────────┘  └───────────┘                          │   │
│   │                                                                         │   │
│   │   Tip: Tap a guest to select, then tap items to assign                 │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 2: Assign Items to Guests                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   SELECTED: Guest 1 (Tap items to assign)                              │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐  │   │
│   │   │ ITEM                                   PRICE     ASSIGNED TO    │  │   │
│   │   │ ─────────────────────────────────────────────────────────────── │  │   │
│   │   │ 1x Classic Burger + Bacon, Jalapeño   $18.50    [Tap to assign] │  │   │
│   │   │ 1x Grilled Chicken + Sauce            $23.00    Guest 1         │  │   │
│   │   │ 2x Coca Cola                           $6.00    [Shared]        │  │   │
│   │   │ 1x Orange Juice                        $4.00    Guest 3         │  │   │
│   │   │ Tax                                    $5.15    [Split All]     │  │   │
│   │   └─────────────────────────────────────────────────────────────────┘  │   │
│   │                                                                         │   │
│   │   SHARED ITEMS: Select multiple guests to split an item                │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 3: Handle Shared Items                                                    │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   SHARED ITEM: 2x Coca Cola ($6.00)                                    │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   Split between:                                                        │   │
│   │   ☑ Guest 1  ($2.00)                                                   │   │
│   │   ☑ Guest 2  ($2.00)                                                   │   │
│   │   ☑ Guest 3  ($2.00)                                                   │   │
│   │                                                                         │   │
│   │   [Apply Split]                                                         │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 4: Review & Process                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   SPLIT SUMMARY                                                         │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   Guest 1:                                                              │   │
│   │     1x Grilled Chicken + Sauce            $23.00                       │   │
│   │     Share: 2x Coca Cola (1/3)              $2.00                       │   │
│   │     Share: Tax (1/3)                       $1.72                       │   │
│   │     ───────────────────────────────────────────                        │   │
│   │     TOTAL:                                $26.72    [Cash ▼] [Pay]     │   │
│   │                                                                         │   │
│   │   Guest 2:                                                              │   │
│   │     1x Classic Burger + Bacon, Jalapeño   $18.50                       │   │
│   │     Share: 2x Coca Cola (1/3)              $2.00                       │   │
│   │     Share: Tax (1/3)                       $1.72                       │   │
│   │     ───────────────────────────────────────────                        │   │
│   │     TOTAL:                                $22.22    [Card ▼] [Pay]     │   │
│   │                                                                         │   │
│   │   Guest 3:                                                              │   │
│   │     1x Orange Juice                        $4.00                       │   │
│   │     Share: 2x Coca Cola (1/3)              $2.00                       │   │
│   │     Share: Tax (1/3)                       $1.71                       │   │
│   │     ───────────────────────────────────────────                        │   │
│   │     TOTAL:                                 $7.71    [Cash ▼] [Pay]     │   │
│   │                                                                         │   │
│   │   ═══════════════════════════════════════════════════════════════      │   │
│   │   GRAND TOTAL:                            $56.65                       │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Split by Payment Method Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      SPLIT BY PAYMENT METHOD FLOW                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   STEP 1: Add Payment Methods                                                    │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   TOTAL DUE: $56.65                                                    │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   Payment 1:                                                            │   │
│   │   ┌───────────────────────────────────────────────────────────────┐    │   │
│   │   │  Method: [Cash          ▼]                                     │    │   │
│   │   │  Amount: $ [30.00              ]                               │    │   │
│   │   │                                                   [Remove]     │    │   │
│   │   └───────────────────────────────────────────────────────────────┘    │   │
│   │                                                                         │   │
│   │   Payment 2:                                                            │   │
│   │   ┌───────────────────────────────────────────────────────────────┐    │   │
│   │   │  Method: [Card          ▼]                                     │    │   │
│   │   │  Amount: $ [26.65              ]  ← Auto-fills remaining       │    │   │
│   │   │                                                   [Remove]     │    │   │
│   │   └───────────────────────────────────────────────────────────────┘    │   │
│   │                                                                         │   │
│   │   [+ Add Another Payment Method]                                        │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 2: Validation                                                             │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   PAYMENT SUMMARY                                                       │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   Cash:                           $30.00                               │   │
│   │   Card:                           $26.65                               │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │   Total Payments:                 $56.65                               │   │
│   │   Remaining:                       $0.00  ✓                            │   │
│   │                                                                         │   │
│   │   ⚠️ Remaining must be $0.00 to proceed                                │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 3: Process Each Payment Sequentially                                      │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   PROCESSING PAYMENTS                                                   │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   1. Cash $30.00                                                        │   │
│   │      ┌─────────────────────────────────────────────────────────────┐   │   │
│   │      │  Amount Due: $30.00                                          │   │   │
│   │      │  Cash Received: $ [50.00        ]                            │   │   │
│   │      │  Change: $20.00                                              │   │   │
│   │      │                                                              │   │   │
│   │      │  [Complete Cash Payment]                                     │   │   │
│   │      └─────────────────────────────────────────────────────────────┘   │   │
│   │                                                                         │   │
│   │   2. Card $26.65                                          [Pending]    │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│   STEP 4: All Payments Complete                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   ✓ ALL PAYMENTS COMPLETE                                              │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │                                                                         │   │
│   │   1. Cash        $30.00    ✓ Complete   Change: $20.00                 │   │
│   │   2. Card        $26.65    ✓ Complete   Ref: TXN-001234                │   │
│   │   ─────────────────────────────────────────────────────────────────    │   │
│   │   TOTAL PAID:    $56.65                                                │   │
│   │                                                                         │   │
│   │   [Print Receipt]   [Email Receipt]   [Done - Release Table]           │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Structures

### Bill Split Types

```typescript
// src/types/billing.types.ts

type SplitType = 'equal' | 'by_items' | 'by_payment_method';

interface BillSplit {
  id: string;
  orderId: string;
  orderNumber: string;
  splitType: SplitType;

  // Original bill details
  originalSubtotal: number;
  originalTax: number;
  originalTotal: number;
  tipAmount: number;

  // Split configuration
  guestCount?: number;           // For equal split
  guests: GuestSplit[];          // For all split types
  paymentSplits?: PaymentMethodSplit[];  // For payment method split

  // Status
  status: 'pending' | 'partial' | 'complete';
  paidAmount: number;
  remainingAmount: number;

  // Timestamps
  createdAt: string;
  completedAt?: string;
}
```

### Guest Split

```typescript
interface GuestSplit {
  id: string;
  name: string;
  color?: string;           // For visual distinction

  // Assigned items
  items: GuestSplitItem[];

  // Shared items (for by_items split)
  sharedItems: SharedItemPortion[];

  // Calculated amounts
  itemsSubtotal: number;
  sharedSubtotal: number;
  taxPortion: number;
  tipPortion: number;
  total: number;

  // Payment
  paymentStatus: 'pending' | 'processing' | 'paid';
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  transactionId?: string;

  // For cash payments
  amountReceived?: number;
  changeGiven?: number;
}

interface GuestSplitItem {
  orderItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: string[];
  totalPrice: number;
}

interface SharedItemPortion {
  orderItemId: string;
  name: string;
  originalPrice: number;
  sharedWith: string[];         // Guest IDs
  portionCount: number;         // How many ways it's split
  portionAmount: number;        // This guest's share
}
```

### Payment Method Split

```typescript
interface PaymentMethodSplit {
  id: string;
  method: PaymentMethod;
  amount: number;
  order: number;                // Processing order (1, 2, 3...)

  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';

  // Processing details
  transactionId?: string;
  processedAt?: string;
  error?: string;

  // For cash
  amountReceived?: number;
  changeGiven?: number;
}

type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'gift_card'
  | 'mobile_payment';
```

---

## Split Calculation Logic

### Equal Split Calculator

```typescript
// src/services/billing/EqualSplitCalculator.ts

class EqualSplitCalculator {
  /**
   * Calculate equal split amounts
   */
  calculate(total: number, guestCount: number): GuestAmount[] {
    const baseAmount = Math.floor((total * 100) / guestCount) / 100;
    const remainder = Math.round((total - baseAmount * guestCount) * 100) / 100;

    const amounts: GuestAmount[] = [];

    for (let i = 0; i < guestCount; i++) {
      // Last guest gets the remainder (handles rounding)
      const amount = i === guestCount - 1
        ? baseAmount + remainder
        : baseAmount;

      amounts.push({
        guestIndex: i + 1,
        amount: Math.round(amount * 100) / 100,
      });
    }

    return amounts;
  }

  /**
   * Validate split amounts equal total
   */
  validate(amounts: GuestAmount[], total: number): boolean {
    const sum = amounts.reduce((acc, a) => acc + a.amount, 0);
    return Math.abs(sum - total) < 0.01; // Allow 1 cent tolerance
  }
}

// Example:
// Total: $56.65, 4 guests
// Output: [$14.16, $14.16, $14.16, $14.17]
```

### Item Split Calculator

```typescript
// src/services/billing/ItemSplitCalculator.ts

class ItemSplitCalculator {
  /**
   * Calculate guest totals based on item assignments
   */
  calculate(
    order: Order,
    assignments: ItemAssignment[],
    taxRate: number
  ): GuestSplit[] {
    const guestMap = new Map<string, GuestSplit>();

    // Process individual item assignments
    for (const assignment of assignments) {
      if (!assignment.isShared) {
        const guest = this.getOrCreateGuest(guestMap, assignment.guestId);
        const item = order.items.find(i => i.id === assignment.itemId);

        if (item) {
          guest.items.push({
            orderItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.basePrice,
            modifiers: item.selectedModifiers.flatMap(m =>
              m.options.map(o => o.optionName)
            ),
            totalPrice: item.itemTotal,
          });
          guest.itemsSubtotal += item.itemTotal;
        }
      }
    }

    // Process shared items
    const sharedAssignments = assignments.filter(a => a.isShared);
    for (const assignment of sharedAssignments) {
      const item = order.items.find(i => i.id === assignment.itemId);
      if (!item) continue;

      const sharedWith = assignment.sharedWith || [];
      const portionCount = sharedWith.length;
      const portionAmount = Math.round((item.itemTotal / portionCount) * 100) / 100;

      // Handle rounding remainder
      let remainder = item.itemTotal - (portionAmount * portionCount);

      for (let i = 0; i < sharedWith.length; i++) {
        const guestId = sharedWith[i];
        const guest = this.getOrCreateGuest(guestMap, guestId);

        // Last guest gets remainder
        const amount = i === sharedWith.length - 1
          ? portionAmount + remainder
          : portionAmount;

        guest.sharedItems.push({
          orderItemId: item.id,
          name: item.name,
          originalPrice: item.itemTotal,
          sharedWith,
          portionCount,
          portionAmount: amount,
        });

        guest.sharedSubtotal += amount;
      }
    }

    // Calculate tax portions based on subtotals
    const guests = Array.from(guestMap.values());
    const totalSubtotal = guests.reduce(
      (acc, g) => acc + g.itemsSubtotal + g.sharedSubtotal,
      0
    );

    for (const guest of guests) {
      const guestSubtotal = guest.itemsSubtotal + guest.sharedSubtotal;
      const taxRatio = guestSubtotal / totalSubtotal;
      guest.taxPortion = Math.round(order.taxAmount * taxRatio * 100) / 100;
      guest.total = guestSubtotal + guest.taxPortion;
    }

    // Adjust for rounding to match order total
    this.adjustForRounding(guests, order.totalAmount);

    return guests;
  }

  private adjustForRounding(guests: GuestSplit[], orderTotal: number): void {
    const currentTotal = guests.reduce((acc, g) => acc + g.total, 0);
    const diff = Math.round((orderTotal - currentTotal) * 100) / 100;

    if (Math.abs(diff) > 0) {
      // Add/subtract from last guest's tax
      guests[guests.length - 1].taxPortion += diff;
      guests[guests.length - 1].total += diff;
    }
  }
}
```

### Payment Method Split Validator

```typescript
// src/services/billing/PaymentSplitValidator.ts

class PaymentSplitValidator {
  /**
   * Validate payment splits equal total
   */
  validate(splits: PaymentMethodSplit[], total: number): ValidationResult {
    const errors: string[] = [];

    // Check for duplicate methods (optional - some restaurants allow)
    // const methods = splits.map(s => s.method);
    // if (new Set(methods).size !== methods.length) {
    //   errors.push('Duplicate payment methods not allowed');
    // }

    // Check amounts are positive
    for (const split of splits) {
      if (split.amount <= 0) {
        errors.push(`Payment amount must be positive`);
      }
    }

    // Check total matches
    const splitTotal = splits.reduce((acc, s) => acc + s.amount, 0);
    const diff = Math.abs(splitTotal - total);

    if (diff > 0.01) {
      if (splitTotal < total) {
        errors.push(`Payment total ($${splitTotal.toFixed(2)}) is less than bill ($${total.toFixed(2)}). Add $${(total - splitTotal).toFixed(2)} more.`);
      } else {
        errors.push(`Payment total ($${splitTotal.toFixed(2)}) exceeds bill ($${total.toFixed(2)}). Reduce by $${(splitTotal - total).toFixed(2)}.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      remaining: Math.max(0, total - splitTotal),
    };
  }

  /**
   * Auto-calculate remaining amount for last payment method
   */
  calculateRemaining(splits: PaymentMethodSplit[], total: number, currentIndex: number): number {
    const paidSoFar = splits
      .filter((_, i) => i < currentIndex)
      .reduce((acc, s) => acc + s.amount, 0);

    return Math.round((total - paidSoFar) * 100) / 100;
  }
}
```

---

## Component Architecture

### Bill Split Screen Structure

```
BillSplitScreen/
├── BillSplitScreen.tsx              # Main container
├── components/
│   ├── SplitTypeSelector.tsx        # Equal/Items/Payment tabs
│   ├── BillSummary.tsx              # Original bill display
│   │
│   ├── EqualSplit/
│   │   ├── EqualSplitView.tsx       # Equal split main view
│   │   ├── GuestCountSelector.tsx   # +/- guest count
│   │   └── GuestPaymentList.tsx     # List of guest payments
│   │
│   ├── ItemSplit/
│   │   ├── ItemSplitView.tsx        # Item split main view
│   │   ├── GuestSelector.tsx        # Add/manage guests
│   │   ├── ItemAssignmentList.tsx   # Assign items to guests
│   │   ├── SharedItemModal.tsx      # Split shared items
│   │   └── GuestSummaryCard.tsx     # Individual guest total
│   │
│   ├── PaymentMethodSplit/
│   │   ├── PaymentSplitView.tsx     # Payment split main view
│   │   ├── PaymentMethodCard.tsx    # Individual payment config
│   │   └── SplitValidation.tsx      # Shows remaining balance
│   │
│   └── common/
│       ├── PaymentMethodSelector.tsx # Dropdown for payment method
│       ├── AmountInput.tsx          # Currency input
│       └── SplitProgress.tsx        # Progress indicator
│
└── hooks/
    ├── useEqualSplit.ts             # Equal split logic
    ├── useItemSplit.ts              # Item split logic
    └── usePaymentSplit.ts           # Payment method split logic
```

### State Management

```typescript
// src/context/billing/BillSplitContext.tsx

interface BillSplitState {
  // Current order
  order: Order | null;

  // Split configuration
  splitType: SplitType | null;

  // Equal split state
  guestCount: number;
  equalSplitAmounts: GuestAmount[];

  // Item split state
  guests: GuestSplit[];
  itemAssignments: ItemAssignment[];
  selectedGuestId: string | null;

  // Payment method split state
  paymentSplits: PaymentMethodSplit[];

  // Processing state
  currentPaymentIndex: number;
  isProcessing: boolean;
  processingGuestId: string | null;

  // Totals
  paidAmount: number;
  remainingAmount: number;

  // Status
  isComplete: boolean;
  error: string | null;
}

interface BillSplitActions {
  // Initialize
  initializeSplit(order: Order): void;
  setSplitType(type: SplitType): void;
  resetSplit(): void;

  // Equal split
  setGuestCount(count: number): void;
  setGuestPaymentMethod(guestIndex: number, method: PaymentMethod): void;
  processGuestPayment(guestIndex: number): Promise<PaymentResult>;

  // Item split
  addGuest(name?: string): void;
  removeGuest(guestId: string): void;
  renameGuest(guestId: string, name: string): void;
  selectGuest(guestId: string): void;
  assignItemToGuest(itemId: string, guestId: string): void;
  unassignItem(itemId: string): void;
  shareItem(itemId: string, guestIds: string[]): void;
  setGuestPaymentMethod(guestId: string, method: PaymentMethod): void;
  processGuestPayment(guestId: string): Promise<PaymentResult>;

  // Payment method split
  addPaymentMethod(method: PaymentMethod, amount: number): void;
  updatePaymentAmount(splitId: string, amount: number): void;
  removePaymentMethod(splitId: string): void;
  processNextPayment(): Promise<PaymentResult>;

  // Common
  completeAllPayments(): Promise<void>;
}
```

---

## Wireframes

### Split Type Selection

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                         HOW WOULD YOU LIKE TO SPLIT?                            │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  ┌───────────────────────┐                                                 ││
│  │  │                       │                                                 ││
│  │  │    [EQUAL ICON]       │  SPLIT EQUALLY                                  ││
│  │  │                       │  ─────────────────────────────────────────────  ││
│  │  │                       │  Divide the total equally among all guests.     ││
│  │  │                       │  Total: $56.65 ÷ ? guests                       ││
│  │  │                       │                                                 ││
│  │  └───────────────────────┘                                                 ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  ┌───────────────────────┐                                                 ││
│  │  │                       │                                                 ││
│  │  │    [ITEMS ICON]       │  SPLIT BY ITEMS                                 ││
│  │  │                       │  ─────────────────────────────────────────────  ││
│  │  │                       │  Each guest pays for their own items.           ││
│  │  │                       │  "I'll pay for what I ordered"                  ││
│  │  │                       │                                                 ││
│  │  └───────────────────────┘                                                 ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  ┌───────────────────────┐                                                 ││
│  │  │                       │                                                 ││
│  │  │   [PAYMENT ICON]      │  SPLIT BY PAYMENT METHOD                        ││
│  │  │                       │  ─────────────────────────────────────────────  ││
│  │  │                       │  Pay different portions with different methods. ││
│  │  │                       │  "$30 cash + $26.65 card"                       ││
│  │  │                       │                                                 ││
│  │  └───────────────────────┘                                                 ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│                                                                                  │
│       ┌─────────────────────┐                                                   │
│       │       CANCEL        │                                                   │
│       └─────────────────────┘                                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Item Assignment UI

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [<]  SPLIT BY ITEMS                                          Table T1  $56.65 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  GUESTS                                                      [+ Add Guest]      │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                          │
│  │   Alice      │  │    Bob       │  │   Charlie    │                          │
│  │   ───────    │  │   ───────    │  │   ───────    │                          │
│  │   $26.72     │  │   $22.22     │  │    $7.71     │                          │
│  │              │  │              │  │              │                          │
│  │   ● ACTIVE   │  │              │  │              │                          │
│  └──────────────┘  └──────────────┘  └──────────────┘                          │
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ITEMS (Tap to assign to: Alice)                                                │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  ☐  1x Classic Burger                           $18.50        → Bob        ││
│  │      + Bacon (+$3.00)                                                       ││
│  │      + Jalapeño (+$0.50)                                                    ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  ☑  1x Grilled Chicken                          $23.00        → Alice      ││
│  │      + Extra Sauce (+$1.00)                                                 ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  ☐  2x Coca Cola                                 $6.00        [SHARED]     ││
│  │      Split: Alice, Bob, Charlie ($2.00 each)                                ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  ☐  1x Orange Juice                              $4.00        → Charlie    ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  Tax ($5.15) will be split proportionally among guests                          │
│                                                                                  │
│       ┌─────────────────────┐              ┌─────────────────────┐             │
│       │       CANCEL        │              │   PROCESS PAYMENTS  │             │
│       └─────────────────────┘              └─────────────────────┘             │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Edge Cases & Validation

### Rounding Handling

```typescript
/**
 * Rounding rules for bill splitting:
 *
 * 1. Equal Split:
 *    - Round down to 2 decimal places for all but last guest
 *    - Last guest pays the remainder
 *    - Example: $56.65 / 4 = $14.16, $14.16, $14.16, $14.17
 *
 * 2. Item Split:
 *    - Each item amount is exact
 *    - Shared items: round down, last guest gets remainder
 *    - Tax: proportional, round to 2 decimals, adjust last guest
 *
 * 3. Payment Method Split:
 *    - User enters amounts manually
 *    - Last payment auto-fills remaining
 *    - Validation ensures total matches exactly
 */
```

### Validation Rules

```typescript
interface SplitValidation {
  // Equal split
  minGuests: 2;
  maxGuests: 20;
  minAmountPerGuest: 0.01;

  // Item split
  allItemsMustBeAssigned: true;
  allowSharedItems: true;
  minGuestsForShare: 2;

  // Payment method split
  allowDuplicateMethods: true;  // e.g., two card payments
  minPaymentAmount: 0.01;
  maxPaymentMethods: 10;

  // General
  totalMustMatch: true;
  toleranceAmount: 0.01;  // Allow 1 cent variance for rounding
}
```

### Error Scenarios

```typescript
// Error handling for split operations
const SPLIT_ERRORS = {
  ITEMS_NOT_ASSIGNED: 'All items must be assigned to a guest before proceeding.',
  TOTAL_MISMATCH: 'Payment amounts do not equal the bill total.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  GUEST_ALREADY_PAID: 'This guest has already paid.',
  INVALID_AMOUNT: 'Please enter a valid payment amount.',
  NO_GUESTS: 'Please add at least 2 guests to split the bill.',
  INSUFFICIENT_FUNDS: 'Card declined: Insufficient funds.',
};
```

---

## Receipt Generation

### Split Receipt Format

```
┌─────────────────────────────────────┐
│        THE FOOD CORNER              │
│     123 Main Street, City           │
│     Tel: +1 (555) 123-4567          │
├─────────────────────────────────────┤
│                                     │
│  SPLIT PAYMENT RECEIPT              │
│  Order #ORD-20251231-0001           │
│  Table: T1                          │
│  Date: Dec 31, 2025 7:45 PM         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  GUEST: Alice                       │
│  ─────────────────────────────────  │
│                                     │
│  1x Grilled Chicken        $22.00   │
│    + Extra Sauce            $1.00   │
│  Share: 2x Coca Cola        $2.00   │
│  Tax                        $2.57   │
│  ─────────────────────────────────  │
│  PAID:                     $27.57   │
│  Method: Cash                       │
│  Received: $30.00                   │
│  Change: $2.43                      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Original Bill: $56.65              │
│  Split: 3 ways                      │
│  This Payment: $27.57               │
│                                     │
│  ─────────────────────────────────  │
│  Thank you for dining with us!      │
│                                     │
└─────────────────────────────────────┘
```

---

## Related Documents

- [Master Plan](./plan.md)
- [User Flow Documentation](./user-flow.md)
- [Wireframes](./wireframes.md)
- [Data Flow Architecture](./data-flow.md)
- [Kitchen Integration](./kitchen-integration.md)
- [Implementation Phases](./implementation-phases.md)
