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
}

export const ExistingOrderModal: React.FC<ExistingOrderModalProps> = ({
  visible,
  table,
  existingOrder,
  onUpdateOrder,
  onShiftTable,
  onCancelAndNew,
  onClose,
}) => {
  const { theme } = useTheme();

  if (!table || !existingOrder) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 8,
    },
    header: {
      backgroundColor: theme.colors.warning + '22',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.warning + '44',
      paddingHorizontal: 20,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    orderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    orderLabel: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    orderValue: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outline + '44',
      marginVertical: 14,
    },
    question: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginBottom: 14,
      fontWeight: '500',
    },
    actions: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 10,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 10,
      gap: 12,
      borderWidth: 1,
    },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
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
      fontSize: 14,
      fontWeight: '600',
    },
    btnSubtitle: {
      fontSize: 11,
      marginTop: 1,
    },
    btnTitlePrimary: {
      color: '#fff',
    },
    btnTitleSecondary: {
      color: theme.colors.onSurface,
    },
    btnTitleDanger: {
      color: theme.colors.error,
    },
    btnSubPrimary: {
      color: 'rgba(255,255,255,0.75)',
    },
    btnSubSecondary: {
      color: theme.colors.onSurfaceVariant,
    },
    btnSubDanger: {
      color: theme.colors.error + 'bb',
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
              Table {table.table_number} Has an Active Order
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
              <Icon name="pencil-plus" size={20} color="#fff" />
              <View style={styles.btnLabel}>
                <Text style={[styles.btnTitle, styles.btnTitlePrimary]}>Update Order</Text>
                <Text style={[styles.btnSubtitle, styles.btnSubPrimary]}>Add or modify items on this table</Text>
              </View>
              <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
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
