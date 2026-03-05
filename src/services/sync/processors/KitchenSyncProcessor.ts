/**
 * Kitchen Sync Processor
 * Pushes unsynced kitchen tickets to the backend via POST /api/kitchen/sync/push
 */

import { apiClient } from '@/services/api/apiClient';
import { kitchenStorageService } from '@/services/storage';
import { SyncQueueItem } from '@/services/storage/SyncQueueService';
import { PushResponse } from '../types';

const DEVICE_ID = 'pos-mobile-device';

export async function processKitchenSync(item: SyncQueueItem): Promise<boolean> {
  try {
    const response = await apiClient.post<PushResponse>(
      '/api/kitchen/sync/push',
      {
        restaurant_id: (item.data.restaurant_id as string) || '1',
        device_id: DEVICE_ID,
        changes: [
          {
            local_id: item.entityId,
            entity_type: 'kitchen_tickets',
            action: item.operation,
            data: item.data,
            timestamp: item.createdAt,
          },
        ],
      },
      { silent: true } as any
    );

    if (response.data?.success) {
      await kitchenStorageService.markAsSynced([item.entityId]);
      return true;
    }

    return false;
  } catch (error) {
    if (__DEV__) {
      console.error('[KitchenSyncProcessor] Push failed:', error);
    }
    return false;
  }
}
