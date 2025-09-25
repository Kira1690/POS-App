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

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Kitchen theme colors - high contrast for kitchen environment
const KITCHEN_THEME = {
  background: '#1A1D21', // Dark background
  header: '#fd7e14',      // Orange header
  white: '#ffffff',
  
  // Station colors
  appetizers: '#28a745',   // Green - good
  mainCourse: '#dc3545',   // Red - busy
  sushi: '#007bff',        // Blue - normal
  desserts: '#6610f2',     // Purple - normal
  
  // Status colors
  urgent: '#dc3545',
  warning: '#ffc107', 
  ready: '#28a745',
  preparing: '#007bff',
  queue: '#6c757d',
};

interface KitchenDashboardProps {}

const KitchenDashboard: React.FC<KitchenDashboardProps> = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { theme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock kitchen data - will be replaced with real data from services
  const kitchenData = useMemo(() => ({
    chef: {
      name: authState.user?.name || 'Chef Mike Wilson',
      employeeId: 'CHEF001',
    },
    stations: [
      { name: 'APPETIZERS', count: 3, color: KITCHEN_THEME.appetizers, emoji: '🥗' },
      { name: 'MAIN COURSE', count: 7, color: KITCHEN_THEME.mainCourse, emoji: '🍖' },
      { name: 'SUSHI', count: 2, color: KITCHEN_THEME.sushi, emoji: '🍣' },
      { name: 'DESSERTS', count: 1, color: KITCHEN_THEME.desserts, emoji: '🍰' },
    ],
    priorityOrders: [
      {
        id: 1,
        type: 'TABLE 7 - URGENT',
        timeInfo: '⏰ 45 min overdue',
        items: ['• Grilled Salmon', '• Caesar Salad'],
        color: KITCHEN_THEME.urgent,
        bgColor: '#f8d7da',
      },
      {
        id: 2,
        type: 'TAKEAWAY #T001',
        timeInfo: '⏰ 30 min prep time',
        items: ['• Chicken Teriyaki', '• Miso Soup'],
        color: KITCHEN_THEME.warning,
        bgColor: '#fff3cd',
      },
    ],
    activeOrders: [
      {
        id: 1,
        title: 'TABLE 12',
        time: '⏱️ 8 min',
        items: ['• Mushroom Risotto (Ready)', '• Garlic Bread (Ready)', '• House Salad (Ready)'],
        status: 'ready',
        bgColor: '#d4edda',
        borderColor: KITCHEN_THEME.ready,
      },
      {
        id: 2,
        title: 'TABLE 5',
        time: '⏱️ 15 min',
        items: ['• Beef Steak (Cooking)', '• Roasted Vegetables', '• Red Wine Sauce'],
        status: 'cooking',
        bgColor: '#fff3cd',
        borderColor: KITCHEN_THEME.warning,
      },
      {
        id: 3,
        title: 'DELIVERY #D003',
        time: '⏱️ 22 min',
        items: ['• Sushi Platter (Prep)', '• Miso Soup (Ready)', '• Edamame (Ready)'],
        status: 'preparing',
        bgColor: '#cce5ff',
        borderColor: KITCHEN_THEME.preparing,
      },
      {
        id: 4,
        title: 'TABLE 18',
        time: '⏱️ Just received',
        items: ['• Fish & Chips (Queue)', '• Coleslaw (Queue)', '• Tartar Sauce'],
        status: 'queue',
        bgColor: '#e2e3e5',
        borderColor: KITCHEN_THEME.queue,
      },
    ],
    averagePrepTime: 18,
  }), [authState]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement actual data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const controlButtons = [
    { label: 'Mark as Ready', icon: 'check-circle', color: KITCHEN_THEME.ready },
    { label: 'Report Delay', icon: 'schedule', color: KITCHEN_THEME.warning },
    { label: 'Need Help', icon: 'help', color: KITCHEN_THEME.urgent },
    { label: 'Station Status', icon: 'analytics', color: KITCHEN_THEME.preparing },
    { label: 'Check Inventory', icon: 'inventory', color: KITCHEN_THEME.desserts },
    { label: 'Call Manager', icon: 'call', color: KITCHEN_THEME.header },
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: KITCHEN_THEME.header }]}>
      <View style={styles.headerLeft}>
        <Text style={styles.timeDisplay}>
          🕐 {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>
          🍽️ KITCHEN DISPLAY SYSTEM
        </Text>
      </View>
      
      <View style={styles.headerRight}>
        <Text style={styles.chefInfo}>
          👨‍🍳 {kitchenData.chef.name} ({kitchenData.chef.employeeId})
        </Text>
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
          <Text style={styles.stationText}>
            {station.emoji} {station.name} ({station.count})
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPriorityQueue = () => (
    <View style={[styles.priorityQueue, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.priorityTitle, { color: KITCHEN_THEME.urgent }]}>
        🚨 PRIORITY ORDERS - IMMEDIATE ATTENTION
      </Text>
      
      <View style={styles.priorityOrdersRow}>
        {kitchenData.priorityOrders.map((order) => (
          <View
            key={order.id}
            style={[
              styles.priorityOrderCard,
              { 
                backgroundColor: order.bgColor,
                borderColor: order.color,
              }
            ]}
          >
            <Text style={[styles.priorityOrderTitle, { color: order.color }]}>
              {order.type}
            </Text>
            <Text style={[styles.priorityOrderTime, { color: order.color }]}>
              {order.timeInfo}
            </Text>
            <View style={styles.priorityOrderItems}>
              {order.items.map((item, index) => (
                <Text key={index} style={styles.priorityOrderItem}>
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
                backgroundColor: order.bgColor,
                borderColor: order.borderColor,
              }
            ]}
          >
            <Text style={[styles.orderTitle, { color: theme.colors.onSurface }]}>
              {order.title}
            </Text>
            <Text style={[styles.orderTime, { color: order.borderColor }]}>
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
            <MaterialIcons name={button.icon as any} size={24} color="white" />
            <Text style={styles.controlButtonText}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.timerDisplay}>
        🕐 Average Prep Time: {kitchenData.averagePrepTime} minutes
      </Text>
    </View>
  );

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
    color: 'white',
    fontWeight: '700',
  },
  headerTitle: {
    ...typography.headlineLarge,
    color: 'white',
    fontWeight: '700',
    fontSize: 32,
  },
  chefInfo: {
    ...typography.titleMedium,
    color: 'white',
    fontWeight: '600',
  },
  stationStatusBar: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    color: 'white',
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
    borderColor: 'rgba(220, 53, 69, 0.3)',
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
    borderColor: 'rgba(0,0,0,0.1)',
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
    borderColor: 'white',
  },
  controlsTitle: {
    ...typography.titleLarge,
    color: 'white',
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
    color: 'white',
    ...typography.bodyMedium,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  timerDisplay: {
    ...typography.titleMedium,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default KitchenDashboard;