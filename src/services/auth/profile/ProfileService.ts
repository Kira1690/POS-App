/**
 * Profile Service - Simple, focused profile management
 * Under 100 lines, single responsibility for profile operations
 */

import { authApiClient } from '@/services/api/authApiClient';
import { User } from '@/types';
import { UpdateProfileRequest, UpdatePasswordRequest } from '@/interfaces';

export class ProfileService {
  
  async getProfile(): Promise<User> {
    try {
      return await authApiClient.getProfile();
    } catch (error: any) {
      console.error('Get profile failed:', error.message);
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  async updateProfile(userData: UpdateProfileRequest): Promise<User> {
    try {
      const response = await authApiClient.updateProfile(userData);
      
      if (__DEV__) {
        console.log('Profile updated successfully:', response.id);
      }
      
      return response;
    } catch (error: any) {
      console.error('Profile update failed:', error.message);
      throw new Error(error.message || 'Profile update failed');
    }
  }

  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    try {
      await authApiClient.updatePassword(passwordData);
      
      if (__DEV__) {
        console.log('Password updated successfully');
      }
    } catch (error: any) {
      console.error('Password update failed:', error.message);
      throw new Error(error.message || 'Password update failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await authApiClient.getCurrentUser();
    } catch (error) {
      return null;
    }
  }

  async deleteAccount(type: 'soft' | 'hard' = 'soft'): Promise<void> {
    try {
      if (type === 'hard') {
        await authApiClient.hardDeleteAccount();
      } else {
        await authApiClient.softDeleteAccount();
      }
      
      if (__DEV__) {
        console.log(`Account ${type} deleted successfully`);
      }
    } catch (error: any) {
      console.error('Account deletion failed:', error.message);
      throw new Error(error.message || 'Account deletion failed');
    }
  }
}