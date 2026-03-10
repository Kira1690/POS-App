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
import { OrderStatus, PaymentStatus } from '@/types/common.types';
import { IOrderService } from '@/interfaces/services/order.interface';
import { menuStorageService } from '@/services/storage/MenuStorageService';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { ExtendedOrder, ExtendedOrderStatus } from '@/types/order-extended.types';
import { UnifiedOrder, UnifiedOrderStatus } from '@/types/unified-order.types';

export class OrderService implements IOrderService {
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

    // Transform ApiResponse to PaginatedResponse
    const orders = response.data.data || [];
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    return {
      data: orders,
      total: orders.length,
      page,
      limit,
      totalPages: Math.ceil(orders.length / limit),
      hasNextPage: false,
      hasPrevPage: page > 1,
    };
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

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/cancel`,
      { reason }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to cancel order');
    }

    return response.data.data;
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}`,
      updates
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order');
    }

    return response.data.data;
  }

  async deleteOrder(orderId: string): Promise<void> {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete order');
    }
  }

  async updateOrderItemStatus(
    orderId: string,
    itemId: string,
    statusData: UpdateOrderItemStatusRequest
  ): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/items/${itemId}/status`,
      statusData
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order item status');
    }

    return response.data.data;
  }

  async markOrderReady(orderId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, { status: OrderStatus.READY });
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const response = await this.getOrders({ tableId });
    return response.data || [];
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const response = await this.getOrders({ status: status as string });
    return response.data || [];
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(
      API_ENDPOINTS.ORDERS.BASE,
      { params: { date_from: startDate, date_to: endDate } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get orders by date range');
    }

    return response.data.data || [];
  }

  async getOrderStats(restaurantId: string, dateRange?: { start: string; end: string }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    popularItems: Array<{ itemId: string; name: string; count: number }>;
  }> {
    const response = await apiClient.get(
      `${API_ENDPOINTS.ORDERS.BASE}/stats`,
      { params: { restaurantId, ...dateRange } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get order stats');
    }

    return response.data.data || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      popularItems: [],
    };
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

    // Transform ApiResponse to PaginatedResponse
    const orders = response.data.data || [];
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    return {
      data: orders,
      total: orders.length,
      page,
      limit,
      totalPages: Math.ceil(orders.length / limit),
      hasNextPage: false,
      hasPrevPage: page > 1,
    };
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
    // Mock implementation - in real app would use WebSocket
    const interval = setInterval(async () => {
      try {
        const orders = await this.getCurrentOrders();
        orders.forEach(callback);
      } catch { /* silent */ }
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
// This mock service mirrors how the real API would work:
// - Receives order request with menu_item_ids
// - Looks up menu item details from storage (like backend would from database)
// - Returns complete order with full menu item data
class MockOrderService extends OrderService {
  // NOTE: For production, this service reads ONLY from AsyncStorage
  // No mock data is generated - all data comes from user actions
  private mockOrders: Order[] = []; // Legacy array, no longer used in production

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const orderId = `mock_order_${Date.now()}`;
    const orderNumber = `ORD-${String(Date.now()).slice(-6)}`;

    // Look up menu items from storage (mirrors backend behavior)
    // This is how the real API would work - look up items by ID from database
    const menuItemIds = orderData.items.map(item => item.menu_item_id);
    const menuItemsMap = await menuStorageService.getMenuItemsByIds(menuItemIds);

    if (__DEV__) {
      console.log(`[MockOrderService] Looking up ${menuItemIds.length} menu items, found ${menuItemsMap.size}`);
    }

    // Create order items with real menu data
    const orderItems = orderData.items.map((item, index) => {
      const menuItem = menuItemsMap.get(item.menu_item_id);

      // Use real menu item data if found, otherwise use fallback
      const itemName = menuItem?.name || `Unknown Item (${item.menu_item_id})`;
      const itemPrice = menuItem?.price || 0;
      const itemDescription = menuItem?.description || '';
      const categoryId = menuItem?.category_id || 'unknown';

      return {
        id: `item_${orderId}_${index}`,
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        menu_item: {
          id: item.menu_item_id,
          name: itemName,
          price: itemPrice,
          description: itemDescription,
          category_id: categoryId,
          restaurant_id: 'rest_001',
          is_available: menuItem?.is_available ?? true,
          created_at: menuItem?.created_at || new Date().toISOString(),
          updated_at: menuItem?.updated_at || new Date().toISOString(),
        },
        quantity: item.quantity,
        unit_price: itemPrice,
        total_price: itemPrice * item.quantity,
        special_instructions: item.special_instructions,
        status: OrderItemStatus.PENDING,
        modifiers: item.modifiers || [],
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = subtotal * 0.0825; // 8.25% tax
    const totalAmount = subtotal + taxAmount;

    const mockOrder: Order = {
      id: orderId,
      restaurant_id: 'rest_001',
      table_id: orderData.table_id,
      staff_id: 'current_user',
      created_by: 'current_user',
      order_number: orderNumber,
      status: OrderStatus.PENDING,
      items: orderItems,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      special_instructions: orderData.special_instructions,
      kitchen_notes: orderData.kitchen_notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // PRODUCTION MODE: Do NOT add to in-memory array
    // Order will be saved to AsyncStorage by EnhancedOrderContext
    // this.mockOrders.push(mockOrder); // REMOVED for production

    if (__DEV__) {
      console.log('[OrderService] Created order:', {
        id: mockOrder.id,
        orderNumber: mockOrder.order_number,
        itemCount: mockOrder.items.length,
        itemNames: mockOrder.items.map(i => i.menu_item.name),
        total: mockOrder.total_amount,
      });
    }

    return mockOrder;
  }
  
  async getOrders(): Promise<PaginatedResponse<Order>> {
    if (__DEV__) {
      console.log('[OrderService] Getting orders from AsyncStorage');
    }

    // Use Map for guaranteed deduplication by ID
    const ordersMap = new Map<string, Order>();

    // PRODUCTION MODE: Load from unified storage (single source of truth)
    try {
      await unifiedOrderStorageService.initialize();
      const allStorageOrders = await unifiedOrderStorageService.getAllOrders();

      // Convert and add to map
      allStorageOrders.forEach(unifiedOrder => {
        const converted = this.convertUnifiedOrderToOrder(unifiedOrder);
        ordersMap.set(converted.id, converted);
      });

      if (__DEV__) {
        console.log(`[OrderService] Loaded ${ordersMap.size} orders from unified storage`);
      }
    } catch { /* silent */ }

    // 3. Convert Map to array and sort (no accumulation - fresh array each call!)
    const sortedOrders = Array.from(ordersMap.values()).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      data: sortedOrders,
      total: sortedOrders.length,
      page: 1,
      limit: 10,
      totalPages: Math.ceil(sortedOrders.length / 10),
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  /**
   * Convert ExtendedOrder (camelCase) to Order (snake_case)
   */
  private convertExtendedOrderToOrder(extOrder: ExtendedOrder): Order {
    // Map ExtendedOrderStatus to OrderStatus
    const statusMap: Record<ExtendedOrderStatus, OrderStatus> = {
      'pending': OrderStatus.PENDING,
      'draft': OrderStatus.PENDING,
      'confirmed': OrderStatus.CONFIRMED,
      'preparing': OrderStatus.PREPARING,
      'ready': OrderStatus.READY,
      'served': OrderStatus.SERVED,
      'paid': OrderStatus.SERVED,
      'completed': OrderStatus.SERVED,
      'cancelled': OrderStatus.CANCELLED,
    };

    // Convert items
    const orderItems = (extOrder.items || []).map((item, index) => ({
      id: item.id,
      order_id: extOrder.id,
      menu_item_id: item.menuItemId,
      menu_item: {
        id: item.menuItemId,
        name: item.name,
        price: item.basePrice,
        description: item.description || '',
        category_id: item.categoryId,
        restaurant_id: extOrder.restaurantId,
        is_available: true,
        created_at: item.addedAt,
        updated_at: item.modifiedAt || item.addedAt,
      },
      quantity: item.quantity,
      unit_price: item.basePrice,
      total_price: item.itemTotal,
      special_instructions: item.specialInstructions,
      status: this.convertItemStatus(item.status),
      modifiers: (item.selectedModifiers || []).flatMap(mod =>
        (mod.options || []).map(opt => ({
          id: opt.optionId,
          name: opt.optionName,
          price: opt.priceAdjustment,
          category: mod.groupName,
        }))
      ),
    }));

    return {
      id: extOrder.id,
      restaurant_id: extOrder.restaurantId,
      table_id: extOrder.tableId,
      table_number: extOrder.tableName,
      staff_id: extOrder.createdBy,
      created_by: extOrder.createdBy,
      order_number: extOrder.orderNumber,
      status: statusMap[extOrder.status] || OrderStatus.PENDING,
      payment_status: this.convertPaymentStatus(extOrder.paymentStatus),
      items: orderItems,
      subtotal: extOrder.subtotal,
      tax_amount: extOrder.taxAmount,
      discount_amount: extOrder.discountAmount,
      total_amount: extOrder.totalAmount,
      special_instructions: extOrder.specialInstructions,
      kitchen_notes: undefined,
      estimated_prep_time: extOrder.estimatedPrepTime,
      actual_prep_time: extOrder.actualPrepTime,
      created_at: extOrder.createdAt,
      updated_at: extOrder.updatedAt,
      submitted_at: extOrder.submittedAt,
      preparing_at: extOrder.preparingAt,
      ready_at: extOrder.readyAt,
      served_at: extOrder.servedAt,
      paid_at: extOrder.paidAt,
    };
  }

  /**
   * Convert UnifiedOrder (camelCase) to Order (snake_case)
   */
  private convertUnifiedOrderToOrder(unifiedOrder: UnifiedOrder): Order {
    // Map UnifiedOrderStatus to OrderStatus
    const statusMap: Record<UnifiedOrderStatus, OrderStatus> = {
      'draft': OrderStatus.PENDING,
      'confirmed': OrderStatus.CONFIRMED,
      'preparing': OrderStatus.PREPARING,
      'ready': OrderStatus.READY,
      'served': OrderStatus.SERVED,
      'paid': OrderStatus.SERVED,
      'cancelled': OrderStatus.CANCELLED,
    };

    // Convert items
    const orderItems = (unifiedOrder.items || []).map((item) => ({
      id: item.id,
      order_id: unifiedOrder.id,
      menu_item_id: item.menuItemId,
      menu_item: {
        id: item.menuItemId,
        name: item.name,
        price: item.basePrice,
        description: item.description || '',
        category_id: item.categoryId,
        restaurant_id: unifiedOrder.restaurantId,
        is_available: true,
        created_at: item.addedAt,
        updated_at: item.modifiedAt || item.addedAt,
      },
      quantity: item.quantity,
      unit_price: item.basePrice,
      total_price: item.itemTotal,
      special_instructions: item.specialInstructions,
      status: this.convertItemStatus(item.itemStatus),
      modifiers: (item.selectedModifiers || []).flatMap(mod =>
        (mod.options || []).map(opt => ({
          id: opt.optionId,
          name: opt.optionName,
          price: opt.priceAdjustment,
          category: mod.groupName,
        }))
      ),
    }));

    return {
      id: unifiedOrder.id,
      restaurant_id: unifiedOrder.restaurantId,
      table_id: unifiedOrder.tableId,
      table_number: unifiedOrder.tableName,
      staff_id: unifiedOrder.createdBy || '',
      created_by: unifiedOrder.createdBy || '',
      order_number: unifiedOrder.orderNumber,
      status: statusMap[unifiedOrder.status] || OrderStatus.PENDING,
      payment_status: this.convertPaymentStatus(unifiedOrder.paymentStatus),
      items: orderItems,
      subtotal: unifiedOrder.subtotal,
      tax_amount: unifiedOrder.taxAmount,
      discount_amount: unifiedOrder.discountAmount,
      total_amount: unifiedOrder.totalAmount,
      special_instructions: unifiedOrder.specialInstructions,
      kitchen_notes: undefined,
      estimated_prep_time: unifiedOrder.estimatedPrepTime,
      actual_prep_time: unifiedOrder.actualPrepTime,
      created_at: unifiedOrder.createdAt,
      updated_at: unifiedOrder.updatedAt,
      submitted_at: unifiedOrder.submittedAt,
      preparing_at: unifiedOrder.preparingAt,
      ready_at: unifiedOrder.readyAt,
      served_at: unifiedOrder.servedAt,
      paid_at: unifiedOrder.paidAt,
    };
  }

  private convertItemStatus(status: string): OrderItemStatus {
    const statusMap: Record<string, OrderItemStatus> = {
      'pending': OrderItemStatus.PENDING,
      'preparing': OrderItemStatus.PREPARING,
      'ready': OrderItemStatus.READY,
      'served': OrderItemStatus.SERVED,
      'cancelled': OrderItemStatus.CANCELLED,
    };
    return statusMap[status] || OrderItemStatus.PENDING;
  }

  private convertPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'pending': PaymentStatus.PENDING,
      'partial': PaymentStatus.PENDING,
      'paid': PaymentStatus.COMPLETED,
      'refunded': PaymentStatus.REFUNDED,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }
  
  async getCurrentOrders(): Promise<Order[]> {
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
    
    return this.mockOrders[orderIndex];
  }
}

// Add missing interface methods to base OrderService
export class EnhancedOrderService extends OrderService {
  // Implementation of missing interface methods
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}`,
      updates
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order');
    }
    
    return response.data.data;
  }

  async deleteOrder(orderId: string): Promise<void> {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete order');
    }
  }

  async updateOrderItemStatus(orderId: string, itemId: string, statusData: UpdateOrderItemStatusRequest): Promise<Order> {
    const response = await apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.BASE}/${orderId}/items/${itemId}/status`,
      statusData
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order item status');
    }
    
    return response.data.data;
  }

  async markOrderReady(orderId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, { status: OrderStatus.READY });
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const response = await this.getOrders({ tableId });
    return response.data || [];
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const response = await this.getOrders({ status });
    return response.data || [];
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(
      API_ENDPOINTS.ORDERS.BASE,
      { 
        params: { 
          date_from: startDate, 
          date_to: endDate 
        } 
      }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get orders by date range');
    }
    
    return response.data.data;
  }

  async getOrderStats(restaurantId: string, dateRange?: { start: string; end: string }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    popularItems: Array<{ itemId: string; name: string; count: number }>;
  }> {
    const params: any = { restaurantId };
    if (dateRange) {
      params.date_from = dateRange.start;
      params.date_to = dateRange.end;
    }

    const response = await apiClient.get(
      `${API_ENDPOINTS.ORDERS.BASE}/stats`,
      { params }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get order stats');
    }
    
    return response.data.data;
  }
}

// Export appropriate service based on environment
export const orderService = process.env.NODE_ENV === 'development' 
  ? new MockOrderService()
  : new EnhancedOrderService();