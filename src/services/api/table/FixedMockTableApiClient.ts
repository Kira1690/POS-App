/**
 * Table API Client
 *
 * SINGLE SOURCE OF TRUTH: AsyncStorage via TableStorageService
 * - Tables created via Settings > Table Management
 * - Table STATUS is COMPUTED at runtime from orders (not stored)
 * - NO mock data dependency
 *
 * Production Ready
 */

import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { tableStorageService, unifiedOrderStorageService } from '@/services/storage';
import { isActiveOrder } from '@/types/unified-order.types';

export class FixedMockTableApiClient {
  private initialized = false;
  private cachedTables: Table[] = [];

  private delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Initialize storage and load tables from AsyncStorage
   * NO mock data - tables come from Settings > Table Management
   */
  private async ensureInitialized(restaurantId: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      if (__DEV__) {
        console.log('[TableApiClient] Initializing from AsyncStorage...');
      }

      const data = await tableStorageService.initialize(restaurantId);
      this.cachedTables = data.tables;
      this.initialized = true;

      if (__DEV__) {
        if (this.cachedTables.length === 0) {
          console.log('[TableApiClient] No tables found. Create tables in Settings > Table Management');
        } else {
          console.log(`[TableApiClient] Loaded ${this.cachedTables.length} tables from storage`);
        }
      }
    } catch {
      this.cachedTables = [];
      this.initialized = true;
    }
  }

  /**
   * Refresh cache from storage
   */
  private async refreshCache(): Promise<void> {
    const tables = await tableStorageService.getTables();
    this.cachedTables = tables;
  }

  async getTables(restaurantId: string): Promise<Table[]> {
    await this.ensureInitialized(restaurantId);
    await this.delay();

    // CRITICAL: Always refresh from storage to get fresh data
    // This ensures table statuses are accurate after clearing order data
    await this.refreshCache();

    // Filter by restaurant_id and return active tables only
    let tables = this.cachedTables.filter(
      table => table.restaurant_id === restaurantId && !table.is_deleted
    );

    // Sync table status with active orders
    tables = await this.syncTableStatusWithOrders(tables);

    if (__DEV__) {
      const occupied = tables.filter(t => t.status === TableStatus.OCCUPIED).length;
      const available = tables.filter(t => t.status === TableStatus.AVAILABLE).length;
      console.log(`[TableApiClient] getTables: ${tables.length} tables (${available} available, ${occupied} occupied)`);
    }

    return tables;
  }

  /**
   * Helper: Case-insensitive status check
   */
  private isStatusOccupied(status: TableStatus | string): boolean {
    return String(status).toLowerCase() === 'occupied';
  }

  /**
   * Sync table status with active orders from UnifiedOrderStorageService
   * SINGLE SOURCE OF TRUTH: Orders in AsyncStorage determine table status
   *
   * CRITICAL: Status is COMPUTED at runtime, not stored
   * - Default: AVAILABLE
   * - Has active order: OCCUPIED
   * - Reserved/Cleaning: Keep as-is (manual status)
   */
  private async syncTableStatusWithOrders(tables: Table[]): Promise<Table[]> {
    try {
      // CRITICAL: Use UnifiedOrderStorageService as SINGLE SOURCE OF TRUTH
      await unifiedOrderStorageService.initialize();
      const allOrders = await unifiedOrderStorageService.getAllOrders();

      // Find tables with active orders
      const tablesWithActiveOrders = new Set<string>();
      const tableOrderMap = new Map<string, string>(); // tableId -> orderId

      for (const order of allOrders) {
        if (!isActiveOrder(order)) continue;
        const tableId = order.tableId;
        if (!tableId) continue;
        tablesWithActiveOrders.add(tableId);
        tableOrderMap.set(tableId, order.id);
      }

      if (__DEV__) {
        console.log('[TableApiClient] ========== SYNC TABLE STATUS ==========');
        console.log(`[TableApiClient] Total orders: ${allOrders.length}`);
        console.log(`[TableApiClient] Active orders: ${tablesWithActiveOrders.size}`);
        if (tablesWithActiveOrders.size > 0) {
          console.log(`[TableApiClient] Tables with active orders: [${Array.from(tablesWithActiveOrders).join(', ')}]`);
        }
        console.log('[TableApiClient] ==========================================');
      }

      // COMPUTE status for each table based on orders
      return tables.map(table => {
        const hasActiveOrder = tablesWithActiveOrders.has(table.id);

        // If table has an active order -> OCCUPIED
        if (hasActiveOrder) {
          return {
            ...table,
            status: TableStatus.OCCUPIED,
            current_order_id: tableOrderMap.get(table.id),
          };
        }

        // If table is reserved or cleaning -> keep manual status
        const manualStatuses = [TableStatus.RESERVED, TableStatus.CLEANING];
        if (manualStatuses.includes(table.status as TableStatus)) {
          return table;
        }

        // Default: AVAILABLE (reset any stale OCCUPIED status)
        return {
          ...table,
          status: TableStatus.AVAILABLE,
          current_order_id: undefined,
        };
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('[TableApiClient] Failed to sync table status with orders — keeping existing statuses:', error);
      }
      // On error, return tables with their existing stored status (do NOT wipe to AVAILABLE)
      return tables;
    }
  }

  async getTable(tableId: string): Promise<Table> {
    await this.delay();

    // Refresh from storage to get latest
    await this.refreshCache();

    const table = this.cachedTables.find(t => t.id === tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    return table;
  }

  async createTable(tableData: CreateTableRequest): Promise<Table> {
    await this.delay();

    const newTable: Table = {
      id: `table_${Date.now()}`,
      ...tableData,
      status: TableStatus.AVAILABLE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      is_deleted: false,
    };

    // Add to storage
    await tableStorageService.addTable(newTable);

    // Refresh cache
    await this.refreshCache();

    if (__DEV__) {
      console.log('[TableApiClient] Created table:', newTable.table_number);
    }

    return newTable;
  }

  async updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table> {
    await this.delay();

    // Update in storage
    await tableStorageService.updateTable(tableId, {
      status: updateData.status,
      notes: updateData.notes,
    });

    // Refresh cache
    await this.refreshCache();

    const updatedTable = this.cachedTables.find(t => t.id === tableId);
    if (!updatedTable) {
      throw new Error('Table not found after update');
    }

    if (__DEV__) {
      console.log('[TableApiClient] Updated table status:', tableId, updateData.status);
    }

    return updatedTable;
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.delay();

    // Delete from storage
    await tableStorageService.deleteTable(tableId);

    // Refresh cache
    await this.refreshCache();

    if (__DEV__) {
      console.log('[TableApiClient] Deleted table:', tableId);
    }
  }

  // ============== RESERVATION METHODS ==============

  async createReservation(reservation: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>): Promise<TableReservation> {
    await this.delay();

    const newReservation: TableReservation = {
      id: `reservation_${Date.now()}`,
      ...reservation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newReservation;
  }

  async getReservations(tableId: string, date?: string): Promise<TableReservation[]> {
    await this.delay();
    return []; // Reservations not stored yet
  }

  async updateReservation(reservationId: string, updates: Partial<TableReservation>): Promise<TableReservation> {
    await this.delay();
    throw new Error('Reservation update not implemented');
  }

  async cancelReservation(reservationId: string): Promise<void> {
    await this.delay();
    if (__DEV__) {
      console.log('[TableApiClient] Cancelled reservation:', reservationId);
    }
  }

  // ============== UTILITY METHODS ==============

  /**
   * Reset cache - forces reload from storage on next access
   * Call this after clearing order data to ensure fresh table status
   */
  resetCache(): void {
    this.initialized = false;
    this.cachedTables = [];
    if (__DEV__) {
      console.log('[TableApiClient] Cache reset - will reload from storage on next access');
    }
  }

  /**
   * Force refresh from storage (useful after Settings changes)
   */
  async forceRefresh(): Promise<void> {
    this.initialized = false;
    await this.refreshCache();
    this.initialized = true;
  }

  /**
   * Get areas from storage
   */
  async getAreas(): Promise<{ id: string; name: string; icon: string }[]> {
    const areas = await tableStorageService.getAreas();
    return areas.map(a => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
    }));
  }

  /**
   * Get tables grouped by area
   */
  async getTablesByArea(restaurantId: string): Promise<Map<string, Table[]>> {
    await this.ensureInitialized(restaurantId);

    const tables = this.cachedTables.filter(
      t => t.restaurant_id === restaurantId && !t.is_deleted
    );

    const grouped = new Map<string, Table[]>();

    for (const table of tables) {
      const areaId = table.section || 'unknown';
      if (!grouped.has(areaId)) {
        grouped.set(areaId, []);
      }
      grouped.get(areaId)!.push(table);
    }

    return grouped;
  }
}
