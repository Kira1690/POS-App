/**
 * Customer Sync Processor
 * Pushes unsynced customers to the backend via POST /api/customers/sync/push
 */

import { apiClient } from '@/services/api/apiClient';
import { SyncQueueItem } from '@/services/storage/SyncQueueService';
import { PushResponse } from '../types';

const DEVICE_ID = 'pos-mobile-device';

export async function processCustomerSync(item: SyncQueueItem): Promise<boolean> {
  try {
    const response = await apiClient.post<PushResponse>(
      '/api/customers/sync/push',
      {
        restaurant_id: (item.data.restaurant_id as string) || '1',
        device_id: DEVICE_ID,
        changes: [
          {
            local_id: item.entityId,
            entity_type: 'customers',
            action: item.operation,
            data: item.data,
            timestamp: item.createdAt,
          },
        ],
      },
      { silent: true } as Record<string, unknown>
    );

    if (response.data?.success) {
      if (__DEV__) {
        console.log('[CustomerSyncProcessor] Push succeeded for', item.entityId);
      }
      return true;
    }

    return false;
  } catch (error) {
    if (__DEV__) {
      console.error('[CustomerSyncProcessor] Push failed:', error);
    }
    return false;
  }
}
