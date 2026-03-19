/**
 * Dashboard WebSocket Service - Real-time data updates for dashboards
 * Under 300 lines, focused on WebSocket connection and message handling
 */

import { UserRole } from '@/types/auth.types';
import { DashboardStats, OrderItem, StaffMetrics, KitchenData, TaskItem } from '@/context/dashboard/DashboardContext';

export interface WebSocketMessage {
  type: 'stats_update' | 'order_update' | 'staff_update' | 'kitchen_update' | 'task_update' | 'notification';
  payload: any;
  timestamp: string;
  restaurantId?: string;
  userId?: string;
}

export interface DashboardWebSocketConfig {
  url: string;
  restaurantId: string;
  userId: string;
  userRole: UserRole;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface DashboardWebSocketCallbacks {
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onStatsUpdate?: (stats: Partial<DashboardStats>) => void;
  onOrderUpdate?: (orders: OrderItem[]) => void;
  onStaffUpdate?: (metrics: StaffMetrics) => void;
  onKitchenUpdate?: (data: KitchenData) => void;
  onTaskUpdate?: (tasks: TaskItem[]) => void;
  onNotification?: (notification: any) => void;
  onError?: (error: string) => void;
}

export class DashboardWebSocketService {
  private ws: WebSocket | null = null;
  private config: DashboardWebSocketConfig;
  private callbacks: DashboardWebSocketCallbacks;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private mockDataTimer: ReturnType<typeof setInterval> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private isManuallyDisconnected = false;

  constructor(config: DashboardWebSocketConfig, callbacks: DashboardWebSocketCallbacks) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...config,
    };
    this.callbacks = callbacks;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.isManuallyDisconnected = false;
      this.callbacks.onConnectionStatusChange?.('connecting');

      try {
        // In a real implementation, this would connect to your WebSocket server
        // For now, we'll simulate a connection
        this.simulateWebSocketConnection();
        resolve();
      } catch (error) {
        this.callbacks.onConnectionStatusChange?.('error');
        this.callbacks.onError?.('Failed to establish WebSocket connection');
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.clearTimers();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.callbacks.onConnectionStatusChange?.('disconnected');
  }

  sendMessage(message: Partial<WebSocketMessage>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const fullMessage: WebSocketMessage = {
      type: message.type || 'notification',
      payload: message.payload || {},
      timestamp: new Date().toISOString(),
      restaurantId: this.config.restaurantId,
      userId: this.config.userId,
      ...message,
    };

    this.ws.send(JSON.stringify(fullMessage));
  }

