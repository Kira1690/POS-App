# Implementation Phases - Table Management Settings

## Phase Overview

| Phase | Name | Duration | Lines of Code | Components | Priority |
|-------|------|----------|---------------|------------|----------|
| 1 | Foundation | 12 hours | ~2,100 | Types, Services, Context | CRITICAL |
| 2 | Floor Plan View | 18 hours | ~2,000 | Main UI, Grid, Cards | HIGH |
| 3 | Table Operations | 16 hours | ~2,200 | Modals, Workflows | HIGH |
| 4 | Configuration | 14 hours | ~1,800 | Forms, Settings | MEDIUM |
| 5 | Polish & Testing | 8 hours | ~1,400 | Tests, Integration | CRITICAL |

**Total**: 68 hours (~11 days) | ~9,500 lines of code

---

## Phase 1: Foundation (12 hours, 2 days)

### Goal
Create all data structures, service layer, state management, and mock data for development.

### Tasks

#### 1.1 TypeScript Types & Interfaces (2 hours)
**File**: `/src/types/table-management.types.ts` (~300 lines)

- [ ] Define `Table` interface with all properties
- [ ] Define `Area` interface
- [ ] Define `Reservation` interface
- [ ] Define operation request/response types (Merge, Split, Transfer)
- [ ] Define UI state types (Filters, Grid Config)
- [ ] Define service interfaces
- [ ] Define API response types
- [ ] Define WebSocket update types
- [ ] Export all types

**Acceptance Criteria**:
- ✅ All types have proper TypeScript strict mode compliance
- ✅ NO `any` types used
- ✅ All interfaces have JSDoc comments
- ✅ Enums defined for status, shape, size

#### 1.2 Mock Data (2 hours)
**Files**: `/src/data/table-management/*.ts` (~390 lines)

- [ ] Create `mockTables.ts` with 20+ sample tables
- [ ] Create `mockAreas.ts` with 4 dining areas
- [ ] Create `mockReservations.ts` with sample reservations
- [ ] Create `constants.ts` with defaults

**Mock Data Requirements**:
- 20 tables across 4 areas
- Various statuses: 40% available, 35% occupied, 15% reserved, 10% cleaning
- Different capacities: 2, 4, 6, 8 seats
- Different shapes and sizes

#### 1.3 Service Layer (4 hours)
**Files**: `/src/services/table-management/*.ts` (~1,100 lines)

- [ ] `TableManagementService.ts` - CRUD operations (~200 lines)
- [ ] `AreaService.ts` - Area management (~150 lines)
- [ ] `TableOperationsService.ts` - Merge/split/transfer (~180 lines)
- [ ] `ReservationService.ts` - Reservation management (~160 lines)
- [ ] `TableUpdatesService.ts` - WebSocket integration (~150 lines)
- [ ] Mock implementations for each service (~400 lines total)
- [ ] `index.ts` - Export all services

**Service Requirements**:
- All methods async with Promise returns
- Error handling with try/catch
- Logging for all operations
- Mock delay simulation (300-500ms)

#### 1.4 Context & State Management (3 hours)
**Files**: `/src/context/table-management/*.tsx` (~430 lines)

- [ ] `TableManagementContext.tsx` - Context and reducer (~280 lines)
- [ ] `TableManagementProvider.tsx` - Provider wrapper (~150 lines)
- [ ] Define state interface
- [ ] Define all actions
- [ ] Implement reducer with all cases
- [ ] Create context value with methods
- [ ] Add useEffect for data loading
- [ ] Add WebSocket subscription
- [ ] `index.ts` - Export context and hooks

**State Requirements**:
- Tables, areas, reservations arrays
- Selected table IDs
- Active filter and search query
- Operation state (merge/split/transfer)
- Loading and error state

#### 1.5 Custom Hooks & Utilities (1 hour)
**Files**: `/src/hooks/table-management/*.ts` + `/src/utils/table-management/*.ts` (~390 lines)

