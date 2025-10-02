/**
 * TableCard Component
 * Individual table representation on floor plan
 * Following SOLID principles and theme system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Table, TableStatus } from '@/types/settings/table-management.types';

interface TableCardProps {
  table: Table;
  isSelected?: boolean;
  onPress?: (table: Table) => void;
  onLongPress?: (table: Table) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  isSelected = false,
  onPress,
  onLongPress,
}) => {
  const { theme } = useTheme();

  // Get status color from theme
  const getStatusColor = (status: TableStatus): string => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return theme.colors.success;
      case TableStatus.OCCUPIED:
        return theme.colors.error;
      case TableStatus.RESERVED:
        return theme.colors.warning;
      case TableStatus.CLEANING:
        return theme.colors.onSurfaceVariant;
      case TableStatus.OUT_OF_SERVICE:
        return theme.colors.outline;
      default:
        return theme.colors.onSurface;
    }
  };

  // Get status emoji
  const getStatusEmoji = (status: TableStatus): string => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return '🟢';
      case TableStatus.OCCUPIED:
        return '🔴';
      case TableStatus.RESERVED:
        return '🟡';
      case TableStatus.CLEANING:
        return '⚫';
      case TableStatus.OUT_OF_SERVICE:
        return '⭕';
      default:
        return '⚪';
    }
  };

  const statusColor = getStatusColor(table.status);
  const statusEmoji = getStatusEmoji(table.status);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isSelected
        ? theme.colors.primaryContainer
        : theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 2,
      borderColor: isSelected ? theme.colors.primary : statusColor,
      minWidth: 120,
      minHeight: 100,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    tableNumber: {
      ...typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    statusEmoji: {
      fontSize: 16,
    },
    capacity: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.xs,
    },
    status: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: statusColor,
      textTransform: 'capitalize',
    },
    occupiedInfo: {
      marginTop: spacing.xs,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    customerName: {
      ...typography.bodySmall,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    duration: {
      ...typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
  });

  const formatDuration = (occupiedSince?: Date): string => {
    if (!occupiedSince) return '';
    const now = new Date();
    const diffMs = now.getTime() - occupiedSince.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(table)}
      onLongPress={() => onLongPress?.(table)}
      activeOpacity={0.7}
    >
      <View>
        <View style={styles.header}>
          <Text style={styles.tableNumber}>
            Table {table.table_number}
          </Text>
          <Text style={styles.statusEmoji}>{statusEmoji}</Text>
        </View>

        <Text style={styles.capacity}>👥 {table.capacity} seats</Text>

        <Text style={styles.status}>{table.status}</Text>

        {table.status === TableStatus.OCCUPIED && table.customer_name && (
          <View style={styles.occupiedInfo}>
            <Text style={styles.customerName}>
              👤 {table.customer_name}
            </Text>
            {table.occupied_since && (
              <Text style={styles.duration}>
                ⏰ {formatDuration(table.occupied_since)}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
