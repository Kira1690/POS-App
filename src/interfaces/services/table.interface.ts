import { Table, CreateTableRequest, UpdateTableStatusRequest, TableReservation } from '../../types/table.types';
import { ApiResponse } from '../../types/api.types';

export interface ITableService {
  getTables(restaurantId: string): Promise<Table[]>;
  getTable(tableId: string): Promise<Table>;
  createTable(tableData: CreateTableRequest): Promise<Table>;
  updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table>;
  deleteTable(tableId: string): Promise<void>;
  
  // Reservation management
  createReservation(reservation: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>): Promise<TableReservation>;
  getReservations(tableId: string, date?: string): Promise<TableReservation[]>;
  updateReservation(reservationId: string, updates: Partial<TableReservation>): Promise<TableReservation>;
  cancelReservation(reservationId: string): Promise<void>;
}

export interface ITableWebSocketService {
  connect(restaurantId: string): void;
  disconnect(): void;
  subscribe(callback: (update: any) => void): () => void;
  isConnected(): boolean;
}