/**
 * Authentication Service Interfaces
 * Simple, focused interface definitions
 */

import { User, UserRole, LoginRequest, LoginResponse, RefreshTokenResponse } from '@/types/auth.types';
import { ApiResponse, PaginationParams, SessionInfo } from '@/types/api.types';

export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  role?: UserRole;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IAuthService {
  // Core auth
  login(credentials: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  register(userData: RegisterUserRequest): Promise<User>;
  
  // Profile
  getProfile(): Promise<User>;
  updateProfile(userData: UpdateProfileRequest): Promise<User>;
  updatePassword(passwordData: UpdatePasswordRequest): Promise<void>;
  
  // Token management
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
  validateToken(): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
  
  // Sessions
  getSessions(): Promise<SessionInfo[]>;
  revokeSession(sessionId: string): Promise<void>;
  revokeOtherSessions(): Promise<void>;
  revokeAllSessions(): Promise<void>;
}

export interface ITokenManager {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void>;
  clearTokens(): Promise<void>;
  refreshAccessToken(): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
}

export interface ITokenRefreshProvider {
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
}

// These interfaces are now imported from base.interface.ts to avoid duplication