import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, spacing } from '@/design-system/theme/spacing';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple progress indication
// - Open/Closed: Extensible through variants without modification
// - Liskov Substitution: Can replace any progress indicator component
// - Interface Segregation: Small, focused interface for progress bars
// - Dependency Inversion: Depends on theme abstractions

interface AppleProgressBarProps {
  progress: number; // 0-1 (0% to 100%)

  // APPLE PROGRESS VARIANTS (from reference images analysis)
  variant?: 'default' | 'thin' | 'thick' | 'circular';

  // APPLE COLOR SYSTEM (uses theme colors)
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';

  // APPLE CONTENT SYSTEM (optional labels)
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;

  // UNIVERSAL SIZING SYSTEM (reusable across all screens)
  size?: 'small' | 'medium' | 'large';
  width?: number;

  // APPLE ANIMATION SYSTEM (smooth transitions)
  animated?: boolean;

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

// UNIVERSAL APPLE PROGRESS BAR COMPONENT (Single Responsibility)
// This replaces ALL progress indicators: loading, battery, storage, etc.
export const AppleProgressBar: React.FC<AppleProgressBarProps> = ({
  progress,
  variant = 'default',
  color = 'primary',
  showLabel = false,
  label,
  showPercentage = false,
  size = 'medium',
  width,
  animated = true,
  style,
  labelStyle,
}) => {
  const { theme, isDark } = useTheme();

  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);

  // APPLE PROGRESS BAR SIZING SYSTEM (from reference images)
  const getSizeSpecs = () => {
    switch (size) {
      case 'small':
        return {
          height: 4,
          defaultWidth: 120,
          labelFontSize: 12,
        };
      case 'large':
        return {
          height: 12,
          defaultWidth: 280,
          labelFontSize: 16,
        };
      case 'medium':
      default:
        return {
          height: 8,
          defaultWidth: 200,
          labelFontSize: 14,
        };
    }
  };

  // APPLE COLOR MAPPING (using layered color system)
  const getProgressColors = () => {
    const backgroundTrack = isDark ? theme.colors.layer2 : theme.colors.surfaceVariant;

    switch (color) {
      case 'primary':
        return {
          track: backgroundTrack,
          fill: theme.colors.primary,
        };
      case 'success':
        return {
          track: backgroundTrack,
          fill: theme.colors.success,
        };
      case 'warning':
        return {
          track: backgroundTrack,
          fill: theme.colors.warning,
        };
      case 'error':
        return {
          track: backgroundTrack,
          fill: theme.colors.error,
        };
      case 'neutral':
        return {
          track: backgroundTrack,
          fill: isDark ? theme.colors.layer3 : theme.colors.outline,
        };
      default:
        return {
          track: backgroundTrack,
          fill: theme.colors.primary,
        };
    }
  };

  const sizeSpecs = getSizeSpecs();
  const colors = getProgressColors();
  const progressWidth = width || sizeSpecs.defaultWidth;

  // APPLE PROGRESS BAR STYLING (rounded corners from reference images)
  const progressStyles = StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      ...style,
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: progressWidth,
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: sizeSpecs.labelFontSize,
      fontWeight: '500',
      color: theme.colors.onSurface,
      ...labelStyle,
    },
    percentage: {
      fontSize: sizeSpecs.labelFontSize,
      fontWeight: '600',
      color: colors.fill,
      ...labelStyle,
    },
    track: {
      width: progressWidth,
      height: sizeSpecs.height,
      backgroundColor: colors.track,
      borderRadius: borderRadius.pill as number, // Perfect pill shape like Apple
      overflow: 'hidden',
      // Apple subtle shadow for depth
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 1,
      elevation: 1,
    },
    fill: {
      height: '100%',
      width: `${percentage}%`,
      backgroundColor: colors.fill,
      borderRadius: borderRadius.pill as number, // Maintains pill shape
      // Apple progress glow effect
      shadowColor: colors.fill,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
  });

  // APPLE LABEL RENDERING (from reference images structure)
  const renderLabel = () => {
    if (!showLabel && !showPercentage) return null;

    return (
      <View style={progressStyles.labelContainer}>
        {showLabel && label && (
          <Text style={progressStyles.label}>{label}</Text>
        )}
        {showPercentage && (
          <Text style={progressStyles.percentage}>{percentage}%</Text>
        )}
      </View>
    );
  };

  return (
    <View style={progressStyles.container}>
      {renderLabel()}
      <View style={progressStyles.track}>
        <View style={progressStyles.fill} />
      </View>
    </View>
  );
};

// SPECIALIZED PROGRESS BAR VARIANTS (following Open/Closed principle)

// BATTERY PROGRESS (like Apple Battery settings)
export const BatteryProgressBar: React.FC<{ level: number; showPercentage?: boolean }> = ({ level, showPercentage = true }) => (
  <AppleProgressBar
    progress={level / 100}
    color="success"
    size="medium"
    label="Battery"
    showLabel={true}
    showPercentage={showPercentage}
  />
);

// STORAGE PROGRESS (like Apple Storage settings)
export const StorageProgressBar: React.FC<{ used: number; total: number; label?: string }> = ({ used, total, label = 'Storage' }) => (
  <AppleProgressBar
    progress={used / total}
    color="primary"
    size="large"
    label={label}
    showLabel={true}
    showPercentage={true}
  />
);

// LOADING PROGRESS (for loading states)
export const LoadingProgressBar: React.FC<{ progress: number; message?: string }> = ({ progress, message }) => (
  <AppleProgressBar
    progress={progress}
    color="primary"
    size="medium"
    label={message}
    showLabel={!!message}
    showPercentage={false}
    animated={true}
  />
);

// ORDER PROGRESS (for order completion tracking)
export const OrderProgressBar: React.FC<{ completed: number; total: number }> = ({ completed, total }) => (
  <AppleProgressBar
    progress={completed / total}
    color="success"
    size="small"
    label="Order Progress"
    showLabel={true}
    showPercentage={true}
  />
);

// KITCHEN EFFICIENCY (for kitchen performance)
export const KitchenEfficiencyBar: React.FC<{ efficiency: number }> = ({ efficiency }) => {
  const getEfficiencyColor = (eff: number) => {
    if (eff >= 0.8) return 'success';
    if (eff >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <AppleProgressBar
      progress={efficiency}
      color={getEfficiencyColor(efficiency)}
      size="medium"
      label="Kitchen Efficiency"
      showLabel={true}
      showPercentage={true}
    />
  );
};

// USAGE EXAMPLES (shows universal reusability):
// Settings screen: <BatteryProgressBar level={85} />
// Dashboard: <StorageProgressBar used={15.7} total={50} label="iCloud Storage" />
// Loading screen: <LoadingProgressBar progress={0.6} message="Loading menu..." />
// Order tracking: <OrderProgressBar completed={3} total={5} />
// Kitchen dashboard: <KitchenEfficiencyBar efficiency={0.92} />
// Custom progress: <AppleProgressBar progress={0.75} color="warning" label="Upload" />