/**
 * Dashboard Types - TypeScript definitions for dashboard components
 * Following professional POS system requirements
 */

export interface KPIMetrics {
  sales: {
    value: string;
    change: number;
    changeDirection: 'up' | 'down' | 'neutral';
    period: string;
  };
  orders: {
    value: number;
    change: number;
    changeDirection: 'up' | 'down' | 'neutral';
    period: string;
  };
  revenue: {
    value: string;
    change: number;
    changeDirection: 'up' | 'down' | 'neutral';
    period: string;
  };
  averageOrderValue: {
    value: string;
    change: number;
    changeDirection: 'up' | 'down' | 'neutral';
    period: string;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartDatasets {
  salesTrend: ChartDataPoint[];
  orderTrend: ChartDataPoint[];
  revenueTrend: ChartDataPoint[];
  hourlyData: Array<{
    hour: number;
    sales: number;
    orders: number;
  }>;
}

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  restaurantId: string;
  period: 'today' | 'week' | 'month' | 'custom';
}

export interface QuickActionData {
  tables: {
    total: number;
    occupied: number;
    available: number;
  };
  kitchen: {
    pendingOrders: number;
    avgCookTime: string;
    alerts: number;
  };
  staff: {
    onDuty: number;
    total: number;
    breaks: number;
  };
}

export interface DashboardContextType {
  // State
  kpis: KPIMetrics | null;
  chartData: ChartDatasets | null;
  quickActions: QuickActionData | null;
  filters: DashboardFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  exportData: (format: 'pdf' | 'excel') => Promise<void>;
  
  // Real-time
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

export interface ChartProps {
  data: ChartDataPoint[];
  title: string;
  color: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

export interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeDirection: 'up' | 'down' | 'neutral';
  period: string;
  icon: string;
  color: string;
  loading?: boolean;
}