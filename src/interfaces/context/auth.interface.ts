/**
 * Authentication Context Interfaces
 * Simple, focused interface definitions for auth context
 */

import { User, UserRole, Restaurant, LoginRequest, AuthState } from '@/types/auth.types';
import { UpdateProfileRequest } from '@/interfaces/services/auth.interface';

export interface IAuthContext {
  // State
  state: AuthState;
  
  // Actions
  login(credentials: LoginRequest): Promise<void>;
  logout(): Promise<void>;
  updateProfile(userData: UpdateProfileRequest): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  refreshUserData(): Promise<void>;
  switchRestaurant(restaurant: Restaurant): void;
  checkAuthStatus(): Promise<void>;
  clearError(): void;
  
  // Utilities
  hasRole(role: UserRole): boolean;
  hasAnyRole(roles: UserRole[]): boolean;
  canAccessResource(requiredRoles: UserRole[]): boolean;
  getSessionInfo(): {
    timeUntilExpiry: number | null;
    isExpiringSoon: boolean;
  };
}