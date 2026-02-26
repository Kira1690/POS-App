/**
 * Auth Storage Service - SQLite Implementation
 * Handles persistence of authentication data via expo-sqlite.
 *
 * Session metadata (user, restaurant, expiry) stored in auth_session table.
 * Auth tokens stay in SecureStore for security (managed by tokenManager.ts).
 */

import { User, Restaurant, LoginResponse } from '@/types';
import { databaseService } from '@/services/database/DatabaseService';
import { parseJsonColumn, now } from '@/services/database/helpers';
import { DUMMY_CREDENTIALS, DUMMY_RESTAURANTS } from '@/constants/dummyData';

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

// Row type
interface AuthSessionRow {
  id: string;
  user_id: string | null;
  restaurant_id: string | null;
  user_data: string | null;
  restaurant_data: string | null;
  access_token: string | null;
  refresh_token: string | null;
  login_timestamp: string | null;
  expires_at: string | null;
}

class AuthStorageService {
  private get db() {
    return databaseService.getDatabase();
  }

  async saveSession(loginResponse: LoginResponse): Promise<void> {
    let expiresAt: string;
    if (typeof loginResponse.expiresAt === 'number') {
      expiresAt = new Date(loginResponse.expiresAt * 1000).toISOString();
    } else {
      expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    }

    const restaurant: Restaurant = loginResponse.restaurant || {
      id: 'unknown',
      name: 'Unknown Restaurant',
      timezone: 'America/New_York',
      is_active: true,
    };

    await this.db.runAsync(
      `INSERT OR REPLACE INTO auth_session (id, user_id, restaurant_id, user_data, restaurant_data, access_token, refresh_token, login_timestamp, expires_at)
       VALUES ('current', ?, ?, ?, ?, ?, ?, ?, ?)`,
      loginResponse.user?.id || null,
      restaurant.id || null,
      JSON.stringify(loginResponse.user),
      JSON.stringify(restaurant),
      loginResponse.accessToken,
      loginResponse.refreshToken,
      now(),
      expiresAt
    );

    // Also save user and restaurant to their reference tables
    if (loginResponse.user) {
      const u = loginResponse.user;
      await this.db.runAsync(
        `INSERT OR REPLACE INTO users (id, first_name, last_name, email, phone_number, role, employee_id, default_restaurant_id, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        u.id, u.first_name || '', u.last_name || '',
        u.email || '', u.phone_number || null,
        u.role || '', u.employeeId || u.employee_id || null,
        u.default_restaurant_id || null,
        now(), now()
      );
    }

    if (restaurant && restaurant.id !== 'unknown') {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO restaurants (id, name, address, phone, email, timezone, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        restaurant.id, restaurant.name,
        restaurant.address || null, restaurant.phone || null, restaurant.email || null,
        restaurant.timezone || 'America/New_York',
        now(), now()
      );
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const row = await this.db.getFirstAsync<AuthSessionRow>(
      `SELECT * FROM auth_session WHERE id = 'current'`
    );
    if (!row || !row.user_data) return null;

    const user = parseJsonColumn<User>(row.user_data, null as unknown as User);
    const restaurant = parseJsonColumn<Restaurant>(row.restaurant_data, null as unknown as Restaurant);

    if (!user) return null;

    return {
      user,
      restaurant: restaurant || { id: 'unknown', name: 'Unknown', timezone: 'America/New_York', is_active: true } as Restaurant,
      accessToken: row.access_token || '',
      refreshToken: row.refresh_token || '',
      expiresAt: row.expires_at || '',
      loginTimestamp: row.login_timestamp || '',
    };
  }

  async hasValidSession(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;

    const expiresAt = new Date(session.expiresAt);
    const timeRemaining = expiresAt.getTime() - Date.now();

    return timeRemaining > 30000; // 30 second buffer
  }

  async getUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  async getRestaurant(): Promise<Restaurant | null> {
    const session = await this.getSession();
    return session?.restaurant || null;
  }

  async getTokens(): Promise<AuthTokens | null> {
    const row = await this.db.getFirstAsync<AuthSessionRow>(
      `SELECT * FROM auth_session WHERE id = 'current'`
    );
    if (!row || !row.access_token) return null;

    return {
      accessToken: row.access_token,
      refreshToken: row.refresh_token || '',
      expiresAt: row.expires_at || '',
    };
  }

  async updateTokens(tokens: AuthTokens): Promise<void> {
    await this.db.runAsync(
      `UPDATE auth_session SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = 'current'`,
      tokens.accessToken, tokens.refreshToken, tokens.expiresAt
    );
  }

  async updateUser(user: User): Promise<void> {
    await this.db.runAsync(
      `UPDATE auth_session SET user_data = ?, user_id = ? WHERE id = 'current'`,
      JSON.stringify(user), user.id
    );
  }

  async updateRestaurant(restaurant: Restaurant): Promise<void> {
    await this.db.runAsync(
      `UPDATE auth_session SET restaurant_data = ?, restaurant_id = ? WHERE id = 'current'`,
      JSON.stringify(restaurant), restaurant.id
    );
  }

  async clearSession(): Promise<void> {
    await this.db.runAsync(`DELETE FROM auth_session WHERE id = 'current'`);
  }

  async getSessionInfo(): Promise<{
    isValid: boolean;
    expiresAt: string | null;
    loginTimestamp: string | null;
    remainingTime: number | null;
  }> {
    const session = await this.getSession();

    if (!session) {
      return { isValid: false, expiresAt: null, loginTimestamp: null, remainingTime: null };
    }

    const expiresAt = new Date(session.expiresAt);
    const remainingTime = Math.max(0, expiresAt.getTime() - Date.now());

    return {
      isValid: remainingTime > 0,
      expiresAt: session.expiresAt,
      loginTimestamp: session.loginTimestamp,
      remainingTime,
    };
  }

  /**
   * Seed all dummy users and restaurants into SQLite.
   * Skips if users already exist (idempotent).
   */
  async seedDummyUsers(): Promise<void> {
    const existing = await this.db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM users'
    );
    if ((existing?.cnt || 0) >= DUMMY_CREDENTIALS.length) {
      if (__DEV__) {
        console.log('[AuthStorage] Dummy users already seeded');
      }
      return;
    }

    for (const user of DUMMY_CREDENTIALS) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO users (id, first_name, last_name, email, phone_number, role, employee_id, default_restaurant_id, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        user.id,
        user.name.split(' ')[0] || user.name,
        user.name.split(' ').slice(1).join(' ') || '',
        user.email || '',
        '+1234567890',
        user.role,
        user.employeeId || null,
        user.restaurantId,
        now(), now()
      );
    }

    for (const restaurant of DUMMY_RESTAURANTS) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO restaurants (id, name, address, phone, email, timezone, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        restaurant.id, restaurant.name,
        restaurant.address || null, restaurant.phone || null, null,
        'America/New_York',
        now(), now()
      );
    }

    if (__DEV__) {
      console.log(`[AuthStorage] Seeded ${DUMMY_CREDENTIALS.length} dummy users and ${DUMMY_RESTAURANTS.length} restaurants`);
    }
  }
}

// Export singleton instance
export const authStorageService = new AuthStorageService();
