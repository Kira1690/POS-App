/**
 * Order Details Header - Focused on order header information and basic actions
 * Follows Single Responsibility Principle - handles header display only
 * Supports both UnifiedOrder and legacy Order types
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AnyOrder, getOrderNumber } from '@/utils/orderFormatHelpers';
import OrderStatusBadge from './OrderStatusBadge';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface OrderDetailsHeaderProps {
  order: AnyOrder;
  onBack: () => void;
  onMenuPress?: () => void;
}

export const OrderDetailsHeader: React.FC<OrderDetailsHeaderProps> = ({
  order,
  onBack,
  onMenuPress,
}) => {
  const { theme } = useTheme();

  // Guard against undefined order
  if (!order) {
    return (
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Order Details
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {getOrderNumber(order)}
        </Text>
        <OrderStatusBadge status={order.status} size="small" />
      </View>

      {onMenuPress && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <MaterialIcons name="more-vert" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.headlineMedium,
    fontWeight: '600',
  },
  menuButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});