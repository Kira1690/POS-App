# POS-App API Integration Plan

## Overview

This document outlines the integration strategy between the POS-App React Native frontend and the POS-Auth-Service backend, including API service implementation, authentication flows, error handling, and state management.

## Architecture Summary

### Frontend (POS-App)
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript with strict mode
- **State Management**: Context API + useReducer pattern
- **HTTP Client**: Axios with interceptors

### Backend (POS-Auth-Service)
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT + Refresh Tokens
- **Multi-tenant**: Restaurant-based isolation
- **Session Management**: Maximum 3 concurrent sessions

## API Integration Strategy

### 1. Base API Client Configuration

#### File: `src/services/api/authApiClient.ts`
```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EXPO_PUBLIC_API_URL } from '../../constants/config';
import { tokenManager } from '../../utils/tokenManager';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  success: false;
  message: string;
  errors: any[];
  statusCode: number;
}

export class AuthApiClient {
  private client: AxiosInstance;
  private refreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${EXPO_PUBLIC_API_URL}/auth`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth tokens
    this.client.interceptors.request.use(
      async (config) => {
        const accessToken = await tokenManager.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // Queue requests while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const newTokens = await this.refreshToken();
            this.failedQueue.forEach(({ resolve }) => resolve(newTokens.accessToken));
            this.failedQueue = [];
            
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            await tokenManager.clearTokens();
            // Navigate to login screen
            throw refreshError;
          } finally {
            this.refreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    const refreshToken = await tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/refreshtoken', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    await tokenManager.setTokens(accessToken, newRefreshToken);
    
    return { accessToken, refreshToken: newRefreshToken };
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
    return response.data;
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
    return response.data;
  }
}

export const authApiClient = new AuthApiClient();
```

### 2. Authentication Service Implementation

#### File: `src/services/auth/authApiService.ts`
```typescript
import { authApiClient } from '../api/authApiClient';
import { tokenManager } from '../../utils/tokenManager';

export interface LoginRequest {
  email: string;
  password: string;
  device_id?: string;
  restaurant_id?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    restaurants: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  session: {
    id: string;
    device_info: any;
    expires_at: string;
  };
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  role?: string;
}

export class AuthApiService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await authApiClient.post<LoginResponse>('/login', credentials);
    
    if (response.success) {
      // Store tokens securely
      await tokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      
      // Store user data
      await tokenManager.setUserData(response.data.user);
    }
    
    return response.data;
  }

  async staffLogin(employeeId: string, password: string): Promise<LoginResponse> {
    return this.login({
      email: employeeId, // Staff might use employee ID as email
      password,
      device_id: await this.getDeviceId(),
    });
  }

  async managerLogin(email: string, password: string): Promise<LoginResponse> {
    return this.login({
      email,
      password,
      device_id: await this.getDeviceId(),
    });
  }

  async register(userData: RegisterRequest): Promise<any> {
    const response = await authApiClient.post('/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await authApiClient.post('/logout');
    } catch (error) {
      // Log error but continue with local logout
      console.error('Logout API error:', error);
    } finally {
      await tokenManager.clearTokens();
    }
  }

  async getCurrentUser(): Promise<any> {
    const response = await authApiClient.get('/me');
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await authApiClient.put('/update-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await authApiClient.post('/forgot-password', { email });
  }

  async resetPassword(password: string, resetToken: string): Promise<void> {
    await authApiClient.post('/reset-password', { password, resetToken });
  }

  async validateToken(): Promise<boolean> {
    try {
      await authApiClient.get('/validate-token');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSessions(): Promise<any[]> {
    const response = await authApiClient.get('/sessions');
    return response.data;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await authApiClient.delete(`/session/${sessionId}`);
  }

  async revokeOtherSessions(): Promise<void> {
    await authApiClient.post('/revoke-other-sessions');
  }

  private async getDeviceId(): Promise<string> {
    // Implementation to get unique device identifier
    // Use expo-device or generate persistent UUID
    return 'device-uuid';
  }
}

export const authApiService = new AuthApiService();
```

### 3. Token Management Utility

#### File: `src/utils/tokenManager.ts`
```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

export class TokenManager {
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_DATA_KEY),
    ]);
  }

  async setUserData(userData: any): Promise<void> {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }

  async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  async isLoggedIn(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  }
}

