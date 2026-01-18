/**
 * Dashboard Components - Clean exports for reusable dashboard UI components
 */

export { default as StatsCard, type StatsCardProps } from './StatsCard';
export { default as RealTimeIndicator, type RealTimeIndicatorProps } from './RealTimeIndicator';
export { default as QuickActionButton, type QuickActionButtonProps } from './QuickActionButton';
// SalesChart temporarily disabled due to LinearGradient compatibility issues
// export { default as SalesChart, type SalesChartProps } from './SalesChart';

// KPI Components
export { KPICard } from './KPICard';
export { KPISection } from './KPISection';

// Order Management Widgets
export { OrderStatusWidget } from './OrderStatusWidget';
export type { OrderStatusWidgetProps, OrderStatusCounts } from './OrderStatusWidget';

export { KitchenQueueWidget } from './KitchenQueueWidget';
export type { KitchenQueueWidgetProps, StationQueue } from './KitchenQueueWidget';

export { RecentOrdersList } from './RecentOrdersList';
export type { RecentOrdersListProps, RecentOrder } from './RecentOrdersList';

// Quick Actions
export { QuickActionsSection } from './QuickActionsSection';

// Charts
export { ChartsSection } from './ChartsSection';
export { SimpleChart } from './SimpleChart';
export { AppleStyleChart } from './AppleStyleChart';
export { AppleDonutChart } from './AppleDonutChart';
export { SimpleLineChart } from './SimpleLineChart';