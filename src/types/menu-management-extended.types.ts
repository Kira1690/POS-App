/**
 * Menu Management Extended Types
 * Types for modifiers, combos, nutritional info, and extended menu items
 */

import { BaseEntity } from './common.types';
import { MenuItem, MenuCategory } from './menu.types';
import { KitchenStation } from './order-extended.types';

// ============== MODIFIER TYPES ==============

export type ModifierSelectionType = 'single' | 'multiple';

export interface ModifierOption extends BaseEntity {
  modifier_group_id: string;
  name: string;
  description?: string;
  price_adjustment: number;
  is_default: boolean;
  is_available: boolean;
  sort_order: number;
  max_quantity?: number;
  sku?: string;
}

export interface ModifierGroup extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  internal_note?: string;
  selection_type: ModifierSelectionType;
  is_required: boolean;
  min_selections?: number;
  max_selections?: number;
  is_active: boolean;
  sort_order: number;
  options: ModifierOption[];
}

export interface MenuItemModifierAssignment {
  id: string;
  menu_item_id: string;
  modifier_group_id: string;
  sort_order: number;
  is_required_override?: boolean;
  created_at?: string; // Made optional for backward compatibility
}

export interface ModifierGroupWithStats extends ModifierGroup {
  stats: {
    appliedToItemCount: number;
    optionCount: number;
    mostSelectedOption: string;
    usageToday: number;
  };
}

// ============== COMBO TYPES ==============

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ComboItemCategory = 'main' | 'side' | 'drink' | 'dessert' | 'addon';

export interface ComboAvailability {
  always_available: boolean;
  start_date?: string;
  end_date?: string;
  days_of_week?: DayOfWeek[];
  start_time?: string;
  end_time?: string;
}

export interface ComboItem {
  id: string;
  combo_id: string;
  menu_item_id?: string;
  category_choice?: string;
  quantity: number;
  is_substitutable: boolean;
  substitution_options?: string[];
  price_override?: number;
  item_category: ComboItemCategory;
  sort_order: number;
}

export interface ComboItemWithDetails extends ComboItem {
  menu_item?: MenuItem;
  category?: MenuCategory;
}

export interface ComboDeal extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  combo_items: ComboItem[];
  regular_price: number;
  combo_price: number;
  savings_amount: number;
  savings_percentage: number;
  is_active: boolean;
  availability: ComboAvailability;
  max_quantity_per_order?: number;
}

export interface ComboDealWithDetails extends ComboDeal {
  combo_items: ComboItemWithDetails[];
  stats?: {
    ordersToday: number;
    revenueToday: number;
    avgOrdersPerDay: number;
  };
}

// ============== NUTRITIONAL TYPES ==============

export type AllergenType =
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

export type DietaryTag =
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

export interface DietaryTagInfo {
  tag: DietaryTag;
  label: string;
  shortLabel: string;
  icon: string;
}

export const DIETARY_TAGS_CONFIG: Record<DietaryTag, DietaryTagInfo> = {
  vegetarian: { tag: 'vegetarian', label: 'Vegetarian', shortLabel: 'V', icon: 'leaf' },
  vegan: { tag: 'vegan', label: 'Vegan', shortLabel: 'VG', icon: 'sprout' },
  gluten_free: { tag: 'gluten_free', label: 'Gluten-Free', shortLabel: 'GF', icon: 'barley-off' },
  dairy_free: { tag: 'dairy_free', label: 'Dairy-Free', shortLabel: 'DF', icon: 'cow-off' },
  nut_free: { tag: 'nut_free', label: 'Nut-Free', shortLabel: 'NF', icon: 'peanut-off' },
  halal: { tag: 'halal', label: 'Halal', shortLabel: 'H', icon: 'food-halal' },
  kosher: { tag: 'kosher', label: 'Kosher', shortLabel: 'K', icon: 'food-kosher' },
  keto: { tag: 'keto', label: 'Keto', shortLabel: 'KT', icon: 'food-steak' },
  low_carb: { tag: 'low_carb', label: 'Low Carb', shortLabel: 'LC', icon: 'bread-slice-outline' },
  low_sodium: { tag: 'low_sodium', label: 'Low Sodium', shortLabel: 'LS', icon: 'shaker-outline' },
  organic: { tag: 'organic', label: 'Organic', shortLabel: 'O', icon: 'leaf-circle' },
  spicy: { tag: 'spicy', label: 'Spicy', shortLabel: 'S', icon: 'fire' },
};

