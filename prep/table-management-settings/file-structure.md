# File Structure - Table Management Settings

## Complete File Tree

```
src/
├── screens/
│   └── settings/
│       ├── SettingsScreen.tsx [UPDATE: Add table_management category]
│       └── components/
│           └── TableManagementSettings.tsx [CREATE: 180 lines - Main entry component]
│
├── components/
│   └── table-management/
│       ├── index.ts [CREATE: Export all components]
│       │
│       ├── floor-plan/
│       │   ├── FloorPlanView.tsx [CREATE: 250 lines - Main floor plan layout]
│       │   ├── FloorPlanGrid.tsx [CREATE: 200 lines - Grid rendering]
│       │   ├── FilterBar.tsx [CREATE: 90 lines - Filter pills]
│       │   ├── TableSearchBar.tsx [CREATE: 70 lines - Search input]
│       │   ├── TableLegend.tsx [CREATE: 60 lines - Status legend]
│       │   └── AreaHeader.tsx [CREATE: 50 lines - Area section header]
│       │
│       ├── table-card/
│       │   ├── TableCard.tsx [CREATE: 120 lines - Table visual representation]
│       │   ├── TableStatusIndicator.tsx [CREATE: 40 lines - Status color bar]
│       │   └── CapacityBadge.tsx [CREATE: 30 lines - Capacity pill]
│       │
│       ├── table-details/
│       │   ├── TableDetailsPanel.tsx [CREATE: 180 lines - Sidebar details]
│       │   ├── TableInfoSection.tsx [CREATE: 90 lines - Table info display]
│       │   └── QuickActionsGrid.tsx [CREATE: 80 lines - Action buttons grid]
│       │
│       ├── operations/
│       │   ├── TableMergeModal.tsx [CREATE: 280 lines - Merge workflow]
│       │   ├── TableSplitModal.tsx [CREATE: 290 lines - Split workflow]
│       │   ├── TableTransferModal.tsx [CREATE: 250 lines - Transfer workflow]
│       │   ├── ReservationModal.tsx [CREATE: 260 lines - Reservation form]
│       │   ├── StepIndicator.tsx [CREATE: 60 lines - Multi-step progress]
│       │   ├── MergeConfigForm.tsx [CREATE: 140 lines - Merge configuration]
│       │   ├── SplitConfigForm.tsx [CREATE: 180 lines - Split configuration]
│       │   └── TransferConfigForm.tsx [CREATE: 120 lines - Transfer configuration]
│       │
│       ├── configuration/
│       │   ├── TableConfigurationForm.tsx [CREATE: 280 lines - Add/edit table]
│       │   ├── AreaManagementPanel.tsx [CREATE: 220 lines - Area CRUD]
│       │   ├── AreaForm.tsx [CREATE: 150 lines - Add/edit area]
│       │   ├── BulkOperationsPanel.tsx [CREATE: 180 lines - Bulk actions]
│       │   ├── FloorPlanSettingsPanel.tsx [CREATE: 250 lines - Settings form]
│       │   └── GridPositionSelector.tsx [CREATE: 100 lines - Position picker]
│       │
│       └── shared/
│           ├── DraggableTableCard.tsx [CREATE: 150 lines - Drag & drop wrapper]
│           ├── TableSelectionGrid.tsx [CREATE: 120 lines - Multi-select grid]
│           └── ValidationMessage.tsx [CREATE: 40 lines - Error/warning display]
│
├── context/
│   └── table-management/
│       ├── TableManagementContext.tsx [CREATE: 280 lines - State management]
│       ├── TableManagementProvider.tsx [CREATE: 150 lines - Provider wrapper]
│       └── index.ts [CREATE: Export context and hooks]
│
├── services/
│   └── table-management/
│       ├── TableManagementService.ts [CREATE: 200 lines - Table CRUD]
│       ├── AreaService.ts [CREATE: 150 lines - Area CRUD]
│       ├── TableOperationsService.ts [CREATE: 180 lines - Merge/split/transfer]
│       ├── ReservationService.ts [CREATE: 160 lines - Reservation management]
│       ├── TableUpdatesService.ts [CREATE: 150 lines - WebSocket updates]
│       ├── MockTableManagementService.ts [CREATE: 250 lines - Mock data]
│       ├── MockAreaService.ts [CREATE: 150 lines - Mock areas]
│       ├── MockTableOperationsService.ts [CREATE: 200 lines - Mock operations]
│       └── index.ts [CREATE: Export all services]
│
├── types/
│   └── table-management.types.ts [CREATE: 300 lines - All TypeScript interfaces]
│
├── hooks/
│   └── table-management/
│       ├── useTableManagement.ts [CREATE: 40 lines - Context hook]
│       ├── useTableFilters.ts [CREATE: 80 lines - Filter logic]
│       ├── useTableSearch.ts [CREATE: 60 lines - Search logic]
│       └── useTableOperations.ts [CREATE: 100 lines - Operation helpers]
│
├── utils/
│   └── table-management/
│       ├── tableValidation.ts [CREATE: 120 lines - Validation logic]
│       ├── tableCalculations.ts [CREATE: 80 lines - Capacity, area calculations]
│       ├── tableSorting.ts [CREATE: 60 lines - Sort utilities]
│       └── tableFormatting.ts [CREATE: 50 lines - Display formatting]
│
└── data/
    └── table-management/
        ├── mockTables.ts [CREATE: 150 lines - Mock table data]
        ├── mockAreas.ts [CREATE: 80 lines - Mock area data]
        ├── mockReservations.ts [CREATE: 100 lines - Mock reservation data]
        └── constants.ts [CREATE: 60 lines - Constants and defaults]
```

