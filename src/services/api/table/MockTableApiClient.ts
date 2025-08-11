/**
 * Mock Table API Client - For UI-only development
 * Returns dummy data without backend calls
 */

import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';

export class MockTableApiClient {
  
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
  ];

  // Generate additional tables to fill 25 table grid
  constructor() {
    // Add more tables to make 25 total
    for (let i = 6; i <= 25; i++) {
      this.mockTables.push({
        id: `table_${i}`,
        restaurant_id: 'rest_001',
        table_number: `Table${i}`,
        capacity: Math.floor(Math.random() * 6) + 2, // 2-8 capacity
        status: this.getRandomStatus(),
        location: 'Main Floor',
        section: i <= 12 ? 'A' : i <= 20 ? 'B' : 'C',
        created_at: '2025-07-20T00:00:00Z',
        updated_at: '2025-07-20T00:00:00Z',
        is_active: true,
        is_deleted: false,
      });
    }
  }

  private getRandomStatus(): TableStatus {
    const statuses = [
      TableStatus.AVAILABLE,
      TableStatus.AVAILABLE, // More available tables
      TableStatus.AVAILABLE,
      TableStatus.OCCUPIED,
      TableStatus.RESERVED,
      TableStatus.CLEANING,
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTables(restaurantId: string): Promise<Table[]> {
    await this.delay();
    
    if (__DEV__) {
      console.log('[MockTableApi] getTables called for restaurant:', restaurantId);
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
      console.log('[MockTableApi] Created table:', newTable.table_number);
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
      console.log('[MockTableApi] Updated table status:', tableId, updateData.status);
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
      console.log('[MockTableApi] Deleted table:', tableId);
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
      console.log('[MockTableApi] Cancelled reservation:', reservationId);
    }
  }
}