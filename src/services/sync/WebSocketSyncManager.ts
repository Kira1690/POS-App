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
import { mapServerOrderToUnified, mapServerTicketToKitchenTicket } from './mappers';

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
      case 'orders':
        this.handleOrderUpdate(msg);
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

  private handleOrderUpdate(msg: WsMessage): void {
    const data = msg.data;
    if (!data?.id) return;

    const mapped = mapServerOrderToUnified(data);

    if (msg.event === 'status_changed') {
      unifiedOrderStorageService
        .updateOrder(mapped.id, {
          status: mapped.status,
          paymentStatus: mapped.paymentStatus,
          preparingAt: mapped.preparingAt,
          readyAt: mapped.readyAt,
          servedAt: mapped.servedAt,
          paidAt: mapped.paidAt,
          cancelledAt: mapped.cancelledAt,
          pendingSync: false,
          syncedAt: new Date().toISOString(),
          updatedAt: mapped.updatedAt,
        })
        .then(async (result) => {
          if (result) {
            // Order existed locally — partial update applied
            orderEventEmitter.emit('ORDER_STATUS_CHANGED', mapped.id, { status: mapped.status });
          } else {
            // Order doesn't exist locally yet — save the full mapped order
            await unifiedOrderStorageService.saveOrder(mapped);
            orderEventEmitter.emit('ORDER_CREATED', mapped.id, {});
          }
        })
        .catch(() => {});
    } else {
      unifiedOrderStorageService
        .saveOrder(mapped)
        .then(() => {
          const event = msg.event === 'created' ? 'ORDER_CREATED' : 'ORDER_SYNC_COMPLETE';
          orderEventEmitter.emit(event, mapped.id, {});
        })
        .catch(() => {});
    }
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
