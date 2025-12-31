/**
 * BillSplitContext - State management for bill splitting
 * Provides equal splits, item-based splits, and multi-payment functionality
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  billSplitReducer,
  initialBillSplitState,
  BillSplitState,
  BillSplitAction,
} from './billSplitReducer';
import { SplitType, GuestSplit, PaymentMethodSplit } from '@/types/billing.types';
import { ExtendedOrder, ExtendedOrderItem } from '@/types/order-extended.types';
import { paymentStorageService } from '@/services/storage';

// ============== CONTEXT VALUE TYPE ==============

export interface BillSplitContextValue {
  // State
  state: BillSplitState;

  // Order actions
  setOrder: (order: ExtendedOrder, items: ExtendedOrderItem[]) => void;
  clearOrder: () => void;

  // Split configuration
  setSplitType: (type: SplitType) => void;
  setGuestCount: (count: number) => void;
  setTipAmount: (amount: number) => void;
  setTipPercentage: (percentage: number) => void;

  // Equal split
  calculateEqualSplits: () => void;

  // Item split
  assignItemToGuest: (itemId: string, guestIndex: number) => void;
  unassignItemFromGuest: (itemId: string, guestIndex: number) => void;
  assignAllItemsToGuest: (guestIndex: number) => void;
  clearGuestItems: (guestIndex: number) => void;
  splitItemEqually: (itemId: string) => void;
  calculateItemSplits: () => void;

  // Payment split
  addPaymentSplit: (split: PaymentMethodSplit) => void;
  updatePaymentSplit: (index: number, split: Partial<PaymentMethodSplit>) => void;
  removePaymentSplit: (index: number) => void;

  // Payment progress
  markGuestPaid: (guestIndex: number) => Promise<void>;
  unmarkGuestPaid: (guestIndex: number) => void;

  // UI
  selectGuest: (guestIndex: number | null) => void;
  resetSplit: () => void;

  // Computed values
  isFullyPaid: boolean;
  canProceedToPayment: boolean;
  unpaidGuests: GuestSplit[];
  paidGuests: GuestSplit[];
}

// ============== CONTEXT ==============

const BillSplitContext = createContext<BillSplitContextValue | undefined>(undefined);

// ============== PROVIDER ==============

interface BillSplitProviderProps {
  children: ReactNode;
}

export const BillSplitProvider: React.FC<BillSplitProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(billSplitReducer, initialBillSplitState);

  // Order actions
  const setOrder = useCallback((order: ExtendedOrder, items: ExtendedOrderItem[]) => {
    dispatch({ type: 'SET_ORDER', payload: { order, items } });
  }, []);

  const clearOrder = useCallback(() => {
    dispatch({ type: 'CLEAR_ORDER' });
  }, []);

  // Split configuration
  const setSplitType = useCallback((type: SplitType) => {
    dispatch({ type: 'SET_SPLIT_TYPE', payload: type });
  }, []);

  const setGuestCount = useCallback((count: number) => {
    dispatch({ type: 'SET_GUEST_COUNT', payload: count });
  }, []);

  const setTipAmount = useCallback((amount: number) => {
    dispatch({ type: 'SET_TIP_AMOUNT', payload: amount });
  }, []);

  const setTipPercentage = useCallback((percentage: number) => {
    dispatch({ type: 'SET_TIP_PERCENTAGE', payload: percentage });
  }, []);

  // Equal split
  const calculateEqualSplits = useCallback(() => {
    dispatch({ type: 'CALCULATE_EQUAL_SPLITS' });
  }, []);

  // Item split
  const assignItemToGuest = useCallback((itemId: string, guestIndex: number) => {
    dispatch({ type: 'ASSIGN_ITEM_TO_GUEST', payload: { itemId, guestIndex } });
  }, []);

  const unassignItemFromGuest = useCallback((itemId: string, guestIndex: number) => {
    dispatch({ type: 'UNASSIGN_ITEM_FROM_GUEST', payload: { itemId, guestIndex } });
  }, []);

  const assignAllItemsToGuest = useCallback((guestIndex: number) => {
    dispatch({ type: 'ASSIGN_ALL_ITEMS_TO_GUEST', payload: guestIndex });
  }, []);

  const clearGuestItems = useCallback((guestIndex: number) => {
    dispatch({ type: 'CLEAR_GUEST_ITEMS', payload: guestIndex });
  }, []);

  const splitItemEqually = useCallback((itemId: string) => {
    dispatch({ type: 'SPLIT_ITEM_EQUALLY', payload: itemId });
  }, []);

  const calculateItemSplits = useCallback(() => {
    dispatch({ type: 'CALCULATE_ITEM_SPLITS' });
  }, []);

  // Payment split
  const addPaymentSplit = useCallback((split: PaymentMethodSplit) => {
    dispatch({ type: 'ADD_PAYMENT_SPLIT', payload: split });
  }, []);

  const updatePaymentSplit = useCallback(
    (index: number, split: Partial<PaymentMethodSplit>) => {
      dispatch({ type: 'UPDATE_PAYMENT_SPLIT', payload: { index, split } });
    },
    []
  );

  const removePaymentSplit = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_PAYMENT_SPLIT', payload: index });
  }, []);

  // Payment progress
  const markGuestPaid = useCallback(
    async (guestIndex: number) => {
      try {
        dispatch({ type: 'SET_PROCESSING', payload: true });

        // Save payment record
        if (state.order) {
          const guestSplit = state.guestSplits[guestIndex];
          if (guestSplit) {
            const paymentId = `pay_${Date.now()}_${guestIndex}`;
            await paymentStorageService.savePayment({
              id: paymentId,
              orderId: state.order.id,
              amount: guestSplit.total,
              method: 'cash', // Default, can be customized
              status: 'completed',
              processedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            dispatch({ type: 'ADD_COMPLETED_PAYMENT', payload: paymentId });
          }
        }

        dispatch({ type: 'MARK_GUEST_PAID', payload: guestIndex });
        dispatch({ type: 'SET_PROCESSING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    [state.order, state.guestSplits]
  );

  const unmarkGuestPaid = useCallback((guestIndex: number) => {
    dispatch({ type: 'UNMARK_GUEST_PAID', payload: guestIndex });
  }, []);

  // UI
  const selectGuest = useCallback((guestIndex: number | null) => {
    dispatch({ type: 'SELECT_GUEST', payload: guestIndex });
  }, []);

  const resetSplit = useCallback(() => {
    dispatch({ type: 'RESET_SPLIT' });
  }, []);

  // Computed values
  const isFullyPaid = useMemo(
    () => state.remainingAmount <= 0 && state.total > 0,
    [state.remainingAmount, state.total]
  );

  const canProceedToPayment = useMemo(() => {
    if (state.splitType === 'equal') {
      return state.guestSplits.length > 0;
    }
    if (state.splitType === 'by_items') {
      // All items must be assigned
      return (
        state.items.length > 0 &&
        state.items.every((item) => {
          const assignments = state.itemAssignments.get(item.id);
          return assignments && assignments.length > 0;
        })
      );
    }
    if (state.splitType === 'by_payment_method') {
      // All payment splits must cover the total
      return state.remainingAmount <= 0;
    }
    return false;
  }, [state.splitType, state.guestSplits, state.items, state.itemAssignments, state.remainingAmount]);

  const unpaidGuests = useMemo(
    () => state.guestSplits.filter((g) => !g.isPaid),
    [state.guestSplits]
  );

  const paidGuests = useMemo(
    () => state.guestSplits.filter((g) => g.isPaid),
    [state.guestSplits]
  );

  // Context value
  const contextValue: BillSplitContextValue = {
    state,
    setOrder,
    clearOrder,
    setSplitType,
    setGuestCount,
    setTipAmount,
    setTipPercentage,
    calculateEqualSplits,
    assignItemToGuest,
    unassignItemFromGuest,
    assignAllItemsToGuest,
    clearGuestItems,
    splitItemEqually,
    calculateItemSplits,
    addPaymentSplit,
    updatePaymentSplit,
    removePaymentSplit,
    markGuestPaid,
    unmarkGuestPaid,
    selectGuest,
    resetSplit,
    isFullyPaid,
    canProceedToPayment,
    unpaidGuests,
    paidGuests,
  };

  return (
    <BillSplitContext.Provider value={contextValue}>
      {children}
    </BillSplitContext.Provider>
  );
};

// ============== HOOKS ==============

export const useBillSplit = (): BillSplitContextValue => {
  const context = useContext(BillSplitContext);
  if (context === undefined) {
    throw new Error('useBillSplit must be used within a BillSplitProvider');
  }
  return context;
};

// Convenience hooks
export const useSplitConfiguration = () => {
  const { state, setSplitType, setGuestCount, setTipAmount, setTipPercentage } = useBillSplit();

  return {
    splitType: state.splitType,
    guestCount: state.guestCount,
    tipAmount: state.tipAmount,
    subtotal: state.subtotal,
    taxAmount: state.taxAmount,
    total: state.total,
    setSplitType,
    setGuestCount,
    setTipAmount,
    setTipPercentage,
  };
};

export const useGuestSplits = () => {
  const {
    state,
    calculateEqualSplits,
    calculateItemSplits,
    markGuestPaid,
    unmarkGuestPaid,
    selectGuest,
    unpaidGuests,
    paidGuests,
  } = useBillSplit();

  return {
    guestSplits: state.guestSplits,
    selectedGuestIndex: state.selectedGuestIndex,
    paidGuests: state.paidGuests,
    paidAmount: state.paidAmount,
    remainingAmount: state.remainingAmount,
    unpaidGuests,
    paidGuestsList: paidGuests,
    calculateEqualSplits,
    calculateItemSplits,
    markGuestPaid,
    unmarkGuestPaid,
    selectGuest,
  };
};

export const useItemAssignments = () => {
  const {
    state,
    assignItemToGuest,
    unassignItemFromGuest,
    assignAllItemsToGuest,
    clearGuestItems,
    splitItemEqually,
  } = useBillSplit();

  return {
    items: state.items,
    itemAssignments: state.itemAssignments,
    guestCount: state.guestCount,
    assignItemToGuest,
    unassignItemFromGuest,
    assignAllItemsToGuest,
    clearGuestItems,
    splitItemEqually,
  };
};

export const usePaymentSplits = () => {
  const {
    state,
    addPaymentSplit,
    updatePaymentSplit,
    removePaymentSplit,
  } = useBillSplit();

  return {
    paymentSplits: state.paymentSplits,
    total: state.total,
    remainingAmount: state.remainingAmount,
    addPaymentSplit,
    updatePaymentSplit,
    removePaymentSplit,
  };
};
