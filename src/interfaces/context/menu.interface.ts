/**
 * Menu Context Interface
 * Defines the contract for shared menu state and actions
 */

import { MenuItem, MenuCategory } from '@/types/menu.types';
import {
  CategoryWithStats,
  MenuItemWithStats,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  BulkMenuOperation,
} from '@/types/menu-management.types';
import {
  ModifierGroup,
  ModifierOption,
  ComboDeal,
  MenuItemExtended,
  NutritionalInfo,
  CreateModifierGroupRequest,
  UpdateModifierGroupRequest,
  CreateModifierOptionRequest,
  UpdateModifierOptionRequest,
  CreateComboRequest,
  UpdateComboRequest,
  UpdateNutritionalInfoRequest,
} from '@/types/menu-management-extended.types';

// ============== EVENT TYPES ==============

export type MenuEventType =
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'CATEGORY_REORDERED'
  | 'CATEGORY_TOGGLED'
  | 'ITEM_CREATED'
  | 'ITEM_UPDATED'
  | 'ITEM_DELETED'
  | 'ITEM_AVAILABILITY_CHANGED'
  | 'ITEM_PRICE_CHANGED'
  | 'ITEM_CATEGORY_CHANGED'
  | 'MODIFIER_GROUP_CREATED'
  | 'MODIFIER_GROUP_UPDATED'
  | 'MODIFIER_GROUP_DELETED'
  | 'MODIFIER_OPTION_ADDED'
  | 'MODIFIER_OPTION_UPDATED'
  | 'MODIFIER_OPTION_REMOVED'
  | 'MODIFIER_ASSIGNED'
  | 'MODIFIERS_ASSIGNED'
  | 'MODIFIER_UNASSIGNED'
  | 'COMBO_CREATED'
  | 'COMBO_UPDATED'
  | 'COMBO_DELETED'
  | 'COMBO_TOGGLED'
  | 'NUTRITIONAL_INFO_UPDATED'
  | 'MENU_REFRESHED'
  | 'MENU_SYNC_COMPLETE'
  | 'BULK_UPDATE';

export interface MenuEventPayload {
  categoryId?: string;
  itemId?: string;
  modifierGroupId?: string;
  modifierOptionId?: string;
  comboId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  affectedItemIds?: string[];
  timestamp: string;
}

export interface MenuEvent {
  type: MenuEventType;
  payload: MenuEventPayload;
}

export type MenuEventHandler = (event: MenuEvent) => void;

// ============== CONTEXT STATE ==============

export interface IMenuContextState {
  // Core data (consumed by Order screen)
  menuItems: MenuItem[];
  categories: MenuCategory[];

  // Extended data (consumed by Settings/Admin)
  categoriesWithStats: CategoryWithStats[];
  menuItemsExtended: MenuItemExtended[];
  modifierGroups: ModifierGroup[];
  combos: ComboDeal[];

  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Edit mode indicator
  isBeingEdited: boolean;
  editingBy: string | null;
}

// ============== CONTEXT ACTIONS ==============

export interface IMenuContextActions {
  // Refresh
  refreshMenu: () => Promise<void>;

  // Getters
  getItemById: (itemId: string) => MenuItem | undefined;
  getCategoryById: (categoryId: string) => MenuCategory | undefined;
  getModifierGroupById: (groupId: string) => ModifierGroup | undefined;
  getComboById: (comboId: string) => ComboDeal | undefined;

  // Category CRUD
  createCategory: (data: CreateCategoryRequest) => Promise<CategoryWithStats>;
  updateCategory: (id: string, data: UpdateCategoryRequest) => Promise<CategoryWithStats>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;
  reorderCategories: (orderedIds: string[]) => Promise<void>;

  // Menu Item CRUD
  createMenuItem: (data: CreateMenuItemRequest) => Promise<MenuItemExtended>;
  updateMenuItem: (id: string, data: UpdateMenuItemRequest) => Promise<MenuItemExtended>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;
  updateItemPrice: (id: string, newPrice: number) => Promise<void>;
  changeItemCategory: (itemId: string, newCategoryId: string) => Promise<void>;

