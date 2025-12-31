/**
 * Kitchen Reducer - State management for kitchen display
 * Handles ticket updates, filtering, and station management
 */

import {
  KitchenTicket,
  TicketStatus,
  TicketPriority,
  StationConfig,
  KitchenStation,
} from '@/types/kitchen-ticket.types';

// ============== STATE INTERFACE ==============

export interface KitchenState {
  // Tickets
  tickets: KitchenTicket[];
  ticketsByStation: Record<KitchenStation, KitchenTicket[]>;
  ticketsByStatus: Record<TicketStatus, KitchenTicket[]>;

  // Station management
  activeStations: KitchenStation[];
  stationConfigs: Record<KitchenStation, StationConfig>;

  // Filters
  selectedStation: KitchenStation | 'all';
  selectedStatus: TicketStatus | 'active' | 'all';
  searchQuery: string;
  showOnlyAllergens: boolean;
  showOnlyOverdue: boolean;

  // View settings
  viewMode: 'kanban' | 'list' | 'grid';
  sortBy: 'time' | 'priority' | 'table';
  autoRefresh: boolean;
  refreshInterval: number;

  // Stats
  stats: {
    totalTickets: number;
    pendingCount: number;
    preparingCount: number;
    readyCount: number;
    overdueCount: number;
    allergenCount: number;
    avgPrepTime: number;
  };

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedTicketId: string | null;
}

// ============== INITIAL STATE ==============

export const initialKitchenState: KitchenState = {
  tickets: [],
  ticketsByStation: {
    hot_kitchen: [],
    cold_kitchen: [],
    grill: [],
    desserts: [],
    beverages: [],
    bar: [],
  },
  ticketsByStatus: {
    pending: [],
    preparing: [],
    ready: [],
    served: [],
    cancelled: [],
  },

  activeStations: ['hot_kitchen', 'cold_kitchen', 'grill', 'desserts', 'beverages', 'bar'],
  stationConfigs: {} as Record<KitchenStation, StationConfig>,

  selectedStation: 'all',
  selectedStatus: 'active',
  searchQuery: '',
  showOnlyAllergens: false,
  showOnlyOverdue: false,

  viewMode: 'kanban',
  sortBy: 'priority',
  autoRefresh: true,
  refreshInterval: 30000,

  stats: {
    totalTickets: 0,
    pendingCount: 0,
    preparingCount: 0,
    readyCount: 0,
    overdueCount: 0,
    allergenCount: 0,
    avgPrepTime: 0,
  },

  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,
  selectedTicketId: null,
};

// ============== ACTION TYPES ==============

