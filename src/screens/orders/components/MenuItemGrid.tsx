/**
 * MenuItemGrid - Center panel for displaying menu items in a grid
 * Supports filtering, search, and different view modes
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { MenuItemExtended } from '@/types/menu-management-extended.types';
import { MenuItemCard } from './MenuItemCard';

interface MenuItemGridProps {
  items: MenuItemExtended[];
  onItemPress: (item: MenuItemExtended) => void;
  categoryName?: string;
  isLoading?: boolean;
}

type ViewMode = 'grid' | 'compact';

export const MenuItemGrid: React.FC<MenuItemGridProps> = ({
  items,
  onItemPress,
  categoryName,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    categoryTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
    },
    itemCount: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    } as TextStyle,
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.sm,
      padding: 2,
    },
    viewButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.xs,
    },
    viewButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      height: 40,
    },
    searchIcon: {
      marginRight: theme.spacing.xs,
    },
    searchInput: {
      flex: 1,
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      padding: 0,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    gridContent: {
      padding: theme.spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    emptySubtitle: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    } as TextStyle,
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      marginTop: theme.spacing.md,
    },
  });

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.dietary_tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  const numColumns = viewMode === 'compact' ? 4 : 3;

  const handleItemPress = useCallback(
    (item: MenuItemExtended) => {
      onItemPress(item);
    },
    [onItemPress]
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuItemExtended }) => (
      <MenuItemCard
        item={item}
        onPress={handleItemPress}
        isCompact={viewMode === 'compact'}
      />
    ),
    [viewMode, handleItemPress]
  );

  const keyExtractor = useCallback((item: MenuItemExtended) => item.id, []);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name={searchQuery ? 'magnify-close' : 'food-off'}
          size={64}
          color={theme.colors.onSurfaceVariant}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No items found' : 'No items available'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `No menu items match "${searchQuery}"`
            : 'This category has no available items'}
        </Text>
      </View>
    );
  }, [isLoading, searchQuery, theme, styles]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.categoryTitle}>
              {categoryName || 'All Items'}
            </Text>
            <Text style={styles.itemCount}>
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'grid' && styles.viewButtonActive,
                ]}
                onPress={() => setViewMode('grid')}
              >
                <MaterialCommunityIcons
                  name="view-grid"
                  size={20}
                  color={
                    viewMode === 'grid'
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'compact' && styles.viewButtonActive,
                ]}
                onPress={() => setViewMode('compact')}
              >
                <MaterialCommunityIcons
                  name="view-module"
                  size={20}
                  color={
                    viewMode === 'compact'
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={theme.colors.onSurfaceVariant}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={viewMode} // Force re-render when columns change
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      />
    </View>
  );
};

export default MenuItemGrid;
