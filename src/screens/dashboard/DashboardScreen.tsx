import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleButton,
  AppleCard,
  AppleStatusPill,
  AppleProgressBar,
} from '@/components/apple';
import { KPISection } from './components/KPISection';
import { QuickActionsSection } from './components/QuickActionsSection';
import { ChartsSection } from './components/ChartsSection';
import { MockAnalyticsService } from '@/services/analytics/MockAnalyticsService';
import { KPIMetrics, QuickActionData } from '@/types/dashboard.types';

export const DashboardScreen: React.FC = () => {
  // State management
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [quickActions, setQuickActions] = useState<QuickActionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Services
  const analyticsService = MockAnalyticsService.getInstance();

  // Mock restaurant ID (would come from auth context in real app)
  const restaurantId = 'rest_001';

  /**
   * Load dashboard data
   */
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const [kpiData, quickActionData] = await Promise.all([
        analyticsService.getKPIMetrics(restaurantId, {
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        }),
        analyticsService.getQuickActionData(restaurantId),
      ]);

      setKpis(kpiData);
      setQuickActions(quickActionData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [analyticsService, restaurantId]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(true);
  }, [loadDashboardData]);

  /**
   * Handle real-time updates
   */
  useEffect(() => {
    const unsubscribe = analyticsService.subscribeToRealTimeUpdates(
      restaurantId,
      (updates) => {
        if (updates.kpis) {
          setKpis(updates.kpis);
        }
        if (updates.quickActions) {
          setQuickActions(updates.quickActions);
        }
      }
    );

    return unsubscribe;
  }, [analyticsService, restaurantId]);

  /**
   * Load data when screen is focused
   */
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  /**
   * Navigation handlers for quick actions
   */
  const handleNavigateToTables = () => {
    // TODO: Navigate to tables screen
    Alert.alert('Navigation', 'Navigate to Tables screen');
  };

  const handleNavigateToKitchen = () => {
    // TODO: Navigate to kitchen screen
    Alert.alert('Navigation', 'Navigate to Kitchen screen');
  };

  const handleNavigateToStaff = () => {
    // TODO: Navigate to staff screen
    Alert.alert('Navigation', 'Navigate to Staff screen');
  };

  /**
   * Get current time greeting
   */
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const { theme, isDark } = useTheme();

  /**
   * APPLE ERROR STATE (using universal components)
   */
  if (error && !loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}>
        <AppleCard layer="surface" size="large" style={{ alignItems: 'center' }}>
          <Text style={{
            color: theme.colors.onSurface,
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            textAlign: 'center'
          }}>
            {error}
          </Text>
          <AppleButton
            title="Retry"
            variant="primary"
            size="large"
            onPress={() => loadDashboardData()}
          />
        </AppleCard>
      </View>
    );
  }

  /**
   * APPLE DASHBOARD HEADER ACTIONS (using universal components)
   */
  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleStatusPill status="online" size="small" />
      <AppleButton
        title="Refresh"
        icon={<MaterialIcons name="refresh" size={16} color={theme.colors.onSecondary} />}
        variant="secondary"
        size="medium"
        onPress={() => loadDashboardData(true)}
      />
    </View>
  );

  /**
   * APPLE QUICK ACTIONS (using universal components)
   */
  const renderQuickActions = () => (
    <AppleCard layer="surface" size="large" style={{
      marginBottom: 20,
      padding: 24,
      ...theme.shadows.md,
      elevation: 4
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <MaterialIcons name="flash-on" size={20} color={theme.colors.primary} />
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.onSurface,
        }}>
          Quick Actions
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <AppleButton
          title="Tables"
          icon={<MaterialIcons name="table-restaurant" size={18} color={theme.colors.onPrimary} />}
          variant="primary"
          size="large"
          onPress={handleNavigateToTables}
        />
        <AppleButton
          title="Kitchen"
          icon={<MaterialIcons name="restaurant" size={18} color={theme.colors.onSecondary} />}
          variant="secondary"
          size="large"
          onPress={handleNavigateToKitchen}
        />
        <AppleButton
          title="Staff"
          icon={<MaterialIcons name="group" size={18} color={theme.colors.onSurface} />}
          variant="ghost"
          size="large"
          onPress={handleNavigateToStaff}
        />
      </View>
    </AppleCard>
  );

  /**
   * APPLE DASHBOARD LAYOUT (using universal AppleDashboardPanel)
   */
  return (
    <AppleDashboardPanel
      title={`${getTimeGreeting()}, Manager`}
      subtitle={`The Food Corner • ${new Date().toLocaleDateString()}`}
      headerActions={headerActions}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* APPLE KPI METRICS SECTION (using universal components) */}
      <AppleCard layer="surfaceVariant" size="large" style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>
            Key Metrics
          </Text>
        </View>
        <KPISection kpis={kpis} loading={loading} />
      </AppleCard>

      {/* APPLE CHARTS SECTION (with Apple card wrapper) */}
      <AppleCard layer="surface" size="large" style={{ marginBottom: 20 }}>
        <ChartsSection restaurantId={restaurantId} loading={loading} />
      </AppleCard>

      {/* APPLE QUICK ACTIONS SECTION */}
      {renderQuickActions()}

      {/* APPLE STATUS INDICATORS (demonstrating status pills) */}
      <AppleCard layer="surfaceVariant" size="medium" style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: 12
        }}>
          System Status
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <AppleStatusPill status="active" text="POS System" size="small" />
          <AppleStatusPill status="online" text="Kitchen" size="small" />
          <AppleStatusPill status="success" text="Payments" size="small" />
          <AppleStatusPill status="warning" text="Low Stock" size="small" />
        </View>
      </AppleCard>

      {/* APPLE PROGRESS INDICATORS (demonstrating progress bars) */}
      <AppleCard layer="surface" size="medium">
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: 16
        }}>
          Today's Progress
        </Text>
        <View style={{ gap: 12 }}>
          <AppleProgressBar
            progress={0.75}
            label="Sales Target"
            color="success"
            showPercentage
            size="medium"
          />
          <AppleProgressBar
            progress={0.92}
            label="Order Completion"
            color="primary"
            showPercentage
            size="medium"
          />
          <AppleProgressBar
            progress={0.68}
            label="Customer Satisfaction"
            color="warning"
            showPercentage
            size="medium"
          />
        </View>
      </AppleCard>
    </AppleDashboardPanel>
  );
};

export default DashboardScreen;