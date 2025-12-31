/**
 * Order Storage Service
 * Handles all order-related data persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './StorageService';
import {
  ExtendedOrder,
  OrderDraft,
  ExtendedOrderFilters,
  ExtendedOrderStatus,
} from '@/types/order-extended.types';

// Order storage data structure
interface OrderStorageData {
  orders: Record<string, ExtendedOrder>;
  activeOrderIds: string[];
  historyOrderIds: string[];
  draftIds: string[];
  lastUpdated: string;
}

interface OrderDraftStorageData {
  drafts: Record<string, OrderDraft>;
  lastUpdated: string;
}

// Default empty storage
const EMPTY_ORDER_STORAGE: OrderStorageData = {
  orders: {},
  activeOrderIds: [],
  historyOrderIds: [],
  draftIds: [],
  lastUpdated: new Date().toISOString(),
};

const EMPTY_DRAFT_STORAGE: OrderDraftStorageData = {
  drafts: {},
  lastUpdated: new Date().toISOString(),
};

/**
 * OrderStorageService - Manages order persistence
 */
class OrderStorageService {
  private ordersCache: OrderStorageData | null = null;
  private draftsCache: OrderDraftStorageData | null = null;
  private isDirty = false;

  // ============== INITIALIZATION ==============

  /**
   * Initialize storage and load data into cache
   */
  async initialize(): Promise<void> {
    try {
      await this.loadOrdersFromStorage();
      await this.loadDraftsFromStorage();
    } catch (error) {
      console.error('[OrderStorage] Initialization error:', error);
      this.ordersCache = { ...EMPTY_ORDER_STORAGE };
      this.draftsCache = { ...EMPTY_DRAFT_STORAGE };
    }
  }

