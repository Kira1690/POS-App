/**
 * KitchenDisplayScreen - Kitchen operations interface
 * Optimized display for kitchen staff with order queue and status management
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useKitchen } from '@/context/order';
import { useTheme } from '@/hooks/useTheme';
import { KitchenOrder } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { KitchenOrderCard } from '@/components/business/order';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { showToast } from '@/utils/toast';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface KitchenDisplayScreenProps {
  navigation?: any;
}

const KitchenDisplayScreen: React.FC<KitchenDisplayScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    kitchenOrders,
    activeKitchenOrders,
    loadKitchenOrders,
    updateOrderStatus,
  } = useKitchen();

  const [refreshing, setRefreshing] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');

  // Load kitchen orders on component mount
  useEffect(() => {
    const initializeKitchenOrders = async () => {
      try {
        await loadKitchenOrders();
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load kitchen orders',
        });
      }
    };

    initializeKitchenOrders();

    // Set up auto-refresh for kitchen orders
    const interval = setInterval(() => {
      loadKitchenOrders();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadKitchenOrders]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadKitchenOrders();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to refresh kitchen orders',
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadKitchenOrders]);

  // Handle order status update
  const handleStatusUpdate = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order status updated to ${status}`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update order status',
      });
    }
  }, [updateOrderStatus]);

  // Handle order details view
  const handleViewDetails = useCallback((order: KitchenOrder) => {
    // Navigate to order details or show modal with full order details
    navigation?.navigate('OrderDetails', { orderId: order.id });
  }, [navigation]);

  // Sort orders based on selected criteria
  const sortOrders = useCallback((orders: KitchenOrder[]) => {
    return [...orders].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 };
        const aPriority = priorityOrder[a.priority] ?? 4;
        const bPriority = priorityOrder[b.priority] ?? 4;
        return aPriority - bPriority;
      } else {
        // Sort by time (oldest first)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });
  }, [sortBy]);

  // Get orders to display
  const ordersToShow = showAllOrders ? kitchenOrders : activeKitchenOrders;
  const sortedOrders = sortOrders(ordersToShow);

  // Get order statistics
  const getOrderStats = () => {
    const total = kitchenOrders.length;
    const pending = kitchenOrders.filter(order => 
      order.items.some(item => item.status === 'pending' || item.status === 'confirmed')
    ).length;
    const preparing = kitchenOrders.filter(order =>
      order.items.some(item => item.status === 'preparing')
    ).length;
    const ready = kitchenOrders.filter(order =>
      order.items.some(item => item.status === 'ready')
    ).length;

    return { total, pending, preparing, ready };
  };

  const stats = getOrderStats();

  // Render header with stats and controls
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Kitchen Display
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
          
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.secondaryContainer }]}
            onPress={() => setSortBy(sortBy === 'priority' ? 'time' : 'priority')}
          >
            <MaterialIcons 
              name={sortBy === 'priority' ? 'priority-high' : 'schedule'} 
              size={20} 
              color={theme.colors.onSecondaryContainer} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Order statistics - Professional kitchen status display */}
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: theme.colors.warningLight, borderWidth: 1, borderColor: theme.colors.warning }]}>
          <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
            {stats.pending}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.warning }]}>
            Pending
          </Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: theme.colors.successLight }]}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {stats.preparing}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.success }]}>
            Preparing
          </Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {stats.ready}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.primary }]}>
            Ready
          </Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: theme.colors.infoLight }]}>
          <Text style={[styles.statNumber, { color: theme.colors.info }]}>
            {stats.total}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.info }]}>
            Total
          </Text>
        </View>
      </View>
      
      {/* Filter toggle */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showAllOrders && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setShowAllOrders(false)}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: !showAllOrders 
                  ? theme.colors.onPrimary 
                  : theme.colors.onSurface,
              },
            ]}
          >
            Active Orders ({activeKitchenOrders.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            showAllOrders && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setShowAllOrders(true)}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: showAllOrders 
                  ? theme.colors.onPrimary 
                  : theme.colors.onSurface,
              },
            ]}
          >
            All Orders ({kitchenOrders.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render order item with proper grid layout
  const renderOrderItem = ({ item, index }: { item: KitchenOrder; index: number }) => (
    <View style={styles.orderItemWrapper}>
      <KitchenOrderCard
        order={item}
        onStatusUpdate={handleStatusUpdate}
        onViewDetails={handleViewDetails}
        compact={false}
      />
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="restaurant" 
        size={64} 
        color={theme.colors.onSurfaceVariant} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        {showAllOrders ? 'No Orders Available' : 'No Active Orders'}
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
        {showAllOrders 
          ? 'New orders will appear here when they are placed'
          : 'All orders are completed or there are no pending orders'
        }
      </Text>
    </View>
  );

  // Get number of columns based on screen size - optimized for kitchen displays
  const getNumColumns = () => {
    if (isTablet) {
      return width > 1200 ? 3 : 2; // Large tablets get 3 columns, regular tablets get 2
    }
    return width > 600 ? 2 : 1; // Large phones get 2 columns, regular phones get 1
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        numColumns={getNumColumns()}
        key={`kitchen-grid-${getNumColumns()}`} // Force re-render when columns change
        columnWrapperStyle={getNumColumns() > 1 ? styles.orderRow : undefined} // Professional row styling
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={sortedOrders.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Professional performance optimizations for kitchen displays
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xs / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    ...typography.headlineMedium,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
    fontSize: 28,
  },
  statLabel: {
    ...typography.labelSmall,
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.full,
    padding: spacing.xs / 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  filterButtonText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  // Professional kitchen display grid layout
  orderRow: {
    justifyContent: 'space-between', // Even spacing between columns
    alignItems: 'stretch', // Equal height cards
    paddingHorizontal: 0,
  },
  orderItemWrapper: {
    flex: 1, // Equal width columns
    minWidth: 0, // Prevent flex shrinking issues
    marginHorizontal: spacing.xs / 2, // Professional spacing between cards
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

export default KitchenDisplayScreen;