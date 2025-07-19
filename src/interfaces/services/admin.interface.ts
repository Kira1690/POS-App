/**
 * Admin Service Interface
 * Defines admin-specific operations
 */

import { User } from '@/types';
import { RegisterUserRequest, PaginationParams } from '@/interfaces/requests.interface';

export interface IAdminService {
  // Admin User Management
  adminRegister(userData: RegisterUserRequest): Promise<any>;
  listUsers(params?: PaginationParams): Promise<any>;
  getMyRegisteredUsers(params?: PaginationParams): Promise<any>;
  getAdminRegisteredUsers(adminId: string, params?: PaginationParams): Promise<any>;
  updateUserByAdmin(userId: string, userData: Partial<User>): Promise<User>;
  deleteUserByAdmin(userId: string, hardDelete?: boolean): Promise<void>;
  
  // Admin Session Management
  getUserSessions(userId: string): Promise<any[]>;
  revokeUserSessions(userId: string): Promise<void>;
  
  // Admin User Status Management
  toggleUserStatus(userId: string, isActive: boolean): Promise<User>;
  getUserById(userId: string): Promise<User>;
  
  // Admin Restaurant Management
  assignUserToRestaurant(userId: string, restaurantId: string, role?: string): Promise<void>;
  removeUserFromRestaurant(userId: string, restaurantId: string): Promise<void>;
}

export interface IAdminAuthApiClient {
  // Admin User Registration
  adminRegister(userData: RegisterUserRequest): Promise<any>;
  
  // User Listing & Management
  listUsers(params?: PaginationParams): Promise<any>;
  getMyRegisteredUsers(params?: PaginationParams): Promise<any>;
  getAdminRegisteredUsers(adminId: string, params?: PaginationParams): Promise<any>;
  
  // User CRUD Operations
  updateUserByAdmin(userId: string, userData: Partial<User>): Promise<User>;
  deleteUserByAdmin(userId: string, hardDelete?: boolean): Promise<void>;
  getUserById(userId: string): Promise<User>;
  
  // Session Management
  getUserSessions(userId: string): Promise<any[]>;
  revokeUserSessions(userId: string): Promise<void>;
  
  // User Status Management
  toggleUserStatus(userId: string, isActive: boolean): Promise<User>;
  
  // Restaurant Assignment
  assignUserToRestaurant(userId: string, restaurantId: string, role?: string): Promise<void>;
  removeUserFromRestaurant(userId: string, restaurantId: string): Promise<void>;
}