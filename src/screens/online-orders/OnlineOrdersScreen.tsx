import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  OnlineOrder,
  OnlineOrderStats,
  PlatformStatus,
  OrderFilters,
  DeliveryPlatform,
  OrderStatus,
} from '@/types/online-orders.types';
import { MockOnlineOrderService } from '@/services/online-orders/MockOnlineOrderService';
import {
  OrderStatsCards,
  PlatformStatusBar,
  OrderFiltersBar,
  OrderCard,
  QuickActionsPanel,
} from './components';
import { theme } from '@/constants/theme';

export default function OnlineOrdersScreen() {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [stats, setStats] = useState<OnlineOrderStats | null>(null);
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({
    platform: 'all',
    status: 'all',
    time_range: 'last_2_hours',
    search_query: '',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);

  const orderService = MockOnlineOrderService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadOrders(),
        loadStats(),
        loadPlatformStatuses(),
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersData = await orderService.getOrders(filters);
      setOrders(ordersData);
    } catch { /* silent */ }
  };

  const loadStats = async () => {
    try {
      const statsData = await orderService.getOrderStats();
      setStats(statsData);
    } catch { /* silent */ }
  };

  const loadPlatformStatuses = async () => {
    try {
      const statusData = await orderService.getPlatformStatuses();
      setPlatformStatuses(statusData);
    } catch { /* silent */ }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await orderService.acceptOrder(orderId);
      await loadOrders();
      await loadStats();
      Alert.alert('Success', 'Order accepted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderService.rejectOrder(orderId, 'Restaurant too busy');
              await loadOrders();
              await loadStats();
              Alert.alert('Success', 'Order rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order');
            }
          },
        },
      ]
    );
  };

  const handleMarkOrderReady = async (orderId: string) => {
    try {
      await orderService.markOrderReady(orderId);
      await loadOrders();
      await loadStats();
      Alert.alert('Success', 'Order marked as ready');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark order as ready');
    }
  };

  const handleNotifyDriver = async (orderId: string) => {
    Alert.alert('Driver Notified', 'Delivery driver has been notified that the order is ready for pickup.');
  };

  const handleOrderDetails = (order: OnlineOrder) => {
    Alert.alert(
      `Order Details - ${order.platform_order_id}`,
      `Customer: ${order.customer.name}\nItems: ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}\nTotal: $${order.total.toFixed(2)}\nStatus: ${order.status.toUpperCase()}`
    );
  };

  const handlePauseNewOrders = async () => {
    try {
      await orderService.pauseNewOrders();
      await loadPlatformStatuses();
      Alert.alert('Success', 'New orders paused on all platforms');
    } catch (error) {
      Alert.alert('Error', 'Failed to pause new orders');
    }
  };

  const handleBulkAcceptPending = async () => {
    const pendingOrders = orders.filter(order => order.status === 'new');
    if (pendingOrders.length === 0) {
      Alert.alert('No Pending Orders', 'There are no pending orders to accept.');
      return;
    }

    Alert.alert(
      'Accept All Pending Orders',
      `Accept all ${pendingOrders.length} pending orders?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept All',
          onPress: async () => {
            try {
              const orderIds = pendingOrders.map(order => order.id);
              await orderService.bulkAcceptOrders(orderIds);
              await loadOrders();
              await loadStats();
              Alert.alert('Success', `${pendingOrders.length} orders accepted`);
            } catch (error) {
              Alert.alert('Error', 'Failed to accept all orders');
            }
          },
        },
      ]
    );
  };

  const handleSyncMenuItems = async () => {
    try {
      await orderService.syncMenuItems();
      Alert.alert('Success', 'Menu items synced with all platforms');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync menu items');
    }
  };

  const handlePlatformSettings = () => {
    Alert.alert('Platform Settings', 'Platform configuration will be implemented.');
  };

  const handleDailyReport = () => {
    Alert.alert('Daily Report', 'Daily report generation will be implemented.');
  };

  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const renderOrderItem = ({ item }: { item: OnlineOrder }) => (
    <OrderCard
      order={item}
      onAccept={() => handleAcceptOrder(item.id)}
      onReject={() => handleRejectOrder(item.id)}
      onMarkReady={() => handleMarkOrderReady(item.id)}
      onNotifyDriver={() => handleNotifyDriver(item.id)}
      onViewDetails={() => handleOrderDetails(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading online orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Online Orders Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={handlePlatformSettings}>
            <Text style={styles.settingsButtonText}>⚙️ Platform Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        {stats && (
          <OrderStatsCards
            stats={stats}
            platformStatuses={platformStatuses}
          />
        )}

        {/* Platform Status Bar */}
        <PlatformStatusBar statuses={platformStatuses} />

        {/* Filters and Search */}
        <OrderFiltersBar
          filters={filters}
          onFiltersChange={updateFilters}
          autoAcceptEnabled={autoAcceptEnabled}
          onAutoAcceptToggle={setAutoAcceptEnabled}
        />

        {/* Orders List */}
        <View style={styles.ordersSection}>
          <Text style={styles.ordersTitle}>Recent Orders ({orders.length})</Text>
          
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No orders found matching current filters</Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order, index) => (
                <View key={order.id} style={[styles.orderItem, { marginBottom: index === orders.length - 1 ? 0 : 15 }]}>
                  <OrderCard
                    order={order}
                    onAccept={() => handleAcceptOrder(order.id)}
                    onReject={() => handleRejectOrder(order.id)}
                    onMarkReady={() => handleMarkOrderReady(order.id)}
                    onNotifyDriver={() => handleNotifyDriver(order.id)}
                    onViewDetails={() => handleOrderDetails(order)}
                  />
                </View>
              ))}
              
              {orders.length > 3 && (
                <Text style={styles.moreOrdersText}>
                  + {orders.length - 3} more orders (scroll to view all)
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions Panel */}
        <QuickActionsPanel
          onPauseNewOrders={handlePauseNewOrders}
          onBulkAcceptPending={handleBulkAcceptPending}
          onSyncMenuItems={handleSyncMenuItems}
          onDailyReport={handleDailyReport}
          onPlatformSettings={handlePlatformSettings}
        />
      </ScrollView>

      {/* Navigation Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Dashboard &gt; Online Orders</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    height: 80,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: theme.colors.gray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: theme.colors.white,
    fontSize: 14,
  },
  backButton: {
    backgroundColor: theme.colors.gray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  ordersSection: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  ordersList: {
    gap: 15,
  },
  orderItem: {
    // Individual order item styling handled by OrderCard
  },
  moreOrdersText: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 15,
  },
  breadcrumb: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
  },
  breadcrumbText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});