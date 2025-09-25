/**
 * Dashboard Screens - Clean exports for all dashboard components
 * Professional module organization following CLAUDE.md standards
 */

export { default as RoleDashboard } from './RoleDashboard';
export { default as ManagerDashboard } from './ManagerDashboard';
export { default as StaffDashboard } from './StaffDashboard';
export { default as KitchenDashboard } from './KitchenDashboard';

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

// Components
export * from './components';

// Services
export { 
  DashboardWebSocketService,
  type DashboardWebSocketConfig,
  type DashboardWebSocketCallbacks,
  type WebSocketMessage,
  type ConnectionStatus
} from '../../services/websocket/DashboardWebSocketService';