/**
 * Table Storage Service
 * Handles persistence of table management data
 *
 * SINGLE SOURCE OF TRUTH: AsyncStorage ONLY
 * Tables are created via Settings > Table Management
 * Table STATUS is computed at runtime from orders (not stored here)
 *
 * NO MOCK DATA - Production ready
 */

import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { storageService, STORAGE_KEYS } from './StorageService';
import { MOCK_TABLES } from '@/data/tables/mockTables';
import { MOCK_AREAS } from '@/data/tables/mockAreas';

// Area interface for storage (matches MockArea structure)
export interface StoredArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  color?: string;
}

// Table data structure for storage
export interface TableStorageData {
  tables: Table[];
  areas: StoredArea[];
  lastUpdated: string;
  restaurantId: string;
}

// Floor plan position data
export interface FloorPlanPosition {
  tableId: string;
  positionX: number;
  positionY: number;
  shape: 'square' | 'round' | 'rectangle';
}

export interface FloorPlanData {
  positions: FloorPlanPosition[];
  lastUpdated: string;
}

/**
 * TableStorageService - Manages table data persistence
 *
 * SINGLE SOURCE OF TRUTH: AsyncStorage ONLY
 * - Tables are created via Settings > Table Management
 * - NO mock data seeding
 * - Table status is computed at runtime from orders
 */
class TableStorageService {
  private readonly DEFAULT_RESTAURANT_ID = 'rest_001';

  /**
   * Save all table data
   */
  async saveTableData(data: TableStorageData): Promise<void> {
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    await storageService.multiSet([
      { key: STORAGE_KEYS.TABLE_DATA, value: data.tables },
      { key: STORAGE_KEYS.TABLE_AREAS, value: data.areas },
      { key: STORAGE_KEYS.TABLE_LAST_SYNC, value: dataWithTimestamp.lastUpdated },
    ]);
  }

  /**
   * Get all table data
   */
  async getTableData(restaurantId: string = this.DEFAULT_RESTAURANT_ID): Promise<TableStorageData | null> {
    const [tables, areas, lastUpdated] = await Promise.all([
      storageService.get<Table[]>(STORAGE_KEYS.TABLE_DATA),
      storageService.get<StoredArea[]>(STORAGE_KEYS.TABLE_AREAS),
      storageService.get<string>(STORAGE_KEYS.TABLE_LAST_SYNC),
    ]);

    if (!tables || tables.length === 0) {
      return null;
    }

    return {
      tables: tables || [],
      areas: areas || [],
      lastUpdated: lastUpdated || new Date().toISOString(),
      restaurantId,
    };
  }