  // Modifier CRUD
  createModifierGroup: (data: CreateModifierGroupRequest) => Promise<ModifierGroup>;
  updateModifierGroup: (id: string, data: UpdateModifierGroupRequest) => Promise<ModifierGroup>;
  deleteModifierGroup: (id: string) => Promise<void>;
  addModifierOption: (groupId: string, option: CreateModifierOptionRequest) => Promise<ModifierOption>;
  updateModifierOption: (optionId: string, data: UpdateModifierOptionRequest) => Promise<ModifierOption>;
  removeModifierOption: (optionId: string) => Promise<void>;
  assignModifierToItems: (groupId: string, itemIds: string[]) => Promise<void>;
  unassignModifierFromItems: (groupId: string, itemIds: string[]) => Promise<void>;
  assignModifiersToMenuItem: (menuItemId: string, modifierGroupIds: string[]) => Promise<void>;

  // Combo CRUD
  createCombo: (data: CreateComboRequest) => Promise<ComboDeal>;
  updateCombo: (id: string, data: UpdateComboRequest) => Promise<ComboDeal>;
  deleteCombo: (id: string) => Promise<void>;
  toggleComboStatus: (id: string) => Promise<void>;

  // Bulk Operations
  bulkUpdateItems: (operation: BulkMenuOperation) => Promise<void>;
  bulkDeleteItems: (itemIds: string[]) => Promise<void>;
  bulkToggleAvailability: (itemIds: string[], available: boolean) => Promise<void>;

  // Nutritional Info
  updateNutritionalInfo: (itemId: string, data: UpdateNutritionalInfoRequest) => Promise<NutritionalInfo>;

  // Edit Mode
  startEditing: () => void;
  stopEditing: () => void;

  // Event Subscription
  subscribe: (handler: MenuEventHandler) => () => void;

  // Error Handling
  clearError: () => void;
}

// ============== FULL CONTEXT ==============

export interface IMenuContext extends IMenuContextState, IMenuContextActions {}

// ============== INITIAL STATE ==============

export const INITIAL_MENU_CONTEXT_STATE: IMenuContextState = {
  menuItems: [],
  categories: [],
  categoriesWithStats: [],
  menuItemsExtended: [],
  modifierGroups: [],
  combos: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  lastUpdated: null,
  isBeingEdited: false,
  editingBy: null,
};

// ============== REDUCER ACTIONS ==============

export type MenuContextAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MENU_DATA'; payload: { menuItems: MenuItem[]; categories: MenuCategory[] } }
  | { type: 'SET_EXTENDED_DATA'; payload: {
      categoriesWithStats: CategoryWithStats[];
      menuItemsExtended: MenuItemExtended[];
      modifierGroups: ModifierGroup[];
      combos: ComboDeal[];
    }}
  | { type: 'ADD_CATEGORY'; payload: CategoryWithStats }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; data: Partial<CategoryWithStats> } }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'REORDER_CATEGORIES'; payload: string[] }
  | { type: 'ADD_ITEM'; payload: MenuItemExtended }
  | { type: 'UPDATE_ITEM'; payload: { id: string; data: Partial<MenuItemExtended> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'ADD_MODIFIER_GROUP'; payload: ModifierGroup }
  | { type: 'UPDATE_MODIFIER_GROUP'; payload: { id: string; data: Partial<ModifierGroup> } }
  | { type: 'REMOVE_MODIFIER_GROUP'; payload: string }
  | { type: 'ADD_COMBO'; payload: ComboDeal }
  | { type: 'UPDATE_COMBO'; payload: { id: string; data: Partial<ComboDeal> } }
  | { type: 'REMOVE_COMBO'; payload: string }
  | { type: 'SET_EDITING'; payload: { isEditing: boolean; by?: string } }
  | { type: 'SET_LAST_UPDATED'; payload: string };
