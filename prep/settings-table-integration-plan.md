# Settings Table Management Integration Plan

## 📋 Overview
This plan details the integration of table management features into the Settings page with a dual-navigation system:
- **Sidebar Navigation** (left): Main settings categories
- **Top Tab Navigation** (within each category): Sub-sections for detailed configuration

## 🎨 Wireframe 1: Overall Settings Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ System Settings                                    [Save All] [Dashboard]│
│ Restaurant Profile                                                       │
├─────────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR (280px) │ CONTENT AREA (Dynamic)                               │
│                 │                                                       │
│ ┌─────────────┐ │ ┌──────────────────────────────────────────────────┐│
│ │🏪 Restaurant│ │ │ TOP TAB NAVIGATION (When applicable)             ││
│ │  Profile    │ │ │ General │ Tables │ Menu │ Staff │ Advanced        ││
│ ├─────────────┤ │ └──────────────────────────────────────────────────┘│
│ │👥 User Mgmt │ │                                                       │
│ ├─────────────┤ │ ┌──────────────────────────────────────────────────┐│
│ │📱 Device &  │ │ │                                                   ││
│ │  Hardware   │ │ │  SETTINGS CONTENT BASED ON:                      ││
│ ├─────────────┤ │ │  - Selected sidebar category                     ││
│ │💳 Payment   │ │ │  - Selected top tab (if applicable)              ││
│ ├─────────────┤ │ │                                                   ││
│ │🪑 TABLE MGMT│◄├─┼─┤  NEW: Table Management with sub-tabs            ││
│ │  [SELECTED] │ │ │                                                   ││
│ ├─────────────┤ │ │                                                   ││
│ │🔗 Integrat. │ │ │                                                   ││
│ ├─────────────┤ │ └──────────────────────────────────────────────────┘│
│ │🔒 Security  │ │                                                       │
│ ├─────────────┤ │                                                       │
│ │📊 Sys Logs  │ │                                                       │
│ ├─────────────┤ │                                                       │
│ │❓ Help      │ │                                                       │
│ └─────────────┘ │                                                       │
└─────────────────┴───────────────────────────────────────────────────────┘
```

## 🎨 Wireframe 2: Table Management - General Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ System Settings › Table Management                [Save All] [Dashboard]│
├─────────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR         │ TOP TAB NAVIGATION                                   │
│                 │ ┌─────────┬────────┬─────────┬──────────┬──────────┐│
│ 🪑 TABLE MGMT   │ │ GENERAL │ Tables │ Floors  │ Areas    │ Advanced ││
│   [SELECTED]    │ └─────────┴────────┴─────────┴──────────┴──────────┘│
│                 │                                                       │
│                 │ 🪑 General Table Settings                            │
│                 │ ┌──────────────────────────────────────────────────┐│
│                 │ │ Table Configuration                              ││
│                 │ │                                                   ││
│                 │ │ ○ Default Table Capacity:   [4] guests           ││
│                 │ │ ○ Table Number Prefix:      [T-]                 ││
│                 │ │ ○ Auto-assign Tables:       [✓] Enabled          ││
│                 │ │ ○ Table Time Limits:        [120] minutes        ││
│                 │ │                                                   ││
│                 │ │ ─────────────────────────────────────────────    ││
│                 │ │                                                   ││
│                 │ │ Display Preferences                              ││
│                 │ │ ○ Show Table Capacity:      [✓] Show             ││
│                 │ │ ○ Color Code by Status:     [✓] Enabled          ││
│                 │ │ ○ Show Service Duration:    [✓] Show             ││
│                 │ │ ○ Grid Columns (Tablet):    [4] columns          ││
│                 │ │ ○ Grid Columns (Mobile):    [2] columns          ││
│                 │ │                                                   ││
│                 │ │ ─────────────────────────────────────────────    ││
│                 │ │                                                   ││
│                 │ │ Status Management                                ││
│                 │ │ ○ Available Color:   [🟢] #4CAF50                ││
│                 │ │ ○ Occupied Color:    [🔴] #F44336                ││
│                 │ │ ○ Reserved Color:    [🔵] #2196F3                ││
│                 │ │ ○ Cleaning Color:    [🟡] #FFC107                ││
│                 │ │                                                   ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │                         [Cancel] [Save Changes]      │
└─────────────────┴───────────────────────────────────────────────────────┘
```

