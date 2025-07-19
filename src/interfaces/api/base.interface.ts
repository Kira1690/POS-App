/**
 * Base API Interfaces
 * Simple, focused interface definitions for API clients
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiClientConfig } from '@/types/api.types';
import { RefreshTokenResponse } from '@/types/auth.types';

export interface ITokenProvider {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void>;
  clearTokens(): Promise<void>;
  refreshAccessToken(): Promise<boolean>;
}

export interface IErrorHandler {
  handleError(error: any): void;
  getErrorMessage(error: any): string;
}

export interface IBaseApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  
  getBaseURL(): string;
  updateBaseURL(baseURL: string): void;
}