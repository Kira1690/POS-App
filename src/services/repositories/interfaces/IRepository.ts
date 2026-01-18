/**
 * Repository Interfaces - API-Ready Data Access Abstraction
 * These interfaces enable seamless transition from AsyncStorage to API
 *
 * Design Pattern: Repository Pattern with Adapter
 * - All data access goes through repositories
 * - Repositories use adapters (AsyncStorage now, API later)
 * - Business logic is decoupled from data source
 */

// ============== BASE QUERY TYPES ==============

export interface QueryFilter<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
}

export interface QueryOptions<T> {
  filters?: QueryFilter<T>[];
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============== BASE REPOSITORY INTERFACE ==============

export interface IRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  /**
   * Get all items
   */
  getAll(): Promise<T[]>;

  /**
   * Get item by ID
   */
  getById(id: string): Promise<T | null>;

  /**
   * Get multiple items by IDs
   */
  getByIds(ids: string[]): Promise<T[]>;

  /**
   * Create a new item
   */
  create(data: CreateDTO): Promise<T>;

  /**
   * Update an existing item
   */
  update(id: string, data: UpdateDTO): Promise<T>;

  /**
   * Delete an item
   */
  delete(id: string): Promise<void>;

  /**
   * Query items with filters and options
   */
  query(options: QueryOptions<T>): Promise<T[]>;

  /**
   * Query items with pagination
   */
  queryPaginated(options: QueryOptions<T>, page: number, pageSize: number): Promise<PaginatedResult<T>>;

  /**
   * Count items matching filters
   */
  count(filters?: QueryFilter<T>[]): Promise<number>;

  /**
   * Check if item exists
   */
  exists(id: string): Promise<boolean>;
}

// ============== SYNC-ENABLED REPOSITORY ==============

export interface ISyncableRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>
  extends IRepository<T, CreateDTO, UpdateDTO> {
  /**
   * Get items pending sync
   */
  getPendingSync(): Promise<T[]>;

  /**
   * Mark item as synced
   */
  markSynced(id: string, syncedAt: string): Promise<void>;

  /**
   * Mark multiple items as synced
   */
  markBatchSynced(ids: string[], syncedAt: string): Promise<void>;

  /**
   * Get last sync time
   */
  getLastSyncTime(): Promise<string | null>;

  /**
   * Set last sync time
   */
  setLastSyncTime(time: string): Promise<void>;
}

// ============== ORDER REPOSITORY INTERFACE ==============

import { ExtendedOrder, ExtendedOrderStatus, ExtendedPaymentStatus } from '@/types/order-extended.types';

export interface OrderFilters {
  status?: ExtendedOrderStatus | 'all';
  paymentStatus?: ExtendedPaymentStatus | 'all';
  tableId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface IOrderRepository extends ISyncableRepository<ExtendedOrder> {
  /**
   * Get active orders (not paid/cancelled)
   */
  getActiveOrders(): Promise<ExtendedOrder[]>;

  /**
   * Get orders by table
   */
  getByTable(tableId: string): Promise<ExtendedOrder[]>;

  /**
   * Get active order for table
   */
  getActiveOrderForTable(tableId: string): Promise<ExtendedOrder | null>;

  /**
   * Get orders by status
   */
  getByStatus(status: ExtendedOrderStatus): Promise<ExtendedOrder[]>;

  /**
   * Get orders by date range
   */
  getByDateRange(startDate: string, endDate: string): Promise<ExtendedOrder[]>;

  /**
   * Search orders
   */
  search(query: string): Promise<ExtendedOrder[]>;

  /**
   * Get filtered orders
   */
  getFiltered(filters: OrderFilters): Promise<ExtendedOrder[]>;

  /**
   * Update order status
   */
  updateStatus(id: string, status: ExtendedOrderStatus): Promise<ExtendedOrder>;

  /**
   * Update payment status
   */
  updatePaymentStatus(id: string, status: ExtendedPaymentStatus): Promise<ExtendedOrder>;

  /**
   * Get order statistics
   */
  getStats(): Promise<OrderStats>;
}

export interface OrderStats {
  total: number;
  active: number;
  pending: number;
  preparing: number;
  ready: number;
  served: number;
  paid: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// ============== KITCHEN TICKET REPOSITORY INTERFACE ==============

import { KitchenTicket, TicketStatus, KitchenStation } from '@/types/kitchen-ticket.types';

export interface TicketFilters {
  station?: KitchenStation | 'all';
  status?: TicketStatus | 'all';
  orderId?: string;
  isOverdue?: boolean;
  hasAllergens?: boolean;
}

export interface IKitchenTicketRepository extends ISyncableRepository<KitchenTicket> {
  /**
   * Get active tickets
   */
  getActiveTickets(): Promise<KitchenTicket[]>;