Hooks:
- [ ] `useTableManagement.ts` - Context consumer (~40 lines)
- [ ] `useTableFilters.ts` - Filter logic (~80 lines)
- [ ] `useTableSearch.ts` - Search logic (~60 lines)
- [ ] `useTableOperations.ts` - Operation helpers (~100 lines)

Utils:
- [ ] `tableValidation.ts` - Validation functions (~120 lines)
- [ ] `tableCalculations.ts` - Capacity calculations (~80 lines)
- [ ] `tableSorting.ts` - Sort utilities (~60 lines)
- [ ] `tableFormatting.ts` - Display formatting (~50 lines)

### Phase 1 Deliverables
- ✅ All types defined and exported
- ✅ Mock data created
- ✅ All services implemented (real + mock)
- ✅ Context provider working
- ✅ Hooks and utilities ready
- ✅ Can fetch and display data in console

### Phase 1 Testing
```bash
npm run type-check  # Must pass
npm test -- services  # Service tests
npm test -- context  # Context tests
```

---

## Phase 2: Floor Plan View (18 hours, 3 days)

### Goal
Build the main visual interface for viewing and interacting with the floor plan.

### Tasks

#### 2.1 Table Card Components (3 hours)
**Files**: `/src/components/table-management/table-card/*.tsx` (~190 lines)

- [ ] `TableCard.tsx` - Main table visual (~120 lines)
  - Status color bar on left
  - Table number display
  - Capacity badge
  - Tap and long-press handlers
  - Theme integration
  - AppleCard wrapper

- [ ] `TableStatusIndicator.tsx` - Status color bar (~40 lines)
- [ ] `CapacityBadge.tsx` - Capacity pill (~30 lines)

**Component Requirements**:
- Use `useTheme()` hook
- NO hardcoded colors
- Touch targets >= 56px
- React.memo optimization
- Props interface with JSDoc

#### 2.2 Filter Bar Components (3 hours)
**Files**: `/src/components/table-management/floor-plan/*.tsx` (~210 lines)

- [ ] `FilterBar.tsx` - Filter pills row (~90 lines)
  - All, Available, Occupied, Reserved, Cleaning filters
  - ApplePill components
  - Active filter state
  - Theme colors

- [ ] `TableSearchBar.tsx` - Search input (~70 lines)
  - Text input with icon
  - Clear button
  - Debounced search
  - Theme styling

- [ ] `TableLegend.tsx` - Status legend (~60 lines)
  - Collapsible card
  - Status color dots
  - Labels

**Component Requirements**:
- Horizontal scroll support for filter bar
- Search debounce 300ms
- Keyboard handling
- Accessibility labels

#### 2.3 Floor Plan Grid (6 hours)
**Files**: `/src/components/table-management/floor-plan/*.tsx` (~450 lines)

- [ ] `FloorPlanGrid.tsx` - Grid rendering (~200 lines)
  - FlatList with grid layout
  - Performance optimizations
  - getItemLayout
  - Responsive columns (2-4)
  - Loading skeleton

- [ ] `FloorPlanView.tsx` - Main layout (~250 lines)
  - FilterBar integration
  - TableSearchBar integration
  - FloorPlanGrid integration
  - TableLegend integration
  - Layout composition

- [ ] `AreaHeader.tsx` - Area section header (~50 lines)
  - Area name and count
  - Expand/collapse toggle
  - Theme styling

**Grid Requirements**:
- Support 50+ tables efficiently
- Render time < 16ms
- Smooth scrolling
- Grid gap using `spacing.lg`
- Responsive layout

#### 2.4 Table Details Panel (4 hours)
**Files**: `/src/components/table-management/table-details/*.tsx` (~350 lines)

- [ ] `TableDetailsPanel.tsx` - Sidebar layout (~180 lines)
  - Sticky header
  - Scrollable content
  - Table info section
  - Quick actions section
  - Responsive (sidebar tablet, modal mobile)

