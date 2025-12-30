/**
 * Auth Storage Service
 * Handles persistence of authentication data
 *
 * Current: Uses AsyncStorage for local persistence
 * Future: Can integrate with secure backend token storage
 */

import { User, Restaurant, LoginResponse } from '@/types';
import { storageService, STORAGE_KEYS } from './StorageService';

// Auth session structure
export interface AuthSession {
  user: User;
  restaurant: Restaurant;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
  loginTimestamp: string;
}

// Token structure for separate storage
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

/**
 * AuthStorageService - Manages auth persistence
 * Designed to work with both local storage and future API integration
 */
class AuthStorageService {
  /**
   * Save complete auth session after login
   */
  async saveSession(loginResponse: LoginResponse): Promise<void> {
    // expiresAt is a Unix timestamp in seconds or already an ISO string
    let expiresAt: string;
    if (typeof loginResponse.expiresAt === 'number') {
      expiresAt = new Date(loginResponse.expiresAt * 1000).toISOString();
    } else {
      // Fallback: 1 hour from now
      expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    }

    console.log('[AuthStorage] saveSession:', {
      userId: loginResponse.user?.id,
      expiresAtRaw: loginResponse.expiresAt,
      expiresAtConverted: expiresAt,
      hasRestaurant: !!loginResponse.restaurant,
    });

    // Handle optional restaurant with a default
    const restaurant: Restaurant = loginResponse.restaurant || {
      id: 'unknown',
      name: 'Unknown Restaurant',
      timezone: 'America/New_York',
      is_active: true,
    };

    const session: AuthSession = {
      user: loginResponse.user,
      restaurant,
      accessToken: loginResponse.accessToken,
      refreshToken: loginResponse.refreshToken,
      expiresAt,
      loginTimestamp: new Date().toISOString(),
    };

    // Store everything together for session restoration
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);

    // Also store separately for quick access
    await storageService.multiSet([
      { key: STORAGE_KEYS.AUTH_USER, value: loginResponse.user },
      { key: STORAGE_KEYS.AUTH_RESTAURANT, value: loginResponse.restaurant },
      {
        key: STORAGE_KEYS.AUTH_TOKENS,
        value: {
          accessToken: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
          expiresAt,
        } as AuthTokens,
      },
    ]);
  }

  /**
   * Get stored auth session
   */
  async getSession(): Promise<AuthSession | null> {
    return storageService.get<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
  }

  /**
   * Check if user has a valid stored session
   */
  async hasValidSession(): Promise<boolean> {
    const session = await this.getSession();

    if (!session) {
      console.log('[AuthStorage] hasValidSession: No session found');
      return false;
    }

    // Check if session has expired
    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    const timeRemaining = expiresAt.getTime() - now.getTime();

    console.log('[AuthStorage] hasValidSession:', {
      expiresAt: session.expiresAt,
      now: now.toISOString(),
      timeRemainingMs: timeRemaining,
      timeRemainingMin: Math.round(timeRemaining / 60000),
      isValid: timeRemaining > 30000,
    });

    // Session is valid if not expired
    // Adding 30 second buffer before actual expiry
    return expiresAt.getTime() > now.getTime() + 30000;
  }

  /**
   * Get stored user
   */
  async getUser(): Promise<User | null> {
    return storageService.get<User>(STORAGE_KEYS.AUTH_USER);
  }

  /**
   * Get stored restaurant
   */
  async getRestaurant(): Promise<Restaurant | null> {
    return storageService.get<Restaurant>(STORAGE_KEYS.AUTH_RESTAURANT);
  }

  /**
   * Get stored tokens
   */
  async getTokens(): Promise<AuthTokens | null> {
    return storageService.get<AuthTokens>(STORAGE_KEYS.AUTH_TOKENS);
  }

  /**
   * Update tokens after refresh
   */
  async updateTokens(tokens: AuthTokens): Promise<void> {
    await storageService.set(STORAGE_KEYS.AUTH_TOKENS, tokens);

    // Also update in session
    const session = await this.getSession();
    if (session) {
      session.accessToken = tokens.accessToken;
      session.refreshToken = tokens.refreshToken;
      session.expiresAt = tokens.expiresAt;
      await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);
    }
  }

  /**
   * Update user data
   */
  async updateUser(user: User): Promise<void> {
    await storageService.set(STORAGE_KEYS.AUTH_USER, user);

    // Also update in session
    const session = await this.getSession();
    if (session) {
      session.user = user;
      await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);
    }
  }

  /**
   * Update restaurant data
   */
  async updateRestaurant(restaurant: Restaurant): Promise<void> {
    await storageService.set(STORAGE_KEYS.AUTH_RESTAURANT, restaurant);

    // Also update in session
    const session = await this.getSession();
    if (session) {
      session.restaurant = restaurant;
      await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);
    }
  }

  /**
   * Clear all auth data (logout)
   */
  async clearSession(): Promise<void> {
    await Promise.all([
      storageService.remove(STORAGE_KEYS.AUTH_SESSION),
      storageService.remove(STORAGE_KEYS.AUTH_USER),
      storageService.remove(STORAGE_KEYS.AUTH_TOKENS),
      storageService.remove(STORAGE_KEYS.AUTH_RESTAURANT),
    ]);
  }

  /**
   * Get session info (for debugging/display)
   */
  async getSessionInfo(): Promise<{
    isValid: boolean;
    expiresAt: string | null;
    loginTimestamp: string | null;
    remainingTime: number | null;
  }> {
    const session = await this.getSession();

    if (!session) {
      return {
        isValid: false,
        expiresAt: null,
        loginTimestamp: null,
        remainingTime: null,
      };
    }

    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    const remainingTime = Math.max(0, expiresAt.getTime() - now.getTime());

    return {
      isValid: remainingTime > 0,
      expiresAt: session.expiresAt,
      loginTimestamp: session.loginTimestamp,
      remainingTime,
    };
  }
}

// Export singleton instance
export const authStorageService = new AuthStorageService();
