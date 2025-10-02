# Wireframe Analysis - Table Management Settings

## Overview

This document provides detailed analysis of the three main screens from the `03-table-management.drawio` wireframe, breaking down every UI element, interaction pattern, and data requirement.

---

## Screen 3.1: Table Layout Floor Plan

### Purpose
Primary interface for visualizing and managing restaurant floor plan with real-time table status monitoring.

### Layout Structure

#### Header Section
**Components**:
- Title: "Table Management Settings"
- Subtitle: "Restaurant • {tableCount} Tables"
- Header Actions:
  - "💾 Save Layout" button (AppleButton variant="success")
  - "➕ Add Table" button (AppleButton variant="primary")
  - "🔄 Refresh" button (AppleButton variant="secondary")
  - "← Settings" back button (AppleButton variant="secondary")

**Theme Usage**:
```typescript
const { theme } = useTheme();
// Header background: theme.colors.surface
// Title: typography.headlineLarge, color: theme.colors.onSurface
// Subtitle: typography.bodyMedium, color: theme.colors.onSurfaceVariant
// Buttons: Use AppleButton component (handles theme internally)
```

#### Filter Bar Section
**Components**:
- Filter pills (horizontal scrollable row):
  - "All Tables" (default selected)
  - "Available" (green indicator)
  - "Occupied" (red indicator)
  - "Reserved" (orange indicator)
  - "Cleaning" (yellow indicator)

**Implementation**:
```typescript
// Component: FilterBar
// Props: activeFilter, onFilterChange
// Uses: ApplePill components with color variants
<View style={{ flexDirection: 'row', gap: spacing.sm }}>
  {filters.map(filter => (
    <ApplePill
      key={filter.id}
      text={filter.label}
      selected={activeFilter === filter.id}
      color={filter.color}
      onPress={() => onFilterChange(filter.id)}
    />
  ))}
</View>
```

**Theme Usage**:
```typescript
// Filter bar background: theme.colors.surface
// Padding: spacing.lg
// Gap between pills: spacing.sm
// Selected pill: theme.colors.primary
// Unselected pill: theme.colors.surfaceVariant
```

#### Search Section
**Components**:
- Search input field
- Placeholder: "Search tables by number, area, or status..."
- Search icon on left
- Clear button on right (when text entered)

**Implementation**:
```typescript
// Component: TableSearchBar
// Uses: TextInput with theme styling
const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: theme.colors.onSurface,
  }
});
```

#### Floor Plan Grid Section
**Layout**:
- Main content area with scrollable grid
- Responsive column count: 4 (tablet), 3 (large mobile), 2 (small mobile)
- Grid spacing: `spacing.lg` between cells
- Each cell contains draggable TableCard

**Grid Configuration**:
```typescript
interface GridConfig {
  columns: number; // Responsive: 2-4
  cellWidth: number; // Auto-calculated
  cellHeight: number; // Auto-calculated (square aspect)
  spacing: number; // spacing.lg
  minCellSize: number; // 120px
  maxCellSize: number; // 200px
}
```

**Table Card Component**:
- Border radius: `borderRadius.lg`
- Shadow: `shadows.apple.card`
- Status color bar on left (4px width)
- Table number (large, bold)
- Capacity badge (small pill)
- Quick status icon
- Long press menu support

**TableCard Theme Usage**:
```typescript
const { theme } = useTheme();

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: getStatusColor(status), // Dynamic based on status
    padding: spacing.md,
    ...shadows.apple.card,
  },
  tableNumber: {
    ...typography.headlineMedium,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  capacityBadge: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: borderRadius.xs,
    padding: spacing.xs,
  },
  capacityText: {
    ...typography.labelSmall,
    color: theme.colors.onSurfaceVariant,
  }
});
```

#### Dining Area Headers
**Purpose**: Visual separators between floor plan areas

**Components**:
- Area name (e.g., "Main Dining", "VIP Section")
- Table count for area
- Expand/collapse toggle
- Background color differentiation

