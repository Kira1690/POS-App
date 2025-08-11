/**
 * Table API Client - Clean, focused table operations
 * Under 200 lines, single responsibility for table API calls
 */

import { SimpleApiClient } from '../base/SimpleApiClient';
import { authApiClient } from '../auth';
import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '@/types/table.types';
import { ApiResponse } from '@/types/api.types';

export class TableApiClient extends SimpleApiClient {
  
  constructor() {
    super({}, authApiClient);
  }

  // Table Management
  async getTables(restaurantId: string): Promise<Table[]> {
    const response = await this.get<Table[]>('/api/tables', {
      params: { restaurant_id: restaurantId }
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get tables');
    }
    
    return response.data.data;
  }

  async getTable(tableId: string): Promise<Table> {
    const response = await this.get<Table>(`/api/tables/${tableId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get table');
    }
    
    return response.data.data;
  }

  async createTable(tableData: CreateTableRequest): Promise<Table> {
    const response = await this.post<Table>('/api/tables', tableData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create table');
    }
    
    return response.data.data;
  }

  async updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table> {
    const response = await this.patch<Table>(`/api/tables/${tableId}/status`, updateData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update table status');
    }
    
    return response.data.data;
  }

  async deleteTable(tableId: string): Promise<void> {
    const response = await this.delete(`/api/tables/${tableId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete table');
    }
  }

  // Reservation Management
  async createReservation(reservation: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>): Promise<TableReservation> {
    const response = await this.post<TableReservation>('/api/tables/reservations', reservation);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create reservation');
    }
    
    return response.data.data;
  }

  async getReservations(tableId: string, date?: string): Promise<TableReservation[]> {
    const params: any = { table_id: tableId };
    if (date) params.date = date;
    
    const response = await this.get<TableReservation[]>('/api/tables/reservations', { params });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get reservations');
    }
    
    return response.data.data;
  }

  async updateReservation(reservationId: string, updates: Partial<TableReservation>): Promise<TableReservation> {
    const response = await this.patch<TableReservation>(`/api/tables/reservations/${reservationId}`, updates);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update reservation');
    }
    
    return response.data.data;
  }

  async cancelReservation(reservationId: string): Promise<void> {
    const response = await this.delete(`/api/tables/reservations/${reservationId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel reservation');
    }
  }
}