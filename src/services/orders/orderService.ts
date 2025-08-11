import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/constants';
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
  
  // Professional order filtering and searching
  async getOrdersWithFilters(filters: OrderFilterOptions): Promise<Order[]> {
    const params: any = {};
    
    if (filters.status && filters.status !== 'ALL') {
      params.status = filters.status;
    }
    
    if (filters.table_id) {
      params.table_id = filters.table_id;
    }
    
    if (filters.date_from) {
      params.date_from = filters.date_from;
    }
    
    if (filters.date_to) {
      params.date_to = filters.date_to;
    }
    
    if (filters.staff_id) {
      params.staff_id = filters.staff_id;
    }
    
    if (filters.search_query) {
      params.search = filters.search_query;
    }
    
    const response = await this.getOrders(params);
    return response.data || [];
  }
  
  // Kitchen operations
  async getKitchenOrders(restaurantId?: string): Promise<KitchenOrder[]> {
    const response = await apiClient.get<Order[]>(
      `${API_ENDPOINTS.ORDERS.BASE}/kitchen`,
      { params: { restaurantId } }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get kitchen orders');
    }
    
    // Convert orders to kitchen order format
    const orders = response.data.data;
    return orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      table_number: order.table_id || 'N/A',
      items: order.items,
      created_at: order.created_at,
      estimated_prep_time: order.estimated_prep_time || 15,
      elapsed_time: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60)),
      priority: this.calculateOrderPriority(order),
      special_instructions: order.special_instructions,
      kitchen_notes: order.kitchen_notes,
    }));
  }
  
  async getActiveKitchenOrders(restaurantId?: string): Promise<KitchenOrder[]> {
    const kitchenOrders = await this.getKitchenOrders(restaurantId);
    return kitchenOrders.filter(order => 
      ['pending', 'confirmed', 'preparing'].includes(
        order.items[0]?.status || ''
      )
    );
  }
  
  // Print operations
  async printKOT(orderId: string): Promise<void> {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/print/kot`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to print KOT');
    }
  }
  
  async printReceipt(orderId: string): Promise<void> {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/print/receipt`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to print receipt');
    }
  }
  
  // Real-time order updates
  subscribeToOrderUpdates(callback: (order: Order) => void): () => void {
    // WebSocket implementation would go here
    // For now, return a cleanup function
    console.log('Subscribing to order updates');
    
    // Mock implementation - in real app would use WebSocket
    const interval = setInterval(async () => {
      try {
        const orders = await this.getCurrentOrders();
        orders.forEach(callback);
      } catch (error) {
        console.error('Failed to fetch order updates:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }
  
  // Helper method to calculate order priority
  private calculateOrderPriority(order: Order): 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' {
    const elapsedMinutes = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60));
    const estimatedTime = order.estimated_prep_time || 15;
    
    if (elapsedMinutes > estimatedTime + 10) {
      return 'URGENT';
    } else if (elapsedMinutes > estimatedTime) {
      return 'HIGH';
    } else if (elapsedMinutes > estimatedTime * 0.8) {
      return 'NORMAL';
    }
    
    return 'LOW';
  }
}

// Create mock implementation for development
class MockOrderService extends OrderService {
  private mockOrders: Order[] = [];
  
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const mockOrder: Order = {
      id: `mock_order_${Date.now()}`,
      restaurant_id: 'rest_001',
      table_id: orderData.table_id,
      staff_id: 'current_user',
      created_by: 'current_user',
      order_number: `ORD-${String(Date.now()).slice(-6)}`,
      status: OrderStatus.PENDING,
      items: orderData.items.map((item, index) => ({
        id: `item_${index}`,
        order_id: `mock_order_${Date.now()}`,
        menu_item_id: item.menu_item_id,
        menu_item: {
          id: item.menu_item_id,
          name: `Menu Item ${index + 1}`,
          price: 10.99,
          description: 'Mock menu item',
          category_id: 'cat_1',
          restaurant_id: 'rest_001',
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        quantity: item.quantity,
        unit_price: 10.99,
        total_price: 10.99 * item.quantity,
        special_instructions: item.special_instructions,
        status: OrderItemStatus.PENDING,
        modifiers: [],
      })),
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Calculate totals
    mockOrder.subtotal = mockOrder.items.reduce((sum, item) => sum + item.total_price, 0);
    mockOrder.tax_amount = mockOrder.subtotal * 0.1;
    mockOrder.total_amount = mockOrder.subtotal + mockOrder.tax_amount;
    
    this.mockOrders.push(mockOrder);
    console.log('Mock: Created order', mockOrder);
    return mockOrder;
  }
  
  async getOrders(): Promise<PaginatedResponse<Order>> {
    console.log('Mock: Getting orders', this.mockOrders);
    return {
      success: true,
      data: this.mockOrders,
      message: 'Success',
      pagination: {
        page: 1,
        limit: 10,
        total: this.mockOrders.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }
  
  async getCurrentOrders(): Promise<Order[]> {
    console.log('Mock: Getting current orders');
    return this.mockOrders.filter(order => 
      order.status !== OrderStatus.SERVED && order.status !== OrderStatus.CANCELLED
    );
  }
  
  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusRequest): Promise<Order> {
    const orderIndex = this.mockOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    this.mockOrders[orderIndex] = {
      ...this.mockOrders[orderIndex],
      status: statusData.status,
      kitchen_notes: statusData.kitchen_notes,
      updated_at: new Date().toISOString(),
    };
    
    console.log('Mock: Updated order status', this.mockOrders[orderIndex]);
    return this.mockOrders[orderIndex];
  }
  
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const orderIndex = this.mockOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    this.mockOrders[orderIndex] = {
      ...this.mockOrders[orderIndex],
      status: OrderStatus.CANCELLED,
      special_instructions: `${this.mockOrders[orderIndex].special_instructions || ''} | Cancelled: ${reason}`,
      updated_at: new Date().toISOString(),
    };
    
    console.log('Mock: Cancelled order', this.mockOrders[orderIndex]);
    return this.mockOrders[orderIndex];
  }
}

// Export appropriate service based on environment
export const orderService = process.env.NODE_ENV === 'development' 
  ? new MockOrderService()
  : new OrderService();