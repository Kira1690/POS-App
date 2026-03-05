/**
 * OrderSummarySheet - Bottom sheet modal for quick order overview
 * Displayed when tapping a recent order card in ManagerDashboard
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { UnifiedOrder } from '@/types/unified-order.types';
import { UNIFIED_ORDER_STATUS_LABELS } from '@/types/unified-order.types';

interface OrderSummarySheetProps {
  order: UnifiedOrder | null;
  onClose: () => void;
  onViewFull: (orderId: string) => void;
}

const formatCurrency = (amount: number) =>
  `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const OrderSummarySheet: React.FC<OrderSummarySheetProps> = ({
  order,
  onClose,
  onViewFull,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '75%',
      paddingBottom: spacing.xl,
    },
    dragHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.outline,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerLeft: {
      flex: 1,
    },
    orderTitle: {
      ...typography.headlineSmall,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    orderMeta: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginTop: spacing.xs,
      alignSelf: 'flex-start',
    },
    statusText: {
      ...typography.labelSmall,
      fontWeight: '600',
      marginLeft: 4,
    },
    closeBtn: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    sectionLabel: {
      ...typography.labelMedium,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    itemName: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      flex: 1,
    },
    itemQty: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginHorizontal: spacing.sm,
    },
    itemPrice: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline,
      marginVertical: spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    summaryLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    summaryValue: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.primary,
      marginTop: spacing.xs,
    },
    totalLabel: {
      ...typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    totalValue: {
      ...typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    btnClose: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    btnCloseText: {
      ...typography.labelLarge,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    btnViewFull: {
      flex: 2,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    btnViewFullText: {
      ...typography.labelLarge,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
  });

  if (!order) return null;

  const statusColor = (() => {
    const map: Record<string, string> = {
      confirmed: theme.colors.info,
      preparing: theme.colors.warning,
      ready: theme.colors.success,
      served: theme.colors.tertiary,
      paid: theme.colors.success,
      cancelled: theme.colors.error,
    };
    return map[order.status] ?? theme.colors.onSurfaceVariant;
  })();

  const timeStr = new Date(order.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      visible={!!order}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.orderTitle}>
                  {order.tableName} · {order.orderNumber}
                </Text>
                <Text style={styles.orderMeta}>{timeStr}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
                  <MaterialIcons name="circle" size={8} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {UNIFIED_ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="btn-order-summary-close">
                <MaterialIcons name="close" size={22} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Items */}
              {order.items.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Items</Text>
                  {order.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemQty}>×{item.quantity}</Text>
                      <Text style={styles.itemPrice}>{formatCurrency(item.itemTotal)}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Totals */}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>{formatCurrency(order.taxAmount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
              </View>
            </ScrollView>

            {/* Footer buttons */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.btnClose} onPress={onClose}>
                <Text style={styles.btnCloseText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnViewFull}
                onPress={() => onViewFull(order.id)}
                testID="btn-order-summary-view-full"
              >
                <Text style={styles.btnViewFullText}>View Full Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default OrderSummarySheet;
