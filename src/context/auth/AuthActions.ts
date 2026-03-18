/**
 * Auth Actions - Simple action creators
 * Under 100 lines, focused on action creation
 */

import { User, Restaurant, LoginRequest } from '@/types';
import { IAuthService } from '@/interfaces';
import { showToast } from '@/utils/toast';
import { authStorageService } from '@/services/storage';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { kitchenStorageService } from '@/services/storage/KitchenStorageService';
import { syncQueueService } from '@/services/storage';

export const createAuthActions = (
  authService: IAuthService,
  dispatch: React.Dispatch<any>
) => {
  
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      dispatch({ 
        type: 'AUTH_LOGIN_SUCCESS', 
        payload: { 
          user: response.user, 
          restaurant: response.restaurant 
        } 
      });
      
      showToast({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${response.user.first_name}!`,
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'AUTH_LOGIN_FAILURE', payload: errorMessage });
      
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
      });
      
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    dispatch({ type: 'AUTH_LOGOUT_START' });

    try {
      // Check if server-connected BEFORE logout clears tokens
      let wasServerConnected = false;
      try {
        const session = await authStorageService.getSession();
        wasServerConnected = !(session?.accessToken?.startsWith('dummy_') ?? true);
      } catch {
        // If we can't read session, assume not server-connected
      }

      await authService.logout();

      // Clear user-specific data when server-connected (not dummy)
      if (wasServerConnected) {
        try {
          await unifiedOrderStorageService.clearAll();
          await kitchenStorageService.clearAll();
          await syncQueueService.resetLastSyncTime();
          if (__DEV__) {
            console.log('[AuthActions] Cleared orders, tickets, and sync time for server logout');
          }
        } catch (clearError) {
          // Non-fatal — log and continue
          if (__DEV__) {
            console.error('[AuthActions] Failed to clear user data on logout:', clearError);
          }
        }
      }

      dispatch({ type: 'AUTH_LOGOUT_SUCCESS' });

      showToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      dispatch({ type: 'AUTH_LOGOUT_FAILURE', payload: errorMessage });

      showToast({
        type: 'error',
        title: 'Logout Failed',
        message: errorMessage,
      });

      // Clear state anyway
      dispatch({ type: 'AUTH_LOGOUT_SUCCESS' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  return {
    login,
    logout,
    clearError,
  };
};