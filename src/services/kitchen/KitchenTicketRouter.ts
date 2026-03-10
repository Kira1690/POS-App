/**
 * Kitchen Ticket Router - Routes orders to appropriate kitchen stations
 *
 * This service is responsible for:
 * 1. Analyzing order items and their categories
 * 2. Creating kitchen tickets grouped by station
 * 3. Calculating estimated prep times
 * 4. Handling allergen warnings
 * 5. Setting ticket priorities
 *
 * API-Ready: Uses repository pattern for data access
 */

import { kitchenTicketRepository } from '../repositories';
import {
  KitchenTicket,
  KitchenTicketItem,
  TicketPriority,
  TicketStatus,
  generateTicketId,
  formatModifiersForDisplay,
  DEFAULT_STATION_CONFIGS,
} from '@/types/kitchen-ticket.types';
import {
  ExtendedOrder,
  ExtendedOrderItem,
  KitchenStation,
  getStationForCategory,
} from '@/types/order-extended.types';

// ============== ROUTING RESULT ==============

export interface RoutingResult {
  success: boolean;
  tickets: KitchenTicket[];
  ticketIds: string[];
  totalEstimatedTime: number;
  error?: string;
}

// ============== STATION CONFIGURATION ==============

interface StationPrepTimeConfig {
  station: KitchenStation;
  defaultPrepTime: number;
  maxConcurrentItems: number;
}

const STATION_PREP_CONFIG: Record<KitchenStation, StationPrepTimeConfig> = {
  hot_kitchen: { station: 'hot_kitchen', defaultPrepTime: 15, maxConcurrentItems: 10 },
  cold_kitchen: { station: 'cold_kitchen', defaultPrepTime: 10, maxConcurrentItems: 8 },
  grill: { station: 'grill', defaultPrepTime: 20, maxConcurrentItems: 6 },
  desserts: { station: 'desserts', defaultPrepTime: 8, maxConcurrentItems: 5 },
  beverages: { station: 'beverages', defaultPrepTime: 3, maxConcurrentItems: 15 },
  bar: { station: 'bar', defaultPrepTime: 5, maxConcurrentItems: 10 },
};

// ============== KITCHEN TICKET ROUTER ==============

