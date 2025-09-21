/**
 * OrderManagementScreen - Professional order management interface
 * Features order list with filtering, searching, and status management
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrderManagement } from '@/context/orderManagement';
import { useTheme } from '@/hooks/useTheme';
import { Order } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { OrderListItem, OrderStatusBadge } from '@/components/business/order';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { showToast } from '@/utils/toast';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface OrderManagementScreenProps {
  navigation?: any;
  route?: any;
}

const statusFilters: Array<{ value: OrderStatus | 'ALL'; label: string; count?: number }> = [
  { value: 'ALL', label: 'All Orders' },
  { value: OrderStatus.PENDING, label: 'Pending' },
  { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
  { value: OrderStatus.PREPARING, label: 'Preparing' },
  { value: OrderStatus.READY, label: 'Ready' },
  { value: OrderStatus.SERVED, label: 'Served' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled' },
];

const OrderManagementScreen: React.FC<OrderManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    orders,
    filteredOrders,
    searchQuery,
    statusFilter,
    isLoading,
    loadOrders,
    selectOrder,
    updateOrderStatus,
    cancelOrder,
    setSearchQuery,
    setStatusFilter,
  } = useOrderManagement();

  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load orders on component mount
  useEffect(() => {
    const initializeOrders = async () => {
      try {
        await loadOrders();
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load orders',
        });
      }
    };

    initializeOrders();
  }, [loadOrders]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to refresh orders',
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadOrders]);

  // Handle order item press
  const handleOrderPress = useCallback((order: Order) => {
    selectOrder(order);
    navigation?.navigate('OrderDetails', { orderId: order.id });
  }, [selectOrder, navigation]);

  // Handle order status update
  const handleStatusUpdate = useCallback(async (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    try {
      await updateOrderStatus(order.id, nextStatus);
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order ${order.order_number} status updated to ${nextStatus}`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update order status',
      });
    }
  }, [updateOrderStatus]);

  // Handle order cancellation
  const handleOrderCancel = useCallback(async (order: Order) => {
    try {
      await cancelOrder(order.id, 'Cancelled from order management');
      showToast({
        type: 'success',
        title: 'Order Cancelled',
        message: `Order ${order.order_number} has been cancelled`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel order',
      });
    }
  }, [cancelOrder]);

  // Handle payment processing - Restaurant workflow
  const handleProcessPayment = useCallback(async (order: Order) => {
    try {
      // Navigate to payment processing screen
      navigation?.navigate('PaymentProcessing', { 
        orderId: order.id,
        orderTotal: order.total_amount,
        tableNumber: order.table_number || 'N/A'
      });
      
      showToast({
        type: 'info',
        title: 'Payment Processing',
        message: `Processing payment for Order ${order.order_number}`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Payment Error',
        message: 'Failed to process payment. Please try again.',
      });
    }
  }, [navigation]);

  // Get next status for quick status updates
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.SERVED;
      default:
        return null;
    }
  };

  // Get order counts for each status
  const getStatusCounts = () => {
    return statusFilters.map(filter => ({
      ...filter,
      count: filter.value === 'ALL' 
        ? orders.length 
        : orders.filter(order => order.status === filter.value).length,
    }));
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={theme.colors.onSurfaceVariant} 
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.onSurface }]}
          placeholder="Search orders by number, table, or instructions..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons 
              name="clear" 
              size={20} 
              color={theme.colors.onSurfaceVariant} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <MaterialIcons 
          name="filter-list" 
          size={20} 
          color={theme.colors.onPrimaryContainer} 
        />
      </TouchableOpacity>
    </View>
  );

  // Render filter chips
  const renderFilters = () => {
    if (!showFilters) return null;

    const statusCounts = getStatusCounts();

    return (
      <View style={styles.filtersContainer}>
        <FlatList
          data={statusCounts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: statusFilter === item.value
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: statusFilter === item.value
                    ? theme.colors.primary
                    : theme.colors.outline,
                },
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: statusFilter === item.value
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                  },
                ]}
              >
                {item.label}
              </Text>
              {item.count !== undefined && (
                <View
                  style={[
                    styles.filterChipBadge,
                    {
                      backgroundColor: statusFilter === item.value
                        ? theme.colors.onPrimary
                        : theme.colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipBadgeText,
                      {
                        color: statusFilter === item.value
                          ? theme.colors.primary
                          : theme.colors.onPrimary,
                      },
                    ]}
                  >
                    {item.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderListItem
      order={item}
      onPress={handleOrderPress}
      onViewDetails={handleOrderPress}
      onPrintKOT={(order) => {
        showToast({
          type: 'info',
          title: 'Print KOT',
          message: `Printing KOT for ${order.order_number}`,
        });
      }}
      onUpdateStatus={handleStatusUpdate}
      onProcessPayment={handleProcessPayment} // New payment handler
      showActions={true}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="receipt-long" 
        size={64} 
        color={theme.colors.onSurfaceVariant} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No Orders Found
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery || statusFilter !== 'ALL'
          ? 'Try adjusting your search or filter criteria'
          : 'Orders will appear here when customers place them'
        }
      </Text>
    </View>
  );

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
        Order Management
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={handleRefresh}
        >
          <MaterialIcons 
            name="refresh" 
            size={20} 
            color={theme.colors.onPrimaryContainer} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderSearchBar()}
      {renderFilters()}
      
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyListContainer : undefined}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    ...typography.headlineSmall,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    marginLeft: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    marginLeft: spacing.sm,
  },
  filterButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  filtersContainer: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  filterChipText: {
    ...typography.labelMedium,
    fontWeight: '500',
  },
  filterChipBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  filterChipBadgeText: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.headlineMedium,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default OrderManagementScreen;