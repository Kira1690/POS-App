/**
 * Staff Auth Form Hook - Simple form state management for staff auth
 * Under 100 lines, single responsibility for staff form handling
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { LoginRequest } from '@/types';

interface UseStaffAuthFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface StaffAuthFormState {
  employeeId: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export const useStaffAuthForm = ({ onSuccess, onError }: UseStaffAuthFormProps = {}) => {
  const { login } = useAuth();
  
  const [formState, setFormState] = useState<StaffAuthFormState>({
    employeeId: '',
    password: '',
    isLoading: false,
    error: null,
  });

  const updateField = useCallback((field: keyof StaffAuthFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      error: null, // Clear error when user types
    }));
  }, []);

  const setEmployeeId = useCallback((employeeId: string) => {
    updateField('employeeId', employeeId);
  }, [updateField]);

  const setPassword = useCallback((password: string) => {
    updateField('password', password);
  }, [updateField]);

  const clearForm = useCallback(() => {
    setFormState({
      employeeId: '',
      password: '',
      isLoading: false,
      error: null,
    });
  }, []);

  const handleLogin = useCallback(async () => {
    if (!formState.employeeId || !formState.password) {
      setFormState(prev => ({ ...prev, error: 'Employee ID and password are required' }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const credentials: LoginRequest = {
        employee_id: formState.employeeId,
        password: formState.password,
      };

      await login(credentials);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setFormState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  }, [formState.employeeId, formState.password, login, onSuccess, onError]);

  const isValid = formState.employeeId.length > 0 && formState.password.length > 0;

  return {
    // State
    employeeId: formState.employeeId,
    password: formState.password,
    isLoading: formState.isLoading,
    error: formState.error || undefined,
    isValid,
    
    // Actions
    setEmployeeId,
    setPassword,
    handleLogin,
    clearForm,
  };
};