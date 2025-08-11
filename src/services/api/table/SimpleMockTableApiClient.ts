/**
 * Simple Mock Table API Client - For debugging
 */

import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';

export class SimpleMockTableApiClient {
  
  async getTables(restaurantId: string): Promise<Table[]> {
    // Return simple mock data
    return [
      {
        id: 'table_1',
        restaurant_id: restaurantId,
        table_number: 'Table1',
        capacity: 4,
        status: TableStatus.AVAILABLE,
        created_at: '2025-07-20T00:00:00Z',
        updated_at: '2025-07-20T00:00:00Z',
        is_active: true,
        is_deleted: false,
      }
    ];
  }

  async getTable(tableId: string): Promise<Table> {
    return {
      id: tableId,
      restaurant_id: 'rest_001',
      table_number: 'Table1',
      capacity: 4,
      status: TableStatus.AVAILABLE,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
      is_active: true,
      is_deleted: false,
    };
  }

  async createTable(tableData: CreateTableRequest): Promise<Table> {
    return {
      id: `table_${Date.now()}`,
      ...tableData,
      status: TableStatus.AVAILABLE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      is_deleted: false,
    };
  }

  async updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table> {
    return {
      id: tableId,
      restaurant_id: 'rest_001',
      table_number: 'Table1',
      capacity: 4,
      status: updateData.status,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: new Date().toISOString(),
      is_active: true,
      is_deleted: false,
    };
  }

  async deleteTable(tableId: string): Promise<void> {
    // Mock delete
  }

  async createReservation(reservation: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>): Promise<TableReservation> {
    return {
      id: `reservation_${Date.now()}`,
      ...reservation,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getReservations(tableId: string, date?: string): Promise<TableReservation[]> {
    return [];
  }

  async updateReservation(reservationId: string, updates: Partial<TableReservation>): Promise<TableReservation> {
    throw new Error('Mock reservation update not implemented');
  }

  async cancelReservation(reservationId: string): Promise<void> {
    // Mock implementation
  }
}