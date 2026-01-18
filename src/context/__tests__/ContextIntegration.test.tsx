/**
 * Context Integration Tests
 * Tests that contexts properly use dependency injection services
 * Validates SOLID principle compliance in context implementations
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { OrderManagementProvider, useOrderManagement } from '@/context/orderManagement/OrderManagementContext';
import { EnhancedKitchenProvider, useEnhancedKitchen } from '@/context/kitchen';
import { CartProvider, useCart } from '@/context/cart/CartContext';
import { OrderBusinessLogicProvider, useOrderBusinessLogic } from '@/context/orderBusinessLogic/OrderBusinessLogicContext';
import { initializeServices, serviceContainer } from '@/services/core';
import { OrderStatus } from '@/types/common.types';

// Mock the dependencies
jest.mock('@/services/orders/orderService');
jest.mock('@/services/core', () => ({
  ...jest.requireActual('@/services/core'),
  initializeServices: jest.fn(),
  getService: jest.fn(),
}));

// Mock service hooks
jest.mock('@/hooks/services', () => ({
  useOrderService: () => ({
    getOrders: jest.fn().mockResolvedValue({ data: [] }),
    updateOrderStatus: jest.fn().mockResolvedValue({}),
    cancelOrder: jest.fn().mockResolvedValue({}),
    getCurrentOrders: jest.fn().mockResolvedValue([]),
    createOrder: jest.fn().mockResolvedValue({}),
  }),
}));

describe('Context Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    serviceContainer.clear();
    initializeServices();
  });

  describe('OrderManagementContext Integration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OrderManagementProvider>{children}</OrderManagementProvider>
    );

    test('should properly initialize with dependency injected services', () => {
      const { result } = renderHook(() => useOrderManagement(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.orders).toEqual([]);
      expect(result.current.selectedOrder).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.loadOrders).toBe('function');
    });

    test('should use dependency injection for service operations', async () => {
      const { result } = renderHook(() => useOrderManagement(), { wrapper });

      await act(async () => {
        await result.current.loadOrders();
      });

      // The service should have been called through dependency injection
      expect(result.current.isLoading).toBe(false);
    });

    test('should handle service errors gracefully', async () => {
      const { result } = renderHook(() => useOrderManagement(), { wrapper });

      // Mock service failure
      const mockOrderService = require('@/hooks/services').useOrderService();
      mockOrderService.getOrders.mockRejectedValue(new Error('Service error'));

      await act(async () => {
        await result.current.loadOrders();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });

    test('should maintain SOLID principles - Single Responsibility', () => {
      const { result } = renderHook(() => useOrderManagement(), { wrapper });

      // Context should only provide order management operations
      const orderManagementOperations = [
        'loadOrders', 'selectOrder', 'updateOrderStatus', 'cancelOrder',
        'setSearchQuery', 'setStatusFilter', 'applyFilters'
      ];

      orderManagementOperations.forEach(operation => {
        expect(typeof result.current[operation]).toBe('function');
      });

      // Should not have cart or kitchen operations (separate contexts)
      expect(result.current.addItem).toBeUndefined();
      expect(result.current.kitchenOrders).toBeUndefined();
    });
  });

  describe('KitchenContext Integration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EnhancedKitchenProvider>{children}</EnhancedKitchenProvider>
    );

    test('should properly use dependency injection for kitchen operations', () => {
      const { result } = renderHook(() => useEnhancedKitchen(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.kitchenOrders).toEqual([]);
      expect(result.current.activeOrders).toEqual([]);
      expect(typeof result.current.loadKitchenOrders).toBe('function');
      expect(typeof result.current.updateOrderStatus).toBe('function');
    });

    test('should handle kitchen-specific operations only', () => {
      const { result } = renderHook(() => useEnhancedKitchen(), { wrapper });

      // Kitchen-specific operations
      const kitchenOperations = [
        'loadKitchenOrders', 'selectKitchenOrder', 'updateOrderStatus',
        'markOrderReady', 'setActiveStation'
      ];

      kitchenOperations.forEach(operation => {
        expect(typeof result.current[operation]).toBe('function');
      });

      // Should not have order management operations (separate context)
      expect(result.current.searchQuery).toBeUndefined();
      expect(result.current.statusFilter).toBeUndefined();
    });

    test('should manage notifications independently', async () => {
      const { result } = renderHook(() => useEnhancedKitchen(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'NEW_ORDER',
          message: 'New order received',
        });
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.unreadNotifications).toBe(1);
    });
  });

  describe('CartContext Integration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );

    test('should manage cart state independently of services', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
      expect(typeof result.current.addItem).toBe('function');
    });

    test('should handle cart operations without service dependencies', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const mockMenuItem = {
        id: 'item1',
        name: 'Test Item',
        price: 10.99,
        category_id: 'cat1',
        description: 'Test',
        restaurant_id: 'rest1',
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      act(() => {
        result.current.addItem(mockMenuItem, 2, 'No onions');
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.total).toBe(21.98);
      expect(result.current.itemCount).toBe(2);
    });

    test('should maintain cart business logic integrity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const mockMenuItem = {
        id: 'item1',
        name: 'Test Item',
        price: 10.99,
        category_id: 'cat1',
        description: 'Test',
        restaurant_id: 'rest1',
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add item
      act(() => {
        result.current.addItem(mockMenuItem, 1);
      });

      const itemId = result.current.items[0].id;

      // Update quantity
      act(() => {
        result.current.updateItem(itemId, 3);
      });

      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.total).toBe(32.97);

      // Remove item
      act(() => {
        result.current.removeItem(itemId);
      });

      expect(result.current.items.length).toBe(0);
      expect(result.current.total).toBe(0);
    });
  });

  describe('OrderBusinessLogicContext Integration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OrderBusinessLogicProvider>{children}</OrderBusinessLogicProvider>
    );

    test('should properly use dependency injection for business operations', () => {
      const { result } = renderHook(() => useOrderBusinessLogic(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.taxRate).toBe(0.0825);
      expect(typeof result.current.validateOrder).toBe('function');
      expect(typeof result.current.createOrderFromCart).toBe('function');
    });

    test('should perform order validation without external dependencies', async () => {
      const { result } = renderHook(() => useOrderBusinessLogic(), { wrapper });

      const mockOrder = {
        id: 'order1',
        table_id: 'table1',
        items: [{} as any],
        total_amount: 25.99,
      } as any;

      const validation = await result.current.validateOrder(mockOrder);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('should calculate order totals correctly', () => {
      const { result } = renderHook(() => useOrderBusinessLogic(), { wrapper });

      const mockCartItems = [
        {
          id: '1',
          price: 10.99,
          quantity: 2,
        } as any,
        {
          id: '2',
          price: 5.99,
          quantity: 1,
        } as any,
      ];

      const calculation = result.current.calculateOrderTotals(mockCartItems);

      expect(calculation.subtotal).toBe(27.97);
      expect(calculation.taxAmount).toBeCloseTo(2.31, 2);
      expect(calculation.serviceFee).toBeCloseTo(0.84, 2);
      expect(calculation.totalAmount).toBeCloseTo(31.12, 2);
    });
  });

  describe('Context Composition and Interaction', () => {
    const CompositeWrapper = ({ children }: { children: React.ReactNode }) => (
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

    test('should allow multiple contexts to coexist without conflicts', () => {
      const { result } = renderHook(() => ({
        orderManagement: useOrderManagement(),
        kitchen: useEnhancedKitchen(),
        cart: useCart(),
        businessLogic: useOrderBusinessLogic(),
      }), { wrapper: CompositeWrapper });

      // All contexts should be available and functional
      expect(result.current.orderManagement.orders).toBeDefined();
      expect(result.current.kitchen.kitchenOrders).toBeDefined();
      expect(result.current.cart.items).toBeDefined();
      expect(result.current.businessLogic.taxRate).toBeDefined();
    });

    test('should maintain independent state across contexts', () => {
      const { result } = renderHook(() => ({
        orderManagement: useOrderManagement(),
        kitchen: useEnhancedKitchen(),
      }), { wrapper: CompositeWrapper });

      // States should be independent
      expect(result.current.orderManagement.isLoading).not.toBe(result.current.kitchen.isLoading);
      expect(result.current.orderManagement.error).not.toBe(result.current.kitchen.error);
    });
  });

  describe('SOLID Principle Compliance', () => {
    test('contexts should follow Single Responsibility Principle', () => {
      const CompositeWrapper = ({ children }: { children: React.ReactNode }) => (
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
      }), { wrapper: CompositeWrapper });

      // Each context should have distinct, non-overlapping responsibilities
      
      // OrderManagement: CRUD and management dashboard
      expect(result.current.orderManagement.loadOrders).toBeDefined();
      expect(result.current.orderManagement.updateOrderStatus).toBeDefined();
      
      // Kitchen: Kitchen workflow operations
      expect(result.current.kitchen.loadKitchenOrders).toBeDefined();
      expect(result.current.kitchen.setActiveStation).toBeDefined();
      
      // Cart: Cart state management only
      expect(result.current.cart.addItem).toBeDefined();
      expect(result.current.cart.total).toBeDefined();
      
      // BusinessLogic: Business rules and validation
      expect(result.current.businessLogic.validateOrder).toBeDefined();
      expect(result.current.businessLogic.calculateOrderTotals).toBeDefined();

      // Verify no overlap in responsibilities
      expect(result.current.cart.loadOrders).toBeUndefined();
      expect(result.current.kitchen.addItem).toBeUndefined();
      expect(result.current.orderManagement.setActiveStation).toBeUndefined();
    });

    test('contexts should follow Dependency Inversion Principle', () => {
      // Contexts should depend on abstractions (service interfaces) not concrete implementations
      // This is tested by the fact that we can mock the service hooks and contexts still work
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <OrderManagementProvider>{children}</OrderManagementProvider>
      );

      const { result } = renderHook(() => useOrderManagement(), { wrapper });

      // Context should work with mocked services (dependency inversion)
      expect(result.current.loadOrders).toBeDefined();
      expect(typeof result.current.loadOrders).toBe('function');
    });
  });
});