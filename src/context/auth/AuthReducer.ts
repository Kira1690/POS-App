/**
 * Auth Reducer - Simple, focused state management
 * Under 100 lines, single responsibility
 */

import { AuthState, AuthAction, User, Restaurant } from '@/types';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  user: null,
  restaurant: null,
  error: null,
  lastLoginAt: null,
  sessionExpiresAt: null,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_INITIALIZE_START':
      return { ...state, isInitializing: true, error: null };
      
    case 'AUTH_INITIALIZE_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isInitializing: false,
        isLoading: false,
        user: action.payload.user,
        restaurant: action.payload.restaurant || null,
        error: null,
        lastLoginAt: new Date().toISOString(),
      };
      
    case 'AUTH_INITIALIZE_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isInitializing: false,
        isLoading: false,
        user: null,
        restaurant: null,
        error: null,
      };
      
    case 'AUTH_LOGIN_START':
      return { ...state, isLoading: true, error: null };
      
    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        restaurant: action.payload.restaurant || null,
        error: null,
        lastLoginAt: new Date().toISOString(),
        sessionExpiresAt: new Date(Date.now() + (15 * 60 * 1000)).toISOString(),
      };
      
    case 'AUTH_LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        restaurant: null,
        error: action.payload,
      };
      
    case 'AUTH_LOGOUT_START':
      return { ...state, isLoading: true, error: null };
      
    case 'AUTH_LOGOUT_SUCCESS':
      return { ...initialAuthState, isInitializing: false };
      
    case 'AUTH_LOGOUT_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
      
    case 'AUTH_UPDATE_USER':
      return { ...state, user: action.payload };
      
    case 'AUTH_UPDATE_RESTAURANT':
      return { ...state, restaurant: action.payload };
      
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'AUTH_SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'AUTH_SESSION_EXPIRED':
      return {
        ...initialAuthState,
        isInitializing: false,
        error: 'Your session has expired. Please log in again.',
      };
      
    default:
      return state;
  }
};