/**
 * WebSocket Sync Manager
 * Real-time WS connection to Core Service — routes incoming updates into SQLite
 */

import {
  menuStorageService,
  tableStorageService,
  kitchenStorageService,
} from '@/services/storage';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:5005';
const MAX_RECONNECT = 5;
const RECONNECT_DELAY_MS = 5000;

interface WsMessage {
  channel: string;
  event: string;
  data: Record<string, unknown>;
}

export class WebSocketSyncManager {
  private connection: WebSocket | null = null;
  private restaurantId: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(restaurantId: string): void {
    if (this.connection && this.restaurantId === restaurantId) return;
    this.disconnect();
    this.restaurantId = restaurantId;
    this.createConnection();
  }

  private createConnection(): void {
    if (!this.restaurantId) return;

    try {
      this.connection = new WebSocket(`${WS_URL}/ws`);

      this.connection.onopen = () => {
        if (__DEV__) console.log('[WSSyncManager] Connected');
        this.reconnectAttempts = 0;
        this.subscribe();
      };

      this.connection.onmessage = (event: MessageEvent) => {
        try {
          const msg: WsMessage = JSON.parse(event.data as string);
          this.handleMessage(msg);
        } catch {
          // ignore malformed messages
        }
      };

      this.connection.onerror = () => {
        if (__DEV__) console.error('[WSSyncManager] Connection error');
      };

      this.connection.onclose = () => {
        if (__DEV__) console.log('[WSSyncManager] Connection closed');
        this.connection = null;
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private subscribe(): void {
    if (!this.connection || this.connection.readyState !== WebSocket.OPEN) return;

    const channels = ['orders', 'tables', 'kitchen', 'menu', 'billing'];
    for (const channel of channels) {
      this.connection.send(JSON.stringify({ type: 'subscribe', channel, restaurant_id: this.restaurantId }));
    }
  }

  private handleMessage(msg: WsMessage): void {
    switch (msg.channel) {
      case 'menu':
        this.handleMenuUpdate(msg);
        break;
      case 'tables':
        this.handleTableUpdate(msg);
        break;
      case 'kitchen':
        this.handleKitchenUpdate(msg);
        break;
      default:
        break;
    }
  }

  private handleMenuUpdate(msg: WsMessage): void {
    const data = msg.data;
    if (!data?.id) return;

    if (msg.event === 'deleted') {
      menuStorageService.deleteMenuItem(data.id as string).catch(() => {});
    } else {
      menuStorageService.addMenuItem(data as Parameters<typeof menuStorageService.addMenuItem>[0]).catch(() => {});
    }
    // Data written to SQLite; UI picks up changes on next poll cycle
  }

  private handleTableUpdate(msg: WsMessage): void {
    const data = msg.data;
    if (!data?.id) return;

    tableStorageService
      .updateTable(data.id as string, data as Parameters<typeof tableStorageService.updateTable>[1])
      .catch(() => {});
    // Data written to SQLite; UI picks up changes on next poll cycle
  }

  private handleKitchenUpdate(msg: WsMessage): void {
    // Kitchen updates are handled via polling; WS provides a signal to refresh
    if (__DEV__) console.log('[WSSyncManager] Kitchen update received', msg.event);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT) {
      if (__DEV__) console.error('[WSSyncManager] Max reconnect attempts reached');
      return;
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.restaurantId) this.createConnection();
    }, RECONNECT_DELAY_MS);
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

  isConnected(): boolean {
    return this.connection?.readyState === WebSocket.OPEN;
  }
}
