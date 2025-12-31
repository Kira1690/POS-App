/**
 * TicketRoutingService - Routes order items to appropriate kitchen stations
 * Handles ticket creation, grouping, and priority assignment
 */

import { ExtendedOrderItem, KitchenStation, DEFAULT_CATEGORY_STATION_MAP } from '@/types/order-extended.types';
import {
  KitchenTicket,
  KitchenTicketItem,
  TicketStatus,
  TicketPriority,
  StationConfig,
  DEFAULT_STATION_CONFIGS,
  generateTicketId,
  formatModifiersForDisplay,
} from '@/types/kitchen-ticket.types';

/**
 * Configuration for ticket routing
 */
interface RoutingConfig {
  categoryStationMap: Record<string, KitchenStation>;
  stationConfigs: Record<KitchenStation, StationConfig>;
  defaultPriority: TicketPriority;
  rushOrderThresholdMinutes: number;
}

/**
 * Result of ticket routing operation
 */
interface RoutingResult {
  tickets: KitchenTicket[];
  ticketsByStation: Map<KitchenStation, KitchenTicket>;
  totalEstimatedPrepTime: number;
  hasAllergenItems: boolean;
  hasRushItems: boolean;
}

/**
 * Order item with routing information
 */
interface RoutedItem extends ExtendedOrderItem {
  targetStation: KitchenStation;
  ticketItem: KitchenTicketItem;
}

const DEFAULT_ROUTING_CONFIG: RoutingConfig = {
  categoryStationMap: DEFAULT_CATEGORY_STATION_MAP,
  stationConfigs: DEFAULT_STATION_CONFIGS,
  defaultPriority: 'normal',
  rushOrderThresholdMinutes: 30,
};

class TicketRoutingService {
  private config: RoutingConfig;

  constructor(config: Partial<RoutingConfig> = {}) {
    this.config = { ...DEFAULT_ROUTING_CONFIG, ...config };
  }

  /**
   * Route order items to kitchen stations and create tickets
   */
  routeOrderToTickets(
    orderId: string,
    orderNumber: string,
    tableName: string,
    items: ExtendedOrderItem[],
    priority: TicketPriority = 'normal'
  ): RoutingResult {
    // Group items by station
    const itemsByStation = this.groupItemsByStation(items);

    // Create tickets for each station
    const tickets: KitchenTicket[] = [];
    const ticketsByStation = new Map<KitchenStation, KitchenTicket>();
    let hasAllergenItems = false;

    itemsByStation.forEach((stationItems, station) => {
      const stationConfig = this.config.stationConfigs[station];

      // Create ticket items
      const ticketItems: KitchenTicketItem[] = stationItems.map((item) => {
        const ticketItem = this.createTicketItem(item, station);
        if (ticketItem.hasAllergens) {
          hasAllergenItems = true;
        }
        return ticketItem;
      });

      // Calculate estimated prep time for this ticket
      const estimatedPrepTime = this.calculateEstimatedPrepTime(
        ticketItems,
        stationConfig
      );

      // Create the ticket
      const ticket = this.createTicket(
        orderId,
        orderNumber,
        tableName,
        station,
        ticketItems,
        priority,
        estimatedPrepTime
      );

      tickets.push(ticket);
      ticketsByStation.set(station, ticket);
    });

    // Calculate total estimated prep time (max across all stations)
    const totalEstimatedPrepTime = Math.max(
      ...tickets.map((t) => t.estimatedPrepTime)
    );

    return {
      tickets,
      ticketsByStation,
      totalEstimatedPrepTime,
      hasAllergenItems,
      hasRushItems: priority === 'rush' || priority === 'vip',
    };
  }

  /**
   * Group items by their target kitchen station
   */
  private groupItemsByStation(
    items: ExtendedOrderItem[]
  ): Map<KitchenStation, ExtendedOrderItem[]> {
    const grouped = new Map<KitchenStation, ExtendedOrderItem[]>();

    items.forEach((item) => {
      const station = item.kitchenStation;
      const existing = grouped.get(station) || [];
      grouped.set(station, [...existing, item]);
    });

    return grouped;
  }

