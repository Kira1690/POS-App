# Data Models - Table Management Settings

## TypeScript Interfaces and Types

### Core Entities

#### Table
```typescript
// File: /src/types/table-management.types.ts

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum TableShape {
  ROUND = 'round',
  SQUARE = 'square',
  RECTANGLE = 'rectangle',
  OVAL = 'oval',
}

export enum TableSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface Position {
  x: number;
  y: number;
  gridX?: number;
  gridY?: number;
}

export interface Table {
  id: string;
  restaurant_id: string;
  area_id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  shape: TableShape;
  size: TableSize;
  position: Position;

  // Operational
  is_active: boolean;
  allow_online_booking: boolean;

  // Current state (if occupied/reserved)
  current_order_id?: string;
  current_reservation_id?: string;
  assigned_server_id?: string;
  customer_name?: string;
  occupied_since?: Date;
  estimated_duration?: number; // minutes

  // Customization
  custom_icon?: string;
  custom_color?: string;
  notes?: string;

  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface CreateTableRequest {
  restaurant_id: string;
  area_id: string;
  table_number: string;
  capacity: number;
  shape: TableShape;
  size: TableSize;
  position: Position;
  is_active?: boolean;
  allow_online_booking?: boolean;
  custom_icon?: string;
  custom_color?: string;
  notes?: string;
}

export interface UpdateTableRequest {
  area_id?: string;
  table_number?: string;
  capacity?: number;
  status?: TableStatus;
  shape?: TableShape;
  size?: TableSize;
  position?: Position;
  is_active?: boolean;
  allow_online_booking?: boolean;
  custom_icon?: string;
  custom_color?: string;
  notes?: string;
}
```

#### Area
```typescript
export interface Area {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  color: string; // For floor plan visualization
  display_order: number;
  is_active: boolean;
  allow_reservations: boolean;
  default_server_id?: string;

  // Computed fields
  table_count?: number;
  total_capacity?: number;
  available_tables?: number;

  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface CreateAreaRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  color: string;
  is_active?: boolean;
  allow_reservations?: boolean;
  default_server_id?: string;
}

export interface UpdateAreaRequest {
  name?: string;
  description?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  allow_reservations?: boolean;
  default_server_id?: string;
}
```

#### Reservation
```typescript
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  COMPLETED = 'completed',
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  party_size: number;

  // Timing
  reservation_date: Date;
  reservation_time: string; // HH:MM format
  duration: number; // minutes
  arrival_time?: Date;
  seated_time?: Date;
  completion_time?: Date;

  // Details
  status: ReservationStatus;
  occasion?: string;
  special_requests?: string;
  dietary_restrictions?: string[];

  // Notifications
  send_confirmation: boolean;
  reminder_time?: number; // hours before
  confirmation_sent_at?: Date;
  reminder_sent_at?: Date;

  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface CreateReservationRequest {
  restaurant_id: string;
  table_id?: string; // Optional - can auto-assign
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  party_size: number;
  reservation_date: Date;
  reservation_time: string;
  duration: number;
  occasion?: string;
  special_requests?: string;
  dietary_restrictions?: string[];
  send_confirmation?: boolean;
  reminder_time?: number;
}
```

### Operations

#### Table Merge
```typescript
export interface MergeTablesRequest {
  restaurant_id: string;
  table_ids: string[]; // 2+ tables
  primary_table_id: string; // Which table number to keep
  party_size: number;
  customer_name: string;
  special_requests?: string;
  assigned_server_id?: string;
}

export interface MergeTablesResult {
  merged_table_id: string;
  original_table_ids: string[];
  combined_capacity: number;
  created_order_id?: string;
  success: boolean;
  message: string;
}

export interface MergeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  combined_capacity: number;
  suggested_primary_table?: string;
}
```

#### Table Split
```typescript
export enum SplitMethod {
  BY_PEOPLE = 'by_people',
  BY_ITEMS = 'by_items',
  CUSTOM = 'custom',
}

export interface SplitConfig {
  method: SplitMethod;
  splits: SplitDetail[];
  total_amount: number;
}

export interface SplitDetail {
  split_number: number;
  amount: number;
  items?: OrderItem[];
  description?: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed';
}

export interface SplitTableRequest {
  restaurant_id: string;
  table_id: string;
  order_id: string;
  split_config: SplitConfig;
}

export interface SplitTableResult {
  original_order_id: string;
  split_orders: {
    order_id: string;
    amount: number;
    payment_status: string;
  }[];
  success: boolean;
  message: string;
}
```

#### Table Transfer
```typescript
export interface TransferTableRequest {
  restaurant_id: string;
  source_table_id: string;
  destination_table_id: string;
  order_id?: string;
  reservation_id?: string;
  transfer_reason: string;
  transfer_notes?: string;
  notify_kitchen: boolean;
  update_reservation: boolean;
}

export interface TransferTableResult {
  source_table_id: string;
  destination_table_id: string;
  order_id?: string;
  reservation_id?: string;
  success: boolean;
  message: string;
}

export interface TransferValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  capacity_compatible: boolean;
  destination_available: boolean;
}
```

### UI State

