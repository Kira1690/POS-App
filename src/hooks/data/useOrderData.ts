/**
 * Order Data Management Hook
 * Uses OrderService via dependency injection for data operations
 * Follows Single Responsibility Principle - data management only
 * Clean separation from business logic and UI concerns
 */

import { useState, useCallback, useEffect } from 'react';
import { useOrderService } from '@/hooks/services';
import { Order, OrderFilterOptions, KitchenOrder } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';

export interface OrderDataState {
  orders: Order[];
  selectedOrder: Order | null;
  kitchenOrders: KitchenOrder[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseOrderDataResult {
  // State
  state: OrderDataState;
  
  // Data Operations
  loadOrders: (filters?: OrderFilterOptions) => Promise<void>;
  loadOrder: (orderId: string) => Promise<void>;
  loadKitchenOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  // Selection
  selectOrder: (order: Order | null) => void;
  
  // Filtering & Search
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByTable: (tableId: string) => Order[];
  searchOrders: (query: string) => Order[];
  
  // Error Handling
  clearError: () => void;
}

/**
 * Hook for order data management
 * Uses OrderService via dependency injection for all data operations
 * 
 * @returns Order data state and operations
 */
export function useOrderData(): UseOrderDataResult {
  // Use DI service
  const orderService = useOrderService();

  // Local state for data management
  const [state, setState] = useState<OrderDataState>({
    orders: [],
    selectedOrder: null,
    kitchenOrders: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Load orders with optional filters
  const loadOrders = useCallback(async (filters?: OrderFilterOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await orderService.getOrders(filters);
      setState(prev => ({
        ...prev,
        orders: response.data || [],
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load orders',
        isLoading: false,
      }));
    }
  }, [orderService]);

  // Load single order
  const loadOrder = useCallback(async (orderId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const order = await orderService.getOrder(orderId);
      
      setState(prev => ({
        ...prev,
        selectedOrder: order,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load order',
        isLoading: false,
      }));
    }
  }, [orderService]);

  // Load kitchen orders
  const loadKitchenOrders = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const kitchenOrders = await orderService.getKitchenOrders();
      
      setState(prev => ({
        ...prev,
        kitchenOrders,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load kitchen orders',
        isLoading: false,
      }));
    }
  }, [orderService]);

  // Refresh current orders
  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  // Select order
  const selectOrder = useCallback((order: Order | null) => {
    setState(prev => ({
      ...prev,
      selectedOrder: order,
    }));
  }, []);

  // Get orders by status
  const getOrdersByStatus = useCallback((status: OrderStatus): Order[] => {
    return state.orders.filter(order => order.status === status);
  }, [state.orders]);

  // Get orders by table
  const getOrdersByTable = useCallback((tableId: string): Order[] => {
    return state.orders.filter(order => order.table_id === tableId);
  }, [state.orders]);

  // Search orders
  const searchOrders = useCallback((query: string): Order[] => {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return state.orders;
    }

    return state.orders.filter(order =>
      order.order_number.toLowerCase().includes(searchTerm) ||
      order.table_id?.toLowerCase().includes(searchTerm) ||
      order.special_instructions?.toLowerCase().includes(searchTerm) ||
      order.items.some(item =>
        item.menu_item?.name.toLowerCase().includes(searchTerm)
      )
    );
  }, [state.orders]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    state,
    loadOrders,
    loadOrder,
    loadKitchenOrders,
    refreshOrders,
    selectOrder,
    getOrdersByStatus,
    getOrdersByTable,
    searchOrders,
    clearError,
  };
}

/**
 * Hook for real-time order updates
 * Automatically refreshes orders at specified intervals
 */
export function useOrderDataWithRefresh(refreshInterval = 30000) {
  const orderData = useOrderData();

  useEffect(() => {
    // Initial load
    orderData.loadOrders();

    // Set up refresh interval
    const interval = setInterval(() => {
      orderData.refreshOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [orderData, refreshInterval]);

  return orderData;
}

/**
 * Hook for kitchen orders with real-time updates
 * Specialized for kitchen operations
 */
export function useKitchenOrderData(refreshInterval = 15000) {
  const orderData = useOrderData();

  useEffect(() => {
    // Initial load
    orderData.loadKitchenOrders();

    // Set up refresh interval for kitchen (faster updates)
    const interval = setInterval(() => {
      orderData.loadKitchenOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [orderData, refreshInterval]);

  return {
    kitchenOrders: orderData.state.kitchenOrders,
    isLoading: orderData.state.isLoading,
    error: orderData.state.error,
    refreshKitchenOrders: orderData.loadKitchenOrders,
    clearError: orderData.clearError,
  };
}