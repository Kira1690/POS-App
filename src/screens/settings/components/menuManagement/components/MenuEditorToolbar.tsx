/**
 * MenuEditorToolbar Component
 * Toolbar with search, filters, view mode toggle, and actions
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@/components/common';
import { MenuViewMode, MenuSortField, SortOrder } from '@/types/menu-management-settings.types';

interface MenuEditorToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: MenuViewMode;
  onViewModeChange: (mode: MenuViewMode) => void;
  sortField: MenuSortField;
  sortOrder: SortOrder;
  onSortChange: (field: MenuSortField, order: SortOrder) => void;
  onFilterPress: () => void;
  onImportPress: () => void;
  onExportPress: () => void;
  onAddItem?: () => void;
  onUndoPress?: () => void;
  onRedoPress?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasActiveFilters?: boolean;
  itemCount: number;
  selectedCount: number;
}

export const MenuEditorToolbar: React.FC<MenuEditorToolbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortChange,
  onFilterPress,
  onImportPress,
  onExportPress,
  onAddItem,
  onUndoPress,
  onRedoPress,
  canUndo = false,
  canRedo = false,
  hasActiveFilters = false,
  itemCount,
  selectedCount,
}) => {
  const { theme } = useTheme();
  const { isPhone } = useResponsive();

  const sortOptions: { field: MenuSortField; label: string }[] = [
    { field: 'name', label: 'Name' },
    { field: 'price', label: 'Price' },
    { field: 'category', label: 'Category' },
    { field: 'updated', label: 'Updated' },
  ];

  const handleSortToggle = () => {
    onSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: isPhone ? 'wrap' : 'nowrap',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      maxWidth: 300,
    },
    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: theme.colors.outline,
      marginHorizontal: theme.spacing.xs,
    },
    actionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    iconButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
    },
    iconButtonActive: {
      backgroundColor: theme.colors.tertiaryContainer,
    },
    iconButtonDisabled: {
      opacity: 0.4,
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: 2,
    },
    viewToggleButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    viewToggleActive: {
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    sortText: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
    },
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.tertiary,
    },
    countText: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
    },
    selectedCountText: {
      color: theme.colors.tertiary,
      fontWeight: '600',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    actionButtonText: {
      fontSize: 13,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.tertiary,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    addButtonText: {
      fontSize: 13,
      color: theme.colors.white,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon
          name="magnify"
          size={18}
          color={theme.colors.onSurfaceSecondary}
          accessibilityLabel="Search"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          accessibilityLabel="Search menu items"
          testID="input-search-items"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} testID="btn-clear-search">
            <Icon
              name="close-circle"
              size={16}
              color={theme.colors.onSurfaceSecondary}
              accessibilityLabel="Clear search"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      <View>
        <TouchableOpacity
          style={[styles.iconButton, hasActiveFilters && styles.iconButtonActive]}
          onPress={onFilterPress}
          accessibilityLabel="Filter items"
          accessibilityRole="button"
          testID="btn-filter-items"
        >
          <Icon
            name="filter-variant"
            size={20}
            color={hasActiveFilters ? theme.colors.primary : theme.colors.onSurface}
            accessibilityLabel=""
          />
        </TouchableOpacity>
        {hasActiveFilters && <View style={styles.filterBadge} />}
      </View>

      {/* Sort Button */}
      <TouchableOpacity style={styles.sortButton} onPress={handleSortToggle} testID="btn-sort-toggle">
        <Icon
          name={sortOrder === 'asc' ? 'sort-ascending' : 'sort-descending'}
          size={18}
          color={theme.colors.onSurfaceSecondary}
          accessibilityLabel=""
        />
        <Text style={styles.sortText}>
          {sortOptions.find((s) => s.field === sortField)?.label}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleActive]}
          onPress={() => onViewModeChange('grid')}
          accessibilityLabel="Grid view"
          accessibilityRole="button"
          accessibilityState={{ selected: viewMode === 'grid' }}
          testID="btn-view-grid"
        >
          <Icon
            name="view-grid"
            size={18}
            color={viewMode === 'grid' ? theme.colors.primary : theme.colors.onSurfaceSecondary}
            accessibilityLabel=""
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleActive]}
          onPress={() => onViewModeChange('list')}
          accessibilityLabel="List view"
          accessibilityRole="button"
          accessibilityState={{ selected: viewMode === 'list' }}
          testID="btn-view-list"
        >
          <Icon
            name="view-list"
            size={18}
            color={viewMode === 'list' ? theme.colors.primary : theme.colors.onSurfaceSecondary}
            accessibilityLabel=""
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Undo/Redo */}
      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={[styles.iconButton, !canUndo && styles.iconButtonDisabled]}
          onPress={onUndoPress}
          disabled={!canUndo}
          accessibilityLabel="Undo"
          accessibilityRole="button"
          testID="btn-undo"
        >
          <Icon
            name="undo"
            size={18}
            color={theme.colors.onSurface}
            accessibilityLabel=""
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, !canRedo && styles.iconButtonDisabled]}
          onPress={onRedoPress}
          disabled={!canRedo}
          accessibilityLabel="Redo"
          accessibilityRole="button"
          testID="btn-redo"
        >
          <Icon
            name="redo"
            size={18}
            color={theme.colors.onSurface}
            accessibilityLabel=""
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Add Item */}
      {onAddItem && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddItem}
          accessibilityLabel="Add menu item"
          accessibilityRole="button"
          testID="btn-add-item"
        >
          <Icon
            name="plus"
            size={18}
            color={theme.colors.white}
            accessibilityLabel=""
          />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      )}

      {/* Import/Export */}
      <TouchableOpacity style={styles.actionButton} onPress={onImportPress} testID="btn-import-items">
        <Icon
          name="import"
          size={18}
          color={theme.colors.onSurface}
          accessibilityLabel=""
        />
        <Text style={styles.actionButtonText}>Import</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onExportPress} testID="btn-export-items">
        <Icon
          name="export"
          size={18}
          color={theme.colors.onSurface}
          accessibilityLabel=""
        />
        <Text style={styles.actionButtonText}>Export</Text>
      </TouchableOpacity>

      {/* Item Count */}
      <View style={{ flex: 1 }} />
      <Text style={styles.countText}>
        {selectedCount > 0 ? (
          <Text style={styles.selectedCountText}>{selectedCount} selected</Text>
        ) : (
          `${itemCount} items`
        )}
      </Text>
    </View>
  );
};

export default MenuEditorToolbar;
