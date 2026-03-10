/**
 * ExistingOrderModal — In-app dialog shown when a user selects an occupied table.
 *
 * Replaces the native Alert.alert() with an app-styled modal that offers 3 actions:
 *   1. Update Order    — continue adding items to the existing order
 *   2. Shift Table     — move the existing order to a different available table
 *   3. Cancel & New    — cancel the existing order and start a fresh one
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@/components/common';
import { UnifiedOrder } from '@/types/unified-order.types';
import { Table } from '@/types/table.types';
import { formatPrice } from '@/utils/currency';

interface ExistingOrderModalProps {
  visible: boolean;
  table: Table | null;
  existingOrder: UnifiedOrder | null;
  onUpdateOrder: () => void;
  onShiftTable: () => void;
  onCancelAndNew: () => void;
  onClose: () => void;
  onSplitTable?: () => void;
  splitAvailable?: boolean;
  remainingSeats?: number;
  activeOrderCount?: number;
}

export const ExistingOrderModal: React.FC<ExistingOrderModalProps> = ({
  visible,
  table,
  existingOrder,
  onUpdateOrder,
  onShiftTable,
  onCancelAndNew,
  onClose,
  onSplitTable,
  splitAvailable = true,
  remainingSeats = 0,
  activeOrderCount = 1,
}) => {
  const { theme } = useTheme();
  const { modalMaxWidth, contentPadding, isPhone, isSmallTablet } = useResponsive();
  const compact = isPhone || isSmallTablet;

  if (!table || !existingOrder) return null;

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
    },
    header: {
      backgroundColor: theme.colors.warning + '22',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.warning + '44',
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
    body: {
      paddingHorizontal: compact ? 14 : 20,
      paddingTop: compact ? 12 : 16,
      paddingBottom: compact ? 6 : 8,
    },
    orderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    orderLabel: {
      fontSize: compact ? 12 : 13,
      color: theme.colors.onSurfaceVariant,
    },
    orderValue: {
      fontSize: compact ? 12 : 13,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline + '44',
      marginVertical: 14,
    },
    question: {
      fontSize: compact ? 13 : 14,
      color: theme.colors.onSurface,
      marginBottom: compact ? 10 : 14,
      fontWeight: '500',
    },
    actions: {
      paddingHorizontal: compact ? 12 : 16,
      paddingBottom: compact ? 12 : 16,
      gap: compact ? 8 : 10,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: compact ? 10 : 13,
      paddingHorizontal: compact ? 12 : 16,
      borderRadius: 10,
      gap: compact ? 10 : 12,
      borderWidth: 1,
    },
    btnPrimary: {
      backgroundColor: theme.colors.tertiaryContainer,
      borderColor: theme.colors.tertiary,
    },
    btnSecondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
    },
    btnDanger: {
      backgroundColor: theme.colors.errorContainer || theme.colors.surface,
      borderColor: theme.colors.error,
    },
    btnLabel: {
      flex: 1,
    },
    btnTitle: {
      fontSize: compact ? 13 : 14,
      fontWeight: '600',
    },
    btnSubtitle: {
      fontSize: compact ? 10 : 11,
      marginTop: 1,
    },
    btnTitlePrimary: {
      color: theme.colors.tertiary,
    },
    btnTitleSecondary: {
      color: theme.colors.onSurface,
    },
    btnTitleDanger: {
      color: theme.colors.error,
    },
    btnSubPrimary: {
      color: theme.colors.tertiary + 'aa',
    },
    btnSubSecondary: {
      color: theme.colors.onSurfaceVariant,
    },
    btnSubDanger: {
      color: theme.colors.error + 'bb',
    },
    btnSplit: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.success,
    },
    btnTitleSplit: {
      color: theme.colors.onSurface,
    },
    btnSubSplit: {
      color: theme.colors.onSurfaceVariant,
    },
    btnDisabled: {
      opacity: 0.5,
    },
  });

  const itemCount = existingOrder.items.length;
  const total = existingOrder.total ?? 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="alert-circle" size={20} color={theme.colors.warning} />
            <Text style={styles.headerText}>
              Table {table.table_number} Has {activeOrderCount > 1 ? `${activeOrderCount} Active Orders` : 'an Active Order'}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="btn-existing-order-close">
              <Icon name="close" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Order details */}
          <View style={styles.body}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order</Text>
              <Text style={styles.orderValue}>{existingOrder.orderNumber}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Items</Text>
              <Text style={styles.orderValue}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total</Text>
              <Text style={styles.orderValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Status</Text>
              <Text style={[styles.orderValue, { color: theme.colors.warning }]}>
                {existingOrder.status.toUpperCase()}
              </Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.question}>What would you like to do?</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            {/* Update Order */}
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={onUpdateOrder}
              testID="btn-existing-update-order"
              activeOpacity={0.8}
            >
              <Icon name="pencil-plus" size={20} color={theme.colors.tertiary} />
              <View style={styles.btnLabel}>
                <Text style={[styles.btnTitle, styles.btnTitlePrimary]}>Update Order</Text>
                <Text style={[styles.btnSubtitle, styles.btnSubPrimary]}>Add or modify items on this table</Text>
              </View>
              <Icon name="chevron-right" size={18} color={theme.colors.tertiary + '88'} />
            </TouchableOpacity>

            {/* Shift Table */}
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onShiftTable}
              testID="btn-existing-shift-table"
              activeOpacity={0.8}
            >
              <Icon name="swap-horizontal" size={20} color={theme.colors.primary} />
              <View style={styles.btnLabel}>
                <Text style={[styles.btnTitle, styles.btnTitleSecondary]}>Shift Table</Text>
                <Text style={[styles.btnSubtitle, styles.btnSubSecondary]}>Move this order to a different table</Text>
              </View>
              <Icon name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* New Order (Split Table) */}
            {onSplitTable && (
              <TouchableOpacity
                style={[styles.btn, styles.btnSplit, !splitAvailable && styles.btnDisabled]}
                onPress={splitAvailable ? onSplitTable : undefined}
                disabled={!splitAvailable}
                testID="btn-existing-split-table"
                activeOpacity={0.8}
              >
                <Icon name="account-multiple-plus" size={20} color={splitAvailable ? theme.colors.success : theme.colors.onSurfaceVariant} />
                <View style={styles.btnLabel}>
                  <Text style={[styles.btnTitle, styles.btnTitleSplit]}>New Order (Split Table)</Text>
                  <Text style={[styles.btnSubtitle, styles.btnSubSplit]}>
                    {splitAvailable
                      ? `Add a separate party (${remainingSeats} seat${remainingSeats !== 1 ? 's' : ''} remaining)`
                      : 'Table at full capacity'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} color={splitAvailable ? theme.colors.success : theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}

            {/* Cancel & New Order */}
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={onCancelAndNew}
              testID="btn-existing-cancel-new"
              activeOpacity={0.8}
            >
              <Icon name="close-circle-outline" size={20} color={theme.colors.error} />
              <View style={styles.btnLabel}>
                <Text style={[styles.btnTitle, styles.btnTitleDanger]}>Cancel & New Order</Text>
                <Text style={[styles.btnSubtitle, styles.btnSubDanger]}>Cancel existing order, start fresh</Text>
              </View>
              <Icon name="chevron-right" size={18} color={theme.colors.error + '88'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ExistingOrderModal;
