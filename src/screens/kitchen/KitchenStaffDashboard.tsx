/**
 * Kitchen Staff Dashboard - Order preparation tracking and kitchen operations according to wireframes
 * Features: Priority order management, station tracking, real-time updates, preparation timers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleCard,
  AppleButton,
  AppleStatusPill,
  AppleInteractive,
  AppleProgressBar,
} from '@/components/apple';
import {
  KITCHEN_STAFF_DASHBOARD_DATA,
  KitchenOrder,
  KitchenOrderItem,
  KitchenStation,
  getOrdersByStatus,
  getOrdersByPriority,
  getOverdueOrders,
  getUrgentOrders,
  getActiveStations,
  sortOrdersByPriority,
} from '@/data/dashboard/kitchenStaffDashboard';

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onUpdateStatus: (order: KitchenOrder, newStatus: string) => void;
  onViewDetails: (order: KitchenOrder) => void;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onUpdateStatus, onViewDetails }) => {
  const { theme } = useTheme();

  const getPriorityColor = (priority: string) => {
    return theme.colors.statusColors[priority as keyof typeof theme.colors.statusColors] || theme.colors.statusColors.normal;
  };

  const getStatusColor = (status: string) => {
    return theme.colors.statusColors[status as keyof typeof theme.colors.statusColors] || theme.colors.outline;
  };

  const getTimeColor = (timeElapsed: number, estimatedTime: number) => {
    const ratio = timeElapsed / estimatedTime;
    if (ratio > 1.2) return theme.colors.statusColors.poor; // Overdue
    if (ratio > 0.8) return theme.colors.statusColors.average; // Nearly due
    return theme.colors.statusColors.excellent; // On time
  };

  const styles = {
    card: {
      marginBottom: 12,
      borderLeftWidth: 6,
      borderLeftColor: getPriorityColor(order.priority),
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 12,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: theme.colors.onSurface,
    },
    customerInfo: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    statusBadge: {
      marginLeft: 8,
    },
    timeContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      marginBottom: 12,
    },
    timeText: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
    itemsContainer: {
      marginBottom: 12,
    },
    itemRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
      marginBottom: 4,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
      flex: 1,
    },
    itemQuantity: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginRight: 8,
    },
    specialInstructions: {
      fontSize: 12,
      fontStyle: 'italic' as const,
      color: theme.colors.primary,
      marginTop: 2,
    },
    allergenTag: {
      backgroundColor: theme.colors.statusColors.error,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      marginLeft: 4,
    },
    allergenText: {
      fontSize: 10,
      color: theme.colors.onError,
      fontWeight: '600' as const,
    },
    actionsContainer: {
      flexDirection: 'row' as const,
      gap: 8,
    },
    overdueIndicator: {
      backgroundColor: theme.colors.statusColors.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start' as const,
      marginBottom: 8,
    },
    overdueText: {
      fontSize: 12,
      color: theme.colors.onError,
      fontWeight: '600' as const,
    },
  };

  const timeElapsedColor = getTimeColor(order.timeElapsed, order.estimatedTime);

  return (
    <AppleCard layer="surface" size="large" style={styles.card}>
      {order.isOverdue && (
        <View style={styles.overdueIndicator}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialIcons name="warning" size={16} color={theme.colors.statusColors.error} />
            <Text style={styles.overdueText}>OVERDUE</Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.customerInfo}>
            {order.tableNumber ? `${order.tableNumber} • ` : ''}
            {order.customerName} • {order.orderType.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
        <AppleStatusPill
          status={order.status === 'ready' ? 'success' : order.status === 'preparing' ? 'warning' : 'error'}
          text={order.status.toUpperCase()}
          size="small"
          style={styles.statusBadge}
        />
      </View>

      <View style={styles.timeContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialIcons name="access-time" size={16} color={timeElapsedColor} />
          <Text style={[styles.timeText, { color: timeElapsedColor }]}>
            {order.timeElapsed}m / {order.estimatedTime}m
          </Text>
        </View>
        <AppleProgressBar
          progress={Math.min(order.timeElapsed / order.estimatedTime, 1)}
          color={timeElapsedColor === theme.colors.statusColors.excellent ? 'success' :
                 timeElapsedColor === theme.colors.statusColors.average ? 'warning' : 'error'}
          size="small"
          style={{ flex: 1 }}
        />
      </View>

      <View style={styles.itemsContainer}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.allergens && item.allergens.length > 0 && (
                  <View style={styles.allergenTag}>
                    <Text style={styles.allergenText}>ALLERGY</Text>
                  </View>
                )}
              </View>
              {/* Display modifiers if present */}
              {item.modifiers && item.modifiers.length > 0 && (
                <Text style={[styles.specialInstructions, { color: theme.colors.primary, fontStyle: 'normal' }]}>
                  + {item.modifiers.flatMap(m => m.options).join(', ')}
                </Text>
              )}
              {item.specialInstructions && (
                <Text style={styles.specialInstructions}>Note: {item.specialInstructions}</Text>
              )}
            </View>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            <AppleStatusPill
              status={item.status === 'ready' ? 'success' : item.status === 'preparing' ? 'warning' : 'neutral'}
              text={item.status}
              size="small"
            />
          </View>
        ))}
      </View>

      {order.specialNotes && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 12 }}>
          <MaterialIcons name="note" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.specialInstructions, { flex: 1 }]}>
            Special Notes: {order.specialNotes}
          </Text>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <AppleButton
          title="View Details"
          variant="ghost"
          size="small"
          onPress={() => onViewDetails(order)}
        />
        {order.status === 'pending' && (
          <AppleButton
            title="Start Preparing"
            variant="primary"
            size="small"
            onPress={() => onUpdateStatus(order, 'preparing')}
          />
        )}
        {order.status === 'preparing' && (
          <AppleButton
            title="Mark Ready"
            variant="secondary"
            size="small"
            onPress={() => onUpdateStatus(order, 'ready')}
          />
        )}
        {order.status === 'ready' && (
          <AppleButton
            title="Mark Served"
            variant="success"
            size="small"
            onPress={() => onUpdateStatus(order, 'served')}
          />
        )}
      </View>
    </AppleCard>
  );
};

