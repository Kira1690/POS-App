import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ProfessionalTheme, DashboardStyles } from '@/constants/theme';
import { CategoryCard } from './components/CategoryCard';
import { MenuStatsPanel } from './components/MenuStatsPanel';
import { SearchFilterBar } from './components/SearchFilterBar';
import { MockMenuManagementService } from '@/services/menu/MockMenuManagementService';
import {
  CategoryWithStats,
  MenuManagementStats,
  MenuManagementFilters,
  CreateCategoryRequest,
} from '@/types/menu-management.types';

export const MenuManagementScreen: React.FC = () => {
  // State management
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [stats, setStats] = useState<MenuManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [filters, setFilters] = useState<MenuManagementFilters>({
    searchQuery: '',
    activeOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Services
  const menuService = MockMenuManagementService.getInstance();
  const restaurantId = 'rest_001'; // Would come from auth context

  /**
   * Load menu management data
   */
  const loadMenuData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const [categoriesData, statsData] = await Promise.all([
        menuService.getCategories(restaurantId),
        menuService.getMenuStats(restaurantId),
      ]);

      setCategories(categoriesData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load menu data');
      console.error('Menu data loading error:', err);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [menuService, restaurantId]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenuData(true);
  }, [loadMenuData]);

  /**
   * Load data when screen is focused
   */
  useFocusEffect(
    useCallback(() => {
      loadMenuData();
    }, [loadMenuData])
  );

  /**
   * Filter and sort categories
   */
  const filteredCategories = categories
    .filter(category => {
      if (filters.activeOnly && !category.is_active) return false;
      if (filters.searchQuery) {
        return category.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
               category.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * multiplier;
        case 'items':
          return (a.stats.itemCount - b.stats.itemCount) * multiplier;
        case 'revenue':
          return (a.stats.todayRevenue - b.stats.todayRevenue) * multiplier;
        case 'updated':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime() * multiplier;
        default:
          return 0;
      }
    });

  /**
   * Handle add category
   */
  const handleAddCategory = () => {
    Alert.prompt(
      'Add New Category',
      'Enter category name:',
      async (name) => {
        if (name && name.trim()) {
          try {
            const categoryData: CreateCategoryRequest = {
              restaurant_id: restaurantId,
              name: name.trim(),
              description: '',
              is_active: true,
            };
            
            await menuService.createCategory(categoryData);
            loadMenuData(); // Refresh data
            Alert.alert('Success', 'Category created successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to create category');
          }
        }
      }
    );
  };

  /**
   * Handle category actions
   */
  const handleCategoryAction = async (
    categoryId: string,
    action: 'edit' | 'items' | 'toggle' | 'delete'
  ) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    switch (action) {
      case 'edit':
        Alert.prompt(
          'Edit Category',
          'Enter new name:',
          async (name) => {
            if (name && name.trim()) {
              try {
                await menuService.updateCategory(categoryId, { name: name.trim() });
                loadMenuData();
                Alert.alert('Success', 'Category updated successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to update category');
              }
            }
          },
          'plain-text',
          category.name
        );
        break;

      case 'items':
        // TODO: Navigate to menu items screen
        Alert.alert('Navigation', `Navigate to items for ${category.name}`);
        break;

      case 'toggle':
        try {
          await menuService.toggleCategoryStatus(categoryId);
          loadMenuData();
          Alert.alert(
            'Success',
            `Category ${category.is_active ? 'disabled' : 'enabled'} successfully`
          );
        } catch (error) {
          Alert.alert('Error', 'Failed to update category status');
        }
        break;

      case 'delete':
        Alert.alert(
          'Delete Category',
          `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await menuService.deleteCategory(categoryId);
                  loadMenuData();
                  Alert.alert('Success', 'Category deleted successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to delete category');
                }
              },
            },
          ]
        );
        break;
    }
  };

  /**
   * Handle bulk actions
   */
  const handleBulkActions = () => {
    Alert.alert('Bulk Actions', 'Bulk operations feature coming soon');
  };

  /**
   * Handle import menu
   */
  const handleImportMenu = () => {
    Alert.alert('Import Menu', 'Menu import feature coming soon');
  };

  /**
   * Error state
   */
  if (error && !loading) {
    return (
      <View style={DashboardStyles.error}>
        <Text style={DashboardStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadMenuData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={DashboardStyles.screen}>
      {/* Professional Header */}
      <View style={DashboardStyles.header}>
        <Text style={DashboardStyles.headerTitle}>Menu Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
            <Text style={styles.addButtonText}>+ Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={DashboardStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ProfessionalTheme.colors.primary]}
            tintColor={ProfessionalTheme.colors.primary}
          />
        }
      >
        {/* Search and Filters */}
        <SearchFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
        />

        {/* Categories Section */}
        <View style={styles.mainContent}>
          <View style={styles.categoriesSection}>
            <Text style={DashboardStyles.sectionTitle}>
              Menu Categories ({filteredCategories.length})
            </Text>
            
            {loading ? (
              <View style={styles.loadingGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} style={styles.loadingCard} />
                ))}
              </View>
            ) : (
              <View style={styles.categoriesGrid}>
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onAction={handleCategoryAction}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Stats Panel */}
          <MenuStatsPanel
            stats={stats}
            loading={loading}
            onBulkActions={handleBulkActions}
            onImportMenu={handleImportMenu}
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    position: 'absolute',
    right: ProfessionalTheme.spacing.lg,
    top: '50%',
    transform: [{ translateY: -15 }],
  },

  addButton: {
    backgroundColor: ProfessionalTheme.colors.success,
    paddingHorizontal: ProfessionalTheme.spacing.md,
    paddingVertical: ProfessionalTheme.spacing.sm,
    borderRadius: ProfessionalTheme.borderRadius.md,
  },

  addButtonText: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.textOnPrimary,
  },

  retryButton: {
    backgroundColor: ProfessionalTheme.colors.primary,
    paddingHorizontal: ProfessionalTheme.spacing.lg,
    paddingVertical: ProfessionalTheme.spacing.md,
    borderRadius: ProfessionalTheme.borderRadius.md,
  },

  retryButtonText: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.textOnPrimary,
    textAlign: 'center',
  },

  mainContent: {
    flexDirection: 'row',
    gap: ProfessionalTheme.spacing.lg,
  },

  categoriesSection: {
    flex: 2,
  },

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ProfessionalTheme.spacing.sm,
  },

  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ProfessionalTheme.spacing.sm,
  },

  loadingCard: {
    width: '48%',
    height: 180,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: ProfessionalTheme.borderRadius.md,
    marginHorizontal: ProfessionalTheme.spacing.sm,
    marginBottom: ProfessionalTheme.spacing.md,
    opacity: 0.5,
  },

  bottomSpacing: {
    height: ProfessionalTheme.spacing.xxl,
  },
});

export default MenuManagementScreen;