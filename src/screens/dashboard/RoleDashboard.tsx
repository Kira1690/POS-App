/**
 * Role-Based Dashboard Container - Smart dashboard router
 * Renders appropriate dashboard based on user role with support for multiple dashboard types
 * Under 300 lines, single responsibility for role-based rendering
 * Enhanced with Staff Management Dashboard routing for managers and admins
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { UserRole } from '@/types/auth.types';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { spacing } from '@/design-system/theme/spacing';
import { performanceMonitor } from '@/utils/performance';

// Dashboard imports - lazy loaded for performance
import ManagerDashboard from './ManagerDashboard';
import StaffDashboard from './StaffDashboard';
import KitchenDashboard from './KitchenDashboard';
import StaffManagementDashboard from './StaffManagementDashboard';

interface RoleDashboardProps {
  // Navigation will be typed properly in navigation setup
}

// Dashboard types for managers and admins
type DashboardType = 'overview' | 'staff-management';

const RoleDashboard: React.FC<RoleDashboardProps> = () => {
  const { state: authState } = useAuth();
  const { theme, isDark } = useTheme();

  // State for dashboard type selection (only used for managers/admins)
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardType>('overview');

  // Performance tracking
  useEffect(() => {
    performanceMonitor.startRenderTracking('RoleDashboard');
    return () => {
      performanceMonitor.endRenderTracking('RoleDashboard');
    };
  }, [authState.user?.role, selectedDashboard]);

  // Determine dashboard type based on user role and selected dashboard
  const dashboardConfig = useMemo(() => {
    const { user, isAuthenticated } = authState;

    if (!isAuthenticated || !user) {
      return { type: 'loading', statusBarStyle: 'dark-content' as const, canSwitch: false };
    }

    switch (user.role) {
      case UserRole.MANAGER:
      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
        // Managers and admins can switch between dashboard types
        const dashboardType = selectedDashboard === 'staff-management' ? 'staff-management' : 'manager';
        return {
          type: dashboardType,
          statusBarStyle: isDark ? 'light-content' : 'dark-content' as const,
          backgroundColor: theme.colors.surface,
          canSwitch: true, // Enable dashboard switching
          availableDashboards: [
            { type: 'overview', label: 'Overview Dashboard', icon: 'dashboard' },
            { type: 'staff-management', label: 'Staff Management', icon: 'people' }
          ]
        };

      case UserRole.RESTAURANT_STAFF:
        return {
          type: 'staff',
          statusBarStyle: 'light-content' as const,
          backgroundColor: '#28a745', // Professional green for staff
          canSwitch: false
        };

      case UserRole.KITCHEN_STAFF:
        return {
          type: 'kitchen',
          statusBarStyle: 'light-content' as const,
          backgroundColor: '#1A1D21', // Dark background for kitchen
          canSwitch: false
        };

      default:
        console.warn(`Unknown user role: ${user.role}`);
        return {
          type: 'manager', // Default fallback
          statusBarStyle: 'dark-content' as const,
          backgroundColor: theme.colors.surface,
          canSwitch: false
        };
    }
  }, [authState.user, authState.isAuthenticated, theme, isDark, selectedDashboard]);

  // Handle authentication check
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please log in to access the dashboard.',
        [{ text: 'OK' }]
      );
    }
  }, [authState.isLoading, authState.isAuthenticated]);

  // Dashboard switcher for managers and admins
  const renderDashboardSwitcher = () => {
    if (!dashboardConfig.canSwitch || !dashboardConfig.availableDashboards) {
      return null;
    }

    return (
      <View style={[styles.dashboardSwitcher, { backgroundColor: theme.colors.surface }]}>
        {dashboardConfig.availableDashboards.map((dashboard) => (
          <TouchableOpacity
            key={dashboard.type}
            style={[
              styles.switcherButton,
              selectedDashboard === dashboard.type && {
                backgroundColor: theme.colors.primary,
              },
              { borderColor: theme.colors.outline }
            ]}
            onPress={() => setSelectedDashboard(dashboard.type as DashboardType)}
          >
            <MaterialIcons
              name={dashboard.icon as any}
              size={20}
              color={
                selectedDashboard === dashboard.type
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface
              }
            />
            <Text
              style={[
                styles.switcherText,
                {
                  color: selectedDashboard === dashboard.type
                    ? theme.colors.onPrimary
                    : theme.colors.onSurface
                }
              ]}
            >
              {dashboard.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render appropriate dashboard based on role and selection
  const renderDashboard = () => {
    switch (dashboardConfig.type) {
      case 'manager':
        return <ManagerDashboard />;

      case 'staff-management':
        return <StaffManagementDashboard />;

      case 'staff':
        return <StaffDashboard />;

      case 'kitchen':
        return <KitchenDashboard />;

      case 'loading':
      default:
        return <LoadingScreen message="Loading dashboard..." />;
    }
  };

  // Show loading screen while authenticating
  if (authState.isLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  // Show loading if no authenticated user
  if (!authState.isAuthenticated || !authState.user) {
    return <LoadingScreen message="Please log in to continue..." />;
  }

  return (
    <ErrorBoundary fallback="Dashboard Error">
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: dashboardConfig.backgroundColor || theme.colors.background }
      ]}>
        <StatusBar
          barStyle={dashboardConfig.statusBarStyle}
          backgroundColor={dashboardConfig.backgroundColor || theme.colors.background}
        />

        {/* Dashboard Switcher for managers/admins */}
        {renderDashboardSwitcher()}

        <View style={styles.content}>
          {renderDashboard()}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dashboardSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: spacing.sm,
  },
  switcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
  },
  switcherText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RoleDashboard;