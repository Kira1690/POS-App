/**
 * Auth Actions - Simple action creators
 * Under 100 lines, focused on action creation
 */

import { User, Restaurant, LoginRequest } from '@/types';
import { IAuthService } from '@/interfaces';
import { showToast } from '@/utils/toast';

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
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT_SUCCESS' });
      
      showToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
      });
      
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed';
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