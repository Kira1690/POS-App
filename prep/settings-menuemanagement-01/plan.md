# Menu Management Settings - Master Plan

## Project Overview

**Feature**: Menu Management section in Settings tab
**Location**: `src/screens/settings/components/menuManagement/`
**Pattern**: Full-screen application (like Table Management)
**Start Date**: 2025-12-23
**Estimated Duration**: 25 working days

---

## Objectives

### Primary Goals
1. Create comprehensive menu management interface in Settings tab
2. Enable full CRUD operations for categories, items, modifiers, and combos
3. Implement real-time synchronization with Order screen
4. Support nutritional information and dietary tags

### Success Criteria
- All menu changes in Settings immediately reflect in Order screen
- Support for complex item customizations (modifiers, variants)
- Ability to create and manage combo/meal deals
- Complete nutritional info and allergen tracking
- Import/export functionality for menu data

---

## Architecture Decisions

### UI Pattern: Full-Screen Application
**Why**: Menu management is a complex feature requiring:
- Multiple tabs for different entity types
- Sidebar for category navigation
- Properties panel for item details
- Bulk operations toolbar

**Reference**: Following `src/screens/settings/components/tableManagement/` pattern

### Real-Time Sync: Context + Event Bus Hybrid
**Why**: Need immediate sync without unnecessary re-renders
- `MenuContext` provides shared state across app
- `MenuEventEmitter` enables fine-grained update notifications
- Order screen subscribes to specific events (price changes, availability)

### Component Organization: Feature-Based Folders
```
menuManagement/
├── index.tsx           # Container
├── MenuEditorSettings.tsx  # Main orchestrator
├── components/         # UI components
├── modals/            # Modal dialogs
├── hooks/             # State management
└── utils/             # Utilities
```

---

## Feature Scope

### Core Features (Must Have)
| Feature | Description | Priority |
|---------|-------------|----------|
| Category CRUD | Create, edit, delete, reorder categories | P0 |
| Menu Item CRUD | Full item management with images | P0 |
| Availability Toggle | Quick enable/disable items | P0 |
| Search & Filter | Find items by name, category, status | P0 |
| Real-time Sync | Changes reflect in Order screen | P0 |

### Advanced Features (Should Have)
| Feature | Description | Priority |
|---------|-------------|----------|
| Modifier Groups | Size options, add-ons, customizations | P1 |
| Combo Deals | Bundle items with special pricing | P1 |
| Nutritional Info | Calories, allergens, dietary tags | P1 |
| Bulk Operations | Multi-select actions | P1 |

### Enhancement Features (Nice to Have)
| Feature | Description | Priority |
|---------|-------------|----------|
| Import/Export | CSV/JSON menu data | P2 |
| Undo/Redo | Revert menu changes | P2 |
| Drag-to-Reorder | Reorder categories/items | P2 |
| Image Upload | Item images with optimization | P2 |

---

## Implementation Phases

### Phase 0: Documentation (Day 1)
- Create prep folder documentation
- Define all wireframes and data structures
- Establish user flows

### Phase 1: Foundation (Days 2-4)
- Define extended types for modifiers, combos, nutrition
- Create MenuContext for shared state
- Implement MenuEventEmitter for sync
- Update SettingsScreen to include new category

### Phase 2: Core UI (Days 5-8)
- Container and main orchestrator components
- Tab navigation (Categories | Items | Modifiers | Combos)
- Toolbar with search, filters, view toggle
- 3-panel layout (sidebar, content, stats)

### Phase 3: Category & Item CRUD (Days 9-12)
- Category sidebar with list
- Add/Edit/Delete category modals
- Menu item grid and cards
- Add/Edit/Delete item modals (multi-step wizard)
- Bulk actions bar

### Phase 4: Modifiers System (Days 13-15)
- Modifier group management
- Modifier options with pricing
- Assignment to menu items
- Single vs multiple selection types

### Phase 5: Combos System (Days 16-18)
- Combo deal management
- Item selection for combos
- Pricing with savings calculation
- Time-based availability

### Phase 6: Nutritional Info (Days 19-20)
- Nutritional facts editor
- Allergen selection
- Dietary tags (vegetarian, vegan, etc.)
- Display badges on items

### Phase 7: Order Screen Sync (Days 21-23)
- Update useMenu hook
- Create useMenuSync hook
- Handle edge cases (deleted items in cart, price changes)
- Visual indicators for sync status

### Phase 8: Polish (Days 24-26)
- Import/export functionality
- Undo/redo capability
- Performance optimization
- Testing and bug fixes

---

## Technical Specifications

### New Files Count
| Category | Count |
|----------|-------|
| Components | 22 |
| Modals | 14 |
| Hooks | 5 |
| Utils | 5 |
| Types | 2 |
| Context | 3 |
| Services | 2 |
| **Total** | **53** |

### Key Dependencies
- Existing: `@/components/apple/*` for UI components
- Existing: `@/hooks/useTheme` for theming
- Existing: `MockMenuManagementService` for backend simulation
- New: `MenuContext` for shared state
- New: `MenuEventEmitter` for sync events

### Performance Targets
- Category list load: < 100ms
- Menu items grid render: < 200ms (up to 100 items)
- Search response: < 50ms
- Sync propagation: < 100ms

---

## Risk Assessment

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Context re-renders | Use selectors and memoization |
| Large menu performance | Virtual list for 100+ items |
| Sync race conditions | Optimistic updates with rollback |

### UX Risks
| Risk | Mitigation |
|------|------------|
| Complex modifier UI | Step-by-step wizard |
| Accidental deletions | Confirmation dialogs |
| Data loss on navigation | Unsaved changes detection |

---

## Dependencies on Existing Code

### Files to Modify
1. `src/types/settings.types.ts` - Add 'menu_management' category
2. `src/screens/settings/SettingsScreen.tsx` - Add sidebar item and render case
3. `src/hooks/useMenu.ts` - Update to use MenuContext
4. `src/screens/orders/POSOrderScreen.tsx` - Add sync handling
5. `App.tsx` - Add MenuProvider

### Reference Implementations
- `src/screens/settings/components/tableManagement/` - UI pattern
- `src/context/order/OrderContext.tsx` - Context pattern
- `src/services/menu/MockMenuManagementService.ts` - Service pattern

---

## Success Metrics

### Functional
- [ ] All CRUD operations working for categories
- [ ] All CRUD operations working for menu items
- [ ] Modifier groups can be created and assigned
- [ ] Combo deals with pricing work correctly
- [ ] Nutritional info displays on items
- [ ] Real-time sync with Order screen verified

### Quality
- [ ] All components under 300 lines
- [ ] 100% theme compliance (no hardcoded colors)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Component render time < 16ms

---

## Next Steps

1. Review and approve this plan
2. Create wireframes.md with detailed UI mockups
3. Create data-structures.md with all TypeScript interfaces
4. Create user-flows.md with interaction documentation
5. Begin Phase 1 implementation
