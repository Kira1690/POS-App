# Architecture Design - Table Management Settings

## Overview

This document defines the technical architecture for the Table Management Settings system, following SOLID principles, ensuring all components remain under 300 lines, and integrating seamlessly with the existing Apple design system.

---

## Architecture Principles

### SOLID Compliance

#### Single Responsibility Principle (SRP)
**Application**:
- Each component has ONE purpose
- TableCard: Display table visual representation ONLY
- TableDetailsPanel: Show table details ONLY
- TableMergeService: Handle merge logic ONLY

**Example**:
```typescript
// ❌ WRONG: Component doing too much
const TableManagement = () => {
  // Handles: rendering, state, API calls, validation, operations
  // 800+ lines - violates SRP
};

// ✅ CORRECT: Single responsibility per component
const TableManagementSettings = () => {
  // ONLY: Layout composition, routing to sub-components
  // ~150 lines
  return (
    <View>
      <FilterBar />
      <FloorPlanView />
      <TableDetailsPanel />
    </View>
  );
};

const FilterBar = () => {
  // ONLY: Filter UI and state
  // ~80 lines
};

const FloorPlanView = () => {
  // ONLY: Grid layout and table positioning
  // ~200 lines
};
```

#### Open/Closed Principle (OCP)
**Application**:
- Universal Apple components open for extension via props
- Closed for modification (no direct edits to AppleCard, AppleButton)
- Extend through composition, not inheritance

**Example**:
```typescript
// ✅ CORRECT: Extend AppleCard without modifying it
const TableCard = ({ table, onPress }) => {
  const { theme } = useTheme();

  return (
    <AppleCard layer="surface" size="medium">
      <View style={[styles.statusBar, { backgroundColor: getStatusColor(table.status, theme) }]} />
      <Text style={styles.tableNumber}>{table.table_number}</Text>
      <ApplePill text={`${table.capacity} seats`} size="small" />
    </AppleCard>
  );
};

// AppleCard remains unchanged, extended through composition
```

#### Liskov Substitution Principle (LSP)
**Application**:
- All status pill variants can substitute AppleStatusPill
- All button variants can substitute AppleButton
- Derived components maintain base component contracts

**Example**:
```typescript
// Base component contract
interface StatusPillProps {
  status: string;
  size: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

// All variants maintain this contract
<AppleStatusPill status="available" size="small" />
<TableStatusPill status="available" size="small" />
<OrderStatusPill status="available" size="small" />
// All interchangeable without breaking functionality
```

#### Interface Segregation Principle (ISP)
**Application**:
- Small, focused interfaces
- No forced implementation of unused methods
- Components receive only props they need

**Example**:
```typescript
// ❌ WRONG: Fat interface
interface TableProps {
  table: Table;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMerge: () => void;
  onSplit: () => void;
  onTransfer: () => void;
  // 20+ more operations...
}

// ✅ CORRECT: Segregated interfaces
interface TableDisplayProps {
  table: Table;
  onPress: () => void;
}

interface TableOperationsProps {
  tableId: string;
  operations: {
    onEdit?: () => void;
    onDelete?: () => void;
    onMerge?: () => void;
  };
}

// Components implement only what they need
const TableCard: React.FC<TableDisplayProps> = ({ table, onPress }) => { ... };
const TableOperationsMenu: React.FC<TableOperationsProps> = ({ tableId, operations }) => { ... };
```

#### Dependency Inversion Principle (DIP)
**Application**:
- Components depend on theme abstractions, not concrete colors
- Services depend on interfaces, not implementations
- Context provides abstraction over API calls

**Example**:
```typescript
// ✅ CORRECT: Depend on theme abstraction
const { theme } = useTheme(); // Abstraction
const bgColor = theme.colors.surface; // Not hardcoded '#FFFFFF'

// ✅ CORRECT: Service depends on interface
interface ITableService {
  getTables(): Promise<Table[]>;
  updateTable(id: string, data: Partial<Table>): Promise<Table>;
}

class MockTableService implements ITableService { ... }
class RealTableService implements ITableService { ... }

// Component doesn't care which implementation
const tableService: ITableService = useMockData ? new MockTableService() : new RealTableService();
```

