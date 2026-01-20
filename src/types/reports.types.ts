export interface SalesReport {
  id: string;
  date: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  revenue: {
    total: number;
    cash: number;
    card: number;
    online: number;
  };
  orders: {
    total: number;
    dine_in: number;
    takeout: number;
    delivery: number;
    cancelled: number;
  };
  metrics: {
    average_order_value: number;
    orders_per_hour: number;
    peak_hour: string;
    customer_count: number;
  };
}

export interface ItemPerformance {
  item_id: string;
  item_name: string;
  category: string;
  quantity_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  profit_margin: number;
  trend: number; // percentage change
}

export interface StaffPerformance {
  staff_id: string;
  name: string;
  role: string;
  hours_worked: number;
  orders_served: number;
  revenue_generated: number;
  customer_satisfaction: number; // 1-5 rating
  efficiency_score: number; // percentage
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  average_visit_frequency: number;
  customer_lifetime_value: number;
  top_customer_segments: CustomerSegment[];
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface FinancialSummary {
  revenue: {
    gross: number;
    net: number;
    tax: number;
    discounts: number;
    refunds: number;
  };
  expenses: {
    total: number;
    food_cost: number;
    labor: number;
    overhead: number;
    other: number;
  };
  profitability: {
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
  };
}

export interface InventoryReport {
  item_id: string;
  item_name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  reorder_point: number;
  stock_value: number;
  usage_rate: number; // per day
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

export interface ReportFilters {
  date_range: {
    start: string;
    end: string;
  };
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  categories?: string[];
  staff_ids?: string[];
  order_types?: ('dine_in' | 'takeout' | 'delivery')[];
  payment_methods?: ('cash' | 'card' | 'online')[];
}

export interface DashboardMetrics {
  today: {
    revenue: number;
    orders: number;
    customers: number;
    average_order_value: number;
  };
  comparison: {
    revenue_change: number;
    orders_change: number;
    customers_change: number;
    aov_change: number;
  };
  peak_hours: {
    hour: string;
    orders: number;
    revenue: number;
  }[];
  top_items: ItemPerformance[];
}

export interface ReportExport {
  format: 'pdf' | 'excel' | 'csv';
  email?: string;
  schedule?: 'daily' | 'weekly' | 'monthly';
}

export interface ReportsService {
  getSalesReport(filters: ReportFilters): Promise<SalesReport>;
  getItemPerformance(filters: ReportFilters): Promise<ItemPerformance[]>;
  getStaffPerformance(filters: ReportFilters): Promise<StaffPerformance[]>;
  getCustomerAnalytics(filters: ReportFilters): Promise<CustomerAnalytics>;
  getFinancialSummary(filters: ReportFilters): Promise<FinancialSummary>;
  getInventoryReport(): Promise<InventoryReport[]>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  exportReport(type: string, filters: ReportFilters, export_config: ReportExport): Promise<string>;
  getReportHistory(): Promise<any[]>;
}