- [ ] `TableInfoSection.tsx` - Table details display (~90 lines)
  - All table properties
  - AppleCard containers
  - AppleStatusPill for status
  - Timer for occupied duration

- [ ] `QuickActionsGrid.tsx` - Action buttons (~80 lines)
  - 8 action buttons in grid
  - AppleButton components
  - Icons and labels
  - Theme colors per action

**Panel Requirements**:
- Fixed width 320px (tablet)
- Full screen overlay (mobile)
- Smooth animations
- Theme-aware styling

#### 2.5 Main Entry Component (2 hours)
**File**: `/src/screens/settings/components/TableManagementSettings.tsx` (~180 lines)

- [ ] Layout composition
- [ ] Header with title and actions
- [ ] FloorPlanView integration
- [ ] TableDetailsPanel integration
- [ ] Responsive layout
- [ ] Context provider integration
- [ ] Error boundary wrapper

### Phase 2 Deliverables
- ✅ All floor plan components render correctly
- ✅ Filters work and update grid
- ✅ Search works with debounce
- ✅ Table selection works
- ✅ Details panel shows selected table
- ✅ Theme integration complete
- ✅ Responsive on tablet and mobile

### Phase 2 Testing
```bash
npm test -- components/table-management/table-card
npm test -- components/table-management/floor-plan
npm test -- components/table-management/table-details
```

---

## Phase 3: Table Operations (16 hours, 2.5 days)

### Goal
Implement all table operation workflows (merge, split, transfer, reservation).

### Tasks

#### 3.1 Shared Operation Components (2 hours)
**Files**: `/src/components/table-management/operations/*.tsx` + `/src/components/table-management/shared/*.tsx` (~210 lines)

- [ ] `StepIndicator.tsx` - Multi-step progress (~60 lines)
- [ ] `ValidationMessage.tsx` - Error/warning display (~40 lines)
- [ ] `TableSelectionGrid.tsx` - Multi-select grid (~120 lines)

#### 3.2 Table Merge Operation (4 hours)
**Files**: `/src/components/table-management/operations/*.tsx` (~420 lines)

- [ ] `TableMergeModal.tsx` - Main modal (~280 lines)
  - 3-step workflow
  - Step routing
  - State management
  - Validation
  - Confirmation

- [ ] `MergeConfigForm.tsx` - Configuration form (~140 lines)
  - Primary table selector
  - Party size input
  - Customer name input
  - Special requests textarea
  - Server assignment dropdown

**Merge Requirements**:
- Validate 2+ tables selected
- Check all tables available/compatible
- Calculate combined capacity
- Create merged table representation
- Update backend via service

#### 3.3 Table Split Operation (5 hours)
**Files**: `/src/components/table-management/operations/*.tsx` (~470 lines)

- [ ] `TableSplitModal.tsx` - Main modal (~290 lines)
  - 3-step workflow
  - Split method selection
  - Configuration by method
  - Payment assignment
  - Validation

- [ ] `SplitConfigForm.tsx` - Configuration form (~180 lines)
  - By People: Number input, equal split toggle
  - By Items: Item checkboxes, grouping
  - Custom: Amount inputs per split
  - Real-time calculation

**Split Requirements**:
- Support 3 split methods
- Validate total equals bill amount
- Track payment status per split
- Update order splits in backend
- Handle partial payments

#### 3.4 Table Transfer Operation (3 hours)
**Files**: `/src/components/table-management/operations/*.tsx` (~370 lines)

- [ ] `TableTransferModal.tsx` - Main modal (~250 lines)
  - 4-step workflow
  - Source confirmation
  - Destination selection
  - Transfer configuration
  - Final confirmation

- [ ] `TransferConfigForm.tsx` - Configuration form (~120 lines)
  - Reason dropdown
  - Notes textarea
  - Notify kitchen toggle
  - Update reservation toggle

**Transfer Requirements**:
- Validate destination available
- Check capacity compatibility
- Update order table association
- Update reservation if exists
- Notify relevant staff