## File Size Breakdown

### Components (35 files)
- **Under 100 lines**: 8 files
- **100-200 lines**: 18 files
- **200-300 lines**: 9 files
- **Average**: ~150 lines
- **Maximum**: 290 lines (TableSplitModal)

### Services (9 files)
- **Average**: ~180 lines
- **Maximum**: 250 lines (MockTableManagementService)

### Context (3 files)
- **Total**: ~430 lines

### Types (1 file)
- **Total**: ~300 lines (comprehensive interfaces)

### Hooks (4 files)
- **Average**: ~70 lines

### Utils (4 files)
- **Average**: ~78 lines

### Data (4 files)
- **Average**: ~98 lines

## Total Project Size

- **Total Files**: 60 files
- **Estimated Total Lines**: ~9,500 lines
- **All files under 300 line limit**: ✅ YES
- **SOLID compliant**: ✅ YES

## Reusable vs Feature-Specific

### Reusable Components (Can be used elsewhere)
- `FilterBar.tsx` - Generic filter bar
- `TableSearchBar.tsx` - Generic search input
- `StepIndicator.tsx` - Multi-step wizard indicator
- `ValidationMessage.tsx` - Error/warning display
- `GridPositionSelector.tsx` - Position picker

### Feature-Specific Components (Table management only)
- All components in `floor-plan/`
- All components in `operations/`
- All components in `configuration/`
- `TableCard.tsx`
- `TableDetailsPanel.tsx`

## Integration Files (Existing files to modify)

### SettingsScreen.tsx
**Location**: `/src/screens/settings/SettingsScreen.tsx`

**Changes Required**:
```typescript
// ADD to SETTINGS_CATEGORIES array
{
  id: 'table_management',
  label: 'Table Management',
  icon: '🪑',
  iconBackground: '#FF9500', // Apple orange
}

// ADD to renderCategoryContent() switch
case 'table_management':
  return <TableManagementSettings onChangesDetected={setHasUnsavedChanges} />;
```

**Lines Added**: ~5 lines

### App.tsx (if not already added)
**Location**: `/src/App.tsx`

**Changes Required**:
```typescript
// Import provider
import { TableManagementProvider } from '@/context/table-management';

// Wrap app with provider
<TableManagementProvider>
  {/* Existing providers */}
</TableManagementProvider>
```

**Lines Added**: ~3 lines

## File Creation Order (By Phase)

### Phase 1: Foundation (Day 1-2)
1. `/src/types/table-management.types.ts`
2. `/src/data/table-management/*.ts` (all mock data)
3. `/src/services/table-management/*.ts` (all services)
4. `/src/utils/table-management/*.ts` (all utilities)
5. `/src/context/table-management/*.tsx` (context and provider)
6. `/src/hooks/table-management/*.ts` (all hooks)

### Phase 2: Floor Plan View (Day 3-5)
7. `/src/components/table-management/table-card/*.tsx`
8. `/src/components/table-management/floor-plan/*.tsx`
9. `/src/components/table-management/table-details/*.tsx`
10. `/src/components/table-management/shared/TableSelectionGrid.tsx`

### Phase 3: Table Operations (Day 6-8)
11. `/src/components/table-management/shared/ValidationMessage.tsx`
12. `/src/components/table-management/operations/StepIndicator.tsx`
13. `/src/components/table-management/operations/*ConfigForm.tsx`
14. `/src/components/table-management/operations/*Modal.tsx`

### Phase 4: Configuration (Day 9-10)
15. `/src/components/table-management/configuration/*.tsx`
16. `/src/components/table-management/shared/DraggableTableCard.tsx`

### Phase 5: Integration & Polish (Day 11)
17. `/src/screens/settings/components/TableManagementSettings.tsx`
18. `/src/components/table-management/index.ts`
19. Update `/src/screens/settings/SettingsScreen.tsx`
20. Update `/src/App.tsx` (if needed)

## Import Aliases Used

All files use TypeScript path aliases:
```typescript
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleCard, AppleButton } from '@/components/apple';
import { Table, Area } from '@/types/table-management.types';
import { TableManagementService } from '@/services/table-management';
```

## Git Strategy

### Branches
- `feature/table-management-settings` (main feature branch)
- `feature/table-management-phase-1` (foundation)
- `feature/table-management-phase-2` (floor plan)
- etc.

### Commits
- Commit after each component completion
- Run tests before committing
- Squash before merging to main

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Total Files**: 60 files
**All Under 300 Lines**: ✅ YES