  // Mock WebSocket implementation for development
  private simulateWebSocketConnection(): void {
    // Clear any previous timers before creating new ones
    this.clearTimers();

    // Simulate connection delay
    this.connectTimer = setTimeout(() => {
      this.callbacks.onConnectionStatusChange?.('connected');
      this.reconnectAttempts = 0;

      // Start heartbeat simulation
      this.startHeartbeat();

      // Simulate receiving periodic updates
      this.startMockDataUpdates();

    }, 1000);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.isManuallyDisconnected) return;
      // Heartbeat ping — silent (no console.log to avoid JS bridge flooding)
    }, 30000);
  }

  private startMockDataUpdates(): void {
    if (this.mockDataTimer) clearInterval(this.mockDataTimer);
    this.mockDataTimer = setInterval(() => {
      if (this.isManuallyDisconnected) {
        this.clearTimers();
        return;
      }
      this.simulateDataUpdate();
    }, 10000);
  }

  private simulateDataUpdate(): void {
    const { userRole } = this.config;
    
    // Simulate different types of updates based on role
    switch (userRole) {
      case UserRole.MANAGER:
      case UserRole.STORE_ADMIN:
      case UserRole.SUPER_ADMIN:
      case UserRole.SYSTEM_ADMIN:
        this.simulateManagerUpdates();
        break;
        
      case UserRole.WAITER:
      case UserRole.CASHIER:
        this.simulateStaffUpdates();
        break;
        
      case UserRole.KITCHEN_STAFF:
        this.simulateKitchenUpdates();
        break;
    }
  }

  private simulateManagerUpdates(): void {
    // Mock stats update
    const statsUpdate: Partial<DashboardStats> = {
      todaysSales: {
        value: `$${(Math.random() * 1000 + 2000).toFixed(2)}`,
        change: `${(Math.random() * 20 - 10).toFixed(1)}%`,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      activeOrders: {
        value: Math.floor(Math.random() * 10 + 20).toString(),
        breakdown: 'Updated orders breakdown',
        count: Math.floor(Math.random() * 10 + 20)
      }
    };
    
    this.callbacks.onStatsUpdate?.(statsUpdate);

    // Mock order updates
    const orderUpdate: OrderItem[] = [
      {
        id: '1',
        table: 'Table 12',
        amount: '$45.50',
        status: Math.random() > 0.5 ? 'ready' : 'preparing',
        statusColor: Math.random() > 0.5 ? '#28a745' : '#ffc107',
        timestamp: new Date()
      }
    ];
    
    this.callbacks.onOrderUpdate?.(orderUpdate);
  }

  private simulateStaffUpdates(): void {
    // Mock staff metrics update
    const staffUpdate: StaffMetrics = {
      shift: {
        startTime: '9:00 AM',
        duration: `${Math.floor(Math.random() * 2 + 5)}h ${Math.floor(Math.random() * 60)}m`,
        scheduledEnd: '6:00 PM',
        status: 'active'
      },
      myOrders: {
        count: Math.floor(Math.random() * 10 + 15),
        totalValue: `$${(Math.random() * 200 + 400).toFixed(2)}`,
        averageOrder: `$${(Math.random() * 10 + 20).toFixed(2)}`
      },
      assignedTables: {
        tables: [1, 3, 5, 7, 9, 11, 13, 15],
        occupied: Math.floor(Math.random() * 5 + 3),
        available: Math.floor(Math.random() * 3 + 2)
      },
      performance: {
        rating: '4.8/5.0',
        status: 'excellent'
      }
    };
    
    this.callbacks.onStaffUpdate?.(staffUpdate);

    // Mock task updates
    const taskUpdates: TaskItem[] = [
      {
        id: Math.random().toString(),
        priority: Math.random() > 0.7 ? 'urgent' : 'medium',
        message: 'New task from kitchen - Order ready for pickup',
        color: '#dc3545',
        bgColor: '#f8d7da',
        timestamp: new Date()
      }
    ];
    
    this.callbacks.onTaskUpdate?.(taskUpdates);
  }

  private simulateKitchenUpdates(): void {
    // Mock kitchen data update
    const kitchenUpdate: KitchenData = {
      stations: [
        {
          name: 'APPETIZERS',
          count: Math.floor(Math.random() * 5 + 2),
          color: '#28a745',
          emoji: '🥗',
          status: 'normal'
        },
        {
          name: 'MAIN COURSE',
          count: Math.floor(Math.random() * 8 + 5),
          color: '#dc3545',
          emoji: '🍖',
          status: 'busy'
        }
      ],
      priorityOrders: [],
      activeOrders: [],
      averagePrepTime: Math.floor(Math.random() * 10 + 15),
      efficiency: Math.floor(Math.random() * 20 + 80)
    };
    
    this.callbacks.onKitchenUpdate?.(kitchenUpdate);
  }

  private handleReconnect(): void {
    if (this.isManuallyDisconnected || !this.config.maxReconnectAttempts) return;
    
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.callbacks.onConnectionStatusChange?.('error');
      this.callbacks.onError?.('Maximum reconnection attempts exceeded');
      return;
    }

    this.reconnectAttempts++;
    this.callbacks.onConnectionStatusChange?.('connecting');
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        this.handleReconnect();
      });
    }, this.config.reconnectInterval);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.mockDataTimer) {
      clearInterval(this.mockDataTimer);
      this.mockDataTimer = null;
    }
  }

  // Public method to check connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Public method to get current connection status
  getConnectionStatus(): ConnectionStatus {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'error';
    }
  }
}