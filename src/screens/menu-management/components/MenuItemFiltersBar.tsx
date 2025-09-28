import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MenuItemFilters, CategoryWithStats } from '@/types/menu-management.types';

interface MenuItemFiltersBarProps {
  filters: MenuItemFilters;
  categories: CategoryWithStats[];
  onFiltersChange: (filters: MenuItemFilters) => void;
  loading: boolean;
}

export const MenuItemFiltersBar: React.FC<MenuItemFiltersBarProps> = ({
  filters,
  categories,
  onFiltersChange,
  loading,
}) => {
  const { theme } = useTheme();

  const updateFilter = (key: keyof MenuItemFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleSortOrder = () => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'orders', label: 'Orders' },
    { key: 'rating', label: 'Rating' },
  ];

  const viewModeOptions = [
    { key: 'list', label: 'List', icon: '☰' },
    { key: 'grid', label: 'Grid', icon: '⊞' },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },

    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },

    searchIcon: {
      fontSize: 16,
      marginRight: theme.spacing.sm,
      color: theme.colors.onSurfaceSecondary,
    },

    searchInput: {
      flex: 1,
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      paddingVertical: theme.spacing.sm,
      height: 40,
    },

    clearButton: {
      padding: 4,
    },

    clearIcon: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
    },

    filterButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },

    activeFilterButton: {
      backgroundColor: theme.colors.successLight,
      borderColor: theme.colors.success,
    },

    filterButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontWeight: '500',
    },

    activeFilterButtonText: {
      color: theme.colors.success,
    },

    viewModeContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: 'hidden',
    },

    viewModeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline,
    },

    activeViewModeButton: {
      backgroundColor: theme.colors.primary,
    },

    viewModeIcon: {
      fontSize: 12,
      marginRight: 4,
      color: theme.colors.onSurfaceSecondary,
    },

    activeViewModeIcon: {
      color: theme.colors.onSurfaceOnPrimary,
    },

    viewModeText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 10,
    },

    activeViewModeText: {
      color: theme.colors.onSurfaceOnPrimary,
    },

    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },

    filterLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      marginRight: theme.spacing.xs,
    },

    categoryFilterContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    categoryScroll: {
      flex: 1,
    },

    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },

    activeCategoryButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    categoryButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 10,
    },

    activeCategoryButtonText: {
      color: theme.colors.onSurfaceOnPrimary,
    },

    categoryItemCount: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceLight,
      fontSize: 9,
      marginLeft: 2,
    },

    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },

    sortButtons: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: 'hidden',
    },

    sortOption: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 6,
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline,
    },

    activeSortOption: {
      backgroundColor: theme.colors.primary,
    },

    sortOptionText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 10,
    },

    activeSortOptionText: {
      color: theme.colors.onSurfaceOnPrimary,
    },

    sortOrderButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.sm,
      padding: 6,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 24,
    },

    sortOrderIcon: {
      fontSize: 12,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },

    activeFiltersContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },

    activeFiltersLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      marginRight: theme.spacing.sm,
    },

    activeFilters: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },

    activeFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.infoLight,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.info,
    },

    activeFilterText: {
      ...theme.typography.caption,
      color: theme.colors.info,
      fontSize: 9,
    },

    removeFilter: {
      marginLeft: 4,
      padding: 1,
    },

    removeFilterText: {
      fontSize: 9,
      color: theme.colors.info,
      fontWeight: '600',
    },

    clearAllFilters: {
      paddingHorizontal: theme.spacing.xs,
    },

    clearAllFiltersText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontSize: 9,
      textDecorationLine: 'underline',
    },
  });

  return (
    <View style={styles.container}>
      {/* Search and Main Filters */}
      <View style={styles.topRow}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor={theme.colors.onSurfaceLight}
            value={filters.searchQuery}
            onChangeText={(text) => updateFilter('searchQuery', text)}
            editable={!loading}
          />
          {filters.searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => updateFilter('searchQuery', '')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Available Only Filter */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.availableOnly && styles.activeFilterButton,
          ]}
          onPress={() => updateFilter('availableOnly', !filters.availableOnly)}
          disabled={loading}
        >
          <Text
            style={[
              styles.filterButtonText,
              filters.availableOnly && styles.activeFilterButtonText,
            ]}
          >
            ✓ Available Only
          </Text>
        </TouchableOpacity>

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          {viewModeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.viewModeButton,
                filters.viewMode === option.key && styles.activeViewModeButton,
              ]}
              onPress={() => updateFilter('viewMode', option.key)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.viewModeIcon,
                  filters.viewMode === option.key && styles.activeViewModeIcon,
                ]}
              >
                {option.icon}
              </Text>
              <Text
                style={[
                  styles.viewModeText,
                  filters.viewMode === option.key && styles.activeViewModeText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category and Sort Filters */}
      <View style={styles.bottomRow}>
        {/* Category Filter */}
        <View style={styles.categoryFilterContainer}>
          <Text style={styles.filterLabel}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !filters.categoryId && styles.activeCategoryButton,
              ]}
              onPress={() => updateFilter('categoryId', undefined)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  !filters.categoryId && styles.activeCategoryButtonText,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  filters.categoryId === category.id && styles.activeCategoryButton,
                ]}
                onPress={() => updateFilter('categoryId', category.id)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    filters.categoryId === category.id && styles.activeCategoryButtonText,
                  ]}
                >
                  {category.name}
                </Text>
                <Text style={styles.categoryItemCount}>
                  ({category.stats.itemCount})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.filterLabel}>Sort:</Text>
          <View style={styles.sortButtons}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  filters.sortBy === option.key && styles.activeSortOption,
                ]}
                onPress={() => updateFilter('sortBy', option.key)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    filters.sortBy === option.key && styles.activeSortOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={toggleSortOrder}
            disabled={loading}
          >
            <Text style={styles.sortOrderIcon}>
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters Summary */}
      {(filters.searchQuery || filters.availableOnly || filters.categoryId || filters.sortBy !== 'name') && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFilters}>
              {filters.searchQuery && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    Search: "{filters.searchQuery}"
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateFilter('searchQuery', '')}
                    style={styles.removeFilter}
                  >
                    <Text style={styles.removeFilterText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {filters.availableOnly && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>Available only</Text>
                  <TouchableOpacity
                    onPress={() => updateFilter('availableOnly', false)}
                    style={styles.removeFilter}
                  >
                    <Text style={styles.removeFilterText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {filters.categoryId && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    Category: {categories.find(cat => cat.id === filters.categoryId)?.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateFilter('categoryId', undefined)}
                    style={styles.removeFilter}
                  >
                    <Text style={styles.removeFilterText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {filters.sortBy !== 'name' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    Sort: {sortOptions.find(opt => opt.key === filters.sortBy)?.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateFilter('sortBy', 'name')}
                    style={styles.removeFilter}
                  >
                    <Text style={styles.removeFilterText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={styles.clearAllFilters}
            onPress={() => onFiltersChange({
              searchQuery: '',
              categoryId: undefined,
              availableOnly: false,
              sortBy: 'name',
              sortOrder: 'asc',
              viewMode: filters.viewMode,
            })}
          >
            <Text style={styles.clearAllFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