#### 3.5 Reservation Management (2 hours)
**File**: `/src/components/table-management/operations/ReservationModal.tsx` (~260 lines)

- [ ] Guest information section
- [ ] Date/time pickers
- [ ] Table recommendation
- [ ] Special requests
- [ ] Notification preferences
- [ ] Form validation
- [ ] Availability check

### Phase 3 Deliverables
- ✅ Merge operation complete and functional
- ✅ Split operation complete with 3 methods
- ✅ Transfer operation complete with validation
- ✅ Reservation creation working
- ✅ All modals use Apple styling
- ✅ Validation prevents invalid operations
- ✅ Error handling comprehensive

### Phase 3 Testing
```bash
npm test -- components/table-management/operations
npm test -- services/table-management/TableOperationsService
```

---

## Phase 4: Configuration & Settings (14 hours, 2 days)

### Goal
Build configuration interfaces for tables, areas, and floor plan settings.

### Tasks

#### 4.1 Table Configuration Form (5 hours)
**File**: `/src/components/table-management/configuration/TableConfigurationForm.tsx` (~280 lines)

- [ ] Form header (add/edit mode)
- [ ] Basic information section
  - Table number input
  - Capacity stepper
- [ ] Location section
  - Area dropdown
  - Position selector
- [ ] Physical properties section
  - Shape selector (4 options)
  - Size selector (3 options)
- [ ] Operational settings section
  - Active toggle
  - Online booking toggle
- [ ] Notes textarea
- [ ] Form footer (cancel/save buttons)
- [ ] Validation logic
- [ ] Submit handler

**Form Requirements**:
- All fields validated
- Required fields marked
- Real-time validation feedback
- Theme-aware styling
- Scrollable content

#### 4.2 Area Management (4 hours)
**Files**: `/src/components/table-management/configuration/*.tsx` (~370 lines)

- [ ] `AreaManagementPanel.tsx` - Area list (~220 lines)
  - Area cards list
  - Add area button
  - Edit/delete actions
  - Table count display
  - Capacity summary
  - Drag-to-reorder (future)

- [ ] `AreaForm.tsx` - Add/edit form (~150 lines)
  - Name input (required)
  - Description textarea
  - Color picker
  - Active toggle
  - Reservations toggle
  - Server assignment dropdown
  - Validation

**Area Requirements**:
- CRUD operations for areas
- Cannot delete area with tables
- Color preview in list
- Drag-to-reorder display order

#### 4.3 Bulk Operations (2 hours)
**File**: `/src/components/table-management/configuration/BulkOperationsPanel.tsx` (~180 lines)

- [ ] Selection count display
- [ ] Bulk action buttons
  - Change status
  - Assign area
  - Mark cleaning
  - Deactivate
- [ ] Selected tables preview
- [ ] Confirmation dialogs
- [ ] Progress feedback

**Bulk Requirements**:
- Multi-select tables
- Apply action to all selected
- Confirm before destructive actions
- Show progress for large selections

#### 4.4 Floor Plan Settings (3 hours)
**File**: `/src/components/table-management/configuration/FloorPlanSettingsPanel.tsx` (~250 lines)

- [ ] Grid configuration section
  - Grid size dropdown
  - Spacing slider
  - Snap to grid toggle
- [ ] Display options section
  - Show numbers toggle
  - Show capacity toggle
  - Show status toggle
  - Show assignments toggle
- [ ] Color customization section
  - Status color pickers (4 colors)
  - Preview for each
- [ ] Label settings section
  - Font size slider
  - Position radio buttons
- [ ] Advanced settings section
  - Drag-drop toggle
  - Auto-save toggle
  - Backup toggle
- [ ] Reset defaults button
- [ ] Save settings button

### Phase 4 Deliverables
- ✅ Table configuration form working
- ✅ Area management CRUD complete
- ✅ Bulk operations functional
- ✅ Floor plan settings saving
- ✅ All forms validated
- ✅ Theme integration complete

### Phase 4 Testing
```bash
npm test -- components/table-management/configuration
```

