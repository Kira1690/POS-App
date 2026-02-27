/**
 * Orders Dashboard - Complete order management and tracking system according to wireframes
 * Features: Order status filtering, real-time order grid, analytics, search & filter
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleCard,
  AppleButton,
  AppleStatusPill,
  AppleInteractive,
} from '@/components/apple';
import { DashboardOrder, OrderAnalytics } from '@/data/dashboard/ordersDashboard';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { UnifiedOrder } from '@/types/unified-order.types';

interface OrderCardProps {
  order: DashboardOrder;
  onPress: (order: DashboardOrder) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const { theme, isDark } = useTheme();

  const statusColors = (() => {
    const sc = theme.colors.status;
    if (!sc) return { bg: theme.colors.surfaceLight, text: theme.colors.onSurface, border: theme.colors.outline };
    const key = order.status as keyof typeof sc;
    return sc[key] || sc.pending;
  })();

  const getElapsedTime = () => {
    const mins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        marginVertical: theme.spacing.xs,
        borderWidth: 2,
        borderColor: statusColors.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={() => onPress(order)}
      activeOpacity={0.8}
    >
      {/* Status Banner */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        backgroundColor: statusColors.bg,
      }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: statusColors.text }}>
          {statusLabel}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: '600', color: statusColors.text }}>
          {getElapsedTime()}
        </Text>
      </View>

      <View style={{ padding: theme.spacing.md }}>
        {/* Header Row: order number + table */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.onSurface, marginBottom: 2 }}>
            {order.orderNumber}
          </Text>
          {order.tableNumber && (
            <Text style={{ fontSize: 13, fontWeight: '500', color: theme.colors.onSurfaceVariant }}>
              {order.tableNumber}
            </Text>
          )}
        </View>

        {/* Details Row: item count + time on left, total on right */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="restaurant-menu" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={{ fontSize: 13, color: theme.colors.onSurfaceVariant, marginLeft: 4, marginRight: 12 }}>
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </Text>
            <MaterialIcons name="schedule" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={{ fontSize: 13, color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {getElapsedTime()}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.primary }}>
            ${order.totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingTop: theme.spacing.sm,
            marginBottom: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
          }}>
            <MaterialIcons name="note" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={{ fontSize: 13, flex: 1, fontStyle: 'italic', color: theme.colors.onSurfaceVariant, marginLeft: 4 }} numberOfLines={2}>
              {order.notes}
            </Text>
          </View>
        )}

        {/* View Details Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.outline }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.primaryContainer,
            }}
            onPress={() => onPress(order)}
          >
            <MaterialIcons name="visibility" size={16} color={theme.colors.onPrimaryContainer} />
            <Text style={{ fontSize: 13, fontWeight: '600', marginLeft: 4, color: theme.colors.onPrimaryContainer }}>
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Map UnifiedOrder status to DashboardOrder status
const mapStatus = (status: UnifiedOrder['status']): DashboardOrder['status'] => {
  const map: Record<string, DashboardOrder['status']> = {
    draft: 'pending',
    confirmed: 'pending',
    preparing: 'preparing',
    ready: 'ready',
    served: 'served',
    paid: 'paid',
    cancelled: 'cancelled',
  };
  return map[status] ?? 'pending';
};

const OrdersDashboard: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { orders: rawOrders, refreshOrders } = useUnifiedOrder();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Map UnifiedOrder[] to DashboardOrder[] for display
  const mappedOrders: DashboardOrder[] = useMemo(() => {
    return rawOrders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: mapStatus(o.status),
      orderType: 'dine-in' as const,
      tableNumber: o.tableName || o.tableId,
      customer: {
        id: o.customerId ?? o.createdBy,
        name: o.createdByName || 'Staff',
      },
      items: o.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.quantity > 0 ? item.itemTotal / item.quantity : item.itemTotal,
        specialInstructions: item.specialInstructions,
      })),
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      estimatedTime: o.estimatedPrepTime,
      urgencyLevel: 'normal' as const,
      serverName: o.createdByName,
      notes: o.specialInstructions,
    }));
  }, [rawOrders]);

  // Compute analytics from real data
  const analytics: OrderAnalytics = useMemo(() => {
    const total = rawOrders.length;
    const revenue = rawOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrder = total > 0 ? rawOrders.reduce((sum, o) => sum + o.totalAmount, 0) / total : 0;
    const completed = rawOrders.filter(o => o.status === 'paid' || o.status === 'served').length;
    return {
      totalOrders: total,
      totalRevenue: revenue,
      avgOrderValue: avgOrder,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      ordersByType: { dineIn: total, takeaway: 0, delivery: 0 },
      ordersByStatus: {
        pending: rawOrders.filter(o => o.status === 'draft' || o.status === 'confirmed').length,
        preparing: rawOrders.filter(o => o.status === 'preparing').length,
        ready: rawOrders.filter(o => o.status === 'ready').length,
        served: rawOrders.filter(o => o.status === 'served').length,
        paid: rawOrders.filter(o => o.status === 'paid').length,
        cancelled: rawOrders.filter(o => o.status === 'cancelled').length,
      },
    };
  }, [rawOrders]);

  // Filter orders based on selected criteria
  const filteredOrders = useMemo(() => {
    let filtered = mappedOrders;

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
  }, [mappedOrders, selectedStatus, selectedType, searchQuery]);

  // Handle refresh — reload from SQLite
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  // Handle order press
  const handleOrderPress = (order: DashboardOrder) => {
    Alert.alert('Order Details', `Order ${order.orderNumber}\nTotal: $${order.totalAmount.toFixed(2)}`);
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    analyticsContainer: {
      flexDirection: 'row' as const,
      gap: 16,
      marginBottom: 16,
    },
    analyticsCard: {
      flex: 1,
      alignItems: 'center' as const,
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: 20,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      ...theme.shadows.sm,
      elevation: 2,
    },
    analyticsValue: {
      fontSize: 28,
      fontWeight: '800' as const,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    analyticsLabel: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center' as const,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
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
      paddingVertical: 14,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      ...theme.shadows.xs,
      elevation: 1,
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
    { key: 'all', label: 'All Orders', count: mappedOrders.length },
    { key: 'pending', label: 'Pending', count: analytics.ordersByStatus.pending },
    { key: 'preparing', label: 'Preparing', count: analytics.ordersByStatus.preparing },
    { key: 'ready', label: 'Ready', count: analytics.ordersByStatus.ready },
    { key: 'served', label: 'Served', count: analytics.ordersByStatus.served },
    { key: 'paid', label: 'Paid', count: analytics.ordersByStatus.paid },
  ];

  // Type filter options (all dine-in for now — no order type tracking in unified orders)
  const typeFilters = [
    { key: 'all', label: 'All Types', count: mappedOrders.length },
    { key: 'dine-in', label: 'Dine-in', count: analytics.ordersByType.dineIn },
    { key: 'takeaway', label: 'Takeaway', count: analytics.ordersByType.takeaway },
    { key: 'delivery', label: 'Delivery', count: analytics.ordersByType.delivery },
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
        title="Refresh"
        icon={<MaterialIcons name="refresh" size={16} color={theme.colors.onPrimary} />}
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
        subtitle={`Total Orders: ${analytics.totalOrders} • Revenue: $${analytics.totalRevenue.toFixed(2)}`}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="analytics" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Order Analytics</Text>
          </View>
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsCard}>
              <MaterialIcons name="receipt" size={24} color={theme.colors.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsValue}>{analytics.totalOrders}</Text>
              <Text style={styles.analyticsLabel}>Total Orders</Text>
            </View>
            <View style={styles.analyticsCard}>
              <MaterialIcons name="attach-money" size={24} color={theme.colors.success} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsValue}>${analytics.totalRevenue.toFixed(0)}</Text>
              <Text style={styles.analyticsLabel}>Revenue</Text>
            </View>
            <View style={styles.analyticsCard}>
              <MaterialIcons name="trending-up" size={24} color={theme.colors.info} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsValue}>${analytics.avgOrderValue.toFixed(0)}</Text>
              <Text style={styles.analyticsLabel}>Avg Order</Text>
            </View>
            <View style={styles.analyticsCard}>
              <MaterialIcons name="check-circle" size={24} color={theme.colors.warning} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsValue}>{analytics.completionRate.toFixed(1)}%</Text>
              <Text style={styles.analyticsLabel}>Completion</Text>
            </View>
          </View>
        </AppleCard>

        {/* Search and Filters */}
        <AppleCard layer="surface" size="large" style={styles.filtersContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="search" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Search & Filter</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={16} color={theme.colors.onSurfaceVariant} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="receipt" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Order Grid ({filteredOrders.length} orders)</Text>
          </View>
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onPress={handleOrderPress}
              />
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <AppleCard layer="surfaceVariant" size="large" style={{ alignItems: 'center', padding: 32 }}>
                <MaterialIcons name="receipt" size={48} color={theme.colors.onSurfaceVariant} style={{ marginBottom: 16 }} />
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