**Implementation**:
```typescript
// Component: AreaHeader
interface AreaHeaderProps {
  areaName: string;
  tableCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const styles = StyleSheet.create({
  areaHeader: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaName: {
    ...typography.titleLarge,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  tableCount: {
    ...typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  }
});
```

#### Selected Table Sidebar (Right Panel - Tablet)
**Layout**:
- Fixed width: 320px (tablet), full screen overlay (mobile)
- Scrollable content
- Sticky header

**Sections**:

**1. Table Details Section**
```typescript
// Display fields:
- Table Number: Large heading
- Location/Area: Badge with area name
- Capacity: Icon + number
- Status: AppleStatusPill component
- Current Duration: Timer (if occupied)
- Current Bill: Price (if occupied)
- Active Orders: Count badge
- Assigned Server: Name + avatar
- Customer Name: Text (if reserved/occupied)
```

**2. Quick Actions Section**
```typescript
// Action buttons (grid layout):
const actions = [
  { icon: '📝', label: 'Take Order', color: theme.colors.primary },
  { icon: '👁️', label: 'View Orders', color: theme.colors.tertiary },
  { icon: '🔄', label: 'Change Status', color: theme.colors.warning },
  { icon: '↔️', label: 'Transfer Table', color: theme.colors.secondary },
  { icon: '🔗', label: 'Merge Tables', color: theme.colors.primary },
  { icon: '✂️', label: 'Split Bill', color: theme.colors.warning },
  { icon: '📝', label: 'Add Note', color: theme.colors.tertiary },
  { icon: '🚨', label: 'Call Manager', color: theme.colors.error },
];

// Implementation: AppleButton components in grid
<View style={styles.actionsGrid}>
  {actions.map(action => (
    <AppleButton
      key={action.label}
      title={action.label}
      icon={action.icon}
      variant="primary"
      size="medium"
      backgroundColor={action.color}
      onPress={() => handleAction(action.label)}
    />
  ))}
</View>
```

#### Bottom Action Bar
**Components**:
- "➕ Add Table" button (primary)
- "🔗 Merge Tables" button (secondary, disabled if < 2 selected)
- "⚙️ Layout Settings" button (secondary)

**Theme Usage**:
```typescript
const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  }
});
```

#### Status Legend (Bottom Right Corner)
**Components**:
- Compact legend card
- Status colors with labels
- Collapsible

**Implementation**:
```typescript
// Component: TableLegend
const statusColors = [
  { status: 'available', label: 'Available', color: theme.colors.success },
  { status: 'occupied', label: 'Occupied', color: theme.colors.error },
  { status: 'reserved', label: 'Reserved', color: theme.colors.warning },
  { status: 'cleaning', label: 'Cleaning', color: theme.colors.tertiary },
];

<AppleCard layer="surface" size="small">
  {statusColors.map(item => (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
      <Text style={styles.legendLabel}>{item.label}</Text>
    </View>
  ))}
</AppleCard>
```

### User Interactions

#### Drag & Drop
- **Trigger**: Long press (500ms) on TableCard
- **Behavior**: Card lifts with shadow, follows finger/mouse
- **Grid Snap**: Snaps to grid cells on release
- **Validation**: Prevents overlap, checks boundaries
- **Feedback**: Haptic feedback on snap

#### Table Selection
- **Trigger**: Single tap on TableCard
- **Behavior**:
  - Card border highlights (primary color)
  - Sidebar opens with table details (tablet)
  - Bottom sheet appears (mobile)
- **Multi-select**: Shift+tap (tablet), long press menu (mobile)

#### Filter Application
- **Trigger**: Tap on filter pill
- **Behavior**:
  - Active pill highlights
  - Grid filters instantly
  - Animation: fade out filtered tables
  - Count updates in header

#### Search
- **Trigger**: Text input in search bar
- **Behavior**:
  - Debounced search (300ms)
  - Highlights matching tables
  - Dims non-matching tables
  - Shows "no results" if empty

### Data Requirements