---

## Phase 5: Polish & Testing (8 hours, 1.5 days)

### Goal
Integration, testing, polish, and deployment preparation.

### Tasks

#### 5.1 Settings Integration (2 hours)

- [ ] Update `SettingsScreen.tsx`
  - Add table_management category
  - Add to renderCategoryContent
  - Test navigation

- [ ] Update `App.tsx` (if needed)
  - Wrap with TableManagementProvider

- [ ] Create component index
  - Export all components from `/src/components/table-management/index.ts`

- [ ] Test settings navigation
  - Navigate to Table Management
  - All panels load correctly
  - Back navigation works

#### 5.2 Error Boundaries & Loading States (2 hours)

- [ ] `TableManagementErrorBoundary.tsx` (~100 lines)
  - Catch component errors
  - Display user-friendly message
  - Reload button

- [ ] Loading skeletons
  - FloorPlanGrid skeleton
  - TableCard skeleton
  - TableDetailsPanel skeleton

- [ ] Error states
  - Network error display
  - Empty state display
  - No results found

#### 5.3 Unit Tests (2 hours)

- [ ] Service tests
  - TableManagementService.test.ts
  - AreaService.test.ts
  - TableOperationsService.test.ts

- [ ] Context tests
  - TableManagementContext.test.tsx

- [ ] Utility tests
  - tableValidation.test.ts
  - tableCalculations.test.ts

**Coverage Target**: 70%+

#### 5.4 Component Tests (1.5 hours)

- [ ] TableCard.test.tsx
- [ ] FloorPlanGrid.test.tsx
- [ ] FilterBar.test.tsx
- [ ] TableMergeModal.test.tsx
- [ ] TableConfigurationForm.test.tsx

**Test Requirements**:
- Render tests
- Interaction tests
- Theme integration tests
- Error handling tests

#### 5.5 End-to-End Workflow Tests (30 minutes)

- [ ] Test complete merge workflow
- [ ] Test complete split workflow
- [ ] Test complete transfer workflow
- [ ] Test table creation
- [ ] Test area management
- [ ] Test filter and search

### Phase 5 Deliverables
- ✅ Integrated into Settings
- ✅ Error boundaries working
- ✅ Loading states implemented
- ✅ 70%+ test coverage
- ✅ All workflows tested end-to-end
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Ready for production

### Phase 5 Testing
```bash
npm run type-check       # Must pass
npm run lint             # Must pass
npm test                 # 70%+ coverage
npm test -- --coverage   # Check coverage report
```

---

## Dependencies Between Phases

```
Phase 1 (Foundation)
    ↓
    Required by all other phases
    ↓
Phase 2 (Floor Plan View) ←→ Phase 3 (Operations)
    ↓                              ↓
    ↓                         Uses TableCard
    ↓                              ↓
Phase 4 (Configuration)
    ↓
    Uses components from Phase 2
    ↓
Phase 5 (Polish & Testing)
    ↓
    Integrates everything
```

## Risk Mitigation

### Phase 1 Risks
- **Risk**: Complex type definitions cause errors
  - **Mitigation**: Start with simple types, add complexity incrementally

### Phase 2 Risks
- **Risk**: Performance issues with large grids
  - **Mitigation**: Implement FlatList optimization early, test with 50+ tables

### Phase 3 Risks
- **Risk**: Operation workflows too complex
  - **Mitigation**: Build step-by-step, test each step independently

### Phase 4 Risks
- **Risk**: Form validation edge cases
  - **Mitigation**: Write validation tests first, cover all cases

### Phase 5 Risks
- **Risk**: Integration issues
  - **Mitigation**: Test integration early in phase 4

## Progress Tracking

Track progress in `progress-tracking.md`:
- [ ] Daily updates
- [ ] Task completion checkboxes
- [ ] Blockers documented
- [ ] Time estimates vs actual

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Total Phases**: 5
**Total Duration**: 68 hours (~11 days)
**Ready for Implementation**: ✅ YES
