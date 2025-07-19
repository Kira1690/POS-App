/**
 * Auth Provider - Simple provider component
 * Under 200 lines, focused on providing auth context
 */

import React, { useReducer, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth/AuthService';
import { IAuthService, IAuthContext, UpdateProfileRequest } from '@/interfaces';
import { User, UserRole, Restaurant, LoginRequest } from '@/types';
import { showToast } from '@/utils/toast';
import AuthContext from './AuthContext';
import { authReducer, initialAuthState } from './AuthReducer';
import { createAuthActions } from './AuthActions';

interface AuthProviderProps {
  children: React.ReactNode;
  authService?: IAuthService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  authService: injectedAuthService = authService 
}) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const actions = createAuthActions(injectedAuthService, dispatch);

  // Initialize auth on app start
  const initializeAuth = useCallback(async () => {
    dispatch({ type: 'AUTH_INITIALIZE_START' });
    
    try {
      const isAuthenticated = await injectedAuthService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await injectedAuthService.getProfile();
        dispatch({ 
          type: 'AUTH_INITIALIZE_SUCCESS', 
          payload: { user } 
        });
      } else {
        dispatch({ type: 'AUTH_INITIALIZE_FAILURE' });
      }
    } catch (error: any) {
      console.error('Auth initialization failed:', error.message);
      dispatch({ type: 'AUTH_INITIALIZE_FAILURE' });
    }
  }, [injectedAuthService]);

  // Profile management
  const updateProfile = useCallback(async (userData: UpdateProfileRequest) => {
    try {
      const updatedUser = await injectedAuthService.updateProfile(userData);
      dispatch({ type: 'AUTH_UPDATE_USER', payload: updatedUser });
      
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      dispatch({ type: 'AUTH_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  }, [injectedAuthService]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await injectedAuthService.updatePassword({ currentPassword, newPassword });
      
      showToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been updated successfully.',
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Password update failed';
      dispatch({ type: 'AUTH_SET_ERROR', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Password Update Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  }, [injectedAuthService]);

  // Utility functions
  const refreshUserData = useCallback(async () => {
    try {
      const user = await injectedAuthService.getProfile();
      dispatch({ type: 'AUTH_UPDATE_USER', payload: user });
    } catch (error: any) {
      console.error('Failed to refresh user data:', error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        dispatch({ type: 'AUTH_SESSION_EXPIRED' });
      }
    }
  }, [injectedAuthService]);

  const switchRestaurant = useCallback((restaurant: Restaurant) => {
    dispatch({ type: 'AUTH_UPDATE_RESTAURANT', payload: restaurant });
    
    showToast({
      type: 'info',
      title: 'Restaurant Switched',
      message: `Now working with ${restaurant.name}`,
    });
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const isAuthenticated = await injectedAuthService.isAuthenticated();
      
      if (!isAuthenticated && state.isAuthenticated) {
        dispatch({ type: 'AUTH_SESSION_EXPIRED' });
      } else if (isAuthenticated && !state.isAuthenticated) {
        await initializeAuth();
      }
    } catch (error: any) {
      console.error('Auth status check failed:', error.message);
    }
  }, [injectedAuthService, state.isAuthenticated, initializeAuth]);

  // Role-based utilities
  const hasRole = useCallback((role: UserRole): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  }, [state.user]);

  const canAccessResource = useCallback((requiredRoles: UserRole[]): boolean => {
    if (!state.isAuthenticated || !state.user) {
      return false;
    }
    return requiredRoles.includes(state.user.role);
  }, [state.isAuthenticated, state.user]);

  const getSessionInfo = useCallback(() => {
    const timeUntilExpiry = state.sessionExpiresAt 
      ? new Date(state.sessionExpiresAt).getTime() - Date.now()
      : null;
    
    const isExpiringSoon = timeUntilExpiry ? timeUntilExpiry < (5 * 60 * 1000) : false;
    
    return { timeUntilExpiry, isExpiringSoon };
  }, [state.sessionExpiresAt]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Periodic auth check
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isAuthenticated) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, checkAuthStatus]);

  const contextValue: IAuthContext = {
    state,
    login: actions.login,
    logout: actions.logout,
    updateProfile,
    updatePassword,
    refreshUserData,
    switchRestaurant,
    checkAuthStatus,
    clearError: actions.clearError,
    hasRole,
    hasAnyRole,
    canAccessResource,
    getSessionInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};