#### State
```typescript
interface FloorPlanState {
  tables: Table[];
  areas: Area[];
  selectedTableIds: string[];
  activeFilter: TableStatusFilter;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  gridConfig: GridConfig;
}
```

#### API Calls
```typescript
// On mount
- getTables(restaurantId): Promise<Table[]>
- getAreas(restaurantId): Promise<Area[]>

// Real-time
- subscribeToTableUpdates(restaurantId): WebSocket

// User actions
- updateTablePosition(tableId, position): Promise<void>
- updateTableStatus(tableId, status): Promise<void>
```

---

## Screen 3.2: Table Operations

### Purpose
Handle complex table operations (merge, split, transfer) with multi-step workflows.

### Operation 1: Table Merge

#### UI Flow
**Step 1: Selection Screen**
- Title: "Merge Tables"
- Instruction: "Select 2 or more tables to merge"
- Table grid (filtered to available/occupied only)
- Selected tables highlighted with checkmarks
- "Next" button (disabled until 2+ selected)

**Step 2: Merge Configuration**
```typescript
// Modal/Screen content:
interface MergeConfig {
  selectedTables: Table[]; // Read-only display
  combinedCapacity: number; // Auto-calculated
  primaryTable: Table; // Dropdown to choose which table number to keep
  partySize: number; // Input field
  customerName: string; // Input field
  specialRequests: string; // Textarea
  assignedServer: Staff; // Dropdown
}
```

**Step 3: Confirmation**
- Summary of merge operation
- Visual: Combined table representation
- Capacity validation (partySize <= combinedCapacity)
- "Confirm Merge" button
- "Cancel" button

#### Component Structure
```typescript
// Component: TableMergeModal
<AppleCard layer="surface" size="large">
  <View style={styles.modalHeader}>
    <Text style={styles.modalTitle}>Merge Tables</Text>
    <AppleButton icon="✕" variant="secondary" onPress={onClose} />
  </View>

  {step === 1 && <TableSelectionGrid />}
  {step === 2 && <MergeConfigurationForm />}
  {step === 3 && <MergeConfirmation />}

  <View style={styles.modalFooter}>
    {step > 1 && <AppleButton title="Back" variant="secondary" onPress={handleBack} />}
    <AppleButton
      title={step === 3 ? "Confirm Merge" : "Next"}
      variant="primary"
      onPress={handleNext}
    />
  </View>
</AppleCard>
```

### Operation 2: Table Split

#### UI Flow
**Step 1: Split Method Selection**
```typescript
const splitMethods = [
  { id: 'by_people', label: 'Split by People', icon: '👥' },
  { id: 'by_items', label: 'Split by Items', icon: '📝' },
  { id: 'custom', label: 'Custom Amount', icon: '💰' },
];
```

**Step 2: Split Configuration (By People)**
```typescript
interface SplitByPeopleConfig {
  numberOfPeople: number; // Input
  splitEqually: boolean; // Toggle
  assignments: {
    personNumber: number;
    items: OrderItem[];
    subtotal: number;
  }[];
}
```

**Step 2: Split Configuration (By Items)**
- Display all items from bill
- Checkboxes for each item
- Group items by person
- Auto-calculate subtotals

**Step 2: Split Configuration (Custom)**
```typescript
interface CustomSplitConfig {
  splits: {
    splitNumber: number;
    amount: number; // Input
    description: string; // Input
  }[];
  remainingBalance: number; // Auto-calculated
}
```

**Step 3: Payment Assignment**
- Assign payment method to each split
- Options: Cash, Card, UPI, Wallet
- Track payment status for each split

