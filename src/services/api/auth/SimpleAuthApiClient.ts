/**
 * Simple Auth API Client - Clean, focused auth operations
 * Under 200 lines, single responsibility for auth API calls
 */

import { SimpleApiClient } from '../base/SimpleApiClient';
import { TokenManager, ITokenRefreshProvider } from '@/utils/tokenManager';
import { API_ENDPOINTS } from '@/constants';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  User,
  AuthTokens,
  ApiResponse
} from '@/types';
import { ITokenProvider } from '@/interfaces';

export class SimpleAuthApiClient extends SimpleApiClient implements ITokenProvider, ITokenRefreshProvider {
  private tokenManager: TokenManager;

  constructor() {
    const tokenManager = new TokenManager();
    super({}, undefined); // Don't pass token provider initially
    
    this.tokenManager = tokenManager;
    
    // Set up circular dependency properly
    this.setTokenProvider(this);
    this.tokenManager.setRefreshProvider(this);
  }

  // ITokenProvider implementation
  async getAccessToken(): Promise<string | null> {
    return this.tokenManager.getAccessToken();
  }

  async getRefreshToken(): Promise<string | null> {
    return this.tokenManager.getRefreshToken();
  }

  async setTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
    const tokens: AuthTokens = { accessToken, refreshToken, expiresAt };
    return this.tokenManager.setTokens(tokens);
  }

  async clearTokens(): Promise<void> {
    return this.tokenManager.clearTokens();
  }

  async refreshAccessToken(): Promise<boolean> {
    return this.tokenManager.refreshAccessToken();
  }

  // ITokenRefreshProvider implementation
  async refreshToken(refreshTokenValue: string): Promise<RefreshTokenResponse> {
    const response = await this.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken: refreshTokenValue } as RefreshTokenRequest
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Token refresh failed');
    }
    
    return response.data.data;
  }

  // Auth API Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    
    const loginData = response.data.data;
    
    // Extract expiresAt from JWT if not in response
    let expiresAt = loginData.expiresAt;
    if (!expiresAt && loginData.accessToken) {
      try {
        const payload = JSON.parse(atob(loginData.accessToken.split('.')[1]));
        expiresAt = payload.exp || Math.floor(Date.now() / 1000) + 900;
      } catch {
        expiresAt = Math.floor(Date.now() / 1000) + 900;
      }
    }

    // Store tokens
    if (loginData.accessToken && loginData.refreshToken) {
      await this.setTokens(
        loginData.accessToken,
        loginData.refreshToken,
        expiresAt
      );
    }
    
    return loginData;
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async register(userData: any): Promise<any> {
    const response = await this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Registration failed');
    }
    
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get profile');
    }
    
    return response.data.data;
  }

  async updateProfile(userData: any): Promise<User> {
    const response = await this.put<User>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, userData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Profile update failed');
    }
    
    return response.data.data;
  }

  async updatePassword(passwordData: any): Promise<void> {
    const response = await this.put(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, passwordData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Password update failed');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await this.get(API_ENDPOINTS.AUTH.VALIDATE_TOKEN);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;
    
    return this.validateToken();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.getProfile();
    } catch (error) {
      return null;
    }
  }

  // Additional methods can be added here
  async forgotPassword(email: string): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Password reset failed');
    }
  }

  async refreshTokenManually(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.refreshToken(refreshToken);
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Email verification failed');
    }
  }

  async resendEmailVerification(email: string): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to resend verification email');
    }
  }

  async getSessions(): Promise<any[]> {
    const response = await this.get(API_ENDPOINTS.AUTH.SESSIONS);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get sessions');
    }
    
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  async getSessionInfo(sessionId: string): Promise<any> {
    const response = await this.get(`${API_ENDPOINTS.AUTH.SESSIONS}/${sessionId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get session info');
    }
    
    return response.data.data;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const response = await this.delete(`${API_ENDPOINTS.AUTH.SESSIONS}/${sessionId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to revoke session');
    }
  }

  async revokeOtherSessions(): Promise<void> {
    const response = await this.post(API_ENDPOINTS.AUTH.REVOKE_OTHER_SESSIONS);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to revoke other sessions');
    }
  }

  async revokeAllSessions(): Promise<void> {
    const response = await this.delete(API_ENDPOINTS.AUTH.SESSIONS);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to revoke all sessions');
    }
  }

  async softDeleteAccount(): Promise<void> {
    const response = await this.delete(API_ENDPOINTS.AUTH.SOFT_DELETE);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete account');
    }
  }

  async hardDeleteAccount(): Promise<void> {
    const response = await this.delete(API_ENDPOINTS.AUTH.HARD_DELETE);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to permanently delete account');
    }
  }
}