---

## Component Architecture

### Component Hierarchy

```
TableManagementSettings (Main Entry - Settings Category)
│
├── FloorPlanView (Main Visual Interface)
│   ├── FilterBar
│   │   ├── ApplePill (x5 filter options)
│   │   └── TableSearchBar
│   │
│   ├── FloorPlanGrid
│   │   ├── AreaHeader (per dining area)
│   │   └── TableCard (draggable, per table)
│   │       ├── AppleCard (base container)
│   │       ├── StatusIndicator (colored bar)
│   │       ├── TableNumber (text)
│   │       └── CapacityBadge (ApplePill)
│   │
│   └── TableLegend
│       └── AppleCard
│           └── LegendItems (status list)
│
├── TableDetailsPanel (Sidebar/Modal)
│   ├── TableInfoSection
│   │   ├── AppleCard (table details)
│   │   └── AppleStatusPill
│   │
│   └── QuickActionsGrid
│       └── AppleButton (x8 actions)
│
├── TableOperationsModals
│   ├── TableMergeModal
│   │   ├── StepIndicator
│   │   ├── TableSelectionGrid
│   │   ├── MergeConfigForm
│   │   └── MergeConfirmation
│   │
│   ├── TableSplitModal
│   │   ├── SplitMethodSelector
│   │   ├── SplitConfiguration
│   │   └── PaymentAssignment
│   │
│   └── TableTransferModal
│       ├── SourceTableSummary
│       ├── DestinationTableGrid
│       └── TransferConfigForm
│
├── TableConfigurationForm
│   ├── FormHeader
│   ├── ScrollableFormSections
│   │   ├── BasicInfoSection
│   │   ├── LocationSection
│   │   ├── PhysicalPropertiesSection
│   │   └── OperationalSettingsSection
│   └── FormFooter
│
└── AreaManagementPanel
    ├── AreaList
    │   └── AreaCard (per area)
    │       ├── AppleCard
    │       ├── AreaInfo
    │       └── AreaActions (AppleButton x2)
    └── AreaForm (add/edit modal)
```

### Component Sizing (Line Count Estimates)

| Component | Lines | SOLID Compliance |
|-----------|-------|------------------|
| TableManagementSettings | ~180 | ✅ Composition only |
| FloorPlanView | ~250 | ✅ Layout + grid logic |
| FilterBar | ~90 | ✅ Filter state only |
| TableSearchBar | ~70 | ✅ Search only |
| FloorPlanGrid | ~200 | ✅ Grid rendering only |
| TableCard | ~120 | ✅ Display only |
| TableDetailsPanel | ~180 | ✅ Details display only |
| QuickActionsGrid | ~80 | ✅ Button grid only |
| TableMergeModal | ~280 | ✅ Merge workflow only |
| TableSplitModal | ~290 | ✅ Split workflow only |
| TableTransferModal | ~250 | ✅ Transfer workflow only |
| TableConfigurationForm | ~280 | ✅ Form only |
| AreaManagementPanel | ~220 | ✅ Area CRUD only |
| TableLegend | ~60 | ✅ Legend display only |
| AreaHeader | ~50 | ✅ Header display only |

**Total Components**: 15 primary components
**Average Lines**: ~180 lines per component
**Maximum**: 290 lines (well under 300 limit)

---

## Service Layer Architecture

### Service Responsibilities

#### TableManagementService
**Responsibility**: CRUD operations for tables

