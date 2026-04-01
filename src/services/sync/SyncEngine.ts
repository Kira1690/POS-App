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
import { processCustomerSync } from '@/services/sync/processors/CustomerSyncProcessor';
import { SyncConfig, SyncResult } from './types';

class SyncEngine {
  private mainTimer: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private wsManager = new WebSocketSyncManager();
  private pullService = new PullSyncService();
  private isRunning = false;

  async start(config: SyncConfig): Promise<void> {
    if (this.isRunning) return;
    // Clear any stale timer before starting (defensive — prevents timer stacking)
    if (this.mainTimer) { clearInterval(this.mainTimer); this.mainTimer = null; }
    this.tickCount = 0;
    this.isRunning = true;

    const { restaurantId } = config;

    this.wsManager.connect(restaurantId);

    // On WS reconnect, trigger immediate full pull to catch up
    this.wsManager.onReconnect(() => {
      if (__DEV__) console.log('[SyncEngine] WS reconnected — triggering full pull sync');
      this.pullAll(restaurantId).catch((err) => {
        if (__DEV__) console.error('[SyncEngine] Reconnect pull error:', err);
      });
    });

    // Reset lastSync so initial full pull fetches ALL server data (not incremental)
    await syncQueueService.resetLastSyncTime();

    // Initial full sync on startup — fire in background, don't block startup
    this.fullSync(restaurantId).catch((err) => {
      if (__DEV__) console.error('[SyncEngine] Initial fullSync error:', err);
    });

    // Single consolidated timer — 5s base tick
    // Every tick (5s): push + pull
    // Tick counter used by SyncProvider for less-frequent tasks
    this.mainTimer = setInterval(() => {
      this.tickCount++;
      this.pushPending(restaurantId).catch((err) => {
        if (__DEV__) console.error('[SyncEngine] Push error:', err);
      });
      this.pullAll(restaurantId).catch((err) => {
        if (__DEV__) console.error('[SyncEngine] Pull error:', err);
      });
    }, 5_000);

    if (__DEV__) console.log('[SyncEngine] Started for restaurant', restaurantId);
  }

  /** Current tick count — used by SyncProvider to schedule less-frequent work */
  getTickCount(): number {
    return this.tickCount;
  }

  async stop(): Promise<void> {
    if (this.mainTimer) {
      clearInterval(this.mainTimer);
      this.mainTimer = null;
    }
    this.tickCount = 0;
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
    // Pull tables first (critical for UI) — don't wait for others
    const tablesPull = this.pullService.pullTablesAndAreas(restaurantId);
    // Fire remaining pulls in parallel (including settings for tax rate)
    const otherPulls = Promise.allSettled([
      this.pullService.pullMenu(restaurantId),
      this.pullService.pullOrders(restaurantId),
      this.pullService.pullCustomers(restaurantId),
      this.pullService.pullSettings(),
    ]);
    // Wait for tables first, then the rest
    await tablesPull.catch((err) => {
      if (__DEV__) console.error('[SyncEngine] Table pull error:', err);
    });
    await otherPulls;
  }

  async pushPending(restaurantId: string): Promise<number> {
    const [orderResult, kitchenResult, paymentResult, customerResult] = await Promise.allSettled([
      syncQueueService.processBatch(processOrderSync, 10, 'order'),
      syncQueueService.processBatch(processKitchenSync, 10, 'kitchen_ticket'),
      syncQueueService.processBatch(processPaymentSync, 10, 'payment'),
      syncQueueService.processBatch(processCustomerSync, 10, 'customer'),
    ]);

    let total = 0;
    for (const r of [orderResult, kitchenResult, paymentResult, customerResult]) {
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
