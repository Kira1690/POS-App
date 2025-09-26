import React from 'react';
import { Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ApplePill } from './primitives/ApplePill';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles status indication with pill design
// - Open/Closed: Extensible through status types without modification
// - Liskov Substitution: Can replace any status indicator component
// - Interface Segregation: Small, focused interface for status pills
// - Dependency Inversion: Depends on ApplePill primitive and theme abstractions

export type StatusType =
  | 'available' | 'occupied' | 'reserved' | 'cleaning'  // Table statuses
  | 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'  // Order statuses
  | 'online' | 'offline' | 'away' | 'busy'  // Staff statuses
  | 'active' | 'inactive' | 'maintenance' | 'error'  // System statuses
  | 'success' | 'warning' | 'danger' | 'info' | 'neutral';  // Generic statuses

interface AppleStatusPillProps {
  status: StatusType;

  // APPLE CONTENT SYSTEM (flexible content)
  text?: string;
  showIcon?: boolean;
  customIcon?: React.ReactNode;

  // UNIVERSAL SIZING SYSTEM (reusable across all screens)
  size?: 'small' | 'medium' | 'large';

  // APPLE INTERACTION SYSTEM (optional interactivity)
  interactive?: boolean;
  onPress?: () => void;

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// UNIVERSAL APPLE STATUS PILL COMPONENT (Single Responsibility)
// This provides consistent status indication across all app features
export const AppleStatusPill: React.FC<AppleStatusPillProps> = ({
  status,
  text,
  showIcon = true,
  customIcon,
  size = 'medium',
  interactive = false,
  onPress,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  // APPLE STATUS MAPPING (comprehensive status system)
  const getStatusConfig = (statusType: StatusType) => {
    const statusMap = {
      // Table statuses (green, red, orange, blue)
      available: { color: 'success' as const, icon: '✓', text: 'Available' },
      occupied: { color: 'error' as const, icon: '●', text: 'Occupied' },
      reserved: { color: 'warning' as const, icon: '⏰', text: 'Reserved' },
      cleaning: { color: 'neutral' as const, icon: '🧽', text: 'Cleaning' },

      // Order statuses (workflow progression)
      pending: { color: 'neutral' as const, icon: '⏳', text: 'Pending' },
      preparing: { color: 'warning' as const, icon: '👨‍🍳', text: 'Preparing' },
      ready: { color: 'success' as const, icon: '✅', text: 'Ready' },
      served: { color: 'primary' as const, icon: '🍽️', text: 'Served' },
      cancelled: { color: 'error' as const, icon: '❌', text: 'Cancelled' },

      // Staff statuses (availability indicators)
      online: { color: 'success' as const, icon: '🟢', text: 'Online' },
      offline: { color: 'neutral' as const, icon: '⚫', text: 'Offline' },
      away: { color: 'warning' as const, icon: '🟡', text: 'Away' },
      busy: { color: 'error' as const, icon: '🔴', text: 'Busy' },

      // System statuses (operational states)
      active: { color: 'success' as const, icon: '✓', text: 'Active' },
      inactive: { color: 'neutral' as const, icon: '○', text: 'Inactive' },
      maintenance: { color: 'warning' as const, icon: '🔧', text: 'Maintenance' },
      error: { color: 'error' as const, icon: '⚠️', text: 'Error' },

      // Generic statuses (universal indicators)
      success: { color: 'success' as const, icon: '✓', text: 'Success' },
      warning: { color: 'warning' as const, icon: '⚠️', text: 'Warning' },
      danger: { color: 'error' as const, icon: '●', text: 'Danger' },
      info: { color: 'primary' as const, icon: 'ℹ️', text: 'Info' },
      neutral: { color: 'neutral' as const, icon: '○', text: 'Neutral' },
    };

    return statusMap[statusType] || statusMap.neutral;
  };

  const statusConfig = getStatusConfig(status);
  const displayText = text || statusConfig.text;
  const displayIcon = customIcon || (showIcon ? statusConfig.icon : undefined);

  // APPLE STATUS CONTENT (icon + text combination)
  const content = (
    <>
      {displayIcon && <Text style={[{ marginRight: 4 }, textStyle]}>{displayIcon}</Text>}
      <Text style={textStyle}>{displayText}</Text>
    </>
  );

  return (
    <ApplePill
      variant="status"
      color={statusConfig.color}
      size={size}
      interactive={interactive}
      onPress={onPress}
      style={style}
    >
      {content}
    </ApplePill>
  );
};

// SPECIALIZED STATUS PILL VARIANTS (following Open/Closed principle)

// TABLE STATUS PILLS (for Table management)
export const TableStatusPill: React.FC<{ status: 'available' | 'occupied' | 'reserved' | 'cleaning'; onPress?: () => void }> = ({ status, onPress }) => (
  <AppleStatusPill status={status} size="medium" interactive={!!onPress} onPress={onPress} />
);

// ORDER STATUS PILLS (for Order management)
export const OrderStatusPill: React.FC<{ status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'; onPress?: () => void }> = ({ status, onPress }) => (
  <AppleStatusPill status={status} size="medium" interactive={!!onPress} onPress={onPress} />
);

// STAFF STATUS PILLS (for Staff management)
export const StaffStatusPill: React.FC<{ status: 'online' | 'offline' | 'away' | 'busy'; size?: 'small' | 'medium' | 'large' }> = ({ status, size = 'small' }) => (
  <AppleStatusPill status={status} size={size} />
);

// SYSTEM STATUS PILLS (for System monitoring)
export const SystemStatusPill: React.FC<{ status: 'active' | 'inactive' | 'maintenance' | 'error'; interactive?: boolean; onPress?: () => void }> = ({ status, interactive, onPress }) => (
  <AppleStatusPill status={status} size="small" interactive={interactive} onPress={onPress} />
);

// USAGE EXAMPLES (shows universal reusability):
// Table management: <TableStatusPill status="available" onPress={selectTable} />
// Order tracking: <OrderStatusPill status="preparing" />
// Kitchen display: <AppleStatusPill status="ready" size="large" />
// Staff dashboard: <StaffStatusPill status="online" size="small" />
// System monitoring: <SystemStatusPill status="active" />
// Custom status: <AppleStatusPill status="info" text="Custom Status" customIcon="🎯" />