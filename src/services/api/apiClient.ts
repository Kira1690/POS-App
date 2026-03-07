import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { API_CONFIG, HTTP_STATUS } from '@/constants';
import { ApiResponse } from '@/types';
import { TokenManager } from '@/utils/tokenManager';
import { showToast } from '@/utils/toast';

class ApiClient {
  private instance: AxiosInstance;
  private tokenManager: TokenManager;

  constructor() {
    this.tokenManager = new TokenManager();
    this.instance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await this.tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Minimal request logging — only errors are logged (see response interceptor)

        
        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('[API] Request error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const isSilent = (error.config as any)?.silent === true;

        if (__DEV__ && error.response?.status !== 401) {
          console.warn(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status || 'NETWORK'}`);
        }

        // Handle 401 Unauthorized - attempt token refresh BEFORE showing any toast
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.tokenManager.refreshAccessToken();
            if (refreshed && originalRequest.headers) {
              const newToken = await this.tokenManager.getAccessToken();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed — only show auth error toast for user-initiated (non-silent) requests
            await this.tokenManager.clearTokens();
            if (!isSilent) this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors — skip toasts for background sync requests
        if (!isSilent) this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleAuthError(): void {
    showToast({
      type: 'error',
      title: 'Authentication Error',
      message: 'Please log in again',
    });
    
    // TODO: Navigate to login screen
    // This will be implemented when we set up navigation
  }

  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    const data = error.response?.data as ApiResponse;

    // Pure network failures (no HTTP status) are silently ignored —
    // the app works offline via local SQLite and the SyncProvider
    // handles connectivity transitions with a single toast.
    if (!status) return;

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        showToast({
          type: 'error',
          title: 'Invalid Request',
          message: data?.message || 'Please check your input and try again',
        });
        break;
      
      case HTTP_STATUS.FORBIDDEN:
        showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'You don\'t have permission to perform this action',
        });
        break;
      
      case HTTP_STATUS.NOT_FOUND:
        showToast({
          type: 'error',
          title: 'Not Found',
          message: 'The requested resource was not found',
        });
        break;
      
      case HTTP_STATUS.CONFLICT:
        showToast({
          type: 'error',
          title: 'Conflict',
          message: data?.message || 'A conflict occurred with the current state',
        });
        break;
      
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        showToast({
          type: 'error',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later',
        });
        break;
      
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        showToast({
          type: 'error',
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later',
        });
        break;
      
      default:
        if (!navigator.onLine) {
          showToast({
            type: 'error',
            title: 'Network Error',
            message: 'Please check your internet connection',
          });
        } else {
          showToast({
            type: 'error',
            title: 'Network Error',
            message: 'Unable to connect to the server',
          });
        }
    }
  }

  // HTTP Methods
  async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.get(url, config);
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.post(url, data, config);
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.put(url, data, config);
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.patch(url, data, config);
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.delete(url, config);
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set full auth tokens on both the axios defaults AND the TokenManager.
   * This ensures the request interceptor and token refresh both work correctly.
   */
  async setAuthTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    await this.tokenManager.setTokens({ accessToken, refreshToken, expiresAt });
  }

  clearAuthToken(): void {
    delete this.instance.defaults.headers.common['Authorization'];
    this.tokenManager.clearTokens();
  }

  getBaseURL(): string {
    return this.instance.defaults.baseURL || '';
  }

  updateBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();