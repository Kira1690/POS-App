/**
 * Order Sync Processor
 * Pushes unsynced orders to the backend via POST /api/orders/sync/push
 */

import { apiClient } from '@/services/api/apiClient';
import { unifiedOrderStorageService } from '@/services/storage';
import { SyncQueueItem, syncQueueService } from '@/services/storage/SyncQueueService';
import { PushResponse } from '../types';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';

const DEVICE_ID = 'pos-mobile-device';

export async function processOrderSync(item: SyncQueueItem): Promise<boolean> {
  try {
    // Map SQLite field names to Prisma/API field names before pushing
    const rawData = item.data as Record<string, unknown>;
    const mappedData: Record<string, unknown> = { ...rawData };

    // created_by (SQLite) → user_id (Prisma); Core serializer handles UUID strings
    if (rawData.created_by !== undefined) {
      mappedData.user_id = rawData.created_by;
      delete mappedData.created_by;
    }
    // served_by (SQLite) → server_id (Prisma)
    if (rawData.served_by !== undefined) {
      mappedData.server_id = rawData.served_by;
      delete mappedData.served_by;
    }
    // payment_status is not in the Prisma orders model — strip to avoid DB errors
    delete mappedData.payment_status;

    // Map order_items[].item_status → status (OrderItemStatus enum)
    if (Array.isArray(mappedData.order_items)) {
      mappedData.order_items = (mappedData.order_items as Array<Record<string, unknown>>).map((oi) => {
        const mapped = { ...oi };
        if (oi.item_status !== undefined) {
          mapped.status = oi.item_status;
          delete mapped.item_status;
        }
        return mapped;
      });
    }

    const response = await apiClient.post<PushResponse>(
      '/api/orders/sync/push',
      {
        restaurant_id: (item.data.restaurant_id as string) || '1',
        device_id: DEVICE_ID,
        changes: [
          {
            local_id: item.entityId,
            entity_type: 'orders',
            action: item.operation,
            data: mappedData,
            timestamp: item.createdAt,
          },
        ],
      },
      { silent: true } as any
    );

    if (response.data?.success) {
      // Check individual result status — don't mark as synced if conflict
      const results = (response.data as unknown as { data?: { results?: Array<{ status?: string; error?: string; server_id?: string }> } })?.data?.results;
      const result = results?.[0];
      if (result?.status === 'conflict') {
        if (__DEV__) console.warn('[OrderSyncProcessor] Push returned conflict:', result.error);
        return false;
      }

      // After a successful CREATE, remap local ID → server ID so subsequent
      // UPDATE pushes use the numeric server ID (fixes BigInt parse failures)
      const serverId = result?.server_id;
      if (item.operation === 'create' && serverId && serverId !== item.entityId) {
        await unifiedOrderStorageService.remapOrderId(item.entityId, serverId);
        await syncQueueService.remapEntityId('order', item.entityId, serverId);
        // Notify context to reload orders with the new IDs
        orderEventEmitter.emit('ORDER_ID_REMAPPED', item.entityId, {
          localId: item.entityId,
          serverId,
        });
        if (__DEV__) console.log(`[OrderSyncProcessor] Remapped ${item.entityId} → ${serverId}`);
      } else {
        await unifiedOrderStorageService.markAsSynced([item.entityId]);
      }
      return true;
    }

    return false;
  } catch (error) {
    if (__DEV__) {
      console.error('[OrderSyncProcessor] Push failed:', error);
    }
    return false;
  }
}
