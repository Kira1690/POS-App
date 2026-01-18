# Menu Management - Data Structure Documentation
## Date: January 18, 2026

---

## Storage Keys & Locations

| Key | Location | Purpose |
|-----|----------|---------|
| `@pos_menu_categories` | AsyncStorage | Menu categories |
| `@pos_menu_items` | AsyncStorage | Menu items with modifiers |
| `@pos_menu_modifiers` | AsyncStorage | Modifier group definitions |
| `@pos_menu_combos` | AsyncStorage | Combo deal definitions |
| `@pos_menu_last_sync` | AsyncStorage | Last sync timestamp |

---

## Type Definitions

### 1. MenuCategory (Base)

```typescript
interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryWithStats extends MenuCategory {
  item_count: number;
  active_item_count: number;
}
```

### 2. MenuItem (Base)

```typescript
interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  preparation_time_minutes: number;
  created_at: string;
  updated_at: string;
}
```

### 3. MenuItemExtended (With Modifiers)

```typescript
interface MenuItemExtended extends MenuItem {
  // Modifier assignments (which groups apply to this item)
  modifier_assignments: MenuItemModifierAssignment[];

  // Populated modifier groups (full data for display)
  modifier_groups?: ModifierGroup[];

  // Nutritional information
  nutritional_info?: NutritionalInfo;

  // Combo memberships (which combos include this item)
  combo_memberships?: string[];

  // Dietary information
  dietary_tags?: DietaryTag[];
  allergens?: AllergenType[];
}
```

### 4. ModifierGroup

```typescript
interface ModifierGroup extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  internal_note?: string;

  // Selection behavior
  selection_type: 'single' | 'multiple';
  is_required: boolean;
  min_selections?: number;
  max_selections?: number;

  // Status
  is_active: boolean;
  sort_order: number;

  // Nested options
  options: ModifierOption[];
}
```

### 5. ModifierOption

```typescript
interface ModifierOption extends BaseEntity {
  modifier_group_id: string;
  name: string;
  description?: string;

  // Pricing
  price_adjustment: number;  // Can be positive or negative

  // Defaults & availability
  is_default: boolean;
  is_available: boolean;
  sort_order: number;

  // Limits
  max_quantity?: number;
  sku?: string;
}
```

### 6. MenuItemModifierAssignment

```typescript
interface MenuItemModifierAssignment {
  id: string;
  menu_item_id: string;
  modifier_group_id: string;
  sort_order: number;
  is_required_override?: boolean;  // Override group's is_required
  created_at: string;
}
```

### 7. SelectedModifier (For Orders)

```typescript
interface SelectedModifierOption {
  optionId: string;
  optionName: string;
  priceAdjustment: number;
  quantity: number;
  totalPrice: number;
}

interface SelectedModifier {
  groupId: string;
  groupName: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  options: SelectedModifierOption[];
}
```

### 8. ComboDeal

```typescript
interface ComboDeal extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;

  // Pricing
  regular_price: number;      // Sum of individual items
  combo_price: number;        // Discounted price
  savings_amount: number;     // regular_price - combo_price
  savings_percentage: number; // (savings / regular) * 100

  // Components
  items: ComboItem[];

  // Availability
  is_active: boolean;
  availability: ComboAvailability;

  // Limits
  max_quantity_per_order?: number;

  sort_order: number;
}
```

### 9. ComboItem

```typescript
interface ComboItem {
  id: string;
  combo_id: string;
  component_name: string;  // "Main Course", "Side", "Drink"
  category: 'main' | 'side' | 'drink' | 'dessert' | 'addon';

  // Requirements
  required_quantity: number;

  // Allowed items
  allowed_items: string[];      // Menu item IDs
  allowed_categories?: string[]; // Category IDs (alternative)

  // Defaults
  default_item_id?: string;

  // Pricing adjustments for premium options
  price_adjustments?: {
    item_id: string;
    adjustment: number;
  }[];

  sort_order: number;
}
```

### 10. ComboAvailability

```typescript
interface ComboAvailability {
  always_available: boolean;

  // Date range
  start_date?: string;
  end_date?: string;

  // Time range (daily)
  start_time?: string;  // "11:00"
  end_time?: string;    // "15:00"

  // Days of week
  available_days?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}
```

---

## Example Data

### Butter Chicken with Add-ons

