/**
 * Simple API Client - Clean, focused HTTP client
 * Under 200 lines, single responsibility for HTTP operations
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/constants';
import { ApiResponse, ApiClientConfig } from '@/types';
import { ITokenProvider, IBaseApiClient } from '@/interfaces';
import { showToast } from '@/utils/toast';

export class SimpleApiClient implements IBaseApiClient {
  private instance: AxiosInstance;
  private tokenProvider?: ITokenProvider;

  constructor(config: ApiClientConfig = {}, tokenProvider?: ITokenProvider) {
    this.tokenProvider = tokenProvider;
    this.instance = this.createInstance(config);
    this.setupInterceptors();
  }

  private createInstance(config: ApiClientConfig): AxiosInstance {
    return axios.create({
      baseURL: config.baseURL || API_CONFIG.BASE_URL,
      timeout: config.timeout || API_CONFIG.TIMEOUT,
      withCredentials: config.withCredentials !== false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers,
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        if (this.tokenProvider) {
          const token = await this.tokenProvider.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        
        if (__DEV__) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('[API] Request error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`[API] Response ${response.status}`);
        }
        return response;
      },
      async (error) => {
        if (__DEV__) {
          console.error('[API] Response error:', error.response?.status, error.message);
        }

        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): void {
    // Skip toasts for silent/background requests (e.g. sync engine calls)
    if ((error.config as any)?.silent) return;

    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        this.showError('Invalid Request', data?.message || 'Please check your input');
        break;
      case 401:
        this.showError('Authentication Required', 'Please log in again');
        break;
      case 403:
        this.showError('Access Denied', 'You don\'t have permission');
        break;
      case 404:
        this.showError('Not Found', 'Resource not found');
        break;
      case 500:
        this.showError('Server Error', 'Something went wrong');
        break;
      default:
        if (!navigator.onLine) {
          this.showError('Network Error', 'Check your internet connection');
        } else {
          this.showError('Network Error', 'Unable to connect');
        }
    }
  }

  private showError(title: string, message: string): void {
    showToast({ type: 'error', title, message });
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.put(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.patch(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.delete(url, config);
  }

  // Utility methods
  getBaseURL(): string {
    return this.instance.defaults.baseURL || '';
  }

  updateBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }

  setTokenProvider(tokenProvider: ITokenProvider): void {
    this.tokenProvider = tokenProvider;
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}