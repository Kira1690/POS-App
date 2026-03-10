/**
 * Menu Context
 * Provides shared menu state across the application
 * Enables real-time sync between Menu Management Settings and Order Screen
 *
 * Now includes AsyncStorage persistence for offline support.
 * When backend is ready, set useLocalStorage to false.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  IMenuContext,
  IMenuContextState,
  INITIAL_MENU_CONTEXT_STATE,
  MenuContextAction,
  MenuEventHandler,
  MenuEventType,
} from '@/interfaces/context/menu.interface';
import { menuEventEmitter } from '@/services/menu/MenuEventEmitter';
import { MockMenuManagementService } from '@/services/menu/MockMenuManagementService';
import { menuStorageService } from '@/services/storage';
import { MenuItem, MenuCategory } from '@/types/menu.types';
import {
  CategoryWithStats,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  BulkMenuOperation,
} from '@/types/menu-management.types';
import {
  MenuItemExtended,
  ModifierGroup,
  ModifierOption,
  ComboDeal,
  NutritionalInfo,
  MenuItemModifierAssignment,
  CreateModifierGroupRequest,
  UpdateModifierGroupRequest,
  CreateModifierOptionRequest,
  UpdateModifierOptionRequest,
  CreateComboRequest,
  UpdateComboRequest,
  UpdateNutritionalInfoRequest,
} from '@/types/menu-management-extended.types';

// ============== REDUCER ==============

function menuReducer(
  state: IMenuContextState,
  action: MenuContextAction
): IMenuContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isSyncing: false };

    case 'SET_MENU_DATA':
      return {
        ...state,
        menuItems: action.payload.menuItems,
        categories: action.payload.categories,
        lastUpdated: new Date().toISOString(),
        isLoading: false,
      };

    case 'SET_EXTENDED_DATA':
      return {
        ...state,
        categoriesWithStats: action.payload.categoriesWithStats,
        menuItemsExtended: action.payload.menuItemsExtended,
        modifierGroups: action.payload.modifierGroups,
        combos: action.payload.combos,
        isLoading: false,
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
        categoriesWithStats: [...state.categoriesWithStats, action.payload],
      };

    case 'UPDATE_CATEGORY': {
      const updateCat = (cat: MenuCategory) =>
        cat.id === action.payload.id ? { ...cat, ...action.payload.data } : cat;
      return {
        ...state,
        categories: state.categories.map(updateCat),
        categoriesWithStats: state.categoriesWithStats.map(
          updateCat as (cat: CategoryWithStats) => CategoryWithStats
        ),
      };
    }

    case 'REMOVE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        categoriesWithStats: state.categoriesWithStats.filter(
          (c) => c.id !== action.payload
        ),
        menuItems: state.menuItems.filter((i) => i.category_id !== action.payload),
        menuItemsExtended: state.menuItemsExtended.filter(
          (i) => i.category_id !== action.payload
        ),
      };

    case 'REORDER_CATEGORIES': {
      const orderMap = new Map(action.payload.map((id, index) => [id, index]));
      const sortedCategories = [...state.categories].sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      );
      const sortedCategoriesWithStats = [...state.categoriesWithStats].sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      );
      return {
        ...state,
        categories: sortedCategories,
        categoriesWithStats: sortedCategoriesWithStats,
      };
    }

    case 'ADD_ITEM': {
      // Update category stats when adding an item
      const newItemCategoryId = action.payload.category_id;
      const updatedCategoriesAfterAdd = state.categoriesWithStats.map((cat) => {
        if (cat.id === newItemCategoryId) {
          return {
            ...cat,
            stats: {
              ...cat.stats,
              itemCount: (cat.stats?.itemCount || 0) + 1,
            },
          };
        }
        return cat;
      });
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload],
        menuItemsExtended: [...state.menuItemsExtended, action.payload],
        categoriesWithStats: updatedCategoriesAfterAdd,
      };
    }

    case 'UPDATE_ITEM': {
      const updateItem = (item: MenuItem) =>
        item.id === action.payload.id ? { ...item, ...action.payload.data } : item;

      // Check if category is being changed
      const existingItem = state.menuItemsExtended.find((i) => i.id === action.payload.id);
      const oldCategoryId = existingItem?.category_id;
      const newCategoryId = action.payload.data.category_id;
      const isCategoryChange = newCategoryId && newCategoryId !== oldCategoryId;

      // Update category stats if category changed
      let updatedCategoriesAfterUpdate = state.categoriesWithStats;
      if (isCategoryChange) {
        updatedCategoriesAfterUpdate = state.categoriesWithStats.map((cat) => {
          if (cat.id === oldCategoryId) {
            // Decrement old category count
            return {
              ...cat,
              stats: {
                ...cat.stats,
                itemCount: Math.max(0, (cat.stats?.itemCount || 0) - 1),
              },
            };
          }
          if (cat.id === newCategoryId) {
            // Increment new category count
            return {
              ...cat,
              stats: {
                ...cat.stats,
                itemCount: (cat.stats?.itemCount || 0) + 1,
              },
            };
          }
          return cat;
        });
      }

      return {
        ...state,
        menuItems: state.menuItems.map(updateItem),
        menuItemsExtended: state.menuItemsExtended.map(
          updateItem as (item: MenuItemExtended) => MenuItemExtended
        ),
        categoriesWithStats: updatedCategoriesAfterUpdate,
      };
    }

    case 'REMOVE_ITEM': {
      // Find the item being removed to get its category
      const removedItem = state.menuItemsExtended.find((i) => i.id === action.payload);
      const removedItemCategoryId = removedItem?.category_id;

      // Update category stats when removing an item
      const updatedCategoriesAfterRemove = state.categoriesWithStats.map((cat) => {
        if (cat.id === removedItemCategoryId) {
          return {
            ...cat,
            stats: {
              ...cat.stats,
              itemCount: Math.max(0, (cat.stats?.itemCount || 0) - 1),
            },
          };
        }
        return cat;
      });

      return {
        ...state,
        menuItems: state.menuItems.filter((i) => i.id !== action.payload),
        menuItemsExtended: state.menuItemsExtended.filter(
          (i) => i.id !== action.payload
        ),
        categoriesWithStats: updatedCategoriesAfterRemove,
      };
    }

    case 'ADD_MODIFIER_GROUP':
      return {
        ...state,
        modifierGroups: [...state.modifierGroups, action.payload],
      };

    case 'UPDATE_MODIFIER_GROUP': {
      return {
        ...state,
        modifierGroups: state.modifierGroups.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload.data } : g
        ),
      };
    }

    case 'REMOVE_MODIFIER_GROUP':
      return {
        ...state,
        modifierGroups: state.modifierGroups.filter((g) => g.id !== action.payload),
      };

    case 'ADD_COMBO':
      return {
        ...state,
        combos: [...state.combos, action.payload],
      };

    case 'UPDATE_COMBO': {
      return {
        ...state,
        combos: state.combos.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c
        ),
      };
    }

    case 'REMOVE_COMBO':
      return {
        ...state,
        combos: state.combos.filter((c) => c.id !== action.payload),
      };

    case 'SET_EDITING':
      return {
        ...state,
        isBeingEdited: action.payload.isEditing,
        editingBy: action.payload.by || null,
      };

    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.payload,
      };

    default:
      return state;
  }
}

// ============== CONTEXT ==============

const MenuContext = createContext<IMenuContext | undefined>(undefined);

// ============== PROVIDER ==============

interface MenuProviderProps {
  children: React.ReactNode;
  restaurantId?: string;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({
  children,
  restaurantId = 'rest_001',
}) => {
  const [state, dispatch] = useReducer(menuReducer, INITIAL_MENU_CONTEXT_STATE);
  const menuService = useMemo(() => MockMenuManagementService.getInstance(), []);

  // Flag to use local storage vs API (set to false when backend is ready)
  const useLocalStorage = true;

  // ============== EVENT EMISSION HELPER ==============

  const emitEvent = useCallback(
    (type: MenuEventType, payload: Record<string, unknown>) => {
      menuEventEmitter.emitEvent(type, payload);
    },
    []
  );

  // ============== STATS RECALCULATION HELPER ==============

  const recalculateCategoryStats = useCallback(
    (categories: CategoryWithStats[], items: MenuItemExtended[]): CategoryWithStats[] => {
      // Count items per category
      const itemCountByCategory = new Map<string, number>();
      items.forEach((item) => {
        const count = itemCountByCategory.get(item.category_id) || 0;
        itemCountByCategory.set(item.category_id, count + 1);
      });

      // Update each category's stats with actual item count
      return categories.map((cat) => ({
        ...cat,
        stats: {
          ...cat.stats,
          itemCount: itemCountByCategory.get(cat.id) || 0,
        },
      }));
    },
    []
  );

  // ============== PERSISTENCE HELPER ==============

  const persistToStorage = useCallback(async () => {
    if (!useLocalStorage) return;

    await menuStorageService.saveMenuData({
      categories: state.categoriesWithStats,
      menuItems: state.menuItemsExtended,
      modifierGroups: state.modifierGroups,
      combos: state.combos,
      lastUpdated: new Date().toISOString(),
      restaurantId,
    });
  }, [state.categoriesWithStats, state.menuItemsExtended, state.modifierGroups, state.combos, restaurantId, useLocalStorage]);

  // ============== REFRESH ==============

  const refreshMenu = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // First try to load from local storage
      if (useLocalStorage) {
        await menuStorageService.initialize(restaurantId); // ensure DB ready first
        const storedData = await menuStorageService.getMenuData(restaurantId);
        if (storedData && storedData.categories.length > 0 && storedData.menuItems.length > 0) {
          // Convert stored items to base menu items
          const menuItems: MenuItem[] = storedData.menuItems.map((item) => ({
            id: item.id,
            restaurant_id: item.restaurant_id,
            category_id: item.category_id,
            name: item.name,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            is_available: item.is_available,
            preparation_time_minutes: item.preparation_time_minutes,
            dietary_info: item.dietary_info,
            ingredients: item.ingredients,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));

          const categories: MenuCategory[] = storedData.categories.map((c) => ({
            id: c.id,
            restaurant_id: c.restaurant_id,
            name: c.name,
            description: c.description,
            sort_order: c.sort_order,
            is_active: c.is_active,
            created_at: c.created_at,
            updated_at: c.updated_at,
          }));

          dispatch({
            type: 'SET_MENU_DATA',
            payload: { menuItems, categories },
          });

          // Recalculate category stats based on actual items
          const categoriesWithCorrectStats = recalculateCategoryStats(
            storedData.categories,
            storedData.menuItems
          );

          // ALWAYS populate modifier_groups from current modifierGroups data
          // This ensures we get the latest options (not stale stored versions)
          const menuItemsWithModifiers = storedData.menuItems.map(item => {
            // Get modifier group IDs from either modifier_assignments or existing modifier_groups
            let modifierGroupIds: string[] = [];

            if (item.modifier_assignments && item.modifier_assignments.length > 0) {
              // Prefer modifier_assignments as the source of truth
              modifierGroupIds = item.modifier_assignments.map(a => a.modifier_group_id);
            } else if (item.modifier_groups && item.modifier_groups.length > 0) {
              // Fallback to existing modifier_groups IDs
              modifierGroupIds = item.modifier_groups.map(g => g.id);
            }

            // Always look up fresh modifier groups with current options
            const itemModifiers = modifierGroupIds
              .map(groupId => storedData.modifierGroups.find(g => g.id === groupId))
              .filter((g): g is ModifierGroup => g !== undefined);

            return {
              ...item,
              modifier_groups: itemModifiers,
            };
          });

          dispatch({
            type: 'SET_EXTENDED_DATA',
            payload: {
              categoriesWithStats: categoriesWithCorrectStats,
              menuItemsExtended: menuItemsWithModifiers,
              modifierGroups: storedData.modifierGroups,
              combos: storedData.combos,
            },
          });

          // Debug: Log modifier groups with their options count
          const modifierGroupsWithOptions = storedData.modifierGroups.filter(g => g.options && g.options.length > 0);
          const itemsWithModifiersAndOptions = menuItemsWithModifiers.filter(item =>
            item.modifier_groups?.some(g => g.options && g.options.length > 0)
          );

          if (__DEV__) {
            console.log(`[Menu] Loaded: ${categoriesWithCorrectStats.length} cats, ${menuItemsWithModifiers.length} items, ${modifierGroupsWithOptions.length} mod groups`);
          }

          emitEvent('MENU_REFRESHED', {});
          return;
        }
      }

      // No storage data — re-initialize which triggers mock data seeding
      await menuStorageService.initialize(restaurantId);
      const seededData = await menuStorageService.getMenuData(restaurantId);
      if (seededData && seededData.menuItems.length > 0) {
        const menuItems: MenuItem[] = seededData.menuItems.map((item) => ({
          id: item.id, restaurant_id: item.restaurant_id, category_id: item.category_id,
          name: item.name, description: item.description, price: item.price,
          image_url: item.image_url, is_available: item.is_available,
          preparation_time_minutes: item.preparation_time_minutes,
          dietary_info: item.dietary_info, ingredients: item.ingredients,
          created_at: item.created_at, updated_at: item.updated_at,
        }));
        const categories: MenuCategory[] = seededData.categories.map((c) => ({
          id: c.id, restaurant_id: c.restaurant_id, name: c.name,
          description: c.description, sort_order: c.sort_order,
          is_active: c.is_active, created_at: c.created_at, updated_at: c.updated_at,
        }));
        dispatch({ type: 'SET_MENU_DATA', payload: { menuItems, categories } });
        dispatch({
          type: 'SET_EXTENDED_DATA',
          payload: {
            categoriesWithStats: seededData.categories,
            menuItemsExtended: seededData.menuItems,
            modifierGroups: seededData.modifierGroups,
            combos: seededData.combos,
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      emitEvent('MENU_REFRESHED', {});
    } catch (error) {
      if (__DEV__) {
        console.error('[MenuContext] refreshMenu failed:', error);
      }
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load menu',
      });
    }
  }, [restaurantId, emitEvent, useLocalStorage, recalculateCategoryStats]);

  // ============== INITIAL LOAD ==============

  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  // ============== SYNC COMPLETE LISTENER ==============
  // Re-read from SQLite when PullSyncService writes new data
  useEffect(() => {
    const unsubscribe = menuEventEmitter.subscribe((event) => {
      if (event.type === 'MENU_SYNC_COMPLETE') {
        refreshMenu();
      }
    });
    return unsubscribe;
  }, [refreshMenu]);

  // ============== AUTO-PERSIST ON STATE CHANGE ==============
  // Persist to storage whenever menu data changes (debounced)
  // Guards against overwriting complete SQLite data with partial in-memory state
  useEffect(() => {
    // Skip initial empty state
    if (state.categoriesWithStats.length === 0 && state.menuItemsExtended.length === 0) {
      return;
    }

    // Debounce persistence to avoid too many writes
    const timeoutId = setTimeout(async () => {
      try {
        const storageInfo = await menuStorageService.getStorageInfo();
        const memCategories = state.categoriesWithStats.length;
        const memItems = state.menuItemsExtended.length;

        // Don't overwrite if we'd lose data (partial state from race condition)
        if (memCategories < storageInfo.categoriesCount || memItems < storageInfo.itemsCount) {
          if (__DEV__) {
            console.warn(
              `[MenuContext] Skipping auto-persist — would lose data. ` +
              `Memory: ${memCategories} cats, ${memItems} items. ` +
              `Storage: ${storageInfo.categoriesCount} cats, ${storageInfo.itemsCount} items.`
            );
          }
          return;
        }

        persistToStorage();
      } catch {
        // Storage check failed — skip persist to be safe
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.categoriesWithStats, state.menuItemsExtended, state.modifierGroups, state.combos, persistToStorage]);

  // ============== SYNC MODIFIER GROUPS TO MENU ITEMS ==============
  // When modifierGroups changes (options added/removed), re-populate modifier_groups on menu items
  // This ensures menu items always have the latest modifier groups with current options
  const lastModifierGroupsRef = React.useRef<string>('');

  useEffect(() => {
    // Create a signature of current modifier groups (id + options count)
    const currentSignature = state.modifierGroups
      .map(g => `${g.id}:${g.options?.length || 0}`)
      .join(',');

    // Skip if nothing changed
    if (currentSignature === lastModifierGroupsRef.current) {
      return;
    }
    lastModifierGroupsRef.current = currentSignature;

    if (state.modifierGroups.length === 0 || state.menuItemsExtended.length === 0) {
      return;
    }

    // Re-populate modifier_groups from current modifierGroups
    const updatedMenuItems = state.menuItemsExtended.map(item => {
      // Get modifier group IDs from assignments or existing groups
      let modifierGroupIds: string[] = [];
      if (item.modifier_assignments && item.modifier_assignments.length > 0) {
        modifierGroupIds = item.modifier_assignments.map(a => a.modifier_group_id);
      } else if (item.modifier_groups && item.modifier_groups.length > 0) {
        modifierGroupIds = item.modifier_groups.map(g => g.id);
      }

      if (modifierGroupIds.length === 0) {
        return item;
      }

      // Look up fresh modifier groups with current options
      const freshModifierGroups = modifierGroupIds
        .map(groupId => state.modifierGroups.find(g => g.id === groupId))
        .filter((g): g is ModifierGroup => g !== undefined);

      return {
        ...item,
        modifier_groups: freshModifierGroups,
      };
    });

    // Only dispatch if there are actual changes
    const hasChanges = updatedMenuItems.some((item, index) => {
      const original = state.menuItemsExtended[index];
      const originalOptionsCount = original.modifier_groups?.reduce((sum, g) => sum + (g.options?.length || 0), 0) || 0;
      const updatedOptionsCount = item.modifier_groups?.reduce((sum, g) => sum + (g.options?.length || 0), 0) || 0;
      return originalOptionsCount !== updatedOptionsCount;
    });

    if (hasChanges) {
      dispatch({
        type: 'SET_EXTENDED_DATA',
        payload: {
          categoriesWithStats: state.categoriesWithStats,
          menuItemsExtended: updatedMenuItems,
          modifierGroups: state.modifierGroups,
          combos: state.combos,
        },
      });

      if (__DEV__) {
        const itemsWithOptions = updatedMenuItems.filter(item =>
          item.modifier_groups?.some(g => g.options && g.options.length > 0)
        );
        console.log(`[MenuContext] Synced modifier_groups on menu items. Items with options: ${itemsWithOptions.length}`);
      }
    }
  }, [state.modifierGroups, state.menuItemsExtended, state.categoriesWithStats, state.combos]);

  // ============== GETTERS ==============

  const getItemById = useCallback(
    (itemId: string) => state.menuItems.find((item) => item.id === itemId),
    [state.menuItems]
  );

  const getCategoryById = useCallback(
    (categoryId: string) => state.categories.find((cat) => cat.id === categoryId),
    [state.categories]
  );

  const getModifierGroupById = useCallback(
    (groupId: string) => state.modifierGroups.find((g) => g.id === groupId),
    [state.modifierGroups]
  );

  const getComboById = useCallback(
    (comboId: string) => state.combos.find((c) => c.id === comboId),
    [state.combos]
  );

  // ============== CATEGORY CRUD ==============

  const createCategory = useCallback(
    async (data: CreateCategoryRequest): Promise<CategoryWithStats> => {
      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        const newCategory = await menuService.createCategory(data);
        dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        emitEvent('CATEGORY_CREATED', {
          categoryId: newCategory.id,
          newValue: newCategory,
        });
        return newCategory;
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    },
    [menuService, emitEvent]
  );

  const updateCategory = useCallback(
    async (id: string, data: UpdateCategoryRequest): Promise<CategoryWithStats> => {
      const previousCategory = state.categoriesWithStats.find((c) => c.id === id);
      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        const updated = await menuService.updateCategory(id, data);
        dispatch({ type: 'UPDATE_CATEGORY', payload: { id, data: updated } });
        emitEvent('CATEGORY_UPDATED', {
          categoryId: id,
          previousValue: previousCategory,
          newValue: updated,
        });
        return updated;
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    },
    [state.categoriesWithStats, menuService, emitEvent]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      const previousCategory = state.categoriesWithStats.find((c) => c.id === id);
      const affectedItems = state.menuItems
        .filter((i) => i.category_id === id)
        .map((i) => i.id);

      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        await menuService.deleteCategory(id);
        dispatch({ type: 'REMOVE_CATEGORY', payload: id });
        emitEvent('CATEGORY_DELETED', {
          categoryId: id,
          previousValue: previousCategory,
          affectedItemIds: affectedItems,
        });
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    },
    [state.categoriesWithStats, state.menuItems, menuService, emitEvent]
  );

  const toggleCategoryStatus = useCallback(
    async (id: string): Promise<void> => {
      const category = state.categoriesWithStats.find((c) => c.id === id);
      if (category) {
        await updateCategory(id, { is_active: !category.is_active });
        emitEvent('CATEGORY_TOGGLED', {
          categoryId: id,
          previousValue: { is_active: category.is_active },
          newValue: { is_active: !category.is_active },
        });
      }
    },
    [state.categoriesWithStats, updateCategory, emitEvent]
  );

  const reorderCategories = useCallback(
    async (orderedIds: string[]): Promise<void> => {
      dispatch({ type: 'REORDER_CATEGORIES', payload: orderedIds });
      emitEvent('CATEGORY_REORDERED', { newValue: orderedIds });
    },
    [emitEvent]
  );

  // ============== MENU ITEM CRUD ==============

  const createMenuItem = useCallback(
    async (data: CreateMenuItemRequest): Promise<MenuItemExtended> => {
      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        const newItem = await menuService.createMenuItem(data);

        // Create modifier assignments from modifier_group_ids if provided
        const modifierAssignments: MenuItemModifierAssignment[] = (data.modifier_group_ids || []).map(
          (groupId, index) => ({
            id: `ma_${newItem.id}_${groupId}`,
            menu_item_id: newItem.id,
            modifier_group_id: groupId,
            sort_order: index,
            created_at: new Date().toISOString(),
          })
        );

        // Get the actual modifier groups for display
        const assignedModifierGroups = state.modifierGroups.filter(
          (g) => data.modifier_group_ids?.includes(g.id)
        );

        const extendedItem: MenuItemExtended = {
          ...newItem,
          modifier_assignments: modifierAssignments,
          modifier_groups: assignedModifierGroups,
          combo_memberships: [],
        };
        dispatch({ type: 'ADD_ITEM', payload: extendedItem });
        emitEvent('ITEM_CREATED', {
          itemId: newItem.id,
          categoryId: newItem.category_id,
          newValue: extendedItem,
        });
        return extendedItem;
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    },
    [menuService, state.modifierGroups, emitEvent]
  );

  const updateMenuItem = useCallback(
    async (id: string, data: UpdateMenuItemRequest): Promise<MenuItemExtended> => {
      const previousItem = state.menuItemsExtended.find((i) => i.id === id);
      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        // Handle modifier_group_ids if provided
        let modifierAssignments = previousItem?.modifier_assignments || [];
        let modifierGroups = previousItem?.modifier_groups || [];

        if (data.modifier_group_ids !== undefined) {
          // Create new modifier assignments
          modifierAssignments = data.modifier_group_ids.map((groupId, index) => ({
            id: `ma_${id}_${groupId}`,
            menu_item_id: id,
            modifier_group_id: groupId,
            sort_order: index,
            created_at: new Date().toISOString(),
          }));

          // Get the actual modifier groups for display
          modifierGroups = state.modifierGroups.filter(
            (g) => data.modifier_group_ids?.includes(g.id)
          );
        }

        const updatedData: MenuItemExtended = {
          ...previousItem,
          ...data,
          modifier_assignments: modifierAssignments,
          modifier_groups: modifierGroups,
          updated_at: new Date().toISOString(),
        } as MenuItemExtended;

        dispatch({ type: 'UPDATE_ITEM', payload: { id, data: updatedData } });

        // Determine event type
        let eventType: MenuEventType = 'ITEM_UPDATED';
        if (data.price !== undefined && data.price !== previousItem?.price) {
          eventType = 'ITEM_PRICE_CHANGED';
        } else if (
          data.is_available !== undefined &&
          data.is_available !== previousItem?.is_available
        ) {
          eventType = 'ITEM_AVAILABILITY_CHANGED';
        } else if (
          data.category_id !== undefined &&
          data.category_id !== previousItem?.category_id
        ) {
          eventType = 'ITEM_CATEGORY_CHANGED';
        }

        emitEvent(eventType, {
          itemId: id,
          categoryId: previousItem?.category_id,
          previousValue: previousItem,
          newValue: updatedData,
        });

        return updatedData;
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    },
    [state.menuItemsExtended, state.modifierGroups, emitEvent]
  );

  const deleteMenuItem = useCallback(
    async (id: string): Promise<void> => {
      const previousItem = state.menuItemsExtended.find((i) => i.id === id);
      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
        emitEvent('ITEM_DELETED', {
          itemId: id,
          categoryId: previousItem?.category_id,
          previousValue: previousItem,
        });
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    },
    [state.menuItemsExtended, emitEvent]
  );

  const toggleItemAvailability = useCallback(
    async (id: string): Promise<void> => {
      const item = state.menuItemsExtended.find((i) => i.id === id);
      if (item) {
        await updateMenuItem(id, { is_available: !item.is_available });
      }
    },
    [state.menuItemsExtended, updateMenuItem]
  );

  const updateItemPrice = useCallback(
    async (id: string, newPrice: number): Promise<void> => {
      await updateMenuItem(id, { price: newPrice });
    },
    [updateMenuItem]
  );

  const changeItemCategory = useCallback(
    async (itemId: string, newCategoryId: string): Promise<void> => {
      await updateMenuItem(itemId, { category_id: newCategoryId });
    },
    [updateMenuItem]
  );

  // ============== MODIFIER CRUD (PLACEHOLDER) ==============

  const createModifierGroup = useCallback(
    async (data: CreateModifierGroupRequest): Promise<ModifierGroup> => {
      const newGroup: ModifierGroup = {
        id: `mod_${Date.now()}`,
        ...data,
        is_active: true,
        sort_order: state.modifierGroups.length,
        options: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MODIFIER_GROUP', payload: newGroup });
      emitEvent('MODIFIER_GROUP_CREATED', { modifierGroupId: newGroup.id, newValue: newGroup });

      // CRITICAL: Force immediate persistence to storage
      const updatedModifierGroups = [...state.modifierGroups, newGroup];
      await menuStorageService.saveModifierGroups(updatedModifierGroups);

      if (__DEV__) {
        console.log(`[MenuContext] Created modifier group "${newGroup.name}", saved to storage`);
      }

      return newGroup;
    },
    [state.modifierGroups, emitEvent]
  );

  const updateModifierGroup = useCallback(
    async (id: string, data: UpdateModifierGroupRequest): Promise<ModifierGroup> => {
      const previousGroup = state.modifierGroups.find((g) => g.id === id);
      const updated = { ...previousGroup, ...data, updated_at: new Date().toISOString() };
      dispatch({ type: 'UPDATE_MODIFIER_GROUP', payload: { id, data: updated } });
      emitEvent('MODIFIER_GROUP_UPDATED', { modifierGroupId: id, previousValue: previousGroup, newValue: updated });

      // CRITICAL: Force immediate persistence to storage
      const updatedModifierGroups = state.modifierGroups.map(g =>
        g.id === id ? (updated as ModifierGroup) : g
      );
      await menuStorageService.saveModifierGroups(updatedModifierGroups);

      if (__DEV__) {
        console.log(`[MenuContext] Updated modifier group "${updated.name}", saved to storage`);
      }
      return updated as ModifierGroup;
    },
    [state.modifierGroups, emitEvent]
  );

  const deleteModifierGroup = useCallback(
    async (id: string): Promise<void> => {
      await menuStorageService.deleteModifierGroup(id);
      dispatch({ type: 'REMOVE_MODIFIER_GROUP', payload: id });
      emitEvent('MODIFIER_GROUP_DELETED', { modifierGroupId: id });
    },
    [emitEvent]
  );

  const addModifierOption = useCallback(
    async (groupId: string, option: CreateModifierOptionRequest): Promise<ModifierOption> => {
      const newOption: ModifierOption = {
        id: `opt_${Date.now()}`,
        ...option,
        is_available: option.is_available ?? true,
        is_default: option.is_default ?? false,
        sort_order: option.sort_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const group = state.modifierGroups.find((g) => g.id === groupId);
      if (group) {
        const updatedGroup = { ...group, options: [...group.options, newOption] };
        dispatch({ type: 'UPDATE_MODIFIER_GROUP', payload: { id: groupId, data: updatedGroup } });
        emitEvent('MODIFIER_OPTION_ADDED', { modifierGroupId: groupId, modifierOptionId: newOption.id });

        // CRITICAL: Force immediate persistence to storage
        // Don't rely on auto-persist debounce - save modifier groups with options NOW
        const updatedModifierGroups = state.modifierGroups.map(g =>
          g.id === groupId ? updatedGroup : g
        );
        await menuStorageService.saveModifierGroups(updatedModifierGroups);

        if (__DEV__) {
          console.log(`[MenuContext] Added option "${newOption.name}" to group "${group.name}", saved to storage`);
        }
      }
      return newOption;
    },
    [state.modifierGroups, emitEvent]
  );

  const updateModifierOption = useCallback(
    async (optionId: string, data: UpdateModifierOptionRequest): Promise<ModifierOption> => {
      // Find the group containing this option
      for (const group of state.modifierGroups) {
        const optionIndex = group.options.findIndex((o) => o.id === optionId);
        if (optionIndex !== -1) {
          const updatedOptions = [...group.options];
          updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], ...data };
          dispatch({ type: 'UPDATE_MODIFIER_GROUP', payload: { id: group.id, data: { options: updatedOptions } } });
          emitEvent('MODIFIER_OPTION_UPDATED', { modifierOptionId: optionId });
          return updatedOptions[optionIndex];
        }
      }
      throw new Error('Option not found');
    },
    [state.modifierGroups, emitEvent]
  );

  const removeModifierOption = useCallback(
    async (optionId: string): Promise<void> => {
      for (const group of state.modifierGroups) {
        const optionIndex = group.options.findIndex((o) => o.id === optionId);
        if (optionIndex !== -1) {
          const updatedOptions = group.options.filter((o) => o.id !== optionId);
          dispatch({ type: 'UPDATE_MODIFIER_GROUP', payload: { id: group.id, data: { options: updatedOptions } } });
          emitEvent('MODIFIER_OPTION_REMOVED', { modifierOptionId: optionId, modifierGroupId: group.id });
          return;
        }
      }
    },
    [state.modifierGroups, emitEvent]
  );

  const assignModifierToItems = useCallback(
    async (groupId: string, itemIds: string[]): Promise<void> => {
      emitEvent('MODIFIER_ASSIGNED', { modifierGroupId: groupId, affectedItemIds: itemIds });
    },
    [emitEvent]
  );

  const unassignModifierFromItems = useCallback(
    async (groupId: string, itemIds: string[]): Promise<void> => {
      emitEvent('MODIFIER_UNASSIGNED', { modifierGroupId: groupId, affectedItemIds: itemIds });
    },
    [emitEvent]
  );

  // ============== RELOAD EXTENDED DATA ==============
  // Reloads menu data from storage after modifications
  const loadExtendedMenuData = useCallback(async () => {
    try {
      const storedData = await menuStorageService.getMenuData(restaurantId);
      if (storedData) {
        // Recalculate category stats based on actual items
        const categoriesWithCorrectStats = recalculateCategoryStats(
          storedData.categories,
          storedData.menuItems
        );

        // ALWAYS populate modifier_groups from current modifierGroups data
        // This ensures we get the latest options (not stale stored versions)
        const menuItemsWithModifiers = storedData.menuItems.map(item => {
          // Get modifier group IDs from either modifier_assignments or existing modifier_groups
          let modifierGroupIds: string[] = [];

          if (item.modifier_assignments && item.modifier_assignments.length > 0) {
            // Prefer modifier_assignments as the source of truth
            modifierGroupIds = item.modifier_assignments.map(a => a.modifier_group_id);
          } else if (item.modifier_groups && item.modifier_groups.length > 0) {
            // Fallback to existing modifier_groups IDs
            modifierGroupIds = item.modifier_groups.map(g => g.id);
          }

          // Always look up fresh modifier groups with current options
          const itemModifiers = modifierGroupIds
            .map(groupId => storedData.modifierGroups.find(g => g.id === groupId))
            .filter((g): g is ModifierGroup => g !== undefined);

          return {
            ...item,
            modifier_groups: itemModifiers,
          };
        });

        dispatch({
          type: 'SET_EXTENDED_DATA',
          payload: {
            categoriesWithStats: categoriesWithCorrectStats,
            menuItemsExtended: menuItemsWithModifiers,
            modifierGroups: storedData.modifierGroups,
            combos: storedData.combos,
          },
        });

        if (__DEV__) {
          console.log('[MenuContext] Reloaded extended menu data from storage');
          console.log('[MenuContext] Menu items with modifiers:', menuItemsWithModifiers.filter(i => i.modifier_groups?.length > 0).length);
        }
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to reload menu data',
      });
    }
  }, [restaurantId, recalculateCategoryStats]);

  const assignModifiersToMenuItem = useCallback(
    async (menuItemId: string, modifierGroupIds: string[]): Promise<void> => {
      // CRITICAL: Force persist current state BEFORE assigning modifiers
      // This ensures modifier groups with their options are saved to storage
      // before assignModifiersToMenuItem reads them from storage
      await persistToStorage();

      // Use menuStorageService to update the assignments
      await menuStorageService.assignModifiersToMenuItem(menuItemId, modifierGroupIds);

      // Reload the extended menu data to reflect the changes
      await loadExtendedMenuData();

      // Emit event for real-time updates
      emitEvent('MODIFIERS_ASSIGNED', { menuItemId, modifierGroupIds });
    },
    [emitEvent, loadExtendedMenuData, persistToStorage]
  );

  // ============== COMBO CRUD ==============

  const createCombo = useCallback(
    async (data: CreateComboRequest): Promise<ComboDeal> => {
      const comboId = `combo_${Date.now()}`;

      // Convert CreateComboItemRequest[] to ComboItem[] with proper IDs
      const comboItems = data.combo_items.map((item, index) => ({
        id: `combo_item_${comboId}_${index}`,
        combo_id: comboId,
        menu_item_id: item.menu_item_id,
        category_choice: item.category_choice,
        quantity: item.quantity,
        is_substitutable: item.is_substitutable,
        substitution_options: item.substitution_options || [],
        price_override: item.price_override,
        item_category: item.item_category,
        sort_order: index,
      }));

      // Calculate regular price from selected items
      const regularPrice = comboItems.reduce((total, item) => {
        if (item.menu_item_id) {
          const menuItem = state.menuItemsExtended.find(mi => mi.id === item.menu_item_id);
          return total + (menuItem?.price || 0) * item.quantity;
        }
        return total;
      }, 0);

      const newCombo: ComboDeal = {
        id: comboId,
        restaurant_id: data.restaurant_id,
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        combo_items: comboItems,
        regular_price: regularPrice,
        combo_price: data.combo_price,
        savings_amount: regularPrice - data.combo_price,
        savings_percentage: regularPrice > 0 ? ((regularPrice - data.combo_price) / regularPrice) * 100 : 0,
        availability: data.availability,
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_COMBO', payload: newCombo });
      emitEvent('COMBO_CREATED', { comboId: newCombo.id, newValue: newCombo });
      return newCombo;
    },
    [state.menuItemsExtended, emitEvent]
  );

  const updateCombo = useCallback(
    async (id: string, data: UpdateComboRequest): Promise<ComboDeal> => {
      const previousCombo = state.combos.find((c) => c.id === id);
      const updated = { ...previousCombo, ...data, updated_at: new Date().toISOString() };
      dispatch({ type: 'UPDATE_COMBO', payload: { id, data: updated as Partial<ComboDeal> } });
      emitEvent('COMBO_UPDATED', { comboId: id, previousValue: previousCombo, newValue: updated });
      return updated as ComboDeal;
    },
    [state.combos, emitEvent]
  );

  const deleteCombo = useCallback(
    async (id: string): Promise<void> => {
      dispatch({ type: 'REMOVE_COMBO', payload: id });
      emitEvent('COMBO_DELETED', { comboId: id });
    },
    [emitEvent]
  );

  const toggleComboStatus = useCallback(
    async (id: string): Promise<void> => {
      const combo = state.combos.find((c) => c.id === id);
      if (combo) {
        await updateCombo(id, { is_active: !combo.is_active });
        emitEvent('COMBO_TOGGLED', { comboId: id });
      }
    },
    [state.combos, updateCombo, emitEvent]
  );

  // ============== BULK OPERATIONS ==============

  const bulkUpdateItems = useCallback(
    async (operation: BulkMenuOperation): Promise<void> => {
      dispatch({ type: 'SET_SYNCING', payload: true });
      try {
        await menuService.performBulkOperation(operation);
        await refreshMenu();
        emitEvent('BULK_UPDATE', { affectedItemIds: operation.itemIds });
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    },
    [menuService, refreshMenu, emitEvent]
  );

  const bulkDeleteItems = useCallback(
    async (itemIds: string[]): Promise<void> => {
      for (const id of itemIds) {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
      }
      emitEvent('BULK_UPDATE', { affectedItemIds: itemIds });
    },
    [emitEvent]
  );

  const bulkToggleAvailability = useCallback(
    async (itemIds: string[], available: boolean): Promise<void> => {
      for (const id of itemIds) {
        dispatch({
          type: 'UPDATE_ITEM',
          payload: { id, data: { is_available: available } },
        });
      }
      emitEvent('BULK_UPDATE', { affectedItemIds: itemIds });
    },
    [emitEvent]
  );

  // ============== NUTRITIONAL INFO ==============

  const updateNutritionalInfo = useCallback(
    async (itemId: string, data: UpdateNutritionalInfoRequest): Promise<NutritionalInfo> => {
      const nutritionalInfo: NutritionalInfo = {
        id: `nutr_${itemId}`,
        menu_item_id: itemId,
        nutritional_facts: {
          serving_size: '',
          calories: 0,
          ...data.nutritional_facts,
        },
        allergens: data.allergens || [],
        dietary_tags: data.dietary_tags || [],
        contains_warning: data.contains_warning,
        preparation_notes: data.preparation_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      emitEvent('NUTRITIONAL_INFO_UPDATED', { itemId, newValue: nutritionalInfo });
      return nutritionalInfo;
    },
    [emitEvent]
  );

  // ============== EDIT MODE ==============

  const startEditing = useCallback(() => {
    dispatch({ type: 'SET_EDITING', payload: { isEditing: true, by: 'current_user' } });
  }, []);

  const stopEditing = useCallback(() => {
    dispatch({ type: 'SET_EDITING', payload: { isEditing: false } });
  }, []);

  // ============== EVENT SUBSCRIPTION ==============

  const subscribe = useCallback((handler: MenuEventHandler) => {
    return menuEventEmitter.subscribe(handler);
  }, []);

  // ============== ERROR HANDLING ==============

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // ============== CONTEXT VALUE ==============

  const contextValue: IMenuContext = useMemo(
    () => ({
      ...state,
      refreshMenu,
      getItemById,
      getCategoryById,
      getModifierGroupById,
      getComboById,
      createCategory,
      updateCategory,
      deleteCategory,
      toggleCategoryStatus,
      reorderCategories,
      createMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleItemAvailability,
      updateItemPrice,
      changeItemCategory,
      createModifierGroup,
      updateModifierGroup,
      deleteModifierGroup,
      addModifierOption,
      updateModifierOption,
      removeModifierOption,
      assignModifierToItems,
      unassignModifierFromItems,
      assignModifiersToMenuItem,
      createCombo,
      updateCombo,
      deleteCombo,
      toggleComboStatus,
      bulkUpdateItems,
      bulkDeleteItems,
      bulkToggleAvailability,
      updateNutritionalInfo,
      startEditing,
      stopEditing,
      subscribe,
      clearError,
    }),
    [
      state,
      refreshMenu,
      getItemById,
      getCategoryById,
      getModifierGroupById,
      getComboById,
      createCategory,
      updateCategory,
      deleteCategory,
      toggleCategoryStatus,
      reorderCategories,
      createMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleItemAvailability,
      updateItemPrice,
      changeItemCategory,
      createModifierGroup,
      updateModifierGroup,
      deleteModifierGroup,
      addModifierOption,
      updateModifierOption,
      removeModifierOption,
      assignModifierToItems,
      unassignModifierFromItems,
      assignModifiersToMenuItem,
      createCombo,
      updateCombo,
      deleteCombo,
      toggleComboStatus,
      bulkUpdateItems,
      bulkDeleteItems,
      bulkToggleAvailability,
      updateNutritionalInfo,
      startEditing,
      stopEditing,
      subscribe,
      clearError,
    ]
  );

  return (
    <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>
  );
};

// ============== HOOK ==============

export const useMenuContext = (): IMenuContext => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within MenuProvider');
  }
  return context;
};

export { MenuContext };
