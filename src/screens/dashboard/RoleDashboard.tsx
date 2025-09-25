/**
 * Role-Based Dashboard Container - Smart dashboard router
 * Renders appropriate dashboard based on user role
 * Under 300 lines, single responsibility for role-based rendering
 */

import React, { useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
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

interface RoleDashboardProps {
  // Navigation will be typed properly in navigation setup
}

const RoleDashboard: React.FC<RoleDashboardProps> = () => {
  const { state: authState } = useAuth();
  const { theme, isDark } = useTheme();

  // Performance tracking
  useEffect(() => {
    performanceMonitor.startRenderTracking('RoleDashboard');
    return () => {
      performanceMonitor.endRenderTracking('RoleDashboard');
    };
  }, [authState.user?.role]);

  // Determine dashboard type based on user role
  const dashboardConfig = useMemo(() => {
    const { user, isAuthenticated } = authState;
    
    if (!isAuthenticated || !user) {
      return { type: 'loading', statusBarStyle: 'dark-content' as const };
    }

    switch (user.role) {
      case UserRole.MANAGER:
      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
        return {
          type: 'manager',
          statusBarStyle: isDark ? 'light-content' : 'dark-content' as const,
          backgroundColor: theme.colors.surface
        };

      case UserRole.RESTAURANT_STAFF:
        return {
          type: 'staff',
          statusBarStyle: 'light-content' as const,
          backgroundColor: '#28a745' // Professional green for staff
        };

      case UserRole.KITCHEN_STAFF:
        return {
          type: 'kitchen',
          statusBarStyle: 'light-content' as const,
          backgroundColor: '#1A1D21' // Dark background for kitchen
        };

      default:
        console.warn(`Unknown user role: ${user.role}`);
        return {
          type: 'manager', // Default fallback
          statusBarStyle: 'dark-content' as const,
          backgroundColor: theme.colors.surface
        };
    }
  }, [authState.user, authState.isAuthenticated, theme, isDark]);

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

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    switch (dashboardConfig.type) {
      case 'manager':
        return <ManagerDashboard />;
      
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
});

export default RoleDashboard;