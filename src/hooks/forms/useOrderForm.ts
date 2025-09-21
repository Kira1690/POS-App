/**
 * Order Form Management Hook
 * Pure form state management - no business logic or data operations
 * Follows Single Responsibility Principle - form state only
 * Clean separation from validation and submission logic
 */

import { useState, useCallback, useReducer } from 'react';
import { CartItem } from '@/context/cart/CartContext';

export interface OrderFormData {
  tableId: string;
  specialInstructions: string;
  estimatedTime: number;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  notes: string;
}

export interface OrderFormState {
  data: OrderFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface UseOrderFormResult {
  // State
  state: OrderFormState;
  
  // Field Operations
  setValue: (field: keyof OrderFormData, value: any) => void;
  setError: (field: keyof OrderFormData, error: string) => void;
  clearError: (field: keyof OrderFormData) => void;
  setTouched: (field: keyof OrderFormData, touched?: boolean) => void;
  
  // Form Operations
  resetForm: () => void;
  setFormData: (data: Partial<OrderFormData>) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Validation State
  isValid: boolean;
  hasErrors: boolean;
  
  // Field Helpers
  getFieldValue: <T>(field: keyof OrderFormData) => T;
  getFieldError: (field: keyof OrderFormData) => string | undefined;
  isFieldTouched: (field: keyof OrderFormData) => boolean;
  isFieldValid: (field: keyof OrderFormData) => boolean;
}

const initialFormData: OrderFormData = {
  tableId: '',
  specialInstructions: '',
  estimatedTime: 0,
  items: [],
  customerName: '',
  customerPhone: '',
  notes: '',
};

const initialFormState: OrderFormState = {
  data: initialFormData,
  errors: {},
  touched: {},
  isSubmitting: false,
  isDirty: false,
};

type FormAction =
  | { type: 'SET_VALUE'; field: keyof OrderFormData; value: any }
  | { type: 'SET_ERROR'; field: keyof OrderFormData; error: string }
  | { type: 'CLEAR_ERROR'; field: keyof OrderFormData }
  | { type: 'SET_TOUCHED'; field: keyof OrderFormData; touched: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'SET_FORM_DATA'; data: Partial<OrderFormData> }
  | { type: 'SET_SUBMITTING'; submitting: boolean };

function formReducer(state: OrderFormState, action: FormAction): OrderFormState {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
        isDirty: true,
        // Clear error when user starts typing
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

    default:
      return state;
  }
}

/**
 * Hook for order form management
 * Pure form state management with no business logic
 * 
 * @returns Form state and operations
 */
export function useOrderForm(): UseOrderFormResult {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  // Set field value
  const setValue = useCallback((field: keyof OrderFormData, value: any) => {
    dispatch({ type: 'SET_VALUE', field, value });
  }, []);

  // Set field error
  const setError = useCallback((field: keyof OrderFormData, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  // Clear field error
  const clearError = useCallback((field: keyof OrderFormData) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  // Set field touched
  const setTouched = useCallback((field: keyof OrderFormData, touched = true) => {
    dispatch({ type: 'SET_TOUCHED', field, touched });
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  // Set form data
  const setFormData = useCallback((data: Partial<OrderFormData>) => {
    dispatch({ type: 'SET_FORM_DATA', data });
  }, []);

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', submitting });
  }, []);

  // Computed properties
  const hasErrors = Object.values(state.errors).some(error => Boolean(error));
  const isValid = !hasErrors && state.data.tableId.trim() !== '';

  // Field helpers
  const getFieldValue = useCallback(<T,>(field: keyof OrderFormData): T => {
    return state.data[field] as T;
  }, [state.data]);

  const getFieldError = useCallback((field: keyof OrderFormData): string | undefined => {
    return state.errors[field];
  }, [state.errors]);

  const isFieldTouched = useCallback((field: keyof OrderFormData): boolean => {
    return Boolean(state.touched[field]);
  }, [state.touched]);

  const isFieldValid = useCallback((field: keyof OrderFormData): boolean => {
    return !state.errors[field] && Boolean(state.data[field]);
  }, [state.errors, state.data]);

  return {
    state,
    setValue,
    setError,
    clearError,
    setTouched,
    resetForm,
    setFormData,
    setSubmitting,
    isValid,
    hasErrors,
    getFieldValue,
    getFieldError,
    isFieldTouched,
    isFieldValid,
  };
}

/**
 * Helper hook for order form field management
 * Provides simplified interface for individual fields
 */
export function useOrderFormField(field: keyof OrderFormData) {
  const form = useOrderForm();

  return {
    value: form.getFieldValue(field),
    error: form.getFieldError(field),
    touched: form.isFieldTouched(field),
    valid: form.isFieldValid(field),
    setValue: (value: any) => form.setValue(field, value),
    setError: (error: string) => form.setError(field, error),
    clearError: () => form.clearError(field),
    setTouched: () => form.setTouched(field),
  };
}