interface KitchenStationCardProps {
  station: KitchenStation;
  onViewOrders: (station: KitchenStation) => void;
}

const KitchenStationCard: React.FC<KitchenStationCardProps> = ({ station, onViewOrders }) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    return theme.colors.statusColors[status as keyof typeof theme.colors.statusColors] || theme.colors.outline;
  };

  const styles = {
    card: {
      marginRight: 12,
      width: 200,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 8,
    },
    stationName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
    },
    chefName: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    ordersCount: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    specialtyContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 4,
      marginBottom: 12,
    },
    specialtyTag: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    specialtyText: {
      fontSize: 10,
      color: theme.colors.onPrimary,
      fontWeight: '500' as const,
    },
    efficiencyContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 12,
    },
    efficiencyText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    efficiencyValue: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: station.efficiency >= 90 ? theme.colors.statusColors.excellent :
             station.efficiency >= 75 ? theme.colors.statusColors.average :
             theme.colors.statusColors.poor,
    },
  };

  return (
    <AppleInteractive onPress={() => onViewOrders(station)} feedbackType="scale">
      <AppleCard layer="surfaceVariant" size="large" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.stationName}>{station.name}</Text>
          <AppleStatusPill
            status={station.status === 'active' ? 'success' : station.status === 'busy' ? 'info' : 'neutral'}
            text={station.status.toUpperCase()}
            size="small"
          />
        </View>

        <Text style={styles.chefName}>Chef: {station.chef}</Text>

        <Text style={styles.ordersCount}>
          {station.currentOrders.length} active orders
        </Text>

        <View style={styles.specialtyContainer}>
          {station.specialty.map((item, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.efficiencyContainer}>
          <Text style={styles.efficiencyText}>Efficiency:</Text>
          <Text style={styles.efficiencyValue}>{station.efficiency}%</Text>
        </View>

        <AppleProgressBar
          progress={station.efficiency / 100}
          color={station.efficiency >= 90 ? 'success' : station.efficiency >= 75 ? 'warning' : 'error'}
          size="small"
        />
      </AppleCard>
    </AppleInteractive>
  );
};