## 🎨 Wireframe 3: Table Management - Tables Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ System Settings › Table Management                [Save All] [Dashboard]│
├─────────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR         │ TOP TAB NAVIGATION                                   │
│                 │ ┌────────┬────────┬─────────┬──────────┬──────────┐ │
│ 🪑 TABLE MGMT   │ │ General│ TABLES │ Floors  │ Areas    │ Advanced │ │
│   [SELECTED]    │ └────────┴────────┴─────────┴──────────┴──────────┘ │
│                 │                                                       │
│                 │ 🪑 Table Configuration & Management                  │
│                 │                                                       │
│                 │ ┌─ Stats Row ──────────────────────────────────────┐│
│                 │ │  [20] Total  │ [320] Seats │ [12] Avail │ [8] Occ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │ ┌─ Filters ────────────────────────────────────────┐│
│                 │ │ [All (20)] [Available (12)] [Occupied (8)]       ││
│                 │ │ [Reserved (0)] [Cleaning (0)]                    ││
│                 │ │                                                   ││
│                 │ │ 🔍 Search: [_____________________________]       ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │ ┌─ Table Grid (4 columns) ─────────────────────────┐│
│                 │ │                                                   ││
│                 │ │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            ││
│                 │ │  │ T-1 │  │ T-2 │  │ T-3 │  │ T-4 │            ││
│                 │ │  │  4  │  │  2  │  │  6  │  │  4  │            ││
│                 │ │  │ 🟢  │  │ 🔴  │  │ 🟢  │  │ 🔴  │            ││
│                 │ │  └─────┘  └─────┘  └─────┘  └─────┘            ││
│                 │ │                                                   ││
│                 │ │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            ││
│                 │ │  │ T-5 │  │ T-6 │  │ T-7 │  │ T-8 │            ││
│                 │ │  │  8  │  │  2  │  │  4  │  │  6  │            ││
│                 │ │  │ 🔵  │  │ 🟢  │  │ 🟢  │  │ 🔴  │            ││
│                 │ │  └─────┘  └─────┘  └─────┘  └─────┘            ││
│                 │ │                       (scroll for more...)        ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │ [➕ Add Table] [📍 Floor Plan] [🔧 Bulk Edit]       │
└─────────────────┴───────────────────────────────────────────────────────┘
```

## 🎨 Wireframe 4: Table Management - Floor Plan Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ System Settings › Table Management                [Save All] [Dashboard]│
├─────────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR         │ TOP TAB NAVIGATION                                   │
│                 │ ┌────────┬────────┬─────────┬──────────┬──────────┐ │
│ 🪑 TABLE MGMT   │ │ General│ Tables │ FLOORS  │ Areas    │ Advanced │ │
│   [SELECTED]    │ └────────┴────────┴─────────┴──────────┴──────────┘ │
│                 │                                                       │
│                 │ 📍 Interactive Floor Plan Editor                     │
│                 │                                                       │
│                 │ ┌─ Floor Plan Controls ────────────────────────────┐│
│                 │ │ Floor: [Main Floor ▼]  View: [🗺️ Plan] [📋 List]││
│                 │ │ [+] Zoom In  [-] Zoom Out  [⟲] Reset View        ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │ ┌─ Floor Plan Canvas ──────────────────────────────┐│
│                 │ │                                                   ││
│                 │ │  ╔════════════════════════════════════════════╗  ││
│                 │ │  ║                                            ║  ││
│                 │ │  ║  ┌──────────┐                              ║  ││
│                 │ │  ║  │ ENTRANCE │         ┌──────┐            ║  ││
│                 │ │  ║  └──────────┘         │  ⭕  │ T-1        ║  ││
│                 │ │  ║                       └──────┘            ║  ││
│                 │ │  ║    ┌──────┐  ┌──────┐                    ║  ││
│                 │ │  ║    │  ⬜  │  │  ⬜  │     ┌──────────┐   ║  ││
│                 │ │  ║    │  T-2 │  │  T-3 │     │          │   ║  ││
│                 │ │  ║    └──────┘  └──────┘     │ KITCHEN  │   ║  ││
│                 │ │  ║                           │          │   ║  ││
│                 │ │  ║  ┌──────┐                 └──────────┘   ║  ││
│                 │ │  ║  │  ⭕  │  ┌──────┐                      ║  ││
│                 │ │  ║  │  T-4 │  │  ▭   │ T-6                 ║  ││
│                 │ │  ║  └──────┘  └──────┘       ┌──────┐      ║  ││
│                 │ │  ║                           │ BAR  │      ║  ││
│                 │ │  ║     (Drag tables to reposition)  └──────┘      ║  ││
│                 │ │  ║                                            ║  ││
│                 │ │  ╚════════════════════════════════════════════╝  ││
│                 │ │                                                   ││
│                 │ │  Legend: ⭕ Round  ⬜ Square  ▭ Rectangle        ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │ [Edit Mode] [Add Table] [Add Area] [Save Layout]    │
└─────────────────┴───────────────────────────────────────────────────────┘
```