```typescript
// File: /src/services/table-management/TableManagementService.ts
// Lines: ~200

interface ITableManagementService {
  // Read operations
  getTables(restaurantId: string): Promise<Table[]>;
  getTable(tableId: string): Promise<Table>;
  getTablesByArea(areaId: string): Promise<Table[]>;
  getTablesByStatus(status: TableStatus): Promise<Table[]>;

  // Write operations
  createTable(data: CreateTableRequest): Promise<Table>;
  updateTable(tableId: string, data: UpdateTableRequest): Promise<Table>;
  deleteTable(tableId: string): Promise<void>;
  updateTableStatus(tableId: string, status: TableStatus): Promise<Table>;
  updateTablePosition(tableId: string, position: Position): Promise<Table>;

  // Bulk operations
  bulkUpdateStatus(tableIds: string[], status: TableStatus): Promise<void>;
  bulkUpdateArea(tableIds: string[], areaId: string): Promise<void>;
}

export class TableManagementService implements ITableManagementService {
  constructor(
    private apiClient: AxiosInstance,
    private baseUrl: string = '/api/table-management'
  ) {}

  async getTables(restaurantId: string): Promise<Table[]> {
    try {
      const response = await this.apiClient.get<ApiResponse<Table[]>>(
        `${this.baseUrl}/tables`,
        { params: { restaurantId } }
      );
      return response.data.data;
    } catch (error) {
      logger.error('Failed to fetch tables:', error);
      throw new Error('Failed to fetch tables');
    }
  }

  // ... other methods
}
```

#### AreaService
**Responsibility**: CRUD operations for dining areas

```typescript
// File: /src/services/table-management/AreaService.ts
// Lines: ~150

interface IAreaService {
  getAreas(restaurantId: string): Promise<Area[]>;
  getArea(areaId: string): Promise<Area>;
  createArea(data: CreateAreaRequest): Promise<Area>;
  updateArea(areaId: string, data: UpdateAreaRequest): Promise<Area>;
  deleteArea(areaId: string): Promise<void>;
  reorderAreas(areaIds: string[]): Promise<void>;
}

export class AreaService implements IAreaService {
  constructor(
    private apiClient: AxiosInstance,
    private baseUrl: string = '/api/table-management/areas'
  ) {}

  // Implementation...
}
```

#### TableOperationsService
**Responsibility**: Complex operations (merge, split, transfer)

```typescript
// File: /src/services/table-management/TableOperationsService.ts
// Lines: ~180

interface ITableOperationsService {
  mergeTables(request: MergeTablesRequest): Promise<MergeResult>;
  splitTable(request: SplitTableRequest): Promise<SplitResult>;
  transferTable(request: TransferTableRequest): Promise<TransferResult>;
  validateMerge(tableIds: string[]): Promise<ValidationResult>;
  validateSplit(tableId: string, splitConfig: SplitConfig): Promise<ValidationResult>;
  validateTransfer(sourceId: string, destId: string): Promise<ValidationResult>;
}

export class TableOperationsService implements ITableOperationsService {
  constructor(
    private apiClient: AxiosInstance,
    private baseUrl: string = '/api/table-management/operations'
  ) {}

  async mergeTables(request: MergeTablesRequest): Promise<MergeResult> {
    // Validate before merge
    const validation = await this.validateMerge(request.tableIds);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Execute merge
    const response = await this.apiClient.post<ApiResponse<MergeResult>>(
      `${this.baseUrl}/merge`,
      request
    );
    return response.data.data;
  }

  // ... other methods
}
```

#### ReservationService
**Responsibility**: Reservation management

```typescript
// File: /src/services/table-management/ReservationService.ts
// Lines: ~160

interface IReservationService {
  getReservations(restaurantId: string, date: Date): Promise<Reservation[]>;
  createReservation(data: CreateReservationRequest): Promise<Reservation>;
  updateReservation(id: string, data: UpdateReservationRequest): Promise<Reservation>;
  cancelReservation(id: string, reason: string): Promise<void>;
  checkAvailability(restaurantId: string, partySize: number, dateTime: Date): Promise<Table[]>;
}

export class ReservationService implements IReservationService {
  // Implementation...
}
```

### Mock Service Implementations

