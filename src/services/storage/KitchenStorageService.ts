/**
 * Kitchen Storage Service
 * Handles all kitchen ticket data persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './StorageService';
import {
  KitchenTicket,
  TicketStatus,
  TicketFilters,
  StationConfig,
  DEFAULT_STATION_CONFIGS,
  KitchenStation,
} from '@/types/kitchen-ticket.types';

// Kitchen storage data structure
interface KitchenStorageData {
  tickets: Record<string, KitchenTicket>;
  activeTicketIds: string[];
  completedTicketIds: string[];
  lastUpdated: string;
}

interface StationConfigStorageData {
  configs: StationConfig[];
  lastUpdated: string;
}

// Default empty storage
const EMPTY_KITCHEN_STORAGE: KitchenStorageData = {
  tickets: {},
  activeTicketIds: [],
  completedTicketIds: [],
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_STATION_CONFIG_STORAGE: StationConfigStorageData = {
  configs: DEFAULT_STATION_CONFIGS,
  lastUpdated: new Date().toISOString(),
};

/**
 * KitchenStorageService - Manages kitchen ticket persistence
 */
class KitchenStorageService {
  private ticketsCache: KitchenStorageData | null = null;
  private stationConfigCache: StationConfigStorageData | null = null;

  // ============== INITIALIZATION ==============

  /**
   * Initialize storage and load data into cache
   */
  async initialize(): Promise<void> {
    try {
      await this.loadTicketsFromStorage();
      await this.loadStationConfigFromStorage();
    } catch (error) {
      console.error('[KitchenStorage] Initialization error:', error);
      this.ticketsCache = { ...EMPTY_KITCHEN_STORAGE };
      this.stationConfigCache = { ...DEFAULT_STATION_CONFIG_STORAGE };
    }
  }

