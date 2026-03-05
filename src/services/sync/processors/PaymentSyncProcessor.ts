/**
 * Payment Sync Processor
 * Pushes unsynced payments to the backend via POST /api/billing/sync/push
 */

import { apiClient } from '@/services/api/apiClient';
import { paymentStorageService } from '@/services/storage';
import { SyncQueueItem } from '@/services/storage/SyncQueueService';
import { PushResponse } from '../types';

const DEVICE_ID = 'pos-mobile-device';

export async function processPaymentSync(item: SyncQueueItem): Promise<boolean> {
  try {
    const response = await apiClient.post<PushResponse>(
      '/api/billing/sync/push',
      {
        restaurant_id: (item.data.restaurant_id as string) || '1',
        device_id: DEVICE_ID,
        changes: [
          {
            local_id: item.entityId,
            entity_type: 'payment_records',
            action: item.operation,
            data: item.data,
            timestamp: item.createdAt,
          },
        ],
      },
      { silent: true } as any
    );

    if (response.data?.success) {
      await paymentStorageService.markAsSynced([item.entityId]);
      return true;
    }

    return false;
  } catch (error) {
    if (__DEV__) {
      console.error('[PaymentSyncProcessor] Push failed:', error);
    }
    return false;
  }
}
