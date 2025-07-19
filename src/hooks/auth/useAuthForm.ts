/**
 * Auth Form Hook - Simple form state management for auth
 * Under 100 lines, single responsibility for form handling
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { LoginRequest } from '@/types';

interface UseAuthFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface AuthFormState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export const useAuthForm = ({ onSuccess, onError }: UseAuthFormProps = {}) => {
  const { login } = useAuth();
  
  const [formState, setFormState] = useState<AuthFormState>({
    email: '',
    password: '',
    isLoading: false,
    error: null,
  });

  const updateField = useCallback((field: keyof AuthFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      error: null, // Clear error when user types
    }));
  }, []);

  const setEmail = useCallback((email: string) => {
    updateField('email', email);
  }, [updateField]);

  const setPassword = useCallback((password: string) => {
    updateField('password', password);
  }, [updateField]);

  const clearForm = useCallback(() => {
    setFormState({
      email: '',
      password: '',
      isLoading: false,
      error: null,
    });
  }, []);

  const handleLogin = useCallback(async () => {
    if (!formState.email || !formState.password) {
      setFormState(prev => ({ ...prev, error: 'Email and password are required' }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const credentials: LoginRequest = {
        email: formState.email,
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
  }, [formState.email, formState.password, login, onSuccess, onError]);

  const isValid = formState.email.length > 0 && formState.password.length > 0;

  return {
    // State
    email: formState.email,
    password: formState.password,
    isLoading: formState.isLoading,
    error: formState.error || undefined,
    isValid,
    
    // Actions
    setEmail,
    setPassword,
    handleLogin,
    clearForm,
  };
};