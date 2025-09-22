import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';
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

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: ProfessionalTheme.colors.surfaceLight,
    borderRadius: ProfessionalTheme.borderRadius.md,
    padding: ProfessionalTheme.spacing.md,
    marginBottom: ProfessionalTheme.spacing.lg,
    ...ProfessionalTheme.shadows.sm,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.md,
    paddingHorizontal: ProfessionalTheme.spacing.md,
    marginBottom: ProfessionalTheme.spacing.md,
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

  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ProfessionalTheme.spacing.sm,
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

  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ProfessionalTheme.spacing.sm,
  },

  sortLabel: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
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
    paddingHorizontal: ProfessionalTheme.spacing.sm,
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
    fontSize: 11,
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
    minWidth: 28,
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
  },

  activeFiltersLabel: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    marginBottom: ProfessionalTheme.spacing.xs,
  },

  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ProfessionalTheme.spacing.xs,
    marginBottom: ProfessionalTheme.spacing.xs,
  },

  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.infoLight,
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.info,
  },

  activeFilterText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.info,
    fontSize: 10,
  },

  removeFilter: {
    marginLeft: 4,
    padding: 2,
  },

  removeFilterText: {
    fontSize: 10,
    color: ProfessionalTheme.colors.info,
    fontWeight: '600',
  },

  clearAllFilters: {
    alignSelf: 'flex-start',
  },

  clearAllFiltersText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.error,
    fontSize: 10,
    textDecorationLine: 'underline',
  },
});