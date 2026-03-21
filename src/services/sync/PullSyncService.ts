/**
 * Pull Sync Service
 * Pulls changes from the backend and writes them into local SQLite storage
 */

import { apiClient } from '@/services/api/apiClient';
import {
  menuStorageService,
  tableStorageService,
  syncQueueService,
} from '@/services/storage';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { customerStorageService } from '@/services/storage/CustomerStorageService';
import { menuEventEmitter } from '@/services/menu/MenuEventEmitter';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';
import { mapServerOrderToUnified } from './mappers';
import { PullRequestBody, PullResponseData } from './types';

const PAGE_SIZE = 100;
const EPOCH = '1970-01-01T00:00:00.000Z';

export class PullSyncService {
  private async getLastSync(): Promise<string> {
    const ts = await syncQueueService.getLastSyncTime();
    return ts || EPOCH;
  }

  private buildBody(
    restaurantId: string,
    entityTypes: string[],
    lastSync: string
  ): PullRequestBody {
    return {
      restaurant_id: restaurantId,
      last_sync_timestamp: lastSync,
      entity_types: entityTypes,
      page_size: PAGE_SIZE,
    };
  }

  async pullMenu(restaurantId: string): Promise<void> {
    try {
      const lastSync = await this.getLastSync();
      const response = await apiClient.post<PullResponseData>(
        '/api/menu/sync/pull',
        this.buildBody(restaurantId, ['categories', 'menu_items', 'modifier_groups', 'combos'], lastSync),
        { silent: true } as any
      );

      const data = response.data?.data;
      if (!data) return;

      await this.applyMenuChanges(data);

      // Notify MenuContext to reload from SQLite
      menuEventEmitter.emitEvent('MENU_SYNC_COMPLETE', {});
    } catch (error) {
      if (__DEV__) {
        console.error('[PullSyncService] pullMenu failed:', error);
      }
    }
  }

  private async applyMenuChanges(data: Record<string, unknown>): Promise<void> {
    // Handle both flat array format (from /api/menu/sync/pull) and
    // diff format { created, updated, deleted } (from other sync endpoints)
    const toUpsert = (val: unknown): unknown[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      const v = val as { created?: unknown[]; updated?: unknown[] };
      return [...(v.created || []), ...(v.updated || [])];
    };
    const toDelete = (val: unknown): Array<{ id: string }> => {
      if (!val || Array.isArray(val)) return [];
      return (val as { deleted?: Array<{ id: string }> }).deleted || [];
    };

    const cats = data['categories'];
    if (cats) {
      for (const item of toUpsert(cats)) {
        await menuStorageService.addCategory(item as Parameters<typeof menuStorageService.addCategory>[0]);
      }
      for (const item of toDelete(cats)) {
        await menuStorageService.deleteCategory(item.id);
      }
    }

    const items = data['menu_items'];
    if (items) {
      for (const item of toUpsert(items)) {
        await menuStorageService.addMenuItem(item as Parameters<typeof menuStorageService.addMenuItem>[0]);
      }
      for (const item of toDelete(items)) {
        await menuStorageService.deleteMenuItem(item.id);
      }
    }

    const groups = data['modifier_groups'];
    if (groups) {
      for (const item of toUpsert(groups)) {
        await menuStorageService.addModifierGroup(item as Parameters<typeof menuStorageService.addModifierGroup>[0]);
      }
      for (const item of toDelete(groups)) {
        await menuStorageService.deleteModifierGroup(item.id);
      }
    }

    const combos = data['combos'] ?? data['combo_deals'];
    if (combos) {
      for (const item of toUpsert(combos)) {
        await menuStorageService.addCombo(item as Parameters<typeof menuStorageService.addCombo>[0]);
      }
      for (const item of toDelete(combos)) {
        await menuStorageService.deleteCombo(item.id);
      }
    }
  }

