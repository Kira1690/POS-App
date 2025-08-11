/**
 * Table Service - Simple, focused table management
 * Under 200 lines, single responsibility for table operations
 */

import { ITableService, ITableWebSocketService } from '@/interfaces';
import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '@/types/table.types';
import { tableApiClient, tableWebSocketService } from '../api/table';

export class TableService implements ITableService {
  private wsService: ITableWebSocketService;

  constructor() {
    this.wsService = tableWebSocketService;
  }

  // Core Table Operations
  async getTables(restaurantId: string): Promise<Table[]> {
    try {
      const tables = await tableApiClient.getTables(restaurantId);
      
      if (__DEV__) {
        console.log(`[TableService] Retrieved ${tables.length} tables for restaurant ${restaurantId}`);
      }
      
      return tables;
    } catch (error: any) {
      console.error('[TableService] Failed to get tables:', error.message);
      throw new Error(error.message || 'Failed to get tables');
    }
  }

  async getTable(tableId: string): Promise<Table> {
    try {
      return await tableApiClient.getTable(tableId);
    } catch (error: any) {
      console.error('[TableService] Failed to get table:', error.message);
      throw new Error(error.message || 'Failed to get table');
    }
  }

  async createTable(tableData: CreateTableRequest): Promise<Table> {
    try {
      const table = await tableApiClient.createTable(tableData);
      
      if (__DEV__) {
        console.log(`[TableService] Created table ${table.table_number}`);
      }
      
      return table;
    } catch (error: any) {
      console.error('[TableService] Failed to create table:', error.message);
      throw new Error(error.message || 'Failed to create table');
    }
  }

  async updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table> {
    try {
      const table = await tableApiClient.updateTableStatus(tableId, updateData);
      
      if (__DEV__) {
        console.log(`[TableService] Updated table ${tableId} status to ${updateData.status}`);
      }
      
      return table;
    } catch (error: any) {
      console.error('[TableService] Failed to update table status:', error.message);
      throw new Error(error.message || 'Failed to update table status');
    }
  }

  async deleteTable(tableId: string): Promise<void> {
    try {
      await tableApiClient.deleteTable(tableId);
      
      if (__DEV__) {
        console.log(`[TableService] Deleted table ${tableId}`);
      }
    } catch (error: any) {
      console.error('[TableService] Failed to delete table:', error.message);
      throw new Error(error.message || 'Failed to delete table');
    }
  }

  // Reservation Management
  async createReservation(reservation: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>): Promise<TableReservation> {
    try {
      const newReservation = await tableApiClient.createReservation(reservation);
      
      if (__DEV__) {
        console.log(`[TableService] Created reservation for ${newReservation.customer_name}`);
      }
      
      return newReservation;
    } catch (error: any) {
      console.error('[TableService] Failed to create reservation:', error.message);
      throw new Error(error.message || 'Failed to create reservation');
    }
  }

  async getReservations(tableId: string, date?: string): Promise<TableReservation[]> {
    try {
      return await tableApiClient.getReservations(tableId, date);
    } catch (error: any) {
      console.error('[TableService] Failed to get reservations:', error.message);
      throw new Error(error.message || 'Failed to get reservations');
    }
  }

  async updateReservation(reservationId: string, updates: Partial<TableReservation>): Promise<TableReservation> {
    try {
      return await tableApiClient.updateReservation(reservationId, updates);
    } catch (error: any) {
      console.error('[TableService] Failed to update reservation:', error.message);
      throw new Error(error.message || 'Failed to update reservation');
    }
  }

  async cancelReservation(reservationId: string): Promise<void> {
    try {
      await tableApiClient.cancelReservation(reservationId);
      
      if (__DEV__) {
        console.log(`[TableService] Cancelled reservation ${reservationId}`);
      }
    } catch (error: any) {
      console.error('[TableService] Failed to cancel reservation:', error.message);
      throw new Error(error.message || 'Failed to cancel reservation');
    }
  }

  // Real-time Updates
  connectToUpdates(restaurantId: string): void {
    try {
      this.wsService.connect(restaurantId);
      
      if (__DEV__) {
        console.log(`[TableService] Connected to real-time updates for restaurant ${restaurantId}`);
      }
    } catch (error: any) {
      console.error('[TableService] Failed to connect to updates:', error.message);
    }
  }

  subscribeToUpdates(callback: (update: any) => void): () => void {
    return this.wsService.subscribe(callback);
  }

  disconnectFromUpdates(): void {
    this.wsService.disconnect();
    
    if (__DEV__) {
      console.log('[TableService] Disconnected from real-time updates');
    }
  }

  isConnectedToUpdates(): boolean {
    return this.wsService.isConnected();
  }
}

// Create and export singleton instance
export const tableService = new TableService();

// Export the class for testing and custom instances
export { TableService as TableServiceClass };