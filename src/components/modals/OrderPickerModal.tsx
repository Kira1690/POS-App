/**
 * OrderPickerModal — Shown when a table has multiple active orders.
 * Lets the staff choose which order to edit.
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@/components/common';
import { UnifiedOrder } from '@/types/unified-order.types';
import { Table } from '@/types/table.types';
import { formatPrice } from '@/utils/currency';

interface OrderPickerModalProps {
  visible: boolean;
  table: Table | null;
  orders: UnifiedOrder[];
  onSelect: (order: UnifiedOrder) => void;
  onClose: () => void;
}

export const OrderPickerModal: React.FC<OrderPickerModalProps> = ({
  visible,
  table,
  orders,
  onSelect,
  onClose,
}) => {
  const { theme } = useTheme();
  const { modalMaxWidth, contentPadding, isPhone, isSmallTablet } = useResponsive();
  const compact = isPhone || isSmallTablet;

  if (!table) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: contentPadding,
    },
    card: {
      width: '100%',
      maxWidth: modalMaxWidth,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 8,
      maxHeight: '70%',
    },
    header: {
      backgroundColor: theme.colors.primaryContainer,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      paddingHorizontal: compact ? 14 : 20,
      paddingVertical: compact ? 10 : 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 8 : 10,
    },
    headerText: {
      flex: 1,
      fontSize: compact ? 14 : 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    closeBtn: {
      padding: 4,
    },
    subtitle: {
      fontSize: compact ? 12 : 13,
      color: theme.colors.onSurfaceVariant,
      paddingHorizontal: compact ? 14 : 20,
      paddingVertical: compact ? 8 : 10,
    },
    orderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: compact ? 14 : 20,
      paddingVertical: compact ? 12 : 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + '44',
      gap: compact ? 10 : 12,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: compact ? 14 : 15,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    orderMeta: {
      fontSize: compact ? 11 : 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    orderTotal: {
      fontSize: compact ? 14 : 15,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: theme.colors.tertiaryContainer,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.tertiary,
      textTransform: 'uppercase',
    },
    chevron: {
      opacity: 0.5,
    },
  });

  const renderOrder = ({ item }: { item: UnifiedOrder }) => (
    <TouchableOpacity
      style={styles.orderRow}
      onPress={() => onSelect(item)}
      activeOpacity={0.75}
      testID={`btn-pick-order-${item.orderNumber}`}
    >
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <Text style={styles.orderMeta}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <Text style={styles.orderTotal}>{formatPrice(item.totalAmount ?? 0)}</Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <View style={styles.chevron}>
        <Icon name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card} testID="modal-order-picker">
          <View style={styles.header}>
            <Icon name="format-list-bulleted" size={20} color={theme.colors.primary} />
            <Text style={styles.headerText}>
              Select Order — Table {table.table_number}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="btn-order-picker-close">
              <Icon name="close" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            This table has {orders.length} active orders. Select one to edit.
          </Text>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default OrderPickerModal;