## 🎨 Wireframe 5: Table Management - Areas Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ System Settings › Table Management                [Save All] [Dashboard]│
├─────────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR         │ TOP TAB NAVIGATION                                   │
│                 │ ┌────────┬────────┬─────────┬──────────┬──────────┐ │
│ 🪑 TABLE MGMT   │ │ General│ Tables │ Floors  │ AREAS    │ Advanced │ │
│   [SELECTED]    │ └────────┴────────┴─────────┴──────────┴──────────┘ │
│                 │                                                       │
│                 │ 📍 Section & Area Management                         │
│                 │                                                       │
│                 │ ┌─ Current Sections ───────────────────────────────┐│
│                 │ │                                                   ││
│                 │ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ││
│                 │ │ ┃ 🍽️  MAIN DINING                              ┃ ││
│                 │ │ ┃ Tables: 12  │  Capacity: 48  │  Available: 8 ┃ ││
│                 │ │ ┃ [Edit] [Delete] [View Tables]                ┃ ││
│                 │ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ││
│                 │ │                                                   ││
│                 │ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ││
│                 │ │ ┃ 🥂  VIP LOUNGE                               ┃ ││
│                 │ │ ┃ Tables: 4   │  Capacity: 16  │  Available: 2 ┃ ││
│                 │ │ ┃ [Edit] [Delete] [View Tables]                ┃ ││
│                 │ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ││
│                 │ │                                                   ││
│                 │ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ││
│                 │ │ ┃ 🌳  PATIO                                    ┃ ││
│                 │ │ ┃ Tables: 8   │  Capacity: 32  │  Available: 5 ┃ ││
│                 │ │ ┃ [Edit] [Delete] [View Tables]                ┃ ││
│                 │ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ││
│                 │ │                                                   ││
│                 │ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ││
│                 │ │ ┃ 🍸  BAR SEATING                              ┃ ││
│                 │ │ ┃ Tables: 6   │  Capacity: 12  │  Available: 4 ┃ ││
│                 │ │ ┃ [Edit] [Delete] [View Tables]                ┃ ││
│                 │ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ││
│                 │ │                                                   ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │ [➕ Add New Section] [📊 Section Analytics]         │
└─────────────────┴───────────────────────────────────────────────────────┘
```

## 🎨 Wireframe 6: Table Management - Advanced Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ System Settings › Table Management                [Save All] [Dashboard]│
├─────────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR         │ TOP TAB NAVIGATION                                   │
│                 │ ┌────────┬────────┬─────────┬──────────┬──────────┐ │
│ 🪑 TABLE MGMT   │ │ General│ Tables │ Floors  │ Areas    │ ADVANCED │ │
│   [SELECTED]    │ └────────┴────────┴─────────┴──────────┴──────────┘ │
│                 │                                                       │
│                 │ ⚙️ Advanced Table Settings                           │
│                 │                                                       │
│                 │ ┌─ Automation & Rules ─────────────────────────────┐│
│                 │ │                                                   ││
│                 │ │ Auto-Status Management                           ││
│                 │ │ ○ Auto-mark cleaning after checkout: [✓] Enabled ││
│                 │ │ ○ Cleaning duration estimate:        [15] min    ││
│                 │ │ ○ Auto-clear reservations after:     [30] min    ││
│                 │ │ ○ Notify on long table occupancy:    [✓] Enabled ││
│                 │ │   └─ Alert after:                    [90] min    ││
│                 │ │                                                   ││
│                 │ │ ─────────────────────────────────────────────    ││
│                 │ │                                                   ││
│                 │ │ Reservation Rules                                ││
│                 │ │ ○ Allow overlapping reservations:    [✗] Disabled││
│                 │ │ ○ Buffer time between seatings:      [15] min    ││
│                 │ │ ○ Maximum advance booking:           [60] days   ││
│                 │ │ ○ Require deposit for large groups:  [✓] Enabled ││
│                 │ │   └─ Minimum party size:             [8] guests  ││
│                 │ │                                                   ││
│                 │ │ ─────────────────────────────────────────────    ││
│                 │ │                                                   ││
│                 │ │ Integration Settings                             ││
│                 │ │ ○ Sync with POS system:              [✓] Enabled ││
│                 │ │ ○ Real-time status updates:          [✓] Enabled ││
│                 │ │ ○ Kitchen display integration:       [✓] Enabled ││
│                 │ │                                                   ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │ ┌─ Danger Zone ────────────────────────────────────┐│
│                 │ │ ⚠️  CAUTION: These actions cannot be undone      ││
│                 │ │                                                   ││
│                 │ │ [Reset All Tables]  [Clear All Reservations]     ││
│                 │ │ [Export Configuration]  [Import Configuration]   ││
│                 │ └──────────────────────────────────────────────────┘│
│                 │                                                       │
│                 │                         [Cancel] [Save Changes]      │
└─────────────────┴───────────────────────────────────────────────────────┘
```