#### Component Structure
```typescript
// Component: TableSplitModal
<AppleCard layer="surface" size="large">
  <View style={styles.modalHeader}>
    <Text style={styles.modalTitle}>Split Bill</Text>
    <Text style={styles.billTotal}>Total: ${totalAmount}</Text>
  </View>

  {step === 1 && <SplitMethodSelector />}
  {step === 2 && renderSplitConfiguration()}
  {step === 3 && <PaymentAssignment />}

  <View style={styles.splitSummary}>
    {splits.map(split => (
      <AppleCard key={split.id} layer="surfaceVariant" size="small">
        <Text>Person {split.number}: ${split.amount}</Text>
        <AppleStatusPill
          status={split.paid ? 'success' : 'pending'}
          text={split.paid ? 'Paid' : 'Pending'}
        />
      </AppleCard>
    ))}
  </View>
</AppleCard>
```

### Operation 3: Table Transfer

#### UI Flow
**Step 1: Source Table Confirmation**
- Display source table details
- Current guest information
- Current bill amount
- "Confirm Transfer" button

**Step 2: Destination Table Selection**
- Filter tables: Available only
- Grid view of available tables
- Show capacity compatibility
- Highlight recommended tables

**Step 3: Transfer Configuration**
```typescript
interface TransferConfig {
  sourceTable: Table;
  destinationTable: Table;
  transferReason: string; // Dropdown: 'Customer Request', 'Noise Issue', 'Better View', 'Other'
  transferNotes: string; // Textarea
  notifyKitchen: boolean; // Toggle
  updateReservation: boolean; // Toggle (if reserved)
}
```

**Step 4: Confirmation**
- Visual: Source → Destination
- Summary of changes
- Server notification checkbox
- "Complete Transfer" button

#### Component Structure
```typescript
// Component: TableTransferModal
<AppleCard layer="surface" size="large">
  <View style={styles.transferHeader}>
    <Text style={styles.modalTitle}>Transfer Table</Text>
    <View style={styles.transferFlow}>
      <Text>Table {sourceTable.number}</Text>
      <Text style={styles.arrow}>→</Text>
      <Text>Table {destinationTable?.number || '?'}</Text>
    </View>
  </View>

  {step === 1 && <SourceTableSummary table={sourceTable} />}
  {step === 2 && <DestinationTableGrid onSelect={handleSelectDestination} />}
  {step === 3 && <TransferConfigForm />}
  {step === 4 && <TransferConfirmation />}
</AppleCard>
```

### Operation 4: Reservation Management

#### Create Reservation UI
```typescript
interface ReservationForm {
  // Guest Information
  customerName: string; // Required
  customerPhone: string; // Required
  customerEmail: string; // Optional
  partySize: number; // Required

  // Reservation Details
  reservationDate: Date; // Date picker
  reservationTime: Time; // Time picker
  duration: number; // Dropdown: 60, 90, 120, 180 minutes

  // Table Assignment
  preferredArea: Area; // Dropdown
  specificTable: Table; // Optional - auto-suggest based on capacity

  // Special Requests
  occasion: string; // Dropdown: Birthday, Anniversary, Business, Other
  specialRequests: string; // Textarea
  dietaryRestrictions: string[]; // Multi-select

  // Notification Preferences
  sendConfirmation: boolean; // Toggle
  reminderTime: number; // Dropdown: 1hr, 2hr, 24hr before
}
```

#### Component Structure
```typescript
// Component: ReservationModal
<AppleCard layer="surface" size="large">
  <ScrollView>
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Guest Information</Text>
      {/* Input fields with AppleCard containers */}
    </View>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Reservation Details</Text>
      {/* Date/time pickers, dropdowns */}
    </View>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Table Assignment</Text>
      {/* Auto-suggestion based on capacity */}
      <TableRecommendationCards />
    </View>

    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Special Requests</Text>
      {/* Textarea and multi-select */}
    </View>
  </ScrollView>

  <View style={styles.modalFooter}>
    <AppleButton title="Cancel" variant="secondary" />
    <AppleButton title="Create Reservation" variant="primary" />
  </View>
</AppleCard>
```

---

## Screen 3.3: Table Configuration

### Purpose
Admin interface for creating, editing, and managing table properties and dining areas.

### Add/Edit Table Form

