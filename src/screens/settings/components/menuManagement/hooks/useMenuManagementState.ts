/**
 * useMenuManagementState Hook
 * Central state management for Menu Management Settings
 * Handles UI state, filters, selection, and delegates to MenuContext for data
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useMenuContext } from '@/context/menu';
import {
  MenuManagementState,
  MenuManagementTab,
  MenuViewMode,
  MenuSortField,
  SortOrder,
  MenuFilters,
  ModifierFilters,
  ComboFilters,
  MenuSelectionState,
  DEFAULT_MENU_FILTERS,
  DEFAULT_MODIFIER_FILTERS,
  DEFAULT_COMBO_FILTERS,
  DEFAULT_SELECTION_STATE,
} from '@/types/menu-management-settings.types';
import { MenuItemExtended } from '@/types/menu-management-extended.types';
import { CategoryWithStats } from '@/types/menu-management.types';

interface UseMenuManagementStateOptions {
  onChangesDetected?: (hasChanges: boolean) => void;
}

interface UseMenuManagementStateReturn {
  // State
  activeTab: MenuManagementTab;
  viewMode: MenuViewMode;
  searchQuery: string;
  sortField: MenuSortField;
  sortOrder: SortOrder;

  // Selection
  selectedCategoryId: string | null;
  selectedItemIds: string[];
  isMultiSelectMode: boolean;

  // Data from context
  categories: CategoryWithStats[];
  menuItems: MenuItemExtended[];
  isLoading: boolean;
  error: string | null;

  // Computed
  filteredItems: MenuItemExtended[];
  selectedItem: MenuItemExtended | null;
  selectedCategory: CategoryWithStats | null;
  itemsCount: number;
  selectedCount: number;

  // Filters
  itemFilters: MenuFilters;
  modifierFilters: ModifierFilters;
  comboFilters: ComboFilters;

  // Actions - Navigation
  setActiveTab: (tab: MenuManagementTab) => void;
  setViewMode: (mode: MenuViewMode) => void;

  // Actions - Search & Sort
  setSearchQuery: (query: string) => void;
  setSorting: (field: MenuSortField, order: SortOrder) => void;
  toggleSortOrder: () => void;

  // Actions - Filters
  setItemFilters: (filters: Partial<MenuFilters>) => void;
  setModifierFilters: (filters: Partial<ModifierFilters>) => void;
  setComboFilters: (filters: Partial<ComboFilters>) => void;
  resetFilters: () => void;

  // Actions - Selection
  selectCategory: (categoryId: string | null) => void;
  selectItem: (itemId: string) => void;
  deselectItem: (itemId: string) => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
  toggleMultiSelectMode: () => void;

  // Actions - Refresh
  refreshData: () => Promise<void>;
}

export const useMenuManagementState = (
  options: UseMenuManagementStateOptions = {}
): UseMenuManagementStateReturn => {
  const { onChangesDetected } = options;
  const menuContext = useMenuContext();

  // ============== LOCAL UI STATE ==============

  const [activeTab, setActiveTab] = useState<MenuManagementTab>('items');
  const [viewMode, setViewMode] = useState<MenuViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<MenuSortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Filters
  const [itemFilters, setItemFiltersState] = useState<MenuFilters>(DEFAULT_MENU_FILTERS);
  const [modifierFilters, setModifierFiltersState] = useState<ModifierFilters>(DEFAULT_MODIFIER_FILTERS);
  const [comboFilters, setComboFiltersState] = useState<ComboFilters>(DEFAULT_COMBO_FILTERS);

  // ============== COMPUTED VALUES ==============

  const filteredItems = useMemo(() => {
    let items = menuContext.menuItemsExtended;

    // Filter by category
    if (selectedCategoryId) {
      items = items.filter((item) => item.category_id === selectedCategoryId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Apply item filters
    if (itemFilters.availableOnly) {
      items = items.filter((item) => item.is_available);
    }
    if (itemFilters.unavailableOnly) {
      items = items.filter((item) => !item.is_available);
    }
    if (itemFilters.categoryIds.length > 0) {
      items = items.filter((item) => itemFilters.categoryIds.includes(item.category_id));
    }
    if (itemFilters.priceRange) {
      items = items.filter(
        (item) =>
          item.price >= itemFilters.priceRange!.min &&
          item.price <= itemFilters.priceRange!.max
      );
    }
    if (itemFilters.dietaryTags.length > 0) {
      items = items.filter((item) =>
        itemFilters.dietaryTags.some((tag) => item.dietary_tags?.includes(tag))
      );
    }

    // Sort items
    items = [...items].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * multiplier;
        case 'price':
          return (a.price - b.price) * multiplier;
        case 'category':
          return a.category_id.localeCompare(b.category_id) * multiplier;
        case 'availability':
          return ((a.is_available ? 1 : 0) - (b.is_available ? 1 : 0)) * multiplier;
        case 'updated':
          return (
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          ) * multiplier;
        default:
          return 0;
      }
    });

    return items;
  }, [
    menuContext.menuItemsExtended,
    selectedCategoryId,
    searchQuery,
    itemFilters,
    sortField,
    sortOrder,
  ]);

  const selectedItem = useMemo(() => {
    if (selectedItemIds.length === 1) {
      return filteredItems.find((item) => item.id === selectedItemIds[0]) || null;
    }
    return null;
  }, [filteredItems, selectedItemIds]);

  const selectedCategory = useMemo(() => {
    if (selectedCategoryId) {
      return menuContext.categoriesWithStats.find((c) => c.id === selectedCategoryId) || null;
    }
    return null;
  }, [menuContext.categoriesWithStats, selectedCategoryId]);

  // ============== ACTIONS ==============

  const setSorting = useCallback((field: MenuSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const setItemFilters = useCallback((filters: Partial<MenuFilters>) => {
    setItemFiltersState((prev) => ({ ...prev, ...filters }));
  }, []);

  const setModifierFilters = useCallback((filters: Partial<ModifierFilters>) => {
    setModifierFiltersState((prev) => ({ ...prev, ...filters }));
  }, []);

  const setComboFilters = useCallback((filters: Partial<ComboFilters>) => {
    setComboFiltersState((prev) => ({ ...prev, ...filters }));
  }, []);

  const resetFilters = useCallback(() => {
    setItemFiltersState(DEFAULT_MENU_FILTERS);
    setModifierFiltersState(DEFAULT_MODIFIER_FILTERS);
    setComboFiltersState(DEFAULT_COMBO_FILTERS);
    setSearchQuery('');
  }, []);

  const selectCategory = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    // Clear item selection when changing category
    setSelectedItemIds([]);
  }, []);

  const selectItem = useCallback((itemId: string) => {
    if (isMultiSelectMode) {
      setSelectedItemIds((prev) =>
        prev.includes(itemId) ? prev : [...prev, itemId]
      );
    } else {
      setSelectedItemIds([itemId]);
    }
  }, [isMultiSelectMode]);

  const deselectItem = useCallback((itemId: string) => {
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
  }, []);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItemIds(filteredItems.map((item) => item.id));
    setIsMultiSelectMode(true);
  }, [filteredItems]);

  const clearSelection = useCallback(() => {
    setSelectedItemIds([]);
    setIsMultiSelectMode(false);
  }, []);

  const toggleMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode((prev) => !prev);
    if (isMultiSelectMode) {
      // Keep only first selected item when exiting multi-select
      setSelectedItemIds((prev) => (prev.length > 0 ? [prev[0]] : []));
    }
  }, [isMultiSelectMode]);

  const refreshData = useCallback(async () => {
    await menuContext.refreshMenu();
  }, [menuContext]);

  // ============== CHANGE DETECTION ==============

  useEffect(() => {
    if (onChangesDetected) {
      // Detect if there are unsaved changes
      // For now, we consider no unsaved changes since everything saves immediately
      onChangesDetected(false);
    }
  }, [onChangesDetected]);

  // ============== RETURN ==============

  return {
    // State
    activeTab,
    viewMode,
    searchQuery,
    sortField,
    sortOrder,

    // Selection
    selectedCategoryId,
    selectedItemIds,
    isMultiSelectMode,

    // Data from context
    categories: menuContext.categoriesWithStats,
    menuItems: menuContext.menuItemsExtended,
    isLoading: menuContext.isLoading,
    error: menuContext.error,

    // Computed
    filteredItems,
    selectedItem,
    selectedCategory,
    itemsCount: filteredItems.length,
    selectedCount: selectedItemIds.length,

    // Filters
    itemFilters,
    modifierFilters,
    comboFilters,

    // Actions - Navigation
    setActiveTab,
    setViewMode,

    // Actions - Search & Sort
    setSearchQuery,
    setSorting,
    toggleSortOrder,

    // Actions - Filters
    setItemFilters,
    setModifierFilters,
    setComboFilters,
    resetFilters,

    // Actions - Selection
    selectCategory,
    selectItem,
    deselectItem,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    toggleMultiSelectMode,

    // Actions - Refresh
    refreshData,
  };
};

export default useMenuManagementState;
