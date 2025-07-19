import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/constants';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  User,
  Restaurant 
} from '@/types';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    
    return response.data.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.warn('Logout request failed:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken } as RefreshTokenRequest
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Token refresh failed');
    }
    
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get profile');
    }
    
    return response.data.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      { currentPassword, newPassword }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Password change failed');
    }
  }

  async getUserRestaurants(): Promise<Restaurant[]> {
    const response = await apiClient.get<Restaurant[]>(
      API_ENDPOINTS.USERS.RESTAURANTS
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get restaurants');
    }
    
    return response.data.data;
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Import dummy service for development testing
import { dummyAuthService } from './dummyAuthService';

// TODO: Switch back to real AuthService when backend is integrated
// export const authService = new AuthService();

// For now, use dummy service for UI testing
export const authService = dummyAuthService;