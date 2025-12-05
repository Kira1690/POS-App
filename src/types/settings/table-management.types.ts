/**
 * Table Management Types
 * Complete type definitions for table management settings
 * Following strict TypeScript and SOLID principles
 */

// ==================== ENUMS ====================

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

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  COMPLETED = 'completed',
}

export enum SplitMethod {
  BY_PEOPLE = 'by_people',
  BY_ITEMS = 'by_items',
  CUSTOM = 'custom',
}

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

// ==================== CORE ENTITIES ====================

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

// ==================== REQUEST TYPES ====================

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

// ==================== OPERATIONS ====================

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

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
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

// ==================== UI STATE ====================

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

  // Colors (theme-based keys)
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

// ==================== API RESPONSES ====================

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

// ==================== WEBSOCKET ====================

export interface TableUpdate {
  type: TableUpdateType;
  table?: Table;
  tables?: Table[];
  timestamp: Date;
  userId: string;
  restaurantId: string;
  metadata?: Record<string, unknown>;
}

// ==================== FLOOR PLAN TYPES ====================

/**
 * Zone types for floor plan
 */
export type ZoneType =
  | 'kitchen'
  | 'bar'
  | 'entrance'
  | 'restroom'
  | 'storage'
  | 'vip'
  | 'outdoor'
  | 'custom';

/**
 * Zone bounds (position and size)
 */
export interface ZoneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Floor/Level entity for multi-floor support
 */
export interface Floor {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  is_default: boolean;
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
  grid_enabled: boolean;
  background_color?: string;
  background_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Enhanced zone for floor plan
 */
export interface FloorZone {
  id: string;
  floor_id: string;
  name: string;
  type: ZoneType;
  bounds: ZoneBounds;
  color: string;
  icon: string;
  is_seating_area: boolean;
  opacity: number;
  is_locked: boolean;
  display_order: number;
}

/**
 * Table position on floor plan canvas
 */
export interface FloorPlanTablePosition {
  table_id: string;
  floor_id: string;
  x: number;
  y: number;
  rotation: number;
  width?: number;   // Custom width override (center-based)
  height?: number;  // Custom height override (center-based)
  grid_x?: number;
  grid_y?: number;
}

/**
 * Individual chair position around a table
 */
export interface ChairPosition {
  index: number;
  angle: number;
  distance: number;
  x: number;
  y: number;
}

/**
 * Chair configuration for a table
 */
export interface ChairConfig {
  capacity: number;
  shape: TableShape;
  size: TableSize;
  positions: ChairPosition[];
}

/**
 * Tool types for floor plan editor
 */
export type FloorPlanTool =
  | 'select'
  | 'move'
  | 'add_table'
  | 'add_zone'
  | 'delete'
  | 'duplicate'
  | 'rotate'
  | 'pan';

/**
 * Floor plan canvas state
 */
export interface FloorPlanCanvasState {
  activeFloorId: string;
  selectedTableId: string | null;
  selectedZoneId: string | null;
  activeTool: FloorPlanTool;
  zoom: number;
  pan: { x: number; y: number };
  gridEnabled: boolean;
  snapToGrid: boolean;
  showChairs: boolean;
  showTableNumbers: boolean;
  showCapacity: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Action types for history tracking
 */
export type FloorPlanAction =
  | 'table_moved'
  | 'table_added'
  | 'table_deleted'
  | 'table_rotated'
  | 'table_duplicated'
  | 'table_resized'
  | 'zone_added'
  | 'zone_deleted'
  | 'zone_resized'
  | 'zone_moved'
  | 'bulk_change';

/**
 * Snapshot of floor plan state for undo/redo
 */
export interface FloorPlanSnapshot {
  tables: FloorPlanTablePosition[];
  zones: FloorZone[];
}

/**
 * History entry for undo/redo
 */
export interface FloorPlanHistoryEntry {
  id: string;
  timestamp: Date;
  action: FloorPlanAction;
  description: string;
  before: FloorPlanSnapshot;
  after: FloorPlanSnapshot;
}

/**
 * Floor plan export data format
 */
export interface FloorPlanExportData {
  version: string;
  exported_at: string;
  restaurant_id: string;
  floors: Floor[];
  tables: FloorPlanTablePosition[];
  zones: FloorZone[];
  settings: {
    grid_size: number;
    snap_to_grid: boolean;
    show_chairs: boolean;
  };
}

/**
 * Floor plan reducer action types
 */
export type FloorPlanReducerAction =
  | { type: 'SELECT_FLOOR'; payload: string }
  | { type: 'SELECT_TABLE'; payload: string | null }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'SET_TOOL'; payload: FloorPlanTool }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'TOGGLE_CHAIRS' }
  | { type: 'UPDATE_TABLE_POSITION'; payload: { tableId: string; position: Partial<FloorPlanTablePosition> } }
  | { type: 'RESIZE_TABLE'; payload: { tableId: string; width: number; height: number } }
  | { type: 'ADD_TABLE'; payload: FloorPlanTablePosition }
  | { type: 'DELETE_TABLE'; payload: string }
  | { type: 'ADD_ZONE'; payload: FloorZone }
  | { type: 'UPDATE_ZONE'; payload: { zoneId: string; zone: Partial<FloorZone> } }
  | { type: 'MOVE_ZONE'; payload: { zoneId: string; x: number; y: number } }
  | { type: 'RESIZE_ZONE'; payload: { zoneId: string; width: number; height: number } }
  | { type: 'DELETE_ZONE'; payload: string }
  | { type: 'LOAD_FLOOR_PLAN'; payload: FloorPlanExportData }
  | { type: 'MARK_SAVED' }
  | { type: 'UNDO' }
  | { type: 'REDO' };
