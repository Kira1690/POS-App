/**
 * Reports API Types — camelCase versions of backend snake_case responses.
 * All fields are mapped from the Core Service report endpoints.
 */

export interface DailySummary {
  date: string;
  orders: number;
  revenue: number;
  tax: number;
  discounts: number;
}

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscounts: number;
  netRevenue: number;
  data: DailySummary[];
}

export interface HourlyRevenue {
  hour: number;
  orders: number;
  revenue: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface StaffPerf {
  staffId: string;
  staffName: string;
  ordersHandled: number;
  totalSales: number;
  tablesServed: number;
}

export interface PaymentBreak {
  method: string;
  count: number;
  totalAmount: number;
}

export interface TableRev {
  tableId: string;
  tableNumber: number;
  revenue: number;
  turnoverCount: number;
}

export interface DailySales {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  netRevenue?: number;
  avgOrderValue: number;
  paidOrders: number;
}
