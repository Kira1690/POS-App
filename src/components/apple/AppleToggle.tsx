import React from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleInteractive } from './primitives/AppleInteractive';
import { borderRadius, touchTargets } from '@/design-system/theme/spacing';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple toggle switch functionality
// - Open/Closed: Extensible through props without modification
// - Liskov Substitution: Can replace any toggle/switch component
// - Interface Segregation: Small, focused interface for toggles
// - Dependency Inversion: Depends on universal primitives and theme abstractions

interface AppleToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;

  // APPLE TOGGLE VARIANTS (from reference images analysis)
  variant?: 'default' | 'large' | 'small';

  // APPLE COLOR SYSTEM (uses theme colors)
  activeColor?: 'primary' | 'success' | 'warning' | 'custom';
  customActiveColor?: string;

  // UNIVERSAL STATE SYSTEM (reusable across all screens)
  disabled?: boolean;

  // APPLE ACCESSIBILITY (44pt touch targets)
  accessibilityLabel?: string;

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: ViewStyle;
}

// UNIVERSAL APPLE TOGGLE COMPONENT (Single Responsibility)
// This replaces ALL toggle/switch components throughout the app
export const AppleToggle: React.FC<AppleToggleProps> = ({
  value,
  onValueChange,
  variant = 'default',
  activeColor = 'primary',
  customActiveColor,
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  const { theme, isDark } = useTheme();

  // APPLE TOGGLE SIZING SYSTEM (from reference images)
  const getSizeSpecs = () => {
    switch (variant) {
      case 'small':
        return {
          width: 36,
          height: 20,
          thumbSize: 16,
          thumbPadding: 2,
          minTouchTarget: touchTargets.minimum,
        };
      case 'large':
        return {
          width: 56,
          height: 32,
          thumbSize: 28,
          thumbPadding: 2,
          minTouchTarget: touchTargets.large,
        };
      case 'default':
      default:
        return {
          width: 48,
          height: 28,
          thumbSize: 24,
          thumbPadding: 2,
          minTouchTarget: touchTargets.comfortable,
        };
    }
  };

  // APPLE COLOR MAPPING (using layered color system)
  const getToggleColors = () => {
    if (disabled) {
      return {
        trackActive: theme.colors.surfaceDisabled,
        trackInactive: theme.colors.surfaceDisabled,
        thumb: theme.colors.onSurfaceDisabled,
      };
    }

    const trackInactive = isDark ? theme.colors.layer2 : theme.colors.surfaceVariant;
    const thumb = theme.colors.surface;

    let trackActive: string;
    switch (activeColor) {
      case 'primary':
        trackActive = theme.colors.primary;
        break;
      case 'success':
        trackActive = theme.colors.success;
        break;
      case 'warning':
        trackActive = theme.colors.warning;
        break;
      case 'custom':
        trackActive = customActiveColor || theme.colors.primary;
        break;
      default:
        trackActive = theme.colors.primary;
    }

    return {
      trackActive,
      trackInactive,
      thumb,
    };
  };

  const sizeSpecs = getSizeSpecs();
  const colors = getToggleColors();

  // APPLE TOGGLE STYLING (perfect pill shape from reference images)
  const toggleStyles = StyleSheet.create({
    container: {
      minWidth: sizeSpecs.minTouchTarget,
      minHeight: sizeSpecs.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    },
    track: {
      width: sizeSpecs.width,
      height: sizeSpecs.height,
      borderRadius: sizeSpecs.height / 2, // Perfect pill shape (half of height)
      backgroundColor: value ? colors.trackActive : colors.trackInactive,
      padding: sizeSpecs.thumbPadding,
      justifyContent: 'center',
      // Apple subtle shadow for depth
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    thumb: {
      width: sizeSpecs.thumbSize,
      height: sizeSpecs.thumbSize,
      borderRadius: sizeSpecs.thumbSize / 2, // Perfect circle (half of size)
      backgroundColor: colors.thumb,
      position: 'absolute',
      left: value
        ? sizeSpecs.width - sizeSpecs.thumbSize - sizeSpecs.thumbPadding
        : sizeSpecs.thumbPadding,
      // Apple thumb shadow
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    disabled: {
      opacity: 0.5,
    },
  });

  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <AppleInteractive
      onPress={handleToggle}
      disabled={disabled}
      feedbackType="scale"
      style={toggleStyles.container}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[
        toggleStyles.track,
        disabled && toggleStyles.disabled,
      ]}>
        <View style={toggleStyles.thumb} />
      </View>
    </AppleInteractive>
  );
};

// SPECIALIZED TOGGLE VARIANTS (following Open/Closed principle)

// SETTINGS TOGGLE (for Settings screens)
export const AppleSettingsToggle: React.FC<Omit<AppleToggleProps, 'variant'>> = (props) => (
  <AppleToggle
    {...props}
    variant="default"
    activeColor="primary"
  />
);

// SUCCESS TOGGLE (for confirmations, success states)
export const AppleSuccessToggle: React.FC<Omit<AppleToggleProps, 'variant' | 'activeColor'>> = (props) => (
  <AppleToggle
    {...props}
    variant="default"
    activeColor="success"
  />
);

// LARGE TOGGLE (for primary settings, important toggles)
export const AppleLargeToggle: React.FC<Omit<AppleToggleProps, 'variant'>> = (props) => (
  <AppleToggle
    {...props}
    variant="large"
    activeColor="primary"
  />
);

// SMALL TOGGLE (for compact lists, secondary settings)
export const AppleSmallToggle: React.FC<Omit<AppleToggleProps, 'variant'>> = (props) => (
  <AppleToggle
    {...props}
    variant="small"
    activeColor="primary"
  />
);

// USAGE EXAMPLES (shows universal reusability):
// Settings screen: <AppleSettingsToggle value={isDarkMode} onValueChange={setDarkMode} />
// Device settings: <AppleLargeToggle value={isEnabled} onValueChange={setEnabled} />
// Notification settings: <AppleSmallToggle value={notifications} onValueChange={setNotifications} />
// Success confirmation: <AppleSuccessToggle value={confirmed} onValueChange={setConfirmed} />
// Custom color: <AppleToggle value={active} activeColor="custom" customActiveColor="#FF6B35" />
// Order management: <AppleToggle value={orderReady} activeColor="success" onValueChange={updateStatus} />
// Kitchen settings: <AppleToggle value={autoAccept} activeColor="warning" onValueChange={setAutoAccept} />