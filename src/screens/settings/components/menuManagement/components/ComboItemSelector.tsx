/**
 * ComboItemSelector Component
 * Allows selecting menu items to include in a combo deal
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { MenuItemExtended, ComboItem, ComboItemCategory } from '@/types/menu-management-extended.types';
import { CategoryWithStats } from '@/types/menu-management.types';

export interface SelectedComboItem {
  menu_item_id?: string;
  category_choice?: string;
  quantity: number;
  is_substitutable: boolean;
  substitution_options: string[];
  price_override?: number;
  item_category: ComboItemCategory;
}

interface ComboItemSelectorProps {
  menuItems: MenuItemExtended[];
  categories: CategoryWithStats[];
  selectedItems: SelectedComboItem[];
  onItemsChange: (items: SelectedComboItem[]) => void;
}

const ITEM_CATEGORIES: { value: ComboItemCategory; label: string; icon: string }[] = [
  { value: 'main', label: 'Main', icon: 'food' },
  { value: 'side', label: 'Side', icon: 'french-fries' },
  { value: 'drink', label: 'Drink', icon: 'cup' },
  { value: 'dessert', label: 'Dessert', icon: 'ice-cream' },
  { value: 'addon', label: 'Add-on', icon: 'plus-circle' },
];

export const ComboItemSelector: React.FC<ComboItemSelectorProps> = ({
  menuItems,
  categories,
  selectedItems,
  onItemsChange,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'specific' | 'category'>('specific');

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(item => item.is_available);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategoryId) {
      items = items.filter(item => item.category_id === selectedCategoryId);
    }

    return items;
  }, [menuItems, searchQuery, selectedCategoryId]);

  const isItemSelected = useCallback((itemId: string) => {
    return selectedItems.some(si => si.menu_item_id === itemId);
  }, [selectedItems]);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = selectedItems.find(si => si.menu_item_id === itemId);
    return item?.quantity || 0;
  }, [selectedItems]);

  const handleAddItem = useCallback((menuItem: MenuItemExtended, category: ComboItemCategory = 'main') => {
    const existingIndex = selectedItems.findIndex(si => si.menu_item_id === menuItem.id);

    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      onItemsChange(updated);
    } else {
      const newItem: SelectedComboItem = {
        menu_item_id: menuItem.id,
        quantity: 1,
        is_substitutable: false,
        substitution_options: [],
        item_category: category,
      };
      onItemsChange([...selectedItems, newItem]);
    }
  }, [selectedItems, onItemsChange]);

  const handleRemoveItem = useCallback((itemId: string) => {
    const existingIndex = selectedItems.findIndex(si => si.menu_item_id === itemId);

    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
        onItemsChange(updated);
      } else {
        updated.splice(existingIndex, 1);
        onItemsChange(updated);
      }
    }
  }, [selectedItems, onItemsChange]);

  const handleAddCategoryChoice = useCallback((categoryName: string, itemCategory: ComboItemCategory = 'main') => {
    const newItem: SelectedComboItem = {
      category_choice: categoryName,
      quantity: 1,
      is_substitutable: true,
      substitution_options: [],
      item_category: itemCategory,
    };
    onItemsChange([...selectedItems, newItem]);
  }, [selectedItems, onItemsChange]);

  const handleRemoveCategoryChoice = useCallback((categoryName: string) => {
    const updated = selectedItems.filter(si => si.category_choice !== categoryName);
    onItemsChange(updated);
  }, [selectedItems, onItemsChange]);

  const handleUpdateItemCategory = useCallback((index: number, category: ComboItemCategory) => {
    const updated = [...selectedItems];
    updated[index].item_category = category;
    onItemsChange(updated);
  }, [selectedItems, onItemsChange]);

  const handleToggleSubstitutable = useCallback((index: number) => {
    const updated = [...selectedItems];
    updated[index].is_substitutable = !updated[index].is_substitutable;
    onItemsChange(updated);
  }, [selectedItems, onItemsChange]);

  const renderMenuItem = useCallback(({ item }: { item: MenuItemExtended }) => {
    const selected = isItemSelected(item.id);
    const quantity = getItemQuantity(item.id);

    return (
      <View style={[styles.menuItem, selected && styles.menuItemSelected]}>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.menuItemActions}>
          {quantity > 0 && (
            <>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleRemoveItem(item.id)}
                accessibilityLabel="Decrease quantity"
              >
                <MaterialCommunityIcons name="minus" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
            </>
          )}
          <TouchableOpacity
            style={[styles.quantityButton, styles.addButton]}
            onPress={() => handleAddItem(item)}
            accessibilityLabel="Add item"
          >
            <MaterialCommunityIcons name="plus" size={16} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [isItemSelected, getItemQuantity, handleRemoveItem, handleAddItem, theme.colors]);

  const renderSelectedItem = useCallback((item: SelectedComboItem, index: number) => {
    const menuItem = item.menu_item_id
      ? menuItems.find(mi => mi.id === item.menu_item_id)
      : null;

    return (
      <View key={index} style={styles.selectedItem}>
        <View style={styles.selectedItemHeader}>
          <View style={styles.selectedItemInfo}>
            <MaterialCommunityIcons
              name={(ITEM_CATEGORIES.find(c => c.value === item.item_category)?.icon || 'food') as any}
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.selectedItemName} numberOfLines={1}>
              {menuItem?.name || item.category_choice || 'Unknown Item'}
            </Text>
            <Text style={styles.selectedItemQuantity}>x{item.quantity}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (item.menu_item_id) {
                handleRemoveItem(item.menu_item_id);
              } else if (item.category_choice) {
                handleRemoveCategoryChoice(item.category_choice);
              }
            }}
            accessibilityLabel="Remove item"
          >
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.selectedItemOptions}>
          <View style={styles.categorySelector}>
            {ITEM_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  item.item_category === cat.value && styles.categoryChipActive,
                ]}
                onPress={() => handleUpdateItemCategory(index, cat.value)}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={12}
                  color={item.item_category === cat.value ? theme.colors.onPrimary : theme.colors.onSurfaceSecondary}
                />
                <Text style={[
                  styles.categoryChipText,
                  item.item_category === cat.value && styles.categoryChipTextActive,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.substitutableToggle, item.is_substitutable && styles.substitutableToggleActive]}
            onPress={() => handleToggleSubstitutable(index)}
          >
            <MaterialCommunityIcons
              name={item.is_substitutable ? 'swap-horizontal' : 'swap-horizontal-variant'}
              size={14}
              color={item.is_substitutable ? theme.colors.primary : theme.colors.onSurfaceSecondary}
            />
            <Text style={[
              styles.substitutableText,
              item.is_substitutable && styles.substitutableTextActive,
            ]}>
              {item.is_substitutable ? 'Substitutable' : 'Fixed'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [menuItems, handleRemoveItem, handleRemoveCategoryChoice, handleUpdateItemCategory, handleToggleSubstitutable, theme.colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    modeSelector: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      padding: 4,
    },
    modeButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    modeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    modeButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    modeButtonTextActive: {
      color: theme.colors.onPrimary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    categoriesRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    categoryFilterButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginRight: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    categoryFilterButtonActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    categoryFilterText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    categoryFilterTextActive: {
      color: theme.colors.primary,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    itemsList: {
      maxHeight: 200,
    },
    itemsListContent: {
      paddingBottom: theme.spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    menuItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    menuItemPrice: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    menuItemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    quantityButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    quantityText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      minWidth: 24,
      textAlign: 'center',
    },
    selectedSection: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    selectedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    selectedCount: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    selectedItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    selectedItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    selectedItemInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.xs,
    },
    selectedItemName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      flex: 1,
    },
    selectedItemQuantity: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    selectedItemOptions: {
      gap: theme.spacing.sm,
    },
    categorySelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      gap: 4,
    },
    categoryChipActive: {
      backgroundColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
    },
    categoryChipTextActive: {
      color: theme.colors.onPrimary,
    },
    substitutableToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.xs,
    },
    substitutableToggleActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    substitutableText: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
    },
    substitutableTextActive: {
      color: theme.colors.primary,
    },
    categoryChoiceSection: {
      marginTop: theme.spacing.md,
    },
    categoryChoiceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    categoryChoiceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      gap: theme.spacing.xs,
    },
    categoryChoiceButtonText: {
      fontSize: 13,
      color: theme.colors.onSurface,
    },
  });

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, selectionMode === 'specific' && styles.modeButtonActive]}
          onPress={() => setSelectionMode('specific')}
        >
          <Text style={[styles.modeButtonText, selectionMode === 'specific' && styles.modeButtonTextActive]}>
            Specific Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, selectionMode === 'category' && styles.modeButtonActive]}
          onPress={() => setSelectionMode('category')}
        >
          <Text style={[styles.modeButtonText, selectionMode === 'category' && styles.modeButtonTextActive]}>
            Any from Category
          </Text>
        </TouchableOpacity>
      </View>

      {selectionMode === 'specific' ? (
        <>
          {/* Search */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={theme.colors.onSurfaceSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filters */}
          <FlatList
            horizontal
            data={[{ id: null, name: 'All' }, ...categories]}
            keyExtractor={(item) => item.id || 'all'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryFilterButton,
                  selectedCategoryId === item.id && styles.categoryFilterButtonActive,
                ]}
                onPress={() => setSelectedCategoryId(item.id)}
              >
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategoryId === item.id && styles.categoryFilterTextActive,
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.categoriesRow}
            showsHorizontalScrollIndicator={false}
          />

          {/* Items List */}
          <Text style={styles.sectionTitle}>Available Items</Text>
          <FlatList
            data={filteredItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            style={styles.itemsList}
            contentContainerStyle={styles.itemsListContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.categoryChoiceSection}>
          <Text style={styles.sectionTitle}>Select a Category</Text>
          <Text style={{ fontSize: 12, color: theme.colors.onSurfaceSecondary, marginBottom: theme.spacing.sm }}>
            Customers can choose any item from the selected category
          </Text>
          <View style={styles.categoryChoiceGrid}>
            {categories.map(cat => {
              const isSelected = selectedItems.some(si => si.category_choice === cat.name);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChoiceButton,
                    isSelected && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      handleRemoveCategoryChoice(cat.name);
                    } else {
                      handleAddCategoryChoice(cat.name);
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    name={isSelected ? 'check-circle' : 'plus-circle-outline'}
                    size={16}
                    color={isSelected ? theme.colors.primary : theme.colors.onSurfaceSecondary}
                  />
                  <Text style={[
                    styles.categoryChoiceButtonText,
                    isSelected && { color: theme.colors.primary, fontWeight: '500' },
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <View style={styles.selectedSection}>
          <View style={styles.selectedHeader}>
            <Text style={styles.sectionTitle}>Combo Items</Text>
            <Text style={styles.selectedCount}>{selectedItems.length} items</Text>
          </View>
          {selectedItems.map((item, index) => renderSelectedItem(item, index))}
        </View>
      )}
    </View>
  );
};

export default ComboItemSelector;
