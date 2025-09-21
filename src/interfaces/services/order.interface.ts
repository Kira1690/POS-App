/**
 * Order Service Interface
 * Defines contract for order management operations
 */

import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderStatusRequest,
  UpdateOrderItemStatusRequest,
  OrderFilterOptions,
  CancelOrderRequest,
  OrderItemStatus,
  KitchenOrder,
  PaginatedResponse 
} from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';

export interface IOrderService {
  // Core order operations
  createOrder(orderData: CreateOrderRequest): Promise<Order>;
  getOrder(orderId: string): Promise<Order>;
  getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    tableId?: string;
    restaurantId?: string;
  }): Promise<PaginatedResponse<Order>>;
  updateOrder(orderId: string, updates: Partial<Order>): Promise<Order>;
  deleteOrder(orderId: string): Promise<void>;
  
  // Order status management
  updateOrderStatus(orderId: string, statusData: UpdateOrderStatusRequest): Promise<Order>;
  cancelOrder(orderId: string, reason: string): Promise<Order>;
  
  // Order item management
  updateOrderItemStatus(orderId: string, itemId: string, statusData: UpdateOrderItemStatusRequest): Promise<Order>;
  
  // Kitchen operations
  getCurrentOrders(): Promise<Order[]>;
  getKitchenOrders(restaurantId?: string): Promise<KitchenOrder[]>;
  markOrderReady(orderId: string): Promise<Order>;
  
  // Advanced queries
  getOrdersByTable(tableId: string): Promise<Order[]>;
  getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
  getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]>;
  
  // Order analytics
  getOrderStats(restaurantId: string, dateRange?: { start: string; end: string }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    popularItems: Array<{ itemId: string; name: string; count: number }>;
  }>;
}