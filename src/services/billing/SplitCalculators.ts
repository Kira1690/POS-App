/**
 * Split Calculators - Business logic for bill splitting
 *
 * Provides calculation services for:
 * - Equal split among guests
 * - Item-based split (assign items to guests)
 * - Payment method split (multiple payment methods)
 */

import {
  Bill,
  BillItem,
  BillSplit,
  GuestSplit,
  PaymentMethodSplit,
  EqualSplitResult,
  ItemSplitResult,
  PaymentSplitResult,
  AssignedItem,
  ExtendedPaymentMethod,
  generateGuestId,
  getGuestColor,
} from '@/types/billing.types';

// ============== EQUAL SPLIT CALCULATOR ==============

export class EqualSplitCalculator {
  /**
   * Calculate equal split amounts for given number of guests
   */
  calculate(
    totalAmount: number,
    taxAmount: number,
    tipAmount: number,
    guestCount: number
  ): EqualSplitResult {
    if (guestCount <= 0) {
      throw new Error('Guest count must be greater than 0');
    }

    // Calculate amounts per guest (round down to cents)
    const amountPerGuest = Math.floor((totalAmount * 100) / guestCount) / 100;
    const taxPerGuest = Math.floor((taxAmount * 100) / guestCount) / 100;
    const tipPerGuest = Math.floor((tipAmount * 100) / guestCount) / 100;

    // Calculate remainder (pennies that can't be divided evenly)
    const remainder = Math.round((totalAmount - amountPerGuest * guestCount) * 100) / 100;

    // Create guest splits
    const guests: GuestSplit[] = [];
    for (let i = 0; i < guestCount; i++) {
      // First guest pays the remainder
      const guestTotal = i === 0 ? amountPerGuest + remainder : amountPerGuest;

      guests.push({
        id: generateGuestId(),
        name: `Guest ${i + 1}`,
        color: getGuestColor(i),
        assignedItems: [],
        sharedItemsAmount: 0,
        subtotal: amountPerGuest - taxPerGuest - tipPerGuest,
        taxAmount: taxPerGuest,
        tipAmount: tipPerGuest,
        total: guestTotal,
        paymentStatus: 'pending',
      });
    }

    return {
      guestCount,
      amountPerGuest,
      remainder,
      guests,
    };
  }

  /**
   * Recalculate with custom tip distribution
   */
  recalculateWithTip(
    result: EqualSplitResult,
    totalTip: number
  ): EqualSplitResult {
    const tipPerGuest = Math.floor((totalTip * 100) / result.guestCount) / 100;
    const tipRemainder = Math.round((totalTip - tipPerGuest * result.guestCount) * 100) / 100;

    const updatedGuests = result.guests.map((guest, index) => ({
      ...guest,
      tipAmount: index === 0 ? tipPerGuest + tipRemainder : tipPerGuest,
      total: guest.subtotal + guest.taxAmount + (index === 0 ? tipPerGuest + tipRemainder : tipPerGuest),
    }));

    return {
      ...result,
      guests: updatedGuests,
    };
  }
}

// ============== ITEM SPLIT CALCULATOR ==============

export class ItemSplitCalculator {
  /**
   * Initialize item split with guests
   */
  initialize(
    items: BillItem[],
    guestCount: number,
    taxRate: number
  ): ItemSplitResult {
    const guests: GuestSplit[] = [];

    for (let i = 0; i < guestCount; i++) {
      guests.push({
        id: generateGuestId(),
        name: `Guest ${i + 1}`,
        color: getGuestColor(i),
        assignedItems: [],
        sharedItemsAmount: 0,
        subtotal: 0,
        taxAmount: 0,
        tipAmount: 0,
        total: 0,
        paymentStatus: 'pending',
      });
    }

    return {
      guests,
      unassignedItems: items.map(item => item.id),
      totalAssigned: 0,
      totalUnassigned: items.reduce((sum, item) => sum + item.itemTotal, 0),
      isValid: false,
      validationErrors: ['All items must be assigned to guests'],
    };
  }

  /**
   * Assign an item to a guest
   */
  assignItemToGuest(
    result: ItemSplitResult,
    items: BillItem[],
    itemId: string,
    guestId: string,
    taxRate: number
  ): ItemSplitResult {
    const item = items.find(i => i.id === itemId);
    if (!item) return result;

    const updatedGuests = result.guests.map(guest => {
      if (guest.id === guestId) {
        // Check if item is already assigned to this guest
        const existingIndex = guest.assignedItems.findIndex(ai => ai.itemId === itemId);

        let updatedAssignedItems: AssignedItem[];
        if (existingIndex >= 0) {
          // Item already assigned, don't add again
          return guest;
        } else {
          updatedAssignedItems = [
            ...guest.assignedItems,
            {
              itemId: item.id,
              itemName: item.name,
              quantity: item.quantity,
              amount: item.itemTotal,
              isShared: false,
            },
          ];
        }

        const subtotal = updatedAssignedItems.reduce((sum, ai) => sum + ai.amount, 0);
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

        return {
          ...guest,
          assignedItems: updatedAssignedItems,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount + guest.tipAmount,
        };
      }
      return guest;
    });

    // Update unassigned items
    const assignedItemIds = new Set<string>();
    updatedGuests.forEach(guest => {
      guest.assignedItems.forEach(ai => assignedItemIds.add(ai.itemId));
    });

    const unassignedItems = items
      .filter(item => !assignedItemIds.has(item.id))
      .map(item => item.id);

    const totalAssigned = updatedGuests.reduce((sum, guest) => sum + guest.subtotal, 0);
    const totalUnassigned = items
      .filter(item => !assignedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.itemTotal, 0);

    const isValid = unassignedItems.length === 0;
    const validationErrors: string[] = [];
    if (!isValid) {
      validationErrors.push(`${unassignedItems.length} item(s) not assigned`);
    }

    return {
      guests: updatedGuests,
      unassignedItems,
      totalAssigned,
      totalUnassigned,
      isValid,
      validationErrors,
    };
  }

