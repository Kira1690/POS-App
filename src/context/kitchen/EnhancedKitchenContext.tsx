/**
 * EnhancedKitchenContext - Ticket-based kitchen display management
 * Provides real-time ticket updates, filtering, and station management
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
  useMemo,
} from 'react';
import {
  kitchenReducer,
  initialKitchenState,
  KitchenState,
  KitchenAction,
} from './kitchenReducer';
import {
  KitchenTicket,
  TicketStatus,
  KitchenStation,
  StationConfig,
  DEFAULT_STATION_CONFIGS,
  formatModifiersForDisplay,
} from '@/types/kitchen-ticket.types';

import { kitchenStorageService, unifiedOrderStorageService } from '@/services/storage';
import { ticketRoutingService } from '@/services/kitchen/TicketRoutingService';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';
import { UnifiedOrderItem, UnifiedOrderStatus } from '@/types/unified-order.types';
import { generateTicketId } from '@/types/kitchen-ticket.types';

// Convert DEFAULT_STATION_CONFIGS array to Record for type compatibility
const STATION_CONFIGS_RECORD: Record<KitchenStation, StationConfig> = DEFAULT_STATION_CONFIGS.reduce(
  (acc, config) => {
    acc[config.station] = config;
    return acc;
  },
  {} as Record<KitchenStation, StationConfig>
);

// ============== CONTEXT VALUE TYPE ==============

export interface EnhancedKitchenContextValue {
  // State
  state: KitchenState;

  // Actions
  loadTickets: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  addTicket: (ticket: KitchenTicket) => void;
  addTickets: (tickets: KitchenTicket[]) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  updateItemStatus: (ticketId: string, itemId: string, status: string) => Promise<void>;
  removeTicket: (ticketId: string) => Promise<void>;
  bumpTicket: (ticketId: string) => Promise<void>;
  recallTicket: (ticketId: string) => Promise<void>;

  // Filters
  setSelectedStation: (station: KitchenStation | 'all') => void;
  setSelectedStatus: (status: TicketStatus | 'active' | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleAllergenFilter: () => void;
  toggleOverdueFilter: () => void;
  clearFilters: () => void;

  // View settings
  setViewMode: (mode: 'kanban' | 'list' | 'grid') => void;
  setSortBy: (sortBy: 'time' | 'priority' | 'table') => void;
  setAutoRefresh: (enabled: boolean) => void;

  // Selection
  selectTicket: (ticketId: string | null) => void;

  // Computed values
  filteredTickets: KitchenTicket[];
  sortedTickets: KitchenTicket[];
  selectedTicket: KitchenTicket | null;
}

// ============== CONTEXT ==============

const EnhancedKitchenContext = createContext<EnhancedKitchenContextValue | undefined>(undefined);

// ============== PROVIDER ==============

interface EnhancedKitchenProviderProps {
  children: ReactNode;
}

export const EnhancedKitchenProvider: React.FC<EnhancedKitchenProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(kitchenReducer, initialKitchenState);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load tickets from storage - loads ALL tickets (including history)
  const loadTickets = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await kitchenStorageService.initialize();
      // Get ALL tickets (including served/completed) for history in "All" tab
      const tickets = await kitchenStorageService.getTickets();
      const rawStationConfigs = await kitchenStorageService.getStationConfigs();

      // Convert array to record if needed
      let stationConfigsRecord: Record<KitchenStation, StationConfig>;
      if (Array.isArray(rawStationConfigs)) {
        stationConfigsRecord = rawStationConfigs.reduce(
          (acc, config) => {
            acc[config.station] = config;
            return acc;
          },
          {} as Record<KitchenStation, StationConfig>
        );
      } else {
        stationConfigsRecord = rawStationConfigs || STATION_CONFIGS_RECORD;
      }

      dispatch({ type: 'SET_TICKETS', payload: tickets });
      dispatch({ type: 'SET_STATION_CONFIGS', payload: stationConfigsRecord });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('[EnhancedKitchenContext] Load error:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Refresh tickets - loads ALL tickets (including history)
  const refreshTickets = useCallback(async () => {
    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });

      // Get ALL tickets (including served/completed) for history in "All" tab
      const tickets = await kitchenStorageService.getTickets();
      dispatch({ type: 'SET_TICKETS', payload: tickets });
      dispatch({ type: 'MARK_TICKETS_OVERDUE' });
    } catch (error) {
      console.error('[EnhancedKitchenContext] Refresh error:', error);
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, []);

  // Add single ticket
  const addTicket = useCallback(async (ticket: KitchenTicket) => {
    try {
      await kitchenStorageService.saveTicket(ticket);
      dispatch({ type: 'ADD_TICKET', payload: ticket });
    } catch (error) {
      console.error('[EnhancedKitchenContext] Add ticket error:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  }, []);

  // Add multiple tickets
  const addTickets = useCallback(async (tickets: KitchenTicket[]) => {
    try {
      await Promise.all(tickets.map((t) => kitchenStorageService.saveTicket(t)));
      dispatch({ type: 'ADD_TICKETS', payload: tickets });
    } catch (error) {
      console.error('[EnhancedKitchenContext] Add tickets error:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  }, []);

  // Update ticket status with order sync
  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      try {
        const ticket = state.tickets.find((t) => t.id === ticketId);
        if (!ticket) return;

        const now = new Date();
        const updates: Partial<KitchenTicket> = {
          status,
          updatedAt: now.toISOString(),
        };

        if (status === 'preparing' && !ticket.startedAt) {
          updates.startedAt = now.toISOString();
        }
        if (status === 'ready' && !ticket.completedAt) {
          updates.completedAt = now.toISOString();
        }
        if (status === 'served' && !ticket.servedAt) {
          updates.servedAt = now.toISOString();
        }

        await kitchenStorageService.updateTicket(ticketId, updates);
        dispatch({ type: 'UPDATE_TICKET_STATUS', payload: { ticketId, status } });

        // ========== SYNC KITCHEN STATUS TO ORDER ==========
        // Get all tickets for this order to determine overall order status
        if (ticket.orderId) {
          try {
            const orderTickets = await kitchenStorageService.getTicketsByOrder(ticket.orderId);

            // Update the current ticket status in the list
            const updatedOrderTickets = orderTickets.map(t =>
              t.id === ticketId ? { ...t, status } : t
            );

            // Calculate order status based on all tickets
            const allServed = updatedOrderTickets.every(t => t.status === 'served');
            const allReadyOrServed = updatedOrderTickets.every(
              t => t.status === 'ready' || t.status === 'served'
            );
            const anyPreparing = updatedOrderTickets.some(t => t.status === 'preparing');
            const allCancelled = updatedOrderTickets.every(t => t.status === 'cancelled');

            let orderStatus: UnifiedOrderStatus;
            if (allCancelled) {
              orderStatus = 'cancelled';
            } else if (allServed) {
              orderStatus = 'served';
            } else if (allReadyOrServed) {
              orderStatus = 'ready';
            } else if (anyPreparing) {
              orderStatus = 'preparing';
            } else {
              orderStatus = 'confirmed';
            }

            // Update order status in storage
            await unifiedOrderStorageService.updateOrder(ticket.orderId, { status: orderStatus });

            // Emit event for real-time cross-context sync
            orderEventEmitter.emit('ORDER_STATUS_CHANGED', ticket.orderId, {
              status: orderStatus,
            });

            if (__DEV__) {
              console.log(`[Kitchen→Order Sync] Order ${ticket.orderId} status updated to: ${orderStatus}`);
            }
          } catch (syncError) {
            console.error('[EnhancedKitchenContext] Order sync error:', syncError);
            // Don't fail the ticket update if order sync fails
          }
        }
      } catch (error) {
        console.error('[EnhancedKitchenContext] Update status error:', error);
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    [state.tickets]
  );

  // Update item status within a ticket
  const updateItemStatus = useCallback(
    async (ticketId: string, itemId: string, status: string) => {
      try {
        const ticket = state.tickets.find((t) => t.id === ticketId);
        if (!ticket) return;

        const updatedItems = ticket.items.map((item) =>
          item.id === itemId ? { ...item, status: status as any } : item
        );

        await kitchenStorageService.updateTicket(ticketId, { items: updatedItems });
        dispatch({ type: 'UPDATE_ITEM_STATUS', payload: { ticketId, itemId, status } });
      } catch (error) {
        console.error('[EnhancedKitchenContext] Update item status error:', error);
        dispatch({ type: 'SET_ERROR', payload: String(error) });
      }
    },
    [state.tickets]
  );

  // Remove ticket
  const removeTicket = useCallback(async (ticketId: string) => {
    try {
      await kitchenStorageService.deleteTicket(ticketId);
      dispatch({ type: 'REMOVE_TICKET', payload: ticketId });
    } catch (error) {
      console.error('[EnhancedKitchenContext] Remove ticket error:', error);
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  }, []);

  // Bump ticket (advance to next status)
  const bumpTicket = useCallback(
    async (ticketId: string) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;

      const statusFlow: Record<TicketStatus, TicketStatus | null> = {
        pending: 'preparing',
        preparing: 'ready',
        ready: 'served',
        served: null,
        cancelled: null,
      };

      const nextStatus = statusFlow[ticket.status];
      if (nextStatus) {
        await updateTicketStatus(ticketId, nextStatus);
      }
    },
    [state.tickets, updateTicketStatus]
  );

  // Recall ticket (go back to previous status)
  const recallTicket = useCallback(
    async (ticketId: string) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;

      const statusFlow: Record<TicketStatus, TicketStatus | null> = {
        pending: null,
        preparing: 'pending',
        ready: 'preparing',
        served: 'ready',
        cancelled: null,
      };

      const prevStatus = statusFlow[ticket.status];
      if (prevStatus) {
        await updateTicketStatus(ticketId, prevStatus);
      }
    },
    [state.tickets, updateTicketStatus]
  );

  // Filter setters
  const setSelectedStation = useCallback((station: KitchenStation | 'all') => {
    dispatch({ type: 'SET_SELECTED_STATION', payload: station });
  }, []);

  const setSelectedStatus = useCallback((status: TicketStatus | 'active' | 'all') => {
    dispatch({ type: 'SET_SELECTED_STATUS', payload: status });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const toggleAllergenFilter = useCallback(() => {
    dispatch({ type: 'TOGGLE_ALLERGEN_FILTER' });
  }, []);

  const toggleOverdueFilter = useCallback(() => {
    dispatch({ type: 'TOGGLE_OVERDUE_FILTER' });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  // View settings
  const setViewMode = useCallback((mode: 'kanban' | 'list' | 'grid') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setSortBy = useCallback((sortBy: 'time' | 'priority' | 'table') => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  }, []);

  const setAutoRefresh = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_REFRESH', payload: enabled });
  }, []);

  // Selection
  const selectTicket = useCallback((ticketId: string | null) => {
    dispatch({ type: 'SET_SELECTED_TICKET', payload: ticketId });
  }, []);

  // Computed: filtered tickets
  const filteredTickets = useMemo(() => {
    let tickets = [...state.tickets];

    // Filter by station
    if (state.selectedStation !== 'all') {
      tickets = tickets.filter((t) => t.station === state.selectedStation);
    }

    // Filter by status
    if (state.selectedStatus === 'active') {
      tickets = tickets.filter(
        (t) => t.status !== 'served' && t.status !== 'cancelled'
      );
    } else if (state.selectedStatus !== 'all') {
      tickets = tickets.filter((t) => t.status === state.selectedStatus);
    }

    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.orderNumber.toLowerCase().includes(query) ||
          t.tableName.toLowerCase().includes(query) ||
          t.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    // Filter by allergens
    if (state.showOnlyAllergens) {
      tickets = tickets.filter((t) => t.hasAllergens);
    }

    // Filter by overdue
    if (state.showOnlyOverdue) {
      tickets = tickets.filter((t) => t.isOverdue);
    }

    return tickets;
  }, [
    state.tickets,
    state.selectedStation,
    state.selectedStatus,
    state.searchQuery,
    state.showOnlyAllergens,
    state.showOnlyOverdue,
  ]);

  // Computed: sorted tickets
  const sortedTickets = useMemo(() => {
    const tickets = [...filteredTickets];

    switch (state.sortBy) {
      case 'priority':
        return ticketRoutingService.sortTicketsByPriority(tickets);

      case 'time':
        return tickets.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      case 'table':
        return tickets.sort((a, b) => a.tableName.localeCompare(b.tableName));

      default:
        return tickets;
    }
  }, [filteredTickets, state.sortBy]);

  // Computed: selected ticket
  const selectedTicket = useMemo(() => {
    if (!state.selectedTicketId) return null;
    return state.tickets.find((t) => t.id === state.selectedTicketId) || null;
  }, [state.tickets, state.selectedTicketId]);

  // Initialize on mount
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Subscribe to ORDER_CREATED events to create kitchen tickets
  useEffect(() => {
    const unsubscribeOrderCreated = orderEventEmitter.subscribe(
      'ORDER_CREATED',
      async (orderId: string, data: { orderNumber?: string; tableId?: string; tableName?: string; items?: UnifiedOrderItem[] }) => {
        if (__DEV__) {
          console.log('[EnhancedKitchenContext] Received ORDER_CREATED:', orderId, data);
        }

        try {
          // Get the full order from storage
          const order = await unifiedOrderStorageService.getOrder(orderId);
          if (!order) {
            console.error('[EnhancedKitchenContext] Order not found:', orderId);
            return;
          }

          // Group items by kitchen station
          const itemsByStation = new Map<KitchenStation, UnifiedOrderItem[]>();
          for (const item of order.items) {
            const station = item.kitchenStation || 'hot_kitchen';
            if (!itemsByStation.has(station)) {
              itemsByStation.set(station, []);
            }
            itemsByStation.get(station)!.push(item);
          }

          // Create a ticket for each station that has items
          const createdTickets: KitchenTicket[] = [];
          const now = new Date().toISOString();

          for (const [station, items] of itemsByStation.entries()) {
            if (items.length === 0) continue;

            const ticketId = generateTicketId();
            const estimatedPrepTime = Math.max(...items.map(i => i.estimatedPrepTime || 10));

            // Calculate allergen items
            const allergenItemNames = items
              .filter(i => (i.allergens?.length || 0) > 0)
              .map(i => i.name);

            const ticket: KitchenTicket = {
              id: ticketId,
              orderId: order.id,
              orderNumber: order.orderNumber,
              tableId: order.tableId,
              tableName: order.tableName,
              station,
              items: items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                // Use formatModifiersForDisplay to convert SelectedModifier[] to string[]
                modifiers: formatModifiersForDisplay(item.selectedModifiers || []),
                modifierDetails: item.selectedModifiers,
                specialInstructions: item.specialInstructions,
                status: 'pending',
                allergens: item.allergens || [],
                hasAllergenWarning: (item.allergens?.length || 0) > 0,
              })),
              itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
              completedItemCount: 0,
              status: 'pending',
              priority: 'normal',
              createdAt: now,
              updatedAt: now,
              estimatedPrepTime,
              hasAllergens: items.some(i => (i.allergens?.length || 0) > 0),
              allergenItems: allergenItemNames,
              isRush: false,
              isOverdue: false,
              pendingSync: true,
            };

            // Save ticket to storage
            await kitchenStorageService.saveTicket(ticket);
            createdTickets.push(ticket);

            if (__DEV__) {
              console.log(`[EnhancedKitchenContext] Created ticket for station ${station}:`, ticketId);
            }
          }

          // Update context state with new tickets
          if (createdTickets.length > 0) {
            dispatch({ type: 'ADD_TICKETS', payload: createdTickets });
            console.log(`[EnhancedKitchenContext] ✅ Created ${createdTickets.length} tickets for order ${order.orderNumber}`);
          }
        } catch (error) {
          console.error('[EnhancedKitchenContext] Failed to create tickets:', error);
        }
      }
    );

    // Subscribe to SYSTEM_RESET to clear tickets
    const unsubscribeReset = orderEventEmitter.subscribe('SYSTEM_RESET', () => {
      console.log('[EnhancedKitchenContext] System reset - clearing tickets');
      dispatch({ type: 'SET_TICKETS', payload: [] });
    });

    return () => {
      unsubscribeOrderCreated();
      unsubscribeReset();
    };
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (state.autoRefresh) {
      intervalRef.current = setInterval(() => {
        refreshTickets();
      }, state.refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.autoRefresh, state.refreshInterval, refreshTickets]);

  // Mark overdue tickets periodically
  useEffect(() => {
    const overdueCheck = setInterval(() => {
      dispatch({ type: 'MARK_TICKETS_OVERDUE' });
    }, 60000); // Check every minute

    return () => clearInterval(overdueCheck);
  }, []);

  // Context value
  const contextValue: EnhancedKitchenContextValue = {
    state,
    loadTickets,
    refreshTickets,
    addTicket,
    addTickets,
    updateTicketStatus,
    updateItemStatus,
    removeTicket,
    bumpTicket,
    recallTicket,
    setSelectedStation,
    setSelectedStatus,
    setSearchQuery,
    toggleAllergenFilter,
    toggleOverdueFilter,
    clearFilters,
    setViewMode,
    setSortBy,
    setAutoRefresh,
    selectTicket,
    filteredTickets,
    sortedTickets,
    selectedTicket,
  };

  return (
    <EnhancedKitchenContext.Provider value={contextValue}>
      {children}
    </EnhancedKitchenContext.Provider>
  );
};

// ============== HOOKS ==============

export const useEnhancedKitchen = (): EnhancedKitchenContextValue => {
  const context = useContext(EnhancedKitchenContext);
  if (context === undefined) {
    throw new Error('useEnhancedKitchen must be used within an EnhancedKitchenProvider');
  }
  return context;
};

// Convenience hooks
export const useKitchenTickets = () => {
  const { state, sortedTickets, filteredTickets } = useEnhancedKitchen();
  return {
    tickets: state.tickets,
    sortedTickets,
    filteredTickets,
    ticketsByStation: state.ticketsByStation,
    ticketsByStatus: state.ticketsByStatus,
    stats: state.stats,
    isLoading: state.isLoading,
  };
};

export const useKitchenFilters = () => {
  const {
    state,
    setSelectedStation,
    setSelectedStatus,
    setSearchQuery,
    toggleAllergenFilter,
    toggleOverdueFilter,
    clearFilters,
  } = useEnhancedKitchen();

  return {
    selectedStation: state.selectedStation,
    selectedStatus: state.selectedStatus,
    searchQuery: state.searchQuery,
    showOnlyAllergens: state.showOnlyAllergens,
    showOnlyOverdue: state.showOnlyOverdue,
    setSelectedStation,
    setSelectedStatus,
    setSearchQuery,
    toggleAllergenFilter,
    toggleOverdueFilter,
    clearFilters,
  };
};

export const useKitchenActions = () => {
  const {
    updateTicketStatus,
    updateItemStatus,
    bumpTicket,
    recallTicket,
    refreshTickets,
  } = useEnhancedKitchen();

  return {
    updateTicketStatus,
    updateItemStatus,
    bumpTicket,
    recallTicket,
    refreshTickets,
  };
};
