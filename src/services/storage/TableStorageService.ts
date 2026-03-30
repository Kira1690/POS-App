/**
 * Table Storage Service - SQLite Implementation
 * Handles persistence of table management data via expo-sqlite.
 *
 * SINGLE SOURCE OF TRUTH: SQLite ONLY
 * Tables are created via Settings > Table Management
 * Table STATUS is computed at runtime from orders (not stored here)
 */

import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { databaseService } from '@/services/database/DatabaseService';
import { fromSqlBool, toSqlBool, now } from '@/services/database/helpers';
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
  displayOrder?: number;
  isDeleted?: boolean;
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

// SQLite row types
interface TableRow {
  id: string;
  restaurant_id: string;
  table_number: string;
  capacity: number;
  status: string;
  section: string | null;
  current_order_id: string | null;
  notes: string | null;
  position_x: number;
  position_y: number;
  width: number | null;
  height: number | null;
  shape: string;
  is_active: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

interface AreaRow {
  id: string;
  restaurant_id: string;
  name: string;
  icon: string | null;
  description: string | null;
  is_active: number;
  is_deleted: number;
  color: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * TableStorageService - Manages table data persistence via SQLite
 */
class TableStorageService {
  private readonly DEFAULT_RESTAURANT_ID = 'rest_001';

  private get db() {
    return databaseService.getDatabase();
  }

  // ============== HELPERS ==============

  private tableFromRow(row: TableRow): Table {
    return {
      id: row.id,
      restaurant_id: row.restaurant_id,
      table_number: row.table_number,
      capacity: row.capacity,
      status: row.status as TableStatus,
      section: row.section || undefined,
      current_order_id: row.current_order_id || undefined,
      notes: row.notes || undefined,
      position_x: row.position_x,
      position_y: row.position_y,
      width: row.width ?? undefined,
      height: row.height ?? undefined,
      shape: row.shape as Table['shape'],
      is_active: fromSqlBool(row.is_active),
      is_deleted: fromSqlBool(row.is_deleted ?? 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private areaFromRow(row: AreaRow): StoredArea {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon || '',
      description: row.description || '',
      isActive: fromSqlBool(row.is_active),
      isDeleted: fromSqlBool(row.is_deleted ?? 0),
      color: row.color || undefined,
      displayOrder: row.display_order ?? 0,
    };
  }

  // ============== BULK SAVE ==============

  async saveTableData(data: TableStorageData): Promise<void> {
    await this.saveTables(data.tables);
    await this.saveAreas(data.areas);
  }

  async getTableData(restaurantId: string = this.DEFAULT_RESTAURANT_ID): Promise<TableStorageData | null> {
    const tables = await this.getTables();
    const areas = await this.getAreas();

    if (tables.length === 0) return null;

    return {
      tables,
      areas,
      lastUpdated: now(),
      restaurantId,
    };
  }

  async hasTableData(): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM tables'
    );
    return (row?.cnt || 0) > 0;
  }

