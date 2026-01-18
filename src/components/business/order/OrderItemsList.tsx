/**
 * Order Items List - Focused on order items display and quantity management
 * Follows Single Responsibility Principle - handles order items rendering only
 *
 * Supports both UnifiedOrder and legacy Order types
 */

import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Order, OrderItem } from '@/types/order.types';
import { UnifiedOrder, UnifiedOrderItem } from '@/types/unified-order.types';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/currency';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

// Support both unified and legacy order types
type AnyOrder = Order | UnifiedOrder;
type AnyOrderItem = OrderItem | UnifiedOrderItem;

// Helper to get item name from either format
const getItemName = (item: AnyOrderItem): string => {
  // Unified format: item.name
  if ('name' in item && typeof item.name === 'string') {
    return item.name;
  }
  // Legacy format: item.menu_item.name
  if ('menu_item' in item && item.menu_item?.name) {
    return item.menu_item.name;
  }
  return 'Unknown Item';
};

// Helper to get item price from either format
const getItemPrice = (item: AnyOrderItem): number => {
  // Unified format: itemTotal
  if ('itemTotal' in item) {
    return item.itemTotal;
  }
  // Legacy format: total_price
  if ('total_price' in item) {
    return item.total_price;
  }
  return 0;
};

// Helper to get special instructions from either format
const getSpecialInstructions = (item: AnyOrderItem): string | undefined => {
  // Unified format: specialInstructions
  if ('specialInstructions' in item) {
    return item.specialInstructions;
  }
  // Legacy format: special_instructions
  if ('special_instructions' in item) {
    return item.special_instructions;
  }
  return undefined;
};

// Helper to get order totals from either format
const getOrderTotals = (order: AnyOrder) => {
  return {
    subtotal: (order as any).subtotal ?? 0,
    taxAmount: (order as UnifiedOrder).taxAmount ?? (order as Order).tax_amount ?? 0,
    discountAmount: (order as UnifiedOrder).discountAmount ?? (order as Order).discount_amount ?? 0,
    totalAmount: (order as UnifiedOrder).totalAmount ?? (order as Order).total_amount ?? 0,
  };
};

interface OrderItemsListProps {
  order: AnyOrder;
  showTotals?: boolean;
}

const OrderItemsListComponent: React.FC<OrderItemsListProps> = ({
  order,
  showTotals = true,
}) => {
  const { theme } = useTheme();

  // Guard against undefined order
  if (!order || !order.items) {
    return (
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Order Items
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          No items available
        </Text>
      </View>
    );
  }

  // Get totals using helper to support both formats
  const totals = getOrderTotals(order);

  const renderOrderItem = ({ item, index }: { item: AnyOrderItem; index: number }) => {
    const itemName = getItemName(item);
    const itemPrice = getItemPrice(item);
    const specialInstructions = getSpecialInstructions(item);

    return (
      <View key={item.id}>
        <View style={styles.orderItem}>
          <View style={styles.itemMain}>
            <Text style={[styles.itemQuantity, { color: theme.colors.primary }]}>
              {item.quantity}×
            </Text>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>
                {itemName}
              </Text>
              {specialInstructions && (
                <Text style={[styles.itemInstructions, { color: theme.colors.onSurfaceVariant }]}>
                  Note: {specialInstructions}
                </Text>
              )}
            </View>
            <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
              {formatCurrency(itemPrice)}
            </Text>
          </View>
        </View>

        {index < order.items.length - 1 && (
          <View style={[styles.itemDivider, { backgroundColor: theme.colors.outline }]} />
        )}
      </View>
    );
  };

  const renderTotals = () => {
    if (!showTotals) return null;

    return (
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            Subtotal
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {formatCurrency(totals.subtotal)}
          </Text>
        </View>

        {totals.taxAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tax
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(totals.taxAmount)}
            </Text>
          </View>
        )}

        {totals.discountAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Discount
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.error }]}>
              -{formatCurrency(totals.discountAmount)}
            </Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurface, fontWeight: '700' }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(totals.totalAmount)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Order Items
      </Text>
      
      <FlatList
        data={order.items}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
      
      {renderTotals()}
    </View>
  );
};

// Memoized OrderItemsList with intelligent comparison for performance
export const OrderItemsList = memo(OrderItemsListComponent, (prevProps, nextProps) => {
  // Handle null/undefined cases
  if (!prevProps.order || !nextProps.order) {
    return prevProps.order === nextProps.order;
  }

  const prevTotals = getOrderTotals(prevProps.order);
  const nextTotals = getOrderTotals(nextProps.order);

  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.items?.length === nextProps.order.items?.length &&
    prevTotals.subtotal === nextTotals.subtotal &&
    prevTotals.taxAmount === nextTotals.taxAmount &&
    prevTotals.discountAmount === nextTotals.discountAmount &&
    prevTotals.totalAmount === nextTotals.totalAmount &&
    prevProps.showTotals === nextProps.showTotals
  );
});

const styles = StyleSheet.create({
  section: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.bodyMedium,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  orderItem: {
    paddingVertical: spacing.sm,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemQuantity: {
    ...typography.bodyLarge,
    fontWeight: '600',
    minWidth: 40,
    marginRight: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.bodyLarge,
    fontWeight: '500',
  },
  itemInstructions: {
    ...typography.bodyMedium,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  itemPrice: {
    ...typography.bodyLarge,
    fontWeight: '600',
    textAlign: 'right',
  },
  itemDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  totalsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  finalTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.2)',
  },
  totalLabel: {
    ...typography.bodyLarge,
  },
  totalValue: {
    ...typography.bodyLarge,
  },
});