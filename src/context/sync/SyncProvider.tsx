/**
 * Sync Provider
 * Manages SyncEngine lifecycle and exposes sync state to the UI.
 *
 * Offline behaviour:
 * - Dummy credentials (token starts with "dummy_"): backend unreachable → silent offline,
 *   no toasts, POS keeps working from SQLite.
 * - Real credentials: backend unreachable → ONE "Working offline" info toast, then
 *   silent. POS keeps all features via SQLite. No logout, no disruption.
 * - In both cases the sync engine is never started while offline, so apiClient's
 *   error interceptor is never triggered by sync calls.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { syncEngine } from '@/services/sync/SyncEngine';
import { syncQueueService, authStorageService } from '@/services/storage';
import { API_CONFIG } from '@/constants';
import { showToast } from '@/utils/toast';
import { SyncStatus } from '@/services/sync/types';
import { SyncContext } from './SyncContext';

interface SyncProviderProps {
  children: React.ReactNode;
}

/** Silent reachability probe — uses native fetch, never triggers apiClient toasts. */
async function isBackendReachable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

/** Returns true when the stored access token belongs to dummy/offline credentials. */
async function isUsingDummyCredentials(): Promise<boolean> {
  try {
    const session = await authStorageService.getSession();
    return session?.accessToken?.startsWith('dummy_') ?? false;
  } catch {
    return false;
  }
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const isOnlineRef = useRef(false);
  const offlineToastShownRef = useRef(false);

  const restaurantId = user?.default_restaurant_id || '1';

  useEffect(() => {
    if (!isAuthenticated) return;

    let stopped = false;

    const startSync = async () => {
      // Check dummy FIRST — skip the 3s health fetch entirely
      const isDummy = await isUsingDummyCredentials();
      if (isDummy) {
        setSyncStatus('offline');
        if (__DEV__) console.log('[SyncProvider] Dummy credentials — staying offline silently');
        return;
      }

      const reachable = await isBackendReachable();

      if (stopped) return;

      if (!reachable) {
        setSyncStatus('offline');

        if (!offlineToastShownRef.current) {
          offlineToastShownRef.current = true;
          showToast({
            type: 'info',
            title: 'Working Offline',
            message: 'No server connection. All POS features remain available.',
          });
        }

        if (__DEV__) {
          console.log(`[SyncProvider] Offline — toast shown=${offlineToastShownRef.current}`);
        }
        return;
      }

      // Backend is reachable — reset offline toast flag so it fires again if
      // connectivity is lost and restored in the same session
      offlineToastShownRef.current = false;
      isOnlineRef.current = true;
      setSyncStatus('idle');

      await syncEngine.start({
        restaurantId,
        pushIntervalMs: 5_000,
        pullIntervalMs: 5_000,
      });
    };

    startSync().catch((err) => {
      if (__DEV__) console.error('[SyncProvider] Start failed:', err);
      setSyncStatus('error');
    });

    return () => {
      stopped = true;
      if (isOnlineRef.current) {
        syncEngine.stop().catch(() => {});
        isOnlineRef.current = false;
      }
    };
  }, [isAuthenticated, restaurantId]);

  // Single consolidated timer for health check (every 60s) + pending refresh (every 15s)
  // Uses a 15s base interval with a tick counter to schedule the health check every 4th tick.
  useEffect(() => {
    if (!isAuthenticated) return;

    let providerTick = 0;

    const refreshPending = async () => {
      try {
        const stats = await syncQueueService.getStats();
        setPendingCount(stats.pending + stats.inProgress);
        setLastSyncTime(await syncQueueService.getLastSyncTime());
      } catch {
        // ignore — SQLite failure shouldn't surface to user
      }
    };

    const checkHealth = async () => {
      // Check dummy first to avoid unnecessary network request
      const isDummy = await isUsingDummyCredentials();
      if (isDummy) return;

      const reachable = await isBackendReachable();

      if (!reachable) {
        if (isOnlineRef.current) {
          // Transition: online → offline
          isOnlineRef.current = false;
          await syncEngine.stop().catch(() => {});
          setSyncStatus('offline');
          if (!offlineToastShownRef.current) {
            offlineToastShownRef.current = true;
            showToast({
              type: 'info',
              title: 'Working Offline',
              message: 'No server connection. All POS features remain available.',
            });
          }
        }
      } else {
        if (!isOnlineRef.current) {
          // Transition: offline → online — restart sync engine and do full sync
          offlineToastShownRef.current = false;
          isOnlineRef.current = true;
          try {
            await syncEngine.start({ restaurantId, pushIntervalMs: 5_000, pullIntervalMs: 5_000 });
            setSyncStatus('idle');
          } catch (err) {
            if (__DEV__) console.error('[SyncProvider] Reconnect sync start failed:', err);
            setSyncStatus('error');
          }
        }
      }
    };

    // Run pending refresh immediately on mount
    refreshPending();

    const timer = setInterval(() => {
      providerTick++;
      // Every tick (15s): refresh pending count
      refreshPending();
      // Every 4th tick (60s): health check
      if (providerTick % 4 === 0) {
        checkHealth();
      }
    }, 15_000);

    return () => clearInterval(timer);
  }, [isAuthenticated, restaurantId]);

  const triggerSync = useCallback(async () => {
    if (syncStatus === 'syncing') return;

    // Dummy credentials — no sync possible, skip health fetch
    const isDummy = await isUsingDummyCredentials();
    if (isDummy) {
      setSyncStatus('offline');
      return;
    }

    const reachable = await isBackendReachable();

    if (!reachable) {
      setSyncStatus('offline');
      if (!offlineToastShownRef.current) {
        offlineToastShownRef.current = true;
        showToast({
          type: 'info',
          title: 'Working Offline',
          message: 'No server connection. All POS features remain available.',
        });
      }
      return;
    }

    // Backend came back online
    offlineToastShownRef.current = false;
    setSyncStatus('syncing');

    try {
      if (!isOnlineRef.current) {
        // Engine was never started (was offline at login) — start it now
        isOnlineRef.current = true;
        await syncEngine.start({ restaurantId, pushIntervalMs: 5_000, pullIntervalMs: 5_000 });
      } else {
        await syncEngine.fullSync(restaurantId);
      }
      const stats = await syncQueueService.getStats();
      setPendingCount(stats.pending + stats.inProgress);
      setLastSyncTime(await syncQueueService.getLastSyncTime());
      setSyncStatus('idle');
    } catch {
      setSyncStatus('error');
    }
  }, [syncStatus, restaurantId]);

  const contextValue = useMemo(() => ({
    syncStatus, pendingCount, lastSyncTime, triggerSync,
  }), [syncStatus, pendingCount, lastSyncTime, triggerSync]);

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
};
