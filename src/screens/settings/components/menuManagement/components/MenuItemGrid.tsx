/**
 * MenuItemGrid Component
 * Grid/List display of menu items with optimized rendering
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { MenuItemExtended } from '@/types/menu-management-extended.types';
import { MenuViewMode } from '@/types/menu-management-settings.types';
import MenuItemCard from './MenuItemCard';

interface MenuItemGridProps {
  items: MenuItemExtended[];
  viewMode: MenuViewMode;
  selectedItemIds: string[];
  isMultiSelectMode: boolean;
  onItemPress: (item: MenuItemExtended) => void;
  onItemLongPress: (item: MenuItemExtended) => void;
  onEditItem: (item: MenuItemExtended) => void;
  onDeleteItem: (item: MenuItemExtended) => void;
  onAssignModifiers?: (item: MenuItemExtended) => void;
  onAddItem: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const GRID_COLUMNS = 3;
const ITEM_SPACING = 12;

export const MenuItemGrid: React.FC<MenuItemGridProps> = ({
  items,
  viewMode,
  selectedItemIds,
  isMultiSelectMode,
  onItemPress,
  onItemLongPress,
  onEditItem,
  onDeleteItem,
  onAssignModifiers,
  onAddItem,
  isLoading = false,
  emptyMessage = 'No menu items found',
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surfaceLight,
    },
    listContent: {
      padding: theme.spacing.md,
    },
    gridContent: {
      padding: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.md,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.white,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      marginTop: theme.spacing.sm,
    },
    gridItem: {
      flex: 1,
      marginHorizontal: ITEM_SPACING / 2,
      marginBottom: ITEM_SPACING,
    },
    listItem: {
      marginBottom: theme.spacing.sm,
    },
    listItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    listItemSelected: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    listItemImage: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    listItemContent: {
      flex: 1,
    },
    listItemName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    listItemDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: 4,
    },
    listItemFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    listItemPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    listItemStatus: {
      fontSize: 11,
      fontWeight: '500',
    },
    availableStatus: {
      color: theme.colors.success,
    },
    unavailableStatus: {
      color: theme.colors.error,
    },
    listItemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    checkboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
  });

  const formatPrice = useCallback((price: number) => {
    return `$${price.toFixed(2)}`;
  }, []);

  const keyExtractor = useCallback((item: MenuItemExtended) => item.id, []);

  const renderListItem: ListRenderItem<MenuItemExtended> = useCallback(
    ({ item }) => {
      const isSelected = selectedItemIds.includes(item.id);

      return (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onItemPress(item)}
          onLongPress={() => onItemLongPress(item)}
          activeOpacity={0.8}
          accessibilityLabel={`${item.name}, ${formatPrice(item.price)}`}
          accessibilityRole="button"
        >
          <View style={[styles.listItemContainer, isSelected && styles.listItemSelected]}>
            {isMultiSelectMode && (
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <Icon name="check" size={14} color={theme.colors.white} accessibilityLabel="" />
                )}
              </View>
            )}

            <View style={styles.listItemImage}>
              <Icon
                name="food-outline"
                size={24}
                color={theme.colors.onSurfaceSecondary}
                accessibilityLabel=""
              />
            </View>

            <View style={styles.listItemContent}>
              <Text style={styles.listItemName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.description && (
                <Text style={styles.listItemDescription} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              <View style={styles.listItemFooter}>
                <Text style={styles.listItemPrice}>{formatPrice(item.price)}</Text>
                <Text
                  style={[
                    styles.listItemStatus,
                    item.is_available ? styles.availableStatus : styles.unavailableStatus,
                  ]}
                >
                  {item.is_available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>

            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEditItem(item)}
                accessibilityLabel={`Edit ${item.name}`}
              >
                <Icon
                  name="pencil-outline"
                  size={18}
                  color={theme.colors.primary}
                  accessibilityLabel=""
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDeleteItem(item)}
                accessibilityLabel={`Delete ${item.name}`}
              >
                <Icon
                  name="delete-outline"
                  size={18}
                  color={theme.colors.error}
                  accessibilityLabel=""
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      selectedItemIds,
      isMultiSelectMode,
      onItemPress,
      onItemLongPress,
      onEditItem,
      onDeleteItem,
      formatPrice,
      styles,
      theme.colors,
    ]
  );

  const renderGridItem: ListRenderItem<MenuItemExtended> = useCallback(
    ({ item }) => {
      const isSelected = selectedItemIds.includes(item.id);

      return (
        <View style={styles.gridItem}>
          <MenuItemCard
            item={item}
            isSelected={isSelected}
            isMultiSelectMode={isMultiSelectMode}
            onPress={() => onItemPress(item)}
            onLongPress={() => onItemLongPress(item)}
            onEditPress={() => onEditItem(item)}
            onDeletePress={() => onDeleteItem(item)}
            onAssignModifiersPress={onAssignModifiers ? () => onAssignModifiers(item) : undefined}
          />
        </View>
      );
    },
    [
      selectedItemIds,
      isMultiSelectMode,
      onItemPress,
      onItemLongPress,
      onEditItem,
      onDeleteItem,
      onAssignModifiers,
      styles.gridItem,
    ]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Icon
            name="loading"
            size={32}
            color={theme.colors.primary}
            accessibilityLabel="Loading"
          />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Icon
            name="food-off-outline"
            size={64}
            color={theme.colors.onSurfaceSecondary}
            accessibilityLabel=""
          />
        </View>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddItem}
          accessibilityLabel="Add first menu item"
          accessibilityRole="button"
        >
          <Icon name="plus" size={18} color={theme.colors.white} accessibilityLabel="" />
          <Text style={styles.addButtonText}>Add Menu Item</Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, emptyMessage, onAddItem, styles, theme.colors]);

  const numColumns = viewMode === 'grid' ? GRID_COLUMNS : 1;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={viewMode} // Force re-render when switching view modes
        contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        accessibilityLabel="Menu items list"
      />
    </View>
  );
};

export default MenuItemGrid;