#### Form Fields
```typescript
interface TableConfigForm {
  // Basic Information
  tableNumber: string; // Input - unique identifier
  capacity: number; // Number input with stepper

  // Location
  area: Area; // Dropdown - required
  position: Position; // Grid position selector

  // Physical Properties
  shape: TableShape; // Radio buttons: Round, Square, Rectangle, Oval
  size: TableSize; // Dropdown: Small, Medium, Large

  // Operational Settings
  status: TableStatus; // Dropdown: Available, Occupied, Reserved, Cleaning, Out of Service
  isActive: boolean; // Toggle - hide inactive tables
  allowOnlineBooking: boolean; // Toggle

  // Display Settings
  customIcon: string; // Optional emoji or icon selector
  customColor: string; // Optional color picker for floor plan

  // Notes
  notes: string; // Textarea - internal notes
}
```

#### Component Structure
```typescript
// Component: TableConfigurationForm
const { theme } = useTheme();

<AppleCard layer="surface" size="large">
  <View style={styles.formHeader}>
    <Text style={styles.formTitle}>
      {isEditMode ? 'Edit Table' : 'Add New Table'}
    </Text>
  </View>

  <ScrollView style={styles.formContent}>
    {/* Basic Information Section */}
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Basic Information</Text>

      <AppleCard layer="surfaceVariant" size="medium">
        <Text style={styles.inputLabel}>Table Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 101, A1, VIP-1"
          value={formData.tableNumber}
          onChangeText={handleTableNumberChange}
        />
      </AppleCard>

      <AppleCard layer="surfaceVariant" size="medium">
        <Text style={styles.inputLabel}>Capacity *</Text>
        <View style={styles.stepperContainer}>
          <AppleButton icon="-" onPress={decrementCapacity} />
          <Text style={styles.capacityValue}>{formData.capacity}</Text>
          <AppleButton icon="+" onPress={incrementCapacity} />
        </View>
      </AppleCard>
    </View>

    {/* Location Section */}
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Location</Text>

      <AppleCard layer="surfaceVariant" size="medium">
        <Text style={styles.inputLabel}>Dining Area *</Text>
        <Picker
          selectedValue={formData.area}
          onValueChange={handleAreaChange}
        >
          {areas.map(area => (
            <Picker.Item key={area.id} label={area.name} value={area.id} />
          ))}
        </Picker>
      </AppleCard>

      <AppleCard layer="surfaceVariant" size="medium">
        <Text style={styles.inputLabel}>Position on Floor Plan</Text>
        <GridPositionSelector
          selectedPosition={formData.position}
          onPositionChange={handlePositionChange}
        />
      </AppleCard>
    </View>

    {/* Physical Properties Section */}
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Physical Properties</Text>

      <AppleCard layer="surfaceVariant" size="medium">
        <Text style={styles.inputLabel}>Table Shape</Text>
        <View style={styles.shapeSelector}>
          {['Round', 'Square', 'Rectangle', 'Oval'].map(shape => (
            <AppleButton
              key={shape}
              title={shape}
              variant={formData.shape === shape ? 'primary' : 'secondary'}
              onPress={() => handleShapeChange(shape)}
            />
          ))}
        </View>
      </AppleCard>
    </View>

    {/* Operational Settings Section */}
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Operational Settings</Text>

      <AppleCard layer="surfaceVariant" size="medium">
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Active</Text>
          <AppleToggle
            value={formData.isActive}
            onValueChange={handleActiveToggle}
          />
        </View>
      </AppleCard>

      <AppleCard layer="surfaceVariant" size="medium">
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Allow Online Booking</Text>
          <AppleToggle
            value={formData.allowOnlineBooking}
            onValueChange={handleOnlineBookingToggle}
          />
        </View>
      </AppleCard>
    </View>
  </ScrollView>

  <View style={styles.formFooter}>
    <AppleButton
      title="Cancel"
      variant="secondary"
      onPress={onCancel}
    />
    <AppleButton
      title={isEditMode ? 'Update Table' : 'Create Table'}
      variant="primary"
      onPress={handleSubmit}
    />
  </View>
</AppleCard>
```

