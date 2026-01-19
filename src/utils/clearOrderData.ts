/**
 * Utility to clear ONLY order and ticket data from AsyncStorage
 * Keeps menu, tables (structure), settings intact
 *
 * SINGLE SOURCE OF TRUTH: AsyncStorage only
 * - Clears order storage
 * - Resets all table statuses to AVAILABLE
 * - Emits SYSTEM_RESET event
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  paymentStorageService,
  unifiedOrderStorageService,
  tableStorageService,
  STORAGE_KEYS,
} from '@/services/storage';
import { tableApiClient } from '@/services/api/table';
import { orderEventEmitter } from '@/context/unified-order';

/**
 * Clear all order and ticket data from AsyncStorage AND in-memory caches
 * Also resets all table statuses to AVAILABLE
 *
 * CRITICAL: This function ensures:
 * - Order data is cleared from AsyncStorage AND cache
 * - All table statuses reset to AVAILABLE
 * - SYSTEM_RESET event triggers context state reset
 * - NO app restart required
 */
export const clearAllOrderAndTicketData = async (): Promise<void> => {
  try {
    console.log('[ClearOrderData] Starting to clear order and ticket data...');

    // STEP 1: Clear unified order storage (SINGLE source of truth)
    await unifiedOrderStorageService.clearAll();
    console.log('[ClearOrderData] ✅ Unified order storage cleared');

    // STEP 2: Clear payment storage
    await paymentStorageService.clearAll();
    console.log('[ClearOrderData] ✅ Payment storage cleared');

    // STEP 3: Reset all table statuses to AVAILABLE
    // This ensures tables are not stuck as OCCUPIED after clearing orders
    await tableStorageService.resetAllTableStatuses();
    console.log('[ClearOrderData] ✅ All table statuses reset to AVAILABLE');

    // STEP 4: Reset table API client cache
    // This forces fresh reload from storage on next table fetch
    tableApiClient.resetCache();
    console.log('[ClearOrderData] ✅ Table API client cache reset');

    // STEP 5: Emit SYSTEM_RESET event to notify all contexts
    orderEventEmitter.emit('SYSTEM_RESET', '', {});
    console.log('[ClearOrderData] ✅ SYSTEM_RESET event emitted');

    console.log('[ClearOrderData] ========================================');
    console.log('[ClearOrderData] ✅ All order data cleared successfully');
    console.log('[ClearOrderData] ✅ Tables reset to AVAILABLE');
    console.log('[ClearOrderData] ✅ Context state will reset WITHOUT app restart');
    console.log('[ClearOrderData] ========================================');

    return;
  } catch (error) {
    console.error('[ClearOrderData] ❌ Error clearing data:', error);
    throw error;
  }
};

/**
 * Verify what data remains after clearing
 */
export const verifyRemainingData = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('[ClearOrderData] Remaining AsyncStorage keys:', allKeys);

    // Check if menu data still exists
    const menuCategories = await AsyncStorage.getItem(STORAGE_KEYS.MENU_CATEGORIES);
    const menuItems = await AsyncStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    const tableData = await AsyncStorage.getItem(STORAGE_KEYS.TABLE_DATA);

    console.log('[ClearOrderData] Menu Categories:', menuCategories ? '✅ EXISTS' : '❌ MISSING');
    console.log('[ClearOrderData] Menu Items:', menuItems ? '✅ EXISTS' : '❌ MISSING');
    console.log('[ClearOrderData] Table Data:', tableData ? '✅ EXISTS' : '❌ MISSING');
  } catch (error) {
    console.error('[ClearOrderData] Error verifying data:', error);
  }
};
