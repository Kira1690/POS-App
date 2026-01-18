/**
 * ItemAssignment - Displays items with guest assignment buttons
 *
 * Shows each bill item with:
 * - Item name and price
 * - Assignment buttons for each guest (color-coded)
 * - Visual indication of assigned items
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BillItem, GuestSplit } from '@/types/billing.types';

export interface ItemAssignmentProps {
  items: BillItem[];
  guests: GuestSplit[];
  onAssignItem: (itemId: string, guestId: string) => void;
  formatPrice?: (price: number) => string;
}

interface ItemRowProps {
  item: BillItem;
  guests: GuestSplit[];
  onAssignItem: (itemId: string, guestId: string) => void;
  formatPrice: (price: number) => string;
}

const ItemRow: React.FC<ItemRowProps> = memo(
  ({ item, guests, onAssignItem, formatPrice }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      },
      info: {
        flex: 1,
      },
      name: {
        ...theme.typography.body1,
        color: theme.colors.onSurface,
      },
      modifiers: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
      },
      price: {
        ...theme.typography.body2,
        color: theme.colors.onSurfaceVariant,
      },
      assignButtons: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
      },
      assignButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
      },
    });

    const handleAssign = useCallback(
      (guestId: string) => {
        onAssignItem(item.id, guestId);
      },
      [item.id, onAssignItem]
    );

    return (
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.quantity}x {item.name}
          </Text>
          {item.modifiers && item.modifiers.length > 0 && (
            <Text style={styles.modifiers}>{item.modifiers.join(', ')}</Text>
          )}
          <Text style={styles.price}>{formatPrice(item.itemTotal)}</Text>
        </View>
        <View style={styles.assignButtons}>
          {guests.map((guest) => {
            const isAssigned = guest.assignedItems.some(
              (ai) => ai.itemId === item.id
            );
            return (
              <TouchableOpacity
                key={guest.id}
                style={[
                  styles.assignButton,
                  { borderColor: guest.color },
                  isAssigned && { backgroundColor: guest.color },
                ]}
                onPress={() => handleAssign(guest.id)}
                activeOpacity={0.7}
              >
                {isAssigned && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
);

ItemRow.displayName = 'ItemRow';

export const ItemAssignment: React.FC<ItemAssignmentProps> = memo(
  ({
    items,
    guests,
    onAssignItem,
    formatPrice = (price: number) => `$${price.toFixed(2)}`,
  }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      container: {
        marginTop: theme.spacing.md,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
      },
      headerText: {
        ...theme.typography.body2,
        color: theme.colors.onSurfaceVariant,
        flex: 1,
      },
      guestLegend: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
      },
      legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      legendDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
      },
      legendText: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
      },
      emptyState: {
        padding: theme.spacing.lg,
        alignItems: 'center',
      },
      emptyText: {
        ...theme.typography.body2,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
      },
    });

    const renderItem = useCallback(
      ({ item }: { item: BillItem }) => (
        <ItemRow
          item={item}
          guests={guests}
          onAssignItem={onAssignItem}
          formatPrice={formatPrice}
        />
      ),
      [guests, onAssignItem, formatPrice]
    );

    const keyExtractor = useCallback((item: BillItem) => item.id, []);

    if (items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="package-variant"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={styles.emptyText}>No items to assign</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {/* Guest Legend */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Tap guest color to assign items
          </Text>
          <View style={styles.guestLegend}>
            {guests.slice(0, 4).map((guest, index) => (
              <View key={guest.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: guest.color }]} />
                <Text style={styles.legendText}>G{index + 1}</Text>
              </View>
            ))}
            {guests.length > 4 && (
              <Text style={styles.legendText}>+{guests.length - 4}</Text>
            )}
          </View>
        </View>

        {/* Items List */}
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
      </View>
    );
  }
);

ItemAssignment.displayName = 'ItemAssignment';

export default ItemAssignment;
