/**
 * AuthActions Unit Tests
 * Validates logout clears user-specific data when server-connected
 */

import { createAuthActions } from '../AuthActions';

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const mockClearAllOrders = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/storage/UnifiedOrderStorageService', () => ({
  unifiedOrderStorageService: {
    clearAll: () => mockClearAllOrders(),
  },
}));

const mockClearAllKitchen = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/storage/KitchenStorageService', () => ({
  kitchenStorageService: {
    clearAll: () => mockClearAllKitchen(),
  },
}));

const mockGetSession = jest.fn();
const mockResetLastSyncTime = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/storage', () => ({
  authStorageService: {
    getSession: () => mockGetSession(),
  },
  syncQueueService: {
    resetLastSyncTime: () => mockResetLastSyncTime(),
  },
}));

jest.mock('@/utils/toast', () => ({
  showToast: jest.fn(),
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeMockAuthService(logoutResult: 'success' | 'error' = 'success') {
  return {
    login: jest.fn(),
    logout: logoutResult === 'success'
      ? jest.fn().mockResolvedValue(undefined)
      : jest.fn().mockRejectedValue(new Error('Logout failed')),
    register: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthActions.logout', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
  });

  it('clears orders, kitchen, and sync time when server-connected', async () => {
    // Real server token (not dummy_)
    mockGetSession.mockResolvedValue({ accessToken: 'eyJ_real_token_abc' });

    const authService = makeMockAuthService();
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    expect(mockClearAllOrders).toHaveBeenCalledTimes(1);
    expect(mockClearAllKitchen).toHaveBeenCalledTimes(1);
    expect(mockResetLastSyncTime).toHaveBeenCalledTimes(1);
  });

  it('does NOT clear data when using dummy credentials', async () => {
    // Dummy token
    mockGetSession.mockResolvedValue({ accessToken: 'dummy_token_123' });

    const authService = makeMockAuthService();
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    expect(mockClearAllOrders).not.toHaveBeenCalled();
    expect(mockClearAllKitchen).not.toHaveBeenCalled();
    expect(mockResetLastSyncTime).not.toHaveBeenCalled();
  });

  it('does NOT clear data when session is null', async () => {
    mockGetSession.mockResolvedValue(null);

    const authService = makeMockAuthService();
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    expect(mockClearAllOrders).not.toHaveBeenCalled();
    expect(mockClearAllKitchen).not.toHaveBeenCalled();
  });

  it('dispatches AUTH_LOGOUT_START and AUTH_LOGOUT_SUCCESS', async () => {
    mockGetSession.mockResolvedValue({ accessToken: 'dummy_abc' });

    const authService = makeMockAuthService();
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    expect(dispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGOUT_START' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGOUT_SUCCESS' });
  });

  it('calls authService.logout()', async () => {
    mockGetSession.mockResolvedValue({ accessToken: 'dummy_abc' });

    const authService = makeMockAuthService();
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('clearing failure is non-fatal — logout still succeeds', async () => {
    mockGetSession.mockResolvedValue({ accessToken: 'eyJ_real_token' });
    mockClearAllOrders.mockRejectedValueOnce(new Error('SQLite locked'));

    const authService = makeMockAuthService();
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    // Should still dispatch success despite clear failure
    expect(dispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGOUT_SUCCESS' });
  });

  it('dispatches AUTH_LOGOUT_SUCCESS even when authService.logout() fails', async () => {
    mockGetSession.mockResolvedValue({ accessToken: 'dummy_token' });

    const authService = makeMockAuthService('error');
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    // The catch block dispatches AUTH_LOGOUT_SUCCESS as fallback
    expect(dispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGOUT_SUCCESS' });
  });

  it('checks session BEFORE calling authService.logout', async () => {
    const callOrder: string[] = [];
    mockGetSession.mockImplementation(async () => {
      callOrder.push('getSession');
      return { accessToken: 'eyJ_real_token' };
    });

    const authService = makeMockAuthService();
    (authService.logout as jest.Mock).mockImplementation(async () => {
      callOrder.push('authService.logout');
    });

    const { logout } = createAuthActions(authService as any, dispatch);
    await logout();

    expect(callOrder.indexOf('getSession'))
      .toBeLessThan(callOrder.indexOf('authService.logout'));
  });

  it('handles getSession throwing gracefully (assumes not server-connected)', async () => {
    mockGetSession.mockRejectedValue(new Error('Storage unavailable'));

    const authService = makeMockAuthService();
    const { logout } = createAuthActions(authService as any, dispatch);

    await logout();

    // Should not attempt to clear since it couldn't determine connection status
    expect(mockClearAllOrders).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGOUT_SUCCESS' });
  });
});
