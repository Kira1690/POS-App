export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';

export type DeliveryPlatform = 'ubereats' | 'doordash' | 'grubhub' | 'postmates' | 'direct';

export type OrderType = 'delivery' | 'pickup';

export interface OnlineOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
  modifications?: string[];
}

export interface OnlineOrder {
  id: string;
  platform_order_id: string;
  platform: DeliveryPlatform;
  status: OrderStatus;
  type: OrderType;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    delivery_address?: string;
  };
  items: OnlineOrderItem[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  platform_fee: number;
  total: number;
  estimated_prep_time: number; // minutes
  estimated_delivery_time?: number; // minutes
  special_instructions?: string;
  created_at: string;
  accepted_at?: string;
  ready_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  progress_percentage: number;
}

export interface PlatformStatus {
  platform: DeliveryPlatform;
  connected: boolean;
  status: 'online' | 'paused' | 'offline' | 'error';
  last_order_time?: string;
  daily_orders: number;
  daily_revenue: number;
}

export interface OnlineOrderStats {
  active_orders: number;
  ready_for_pickup: number;
  out_for_delivery: number;
  todays_revenue: number;
  orders_by_platform: Record<DeliveryPlatform, number>;
}

export interface OrderFilters {
  platform: DeliveryPlatform | 'all';
  status: OrderStatus | 'all';
  time_range: 'last_hour' | 'last_2_hours' | 'today' | 'all';
  search_query: string;
}

export interface AutoAcceptSettings {
  enabled: boolean;
  platforms: DeliveryPlatform[];
  max_prep_time: number; // minutes
  minimum_order_value: number;
}

// Service interfaces
export interface OnlineOrderService {
  getOrders(filters?: Partial<OrderFilters>): Promise<OnlineOrder[]>;
  getOrderStats(): Promise<OnlineOrderStats>;
  getPlatformStatuses(): Promise<PlatformStatus[]>;
  acceptOrder(orderId: string): Promise<void>;
  rejectOrder(orderId: string, reason?: string): Promise<void>;
  markOrderReady(orderId: string): Promise<void>;
  markOrderPickedUp(orderId: string): Promise<void>;
  updateOrderProgress(orderId: string, percentage: number): Promise<void>;
  pauseNewOrders(platforms?: DeliveryPlatform[]): Promise<void>;
  resumeNewOrders(platforms?: DeliveryPlatform[]): Promise<void>;
  syncMenuItems(platforms?: DeliveryPlatform[]): Promise<void>;
  bulkAcceptOrders(orderIds: string[]): Promise<void>;
  getAutoAcceptSettings(): Promise<AutoAcceptSettings>;
  updateAutoAcceptSettings(settings: AutoAcceptSettings): Promise<void>;
}

export interface OnlineOrderContextType {
  orders: OnlineOrder[];
  stats: OnlineOrderStats | null;
  platformStatuses: PlatformStatus[];
  filters: OrderFilters;
  autoAcceptSettings: AutoAcceptSettings | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadOrders: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadPlatformStatuses: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason?: string) => Promise<void>;
  markOrderReady: (orderId: string) => Promise<void>;
  markOrderPickedUp: (orderId: string) => Promise<void>;
  updateFilters: (filters: Partial<OrderFilters>) => void;
  pauseNewOrders: (platforms?: DeliveryPlatform[]) => Promise<void>;
  resumeNewOrders: (platforms?: DeliveryPlatform[]) => Promise<void>;
  syncMenuItems: (platforms?: DeliveryPlatform[]) => Promise<void>;
  bulkAcceptPendingOrders: () => Promise<void>;
  refreshData: () => Promise<void>;
}