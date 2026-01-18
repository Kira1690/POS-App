/**
 * Order Repository - Order data access implementation
 * Uses AsyncStorageAdapter for local persistence
 * API-ready: Can be swapped to use ApiAdapter when backend is ready
 */

import {
  IOrderRepository,
  OrderFilters,
  OrderStats,
  QueryOptions,
  QueryFilter,
  PaginatedResult,
} from './interfaces/IRepository';
import { AsyncStorageAdapter } from './adapters/AsyncStorageAdapter';
import {
  ExtendedOrder,
  ExtendedOrderStatus,
  ExtendedPaymentStatus,
} from '@/types/order-extended.types';

const STORAGE_KEYS = {
  ORDERS: 'all',
  ACTIVE: 'active',
  HISTORY: 'history',
  LAST_SYNC: 'last_sync',
  PENDING_SYNC: 'pending_sync',
};

export class OrderRepository implements IOrderRepository {
  private adapter: AsyncStorageAdapter;

  constructor(adapter?: AsyncStorageAdapter) {
    this.adapter = adapter || new AsyncStorageAdapter({ prefix: 'pos_orders_' });
  }

  // ============== BASE CRUD OPERATIONS ==============

  async getAll(): Promise<ExtendedOrder[]> {
    const orders = await this.adapter.get<ExtendedOrder[]>(STORAGE_KEYS.ORDERS);
    return orders || [];
  }

  async getById(id: string): Promise<ExtendedOrder | null> {
    const orders = await this.getAll();
    return orders.find((o) => o.id === id) || null;
  }

  async getByIds(ids: string[]): Promise<ExtendedOrder[]> {
    const orders = await this.getAll();
    return orders.filter((o) => ids.includes(o.id));
  }

  async create(data: Partial<ExtendedOrder>): Promise<ExtendedOrder> {
    const orders = await this.getAll();

    const newOrder: ExtendedOrder = {
      id: data.id || `order_${Date.now()}`,
      orderNumber: data.orderNumber || this.generateOrderNumber(),
      restaurantId: data.restaurantId || 'rest_001',
      tableId: data.tableId || '',
      tableName: data.tableName || '',
      guestCount: data.guestCount || 1,
      createdBy: data.createdBy || '',
      createdByName: data.createdByName || '',
      items: data.items || [],
      subtotal: data.subtotal || 0,
      taxRate: data.taxRate || 0.0825,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      tipAmount: data.tipAmount || 0,
      totalAmount: data.totalAmount || 0,
      status: data.status || 'draft',
      paymentStatus: data.paymentStatus || 'pending',
      kitchenTicketIds: data.kitchenTicketIds || [],
      pendingSync: true,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await this.adapter.set(STORAGE_KEYS.ORDERS, orders);

    // Update active orders if not paid/cancelled
    if (newOrder.status !== 'paid' && newOrder.status !== 'cancelled') {
      await this.updateActiveOrders(orders);
    }

    return newOrder;
  }

  async update(id: string, data: Partial<ExtendedOrder>): Promise<ExtendedOrder> {
    const orders = await this.getAll();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      throw new Error(`Order ${id} not found`);
    }

    const updatedOrder: ExtendedOrder = {
      ...orders[index],
      ...data,
      updatedAt: new Date().toISOString(),
      pendingSync: true,
    };

    orders[index] = updatedOrder;
    await this.adapter.set(STORAGE_KEYS.ORDERS, orders);
    await this.updateActiveOrders(orders);

    return updatedOrder;
  }

  async delete(id: string): Promise<void> {
    const orders = await this.getAll();
    const filtered = orders.filter((o) => o.id !== id);
    await this.adapter.set(STORAGE_KEYS.ORDERS, filtered);
    await this.updateActiveOrders(filtered);
  }

  // ============== QUERY OPERATIONS ==============

  async query(options: QueryOptions<ExtendedOrder>): Promise<ExtendedOrder[]> {
    let orders = await this.getAll();

    // Apply filters
    if (options.filters) {
      orders = this.applyFilters(orders, options.filters);
    }

    // Apply sorting
    if (options.sortBy) {
      orders = this.sortOrders(orders, options.sortBy, options.sortOrder || 'desc');
    }

    // Apply pagination
    if (options.offset !== undefined) {
      orders = orders.slice(options.offset);
    }
    if (options.limit !== undefined) {
      orders = orders.slice(0, options.limit);
    }

    return orders;
  }

