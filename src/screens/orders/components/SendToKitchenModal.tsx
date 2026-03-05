/**
 * SendToKitchenModal - Confirmation modal before sending order to kitchen
 * Shows order summary and allows final review before submission
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { KitchenStation, DEFAULT_CATEGORY_STATION_MAP } from '@/types/order-extended.types';
import { UnifiedOrderItem } from '@/types/unified-order.types';

interface SendToKitchenModalProps {
  visible: boolean;
  items: UnifiedOrderItem[];
  tableName: string;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

interface StationSummary {
  station: KitchenStation;
  items: UnifiedOrderItem[];
  itemCount: number;
}

const STATION_CONFIG: Record<
  KitchenStation,
  { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }
> = {
  hot_kitchen: { label: 'Hot Kitchen', icon: 'fire', color: '#E53935' },
  cold_kitchen: { label: 'Cold Kitchen', icon: 'snowflake', color: '#1E88E5' },
  grill: { label: 'Grill Station', icon: 'grill', color: '#FB8C00' },
  desserts: { label: 'Desserts', icon: 'cupcake', color: '#8E24AA' },
  beverages: { label: 'Beverages', icon: 'cup', color: '#43A047' },
  bar: { label: 'Bar', icon: 'glass-cocktail', color: '#5E35B1' },
};

export const SendToKitchenModal: React.FC<SendToKitchenModalProps> = ({
  visible,
  items,
  tableName,
  total,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      maxWidth: 500,
      maxHeight: '80%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.primary,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.onPrimary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.md,
    },
    tableInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    tableIcon: {
      marginRight: theme.spacing.sm,
    },
    tableDetails: {
      flex: 1,
    },
    tableName: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
    },
    itemCount: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    stationCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
    },
    stationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    stationIcon: {
      marginRight: theme.spacing.xs,
    },
    stationName: {
      ...theme.typography.body1,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    stationCount: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.xs,
    },
    stationItems: {
      marginLeft: theme.spacing.lg,
    },
    stationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    itemName: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      flex: 1,
    },
    itemQuantity: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
    allergenWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.errorContainer,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.md,
    },
    allergenIcon: {
      marginRight: theme.spacing.xs,
    },
    allergenText: {
      ...theme.typography.body2,
      color: theme.colors.error,
      flex: 1,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceLight,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    totalLabel: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
    },
    totalValue: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    cancelButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cancelButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSurface,
    },
    confirmButton: {
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    confirmButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
  });

  const { stationSummaries, hasAllergens, allergenItems } = useMemo(() => {
    const stationMap = new Map<KitchenStation, UnifiedOrderItem[]>();

    items.forEach((item) => {
      const station = item.kitchenStation || 'hot_kitchen';
      const existing = stationMap.get(station as KitchenStation) || [];
      stationMap.set(station as KitchenStation, [...existing, item]);
    });

    const summaries: StationSummary[] = [];
    stationMap.forEach((stationItems, station) => {
      summaries.push({
        station,
        items: stationItems,
        itemCount: stationItems.reduce((sum, item) => sum + item.quantity, 0),
      });
    });

    const allergenItemsList = items.filter((item) => item.hasAllergenWarning);

    return {
      stationSummaries: summaries,
      hasAllergens: allergenItemsList.length > 0,
      allergenItems: allergenItemsList,
    };
  }, [items]);

  const totalItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Send to Kitchen</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isSubmitting}
              testID="btn-kitchen-modal-close"
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <View style={styles.tableInfo}>
              <MaterialCommunityIcons
                name="table-furniture"
                size={32}
                color={theme.colors.primary}
                style={styles.tableIcon}
              />
              <View style={styles.tableDetails}>
                <Text style={styles.tableName}>{tableName}</Text>
                <Text style={styles.itemCount}>
                  {totalItemCount} item{totalItemCount !== 1 ? 's' : ''} to kitchen
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Ticket Routing</Text>
            {stationSummaries.map(({ station, items: stationItems, itemCount }) => {
              const config = STATION_CONFIG[station];
              return (
                <View
                  key={station}
                  style={[styles.stationCard, { borderLeftColor: config.color }]}
                >
                  <View style={styles.stationHeader}>
                    <MaterialCommunityIcons
                      name={config.icon}
                      size={20}
                      color={config.color}
                      style={styles.stationIcon}
                    />
                    <Text style={styles.stationName}>{config.label}</Text>
                    <Text style={styles.stationCount}>{itemCount} items</Text>
                  </View>
                  <View style={styles.stationItems}>
                    {stationItems.map((item) => (
                      <View key={item.id} style={styles.stationItem}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {hasAllergens && (
              <View style={styles.allergenWarning}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={24}
                  color={theme.colors.error}
                  style={styles.allergenIcon}
                />
                <Text style={styles.allergenText}>
                  {allergenItems.length} item{allergenItems.length !== 1 ? 's' : ''} with
                  allergen warnings. Kitchen staff will be notified.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Order Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isSubmitting}
                testID="btn-kitchen-modal-cancel"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
                disabled={isSubmitting}
                testID="btn-kitchen-modal-confirm"
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.onPrimary} />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="send"
                      size={20}
                      color={theme.colors.onPrimary}
                    />
                    <Text style={styles.confirmButtonText}>Confirm & Send</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SendToKitchenModal;