#### Filter and Search
```typescript
export type TableStatusFilter = 'all' | TableStatus;

export interface TableFilters {
  status: TableStatusFilter;
  areaId?: string;
  capacityMin?: number;
  capacityMax?: number;
  availableOnly?: boolean;
}

export interface TableSearchQuery {
  query: string;
  fields: ('table_number' | 'area' | 'customer_name' | 'server_name')[];
}
```

#### Grid Configuration
```typescript
export interface GridConfig {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  spacing: number;
  minCellSize: number;
  maxCellSize: number;
  snapToGrid: boolean;
}

export interface FloorPlanSettings {
  gridConfig: GridConfig;

  // Display
  showTableNumbers: boolean;
  showCapacity: boolean;
  showStatus: boolean;
  showServerAssignments: boolean;

  // Colors
  statusColors: {
    available: string;
    occupied: string;
    reserved: string;
    cleaning: string;
    outOfService: string;
  };

  // Labels
  labelFontSize: number;
  labelPosition: 'top' | 'center' | 'bottom';

  // Advanced
  enableDragDrop: boolean;
  autoSaveLayout: boolean;
  layoutBackupEnabled: boolean;
}
```

### Service Interfaces

```typescript
export interface ITableManagementService {
  getTables(restaurantId: string): Promise<Table[]>;
  getTable(tableId: string): Promise<Table>;
  getTablesByArea(areaId: string): Promise<Table[]>;
  getTablesByStatus(status: TableStatus): Promise<Table[]>;
  createTable(data: CreateTableRequest): Promise<Table>;
  updateTable(tableId: string, data: UpdateTableRequest): Promise<Table>;
  deleteTable(tableId: string): Promise<void>;
  updateTableStatus(tableId: string, status: TableStatus): Promise<Table>;
  updateTablePosition(tableId: string, position: Position): Promise<Table>;
  bulkUpdateStatus(tableIds: string[], status: TableStatus): Promise<void>;
  bulkUpdateArea(tableIds: string[], areaId: string): Promise<void>;
}

export interface IAreaService {
  getAreas(restaurantId: string): Promise<Area[]>;
  getArea(areaId: string): Promise<Area>;
  createArea(data: CreateAreaRequest): Promise<Area>;
  updateArea(areaId: string, data: UpdateAreaRequest): Promise<Area>;
  deleteArea(areaId: string): Promise<void>;
  reorderAreas(areaIds: string[]): Promise<void>;
}

export interface ITableOperationsService {
  mergeTables(request: MergeTablesRequest): Promise<MergeTablesResult>;
  splitTable(request: SplitTableRequest): Promise<SplitTableResult>;
  transferTable(request: TransferTableRequest): Promise<TransferTableResult>;
  validateMerge(tableIds: string[]): Promise<MergeValidationResult>;
  validateSplit(tableId: string, splitConfig: SplitConfig): Promise<ValidationResult>;
  validateTransfer(sourceId: string, destId: string): Promise<TransferValidationResult>;
}

export interface IReservationService {
  getReservations(restaurantId: string, date: Date): Promise<Reservation[]>;
  createReservation(data: CreateReservationRequest): Promise<Reservation>;
  updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation>;
  cancelReservation(id: string, reason: string): Promise<void>;
  checkAvailability(restaurantId: string, partySize: number, dateTime: Date): Promise<Table[]>;
}
```

### API Response Types

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### WebSocket Updates

```typescript
export enum TableUpdateType {
  STATUS_CHANGED = 'TABLE_STATUS_CHANGED',
  POSITION_CHANGED = 'TABLE_POSITION_CHANGED',
  CREATED = 'TABLE_CREATED',
  UPDATED = 'TABLE_UPDATED',
  DELETED = 'TABLE_DELETED',
  MERGED = 'TABLES_MERGED',
  SPLIT = 'TABLE_SPLIT',
  TRANSFERRED = 'TABLE_TRANSFERRED',
}

export interface TableUpdate {
  type: TableUpdateType;
  table?: Table;
  tables?: Table[];
  timestamp: Date;
  userId: string;
  restaurantId: string;
  metadata?: Record<string, any>;
}
```

### Mock Data Types

```typescript
export const MOCK_TABLES_DATA: Table[] = [
  {
    id: 'table_001',
    restaurant_id: 'rest_001',
    area_id: 'area_main',
    table_number: '1',
    capacity: 4,
    status: TableStatus.AVAILABLE,
    shape: TableShape.SQUARE,
    size: TableSize.MEDIUM,
    position: { x: 0, y: 0, gridX: 0, gridY: 0 },
    is_active: true,
    allow_online_booking: true,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'admin_001',
    updated_by: 'admin_001',
  },
  // ... more mock tables
];

export const MOCK_AREAS_DATA: Area[] = [
  {
    id: 'area_main',
    restaurant_id: 'rest_001',
    name: 'Main Dining',
    description: 'Primary dining area',
    color: '#4CAF50',
    display_order: 1,
    is_active: true,
    allow_reservations: true,
    table_count: 15,
    total_capacity: 60,
    available_tables: 10,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // ... more mock areas
];
```

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Total Interfaces**: 30+
**Type Safety**: Full TypeScript coverage with strict mode
