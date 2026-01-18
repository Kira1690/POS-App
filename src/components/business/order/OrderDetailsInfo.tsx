/**
 * Order Details Info - Focused on displaying order information
 * Follows Single Responsibility Principle - handles order info display only
 * Supports both UnifiedOrder and legacy Order types
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AnyOrder,
  getTableName,
  getCreatedAt,
  getOrderTotals,
  getSpecialInstructions,
} from '@/utils/orderFormatHelpers';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface OrderDetailsInfoProps {
  order: AnyOrder;
}

export const OrderDetailsInfo: React.FC<OrderDetailsInfoProps> = ({ order }) => {
  const { theme } = useTheme();

  // Guard against undefined order
  if (!order) {
    return (
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Order Information
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          No order data available
        </Text>
      </View>
    );
  }

  const totals = getOrderTotals(order);
  const specialInstructions = getSpecialInstructions(order);
  const itemCount = order.items?.length ?? 0;

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Order Information
      </Text>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Table
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {getTableName(order)}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Order Time
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {formatDateTime(getCreatedAt(order))}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Items
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {itemCount} items
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Total
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(totals.totalAmount)}
          </Text>
        </View>
      </View>

      {specialInstructions && (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.onSurface }]}>
            Special Instructions
          </Text>
          <Text style={[styles.instructionsText, { color: theme.colors.onSurfaceVariant }]}>
            {specialInstructions}
          </Text>
        </View>
      )}
    </View>
  );
};

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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  instructionsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  instructionsTitle: {
    ...typography.bodyLarge,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  instructionsText: {
    ...typography.bodyMedium,
    lineHeight: 20,
  },
});