### Area Management Panel

#### Area List View
```typescript
// Component: AreaManagementPanel
<AppleCard layer="surface" size="large">
  <View style={styles.areaHeader}>
    <Text style={styles.areaTitle}>Dining Areas</Text>
    <AppleButton
      title="➕ Add Area"
      variant="primary"
      onPress={handleAddArea}
    />
  </View>

  <ScrollView>
    {areas.map(area => (
      <AppleCard key={area.id} layer="surfaceVariant" size="medium">
        <View style={styles.areaRow}>
          <View style={styles.areaInfo}>
            <Text style={styles.areaName}>{area.name}</Text>
            <Text style={styles.areaStats}>
              {area.tableCount} tables • Capacity: {area.totalCapacity}
            </Text>
          </View>

          <View style={styles.areaActions}>
            <AppleButton
              icon="✏️"
              variant="secondary"
              onPress={() => handleEditArea(area)}
            />
            <AppleButton
              icon="🗑️"
              variant="error"
              onPress={() => handleDeleteArea(area)}
            />
          </View>
        </View>
      </AppleCard>
    ))}
  </ScrollView>
</AppleCard>
```

#### Add/Edit Area Form
```typescript
interface AreaForm {
  name: string; // Required
  description: string; // Optional
  color: string; // Color picker for floor plan
  displayOrder: number; // Drag to reorder
  isActive: boolean; // Toggle
  allowReservations: boolean; // Toggle
  defaultServerAssignment: Staff; // Optional
}
```

### Bulk Operations

#### Bulk Status Change
```typescript
// Component: BulkOperationsPanel
<AppleCard layer="surface" size="large">
  <View style={styles.bulkHeader}>
    <Text style={styles.bulkTitle}>Bulk Operations</Text>
    <Text style={styles.selectionCount}>{selectedTables.length} tables selected</Text>
  </View>

  <View style={styles.bulkActions}>
    <AppleButton
      title="Change Status"
      variant="primary"
      icon="🔄"
      onPress={handleBulkStatusChange}
      disabled={selectedTables.length === 0}
    />
    <AppleButton
      title="Assign Area"
      variant="primary"
      icon="📍"
      onPress={handleBulkAreaAssign}
      disabled={selectedTables.length === 0}
    />
    <AppleButton
      title="Mark Cleaning"
      variant="warning"
      icon="🧹"
      onPress={handleBulkMarkCleaning}
      disabled={selectedTables.length === 0}
    />
    <AppleButton
      title="Deactivate"
      variant="error"
      icon="❌"
      onPress={handleBulkDeactivate}
      disabled={selectedTables.length === 0}
    />
  </View>

  {selectedTables.length > 0 && (
    <View style={styles.selectedTablesPreview}>
      <Text style={styles.previewTitle}>Selected Tables:</Text>
      <View style={styles.tableChips}>
        {selectedTables.map(table => (
          <ApplePill
            key={table.id}
            text={`Table ${table.number}`}
            onClose={() => handleDeselectTable(table.id)}
          />
        ))}
      </View>
    </View>
  )}
</AppleCard>
```

### Floor Plan Settings

#### Settings Form
```typescript
interface FloorPlanSettings {
  // Grid Configuration
  gridSize: number; // Dropdown: 2x2, 3x3, 4x4, 5x5, 6x6
  gridSpacing: number; // Slider: 8-32px
  snapToGrid: boolean; // Toggle

  // Display Settings
  showTableNumbers: boolean; // Toggle
  showCapacity: boolean; // Toggle
  showStatus: boolean; // Toggle
  showServerAssignments: boolean; // Toggle

  // Color Customization
  availableColor: string; // Color picker
  occupiedColor: string; // Color picker
  reservedColor: string; // Color picker
  cleaningColor: string; // Color picker

  // Label Settings
  labelFontSize: number; // Slider: 10-20px
  labelPosition: 'top' | 'center' | 'bottom'; // Radio

  // Advanced
  enableDragDrop: boolean; // Toggle
  autoSaveLayout: boolean; // Toggle
  layoutBackupEnabled: boolean; // Toggle
}
```

