/**
 * Core Auth Service - Simple, focused authentication operations
 * Under 150 lines, single responsibility for core auth
 */

import { authApiClient } from '@/services/api/authApiClient';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from '@/types';
import { RegisterUserRequest } from '@/interfaces';

export class CoreAuthService {
  
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
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