  /**
   * Get tickets by station
   */
  getByStation(station: KitchenStation): Promise<KitchenTicket[]>;

  /**
   * Get tickets by status
   */
  getByStatus(status: TicketStatus): Promise<KitchenTicket[]>;

  /**
   * Get tickets for order
   */
  getByOrder(orderId: string): Promise<KitchenTicket[]>;

  /**
   * Get overdue tickets
   */
  getOverdueTickets(): Promise<KitchenTicket[]>;

  /**
   * Get filtered tickets
   */
  getFiltered(filters: TicketFilters): Promise<KitchenTicket[]>;

  /**
   * Update ticket status
   */
  updateStatus(id: string, status: TicketStatus): Promise<KitchenTicket>;

  /**
   * Bump ticket to next status
   */
  bumpStatus(id: string): Promise<KitchenTicket>;

  /**
   * Update ticket item status
   */
  updateItemStatus(ticketId: string, itemId: string, status: string): Promise<KitchenTicket>;

  /**
   * Get kitchen stats
   */
  getStats(): Promise<KitchenStats>;
}

export interface KitchenStats {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
  overdue: number;
  avgPrepTime: number;
  byStation: Record<KitchenStation, StationStats>;
}

export interface StationStats {
  pending: number;
  preparing: number;
  ready: number;
  overdue: number;
  avgPrepTime: number;
}

// ============== BILL REPOSITORY INTERFACE ==============

import { Bill, BillSplit, PaymentMethodSplit, SplitType } from '@/types/billing.types';

export interface BillFilters {
  orderId?: string;
  tableId?: string;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  splitType?: SplitType;
  startDate?: string;
  endDate?: string;
}

export interface IBillRepository extends ISyncableRepository<Bill> {
  /**
   * Get bill by order ID
   */
  getByOrderId(orderId: string): Promise<Bill | null>;

  /**
   * Get bills by table
   */
  getByTable(tableId: string): Promise<Bill[]>;

  /**
   * Get unpaid bills
   */
  getUnpaidBills(): Promise<Bill[]>;

  /**
   * Get filtered bills
   */
  getFiltered(filters: BillFilters): Promise<Bill[]>;

  /**
   * Update tip amount
   */
  updateTip(id: string, tipAmount: number, tipPercentage?: number): Promise<Bill>;

  /**
   * Update discount
   */
  updateDiscount(id: string, discountType: 'percentage' | 'fixed', discountValue: number): Promise<Bill>;

  /**
   * Initialize split
   */
  initializeSplit(id: string, splitType: SplitType, guestCount: number): Promise<Bill>;

  /**
   * Update split details
   */
  updateSplitDetails(id: string, splitDetails: BillSplit): Promise<Bill>;

  /**
   * Record payment
   */
  recordPayment(id: string, payment: PaymentMethodSplit): Promise<Bill>;

  /**
   * Mark as paid
   */
  markAsPaid(id: string): Promise<Bill>;
}

// ============== DATA ADAPTER INTERFACE ==============

export interface IDataAdapter {
  /**
   * Get data by key
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set data by key
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove data by key
   */
  remove(key: string): Promise<void>;

  /**
   * Get all keys with prefix
   */
  getAllKeys(prefix?: string): Promise<string[]>;

  /**
   * Get multiple items by keys
   */
  multiGet<T>(keys: string[]): Promise<Map<string, T>>;

  /**
   * Set multiple items
   */
  multiSet<T>(items: Map<string, T>): Promise<void>;

  /**
   * Remove multiple items by keys
   */
  multiRemove(keys: string[]): Promise<void>;

  /**
   * Clear all data (use carefully!)
   */
  clear(): Promise<void>;
}

// ============== ASYNC STORAGE ADAPTER ==============

export interface AsyncStorageConfig {
  prefix: string;
  enableEncryption?: boolean;
  compressionThreshold?: number;
}

// ============== API ADAPTER (FUTURE) ==============

export interface ApiAdapterConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface IApiAdapter extends IDataAdapter {
  /**
   * Make authenticated API request
   */
  request<T>(method: string, endpoint: string, data?: unknown): Promise<T>;

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void;

  /**
   * Clear authentication
   */
  clearAuth(): void;
}
