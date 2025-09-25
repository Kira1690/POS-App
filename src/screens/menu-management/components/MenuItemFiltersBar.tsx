import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';
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
            placeholderTextColor={ProfessionalTheme.colors.textLight}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: ProfessionalTheme.colors.surfaceLight,
    borderRadius: ProfessionalTheme.borderRadius.md,
    padding: ProfessionalTheme.spacing.md,
    marginBottom: ProfessionalTheme.spacing.lg,
    ...ProfessionalTheme.shadows.sm,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ProfessionalTheme.spacing.md,
    gap: ProfessionalTheme.spacing.sm,
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.md,
    paddingHorizontal: ProfessionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
  },

  searchIcon: {
    fontSize: 16,
    marginRight: ProfessionalTheme.spacing.sm,
    color: ProfessionalTheme.colors.textSecondary,
  },

  searchInput: {
    flex: 1,
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.text,
    paddingVertical: ProfessionalTheme.spacing.sm,
    height: 40,
  },

  clearButton: {
    padding: 4,
  },

  clearIcon: {
    fontSize: 14,
    color: ProfessionalTheme.colors.textSecondary,
  },

  filterButton: {
    backgroundColor: ProfessionalTheme.colors.surface,
    paddingHorizontal: ProfessionalTheme.spacing.md,
    paddingVertical: ProfessionalTheme.spacing.sm,
    borderRadius: ProfessionalTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
  },

  activeFilterButton: {
    backgroundColor: ProfessionalTheme.colors.successLight,
    borderColor: ProfessionalTheme.colors.success,
  },

  filterButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontWeight: '500',
  },

  activeFilterButtonText: {
    color: ProfessionalTheme.colors.success,
  },

  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
    overflow: 'hidden',
  },

  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    paddingVertical: ProfessionalTheme.spacing.xs,
    borderRightWidth: 1,
    borderRightColor: ProfessionalTheme.colors.border,
  },

  activeViewModeButton: {
    backgroundColor: ProfessionalTheme.colors.primary,
  },

  viewModeIcon: {
    fontSize: 12,
    marginRight: 4,
    color: ProfessionalTheme.colors.textSecondary,
  },

  activeViewModeIcon: {
    color: ProfessionalTheme.colors.textOnPrimary,
  },

  viewModeText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontSize: 10,
  },

  activeViewModeText: {
    color: ProfessionalTheme.colors.textOnPrimary,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ProfessionalTheme.spacing.lg,
  },

  filterLabel: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    marginRight: ProfessionalTheme.spacing.xs,
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
    backgroundColor: ProfessionalTheme.colors.surface,
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    marginRight: ProfessionalTheme.spacing.xs,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
  },

  activeCategoryButton: {
    backgroundColor: ProfessionalTheme.colors.primary,
    borderColor: ProfessionalTheme.colors.primary,
  },

  categoryButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontSize: 10,
  },

  activeCategoryButtonText: {
    color: ProfessionalTheme.colors.textOnPrimary,
  },

  categoryItemCount: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textLight,
    fontSize: 9,
    marginLeft: 2,
  },

  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ProfessionalTheme.spacing.xs,
  },

  sortButtons: {
    flexDirection: 'row',
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
    overflow: 'hidden',
  },

  sortOption: {
    paddingHorizontal: ProfessionalTheme.spacing.xs,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: ProfessionalTheme.colors.border,
  },

  activeSortOption: {
    backgroundColor: ProfessionalTheme.colors.primary,
  },

  sortOptionText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontSize: 10,
  },

  activeSortOptionText: {
    color: ProfessionalTheme.colors.textOnPrimary,
  },

  sortOrderButton: {
    backgroundColor: ProfessionalTheme.colors.surface,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
  },

  sortOrderIcon: {
    fontSize: 12,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
  },

  activeFiltersContainer: {
    borderTopWidth: 1,
    borderTopColor: ProfessionalTheme.colors.border,
    paddingTop: ProfessionalTheme.spacing.sm,
    marginTop: ProfessionalTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeFiltersLabel: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  activeFilters: {
    flexDirection: 'row',
    gap: ProfessionalTheme.spacing.xs,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.infoLight,
    paddingHorizontal: ProfessionalTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.info,
  },

  activeFilterText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.info,
    fontSize: 9,
  },

  removeFilter: {
    marginLeft: 4,
    padding: 1,
  },

  removeFilterText: {
    fontSize: 9,
    color: ProfessionalTheme.colors.info,
    fontWeight: '600',
  },

  clearAllFilters: {
    paddingHorizontal: ProfessionalTheme.spacing.xs,
  },

  clearAllFiltersText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.error,
    fontSize: 9,
    textDecorationLine: 'underline',
  },
});