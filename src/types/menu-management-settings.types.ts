/**
 * Menu Management Settings Types
 * Types for state management, filters, and UI state in Menu Management
 */

import { CategoryWithStats, MenuItemWithStats } from './menu-management.types';
import {
  ModifierGroupWithStats,
  ComboDealWithDetails,
  MenuItemExtended,
  DietaryTag,
  AllergenType,
} from './menu-management-extended.types';

// ============== TAB AND VIEW TYPES ==============

export type MenuManagementTab = 'items' | 'modifiers' | 'combos';
export type MenuViewMode = 'grid' | 'list';
export type MenuSortField =
  | 'name'
  | 'price'
  | 'category'
  | 'orders'
  | 'rating'
  | 'updated'
  | 'availability';
export type SortOrder = 'asc' | 'desc';

// ============== FILTER TYPES ==============

export interface MenuFilters {
  categoryIds: string[];
  availableOnly: boolean;
  unavailableOnly: boolean;
  hasModifiers: boolean;
  hasNutritionalInfo: boolean;
  priceRange: { min: number; max: number } | null;
  dietaryTags: DietaryTag[];
  allergenFree: AllergenType[];
}

export interface ModifierFilters {
  searchQuery: string;
  activeOnly: boolean;
  requiredOnly: boolean;
  singleSelectionOnly: boolean;
  multipleSelectionOnly: boolean;
}

export interface ComboFilters {
  searchQuery: string;
  activeOnly: boolean;
  currentlyAvailable: boolean;
}

export const DEFAULT_MENU_FILTERS: MenuFilters = {
  categoryIds: [],
  availableOnly: false,
  unavailableOnly: false,
  hasModifiers: false,
  hasNutritionalInfo: false,
  priceRange: null,
  dietaryTags: [],
  allergenFree: [],
};

export const DEFAULT_MODIFIER_FILTERS: ModifierFilters = {
  searchQuery: '',
  activeOnly: false,
  requiredOnly: false,
  singleSelectionOnly: false,
  multipleSelectionOnly: false,
};

export const DEFAULT_COMBO_FILTERS: ComboFilters = {
  searchQuery: '',
  activeOnly: false,
  currentlyAvailable: false,
};

// ============== SELECTION STATE ==============

export interface MenuSelectionState {
  selectedCategoryId: string | null;
  selectedItemIds: string[];
  selectedModifierGroupId: string | null;
  selectedComboId: string | null;
  isMultiSelectMode: boolean;
}

export const DEFAULT_SELECTION_STATE: MenuSelectionState = {
  selectedCategoryId: null,
  selectedItemIds: [],
  selectedModifierGroupId: null,
  selectedComboId: null,
  isMultiSelectMode: false,
};

// ============== UI STATE ==============

export interface MenuUIState {
  activeTab: MenuManagementTab;
  viewMode: MenuViewMode;
  isSidebarCollapsed: boolean;
  isStatsPanelVisible: boolean;
  searchQuery: string;
  sortField: MenuSortField;
  sortOrder: SortOrder;
}

export const DEFAULT_UI_STATE: MenuUIState = {
  activeTab: 'items',
  viewMode: 'grid',
  isSidebarCollapsed: false,
  isStatsPanelVisible: true,
  searchQuery: '',
  sortField: 'name',
  sortOrder: 'asc',
};

// ============== FULL MANAGEMENT STATE ==============

export interface MenuManagementState {
  // Data
  categories: CategoryWithStats[];
  menuItems: MenuItemExtended[];
  modifierGroups: ModifierGroupWithStats[];
  combos: ComboDealWithDetails[];

  // Selection
  selection: MenuSelectionState;

  // Filters
  itemFilters: MenuFilters;
  modifierFilters: ModifierFilters;
  comboFilters: ComboFilters;

  // UI
  ui: MenuUIState;

  // Loading States
  isLoading: boolean;
  isSaving: boolean;
  isRefreshing: boolean;

  // Error State
  error: string | null;

  // Change Tracking
  hasUnsavedChanges: boolean;

  // History (for undo/redo)
  canUndo: boolean;
  canRedo: boolean;
}

