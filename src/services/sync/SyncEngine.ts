/**
 * Sync Engine
 * Orchestrates push/pull sync intervals and WebSocket real-time updates
 */

import { syncQueueService } from '@/services/storage';
import { PullSyncService } from './PullSyncService';
import { WebSocketSyncManager } from './WebSocketSyncManager';
import { processOrderSync } from '@/services/sync/processors/OrderSyncProcessor';
import { processKitchenSync } from '@/services/sync/processors/KitchenSyncProcessor';
import { processPaymentSync } from '@/services/sync/processors/PaymentSyncProcessor';
import { SyncConfig, SyncResult } from './types';

class SyncEngine {
  private pushTimer: ReturnType<typeof setInterval> | null = null;
  private pullTimer: ReturnType<typeof setInterval> | null = null;
  private wsManager = new WebSocketSyncManager();
  private pullService = new PullSyncService();
  private isRunning = false;

  async start(config: SyncConfig): Promise<void> {
    if (this.isRunning) return;
    // Clear any stale timers before starting (defensive — prevents timer stacking)
    if (this.pushTimer) { clearInterval(this.pushTimer); this.pushTimer = null; }
    if (this.pullTimer) { clearInterval(this.pullTimer); this.pullTimer = null; }
    this.isRunning = true;

    const { restaurantId, pushIntervalMs, pullIntervalMs } = config;

    this.wsManager.connect(restaurantId);

    // Reset lastSync so initial full pull fetches ALL server data (not incremental)
    await syncQueueService.resetLastSyncTime();

    // Initial full sync on startup
    await this.fullSync(restaurantId);

    this.pushTimer = setInterval(() => {
      this.pushPending(restaurantId).catch((err) => {
        if (__DEV__) console.error('[SyncEngine] Push error:', err);
      });
    }, pushIntervalMs);

    this.pullTimer = setInterval(() => {
      this.pullAll(restaurantId).catch((err) => {
        if (__DEV__) console.error('[SyncEngine] Pull error:', err);
      });
    }, pullIntervalMs);

    if (__DEV__) console.log('[SyncEngine] Started for restaurant', restaurantId);
  }

  async stop(): Promise<void> {
    if (this.pushTimer) {
      clearInterval(this.pushTimer);
      this.pushTimer = null;
    }
    if (this.pullTimer) {
      clearInterval(this.pullTimer);
      this.pullTimer = null;
    }
    this.wsManager.disconnect();
    this.isRunning = false;

    if (__DEV__) console.log('[SyncEngine] Stopped');
  }

  async fullSync(restaurantId: string): Promise<SyncResult> {
    const errors: string[] = [];
    let pushed = 0;
    let pulled = 0;

    try {
      await this.pullAll(restaurantId);
      pulled = 4; // menu + tables + orders + customers
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Pull failed');
    }

    try {
      const result = await this.pushPending(restaurantId);
      pushed = result;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Push failed');
    }

    await syncQueueService.updateLastSyncTime();

    return { success: errors.length === 0, pushed, pulled, errors };
  }

  private async pullAll(restaurantId: string): Promise<void> {
    await Promise.allSettled([
      this.pullService.pullMenu(restaurantId),
      this.pullService.pullTablesAndAreas(restaurantId),
      this.pullService.pullOrders(restaurantId),
      this.pullService.pullCustomers(restaurantId),
    ]);
  }

  async pushPending(restaurantId: string): Promise<number> {
    const [orderResult, kitchenResult, paymentResult] = await Promise.allSettled([
      syncQueueService.processBatch(processOrderSync, 10, 'order'),
      syncQueueService.processBatch(processKitchenSync, 10, 'kitchen_ticket'),
      syncQueueService.processBatch(processPaymentSync, 10, 'payment'),
    ]);

    let total = 0;
    for (const r of [orderResult, kitchenResult, paymentResult]) {
      if (r.status === 'fulfilled') total += r.value.succeeded;
    }

    if (__DEV__) {
      if (total > 0) console.log(`[SyncEngine] Pushed ${total} items for restaurant ${restaurantId}`);
      else console.log('[SyncEngine] Push interval fired — queue empty');
    }
    return total;
  }
}

export const syncEngine = new SyncEngine();
