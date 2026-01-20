import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  ActivityIndicator, 
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius, touchTargets } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export type AuthButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AuthButtonSize = 'small' | 'medium' | 'large';
export type IconName = keyof typeof MaterialIcons.glyphMap;

export interface AuthButtonProps {
  /** Button variant for different use cases */
  variant?: AuthButtonVariant;
  /** Button size for different contexts */
  size?: AuthButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Icon to display */
  icon?: IconName;
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Button text content */
  children?: React.ReactNode;
  /** Button title (alternative to children) */
  title?: string;
  /** Custom styles */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onPress,
  children,
  style,
  accessibilityLabel,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const [pressed, setPPressed] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Handle press animations
  const handlePressIn = () => {
    setPPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    setPPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  // Get button styles based on variant and state
  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: borderRadius.button,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
    };

    // Size-specific styles
    const sizeStyles: ViewStyle = {
      small: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        minHeight: touchTargets.comfortable,
      },
      medium: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        minHeight: touchTargets.authButton,
      },
      large: {
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        minHeight: touchTargets.posLarge,
      },
    }[size];

    // Variant-specific styles
    const variantStyles: ViewStyle = (() => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: disabled 
              ? theme.colors.surfaceDisabled 
              : pressed 
                ? theme.colors.primaryPressed 
                : theme.colors.authPrimary,
            borderWidth: 0,
          };
        case 'secondary':
          return {
            backgroundColor: disabled 
              ? theme.colors.surfaceDisabled 
              : pressed 
                ? theme.colors.secondaryPressed 
                : theme.colors.surface,
            borderWidth: 2,
            borderColor: disabled 
              ? theme.colors.outline 
              : theme.colors.authSecondary,
          };
        case 'ghost':
          return {
            backgroundColor: pressed 
              ? theme.colors.surfaceVariant 
              : 'transparent',
            borderWidth: 0,
          };
        case 'danger':
          return {
            backgroundColor: disabled 
              ? theme.colors.surfaceDisabled 
              : pressed 
                ? theme.colors.errorPressed 
                : theme.colors.authError,
            borderWidth: 0,
          };
        default:
          return {};
      }
    })();

    // Full width handling
    const widthStyles: ViewStyle = fullWidth ? { width: '100%' } : {};

    return {
      ...baseStyles,
      ...sizeStyles,
      ...variantStyles,
      ...widthStyles,
    };
  };

  // Get text styles based on variant and state
  const getTextStyles = (): TextStyle => {
    const baseTextStyles: TextStyle = (() => {
      switch (size) {
        case 'small':
          return typography.buttonSmall;
        case 'medium':
          return typography.authButton;
        case 'large':
          return typography.buttonLarge;
        default:
          return typography.authButton;
      }
    })();

    const variantTextStyles: TextStyle = (() => {
      switch (variant) {
        case 'primary':
          return {
            color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onPrimary,
          };
        case 'secondary':
          return {
            color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.authSecondary,
          };
        case 'ghost':
          return {
            color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.primary,
          };
        case 'danger':
          return {
            color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onError,
          };
        default:
          return {};
      }
    })();

    return {
      ...baseTextStyles,
      ...variantTextStyles,
    };
  };

  // Get icon size based on button size
  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  // Get icon color based on variant
  const getIconColor = (): string => {
    switch (variant) {
      case 'primary':
        return disabled ? theme.colors.onSurfaceDisabled : theme.colors.onPrimary;
      case 'secondary':
        return disabled ? theme.colors.onSurfaceDisabled : theme.colors.authSecondary;
      case 'ghost':
        return disabled ? theme.colors.onSurfaceDisabled : theme.colors.primary;
      case 'danger':
        return disabled ? theme.colors.onSurfaceDisabled : theme.colors.onError;
      default:
        return theme.colors.onPrimary;
    }
  };

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          getButtonStyles(),
          disabled && { opacity: 0.6 },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Button')}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        testID={testID}
        activeOpacity={1} // We handle opacity with our own animation
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={getIconColor()}
            style={{ marginRight: spacing.sm }}
          />
        ) : (
          icon && (
            <MaterialIcons
              name={icon}
              size={getIconSize()}
              color={getIconColor()}
              style={{
                marginRight: iconPosition === 'left' ? spacing.sm : 0,
                marginLeft: iconPosition === 'right' ? spacing.sm : 0,
              }}
            />
          )
        )}
        
        <Text style={getTextStyles()} numberOfLines={1}>
          {children}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AuthButton;