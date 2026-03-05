/**
 * CombineBillsModal - Select another active order to merge into the current bill
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useUnifiedOrder } from '@/context/unified-order/UnifiedOrderContext';
import { UnifiedOrder } from '@/types/unified-order.types';
import { showToast } from '@/utils/toast';

interface CombineBillsModalProps {
  visible: boolean;
  currentOrderId: string;
  onClose: () => void;
  onCombined: () => void;
}

const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

const CombineBillsModal: React.FC<CombineBillsModalProps> = ({
  visible,
  currentOrderId,
  onClose,
  onCombined,
}) => {
  const { theme } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const { activeOrders, mergeOrders, loadOrders } = useUnifiedOrder();
  const [isMerging, setIsMerging] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Refresh orders from SQLite each time the modal opens so the list is always current.
  useEffect(() => {
    if (visible) {
      setIsLoadingOrders(true);
      loadOrders()
        .catch(() => {/* ignore */})
        .finally(() => setIsLoadingOrders(false));
    }
  }, [visible, loadOrders]);

  const eligibleOrders = activeOrders.filter(
    o => o.id !== currentOrderId && o.status !== 'paid' && o.status !== 'cancelled'
  );

  const handleSelect = useCallback((sourceOrder: UnifiedOrder) => {
    Alert.alert(
      'Combine Bills',
      `Merge ${sourceOrder.tableName} (${sourceOrder.orderNumber}) into this bill?\n\n${sourceOrder.items.length} item(s) · ${formatPrice(sourceOrder.totalAmount)}\n\nThe other order will be cancelled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Combine',
          style: 'default',
          onPress: async () => {
            setIsMerging(true);
            try {
              await mergeOrders(currentOrderId, sourceOrder.id);
              showToast({
                type: 'success',
                title: 'Bills Combined',
                message: `${sourceOrder.tableName} order merged successfully`,
              });
              onCombined();
              onClose();
            } catch (error) {
              showToast({
                type: 'error',
                title: 'Merge Failed',
                message: 'Could not combine bills. Please try again.',
              });
            } finally {
              setIsMerging(false);
            }
          },
        },
      ]
    );
  }, [currentOrderId, mergeOrders, onCombined, onClose]);

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
      height: screenHeight * 0.6,
      paddingBottom: theme.spacing.xl,
    },
    dragHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.outline,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    subtitle: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    closeBtn: {
      padding: theme.spacing.xs,
    },
    listContent: {
      padding: theme.spacing.md,
    },
    orderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    orderInfo: {
      flex: 1,
    },
    orderTitle: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    orderMeta: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    orderTotal: {
      ...theme.typography.body1,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.dragHandle} />

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Combine Bills</Text>
                <Text style={styles.subtitle}>Select an order to merge into this bill</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="btn-combine-close">
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {isLoadingOrders ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : eligibleOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="receipt"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={styles.emptyText}>
                  No other active orders to combine with
                </Text>
              </View>
            ) : (
              <FlatList
                data={eligibleOrders}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const tableSlug = (item.tableName || item.id).toLowerCase().replace(/[^a-z0-9-]/g, '-');
                  return (
                  <TouchableOpacity
                    style={styles.orderCard}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                    testID={`combine-card-${tableSlug}`}
                  >
                    <MaterialCommunityIcons
                      name="table-furniture"
                      size={24}
                      color={theme.colors.primary}
                      style={{ marginRight: theme.spacing.md }}
                    />
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle}>
                        {item.tableName} · {item.orderNumber}
                      </Text>
                      <Text style={styles.orderMeta}>
                        {item.items.length} item{item.items.length !== 1 ? 's' : ''} · {item.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.orderTotal}>{formatPrice(item.totalAmount)}</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                      style={{ marginLeft: theme.spacing.xs }}
                    />
                  </TouchableOpacity>
                  );
                }}
              />
            )}

            {isMerging && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
          </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CombineBillsModal;
