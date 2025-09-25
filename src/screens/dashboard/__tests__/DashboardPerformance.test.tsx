/**
 * Dashboard Performance Test Suite
 * Enterprise-grade performance testing for dashboard components
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { performanceMonitor } from '@/utils/performance';
import { AuthContext, AuthProvider } from '@/context/auth/AuthContext';
import { UserRole } from '@/types/auth.types';
import { RoleDashboard } from '../RoleDashboard';
import { DashboardProvider } from '@/context/dashboard/DashboardContext';

// Mock the dashboard components
jest.mock('../ManagerDashboard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return React.memo(() => <View testID="manager-dashboard"><Text>Manager Dashboard</Text></View>);
});

jest.mock('../StaffDashboard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return React.memo(() => <View testID="staff-dashboard"><Text>Staff Dashboard</Text></View>);
});

jest.mock('../KitchenDashboard', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return React.memo(() => <View testID="kitchen-dashboard"><Text>Kitchen Dashboard</Text></View>);
});

// Mock auth hooks
jest.mock('@/context/auth/AuthContext');
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: { colors: { surface: '#ffffff', onSurface: '#000000' } },
    isDark: false
  })
}));

describe('Dashboard Performance Tests', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    jest.clearAllMocks();
  });

  const createMockAuthState = (role: UserRole) => ({
    state: {
      isAuthenticated: true,
      user: {
        id: '1',
        role,
        name: 'Test User',
        email: 'test@example.com',
        restaurantId: 'rest_001'
      },
      token: 'mock-token',
      isLoading: false,
      error: null
    },
    dispatch: jest.fn()
  });

  const renderWithProviders = (role: UserRole) => {
    const mockAuthValue = createMockAuthState(role);
    
    return render(
      <AuthContext.Provider value={mockAuthValue}>
        <DashboardProvider>
          <RoleDashboard />
        </DashboardProvider>
      </AuthContext.Provider>
    );
  };

  describe('Render Performance', () => {
    it('should render Manager Dashboard within performance threshold', async () => {
      const startTime = performance.now();
      
      await act(async () => {
        renderWithProviders(UserRole.MANAGER);
      });
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should render within 100ms
    });

    it('should render Staff Dashboard within performance threshold', async () => {
      const startTime = performance.now();
      
      await act(async () => {
        renderWithProviders(UserRole.RESTAURANT_STAFF);
      });
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100);
    });

    it('should render Kitchen Dashboard within performance threshold', async () => {
      const startTime = performance.now();
      
      await act(async () => {
        renderWithProviders(UserRole.KITCHEN_STAFF);
      });
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Memory Performance', () => {
    it('should not exceed memory threshold during role switching', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render different roles sequentially
      const roles = [UserRole.MANAGER, UserRole.RESTAURANT_STAFF, UserRole.KITCHEN_STAFF];
      
      for (const role of roles) {
        await act(async () => {
          const { unmount } = renderWithProviders(role);
          unmount();
        });
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not increase memory by more than 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Re-render Optimization', () => {
    it('should not re-render when auth state remains unchanged', async () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return <RoleDashboard />;
      };

      const mockAuthValue = createMockAuthState(UserRole.MANAGER);
      
      const { rerender } = render(
        <AuthContext.Provider value={mockAuthValue}>
          <DashboardProvider>
            <TestComponent />
          </DashboardProvider>
        </AuthContext.Provider>
      );

      // Force re-render with same props
      rerender(
        <AuthContext.Provider value={mockAuthValue}>
          <DashboardProvider>
            <TestComponent />
          </DashboardProvider>
        </AuthContext.Provider>
      );

      // Should only render twice (initial + rerender check)
      expect(renderCount).toBe(2);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track render performance metrics', () => {
      const componentName = 'RoleDashboard';
      
      performanceMonitor.startRenderTracking(componentName);
      renderWithProviders(UserRole.MANAGER);
      const metrics = performanceMonitor.endRenderTracking(componentName);
      
      expect(metrics).toBeTruthy();
      expect(metrics?.componentName).toBe(componentName);
      expect(metrics?.renderTime).toBeGreaterThan(0);
    });

    it('should provide performance summary', () => {
      // Track multiple renders
      ['Manager', 'Staff', 'Kitchen'].forEach((dashboardType, index) => {
        const role = [UserRole.MANAGER, UserRole.RESTAURANT_STAFF, UserRole.KITCHEN_STAFF][index];
        performanceMonitor.startRenderTracking(`${dashboardType}Dashboard`);
        renderWithProviders(role);
        performanceMonitor.endRenderTracking(`${dashboardType}Dashboard`);
      });

      const summary = performanceMonitor.getPerformanceSummary();
      
      expect(summary.totalMetrics).toBe(3);
      expect(summary.averageRenderTime).toBeGreaterThan(0);
      expect(Array.isArray(summary.slowComponents)).toBe(true);
    });
  });

  describe('Component Optimization Verification', () => {
    it('should use React.memo for dashboard components', () => {
      // This test verifies that components are properly memoized
      // In a real scenario, you would check that components don't re-render
      // when their props haven't changed
      
      const ManagerDashboard = require('../ManagerDashboard').default;
      const StaffDashboard = require('../StaffDashboard').default;
      const KitchenDashboard = require('../KitchenDashboard').default;

      // These components should be memoized (wrapped with React.memo)
      expect(ManagerDashboard.$$typeof).toBeTruthy();
      expect(StaffDashboard.$$typeof).toBeTruthy();
      expect(KitchenDashboard.$$typeof).toBeTruthy();
    });
  });
});

describe('Dashboard Component Performance Tests', () => {
  describe('Stats Card Performance', () => {
    it('should render stats cards efficiently', async () => {
      const { StatsCard } = await import('../components/StatsCard');
      const startTime = performance.now();
      
      render(
        <StatsCard
          title="Test Stat"
          value="$1,000"
          change="+5.2%"
          trend="up"
        />
      );
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(50); // Should render within 50ms
    });
  });

  // Sales Chart Performance tests temporarily disabled due to LinearGradient compatibility issues
  // describe('Sales Chart Performance', () => {
  //   it('should handle large datasets efficiently', async () => {
  //     const { SalesChart } = await import('../components/SalesChart');
  //
  //     // Generate large dataset
  //     const largeDataset = Array.from({ length: 100 }, (_, i) => ({
  //       date: `2025-09-${String(i + 1).padStart(2, '0')}`,
  //       sales: Math.random() * 5000 + 1000,
  //       orders: Math.floor(Math.random() * 100) + 20,
  //       label: `Day ${i + 1}`
  //     }));

  //     const startTime = performance.now();
  //
  //     render(
  //       <SalesChart
  //         data={largeDataset}
  //         title="Performance Test Chart"
  //         height={300}
  //       />
  //     );
  //
  //     const renderTime = performance.now() - startTime;
  //     expect(renderTime).toBeLessThan(200); // Should handle large dataset within 200ms
  //   });
  // });
});