/**
 * Analytics Service Interfaces
 * Defines contracts for analytics and performance monitoring services
 */

export interface IPerformanceAnalyticsService {
  // Performance tracking
  trackPerformanceMetric(metric: {
    name: string;
    value: number;
    category: 'LOAD_TIME' | 'RENDER_TIME' | 'API_RESPONSE' | 'MEMORY_USAGE';
    timestamp?: string;
    metadata?: Record<string, any>;
  }): Promise<void>;
  
  // Performance reporting
  getPerformanceReport(timeRange: {
    start: string;
    end: string;
  }): Promise<{
    averageLoadTime: number;
    averageRenderTime: number;
    averageApiResponseTime: number;
    memoryUsage: Array<{ timestamp: string; usage: number }>;
    performanceScore: number;
  }>;
  
  // Real-time monitoring
  startPerformanceMonitoring(): void;
  stopPerformanceMonitoring(): void;
  
  // Alerts and thresholds
  setPerformanceThreshold(metric: string, threshold: number): void;
  getActiveAlerts(): Promise<Array<{
    id: string;
    metric: string;
    threshold: number;
    currentValue: number;
    timestamp: string;
  }>>;
}

export interface IBusinessAnalyticsService {
  // Sales analytics
  getSalesAnalytics(params: {
    restaurantId: string;
    dateRange: { start: string; end: string };
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{
    totalSales: number;
    orderCount: number;
    averageOrderValue: number;
    topSellingItems: Array<{ itemId: string; name: string; quantity: number; revenue: number }>;
    salesByHour: Array<{ hour: number; sales: number; orderCount: number }>;
    salesByDay: Array<{ date: string; sales: number; orderCount: number }>;
  }>;
  
  // Customer analytics
  getCustomerAnalytics(restaurantId: string): Promise<{
    totalCustomers: number;
    returningCustomers: number;
    newCustomers: number;
    customerSatisfaction: number;
    averageVisitFrequency: number;
  }>;
  
  // Operational analytics
  getOperationalAnalytics(restaurantId: string): Promise<{
    averageOrderPreparationTime: number;
    tableUtilization: number;
    staffEfficiency: number;
    peakHours: Array<{ hour: number; orderCount: number }>;
    kitchenPerformance: {
      averageCookTime: number;
      onTimeDelivery: number;
    };
  }>;
}