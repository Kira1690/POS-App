import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { useTheme } from '@/hooks/useTheme';

export type StatusType = 'connected' | 'disconnected' | 'error' | 'active' | 'inactive';

interface StatusIndicatorProps {
  /**
   * Status type to display
   */
  status: StatusType;

  /**
   * Optional custom label (overrides default)
   */
  label?: string;

  /**
   * Icon size in pixels
   * @default 16
   */
  iconSize?: number;

  /**
   * Text size in pixels
   * @default 12
   */
  textSize?: number;

  /**
   * Show icon only (no text)
   * @default false
   */
  iconOnly?: boolean;
}

/**
 * Reusable StatusIndicator component that displays connection/activity status
 * with appropriate icon and color
 *
 * @example
 * <StatusIndicator status="connected" />
 * <StatusIndicator status="error" label="Connection Failed" />
 * <StatusIndicator status="active" iconOnly />
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  iconSize = 16,
  textSize = 12,
  iconOnly = false,
}) => {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
      case 'active':
        return {
          icon: 'checkbox-marked-circle',
          color: theme.colors.success,
          defaultLabel: status === 'connected' ? 'Connected' : 'Active',
        };
      case 'disconnected':
      case 'inactive':
        return {
          icon: 'checkbox-blank-circle-outline',
          color: theme.colors.onSurfaceVariant,
          defaultLabel: status === 'disconnected' ? 'Not Connected' : 'Inactive',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: theme.colors.error,
          defaultLabel: 'Error',
        };
      default:
        return {
          icon: 'help-circle-outline',
          color: theme.colors.onSurfaceVariant,
          defaultLabel: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    text: {
      fontSize: textSize,
      color: config.color,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <Icon
        name={config.icon}
        size={iconSize}
        color={config.color}
        accessibilityLabel={`${status} status`}
      />
      {!iconOnly && <Text style={styles.text}>{displayLabel}</Text>}
    </View>
  );
};
