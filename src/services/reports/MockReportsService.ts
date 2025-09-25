import {
  SalesReport,
  ItemPerformance,
  StaffPerformance,
  CustomerAnalytics,
  FinancialSummary,
  InventoryReport,
  ReportFilters,
  DashboardMetrics,
  ReportExport,
  ReportsService,
} from '@/types/reports.types';

export class MockReportsService implements ReportsService {
  private static instance: MockReportsService;

  public static getInstance(): MockReportsService {
    if (!MockReportsService.instance) {
      MockReportsService.instance = new MockReportsService();
    }
    return MockReportsService.instance;
  }

  async getSalesReport(filters: ReportFilters): Promise<SalesReport> {
    await this.delay(500);
    
    return {
      id: 'sales_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      period: filters.period,
      revenue: {
        total: 15840.50,
        cash: 4520.25,
        card: 8940.75,
        online: 2379.50,
      },
      orders: {
        total: 157,
        dine_in: 89,
        takeout: 42,
        delivery: 21,
        cancelled: 5,
      },
      metrics: {
        average_order_value: 100.89,
        orders_per_hour: 13.1,
        peak_hour: '7:30 PM',
        customer_count: 234,
      },
    };
  }

  async getItemPerformance(filters: ReportFilters): Promise<ItemPerformance[]> {
    await this.delay(600);
    
    return [
      {
        item_id: 'item_001',
        item_name: 'Margherita Pizza',
        category: 'Pizza',
        quantity_sold: 45,
        revenue: 1125.00,
        cost: 562.50,
        profit: 562.50,
        profit_margin: 50.0,
        trend: 12.5,
      },
      {
        item_id: 'item_002',
        item_name: 'Caesar Salad',
        category: 'Salads',
        quantity_sold: 28,
        revenue: 420.00,
        cost: 147.00,
        profit: 273.00,
        profit_margin: 65.0,
        trend: -3.2,
      },
      {
        item_id: 'item_003',
        item_name: 'Grilled Chicken',
        category: 'Main Course',
        quantity_sold: 34,
        revenue: 884.00,
        cost: 353.60,
        profit: 530.40,
        profit_margin: 60.0,
        trend: 8.1,
      },
      {
        item_id: 'item_004',
        item_name: 'Chocolate Cake',
        category: 'Desserts',
        quantity_sold: 19,
        revenue: 152.00,
        cost: 57.00,
        profit: 95.00,
        profit_margin: 62.5,
        trend: 15.3,
      },
      {
        item_id: 'item_005',
        item_name: 'House Wine',
        category: 'Beverages',
        quantity_sold: 22,
        revenue: 440.00,
        cost: 154.00,
        profit: 286.00,
        profit_margin: 65.0,
        trend: 5.8,
      },
    ];
  }

  async getStaffPerformance(filters: ReportFilters): Promise<StaffPerformance[]> {
    await this.delay(450);
    
    return [
      {
        staff_id: 'EMP001',
        name: 'John Doe',
        role: 'Server',
        hours_worked: 8.5,
        orders_served: 32,
        revenue_generated: 3240.00,
        customer_satisfaction: 4.7,
        efficiency_score: 92,
      },
      {
        staff_id: 'EMP002',
        name: 'Jane Smith',
        role: 'Server',
        hours_worked: 8.0,
        orders_served: 28,
        revenue_generated: 2912.00,
        customer_satisfaction: 4.5,
        efficiency_score: 88,
      },
      {
        staff_id: 'CHEF001',
        name: 'Mike Wilson',
        role: 'Chef',
        hours_worked: 9.0,
        orders_served: 67,
        revenue_generated: 0, // Kitchen staff don't directly generate revenue
        customer_satisfaction: 4.8,
        efficiency_score: 95,
      },
      {
        staff_id: 'EMP003',
        name: 'Sarah Brown',
        role: 'Cashier',
        hours_worked: 7.5,
        orders_served: 45,
        revenue_generated: 4580.00,
        customer_satisfaction: 4.6,
        efficiency_score: 91,
      },
    ];
  }

  async getCustomerAnalytics(filters: ReportFilters): Promise<CustomerAnalytics> {
    await this.delay(400);
    
    return {
      total_customers: 234,
      new_customers: 45,
      returning_customers: 189,
      average_visit_frequency: 2.3,
      customer_lifetime_value: 485.50,
      top_customer_segments: [
        { segment: 'Regular Diners', count: 120, revenue: 9840.00, percentage: 51.3 },
        { segment: 'Casual Visitors', count: 78, revenue: 4320.00, percentage: 33.3 },
        { segment: 'Business Lunch', count: 25, revenue: 1450.00, percentage: 10.7 },
        { segment: 'Special Events', count: 11, revenue: 230.50, percentage: 4.7 },
      ],
    };
  }

