/**
 * Sync Context
 * Exposes sync status and manual trigger to UI components
 */

import { createContext, useContext } from 'react';
import { SyncStatus } from '@/services/sync/types';

export interface SyncContextValue {
  syncStatus: SyncStatus;
  pendingCount: number;
  lastSyncTime: string | null;
  triggerSync: () => Promise<void>;
}

const defaultValue: SyncContextValue = {
  syncStatus: 'idle',
  pendingCount: 0,
  lastSyncTime: null,
  triggerSync: async () => {},
};

export const SyncContext = createContext<SyncContextValue>(defaultValue);

export const useSyncContext = (): SyncContextValue => useContext(SyncContext);
