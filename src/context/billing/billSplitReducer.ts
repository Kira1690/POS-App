/**
 * Bill Split Reducer - State management for bill splitting functionality
 * Handles equal splits, item-based splits, and multi-payment splits
 */

import {
  BillSplit,
  GuestSplit,
  PaymentMethodSplit,
  AssignedItem,
  SplitType,
  calculateEqualSplit,
} from '@/types/billing.types';
import { ExtendedOrder, ExtendedOrderItem } from '@/types/order-extended.types';

// ============== STATE INTERFACE ==============

export interface BillSplitState {
  // Order data
  order: ExtendedOrder | null;
  items: ExtendedOrderItem[];

  // Split configuration
  splitType: SplitType;
  guestCount: number;
  currentSplit: BillSplit | null;

  // Guest splits (for equal and item-based)
  guestSplits: GuestSplit[];

  // Payment splits (for multi-payment)
  paymentSplits: PaymentMethodSplit[];

  // Item assignments (for item-based splits)
  itemAssignments: Map<string, number[]>; // itemId -> guestIndices

  // Totals
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  total: number;
  remainingAmount: number;

  // Payment progress
  paidAmount: number;
  paidGuests: number[];
  completedPayments: string[];

  // UI State
  selectedGuestIndex: number | null;
  isProcessing: boolean;
  error: string | null;
}

// ============== INITIAL STATE ==============

export const initialBillSplitState: BillSplitState = {
  order: null,
  items: [],

  splitType: 'equal',
  guestCount: 1,
  currentSplit: null,

  guestSplits: [],
  paymentSplits: [],
  itemAssignments: new Map(),

  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  tipAmount: 0,
  total: 0,
  remainingAmount: 0,

  paidAmount: 0,
  paidGuests: [],
  completedPayments: [],

  selectedGuestIndex: null,
  isProcessing: false,
  error: null,
};

// ============== ACTION TYPES ==============