  async pullTablesAndAreas(restaurantId: string): Promise<void> {
    try {
      const lastSync = await this.getLastSync();
      const response = await apiClient.post<PullResponseData>(
        '/api/tables/sync/pull',
        this.buildBody(restaurantId, ['tables', 'table_areas'], lastSync),
        { silent: true } as any
      );

      // Tables sync endpoint wraps payload one level deeper than menu sync:
      // response.data = { success, message, data: { sync_timestamp, has_more, data: { table_areas, tables } } }
      const outerData = response.data?.data as Record<string, unknown> | undefined;
      const data = (outerData?.['data'] ?? outerData) as Record<string, unknown> | undefined;
      if (!data) return;

      const tables = data['tables'] as { created?: unknown[]; updated?: unknown[] } | undefined;
      if (tables) {
        for (const item of [...(tables.created || []), ...(tables.updated || [])]) {
          await tableStorageService.addTable(item as Parameters<typeof tableStorageService.addTable>[0]);
        }
      }

      const areas = data['table_areas'] as { created?: unknown[]; updated?: unknown[] } | undefined;
      if (areas) {
        for (const rawArea of [...(areas.created || []), ...(areas.updated || [])]) {
          const a = rawArea as Record<string, unknown>;
          await tableStorageService.addArea({
            id: String(a['id'] ?? ''),
            name: String(a['name'] ?? ''),
            icon: String(a['icon'] ?? ''),
            description: String(a['description'] ?? ''),
            isActive: Boolean(a['isActive'] ?? a['is_active'] ?? true),
            color: a['color'] ? String(a['color']) : undefined,
          });
        }
      }

      // Notify listeners that table data was updated
      orderEventEmitter.emit('TABLE_SYNC_COMPLETE', '', {});
    } catch (error) {
      if (__DEV__) {
        console.error('[PullSyncService] pullTablesAndAreas failed:', error);
      }
    }
  }

  async pullCustomers(restaurantId: string): Promise<void> {
    try {
      const response = await apiClient.get<any>(
        `/api/customers?restaurant_id=${restaurantId}`,
        { silent: true } as any
      );
      const data = response.data?.data ?? response.data;
      const customers: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.customers)
        ? data.customers
        : [];
      await customerStorageService.upsertAll(customers);
    } catch (error) {
      if (__DEV__) {
        console.error('[PullSyncService] pullCustomers failed:', error);
      }
    }
  }

  async pullOrders(restaurantId: string): Promise<void> {
    try {
      const lastSync = await this.getLastSync();
      const response = await apiClient.post<PullResponseData>(
        '/api/orders/sync/pull',
        this.buildBody(restaurantId, ['orders'], lastSync),
        { silent: true } as any
      );

      const outerData = response.data?.data as Record<string, unknown> | undefined;
      const data = (outerData?.['data'] ?? outerData) as Record<string, unknown> | undefined;
      if (!data) return;

      await this.applyOrderChanges(data);

      orderEventEmitter.emit('ORDER_SYNC_COMPLETE', '', {});
    } catch (error) {
      if (__DEV__) {
        console.error('[PullSyncService] pullOrders failed:', error);
      }
    }
  }

  private async applyOrderChanges(data: Record<string, unknown>): Promise<void> {
    const orders = data['orders'] as {
      created?: Record<string, unknown>[];
      updated?: Record<string, unknown>[];
      deleted?: Array<{ id: string }>;
    } | undefined;
    if (!orders) return;

    const toUpsert = [...(orders.created || []), ...(orders.updated || [])];

    for (const raw of toUpsert) {
      const mapped = mapServerOrderToUnified(raw);

      // Conflict resolution: local pending changes win if newer
      const local = await unifiedOrderStorageService.getOrder(mapped.id);
      if (local && local.pendingSync) {
        const localTime = new Date(local.updatedAt).getTime();
        const serverTime = new Date(mapped.updatedAt).getTime();
        if (localTime > serverTime) {
          continue; // local wins
        }
      }

      // Dedup: if a local order with the same order_number exists under a different ID
      // (e.g., local UUID vs server BigInt), remove the local duplicate before saving
      if (!local && mapped.orderNumber) {
        try {
          const allOrders = await unifiedOrderStorageService.getAllOrders();
          const localDup = allOrders.find(
            o => o.orderNumber === mapped.orderNumber && o.id !== mapped.id
          );
          if (localDup) {
            await unifiedOrderStorageService.deleteOrder(localDup.id);
          }
        } catch { /* ignore dedup errors */ }
      }

      await unifiedOrderStorageService.saveOrder(mapped);
    }

    for (const item of orders.deleted || []) {
      // Don't delete if local has pending changes
      const local = await unifiedOrderStorageService.getOrder(item.id);
      if (local?.pendingSync) continue;
      await unifiedOrderStorageService.deleteOrder(item.id);
    }
  }
}
