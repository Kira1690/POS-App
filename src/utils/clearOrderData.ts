/**
 * Utility to clear ONLY order and ticket data from AsyncStorage
 * Keeps menu, tables, settings, and other data intact
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  orderStorageService,
  kitchenStorageService,
  paymentStorageService,
  STORAGE_KEYS,
} from '@/services/storage';

/**
 * Clear all order and ticket data from AsyncStorage AND in-memory caches
 * This gives you a fresh start for orders/tickets while keeping everything else
 *
 * CRITICAL: Uses storage service clearAll() methods which reset BOTH:
 * - AsyncStorage persisted data
 * - In-memory caches (ordersCache, ticketsCache, paymentsCache)
 *
 * This ensures tables correctly show as AVAILABLE after clearing data.
 */
export const clearAllOrderAndTicketData = async (): Promise<void> => {
  try {
    console.log('[ClearOrderData] Starting to clear order and ticket data...');

    // CRITICAL: Call storage service clearAll methods to reset BOTH
    // AsyncStorage AND in-memory caches. This is essential because
    // the table status sync reads from these caches.
    await Promise.all([
      orderStorageService.clearAll(),
      kitchenStorageService.clearAll(),
      paymentStorageService.clearAll(),
    ]);

    console.log('[ClearOrderData] ✅ Successfully cleared all order, ticket, and payment data');
    console.log('[ClearOrderData] ✅ In-memory caches have been reset');
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
