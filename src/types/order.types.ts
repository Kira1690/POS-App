import { BaseEntity, OrderStatus, PaymentStatus, PaymentMethod } from './common.types';

export interface MenuItem extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  restaurant_id: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  ingredients?: string[];
  allergens?: string[];
  dietary_info?: string[];
}

export interface MenuCategory extends BaseEntity {
  name: string;
  description?: string;
  restaurant_id: string;
  sort_order: number;
  is_available: boolean;
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
}

export interface Order extends BaseEntity {
  restaurant_id: string;
  table_id?: string;
  customer_id?: string;
  staff_id: string;
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  special_instructions?: string;
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
}

export interface CreateOrderRequest {
  table_id?: string;
  customer_id?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
    customizations?: Record<string, any>;
  }[];
  special_instructions?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  estimated_completion_time?: string;
  actual_completion_time?: string;
}