/**
 * Utility to clear ONLY order and ticket data from AsyncStorage
 * Keeps menu, tables, settings, and other data intact
 *
 * UNIFIED ORDER SYSTEM: Uses unified storage service and emits SYSTEM_RESET event
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  paymentStorageService,
  unifiedOrderStorageService,
  STORAGE_KEYS,
} from '@/services/storage';
import { orderEventEmitter } from '@/context/unified-order';

/**
 * Clear all order and ticket data from AsyncStorage AND in-memory caches
 * This gives you a fresh start for orders/tickets while keeping everything else
 *
 * CRITICAL: Uses unified storage service clearAll() which resets BOTH:
 * - AsyncStorage persisted data
 * - In-memory caches
 * - Context state via SYSTEM_RESET event
 *
 * This ensures:
 * - Tables correctly show as AVAILABLE after clearing data
 * - Context state is reset WITHOUT requiring app restart
 */
export const clearAllOrderAndTicketData = async (): Promise<void> => {
  try {
    console.log('[ClearOrderData] Starting to clear order and ticket data...');

    // STEP 1: Clear unified storage (SINGLE source of truth)
    // This clears BOTH AsyncStorage AND in-memory cache
    await unifiedOrderStorageService.clearAll();
    console.log('[ClearOrderData] ✅ Unified order storage cleared');

    // STEP 2: Clear payment storage
    await paymentStorageService.clearAll();
    console.log('[ClearOrderData] ✅ Payment storage cleared');

    // STEP 3: Emit SYSTEM_RESET event to notify all contexts
    // This triggers state reset in UnifiedOrderContext and TableProvider
    orderEventEmitter.emit('SYSTEM_RESET', '', {});
    console.log('[ClearOrderData] ✅ SYSTEM_RESET event emitted');

    console.log('[ClearOrderData] ✅ Successfully cleared all order and payment data');
    console.log('[ClearOrderData] ✅ Context state will reset WITHOUT app restart');
    console.log('[ClearOrderData] ✅ Menu, Tables, and Settings are PRESERVED');

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