export const ALLERGEN_LABELS: Record<AllergenType, string> = {
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

export interface NutritionalFacts {
  serving_size: string;
  calories: number;
  calories_from_fat?: number;
  total_fat_g?: number;
  saturated_fat_g?: number;
  trans_fat_g?: number;
  cholesterol_mg?: number;
  sodium_mg?: number;
  total_carbs_g?: number;
  dietary_fiber_g?: number;
  sugars_g?: number;
  added_sugars_g?: number;
  protein_g?: number;
  vitamin_a_percent?: number;
  vitamin_c_percent?: number;
  vitamin_d_percent?: number;
  calcium_percent?: number;
  iron_percent?: number;
  potassium_percent?: number;
}

export interface NutritionalInfo extends BaseEntity {
  menu_item_id: string;
  nutritional_facts: NutritionalFacts;
  allergens: AllergenType[];
  dietary_tags: DietaryTag[];
  contains_warning?: string;
  preparation_notes?: string;
  // Convenience properties (derived from nutritional_facts)
  calories?: number;
}

// ============== EXTENDED MENU ITEM ==============

export interface MenuItemExtended extends MenuItem {
  modifier_assignments: MenuItemModifierAssignment[];
  modifier_groups?: ModifierGroup[];
  nutritional_info?: NutritionalInfo;
  combo_memberships?: string[];
  // Note: dietary_tags and allergens are inherited from MenuItem as string[]
  // Use NutritionalInfo.dietary_tags for strongly-typed DietaryTag[]
  // Use NutritionalInfo.allergens for strongly-typed AllergenType[]
  // Extended display properties
  image?: string; // Alias for image_url
  cost_price?: number;
  tax_rate?: number;
  preparation_time?: number;
  sort_order?: number;
  kitchen_station?: KitchenStation; // undefined = auto-derive from category
}

// Re-export KitchenStation for consumers of this module
export type { KitchenStation };

// ============== REQUEST TYPES ==============

export interface CreateModifierGroupRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  selection_type: ModifierSelectionType;
  is_required: boolean;
  min_selections?: number;
  max_selections?: number;
  options?: Omit<CreateModifierOptionRequest, 'modifier_group_id'>[];
}

export interface UpdateModifierGroupRequest {
  name?: string;
  description?: string;
  selection_type?: ModifierSelectionType;
  is_required?: boolean;
  min_selections?: number;
  max_selections?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateModifierOptionRequest {
  modifier_group_id: string;
  name: string;
  description?: string;
  price_adjustment: number;
  is_default?: boolean;
  is_available?: boolean;
  sort_order?: number;
  max_quantity?: number;
}

export interface UpdateModifierOptionRequest {
  name?: string;
  description?: string;
  price_adjustment?: number;
  is_default?: boolean;
  is_available?: boolean;
  sort_order?: number;
  max_quantity?: number;
}

export interface CreateComboItemRequest {
  menu_item_id?: string;
  category_choice?: string;
  quantity: number;
  is_substitutable: boolean;
  substitution_options?: string[];
  price_override?: number;
  item_category: ComboItemCategory;
}

export interface CreateComboRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  combo_items: CreateComboItemRequest[];
  combo_price: number;
  availability: ComboAvailability;
  is_active?: boolean;
}

export interface UpdateComboRequest {
  name?: string;
  description?: string;
  image_url?: string;
  combo_items?: CreateComboItemRequest[];
  combo_price?: number;
  availability?: ComboAvailability;
  is_active?: boolean;
}

export interface UpdateNutritionalInfoRequest {
  nutritional_facts?: Partial<NutritionalFacts>;
  allergens?: AllergenType[];
  dietary_tags?: DietaryTag[];
  contains_warning?: string;
  preparation_notes?: string;
}
