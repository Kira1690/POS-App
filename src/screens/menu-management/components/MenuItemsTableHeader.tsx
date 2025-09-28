import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface MenuItemsTableHeaderProps {
  onSelectAll: () => void;
  allSelected: boolean;
  loading: boolean;
}

export const MenuItemsTableHeader: React.FC<MenuItemsTableHeaderProps> = ({
  onSelectAll,
  allSelected,
  loading,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      height: 50,
    },

    selectAllContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      minWidth: 70,
    },

    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      marginRight: theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },

    checkedCheckbox: {
      borderColor: theme.colors.info,
      backgroundColor: theme.colors.info,
    },

    checkboxIcon: {
      fontSize: 12,
      color: theme.colors.onSurfaceOnPrimary,
      fontWeight: '600',
    },

    selectAllText: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },

    itemColumn: {
      flex: 2,
      marginRight: theme.spacing.sm,
    },

    priceColumn: {
      width: 80,
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },

    statsColumn: {
      width: 70,
      marginRight: theme.spacing.sm,
    },

    ratingColumn: {
      width: 60,
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },

    actionsColumn: {
      width: 100,
      alignItems: 'center',
    },

    columnHeader: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      fontSize: 12,
      textAlign: 'left',
    },
  });

  return (
    <View style={styles.header}>
      {/* Select All Checkbox */}
      <TouchableOpacity
        style={styles.selectAllContainer}
        onPress={onSelectAll}
        disabled={loading}
      >
        <View style={[styles.checkbox, allSelected && styles.checkedCheckbox]}>
          <Text style={styles.checkboxIcon}>{allSelected ? '✓' : ''}</Text>
        </View>
        <Text style={styles.selectAllText}>All</Text>
      </TouchableOpacity>

      {/* Item Column */}
      <View style={styles.itemColumn}>
        <Text style={styles.columnHeader}>Item</Text>
      </View>

      {/* Price Column */}
      <View style={styles.priceColumn}>
        <Text style={styles.columnHeader}>Price</Text>
      </View>

      {/* Stats Column */}
      <View style={styles.statsColumn}>
        <Text style={styles.columnHeader}>Today's Stats</Text>
      </View>

      {/* Rating Column */}
      <View style={styles.ratingColumn}>
        <Text style={styles.columnHeader}>Rating</Text>
      </View>

      {/* Actions Column */}
      <View style={styles.actionsColumn}>
        <Text style={styles.columnHeader}>Actions</Text>
      </View>
    </View>
  );
};