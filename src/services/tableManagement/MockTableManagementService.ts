/**
 * Mock Table Management Service
 * Now uses TableStorageService for persistence
 * Data synced with Order Management
 * Following SOLID principles - Single Responsibility
 */

import {
  Table,
  TableStatus,
  TableShape,
  TableSize,
  Position,
  CreateTableRequest,
  UpdateTableRequest,
} from '@/types/settings/table-management.types';
import { Table as StorageTable } from '@/types/table.types';
import { TableStatus as StorageTableStatus } from '@/types/common.types';
import { ITableManagementService } from './interfaces';
import { tableStorageService, StoredArea } from '@/services/storage';
import { MOCK_TABLES } from './mockData';

export class MockTableManagementService implements ITableManagementService {
  private initialized = false;
  private cachedTables: Table[] = [];
  private delay = 100; // Reduced delay since we're using storage

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * Convert StorageTable to Settings Table format
   */
  private storageToSettingsTable(storage: StorageTable, areas: StoredArea[]): Table {
    const area = areas.find(a => a.id === storage.section);
    return {
      id: storage.id,
      restaurant_id: storage.restaurant_id,
      area_id: storage.section || 'area_main',
      table_number: storage.table_number,
      capacity: storage.capacity,
      status: storage.status as unknown as TableStatus,
      shape: TableShape.SQUARE, // Default shape
      size: storage.capacity <= 2 ? TableSize.SMALL : storage.capacity <= 4 ? TableSize.MEDIUM : TableSize.LARGE,
      position: { x: 0, y: 0 },
      is_active: storage.is_active ?? true,
      allow_online_booking: true,
      notes: storage.notes,
      current_order_id: storage.current_order_id,
      created_at: new Date(storage.created_at),
      updated_at: new Date(storage.updated_at),
      created_by: 'system',
      updated_by: 'system',
    };
  }

  /**
   * Convert Settings Table to StorageTable format
   */
  private settingsToStorageTable(table: Table): StorageTable {
    return {
      id: table.id,
      restaurant_id: table.restaurant_id,
      table_number: table.table_number,
      capacity: table.capacity,
      status: table.status as unknown as StorageTableStatus,
      location: table.notes || '',
      section: table.area_id,
      notes: table.notes,
      current_order_id: table.current_order_id,
      is_active: table.is_active,
      is_deleted: false,
      created_at: table.created_at?.toISOString() || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Initialize from storage
   */
  private async ensureInitialized(restaurantId: string): Promise<void> {
    if (this.initialized && this.cachedTables.length > 0) {
      return;
    }

    try {
      const data = await tableStorageService.initialize(restaurantId);
      const areas = await tableStorageService.getAreas();

      // Convert storage tables to settings format
      this.cachedTables = data.tables.map(t => this.storageToSettingsTable(t, areas));
      this.initialized = true;

      if (__DEV__) {
        console.log(`[MockTableManagementService] Loaded ${this.cachedTables.length} tables from storage`);
      }
    } catch (error) {
      console.error('[MockTableManagementService] Failed to load from storage:', error);
      // Fallback to mock data
      this.cachedTables = [...MOCK_TABLES];
      this.initialized = true;
    }
  }

  /**
   * Persist changes to storage
   */
  private async persistToStorage(): Promise<void> {
    const storageTables = this.cachedTables.map(t => this.settingsToStorageTable(t));
    await tableStorageService.saveTables(storageTables);
  }

  async getTables(restaurantId: string): Promise<Table[]> {
    await this.ensureInitialized(restaurantId);
    await this.simulateDelay();
    return this.cachedTables.filter((t) => t.restaurant_id === restaurantId);
  }

  async getTable(tableId: string): Promise<Table> {
    await this.simulateDelay();
    const table = this.cachedTables.find((t) => t.id === tableId);
    if (!table) {
      throw new Error(`Table not found: ${tableId}`);
    }
    return table;
  }

  async getTablesByArea(areaId: string): Promise<Table[]> {
    await this.simulateDelay();
    return this.cachedTables.filter((t) => t.area_id === areaId);
  }

  async getTablesByStatus(status: TableStatus): Promise<Table[]> {
    await this.simulateDelay();
    return this.cachedTables.filter((t) => t.status === status);
  }

  async createTable(data: CreateTableRequest): Promise<Table> {
    await this.simulateDelay();

    const newTable: Table = {
      id: `table_${Date.now()}`,
      ...data,
      status: TableStatus.AVAILABLE,
      is_active: data.is_active ?? true,
      allow_online_booking: data.allow_online_booking ?? true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'current_user',
      updated_by: 'current_user',
    };

    this.cachedTables.push(newTable);
    await this.persistToStorage();
    return newTable;
  }

  async updateTable(
    tableId: string,
    data: UpdateTableRequest
  ): Promise<Table> {
    await this.simulateDelay();

    const index = this.cachedTables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.cachedTables[index] = {
      ...this.cachedTables[index],
      ...data,
      updated_at: new Date(),
      updated_by: 'current_user',
    };

    await this.persistToStorage();
    return this.cachedTables[index];
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.simulateDelay();

    const index = this.cachedTables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.cachedTables.splice(index, 1);
    await this.persistToStorage();
  }

  async updateTableStatus(
    tableId: string,
    status: TableStatus
  ): Promise<Table> {
    await this.simulateDelay();

    const index = this.cachedTables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.cachedTables[index] = {
      ...this.cachedTables[index],
      status,
      updated_at: new Date(),
      updated_by: 'current_user',
      // Clear occupancy data if becoming available
      ...(status === TableStatus.AVAILABLE && {
        current_order_id: undefined,
        current_reservation_id: undefined,
        assigned_server_id: undefined,
        customer_name: undefined,
        occupied_since: undefined,
      }),
    };

    await this.persistToStorage();
    return this.cachedTables[index];
  }

  async updateTablePosition(
    tableId: string,
    position: Position
  ): Promise<Table> {
    await this.simulateDelay();

    const index = this.cachedTables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.cachedTables[index] = {
      ...this.cachedTables[index],
      position,
      updated_at: new Date(),
      updated_by: 'current_user',
    };

    await this.persistToStorage();
    return this.cachedTables[index];
  }

  async bulkUpdateStatus(
    tableIds: string[],
    status: TableStatus
  ): Promise<void> {
    await this.simulateDelay();

    tableIds.forEach((tableId) => {
      const index = this.cachedTables.findIndex((t) => t.id === tableId);
      if (index !== -1) {
        this.cachedTables[index] = {
          ...this.cachedTables[index],
          status,
          updated_at: new Date(),
          updated_by: 'current_user',
        };
      }
    });

    await this.persistToStorage();
  }

  async bulkUpdateArea(tableIds: string[], areaId: string): Promise<void> {
    await this.simulateDelay();

    tableIds.forEach((tableId) => {
      const index = this.cachedTables.findIndex((t) => t.id === tableId);
      if (index !== -1) {
        this.cachedTables[index] = {
          ...this.cachedTables[index],
          area_id: areaId,
          updated_at: new Date(),
          updated_by: 'current_user',
        };
      }
    });

    await this.persistToStorage();
  }

  /**
   * Force refresh from storage
   */
  async forceRefresh(restaurantId: string): Promise<void> {
    this.initialized = false;
    await this.ensureInitialized(restaurantId);
  }
}
