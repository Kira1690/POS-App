/**
 * Sales Chart Mock Data for Dashboard Visualizations
 * Includes various chart types for comprehensive analytics
 */

export interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
  avgOrderValue: number;
  timestamp: number;
}

export interface HourlyDataPoint {
  hour: string;
  sales: number;
  orders: number;
  period: 'AM' | 'PM';
}

export interface CategoryDataPoint {
  category: string;
  sales: number;
  percentage: number;
  color: string;
}

export interface TrendDataPoint {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// Weekly sales data for line chart
export const WEEKLY_SALES_DATA: SalesDataPoint[] = [
  {
    date: 'Mon',
    sales: 2450,
    orders: 89,
    avgOrderValue: 27.53,
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    date: 'Tue',
    sales: 2680,
    orders: 95,
    avgOrderValue: 28.21,
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    date: 'Wed',
    sales: 2920,
    orders: 102,
    avgOrderValue: 28.63,
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    date: 'Thu',
    sales: 3150,
    orders: 118,
    avgOrderValue: 26.69,
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    date: 'Fri',
    sales: 3850,
    orders: 142,
    avgOrderValue: 27.11,
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    date: 'Sat',
    sales: 4200,
    orders: 165,
    avgOrderValue: 25.45,
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    date: 'Sun',
    sales: 2847,
    orders: 98,
    avgOrderValue: 29.05,
    timestamp: Date.now(),
  },
];

// Hourly sales data for today
export const HOURLY_SALES_DATA: HourlyDataPoint[] = [
  { hour: '9', sales: 145, orders: 5, period: 'AM' },
  { hour: '10', sales: 298, orders: 12, period: 'AM' },
  { hour: '11', sales: 425, orders: 18, period: 'AM' },
  { hour: '12', sales: 678, orders: 25, period: 'PM' },
  { hour: '1', sales: 534, orders: 19, period: 'PM' },
  { hour: '2', sales: 467, orders: 16, period: 'PM' },
  { hour: '3', sales: 300, orders: 11, period: 'PM' },
  { hour: '4', sales: 0, orders: 0, period: 'PM' }, // Current hour
];

// Category breakdown for pie chart
export const CATEGORY_SALES_DATA: CategoryDataPoint[] = [
  { category: 'Main Dishes', sales: 1420, percentage: 49.9, color: '#34C759' },
  { category: 'Beverages', sales: 568, percentage: 20.0, color: '#007AFF' },
  { category: 'Appetizers', sales: 427, percentage: 15.0, color: '#FF9500' },
  { category: 'Desserts', sales: 284, percentage: 10.0, color: '#AF52DE' },
  { category: 'Specials', sales: 148, percentage: 5.1, color: '#32D74B' },
];

// Trend analysis data
export const TREND_DATA: TrendDataPoint[] = [
  { period: 'This Week', value: 20144, change: 12.5, trend: 'up' },
  { period: 'This Month', value: 87650, change: 8.3, trend: 'up' },
  { period: 'This Quarter', value: 245780, change: -2.1, trend: 'down' },
  { period: 'This Year', value: 892340, change: 15.7, trend: 'up' },
];

// Peak hours analysis
export const PEAK_HOURS_DATA = [
  { time: '11:00 AM - 1:00 PM', label: 'Lunch Rush', percentage: 35, sales: 1245 },
  { time: '6:00 PM - 8:00 PM', label: 'Dinner Peak', percentage: 42, sales: 1689 },
  { time: '3:00 PM - 5:00 PM', label: 'Afternoon', percentage: 15, sales: 427 },
  { time: 'Other Hours', label: 'Off-Peak', percentage: 8, sales: 486 },
];

// Order completion rate data
export const COMPLETION_RATE_DATA = [
  { status: 'Completed', count: 156, percentage: 78.4, color: '#34C759' },
  { status: 'Pending', count: 28, percentage: 14.1, color: '#FF9500' },
  { status: 'Cancelled', count: 15, percentage: 7.5, color: '#FF3B30' },
];

// Monthly comparison data
export const MONTHLY_COMPARISON_DATA = [
  { month: 'Jul', sales: 78450, orders: 2840, avgOrderValue: 27.63 },
  { month: 'Aug', sales: 82340, orders: 3020, avgOrderValue: 27.27 },
  { month: 'Sep', sales: 87650, orders: 3180, avgOrderValue: 27.57 },
];

// Chart configuration for different visualization types
export const CHART_CONFIG = {
  line: {
    strokeWidth: 3,
    dotSize: 6,
    backgroundColor: 'transparent',
    fillShadowGradient: '#F2F2F7',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#F2F2F7',
  },
  bar: {
    strokeWidth: 0,
    barRadius: 8,
    fillShadowGradient: '#F2F2F7',
  },
  pie: {
    strokeWidth: 1,
    hasLegend: true,
    transparentCircleRadius: 45,
    holeRadius: 40,
  },
  bezier: {
    strokeWidth: 3,
    fillShadowGradient: '#F2F2F7',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#F2F2F7',
  },
};

// Utility functions
export const getChartData = (type: 'weekly' | 'hourly' | 'category' | 'trend') => {
  switch (type) {
    case 'weekly':
      return WEEKLY_SALES_DATA;
    case 'hourly':
      return HOURLY_SALES_DATA;
    case 'category':
      return CATEGORY_SALES_DATA;
    case 'trend':
      return TREND_DATA;
    default:
      return WEEKLY_SALES_DATA;
  }
};

export const formatSalesValue = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export const getWeekOverWeekGrowth = (): number => {
  const thisWeekTotal = WEEKLY_SALES_DATA.reduce((sum, day) => sum + day.sales, 0);
  const avgDailySales = thisWeekTotal / 7;
  const lastWeekEstimate = avgDailySales * 0.89; // Assuming 11% growth

  return ((avgDailySales - lastWeekEstimate) / lastWeekEstimate * 100);
};

export const getPeakHourInsights = () => {
  const peakHour = PEAK_HOURS_DATA.reduce((max, current) =>
    current.percentage > max.percentage ? current : max
  );

  return {
    peakTime: peakHour.time,
    peakLabel: peakHour.label,
    peakPercentage: peakHour.percentage,
    peakSales: peakHour.sales,
  };
};