export const DEFAULT_MENU_MANAGEMENT_STATE: MenuManagementState = {
  categories: [],
  menuItems: [],
  modifierGroups: [],
  combos: [],
  selection: DEFAULT_SELECTION_STATE,
  itemFilters: DEFAULT_MENU_FILTERS,
  modifierFilters: DEFAULT_MODIFIER_FILTERS,
  comboFilters: DEFAULT_COMBO_FILTERS,
  ui: DEFAULT_UI_STATE,
  isLoading: false,
  isSaving: false,
  isRefreshing: false,
  error: null,
  hasUnsavedChanges: false,
  canUndo: false,
  canRedo: false,
};

// ============== ACTION TYPES ==============

export type MenuManagementActionType =
  | 'SET_LOADING'
  | 'SET_SAVING'
  | 'SET_REFRESHING'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'SET_CATEGORIES'
  | 'ADD_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'REMOVE_CATEGORY'
  | 'SET_MENU_ITEMS'
  | 'ADD_MENU_ITEM'
  | 'UPDATE_MENU_ITEM'
  | 'REMOVE_MENU_ITEM'
  | 'SET_MODIFIER_GROUPS'
  | 'ADD_MODIFIER_GROUP'
  | 'UPDATE_MODIFIER_GROUP'
  | 'REMOVE_MODIFIER_GROUP'
  | 'SET_COMBOS'
  | 'ADD_COMBO'
  | 'UPDATE_COMBO'
  | 'REMOVE_COMBO'
  | 'SET_ACTIVE_TAB'
  | 'SET_VIEW_MODE'
  | 'SET_SEARCH_QUERY'
  | 'SET_SORT'
  | 'SET_ITEM_FILTERS'
  | 'SET_MODIFIER_FILTERS'
  | 'SET_COMBO_FILTERS'
  | 'RESET_FILTERS'
  | 'SELECT_CATEGORY'
  | 'SELECT_ITEM'
  | 'SELECT_ITEMS'
  | 'DESELECT_ITEM'
  | 'SELECT_ALL_ITEMS'
  | 'CLEAR_SELECTION'
  | 'TOGGLE_MULTI_SELECT'
  | 'SELECT_MODIFIER_GROUP'
  | 'SELECT_COMBO'
  | 'TOGGLE_SIDEBAR'
  | 'TOGGLE_STATS_PANEL'
  | 'SET_HAS_UNSAVED_CHANGES'
  | 'SET_CAN_UNDO'
  | 'SET_CAN_REDO'
  | 'RESET_STATE';

// ============== MODAL TYPES ==============

export type MenuModalType =
  | 'addCategory'
  | 'editCategory'
  | 'deleteCategory'
  | 'addMenuItem'
  | 'editMenuItem'
  | 'deleteMenuItem'
  | 'addModifierGroup'
  | 'editModifierGroup'
  | 'addModifierOption'
  | 'addCombo'
  | 'editCombo'
  | 'nutritionalInfo'
  | 'bulkEdit'
  | 'importMenu'
  | 'exportMenu'
  | null;

export interface ModalState {
  type: MenuModalType;
  data?: unknown;
}

// ============== BULK OPERATION TYPES ==============

export type BulkOperationType =
  | 'enable'
  | 'disable'
  | 'delete'
  | 'update_category'
  | 'update_price'
  | 'add_modifier'
  | 'remove_modifier'
  | 'update_dietary_tags';

export interface BulkMenuOperation {
  operation: BulkOperationType;
  itemIds: string[];
  data?: {
    category_id?: string;
    price_adjustment?: number;
    price_adjustment_type?: 'percentage' | 'fixed';
    modifier_group_id?: string;
    dietary_tags?: DietaryTag[];
  };
}

// ============== COMPUTED TYPES ==============

export interface MenuManagementComputedState {
  filteredItems: MenuItemExtended[];
  filteredModifierGroups: ModifierGroupWithStats[];
  filteredCombos: ComboDealWithDetails[];
  selectedItem: MenuItemExtended | null;
  selectedCategory: CategoryWithStats | null;
  selectedModifierGroup: ModifierGroupWithStats | null;
  selectedCombo: ComboDealWithDetails | null;
  totalItemsCount: number;
  availableItemsCount: number;
  selectedItemsCount: number;
}
