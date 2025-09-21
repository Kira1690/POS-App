/**
 * Order Items List - Focused on order items display and quantity management
 * Follows Single Responsibility Principle - handles order items rendering only
 */

import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Order, OrderItem } from '@/types/order.types';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/currency';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface OrderItemsListProps {
  order: Order;
  showTotals?: boolean;
}

const OrderItemsListComponent: React.FC<OrderItemsListProps> = ({
  order,
  showTotals = true,
}) => {
  const { theme } = useTheme();

  const renderOrderItem = ({ item, index }: { item: OrderItem; index: number }) => (
    <View key={item.id}>
      <View style={styles.orderItem}>
        <View style={styles.itemMain}>
          <Text style={[styles.itemQuantity, { color: theme.colors.primary }]}>
            {item.quantity}×
          </Text>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>
              {item.menu_item.name}
            </Text>
            {item.special_instructions && (
              <Text style={[styles.itemInstructions, { color: theme.colors.onSurfaceVariant }]}>
                Note: {item.special_instructions}
              </Text>
            )}
          </View>
          <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
            {formatCurrency(item.total_price)}
          </Text>
        </View>
      </View>
      
      {index < order.items.length - 1 && (
        <View style={[styles.itemDivider, { backgroundColor: theme.colors.outline }]} />
      )}
    </View>
  );

  const renderTotals = () => {
    if (!showTotals) return null;

    return (
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            Subtotal
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
            {formatCurrency(order.subtotal)}
          </Text>
        </View>
        
        {order.tax_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tax
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(order.tax_amount)}
            </Text>
          </View>
        )}
        
        {order.discount_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Discount
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.error }]}>
              -{formatCurrency(order.discount_amount)}
            </Text>
          </View>
        )}
        
        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurface, fontWeight: '700' }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(order.total_amount)}
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
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.items.length === nextProps.order.items.length &&
    prevProps.order.subtotal === nextProps.order.subtotal &&
    prevProps.order.tax_amount === nextProps.order.tax_amount &&
    prevProps.order.discount_amount === nextProps.order.discount_amount &&
    prevProps.order.total_amount === nextProps.order.total_amount &&
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