For development without backend:

```typescript
// File: /src/services/table-management/MockTableManagementService.ts
// Lines: ~250

export class MockTableManagementService implements ITableManagementService {
  private tables: Table[] = MOCK_TABLES_DATA;
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getTables(restaurantId: string): Promise<Table[]> {
    await this.delay(300); // Simulate network delay
    return this.tables.filter(t => t.restaurant_id === restaurantId);
  }

  async createTable(data: CreateTableRequest): Promise<Table> {
    await this.delay(500);
    const newTable: Table = {
      id: generateId(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.tables.push(newTable);
    return newTable;
  }

  // ... other mock implementations
}
```

---

## State Management Architecture

### Context Structure

```typescript
// File: /src/context/table-management/TableManagementContext.tsx
// Lines: ~280

interface TableManagementState {
  // Data
  tables: Table[];
  areas: Area[];
  reservations: Reservation[];

  // UI State
  selectedTableIds: string[];
  activeFilter: TableStatusFilter;
  searchQuery: string;
  gridConfig: GridConfig;

  // Operation State
  activeOperation: 'merge' | 'split' | 'transfer' | null;
  operationData: any | null;

  // Loading/Error State
  isLoading: boolean;
  error: string | null;
}

type TableManagementAction =
  | { type: 'SET_TABLES'; payload: Table[] }
  | { type: 'SET_AREAS'; payload: Area[] }
  | { type: 'SELECT_TABLE'; payload: string }
  | { type: 'DESELECT_TABLE'; payload: string }
  | { type: 'SET_FILTER'; payload: TableStatusFilter }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPDATE_TABLE'; payload: Table }
  | { type: 'DELETE_TABLE'; payload: string }
  | { type: 'START_OPERATION'; payload: { type: string; data: any } }
  | { type: 'COMPLETE_OPERATION' }
  | { type: 'CANCEL_OPERATION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: TableManagementState = {
  tables: [],
  areas: [],
  reservations: [],
  selectedTableIds: [],
  activeFilter: 'all',
  searchQuery: '',
  gridConfig: DEFAULT_GRID_CONFIG,
  activeOperation: null,
  operationData: null,
  isLoading: false,
  error: null,
};

const tableManagementReducer = (
  state: TableManagementState,
  action: TableManagementAction
): TableManagementState => {
  switch (action.type) {
    case 'SET_TABLES':
      return { ...state, tables: action.payload, isLoading: false };

    case 'SELECT_TABLE':
      return {
        ...state,
        selectedTableIds: [...state.selectedTableIds, action.payload],
      };

    case 'DESELECT_TABLE':
      return {
        ...state,
        selectedTableIds: state.selectedTableIds.filter(id => id !== action.payload),
      };

    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };

    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    // ... other cases

    default:
      return state;
  }
};

interface TableManagementContextValue {
  state: TableManagementState;

  // Table operations
  loadTables: () => Promise<void>;
  selectTable: (tableId: string) => void;
  deselectTable: (tableId: string) => void;
  updateTable: (tableId: string, data: Partial<Table>) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;

  // Filter/Search
  setFilter: (filter: TableStatusFilter) => void;
  setSearchQuery: (query: string) => void;

  // Operations
  startMerge: (tableIds: string[]) => void;
  completeMerge: (config: MergeConfig) => Promise<void>;
  startSplit: (tableId: string) => void;
  completeSplit: (config: SplitConfig) => Promise<void>;
  startTransfer: (sourceId: string) => void;
  completeTransfer: (config: TransferConfig) => Promise<void>;
  cancelOperation: () => void;

  // Area operations
  loadAreas: () => Promise<void>;
  createArea: (data: CreateAreaRequest) => Promise<void>;
  updateArea: (areaId: string, data: UpdateAreaRequest) => Promise<void>;
  deleteArea: (areaId: string) => Promise<void>;

  // Bulk operations
  bulkUpdateStatus: (tableIds: string[], status: TableStatus) => Promise<void>;
}

export const TableManagementProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(tableManagementReducer, initialState);
  const tableService = useMemo(() => new TableManagementService(apiClient), []);
  const areaService = useMemo(() => new AreaService(apiClient), []);
  const operationsService = useMemo(() => new TableOperationsService(apiClient), []);

  const loadTables = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const tables = await tableService.getTables(restaurantId);
      dispatch({ type: 'SET_TABLES', payload: tables });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [tableService]);

  const completeMerge = useCallback(async (config: MergeConfig) => {
    try {
      const result = await operationsService.mergeTables({
        tableIds: state.selectedTableIds,
        ...config,
      });

      // Update local state
      await loadTables();
      dispatch({ type: 'COMPLETE_OPERATION' });

      showToast({ type: 'success', message: 'Tables merged successfully' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [operationsService, state.selectedTableIds, loadTables]);

  const contextValue: TableManagementContextValue = {
    state,
    loadTables,
    selectTable: (tableId) => dispatch({ type: 'SELECT_TABLE', payload: tableId }),
    deselectTable: (tableId) => dispatch({ type: 'DESELECT_TABLE', payload: tableId }),
    updateTable,
    deleteTable,
    setFilter: (filter) => dispatch({ type: 'SET_FILTER', payload: filter }),
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    startMerge,
    completeMerge,
    startSplit,
    completeSplit,
    startTransfer,
    completeTransfer,
    cancelOperation: () => dispatch({ type: 'CANCEL_OPERATION' }),
    loadAreas,
    createArea,
    updateArea,
    deleteArea,
    bulkUpdateStatus,
  };

  return (
    <TableManagementContext.Provider value={contextValue}>
      {children}
    </TableManagementContext.Provider>
  );
};

export const useTableManagement = (): TableManagementContextValue => {
  const context = useContext(TableManagementContext);
  if (!context) {
    throw new Error('useTableManagement must be used within TableManagementProvider');
  }
  return context;
};
```

