export enum UserRole {
  RESTAURANT_STAFF = 'restaurant_staff',
  KITCHEN_STAFF = 'kitchen_staff',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  employee_id?: string;
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
  timezone: string;
  operating_hours?: Record<string, any>;
  settings?: Record<string, any>;
  is_active: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  restaurantId?: string;
}

export interface LoginResponse {
  user: User;
  restaurant: Restaurant;
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