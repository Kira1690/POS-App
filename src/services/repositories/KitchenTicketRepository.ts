/**
 * Kitchen Ticket Repository - Ticket data access implementation
 * Uses AsyncStorageAdapter for local persistence
 * API-ready: Can be swapped to use ApiAdapter when backend is ready
 */

import {
  IKitchenTicketRepository,
  TicketFilters,
  KitchenStats,
  StationStats,
  QueryOptions,
  QueryFilter,
  PaginatedResult,
} from './interfaces/IRepository';
import { AsyncStorageAdapter } from './adapters/AsyncStorageAdapter';
import {
  KitchenTicket,
  TicketStatus,
  KitchenStation,
  isTicketOverdue,
  getStationConfig,
} from '@/types/kitchen-ticket.types';

const STORAGE_KEYS = {
  TICKETS: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  LAST_SYNC: 'last_sync',
};

const STATUS_FLOW: Record<TicketStatus, TicketStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: null,
  cancelled: null,
};

export class KitchenTicketRepository implements IKitchenTicketRepository {
  private adapter: AsyncStorageAdapter;

  constructor(adapter?: AsyncStorageAdapter) {
    this.adapter = adapter || new AsyncStorageAdapter({ prefix: 'pos_kitchen_' });
  }

  // ============== BASE CRUD OPERATIONS ==============

  async getAll(): Promise<KitchenTicket[]> {
    const tickets = await this.adapter.get<KitchenTicket[]>(STORAGE_KEYS.TICKETS);
    return this.updateOverdueStatus(tickets || []);
  }

  async getById(id: string): Promise<KitchenTicket | null> {
    const tickets = await this.getAll();
    return tickets.find((t) => t.id === id) || null;
  }

