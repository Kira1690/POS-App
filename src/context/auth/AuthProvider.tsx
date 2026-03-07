/**
 * Auth Provider - Simple provider component
 * Under 200 lines, focused on providing auth context
 */

import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
import { AuthServiceClass } from '@/services/auth';
import { IAuthService, IAuthContext, UpdateProfileRequest } from '@/interfaces';
import { User, UserRole, Restaurant, LoginRequest } from '@/types';
import { showToast } from '@/utils/toast';
import { authStorageService } from '@/services/storage';
import { apiClient } from '@/services/api/apiClient';
import AuthContext from './AuthContext';
import { authReducer, initialAuthState } from './AuthReducer';
import { createAuthActions } from './AuthActions';

interface AuthProviderProps {
  children: React.ReactNode;
  authService?: IAuthService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  authService: injectedAuthService 
}) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  
  // Memoize the default service to prevent infinite re-renders
  const defaultAuthService = React.useMemo(() => new AuthServiceClass(), []);
  
  // Use injected service or fall back to default service
  const authServiceToUse = injectedAuthService || defaultAuthService;
  const actions = createAuthActions(authServiceToUse, dispatch);

  // Initialize auth on app start - restore full session from storage
  const initializeAuth = useCallback(async () => {
    dispatch({ type: 'AUTH_INITIALIZE_START' });

    try {
      const storedSession = await authStorageService.getSession();
      const isAuthenticated = await authServiceToUse.isAuthenticated();

      if (isAuthenticated) {
        // Get full session including restaurant from storage
        const session = await authStorageService.getSession();

        if (session) {
          // Bridge tokens to apiClient (both defaults header AND TokenManager/SecureStore)
          if (session.accessToken) {
            const expiresAt = session.expiresAt
              ? Math.floor(new Date(session.expiresAt).getTime() / 1000)
              : Math.floor(Date.now() / 1000) + 900;
            await apiClient.setAuthTokens(
              session.accessToken,
              session.refreshToken || '',
              expiresAt
            );
          }

          dispatch({
            type: 'AUTH_INITIALIZE_SUCCESS',
            payload: {
              user: session.user,
              restaurant: session.restaurant
            }
          });
        } else {
          // Session validation passed but data missing - fallback to separate fetches
          const user = await authServiceToUse.getProfile();
          const restaurant = await authStorageService.getRestaurant();
          dispatch({
            type: 'AUTH_INITIALIZE_SUCCESS',
            payload: { user, restaurant: restaurant ?? undefined }
          });
        }
      } else {
        // Not authenticated — showing login
        dispatch({ type: 'AUTH_INITIALIZE_FAILURE' });
      }
    } catch (error: any) {
      if (__DEV__) console.error('[Auth Init] Failed:', error.message);
      dispatch({ type: 'AUTH_INITIALIZE_FAILURE' });
    }
  }, [authServiceToUse]);

  // Profile management
  const updateProfile = useCallback(async (userData: UpdateProfileRequest) => {
    try {
      const updatedUser = await authServiceToUse.updateProfile(userData);
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
  }, [authServiceToUse]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await authServiceToUse.updatePassword({ currentPassword, newPassword });
      
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
  }, [authServiceToUse]);

  // Utility functions
  const refreshUserData = useCallback(async () => {
    try {
      const user = await authServiceToUse.getProfile();
      dispatch({ type: 'AUTH_UPDATE_USER', payload: user });
    } catch (error: any) {
      if (__DEV__) console.error('Failed to refresh user data:', error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        dispatch({ type: 'AUTH_SESSION_EXPIRED' });
      }
    }
  }, [authServiceToUse]);

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
      const isAuthenticated = await authServiceToUse.isAuthenticated();
      
      if (!isAuthenticated && state.isAuthenticated) {
        dispatch({ type: 'AUTH_SESSION_EXPIRED' });
      } else if (isAuthenticated && !state.isAuthenticated) {
        await initializeAuth();
      }
    } catch (error: any) {
      if (__DEV__) console.error('Auth status check failed:', error.message);
    }
  }, [authServiceToUse, state.isAuthenticated, initializeAuth]);

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

  const contextValue: IAuthContext = useMemo(() => ({
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
  }), [
    state, actions.login, actions.logout, actions.clearError,
    updateProfile, updatePassword, refreshUserData, switchRestaurant,
    checkAuthStatus, hasRole, hasAnyRole, canAccessResource, getSessionInfo,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};