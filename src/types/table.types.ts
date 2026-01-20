import { BaseEntity, TableStatus } from './common.types';

export interface Table extends BaseEntity {
  restaurant_id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  location?: string;
  section?: string;
  service_area?: string; // Alias for section - used in some selectors
  current_order_id?: string;
  reserved_until?: string;
  last_cleaned?: string;
  last_cleaned_at?: string; // Alias for last_cleaned (backward compatibility)
  last_occupied_at?: string; // Timestamp of last occupation
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
  service_area?: string; // Service area assignment
  area_id?: string; // Alternative area identifier
}

export interface TableStatusUpdate {
  table_id: string;
  status: TableStatus;
  timestamp: string;
  user_id?: string;
}