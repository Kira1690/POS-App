/**
 * Kitchen Services Index
 * Exports all kitchen-related services
 */

// Legacy routing service (in-memory only)
export { ticketRoutingService, TicketRoutingService } from './TicketRoutingService';
export type { RoutingConfig, RoutingResult as LegacyRoutingResult, RoutedItem } from './TicketRoutingService';

// New Kitchen Ticket Router (with repository persistence)
export { KitchenTicketRouter, kitchenTicketRouter } from './KitchenTicketRouter';
export type { RoutingResult } from './KitchenTicketRouter';