```json
{
  "id": "item_butter_chicken",
  "category_id": "cat_nonveg",
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry with tender chicken",
  "price": 18.99,
  "is_available": true,
  "preparation_time_minutes": 20,

  "modifier_assignments": [
    {
      "id": "assign_1",
      "menu_item_id": "item_butter_chicken",
      "modifier_group_id": "mod_spice_level",
      "sort_order": 1,
      "is_required_override": true
    },
    {
      "id": "assign_2",
      "menu_item_id": "item_butter_chicken",
      "modifier_group_id": "mod_bread_addons",
      "sort_order": 2,
      "is_required_override": false
    }
  ],

  "modifier_groups": [
    {
      "id": "mod_spice_level",
      "name": "Spice Level",
      "selection_type": "single",
      "is_required": true,
      "options": [
        { "id": "opt_mild", "name": "Mild", "price_adjustment": 0, "is_default": true },
        { "id": "opt_medium", "name": "Medium", "price_adjustment": 0 },
        { "id": "opt_hot", "name": "Hot", "price_adjustment": 0 },
        { "id": "opt_extra_hot", "name": "Extra Hot", "price_adjustment": 0.50 }
      ]
    },
    {
      "id": "mod_bread_addons",
      "name": "Add Bread",
      "selection_type": "multiple",
      "is_required": false,
      "max_selections": 5,
      "options": [
        { "id": "opt_tandoori", "name": "Tandoori Roti", "price_adjustment": 2.50 },
        { "id": "opt_butter_naan", "name": "Butter Naan", "price_adjustment": 3.50 },
        { "id": "opt_plain_roti", "name": "Plain Roti", "price_adjustment": 1.50 },
        { "id": "opt_garlic_naan", "name": "Garlic Naan", "price_adjustment": 4.00 }
      ]
    }
  ],

  "dietary_tags": [],
  "allergens": ["dairy", "gluten"]
}
```

### Family Combo Deal

```json
{
  "id": "combo_family_meal",
  "name": "Family Meal Deal",
  "description": "Complete meal for 4 people - 2 mains, 4 breads, 2 drinks",
  "regular_price": 89.99,
  "combo_price": 69.99,
  "savings_amount": 20.00,
  "savings_percentage": 22.2,

  "items": [
    {
      "id": "ci_main",
      "component_name": "Choose 2 Main Courses",
      "category": "main",
      "required_quantity": 2,
      "allowed_items": ["item_butter_chicken", "item_chicken_curry", "item_paneer_butter"],
      "default_item_id": "item_butter_chicken",
      "price_adjustments": [
        { "item_id": "item_fish_fry", "adjustment": 5.00 }
      ]
    },
    {
      "id": "ci_bread",
      "component_name": "Choose 4 Breads",
      "category": "side",
      "required_quantity": 4,
      "allowed_items": ["item_roti", "item_naan", "item_paratha"],
      "default_item_id": "item_roti"
    },
    {
      "id": "ci_drink",
      "component_name": "Choose 2 Drinks",
      "category": "drink",
      "required_quantity": 2,
      "allowed_items": ["item_cola", "item_lassi", "item_water"],
      "default_item_id": "item_cola"
    }
  ],

  "is_active": true,
  "availability": {
    "always_available": false,
    "available_days": ["friday", "saturday", "sunday"]
  },
  "max_quantity_per_order": 2
}
```

---

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SETTINGS (Menu Management)                        │
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │ Categories      │    │ Menu Items      │    │ Modifier Groups │     │
│  │ Management      │    │ Management      │    │ Management      │     │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘     │
│           │                      │                      │               │
│           ▼                      ▼                      ▼               │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                      MenuContext (State)                        │    │
│  │  categories[], menuItems[], modifierGroups[], combos[]         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  │                                      │
│                                  ▼                                      │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    MenuStorageService                           │    │
│  │  saveMenuData(), saveModifierGroups(), saveCombos()            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  │                                      │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          AsyncStorage                                    │
│                                                                          │
│  @pos_menu_categories  │  @pos_menu_items  │  @pos_menu_modifiers      │
│  @pos_menu_combos      │  @pos_menu_last_sync                          │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ORDERING (POS Screen)                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                         useMenu()                               │    │
│  │  - Loads categories from API/storage                           │    │
│  │  - Loads menu items from API/storage                           │    │
│  │  - Loads modifiers from storage                                │    │
│  │  - MERGES modifiers into menu items (TO BE IMPLEMENTED)        │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ POSOrderScreen / OrderingScreen                                  │   │
│  │                                                                  │   │
│  │  Item click → Has modifiers?                                    │   │
│  │       │                                                         │   │
│  │       ├─ YES → Open ModifierSelectionModal                     │   │
│  │       │            └─ User selects → addToCart(item, mods)     │   │
│  │       │                                                         │   │
│  │       └─ NO → addToCart(item, [])                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ EnhancedOrderContext                                             │   │
│  │                                                                  │   │
│  │  Cart: [                                                        │   │
│  │    {                                                            │   │
│  │      name: "Butter Chicken",                                    │   │
│  │      basePrice: 18.99,                                          │   │
│  │      modifierTotal: 6.00,  // Tandoori Roti + Butter Naan      │   │
│  │      itemTotal: 24.99,                                          │   │
│  │      selectedModifiers: [                                       │   │
│  │        { groupName: "Spice Level", options: [...] },           │   │
│  │        { groupName: "Add Bread", options: [...] }              │   │
│  │      ]                                                          │   │
│  │    }                                                            │   │
│  │  ]                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Diagram

