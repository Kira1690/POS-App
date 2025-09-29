/**
 * Reports Dashboard Mock Data
 * Comprehensive data for Reports Dashboard according to wireframes
 */

export interface KPIMetric {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number; // percentage
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  color?: string;
}

export interface PerformanceReport {
  category: string;
  items: {
    name: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }[];
}

export interface DateRangeFilter {
  label: string;
  value: string;
  start: string;
  end: string;
}

export interface ReportsDashboardData {
  kpis: KPIMetric[];
  revenueChart: ChartDataPoint[];
  hourlyOrderChart: ChartDataPoint[];
  categoryPerformanceChart: ChartDataPoint[];
  salesPerformanceReport: PerformanceReport;
  menuPerformanceReport: PerformanceReport;
  operationsReport: PerformanceReport;
  staffPerformanceReport: PerformanceReport;
  dateRangeFilters: DateRangeFilter[];
  selectedDateRange: string;
  lastUpdated: string;
}

// Mock KPI data
export const MOCK_KPIS: KPIMetric[] = [
  {
    label: 'Revenue',
    value: '$4,287.50',
    previousValue: '$3,952.75',
    change: 8.5,
    changeType: 'increase',
    icon: '💰',
    color: '#32CD32',
    trend: 'up',
  },
  {
    label: 'Orders',
    value: 127,
    previousValue: 118,
    change: 7.6,
    changeType: 'increase',
    icon: '📋',
    color: '#4A90E2',
    trend: 'up',
  },
  {
    label: 'Avg Order Value',
    value: '$33.75',
    previousValue: '$33.50',
    change: 0.7,
    changeType: 'increase',
    icon: '💵',
    color: '#FFB347',
    trend: 'up',
  },
  {
    label: 'Customer Count',
    value: 89,
    previousValue: 94,
    change: -5.3,
    changeType: 'decrease',
    icon: '👥',
    color: '#FF6B6B',
    trend: 'down',
  },
  {
    label: 'Table Turnover',
    value: '3.2/day',
    previousValue: '3.1/day',
    change: 3.2,
    changeType: 'increase',
    icon: '🔄',
    color: '#9B59B6',
    trend: 'up',
  },
  {
    label: 'Staff Efficiency',
    value: '92%',
    previousValue: '89%',
    change: 3.4,
    changeType: 'increase',
    icon: '⚡',
    color: '#1ABC9C',
    trend: 'up',
  },
];

// Mock revenue chart data (7-day trend)
export const MOCK_REVENUE_CHART: ChartDataPoint[] = [
  { label: 'Mon', value: 3456, date: '2024-09-23' },
  { label: 'Tue', value: 3789, date: '2024-09-24' },
  { label: 'Wed', value: 4123, date: '2024-09-25' },
  { label: 'Thu', value: 3945, date: '2024-09-26' },
  { label: 'Fri', value: 4567, date: '2024-09-27' },
  { label: 'Sat', value: 5234, date: '2024-09-28' },
  { label: 'Sun', value: 4287, date: '2024-09-29' },
];

// Mock hourly order distribution
export const MOCK_HOURLY_ORDER_CHART: ChartDataPoint[] = [
  { label: '8AM', value: 3 },
  { label: '9AM', value: 7 },
  { label: '10AM', value: 12 },
  { label: '11AM', value: 18 },
  { label: '12PM', value: 25 },
  { label: '1PM', value: 32 },
  { label: '2PM', value: 28 },
  { label: '3PM', value: 15 },
  { label: '4PM', value: 8 },
  { label: '5PM', value: 12 },
  { label: '6PM', value: 29 },
  { label: '7PM', value: 35 },
  { label: '8PM', value: 31 },
  { label: '9PM', value: 22 },
  { label: '10PM', value: 14 },
];

// Mock category performance chart
export const MOCK_CATEGORY_PERFORMANCE_CHART: ChartDataPoint[] = [
  { label: 'Main Courses', value: 1287.50, color: '#4A90E2' },
  { label: 'Appetizers', value: 856.25, color: '#32CD32' },
  { label: 'Beverages', value: 743.75, color: '#FFB347' },
  { label: 'Desserts', value: 456.80, color: '#9B59B6' },
  { label: 'Sides', value: 321.45, color: '#FF6B6B' },
  { label: 'Specials', value: 621.75, color: '#1ABC9C' },
];