export type KitchenAction =
  // Ticket actions
  | { type: 'SET_TICKETS'; payload: KitchenTicket[] }
  | { type: 'ADD_TICKET'; payload: KitchenTicket }
  | { type: 'ADD_TICKETS'; payload: KitchenTicket[] }
  | { type: 'UPDATE_TICKET'; payload: { ticketId: string; updates: Partial<KitchenTicket> } }
  | { type: 'UPDATE_TICKET_STATUS'; payload: { ticketId: string; status: TicketStatus } }
  | { type: 'UPDATE_ITEM_STATUS'; payload: { ticketId: string; itemId: string; status: string } }
  | { type: 'REMOVE_TICKET'; payload: string }
  // Station actions
  | { type: 'SET_ACTIVE_STATIONS'; payload: KitchenStation[] }
  | { type: 'SET_STATION_CONFIGS'; payload: Record<KitchenStation, StationConfig> }
  | { type: 'UPDATE_STATION_CONFIG'; payload: { station: KitchenStation; config: Partial<StationConfig> } }
  // Filter actions
  | { type: 'SET_SELECTED_STATION'; payload: KitchenStation | 'all' }
  | { type: 'SET_SELECTED_STATUS'; payload: TicketStatus | 'active' | 'all' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_ALLERGEN_FILTER' }
  | { type: 'TOGGLE_OVERDUE_FILTER' }
  | { type: 'CLEAR_FILTERS' }
  // View settings
  | { type: 'SET_VIEW_MODE'; payload: 'kanban' | 'list' | 'grid' }
  | { type: 'SET_SORT_BY'; payload: 'time' | 'priority' | 'table' }
  | { type: 'SET_AUTO_REFRESH'; payload: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  // UI State
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_TICKET'; payload: string | null }
  | { type: 'MARK_TICKETS_OVERDUE' };

// ============== HELPER FUNCTIONS ==============

const groupTicketsByStation = (
  tickets: KitchenTicket[]
): Record<KitchenStation, KitchenTicket[]> => {
  const grouped: Record<KitchenStation, KitchenTicket[]> = {
    hot_kitchen: [],
    cold_kitchen: [],
    grill: [],
    desserts: [],
    beverages: [],
    bar: [],
  };

  tickets.forEach((ticket) => {
    if (grouped[ticket.station]) {
      grouped[ticket.station].push(ticket);
    }
  });

  return grouped;
};

const groupTicketsByStatus = (
  tickets: KitchenTicket[]
): Record<TicketStatus, KitchenTicket[]> => {
  const grouped: Record<TicketStatus, KitchenTicket[]> = {
    pending: [],
    preparing: [],
    ready: [],
    served: [],
    cancelled: [],
  };

  tickets.forEach((ticket) => {
    if (grouped[ticket.status]) {
      grouped[ticket.status].push(ticket);
    }
  });

  return grouped;
};

const calculateStats = (tickets: KitchenTicket[]) => {
  const activeTickets = tickets.filter(
    (t) => t.status !== 'served' && t.status !== 'cancelled'
  );

  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const preparingCount = tickets.filter((t) => t.status === 'preparing').length;
  const readyCount = tickets.filter((t) => t.status === 'ready').length;
  const overdueCount = activeTickets.filter((t) => t.isOverdue).length;
  const allergenCount = activeTickets.filter((t) => t.hasAllergens).length;

  const completedTickets = tickets.filter(
    (t) => t.status === 'ready' || t.status === 'served'
  );
  const avgPrepTime =
    completedTickets.length > 0
      ? completedTickets.reduce((sum, t) => sum + (t.actualPrepTime || t.estimatedPrepTime), 0) /
        completedTickets.length
      : 0;

  return {
    totalTickets: tickets.length,
    pendingCount,
    preparingCount,
    readyCount,
    overdueCount,
    allergenCount,
    avgPrepTime: Math.round(avgPrepTime),
  };
};

const checkTicketOverdue = (ticket: KitchenTicket): boolean => {
  if (ticket.status === 'ready' || ticket.status === 'served' || ticket.status === 'cancelled') {
    return false;
  }

  const createdAt = new Date(ticket.createdAt);
  const now = new Date();
  const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

  return elapsedMinutes > ticket.estimatedPrepTime;
};

// ============== REDUCER ==============

export const kitchenReducer = (
  state: KitchenState,
  action: KitchenAction
): KitchenState => {
  switch (action.type) {
    case 'SET_TICKETS': {
      const tickets = action.payload;
      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'ADD_TICKET': {
      const newTicket = action.payload;
      const tickets = [...state.tickets, newTicket];
      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'ADD_TICKETS': {
      const tickets = [...state.tickets, ...action.payload];
      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'UPDATE_TICKET': {
      const { ticketId, updates } = action.payload;
      const tickets = state.tickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
          : ticket
      );
      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'UPDATE_TICKET_STATUS': {
      const { ticketId, status } = action.payload;
      const now = new Date();
      const tickets = state.tickets.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;

        const updates: Partial<KitchenTicket> = {
          status,
          updatedAt: now.toISOString(),
        };

        // Track timing
        if (status === 'preparing' && !ticket.startedAt) {
          updates.startedAt = now.toISOString();
        }
        if (status === 'ready' && !ticket.completedAt) {
          updates.completedAt = now.toISOString();
          // Calculate actual prep time
          const startTime = ticket.startedAt ? new Date(ticket.startedAt) : new Date(ticket.createdAt);
          updates.actualPrepTime = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));
        }
        if (status === 'served' && !ticket.servedAt) {
          updates.servedAt = now.toISOString();
        }

        return { ...ticket, ...updates };
      });

      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
        lastUpdated: now.toISOString(),
      };
    }

    case 'UPDATE_ITEM_STATUS': {
      const { ticketId, itemId, status } = action.payload;
      const tickets = state.tickets.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;

        const updatedItems = ticket.items.map((item) =>
          item.id === itemId ? { ...item, status: status as any } : item
        );

        // Auto-update ticket status based on item statuses
        const allReady = updatedItems.every((i) => i.status === 'ready');
        const anyPreparing = updatedItems.some((i) => i.status === 'preparing');
        const allPending = updatedItems.every((i) => i.status === 'pending');

        let newTicketStatus = ticket.status;
        if (allReady && ticket.status !== 'served') {
          newTicketStatus = 'ready';
        } else if (anyPreparing && ticket.status === 'pending') {
          newTicketStatus = 'preparing';
        }

        return {
          ...ticket,
          items: updatedItems,
          status: newTicketStatus,
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'REMOVE_TICKET': {
      const tickets = state.tickets.filter((t) => t.id !== action.payload);
      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
        selectedTicketId:
          state.selectedTicketId === action.payload ? null : state.selectedTicketId,
      };
    }

    case 'SET_ACTIVE_STATIONS':
      return { ...state, activeStations: action.payload };

    case 'SET_STATION_CONFIGS':
      return { ...state, stationConfigs: action.payload };

    case 'UPDATE_STATION_CONFIG': {
      const { station, config } = action.payload;
      return {
        ...state,
        stationConfigs: {
          ...state.stationConfigs,
          [station]: { ...state.stationConfigs[station], ...config },
        },
      };
    }

    case 'SET_SELECTED_STATION':
      return { ...state, selectedStation: action.payload };

    case 'SET_SELECTED_STATUS':
      return { ...state, selectedStatus: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'TOGGLE_ALLERGEN_FILTER':
      return { ...state, showOnlyAllergens: !state.showOnlyAllergens };

    case 'TOGGLE_OVERDUE_FILTER':
      return { ...state, showOnlyOverdue: !state.showOnlyOverdue };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        selectedStation: 'all',
        selectedStatus: 'active',
        searchQuery: '',
        showOnlyAllergens: false,
        showOnlyOverdue: false,
      };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };

    case 'SET_AUTO_REFRESH':
      return { ...state, autoRefresh: action.payload };

    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_SELECTED_TICKET':
      return { ...state, selectedTicketId: action.payload };

    case 'MARK_TICKETS_OVERDUE': {
      const tickets = state.tickets.map((ticket) => ({
        ...ticket,
        isOverdue: checkTicketOverdue(ticket),
      }));
      return {
        ...state,
        tickets,
        ticketsByStation: groupTicketsByStation(tickets),
        ticketsByStatus: groupTicketsByStatus(tickets),
        stats: calculateStats(tickets),
      };
    }

    default:
      return state;
  }
};