export const tokenManager = new TokenManager();
```

### 4. Authentication Context

#### File: `src/context/AuthContext.tsx`
```typescript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApiService } from '../services/auth/authApiService';
import { tokenManager } from '../utils/tokenManager';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  restaurants: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  staffLogin: (employeeId: string, password: string) => Promise<void>;
  managerLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await tokenManager.isLoggedIn();
      if (isLoggedIn) {
        const userData = await tokenManager.getUserData();
        if (userData) {
          // Validate token with server
          const isValid = await authApiService.validateToken();
          if (isValid) {
            dispatch({ type: 'AUTH_SUCCESS', payload: userData });
          } else {
            await tokenManager.clearTokens();
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authApiService.login({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const staffLogin = async (employeeId: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authApiService.staffLogin(employeeId, password);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Staff login failed' });
      throw error;
    }
  };

  const managerLogin = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authApiService.managerLogin(email, password);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Manager login failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        staffLogin,
        managerLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. Error Handling Strategy

#### File: `src/utils/apiErrorHandler.ts`
```typescript
import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: any[];
  statusCode: number;
}

export class ApiError extends Error {
  statusCode: number;
  errors: any[];

  constructor(message: string, statusCode: number, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: AxiosError): ApiError => {
  if (error.response?.data) {
    const apiError = error.response.data as ApiErrorResponse;
    return new ApiError(
      apiError.message || 'API request failed',
      apiError.statusCode || error.response.status,
      apiError.errors || []
    );
  }

  if (error.request) {
    return new ApiError('Network error - please check your connection', 0);
  }

  return new ApiError(error.message || 'Unknown error occurred', 0);
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};
```

## Implementation Timeline

### Phase 1: Core Authentication (Week 1)
- [x] Set up base API client with interceptors
- [x] Implement token management utility
- [x] Create authentication service
- [x] Set up authentication context
- [x] Integrate login screens with API

### Phase 2: Advanced Features (Week 2)
- [ ] Multi-factor authentication (OTP)
- [ ] Restaurant selection for multi-tenant users
- [ ] Device registration and tracking
- [ ] Session management features
- [ ] Biometric authentication integration

### Phase 3: Enhanced Security (Week 3)
- [ ] Automatic token refresh optimization
- [ ] Offline authentication fallback
- [ ] Security logging and monitoring
- [ ] Password policy enforcement
- [ ] Account lockout mechanisms

### Phase 4: Testing & Optimization (Week 4)
- [ ] Unit tests for auth services
- [ ] Integration tests for auth flows
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Documentation completion

## Security Considerations

1. **Token Storage**: Use Expo SecureStore for sensitive tokens
2. **Network Security**: Implement certificate pinning for production
3. **Biometric Integration**: Secure biometric data handling
4. **Session Management**: Automatic session cleanup
5. **Error Logging**: Secure error reporting without exposing sensitive data

## Configuration

### Environment Variables
```typescript
// src/constants/config.ts
export const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const EXPO_PUBLIC_WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
export const MAX_RETRY_ATTEMPTS = 3;
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
```

### API Configuration
```typescript
// src/constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    REFRESH: '/refreshtoken',
    VALIDATE: '/validate-token',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    ME: '/me',
    SESSIONS: '/sessions',
  },
} as const;
```

This comprehensive API integration plan provides a robust foundation for connecting the POS-App frontend with the POS-Auth-Service backend, ensuring secure authentication, proper error handling, and optimal user experience.