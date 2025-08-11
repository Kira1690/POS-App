/**
 * Core Auth Service - Simple, focused authentication operations
 * Under 150 lines, single responsibility for core auth
 */

import { authApiClient } from '@/services/api/authApiClient';
import { LoginRequest, LoginResponse, RefreshTokenResponse, User, Restaurant } from '@/types';
import { RegisterUserRequest } from '@/interfaces';
import { findUserByCredentials, generateDummyTokens, DUMMY_RESTAURANTS } from '@/constants/dummyData';

export class CoreAuthService {
  
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Check for dummy credentials first
      const dummyUser = findUserByCredentials(
        credentials.identifier || credentials.email || '',
        credentials.password,
        !!credentials.identifier // true if staff login (has identifier)
      );

      if (dummyUser) {
        // Return dummy response
        const userData: User = {
          id: dummyUser.id,
          first_name: dummyUser.name.split(' ')[0] || dummyUser.name,
          last_name: dummyUser.name.split(' ')[1] || '',
          email: dummyUser.email || '',
          phone_number: '+1234567890',
          role: dummyUser.role,
          employee_id: dummyUser.employeeId,
          default_restaurant_id: dummyUser.restaurantId,
          is_active: dummyUser.isActive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const restaurant = DUMMY_RESTAURANTS.find(r => r.id === dummyUser.restaurantId);
        const restaurantData: Restaurant = {
          id: dummyUser.restaurantId,
          name: dummyUser.restaurantName,
          address: restaurant?.address || '123 Main Street',
          phone: restaurant?.phone || '+1 (555) 123-4567',
          timezone: 'America/New_York',
          is_active: true,
        };

        const tokens = generateDummyTokens(dummyUser);
        
        console.log('[DUMMY AUTH] Login successful:', {
          userId: userData.id,
          role: userData.role,
          restaurant: restaurantData.name,
        });

        return {
          user: userData,
          restaurant: restaurantData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        };
      }

      // If not dummy credentials, proceed with real API call
      const response = await authApiClient.login(credentials);
      
      if (__DEV__) {
        console.log('Login successful:', {
          userId: response.user.id,
          role: response.user.role,
          restaurant: response.restaurant?.name,
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Login failed:', error.message);
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await authApiClient.logout();
      
      if (__DEV__) {
        console.log('Logout successful');
      }
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      throw new Error(error.message || 'Logout failed');
    }
  }

  async register(userData: RegisterUserRequest): Promise<any> {
    try {
      const response = await authApiClient.register(userData);
      
      if (__DEV__) {
        console.log('Registration successful:', {
          userId: response.user.id,
          email: response.user.email,
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Registration failed:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      return await authApiClient.refreshTokenManually(refreshToken);
    } catch (error: any) {
      console.error('Token refresh failed:', error.message);
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      return await authApiClient.validateToken();
    } catch (error: any) {
      console.error('Token validation failed:', error.message);
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      return await authApiClient.isAuthenticated();
    } catch (error: any) {
      return false;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await authApiClient.forgotPassword(email);
      
      if (__DEV__) {
        console.log('Password reset email sent to:', email);
      }
    } catch (error: any) {
      console.error('Forgot password failed:', error.message);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await authApiClient.resetPassword(token, newPassword);
      
      if (__DEV__) {
        console.log('Password reset successful');
      }
    } catch (error: any) {
      console.error('Password reset failed:', error.message);
      throw new Error(error.message || 'Password reset failed');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await authApiClient.verifyEmail(token);
      
      if (__DEV__) {
        console.log('Email verification successful');
      }
    } catch (error: any) {
      console.error('Email verification failed:', error.message);
      throw new Error(error.message || 'Email verification failed');
    }
  }

  async resendEmailVerification(email: string): Promise<void> {
    try {
      await authApiClient.resendEmailVerification(email);
      
      if (__DEV__) {
        console.log('Verification email resent to:', email);
      }
    } catch (error: any) {
      console.error('Resend verification failed:', error.message);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }
}