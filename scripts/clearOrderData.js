/**
 * Script to clear ONLY order and ticket data from AsyncStorage
 * Run this with: node scripts/clearOrderData.js
 *
 * This will clear:
 * - All orders (active, history, drafts)
 * - All kitchen tickets
 * - All payments and receipts
 *
 * This will KEEP:
 * - Menu data (categories, items, modifiers, combos)
 * - Table data (tables and areas)
 * - Settings and preferences
 * - Authentication data
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Storage keys to remove
const ORDER_KEYS = [
  '@pos_orders',
  '@pos_active_orders',
  '@pos_order_history',
  '@pos_order_drafts',
  '@pos_order_last_sync',
  '@pos_kitchen_tickets',
  '@pos_kitchen_last_sync',
  '@pos_pending_payments',
  '@pos_payment_history',
  '@pos_split_bills',
  '@pos_receipts',
  '@pos_payment_last_sync',
];

async function clearOrderData() {
  try {
    console.log('🧹 Starting to clear order and ticket data...\n');

    // Show what will be cleared
    console.log('📋 Keys to be cleared:');
    ORDER_KEYS.forEach(key => console.log(`   - ${key}`));
    console.log('');

    // Clear the data
    await AsyncStorage.multiRemove(ORDER_KEYS);

    console.log('✅ Successfully cleared all order and ticket data!\n');

    // Verify what's left
    const remainingKeys = await AsyncStorage.getAllKeys();
    console.log('📦 Remaining AsyncStorage keys:');
    remainingKeys.forEach(key => console.log(`   ✓ ${key}`));
    console.log('');

    console.log('✅ Done! Your menu, tables, and settings are preserved.');
    console.log('📱 Restart your app to see the changes.\n');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

// Run the script
clearOrderData();