#### Component Structure
```typescript
// Component: FloorPlanSettingsPanel
<AppleCard layer="surface" size="large">
  <ScrollView>
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Grid Configuration</Text>

      <AppleCard layer="surfaceVariant" size="medium">
        <Text style={styles.settingLabel}>Grid Size</Text>
        <Picker selectedValue={settings.gridSize} onValueChange={handleGridSizeChange}>
          {[2, 3, 4, 5, 6].map(size => (
            <Picker.Item key={size} label={`${size}x${size}`} value={size} />
          ))}
        </Picker>
      </AppleCard>

      <AppleCard layer="surfaceVariant" size="medium">
        <Text style={styles.settingLabel}>Grid Spacing: {settings.gridSpacing}px</Text>
        <Slider
          minimumValue={8}
          maximumValue={32}
          value={settings.gridSpacing}
          onValueChange={handleSpacingChange}
        />
      </AppleCard>
    </View>

    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Display Options</Text>

      {[
        { key: 'showTableNumbers', label: 'Show Table Numbers' },
        { key: 'showCapacity', label: 'Show Capacity' },
        { key: 'showStatus', label: 'Show Status Indicators' },
        { key: 'showServerAssignments', label: 'Show Server Assignments' },
      ].map(option => (
        <AppleCard key={option.key} layer="surfaceVariant" size="medium">
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{option.label}</Text>
            <AppleToggle
              value={settings[option.key]}
              onValueChange={value => handleToggleChange(option.key, value)}
            />
          </View>
        </AppleCard>
      ))}
    </View>

    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Status Colors</Text>

      {[
        { key: 'availableColor', label: 'Available', default: theme.colors.success },
        { key: 'occupiedColor', label: 'Occupied', default: theme.colors.error },
        { key: 'reservedColor', label: 'Reserved', default: theme.colors.warning },
        { key: 'cleaningColor', label: 'Cleaning', default: theme.colors.tertiary },
      ].map(color => (
        <AppleCard key={color.key} layer="surfaceVariant" size="medium">
          <View style={styles.colorRow}>
            <Text style={styles.colorLabel}>{color.label}</Text>
            <View style={[styles.colorPreview, { backgroundColor: settings[color.key] }]} />
            <AppleButton
              title="Change"
              variant="secondary"
              onPress={() => handleColorChange(color.key)}
            />
          </View>
        </AppleCard>
      ))}
    </View>
  </ScrollView>

  <View style={styles.settingsFooter}>
    <AppleButton
      title="Reset to Defaults"
      variant="secondary"
      onPress={handleResetDefaults}
    />
    <AppleButton
      title="Save Settings"
      variant="primary"
      onPress={handleSaveSettings}
    />
  </View>
</AppleCard>
```

---

## Interaction Patterns Summary

### Gestures
- **Tap**: Select table, activate button, toggle filter
- **Long Press**: Enter drag mode, show context menu
- **Drag**: Move table on floor plan
- **Pinch**: Zoom floor plan (future enhancement)
- **Double Tap**: Quick edit table (future enhancement)

### Feedback
- **Haptic**: On selection, drag snap, operation complete
- **Visual**: Highlight, shadow, color change, animation
- **Audio**: Optional success/error sounds
- **Toast**: Operation confirmations, error messages

### Validation
- **Real-time**: Form field validation as user types
- **Pre-submit**: Check all required fields before allowing submit
- **Server-side**: Validate operations before committing
- **Conflict Detection**: Check for table overlaps, capacity issues

### Loading States
- **Skeleton**: Initial data load
- **Spinner**: Form submission, operation processing
- **Progress**: Multi-step operations
- **Optimistic**: Immediate UI update, rollback on error

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Total Components Identified**: 35+
**Total Screens**: 3 main screens + 8 modals/forms