// Mock performance reports
export const MOCK_SALES_PERFORMANCE: PerformanceReport = {
  category: 'Sales Performance',
  items: [
    { name: 'Daily Revenue', value: 4287.50, trend: 'up', change: 8.5 },
    { name: 'Weekly Revenue', value: 28456.75, trend: 'up', change: 12.3 },
    { name: 'Monthly Revenue', value: 125789.25, trend: 'up', change: 15.7 },
    { name: 'Order Count', value: 127, trend: 'up', change: 7.6 },
    { name: 'Average Transaction', value: 33.75, trend: 'up', change: 0.7 },
  ],
};

export const MOCK_MENU_PERFORMANCE: PerformanceReport = {
  category: 'Menu Performance',
  items: [
    { name: 'Grilled Salmon', value: 23, trend: 'up', change: 15.0 },
    { name: 'Chicken Teriyaki', value: 19, trend: 'up', change: 8.5 },
    { name: 'Beef Ribeye', value: 12, trend: 'stable', change: 0.0 },
    { name: 'Margherita Pizza', value: 18, trend: 'up', change: 12.5 },
    { name: 'Caesar Salad', value: 25, trend: 'down', change: -5.2 },
  ],
};

export const MOCK_OPERATIONS_REPORT: PerformanceReport = {
  category: 'Operations Metrics',
  items: [
    { name: 'Avg Service Time', value: 18.5, trend: 'down', change: -8.2 },
    { name: 'Table Occupancy', value: 76.8, trend: 'up', change: 5.4 },
    { name: 'Order Accuracy', value: 97.2, trend: 'up', change: 1.8 },
    { name: 'Customer Wait Time', value: 12.3, trend: 'down', change: -15.6 },
    { name: 'Kitchen Efficiency', value: 94.5, trend: 'up', change: 3.2 },
  ],
};

export const MOCK_STAFF_PERFORMANCE: PerformanceReport = {
  category: 'Staff Performance',
  items: [
    { name: 'Alice Johnson', value: 98.5, trend: 'up', change: 2.1 },
    { name: 'Bob Wilson', value: 95.2, trend: 'stable', change: 0.0 },
    { name: 'Carol Davis', value: 91.8, trend: 'up', change: 4.3 },
    { name: 'Eve Thompson', value: 89.4, trend: 'down', change: -2.7 },
    { name: 'Frank Miller', value: 93.6, trend: 'up', change: 1.8 },
  ],
};

// Mock date range filters
export const MOCK_DATE_RANGE_FILTERS: DateRangeFilter[] = [
  {
    label: 'Today',
    value: 'today',
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'This Week',
    value: 'week',
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'This Month',
    value: 'month',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last 30 Days',
    value: '30days',
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last 90 Days',
    value: '90days',
    start: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
];

// Complete dashboard data
export const REPORTS_DASHBOARD_DATA: ReportsDashboardData = {
  kpis: MOCK_KPIS,
  revenueChart: MOCK_REVENUE_CHART,
  hourlyOrderChart: MOCK_HOURLY_ORDER_CHART,
  categoryPerformanceChart: MOCK_CATEGORY_PERFORMANCE_CHART,
  salesPerformanceReport: MOCK_SALES_PERFORMANCE,
  menuPerformanceReport: MOCK_MENU_PERFORMANCE,
  operationsReport: MOCK_OPERATIONS_REPORT,
  staffPerformanceReport: MOCK_STAFF_PERFORMANCE,
  dateRangeFilters: MOCK_DATE_RANGE_FILTERS,
  selectedDateRange: 'today',
  lastUpdated: new Date().toISOString(),
};

// Utility functions
export const getKPIByLabel = (label: string): KPIMetric | undefined => {
  return MOCK_KPIS.find(kpi => kpi.label === label);
};

export const getTopPerformingMenuItems = (limit: number = 5) => {
  return MOCK_MENU_PERFORMANCE.items
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const getLowPerformingMenuItems = (limit: number = 5) => {
  return MOCK_MENU_PERFORMANCE.items
    .sort((a, b) => a.value - b.value)
    .slice(0, limit);
};

export const getRevenueGrowth = (): number => {
  const revenueKPI = getKPIByLabel('Revenue');
  return revenueKPI?.change || 0;
};

export const getPeakHour = (): ChartDataPoint | undefined => {
  return MOCK_HOURLY_ORDER_CHART.reduce((peak, current) => {
    return current.value > peak.value ? current : peak;
  });
};

export const getTopCategory = (): ChartDataPoint | undefined => {
  return MOCK_CATEGORY_PERFORMANCE_CHART.reduce((top, current) => {
    return current.value > top.value ? current : top;
  });
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export default REPORTS_DASHBOARD_DATA;