  async getFinancialSummary(filters: ReportFilters): Promise<FinancialSummary> {
    await this.delay(550);
    
    return {
      revenue: {
        gross: 15840.50,
        net: 14652.75,
        tax: 1187.75,
        discounts: 284.30,
        refunds: 158.40,
      },
      expenses: {
        total: 8940.25,
        food_cost: 4765.50,
        labor: 2890.00,
        overhead: 1120.75,
        other: 164.00,
      },
      profitability: {
        gross_profit: 11075.00,
        net_profit: 5712.50,
        profit_margin: 36.1,
      },
    };
  }

  async getInventoryReport(): Promise<InventoryReport[]> {
    await this.delay(650);
    
    return [
      {
        item_id: 'inv_001',
        item_name: 'Pizza Dough',
        category: 'Ingredients',
        current_stock: 25,
        minimum_stock: 10,
        reorder_point: 15,
        stock_value: 125.00,
        usage_rate: 8.5,
        status: 'in_stock',
      },
      {
        item_id: 'inv_002',
        item_name: 'Tomato Sauce',
        category: 'Ingredients',
        current_stock: 8,
        minimum_stock: 12,
        reorder_point: 15,
        stock_value: 96.00,
        usage_rate: 5.2,
        status: 'low_stock',
      },
      {
        item_id: 'inv_003',
        item_name: 'Mozzarella Cheese',
        category: 'Ingredients',
        current_stock: 0,
        minimum_stock: 8,
        reorder_point: 12,
        stock_value: 0,
        usage_rate: 6.8,
        status: 'out_of_stock',
      },
      {
        item_id: 'inv_004',
        item_name: 'Lettuce',
        category: 'Vegetables',
        current_stock: 18,
        minimum_stock: 5,
        reorder_point: 8,
        stock_value: 72.00,
        usage_rate: 3.2,
        status: 'in_stock',
      },
      {
        item_id: 'inv_005',
        item_name: 'Wine Bottles',
        category: 'Beverages',
        current_stock: 45,
        minimum_stock: 15,
        reorder_point: 20,
        stock_value: 900.00,
        usage_rate: 2.1,
        status: 'overstock',
      },
    ];
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await this.delay(300);
    
    return {
      today: {
        revenue: 15840.50,
        orders: 157,
        customers: 234,
        average_order_value: 100.89,
      },
      comparison: {
        revenue_change: 8.5,
        orders_change: 12.3,
        customers_change: 6.8,
        aov_change: -2.1,
      },
      peak_hours: [
        { hour: '12:00 PM', orders: 18, revenue: 1890.00 },
        { hour: '1:00 PM', orders: 22, revenue: 2340.00 },
        { hour: '7:00 PM', orders: 28, revenue: 3120.00 },
        { hour: '8:00 PM', orders: 25, revenue: 2875.00 },
      ],
      top_items: [
        {
          item_id: 'item_001',
          item_name: 'Margherita Pizza',
          category: 'Pizza',
          quantity_sold: 45,
          revenue: 1125.00,
          cost: 562.50,
          profit: 562.50,
          profit_margin: 50.0,
          trend: 12.5,
        },
        {
          item_id: 'item_003',
          item_name: 'Grilled Chicken',
          category: 'Main Course',
          quantity_sold: 34,
          revenue: 884.00,
          cost: 353.60,
          profit: 530.40,
          profit_margin: 60.0,
          trend: 8.1,
        },
      ],
    };
  }

  async exportReport(type: string, filters: ReportFilters, export_config: ReportExport): Promise<string> {
    await this.delay(1200);
    
    const filename = `${type}_report_${Date.now()}.${export_config.format}`;
    
    if (export_config.email) {
      console.log(`Mock: Sending ${filename} to ${export_config.email}`);
    }
    
    return filename;
  }

  async getReportHistory(): Promise<any[]> {
    await this.delay(350);
    
    return [
      {
        id: 'report_001',
        type: 'Sales Report',
        date: '2024-12-20',
        format: 'PDF',
        status: 'completed',
        file_size: '2.4 MB',
      },
      {
        id: 'report_002',
        type: 'Item Performance',
        date: '2024-12-19',
        format: 'Excel',
        status: 'completed',
        file_size: '1.8 MB',
      },
      {
        id: 'report_003',
        type: 'Financial Summary',
        date: '2024-12-18',
        format: 'CSV',
        status: 'completed',
        file_size: '890 KB',
      },
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}