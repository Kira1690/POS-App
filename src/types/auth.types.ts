/**
 * Authentication Types
 * Clean, simple type definitions for auth domain
 */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  STORE_ADMIN = 'store_admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  WAITER = 'waiter',
  KITCHEN_STAFF = 'kitchen_staff',
  SELF_ORDER = 'self_order',
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name?: string; // Full name (computed from first_name + last_name)
  email: string;
  phone_number: string;
  role: UserRole;
  employee_id?: string;
  employeeId?: string; // Alias for employee_id (backward compatibility)
  default_restaurant_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  timezone?: string;
  operating_hours?: Record<string, any>;
  settings?: Record<string, any>;
  is_active?: boolean;
  isActive?: boolean; // Alias for is_active (backward compatibility)
  created_at?: string;
  createdAt?: string; // Alias for created_at (backward compatibility)
  updated_at?: string;
  updatedAt?: string; // Alias for updated_at (backward compatibility)
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email?: string;
  employee_id?: string;
  identifier?: string; // Generic identifier (email or employee_id)
  password: string;
  restaurantId?: string;
  isStaffLogin?: boolean; // Flag for staff (employee_id) vs manager (email) login
}

export interface LoginResponse {
  user: User;
  restaurant?: Restaurant;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  user: User | null;
  restaurant: Restaurant | null;
  error: string | null;
  lastLoginAt: string | null;
  sessionExpiresAt: string | null;
}

export type AuthAction =
  | { type: 'AUTH_INITIALIZE_START' }
  | { type: 'AUTH_INITIALIZE_SUCCESS'; payload: { user: User; restaurant?: Restaurant } }
  | { type: 'AUTH_INITIALIZE_FAILURE' }
  | { type: 'AUTH_LOGIN_START' }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: { user: User; restaurant?: Restaurant } }
  | { type: 'AUTH_LOGIN_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT_START' }
  | { type: 'AUTH_LOGOUT_SUCCESS' }
  | { type: 'AUTH_LOGOUT_FAILURE'; payload: string }
  | { type: 'AUTH_UPDATE_USER'; payload: User }
  | { type: 'AUTH_UPDATE_RESTAURANT'; payload: Restaurant }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_SET_ERROR'; payload: string }
  | { type: 'AUTH_SESSION_EXPIRED' };