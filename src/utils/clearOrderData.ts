/**
 * Utility to clear ONLY order and ticket data from SQLite
 * Keeps menu, tables (structure), settings intact
 *
 * SINGLE SOURCE OF TRUTH: SQLite
 * - Clears order storage
 * - Resets all table statuses to AVAILABLE
 * - Emits SYSTEM_RESET event
 */

import {
  paymentStorageService,
  unifiedOrderStorageService,
  tableStorageService,
} from '@/services/storage';
import { tableApiClient } from '@/services/api/table';
import { orderEventEmitter } from '@/context/unified-order';
import { databaseService } from '@/services/database/DatabaseService';

/**
 * Clear all order and ticket data from SQLite
 * Also resets all table statuses to AVAILABLE
 *
 * CRITICAL: This function ensures:
 * - Order data is cleared from SQLite
 * - All table statuses reset to AVAILABLE
 * - SYSTEM_RESET event triggers context state reset
 * - NO app restart required
 */
export const clearAllOrderAndTicketData = async (): Promise<void> => {
  try {
    // STEP 1: Clear unified order storage (SINGLE source of truth)
    await unifiedOrderStorageService.clearAll();

    // STEP 2: Clear payment storage
    await paymentStorageService.clearAll();

    // STEP 3: Reset all table statuses to AVAILABLE
    await tableStorageService.resetAllTableStatuses();

    // STEP 4: Reset table API client cache
    tableApiClient.resetCache();

    // STEP 5: Emit SYSTEM_RESET event to notify all contexts
    orderEventEmitter.emit('SYSTEM_RESET', '', {});

    return;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify what data remains after clearing
 */
export const verifyRemainingData = async (): Promise<void> => {
  try {
    const db = databaseService.getDatabase();

    const menuCategories = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM menu_categories'
    );
    const menuItems = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM menu_items'
    );
    const tables = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM tables'
    );
    const orders = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM orders'
    );

    if (__DEV__) {
      console.log('[ClearOrderData] Menu Categories:', menuCategories?.cnt ? 'EXISTS' : 'EMPTY');
      console.log('[ClearOrderData] Menu Items:', menuItems?.cnt ? 'EXISTS' : 'EMPTY');
      console.log('[ClearOrderData] Tables:', tables?.cnt ? 'EXISTS' : 'EMPTY');
      console.log('[ClearOrderData] Orders:', orders?.cnt ? '(should be 0)' : 'CLEARED');
    }
  } catch { /* silent */ }
};
