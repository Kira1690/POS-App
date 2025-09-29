/**
 * Orders Dashboard - Complete order management and tracking system according to wireframes
 * Features: Order status filtering, real-time order grid, analytics, search & filter
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleCard,
  AppleButton,
  AppleStatusPill,
  AppleInteractive,
} from '@/components/apple';
import {
  ORDERS_DASHBOARD_DATA,
  DashboardOrder,
  OrderAnalytics,
  getOrdersByStatus,
  getOrdersByType,
  getUrgentOrders,
} from '@/data/dashboard/ordersDashboard';

interface OrderCardProps {
  order: DashboardOrder;
  onPress: (order: DashboardOrder) => void;
  onUpdateStatus: (order: DashboardOrder) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, onUpdateStatus }) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF3B30';
      case 'preparing': return '#FF9500';
      case 'ready': return '#32D74B';
      case 'served': return '#007AFF';
      case 'cancelled': return '#8E8E93';
      default: return theme.colors.outline;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return '🔴';
      case 'priority': return '🟡';
      default: return '';
    }
  };

  const styles = {
    card: {
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: getStatusColor(order.status),
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 8,
    },
    orderNumber: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
    },
    urgencyBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
    },
    content: {
      marginBottom: 12,
    },
    customerInfo: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 8,
    },
    customerName: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
    },
    tableNumber: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    itemsText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    footer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    amount: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.primary,
    },
    time: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    actions: {
      flexDirection: 'row' as const,
      gap: 8,
      marginTop: 12,
    },
  };

  return (
    <AppleInteractive onPress={() => onPress(order)} feedbackType="scale">
      <AppleCard layer="surface" size="large" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <View style={styles.urgencyBadge}>
            <Text>{getUrgencyIcon(order.urgencyLevel)}</Text>
            <AppleStatusPill
              status={order.status === 'ready' ? 'success' : order.status === 'preparing' ? 'warning' : 'error'}
              text={order.status.toUpperCase()}
              size="small"
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{order.customer.name}</Text>
            <Text style={styles.tableNumber}>
              {order.tableNumber || `${order.orderType.toUpperCase()}`}
            </Text>
          </View>

          <Text style={styles.itemsText}>
            {order.items.length} items: {order.items.map(item => item.name).join(', ')}
          </Text>

          {order.notes && (
            <Text style={[styles.itemsText, { fontStyle: 'italic' }]}>
              Note: {order.notes}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.amount}>${order.totalAmount.toFixed(2)}</Text>
          <View>
            <Text style={styles.time}>
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.time}>Server: {order.serverName}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AppleButton
            title="View Details"
            variant="secondary"
            size="small"
            onPress={() => onPress(order)}
          />
          <AppleButton
            title="Update Status"
            variant="primary"
            size="small"
            onPress={() => onUpdateStatus(order)}
          />
        </View>
      </AppleCard>
    </AppleInteractive>
  );
};

const OrdersDashboard: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState(ORDERS_DASHBOARD_DATA);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter orders based on selected criteria
  const filteredOrders = useMemo(() => {
    let filtered = data.orders;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(order => order.orderType === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        (order.tableNumber && order.tableNumber.toLowerCase().includes(query)) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [data.orders, selectedStatus, selectedType, searchQuery]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setData({ ...ORDERS_DASHBOARD_DATA, lastUpdated: new Date().toISOString() });
      setRefreshing(false);
    }, 1000);
  };

  // Handle order press
  const handleOrderPress = (order: DashboardOrder) => {
    Alert.alert('Order Details', `Order ${order.orderNumber}\nCustomer: ${order.customer.name}\nTotal: $${order.totalAmount.toFixed(2)}`);
  };

  // Handle status update
  const handleStatusUpdate = (order: DashboardOrder) => {
    const statusOptions = ['pending', 'preparing', 'ready', 'served'];
    const currentIndex = statusOptions.indexOf(order.status);
    const nextStatus = statusOptions[currentIndex + 1] || order.status;

    Alert.alert('Update Status', `Change order ${order.orderNumber} to ${nextStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Update', onPress: () => {
        // Update order status in data
        const updatedOrders = data.orders.map(o =>
          o.id === order.id ? { ...o, status: nextStatus as any } : o
        );
        setData({ ...data, orders: updatedOrders });
      }}
    ]);
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    analyticsContainer: {
      flexDirection: 'row' as const,
      gap: 12,
      marginBottom: 16,
    },
    analyticsCard: {
      flex: 1,
      alignItems: 'center' as const,
    },
    analyticsValue: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: theme.colors.primary,
    },
    analyticsLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center' as const,
      marginTop: 4,
    },
    filtersContainer: {
      marginBottom: 16,
    },
    filterRow: {
      flexDirection: 'row' as const,
      gap: 8,
      marginBottom: 8,
    },
    searchBar: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.lg,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
  };

  // Status filter options
  const statusFilters = [
    { key: 'all', label: 'All Orders', count: data.orders.length },
    { key: 'pending', label: 'Pending', count: data.analytics.ordersByStatus.pending },
    { key: 'preparing', label: 'Preparing', count: data.analytics.ordersByStatus.preparing },
    { key: 'ready', label: 'Ready', count: data.analytics.ordersByStatus.ready },
    { key: 'served', label: 'Served', count: data.analytics.ordersByStatus.served },
  ];

  // Type filter options
  const typeFilters = [
    { key: 'all', label: 'All Types', count: data.orders.length },
    { key: 'dine-in', label: 'Dine-in', count: data.analytics.ordersByType.dineIn },
    { key: 'takeaway', label: 'Takeaway', count: data.analytics.ordersByType.takeaway },
    { key: 'delivery', label: 'Delivery', count: data.analytics.ordersByType.delivery },
  ];

  // Header actions
  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleStatusPill
        status="online"
        text={`${filteredOrders.length} Orders`}
        size="small"
      />
      <AppleButton
        title="🔄 Refresh"
        variant="secondary"
        size="medium"
        onPress={handleRefresh}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppleDashboardPanel
        title="Orders Dashboard"
        subtitle={`Total Orders: ${data.analytics.totalOrders} • Revenue: $${data.analytics.totalRevenue.toFixed(2)}`}
        headerActions={headerActions}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Analytics Summary */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>📊 Order Analytics</Text>
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsValue}>{data.analytics.totalOrders}</Text>
              <Text style={styles.analyticsLabel}>Total Orders</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsValue}>${data.analytics.totalRevenue.toFixed(0)}</Text>
              <Text style={styles.analyticsLabel}>Revenue</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsValue}>${data.analytics.avgOrderValue.toFixed(0)}</Text>
              <Text style={styles.analyticsLabel}>Avg Order</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsValue}>{data.analytics.completionRate.toFixed(1)}%</Text>
              <Text style={styles.analyticsLabel}>Completion</Text>
            </View>
          </View>
        </AppleCard>

        {/* Search and Filters */}
        <AppleCard layer="surface" size="large" style={styles.filtersContainer}>
          <Text style={styles.sectionTitle}>🔍 Search & Filter</Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders, customers, tables..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Status Filters */}
          <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 16, marginBottom: 8 }]}>Order Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {statusFilters.map((filter) => (
                <AppleInteractive
                  key={filter.key}
                  onPress={() => setSelectedStatus(filter.key)}
                  feedbackType="scale"
                >
                  <AppleCard
                    layer={selectedStatus === filter.key ? "primary" : "surfaceVariant"}
                    size="small"
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: selectedStatus === filter.key ? theme.colors.onPrimary : theme.colors.onSurface,
                    }}>
                      {filter.label}
                    </Text>
                    <AppleStatusPill
                      status={selectedStatus === filter.key ? "active" : "neutral"}
                      text={filter.count.toString()}
                      size="small"
                    />
                  </AppleCard>
                </AppleInteractive>
              ))}
            </View>
          </ScrollView>

          {/* Type Filters */}
          <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 12, marginBottom: 8 }]}>Order Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {typeFilters.map((filter) => (
                <AppleInteractive
                  key={filter.key}
                  onPress={() => setSelectedType(filter.key)}
                  feedbackType="scale"
                >
                  <AppleCard
                    layer={selectedType === filter.key ? "primary" : "surfaceVariant"}
                    size="small"
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: selectedType === filter.key ? theme.colors.onPrimary : theme.colors.onSurface,
                    }}>
                      {filter.label}
                    </Text>
                    <AppleStatusPill
                      status={selectedType === filter.key ? "active" : "neutral"}
                      text={filter.count.toString()}
                      size="small"
                    />
                  </AppleCard>
                </AppleInteractive>
              ))}
            </View>
          </ScrollView>
        </AppleCard>

        {/* Orders Grid */}
        <AppleCard layer="surface" size="large">
          <Text style={styles.sectionTitle}>📋 Order Grid ({filteredOrders.length} orders)</Text>
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onPress={handleOrderPress}
                onUpdateStatus={handleStatusUpdate}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <AppleCard layer="surfaceVariant" size="large" style={{ alignItems: 'center', padding: 32 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  marginBottom: 8,
                }}>
                  No Orders Found
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.onSurfaceSecondary,
                  textAlign: 'center',
                }}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Orders will appear here when customers place them'}
                </Text>
              </AppleCard>
            }
          />
        </AppleCard>
      </AppleDashboardPanel>
    </View>
  );
};

export default OrdersDashboard;