# Menu Management Tests

## Screens Covered
- `MenuManagementScreen` — category list + item grid
- `MenuItemCard` — individual item with price, availability toggle
- `MenuCategoryCard` — category with item count
- `MenuStorageService` — SQLite persistence for categories and items
- `MockMenuApiClient` — in-memory mock for offline/development

## Data Structure
```
MenuCategory
  └── MenuItem[]
        └── MenuModifierGroup[]
              └── MenuModifier[]
```

---

## Unit Tests (Jest)

### MenuStorageService
| Test | Description | Status |
|------|-------------|--------|
| `initialize()` seeds mock menu data on empty DB | Check category + item counts | pending |
| `initialize()` is idempotent — skips if data exists | Call twice, same count | pending |
| `getCategories()` returns all active categories | 5 categories returned | pending |
| `getCategoryById()` returns single category | pending |
| `getItemsByCategory()` returns items for a category | 3 items for "Burgers" | pending |
| `getItemById()` returns item with modifiers | SELECT + JOIN | pending |
| `searchItems()` searches by name and description | "chicken" matches 2 items | pending |
| `getAvailableItems()` excludes unavailable items | 7 items, 1 unavailable → 6 | pending |
| `saveCategory()` inserts new category | Check INSERT | pending |
| `updateCategory()` updates name/description | Check UPDATE | pending |
| `deleteCategory()` removes category and its items | Cascade check | pending |
| `saveItem()` inserts new item with modifiers | Check INSERT for item + modifiers | pending |
| `updateItem()` updates price/description/availability | Check UPDATE | pending |
| `deleteItem()` removes item | Check DELETE | pending |
| `toggleItemAvailability()` flips is_available field | Before/after check | pending |
| `updateItemPrice()` changes base_price only | Before/after check | pending |

### MenuContext (if applicable)
| Test | Description | Status |
|------|-------------|--------|
| `setCategories` action replaces category list | Dispatch, check state | pending |
| `setSelectedCategory` updates active category filter | Check filter | pending |
| `toggleItemAvailability` changes item in state | Same itemId | pending |
| `setSearchQuery` filters items by name | "pizza" matches 2 items | pending |

### Menu price calculations
| Test | Description | Status |
|------|-------------|--------|
| Item total = base_price + sum of selected modifiers | 2 modifiers ($1 + $1.50) = +$2.50 | pending |
| Modifier group min/max selection enforcement | Select 3 when max=2 → blocked | pending |
| Required modifier group (min=1) blocks ordering if not selected | pending |
| Discount price calculated correctly when item has promo | 20% off $10 = $8 | pending |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| MenuManagementScreen renders with no categories | Empty state visible | pending |
| MenuManagementScreen renders seeded mock categories | 5 category cards visible | pending |
| Tap category — items for that category shown | Tap "Burgers", burger items appear | pending |
| Item card shows name, price, and availability | Render check | pending |
| Toggle availability switch calls toggleItemAvailability() | fireEvent | pending |
| Unavailable item card shows visual indicator | is_available=false | pending |
| Search input filters items by name | Type "fries", only fries shown | pending |
| Search clears on X tap | Clear search, all items shown | pending |
| "Add Category" button opens add category modal | fireEvent.press | pending |
| Category form validation — name required | Submit empty, error shown | pending |
| Save category calls saveCategory() | Fill form, press Save | pending |
| "Add Item" button opens add item modal | fireEvent.press | pending |
| Item form validation — price must be positive | Enter -1, error shown | pending |
| Save item calls saveItem() | Fill form, press Save | pending |
| Edit item calls updateItem() | Edit price, save | pending |
| Delete item with confirmation | Press Delete, confirm | pending |
| Modifier group renders correctly in item detail | 2 groups, each with options | pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Menu tab loads from Dashboard | `full_offline_test.yaml` step | **passing** |
| Menu screen shows seeded mock categories | assert category cards visible | pending |
| Tap category — items load correctly | pending |
| Toggle item availability — visual change visible | pending |
| Add new category | pending |
| Add new item to category | pending |
| Search for item by name | pending |
| Menu data persists after app restart | pending |

---

## E2E Tests — Online (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| Menu categories load from backend API | `online/menu_load.yaml` | pending |
| Add item syncs to backend | pending |
| Price update syncs to backend | pending |
| Availability toggle syncs to backend | pending |

---

## Acceptance Criteria

- [ ] Mock menu data seeded on first launch (offline)
- [ ] Categories and items display correctly
- [ ] Item availability toggle persists in SQLite
- [ ] Search works across item names and descriptions
- [ ] Item price and modifier calculations are accurate
- [ ] CRUD for categories and items works offline
- [ ] Menu visible and selectable from Order creation flow
