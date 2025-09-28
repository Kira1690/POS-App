import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MenuManagementFilters } from '@/types/menu-management.types';

interface SearchFilterBarProps {
  filters: MenuManagementFilters;
  onFiltersChange: (filters: MenuManagementFilters) => void;
  loading: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFiltersChange,
  loading,
}) => {
  const { theme } = useTheme();
  const updateFilter = (key: keyof MenuManagementFilters, value: any) => {
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
    { key: 'items', label: 'Items' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'updated', label: 'Updated' },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
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

    filtersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
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

    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },

    sortLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
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
      paddingHorizontal: theme.spacing.sm,
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
      fontSize: 11,
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
      minWidth: 28,
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
    },

    activeFiltersLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.xs,
    },

    activeFilters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },

    activeFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.infoLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.info,
    },

    activeFilterText: {
      ...theme.typography.caption,
      color: theme.colors.info,
      fontSize: 10,
    },

    removeFilter: {
      marginLeft: 4,
      padding: 2,
    },

    removeFilterText: {
      fontSize: 10,
      color: theme.colors.info,
      fontWeight: '600',
    },

    clearAllFilters: {
      alignSelf: 'flex-start',
    },

    clearAllFiltersText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontSize: 10,
      textDecorationLine: 'underline',
    },
  });

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
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

      {/* Filter Buttons */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.activeOnly && styles.activeFilterButton,
          ]}
          onPress={() => updateFilter('activeOnly', !filters.activeOnly)}
          disabled={loading}
        >
          <Text
            style={[
              styles.filterButtonText,
              filters.activeOnly && styles.activeFilterButtonText,
            ]}
          >
            ✓ Active Only
          </Text>
        </TouchableOpacity>

        {/* Sort Dropdown */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort:</Text>
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

      {/* Active Filters Display */}
      {(filters.searchQuery || filters.activeOnly || filters.sortBy !== 'name') && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
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
            
            {filters.activeOnly && (
              <View style={styles.activeFilter}>
                <Text style={styles.activeFilterText}>Active only</Text>
                <TouchableOpacity
                  onPress={() => updateFilter('activeOnly', false)}
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
          
          <TouchableOpacity
            style={styles.clearAllFilters}
            onPress={() => onFiltersChange({
              searchQuery: '',
              activeOnly: false,
              sortBy: 'name',
              sortOrder: 'asc',
            })}
          >
            <Text style={styles.clearAllFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};