  /**
   * Create a ticket item from an order item
   */
  private createTicketItem(
    item: ExtendedOrderItem,
    station: KitchenStation
  ): KitchenTicketItem {
    const stationConfig = this.config.stationConfigs[station];

    return {
      id: `ti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderItemId: item.id,
      name: item.name,
      quantity: item.quantity,
      modifiers: formatModifiersForDisplay(item.selectedModifiers),
      notes: item.notes,
      status: 'pending',
      estimatedPrepTime: stationConfig.defaultPrepTime,
      allergens: item.allergens || [],
      hasAllergens: (item.allergens && item.allergens.length > 0) || false,
      dietaryTags: item.dietaryTags,
    };
  }

  /**
   * Create a kitchen ticket
   */
  private createTicket(
    orderId: string,
    orderNumber: string,
    tableName: string,
    station: KitchenStation,
    items: KitchenTicketItem[],
    priority: TicketPriority,
    estimatedPrepTime: number
  ): KitchenTicket {
    const now = new Date();
    const stationConfig = this.config.stationConfigs[station];

    return {
      id: generateTicketId(),
      orderId,
      orderNumber,
      tableName,
      station,
      items,
      priority,
      status: 'pending',
      estimatedPrepTime,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      hasAllergens: items.some((i) => i.hasAllergens),
      isOverdue: false,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  /**
   * Calculate estimated prep time for a set of items
   */
  private calculateEstimatedPrepTime(
    items: KitchenTicketItem[],
    stationConfig: StationConfig
  ): number {
    if (items.length === 0) return 0;

    // Base time is the station's default prep time
    let baseTime = stationConfig.defaultPrepTime;

    // Add time for quantity (logarithmic scaling)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const quantityFactor = Math.log2(totalQuantity + 1);

    // Add time for complex items (items with modifiers)
    const complexItems = items.filter((i) => i.modifiers && i.modifiers.length > 0);
    const complexityBonus = complexItems.length * 2; // 2 minutes per complex item

    return Math.round(baseTime * quantityFactor + complexityBonus);
  }

  /**
   * Update station configuration
   */
  updateStationConfig(station: KitchenStation, config: Partial<StationConfig>): void {
    this.config.stationConfigs[station] = {
      ...this.config.stationConfigs[station],
      ...config,
    };
  }

  /**
   * Update category to station mapping
   */
  updateCategoryMapping(categoryId: string, station: KitchenStation): void {
    this.config.categoryStationMap[categoryId] = station;
  }

  /**
   * Get station for a category
   */
  getStationForCategory(categoryId: string): KitchenStation {
    return this.config.categoryStationMap[categoryId] || 'hot_kitchen';
  }

  /**
   * Get station configuration
   */
  getStationConfig(station: KitchenStation): StationConfig {
    return this.config.stationConfigs[station];
  }

  /**
   * Get all station configurations
   */
  getAllStationConfigs(): Record<KitchenStation, StationConfig> {
    return { ...this.config.stationConfigs };
  }

  /**
   * Check if ticket is overdue
   */
  isTicketOverdue(ticket: KitchenTicket): boolean {
    if (ticket.status === 'ready' || ticket.status === 'served' || ticket.status === 'cancelled') {
      return false;
    }

    const createdAt = new Date(ticket.createdAt);
    const now = new Date();
    const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    return elapsedMinutes > ticket.estimatedPrepTime;
  }

  /**
   * Calculate priority score for ticket sorting
   */
  calculatePriorityScore(ticket: KitchenTicket): number {
    let score = 0;

    // Priority bonus
    switch (ticket.priority) {
      case 'rush':
        score += 100;
        break;
      case 'vip':
        score += 80;
        break;
      case 'high':
        score += 60;
        break;
      case 'normal':
        score += 40;
        break;
      case 'low':
        score += 20;
        break;
    }

    // Overdue tickets get highest priority
    if (this.isTicketOverdue(ticket)) {
      score += 150;
    }

    // Age bonus (older tickets get higher priority)
    const createdAt = new Date(ticket.createdAt);
    const ageMinutes = (Date.now() - createdAt.getTime()) / (1000 * 60);
    score += Math.min(ageMinutes * 2, 50); // Max 50 points for age

    // Allergen items get slight boost for attention
    if (ticket.hasAllergens) {
      score += 10;
    }

    return score;
  }

  /**
   * Sort tickets by priority
   */
  sortTicketsByPriority(tickets: KitchenTicket[]): KitchenTicket[] {
    return [...tickets].sort((a, b) => {
      return this.calculatePriorityScore(b) - this.calculatePriorityScore(a);
    });
  }

  /**
   * Get tickets grouped by status
   */
  groupTicketsByStatus(
    tickets: KitchenTicket[]
  ): Map<TicketStatus, KitchenTicket[]> {
    const grouped = new Map<TicketStatus, KitchenTicket[]>();
    const statuses: TicketStatus[] = ['pending', 'preparing', 'ready', 'served', 'cancelled'];

    statuses.forEach((status) => {
      grouped.set(status, []);
    });

    tickets.forEach((ticket) => {
      const statusTickets = grouped.get(ticket.status) || [];
      grouped.set(ticket.status, [...statusTickets, ticket]);
    });

    // Sort each group by priority
    grouped.forEach((statusTickets, status) => {
      grouped.set(status, this.sortTicketsByPriority(statusTickets));
    });

    return grouped;
  }

  /**
   * Merge tickets from same order/station if needed
   */
  mergeTickets(tickets: KitchenTicket[]): KitchenTicket[] {
    const merged = new Map<string, KitchenTicket>();

    tickets.forEach((ticket) => {
      const key = `${ticket.orderId}_${ticket.station}`;
      const existing = merged.get(key);

      if (existing && existing.status === 'pending' && ticket.status === 'pending') {
        // Merge items into existing ticket
        existing.items = [...existing.items, ...ticket.items];
        existing.totalItems += ticket.totalItems;
        existing.estimatedPrepTime = Math.max(
          existing.estimatedPrepTime,
          ticket.estimatedPrepTime
        );
        existing.hasAllergens = existing.hasAllergens || ticket.hasAllergens;
        existing.updatedAt = new Date().toISOString();
      } else {
        merged.set(key, { ...ticket });
      }
    });

    return Array.from(merged.values());
  }
}

// Export singleton instance
export const ticketRoutingService = new TicketRoutingService();

// Export class for custom instances
export { TicketRoutingService };
export type { RoutingConfig, RoutingResult, RoutedItem };
