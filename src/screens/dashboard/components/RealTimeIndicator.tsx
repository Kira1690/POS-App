/**
 * Real Time Indicator - Shows connection status and live data updates
 * Under 200 lines, focused on real-time status visualization
 */

import React, { memo, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

export interface RealTimeIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastUpdated?: Date;
  showTimestamp?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  status,
  lastUpdated,
  showTimestamp = true,
  size = 'medium'
}) => {
  const { theme } = useTheme();
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pulse animation for connecting state
  useEffect(() => {
    if (status === 'connecting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnimation]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: '#28a745',
          icon: 'wifi',
          label: 'Live',
          description: 'Real-time updates active'
        };
      case 'connecting':
        return {
          color: '#ffc107',
          icon: 'wifi-off',
          label: 'Connecting',
          description: 'Establishing connection'
        };
      case 'error':
        return {
          color: '#dc3545',
          icon: 'wifi-off',
          label: 'Error',
          description: 'Connection failed'
        };
      case 'disconnected':
      default:
        return {
          color: '#6c757d',
          icon: 'wifi-off',
          label: 'Offline',
          description: 'No real-time updates'
        };
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = currentTime;
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const statusConfig = getStatusConfig();
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const isConnecting = status === 'connecting';

  return (
    <View style={[
      styles.container,
      styles[`container${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]
    ]}>
      <View style={styles.statusRow}>
        <Animated.View 
          style={[
            styles.iconContainer,
            { backgroundColor: `${statusConfig.color}20` },
            isConnecting && { opacity: pulseAnimation }
          ]}
        >
          <MaterialIcons 
            name={statusConfig.icon as any} 
            size={iconSize} 
            color={statusConfig.color} 
          />
        </Animated.View>
        
        <View style={styles.statusText}>
          <Text style={[
            styles.statusLabel,
            { color: statusConfig.color },
            styles[`statusLabel${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]
          ]}>
            {statusConfig.label}
          </Text>
          
          {size !== 'small' && (
            <Text style={[
              styles.statusDescription,
              { color: theme.colors.onSurfaceVariant },
              styles[`statusDescription${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]
            ]}>
              {statusConfig.description}
            </Text>
          )}
        </View>
      </View>

      {showTimestamp && lastUpdated && size !== 'small' && (
        <Text style={[
          styles.timestamp,
          { color: theme.colors.onSurfaceVariant }
        ]}>
          Updated: {getTimeAgo(lastUpdated)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  containerSmall: {
    padding: spacing.sm,
  },
  containerMedium: {
    padding: spacing.md,
  },
  containerLarge: {
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  statusLabelSmall: {
    ...typography.bodySmall,
  },
  statusLabelMedium: {
    ...typography.bodyMedium,
  },
  statusLabelLarge: {
    ...typography.bodyLarge,
  },
  statusDescription: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  statusDescriptionSmall: {
    ...typography.bodySmall,
    fontSize: 10,
  },
  statusDescriptionMedium: {
    ...typography.bodySmall,
  },
  statusDescriptionLarge: {
    ...typography.bodyMedium,
  },
  timestamp: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

export default memo(RealTimeIndicator);