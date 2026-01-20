/**
 * Table Form Management Hook
 * Pure form state management - no business logic or table operations
 * Follows Single Responsibility Principle - form state only
 * Clean separation from validation and table management
 */

import { useReducer, useCallback } from 'react';
import { TableStatus } from '@/types/common.types';

export interface TableFormData {
  tableNumber: string;
  capacity: number;
  serviceArea: string;
  status: TableStatus | '';
  notes: string;
  isActive: boolean;
  
  // Location/positioning
  xPosition: number;
  yPosition: number;
  
  // Reservation data
  reservationName?: string;
  reservationPhone?: string;
  reservationTime?: string;
  reservationPartySize?: number;
  
  // Assignment data
  assignedWaiter?: string;
  estimatedTurnoverTime?: number;
}

export interface TableFormState {
  data: TableFormData;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface UseTableFormResult {
  // State
  state: TableFormState;
  
  // Field Operations
  setValue: (field: keyof TableFormData, value: any) => void;
  setError: (field: keyof TableFormData, error: string) => void;
  clearError: (field: keyof TableFormData) => void;
  setTouched: (field: keyof TableFormData, touched?: boolean) => void;
  
  // Form Operations
  resetForm: () => void;
  setFormData: (data: Partial<TableFormData>) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Reservation Operations
  setReservationData: (data: {
    name: string;
    phone: string;
    time: string;
    partySize: number;
  }) => void;
  clearReservationData: () => void;
  
  // Validation State
  isValid: boolean;
  hasErrors: boolean;
  
  // Field Helpers
  getFieldValue: <T>(field: keyof TableFormData) => T;
  getFieldError: (field: keyof TableFormData) => string | undefined;
  isFieldTouched: (field: keyof TableFormData) => boolean;
  isFieldValid: (field: keyof TableFormData) => boolean;
}

const initialFormData: TableFormData = {
  tableNumber: '',
  capacity: 2,
  serviceArea: '',
  status: '',
  notes: '',
  isActive: true,
  xPosition: 0,
  yPosition: 0,
  reservationName: '',
  reservationPhone: '',
  reservationTime: '',
  reservationPartySize: 0,
  assignedWaiter: '',
  estimatedTurnoverTime: 60,
};

const initialFormState: TableFormState = {
  data: initialFormData,
  errors: {},
  touched: {},
  isSubmitting: false,
  isDirty: false,
};

type TableFormAction =
  | { type: 'SET_VALUE'; field: keyof TableFormData; value: any }
  | { type: 'SET_ERROR'; field: keyof TableFormData; error: string }
  | { type: 'CLEAR_ERROR'; field: keyof TableFormData }
  | { type: 'SET_TOUCHED'; field: keyof TableFormData; touched: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'SET_FORM_DATA'; data: Partial<TableFormData> }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'SET_RESERVATION_DATA'; data: { name: string; phone: string; time: string; partySize: number } }
  | { type: 'CLEAR_RESERVATION_DATA' };

function tableFormReducer(state: TableFormState, action: TableFormAction): TableFormState {
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

    case 'SET_RESERVATION_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          reservationName: action.data.name,
          reservationPhone: action.data.phone,
          reservationTime: action.data.time,
          reservationPartySize: action.data.partySize,
          status: TableStatus.RESERVED,
        },
        isDirty: true,
      };

    case 'CLEAR_RESERVATION_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          reservationName: '',
          reservationPhone: '',
          reservationTime: '',
          reservationPartySize: 0,
          status: TableStatus.AVAILABLE,
        },
        isDirty: true,
      };

    default:
      return state;
  }
}

/**
 * Hook for table form management
 * Pure form state management with no table business logic
 * 
 * @returns Table form state and operations
 */
export function useTableForm(): UseTableFormResult {
  const [state, dispatch] = useReducer(tableFormReducer, initialFormState);

  // Set field value
  const setValue = useCallback((field: keyof TableFormData, value: any) => {
    dispatch({ type: 'SET_VALUE', field, value });
  }, []);

  // Set field error
  const setError = useCallback((field: keyof TableFormData, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  // Clear field error
  const clearError = useCallback((field: keyof TableFormData) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  // Set field touched
  const setTouched = useCallback((field: keyof TableFormData, touched = true) => {
    dispatch({ type: 'SET_TOUCHED', field, touched });
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  // Set form data
  const setFormData = useCallback((data: Partial<TableFormData>) => {
    dispatch({ type: 'SET_FORM_DATA', data });
  }, []);

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', submitting });
  }, []);

  // Set reservation data
  const setReservationData = useCallback((data: {
    name: string;
    phone: string;
    time: string;
    partySize: number;
  }) => {
    dispatch({ type: 'SET_RESERVATION_DATA', data });
  }, []);

  // Clear reservation data
  const clearReservationData = useCallback(() => {
    dispatch({ type: 'CLEAR_RESERVATION_DATA' });
  }, []);

  // Computed properties
  const hasErrors = Object.values(state.errors).some(error => Boolean(error));
  const isValid = !hasErrors && 
                  state.data.tableNumber.trim() !== '' && 
                  state.data.capacity > 0 && 
                  state.data.serviceArea.trim() !== '';

  // Field helpers
  const getFieldValue = useCallback(<T,>(field: keyof TableFormData): T => {
    return state.data[field] as T;
  }, [state.data]);

  const getFieldError = useCallback((field: keyof TableFormData): string | undefined => {
    return state.errors[field];
  }, [state.errors]);

  const isFieldTouched = useCallback((field: keyof TableFormData): boolean => {
    return Boolean(state.touched[field]);
  }, [state.touched]);

  const isFieldValid = useCallback((field: keyof TableFormData): boolean => {
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
    setReservationData,
    clearReservationData,
    isValid,
    hasErrors,
    getFieldValue,
    getFieldError,
    isFieldTouched,
    isFieldValid,
  };
}

/**
 * Helper hook for table form field management
 * Provides simplified interface for individual fields
 */
export function useTableFormField(field: keyof TableFormData) {
  const form = useTableForm();

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