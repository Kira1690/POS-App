import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastProps {
  /** Toast type for semantic styling */
  type: ToastType;
  /** Message to display */
  message: string;
  /** Auto dismiss duration in ms (default: 4000) */
  duration?: number;
  /** Action button configuration */
  action?: ToastAction;
  /** Whether toast is visible */
  visible: boolean;
  /** Callback when toast should be dismissed */
  onDismiss: () => void;
  /** Custom icon override */
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Disable auto dismiss */
  persistent?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Position override */
  position?: 'top' | 'bottom';
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 4000,
  action,
  visible,
  onDismiss,
  icon,
  persistent = false,
  showCloseButton = false,
  position = 'top',
  accessibilityLabel,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Screen dimensions and safe area
  const { width: screenWidth } = Dimensions.get('window');
  const statusBarHeight = StatusBar.currentHeight || 0;
  const safeAreaTop = Platform.OS === 'ios' ? 50 : statusBarHeight + 10;

  // Auto dismiss timer
  useEffect(() => {
    if (visible && !persistent) {
      timeoutRef.current = setTimeout(() => {
        onDismiss();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration, persistent, onDismiss]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -100 : 100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, position]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Handle action press
  const handleActionPress = useCallback(() => {
    if (action) {
      action.onPress();
      onDismiss();
    }
  }, [action, onDismiss]);

  // Get semantic colors based on type
  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          background: theme.colors.successContainer,
          border: theme.colors.success,
          text: theme.colors.onSuccessContainer,
          icon: theme.colors.success,
        };
      case 'error':
        return {
          background: theme.colors.errorContainer,
          border: theme.colors.error,
          text: theme.colors.onErrorContainer,
          icon: theme.colors.error,
        };
      case 'warning':
        return {
          background: theme.colors.warningContainer,
          border: theme.colors.warning,
          text: theme.colors.onWarningContainer,
          icon: theme.colors.warning,
        };
      case 'info':
        return {
          background: theme.colors.primaryContainer,
          border: theme.colors.primary,
          text: theme.colors.onPrimaryContainer,
          icon: theme.colors.primary,
        };
      default:
        return {
          background: theme.colors.surface,
          border: theme.colors.outline,
          text: theme.colors.onSurface,
          icon: theme.colors.onSurface,
        };
    }
  };

  // Get default icon for type
  const getDefaultIcon = (): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  // Get container styles
  const getContainerStyles = (): ViewStyle => {
    const colors = getTypeColors();
    
    return {
      position: 'absolute',
      top: position === 'top' ? safeAreaTop : undefined,
      bottom: position === 'bottom' ? safeAreaTop : undefined,
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.background,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
      borderRadius: borderRadius.input,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      zIndex: 10000,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 6,
      maxWidth: screenWidth - (spacing.lg * 2),
    };
  };

  // Get content container styles
  const getContentStyles = (): ViewStyle => ({
    flex: 1,
    marginLeft: spacing.sm,
  });

  // Get message text styles
  const getMessageStyles = (): TextStyle => {
    const colors = getTypeColors();
    
    return {
      ...typography.authBody,
      color: colors.text,
      lineHeight: 20,
    };
  };

  // Get action button styles
  const getActionButtonStyles = (): ViewStyle => {
    const colors = getTypeColors();
    
    return {
      marginTop: spacing.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.border,
      borderRadius: borderRadius.button,
      alignSelf: 'flex-start',
    };
  };

  // Get action text styles
  const getActionTextStyles = (): TextStyle => {
    const colors = getTypeColors();
    
    return {
      ...typography.buttonSmall,
      color: isDark ? theme.colors.surface : theme.colors.onPrimary,
      fontWeight: '600',
    };
  };

  // Get close button styles
  const getCloseButtonStyles = (): ViewStyle => ({
    padding: spacing.xs,
    marginLeft: spacing.sm,
  });

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  const colors = getTypeColors();

  return (
    <Animated.View
      style={[
        getContainerStyles(),
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${type} notification: ${message}`}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Icon */}
      <MaterialIcons
        name={icon || getDefaultIcon()}
        size={20}
        color={colors.icon}
      />

      {/* Content */}
      <View style={getContentStyles()}>
        {/* Message */}
        <Text style={getMessageStyles()}>
          {message}
        </Text>

        {/* Action Button */}
        {action && (
          <TouchableOpacity
            style={getActionButtonStyles()}
            onPress={handleActionPress}
            accessibilityLabel={action.label}
            accessibilityRole="button"
          >
            <Text style={getActionTextStyles()}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Close Button */}
      {(showCloseButton || persistent) && (
        <TouchableOpacity
          style={getCloseButtonStyles()}
          onPress={handleDismiss}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <MaterialIcons
            name="close"
            size={16}
            color={colors.text}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Toast manager for global toast handling
export class ToastManager {
  private static instance: ToastManager;
  private toastRef: React.RefObject<{
    show: (props: Omit<ToastProps, 'visible' | 'onDismiss'>) => void;
  }> | null = null;

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  setRef(ref: React.RefObject<any>) {
    this.toastRef = ref;
  }

  show(props: Omit<ToastProps, 'visible' | 'onDismiss'>) {
    if (this.toastRef?.current) {
      this.toastRef.current.show(props);
    }
  }

  success(message: string, action?: ToastAction) {
    this.show({ type: 'success', message, action });
  }

  error(message: string, action?: ToastAction) {
    this.show({ type: 'error', message, action });
  }

  warning(message: string, action?: ToastAction) {
    this.show({ type: 'warning', message, action });
  }

  info(message: string, action?: ToastAction) {
    this.show({ type: 'info', message, action });
  }
}

// Hook for using toast
export const useToast = () => {
  const [toastProps, setToastProps] = React.useState<ToastProps | null>(null);

  const showToast = React.useCallback((props: Omit<ToastProps, 'visible' | 'onDismiss'>) => {
    setToastProps({
      ...props,
      visible: true,
      onDismiss: () => setToastProps(null),
    });
  }, []);

  const hideToast = React.useCallback(() => {
    setToastProps(null);
  }, []);

  const success = React.useCallback((message: string, action?: ToastAction) => {
    showToast({ type: 'success', message, action });
  }, [showToast]);

  const error = React.useCallback((message: string, action?: ToastAction) => {
    showToast({ type: 'error', message, action });
  }, [showToast]);

  const warning = React.useCallback((message: string, action?: ToastAction) => {
    showToast({ type: 'warning', message, action });
  }, [showToast]);

  const info = React.useCallback((message: string, action?: ToastAction) => {
    showToast({ type: 'info', message, action });
  }, [showToast]);

  return {
    toastProps,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
    ToastComponent: toastProps ? <Toast {...toastProps} /> : null,
  };
};

export default Toast;