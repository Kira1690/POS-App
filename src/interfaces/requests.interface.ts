/**
 * Request Interfaces
 * All request types for API calls
 */

import { UserRole } from '@/types';

export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  role: UserRole;
  employee_id?: string;
  default_restaurant_id?: string;
  registered_by_admin_id?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  default_restaurant_id?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface DeviceRegistrationRequest {
  device_id: string;
  device_name: string;
  restaurant_id: string;
  device_type: 'pos_terminal' | 'kitchen_display' | 'tablet' | 'mobile_app' | 'web_browser';
  mac_address?: string;
  location?: string;
  device_info?: Record<string, any>;
}

export interface RestaurantCreateRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  tax_id?: string;
  timezone: string;
  operating_hours?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface ShiftStartRequest {
  restaurant_id: string;
  device_id?: string;
  planned_end?: string;
  notes?: string;
}

export interface ShiftEndRequest {
  notes?: string;
}

export interface BreakStartRequest {
  notes?: string;
}

export interface UserRestaurantAssignmentRequest {
  user_id: string;
  role?: string;
  hourly_rate?: number;
}