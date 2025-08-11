/**
 * Table Card Component - Individual table representation
 * Under 200 lines, single responsibility for table display
 */

import React, { memo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { useTheme } from '@/hooks/useTheme';
// Professional enterprise theme import removed - using theme context instead
import { spacing, borderRadius, shadows } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface TableCardProps {
  table: Table;
  isSelected?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

const TableCard: React.FC<TableCardProps> = memo(({
  table,
  isSelected = false,
  onPress,
  onLongPress,
  size = 'medium'
}) => {
  const { theme } = useTheme();
  
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress();
  }, [onLongPress]);

  const getStatusColor = useCallback((status: TableStatus): string => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return theme.colors.success;
      case TableStatus.OCCUPIED:
        return theme.colors.error;
      case TableStatus.RESERVED:
        return theme.colors.warning;
      case TableStatus.CLEANING:
        return theme.colors.primary;
      case TableStatus.OUT_OF_ORDER:
        return theme.colors.outline;
      default:
        return theme.colors.outlineVariant;
    }
  }, [theme]);

  const getStatusText = useCallback((status: TableStatus): string => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return 'Available';
      case TableStatus.OCCUPIED:
        return 'Occupied';
      case TableStatus.RESERVED:
        return 'Reserved';
      case TableStatus.CLEANING:
        return 'Cleaning';
      case TableStatus.OUT_OF_ORDER:
        return 'Out of Order';
      default:
        return 'Unknown';
    }
  }, []);

  const getSizeStyles = useCallback(() => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          text: styles.textMedium,
        };
    }
  }, [size]);

  const statusColor = getStatusColor(table.status);
  const statusText = getStatusText(table.status);
  const sizeStyles = getSizeStyles();

  const baseContainerStyle: ViewStyle = {
    ...styles.container,
    ...sizeStyles.container,
    backgroundColor: theme.colors.surface, // Clean white surface
    borderColor: statusColor,
    borderWidth: 1.5, // Subtle professional border
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Subtle professional shadow
    shadowRadius: 8,
    elevation: 3, // Professional elevation
  };
  
  const selectedContainerStyle: ViewStyle = isSelected ? {
    backgroundColor: theme.colors.primaryContainer, // Light professional background
    borderColor: theme.colors.primary, // Professional charcoal border
    borderWidth: 2, // Slightly thicker for selection
    shadowOpacity: 0.12, // Enhanced shadow when selected
    shadowRadius: 12,
    elevation: 4,
  } : {};
  
  const containerStyle: ViewStyle = {
    ...baseContainerStyle,
    ...selectedContainerStyle,
  };

  const statusIndicatorStyle: ViewStyle = {
    ...styles.statusIndicator,
    backgroundColor: statusColor,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={`Table ${table.table_number}, ${statusText}, capacity ${table.capacity}`}
      accessibilityRole="button"
    >
      <View style={statusIndicatorStyle} />
      
      <Text 
        style={[
          styles.tableNumber, 
          sizeStyles.text, 
          { color: theme.colors.onSurface } // Professional charcoal text
        ]}
        numberOfLines={1}
      >
        {table.table_number}
      </Text>
      
      <Text 
        style={[
          styles.capacity, 
          { color: theme.colors.onSurfaceVariant } // Professional gray text
        ]}
        numberOfLines={1}
      >
        {table.capacity} seats
      </Text>
      
      <Text 
        style={[
          styles.status, 
          { 
            color: statusColor, // Professional status colors
            backgroundColor: `${statusColor}15`, // Subtle background tint
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            borderRadius: borderRadius.xs,
          }
        ]}
        numberOfLines={1}
      >
        {statusText}
      </Text>
      
      {table.current_order_id && (
        <View style={[
          styles.orderBadge, 
          { 
            backgroundColor: theme.colors.primary, // Professional charcoal
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }
        ]}>
          <Text style={[
            styles.orderText, 
            { color: theme.colors.onPrimary } // White text on charcoal
          ]}>
            ORDER
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

TableCard.displayName = 'TableCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md, // Subtle professional radius
    padding: spacing.lg, // Generous professional padding
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 88, // Slightly larger for professional feel
  },
  containerSmall: {
    padding: spacing.sm,
    minHeight: 60,
  },
  containerMedium: {
    padding: spacing.md,
    minHeight: 80,
  },
  containerLarge: {
    padding: spacing.lg,
    minHeight: 100,
  },
  statusIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tableNumber: {
    ...typography.posHeader, // Professional header typography
    fontSize: 20, // Professional size
    fontWeight: '700', // Professional weight
    marginBottom: spacing.xs,
    letterSpacing: -0.3, // Professional letter spacing
  },
  textSmall: {
    ...typography.titleSmall,
  },
  textMedium: {
    ...typography.titleMedium,
  },
  textLarge: {
    ...typography.titleLarge,
  },
  capacity: {
    ...typography.posCaption, // Professional caption style
    fontSize: 12,
    fontWeight: '500', // Professional weight
    marginBottom: spacing.sm, // More spacing for professional layout
  },
  status: {
    ...typography.posCaption,
    fontSize: 10,
    fontWeight: '600', // Professional weight
    textTransform: 'uppercase',
    textAlign: 'center', // Professional alignment
  },
  orderBadge: {
    position: 'absolute',
    top: spacing.sm, // Professional spacing
    left: spacing.sm,
    paddingHorizontal: spacing.sm, // More professional padding
    paddingVertical: 4, // Professional padding
    borderRadius: borderRadius.sm, // Professional radius
  },
  orderText: {
    ...typography.posCaption,
    fontSize: 9, // Slightly larger for readability
    fontWeight: '700', // Professional weight
    letterSpacing: 0.5, // Professional spacing
  },
});

export default TableCard;