/**
 * Table WebSocket Service - Real-time table updates
 * Under 150 lines, single responsibility for WebSocket operations
 */

import { ITableWebSocketService } from '@/interfaces';

export class TableWebSocketService implements ITableWebSocketService {
  private connection: WebSocket | null = null;
  private callbacks: Set<(update: any) => void> = new Set();
  private restaurantId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(restaurantId: string): void {
    if (this.connection && this.restaurantId === restaurantId) {
      return; // Already connected to this restaurant
    }

    this.disconnect(); // Clean up any existing connection
    this.restaurantId = restaurantId;
    this.createConnection();
  }

  private createConnection(): void {
    if (!this.restaurantId) return;

    try {
      const wsUrl = `${process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:4000'}/tables/${this.restaurantId}`;
      this.connection = new WebSocket(wsUrl);

      this.connection.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.connection.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          this.notifyCallbacks(update);
        } catch {
          // Ignore malformed messages
        }
      };

      this.connection.onerror = () => {
        // Silent — reconnect handles recovery
      };

      this.connection.onclose = () => {
        this.connection = null;
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (__DEV__) console.error('[TableWS] Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.restaurantId) {
        this.createConnection();
      }
    }, this.reconnectDelay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    this.restaurantId = null;
    this.reconnectAttempts = 0;
  }

  subscribe(callback: (update: any) => void): () => void {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  isConnected(): boolean {
    return this.connection?.readyState === WebSocket.OPEN;
  }

  private notifyCallbacks(update: unknown): void {
    this.callbacks.forEach(callback => {
      try {
        callback(update);
      } catch {
        // Silent — callback errors shouldn't crash WS service
      }
    });
  }
}