  /**
   * Unassign an item from a guest
   */
  unassignItem(
    result: ItemSplitResult,
    items: BillItem[],
    itemId: string,
    guestId: string,
    taxRate: number
  ): ItemSplitResult {
    const updatedGuests = result.guests.map(guest => {
      if (guest.id === guestId) {
        const updatedAssignedItems = guest.assignedItems.filter(ai => ai.itemId !== itemId);
        const subtotal = updatedAssignedItems.reduce((sum, ai) => sum + ai.amount, 0);
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

        return {
          ...guest,
          assignedItems: updatedAssignedItems,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount + guest.tipAmount,
        };
      }
      return guest;
    });

    // Recalculate unassigned
    const assignedItemIds = new Set<string>();
    updatedGuests.forEach(guest => {
      guest.assignedItems.forEach(ai => assignedItemIds.add(ai.itemId));
    });

    const unassignedItems = items
      .filter(item => !assignedItemIds.has(item.id))
      .map(item => item.id);

    const totalAssigned = updatedGuests.reduce((sum, guest) => sum + guest.subtotal, 0);
    const totalUnassigned = items
      .filter(item => !assignedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.itemTotal, 0);

    return {
      guests: updatedGuests,
      unassignedItems,
      totalAssigned,
      totalUnassigned,
      isValid: unassignedItems.length === 0,
      validationErrors: unassignedItems.length > 0
        ? [`${unassignedItems.length} item(s) not assigned`]
        : [],
    };
  }

  /**
   * Share an item between multiple guests
   */
  shareItemBetweenGuests(
    result: ItemSplitResult,
    items: BillItem[],
    itemId: string,
    guestIds: string[],
    taxRate: number
  ): ItemSplitResult {
    const item = items.find(i => i.id === itemId);
    if (!item || guestIds.length === 0) return result;

    const sharePercentage = 100 / guestIds.length;
    const shareAmount = item.itemTotal / guestIds.length;

    const updatedGuests = result.guests.map(guest => {
      if (guestIds.includes(guest.id)) {
        // Remove any existing assignment for this item
        const filteredItems = guest.assignedItems.filter(ai => ai.itemId !== itemId);

        const updatedAssignedItems = [
          ...filteredItems,
          {
            itemId: item.id,
            itemName: item.name,
            quantity: item.quantity,
            amount: shareAmount,
            isShared: true,
            sharedWith: guestIds.filter(id => id !== guest.id),
            sharePercentage,
          },
        ];

        const subtotal = updatedAssignedItems.reduce((sum, ai) => sum + ai.amount, 0);
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

        return {
          ...guest,
          assignedItems: updatedAssignedItems,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount + guest.tipAmount,
        };
      } else {
        // Remove from non-selected guests
        const filteredItems = guest.assignedItems.filter(ai => ai.itemId !== itemId);
        const subtotal = filteredItems.reduce((sum, ai) => sum + ai.amount, 0);
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

        return {
          ...guest,
          assignedItems: filteredItems,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount + guest.tipAmount,
        };
      }
    });

    // Recalculate unassigned
    const assignedItemIds = new Set<string>();
    updatedGuests.forEach(guest => {
      guest.assignedItems.forEach(ai => assignedItemIds.add(ai.itemId));
    });

    const unassignedItems = items
      .filter(item => !assignedItemIds.has(item.id))
      .map(item => item.id);

    const totalAssigned = updatedGuests.reduce((sum, guest) => sum + guest.subtotal, 0);
    const totalUnassigned = items
      .filter(item => !assignedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.itemTotal, 0);

    return {
      guests: updatedGuests,
      unassignedItems,
      totalAssigned,
      totalUnassigned,
      isValid: unassignedItems.length === 0,
      validationErrors: unassignedItems.length > 0
        ? [`${unassignedItems.length} item(s) not assigned`]
        : [],
    };
  }

