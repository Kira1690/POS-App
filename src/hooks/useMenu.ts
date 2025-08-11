/**
 * useMenu Hook - Provides menu data and operations
 * Integrates with MenuService for comprehensive menu management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { menuService } from '@/services/menu';
import { MenuItem, MenuCategory, MenuItemSearchRequest } from '@/types/menu.types';
import { useAuth } from '@/context/auth/AuthContext';

interface UseMenuReturn {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  isLoading: boolean;
  error: string | null;
  searchMenuItems: (query: string) => Promise<MenuItem[]>;
  getMenuItemsByCategory: (categoryId: string) => MenuItem[];
  refreshMenuItems: () => Promise<void>;
}

export const useMenu = (): UseMenuReturn => {
  const { state: authState } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories and menu items
  const loadMenuData = useCallback(async () => {
    if (!authState.restaurant?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, load categories
      const categoriesData = await menuService.getCategories(authState.restaurant.id);
      setCategories(categoriesData);

      // Then load menu items for each category
      const allMenuItems: MenuItem[] = [];
      for (const category of categoriesData) {
        const categoryItems = await menuService.getMenuByCategory(authState.restaurant.id, category.id);
        allMenuItems.push(...categoryItems);
      }
      
      setMenuItems(allMenuItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load menu data';
      setError(errorMessage);
      console.error('Error loading menu data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authState.restaurant?.id]);

  // Search menu items
  const searchMenuItems = useCallback(async (query: string): Promise<MenuItem[]> => {
    if (!authState.restaurant?.id) {
      return [];
    }

    try {
      const searchRequest: MenuItemSearchRequest = {
        restaurant_id: authState.restaurant.id,
        query,
        available_only: true,
      };
      
      const result = await menuService.searchMenuItems(searchRequest);
      return result.items;
    } catch (err) {
      console.error('Error searching menu items:', err);
      return [];
    }
  }, [authState.restaurant?.id]);

  // Get menu items by category ID
  const getMenuItemsByCategory = useCallback((categoryId: string): MenuItem[] => {
    return menuItems.filter(item => item.category_id === categoryId);
  }, [menuItems]);

  // Refresh menu items
  const refreshMenuItems = useCallback(async () => {
    await loadMenuData();
  }, [loadMenuData]);

  // Load menu data on mount and when restaurant changes
  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  return {
    menuItems,
    categories,
    isLoading,
    error,
    searchMenuItems,
    getMenuItemsByCategory,
    refreshMenuItems,
  };
};