const KitchenStaffDashboard: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState(KITCHEN_STAFF_DASHBOARD_DATA);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        orders: prev.orders.map(order => ({
          ...order,
          timeElapsed: order.timeElapsed + 1,
          isOverdue: (order.timeElapsed + 1) > (order.estimatedTime * 1.2),
        })),
        lastUpdated: new Date().toISOString(),
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    let orders = data.orders;

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        orders = orders.filter(order => ['pending', 'preparing'].includes(order.status));
      } else {
        orders = orders.filter(order => order.status === selectedStatus);
      }
    }

    if (selectedPriority !== 'all') {
      orders = orders.filter(order => order.priority === selectedPriority);
    }

    return sortOrdersByPriority(orders);
  }, [data.orders, selectedStatus, selectedPriority]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setData({ ...KITCHEN_STAFF_DASHBOARD_DATA, lastUpdated: new Date().toISOString() });
      setRefreshing(false);
    }, 1000);
  };

  // Handle order status update
  const handleOrderStatusUpdate = (order: KitchenOrder, newStatus: string) => {
    Alert.alert('Update Order Status', `Change order ${order.orderNumber} to ${newStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Update', onPress: () => {
        const updatedOrders = data.orders.map(o =>
          o.id === order.id ? { ...o, status: newStatus as any } : o
        );
        setData({ ...data, orders: updatedOrders });
      }}
    ]);
  };

  // Handle view order details
  const handleViewOrderDetails = (order: KitchenOrder) => {
    Alert.alert(
      `Order ${order.orderNumber}`,
      `Customer: ${order.customerName}\n` +
      `${order.tableNumber ? `Table: ${order.tableNumber}\n` : ''}` +
      `Items: ${order.items.length}\n` +
      `Time Elapsed: ${order.timeElapsed}/${order.estimatedTime} minutes\n` +
      `Status: ${order.status}\n` +
      `Priority: ${order.priority}` +
      (order.specialNotes ? `\n\nNotes: ${order.specialNotes}` : '')
    );
  };

  // Handle view station orders
  const handleViewStationOrders = (station: KitchenStation) => {
    const stationOrders = data.orders.filter(order => station.currentOrders.includes(order.id));
    Alert.alert(
      `${station.name}`,
      `Chef: ${station.chef}\n` +
      `Status: ${station.status}\n` +
      `Efficiency: ${station.efficiency}%\n` +
      `Active Orders: ${stationOrders.length}\n\n` +
      `Orders:\n${stationOrders.map(o => `• ${o.orderNumber} (${o.customerName})`).join('\n')}`
    );
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    statsContainer: {
      flexDirection: 'row' as const,
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      alignItems: 'center' as const,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center' as const,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    filtersContainer: {
      flexDirection: 'row' as const,
      gap: 8,
      marginBottom: 16,
    },
    urgentAlert: {
      backgroundColor: theme.colors.statusColors.urgent,
      padding: 12,
      borderRadius: theme.borderRadius.md,
      marginBottom: 16,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    urgentText: {
      color: theme.colors.onError,
      fontWeight: '600' as const,
      flex: 1,
    },
  };

  // Filter options
  const statusFilters = [
    { key: 'active', label: 'Active', count: data.orders.filter(o => ['pending', 'preparing'].includes(o.status)).length },
    { key: 'pending', label: 'Pending', count: data.orders.filter(o => o.status === 'pending').length },
    { key: 'preparing', label: 'Preparing', count: data.orders.filter(o => o.status === 'preparing').length },
    { key: 'ready', label: 'Ready', count: data.orders.filter(o => o.status === 'ready').length },
  ];

  const priorityFilters = [
    { key: 'all', label: 'All Priority', count: data.orders.length },
    { key: 'urgent', label: 'Urgent', count: data.orders.filter(o => o.priority === 'urgent').length },
    { key: 'high', label: 'High', count: data.orders.filter(o => o.priority === 'high').length },
    { key: 'normal', label: 'Normal', count: data.orders.filter(o => o.priority === 'normal').length },
  ];

  // Get urgent orders
  const urgentOrders = getUrgentOrders();
  const overdueOrders = getOverdueOrders();

  // Header actions
  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleStatusPill
        status={overdueOrders.length > 0 ? 'error' : 'success'}
        text={`${data.stats.activeOrders} Active`}
        size="small"
      />
      <AppleButton
        title="Refresh"
        variant="secondary"
        size="medium"
        onPress={handleRefresh}
      />
    </View>
  );

  // Render header components for FlatList
  const renderHeaderComponents = () => (
    <View style={{ padding: 16 }}>
      {/* Header Title */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: theme.colors.onSurface,
              marginBottom: 4,
            }}>
              Kitchen Dashboard
            </Text>
            <Text style={{
              fontSize: 14,
              color: theme.colors.onSurfaceVariant,
            }}>
              {`${data.stats.activeOrders} Active Orders • ${data.stats.averageTime}m Avg Time • ${data.stats.efficiency}% Efficiency`}
            </Text>
          </View>
          {headerActions}
        </View>
      </View>

      {/* Urgent Alert */}
      {(urgentOrders.length > 0 || overdueOrders.length > 0) && (
        <View style={[styles.urgentAlert, { marginBottom: 16 }]}>
          <Text style={styles.urgentText}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="warning" size={16} color={theme.colors.statusColors.urgent} />
              <Text>{urgentOrders.length} urgent orders • {overdueOrders.length} overdue orders</Text>
            </View>
          </Text>
          <AppleButton
            title="View"
            variant="ghost"
            size="small"
            onPress={() => setSelectedPriority('urgent')}
          />
        </View>
      )}

      {/* Kitchen Stats */}
      <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <MaterialIcons name="analytics" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Kitchen Performance</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.stats.activeOrders}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.stats.completedToday}</Text>
            <Text style={styles.statLabel}>Completed Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.stats.averageTime}m</Text>
            <Text style={styles.statLabel}>Avg Prep Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.stats.efficiency}%</Text>
            <Text style={styles.statLabel}>Efficiency</Text>
          </View>
        </View>
      </AppleCard>

      {/* Kitchen Stations */}
      <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <MaterialIcons name="restaurant" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Kitchen Stations</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
            {data.stations.map((station) => (
              <KitchenStationCard
                key={station.id}
                station={station}
                onViewOrders={handleViewStationOrders}
              />
            ))}
          </View>
        </ScrollView>
      </AppleCard>

      {/* Filters */}
      <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <MaterialIcons name="filter-list" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Filter Orders</Text>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersContainer}>
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
                    status="neutral"
                    text={filter.count.toString()}
                    size="small"
                  />
                </AppleCard>
              </AppleInteractive>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 12, marginBottom: 8 }]}>Priority</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersContainer}>
            {priorityFilters.map((filter) => (
              <AppleInteractive
                key={filter.key}
                onPress={() => setSelectedPriority(filter.key)}
                feedbackType="scale"
              >
                <AppleCard
                  layer={selectedPriority === filter.key ? "primary" : "surfaceVariant"}
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
                    color: selectedPriority === filter.key ? theme.colors.onPrimary : theme.colors.onSurface,
                  }}>
                    {filter.label}
                  </Text>
                  <AppleStatusPill
                    status="neutral"
                    text={filter.count.toString()}
                    size="small"
                  />
                </AppleCard>
              </AppleInteractive>
            ))}
          </View>
        </ScrollView>
      </AppleCard>

      {/* Orders List Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingHorizontal: 16 }}>
        <MaterialIcons name="assignment" size={20} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>Kitchen Orders ({filteredOrders.length})</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <KitchenOrderCard
              order={item}
              onUpdateStatus={handleOrderStatusUpdate}
              onViewDetails={handleViewOrderDetails}
            />
          </View>
        )}
        ListHeaderComponent={renderHeaderComponents}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <AppleCard layer="surfaceVariant" size="large" style={{ alignItems: 'center', padding: 32 }}>
              <MaterialIcons name="restaurant" size={48} color={theme.colors.onSurfaceVariant} style={{ marginBottom: 16 }} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                No Orders to Prepare
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
              }}>
                All orders are up to date! Great work!
              </Text>
            </AppleCard>
          </View>
        }
      />
    </View>
  );
};

export default KitchenStaffDashboard;