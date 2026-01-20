/**
 * API Types
 * Clean, simple type definitions for API responses and requests
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  statusCode?: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors: any[];
  statusCode: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationResponse;
}

export interface SessionInfo {
  id: string;
  userId: string;
  device: string;
  deviceInfo?: string; // Additional device information
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}