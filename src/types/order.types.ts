import { BaseEntity, OrderStatus, PaymentStatus, PaymentMethod } from './common.types';
import { MenuItem } from './menu.types'; // Import from menu types to avoid duplication

// Enhanced order item status for kitchen operations
export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

// Professional order item modifier interface
export interface OrderItemModifier {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item: MenuItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  customizations?: Record<string, any>;
  
  // Professional kitchen management
  status: OrderItemStatus;
  modifiers: OrderItemModifier[];
  kitchen_notes?: string;
  estimated_prep_time?: number; // Minutes
  actual_prep_time?: number;
  prepared_by?: string; // Kitchen staff ID
  prepared_at?: string;
}

// Professional restaurant order structure
export interface Order extends BaseEntity {
  restaurant_id: string;
  table_id?: string;
  table_number?: string; // Display name for the table
  customer_id?: string;
  staff_id: string;
  order_number: string; // Professional numbering (ORD-001234)
  status: OrderStatus;
  payment_status?: PaymentStatus; // Track payment state separately from order state
  items: OrderItem[];

  // Financial details
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  
  // Professional order lifecycle timestamps
  submitted_at?: string; // When sent to kitchen
  preparing_at?: string; // When kitchen started
  ready_at?: string; // When food ready
  served_at?: string; // When delivered to customer
  paid_at?: string; // When payment was completed
  payment_id?: string; // Reference to payment record
  
  // Restaurant operations
  special_instructions?: string;
  kitchen_notes?: string;
  estimated_prep_time?: number; // Total minutes
  actual_prep_time?: number;
  
  // Staff tracking
  created_by: string; // Staff member ID who created
  served_by?: string; // Server who delivered
  kitchen_staff_id?: string; // Kitchen staff assigned
  
  // Legacy support
  estimated_completion_time?: string;
  actual_completion_time?: string;
}

export interface Payment extends BaseEntity {
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  processed_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  gateway_response?: Record<string, any>;
  
  // Professional payment tracking
  processed_by?: string; // Staff member ID
  payment_reference?: string;
  receipt_printed?: boolean;
  receipt_printed_at?: string;
}

// Professional order creation request
export interface CreateOrderRequest {
  table_id?: string;
  customer_id?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
    customizations?: Record<string, any>;
    modifiers?: OrderItemModifier[];
  }[];
  special_instructions?: string;
  kitchen_notes?: string;
}

// Professional order status update request
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  estimated_completion_time?: string;
  actual_completion_time?: string;
  kitchen_notes?: string;
  staff_id?: string;
}

// Professional order item status update
export interface UpdateOrderItemStatusRequest {
  status: OrderItemStatus;
  kitchen_notes?: string;
  estimated_prep_time?: number;
  actual_prep_time?: number;
  prepared_by?: string;
}

// Professional order filter options
export interface OrderFilterOptions {
  status?: OrderStatus | 'ALL';
  table_id?: string;
  date_from?: string;
  date_to?: string;
  staff_id?: string;
  kitchen_staff_id?: string;
  search_query?: string;
}

// Professional order management interface
export interface OrderManagementState {
  orders: Order[];
  selectedOrder: Order | null;
  filteredOrders: Order[];
  searchQuery: string;
  statusFilter: OrderStatus | 'ALL';
  isLoading: boolean;
  error: string | null;
}

// Kitchen order display interface
export interface KitchenOrder {
  id: string;
  order_number: string;
  table_number: string;
  items: OrderItem[];
  created_at: string;
  estimated_prep_time: number;
  elapsed_time: number; // Minutes since order placed
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  special_instructions?: string;
  kitchen_notes?: string;
}

// Order cancellation request
export interface CancelOrderRequest {
  reason: string;
  cancelled_by: string;
  refund_amount?: number;
}