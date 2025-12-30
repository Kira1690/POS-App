/**
 * Profile Service - Simple, focused profile management
 * Under 100 lines, single responsibility for profile operations
 *
 * Now includes AsyncStorage persistence for session management.
 * When backend is ready, set useLocalStorage to false.
 */

import { authApiClient } from '@/services/api/authApiClient';
import { User } from '@/types';
import { UpdateProfileRequest, UpdatePasswordRequest } from '@/interfaces';
import { authStorageService } from '@/services/storage';

export class ProfileService {
  // Flag to use local storage vs API (set to false when backend is ready)
  private useLocalStorage = true;

  async getProfile(): Promise<User> {
    try {
      // First check local storage for stored user
      if (this.useLocalStorage) {
        const storedUser = await authStorageService.getUser();
        if (storedUser) {
          return storedUser;
        }
      }

      // Fall back to API call
      return await authApiClient.getProfile();
    } catch (error: any) {
      console.error('Get profile failed:', error.message);
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  async updateProfile(userData: UpdateProfileRequest): Promise<User> {
    try {
      let response: User;

      if (this.useLocalStorage) {
        // Update in local storage
        const currentUser = await authStorageService.getUser();
        if (currentUser) {
          response = { ...currentUser, ...userData, updated_at: new Date().toISOString() };
          await authStorageService.updateUser(response);
        } else {
          throw new Error('No user found in storage');
        }
      } else {
        // Use API
        response = await authApiClient.updateProfile(userData);
      }

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
      // First check local storage
      if (this.useLocalStorage) {
        const storedUser = await authStorageService.getUser();
        if (storedUser) {
          return storedUser;
        }
      }

      // Fall back to API
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