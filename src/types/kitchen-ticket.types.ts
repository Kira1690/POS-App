/**
 * Kitchen Ticket Types
 * Types for kitchen display system, ticket routing, and station management
 */

import { AllergenType } from './menu-management-extended.types';
import {
  KitchenStation,
  ExtendedOrderItemStatus,
  SelectedModifier,
  KITCHEN_STATION_LABELS,
  KITCHEN_STATION_ICONS
} from './order-extended.types';

// Re-export KitchenStation types for backwards compatibility
export { KitchenStation, KITCHEN_STATION_LABELS, KITCHEN_STATION_ICONS };

// ============== TICKET STATUS TYPES ==============

export type TicketStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export type TicketPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'rush'
  | 'vip';

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
  rush: 'Rush',
  vip: 'VIP',
};

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: '#6B7280',
  normal: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
  rush: '#DC2626',
  vip: '#7C3AED',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  pending: '#F59E0B',
  preparing: '#3B82F6',
  ready: '#10B981',
  served: '#6B7280',
  cancelled: '#EF4444',
};

// ============== KITCHEN TICKET ITEM ==============

export interface KitchenTicketItem {
  id: string; // Same as ExtendedOrderItem.id
  orderItemId?: string; // Reference to the original order item
  name: string;
  quantity: number;

  // Modifiers (simplified for display)
  modifiers: string[]; // e.g., ["+ Bacon", "+ Jalapeno", "- Onions"]
  modifierDetails?: SelectedModifier[];

  // Status
  status: ExtendedOrderItemStatus;
  statusUpdatedAt?: string;

  // Warnings
  allergens: AllergenType[];
  hasAllergenWarning: boolean;
  hasAllergens?: boolean; // Alias for hasAllergenWarning
  allergenNotes?: string;

  // Notes
  specialInstructions?: string;
  kitchenNotes?: string;
  notes?: string; // Alias for specialInstructions

  // Dietary Information
  dietaryTags?: string[];

  // Prep Time
  estimatedPrepTime?: number;
  prepStartedAt?: string;
  prepCompletedAt?: string;
}

// ============== KITCHEN TICKET ==============

export interface KitchenTicket {
  id: string;
  orderId: string;
  orderNumber: string;

  // Table Info
  tableId: string;
  tableName: string;
  guestCount?: number;

  // Station
  station: KitchenStation;

  // Items
  items: KitchenTicketItem[];
  itemCount: number;
  totalItems?: number; // Alias for itemCount
  completedItemCount: number;

  // Status
  status: TicketStatus;
  priority: TicketPriority;

  // Timing
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  servedAt?: string;
  estimatedPrepTime: number; // minutes
  actualPrepTime?: number; // minutes

  // Alerts
  hasAllergens: boolean;
  allergenItems: string[]; // Item names with allergens
  isRush: boolean;
  isOverdue: boolean;
  overdueBy?: number; // minutes

  // Notes
  specialInstructions?: string;
  delayReason?: string;

  // Staff
  assignedTo?: string;
  assignedToName?: string;
  completedBy?: string;
  completedByName?: string;

  // Sync
  syncedAt?: string;
  pendingSync: boolean;
}

// ============== TICKET FILTERS ==============

export interface TicketFilters {
  station?: KitchenStation | 'all';
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  hasAllergens?: boolean;
  isOverdue?: boolean;
  searchQuery?: string;
}

// ============== STATION CONFIG ==============

export interface StationConfig {
  station: KitchenStation;
  name: string;
  isActive: boolean;
  color: string;
  icon: string;
  defaultPrepTime: number; // minutes
  maxConcurrentTickets: number;
  alertThreshold: number; // minutes before marking overdue
  displayOrder: number;
}

