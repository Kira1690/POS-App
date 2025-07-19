import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { APP_CONFIG, API_CONFIG, API_ENDPOINTS } from '@/constants';
import { AuthTokens, RefreshTokenRequest, RefreshTokenResponse } from '@/types';

/**
 * Interface for token refresh functionality
 * Following Dependency Inversion Principle
 */
export interface ITokenRefreshProvider {
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
}

/**
 * Token Manager with dependency injection for refresh functionality
 * Following Single Responsibility Principle - manages only token storage and validation
 * Following Dependency Inversion Principle - depends on abstraction for refresh
 */
export class TokenManager {
  private tokens: AuthTokens | null = null;
  private refreshProvider?: ITokenRefreshProvider;
  private isRefreshing = false;
  private refreshPromise?: Promise<boolean>;

  constructor(refreshProvider?: ITokenRefreshProvider) {
    this.refreshProvider = refreshProvider;
  }

  /**
   * Set the refresh provider after instantiation
   * This helps avoid circular dependencies
   */
  setRefreshProvider(refreshProvider: ITokenRefreshProvider): void {
    this.refreshProvider = refreshProvider;
  }

  /**
   * Get access token with automatic refresh
   * Following Single Responsibility Principle
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.tokens) {
      await this.loadTokens();
    }

    if (!this.tokens) {
      return null;
    }

    // Check if token is expired or about to expire
    if (this.isTokenExpired(this.tokens.expiresAt)) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.tokens.accessToken;
  }

  /**
   * Get refresh token from secure storage
   * Following Single Responsibility Principle
   */
  async getRefreshToken(): Promise<string | null> {
    if (!this.tokens) {
      await this.loadTokens();
    }
    return this.tokens?.refreshToken || null;
  }

  /**
   * Store tokens securely
   * Following Single Responsibility Principle
   */
  async setTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    await this.saveTokens(tokens);
  }

  /**
   * Refresh access token with prevention of concurrent requests
   * Following Single Responsibility Principle
   */
  async refreshAccessToken(): Promise<boolean> {
    // Prevent concurrent refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = undefined;
    }
  }

  /**
   * Perform the actual token refresh operation
   * Following Single Responsibility Principle
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      let response: RefreshTokenResponse;

      if (this.refreshProvider) {
        // Use injected refresh provider
        response = await this.refreshProvider.refreshToken(refreshToken);
      } else {
        // Fallback to direct API call to avoid circular dependency
        response = await this.makeDirectRefreshRequest(refreshToken);
      }
      
      if (response.accessToken) {
        const newTokens: AuthTokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || refreshToken, // Keep old refresh token if new one not provided
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

  /**
   * Direct API refresh request as fallback
   * This avoids circular dependency with AuthApiClient
   * Following Single Responsibility Principle
   */
  private async makeDirectRefreshRequest(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken } as RefreshTokenRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
          withCredentials: true, // Support cookies from API Gateway
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Token refresh failed');
      }

      return response.data.data;
    } catch (error: any) {
      // If this is an axios error, extract meaningful message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Clear all stored tokens
   * Following Single Responsibility Principle
   */
  async clearTokens(): Promise<void> {
    this.tokens = null;
    try {
      await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKENS);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Load tokens from secure storage
   * Following Single Responsibility Principle
   */
  private async loadTokens(): Promise<void> {
    try {
      const tokensJson = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKENS);
      if (tokensJson) {
        this.tokens = JSON.parse(tokensJson);
        
        // Validate loaded tokens structure
        if (!this.isValidTokenStructure(this.tokens)) {
          console.warn('Invalid token structure found, clearing tokens');
          this.tokens = null;
          await this.clearTokens();
        }
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
      this.tokens = null;
    }
  }

  /**
   * Save tokens to secure storage
   * Following Single Responsibility Principle
   */
  private async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKENS, 
        JSON.stringify(tokens)
      );
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error; // Re-throw to indicate save failure
    }
  }

  /**
   * Check if token is expired with buffer time
   * Following Single Responsibility Principle
   */
  private isTokenExpired(expiresAt: number): boolean {
    // Add 5 minute buffer to refresh before actual expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() > (expiresAt - bufferTime);
  }

  /**
   * Validate token structure
   * Following Single Responsibility Principle
   */
  private isValidTokenStructure(tokens: any): tokens is AuthTokens {
    return tokens &&
           typeof tokens.accessToken === 'string' &&
           typeof tokens.refreshToken === 'string' &&
           typeof tokens.expiresAt === 'number' &&
           tokens.accessToken.length > 0 &&
           tokens.refreshToken.length > 0 &&
           tokens.expiresAt > 0;
  }

  /**
   * Utility Methods
   * Following Single Responsibility Principle
   */

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Get token expiry time
   */
  getTokenExpiryTime(): number | null {
    return this.tokens?.expiresAt || null;
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiry(): number | null {
    const expiryTime = this.getTokenExpiryTime();
    if (!expiryTime) {
      return null;
    }
    return Math.max(0, expiryTime - Date.now());
  }

  /**
   * Check if tokens are loaded in memory
   */
  hasTokensInMemory(): boolean {
    return this.tokens !== null;
  }

  /**
   * Force reload tokens from storage
   */
  async reloadTokens(): Promise<void> {
    this.tokens = null;
    await this.loadTokens();
  }

  /**
   * Get tokens info for debugging (without sensitive data)
   */
  getTokensInfo(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    expiresAt: number | null;
    timeUntilExpiry: number | null;
    isExpired: boolean;
  } {
    return {
      hasAccessToken: !!this.tokens?.accessToken,
      hasRefreshToken: !!this.tokens?.refreshToken,
      expiresAt: this.tokens?.expiresAt || null,
      timeUntilExpiry: this.getTimeUntilExpiry(),
      isExpired: this.tokens ? this.isTokenExpired(this.tokens.expiresAt) : true,
    };
  }
}