---

## Data Flow Architecture

### Data Flow Diagram

```
User Interaction
      ↓
Component (TableCard.tsx)
      ↓
Event Handler (onPress, onLongPress)
      ↓
Context Hook (useTableManagement)
      ↓
Context Action (selectTable, updateTable)
      ↓
Service Layer (TableManagementService)
      ↓
API Client (Axios)
      ↓
Backend API
      ↓
Response
      ↓
Service Layer (parse, validate)
      ↓
Context Reducer (update state)
      ↓
Component Re-render
      ↓
UI Update (theme-aware styling)
```

### Example Flow: Update Table Status

```typescript
// 1. USER ACTION: Tap on table card status
<TableCard onStatusChange={handleStatusChange} />

// 2. COMPONENT EVENT HANDLER
const handleStatusChange = (newStatus: TableStatus) => {
  updateTable(table.id, { status: newStatus });
};

// 3. CONTEXT ACTION
const { updateTable } = useTableManagement();

// 4. CONTEXT IMPLEMENTATION
const updateTable = async (tableId: string, data: Partial<Table>) => {
  dispatch({ type: 'SET_LOADING', payload: true });

  try {
    // 5. SERVICE LAYER CALL
    const updated = await tableService.updateTable(tableId, data);

    // 6. REDUCER UPDATE
    dispatch({ type: 'UPDATE_TABLE', payload: updated });

    // 7. UI FEEDBACK
    showToast({ type: 'success', message: 'Table status updated' });
  } catch (error) {
    // 8. ERROR HANDLING
    dispatch({ type: 'SET_ERROR', payload: error.message });
    showToast({ type: 'error', message: 'Failed to update table' });
  }
};

// 9. COMPONENT RE-RENDER with new data
// TableCard receives updated table via props
// Theme-aware styling applied automatically
```

---

## Theme Integration Architecture

### Theme Hook Pattern (MANDATORY)

