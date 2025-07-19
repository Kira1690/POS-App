/**
 * Main Auth Service - Clean composition of focused services
 * Under 200 lines, delegates to specialized services
 */

import { IAuthService, RegisterUserRequest, UpdateProfileRequest, UpdatePasswordRequest, PaginationParams } from '@/interfaces';
import { User, LoginRequest, LoginResponse, RefreshTokenResponse, Restaurant } from '@/types';
import { SessionInfo } from '@/types/api.types';
import { CoreAuthService } from './core/CoreAuthService';
import { ProfileService } from './profile/ProfileService';
import { SessionService } from './session/SessionService';
import { adminService } from './admin';

export class AuthService implements IAuthService {
  private coreAuth: CoreAuthService;
  private profile: ProfileService;
  private session: SessionService;

  constructor() {
    this.coreAuth = new CoreAuthService();
    this.profile = new ProfileService();
    this.session = new SessionService();
  }

  // Core Authentication - delegate to CoreAuthService
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.coreAuth.login(credentials);
  }

  async logout(): Promise<void> {
    return this.coreAuth.logout();
  }

  async register(userData: RegisterUserRequest): Promise<User> {
    const response = await this.coreAuth.register(userData);
    return response.user;
  }

  // Token Management - delegate to CoreAuthService
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.coreAuth.refreshToken(refreshToken);
  }

  async validateToken(): Promise<boolean> {
    return this.coreAuth.validateToken();
  }

  async isAuthenticated(): Promise<boolean> {
    return this.coreAuth.isAuthenticated();
  }

  // Password Management - delegate to CoreAuthService
  async forgotPassword(email: string): Promise<void> {
    return this.coreAuth.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.coreAuth.resetPassword(token, newPassword);
  }

  async verifyEmail(token: string): Promise<void> {
    return this.coreAuth.verifyEmail(token);
  }

  async resendEmailVerification(email: string): Promise<void> {
    return this.coreAuth.resendEmailVerification(email);
  }

  // Profile Management - delegate to ProfileService
  async getProfile(): Promise<User> {
    return this.profile.getProfile();
  }

  async updateProfile(userData: UpdateProfileRequest): Promise<User> {
    return this.profile.updateProfile(userData);
  }

  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    return this.profile.updatePassword(passwordData);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.profile.getCurrentUser();
  }

  async deleteAccount(type: 'soft' | 'hard' = 'soft'): Promise<void> {
    return this.profile.deleteAccount(type);
  }

  // Session Management - delegate to SessionService
  async getSessions(): Promise<SessionInfo[]> {
    return this.session.getSessions();
  }

  async revokeSession(sessionId: string): Promise<void> {
    return this.session.revokeSession(sessionId);
  }

  async revokeOtherSessions(): Promise<void> {
    return this.session.revokeOtherSessions();
  }

  async revokeAllSessions(): Promise<void> {
    return this.session.revokeAllSessions();
  }

  // Legacy method support for backward compatibility
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.updatePassword({ currentPassword, newPassword });
  }

  async getUserRestaurants(): Promise<Restaurant[]> {
    // This will be implemented when restaurant service is created
    console.warn('getUserRestaurants not yet implemented - restaurant service needed');
    return [];
  }

  // Admin operations - delegate to AdminService
  async registerUserByAdmin(userData: RegisterUserRequest): Promise<any> {
    return adminService.adminRegister(userData);
  }

  async listUsers(options?: PaginationParams): Promise<any> {
    return adminService.listUsers(options);
  }

  async getMyRegisteredUsers(options?: PaginationParams): Promise<any> {
    return adminService.getMyRegisteredUsers(options);
  }

  async updateUserByAdmin(userId: string, userData: Partial<User>): Promise<User> {
    return adminService.updateUserByAdmin(userId, userData);
  }

  async deleteUserByAdmin(userId: string, hardDelete?: boolean): Promise<void> {
    return adminService.deleteUserByAdmin(userId, hardDelete);
  }

  async getUserById(userId: string): Promise<User> {
    return adminService.getUserById(userId);
  }

  async getUserSessions(userId: string): Promise<any[]> {
    return adminService.getUserSessions(userId);
  }

  async revokeUserSessions(userId: string): Promise<void> {
    return adminService.revokeUserSessions(userId);
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    return adminService.toggleUserStatus(userId, isActive);
  }

  async assignUserToRestaurant(userId: string, restaurantId: string, role?: string): Promise<void> {
    return adminService.assignUserToRestaurant(userId, restaurantId, role);
  }

  async removeUserFromRestaurant(userId: string, restaurantId: string): Promise<void> {
    return adminService.removeUserFromRestaurant(userId, restaurantId);
  }
}

// Create and export the singleton instance
export const authService = new AuthService();

// Export the class for testing and custom instances
export { AuthService as AuthServiceClass };