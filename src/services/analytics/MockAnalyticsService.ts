/**
 * Mock Analytics Service for Dashboard Development
 * Provides realistic data for dashboard KPIs and analytics
 * TODO: Replace with real AnalyticsService when backend is ready
 */

import { KPIMetrics, ChartDatasets, QuickActionData } from '@/types/dashboard.types';

export class MockAnalyticsService {
  private static instance: MockAnalyticsService;
  
  public static getInstance(): MockAnalyticsService {
    if (!MockAnalyticsService.instance) {
      MockAnalyticsService.instance = new MockAnalyticsService();
    }
    return MockAnalyticsService.instance;
  }

  /**
   * Get KPI metrics for dashboard
   */
  async getKPIMetrics(restaurantId: string, dateRange: { start: string; end: string }): Promise<KPIMetrics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      sales: {
        value: '$8,247.50',
        change: 12.5,
        changeDirection: 'up',
        period: 'vs yesterday',
      },
      orders: {
        value: 247,
        change: 8.3,
        changeDirection: 'up',
        period: 'today',
      },
      revenue: {
        value: '$24,892.75',
        change: -2.1,
        changeDirection: 'down',
        period: 'this week',
      },
      averageOrderValue: {
        value: '$33.40',
        change: 5.7,
        changeDirection: 'up',
        period: 'vs last week',
      },
    };
  }

  /**
   * Get chart data for visualizations
   */
  async getChartData(restaurantId: string, period: 'today' | 'week' | 'month'): Promise<ChartDatasets> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const salesTrend = this.generateSalesTrendData(period);
    const orderTrend = this.generateOrderTrendData(period);
    const revenueTrend = this.generateRevenueTrendData(period);
    const hourlyData = this.generateHourlyData();
    
    return {
      salesTrend,
      orderTrend,
      revenueTrend,
      hourlyData,
    };
  }

  /**
   * Get quick action data
   */
  async getQuickActionData(restaurantId: string): Promise<QuickActionData> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      tables: {
        total: 25,
        occupied: 18,
        available: 7,
      },
      kitchen: {
        pendingOrders: 12,
        avgCookTime: '12:45',
        alerts: 2,
      },
      staff: {
        onDuty: 8,
        total: 12,
        breaks: 2,
      },
    };
  }

  /**
   * Generate realistic sales trend data
   */
  private generateSalesTrendData(period: string) {
    const dataPoints = period === 'today' ? 24 : period === 'week' ? 7 : 30;
    const baseValue = 1000;
    
    return Array.from({ length: dataPoints }, (_, index) => {
      const variance = (Math.random() - 0.5) * 400;
      const trendBoost = index * 20; // Slight upward trend
      
      return {
        date: this.formatDate(index, period),
        value: Math.round(baseValue + variance + trendBoost),
        label: this.formatLabel(index, period),
      };
    });
  }

  /**
   * Generate order trend data
   */
  private generateOrderTrendData(period: string) {
    const dataPoints = period === 'today' ? 24 : period === 'week' ? 7 : 30;
    const baseValue = 30;
    
    return Array.from({ length: dataPoints }, (_, index) => {
      const variance = (Math.random() - 0.5) * 15;
      const trendBoost = index * 0.5;
      
      return {
        date: this.formatDate(index, period),
        value: Math.round(baseValue + variance + trendBoost),
        label: this.formatLabel(index, period),
      };
    });
  }

  /**
   * Generate revenue trend data
   */
  private generateRevenueTrendData(period: string) {
    const dataPoints = period === 'today' ? 24 : period === 'week' ? 7 : 30;
    const baseValue = 2500;
    
    return Array.from({ length: dataPoints }, (_, index) => {
      const variance = (Math.random() - 0.5) * 800;
      const weekendBoost = (index % 7 === 5 || index % 7 === 6) ? 500 : 0; // Weekend boost
      
      return {
        date: this.formatDate(index, period),
        value: Math.round(baseValue + variance + weekendBoost),
        label: this.formatLabel(index, period),
      };
    });
  }

  /**
   * Generate hourly data for today
   */
  private generateHourlyData() {
    return Array.from({ length: 24 }, (_, hour) => {
      // Simulate restaurant rush hours
      let multiplier = 1;
      if (hour >= 11 && hour <= 14) multiplier = 2.5; // Lunch rush
      if (hour >= 17 && hour <= 21) multiplier = 3; // Dinner rush
      if (hour < 7 || hour > 22) multiplier = 0.1; // Closed hours
      
      return {
        hour,
        sales: Math.round((Math.random() * 500 + 200) * multiplier),
        orders: Math.round((Math.random() * 20 + 5) * multiplier),
      };
    });
  }

  /**
   * Format date for charts
   */
  private formatDate(index: number, period: string): string {
    const now = new Date();
    
    if (period === 'today') {
      return `${index.toString().padStart(2, '0')}:00`;
    } else if (period === 'week') {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().split('T')[0];
    } else {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - index));
      return date.toISOString().split('T')[0];
    }
  }

  /**
   * Format label for charts
   */
  private formatLabel(index: number, period: string): string {
    if (period === 'today') {
      return `${index.toString().padStart(2, '0')}:00`;
    } else if (period === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const dayIndex = (now.getDay() - 6 + index + 7) % 7;
      return days[dayIndex];
    } else {
      const now = new Date();
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - index));
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  }

  /**
   * Simulate real-time updates
   */
  subscribeToRealTimeUpdates(
    restaurantId: string,
    callback: (data: { kpis?: KPIMetrics; quickActions?: QuickActionData }) => void
  ): () => void {
    const interval = setInterval(async () => {
      // Randomly update KPIs or quick actions
      const shouldUpdateKPIs = Math.random() > 0.7;
      const shouldUpdateQuickActions = Math.random() > 0.8;
      
      const updates: { kpis?: KPIMetrics; quickActions?: QuickActionData } = {};
      
      if (shouldUpdateKPIs) {
        updates.kpis = await this.getKPIMetrics(restaurantId, {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        });
      }
      
      if (shouldUpdateQuickActions) {
        updates.quickActions = await this.getQuickActionData(restaurantId);
      }
      
      if (Object.keys(updates).length > 0) {
        callback(updates);
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }
}