/**
 * ReportsApiService — Calls backend report endpoints with snake_case → camelCase mapping.
 * Tries the API first; callers should catch errors for offline fallback.
 */

import { apiClient } from '@/services/api/apiClient';
import {
  SalesSummary,
  HourlyRevenue,
  RevenueTrend,
  TopItem,
  StaffPerf,
  PaymentBreak,
  TableRev,
  DailySales,
} from '@/types/reports-api.types';

const str = (v: unknown): string => String(v ?? '');
const num = (v: unknown): number => Number(v ?? 0);

function mapArray<T>(
  data: unknown,
  mapper: (row: Record<string, unknown>) => T,
): T[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapper(item as Record<string, unknown>));
}

class ReportsApiService {
  private static instance: ReportsApiService;

  static getInstance(): ReportsApiService {
    if (!ReportsApiService.instance) {
      ReportsApiService.instance = new ReportsApiService();
    }
    return ReportsApiService.instance;
  }

  async getSalesSummary(startDate: string, endDate: string): Promise<SalesSummary> {
    const resp = await apiClient.get<Record<string, unknown>>(
      '/api/reports/sales/summary',
      { params: { start_date: startDate, end_date: endDate } },
    );
    // Backend returns: { data: DailySummary[], totals: { total_orders, total_revenue, ... } }
    const raw = (resp.data.data ?? {}) as Record<string, unknown>;
    const totals = (raw.totals ?? {}) as Record<string, unknown>;
    return {
      totalOrders: num(totals.total_orders),
      totalRevenue: num(totals.total_revenue),
      totalTax: num(totals.total_tax),
      totalDiscounts: num(totals.total_discounts),
      netRevenue: num(totals.net_revenue),
      data: mapArray(raw.data, (r) => ({
        date: str(r.date),
        orders: num(r.total_orders ?? r.orders),
        revenue: num(r.total_revenue ?? r.revenue),
        tax: num(r.total_tax ?? r.tax),
        discounts: num(r.total_discounts ?? r.discounts),
      })),
    };
  }

  async getRevenueHourly(date?: string): Promise<HourlyRevenue[]> {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const resp = await apiClient.get<unknown[]>(
      '/api/reports/revenue/hourly',
      { params },
    );
    return mapArray(resp.data.data, (r) => ({
      hour: num(r.hour),
      orders: num(r.orders),
      revenue: num(r.revenue),
    }));
  }

  async getRevenueTrends(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<RevenueTrend[]> {
    const resp = await apiClient.get<unknown[]>(
      '/api/reports/revenue/trends',
      { params: { start_date: startDate, end_date: endDate, group_by: groupBy } },
    );
    return mapArray(resp.data.data, (r) => ({
      date: str(r.date ?? r.period),
      revenue: num(r.revenue),
      orders: num(r.orders),
    }));
  }

  async getTopSellingItems(
    startDate: string,
    endDate: string,
    limit = 5,
  ): Promise<TopItem[]> {
    const resp = await apiClient.get<unknown[]>(
      '/api/reports/items/top-selling',
      { params: { start_date: startDate, end_date: endDate, limit } },
    );
    return mapArray(resp.data.data, (r) => ({
      itemId: str(r.menu_item_id ?? r.item_id ?? r.itemId),
      itemName: str(r.menu_item_name ?? r.item_name ?? r.itemName),
      categoryName: str(r.category_name ?? r.categoryName ?? ''),
      quantitySold: num(r.quantity_sold ?? r.quantitySold),
      totalRevenue: num(r.total_revenue ?? r.totalRevenue),
    }));
  }

  async getStaffPerformance(startDate: string, endDate: string): Promise<StaffPerf[]> {
    const resp = await apiClient.get<unknown[]>(
      '/api/reports/staff/performance',
      { params: { start_date: startDate, end_date: endDate } },
    );
    return mapArray(resp.data.data, (r) => ({
      staffId: str(r.user_id ?? r.staff_id ?? r.staffId),
      staffName: str(r.username ?? r.staff_name ?? r.staffName ?? `Staff #${r.user_id ?? ''}`),
      ordersHandled: num(r.orders_handled ?? r.ordersHandled),
      totalSales: num(r.total_sales ?? r.totalSales),
      tablesServed: num(r.tables_served ?? r.tablesServed),
    }));
  }

  async getPaymentBreakdown(startDate: string, endDate: string): Promise<PaymentBreak[]> {
    const resp = await apiClient.get<unknown[]>(
      '/api/reports/payments/breakdown',
      { params: { start_date: startDate, end_date: endDate } },
    );
    return mapArray(resp.data.data, (r) => ({
      method: str(r.method ?? r.payment_method),
      count: num(r.count),
      totalAmount: num(r.total_amount ?? r.totalAmount),
    }));
  }

  async getTableRevenue(startDate: string, endDate: string): Promise<TableRev[]> {
    const resp = await apiClient.get<unknown[]>(
      '/api/reports/tables/revenue',
      { params: { start_date: startDate, end_date: endDate } },
    );
    return mapArray(resp.data.data, (r) => ({
      tableId: str(r.table_id ?? r.tableId),
      tableNumber: num(r.table_number ?? r.tableNumber),
      revenue: num(r.revenue),
      turnoverCount: num(r.turnover_count ?? r.turnoverCount),
    }));
  }

  async getDailySales(date?: string): Promise<DailySales> {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    const resp = await apiClient.get<Record<string, unknown>>(
      '/api/reports/sales/daily',
      { params },
    );
    const d = resp.data.data ?? {};
    return {
      date: str(d.date),
      totalOrders: num(d.total_orders ?? d.totalOrders),
      totalRevenue: num(d.total_revenue ?? d.totalRevenue),
      totalTax: num(d.total_tax ?? d.totalTax),
      netRevenue: d.net_revenue !== undefined ? num(d.net_revenue) : undefined,
      avgOrderValue: num(d.average_order_value ?? d.avg_order_value ?? d.avgOrderValue),
      paidOrders: num(d.paid_orders ?? d.paidOrders),
    };
  }
}

export const reportsApiService = ReportsApiService.getInstance();