## 🏗️ Component Architecture

### 1. Enhanced Settings Screen Structure

```typescript
SettingsScreen.tsx
├─ AppleSidebar (existing)
│  ├─ Restaurant Profile
│  ├─ User Management
│  ├─ Device & Hardware
│  ├─ Payment Configuration
│  ├─ 🆕 TABLE MANAGEMENT ← New Category
│  ├─ Integrations
│  ├─ Security & Backup
│  ├─ System Logs
│  └─ Help & Support
│
└─ AppleSettingsPanel (enhanced)
   ├─ Header (existing)
   ├─ 🆕 TopTabNavigation (conditional - only for categories with sub-sections)
   │  └─ Tabs based on selected category
   └─ Content (dynamic based on sidebar + tab selection)
```

### 2. New Component: TopTabNavigation

```typescript
// Location: src/components/apple/AppleTopTabNavigation.tsx

interface AppleTopTabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Apple-style horizontal tab navigation
// - Sticky position below header
// - Smooth underline indicator
// - Scrollable on mobile
// - Auto-centering active tab
```

### 3. Table Management Settings Component Hierarchy

```
TableManagementSettings/
├─ index.tsx (main container with tab state)
├─ GeneralSettings.tsx (tab content)
├─ TablesSettings.tsx (reuse existing TableManagementSettings.tsx)
├─ FloorPlanSettings.tsx (integrate TablesDashboard.tsx)
├─ AreasSettings.tsx (section management)
└─ AdvancedSettings.tsx (automation & rules)
```

## 📝 Implementation Steps

### Phase 1: Infrastructure Setup
1. **Create TopTabNavigation Component**
   - Design Apple-style horizontal tabs
   - Implement smooth animations
   - Add responsive behavior (scrollable on mobile)
   - Support icons + labels

2. **Enhance AppleSettingsPanel**
   - Add optional `topTabs` prop
   - Render TopTabNavigation when tabs provided
   - Adjust content padding for tabs

