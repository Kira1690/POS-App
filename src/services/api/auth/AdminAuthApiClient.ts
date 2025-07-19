/**
 * Admin Auth API Client - Admin-specific authentication operations
 * Under 200 lines, single responsibility for admin auth operations
 */

import { SimpleApiClient } from '../base/SimpleApiClient';
import { API_ENDPOINTS } from '@/constants';
import { User, ApiResponse } from '@/types';
import { ITokenProvider, RegisterUserRequest, PaginationParams } from '@/interfaces';

export class AdminAuthApiClient extends SimpleApiClient {
  
  constructor(tokenProvider: ITokenProvider) {
    super({}, tokenProvider);
  }

  // Admin User Registration
  async adminRegister(userData: RegisterUserRequest): Promise<any> {
    const response = await this.post(API_ENDPOINTS.AUTH.ADMIN_REGISTER, userData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Admin registration failed');
    }
    
    return response.data.data;
  }

  // List All Users (Admin only)
  async listUsers(params?: PaginationParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = params ? `${API_ENDPOINTS.AUTH.LIST_USERS}?${queryParams.toString()}` : API_ENDPOINTS.AUTH.LIST_USERS;
    const response = await this.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to list users');
    }
    
    return response.data.data || [];
  }

  // Get Users Registered by Current Admin
  async getMyRegisteredUsers(params?: PaginationParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = params ? `${API_ENDPOINTS.AUTH.MY_REGISTERED_USERS}?${queryParams.toString()}` : API_ENDPOINTS.AUTH.MY_REGISTERED_USERS;
    const response = await this.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get registered users');
    }
    
    return response.data.data || [];
  }

  // Get Users Registered by Specific Admin (Superadmin only)
  async getAdminRegisteredUsers(adminId: string, params?: PaginationParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_ENDPOINTS.AUTH.ADMIN_REGISTERED_USERS}/${adminId}/registered-users${params ? `?${queryParams.toString()}` : ''}`;
    const response = await this.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get admin registered users');
    }
    
    return response.data.data || [];
  }

  // Update User by Admin
  async updateUserByAdmin(userId: string, userData: Partial<User>): Promise<User> {
    const response = await this.put<User>(`${API_ENDPOINTS.AUTH.ADMIN_USER_BASE}/${userId}`, userData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update user');
    }
    
    return response.data.data;
  }

  // Delete User by Admin
  async deleteUserByAdmin(userId: string, hardDelete: boolean = false): Promise<void> {
    const url = `${API_ENDPOINTS.AUTH.ADMIN_USER_BASE}/${userId}${hardDelete ? '?hardDelete=true' : ''}`;
    const response = await this.delete(url);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  }

  // Get User Sessions as Admin
  async getUserSessions(userId: string): Promise<any[]> {
    const response = await this.get(`${API_ENDPOINTS.AUTH.USER_SESSIONS_BASE}/${userId}/sessions`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get user sessions');
    }
    
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  // Revoke All User Sessions as Admin
  async revokeUserSessions(userId: string): Promise<void> {
    const response = await this.delete(`${API_ENDPOINTS.AUTH.USER_SESSIONS_BASE}/${userId}/sessions`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to revoke user sessions');
    }
  }

  // Activate/Deactivate User
  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    const response = await this.put<User>(`${API_ENDPOINTS.AUTH.ADMIN_USER_BASE}/${userId}`, { is_active: isActive });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update user status');
    }
    
    return response.data.data;
  }

  // Get User by ID (Admin only)
  async getUserById(userId: string): Promise<User> {
    const response = await this.get<User>(`${API_ENDPOINTS.AUTH.ADMIN_USER_BASE}/${userId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get user');
    }
    
    return response.data.data;
  }

  // Assign User to Restaurant (Admin only)
  async assignUserToRestaurant(userId: string, restaurantId: string, role?: string): Promise<void> {
    const response = await this.post(`${API_ENDPOINTS.AUTH.ADMIN_USER_BASE}/${userId}/restaurant`, {
      restaurant_id: restaurantId,
      role
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to assign user to restaurant');
    }
  }

  // Remove User from Restaurant (Admin only)
  async removeUserFromRestaurant(userId: string, restaurantId: string): Promise<void> {
    const response = await this.delete(`${API_ENDPOINTS.AUTH.ADMIN_USER_BASE}/${userId}/restaurant/${restaurantId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove user from restaurant');
    }
  }
}