```typescript
// ✅ CORRECT: All components follow this pattern
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

const TableCard: React.FC<TableCardProps> = ({ table }) => {
  // 1. THEME HOOK AT COMPONENT ROOT
  const { theme, isDark } = useTheme();

  // 2. EVENT HANDLERS
  const handlePress = () => { /* ... */ };

  // 3. STYLESHEET AFTER THEME HOOK
  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: getStatusColor(table.status, theme),
    },
    tableNumber: {
      ...typography.headlineMedium,
      color: theme.colors.onSurface,
    },
    capacityBadge: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.xs,
      padding: spacing.xs,
    },
  });

  // 4. JSX RENDER
  return (
    <AppleCard layer="surface" size="medium" onPress={handlePress}>
      <View style={styles.statusBar} />
      <Text style={styles.tableNumber}>Table {table.table_number}</Text>
      <View style={styles.capacityBadge}>
        <Text>{table.capacity} seats</Text>
      </View>
    </AppleCard>
  );
};
```

### Theme Color Mapping

```typescript
// Standardized color references
const getStatusColor = (status: TableStatus, theme: Theme): string => {
  switch (status) {
    case TableStatus.AVAILABLE:
      return theme.colors.success;
    case TableStatus.OCCUPIED:
      return theme.colors.error;
    case TableStatus.RESERVED:
      return theme.colors.warning;
    case TableStatus.CLEANING:
      return theme.colors.tertiary;
    default:
      return theme.colors.outline;
  }
};

// Usage in components
<View style={[styles.statusBar, { backgroundColor: getStatusColor(table.status, theme) }]} />
```

---

## Performance Optimization Architecture

### Component Memoization

```typescript
// Expensive components memoized
export const TableCard = React.memo<TableCardProps>(
  ({ table, onPress, onLongPress }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison for re-render
    return (
      prevProps.table.id === nextProps.table.id &&
      prevProps.table.status === nextProps.table.status &&
      prevProps.table.updated_at === nextProps.table.updated_at
    );
  }
);

export const FloorPlanGrid = React.memo<FloorPlanGridProps>(
  ({ tables, onTableSelect }) => {
    // Grid implementation
  }
);
```

### Callback Optimization

```typescript
const TableManagementSettings = () => {
  const { state, selectTable, updateTable } = useTableManagement();

  // Memoized callbacks
  const handleTableSelect = useCallback((tableId: string) => {
    selectTable(tableId);
  }, [selectTable]);

  const handleTableUpdate = useCallback((tableId: string, data: Partial<Table>) => {
    updateTable(tableId, data);
  }, [updateTable]);

  // Memoized computed values
  const filteredTables = useMemo(() => {
    return state.tables.filter(table => {
      const matchesFilter = state.activeFilter === 'all' || table.status === state.activeFilter;
      const matchesSearch = table.table_number.toLowerCase().includes(state.searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [state.tables, state.activeFilter, state.searchQuery]);

  return (
    <FloorPlanGrid
      tables={filteredTables}
      onTableSelect={handleTableSelect}
      onTableUpdate={handleTableUpdate}
    />
  );
};
```

### FlatList Optimization

```typescript
// For large table lists (50+ tables)
const FloorPlanGrid = ({ tables, onTableSelect }) => {
  const renderItem = useCallback(({ item }) => (
    <TableCard
      table={item}
      onPress={() => onTableSelect(item.id)}
    />
  ), [onTableSelect]);

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      data={tables}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      numColumns={gridColumns}
    />
  );
};
```

---

## Error Handling Architecture

### Error Boundaries

```typescript
// File: /src/components/table-management/TableManagementErrorBoundary.tsx
// Lines: ~100

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class TableManagementErrorBoundary extends React.Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('TableManagement error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppleCard layer="surface" size="large">
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
          <AppleButton
            title="Reload"
            variant="primary"
            onPress={() => this.setState({ hasError: false, error: null })}
          />
        </AppleCard>
      );
    }

    return this.props.children;
  }
}
```

