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
        if (__DEV__) {
          console.log(`[TableWS] Connected to restaurant ${this.restaurantId}`);
        }
        this.reconnectAttempts = 0;
      };

      this.connection.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          this.notifyCallbacks(update);
        } catch (error) {
          console.error('[TableWS] Failed to parse message:', error);
        }
      };

      this.connection.onerror = (error) => {
        console.error('[TableWS] Connection error:', error);
      };

      this.connection.onclose = () => {
        if (__DEV__) {
          console.log('[TableWS] Connection closed');
        }
        this.connection = null;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[TableWS] Failed to create connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[TableWS] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      if (this.restaurantId) {
        if (__DEV__) {
          console.log(`[TableWS] Reconnection attempt ${this.reconnectAttempts}`);
        }
        this.createConnection();
      }
    }, this.reconnectDelay);
  }

  disconnect(): void {
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

  private notifyCallbacks(update: any): void {
    this.callbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('[TableWS] Callback error:', error);
      }
    });
  }
}