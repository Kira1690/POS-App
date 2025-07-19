/**
 * Admin Service - Admin user management operations
 * Under 150 lines, single responsibility for admin operations
 */

import { adminAuthApiClient } from '@/services/api/auth';
import { IAdminService, RegisterUserRequest, PaginationParams } from '@/interfaces';
import { User } from '@/types';

export class AdminService implements IAdminService {
  
  async adminRegister(userData: RegisterUserRequest): Promise<any> {
    try {
      const response = await adminAuthApiClient.adminRegister(userData);
      
      if (__DEV__) {
        console.log('Admin registration successful:', {
          userId: response.user?.id,
          email: response.user?.email,
          role: response.user?.role,
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Admin registration failed:', error.message);
      throw new Error(error.message || 'Admin registration failed');
    }
  }

  async listUsers(params?: PaginationParams): Promise<any> {
    try {
      return await adminAuthApiClient.listUsers(params);
    } catch (error: any) {
      console.error('List users failed:', error.message);
      throw new Error(error.message || 'Failed to list users');
    }
  }

  async getMyRegisteredUsers(params?: PaginationParams): Promise<any> {
    try {
      return await adminAuthApiClient.getMyRegisteredUsers(params);
    } catch (error: any) {
      console.error('Get registered users failed:', error.message);
      throw new Error(error.message || 'Failed to get registered users');
    }
  }

  async getAdminRegisteredUsers(adminId: string, params?: PaginationParams): Promise<any> {
    try {
      return await adminAuthApiClient.getAdminRegisteredUsers(adminId, params);
    } catch (error: any) {
      console.error('Get admin registered users failed:', error.message);
      throw new Error(error.message || 'Failed to get admin registered users');
    }
  }

  async updateUserByAdmin(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const user = await adminAuthApiClient.updateUserByAdmin(userId, userData);
      
      if (__DEV__) {
        console.log('User updated by admin:', {
          userId: user.id,
          updatedFields: Object.keys(userData),
        });
      }
      
      return user;
    } catch (error: any) {
      console.error('Update user by admin failed:', error.message);
      throw new Error(error.message || 'Failed to update user');
    }
  }

  async deleteUserByAdmin(userId: string, hardDelete: boolean = false): Promise<void> {
    try {
      await adminAuthApiClient.deleteUserByAdmin(userId, hardDelete);
      
      if (__DEV__) {
        console.log('User deleted by admin:', {
          userId,
          hardDelete,
        });
      }
    } catch (error: any) {
      console.error('Delete user by admin failed:', error.message);
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  async getUserSessions(userId: string): Promise<any[]> {
    try {
      return await adminAuthApiClient.getUserSessions(userId);
    } catch (error: any) {
      console.error('Get user sessions failed:', error.message);
      throw new Error(error.message || 'Failed to get user sessions');
    }
  }

  async revokeUserSessions(userId: string): Promise<void> {
    try {
      await adminAuthApiClient.revokeUserSessions(userId);
      
      if (__DEV__) {
        console.log('User sessions revoked by admin:', { userId });
      }
    } catch (error: any) {
      console.error('Revoke user sessions failed:', error.message);
      throw new Error(error.message || 'Failed to revoke user sessions');
    }
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const user = await adminAuthApiClient.toggleUserStatus(userId, isActive);
      
      if (__DEV__) {
        console.log('User status toggled by admin:', {
          userId,
          isActive,
        });
      }
      
      return user;
    } catch (error: any) {
      console.error('Toggle user status failed:', error.message);
      throw new Error(error.message || 'Failed to toggle user status');
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      return await adminAuthApiClient.getUserById(userId);
    } catch (error: any) {
      console.error('Get user by ID failed:', error.message);
      throw new Error(error.message || 'Failed to get user');
    }
  }

  async assignUserToRestaurant(userId: string, restaurantId: string, role?: string): Promise<void> {
    try {
      await adminAuthApiClient.assignUserToRestaurant(userId, restaurantId, role);
      
      if (__DEV__) {
        console.log('User assigned to restaurant by admin:', {
          userId,
          restaurantId,
          role,
        });
      }
    } catch (error: any) {
      console.error('Assign user to restaurant failed:', error.message);
      throw new Error(error.message || 'Failed to assign user to restaurant');
    }
  }

  async removeUserFromRestaurant(userId: string, restaurantId: string): Promise<void> {
    try {
      await adminAuthApiClient.removeUserFromRestaurant(userId, restaurantId);
      
      if (__DEV__) {
        console.log('User removed from restaurant by admin:', {
          userId,
          restaurantId,
        });
      }
    } catch (error: any) {
      console.error('Remove user from restaurant failed:', error.message);
      throw new Error(error.message || 'Failed to remove user from restaurant');
    }
  }
}