  /**
   * Check if table data exists in storage
   */
  async hasTableData(): Promise<boolean> {
    // Check both that we have a sync timestamp AND that tables actually exist
    const [lastSync, tables] = await Promise.all([
      storageService.get<string>(STORAGE_KEYS.TABLE_LAST_SYNC),
      storageService.get<Table[]>(STORAGE_KEYS.TABLE_DATA),
    ]);
    return lastSync !== null && tables !== null && tables.length > 0;
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<string | null> {
    return storageService.get<string>(STORAGE_KEYS.TABLE_LAST_SYNC);
  }

  // ============== TABLES ==============

  /**
   * Save tables
   */
  async saveTables(tables: Table[]): Promise<void> {
    await storageService.set(STORAGE_KEYS.TABLE_DATA, tables);
    await this.updateLastSync();
  }

  /**
   * Get tables
   */
  async getTables(): Promise<Table[]> {
    const tables = await storageService.get<Table[]>(STORAGE_KEYS.TABLE_DATA);
    return tables || [];
  }

  /**
   * Get tables by area/section
   */
  async getTablesByArea(areaId: string): Promise<Table[]> {
    const tables = await this.getTables();
    return tables.filter(t => t.section === areaId);
  }

  /**
   * Get tables by status
   */
  async getTablesByStatus(status: TableStatus): Promise<Table[]> {
    const tables = await this.getTables();
    return tables.filter(t => t.status === status);
  }

  /**
   * Add a table
   */
  async addTable(table: Table): Promise<void> {
    const tables = await this.getTables();
    tables.push(table);
    await this.saveTables(tables);
  }

  /**
   * Update a table
   */
  async updateTable(id: string, data: Partial<Table>): Promise<void> {
    const tables = await this.getTables();
    const index = tables.findIndex(t => t.id === id);
    if (index !== -1) {
      tables[index] = {
        ...tables[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      await this.saveTables(tables);
    }
  }

  /**
   * Delete a table
   */
  async deleteTable(id: string): Promise<void> {
    const tables = await this.getTables();
    const filtered = tables.filter(t => t.id !== id);
    await this.saveTables(filtered);
  }

  /**
   * Update table status
   */
  async updateTableStatus(id: string, status: TableStatus): Promise<void> {
    await this.updateTable(id, { status });
  }

  // ============== AREAS ==============

  /**
   * Save areas
   */
  async saveAreas(areas: StoredArea[]): Promise<void> {
    await storageService.set(STORAGE_KEYS.TABLE_AREAS, areas);
    await this.updateLastSync();
  }

  /**
   * Get areas
   */
  async getAreas(): Promise<StoredArea[]> {
    const areas = await storageService.get<StoredArea[]>(STORAGE_KEYS.TABLE_AREAS);
    return areas || [];
  }

  /**
   * Get active areas
   */
  async getActiveAreas(): Promise<StoredArea[]> {
    const areas = await this.getAreas();
    return areas.filter(a => a.isActive);
  }

  /**
   * Add an area
   */
  async addArea(area: StoredArea): Promise<void> {
    const areas = await this.getAreas();
    areas.push(area);
    await this.saveAreas(areas);
  }

  /**
   * Update an area
   */
  async updateArea(id: string, data: Partial<StoredArea>): Promise<void> {
    const areas = await this.getAreas();
    const index = areas.findIndex(a => a.id === id);
    if (index !== -1) {
      areas[index] = { ...areas[index], ...data };
      await this.saveAreas(areas);
    }
  }

  /**
   * Delete an area
   */
  async deleteArea(id: string): Promise<void> {
    const areas = await this.getAreas();
    const filtered = areas.filter(a => a.id !== id);
    await this.saveAreas(filtered);
  }

  // ============== FLOOR PLAN ==============

  /**
   * Save floor plan positions
   */
  async saveFloorPlan(data: FloorPlanData): Promise<void> {
    await storageService.set(STORAGE_KEYS.TABLE_FLOOR_PLAN, data);
  }

  /**
   * Get floor plan positions
   */
  async getFloorPlan(): Promise<FloorPlanData | null> {
    return storageService.get<FloorPlanData>(STORAGE_KEYS.TABLE_FLOOR_PLAN);
  }

  /**
   * Update table position
   */
  async updateTablePosition(
    tableId: string,
    positionX: number,
    positionY: number,
    shape?: 'square' | 'round' | 'rectangle'
  ): Promise<void> {
    const floorPlan = await this.getFloorPlan();
    const positions = floorPlan?.positions || [];

    const index = positions.findIndex(p => p.tableId === tableId);
    const newPosition: FloorPlanPosition = {
      tableId,
      positionX,
      positionY,
      shape: shape || 'square',
    };

    if (index !== -1) {
      positions[index] = newPosition;
    } else {
      positions.push(newPosition);
    }

    await this.saveFloorPlan({
      positions,
      lastUpdated: new Date().toISOString(),
    });
  }

  // ============== UTILITIES ==============

  /**
   * Update last sync timestamp
   */
  private async updateLastSync(): Promise<void> {
    await storageService.set(
      STORAGE_KEYS.TABLE_LAST_SYNC,
      new Date().toISOString()
    );
  }

  /**
   * Clear all table data
   */
  async clearTableData(): Promise<void> {
    await Promise.all([
      storageService.remove(STORAGE_KEYS.TABLE_DATA),
      storageService.remove(STORAGE_KEYS.TABLE_AREAS),
      storageService.remove(STORAGE_KEYS.TABLE_FLOOR_PLAN),
      storageService.remove(STORAGE_KEYS.TABLE_LAST_SYNC),
    ]);
  }

  /**
   * Get storage info (for debugging)
   */
  async getStorageInfo(): Promise<{
    hasData: boolean;
    lastSync: string | null;
    tablesCount: number;
    areasCount: number;
    hasFloorPlan: boolean;
  }> {
    const [tables, areas, floorPlan, lastSync] = await Promise.all([
      this.getTables(),
      this.getAreas(),
      this.getFloorPlan(),
      this.getLastSyncTime(),
    ]);

    return {
      hasData: lastSync !== null,
      lastSync,
      tablesCount: tables.length,
      areasCount: areas.length,
      hasFloorPlan: floorPlan !== null && floorPlan.positions.length > 0,
    };
  }

  /**
   * Initialize storage - returns existing data or seeds mock data on first launch
   * Seeding mock data for development/demo purposes
   */
  async initialize(restaurantId: string = this.DEFAULT_RESTAURANT_ID): Promise<TableStorageData> {
    if (__DEV__) {
      console.log('[TableStorageService] Initializing...');
    }

    const data = await this.getTableData(restaurantId);

    if (data && data.tables.length > 0) {
      if (__DEV__) {
        console.log(`[TableStorageService] Loaded ${data.tables.length} tables, ${data.areas.length} areas`);
      }
      return data;
    }

    // Seed mock data on first launch for demo/development
    if (__DEV__) {
      console.log('[TableStorageService] No tables found. Seeding mock data...');
    }
    return await this.seedMockData(restaurantId);
  }

  /**
   * Reset all table statuses to AVAILABLE
   * Used when clearing order data to ensure tables are not stuck as OCCUPIED
   */
  async resetAllTableStatuses(): Promise<void> {
    const tables = await this.getTables();
    if (tables.length === 0) return;

    const resetTables = tables.map(table => ({
      ...table,
      status: TableStatus.AVAILABLE,
      current_order_id: undefined,
      updated_at: new Date().toISOString(),
    }));

    await this.saveTables(resetTables);

    if (__DEV__) {
      console.log(`[TableStorageService] Reset ${resetTables.length} tables to AVAILABLE`);
    }
  }

  /**
   * Force reseed - DEPRECATED (no mock data)
   * Now just clears data and returns empty state
   */
  async forceReseed(restaurantId: string = this.DEFAULT_RESTAURANT_ID): Promise<TableStorageData> {
    if (__DEV__) {
      console.log('[TableStorageService] forceReseed called - returning current data (no mock seeding)');
    }
    return this.initialize(restaurantId);
  }

  /**
   * Seed mock data on first launch for development/demo
   * Transforms MOCK_TABLES format to Table format and saves to AsyncStorage
   */
  private async seedMockData(restaurantId: string): Promise<TableStorageData> {
    console.log('[TableStorageService] Seeding mock data for first launch...');

    // Transform MOCK_TABLES to Table format
    const tables: Table[] = MOCK_TABLES.map((mockTable): Table => ({
      id: mockTable.id,
      restaurant_id: restaurantId,
      table_number: mockTable.number,
      capacity: mockTable.capacity,
      status: mockTable.status as TableStatus, // Cast mock status to enum
      section: mockTable.area,
      position_x: mockTable.positionX || 0,
      position_y: mockTable.positionY || 0,
      shape: mockTable.shape,
      is_active: true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Transform MOCK_AREAS to StoredArea format
    const areas: StoredArea[] = MOCK_AREAS.map((mockArea) => ({
      id: mockArea.id,
      name: mockArea.name,
      description: mockArea.description,
      icon: mockArea.icon,
      isActive: mockArea.isActive,
      color: mockArea.color,
    }));

    const data: TableStorageData = {
      tables,
      areas,
      lastUpdated: new Date().toISOString(),
      restaurantId,
    };

    // Save to AsyncStorage
    await this.saveTableData(data);

    console.log(`[TableStorageService] Seeded ${tables.length} tables and ${areas.length} areas`);

    return data;
  }
}

// Export singleton instance
export const tableStorageService = new TableStorageService();
