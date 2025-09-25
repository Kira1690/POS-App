import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';

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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.surfaceLight,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    padding: ProfessionalTheme.spacing.sm,
    marginBottom: ProfessionalTheme.spacing.sm,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
    height: 50,
  },

  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: ProfessionalTheme.spacing.sm,
    minWidth: 70,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ProfessionalTheme.colors.border,
    marginRight: ProfessionalTheme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkedCheckbox: {
    borderColor: ProfessionalTheme.colors.info,
    backgroundColor: ProfessionalTheme.colors.info,
  },

  checkboxIcon: {
    fontSize: 12,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontWeight: '600',
  },

  selectAllText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
  },

  itemColumn: {
    flex: 2,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  priceColumn: {
    width: 80,
    alignItems: 'center',
    marginRight: ProfessionalTheme.spacing.sm,
  },

  statsColumn: {
    width: 70,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  ratingColumn: {
    width: 60,
    alignItems: 'center',
    marginRight: ProfessionalTheme.spacing.sm,
  },

  actionsColumn: {
    width: 100,
    alignItems: 'center',
  },

  columnHeader: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.text,
    fontSize: 12,
    textAlign: 'left',
  },
});