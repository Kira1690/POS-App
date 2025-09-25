import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OnlineOrder } from '@/types/online-orders.types';
import { theme } from '@/constants/theme';

interface OrderCardProps {
  order: OnlineOrder;
  onAccept: () => void;
  onReject: () => void;
  onMarkReady: () => void;
  onNotifyDriver: () => void;
  onViewDetails: () => void;
}

export default function OrderCard({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onNotifyDriver,
  onViewDetails,
}: OrderCardProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ubereats': return '#000000';
      case 'doordash': return '#FF3008';
      case 'grubhub': return '#FF8500';
      case 'postmates': return '#000000';
      default: return theme.colors.gray;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'ubereats': return 'UberEats';
      case 'doordash': return 'DoorDash';
      case 'grubhub': return 'GrubHub';
      case 'postmates': return 'Postmates';
      default: return platform;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return theme.colors.primary;
      case 'accepted': return theme.colors.primary;
      case 'preparing': return theme.colors.warning;
      case 'ready': return theme.colors.success;
      case 'picked_up': return theme.colors.success;
      case 'delivered': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'NEW ORDER';
      case 'accepted': return 'ACCEPTED';
      case 'preparing': return 'PREPARING';
      case 'ready': return 'READY';
      case 'picked_up': return 'PICKED UP';
      case 'delivered': return 'DELIVERED';
      case 'cancelled': return 'CANCELLED';
      default: return status.toUpperCase();
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'new': return theme.colors.primary;
      case 'preparing': return theme.colors.warning;
      case 'ready': return theme.colors.success;
      default: return theme.colors.border;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const getItemsText = (items: any[]) => {
    if (items.length === 0) return 'No items';
    if (items.length === 1) {
      const item = items[0];
      return `${item.quantity}x ${item.name}`;
    }
    if (items.length === 2) {
      return items.map(item => `${item.quantity}x ${item.name}`).join(', ');
    }
    const first = items[0];
    return `${first.quantity}x ${first.name} +${items.length - 1} more`;
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const renderActionButtons = () => {
    switch (order.status) {
      case 'new':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>✅ Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>❌ Reject</Text>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
      case 'preparing':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.readyButton} onPress={onMarkReady}>
              <Text style={styles.readyButtonText}>🍽️ Mark Ready</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
              <Text style={styles.detailsButtonText}>📋 Details</Text>
            </TouchableOpacity>
          </View>
        );
      case 'ready':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.notifyButton} onPress={onNotifyDriver}>
              <Text style={styles.notifyButtonText}>📞 Notify Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
              <Text style={styles.detailsButtonText}>📋 Details</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
            <Text style={styles.detailsButtonText}>📋 Details</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={[styles.container, { borderColor: getBorderColor(order.status) }]}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.badges}>
          <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(order.platform) }]}>
            <Text style={styles.platformText}>{getPlatformName(order.platform)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{getTimeAgo(order.created_at)}</Text>
      </View>

      {/* Order ID */}
      <Text style={styles.orderId}>Order #{order.platform_order_id}</Text>

      {/* Customer Info */}
      <Text style={styles.customerName}>👤 {order.customer.name}</Text>

      {/* Items */}
      <Text style={styles.items}>{getItemsText(order.items)}</Text>

      {/* Order Details Row */}
      <View style={styles.detailsRow}>
        <View style={styles.leftDetails}>
          <Text style={styles.total}>{formatCurrency(order.total)}</Text>
          <Text style={styles.orderType}>
            {order.type === 'delivery' ? '🚗 Delivery' : '🎒 Pickup'}
          </Text>
          {order.status === 'preparing' && (
            <Text style={styles.progress}>Progress: {order.progress_percentage}%</Text>
          )}
          {order.status === 'ready' && order.type === 'delivery' && (
            <Text style={styles.eta}>Pickup: 5 mins</Text>
          )}
          {order.status === 'new' && order.estimated_delivery_time && (
            <Text style={styles.eta}>ETA: {order.estimated_delivery_time} mins</Text>
          )}
        </View>
        
        <View style={styles.rightDetails}>
          {renderActionButtons()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  platformText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  timeAgo: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  items: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  leftDetails: {
    flex: 1,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginBottom: 2,
  },
  orderType: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  progress: {
    fontSize: 11,
    color: theme.colors.warning,
  },
  eta: {
    fontSize: 11,
    color: theme.colors.warning,
  },
  rightDetails: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    gap: 5,
    alignItems: 'flex-end',
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
  },
  rejectButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    textAlign: 'center',
  },
  readyButton: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
  },
  readyButtonText: {
    color: theme.colors.white,
    fontSize: 11,
    textAlign: 'center',
  },
  notifyButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 90,
  },
  notifyButtonText: {
    color: theme.colors.white,
    fontSize: 11,
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
  },
  detailsButtonText: {
    color: theme.colors.white,
    fontSize: 11,
    textAlign: 'center',
  },
});