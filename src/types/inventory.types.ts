export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string; // kg, lbs, pieces, liters, etc.
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  reorder_point: number;
  cost_per_unit: number;
  supplier_id: string;
  supplier_name: string;
  last_ordered: string;
  expiry_date?: string;
  location: string; // freezer, pantry, storage, etc.
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock' | 'expired';
  usage_rate: number; // units used per day
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  delivery_days: string[];
  payment_terms: string;
  rating: number;
  active: boolean;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  items: PurchaseOrderItem[];
  total_amount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery: string;
  actual_delivery?: string;
  notes?: string;
  created_by: string;
}

export interface PurchaseOrderItem {
  item_id: string;
  item_name: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_cost: number;
  total_cost: number;
  unit: string;
}

export interface StockMovement {
  id: string;
  item_id: string;
  item_name: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'waste' | 'transfer';
  quantity: number;
  unit: string;
  reason: string;
  reference_number?: string; // order number, waste report, etc.
  cost_impact: number;
  performed_by: string;
  timestamp: string;
  notes?: string;
}

export interface WasteRecord {
  id: string;
  item_id: string;
  item_name: string;
  quantity_wasted: number;
  unit: string;
  reason: 'expired' | 'damaged' | 'overcooked' | 'contaminated' | 'other';
  cost_impact: number;
  reported_by: string;
  date: string;
  notes?: string;
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expired' | 'overstock' | 'reorder';
  item_id: string;
  item_name: string;
  current_quantity: number;
  threshold_quantity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  created_at: string;
  acknowledged: boolean;
}

export interface InventoryFilters {
  category?: string;
  status?: ('in_stock' | 'low_stock' | 'out_of_stock' | 'overstock' | 'expired')[];
  location?: string;
  supplier_id?: string;
  search?: string;
  sort_by?: 'name' | 'stock_level' | 'cost' | 'usage_rate' | 'last_updated';
  sort_order?: 'asc' | 'desc';
}

export interface InventoryAnalytics {
  total_items: number;
  total_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  expired_items: number;
  waste_this_month: {
    quantity: number;
    cost: number;
  };
  turnover_rate: number;
  reorder_suggestions: string[];
}

export interface InventoryService {
  getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  adjustStock(item_id: string, quantity: number, reason: string): Promise<StockMovement>;
  recordWaste(waste: Omit<WasteRecord, 'id'>): Promise<WasteRecord>;
  getSuppliers(): Promise<Supplier[]>;
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'order_number'>): Promise<PurchaseOrder>;
  getStockMovements(item_id?: string): Promise<StockMovement[]>;
  getInventoryAlerts(): Promise<InventoryAlert[]>;
  acknowledgeAlert(alert_id: string): Promise<void>;
  getInventoryAnalytics(): Promise<InventoryAnalytics>;
  generateReorderSuggestions(): Promise<PurchaseOrderItem[]>;
}