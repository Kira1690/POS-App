/**
 * Fixed Mock Table API Client - For UI-only development
 * Returns dummy data without backend calls
 * Fixed: Removed method calls from constructor
 */

import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';

export class FixedMockTableApiClient {
  
  private mockTables: Table[] = [
    {
      id: 'table_1',
      restaurant_id: 'rest_001',
      table_number: 'Table1',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'A',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_2',
      restaurant_id: 'rest_001',
      table_number: 'Table2',
      capacity: 2,
      status: TableStatus.OCCUPIED,
      location: 'Main Floor',
      section: 'A',
      current_order_id: 'order_123',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_3',
      restaurant_id: 'rest_001',
      table_number: 'Table3',
      capacity: 6,
      status: TableStatus.RESERVED,
      location: 'Main Floor',
      section: 'A',
      reserved_until: '2025-07-20T14:00:00Z',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_4',
      restaurant_id: 'rest_001',
      table_number: 'Table4',
      capacity: 4,
      status: TableStatus.CLEANING,
      location: 'Main Floor',
      section: 'B',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_5',
      restaurant_id: 'rest_001',
      table_number: 'Table5',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'B',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    // Pre-generated tables (no dynamic generation in constructor)
    {
      id: 'table_6',
      restaurant_id: 'rest_001',
      table_number: 'Table6',
      capacity: 3,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'A',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_7',
      restaurant_id: 'rest_001',
      table_number: 'Table7',
      capacity: 4,
      status: TableStatus.OCCUPIED,
      location: 'Main Floor',
      section: 'A',
      current_order_id: 'order_124',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_8',
      restaurant_id: 'rest_001',
      table_number: 'Table8',
      capacity: 2,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'B',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_9',
      restaurant_id: 'rest_001',
      table_number: 'Table9',
      capacity: 6,
      status: TableStatus.RESERVED,
      location: 'Main Floor',
      section: 'B',
      reserved_until: '2025-07-20T15:00:00Z',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_10',
      restaurant_id: 'rest_001',
      table_number: 'Table10',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'B',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    // Additional tables up to 25
    {
      id: 'table_11',
      restaurant_id: 'rest_001',
      table_number: 'Table11',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_12',
      restaurant_id: 'rest_001',
      table_number: 'Table12',
      capacity: 2,
      status: TableStatus.OCCUPIED,
      location: 'Main Floor',
      section: 'C',
      current_order_id: 'order_125',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_13',
      restaurant_id: 'rest_001',
      table_number: 'Table13',
      capacity: 6,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_14',
      restaurant_id: 'rest_001',
      table_number: 'Table14',
      capacity: 4,
      status: TableStatus.CLEANING,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_15',
      restaurant_id: 'rest_001',
      table_number: 'Table15',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_16',
      restaurant_id: 'rest_001',
      table_number: 'Table16',
      capacity: 3,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_17',
      restaurant_id: 'rest_001',
      table_number: 'Table17',
      capacity: 2,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_18',
      restaurant_id: 'rest_001',
      table_number: 'Table18',
      capacity: 4,
      status: TableStatus.RESERVED,
      location: 'Main Floor',
      section: 'C',
      reserved_until: '2025-07-20T16:00:00Z',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_19',
      restaurant_id: 'rest_001',
      table_number: 'Table19',
      capacity: 6,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_20',
      restaurant_id: 'rest_001',
      table_number: 'Table20',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_21',
      restaurant_id: 'rest_001',
      table_number: 'Table21',
      capacity: 2,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_22',
      restaurant_id: 'rest_001',
      table_number: 'Table22',
      capacity: 4,
      status: TableStatus.OCCUPIED,
      location: 'Main Floor',
      section: 'C',
      current_order_id: 'order_126',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_23',
      restaurant_id: 'rest_001',
      table_number: 'Table23',
      capacity: 3,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_24',
      restaurant_id: 'rest_001',
      table_number: 'Table24',
      capacity: 6,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
    {
      id: 'table_25',
      restaurant_id: 'rest_001',
      table_number: 'Table25',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      location: 'Main Floor',
      section: 'C',
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    },
  ];

  // No constructor needed - all data is static

  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTables(restaurantId: string): Promise<Table[]> {
    await this.delay();
    
    if (__DEV__) {
      console.log('[FixedMockTableApi] getTables called for restaurant:', restaurantId);
    }
    
    return this.mockTables.filter(table => table.restaurant_id === restaurantId);
  }

  async getTable(tableId: string): Promise<Table> {
    await this.delay();
    
    const table = this.mockTables.find(t => t.id === tableId);
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
    
    this.mockTables.push(newTable);
    
    if (__DEV__) {
      console.log('[FixedMockTableApi] Created table:', newTable.table_number);
    }
    
    return newTable;
  }

  async updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table> {
    await this.delay();
    
    const tableIndex = this.mockTables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) {
      throw new Error('Table not found');
    }
    
    this.mockTables[tableIndex] = {
      ...this.mockTables[tableIndex],
      status: updateData.status,
      notes: updateData.notes,
      updated_at: new Date().toISOString(),
    };
    
    if (__DEV__) {
      console.log('[FixedMockTableApi] Updated table status:', tableId, updateData.status);
    }
    
    return this.mockTables[tableIndex];
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.delay();
    
    const tableIndex = this.mockTables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) {
      throw new Error('Table not found');
    }
    
    this.mockTables.splice(tableIndex, 1);
    
    if (__DEV__) {
      console.log('[FixedMockTableApi] Deleted table:', tableId);
    }
  }

  // Reservation methods (simplified for mock)
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
    return []; // No mock reservations for now
  }

  async updateReservation(reservationId: string, updates: Partial<TableReservation>): Promise<TableReservation> {
    await this.delay();
    throw new Error('Mock reservation update not implemented');
  }

  async cancelReservation(reservationId: string): Promise<void> {
    await this.delay();
    // Mock implementation - just log
    if (__DEV__) {
      console.log('[FixedMockTableApi] Cancelled reservation:', reservationId);
    }
  }
}