  /**
   * Load tickets from AsyncStorage
   */
  private async loadTicketsFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.KITCHEN_TICKETS);
      if (data) {
        this.ticketsCache = JSON.parse(data);
      } else {
        this.ticketsCache = { ...EMPTY_KITCHEN_STORAGE };
      }
    } catch (error) {
      console.error('[KitchenStorage] Error loading tickets:', error);
      this.ticketsCache = { ...EMPTY_KITCHEN_STORAGE };
    }
  }

  /**
   * Load station config from AsyncStorage
   */
  private async loadStationConfigFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.KITCHEN_STATION_CONFIG);
      if (data) {
        this.stationConfigCache = JSON.parse(data);
      } else {
        this.stationConfigCache = { ...DEFAULT_STATION_CONFIG_STORAGE };
      }
    } catch (error) {
      console.error('[KitchenStorage] Error loading station config:', error);
      this.stationConfigCache = { ...DEFAULT_STATION_CONFIG_STORAGE };
    }
  }

  /**
   * Save tickets to AsyncStorage
   */
  private async saveTicketsToStorage(): Promise<void> {
    if (!this.ticketsCache) return;

    try {
      this.ticketsCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.KITCHEN_TICKETS, JSON.stringify(this.ticketsCache));
    } catch (error) {
      console.error('[KitchenStorage] Error saving tickets:', error);
      throw error;
    }
  }

  /**
   * Save station config to AsyncStorage
   */
  private async saveStationConfigToStorage(): Promise<void> {
    if (!this.stationConfigCache) return;

    try {
      this.stationConfigCache.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(
        STORAGE_KEYS.KITCHEN_STATION_CONFIG,
        JSON.stringify(this.stationConfigCache)
      );
    } catch (error) {
      console.error('[KitchenStorage] Error saving station config:', error);
      throw error;
    }
  }

  // ============== TICKET CRUD OPERATIONS ==============

  /**
   * Save a new ticket or update existing
   */
  async saveTicket(ticket: KitchenTicket): Promise<void> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return;

    this.ticketsCache.tickets[ticket.id] = ticket;

    // Update active/completed lists
    if (this.isActiveTicket(ticket)) {
      if (!this.ticketsCache.activeTicketIds.includes(ticket.id)) {
        this.ticketsCache.activeTicketIds.push(ticket.id);
      }
      // Remove from completed if exists
      this.ticketsCache.completedTicketIds = this.ticketsCache.completedTicketIds.filter(
        (id) => id !== ticket.id
      );
    } else {
      if (!this.ticketsCache.completedTicketIds.includes(ticket.id)) {
        this.ticketsCache.completedTicketIds.push(ticket.id);
      }
      // Remove from active if exists
      this.ticketsCache.activeTicketIds = this.ticketsCache.activeTicketIds.filter(
        (id) => id !== ticket.id
      );
    }

    await this.saveTicketsToStorage();
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<KitchenTicket | null> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    return this.ticketsCache?.tickets[ticketId] || null;
  }

  /**
   * Get all active tickets
   */
  async getActiveTickets(): Promise<KitchenTicket[]> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return [];

    return this.ticketsCache.activeTicketIds
      .map((id) => this.ticketsCache!.tickets[id])
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }

  /**
   * Get tickets by order ID
   */
  async getTicketsByOrder(orderId: string): Promise<KitchenTicket[]> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return [];

    return Object.values(this.ticketsCache.tickets).filter((t) => t.orderId === orderId);
  }

  /**
   * Get tickets by station
   */
  async getTicketsByStation(station: KitchenStation): Promise<KitchenTicket[]> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return [];

    return Object.values(this.ticketsCache.tickets)
      .filter((t) => t.station === station && this.isActiveTicket(t))
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }

  /**
   * Get tickets with filters
   */
  async getTickets(filters?: TicketFilters): Promise<KitchenTicket[]> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return [];

    let tickets = Object.values(this.ticketsCache.tickets);

    if (filters) {
      // Filter by station
      if (filters.station && filters.station !== 'all') {
        tickets = tickets.filter((t) => t.station === filters.station);
      }

      // Filter by status
      if (filters.status && filters.status !== 'all') {
        tickets = tickets.filter((t) => t.status === filters.status);
      }

      // Filter by priority
      if (filters.priority && filters.priority !== 'all') {
        tickets = tickets.filter((t) => t.priority === filters.priority);
      }

      // Filter by allergens
      if (filters.hasAllergens !== undefined) {
        tickets = tickets.filter((t) => t.hasAllergens === filters.hasAllergens);
      }

      // Filter by overdue
      if (filters.isOverdue !== undefined) {
        tickets = tickets.filter((t) => t.isOverdue === filters.isOverdue);
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        tickets = tickets.filter(
          (t) =>
            t.orderNumber.toLowerCase().includes(query) ||
            t.tableName.toLowerCase().includes(query) ||
            t.items.some((item) => item.name.toLowerCase().includes(query))
        );
      }
    }

    return tickets.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  /**
   * Update a ticket
   */
  async updateTicket(
    ticketId: string,
    updates: Partial<KitchenTicket>
  ): Promise<KitchenTicket | null> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return null;

    const existingTicket = this.ticketsCache.tickets[ticketId];
    if (!existingTicket) return null;

    const updatedTicket: KitchenTicket = {
      ...existingTicket,
      ...updates,
    };

    await this.saveTicket(updatedTicket);
    return updatedTicket;
  }

  /**
   * Delete a ticket
   */
  async deleteTicket(ticketId: string): Promise<void> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return;

    // Remove from all lists
    this.ticketsCache.activeTicketIds = this.ticketsCache.activeTicketIds.filter(
      (id) => id !== ticketId
    );
    this.ticketsCache.completedTicketIds = this.ticketsCache.completedTicketIds.filter(
      (id) => id !== ticketId
    );
    delete this.ticketsCache.tickets[ticketId];

    await this.saveTicketsToStorage();
  }

  // ============== BULK OPERATIONS ==============

  /**
   * Save multiple tickets at once
   */
  async saveTickets(tickets: KitchenTicket[]): Promise<void> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return;

    for (const ticket of tickets) {
      this.ticketsCache.tickets[ticket.id] = ticket;

      if (this.isActiveTicket(ticket)) {
        if (!this.ticketsCache.activeTicketIds.includes(ticket.id)) {
          this.ticketsCache.activeTicketIds.push(ticket.id);
        }
      } else {
        if (!this.ticketsCache.completedTicketIds.includes(ticket.id)) {
          this.ticketsCache.completedTicketIds.push(ticket.id);
        }
      }
    }

    await this.saveTicketsToStorage();
  }

  /**
   * Delete tickets by order ID
   */
  async deleteTicketsByOrder(orderId: string): Promise<void> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return;

    const ticketIds = Object.values(this.ticketsCache.tickets)
      .filter((t) => t.orderId === orderId)
      .map((t) => t.id);

    for (const ticketId of ticketIds) {
      this.ticketsCache.activeTicketIds = this.ticketsCache.activeTicketIds.filter(
        (id) => id !== ticketId
      );
      this.ticketsCache.completedTicketIds = this.ticketsCache.completedTicketIds.filter(
        (id) => id !== ticketId
      );
      delete this.ticketsCache.tickets[ticketId];
    }

    await this.saveTicketsToStorage();
  }

  /**
   * Clear old tickets (completed, older than specified date)
   */
  async clearOldTickets(beforeDate: Date): Promise<number> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return 0;

    const cutoffTime = beforeDate.getTime();
    let deletedCount = 0;

    // Only clear from completed tickets
    const ticketsToDelete = this.ticketsCache.completedTicketIds.filter((id) => {
      const ticket = this.ticketsCache!.tickets[id];
      if (ticket && new Date(ticket.createdAt).getTime() < cutoffTime) {
        return true;
      }
      return false;
    });

    for (const ticketId of ticketsToDelete) {
      delete this.ticketsCache.tickets[ticketId];
      deletedCount++;
    }

    this.ticketsCache.completedTicketIds = this.ticketsCache.completedTicketIds.filter(
      (id) => !ticketsToDelete.includes(id)
    );

    await this.saveTicketsToStorage();
    return deletedCount;
  }

  // ============== STATION CONFIG ==============

  /**
   * Get all station configs
   */
  async getStationConfigs(): Promise<StationConfig[]> {
    if (!this.stationConfigCache) await this.loadStationConfigFromStorage();
    return this.stationConfigCache?.configs || DEFAULT_STATION_CONFIGS;
  }

  /**
   * Get station config by station
   */
  async getStationConfig(station: KitchenStation): Promise<StationConfig | null> {
    if (!this.stationConfigCache) await this.loadStationConfigFromStorage();
    return (
      this.stationConfigCache?.configs.find((c) => c.station === station) ||
      DEFAULT_STATION_CONFIGS.find((c) => c.station === station) ||
      null
    );
  }

  /**
   * Update station config
   */
  async updateStationConfig(station: KitchenStation, updates: Partial<StationConfig>): Promise<void> {
    if (!this.stationConfigCache) await this.loadStationConfigFromStorage();
    if (!this.stationConfigCache) return;

    const index = this.stationConfigCache.configs.findIndex((c) => c.station === station);
    if (index !== -1) {
      this.stationConfigCache.configs[index] = {
        ...this.stationConfigCache.configs[index],
        ...updates,
      };
      await this.saveStationConfigToStorage();
    }
  }

  /**
   * Reset station configs to defaults
   */
  async resetStationConfigs(): Promise<void> {
    this.stationConfigCache = { ...DEFAULT_STATION_CONFIG_STORAGE };
    await this.saveStationConfigToStorage();
  }

  // ============== SYNC OPERATIONS ==============

  /**
   * Get tickets pending sync
   */
  async getUnsyncedTickets(): Promise<KitchenTicket[]> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return [];

    return Object.values(this.ticketsCache.tickets).filter((t) => t.pendingSync);
  }

  /**
   * Mark tickets as synced
   */
  async markAsSynced(ticketIds: string[]): Promise<void> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) return;

    const now = new Date().toISOString();

    for (const ticketId of ticketIds) {
      if (this.ticketsCache.tickets[ticketId]) {
        this.ticketsCache.tickets[ticketId].pendingSync = false;
        this.ticketsCache.tickets[ticketId].syncedAt = now;
      }
    }

    await this.saveTicketsToStorage();
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.KITCHEN_LAST_SYNC);
    } catch (error) {
      console.error('[KitchenStorage] Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.KITCHEN_LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('[KitchenStorage] Error updating last sync time:', error);
    }
  }

  // ============== STATISTICS ==============

  /**
   * Get kitchen statistics
   */
  async getStats(): Promise<{
    totalTickets: number;
    pendingTickets: number;
    preparingTickets: number;
    readyTickets: number;
    overdueTickets: number;
    byStation: Record<KitchenStation, number>;
  }> {
    if (!this.ticketsCache) await this.loadTicketsFromStorage();
    if (!this.ticketsCache) {
      return {
        totalTickets: 0,
        pendingTickets: 0,
        preparingTickets: 0,
        readyTickets: 0,
        overdueTickets: 0,
        byStation: {
          hot_kitchen: 0,
          cold_kitchen: 0,
          grill: 0,
          desserts: 0,
          beverages: 0,
          bar: 0,
        },
      };
    }

    const activeTickets = Object.values(this.ticketsCache.tickets).filter((t) =>
      this.isActiveTicket(t)
    );

    const byStation: Record<KitchenStation, number> = {
      hot_kitchen: 0,
      cold_kitchen: 0,
      grill: 0,
      desserts: 0,
      beverages: 0,
      bar: 0,
    };

    for (const ticket of activeTickets) {
      byStation[ticket.station]++;
    }

    return {
      totalTickets: activeTickets.length,
      pendingTickets: activeTickets.filter((t) => t.status === 'pending').length,
      preparingTickets: activeTickets.filter((t) => t.status === 'preparing').length,
      readyTickets: activeTickets.filter((t) => t.status === 'ready').length,
      overdueTickets: activeTickets.filter((t) => t.isOverdue).length,
      byStation,
    };
  }

  // ============== UTILITY METHODS ==============

  /**
   * Check if ticket is active
   */
  private isActiveTicket(ticket: KitchenTicket): boolean {
    const completedStatuses: TicketStatus[] = ['served', 'cancelled'];
    return !completedStatuses.includes(ticket.status);
  }

  /**
   * Clear all kitchen data (use with caution)
   */
  async clearAll(): Promise<void> {
    this.ticketsCache = { ...EMPTY_KITCHEN_STORAGE };
    this.stationConfigCache = { ...DEFAULT_STATION_CONFIG_STORAGE };

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.KITCHEN_TICKETS),
      AsyncStorage.removeItem(STORAGE_KEYS.KITCHEN_STATION_CONFIG),
      AsyncStorage.removeItem(STORAGE_KEYS.KITCHEN_LAST_SYNC),
    ]);
  }
}

// Export singleton instance
export const kitchenStorageService = new KitchenStorageService();
