# Menu Management - Data Structures

## Table of Contents
1. [Core Types](#1-core-types)
2. [Extended Types for Modifiers](#2-extended-types-for-modifiers)
3. [Combo Deal Types](#3-combo-deal-types)
4. [Nutritional Types](#4-nutritional-types)
5. [State Management Types](#5-state-management-types)
6. [Context Types](#6-context-types)
7. [Request/Response Types](#7-requestresponse-types)
8. [Event Types](#8-event-types)

---

## 1. Core Types

### 1.1 Base Entity (Existing)
```typescript
// Location: src/types/common.types.ts (existing)
interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}
```

### 1.2 Menu Category (Existing)
```typescript
// Location: src/types/menu.types.ts (existing)
interface MenuCategory extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}
```

### 1.3 Menu Item (Existing)
```typescript
// Location: src/types/menu.types.ts (existing)
interface MenuItem extends BaseEntity {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  preparation_time_minutes?: number;
  dietary_info?: string[];
  ingredients?: string[];
}
```

### 1.4 Category With Stats (Existing)
```typescript
// Location: src/types/menu-management.types.ts (existing)
interface CategoryStats {
  itemCount: number;
  todayRevenue: number;
  avgPrice: number;
  popularItems: string[];
  lastUpdated: string;
}

interface CategoryWithStats extends MenuCategory {
  stats: CategoryStats;
}
```

### 1.5 Menu Item With Stats (Existing)
```typescript
// Location: src/types/menu-management.types.ts (existing)
interface MenuItemWithStats extends MenuItem {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    avgOrderTime: number;
    customerRating: number;
    lastOrdered: string;
  };
}
```

---

## 2. Extended Types for Modifiers

### 2.1 Modifier Option
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface ModifierOption extends BaseEntity {
  modifier_group_id: string;
  name: string;
  description?: string;
  price_adjustment: number;      // Can be negative (e.g., -$1.00 for smaller size)
  is_default: boolean;           // Pre-selected option
  is_available: boolean;         // Can be disabled temporarily
  sort_order: number;
  max_quantity?: number;         // For "extra cheese x3" scenarios
  sku?: string;                  // For inventory tracking
}
```

### 2.2 Modifier Group
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
type ModifierSelectionType = 'single' | 'multiple';

interface ModifierGroup extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;          // Shown to customers (e.g., "Choose your size")
  internal_note?: string;        // Staff notes
  selection_type: ModifierSelectionType;
  is_required: boolean;          // Customer must make a selection
  min_selections?: number;       // For multiple selection (min 2 toppings)
  max_selections?: number;       // For multiple selection (max 5 toppings)
  is_active: boolean;
  sort_order: number;
  options: ModifierOption[];
}
```

### 2.3 Menu Item Modifier Assignment
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface MenuItemModifierAssignment {
  id: string;
  menu_item_id: string;
  modifier_group_id: string;
  sort_order: number;            // Order to display modifiers
  is_required_override?: boolean; // Override group's required setting
  created_at: string;
}
```

### 2.4 Modifier Group With Stats
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface ModifierGroupWithStats extends ModifierGroup {
  stats: {
    appliedToItemCount: number;
    optionCount: number;
    mostSelectedOption: string;
    usageToday: number;
  };
}
```

---

## 3. Combo Deal Types

### 3.1 Combo Availability
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0

interface ComboAvailability {
  always_available: boolean;
  start_date?: string;           // ISO date string
  end_date?: string;             // ISO date string
  days_of_week?: DayOfWeek[];    // e.g., [1, 2, 3, 4, 5] for weekdays
  start_time?: string;           // HH:mm format (e.g., "11:00")
  end_time?: string;             // HH:mm format (e.g., "15:00")
}
```

### 3.2 Combo Item
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
type ComboItemCategory = 'main' | 'side' | 'drink' | 'dessert' | 'addon';

interface ComboItem {
  id: string;
  combo_id: string;
  menu_item_id?: string;         // Null if it's a category choice
  category_choice?: string;      // "Any Main Course" - category_id to choose from
  quantity: number;
  is_substitutable: boolean;     // Can be swapped for another item
  substitution_options?: string[]; // Menu item IDs that can substitute
  price_override?: number;       // Optional fixed price in combo
  item_category: ComboItemCategory;
  sort_order: number;
}

interface ComboItemWithDetails extends ComboItem {
  menu_item?: MenuItem;          // Populated with full item details
  category?: MenuCategory;       // Populated if category_choice
}
```

### 3.3 Combo Deal
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface ComboDeal extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  combo_items: ComboItem[];
  regular_price: number;         // Sum of individual items
  combo_price: number;           // Discounted combo price
  savings_amount: number;        // regular_price - combo_price
  savings_percentage: number;    // (savings_amount / regular_price) * 100
  is_active: boolean;
  availability: ComboAvailability;
  max_quantity_per_order?: number; // e.g., max 2 family deals per order
}

interface ComboDealWithDetails extends ComboDeal {
  combo_items: ComboItemWithDetails[];
  stats?: {
    ordersToday: number;
    revenueToday: number;
    avgOrdersPerDay: number;
  };
}
```

---

## 4. Nutritional Types

### 4.1 Allergen Types
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
type AllergenType =
  | 'gluten'
  | 'dairy'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'tree_nuts'
  | 'peanuts'
  | 'soy'
  | 'sesame'
  | 'sulfites'
  | 'mustard'
  | 'celery';

const ALLERGEN_LABELS: Record<AllergenType, string> = {
  gluten: 'Gluten',
  dairy: 'Dairy',
  eggs: 'Eggs',
  fish: 'Fish',
  shellfish: 'Shellfish',
  tree_nuts: 'Tree Nuts',
  peanuts: 'Peanuts',
  soy: 'Soy',
  sesame: 'Sesame',
  sulfites: 'Sulfites',
  mustard: 'Mustard',
  celery: 'Celery',
};
```

### 4.2 Dietary Tags
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'halal'
  | 'kosher'
  | 'keto'
  | 'low_carb'
  | 'low_sodium'
  | 'organic'
  | 'spicy';

interface DietaryTagInfo {
  tag: DietaryTag;
  label: string;
  shortLabel: string;    // For badges (e.g., "V", "VG", "GF")
  color: string;         // Theme color key
  icon: string;          // MaterialCommunityIcons name
}

const DIETARY_TAGS: Record<DietaryTag, DietaryTagInfo> = {
  vegetarian: {
    tag: 'vegetarian',
    label: 'Vegetarian',
    shortLabel: 'V',
    color: 'success',
    icon: 'leaf'
  },
  vegan: {
    tag: 'vegan',
    label: 'Vegan',
    shortLabel: 'VG',
    color: 'success',
    icon: 'sprout'
  },
  // ... etc
};
```

### 4.3 Nutritional Info
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface NutritionalFacts {
  serving_size: string;          // "1 cup (240ml)"
  calories: number;
  calories_from_fat?: number;

  // Fats
  total_fat_g?: number;
  saturated_fat_g?: number;
  trans_fat_g?: number;

  // Cholesterol & Sodium
  cholesterol_mg?: number;
  sodium_mg?: number;

  // Carbohydrates
  total_carbs_g?: number;
  dietary_fiber_g?: number;
  sugars_g?: number;
  added_sugars_g?: number;

  // Protein
  protein_g?: number;

  // Vitamins & Minerals (as percentage of daily value)
  vitamin_a_percent?: number;
  vitamin_c_percent?: number;
  vitamin_d_percent?: number;
  calcium_percent?: number;
  iron_percent?: number;
  potassium_percent?: number;
}

interface NutritionalInfo extends BaseEntity {
  menu_item_id: string;
  nutritional_facts: NutritionalFacts;
  allergens: AllergenType[];
  dietary_tags: DietaryTag[];
  contains_warning?: string;     // "May contain traces of nuts"
  preparation_notes?: string;    // "Cooked in peanut oil"
}
```

### 4.4 Extended Menu Item
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface MenuItemExtended extends MenuItem {
  modifier_assignments: MenuItemModifierAssignment[];
  modifier_groups?: ModifierGroup[];  // Populated for display
  nutritional_info?: NutritionalInfo;
  combo_memberships?: string[];       // Combo IDs this item belongs to
  dietary_tags?: DietaryTag[];        // Quick access without full nutritional
  allergens?: AllergenType[];         // Quick access without full nutritional
}
```

---

## 5. State Management Types

### 5.1 Tab and View Types
```typescript
// Location: src/types/menu-management-settings.types.ts (NEW)
type MenuManagementTab = 'categories' | 'items' | 'modifiers' | 'combos';
type MenuViewMode = 'grid' | 'list';
type MenuSortField =
  | 'name'
  | 'price'
  | 'category'
  | 'orders'
  | 'rating'
  | 'updated'
  | 'availability';
type SortOrder = 'asc' | 'desc';
```

### 5.2 Filter Types
```typescript
// Location: src/types/menu-management-settings.types.ts (NEW)
interface MenuFilters {
  categoryIds: string[];
  availableOnly: boolean;
  unavailableOnly: boolean;
  hasModifiers: boolean;
  hasNutritionalInfo: boolean;
  priceRange: { min: number; max: number } | null;
  dietaryTags: DietaryTag[];
  allergenFree: AllergenType[];  // Items that DON'T contain these allergens
}

interface ModifierFilters {
  searchQuery: string;
  activeOnly: boolean;
  requiredOnly: boolean;
  singleSelectionOnly: boolean;
  multipleSelectionOnly: boolean;
}

interface ComboFilters {
  searchQuery: string;
  activeOnly: boolean;
  currentlyAvailable: boolean;  // Based on time/date availability
}
```

### 5.3 Selection State
```typescript
// Location: src/types/menu-management-settings.types.ts (NEW)
interface MenuSelectionState {
  selectedCategoryId: string | null;
  selectedItemIds: string[];
  selectedModifierGroupId: string | null;
  selectedComboId: string | null;
  isMultiSelectMode: boolean;
}
```

### 5.4 UI State
```typescript
// Location: src/types/menu-management-settings.types.ts (NEW)
interface MenuUIState {
  activeTab: MenuManagementTab;
  viewMode: MenuViewMode;
  isSidebarCollapsed: boolean;
  isStatsPanelVisible: boolean;
  searchQuery: string;
  sortField: MenuSortField;
  sortOrder: SortOrder;
}
```

### 5.5 Full Management State
```typescript
// Location: src/types/menu-management-settings.types.ts (NEW)
interface MenuManagementState {
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
```

---

## 6. Context Types

### 6.1 Menu Event Types
```typescript
// Location: src/interfaces/context/menu.interface.ts (NEW)
type MenuEventType =
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
  | 'MODIFIER_OPTION_REMOVED'
  | 'COMBO_CREATED'
  | 'COMBO_UPDATED'
  | 'COMBO_DELETED'
  | 'MENU_REFRESHED'
  | 'BULK_UPDATE';

interface MenuEventPayload {
  categoryId?: string;
  itemId?: string;
  modifierGroupId?: string;
  comboId?: string;
  previousValue?: any;
  newValue?: any;
  affectedItemIds?: string[];
  timestamp: string;
}

interface MenuEvent {
  type: MenuEventType;
  payload: MenuEventPayload;
}

type MenuEventHandler = (event: MenuEvent) => void;
```

### 6.2 Menu Context State
```typescript
// Location: src/interfaces/context/menu.interface.ts (NEW)
interface IMenuContextState {
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
```

### 6.3 Menu Context Actions
```typescript
// Location: src/interfaces/context/menu.interface.ts (NEW)
interface IMenuContextActions {
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

interface IMenuContext extends IMenuContextState, IMenuContextActions {}
```

---

## 7. Request/Response Types

### 7.1 Category Requests
```typescript
// Location: src/types/menu-management.types.ts (existing, may need updates)
interface CreateCategoryRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}
```

### 7.2 Menu Item Requests
```typescript
// Location: src/types/menu-management.types.ts (existing, may need updates)
interface CreateMenuItemRequest {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  preparation_time_minutes?: number;
  dietary_info?: string[];
  ingredients?: string[];
  dietary_tags?: DietaryTag[];
  allergens?: AllergenType[];
}

interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
  preparation_time_minutes?: number;
  dietary_info?: string[];
  ingredients?: string[];
  category_id?: string;
  dietary_tags?: DietaryTag[];
  allergens?: AllergenType[];
}
```

### 7.3 Modifier Requests
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface CreateModifierGroupRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  selection_type: ModifierSelectionType;
  is_required: boolean;
  min_selections?: number;
  max_selections?: number;
  options?: Omit<CreateModifierOptionRequest, 'modifier_group_id'>[];
}

interface UpdateModifierGroupRequest {
  name?: string;
  description?: string;
  selection_type?: ModifierSelectionType;
  is_required?: boolean;
  min_selections?: number;
  max_selections?: number;
  is_active?: boolean;
  sort_order?: number;
}

interface CreateModifierOptionRequest {
  modifier_group_id: string;
  name: string;
  description?: string;
  price_adjustment: number;
  is_default?: boolean;
  is_available?: boolean;
  sort_order?: number;
  max_quantity?: number;
}

interface UpdateModifierOptionRequest {
  name?: string;
  description?: string;
  price_adjustment?: number;
  is_default?: boolean;
  is_available?: boolean;
  sort_order?: number;
  max_quantity?: number;
}
```

### 7.4 Combo Requests
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface CreateComboItemRequest {
  menu_item_id?: string;
  category_choice?: string;
  quantity: number;
  is_substitutable: boolean;
  substitution_options?: string[];
  price_override?: number;
  item_category: ComboItemCategory;
}

interface CreateComboRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  combo_items: CreateComboItemRequest[];
  combo_price: number;
  availability: ComboAvailability;
  is_active?: boolean;
}

interface UpdateComboRequest {
  name?: string;
  description?: string;
  image_url?: string;
  combo_items?: CreateComboItemRequest[];
  combo_price?: number;
  availability?: ComboAvailability;
  is_active?: boolean;
}
```

### 7.5 Nutritional Info Requests
```typescript
// Location: src/types/menu-management-extended.types.ts (NEW)
interface UpdateNutritionalInfoRequest {
  nutritional_facts?: Partial<NutritionalFacts>;
  allergens?: AllergenType[];
  dietary_tags?: DietaryTag[];
  contains_warning?: string;
  preparation_notes?: string;
}
```

### 7.6 Bulk Operation Request
```typescript
// Location: src/types/menu-management.types.ts (existing, may need updates)
type BulkOperationType =
  | 'enable'
  | 'disable'
  | 'delete'
  | 'update_category'
  | 'update_price'
  | 'add_modifier'
  | 'remove_modifier'
  | 'update_dietary_tags';

interface BulkMenuOperation {
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
```

---

## 8. Event Types

### 8.1 Menu Event Emitter Interface
```typescript
// Location: src/services/menu/MenuEventEmitter.ts (NEW)
interface IMenuEventEmitter {
  subscribe: (handler: MenuEventHandler) => () => void;
  emit: (event: MenuEvent) => void;
  getRecentEvents: (count?: number) => MenuEvent[];
}
```

### 8.2 Sync Hook Return Type
```typescript
// Location: src/hooks/useMenuSync.ts (NEW)
interface UseMenuSyncReturn {
  isMenuSyncing: boolean;
  isMenuBeingEdited: boolean;
  lastMenuUpdate: string | null;
  forceRefresh: () => Promise<void>;
}

interface UseMenuSyncOptions {
  autoRemoveDeletedItems?: boolean;
  notifyOnPriceChange?: boolean;
  notifyOnEditMode?: boolean;
  onItemDeleted?: (itemId: string) => void;
  onItemPriceChanged?: (itemId: string, oldPrice: number, newPrice: number) => void;
  onItemAvailabilityChanged?: (itemId: string, isAvailable: boolean) => void;
}
```

---

## File Summary

### New Files to Create
| File | Types Defined |
|------|---------------|
| `src/types/menu-management-extended.types.ts` | ModifierOption, ModifierGroup, ComboItem, ComboDeal, NutritionalInfo, etc. |
| `src/types/menu-management-settings.types.ts` | MenuManagementState, MenuFilters, MenuUIState, etc. |
| `src/interfaces/context/menu.interface.ts` | IMenuContext, MenuEvent, MenuEventHandler |

### Files to Update
| File | Changes |
|------|---------|
| `src/types/menu-management.types.ts` | Add BulkOperationType, update request types |
| `src/types/settings.types.ts` | Add 'menu_management' to SettingsCategory union |

---

## Type Relationships Diagram

```
BaseEntity
    |
    +-- MenuCategory
    |       |
    |       +-- CategoryWithStats
    |
    +-- MenuItem
    |       |
    |       +-- MenuItemWithStats
    |       +-- MenuItemExtended (+ modifiers, nutritional)
    |
    +-- ModifierGroup
    |       |
    |       +-- ModifierGroupWithStats
    |       |
    |       +-- ModifierOption (child)
    |
    +-- ComboDeal
    |       |
    |       +-- ComboDealWithDetails
    |       |
    |       +-- ComboItem (child)
    |
    +-- NutritionalInfo
            |
            +-- NutritionalFacts (embedded)
            +-- AllergenType[] (embedded)
            +-- DietaryTag[] (embedded)
```
