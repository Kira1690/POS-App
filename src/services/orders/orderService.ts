import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/constants';
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderStatusRequest,
  PaginatedResponse 
} from '@/types';

export class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>(
      API_ENDPOINTS.ORDERS.BASE,
      orderData
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create order');
    }
    
    return response.data.data;
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    tableId?: string;
    restaurantId?: string;
  }): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<Order[]>(
      API_ENDPOINTS.ORDERS.BASE,
      { params }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get orders');
    }
    
    return response.data as PaginatedResponse<Order>;
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get order');
    }
    
    return response.data.data;
  }

  async updateOrderStatus(
    orderId: string, 
    statusData: UpdateOrderStatusRequest
  ): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/status`,
      statusData
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order status');
    }
    
    return response.data.data;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/cancel`,
      { reason }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to cancel order');
    }
    
    return response.data.data;
  }

  async getCurrentOrders(restaurantId?: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(
      API_ENDPOINTS.ORDERS.CURRENT,
      { params: { restaurantId } }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get current orders');
    }
    
    return response.data.data;
  }

  async getOrderHistory(params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    restaurantId?: string;
  }): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<Order[]>(
      API_ENDPOINTS.ORDERS.HISTORY,
      { params }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get order history');
    }
    
    return response.data as PaginatedResponse<Order>;
  }

  async addItemToOrder(orderId: string, item: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
    customizations?: Record<string, any>;
  }): Promise<Order> {
    const response = await apiClient.post<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/items`,
      item
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to add item to order');
    }
    
    return response.data.data;
  }

  async removeItemFromOrder(orderId: string, itemId: string): Promise<Order> {
    const response = await apiClient.delete<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/items/${itemId}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to remove item from order');
    }
    
    return response.data.data;
  }

  async updateOrderItem(
    orderId: string, 
    itemId: string, 
    updates: {
      quantity?: number;
      special_instructions?: string;
      customizations?: Record<string, any>;
    }
  ): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/items/${itemId}`,
      updates
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order item');
    }
    
    return response.data.data;
  }
}

export const orderService = new OrderService();