export const DEFAULT_STATION_CONFIGS: StationConfig[] = [
  {
    station: 'hot_kitchen',
    name: 'Hot Kitchen',
    isActive: true,
    color: '#EF4444',
    icon: 'fire',
    defaultPrepTime: 15,
    maxConcurrentTickets: 10,
    alertThreshold: 20,
    displayOrder: 1,
  },
  {
    station: 'cold_kitchen',
    name: 'Cold Kitchen',
    isActive: true,
    color: '#3B82F6',
    icon: 'snowflake',
    defaultPrepTime: 10,
    maxConcurrentTickets: 8,
    alertThreshold: 15,
    displayOrder: 2,
  },
  {
    station: 'grill',
    name: 'Grill Station',
    isActive: true,
    color: '#F97316',
    icon: 'grill',
    defaultPrepTime: 20,
    maxConcurrentTickets: 6,
    alertThreshold: 25,
    displayOrder: 3,
  },
  {
    station: 'desserts',
    name: 'Desserts',
    isActive: true,
    color: '#EC4899',
    icon: 'cake-variant',
    defaultPrepTime: 8,
    maxConcurrentTickets: 5,
    alertThreshold: 12,
    displayOrder: 4,
  },
  {
    station: 'beverages',
    name: 'Beverages',
    isActive: true,
    color: '#06B6D4',
    icon: 'cup',
    defaultPrepTime: 3,
    maxConcurrentTickets: 15,
    alertThreshold: 5,
    displayOrder: 5,
  },
  {
    station: 'bar',
    name: 'Bar',
    isActive: true,
    color: '#8B5CF6',
    icon: 'glass-cocktail',
    defaultPrepTime: 5,
    maxConcurrentTickets: 10,
    alertThreshold: 8,
    displayOrder: 6,
  },
];

// ============== TICKET ACTIONS ==============

export interface StartTicketRequest {
  ticketId: string;
  assignedTo?: string;
}

export interface CompleteTicketRequest {
  ticketId: string;
  completedBy?: string;
}

export interface DelayTicketRequest {
  ticketId: string;
  reason: string;
  newEstimatedTime?: number;
}

export interface UpdateTicketItemStatusRequest {
  ticketId: string;
  itemId: string;
  status: ExtendedOrderItemStatus;
  kitchenNotes?: string;
}

// ============== KITCHEN STATS ==============

export interface KitchenStats {
  totalPending: number;
  totalPreparing: number;
  totalReady: number;
  totalOverdue: number;
  avgPrepTime: number; // minutes
  ticketsCompletedToday: number;
  byStation: Record<KitchenStation, StationStats>;
}

export interface StationStats {
  station: KitchenStation;
  pending: number;
  preparing: number;
  ready: number;
  overdue: number;
  avgPrepTime: number;
  completedToday: number;
}

// ============== TICKET EVENTS ==============

export type KitchenEventType =
  | 'TICKET_CREATED'
  | 'TICKET_STARTED'
  | 'TICKET_COMPLETED'
  | 'TICKET_SERVED'
  | 'TICKET_CANCELLED'
  | 'TICKET_DELAYED'
  | 'ITEM_STATUS_CHANGED'
  | 'TICKET_OVERDUE';

export interface KitchenEvent {
  type: KitchenEventType;
  ticketId: string;
  orderId: string;
  station: KitchenStation;
  timestamp: string;
  data?: Record<string, unknown>;
}

// ============== HELPER FUNCTIONS ==============

export const generateTicketId = (): string => {
  return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatModifiersForDisplay = (
  modifiers: SelectedModifier[]
): string[] => {
  const formatted: string[] = [];

  for (const modifier of modifiers) {
    for (const option of modifier.options) {
      const prefix = option.priceAdjustment >= 0 ? '+' : '-';
      const qtyStr = option.quantity > 1 ? ` x${option.quantity}` : '';
      formatted.push(`${prefix} ${option.optionName}${qtyStr}`);
    }
  }

  return formatted;
};

export const calculateTicketPrepTime = (items: KitchenTicketItem[]): number => {
  // Return max prep time among all items
  const prepTimes = items.map((item) => item.estimatedPrepTime || 10);
  return Math.max(...prepTimes);
};

export const isTicketOverdue = (
  ticket: KitchenTicket,
  config?: StationConfig
): boolean => {
  if (ticket.status === 'ready' || ticket.status === 'served' || ticket.status === 'cancelled') {
    return false;
  }

  const threshold = config?.alertThreshold || ticket.estimatedPrepTime;
  const createdAt = new Date(ticket.createdAt).getTime();
  const now = Date.now();
  const elapsedMinutes = (now - createdAt) / (1000 * 60);

  return elapsedMinutes > threshold;
};

export const getTicketElapsedTime = (ticket: KitchenTicket): number => {
  const createdAt = new Date(ticket.createdAt).getTime();
  const now = Date.now();
  return Math.floor((now - createdAt) / (1000 * 60));
};

export const getStationConfig = (station: KitchenStation): StationConfig => {
  return DEFAULT_STATION_CONFIGS.find((c) => c.station === station) || DEFAULT_STATION_CONFIGS[0];
};
