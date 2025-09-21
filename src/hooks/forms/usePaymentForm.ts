/**
 * Payment Form Management Hook
 * Pure form state management - no business logic or payment processing
 * Follows Single Responsibility Principle - form state only
 * Clean separation from validation and payment operations
 */

import { useReducer, useCallback } from 'react';
import { PaymentMethod } from '@/types/payment.types';

export interface PaymentFormData {
  amount: number;
  method: PaymentMethod | '';
  tipAmount: number;
  tipPercentage: number;
  
  // Card payment fields
  cardLast4: string;
  cardType: string;
  
  // Cash payment fields
  receivedAmount: number;
  changeAmount: number;
  
  // Split payment fields
  splitItems: Array<{
    amount: number;
    method: PaymentMethod;
    description: string;
  }>;
  
  // General fields
  orderId: string;
  customerEmail: string;
  receiptPreferences: {
    print: boolean;
    email: boolean;
    sms: boolean;
  };
  notes: string;
}

export interface PaymentFormState {
  data: PaymentFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface UsePaymentFormResult {
  // State
  state: PaymentFormState;
  
  // Field Operations
  setValue: (field: keyof PaymentFormData, value: any) => void;
  setError: (field: keyof PaymentFormData, error: string) => void;
  clearError: (field: keyof PaymentFormData) => void;
  setTouched: (field: keyof PaymentFormData, touched?: boolean) => void;
  
  // Form Operations
  resetForm: () => void;
  setFormData: (data: Partial<PaymentFormData>) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Split Payment Operations
  addSplitItem: (item: { amount: number; method: PaymentMethod; description: string }) => void;
  removeSplitItem: (index: number) => void;
  updateSplitItem: (index: number, updates: Partial<{ amount: number; method: PaymentMethod; description: string }>) => void;
  
  // Validation State
  isValid: boolean;
  hasErrors: boolean;
  
  // Field Helpers
  getFieldValue: <T>(field: keyof PaymentFormData) => T;
  getFieldError: (field: keyof PaymentFormData) => string | undefined;
  isFieldTouched: (field: keyof PaymentFormData) => boolean;
}

const initialFormData: PaymentFormData = {
  amount: 0,
  method: '',
  tipAmount: 0,
  tipPercentage: 0,
  cardLast4: '',
  cardType: '',
  receivedAmount: 0,
  changeAmount: 0,
  splitItems: [],
  orderId: '',
  customerEmail: '',
  receiptPreferences: {
    print: true,
    email: false,
    sms: false,
  },
  notes: '',
};

const initialFormState: PaymentFormState = {
  data: initialFormData,
  errors: {},
  touched: {},
  isSubmitting: false,
  isDirty: false,
};

type PaymentFormAction =
  | { type: 'SET_VALUE'; field: keyof PaymentFormData; value: any }
  | { type: 'SET_ERROR'; field: keyof PaymentFormData; error: string }
  | { type: 'CLEAR_ERROR'; field: keyof PaymentFormData }
  | { type: 'SET_TOUCHED'; field: keyof PaymentFormData; touched: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'SET_FORM_DATA'; data: Partial<PaymentFormData> }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'ADD_SPLIT_ITEM'; item: { amount: number; method: PaymentMethod; description: string } }
  | { type: 'REMOVE_SPLIT_ITEM'; index: number }
  | { type: 'UPDATE_SPLIT_ITEM'; index: number; updates: Partial<{ amount: number; method: PaymentMethod; description: string }> };

function paymentFormReducer(state: PaymentFormState, action: PaymentFormAction): PaymentFormState {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
        isDirty: true,
        errors: {
          ...state.errors,
          [action.field]: undefined,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error,
        },
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: undefined,
        },
      };

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: action.touched,
        },
      };

    case 'RESET_FORM':
      return initialFormState;

    case 'SET_FORM_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data,
        },
        isDirty: true,
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.submitting,
      };

    case 'ADD_SPLIT_ITEM':
      return {
        ...state,
        data: {
          ...state.data,
          splitItems: [...state.data.splitItems, action.item],
        },
        isDirty: true,
      };

    case 'REMOVE_SPLIT_ITEM':
      return {
        ...state,
        data: {
          ...state.data,
          splitItems: state.data.splitItems.filter((_, index) => index !== action.index),
        },
        isDirty: true,
      };

    case 'UPDATE_SPLIT_ITEM':
      return {
        ...state,
        data: {
          ...state.data,
          splitItems: state.data.splitItems.map((item, index) =>
            index === action.index ? { ...item, ...action.updates } : item
          ),
        },
        isDirty: true,
      };

    default:
      return state;
  }
}

/**
 * Hook for payment form management
 * Pure form state management with no payment processing logic
 * 
 * @returns Payment form state and operations
 */
export function usePaymentForm(): UsePaymentFormResult {
  const [state, dispatch] = useReducer(paymentFormReducer, initialFormState);

  // Set field value
  const setValue = useCallback((field: keyof PaymentFormData, value: any) => {
    dispatch({ type: 'SET_VALUE', field, value });
  }, []);

  // Set field error
  const setError = useCallback((field: keyof PaymentFormData, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  // Clear field error
  const clearError = useCallback((field: keyof PaymentFormData) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  // Set field touched
  const setTouched = useCallback((field: keyof PaymentFormData, touched = true) => {
    dispatch({ type: 'SET_TOUCHED', field, touched });
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  // Set form data
  const setFormData = useCallback((data: Partial<PaymentFormData>) => {
    dispatch({ type: 'SET_FORM_DATA', data });
  }, []);

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', submitting });
  }, []);

  // Add split payment item
  const addSplitItem = useCallback((item: { amount: number; method: PaymentMethod; description: string }) => {
    dispatch({ type: 'ADD_SPLIT_ITEM', item });
  }, []);

  // Remove split payment item
  const removeSplitItem = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_SPLIT_ITEM', index });
  }, []);

  // Update split payment item
  const updateSplitItem = useCallback((
    index: number, 
    updates: Partial<{ amount: number; method: PaymentMethod; description: string }>
  ) => {
    dispatch({ type: 'UPDATE_SPLIT_ITEM', index, updates });
  }, []);

  // Computed properties
  const hasErrors = Object.values(state.errors).some(error => Boolean(error));
  const isValid = !hasErrors && 
                  state.data.amount > 0 && 
                  state.data.method !== '' && 
                  state.data.orderId.trim() !== '';

  // Field helpers
  const getFieldValue = useCallback(<T,>(field: keyof PaymentFormData): T => {
    return state.data[field] as T;
  }, [state.data]);

  const getFieldError = useCallback((field: keyof PaymentFormData): string | undefined => {
    return state.errors[field];
  }, [state.errors]);

  const isFieldTouched = useCallback((field: keyof PaymentFormData): boolean => {
    return Boolean(state.touched[field]);
  }, [state.touched]);

  return {
    state,
    setValue,
    setError,
    clearError,
    setTouched,
    resetForm,
    setFormData,
    setSubmitting,
    addSplitItem,
    removeSplitItem,
    updateSplitItem,
    isValid,
    hasErrors,
    getFieldValue,
    getFieldError,
    isFieldTouched,
  };
}