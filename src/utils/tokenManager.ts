import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG, API_ENDPOINTS } from '@/constants';
import { AuthTokens, RefreshTokenRequest, RefreshTokenResponse } from '@/types';

export class TokenManager {
  private tokens: AuthTokens | null = null;

  async getAccessToken(): Promise<string | null> {
    if (!this.tokens) {
      await this.loadTokens();
    }

    if (!this.tokens) {
      return null;
    }

    // Check if token is expired
    if (this.isTokenExpired(this.tokens.expiresAt)) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.tokens.accessToken;
  }

  async getRefreshToken(): Promise<string | null> {
    if (!this.tokens) {
      await this.loadTokens();
    }
    return this.tokens?.refreshToken || null;
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    await this.saveTokens(tokens);
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      // Make refresh request (we'll implement this properly when auth service is ready)
      const response = await this.makeRefreshRequest(refreshToken);
      
      if (response) {
        const newTokens: AuthTokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
        };
        
        await this.setTokens(newTokens);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return false;
    }
  }

  async clearTokens(): Promise<void> {
    this.tokens = null;
    await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKENS);
  }

  private async loadTokens(): Promise<void> {
    try {
      const tokensJson = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKENS);
      if (tokensJson) {
        this.tokens = JSON.parse(tokensJson);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
      this.tokens = null;
    }
  }

  private async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKENS, 
        JSON.stringify(tokens)
      );
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  private isTokenExpired(expiresAt: number): boolean {
    // Add 5 minute buffer to refresh before actual expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() > (expiresAt - bufferTime);
  }

  private async makeRefreshRequest(refreshToken: string): Promise<RefreshTokenResponse | null> {
    try {
      // This is a simplified version - we'll implement the actual API call later
      // For now, we'll return null to indicate refresh failed
      // TODO: Implement actual refresh API call when auth service is integrated
      return null;
    } catch (error) {
      console.error('Refresh request failed:', error);
      return null;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return this.tokens !== null && !this.isTokenExpired(this.tokens.expiresAt);
  }

  getTokenExpiryTime(): number | null {
    return this.tokens?.expiresAt || null;
  }
}