/**
 * Sync Service Types
 * Shared type definitions for the sync layer
 */

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  errors: string[];
}

export interface SyncConfig {
  restaurantId: string;
  pushIntervalMs: number;
  pullIntervalMs: number;
}

export interface PullRequestBody {
  restaurant_id: string;
  last_sync_timestamp: string;
  entity_types: string[];
  page_size: number;
}

export interface PushChange {
  local_id: string;
  entity_type: string;
  action: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface PushRequestBody {
  restaurant_id: string;
  device_id: string;
  changes: PushChange[];
}

export interface PullEntityChanges {
  created: Record<string, unknown>[];
  updated: Record<string, unknown>[];
  deleted: Array<{ id: string; deleted_at: string }>;
}

export interface PullResponseData {
  [entityType: string]: PullEntityChanges;
}

export interface PullResponse {
  success: boolean;
  data: PullResponseData;
  sync_timestamp: string;
  has_more: boolean;
}

export interface PushResponse {
  success: boolean;
  synced: number;
  failed: number;
  message?: string;
}
