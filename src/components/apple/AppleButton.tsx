import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleInteractive } from './primitives/AppleInteractive';
import { borderRadius, touchTargets } from '@/design-system/theme/spacing';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple button functionality
// - Open/Closed: Extensible through variants without modification
// - Liskov Substitution: Can replace any existing button component
// - Interface Segregation: Small, focused interface for buttons
// - Dependency Inversion: Depends on universal primitives and theme abstractions

interface AppleButtonProps {
  title: string;
  onPress?: () => void;

  // APPLE BUTTON VARIANTS (from reference images analysis)
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success';

  // UNIVERSAL SIZING SYSTEM (reusable across all screens)
  size?: 'small' | 'medium' | 'large' | 'hero';

  // APPLE BUTTON STATES (comprehensive state management)
  disabled?: boolean;
  loading?: boolean;

  // UNIVERSAL LAYOUT SYSTEM (works everywhere)
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// UNIVERSAL APPLE BUTTON COMPONENT (Single Responsibility)
// This replaces ALL button components: Settings, Orders, Payments, Menu, etc.
export const AppleButton: React.FC<AppleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();

  // APPLE BUTTON COLOR MAPPING (using layered color system)
  const getButtonColors = () => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.surfaceDisabled,
        textColor: theme.colors.onSurfaceDisabled,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          textColor: theme.colors.onPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: isDark ? theme.colors.layer2 : theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: theme.colors.primary,
        };
      case 'destructive':
        return {
          backgroundColor: theme.colors.error,
          textColor: theme.colors.onError,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          textColor: theme.colors.onSuccess,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          textColor: theme.colors.onPrimary,
        };
    }
  };

  // UNIVERSAL SIZING SYSTEM (Interface Segregation)
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: touchTargets.minimum,
          fontSize: 14,
          borderRadius: borderRadius.appleMedium as number,
        };
      case 'medium':
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: touchTargets.comfortable,
          fontSize: 16,
          borderRadius: borderRadius.universalButton as number,
        };
      case 'large':
        return {
          paddingHorizontal: 20,
          paddingVertical: 16,
          minHeight: touchTargets.large,
          fontSize: 18,
          borderRadius: borderRadius.universalButton as number,
        };
      case 'hero':
        return {
          paddingHorizontal: 24,
          paddingVertical: 20,
          minHeight: touchTargets.posLarge,
          fontSize: 20,
          borderRadius: borderRadius.appleXLarge as number,
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: touchTargets.comfortable,
          fontSize: 16,
          borderRadius: borderRadius.universalButton as number,
        };
    }
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  const buttonStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundColor,
      borderRadius: sizeStyles.borderRadius,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      minHeight: sizeStyles.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      ...style,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: icon ? 8 : 0,
    },
    text: {
      color: colors.textColor,
      fontSize: sizeStyles.fontSize,
      fontWeight: variant === 'ghost' ? '500' : '600',
      textAlign: 'center',
      ...textStyle,
    },
    iconLeft: {
      marginRight: 8,
    },
    iconRight: {
      marginLeft: 8,
    },
  });

  const renderContent = () => {
    if (loading) {
      return <Text style={buttonStyles.text}>Loading...</Text>;
    }

    const textElement = <Text style={buttonStyles.text}>{title}</Text>;

    if (!icon) {
      return textElement;
    }

    return (
      <View style={buttonStyles.content}>
        {iconPosition === 'left' && <View style={buttonStyles.iconLeft}>{icon}</View>}
        {textElement}
        {iconPosition === 'right' && <View style={buttonStyles.iconRight}>{icon}</View>}
      </View>
    );
  };

  // UNIVERSAL INTERACTIVE WRAPPER (Open/Closed Principle)
  // Uses AppleInteractive primitive for consistent touch feedback
  return (
    <AppleInteractive
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      feedbackType={variant === 'ghost' ? 'opacity' : 'scale'}
      style={buttonStyles.container}
    >
      {renderContent()}
    </AppleInteractive>
  );
};

// USAGE EXAMPLES (shows universal reusability):
// Settings screen: <AppleButton title="Save Settings" variant="primary" onPress={save} />
// Dashboard: <AppleButton title="View Reports" variant="secondary" size="large" />
// Table management: <AppleButton title="Clear Table" variant="destructive" size="small" />
// Order screen: <AppleButton title="Complete Order" variant="success" size="hero" fullWidth />
// Payment: <AppleButton title="Process Payment" variant="primary" size="large" fullWidth />
// Menu: <AppleButton title="Add to Cart" variant="primary" icon={<PlusIcon />} />
// Login: <AppleButton title="Sign In" variant="primary" size="large" fullWidth />