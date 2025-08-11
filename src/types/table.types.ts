import { BaseEntity, TableStatus } from './common.types';

export interface Table extends BaseEntity {
  restaurant_id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  location?: string;
  section?: string;
  current_order_id?: string;
  reserved_until?: string;
  last_cleaned?: string;
  notes?: string;
}

export interface TableReservation extends BaseEntity {
  table_id: string;
  customer_name: string;
  customer_phone?: string;
  party_size: number;
  reservation_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  special_requests?: string;
}

export interface UpdateTableStatusRequest {
  status: TableStatus;
  notes?: string;
}

// Table management UI specific types
export interface TableGridConfig {
  rows: number;
  cols: number;
  total: number;
}

export interface TablePosition {
  row: number;
  col: number;
}

export interface CreateTableRequest {
  restaurant_id: string;
  table_number: string;
  capacity: number;
  location?: string;
  section?: string;
  position?: TablePosition;
}

export interface TableStatusUpdate {
  table_id: string;
  status: TableStatus;
  timestamp: string;
  user_id?: string;
}