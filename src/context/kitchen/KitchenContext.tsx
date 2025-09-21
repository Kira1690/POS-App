/**
 * Kitchen Context - Focused on kitchen operations and real-time updates
 * Follows Single Responsibility Principle - handles kitchen workflow only
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Order, KitchenOrder, OrderItemStatus } from '@/types/order.types';
import { OrderStatus } from '@/types/common.types';
import { orderService } from '@/services/orders/orderService';

export interface KitchenNotification {
  id: string;
  type: 'NEW_ORDER' | 'STATUS_UPDATE' | 'URGENT' | 'INFO';
  message: string;
  orderId?: string;
  timestamp: string;
  read: boolean;
}

export interface KitchenState {
  kitchenOrders: KitchenOrder[];
  activeOrders: KitchenOrder[];
  completedOrders: KitchenOrder[];
  selectedOrder: KitchenOrder | null;
  activeStation: string;
  notifications: KitchenNotification[];
  unreadNotifications: number;
  isLoading: boolean;
  error: string | null;
}

interface KitchenActions {
  // Kitchen order operations
  loadKitchenOrders: () => Promise<void>;
  selectKitchenOrder: (order: KitchenOrder | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => Promise<void>;
  markOrderReady: (orderId: string) => Promise<void>;
  
  // Station management
  setActiveStation: (station: string) => void;
  
  // Notifications
  addNotification: (notification: Omit<KitchenNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  // Error handling
  setError: (error: string) => void;
  clearError: () => void;
}

export interface KitchenContextValue extends KitchenState, KitchenActions {}

const KitchenContext = createContext<KitchenContextValue | undefined>(undefined);

type KitchenAction =
  | { type: 'LOAD_KITCHEN_ORDERS_START' }
  | { type: 'LOAD_KITCHEN_ORDERS_SUCCESS'; payload: { kitchenOrders: KitchenOrder[] } }
  | { type: 'LOAD_KITCHEN_ORDERS_ERROR'; payload: { error: string } }
  | { type: 'SELECT_KITCHEN_ORDER'; payload: { order: KitchenOrder | null } }
  | { type: 'UPDATE_KITCHEN_ORDER'; payload: { order: KitchenOrder } }
  | { type: 'SET_ACTIVE_STATION'; payload: { station: string } }
  | { type: 'ADD_NOTIFICATION'; payload: { notification: KitchenNotification } }
  | { type: 'MARK_NOTIFICATION_READ'; payload: { notificationId: string } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' };

const initialKitchenState: KitchenState = {
  kitchenOrders: [],
  activeOrders: [],
  completedOrders: [],
  selectedOrder: null,
  activeStation: 'ALL',
  notifications: [],
  unreadNotifications: 0,
  isLoading: false,
  error: null,
};

function categorizeOrders(orders: KitchenOrder[]) {
  const activeStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING];
  const active = orders.filter(order => activeStatuses.includes(order.items[0]?.status as OrderStatus || OrderStatus.PENDING));
  const completed = orders.filter(order => !activeStatuses.includes(order.items[0]?.status as OrderStatus || OrderStatus.PENDING));
  
  return { active, completed };
}

function kitchenReducer(state: KitchenState, action: KitchenAction): KitchenState {
  switch (action.type) {
    case 'LOAD_KITCHEN_ORDERS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'LOAD_KITCHEN_ORDERS_SUCCESS': {
      const { active, completed } = categorizeOrders(action.payload.kitchenOrders);
      return {
        ...state,
        kitchenOrders: action.payload.kitchenOrders,
        activeOrders: active,
        completedOrders: completed,
        isLoading: false,
        error: null,
      };
    }
    
    case 'LOAD_KITCHEN_ORDERS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    
    case 'SELECT_KITCHEN_ORDER':
      return {
        ...state,
        selectedOrder: action.payload.order,
      };
    
    case 'UPDATE_KITCHEN_ORDER': {
      const updatedOrders = state.kitchenOrders.map(order => 
        order.id === action.payload.order.id ? action.payload.order : order
      );
      const { active, completed } = categorizeOrders(updatedOrders);
      return {
        ...state,
        kitchenOrders: updatedOrders,
        activeOrders: active,
        completedOrders: completed,
        selectedOrder: state.selectedOrder?.id === action.payload.order.id 
          ? action.payload.order 
          : state.selectedOrder,
      };
    }
    
    case 'SET_ACTIVE_STATION':
      return {
        ...state,
        activeStation: action.payload.station,
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload.notification, ...state.notifications].slice(0, 50), // Keep only latest 50
        unreadNotifications: state.unreadNotifications + 1,
      };
    
    case 'MARK_NOTIFICATION_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.notificationId
          ? { ...notification, read: true }
          : notification
      );
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadNotifications: unreadCount,
      };
    }
    
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadNotifications: 0,
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadNotifications: 0,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

interface KitchenProviderProps {
  children: ReactNode;
}

export const KitchenProvider: React.FC<KitchenProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(kitchenReducer, initialKitchenState);
  // Use exported service instance to avoid DI registration issues
  const orderServiceInstance = orderService;
  
  const loadKitchenOrders = useCallback(async () => {
    try {
      dispatch({ type: 'LOAD_KITCHEN_ORDERS_START' });
      const orders = await orderServiceInstance.getCurrentOrders();
      
      // Convert orders to kitchen orders format
      const kitchenOrders: KitchenOrder[] = orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        table_number: order.table_id || 'N/A',
        items: order.items,
        created_at: order.created_at,
        estimated_prep_time: order.estimated_prep_time || 15,
        elapsed_time: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60)),
        priority: 'NORMAL',
        special_instructions: order.special_instructions,
        kitchen_notes: order.kitchen_notes,
      }));
      
      dispatch({ type: 'LOAD_KITCHEN_ORDERS_SUCCESS', payload: { kitchenOrders } });
    } catch (error) {
      dispatch({ type: 'LOAD_KITCHEN_ORDERS_ERROR', payload: { error: String(error) } });
    }
  }, [orderServiceInstance]);
  
  const selectKitchenOrder = useCallback((order: KitchenOrder | null) => {
    dispatch({ type: 'SELECT_KITCHEN_ORDER', payload: { order } });
  }, []);
  
  const setActiveStation = useCallback((station: string) => {
    dispatch({ type: 'SET_ACTIVE_STATION', payload: { station } });
  }, []);
  
  const addNotification = useCallback((notification: Omit<KitchenNotification, 'id' | 'timestamp' | 'read'>) => {
    const fullNotification: KitchenNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: { notification: fullNotification } });
  }, []);
  
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      await orderServiceInstance.updateOrderStatus(orderId, { status });
      await loadKitchenOrders(); // Refresh orders
      
      // Add notification
      addNotification({
        type: 'STATUS_UPDATE',
        message: `Order updated to ${status.toLowerCase()}`,
        orderId,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: `Failed to update order status: ${error}` } });
    }
  }, [orderServiceInstance, loadKitchenOrders, addNotification]);
  
  const updateItemStatus = useCallback(async (orderId: string, itemId: string, status: OrderItemStatus) => {
    try {
      // This would need to be implemented in OrderService
      console.log('Update order item status:', { orderId, itemId, status });
      
      // Add notification
      addNotification({
        type: 'INFO',
        message: `Item status updated to ${status}`,
        orderId,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: `Failed to update item status: ${error}` } });
    }
  }, [addNotification]);
  
  const markOrderReady = useCallback(async (orderId: string) => {
    await updateOrderStatus(orderId, OrderStatus.READY);
  }, [updateOrderStatus]);
  
  const markNotificationRead = useCallback((notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notificationId } });
  }, []);
  
  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);
  
  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);
  
  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { error } });
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);
  
  const contextValue: KitchenContextValue = {
    ...state,
    loadKitchenOrders,
    selectKitchenOrder,
    updateOrderStatus,
    updateItemStatus,
    markOrderReady,
    setActiveStation,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setError,
    clearError,
  };
  
  return (
    <KitchenContext.Provider value={contextValue}>
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = (): KitchenContextValue => {
  const context = useContext(KitchenContext);
  if (context === undefined) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};