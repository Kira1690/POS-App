/**
 * Menu Data Management Hook
 * Uses MenuService via dependency injection for data operations
 * Follows Single Responsibility Principle - menu data management only
 * Clean separation from business logic and UI concerns
 */

import { useState, useCallback, useEffect } from 'react';
import { useMenuService } from '@/hooks/services';
import { MenuItem, MenuCategory } from '@/types/menu.types';

export interface MenuDataState {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  selectedCategory: MenuCategory | null;
  selectedItem: MenuItem | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseMenuDataResult {
  // State
  state: MenuDataState;
  
  // Data Operations
  loadCategories: (restaurantId?: string) => Promise<void>;
  loadMenuItems: (restaurantId?: string, categoryId?: string) => Promise<void>;
  loadMenuItem: (itemId: string) => Promise<void>;
  refreshMenu: () => Promise<void>;
  
  // Selection
  selectCategory: (category: MenuCategory | null) => void;
  selectItem: (item: MenuItem | null) => void;
  
  // Filtering & Search
  getItemsByCategory: (categoryId: string) => MenuItem[];
  getAvailableItems: () => MenuItem[];
  searchMenuItems: (query: string) => MenuItem[];
  getPopularItems: () => MenuItem[];
  
  // Category Operations
  getCategoryById: (categoryId: string) => MenuCategory | undefined;
  getCategoriesWithItems: () => MenuCategory[];
  
  // Error Handling
  clearError: () => void;
}

/**
 * Hook for menu data management
 * Uses MenuService via dependency injection for all data operations
 * 
 * @returns Menu data state and operations
 */
export function useMenuData(): UseMenuDataResult {
  // Use DI service
  const menuService = useMenuService();

  // Local state for data management
  const [state, setState] = useState<MenuDataState>({
    categories: [],
    menuItems: [],
    selectedCategory: null,
    selectedItem: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Load categories
  const loadCategories = useCallback(async (restaurantId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await menuService.getCategories({ restaurantId });
      setState(prev => ({
        ...prev,
        categories: response.data || [],
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load categories',
        isLoading: false,
      }));
    }
  }, [menuService]);

  // Load menu items
  const loadMenuItems = useCallback(async (restaurantId?: string, categoryId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = { restaurantId };
      if (categoryId) {
        // Get items for specific category
        const items = await menuService.getMenuItemsByCategory(categoryId);
        setState(prev => ({
          ...prev,
          menuItems: items,
          isLoading: false,
          lastUpdated: new Date(),
        }));
      } else {
        // Get all items
        const response = await menuService.getMenuItems(params);
        setState(prev => ({
          ...prev,
          menuItems: response.data || [],
          isLoading: false,
          lastUpdated: new Date(),
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load menu items',
        isLoading: false,
      }));
    }
  }, [menuService]);

  // Load single menu item
  const loadMenuItem = useCallback(async (itemId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const item = await menuService.getMenuItem(itemId);
      
      setState(prev => ({
        ...prev,
        selectedItem: item,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load menu item',
        isLoading: false,
      }));
    }
  }, [menuService]);

  // Refresh menu data
  const refreshMenu = useCallback(async () => {
    const promises = [loadCategories(), loadMenuItems()];
    await Promise.allSettled(promises);
  }, [loadCategories, loadMenuItems]);

  // Select category
  const selectCategory = useCallback((category: MenuCategory | null) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category,
    }));

    // Load items for selected category
    if (category) {
      loadMenuItems(undefined, category.id);
    }
  }, [loadMenuItems]);

  // Select item
  const selectItem = useCallback((item: MenuItem | null) => {
    setState(prev => ({
      ...prev,
      selectedItem: item,
    }));
  }, []);

  // Get items by category
  const getItemsByCategory = useCallback((categoryId: string): MenuItem[] => {
    return state.menuItems.filter(item => item.category_id === categoryId);
  }, [state.menuItems]);

  // Get available items only
  const getAvailableItems = useCallback((): MenuItem[] => {
    return state.menuItems.filter(item => item.is_available);
  }, [state.menuItems]);

  // Search menu items
  const searchMenuItems = useCallback((query: string): MenuItem[] => {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return state.menuItems;
    }

    return state.menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      getCategoryById(item.category_id)?.name.toLowerCase().includes(searchTerm)
    );
  }, [state.menuItems, state.categories]);

  // Get popular items (mock implementation - would use real analytics)
  const getPopularItems = useCallback((): MenuItem[] => {
    return state.menuItems
      .filter(item => item.is_available)
      .sort((a, b) => b.price - a.price) // Mock popularity by price
      .slice(0, 8);
  }, [state.menuItems]);

  // Get category by ID
  const getCategoryById = useCallback((categoryId: string): MenuCategory | undefined => {
    return state.categories.find(category => category.id === categoryId);
  }, [state.categories]);

  // Get categories that have items
  const getCategoriesWithItems = useCallback((): MenuCategory[] => {
    return state.categories.filter(category =>
      state.menuItems.some(item => item.category_id === category.id)
    );
  }, [state.categories, state.menuItems]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    state,
    loadCategories,
    loadMenuItems,
    loadMenuItem,
    refreshMenu,
    selectCategory,
    selectItem,
    getItemsByCategory,
    getAvailableItems,
    searchMenuItems,
    getPopularItems,
    getCategoryById,
    getCategoriesWithItems,
    clearError,
  };
}

/**
 * Hook for menu data with caching
 * Loads menu data once and caches it for performance
 */
export function useMenuDataWithCaching() {
  const menuData = useMenuData();

  useEffect(() => {
    // Load data once on mount
    if (menuData.state.categories.length === 0) {
      menuData.loadCategories();
    }
    if (menuData.state.menuItems.length === 0) {
      menuData.loadMenuItems();
    }
  }, [menuData]);

  return menuData;
}

/**
 * Hook for category-specific menu data
 * Automatically loads items when category changes
 */
export function useCategoryMenuData(categoryId: string | null) {
  const menuData = useMenuData();

  useEffect(() => {
    if (categoryId) {
      menuData.loadMenuItems(undefined, categoryId);
    }
  }, [categoryId, menuData]);

  return {
    categoryItems: categoryId ? menuData.getItemsByCategory(categoryId) : [],
    isLoading: menuData.state.isLoading,
    error: menuData.state.error,
    clearError: menuData.clearError,
  };
}