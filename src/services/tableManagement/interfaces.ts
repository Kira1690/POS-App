/**
 * Table Management Service Interfaces
 * Defines contracts for all table management services
 * Following Interface Segregation Principle (SOLID)
 */

import {
  Table,
  Area,
  Reservation,
  CreateTableRequest,
  UpdateTableRequest,
  CreateAreaRequest,
  UpdateAreaRequest,
  CreateReservationRequest,
  TableStatus,
  Position,
  MergeTablesRequest,
  MergeTablesResult,
  MergeValidationResult,
  SplitTableRequest,
  SplitTableResult,
  SplitConfig,
  TransferTableRequest,
  TransferTableResult,
  TransferValidationResult,
  ValidationResult,
} from '@/types/settings/table-management.types';

/**
 * Table Management Service Interface
 * Handles CRUD operations for tables
 */
export interface ITableManagementService {
  // Read operations
  getTables(restaurantId: string): Promise<Table[]>;
  getTable(tableId: string): Promise<Table>;
  getTablesByArea(areaId: string): Promise<Table[]>;
  getTablesByStatus(status: TableStatus): Promise<Table[]>;

  // Write operations
  createTable(data: CreateTableRequest): Promise<Table>;
  updateTable(tableId: string, data: UpdateTableRequest): Promise<Table>;
  deleteTable(tableId: string): Promise<void>;

  // Status and position updates
  updateTableStatus(tableId: string, status: TableStatus): Promise<Table>;
  updateTablePosition(tableId: string, position: Position): Promise<Table>;

  // Bulk operations
  bulkUpdateStatus(tableIds: string[], status: TableStatus): Promise<void>;
  bulkUpdateArea(tableIds: string[], areaId: string): Promise<void>;
}

/**
 * Area Service Interface
 * Handles dining area management
 */
export interface IAreaService {
  // Read operations
  getAreas(restaurantId: string): Promise<Area[]>;
  getArea(areaId: string): Promise<Area>;

  // Write operations
  createArea(data: CreateAreaRequest): Promise<Area>;
  updateArea(areaId: string, data: UpdateAreaRequest): Promise<Area>;
  deleteArea(areaId: string): Promise<void>;

  // Ordering
  reorderAreas(areaIds: string[]): Promise<void>;
}

/**
 * Table Operations Service Interface
 * Handles complex table operations (merge, split, transfer)
 */
export interface ITableOperationsService {
  // Table operations
  mergeTables(request: MergeTablesRequest): Promise<MergeTablesResult>;
  splitTable(request: SplitTableRequest): Promise<SplitTableResult>;
  transferTable(request: TransferTableRequest): Promise<TransferTableResult>;

  // Validation
  validateMerge(tableIds: string[]): Promise<MergeValidationResult>;
  validateSplit(tableId: string, splitConfig: SplitConfig): Promise<ValidationResult>;
  validateTransfer(sourceId: string, destId: string): Promise<TransferValidationResult>;
}

/**
 * Reservation Service Interface
 * Handles table reservations
 */
export interface IReservationService {
  // Read operations
  getReservations(restaurantId: string, date: Date): Promise<Reservation[]>;
  getReservation(reservationId: string): Promise<Reservation>;

  // Write operations
  createReservation(data: CreateReservationRequest): Promise<Reservation>;
  updateReservation(
    id: string,
    data: Partial<Reservation>
  ): Promise<Reservation>;
  cancelReservation(id: string, reason: string): Promise<void>;

  // Availability
  checkAvailability(
    restaurantId: string,
    partySize: number,
    dateTime: Date
  ): Promise<Table[]>;
}
