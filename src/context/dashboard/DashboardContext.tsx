/**
 * Dashboard Context Provider - Centralized dashboard state management
 * Handles real-time data for Manager, Staff, and Kitchen dashboards
 * Under 300 lines, focused on state management and data orchestration
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { UserRole } from '@/types/auth.types';
import { useAuth } from '@/context/auth/AuthContext';

// Dashboard Types
export interface DashboardStats {
  todaysSales: {
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  activeOrders: {
    value: string;
    breakdown: string;
    count: number;
  };
  tableOccupancy: {
    value: string;
    percentage: string;
    occupied: number;
    total: number;
  };
  staffOnDuty: {
    value: string;
    breakdown: string;
    count: number;
  };
}

export interface OrderItem {
  id: string;
  table: string;
  amount: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  statusColor: string;
  items?: string[];
  prepTime?: number;
  timestamp: Date;
}

export interface StaffMetrics {
  shift: {
    startTime: string;
    duration: string;
    scheduledEnd: string;
    status: 'active' | 'break' | 'ended';
  };
  myOrders: {
    count: number;
    totalValue: string;
    averageOrder: string;
  };
  assignedTables: {
    tables: number[];
    occupied: number;
    available: number;
  };
  performance: {
    rating: string;
    status: 'excellent' | 'good' | 'average' | 'needs_improvement';
  };
}

export interface TaskItem {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  color: string;
  bgColor: string;
  timestamp: Date;
  assignedTo?: string;
}

export interface KitchenData {
  stations: Array<{
    name: string;
    count: number;
    color: string;
    emoji: string;
    status: 'normal' | 'busy' | 'critical';
  }>;
  priorityOrders: Array<{
    id: string;
    type: string;
    timeInfo: string;
    items: string[];
    urgency: 'critical' | 'high' | 'medium';
    color: string;
    bgColor: string;
  }>;
  activeOrders: OrderItem[];
  averagePrepTime: number;
  efficiency: number;
}

export interface DashboardState {
  // Common data
  stats: DashboardStats;
  recentOrders: OrderItem[];
  notifications: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Role-specific data
  staffMetrics: StaffMetrics | null;
  tasks: TaskItem[];
  kitchenData: KitchenData | null;
  
  // Real-time connection status
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
}

interface DashboardContextValue {
  state: DashboardState;
  actions: {
    refreshDashboard: () => Promise<void>;
    markTaskComplete: (taskId: string) => void;
    updateOrderStatus: (orderId: string, status: OrderItem['status']) => void;
    acknowledgeNotification: (notificationId: string) => void;
    connectRealTime: () => void;
    disconnectRealTime: () => void;
  };
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_STATS'; payload: Partial<DashboardStats> }
  | { type: 'UPDATE_ORDERS'; payload: OrderItem[] }
  | { type: 'UPDATE_STAFF_METRICS'; payload: StaffMetrics }
  | { type: 'UPDATE_TASKS'; payload: TaskItem[] }
  | { type: 'UPDATE_KITCHEN_DATA'; payload: KitchenData }
  | { type: 'SET_CONNECTION_STATUS'; payload: DashboardState['connectionStatus'] }
  | { type: 'MARK_TASK_COMPLETE'; payload: string }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderItem['status'] } }
  | { type: 'SET_NOTIFICATIONS'; payload: number }
  | { type: 'REFRESH_TIMESTAMP' };

// Initial state
const initialState: DashboardState = {
  stats: {
    todaysSales: { value: '$0.00', change: '0%', trend: 'neutral' },
    activeOrders: { value: '0', breakdown: '0 Orders', count: 0 },
    tableOccupancy: { value: '0/0', percentage: '0%', occupied: 0, total: 0 },
    staffOnDuty: { value: '0', breakdown: 'No staff', count: 0 },
  },
  recentOrders: [],
  notifications: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
  staffMetrics: null,
  tasks: [],
  kitchenData: null,
  connectionStatus: 'disconnected',
};

// Reducer
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'UPDATE_STATS':
      return { 
        ...state, 
        stats: { ...state.stats, ...action.payload },
        lastUpdated: new Date(),
        error: null 
      };
    
    case 'UPDATE_ORDERS':
      return { 
        ...state, 
        recentOrders: action.payload,
        lastUpdated: new Date() 
      };
    
    case 'UPDATE_STAFF_METRICS':
      return { 
        ...state, 
        staffMetrics: action.payload,
        lastUpdated: new Date() 
      };
    
    case 'UPDATE_TASKS':
      return { 
        ...state, 
        tasks: action.payload,
        lastUpdated: new Date() 
      };
    
    case 'UPDATE_KITCHEN_DATA':
      return { 
        ...state, 
        kitchenData: action.payload,
        lastUpdated: new Date() 
      };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'MARK_TASK_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        recentOrders: state.recentOrders.map(order => 
          order.id === action.payload.orderId 
            ? { ...order, status: action.payload.status }
            : order
        )
      };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'REFRESH_TIMESTAMP':
      return { ...state, lastUpdated: new Date() };
    
    default:
      return state;
  }
}

// Context
const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

// Provider Props
interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { state: authState } = useAuth();

  // Mock data based on role - will be replaced with real API calls
  const loadDashboardData = useCallback(async (userRole: UserRole) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock stats data
      const mockStats: DashboardStats = {
        todaysSales: { value: '$2,847.50', change: '+12.5%', trend: 'up' },
        activeOrders: { value: '23', breakdown: '12 Dine-in | 8 Takeaway | 3 Delivery', count: 23 },
        tableOccupancy: { value: '16/25', percentage: '64% occupancy rate', occupied: 16, total: 25 },
        staffOnDuty: { value: '8', breakdown: '5 Servers | 2 Kitchen | 1 Manager', count: 8 },
      };
      
      const mockOrders: OrderItem[] = [
        { id: '1', table: 'Table 12', amount: '$45.50', status: 'preparing', statusColor: '#ffc107', timestamp: new Date() },
        { id: '2', table: 'Takeaway', amount: '$28.75', status: 'ready', statusColor: '#28a745', timestamp: new Date() },
        { id: '3', table: 'Table 8', amount: '$67.25', status: 'pending', statusColor: '#dc3545', timestamp: new Date() },
      ];

      dispatch({ type: 'UPDATE_STATS', payload: mockStats });
      dispatch({ type: 'UPDATE_ORDERS', payload: mockOrders });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: 5 });

      // Role-specific data
      if (userRole === UserRole.WAITER) {
        const staffMetrics: StaffMetrics = {
          shift: { startTime: '9:00 AM', duration: '5h 30m', scheduledEnd: '6:00 PM', status: 'active' },
          myOrders: { count: 18, totalValue: '$456.75', averageOrder: '$25.38' },
          assignedTables: { tables: [1, 3, 5, 7, 9, 11, 13, 15], occupied: 5, available: 3 },
          performance: { rating: '4.8/5.0', status: 'excellent' },
        };
        
        const tasks: TaskItem[] = [
          { 
            id: '1', priority: 'urgent', 
            message: 'Table 7 - Order #1234 ready for pickup from kitchen',
            color: '#dc3545', bgColor: '#f8d7da', timestamp: new Date() 
          },
        ];

        dispatch({ type: 'UPDATE_STAFF_METRICS', payload: staffMetrics });
        dispatch({ type: 'UPDATE_TASKS', payload: tasks });
      }

      if (userRole === UserRole.KITCHEN_STAFF) {
        const kitchenData: KitchenData = {
          stations: [
            { name: 'APPETIZERS', count: 3, color: '#28a745', emoji: '🥗', status: 'normal' },
            { name: 'MAIN COURSE', count: 7, color: '#dc3545', emoji: '🍖', status: 'busy' },
          ],
          priorityOrders: [],
          activeOrders: mockOrders,
          averagePrepTime: 18,
          efficiency: 87,
        };

        dispatch({ type: 'UPDATE_KITCHEN_DATA', payload: kitchenData });
      }
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load data when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role) {
      loadDashboardData(authState.user.role);
    }
  }, [authState.isAuthenticated, authState.user?.role, loadDashboardData]);

  // Real-time connection management — track interval ref so disconnect cleans it up
  const realTimeIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const connectRealTime = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });

    setTimeout(() => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
    }, 1000);

    // Clear any previous leaked interval before starting a new one
    if (realTimeIntervalRef.current) clearInterval(realTimeIntervalRef.current);
    realTimeIntervalRef.current = setInterval(() => {
      dispatch({ type: 'REFRESH_TIMESTAMP' });
    }, 30000);
  }, []);

  const disconnectRealTime = useCallback(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
      realTimeIntervalRef.current = null;
    }
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (realTimeIntervalRef.current) clearInterval(realTimeIntervalRef.current);
    };
  }, []);

  // Actions — memoized to stabilize context value
  const actions = useMemo(() => ({
    refreshDashboard: () => loadDashboardData(authState.user?.role || UserRole.WAITER),
    markTaskComplete: (taskId: string) => dispatch({ type: 'MARK_TASK_COMPLETE', payload: taskId }),
    updateOrderStatus: (orderId: string, status: OrderItem['status']) =>
      dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } }),
    acknowledgeNotification: (_notificationId: string) => {
      // no-op until notification service is wired
    },
    connectRealTime,
    disconnectRealTime,
  }), [loadDashboardData, authState.user?.role, connectRealTime, disconnectRealTime]);

  const value: DashboardContextValue = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook to use dashboard context
export const useDashboard = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;