  async queryPaginated(
    options: QueryOptions<ExtendedOrder>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<ExtendedOrder>> {
    let orders = await this.getAll();

    if (options.filters) {
      orders = this.applyFilters(orders, options.filters);
    }

    if (options.sortBy) {
      orders = this.sortOrders(orders, options.sortBy, options.sortOrder || 'desc');
    }

    const total = orders.length;
    const offset = (page - 1) * pageSize;
    const items = orders.slice(offset, offset + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
    };
  }

  async count(filters?: QueryFilter<ExtendedOrder>[]): Promise<number> {
    let orders = await this.getAll();
    if (filters) {
      orders = this.applyFilters(orders, filters);
    }
    return orders.length;
  }

  async exists(id: string): Promise<boolean> {
    const order = await this.getById(id);
    return order !== null;
  }

  // ============== ORDER-SPECIFIC OPERATIONS ==============

  async getActiveOrders(): Promise<ExtendedOrder[]> {
    const active = await this.adapter.get<ExtendedOrder[]>(STORAGE_KEYS.ACTIVE);
    return active || [];
  }

  async getByTable(tableId: string): Promise<ExtendedOrder[]> {
    const orders = await this.getAll();
    return orders.filter((o) => o.tableId === tableId);
  }

  async getActiveOrderForTable(tableId: string): Promise<ExtendedOrder | null> {
    const active = await this.getActiveOrders();
    return active.find(
      (o) => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled'
    ) || null;
  }

  async getByStatus(status: ExtendedOrderStatus): Promise<ExtendedOrder[]> {
    const orders = await this.getAll();
    return orders.filter((o) => o.status === status);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<ExtendedOrder[]> {
    const orders = await this.getAll();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt).getTime();
      return orderDate >= start && orderDate <= end;
    });
  }

  async search(query: string): Promise<ExtendedOrder[]> {
    const orders = await this.getAll();
    const lowerQuery = query.toLowerCase();

    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(lowerQuery) ||
        o.tableName.toLowerCase().includes(lowerQuery) ||
        o.items.some((item) => item.name.toLowerCase().includes(lowerQuery))
    );
  }

  async getFiltered(filters: OrderFilters): Promise<ExtendedOrder[]> {
    let orders = await this.getAll();

    if (filters.status && filters.status !== 'all') {
      orders = orders.filter((o) => o.status === filters.status);
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      orders = orders.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    if (filters.tableId) {
      orders = orders.filter((o) => o.tableId === filters.tableId);
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate).getTime();
      const end = new Date(filters.endDate).getTime();
      orders = orders.filter((o) => {
        const date = new Date(o.createdAt).getTime();
        return date >= start && date <= end;
      });
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.tableName.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateStatus(id: string, status: ExtendedOrderStatus): Promise<ExtendedOrder> {
    const statusTimestamps: Partial<ExtendedOrder> = {};

    switch (status) {
      case 'confirmed':
        statusTimestamps.submittedAt = new Date().toISOString();
        break;
      case 'preparing':
        statusTimestamps.preparingAt = new Date().toISOString();
        break;
      case 'ready':
        statusTimestamps.readyAt = new Date().toISOString();
        break;
      case 'served':
        statusTimestamps.servedAt = new Date().toISOString();
        break;
      case 'paid':
        statusTimestamps.paidAt = new Date().toISOString();
        break;
      case 'cancelled':
        statusTimestamps.cancelledAt = new Date().toISOString();
        break;
    }

    return this.update(id, { status, ...statusTimestamps });
  }

  async updatePaymentStatus(id: string, status: ExtendedPaymentStatus): Promise<ExtendedOrder> {
    const updates: Partial<ExtendedOrder> = { paymentStatus: status };

    if (status === 'paid') {
      updates.paidAt = new Date().toISOString();
      updates.status = 'paid';
    }

    return this.update(id, updates);
  }

  async getStats(): Promise<OrderStats> {
    const orders = await this.getAll();
    const active = await this.getActiveOrders();

    const stats: OrderStats = {
      total: orders.length,
      active: active.length,
      pending: orders.filter((o) => o.status === 'draft' || o.status === 'confirmed').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      served: orders.filter((o) => o.status === 'served').length,
      paid: orders.filter((o) => o.status === 'paid').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      averageOrderValue: 0,
    };

    if (stats.paid > 0) {
      stats.averageOrderValue = stats.totalRevenue / stats.paid;
    }

    return stats;
  }

  // ============== SYNC OPERATIONS ==============

  async getPendingSync(): Promise<ExtendedOrder[]> {
    const orders = await this.getAll();
    return orders.filter((o) => o.pendingSync);
  }

  async markSynced(id: string, syncedAt: string): Promise<void> {
    await this.update(id, { syncedAt, pendingSync: false });
  }

  async markBatchSynced(ids: string[], syncedAt: string): Promise<void> {
    const orders = await this.getAll();
    const updated = orders.map((o) =>
      ids.includes(o.id) ? { ...o, syncedAt, pendingSync: false } : o
    );
    await this.adapter.set(STORAGE_KEYS.ORDERS, updated);
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.adapter.get<string>(STORAGE_KEYS.LAST_SYNC);
  }

  async setLastSyncTime(time: string): Promise<void> {
    await this.adapter.set(STORAGE_KEYS.LAST_SYNC, time);
  }

  // ============== HELPER METHODS ==============

  private async updateActiveOrders(allOrders: ExtendedOrder[]): Promise<void> {
    const active = allOrders.filter(
      (o) => o.status !== 'paid' && o.status !== 'cancelled'
    );
    await this.adapter.set(STORAGE_KEYS.ACTIVE, active);

    const history = allOrders.filter(
      (o) => o.status === 'paid' || o.status === 'cancelled'
    );
    await this.adapter.set(STORAGE_KEYS.HISTORY, history);
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${random}`;
  }

  private applyFilters(
    orders: ExtendedOrder[],
    filters: QueryFilter<ExtendedOrder>[]
  ): ExtendedOrder[] {
    return orders.filter((order) => {
      return filters.every((filter) => {
        const value = order[filter.field];
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'ne':
            return value !== filter.value;
          case 'gt':
            return (value as number) > (filter.value as number);
          case 'gte':
            return (value as number) >= (filter.value as number);
          case 'lt':
            return (value as number) < (filter.value as number);
          case 'lte':
            return (value as number) <= (filter.value as number);
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return (filter.value as unknown[]).includes(value);
          default:
            return true;
        }
      });
    });
  }

  private sortOrders(
    orders: ExtendedOrder[],
    sortBy: keyof ExtendedOrder,
    sortOrder: 'asc' | 'desc'
  ): ExtendedOrder[] {
    return [...orders].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === undefined || aVal === null) return sortOrder === 'asc' ? 1 : -1;
      if (bVal === undefined || bVal === null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }
}

// ============== SINGLETON INSTANCE ==============

export const orderRepository = new OrderRepository();