export type BillSplitAction =
  // Order actions
  | { type: 'SET_ORDER'; payload: { order: ExtendedOrder; items: ExtendedOrderItem[] } }
  | { type: 'CLEAR_ORDER' }

  // Split configuration
  | { type: 'SET_SPLIT_TYPE'; payload: SplitType }
  | { type: 'SET_GUEST_COUNT'; payload: number }
  | { type: 'SET_TIP_AMOUNT'; payload: number }
  | { type: 'SET_TIP_PERCENTAGE'; payload: number }

  // Equal split actions
  | { type: 'CALCULATE_EQUAL_SPLITS' }

  // Item split actions
  | { type: 'ASSIGN_ITEM_TO_GUEST'; payload: { itemId: string; guestIndex: number } }
  | { type: 'UNASSIGN_ITEM_FROM_GUEST'; payload: { itemId: string; guestIndex: number } }
  | { type: 'ASSIGN_ALL_ITEMS_TO_GUEST'; payload: number }
  | { type: 'CLEAR_GUEST_ITEMS'; payload: number }
  | { type: 'SPLIT_ITEM_EQUALLY'; payload: string }
  | { type: 'CALCULATE_ITEM_SPLITS' }

  // Payment split actions
  | { type: 'ADD_PAYMENT_SPLIT'; payload: PaymentMethodSplit }
  | { type: 'UPDATE_PAYMENT_SPLIT'; payload: { index: number; split: Partial<PaymentMethodSplit> } }
  | { type: 'REMOVE_PAYMENT_SPLIT'; payload: number }
  | { type: 'CALCULATE_PAYMENT_SPLITS' }

  // Payment progress
  | { type: 'MARK_GUEST_PAID'; payload: number }
  | { type: 'UNMARK_GUEST_PAID'; payload: number }
  | { type: 'ADD_COMPLETED_PAYMENT'; payload: string }
  | { type: 'UPDATE_PAID_AMOUNT'; payload: number }

  // UI state
  | { type: 'SELECT_GUEST'; payload: number | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_SPLIT' };

// ============== HELPER FUNCTIONS ==============

// Default tax rate should match PaymentReducer default (8.25%)
const DEFAULT_TAX_RATE = 0.0825;

const calculateTotals = (
  items: ExtendedOrderItem[],
  taxRate: number = DEFAULT_TAX_RATE,
  discountAmount: number = 0
) => {
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount;

  return { subtotal, taxAmount, total };
};

const createEmptyGuestSplits = (
  guestCount: number,
  _orderId: string
): GuestSplit[] => {
  return Array.from({ length: guestCount }, (_, index) => ({
    id: `guest_${index}_${Date.now()}`,
    name: `Guest ${index + 1}`,
    guestIndex: index,
    guestName: `Guest ${index + 1}`,
    items: [],
    assignedItems: [],
    sharedItemsAmount: 0,
    subtotal: 0,
    taxAmount: 0,
    tipAmount: 0,
    total: 0,
    paymentStatus: 'pending' as const,
    isPaid: false,
  }));
};

const calculateEqualGuestSplits = (
  guestCount: number,
  subtotal: number,
  taxAmount: number,
  tipAmount: number,
  total: number,
  _orderId: string
): GuestSplit[] => {
  const perPersonSubtotal = subtotal / guestCount;
  const perPersonTax = taxAmount / guestCount;
  const perPersonTip = tipAmount / guestCount;
  const perPersonTotal = total / guestCount;

  return Array.from({ length: guestCount }, (_, index) => ({
    id: `guest_${index}_${Date.now()}`,
    name: `Guest ${index + 1}`,
    guestIndex: index,
    guestName: `Guest ${index + 1}`,
    items: [],
    assignedItems: [],
    sharedItemsAmount: 0,
    subtotal: Math.round(perPersonSubtotal * 100) / 100,
    taxAmount: Math.round(perPersonTax * 100) / 100,
    tipAmount: Math.round(perPersonTip * 100) / 100,
    total: Math.round(perPersonTotal * 100) / 100,
    paymentStatus: 'pending' as const,
    isPaid: false,
  }));
};

const calculateItemGuestSplits = (
  items: ExtendedOrderItem[],
  itemAssignments: Map<string, number[]>,
  guestCount: number,
  taxRate: number,
  tipAmount: number
): GuestSplit[] => {
  const splits: GuestSplit[] = createEmptyGuestSplits(guestCount, '');

  items.forEach((item) => {
    const guestIndices = itemAssignments.get(item.id) || [];

    if (guestIndices.length === 0) {
      // Unassigned items go to first guest by default
      splits[0].items?.push({
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        price: item.itemTotal,
        guestIndex: 0,
      });
      splits[0].subtotal += item.itemTotal;
    } else if (guestIndices.length === 1) {
      // Single assignment
      const guestIndex = guestIndices[0];
      splits[guestIndex].items?.push({
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        price: item.itemTotal,
        guestIndex,
      });
      splits[guestIndex].subtotal += item.itemTotal;
    } else {
      // Split among multiple guests
      const splitPrice = item.itemTotal / guestIndices.length;
      const splitQuantity = item.quantity / guestIndices.length;

      guestIndices.forEach((guestIndex) => {
        splits[guestIndex].items?.push({
          itemId: item.id,
          itemName: item.name,
          quantity: splitQuantity,
          price: splitPrice,
          guestIndex,
        });
        splits[guestIndex].subtotal += splitPrice;
      });
    }
  });

  // Calculate tax and tip for each guest
  const totalSubtotal = splits.reduce((sum, s) => sum + s.subtotal, 0);
  splits.forEach((split) => {
    const ratio = totalSubtotal > 0 ? split.subtotal / totalSubtotal : 1 / guestCount;
    split.taxAmount = Math.round(split.subtotal * taxRate * 100) / 100;
    split.tipAmount = Math.round(tipAmount * ratio * 100) / 100;
    split.total = Math.round((split.subtotal + split.taxAmount + split.tipAmount) * 100) / 100;
  });

  return splits;
};

// ============== REDUCER ==============

export const billSplitReducer = (
  state: BillSplitState,
  action: BillSplitAction
): BillSplitState => {
  switch (action.type) {
    case 'SET_ORDER': {
      const { order, items } = action.payload;
      const { subtotal, taxAmount, total } = calculateTotals(items);

      return {
        ...state,
        order,
        items,
        subtotal,
        taxAmount,
        discountAmount: 0,
        total,
        remainingAmount: total,
        guestSplits: createEmptyGuestSplits(state.guestCount, order.id),
        itemAssignments: new Map(),
        paidAmount: 0,
        paidGuests: [],
        error: null,
      };
    }

    case 'CLEAR_ORDER':
      return {
        ...initialBillSplitState,
      };

    case 'SET_SPLIT_TYPE':
      return {
        ...state,
        splitType: action.payload,
        itemAssignments: new Map(),
        paymentSplits: [],
        paidGuests: [],
        paidAmount: 0,
      };

    case 'SET_GUEST_COUNT': {
      const guestCount = Math.max(1, action.payload);
      const guestSplits = state.order
        ? createEmptyGuestSplits(guestCount, state.order.id)
        : [];

      return {
        ...state,
        guestCount,
        guestSplits,
        itemAssignments: new Map(),
        paidGuests: [],
        paidAmount: 0,
      };
    }

    case 'SET_TIP_AMOUNT': {
      const tipAmount = Math.max(0, action.payload);
      const total = state.subtotal - state.discountAmount + state.taxAmount + tipAmount;

      return {
        ...state,
        tipAmount,
        total,
        remainingAmount: total - state.paidAmount,
      };
    }

    case 'SET_TIP_PERCENTAGE': {
      const tipAmount = (state.subtotal - state.discountAmount) * (action.payload / 100);
      const total = state.subtotal - state.discountAmount + state.taxAmount + tipAmount;

      return {
        ...state,
        tipAmount: Math.round(tipAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        remainingAmount: Math.round((total - state.paidAmount) * 100) / 100,
      };
    }

    case 'CALCULATE_EQUAL_SPLITS': {
      const guestSplits = calculateEqualGuestSplits(
        state.guestCount,
        state.subtotal,
        state.taxAmount,
        state.tipAmount,
        state.total,
        state.order?.id || ''
      );

      // Preserve paid status
      guestSplits.forEach((split, index) => {
        split.isPaid = state.paidGuests.includes(index);
      });

      return {
        ...state,
        guestSplits,
      };
    }

    case 'ASSIGN_ITEM_TO_GUEST': {
      const { itemId, guestIndex } = action.payload;
      const newAssignments = new Map(state.itemAssignments);
      const current = newAssignments.get(itemId) || [];

      if (!current.includes(guestIndex)) {
        newAssignments.set(itemId, [...current, guestIndex]);
      }

      return {
        ...state,
        itemAssignments: newAssignments,
      };
    }

    case 'UNASSIGN_ITEM_FROM_GUEST': {
      const { itemId, guestIndex } = action.payload;
      const newAssignments = new Map(state.itemAssignments);
      const current = newAssignments.get(itemId) || [];

      newAssignments.set(
        itemId,
        current.filter((i) => i !== guestIndex)
      );

      return {
        ...state,
        itemAssignments: newAssignments,
      };
    }

    case 'ASSIGN_ALL_ITEMS_TO_GUEST': {
      const guestIndex = action.payload;
      const newAssignments = new Map<string, number[]>();

      state.items.forEach((item) => {
        newAssignments.set(item.id, [guestIndex]);
      });

      return {
        ...state,
        itemAssignments: newAssignments,
      };
    }

    case 'CLEAR_GUEST_ITEMS': {
      const guestIndex = action.payload;
      const newAssignments = new Map(state.itemAssignments);

      newAssignments.forEach((guests, itemId) => {
        newAssignments.set(
          itemId,
          guests.filter((i) => i !== guestIndex)
        );
      });

      return {
        ...state,
        itemAssignments: newAssignments,
      };
    }

    case 'SPLIT_ITEM_EQUALLY': {
      const itemId = action.payload;
      const newAssignments = new Map(state.itemAssignments);
      const allGuests = Array.from({ length: state.guestCount }, (_, i) => i);

      newAssignments.set(itemId, allGuests);

      return {
        ...state,
        itemAssignments: newAssignments,
      };
    }

    case 'CALCULATE_ITEM_SPLITS': {
      const guestSplits = calculateItemGuestSplits(
        state.items,
        state.itemAssignments,
        state.guestCount,
        DEFAULT_TAX_RATE, // Use consistent tax rate
        state.tipAmount
      );

      // Preserve paid status
      guestSplits.forEach((split, index) => {
        split.isPaid = state.paidGuests.includes(index);
      });

      return {
        ...state,
        guestSplits,
      };
    }

    case 'ADD_PAYMENT_SPLIT': {
      const newSplits = [...state.paymentSplits, action.payload];
      const totalSplit = newSplits.reduce((sum, s) => sum + s.amount, 0);

      return {
        ...state,
        paymentSplits: newSplits,
        remainingAmount: state.total - totalSplit,
      };
    }

    case 'UPDATE_PAYMENT_SPLIT': {
      const { index, split } = action.payload;
      const newSplits = [...state.paymentSplits];
      newSplits[index] = { ...newSplits[index], ...split };

      const totalSplit = newSplits.reduce((sum, s) => sum + s.amount, 0);

      return {
        ...state,
        paymentSplits: newSplits,
        remainingAmount: state.total - totalSplit,
      };
    }

    case 'REMOVE_PAYMENT_SPLIT': {
      const newSplits = state.paymentSplits.filter((_, i) => i !== action.payload);
      const totalSplit = newSplits.reduce((sum, s) => sum + s.amount, 0);

      return {
        ...state,
        paymentSplits: newSplits,
        remainingAmount: state.total - totalSplit,
      };
    }

    case 'CALCULATE_PAYMENT_SPLITS': {
      const totalSplit = state.paymentSplits.reduce((sum, s) => sum + s.amount, 0);

      return {
        ...state,
        remainingAmount: state.total - totalSplit,
      };
    }

    case 'MARK_GUEST_PAID': {
      const guestIndex = action.payload;
      if (state.paidGuests.includes(guestIndex)) return state;

      const paidGuests = [...state.paidGuests, guestIndex];
      const guestSplits = state.guestSplits.map((split, i) =>
        i === guestIndex ? { ...split, isPaid: true } : split
      );
      const paidAmount = guestSplits
        .filter((s) => s.isPaid)
        .reduce((sum, s) => sum + s.total, 0);

      return {
        ...state,
        paidGuests,
        guestSplits,
        paidAmount,
        remainingAmount: state.total - paidAmount,
      };
    }

    case 'UNMARK_GUEST_PAID': {
      const guestIndex = action.payload;
      const paidGuests = state.paidGuests.filter((i) => i !== guestIndex);
      const guestSplits = state.guestSplits.map((split, i) =>
        i === guestIndex ? { ...split, isPaid: false } : split
      );
      const paidAmount = guestSplits
        .filter((s) => s.isPaid)
        .reduce((sum, s) => sum + s.total, 0);

      return {
        ...state,
        paidGuests,
        guestSplits,
        paidAmount,
        remainingAmount: state.total - paidAmount,
      };
    }

    case 'ADD_COMPLETED_PAYMENT':
      return {
        ...state,
        completedPayments: [...state.completedPayments, action.payload],
      };

    case 'UPDATE_PAID_AMOUNT':
      return {
        ...state,
        paidAmount: action.payload,
        remainingAmount: state.total - action.payload,
      };

    case 'SELECT_GUEST':
      return {
        ...state,
        selectedGuestIndex: action.payload,
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
      };

    case 'RESET_SPLIT':
      return {
        ...state,
        splitType: 'equal',
        guestSplits: state.order
          ? createEmptyGuestSplits(state.guestCount, state.order.id)
          : [],
        paymentSplits: [],
        itemAssignments: new Map(),
        paidGuests: [],
        paidAmount: 0,
        remainingAmount: state.total,
        selectedGuestIndex: null,
        error: null,
      };

    default:
      return state;
  }
};