### Service Error Handling

```typescript
// Consistent error handling in services
async getTables(restaurantId: string): Promise<Table[]> {
  try {
    const response = await this.apiClient.get(`/tables`, {
      params: { restaurantId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch tables');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return []; // No tables found
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.response?.data?.message || 'Network error');
    }

    throw error;
  }
}
```

---

## Real-time Updates Architecture

### WebSocket Integration

```typescript
// File: /src/services/table-management/TableUpdatesService.ts
// Lines: ~150

interface ITableUpdatesService {
  subscribe(restaurantId: string, callback: (update: TableUpdate) => void): () => void;
  unsubscribe(): void;
}

export class TableUpdatesService implements ITableUpdatesService {
  private ws: WebSocket | null = null;
  private callbacks: Set<(update: TableUpdate) => void> = new Set();

  subscribe(restaurantId: string, callback: (update: TableUpdate) => void): () => void {
    this.callbacks.add(callback);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect(restaurantId);
    }

    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.disconnect();
      }
    };
  }

  private connect(restaurantId: string) {
    this.ws = new WebSocket(`${WS_URL}/table-updates/${restaurantId}`);

    this.ws.onmessage = (event) => {
      const update: TableUpdate = JSON.parse(event.data);
      this.callbacks.forEach(callback => callback(update));
    };

    this.ws.onerror = (error) => {
      logger.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      // Reconnect after delay
      setTimeout(() => this.connect(restaurantId), 5000);
    };
  }

  private disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Usage in Context
useEffect(() => {
  const unsubscribe = tableUpdatesService.subscribe(
    restaurantId,
    (update) => {
      if (update.type === 'TABLE_STATUS_CHANGED') {
        dispatch({ type: 'UPDATE_TABLE', payload: update.table });
      }
    }
  );

  return unsubscribe;
}, [restaurantId]);
```

---

## Testing Architecture

### Service Layer Tests

```typescript
// File: /src/services/table-management/__tests__/TableManagementService.test.ts

describe('TableManagementService', () => {
  let service: TableManagementService;
  let mockApiClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    service = new TableManagementService(mockApiClient);
  });

  describe('getTables', () => {
    it('should fetch tables successfully', async () => {
      const mockTables = [MOCK_TABLE_1, MOCK_TABLE_2];
      mockApiClient.get.mockResolvedValue({
        data: { success: true, data: mockTables }
      });

      const tables = await service.getTables('rest_001');

      expect(tables).toEqual(mockTables);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/table-management/tables',
        { params: { restaurantId: 'rest_001' } }
      );
    });

    it('should handle errors gracefully', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.getTables('rest_001')).rejects.toThrow('Failed to fetch tables');
    });
  });
});
```

### Component Tests

```typescript
// File: /src/components/table-management/__tests__/TableCard.test.tsx

describe('TableCard', () => {
  it('should render table information correctly', () => {
    const { getByText } = render(
      <TableCard table={MOCK_TABLE} onPress={jest.fn()} />
    );

    expect(getByText(`Table ${MOCK_TABLE.table_number}`)).toBeTruthy();
    expect(getByText(`${MOCK_TABLE.capacity} seats`)).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TableCard table={MOCK_TABLE} onPress={onPress} />
    );

    fireEvent.press(getByTestId('table-card'));
    expect(onPress).toHaveBeenCalledWith(MOCK_TABLE.id);
  });

  it('should display correct status color', () => {
    const { getByTestId } = render(
      <TableCard table={{ ...MOCK_TABLE, status: TableStatus.OCCUPIED }} />
    );

    const statusBar = getByTestId('status-bar');
    expect(statusBar.props.style).toContainEqual({
      backgroundColor: expect.stringContaining('error') // theme.colors.error
    });
  });
});
```

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Architecture Patterns**: SOLID, Context API, Service Layer, Theme System
**Performance**: Optimized for 100+ tables, <16ms render time
**Testing**: 70%+ coverage target