export class KitchenTicketRouter {
  /**
   * Route an order to kitchen stations
   * Creates separate tickets for each station that has items
   */
  async routeOrder(order: ExtendedOrder): Promise<RoutingResult> {
    try {
      // Group items by station
      const itemsByStation = this.groupItemsByStation(order.items);

      // Create tickets for each station
      const tickets: KitchenTicket[] = [];
      const ticketIds: string[] = [];

      for (const [station, items] of itemsByStation.entries()) {
        if (items.length === 0) continue;

        const ticket = await this.createTicketForStation(order, station, items);
        tickets.push(ticket);
        ticketIds.push(ticket.id);
      }

      // Calculate total estimated time (max of all stations)
      const totalEstimatedTime = Math.max(
        ...tickets.map((t) => t.estimatedPrepTime),
        0
      );

      return {
        success: true,
        tickets,
        ticketIds,
        totalEstimatedTime,
      };
    } catch {
      return {
        success: false,
        tickets: [],
        ticketIds: [],
        totalEstimatedTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Route multiple orders (batch processing)
   */
  async routeOrders(orders: ExtendedOrder[]): Promise<Map<string, RoutingResult>> {
    const results = new Map<string, RoutingResult>();

    for (const order of orders) {
      const result = await this.routeOrder(order);
      results.set(order.id, result);
    }

    return results;
  }

  /**
   * Group order items by kitchen station
   */
  private groupItemsByStation(
    items: ExtendedOrderItem[]
  ): Map<KitchenStation, ExtendedOrderItem[]> {
    const grouped = new Map<KitchenStation, ExtendedOrderItem[]>();

    // Initialize all stations
    const stations: KitchenStation[] = [
      'hot_kitchen',
      'cold_kitchen',
      'grill',
      'desserts',
      'beverages',
      'bar',
    ];
    stations.forEach((station) => grouped.set(station, []));

    // Group items
    for (const item of items) {
      // Use item's kitchen station if set, otherwise determine from category
      const station = item.kitchenStation || getStationForCategory(item.categoryId, item.category);
      const stationItems = grouped.get(station) || [];
      stationItems.push(item);
      grouped.set(station, stationItems);
    }

    return grouped;
  }

  /**
   * Create a ticket for a specific station
   */
  private async createTicketForStation(
    order: ExtendedOrder,
    station: KitchenStation,
    items: ExtendedOrderItem[]
  ): Promise<KitchenTicket> {
    // Convert order items to ticket items
    const ticketItems = this.convertToTicketItems(items);

    // Check for allergens
    const hasAllergens = items.some((item) => item.hasAllergenWarning);
    const allergenItems = items
      .filter((item) => item.hasAllergenWarning)
      .map((item) => item.name);

    // Calculate estimated prep time
    const estimatedPrepTime = this.calculatePrepTime(station, items);

    // Determine priority
    const priority = this.determinePriority(order, items);

    // Create the ticket
    const ticketData: Partial<KitchenTicket> = {
      id: generateTicketId(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableName: order.tableName,
      guestCount: order.guestCount,
      station,
      items: ticketItems,
      itemCount: ticketItems.length,
      completedItemCount: 0,
      status: 'pending',
      priority,
      estimatedPrepTime,
      hasAllergens,
      allergenItems,
      isRush: priority === 'urgent' || priority === 'high',
      isOverdue: false,
      specialInstructions: order.specialInstructions,
      pendingSync: true,
      createdAt: new Date().toISOString(),
    };

    // Save to repository
    const ticket = await kitchenTicketRepository.create(ticketData);

    return ticket;
  }

  /**
   * Convert order items to ticket items
   */
  private convertToTicketItems(items: ExtendedOrderItem[]): KitchenTicketItem[] {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      modifiers: formatModifiersForDisplay(item.selectedModifiers),
      modifierDetails: item.selectedModifiers,
      status: 'pending',
      allergens: item.allergens,
      hasAllergenWarning: item.hasAllergenWarning,
      allergenNotes: item.hasAllergenWarning
        ? `Contains: ${item.allergens.join(', ')}`
        : undefined,
      specialInstructions: item.specialInstructions,
      kitchenNotes: item.kitchenNotes,
      estimatedPrepTime: item.estimatedPrepTime || this.getDefaultPrepTime(item),
    }));
  }

  /**
   * Calculate total prep time for a station's items
   */
  private calculatePrepTime(
    station: KitchenStation,
    items: ExtendedOrderItem[]
  ): number {
    const config = STATION_PREP_CONFIG[station];
    const baseTime = config.defaultPrepTime;

    // Get max prep time from items
    const maxItemTime = Math.max(
      ...items.map((item) => item.estimatedPrepTime || baseTime),
      baseTime
    );

    // Add time for multiple items (diminishing returns)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const additionalTime = Math.ceil(itemCount / config.maxConcurrentItems) * 2;

    return maxItemTime + additionalTime;
  }

  /**
   * Determine ticket priority based on order and items
   */
  private determinePriority(
    order: ExtendedOrder,
    items: ExtendedOrderItem[]
  ): TicketPriority {
    // Check for allergens (higher priority for safety)
    if (items.some((item) => item.hasAllergenWarning)) {
      return 'high';
    }

    // Check order age (if order was placed a while ago)
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const ageMinutes = orderAge / (1000 * 60);

    if (ageMinutes > 30) {
      return 'urgent';
    } else if (ageMinutes > 15) {
      return 'high';
    }

    // Check guest count (larger parties get slight priority)
    if (order.guestCount >= 6) {
      return 'high';
    } else if (order.guestCount >= 4) {
      return 'normal';
    }

    return 'normal';
  }

  /**
   * Get default prep time for an item
   */
  private getDefaultPrepTime(item: ExtendedOrderItem): number {
    const station = item.kitchenStation || 'hot_kitchen';
    return STATION_PREP_CONFIG[station]?.defaultPrepTime || 15;
  }

  /**
   * Get active ticket count by station
   */
  async getStationWorkload(): Promise<Record<KitchenStation, number>> {
    const activeTickets = await kitchenTicketRepository.getActiveTickets();

    const workload: Record<KitchenStation, number> = {
      hot_kitchen: 0,
      cold_kitchen: 0,
      grill: 0,
      desserts: 0,
      beverages: 0,
      bar: 0,
    };

    for (const ticket of activeTickets) {
      if (ticket.status !== 'served' && ticket.status !== 'cancelled') {
        workload[ticket.station]++;
      }
    }

    return workload;
  }

  /**
   * Get estimated wait time for a new order
   */
  async getEstimatedWaitTime(order: ExtendedOrder): Promise<number> {
    const itemsByStation = this.groupItemsByStation(order.items);
    const workload = await this.getStationWorkload();

    let maxWaitTime = 0;

    for (const [station, items] of itemsByStation.entries()) {
      if (items.length === 0) continue;

      const stationConfig = STATION_PREP_CONFIG[station];
      const currentQueue = workload[station];
      const prepTime = this.calculatePrepTime(station, items);

      // Estimate wait based on current queue
      const queueWait = currentQueue * (stationConfig.defaultPrepTime / 2);
      const totalWait = queueWait + prepTime;

      if (totalWait > maxWaitTime) {
        maxWaitTime = totalWait;
      }
    }

    return Math.ceil(maxWaitTime);
  }

  /**
   * Cancel all tickets for an order
   */
  async cancelOrderTickets(orderId: string): Promise<void> {
    const tickets = await kitchenTicketRepository.getByOrder(orderId);

    for (const ticket of tickets) {
      await kitchenTicketRepository.updateStatus(ticket.id, 'cancelled');
    }
  }

  /**
   * Update order status based on ticket statuses
   */
  async getOrderKitchenStatus(orderId: string): Promise<{
    allPending: boolean;
    allPreparing: boolean;
    allReady: boolean;
    allServed: boolean;
    anyOverdue: boolean;
    progress: number;
  }> {
    const tickets = await kitchenTicketRepository.getByOrder(orderId);

    if (tickets.length === 0) {
      return {
        allPending: true,
        allPreparing: false,
        allReady: false,
        allServed: false,
        anyOverdue: false,
        progress: 0,
      };
    }

    const statusCounts = {
      pending: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      cancelled: 0,
    };

    let anyOverdue = false;

    for (const ticket of tickets) {
      statusCounts[ticket.status]++;
      if (ticket.isOverdue) {
        anyOverdue = true;
      }
    }

    const activeTickets = tickets.filter((t) => t.status !== 'cancelled');
    const completedTickets = statusCounts.ready + statusCounts.served;
    const progress =
      activeTickets.length > 0
        ? Math.round((completedTickets / activeTickets.length) * 100)
        : 0;

    return {
      allPending: statusCounts.pending === activeTickets.length,
      allPreparing: statusCounts.preparing === activeTickets.length,
      allReady:
        statusCounts.ready === activeTickets.length ||
        statusCounts.ready + statusCounts.served === activeTickets.length,
      allServed: statusCounts.served === activeTickets.length,
      anyOverdue,
      progress,
    };
  }
}

// ============== SINGLETON INSTANCE ==============

export const kitchenTicketRouter = new KitchenTicketRouter();
