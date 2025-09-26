import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius } from '@/design-system/theme/spacing';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple pill-shaped elements
// - Open/Closed: Extensible through props without modification
// - Liskov Substitution: Can replace toggles, badges, status indicators
// - Interface Segregation: Small, focused interface for pill elements
// - Dependency Inversion: Depends on theme abstractions

interface ApplePillProps {
  children?: React.ReactNode;
  text?: string;

  // APPLE PILL VARIANTS (from reference images analysis)
  variant?: 'status' | 'toggle' | 'badge' | 'indicator' | 'action';

  // APPLE COLOR SYSTEM (uses layered colors)
  color?: 'primary' | 'success' | 'error' | 'warning' | 'secondary' | 'neutral';

  // UNIVERSAL SIZING SYSTEM (reusable across all screens)
  size?: 'small' | 'medium' | 'large';

  // UNIVERSAL INTERACTION SYSTEM (works everywhere)
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// UNIVERSAL APPLE PILL COMPONENT (Single Responsibility)
// This replaces ALL pill-shaped elements: toggles, badges, status, indicators
export const ApplePill: React.FC<ApplePillProps> = ({
  children,
  text,
  variant = 'status',
  color = 'primary',
  size = 'medium',
  interactive = false,
  selected = false,
  disabled = false,
  onPress,
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();

  // APPLE COLOR MAPPING (using layered color system)
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceDisabled;

    if (selected || variant === 'toggle') {
      switch (color) {
        case 'primary': return theme.colors.primary;
        case 'success': return theme.colors.success;
        case 'error': return theme.colors.error;
        case 'warning': return theme.colors.warning;
        case 'secondary': return theme.colors.secondary;
        case 'neutral': return isDark ? theme.colors.layer2 : theme.colors.surface;
        default: return theme.colors.primary;
      }
    }

    // Unselected state uses subtle layered backgrounds
    return isDark ? theme.colors.layer2 : theme.colors.surfaceVariant;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.onSurfaceDisabled;

    if (selected || variant === 'toggle') {
      switch (color) {
        case 'primary': return theme.colors.onPrimary;
        case 'success': return theme.colors.onSuccess;
        case 'error': return theme.colors.onError;
        case 'warning': return theme.colors.onWarning;
        case 'secondary': return theme.colors.onSecondary;
        case 'neutral': return theme.colors.onSurface;
        default: return theme.colors.onPrimary;
      }
    }

    return theme.colors.onSurfaceVariant;
  };

  // UNIVERSAL SIZING SYSTEM (Interface Segregation)
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          minHeight: 24,
          fontSize: 12,
        };
      case 'medium':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          minHeight: 32,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          minHeight: 40,
          fontSize: 16,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          minHeight: 32,
          fontSize: 14,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const pillStyles = StyleSheet.create({
    container: {
      backgroundColor: getBackgroundColor(),
      borderRadius: sizeStyles.minHeight / 2, // Perfect pill shape (half of height)
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      minHeight: sizeStyles.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      ...style,
    },
    interactive: {
      // Apple-style interactive feedback
      opacity: 0.8,
    },
    text: {
      color: getTextColor(),
      fontSize: sizeStyles.fontSize,
      fontWeight: selected ? '600' : '500',
      textAlign: 'center',
      ...textStyle,
    },
  });

  const content = children || (text && <Text style={pillStyles.text}>{text}</Text>);

  // UNIVERSAL INTERACTIVE COMPONENT (Open/Closed Principle)
  if (interactive || onPress) {
    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => [
          pillStyles.container,
          pressed && pillStyles.interactive,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  // STATIC PILL VERSION (Liskov Substitution)
  return (
    <View style={pillStyles.container}>
      {content}
    </View>
  );
};

// USAGE EXAMPLES (shows universal reusability):
// Order status: <ApplePill text="Ready" variant="status" color="success" />
// Table status: <ApplePill text="Occupied" variant="indicator" color="warning" />
// Settings toggle: <ApplePill text="ON" variant="toggle" color="primary" selected />
// Badge count: <ApplePill text="5" variant="badge" color="error" size="small" />
// Action button: <ApplePill text="Save" variant="action" interactive onPress={save} />