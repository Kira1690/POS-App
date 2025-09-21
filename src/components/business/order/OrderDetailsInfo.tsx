/**
 * Order Details Info - Focused on displaying order information
 * Follows Single Responsibility Principle - handles order info display only
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Order } from '@/types/order.types';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface OrderDetailsInfoProps {
  order: Order;
}

export const OrderDetailsInfo: React.FC<OrderDetailsInfoProps> = ({ order }) => {
  const { theme } = useTheme();

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
            {order.table_id || 'Takeaway'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Order Time
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {formatDateTime(order.created_at)}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Items
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
            {order.items.length} items
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
            Total
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrency(order.total_amount)}
          </Text>
        </View>
      </View>
      
      {order.special_instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.onSurface }]}>
            Special Instructions
          </Text>
          <Text style={[styles.instructionsText, { color: theme.colors.onSurfaceVariant }]}>
            {order.special_instructions}
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