/**
 * useMenu Hook - Provides menu data and operations
 *
 * DATA FLOW: Settings UI → AsyncStorage → Context → Display
 *
 * This hook prioritizes data from AsyncStorage (single source of truth).
 * It only falls back to API/mock data if no data exists in storage.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { menuService } from '@/services/menu';
import { MenuItem, MenuCategory, MenuItemSearchRequest } from '@/types/menu.types';
import { MenuItemExtended, ModifierGroup } from '@/types/menu-management-extended.types';
import { useAuth } from '@/context/auth/AuthContext';
import { menuStorageService } from '@/services/storage/MenuStorageService';

interface UseMenuReturn {
  menuItems: MenuItemExtended[];  // Changed to MenuItemExtended
  categories: MenuCategory[];
  isLoading: boolean;
  error: string | null;
  searchMenuItems: (query: string) => Promise<MenuItem[]>;
  getMenuItemsByCategory: (categoryId: string) => MenuItemExtended[];  // Changed to MenuItemExtended
  refreshMenuItems: () => Promise<void>;
}

export const useMenu = (): UseMenuReturn => {
  const { state: authState } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItemExtended[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories and menu items
  // PRIORITY: AsyncStorage (single source of truth) → API fallback
  const loadMenuData = useCallback(async () => {
    if (!authState.restaurant?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // STEP 1: Check if we have menu data in AsyncStorage (Settings UI saves here)
      const storageInfo = await menuStorageService.getStorageInfo();

      if (storageInfo.hasData && storageInfo.itemsCount > 0) {
        // PREFERRED: Load from AsyncStorage (single source of truth)
        if (__DEV__) {
          console.log('[useMenu] Loading from AsyncStorage (production flow)');
          console.log(`[useMenu] Storage has: ${storageInfo.categoriesCount} categories, ${storageInfo.itemsCount} items, ${storageInfo.modifiersCount} modifiers`);
        }

        // Load all data from storage
        const [storedCategories, storedItems, storedModifiers] = await Promise.all([
          menuStorageService.getCategories(),
          menuStorageService.getMenuItems(),
          menuStorageService.getModifierGroups(),
        ]);

        // Convert stored categories to MenuCategory format
        const convertedCategories: MenuCategory[] = storedCategories.map(cat => ({
          id: cat.id,
          restaurant_id: cat.restaurant_id,
          name: cat.name,
          description: cat.description,
          sort_order: cat.sort_order,
          is_active: cat.is_active,
          created_at: cat.created_at,
          updated_at: cat.updated_at,
        }));
        setCategories(convertedCategories);

        // Populate modifier_groups on each item from their assignments
        const itemsWithModifiers = storedItems.map(item => {
          // If modifier_groups already populated, use them
          if (item.modifier_groups && item.modifier_groups.length > 0) {
            return item;
          }

          // Otherwise, populate from assignments
          const itemModifiers = (item.modifier_assignments || [])
            .map(assignment => storedModifiers.find(g => g.id === assignment.modifier_group_id))
            .filter((g): g is ModifierGroup => g !== undefined);

          return {
            ...item,
            modifier_groups: itemModifiers,
          };
        });

        setMenuItems(itemsWithModifiers);

        if (__DEV__) {
          const itemsWithMods = itemsWithModifiers.filter(i => i.modifier_groups && i.modifier_groups.length > 0);
          console.log(`[useMenu] Loaded ${itemsWithModifiers.length} items, ${itemsWithMods.length} have modifiers`);
          itemsWithMods.forEach(item => {
            console.log(`[useMenu] Item "${item.name}" has ${item.modifier_groups?.length || 0} modifier groups`);
          });
        }
      } else {
        // FALLBACK: Load from API/mock if no storage data
        if (__DEV__) {
          console.log('[useMenu] No storage data found, falling back to API/mock');
        }

        // Load from service (API or mock)
        const categoriesData = await menuService.getCategories(authState.restaurant.id);
        setCategories(categoriesData);

        // Then load menu items for each category
        const allMenuItems: MenuItem[] = [];
        for (const category of categoriesData) {
          const categoryItems = await menuService.getMenuByCategory(authState.restaurant.id, category.id);
          allMenuItems.push(...categoryItems);
        }

        // Load modifier groups from storage (might exist even if items don't)
        const modifierGroups = await menuStorageService.getModifierGroups();

        // Convert to MenuItemExtended and merge with modifiers
        const extendedItems: MenuItemExtended[] = allMenuItems.map(item => {
          // Get modifiers for this item from assignments
          const itemModifiers = (item.modifier_assignments || [])
            .map(assignment => modifierGroups.find(g => g.id === assignment.modifier_group_id))
            .filter((g): g is ModifierGroup => g !== undefined);

          return {
            ...item,
            modifier_assignments: item.modifier_assignments || [],
            modifier_groups: itemModifiers,
            dietary_tags: item.dietary_tags || [],
            allergens: item.allergens || [],
          };
        });

        setMenuItems(extendedItems);

        // Save to storage for future loads and order service
        await menuStorageService.saveMenuItems(extendedItems);

        if (__DEV__) {
          console.log(`[useMenu] Loaded ${extendedItems.length} items from API/mock`);
          const itemsWithModifiers = extendedItems.filter(i => i.modifier_groups && i.modifier_groups.length > 0);
          console.log(`[useMenu] ${itemsWithModifiers.length} items have modifiers assigned`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load menu data';
      setError(errorMessage);
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
    } catch {
      return [];
    }
  }, [authState.restaurant?.id]);

  // Get menu items by category ID
  const getMenuItemsByCategory = useCallback((categoryId: string): MenuItemExtended[] => {
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