import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { DashboardStyles } from '@/constants/theme';
import { MenuItemCard } from './components/MenuItemCard';
import { MenuItemsTableHeader } from './components/MenuItemsTableHeader';
import { MenuItemFiltersBar } from './components/MenuItemFiltersBar';
import { AddMenuItemModal } from './components/AddMenuItemModal';
import { EditMenuItemModal, MenuItemUpdateData } from '@/screens/settings/components/menuManagement/modals/EditMenuItemModal';
import { MockMenuManagementService } from '@/services/menu/MockMenuManagementService';
import {
  MenuItemWithStats,
  CategoryWithStats,
  MenuItemFilters,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from '@/types/menu-management.types';
import { MenuItemExtended } from '@/types/menu-management-extended.types';

interface MenuItemsScreenProps {
  categoryId?: string;
  categoryName?: string;
}

export const MenuItemsScreen: React.FC<MenuItemsScreenProps> = ({
  categoryId,
  categoryName = 'All Categories',
}) => {
  const { theme } = useTheme();
  // State management
  const [menuItems, setMenuItems] = useState<MenuItemWithStats[]>([]);
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState<MenuItemExtended | null>(null);
  
  // Filters and view mode
  const [filters, setFilters] = useState<MenuItemFilters>({
    searchQuery: '',
    categoryId: categoryId,
    availableOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'list',
  });

  // Services
  const menuService = MockMenuManagementService.getInstance();
  const restaurantId = 'rest_001'; // Would come from auth context

  /**
   * Load menu items data
   */
  const loadMenuItems = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const [itemsData, categoriesData] = await Promise.all([
        menuService.getMenuItems(filters.categoryId),
        menuService.getCategories(restaurantId),
      ]);

      setMenuItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [menuService, restaurantId, filters.categoryId]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenuItems(true);
  }, [loadMenuItems]);

  /**
   * Load data when screen is focused or filters change
   */
  useFocusEffect(
    useCallback(() => {
      loadMenuItems();
    }, [loadMenuItems])
  );

  /**
   * Filter and sort menu items
   */
  const filteredMenuItems = menuItems
    .filter(item => {
      if (filters.availableOnly && !item.is_available) return false;
      if (filters.searchQuery) {
        return item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
               item.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * multiplier;
        case 'price':
          return (a.price - b.price) * multiplier;
        case 'orders':
          return (a.stats.todayOrders - b.stats.todayOrders) * multiplier;
        case 'rating':
          return (a.stats.customerRating - b.stats.customerRating) * multiplier;
        default:
          return 0;
      }
    });

  /**
   * Handle item selection
   */
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(filteredMenuItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  /**
   * Handle add new item
   */
  const handleAddMenuItem = async (data: CreateMenuItemRequest) => {
    try {
      await menuService.createMenuItem(data);
      setShowAddModal(false);
      loadMenuItems(); // Refresh data
      Alert.alert('Success', 'Menu item created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create menu item');
    }
  };

  /**
   * Handle edit item save
   */
  const handleSaveEditItem = async (itemId: string, updates: MenuItemUpdateData) => {
    try {
      await menuService.updateMenuItem(itemId, updates as UpdateMenuItemRequest);
      setShowEditModal(false);
      setSelectedEditItem(null);
      loadMenuItems();
      Alert.alert('Success', 'Menu item updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update menu item');
    }
  };

  /**
   * Handle item actions
   */
  const handleItemAction = async (
    itemId: string,
    action: 'edit' | 'duplicate' | 'toggle' | 'delete'
  ) => {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;

    switch (action) {
      case 'edit':
        setSelectedEditItem(item as unknown as MenuItemExtended);
        setShowEditModal(true);
        break;

      case 'duplicate':
        try {
          const duplicateData: CreateMenuItemRequest = {
            restaurant_id: item.restaurant_id,
            category_id: item.category_id,
            name: `${item.name} (Copy)`,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available,
            preparation_time_minutes: item.preparation_time_minutes,
            dietary_info: item.dietary_info,
            ingredients: item.ingredients,
          };
          await menuService.createMenuItem(duplicateData);
          loadMenuItems();
          Alert.alert('Success', 'Menu item duplicated successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to duplicate menu item');
        }
        break;

      case 'toggle':
        try {
          await menuService.updateMenuItem(itemId, { 
            is_available: !item.is_available 
          });
          loadMenuItems();
          Alert.alert(
            'Success',
            `Item ${item.is_available ? 'disabled' : 'enabled'} successfully`
          );
        } catch (error) {
          Alert.alert('Error', 'Failed to update item availability');
        }
        break;

      case 'delete':
        Alert.alert(
          'Delete Item',
          `Are you sure you want to delete "${item.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await menuService.deleteMenuItem(itemId);
                  loadMenuItems();
                  Alert.alert('Success', 'Menu item deleted successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to delete menu item');
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
  const handleBulkAction = (action: 'enable' | 'disable' | 'delete' | 'category') => {
    if (selectedItems.length === 0) {
      Alert.alert('No Selection', 'Please select items first');
      return;
    }

    Alert.alert(
      'Bulk Action',
      `${action} ${selectedItems.length} selected items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await menuService.performBulkOperation({
                operation: action === 'category' ? 'update_category' : action,
                itemIds: selectedItems,
              });
              clearSelection();
              loadMenuItems();
              Alert.alert('Success', 'Bulk operation completed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to perform bulk operation');
            }
          },
        },
      ]
    );
  };

  /**
   * Render item based on view mode
   */
  const renderMenuItem = ({ item }: { item: MenuItemWithStats }) => {
    if (filters.viewMode === 'grid') {
      return (
        <MenuItemCard
          item={item}
          isSelected={selectedItems.includes(item.id)}
          onSelect={() => toggleItemSelection(item.id)}
          onAction={handleItemAction}
          viewMode="grid"
        />
      );
    }

    return (
      <MenuItemCard
        item={item}
        isSelected={selectedItems.includes(item.id)}
        onSelect={() => toggleItemSelection(item.id)}
        onAction={handleItemAction}
        viewMode="list"
      />
    );
  };

  const styles = StyleSheet.create({
    headerActions: {
      position: 'absolute',
      right: theme.spacing.lg,
      top: '50%',
      transform: [{ translateY: -15 }],
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },

    addButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },

    addButtonText: {
      ...theme.typography.label,
      color: theme.colors.onSurfaceOnPrimary,
    },

    categoriesButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },

    categoriesButtonText: {
      ...theme.typography.label,
      color: theme.colors.onSurfaceOnPrimary,
    },

    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },

    retryButtonText: {
      ...theme.typography.label,
      color: theme.colors.onSurfaceOnPrimary,
      textAlign: 'center',
    },

    selectionControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.infoLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.info,
    },

    selectionText: {
      ...theme.typography.body2,
      color: theme.colors.info,
      fontWeight: '600',
    },

    bulkActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },

    bulkButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },

    enableButton: {
      backgroundColor: theme.colors.success,
    },

    disableButton: {
      backgroundColor: theme.colors.warning,
    },

    deleteButton: {
      backgroundColor: theme.colors.error,
    },

    bulkButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceOnPrimary,
      fontSize: 10,
      fontWeight: '600',
    },

    clearButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },

    clearButtonText: {
      ...theme.typography.caption,
      color: theme.colors.info,
      fontSize: 10,
      textDecorationLine: 'underline',
    },

    itemsContainer: {
      flex: 1,
    },

    listContainer: {
      paddingBottom: theme.spacing.xxl,
    },

    loadingContainer: {
      flex: 1,
    },

    loadingItem: {
      height: 60,
      backgroundColor: theme.colors.outlineLight,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      opacity: 0.5,
    },
  });

  /**
   * Error state
   */
  if (error && !loading) {
    return (
      <View style={DashboardStyles.error}>
        <Text style={DashboardStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadMenuItems()}
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
        <Text style={DashboardStyles.headerTitle}>
          {categoryName} Menu Items
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoriesButton}>
            <Text style={styles.categoriesButtonText}>Categories</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={DashboardStyles.content}>
        {/* Filters Bar */}
        <MenuItemFiltersBar
          filters={filters}
          categories={categories}
          onFiltersChange={setFilters}
          loading={loading}
        />

        {/* Selection Controls */}
        {selectedItems.length > 0 && (
          <View style={styles.selectionControls}>
            <Text style={styles.selectionText}>
              {selectedItems.length} item(s) selected
            </Text>
            <View style={styles.bulkActions}>
              <TouchableOpacity
                style={[styles.bulkButton, styles.enableButton]}
                onPress={() => handleBulkAction('enable')}
              >
                <Text style={styles.bulkButtonText}>Enable</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkButton, styles.disableButton]}
                onPress={() => handleBulkAction('disable')}
              >
                <Text style={styles.bulkButtonText}>Disable</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkButton, styles.deleteButton]}
                onPress={() => handleBulkAction('delete')}
              >
                <Text style={styles.bulkButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSelection}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Items List/Grid */}
        <View style={styles.itemsContainer}>
          <Text style={DashboardStyles.sectionTitle}>
            Menu Items ({filteredMenuItems.length})
          </Text>

          {filters.viewMode === 'list' && (
            <MenuItemsTableHeader
              onSelectAll={selectAllItems}
              allSelected={selectedItems.length === filteredMenuItems.length}
              loading={loading}
            />
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 5 }).map((_, index) => (
                <View key={index} style={styles.loadingItem} />
              ))}
            </View>
          ) : (
            <FlatList
              data={filteredMenuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id}
              numColumns={filters.viewMode === 'grid' ? 2 : 1}
              key={filters.viewMode} // Force re-render when view mode changes
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary]}
                  tintColor={theme.colors.primary}
                />
              }
            />
          )}
        </View>
      </View>

      {/* Add Menu Item Modal */}
      <AddMenuItemModal
        visible={showAddModal}
        categories={categories}
        defaultCategoryId={filters.categoryId}
        onSubmit={handleAddMenuItem}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Menu Item Modal */}
      <EditMenuItemModal
        visible={showEditModal}
        item={selectedEditItem}
        categories={categories}
        modifierGroups={[]}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEditItem(null);
        }}
        onSave={handleSaveEditItem}
      />
    </View>
  );
};

export default MenuItemsScreen;