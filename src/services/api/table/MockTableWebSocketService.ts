/**
 * Mock Table WebSocket Service - For UI-only development
 * Simulates real-time updates without actual WebSocket connection
 */

import { ITableWebSocketService } from '@/interfaces';

export class MockTableWebSocketService implements ITableWebSocketService {
  private callbacks: Set<(update: any) => void> = new Set();
  private restaurantId: string | null = null;
  private _isConnected: boolean = false;
  private simulationInterval: ReturnType<typeof setInterval> | null = null;

  connect(restaurantId: string): void {
    if (this._isConnected && this.restaurantId === restaurantId) {
      return; // Already connected to this restaurant
    }

    this.disconnect(); // Clean up any existing connection
    this.restaurantId = restaurantId;
    this._isConnected = true;
    
    if (__DEV__) {
      console.log(`[MockTableWS] Connected to restaurant ${restaurantId}`);
    }

    // Start simulating random table updates every 10 seconds
    this.startSimulation();
  }

  private startSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    // Simulate table updates every 10 seconds for demo purposes
    this.simulationInterval = setInterval(() => {
      if (this._isConnected && this.callbacks.size > 0) {
        this.simulateTableUpdate();
      }
    }, 10000);
  }

  private simulateTableUpdate(): void {
    const tableStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
    const randomTableNumber = Math.floor(Math.random() * 25) + 1;
    const randomStatus = tableStatuses[Math.floor(Math.random() * tableStatuses.length)];
    
    const mockUpdate = {
      type: 'table_update',
      table: {
        id: `table_${randomTableNumber}`,
        table_number: `Table${randomTableNumber}`,
        status: randomStatus,
        updated_at: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
      console.log('[MockTableWS] Simulating table update:', mockUpdate);
    }

    this.notifyCallbacks(mockUpdate);
  }

  disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    this._isConnected = false;
    this.restaurantId = null;
    
    if (__DEV__) {
      console.log('[MockTableWS] Disconnected');
    }
  }

  subscribe(callback: (update: any) => void): () => void {
    this.callbacks.add(callback);
    
    if (__DEV__) {
      console.log('[MockTableWS] Added subscriber, total:', this.callbacks.size);
    }
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
      if (__DEV__) {
        console.log('[MockTableWS] Removed subscriber, total:', this.callbacks.size);
      }
    };
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  private notifyCallbacks(update: any): void {
    this.callbacks.forEach(callback => {
      try {
        callback(update);
      } catch { /* silent */ }
    });
  }

  // Additional methods for testing
  simulateTableStatusChange(tableId: string, status: string): void {
    if (!this._isConnected) return;

    const mockUpdate = {
      type: 'table_update',
      table: {
        id: tableId,
        status,
        updated_at: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    this.notifyCallbacks(mockUpdate);
  }

  simulateOrderUpdate(tableId: string, orderId: string): void {
    if (!this._isConnected) return;

    const mockUpdate = {
      type: 'order_update',
      table_id: tableId,
      order: {
        id: orderId,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    this.notifyCallbacks(mockUpdate);
  }
}