  async getLastSyncTime(): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'table_last_sync'`
    );
    return row?.value || null;
  }

  // ============== TABLES ==============

  async saveTables(tables: Table[]): Promise<void> {
    for (const t of tables) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO tables (id, restaurant_id, table_number, capacity, status, section,
          current_order_id, notes, position_x, position_y, width, height, shape, is_active, is_deleted, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        t.id, t.restaurant_id, t.table_number, t.capacity,
        t.status, t.section || null,
        t.current_order_id || null, t.notes || null,
        t.position_x || 0, t.position_y || 0, t.width ?? null, t.height ?? null,
        t.shape || 'square', toSqlBool(t.is_active), toSqlBool(t.is_deleted),
        t.created_at || now(), t.updated_at || now()
      );
    }
    await this.updateLastSync();
  }

  async getTables(): Promise<Table[]> {
    const rows = await this.db.getAllAsync<TableRow>(
      'SELECT * FROM tables WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY table_number'
    );
    return rows.map((r) => this.tableFromRow(r));
  }

  async getTablesByArea(areaId: string): Promise<Table[]> {
    const rows = await this.db.getAllAsync<TableRow>(
      'SELECT * FROM tables WHERE section = ? ORDER BY table_number',
      areaId
    );
    return rows.map((r) => this.tableFromRow(r));
  }

  async getTablesByStatus(status: TableStatus): Promise<Table[]> {
    const rows = await this.db.getAllAsync<TableRow>(
      'SELECT * FROM tables WHERE status = ? ORDER BY table_number',
      status
    );
    return rows.map((r) => this.tableFromRow(r));
  }

  async addTable(table: Table): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO tables (id, restaurant_id, table_number, capacity, status, section,
        current_order_id, notes, position_x, position_y, width, height, shape, is_active, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      table.id, table.restaurant_id, table.table_number, table.capacity,
      table.status, table.section || null,
      table.current_order_id || null, table.notes || null,
      table.position_x || 0, table.position_y || 0, table.width ?? null, table.height ?? null,
      table.shape || 'square', toSqlBool(table.is_active), toSqlBool(table.is_deleted),
      table.created_at || now(), table.updated_at || now()
    );
    await this.updateLastSync();
  }

  async updateTable(id: string, data: Partial<Table>): Promise<void> {
    const existing = await this.db.getFirstAsync<TableRow>(
      'SELECT * FROM tables WHERE id = ?', id
    );
    if (!existing) return;

    const updated = { ...this.tableFromRow(existing), ...data, updated_at: now() };
    await this.db.runAsync(
      `INSERT OR REPLACE INTO tables (id, restaurant_id, table_number, capacity, status, section,
        current_order_id, notes, position_x, position_y, width, height, shape, is_active, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      updated.id, updated.restaurant_id, updated.table_number, updated.capacity,
      updated.status, updated.section || null,
      updated.current_order_id || null, updated.notes || null,
      updated.position_x || 0, updated.position_y || 0, updated.width ?? null, updated.height ?? null,
      updated.shape || 'square', toSqlBool(updated.is_active), toSqlBool(updated.is_deleted),
      updated.created_at, updated.updated_at
    );
    await this.updateLastSync();
  }

  async deleteTable(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM tables WHERE id = ?', id);
    await this.updateLastSync();
  }

  async updateTableStatus(id: string, status: TableStatus): Promise<void> {
    await this.db.runAsync(
      'UPDATE tables SET status = ?, updated_at = ? WHERE id = ?',
      status, now(), id
    );
  }

  // ============== AREAS ==============

  async saveAreas(areas: StoredArea[]): Promise<void> {
    for (const a of areas) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO table_areas (id, restaurant_id, name, icon, description, is_active, is_deleted, color, display_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        a.id, this.DEFAULT_RESTAURANT_ID, a.name, a.icon || null, a.description || null,
        toSqlBool(a.isActive), toSqlBool(a.isDeleted), a.color || null, a.displayOrder ?? 0,
        now(), now()
      );
    }
    await this.updateLastSync();
  }

  async getAreas(): Promise<StoredArea[]> {
    const rows = await this.db.getAllAsync<AreaRow>(
      'SELECT * FROM table_areas WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY display_order, name'
    );
    return rows.map((r) => this.areaFromRow(r));
  }

  async getActiveAreas(): Promise<StoredArea[]> {
    const rows = await this.db.getAllAsync<AreaRow>(
      'SELECT * FROM table_areas WHERE is_active = 1 AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY display_order, name'
    );
    return rows.map((r) => this.areaFromRow(r));
  }

