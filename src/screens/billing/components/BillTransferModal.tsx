/**
 * BillTransferModal - Two-step flow to move items from one order to another.
 * Step 1: Select items to transfer.
 * Step 2: Select target order.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { UnifiedOrder, UnifiedOrderItem } from '@/types/unified-order.types';
import { showToast } from '@/utils/toast';

interface BillTransferModalProps {
  visible: boolean;
  currentOrderId: string;
  onClose: () => void;
  onTransferred: () => void;
}

const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

const BillTransferModal: React.FC<BillTransferModalProps> = ({
  visible,
  currentOrderId,
  onClose,
  onTransferred,
}) => {
  const { theme } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const { activeOrders, getOrderById, transferItems, loadOrders } = useUnifiedOrder();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const currentOrder = getOrderById(currentOrderId);

  useEffect(() => {
    if (visible) {
      setStep(1);
      setSelectedItemIds([]);
      setIsLoadingOrders(true);
      loadOrders()
        .catch(() => { /* ignore */ })
        .finally(() => setIsLoadingOrders(false));
    }
  }, [visible, loadOrders]);

  const eligibleOrders = activeOrders.filter(
    o => o.id !== currentOrderId && o.status !== 'paid' && o.status !== 'cancelled'
  );

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleTransfer = useCallback(async (targetOrder: UnifiedOrder) => {
    if (selectedItemIds.length === 0) return;
    setIsTransferring(true);
    try {
      await transferItems(currentOrderId, targetOrder.id, selectedItemIds);
      showToast({
        type: 'success',
        title: 'Items Transferred',
        message: `${selectedItemIds.length} item(s) moved to ${targetOrder.tableName}`,
      });
      onTransferred();
      onClose();
    } catch {
      showToast({ type: 'error', title: 'Transfer Failed', message: 'Could not transfer items. Please try again.' });
    } finally {
      setIsTransferring(false);
    }
  }, [currentOrderId, selectedItemIds, transferItems, onTransferred, onClose]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: screenHeight * 0.75,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.outline,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    backBtn: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      flex: 1,
    },
    headerSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
    },
    closeBtn: { padding: theme.spacing.xs },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      gap: theme.spacing.md,
    },
    itemName: { ...theme.typography.body1, color: theme.colors.onSurface, flex: 1 },
    itemPrice: { ...theme.typography.body2, color: theme.colors.onSurfaceSecondary },
    orderCard: {
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    orderCardTitle: { ...theme.typography.body1, fontWeight: '600', color: theme.colors.onSurface },
    orderCardSub: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, marginTop: 2 },
    footer: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    cancelBtnText: { ...theme.typography.body1, color: theme.colors.onSurface },
    nextBtn: {
      flex: 2,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    nextBtnDisabled: { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.5 },
    nextBtnText: { ...theme.typography.body1, color: theme.colors.onPrimary, fontWeight: '600' },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      padding: theme.spacing.xl,
    },
  });

  const renderItemRow = useCallback(({ item }: { item: UnifiedOrderItem }) => {
    const checked = selectedItemIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => toggleItem(item.id)}
        testID={`transfer-item-${item.id}`}
      >
        <MaterialCommunityIcons
          name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={checked ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
        <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.itemTotal)}</Text>
      </TouchableOpacity>
    );
  }, [selectedItemIds, toggleItem, styles, theme]);

  const renderOrderCard = useCallback(({ item }: { item: UnifiedOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleTransfer(item)}
      disabled={isTransferring}
      testID={`transfer-target-${item.id}`}
    >
      <Text style={styles.orderCardTitle}>{item.tableName} · {item.orderNumber}</Text>
      <Text style={styles.orderCardSub}>
        {item.items.length} item(s) · {formatPrice(item.totalAmount)} · {item.status.toUpperCase()}
      </Text>
    </TouchableOpacity>
  ), [handleTransfer, isTransferring, styles]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            {step === 2 && (
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.onSurface} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {step === 1 ? 'Transfer Items' : 'Select Destination'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {step === 1 ? 'Select items to move' : 'Move to which table?'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {step === 1 ? (
            <>
              {isLoadingOrders ? (
                <ActivityIndicator style={{ margin: 32 }} color={theme.colors.primary} />
              ) : (
                <ScrollView testID="transfer-items-loaded" style={{ maxHeight: screenHeight * 0.3 }}>
                  {(currentOrder?.items ?? []).length === 0 ? (
                    <Text style={styles.emptyText}>No items in this order</Text>
                  ) : (
                    (currentOrder?.items ?? []).map(item => (
                      <React.Fragment key={item.id}>
                        {renderItemRow({ item } as any)}
                      </React.Fragment>
                    ))
                  )}
                </ScrollView>
              )}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, selectedItemIds.length === 0 && styles.nextBtnDisabled]}
                  onPress={() => setStep(2)}
                  disabled={selectedItemIds.length === 0}
                  testID="btn-transfer-next"
                >
                  <Text style={styles.nextBtnText}>Next: Select Table →</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {isTransferring ? (
                <ActivityIndicator style={{ margin: 32 }} color={theme.colors.primary} />
              ) : (
                <ScrollView testID="transfer-orders-loaded" style={{ maxHeight: screenHeight * 0.3 }}>
                  {eligibleOrders.length === 0 ? (
                    <Text style={styles.emptyText}>No other active orders to transfer to</Text>
                  ) : (
                    eligibleOrders.map(order => (
                      <React.Fragment key={order.id}>
                        {renderOrderCard({ item: order } as any)}
                      </React.Fragment>
                    ))
                  )}
                </ScrollView>
              )}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(1)}>
                  <Text style={styles.cancelBtnText}>← Back</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default BillTransferModal;