```
┌────────────────┐         ┌────────────────┐
│   MenuCategory │◄────────┤   MenuItem     │
│                │   1:N   │                │
│ - id           │         │ - id           │
│ - name         │         │ - category_id  │
│ - sort_order   │         │ - name         │
└────────────────┘         │ - price        │
                           └───────┬────────┘
                                   │
                           ┌───────┴────────┐
                           │                │
                    ┌──────▼──────┐  ┌──────▼──────┐
                    │ Modifier    │  │ Combo       │
                    │ Assignment  │  │ Membership  │
                    │             │  │             │
                    │ - item_id   │  │ - item_id   │
                    │ - group_id  │  │ - combo_id  │
                    └──────┬──────┘  └──────┬──────┘
                           │                │
                    ┌──────▼──────┐  ┌──────▼──────┐
                    │ Modifier    │  │ ComboDeal   │
                    │ Group       │  │             │
                    │             │  │ - items[]   │
                    │ - name      │  │ - price     │
                    │ - required  │  │ - savings   │
                    │ - options[] │  │             │
                    └──────┬──────┘  └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ Modifier    │
                    │ Option      │
                    │             │
                    │ - name      │
                    │ - price_adj │
                    │ - default   │
                    └─────────────┘
```

---

## Storage Service API

### MenuStorageService Methods

```typescript
class MenuStorageService {
  // Full data operations
  saveMenuData(data: MenuStorageData): Promise<void>
  getMenuData(restaurantId: string): Promise<MenuStorageData | null>
  hasMenuData(): Promise<boolean>

  // Categories
  saveCategories(categories: CategoryWithStats[]): Promise<void>
  getCategories(): Promise<CategoryWithStats[]>
  addCategory(category: CategoryWithStats): Promise<void>
  updateCategory(id: string, data: Partial<CategoryWithStats>): Promise<void>
  deleteCategory(id: string): Promise<void>

  // Menu Items
  saveMenuItems(items: MenuItemExtended[]): Promise<void>
  getMenuItems(): Promise<MenuItemExtended[]>
  getMenuItemsByCategory(categoryId: string): Promise<MenuItemExtended[]>
  addMenuItem(item: MenuItemExtended): Promise<void>
  updateMenuItem(id: string, data: Partial<MenuItemExtended>): Promise<void>
  deleteMenuItem(id: string): Promise<void>

  // Modifier Groups
  saveModifierGroups(groups: ModifierGroup[]): Promise<void>
  getModifierGroups(): Promise<ModifierGroup[]>
  addModifierGroup(group: ModifierGroup): Promise<void>
  updateModifierGroup(id: string, data: Partial<ModifierGroup>): Promise<void>
  deleteModifierGroup(id: string): Promise<void>

  // Modifier Assignments (NEW - TO BE ADDED)
  getModifierAssignments(menuItemId: string): Promise<MenuItemModifierAssignment[]>
  saveModifierAssignment(assignment: MenuItemModifierAssignment): Promise<void>
  deleteModifierAssignment(id: string): Promise<void>
  getModifiersForMenuItem(menuItemId: string): Promise<ModifierGroup[]>

  // Combos
  saveCombos(combos: ComboDeal[]): Promise<void>
  getCombos(): Promise<ComboDeal[]>
  addCombo(combo: ComboDeal): Promise<void>
  updateCombo(id: string, data: Partial<ComboDeal>): Promise<void>
  deleteCombo(id: string): Promise<void>

  // Utility
  clearAll(): Promise<void>
  getLastSyncTime(): Promise<string | null>
}
```
