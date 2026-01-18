/**
 * Fixed Mock Table API Client - For UI-only development
 * Now uses TableStorageService for persistence
 * Data synced with Settings > Table Management
 * Table status is synced with active orders - tables with unpaid orders are marked OCCUPIED
 */

import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '@/types/table.types';
import { TableStatus, PaymentStatus, OrderStatus } from '@/types/common.types';
import { tableStorageService } from '@/services/storage';
import { orderService } from '@/services/orders/orderService';

export class FixedMockTableApiClient {
  private initialized = false;
  private cachedTables: Table[] = [];

  private delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Initialize storage and load tables
   * Seeds from MOCK_TABLES if storage is empty
   */
  private async ensureInitialized(restaurantId: string): Promise<void> {
    // Only skip if we truly have data
    if (this.initialized && this.cachedTables.length > 0) {
      if (__DEV__) {
        console.log(`[FixedMockTableApi] Already initialized with ${this.cachedTables.length} tables`);
      }
      return;
    }

    try {
      if (__DEV__) {
        console.log('[FixedMockTableApi] Initializing storage...');
      }

      // Initialize storage (seeds from mock data if empty)
      const data = await tableStorageService.initialize(restaurantId);
      this.cachedTables = data.tables;
      this.initialized = true;

      if (__DEV__) {
        console.log(`[FixedMockTableApi] Initialized with ${this.cachedTables.length} tables from storage`);
      }
    } catch (error) {
      console.error('[FixedMockTableApi] Failed to initialize:', error);

      // Try force reseed as last resort
      try {
        if (__DEV__) {
          console.log('[FixedMockTableApi] Attempting force reseed...');
        }
        const data = await tableStorageService.forceReseed(restaurantId);
        this.cachedTables = data.tables;
        this.initialized = true;
        if (__DEV__) {
          console.log(`[FixedMockTableApi] Force reseeded with ${this.cachedTables.length} tables`);
        }
      } catch (reseedError) {
        console.error('[FixedMockTableApi] Force reseed also failed:', reseedError);
        this.cachedTables = [];
        this.initialized = true;
      }
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
      console.log(`[FixedMockTableApi] getTables: ${tables.length} tables (${available} available, ${occupied} occupied)`);
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
   * Sync table status with active orders
   * Tables with active (unpaid) orders are marked as OCCUPIED
   * Tables without active orders are set to AVAILABLE (unless reserved/cleaning)
   */
  private async syncTableStatusWithOrders(tables: Table[]): Promise<Table[]> {
    try {
      // Get all orders from the order service
      const ordersResponse = await orderService.getOrders();
      const orders = ordersResponse.data || [];

      // Find tables with active (unpaid) orders
      // An order is "active" if it's not CANCELLED and payment is not COMPLETED
      const tablesWithActiveOrders = new Set<string>();
      const tableOrderMap = new Map<string, string>(); // tableId -> orderId

      for (const order of orders) {
        // Check BOTH property names (snake_case and camelCase) for compatibility
        const tableId = order.table_id || (order as any).tableId;
        if (!tableId) continue;

        // Skip cancelled orders (case-insensitive)
        const orderStatus = String(order.status).toLowerCase();
        if (orderStatus === 'cancelled') continue;

        // Skip orders that are paid (case-insensitive)
        const paymentStatus = String(order.payment_status || (order as any).paymentStatus || '').toLowerCase();
        if (paymentStatus === 'completed' || paymentStatus === 'paid') continue;

        // This table has an active unpaid order
        tablesWithActiveOrders.add(tableId);
        tableOrderMap.set(tableId, order.id);
      }

      if (__DEV__) {
        console.log('[FixedMockTableApi] ========== SYNC TABLE STATUS DEBUG ==========');
        console.log(`[FixedMockTableApi] Total orders from storage: ${orders.length}`);
        // Log sample orders for debugging
        orders.slice(0, 3).forEach((order, index) => {
          console.log(`[FixedMockTableApi] Order sample ${index + 1}:`, {
            id: order.id,
            table_id: order.table_id,
            tableId: (order as any).tableId,
            status: order.status,
            payment_status: order.payment_status,
            paymentStatus: (order as any).paymentStatus,
          });
        });
        console.log(`[FixedMockTableApi] Tables with active orders: [${Array.from(tablesWithActiveOrders).join(', ')}]`);
        console.log('[FixedMockTableApi] =============================================');
      }

      // Update table statuses based on active orders
      return tables.map(table => {
        const hasActiveOrder = tablesWithActiveOrders.has(table.id) ||
                               tablesWithActiveOrders.has(table.table_number);

        if (hasActiveOrder) {
          // Table has an active order - mark as occupied
          return {
            ...table,
            status: TableStatus.OCCUPIED,
            current_order_id: tableOrderMap.get(table.id) || tableOrderMap.get(table.table_number),
          };
        } else if (this.isStatusOccupied(table.status)) {
          // Table was marked occupied but has no active orders - mark as available
          if (__DEV__) {
            console.log(`[FixedMockTableApi] Resetting ${table.table_number} from occupied to available`);
          }
          return {
            ...table,
            status: TableStatus.AVAILABLE,
            current_order_id: undefined,
          };
        }

        // Keep other statuses (reserved, cleaning) unchanged
        return table;
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('[FixedMockTableApi] Failed to sync table status with orders:', error);
      }
      // Return tables unchanged if order sync fails
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
      console.log('[FixedMockTableApi] Created table:', newTable.table_number);
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
      console.log('[FixedMockTableApi] Updated table status:', tableId, updateData.status);
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
      console.log('[FixedMockTableApi] Deleted table:', tableId);
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
      console.log('[FixedMockTableApi] Cancelled reservation:', reservationId);
    }
  }

  // ============== UTILITY METHODS ==============

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
