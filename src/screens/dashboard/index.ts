/**
 * Dashboard Screens - Clean exports for all dashboard components
 * Professional module organization following CLAUDE.md standards
 */

export { default as RoleDashboard } from './RoleDashboard';
export { default as ManagerDashboard } from './ManagerDashboard';
export { default as StaffDashboard } from './StaffDashboard';
export { default as KitchenDashboard } from './KitchenDashboard';
export { default as StaffManagementDashboard } from './StaffManagementDashboard';

// Main dashboard screen export for navigation
export { default as DashboardScreen } from './RoleDashboard';

// Context Provider
export { 
  DashboardProvider, 
  useDashboard,
  type DashboardState,
  type DashboardStats,
  type OrderItem,
  type StaffMetrics,
  type KitchenData,
  type TaskItem
} from '../../context/dashboard/DashboardContext';

// Components - Selective exports to avoid undefined component issues
export { default as StatsCard, type StatsCardProps } from './components/StatsCard';
export { default as RealTimeIndicator, type RealTimeIndicatorProps } from './components/RealTimeIndicator';
export { default as QuickActionButton, type QuickActionButtonProps } from './components/QuickActionButton';
// SalesChart temporarily disabled due to potential LinearGradient issues
// export { default as SalesChart, type SalesChartProps } from './components/SalesChart';

// Services
export { 
  DashboardWebSocketService,
  type DashboardWebSocketConfig,
  type DashboardWebSocketCallbacks,
  type WebSocketMessage,
  type ConnectionStatus
} from '../../services/websocket/DashboardWebSocketService';