  async addArea(area: StoredArea): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO table_areas (id, restaurant_id, name, icon, description, is_active, is_deleted, color, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      area.id, this.DEFAULT_RESTAURANT_ID, area.name, area.icon || null, area.description || null,
      toSqlBool(area.isActive), toSqlBool(area.isDeleted), area.color || null, area.displayOrder ?? 0,
      now(), now()
    );
    await this.updateLastSync();
  }

  async updateArea(id: string, data: Partial<StoredArea>): Promise<void> {
    const existing = await this.db.getFirstAsync<AreaRow>(
      'SELECT * FROM table_areas WHERE id = ?', id
    );
    if (!existing) return;

    const current = this.areaFromRow(existing);
    const updated = { ...current, ...data };

    await this.db.runAsync(
      `INSERT OR REPLACE INTO table_areas (id, restaurant_id, name, icon, description, is_active, is_deleted, color, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, existing.restaurant_id, updated.name, updated.icon || null, updated.description || null,
      toSqlBool(updated.isActive), toSqlBool(updated.isDeleted), updated.color || null,
      updated.displayOrder ?? 0, existing.created_at, now()
    );
    await this.updateLastSync();
  }

  async deleteArea(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM table_areas WHERE id = ?', id);
    await this.updateLastSync();
  }

  // ============== FLOOR PLAN ==============

  async saveFloorPlan(data: FloorPlanData): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('floor_plan', ?, ?)`,
      JSON.stringify(data), now()
    );
  }

  async getFloorPlan(): Promise<FloorPlanData | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'floor_plan'`
    );
    if (!row?.value) return null;
    try {
      return JSON.parse(row.value) as FloorPlanData;
    } catch {
      return null;
    }
  }

  async updateTablePosition(
    tableId: string,
    positionX: number,
    positionY: number,
    shape?: 'square' | 'round' | 'rectangle'
  ): Promise<void> {
    // Update table position directly in the tables table
    await this.db.runAsync(
      `UPDATE tables SET position_x = ?, position_y = ?, shape = COALESCE(?, shape), updated_at = ? WHERE id = ?`,
      positionX, positionY, shape || null, now(), tableId
    );

    // Also update floor plan metadata
    const floorPlan = await this.getFloorPlan();
    const positions = floorPlan?.positions || [];

    const index = positions.findIndex((p) => p.tableId === tableId);
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

    await this.saveFloorPlan({ positions, lastUpdated: now() });
  }

  // ============== UTILITIES ==============

  private async updateLastSync(): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('table_last_sync', ?, ?)`,
      now(), now()
    );
  }

  async clearTableData(): Promise<void> {
    await this.db.execAsync('DELETE FROM tables');
    await this.db.execAsync('DELETE FROM table_areas');
    await this.db.runAsync(`DELETE FROM sync_metadata WHERE key IN ('table_last_sync', 'floor_plan')`);
  }

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
      hasData: tables.length > 0,
      lastSync,
      tablesCount: tables.length,
      areasCount: areas.length,
      hasFloorPlan: floorPlan !== null && floorPlan.positions.length > 0,
    };
  }

  async initialize(restaurantId: string = this.DEFAULT_RESTAURANT_ID): Promise<TableStorageData> {
    if (__DEV__) {
      console.log('[TableStorageService] Initializing...');
    }

    const data = await this.getTableData(restaurantId);

    if (data && data.tables.length > 0) {
      // Tables exist but areas might be missing (backend sync doesn't always include areas)
      if (data.areas.length === 0) {
        const areas: StoredArea[] = MOCK_AREAS.map((mockArea) => ({
          id: mockArea.id,
          name: mockArea.name,
          description: mockArea.description,
          icon: mockArea.icon,
          isActive: mockArea.isActive,
          color: mockArea.color,
        }));
        await this.saveAreas(areas);
        data.areas = areas;
      }
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

  async resetAllTableStatuses(): Promise<void> {
    await this.db.runAsync(
      `UPDATE tables SET status = ?, current_order_id = NULL, updated_at = ?`,
      TableStatus.AVAILABLE, now()
    );

    if (__DEV__) {
      const row = await this.db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM tables');
      console.log(`[TableStorageService] Reset ${row?.cnt || 0} tables to AVAILABLE`);
    }
  }

  async forceReseed(restaurantId: string = this.DEFAULT_RESTAURANT_ID): Promise<TableStorageData> {
    if (__DEV__) {
      console.log('[TableStorageService] forceReseed called');
    }
    return this.initialize(restaurantId);
  }

  private async seedMockData(restaurantId: string): Promise<TableStorageData> {

    const tables: Table[] = MOCK_TABLES.map((mockTable): Table => ({
      id: mockTable.id,
      restaurant_id: restaurantId,
      table_number: mockTable.number,
      capacity: mockTable.capacity,
      status: mockTable.status as TableStatus,
      section: mockTable.areaId,
      position_x: mockTable.positionX || 0,
      position_y: mockTable.positionY || 0,
      shape: mockTable.shape,
      is_active: true,
      is_deleted: false,
      created_at: now(),
      updated_at: now(),
    }));

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
      lastUpdated: now(),
      restaurantId,
    };

    await this.saveTableData(data);

    return data;
  }
}

// Export singleton instance
export const tableStorageService = new TableStorageService();
