/**
 * WebSocket Sync Manager
 * Real-time WS connection to Core Service — routes incoming updates into SQLite
 */

import {
  menuStorageService,
  tableStorageService,
  kitchenStorageService,
} from '@/services/storage';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';
import { menuEventEmitter } from '@/services/menu/MenuEventEmitter';
import { mapServerOrderToUnified, mapServerTicketToKitchenTicket } from './mappers';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:5005';
const MAX_RECONNECT = 5;
const RECONNECT_DELAY_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_TIMEOUT_MS = 30_000;

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
  private onReconnectCallback: (() => void) | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastMessageAt = 0;

  /** Register callback to trigger full pull sync on WS reconnection */
  onReconnect(callback: () => void): void {
    this.onReconnectCallback = callback;
  }

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
        const wasReconnect = this.reconnectAttempts > 0;
        if (__DEV__) console.log(`[WSSyncManager] Connected${wasReconnect ? ' (reconnect — triggering full sync)' : ''}`);
        this.reconnectAttempts = 0;
        this.lastMessageAt = Date.now();
        this.startHeartbeat();
        this.subscribe();
        // On reconnect, emit event so SyncEngine can trigger immediate full pull
        if (wasReconnect && this.onReconnectCallback) {
          this.onReconnectCallback();
        }
      };

      this.connection.onmessage = (event: MessageEvent) => {
        this.lastMessageAt = Date.now();
        try {
          const msg: WsMessage = JSON.parse(event.data as string);
          if (msg.channel === 'pong') return; // heartbeat response
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
      case 'orders':
        this.handleOrderUpdate(msg);
        break;
      case 'kitchen':
        this.handleKitchenUpdate(msg);
        break;
      case 'billing':
        this.handleBillingUpdate(msg);
        break;
      default:
        break;
    }
  }

  private handleMenuUpdate(msg: WsMessage): void {
    const data = msg.data;

    // For individual item updates with full data, write directly to SQLite
    if (data?.id && data?.name) {
      if (msg.event === 'deleted') {
        menuStorageService.deleteMenuItem(data.id as string).catch(() => {});
      } else {
        menuStorageService.addMenuItem(data as Parameters<typeof menuStorageService.addMenuItem>[0]).catch(() => {});
      }
    }

    // Emit MENU_SYNC_COMPLETE to trigger UI refresh from SQLite
    // For broadcast-style events (from web dashboard), this triggers the menu context
    // to reload, and the next pull cycle (30s) will fetch the actual data
    menuEventEmitter.emitEvent('MENU_SYNC_COMPLETE', {});
  }

  private handleTableUpdate(msg: WsMessage): void {
    const data = msg.data;
    if (!data?.id) return;

    tableStorageService
      .updateTable(data.id as string, data as Parameters<typeof tableStorageService.updateTable>[1])
      .catch(() => {});
    // Data written to SQLite; UI picks up changes on next poll cycle
  }

  private handleOrderUpdate(msg: WsMessage): void {
    // WS broadcasts contain minimal data (id, status, total_amount).
    // Instead of saving incomplete data, just emit an event to trigger
    // the UnifiedOrderContext to reload orders from the full pull sync.
    // This ensures the UI always has complete order data.
    const eventType = msg.event === 'created' ? 'ORDER_CREATED'
      : msg.event === 'status_changed' ? 'ORDER_STATUS_CHANGED'
      : 'ORDER_SYNC_COMPLETE';
    orderEventEmitter.emit(eventType, msg.data?.id || '', msg.data || {});
  }

  private handleKitchenUpdate(msg: WsMessage): void {
    const data = msg.data;
    if (!data?.id) return;

    const mapped = mapServerTicketToKitchenTicket(data);

    if (msg.event === 'status_changed') {
      kitchenStorageService
        .updateTicket(mapped.id, {
          status: mapped.status,
          completedItemCount: mapped.completedItemCount,
          startedAt: mapped.startedAt,
          completedAt: mapped.completedAt,
          servedAt: mapped.servedAt,
          actualPrepTime: mapped.actualPrepTime,
          pendingSync: false,
          syncedAt: new Date().toISOString(),
        })
        .catch(() => {});
    } else {
      kitchenStorageService.saveTicket(mapped).catch(() => {});
    }
  }

  private handleBillingUpdate(msg: WsMessage): void {
    const data = msg.data;
    if (!data) return;

    // When a payment completes a transaction, update the associated order's payment status
    if (data.order_id && (data.status === 'completed' || msg.event === 'payment_created')) {
      const orderId = String(data.order_id);
      unifiedOrderStorageService
        .updateOrder(orderId, {
          paymentStatus: data.status === 'completed' ? 'paid' : 'partial',
          paidAt: data.status === 'completed' ? new Date().toISOString() : undefined,
          pendingSync: false,
          syncedAt: new Date().toISOString(),
        })
        .then((result) => {
          if (result) {
            orderEventEmitter.emit('ORDER_STATUS_CHANGED', orderId, { paymentStatus: 'paid' });
          }
        })
        .catch(() => {});
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.connection?.readyState === WebSocket.OPEN) {
        this.connection.send(JSON.stringify({ type: 'ping' }));
      }
      // If no message received in 30s, force reconnect
      if (Date.now() - this.lastMessageAt > HEARTBEAT_TIMEOUT_MS) {
        if (__DEV__) console.log('[WSSyncManager] Heartbeat timeout — forcing reconnect');
        this.stopHeartbeat();
        this.connection?.close();
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
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
    this.stopHeartbeat();
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
