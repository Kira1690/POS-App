/**
 * Kitchen Dashboard - Kitchen display system with order queues and timing
 * Matches wireframe 2.3 Kitchen Dashboard
 * Under 300 lines, focused on kitchen operations display
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import {
  getKitchenDashboardData,
  getOrdersByStatus,
  getStationEfficiency,
  getOverdueOrders,
  getKitchenAlerts,
  type KitchenDashboardData
} from '@/data/dashboard/kitchenDashboard';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Get kitchen theme colors from centralized theme
const getKitchenTheme = (theme: any) => ({
  background: theme.colors.layer0,
  header: theme.colors.statusColors.high,
  white: theme.colors.onPrimary,

  // Station colors
  appetizers: theme.colors.statusColors.excellent,
  mainCourse: theme.colors.statusColors.urgent,
  sushi: theme.colors.statusColors.info,
  desserts: theme.colors.primary,

  // Status colors
  urgent: theme.colors.statusColors.urgent,
  warning: theme.colors.statusColors.warning,
  ready: theme.colors.statusColors.ready,
  preparing: theme.colors.statusColors.preparing,
  queue: theme.colors.statusColors.cancelled,
});

interface KitchenDashboardProps {}

const KitchenDashboard: React.FC<KitchenDashboardProps> = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();
  const KITCHEN_THEME = getKitchenTheme(theme);
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get centralized kitchen dashboard data
  const kitchenData = useMemo(() => {
    // Use employee ID from auth state, fallback to CHEF001 for demo
    const employeeId = authState.user?.employeeId || 'CHEF001';
    const data = getKitchenDashboardData(employeeId);

    // Update with current user info from auth state
    return {
      ...data,
      restaurant: {
        ...data.restaurant,
        name: authState.restaurant?.name || data.restaurant.name,
      },
      chef: {
        ...data.chef,
        name: authState.user?.name || data.chef.name,
        employeeId: authState.user?.employeeId || data.chef.employeeId,
      },
      currentTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
  }, [authState]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Use centralized control buttons data
  const controlButtons = useMemo(() => kitchenData.controls, [kitchenData]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: KITCHEN_THEME.header }]}>
      <View style={styles.headerLeft}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="access-time" size={24} color="white" />
          <Text style={styles.timeDisplay}>
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerCenter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MaterialIcons name="restaurant" size={32} color="white" />
          <Text style={styles.headerTitle}>
            KITCHEN DISPLAY SYSTEM
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="person" size={20} color="white" />
          <Text style={styles.chefInfo}>
            {kitchenData.chef.name} ({kitchenData.chef.employeeId})
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStationStatus = () => (
    <View style={[styles.stationStatusBar, { backgroundColor: theme.colors.surface }]}>
      {kitchenData.stations.map((station, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.stationIndicator,
            { backgroundColor: station.color }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name="restaurant" size={16} color="white" />
            <Text style={styles.stationText}>
              {station.name} ({station.count})
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPriorityQueue = () => (
    <View style={[styles.priorityQueue, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.priorityTitle, { color: KITCHEN_THEME.urgent }]}>
        PRIORITY ORDERS - IMMEDIATE ATTENTION
      </Text>
      
      <View style={styles.priorityOrdersRow}>
        {kitchenData.priorityOrders.map((order) => (
          <View
            key={order.id}
            style={[
              styles.priorityOrderCard,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.error,
              }
            ]}
          >
            <Text style={[styles.priorityOrderTitle, { color: theme.colors.onSurface }]}>
              {order.type}
            </Text>
            <Text style={[styles.priorityOrderTime, { color: theme.colors.onSurfaceVariant }]}>
              {order.timeInfo}
            </Text>
            <View style={styles.priorityOrderItems}>
              {order.items.map((item, index) => (
                <Text key={index} style={[styles.priorityOrderItem, { color: theme.colors.onSurface }]}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActiveOrdersQueue = () => (
    <View style={[styles.activeOrdersQueue, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.queueTitle, { color: theme.colors.onSurface }]}>
        ACTIVE ORDERS QUEUE
      </Text>
      
      <View style={styles.ordersGrid}>
        {kitchenData.activeOrders.map((order) => (
          <View
            key={order.id}
            style={[
              styles.orderCard,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              }
            ]}
          >
            <Text style={[styles.orderTitle, { color: theme.colors.onSurface }]}>
              {order.title}
            </Text>
            <Text style={[styles.orderTime, { color: theme.colors.primary }]}>
              {order.time}
            </Text>
            <View style={styles.orderItems}>
              {order.items.map((item, index) => (
                <Text key={index} style={[styles.orderItem, { color: theme.colors.onSurface }]}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderKitchenControls = () => (
    <View style={[styles.kitchenControls, { backgroundColor: KITCHEN_THEME.background }]}>
      <Text style={styles.controlsTitle}>
        KITCHEN CONTROLS
      </Text>

      <View style={styles.controlsGrid}>
        {controlButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.controlButton,
              { backgroundColor: button.color }
            ]}
          >
            <MaterialIcons name={button.icon as any} size={24} color={theme.colors.onPrimary} />
            <Text style={styles.controlButtonText}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.timerDisplay}>
        Average Prep Time: {kitchenData.metrics.averagePrepTime} minutes
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      height: 100,
    },
    headerLeft: {
      flex: 1,
    },
    headerCenter: {
      flex: 2,
      alignItems: 'center',
    },
    headerRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    timeDisplay: {
      ...typography.titleLarge,
      color: theme.colors.onPrimary,
      fontWeight: '700',
    },
    headerTitle: {
      ...typography.headlineLarge,
      color: theme.colors.onPrimary,
      fontWeight: '700',
      fontSize: 32,
    },
    chefInfo: {
      ...typography.titleMedium,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    stationStatusBar: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    stationIndicator: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    stationText: {
      ...typography.titleMedium,
      color: theme.colors.onPrimary,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    priorityQueue: {
      padding: spacing.xl,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.error,
      marginBottom: spacing.xl,
    },
    priorityTitle: {
      ...typography.headlineSmall,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    priorityOrdersRow: {
      flexDirection: isTablet ? 'row' : 'column',
      gap: spacing.lg,
    },
    priorityOrderCard: {
      flex: 1,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 3,
    },
    priorityOrderTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    priorityOrderTime: {
      ...typography.bodyLarge,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    priorityOrderItems: {
      alignItems: 'center',
    },
    priorityOrderItem: {
      ...typography.bodyMedium,
      marginBottom: spacing.xs,
    },
    activeOrdersQueue: {
      padding: spacing.xl,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: spacing.xl,
    },
    queueTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    ordersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.lg,
    },
    orderCard: {
      width: isTablet ? '48%' : '100%',
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
    },
    orderTitle: {
      ...typography.titleMedium,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    orderTime: {
      ...typography.bodyLarge,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    orderItems: {
      marginTop: spacing.sm,
    },
    orderItem: {
      ...typography.bodySmall,
      marginBottom: spacing.xs,
    },
    kitchenControls: {
      padding: spacing.xl,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    controlsTitle: {
      ...typography.titleLarge,
      color: theme.colors.onPrimary,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    controlsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    controlButton: {
      width: isTablet ? '30%' : '48%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      minHeight: 50,
    },
    controlButtonText: {
      color: theme.colors.onPrimary,
      ...typography.bodyMedium,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    timerDisplay: {
      ...typography.titleMedium,
      color: theme.colors.onPrimary,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: KITCHEN_THEME.background }]}>
      {renderHeader()}
      {renderStationStatus()}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderPriorityQueue()}
        {renderActiveOrdersQueue()}
        {renderKitchenControls()}
      </ScrollView>
    </View>
  );
};

export default KitchenDashboard;