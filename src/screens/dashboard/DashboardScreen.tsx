import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ProfessionalTheme, DashboardStyles } from '@/constants/theme';
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

  /**
   * Error state
   */
  if (error && !loading) {
    return (
      <View style={DashboardStyles.error}>
        <Text style={DashboardStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadDashboardData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={DashboardStyles.screen}>
      {/* Professional Header */}
      <View style={DashboardStyles.header}>
        <Text style={DashboardStyles.headerTitle}>
          {getTimeGreeting()}, Manager
        </Text>
        <Text style={DashboardStyles.headerSubtitle}>
          The Food Corner • {new Date().toLocaleDateString()}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView
        style={DashboardStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ProfessionalTheme.colors.primary]}
            tintColor={ProfessionalTheme.colors.primary}
          />
        }
      >
        {/* KPI Metrics Section */}
        <View style={DashboardStyles.section}>
          <Text style={DashboardStyles.sectionTitle}>Key Metrics</Text>
          <KPISection kpis={kpis} loading={loading} />
        </View>

        {/* Charts Section */}
        <ChartsSection restaurantId={restaurantId} loading={loading} />

        {/* Quick Actions Section */}
        <QuickActionsSection
          data={quickActions}
          onNavigateToTables={handleNavigateToTables}
          onNavigateToKitchen={handleNavigateToKitchen}
          onNavigateToStaff={handleNavigateToStaff}
          loading={loading}
        />

        {/* Bottom spacing for better scrolling */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  retryButton: {
    backgroundColor: ProfessionalTheme.colors.primary,
    paddingHorizontal: ProfessionalTheme.spacing.lg,
    paddingVertical: ProfessionalTheme.spacing.md,
    borderRadius: ProfessionalTheme.borderRadius.md,
  },
  
  retryButtonText: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.textOnPrimary,
    textAlign: 'center',
  },
  
  bottomSpacing: {
    height: ProfessionalTheme.spacing.xxl,
  },
});

export default DashboardScreen;