### Phase 2: Settings Category Integration
3. **Add Table Management to Sidebar**
   - Update SETTINGS_CATEGORIES in SettingsScreen.tsx
   - Add table management icon (🪑 or MaterialIcon)
   - Define color theme (suggest: #32D74B green)

4. **Create Table Management Container**
   - New file: `settings/components/TableManagementSettingsContainer.tsx`
   - Manage tab state (General, Tables, Floors, Areas, Advanced)
   - Route to appropriate sub-component

### Phase 3: Tab Content Components
5. **General Settings Tab**
   - Default configurations
   - Display preferences
   - Status color customization
   - Form inputs with AppleCard layout

6. **Tables Tab**
   - Reuse existing TableManagementSettings.tsx
   - Stats row, filters, grid view
   - Add/edit table functionality

7. **Floor Plan Tab**
   - Integrate TablesDashboard.tsx floor plan
   - Add edit mode toggle
   - Drag-and-drop table positioning
   - Save layout functionality

8. **Areas Tab**
   - List all sections/areas
   - Show stats per area
   - CRUD operations for areas
   - Assign tables to areas

9. **Advanced Tab**
   - Automation rules
   - Reservation settings
   - Integration toggles
   - Danger zone actions

### Phase 4: State Management & Navigation
10. **Update Settings Types**
    - Add `table_management` to SettingsCategory type
    - Define TableManagementTabType
    - Update navigation types

11. **Connect State Management**
    - Use existing useTableManagement hook
    - Sync changes with context
    - Handle save operations

12. **Testing & Polish**
    - Test navigation flow
    - Verify all tabs render correctly
    - Ensure responsive behavior
    - Test save/cancel operations

## 🎯 Key Features

### Top Tab Navigation Benefits
✅ **Clear Organization**: Each aspect of table management has dedicated space
✅ **Familiar Pattern**: Matches reference image navigation style
✅ **Scalable**: Easy to add new tabs in future
✅ **Responsive**: Works on both tablet and mobile
✅ **Accessible**: Keyboard navigation support

### Integration Advantages
✅ **Centralized Settings**: All configuration in one place
✅ **Consistent UX**: Matches existing settings UI patterns
✅ **Reusable Components**: Leverages existing table components
✅ **Professional Layout**: Apple-style design system
✅ **Easy Navigation**: Side + top navigation for efficiency

## 🔄 User Flow

```
1. User opens Settings
   └─> Sees sidebar with categories

2. User clicks "Table Management" in sidebar
   └─> Content area shows top tabs: General | Tables | Floors | Areas | Advanced
   └─> General tab is selected by default

3. User clicks "Tables" tab
   └─> Shows table grid view with filters
   └─> Same content as existing TableManagementSettings

4. User clicks "Floor Plan" tab
   └─> Shows interactive floor plan
   └─> Can view/edit table positions

5. User clicks "Areas" tab
   └─> Shows all sections (Main Dining, VIP, Patio, Bar)
   └─> Can manage sections

6. User clicks "Advanced" tab
   └─> Shows automation rules and advanced settings

7. User makes changes
   └─> "Save All" button in header saves across all tabs
   └─> Individual "Save Changes" in each tab for granular control
```

## 📁 File Structure

```
src/
├── components/
│   └── apple/
│       ├── AppleTopTabNavigation.tsx          (NEW)
│       └── index.ts                            (update exports)
│
├── screens/
│   └── settings/
│       ├── SettingsScreen.tsx                  (UPDATE - add table mgmt category)
│       └── components/
│           ├── tableManagement/                (UPDATE folder)
│           │   ├── index.tsx                   (NEW - container with tabs)
│           │   ├── GeneralSettings.tsx         (NEW)
│           │   ├── TablesSettings.tsx          (RENAME from TableManagementSettings)
│           │   ├── FloorPlanSettings.tsx       (NEW - integrate TablesDashboard)
│           │   ├── AreasSettings.tsx           (NEW)
│           │   ├── AdvancedSettings.tsx        (NEW)
│           │   ├── TableCard.tsx               (KEEP existing)
│           │   └── TableGrid.tsx               (KEEP existing)
│           │
│           ├── RestaurantProfileSettings.tsx   (existing)
│           └── ... (other settings)
│
└── types/
    └── settings.types.ts                       (UPDATE - add table mgmt types)
```

## 🎨 Design Tokens

### Top Tab Navigation Styling
```typescript
// Following Apple design system
const topTabStyles = {
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    paddingHorizontal: theme.spacing.lg,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.sm,
  },
  activeIndicator: {
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xs,
  },
  label: {
    ...theme.typography.labelLarge,
    fontWeight: '600',
  }
};
```

## ✅ Success Criteria

- [ ] Top tab navigation component created and styled
- [ ] Table Management added to settings sidebar
- [ ] All 5 tabs implemented and functional
- [ ] Navigation between tabs is smooth
- [ ] Existing table functionality preserved
- [ ] Responsive on tablet and mobile
- [ ] Save operations work correctly
- [ ] Follows Apple design system patterns
- [ ] No TypeScript errors
- [ ] Passes all tests

## 🚀 Next Steps After Approval

1. ✅ Get user approval on wireframes
2. 🔨 Implement TopTabNavigation component
3. 🔨 Update SettingsScreen with table management
4. 🔨 Create tab container and sub-components
5. 🧪 Test navigation and functionality
6. 🎨 Polish UI and animations
7. 📝 Update documentation

---

**Please review the wireframes and architecture above. Once approved, I'll begin implementation following this plan exactly.**
