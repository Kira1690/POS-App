/**
 * Auth Status Hook - Simple authentication status utilities
 * Under 100 lines, single responsibility for auth status
 */

import { useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { UserRole } from '@/types';

export const useAuthStatus = () => {
  const { state, hasRole, hasAnyRole, canAccessResource, getSessionInfo } = useAuth();

  // Memoized computations
  const authStatus = useMemo(() => ({
    isLoggedIn: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitializing: state.isInitializing,
    hasError: !!state.error,
    error: state.error,
  }), [state.isAuthenticated, state.isLoading, state.isInitializing, state.error]);

  const userInfo = useMemo(() => ({
    user: state.user,
    restaurant: state.restaurant,
    role: state.user?.role,
    name: state.user ? `${state.user.first_name} ${state.user.last_name}` : null,
    email: state.user?.email,
  }), [state.user, state.restaurant]);

  const sessionInfo = useMemo(() => {
    const session = getSessionInfo();
    return {
      timeUntilExpiry: session.timeUntilExpiry,
      isExpiringSoon: session.isExpiringSoon,
      lastLoginAt: state.lastLoginAt,
      sessionExpiresAt: state.sessionExpiresAt,
    };
  }, [getSessionInfo, state.lastLoginAt, state.sessionExpiresAt]);

  // Role checking utilities
  const isStaff = useMemo(() =>
    hasRole(UserRole.WAITER), [hasRole]
  );

  const isKitchenStaff = useMemo(() =>
    hasRole(UserRole.KITCHEN_STAFF), [hasRole]
  );

  const isCashier = useMemo(() =>
    hasRole(UserRole.CASHIER), [hasRole]
  );

  const isManager = useMemo(() =>
    hasRole(UserRole.MANAGER), [hasRole]
  );

  const isStoreAdmin = useMemo(() =>
    hasRole(UserRole.STORE_ADMIN), [hasRole]
  );

  const isAdmin = useMemo(() =>
    hasAnyRole([UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]), [hasAnyRole]
  );

  const isSuperAdmin = useMemo(() =>
    hasRole(UserRole.SUPER_ADMIN), [hasRole]
  );

  const isManagementLevel = useMemo(() =>
    hasAnyRole([UserRole.STORE_ADMIN, UserRole.MANAGER]), [hasAnyRole]
  );

  const canManageUsers = useMemo(() =>
    canAccessResource([UserRole.STORE_ADMIN, UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]), [canAccessResource]
  );

  const canAccessKitchen = useMemo(() =>
    canAccessResource([UserRole.KITCHEN_STAFF, UserRole.MANAGER, UserRole.STORE_ADMIN]),
    [canAccessResource]
  );

  const canCreateOrders = useMemo(() =>
    canAccessResource([UserRole.STORE_ADMIN, UserRole.MANAGER, UserRole.WAITER, UserRole.SELF_ORDER]),
    [canAccessResource]
  );

  const canAccessBilling = useMemo(() =>
    canAccessResource([UserRole.STORE_ADMIN, UserRole.MANAGER, UserRole.CASHIER]),
    [canAccessResource]
  );

  return {
    // Auth status
    ...authStatus,

    // User info
    ...userInfo,

    // Session info
    ...sessionInfo,

    // Role checks
    isStaff,
    isKitchenStaff,
    isCashier,
    isManager,
    isStoreAdmin,
    isAdmin,
    isSuperAdmin,
    isManagementLevel,

    // Permission checks
    canManageUsers,
    canAccessKitchen,
    canCreateOrders,
    canAccessBilling,

    // Utility functions
    hasRole,
    hasAnyRole,
    canAccessResource,
  };
};