  /**
   * Add tip to item split
   */
  addTipToGuests(
    result: ItemSplitResult,
    totalTip: number,
    distributeEqually: boolean = true
  ): ItemSplitResult {
    if (distributeEqually) {
      const tipPerGuest = Math.floor((totalTip * 100) / result.guests.length) / 100;
      const tipRemainder = Math.round((totalTip - tipPerGuest * result.guests.length) * 100) / 100;

      const updatedGuests = result.guests.map((guest, index) => {
        const guestTip = index === 0 ? tipPerGuest + tipRemainder : tipPerGuest;
        return {
          ...guest,
          tipAmount: guestTip,
          total: guest.subtotal + guest.taxAmount + guestTip,
        };
      });

      return { ...result, guests: updatedGuests };
    } else {
      // Distribute based on subtotal proportion
      const totalSubtotal = result.guests.reduce((sum, g) => sum + g.subtotal, 0);

      const updatedGuests = result.guests.map(guest => {
        const proportion = totalSubtotal > 0 ? guest.subtotal / totalSubtotal : 1 / result.guests.length;
        const guestTip = Math.round(totalTip * proportion * 100) / 100;
        return {
          ...guest,
          tipAmount: guestTip,
          total: guest.subtotal + guest.taxAmount + guestTip,
        };
      });

      return { ...result, guests: updatedGuests };
    }
  }
}

// ============== PAYMENT SPLIT CALCULATOR ==============

export class PaymentSplitCalculator {
  /**
   * Initialize payment split
   */
  initialize(totalAmount: number): PaymentSplitResult {
    return {
      payments: [],
      totalAllocated: 0,
      remaining: totalAmount,
      isValid: false,
      validationErrors: ['Total amount must be allocated to payments'],
    };
  }

  /**
   * Add a payment method
   */
  addPayment(
    result: PaymentSplitResult,
    totalAmount: number,
    method: ExtendedPaymentMethod,
    amount: number
  ): PaymentSplitResult {
    const newPayment: PaymentMethodSplit = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method,
      amount,
      status: 'pending',
    };

    const updatedPayments = [...result.payments, newPayment];
    return this.recalculate(updatedPayments, totalAmount);
  }

  /**
   * Update a payment amount
   */
  updatePaymentAmount(
    result: PaymentSplitResult,
    totalAmount: number,
    paymentId: string,
    amount: number
  ): PaymentSplitResult {
    const updatedPayments = result.payments.map(p =>
      p.id === paymentId ? { ...p, amount } : p
    );
    return this.recalculate(updatedPayments, totalAmount);
  }

  /**
   * Remove a payment
   */
  removePayment(
    result: PaymentSplitResult,
    totalAmount: number,
    paymentId: string
  ): PaymentSplitResult {
    const updatedPayments = result.payments.filter(p => p.id !== paymentId);
    return this.recalculate(updatedPayments, totalAmount);
  }

  /**
   * Set remaining to last payment
   */
  setRemainingToPayment(
    result: PaymentSplitResult,
    totalAmount: number,
    paymentId: string
  ): PaymentSplitResult {
    const otherPaymentsTotal = result.payments
      .filter(p => p.id !== paymentId)
      .reduce((sum, p) => sum + p.amount, 0);

    const remaining = Math.max(0, totalAmount - otherPaymentsTotal);

    const updatedPayments = result.payments.map(p =>
      p.id === paymentId ? { ...p, amount: remaining } : p
    );

    return this.recalculate(updatedPayments, totalAmount);
  }

  /**
   * Split equally among all payment methods
   */
  splitEqually(
    result: PaymentSplitResult,
    totalAmount: number
  ): PaymentSplitResult {
    if (result.payments.length === 0) return result;

    const amountPerPayment = Math.floor((totalAmount * 100) / result.payments.length) / 100;
    const remainder = Math.round((totalAmount - amountPerPayment * result.payments.length) * 100) / 100;

    const updatedPayments = result.payments.map((p, index) => ({
      ...p,
      amount: index === 0 ? amountPerPayment + remainder : amountPerPayment,
    }));

    return this.recalculate(updatedPayments, totalAmount);
  }

  /**
   * Recalculate totals
   */
  private recalculate(
    payments: PaymentMethodSplit[],
    totalAmount: number
  ): PaymentSplitResult {
    const totalAllocated = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.round((totalAmount - totalAllocated) * 100) / 100;

    const validationErrors: string[] = [];

    if (remaining > 0.01) {
      validationErrors.push(`$${remaining.toFixed(2)} remaining to allocate`);
    }

    if (remaining < -0.01) {
      validationErrors.push(`$${Math.abs(remaining).toFixed(2)} over allocated`);
    }

    payments.forEach((payment, index) => {
      if (payment.amount <= 0) {
        validationErrors.push(`Payment ${index + 1} must have a positive amount`);
      }
    });

    return {
      payments,
      totalAllocated,
      remaining,
      isValid: Math.abs(remaining) <= 0.01 && validationErrors.length === 0,
      validationErrors,
    };
  }
}

// ============== SINGLETON INSTANCES ==============

export const equalSplitCalculator = new EqualSplitCalculator();
export const itemSplitCalculator = new ItemSplitCalculator();
export const paymentSplitCalculator = new PaymentSplitCalculator();
