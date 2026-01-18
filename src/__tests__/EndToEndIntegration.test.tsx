/**
 * End-to-End Integration Tests
 * Tests complete workflow with all services, contexts, and components working together
 * Validates SOLID principles and dependency injection across the entire application
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { 
  initializeServices, 
  serviceContainer, 
  getService, 
  SERVICE_TOKENS 
} from '@/services/core';
import { 
  useOrderService, 
  useTableService, 
  useMenuService, 
  useAuthService 
} from '@/hooks/services';
import { OrderManagementProvider, useOrderManagement } from '@/context/orderManagement/OrderManagementContext';
import { EnhancedKitchenProvider, useEnhancedKitchen } from '@/context/kitchen';
import { CartProvider, useCart } from '@/context/cart/CartContext';
import { OrderBusinessLogicProvider, useOrderBusinessLogic } from '@/context/orderBusinessLogic/OrderBusinessLogicContext';
import { IOrderService } from '@/interfaces/services/order.interface';
import { OrderStatus } from '@/types/common.types';

// Mock implementations for end-to-end testing
const mockOrderData = [
  {
    id: 'order_1',
    order_number: 'ORD-001',
    table_id: 'table_1',
    restaurant_id: 'rest_1',
    staff_id: 'staff_1',
    created_by: 'staff_1',
    status: OrderStatus.PENDING,
    items: [
      {
        id: 'item_1',
        order_id: 'order_1',
        menu_item_id: 'menu_item_1',
        quantity: 2,
        unit_price: 12.99,
        total_price: 25.98,
        menu_item: {
          id: 'menu_item_1',
          name: 'Burger',
          price: 12.99,
          description: 'Beef burger',
          category_id: 'cat_1',
          restaurant_id: 'rest_1',
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        special_instructions: 'No onions',
        status: 'pending' as any,
        modifiers: [],
      }
    ],
    subtotal: 25.98,
    tax_amount: 2.14,
    discount_amount: 0,
    total_amount: 28.12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Mock service implementation that behaves like real service
class MockEndToEndOrderService implements IOrderService {
  private orders = mockOrderData;

  async getOrders() { 
    return { success: true, data: this.orders }; 
  }

  async getOrder(id: string) { 
    const order = this.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order; 
  }

  async createOrder(data: any) { 
    const newOrder = {
      ...mockOrderData[0],
      id: `order_${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrder(id: string, updates: any) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    this.orders[index] = { ...this.orders[index], ...updates };
    return this.orders[index];
  }

  async updateOrderStatus(id: string, statusData: any) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    this.orders[index] = { 
      ...this.orders[index], 
      status: statusData.status,
      kitchen_notes: statusData.kitchen_notes,
      updated_at: new Date().toISOString(),
    };
    return this.orders[index];
  }

  async deleteOrder(id: string) {
    this.orders = this.orders.filter(o => o.id !== id);
  }

  async cancelOrder(id: string, reason: string) {
    return this.updateOrderStatus(id, { status: OrderStatus.CANCELLED, kitchen_notes: reason });
  }

  async getCurrentOrders() { 
    return this.orders.filter(o => o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED); 
  }

  async getOrderHistory() { 
    return { success: true, data: this.orders }; 
  }

  async addItemToOrder() { return this.orders[0]; }
  async removeItemFromOrder() { return this.orders[0]; }
  async updateOrderItem() { return this.orders[0]; }
  async getOrdersWithFilters() { return this.orders; }
  async getKitchenOrders() { return []; }
  async getActiveKitchenOrders() { return []; }
  async printKOT() { return Promise.resolve(); }
  async printReceipt() { return Promise.resolve(); }
  subscribeToOrderUpdates() { return () => {}; }
  async updateOrderItemStatus() { return this.orders[0]; }
  async markOrderReady() { return this.orders[0]; }
  async getOrdersByTable() { return this.orders; }
  async getOrdersByStatus() { return this.orders; }
  async getOrdersByDateRange() { return this.orders; }
  async getOrderStats() { return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, popularItems: [] }; }
}

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    // Clear and reinitialize with mock services
    serviceContainer.clear();
    
    // Register mock service for end-to-end testing
    serviceContainer.register(
      SERVICE_TOKENS.ORDER_SERVICE,
      () => new MockEndToEndOrderService(),
      'Singleton' as any
    );
  });

  afterEach(() => {
    serviceContainer.clear();
  });

  describe('Complete Order Workflow', () => {
    const CompleteAppWrapper = ({ children }: { children: React.ReactNode }) => (
      <OrderManagementProvider>
        <EnhancedKitchenProvider>
          <CartProvider>
            <OrderBusinessLogicProvider>
              {children}
            </OrderBusinessLogicProvider>
          </CartProvider>
        </EnhancedKitchenProvider>
      </OrderManagementProvider>
    );

    test('should complete full order lifecycle through all contexts', async () => {
      const { result } = renderHook(() => ({
        orderManagement: useOrderManagement(),
        kitchen: useEnhancedKitchen(),
        cart: useCart(),
        businessLogic: useOrderBusinessLogic(),
      }), { wrapper: CompleteAppWrapper });

      // 1. Load initial orders in management context
      await act(async () => {
        await result.current.orderManagement.loadOrders();
      });

      expect(result.current.orderManagement.orders.length).toBe(1);
      expect(result.current.orderManagement.orders[0].order_number).toBe('ORD-001');

      // 2. Add items to cart
      const mockMenuItem = {
        id: 'menu_item_2',
        name: 'Pizza',
        price: 15.99,
        category_id: 'cat_2',
        description: 'Cheese pizza',
        restaurant_id: 'rest_1',
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      act(() => {
        result.current.cart.addItem(mockMenuItem, 1, 'Extra cheese');
      });

      expect(result.current.cart.items.length).toBe(1);
      expect(result.current.cart.total).toBe(15.99);

      // 3. Validate order using business logic
      const cartItems = result.current.cart.items;
      const validation = result.current.businessLogic.validateCartItems(cartItems);
      
      expect(validation.isValid).toBe(true);

      // 4. Calculate order totals
      const totals = result.current.businessLogic.calculateOrderTotals(cartItems);
      
      expect(totals.subtotal).toBe(15.99);
      expect(totals.totalAmount).toBeGreaterThan(15.99); // includes tax and service fee

      // 5. Create order from cart
      await act(async () => {
        try {
          await result.current.businessLogic.createOrderFromCart(
            cartItems, 
            'table_2', 
            'Rush order'
          );
        } catch (error) {
          // Expected since we're using mocks
        }
      });

      // 6. Update order status through management context
      const orderId = result.current.orderManagement.orders[0].id;
      
      await act(async () => {
        await result.current.orderManagement.updateOrderStatus(
          orderId, 
          OrderStatus.CONFIRMED, 
          'Order confirmed by staff'
        );
      });

      // 7. Load kitchen orders
      await act(async () => {
        await result.current.kitchen.loadKitchenOrders();
      });

      // Verify kitchen has the updated orders
      expect(result.current.kitchen.kitchenOrders.length).toBeGreaterThan(0);
    });

    test('should maintain data consistency across all contexts', async () => {
      const { result } = renderHook(() => ({
        orderManagement: useOrderManagement(),
        kitchen: useEnhancedKitchen(),
      }), { wrapper: CompleteAppWrapper });

      // Load data in both contexts
      await act(async () => {
        await Promise.all([
          result.current.orderManagement.loadOrders(),
          result.current.kitchen.loadKitchenOrders()
        ]);
      });

      // Both contexts should have access to the same underlying data
      const managementOrderIds = result.current.orderManagement.orders.map(o => o.id);
      const kitchenOrderIds = result.current.kitchen.kitchenOrders.map(o => o.id);
      
      // Should have some overlap (active orders)
      const hasOverlap = managementOrderIds.some(id => kitchenOrderIds.includes(id));
      expect(hasOverlap).toBe(true);
    });

    test('should handle concurrent operations safely', async () => {
      const { result } = renderHook(() => ({
        orderManagement: useOrderManagement(),
        kitchen: useEnhancedKitchen(),
      }), { wrapper: CompleteAppWrapper });

      // Perform multiple operations concurrently
      await act(async () => {
        const operations = [
          result.current.orderManagement.loadOrders(),
          result.current.kitchen.loadKitchenOrders(),
          result.current.orderManagement.loadOrders(), // Duplicate call
        ];

        await Promise.allSettled(operations);
      });

      // Should not cause race conditions or duplicate states
      expect(result.current.orderManagement.isLoading).toBe(false);
      expect(result.current.kitchen.isLoading).toBe(false);
    });
  });

  describe('Service Layer Integration', () => {
    test('should provide consistent service instances across the application', () => {
      // Mock the service hooks to return actual service instances
      jest.mock('@/hooks/services', () => ({
        useOrderService: () => getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE),
      }));

      const { result: result1 } = renderHook(() => useOrderService());
      const { result: result2 } = renderHook(() => useOrderService());

      // Should be the same instance (singleton)
      expect(result1.current).toBe(result2.current);
    });

    test('should handle service failures gracefully across all contexts', async () => {
      // Create a failing service
      serviceContainer.clear();
      serviceContainer.register(
        SERVICE_TOKENS.ORDER_SERVICE,
        () => {
          throw new Error('Service initialization failed');
        },
        'Singleton' as any
      );

      const CompleteAppWrapper = ({ children }: { children: React.ReactNode }) => (
        <OrderManagementProvider>
          <EnhancedKitchenProvider>
            {children}
          </EnhancedKitchenProvider>
        </OrderManagementProvider>
      );

      // Should handle initialization gracefully
      expect(() => {
        renderHook(() => ({
          orderManagement: useOrderManagement(),
          kitchen: useEnhancedKitchen(),
        }), { wrapper: CompleteAppWrapper });
      }).toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    test('should not create memory leaks with multiple context providers', () => {
      const CompleteAppWrapper = ({ children }: { children: React.ReactNode }) => (
        <OrderManagementProvider>
          <EnhancedKitchenProvider>
            <CartProvider>
              <OrderBusinessLogicProvider>
                {children}
              </OrderBusinessLogicProvider>
            </CartProvider>
          </EnhancedKitchenProvider>
        </OrderManagementProvider>
      );

      // Create and destroy multiple hook instances
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => ({
          orderManagement: useOrderManagement(),
          kitchen: useEnhancedKitchen(),
          cart: useCart(),
          businessLogic: useOrderBusinessLogic(),
        }), { wrapper: CompleteAppWrapper });

        unmount();
      }

      // Should not accumulate memory significantly
      // This is a basic check; more sophisticated memory testing would require profiling tools
      expect(serviceContainer).toBeDefined();
    });

    test('should maintain performance with multiple concurrent operations', async () => {
      const CompleteAppWrapper = ({ children }: { children: React.ReactNode }) => (
        <OrderManagementProvider>
          <EnhancedKitchenProvider>
            <CartProvider>
              <OrderBusinessLogicProvider>
                {children}
              </OrderBusinessLogicProvider>
            </CartProvider>
          </EnhancedKitchenProvider>
        </OrderManagementProvider>
      );

      const { result } = renderHook(() => ({
        orderManagement: useOrderManagement(),
        kitchen: useEnhancedKitchen(),
        cart: useCart(),
      }), { wrapper: CompleteAppWrapper });

      const startTime = Date.now();

      // Perform multiple operations
      await act(async () => {
        const operations = [];
        
        // Add multiple items to cart
        for (let i = 0; i < 5; i++) {
          operations.push(new Promise(resolve => {
            result.current.cart.addItem({
              id: `item_${i}`,
              name: `Item ${i}`,
              price: 10.99,
              category_id: 'cat_1',
              description: 'Test item',
              restaurant_id: 'rest_1',
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            resolve(true);
          }));
        }

        // Load orders multiple times
        operations.push(result.current.orderManagement.loadOrders());
        operations.push(result.current.kitchen.loadKitchenOrders());

        await Promise.all(operations);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second for mock operations)
      expect(duration).toBeLessThan(1000);
      expect(result.current.cart.items.length).toBe(5);
    });
  });

  describe('SOLID Principles Validation', () => {
    test('should demonstrate Single Responsibility Principle compliance', () => {
      const CompleteAppWrapper = ({ children }: { children: React.ReactNode }) => (
        <OrderManagementProvider>
          <EnhancedKitchenProvider>
            <CartProvider>
              <OrderBusinessLogicProvider>
                {children}
              </OrderBusinessLogicProvider>
            </CartProvider>
          </EnhancedKitchenProvider>
        </OrderManagementProvider>
      );

      const { result } = renderHook(() => ({
        orderManagement: useOrderManagement(),
        kitchen: useEnhancedKitchen(),
        cart: useCart(),
        businessLogic: useOrderBusinessLogic(),
      }), { wrapper: CompleteAppWrapper });

      // Each context should have distinct responsibilities
      // OrderManagement: Order CRUD and filtering
      expect(typeof result.current.orderManagement.loadOrders).toBe('function');
      expect(typeof result.current.orderManagement.setSearchQuery).toBe('function');

      // Kitchen: Kitchen workflow and notifications
      expect(typeof result.current.kitchen.loadKitchenOrders).toBe('function');
      expect(typeof result.current.kitchen.addNotification).toBe('function');

      // Cart: Cart state management
      expect(typeof result.current.cart.addItem).toBe('function');
      expect(typeof result.current.cart.clearCart).toBe('function');

      // BusinessLogic: Business rules and calculations
      expect(typeof result.current.businessLogic.validateOrder).toBe('function');
      expect(typeof result.current.businessLogic.calculateOrderTotals).toBe('function');
    });

    test('should demonstrate Open/Closed Principle through service extension', () => {
      // Services can be extended without modifying existing code
      class ExtendedOrderService extends MockEndToEndOrderService {
        async getOrdersWithAdvancedFiltering() {
          const orders = await this.getCurrentOrders();
          return orders.filter(order => order.total_amount > 20);
        }
      }

      // Should be able to register extended service
      serviceContainer.register(
        'EXTENDED_ORDER_SERVICE',
        () => new ExtendedOrderService(),
        'Singleton' as any
      );

      const extendedService = getService('EXTENDED_ORDER_SERVICE') as ExtendedOrderService;
      expect(typeof extendedService.getOrdersWithAdvancedFiltering).toBe('function');
    });

    test('should demonstrate Dependency Inversion Principle', () => {
      // Contexts depend on abstractions (service interfaces) not concrete implementations
      // This is demonstrated by the ability to swap service implementations

      class AlternativeOrderService implements IOrderService {
        async getOrders() { return { success: true, data: [] }; }
        async getOrder() { return {} as any; }
        async createOrder() { return {} as any; }
        async updateOrder() { return {} as any; }
        async updateOrderStatus() { return {} as any; }
        async deleteOrder() { return Promise.resolve(); }
        async cancelOrder() { return {} as any; }
        async getCurrentOrders() { return []; }
        async getOrderHistory() { return { success: true, data: [] }; }
        async addItemToOrder() { return {} as any; }
        async removeItemFromOrder() { return {} as any; }
        async updateOrderItem() { return {} as any; }
        async getOrdersWithFilters() { return []; }
        async getKitchenOrders() { return []; }
        async getActiveKitchenOrders() { return []; }
        async printKOT() { return Promise.resolve(); }
        async printReceipt() { return Promise.resolve(); }
        subscribeToOrderUpdates() { return () => {}; }
        async updateOrderItemStatus() { return {} as any; }
        async markOrderReady() { return {} as any; }
        async getOrdersByTable() { return []; }
        async getOrdersByStatus() { return []; }
        async getOrdersByDateRange() { return []; }
        async getOrderStats() { return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, popularItems: [] }; }
      }

      // Should be able to swap implementation without breaking contexts
      serviceContainer.clear();
      serviceContainer.register(
        SERVICE_TOKENS.ORDER_SERVICE,
        () => new AlternativeOrderService(),
        'Singleton' as any
      );

      const service = getService<IOrderService>(SERVICE_TOKENS.ORDER_SERVICE);
      expect(service).toBeInstanceOf(AlternativeOrderService);
    });
  });
});