  /**
   * Load orders from AsyncStorage
   */
  private async loadOrdersFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) {
        this.ordersCache = JSON.parse(data);
      } else {
        this.ordersCache = { ...EMPTY_ORDER_STORAGE };
      }
    } catch (error) {
      console.error('[OrderStorage] Error loading orders:', error);
      this.ordersCache = { ...EMPTY_ORDER_STORAGE };
    }
  }

  /**
   * Load drafts from AsyncStorage
   */
  private async loadDraftsFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDER_DRAFTS);
      if (data) {
        this.draftsCache = JSON.parse(data);
      } else {
        this.draftsCache = { ...EMPTY_DRAFT_STORAGE };
      }
    } catch (error) {
      console.error('[OrderStorage] Error loading drafts:', error);
      this.draftsCache = { ...EMPTY_DRAFT_STORAGE };
    }
  }

  /**
   * Save orders to AsyncStorage
   */
  private async saveOrdersToStorage(): Promise<void> {
    if (!this.ordersCache) return;

    try {
      this.ordersCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.ordersCache));
      this.isDirty = false;
    } catch (error) {
      console.error('[OrderStorage] Error saving orders:', error);
      throw error;
    }
  }

  /**
   * Save drafts to AsyncStorage
   */
  private async saveDraftsToStorage(): Promise<void> {
    if (!this.draftsCache) return;

    try {
      this.draftsCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.ORDER_DRAFTS, JSON.stringify(this.draftsCache));
    } catch (error) {
      console.error('[OrderStorage] Error saving drafts:', error);
      throw error;
    }
  }

  // ============== ORDER CRUD OPERATIONS ==============

  /**
   * Save a new order or update existing
   */
  async saveOrder(order: ExtendedOrder): Promise<void> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return;

    const isNew = !this.ordersCache.orders[order.id];
    this.ordersCache.orders[order.id] = order;

    // Update active/history lists
    if (this.isActiveOrder(order)) {
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
      // Remove from active if exists
      this.ordersCache.activeOrderIds = this.ordersCache.activeOrderIds.filter(
        (id) => id !== order.id
      );
    }

    await this.saveOrdersToStorage();
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<ExtendedOrder | null> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    return this.ordersCache?.orders[orderId] || null;
  }

  /**
   * Get all active orders
   */
  async getActiveOrders(): Promise<ExtendedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    return this.ordersCache.activeOrderIds
      .map((id) => this.ordersCache!.orders[id])
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get order history with filters
   */
  async getOrderHistory(filters?: ExtendedOrderFilters): Promise<ExtendedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    let orders = Object.values(this.ordersCache.orders);

    if (filters) {
      // Filter by status
      if (filters.status && filters.status !== 'all') {
        orders = orders.filter((o) => o.status === filters.status);
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
  async updateOrder(orderId: string, updates: Partial<ExtendedOrder>): Promise<ExtendedOrder | null> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return null;

    const existingOrder = this.ordersCache.orders[orderId];
    if (!existingOrder) return null;

    const updatedOrder: ExtendedOrder = {
      ...existingOrder,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveOrder(updatedOrder);
    return updatedOrder;
  }

  /**
   * Delete an order (soft delete by moving to history)
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
  async getOrdersByTable(tableId: string): Promise<ExtendedOrder[]> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return [];

    return Object.values(this.ordersCache.orders)
      .filter((o) => o.tableId === tableId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get active order for a table
   */
  async getActiveOrderForTable(tableId: string): Promise<ExtendedOrder | null> {
    const activeOrders = await this.getActiveOrders();
    return activeOrders.find((o) => o.tableId === tableId) || null;
  }

  // ============== DRAFT OPERATIONS ==============

  /**
   * Save a draft order
   */
  async saveDraft(draft: OrderDraft): Promise<void> {
    if (!this.draftsCache) await this.loadDraftsFromStorage();
    if (!this.draftsCache) return;

    const isNew = !this.draftsCache.drafts[draft.id];
    this.draftsCache.drafts[draft.id] = draft;

    if (isNew) {
      if (!this.ordersCache) await this.loadOrdersFromStorage();
      if (this.ordersCache && !this.ordersCache.draftIds.includes(draft.id)) {
        this.ordersCache.draftIds.push(draft.id);
        await this.saveOrdersToStorage();
      }
    }

    await this.saveDraftsToStorage();
  }

  /**
   * Get all drafts
   */
  async getDrafts(): Promise<OrderDraft[]> {
    if (!this.draftsCache) await this.loadDraftsFromStorage();
    if (!this.draftsCache) return [];

    return Object.values(this.draftsCache.drafts).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Get draft by ID
   */
  async getDraft(draftId: string): Promise<OrderDraft | null> {
    if (!this.draftsCache) await this.loadDraftsFromStorage();
    return this.draftsCache?.drafts[draftId] || null;
  }

  /**
   * Delete a draft
   */
  async deleteDraft(draftId: string): Promise<void> {
    if (!this.draftsCache) await this.loadDraftsFromStorage();
    if (!this.draftsCache) return;

    delete this.draftsCache.drafts[draftId];
    await this.saveDraftsToStorage();

    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (this.ordersCache) {
      this.ordersCache.draftIds = this.ordersCache.draftIds.filter((id) => id !== draftId);
      await this.saveOrdersToStorage();
    }
  }

  /**
   * Get draft for a table
   */
  async getDraftForTable(tableId: string): Promise<OrderDraft | null> {
    const drafts = await this.getDrafts();
    return drafts.find((d) => d.tableId === tableId) || null;
  }

  // ============== BULK OPERATIONS ==============

  /**
   * Save multiple orders at once
   */
  async saveOrders(orders: ExtendedOrder[]): Promise<void> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.ordersCache) return;

    for (const order of orders) {
      this.ordersCache.orders[order.id] = order;

      if (this.isActiveOrder(order)) {
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
  async getUnsyncedOrders(): Promise<ExtendedOrder[]> {
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

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ORDER_LAST_SYNC);
    } catch (error) {
      console.error('[OrderStorage] Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ORDER_LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('[OrderStorage] Error updating last sync time:', error);
    }
  }

  // ============== UTILITY METHODS ==============

  /**
   * Check if order is active (not completed/cancelled)
   */
  private isActiveOrder(order: ExtendedOrder): boolean {
    const completedStatuses: ExtendedOrderStatus[] = ['paid', 'cancelled'];
    return !completedStatuses.includes(order.status);
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalOrders: number;
    activeOrders: number;
    historyOrders: number;
    drafts: number;
    unsyncedOrders: number;
  }> {
    if (!this.ordersCache) await this.loadOrdersFromStorage();
    if (!this.draftsCache) await this.loadDraftsFromStorage();

    const unsynced = await this.getUnsyncedOrders();

    return {
      totalOrders: Object.keys(this.ordersCache?.orders || {}).length,
      activeOrders: this.ordersCache?.activeOrderIds.length || 0,
      historyOrders: this.ordersCache?.historyOrderIds.length || 0,
      drafts: Object.keys(this.draftsCache?.drafts || {}).length,
      unsyncedOrders: unsynced.length,
    };
  }

  /**
   * Clear all order data (use with caution)
   */
  async clearAll(): Promise<void> {
    this.ordersCache = { ...EMPTY_ORDER_STORAGE };
    this.draftsCache = { ...EMPTY_DRAFT_STORAGE };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ORDERS),
      AsyncStorage.removeItem(STORAGE_KEYS.ORDER_DRAFTS),
      AsyncStorage.removeItem(STORAGE_KEYS.ORDER_LAST_SYNC),
    ]);
  }
}

// Export singleton instance
export const orderStorageService = new OrderStorageService();