  async getByIds(ids: string[]): Promise<KitchenTicket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => ids.includes(t.id));
  }

  async create(data: Partial<KitchenTicket>): Promise<KitchenTicket> {
    const tickets = await this.getAll();

    const newTicket: KitchenTicket = {
      id: data.id || `ticket_${Date.now()}`,
      orderId: data.orderId || '',
      orderNumber: data.orderNumber || '',
      tableId: data.tableId || '',
      tableName: data.tableName || '',
      guestCount: data.guestCount,
      station: data.station || 'hot_kitchen',
      items: data.items || [],
      itemCount: data.items?.length || 0,
      completedItemCount: 0,
      status: data.status || 'pending',
      priority: data.priority || 'normal',
      estimatedPrepTime: data.estimatedPrepTime || 15,
      hasAllergens: data.hasAllergens || false,
      allergenItems: data.allergenItems || [],
      isRush: data.isRush || false,
      isOverdue: false,
      specialInstructions: data.specialInstructions,
      pendingSync: true,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    // Check if overdue
    const config = getStationConfig(newTicket.station);
    newTicket.isOverdue = isTicketOverdue(newTicket, config);

    tickets.push(newTicket);
    await this.adapter.set(STORAGE_KEYS.TICKETS, tickets);
    await this.updateActiveTickets(tickets);

    return newTicket;
  }

  async update(id: string, data: Partial<KitchenTicket>): Promise<KitchenTicket> {
    const tickets = await this.getAll();
    const index = tickets.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error(`Ticket ${id} not found`);
    }

    const updatedTicket: KitchenTicket = {
      ...tickets[index],
      ...data,
      pendingSync: true,
    };

    // Recalculate overdue status
    const config = getStationConfig(updatedTicket.station);
    updatedTicket.isOverdue = isTicketOverdue(updatedTicket, config);

    // Calculate completed items
    updatedTicket.completedItemCount = updatedTicket.items.filter(
      (item) => item.status === 'ready' || item.status === 'served'
    ).length;

    tickets[index] = updatedTicket;
    await this.adapter.set(STORAGE_KEYS.TICKETS, tickets);
    await this.updateActiveTickets(tickets);

    return updatedTicket;
  }

  async delete(id: string): Promise<void> {
    const tickets = await this.getAll();
    const filtered = tickets.filter((t) => t.id !== id);
    await this.adapter.set(STORAGE_KEYS.TICKETS, filtered);
    await this.updateActiveTickets(filtered);
  }

  // ============== QUERY OPERATIONS ==============

  async query(options: QueryOptions<KitchenTicket>): Promise<KitchenTicket[]> {
    let tickets = await this.getAll();

    if (options.filters) {
      tickets = this.applyFilters(tickets, options.filters);
    }

    if (options.sortBy) {
      tickets = this.sortTickets(tickets, options.sortBy, options.sortOrder || 'desc');
    }

    if (options.offset !== undefined) {
      tickets = tickets.slice(options.offset);
    }
    if (options.limit !== undefined) {
      tickets = tickets.slice(0, options.limit);
    }

    return tickets;
  }

  async queryPaginated(
    options: QueryOptions<KitchenTicket>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<KitchenTicket>> {
    let tickets = await this.getAll();

    if (options.filters) {
      tickets = this.applyFilters(tickets, options.filters);
    }

    if (options.sortBy) {
      tickets = this.sortTickets(tickets, options.sortBy, options.sortOrder || 'desc');
    }

    const total = tickets.length;
    const offset = (page - 1) * pageSize;
    const items = tickets.slice(offset, offset + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
    };
  }

  async count(filters?: QueryFilter<KitchenTicket>[]): Promise<number> {
    let tickets = await this.getAll();
    if (filters) {
      tickets = this.applyFilters(tickets, filters);
    }
    return tickets.length;
  }

  async exists(id: string): Promise<boolean> {
    const ticket = await this.getById(id);
    return ticket !== null;
  }

  // ============== TICKET-SPECIFIC OPERATIONS ==============

  async getActiveTickets(): Promise<KitchenTicket[]> {
    const active = await this.adapter.get<KitchenTicket[]>(STORAGE_KEYS.ACTIVE);
    return this.updateOverdueStatus(active || []);
  }

  async getByStation(station: KitchenStation): Promise<KitchenTicket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => t.station === station);
  }

  async getByStatus(status: TicketStatus): Promise<KitchenTicket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => t.status === status);
  }

  async getByOrder(orderId: string): Promise<KitchenTicket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => t.orderId === orderId);
  }

  async getOverdueTickets(): Promise<KitchenTicket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => t.isOverdue);
  }

  async getFiltered(filters: TicketFilters): Promise<KitchenTicket[]> {
    let tickets = await this.getAll();

    if (filters.station && filters.station !== 'all') {
      tickets = tickets.filter((t) => t.station === filters.station);
    }

    if (filters.status && filters.status !== 'all') {
      tickets = tickets.filter((t) => t.status === filters.status);
    }

    if (filters.orderId) {
      tickets = tickets.filter((t) => t.orderId === filters.orderId);
    }

    if (filters.isOverdue !== undefined) {
      tickets = tickets.filter((t) => t.isOverdue === filters.isOverdue);
    }

    if (filters.hasAllergens !== undefined) {
      tickets = tickets.filter((t) => t.hasAllergens === filters.hasAllergens);
    }

    // Sort by priority and creation time
    return this.sortByPriorityAndTime(tickets);
  }

  async updateStatus(id: string, status: TicketStatus): Promise<KitchenTicket> {
    const updates: Partial<KitchenTicket> = { status };

    switch (status) {
      case 'preparing':
        updates.startedAt = new Date().toISOString();
        break;
      case 'ready':
        updates.completedAt = new Date().toISOString();
        // Calculate actual prep time
        const ticket = await this.getById(id);
        if (ticket?.startedAt) {
          const startTime = new Date(ticket.startedAt).getTime();
          const now = Date.now();
          updates.actualPrepTime = Math.round((now - startTime) / (1000 * 60));
        }
        break;
      case 'served':
        updates.servedAt = new Date().toISOString();
        break;
    }

    return this.update(id, updates);
  }

  async bumpStatus(id: string): Promise<KitchenTicket> {
    const ticket = await this.getById(id);
    if (!ticket) {
      throw new Error(`Ticket ${id} not found`);
    }

    const nextStatus = STATUS_FLOW[ticket.status];
    if (!nextStatus) {
      throw new Error(`Cannot bump ticket from status ${ticket.status}`);
    }

    return this.updateStatus(id, nextStatus);
  }

  async updateItemStatus(
    ticketId: string,
    itemId: string,
    status: string
  ): Promise<KitchenTicket> {
    const ticket = await this.getById(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const updatedItems = ticket.items.map((item) =>
      item.id === itemId
        ? { ...item, status: status as any, statusUpdatedAt: new Date().toISOString() }
        : item
    );

    return this.update(ticketId, { items: updatedItems });
  }

  async getStats(): Promise<KitchenStats> {
    const tickets = await this.getAll();

    const stations: KitchenStation[] = [
      'hot_kitchen',
      'cold_kitchen',
      'grill',
      'desserts',
      'beverages',
      'bar',
    ];

    const byStation: Record<KitchenStation, StationStats> = {} as any;

    stations.forEach((station) => {
      const stationTickets = tickets.filter((t) => t.station === station);
      byStation[station] = {
        pending: stationTickets.filter((t) => t.status === 'pending').length,
        preparing: stationTickets.filter((t) => t.status === 'preparing').length,
        ready: stationTickets.filter((t) => t.status === 'ready').length,
        overdue: stationTickets.filter((t) => t.isOverdue).length,
        avgPrepTime: this.calculateAvgPrepTime(stationTickets),
      };
    });

    const completedTickets = tickets.filter(
      (t) => t.status === 'ready' || t.status === 'served'
    );

    return {
      total: tickets.length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      preparing: tickets.filter((t) => t.status === 'preparing').length,
      ready: tickets.filter((t) => t.status === 'ready').length,
      overdue: tickets.filter((t) => t.isOverdue).length,
      avgPrepTime: this.calculateAvgPrepTime(completedTickets),
      byStation,
    };
  }

  // ============== SYNC OPERATIONS ==============

  async getPendingSync(): Promise<KitchenTicket[]> {
    const tickets = await this.getAll();
    return tickets.filter((t) => t.pendingSync);
  }

  async markSynced(id: string, syncedAt: string): Promise<void> {
    await this.update(id, { syncedAt, pendingSync: false });
  }

  async markBatchSynced(ids: string[], syncedAt: string): Promise<void> {
    const tickets = await this.getAll();
    const updated = tickets.map((t) =>
      ids.includes(t.id) ? { ...t, syncedAt, pendingSync: false } : t
    );
    await this.adapter.set(STORAGE_KEYS.TICKETS, updated);
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.adapter.get<string>(STORAGE_KEYS.LAST_SYNC);
  }

  async setLastSyncTime(time: string): Promise<void> {
    await this.adapter.set(STORAGE_KEYS.LAST_SYNC, time);
  }

  // ============== HELPER METHODS ==============

  private async updateActiveTickets(allTickets: KitchenTicket[]): Promise<void> {
    const active = allTickets.filter(
      (t) => t.status !== 'served' && t.status !== 'cancelled'
    );
    await this.adapter.set(STORAGE_KEYS.ACTIVE, active);

    const completed = allTickets.filter(
      (t) => t.status === 'served' || t.status === 'cancelled'
    );
    await this.adapter.set(STORAGE_KEYS.COMPLETED, completed);
  }

  private updateOverdueStatus(tickets: KitchenTicket[]): KitchenTicket[] {
    return tickets.map((ticket) => {
      const config = getStationConfig(ticket.station);
      return {
        ...ticket,
        isOverdue: isTicketOverdue(ticket, config),
      };
    });
  }

  private sortByPriorityAndTime(tickets: KitchenTicket[]): KitchenTicket[] {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

    return [...tickets].sort((a, b) => {
      // First by overdue status
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }

      // Then by priority
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // Then by creation time (older first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  private calculateAvgPrepTime(tickets: KitchenTicket[]): number {
    const completedWithTime = tickets.filter((t) => t.actualPrepTime !== undefined);
    if (completedWithTime.length === 0) return 0;

    const total = completedWithTime.reduce((sum, t) => sum + (t.actualPrepTime || 0), 0);
    return Math.round(total / completedWithTime.length);
  }

  private applyFilters(
    tickets: KitchenTicket[],
    filters: QueryFilter<KitchenTicket>[]
  ): KitchenTicket[] {
    return tickets.filter((ticket) => {
      return filters.every((filter) => {
        const value = ticket[filter.field];
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

  private sortTickets(
    tickets: KitchenTicket[],
    sortBy: keyof KitchenTicket,
    sortOrder: 'asc' | 'desc'
  ): KitchenTicket[] {
    return [...tickets].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === undefined || aVal === null) return sortOrder === 'asc' ? 1 : -1;
      if (bVal === undefined || bVal === null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }
}

// ============== SINGLETON INSTANCE ==============

export const kitchenTicketRepository = new KitchenTicketRepository();
