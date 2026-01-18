/**
 * Unified Order Storage Service
 * Single storage service for all order-related data
 *
 * Core Principle: Single source of truth with single cache
 *
 * Key Features:
 * - clearAll() resets BOTH AsyncStorage AND in-memory cache
 * - resetCache() for context state sync
 * - Single cache for all order data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './StorageService';
import {
  UnifiedOrder,
  UnifiedOrderFilters,
  UnifiedCartState,
  isActiveOrder,
  getActiveStatuses,
} from '@/types/unified-order.types';

// ============== STORAGE KEY ==============

const UNIFIED_ORDERS_KEY = '@unified_orders';
const UNIFIED_CARTS_KEY = '@unified_carts';

// ============== STORAGE DATA STRUCTURE ==============

interface UnifiedOrderStorageData {
  orders: Record<string, UnifiedOrder>;
  activeOrderIds: string[];
  historyOrderIds: string[];
  lastUpdated: string;
}

interface UnifiedCartStorageData {
  carts: Record<string, UnifiedCartState>; // Keyed by tableId
  lastUpdated: string;
}

// ============== DEFAULT EMPTY DATA ==============

const EMPTY_ORDER_STORAGE: UnifiedOrderStorageData = {
  orders: {},
  activeOrderIds: [],
  historyOrderIds: [],
  lastUpdated: new Date().toISOString(),
};

const EMPTY_CART_STORAGE: UnifiedCartStorageData = {
  carts: {},
  lastUpdated: new Date().toISOString(),
};

// ============== SERVICE CLASS ==============

class UnifiedOrderStorageService {
  private ordersCache: UnifiedOrderStorageData | null = null;
  private cartsCache: UnifiedCartStorageData | null = null;
  private initialized = false;

  // ============== INITIALIZATION ==============

  /**
   * Initialize storage and load data into cache
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Promise.all([
        this.loadOrdersFromStorage(),
        this.loadCartsFromStorage(),
      ]);
      this.initialized = true;

      if (__DEV__) {
        console.log('[UnifiedOrderStorage] Initialized successfully');
        console.log('[UnifiedOrderStorage] Active orders:', this.ordersCache?.activeOrderIds.length ?? 0);
        console.log('[UnifiedOrderStorage] History orders:', this.ordersCache?.historyOrderIds.length ?? 0);
      }
    } catch (error) {
      console.error('[UnifiedOrderStorage] Initialization error:', error);
      this.ordersCache = { ...EMPTY_ORDER_STORAGE };
      this.cartsCache = { ...EMPTY_CART_STORAGE };
      this.initialized = true;
    }
  }

  /**
   * Load orders from AsyncStorage into cache
   */
  private async loadOrdersFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(UNIFIED_ORDERS_KEY);
      if (data) {
        this.ordersCache = JSON.parse(data);
      } else {
        this.ordersCache = { ...EMPTY_ORDER_STORAGE };
      }
    } catch (error) {
      console.error('[UnifiedOrderStorage] Error loading orders:', error);
      this.ordersCache = { ...EMPTY_ORDER_STORAGE };
    }
  }

  /**
   * Load carts from AsyncStorage into cache
   */
  private async loadCartsFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(UNIFIED_CARTS_KEY);
      if (data) {
        this.cartsCache = JSON.parse(data);
      } else {
        this.cartsCache = { ...EMPTY_CART_STORAGE };
      }
    } catch (error) {
      console.error('[UnifiedOrderStorage] Error loading carts:', error);
      this.cartsCache = { ...EMPTY_CART_STORAGE };
    }
  }

  /**
   * Save orders to AsyncStorage
   */
  private async saveOrdersToStorage(): Promise<void> {
    if (!this.ordersCache) return;

    try {
      this.ordersCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(UNIFIED_ORDERS_KEY, JSON.stringify(this.ordersCache));
    } catch (error) {
      console.error('[UnifiedOrderStorage] Error saving orders:', error);
      throw error;
    }
  }

  /**
   * Save carts to AsyncStorage
   */
  private async saveCartsToStorage(): Promise<void> {
    if (!this.cartsCache) return;

    try {
      this.cartsCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(UNIFIED_CARTS_KEY, JSON.stringify(this.cartsCache));
    } catch (error) {
      console.error('[UnifiedOrderStorage] Error saving carts:', error);
      throw error;
    }
  }

  // ============== ORDER CRUD OPERATIONS ==============

  /**
   * Save a new order or update existing
   */
  async saveOrder(order: UnifiedOrder): Promise<void> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return;

    this.ordersCache.orders[order.id] = order;

    // Update active/history lists based on status
    if (isActiveOrder(order)) {
      if (!this.ordersCache.activeOrderIds.includes(order.id)) {
        this.ordersCache.activeOrderIds.push(order.id);
      }
      // Remove from history if exists
      this.ordersCache.historyOrderIds = this.ordersCache.historyOrderIds.filter(
        (id) => id !== order.id
      );
    } else {
      if (!this.ordersCache.historyOrderIds.includes(order.id)) {
        this.ordersCache.historyOrderIds.push(order.id);
      }
      // Remove from active
      this.ordersCache.activeOrderIds = this.ordersCache.activeOrderIds.filter(
        (id) => id !== order.id
      );
    }

    await this.saveOrdersToStorage();
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<UnifiedOrder | null> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    return this.ordersCache?.orders[orderId] || null;
  }

  /**
   * Get order by ID (sync version - use after initialize)
   */
  getOrderSync(orderId: string): UnifiedOrder | null {
    return this.ordersCache?.orders[orderId] || null;
  }

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<UnifiedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    return Object.values(this.ordersCache.orders)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get all active orders (not paid/cancelled)
   */
  async getActiveOrders(): Promise<UnifiedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    return this.ordersCache.activeOrderIds
      .map((id) => this.ordersCache!.orders[id])
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get all active orders (sync version)
   */
  getActiveOrdersSync(): UnifiedOrder[] {
    if (!this.ordersCache) return [];

    return this.ordersCache.activeOrderIds
      .map((id) => this.ordersCache!.orders[id])
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get orders with filters
   */
  async getOrders(filters?: UnifiedOrderFilters): Promise<UnifiedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    let orders = Object.values(this.ordersCache.orders);

    if (filters) {
      // Filter by status
      if (filters.status) {
        if (filters.status === 'active') {
          const activeStatuses = getActiveStatuses();
          orders = orders.filter((o) => activeStatuses.includes(o.status));
        } else if (filters.status !== 'all') {
          orders = orders.filter((o) => o.status === filters.status);
        }
      }

      // Filter by payment status
      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        orders = orders.filter((o) => o.paymentStatus === filters.paymentStatus);
      }

      // Filter by table
      if (filters.tableId) {
        orders = orders.filter((o) => o.tableId === filters.tableId);
      }

      // Filter by date range
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.startDate).getTime();
        const endDate = new Date(filters.dateRange.endDate).getTime();
        orders = orders.filter((o) => {
          const orderDate = new Date(o.createdAt).getTime();
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        orders = orders.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(query) ||
            o.tableName.toLowerCase().includes(query) ||
            o.items.some((item) => item.name.toLowerCase().includes(query))
        );
      }

      // Filter by amount range
      if (filters.minAmount !== undefined) {
        orders = orders.filter((o) => o.totalAmount >= filters.minAmount!);
      }
      if (filters.maxAmount !== undefined) {
        orders = orders.filter((o) => o.totalAmount <= filters.maxAmount!);
      }
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Update an order
   */
  async updateOrder(orderId: string, updates: Partial<UnifiedOrder>): Promise<UnifiedOrder | null> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return null;

    const existingOrder = this.ordersCache.orders[orderId];
    if (!existingOrder) return null;

    const updatedOrder: UnifiedOrder = {
      ...existingOrder,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveOrder(updatedOrder);
    return updatedOrder;
  }

  /**
   * Delete an order permanently
   */
  async deleteOrder(orderId: string): Promise<void> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return;

    // Remove from all lists
    this.ordersCache.activeOrderIds = this.ordersCache.activeOrderIds.filter((id) => id !== orderId);
    this.ordersCache.historyOrderIds = this.ordersCache.historyOrderIds.filter((id) => id !== orderId);
    delete this.ordersCache.orders[orderId];

    await this.saveOrdersToStorage();
  }

  /**
   * Get orders by table ID
   */
  async getOrdersByTable(tableId: string): Promise<UnifiedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    return Object.values(this.ordersCache.orders)
      .filter((o) => o.tableId === tableId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get active order for a table (there should only be one)
   */
  async getActiveOrderForTable(tableId: string): Promise<UnifiedOrder | null> {
    const activeOrders = await this.getActiveOrders();
    return activeOrders.find((o) => o.tableId === tableId) || null;
  }

  /**
   * Get active order for a table (sync version)
   */
  getActiveOrderForTableSync(tableId: string): UnifiedOrder | null {
    const activeOrders = this.getActiveOrdersSync();
    return activeOrders.find((o) => o.tableId === tableId) || null;
  }

  // ============== CART OPERATIONS ==============

  /**
   * Save cart for a table
   */
  async saveCart(tableId: string, cart: UnifiedCartState): Promise<void> {
    if (!this.cartsCache) await this.loadCartsFromStorage();
    if (!this.cartsCache) return;

    this.cartsCache.carts[tableId] = cart;
    await this.saveCartsToStorage();
  }

  /**
   * Get cart for a table
   */
  async getCart(tableId: string): Promise<UnifiedCartState | null> {
    if (!this.cartsCache) await this.loadCartsFromStorage();
    return this.cartsCache?.carts[tableId] || null;
  }

  /**
   * Delete cart for a table
   */
  async deleteCart(tableId: string): Promise<void> {
    if (!this.cartsCache) await this.loadCartsFromStorage();
    if (!this.cartsCache) return;

    delete this.cartsCache.carts[tableId];
    await this.saveCartsToStorage();
  }

  /**
   * Get all carts
   */
  async getAllCarts(): Promise<Record<string, UnifiedCartState>> {
    if (!this.cartsCache) await this.loadCartsFromStorage();
    return this.cartsCache?.carts || {};
  }

  // ============== BULK OPERATIONS ==============

  /**
   * Save multiple orders at once
   */
  async saveOrders(orders: UnifiedOrder[]): Promise<void> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return;

    for (const order of orders) {
      this.ordersCache.orders[order.id] = order;

      if (isActiveOrder(order)) {
        if (!this.ordersCache.activeOrderIds.includes(order.id)) {
          this.ordersCache.activeOrderIds.push(order.id);
        }
      } else {
        if (!this.ordersCache.historyOrderIds.includes(order.id)) {
          this.ordersCache.historyOrderIds.push(order.id);
        }
      }
    }

    await this.saveOrdersToStorage();
  }

  /**
   * Clear old orders (older than specified date)
   */
  async clearOldOrders(beforeDate: Date): Promise<number> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return 0;

    const cutoffTime = beforeDate.getTime();
    let deletedCount = 0;

    // Only clear from history, not active orders
    const ordersToDelete = this.ordersCache.historyOrderIds.filter((id) => {
      const order = this.ordersCache!.orders[id];
      if (order && new Date(order.createdAt).getTime() < cutoffTime) {
        return true;
      }
      return false;
    });

    for (const orderId of ordersToDelete) {
      delete this.ordersCache.orders[orderId];
      deletedCount++;
    }

    this.ordersCache.historyOrderIds = this.ordersCache.historyOrderIds.filter(
      (id) => !ordersToDelete.includes(id)
    );

    await this.saveOrdersToStorage();
    return deletedCount;
  }

  // ============== SYNC OPERATIONS ==============

  /**
   * Get orders pending sync
   */
  async getUnsyncedOrders(): Promise<UnifiedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    return Object.values(this.ordersCache.orders).filter((o) => o.pendingSync);
  }

  /**
   * Mark orders as synced
   */
  async markAsSynced(orderIds: string[]): Promise<void> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return;

    const now = new Date().toISOString();

    for (const orderId of orderIds) {
      if (this.ordersCache.orders[orderId]) {
        this.ordersCache.orders[orderId].pendingSync = false;
        this.ordersCache.orders[orderId].syncedAt = now;
      }
    }

    await this.saveOrdersToStorage();
  }

  // ============== CLEAR AND RESET OPERATIONS ==============

  /**
   * CRITICAL: Clear ALL order data from BOTH AsyncStorage AND in-memory cache
   * This ensures proper state reset without app restart
   */
  async clearAll(): Promise<void> {
    // Reset in-memory caches FIRST
    this.ordersCache = { ...EMPTY_ORDER_STORAGE };
    this.cartsCache = { ...EMPTY_CART_STORAGE };

    // Then clear AsyncStorage
    await Promise.all([
      AsyncStorage.removeItem(UNIFIED_ORDERS_KEY),
      AsyncStorage.removeItem(UNIFIED_CARTS_KEY),
      // Also clear legacy keys for migration
      AsyncStorage.removeItem(STORAGE_KEYS.ORDERS),
      AsyncStorage.removeItem(STORAGE_KEYS.ORDER_DRAFTS),
      AsyncStorage.removeItem(STORAGE_KEYS.KITCHEN_TICKETS),
      AsyncStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENTS),
    ]);

    if (__DEV__) {
      console.log('[UnifiedOrderStorage] ✅ All data cleared (storage + cache)');
    }
  }

  /**
   * Reset only the in-memory cache (for context state sync)
   * Call this when context needs to refresh from storage
   */
  resetCache(): void {
    this.ordersCache = { ...EMPTY_ORDER_STORAGE };
    this.cartsCache = { ...EMPTY_CART_STORAGE };
    this.initialized = false;

    if (__DEV__) {
      console.log('[UnifiedOrderStorage] Cache reset - will reload on next access');
    }
  }

  /**
   * Get current cache state (for debugging/context sync)
   */
  getCacheState(): {
    orders: UnifiedOrder[];
    activeOrderIds: string[];
    initialized: boolean;
  } {
    return {
      orders: this.ordersCache ? Object.values(this.ordersCache.orders) : [],
      activeOrderIds: this.ordersCache?.activeOrderIds || [],
      initialized: this.initialized,
    };
  }

  // ============== STATISTICS ==============

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalOrders: number;
    activeOrders: number;
    historyOrders: number;
    carts: number;
    unsyncedOrders: number;
  }> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.cartsCache) await this.loadCartsFromStorage();

    const unsynced = await this.getUnsyncedOrders();

    return {
      totalOrders: Object.keys(this.ordersCache?.orders || {}).length,
      activeOrders: this.ordersCache?.activeOrderIds.length || 0,
      historyOrders: this.ordersCache?.historyOrderIds.length || 0,
      carts: Object.keys(this.cartsCache?.carts || {}).length,
      unsyncedOrders: unsynced.length,
    };
  }

  /**
   * Check if storage is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// ============== SINGLETON EXPORT ==============

export const unifiedOrderStorageService = new UnifiedOrderStorageService();
