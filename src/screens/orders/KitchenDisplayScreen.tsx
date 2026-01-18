/**
 * KitchenDisplayScreen - Kitchen operations interface
 * Optimized display for kitchen staff with ticket queue and status management
 * Uses EnhancedKitchenContext with AsyncStorage-based ticket management
 */

import React, { useCallback, useState, useMemo } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEnhancedKitchen, useKitchenTickets, useKitchenActions } from '@/context/kitchen';
import { useTheme } from '@/hooks/useTheme';
import { KitchenTicket, TicketStatus, KitchenStation } from '@/types/kitchen-ticket.types';
import { showToast } from '@/utils/toast';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface KitchenDisplayScreenProps {
  navigation?: any;
}

const KitchenDisplayScreen: React.FC<KitchenDisplayScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { state, refreshTickets, sortedTickets, filteredTickets } = useEnhancedKitchen();
  const { stats, isLoading } = useKitchenTickets();
  const { updateTicketStatus, bumpTicket } = useKitchenActions();

  const [refreshing, setRefreshing] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.outline,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      ...theme.typography.h2,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      marginLeft: theme.spacing.xs,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.xs / 2,
    },
    statNumber: {
      ...theme.typography.h2,
      fontWeight: '700',
      marginBottom: theme.spacing.xs / 2,
      fontSize: 28,
    },
    statLabel: {
      ...theme.typography.caption,
      fontWeight: '600',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    filterContainer: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.full,
      padding: theme.spacing.xs / 2,
    },
    filterButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
    },
    filterButtonText: {
      ...theme.typography.body2,
      fontWeight: '600',
    },
    listContainer: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    ticketRow: {
      justifyContent: 'space-between',
      alignItems: 'stretch',
      paddingHorizontal: 0,
    },
    ticketCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs / 2,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    ticketOrderInfo: {
      flex: 1,
    },
    ticketOrderNumber: {
      ...theme.typography.body1,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    ticketTableName: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    ticketStation: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primaryContainer,
    },
    ticketStationText: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    ticketItems: {
      marginBottom: theme.spacing.sm,
    },
    ticketItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    ticketItemQuantity: {
      ...theme.typography.body2,
      fontWeight: '700',
      color: theme.colors.primary,
      minWidth: 24,
    },
    ticketItemName: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      flex: 1,
    },
    ticketItemModifiers: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginLeft: 24,
      fontStyle: 'italic',
    },
    ticketFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    ticketTime: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    ticketStatus: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
    },
    ticketStatusText: {
      ...theme.typography.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    ticketActions: {
      flexDirection: 'row',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    ticketActionButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    ticketActionText: {
      ...theme.typography.body2,
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
    },
    allergenBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.errorContainer,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.xs,
    },
    allergenText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontWeight: '600',
      marginLeft: theme.spacing.xs / 2,
    },
    overdueBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.error,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    overdueText: {
      ...theme.typography.caption,
      color: theme.colors.onError,
      fontWeight: '700',
      fontSize: 10,
    },
    emptyListContainer: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      ...theme.typography.h3,
      fontWeight: '600',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    emptyMessage: {
      ...theme.typography.body1,
      textAlign: 'center',
      lineHeight: 24,
      color: theme.colors.onSurfaceVariant,
    },
  });

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTickets();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to refresh kitchen tickets',
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshTickets]);

  // Handle ticket status update
  const handleBumpTicket = useCallback(async (ticketId: string) => {
    try {
      // Get the ticket to determine current status
      const ticket = sortedTickets.find(t => t.id === ticketId);
      if (!ticket) return;

      // Determine next status for toast message
      const statusFlow: Record<TicketStatus, TicketStatus | null> = {
        pending: 'preparing',
        preparing: 'ready',
        ready: 'served',
        served: null,
        cancelled: null,
      };

      const nextStatus = statusFlow[ticket.status];

      await bumpTicket(ticketId);

      // Show specific toast based on next status
      if (nextStatus === 'served') {
        showToast({
          type: 'info',
          title: 'Order Served',
          message: 'Ticket marked as served. Payment can now be collected.',
        });
      } else if (nextStatus) {
        showToast({
          type: 'success',
          title: 'Status Updated',
          message: `Ticket moved to ${nextStatus.toUpperCase()}`,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update ticket status',
      });
    }
  }, [bumpTicket, sortedTickets]);

  // Get tickets to display
  const ticketsToShow = useMemo(() => {
    if (showAllTickets) {
      return sortedTickets;
    }
    return sortedTickets.filter(
      (t) => t.status !== 'served' && t.status !== 'cancelled'
    );
  }, [sortedTickets, showAllTickets]);

  // Get active ticket count
  const activeTicketCount = useMemo(() => {
    return sortedTickets.filter(
      (t) => t.status !== 'served' && t.status !== 'cancelled'
    ).length;
  }, [sortedTickets]);

  // Get status color (for badge and card border)
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return { bg: theme.colors.warningContainer, text: theme.colors.warning };
      case 'preparing':
        return { bg: theme.colors.primaryContainer, text: theme.colors.primary };
      case 'ready':
        return { bg: theme.colors.successContainer, text: theme.colors.success };
      case 'served':
        return { bg: theme.colors.surfaceLight, text: theme.colors.onSurfaceVariant };
      case 'cancelled':
        return { bg: theme.colors.errorContainer, text: theme.colors.error };
      default:
        return { bg: theme.colors.surfaceLight, text: theme.colors.onSurfaceVariant };
    }
  };

  // Get card background and border color based on status for better visual distinction
  const getCardStatusStyles = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: '#FFF8E1', // Light amber
          borderColor: '#FFA000', // Amber
          borderWidth: 2,
        };
      case 'preparing':
        return {
          backgroundColor: '#E3F2FD', // Light blue
          borderColor: '#1976D2', // Blue
          borderWidth: 2,
        };
      case 'ready':
        return {
          backgroundColor: '#E8F5E9', // Light green
          borderColor: '#388E3C', // Green
          borderWidth: 3, // Thicker border for ready items
        };
      case 'served':
        return {
          backgroundColor: '#F5F5F5', // Light grey
          borderColor: '#9E9E9E', // Grey
          borderWidth: 1,
          opacity: 0.7,
        };
      case 'cancelled':
        return {
          backgroundColor: '#FFEBEE', // Light red
          borderColor: '#D32F2F', // Red
          borderWidth: 2,
          opacity: 0.6,
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: 1,
        };
    }
  };

  // Get next action text
  const getNextAction = (status: TicketStatus): { text: string; icon: string } | null => {
    switch (status) {
      case 'pending':
        return { text: 'Start', icon: 'play' };
      case 'preparing':
        return { text: 'Ready', icon: 'check' };
      case 'ready':
        return { text: 'Served', icon: 'check-all' };
      default:
        return null;
    }
  };

  // Format elapsed time
  const formatElapsedTime = (createdAt: string): string => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    if (elapsed < 1) return 'Just now';
    if (elapsed === 1) return '1 min';
    return `${elapsed} mins`;
  };

  // Format station name
  const formatStation = (station: KitchenStation): string => {
    return station.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Render header with stats
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Kitchen Display</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={handleRefresh}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={theme.colors.onPrimaryContainer}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.secondaryContainer }]}
            onPress={() => setSortBy(sortBy === 'priority' ? 'time' : 'priority')}
          >
            <MaterialCommunityIcons
              name={sortBy === 'priority' ? 'sort-variant' : 'clock-outline'}
              size={20}
              color={theme.colors.onSecondaryContainer}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: theme.colors.warningContainer }]}>
          <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
            {stats?.pendingCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.warning }]}>Pending</Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {stats?.preparingCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.primary }]}>Preparing</Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: theme.colors.successContainer }]}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {stats?.readyCount || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.success }]}>Ready</Text>
        </View>

        <View style={[styles.statItem, { backgroundColor: theme.colors.infoContainer }]}>
          <Text style={[styles.statNumber, { color: theme.colors.info }]}>
            {stats?.totalTickets || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.info }]}>Total</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showAllTickets && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setShowAllTickets(false)}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: !showAllTickets ? theme.colors.onPrimary : theme.colors.onSurface,
              },
            ]}
          >
            Active ({activeTicketCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            showAllTickets && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setShowAllTickets(true)}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: showAllTickets ? theme.colors.onPrimary : theme.colors.onSurface,
              },
            ]}
          >
            All ({sortedTickets.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render ticket card
  const renderTicketCard = ({ item: ticket }: { item: KitchenTicket }) => {
    const statusColor = getStatusColor(ticket.status);
    const nextAction = getNextAction(ticket.status);
    const cardStatusStyles = getCardStatusStyles(ticket.status);

    return (
      <View style={[styles.ticketCard, cardStatusStyles]}>
        {ticket.isOverdue && (
          <View style={styles.overdueBadge}>
            <Text style={styles.overdueText}>OVERDUE</Text>
          </View>
        )}

        <View style={styles.ticketHeader}>
          <View style={styles.ticketOrderInfo}>
            <Text style={styles.ticketOrderNumber}>#{ticket.orderNumber}</Text>
            <Text style={styles.ticketTableName}>{ticket.tableName}</Text>
          </View>
          <View style={styles.ticketStation}>
            <Text style={styles.ticketStationText}>{formatStation(ticket.station)}</Text>
          </View>
        </View>

        <View style={styles.ticketItems}>
          {(ticket.items || []).slice(0, 5).map((item, index) => (
            <View key={item.id || index}>
              <View style={styles.ticketItem}>
                <Text style={styles.ticketItemQuantity}>{item.quantity}x</Text>
                <Text style={styles.ticketItemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              {item.modifiers && item.modifiers.length > 0 && (
                <Text style={styles.ticketItemModifiers} numberOfLines={1}>
                  {item.modifiers.join(', ')}
                </Text>
              )}
            </View>
          ))}
          {(ticket.items || []).length > 5 && (
            <Text style={styles.ticketItemModifiers}>
              +{(ticket.items || []).length - 5} more items
            </Text>
          )}
        </View>

        {ticket.hasAllergens && (
          <View style={styles.allergenBadge}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={14}
              color={theme.colors.error}
            />
            <Text style={styles.allergenText}>Contains Allergens</Text>
          </View>
        )}

        <View style={styles.ticketFooter}>
          <Text style={styles.ticketTime}>{formatElapsedTime(ticket.createdAt)}</Text>
          <View style={[styles.ticketStatus, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.ticketStatusText, { color: statusColor.text }]}>
              {ticket.status}
            </Text>
          </View>
        </View>

        {nextAction && (
          <View style={styles.ticketActions}>
            <TouchableOpacity
              style={[styles.ticketActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleBumpTicket(ticket.id)}
            >
              <MaterialCommunityIcons
                name={nextAction.icon as any}
                size={18}
                color={theme.colors.onPrimary}
              />
              <Text style={[styles.ticketActionText, { color: theme.colors.onPrimary }]}>
                {nextAction.text}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="chef-hat"
        size={64}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={styles.emptyTitle}>
        {showAllTickets ? 'No Tickets Available' : 'No Active Tickets'}
      </Text>
      <Text style={styles.emptyMessage}>
        {showAllTickets
          ? 'New tickets will appear here when orders are sent to the kitchen'
          : 'All tickets are completed or there are no pending tickets'}
      </Text>
    </View>
  );

  // Get number of columns based on screen size
  const getNumColumns = () => {
    if (isTablet) {
      return width > 1200 ? 3 : 2;
    }
    return width > 600 ? 2 : 1;
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <FlatList
        data={ticketsToShow}
        keyExtractor={(item) => item.id}
        renderItem={renderTicketCard}
        numColumns={getNumColumns()}
        key={`kitchen-grid-${getNumColumns()}`}
        columnWrapperStyle={getNumColumns() > 1 ? styles.ticketRow : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          ticketsToShow.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
};

export default KitchenDisplayScreen;
