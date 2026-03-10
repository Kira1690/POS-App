import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius, touchTargets } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none';

export interface BiometricButtonProps {
  /** Authentication success handler */
  onSuccess: () => void;
  /** Authentication failure handler */
  onError?: (error: string) => void;
  /** Custom prompt message */
  promptMessage?: string;
  /** Cancel button text */
  cancelButtonText?: string;
  /** Fallback button text */
  fallbackButtonText?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  disabled?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Custom button text */
  buttonText?: string;
  /** Show biometric type icon */
  showIcon?: boolean;
  /** Auto check availability on mount */
  autoCheckAvailability?: boolean;
  /** Custom styles */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

export const BiometricButton: React.FC<BiometricButtonProps> = ({
  onSuccess,
  onError,
  promptMessage = 'Authenticate with biometrics',
  cancelButtonText = 'Cancel',
  fallbackButtonText = 'Use Password',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  buttonText,
  showIcon = true,
  autoCheckAvailability = true,
  style,
  accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Check biometric availability on mount
  useEffect(() => {
    if (autoCheckAvailability) {
      checkBiometricAvailability();
    }
  }, [autoCheckAvailability]);

  // Pulse animation for biometric button
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isAvailable && !isAuthenticating && !disabled) {
          pulse();
        }
      });
    };

    if (isAvailable && !isAuthenticating && !disabled) {
      pulse();
    }

    return () => {
      pulseAnimation.stopAnimation();
    };
  }, [isAvailable, isAuthenticating, disabled, pulseAnimation]);

  // Check if biometric authentication is available
  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled && supportedTypes.length > 0) {
        setIsAvailable(true);
        
        // Determine biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('iris');
        } else {
          setBiometricType('fingerprint'); // Default fallback
        }
      } else {
        setIsAvailable(false);
        setBiometricType('none');
      }
    } catch {
      setIsAvailable(false);
      setBiometricType('none');
    }
  };

  // Perform biometric authentication
  const authenticateWithBiometrics = async () => {
    if (!isAvailable || isAuthenticating || disabled) return;

    setIsAuthenticating(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: cancelButtonText,
        fallbackLabel: fallbackButtonText,
        disableDeviceFallback: false,
      });

      if (result.success) {
        onSuccess();
      } else {
        const errorMessage = result.error === 'user_cancel' 
          ? 'Authentication was cancelled' 
          : 'Authentication failed';
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication error occurred';
      onError?.(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Get button icon based on biometric type
  const getBiometricIcon = (): keyof typeof MaterialIcons.glyphMap => {
    switch (biometricType) {
      case 'face':
        return 'face';
      case 'fingerprint':
        return 'fingerprint';
      case 'iris':
        return 'visibility';
      default:
        return 'security';
    }
  };

  // Get button text based on biometric type
  const getButtonText = (): string => {
    if (buttonText) return buttonText;
    
    if (!isAvailable) return 'Biometric Unavailable';
    
    switch (biometricType) {
      case 'face':
        return 'Use Face ID';
      case 'fingerprint':
        return 'Use Fingerprint';
      case 'iris':
        return 'Use Iris Scan';
      default:
        return 'Use Biometrics';
    }
  };

  // Get button size dimensions
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          minHeight: touchTargets.comfortable,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
        };
      case 'medium':
        return {
          minHeight: touchTargets.biometricButton,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
        };
      case 'large':
        return {
          minHeight: touchTargets.posLarge,
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing.lg,
        };
      default:
        return {
          minHeight: touchTargets.biometricButton,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
        };
    }
  };

  // Get button styles based on variant and state
  const getButtonStyles = (): ViewStyle => {
    const buttonSize = getButtonSize();
    
    const baseStyles: ViewStyle = {
      borderRadius: borderRadius.button,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...buttonSize,
    };

    // Variant-specific styles
    const variantStyles: ViewStyle = (() => {
      if (!isAvailable) {
        return {
          backgroundColor: theme.colors.surfaceDisabled,
          borderWidth: 0,
        };
      }

      switch (variant) {
        case 'primary':
          return {
            backgroundColor: disabled 
              ? theme.colors.surfaceDisabled 
              : theme.colors.biometricAvailable,
            borderWidth: 0,
          };
        case 'secondary':
          return {
            backgroundColor: disabled 
              ? theme.colors.surfaceDisabled 
              : theme.colors.surface,
            borderWidth: 2,
            borderColor: theme.colors.biometricAvailable,
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.biometricAvailable,
          };
        default:
          return {};
      }
    })();

    return {
      ...baseStyles,
      ...variantStyles,
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
      if (!isAvailable || disabled) {
        return {
          color: theme.colors.onSurfaceDisabled,
        };
      }

      switch (variant) {
        case 'primary':
          return {
            color: theme.colors.onPrimary,
          };
        case 'secondary':
          return {
            color: theme.colors.biometricAvailable,
          };
        case 'ghost':
          return {
            color: theme.colors.biometricAvailable,
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

  // Get icon color based on variant
  const getIconColor = (): string => {
    if (!isAvailable || disabled) {
      return theme.colors.onSurfaceDisabled;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.onPrimary;
      case 'secondary':
      case 'ghost':
        return theme.colors.biometricAvailable;
      default:
        return theme.colors.onPrimary;
    }
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

  // Don't render if not available and auto-check is enabled
  if (autoCheckAvailability && !isAvailable) {
    return null;
  }

  return (
    <Animated.View
      style={[
        { transform: [{ scale: pulseAnimation }] },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          getButtonStyles(),
          (disabled || !isAvailable) && { opacity: 0.6 },
        ]}
        onPress={authenticateWithBiometrics}
        disabled={disabled || !isAvailable || isAuthenticating || loading}
        accessibilityLabel={accessibilityLabel || getButtonText()}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || !isAvailable || isAuthenticating || loading,
          busy: isAuthenticating || loading,
        }}
        testID={testID}
        activeOpacity={0.8}
      >
        {(isAuthenticating || loading) ? (
          <ActivityIndicator
            size="small"
            color={getIconColor()}
            style={{ marginRight: spacing.sm }}
          />
        ) : (
          showIcon && (
            <MaterialIcons
              name={getBiometricIcon()}
              size={getIconSize()}
              color={getIconColor()}
              style={{ marginRight: spacing.sm }}
            />
          )
        )}
        
        <Text style={getTextStyles()} numberOfLines={1}>
          {isAuthenticating ? 'Authenticating...' : getButtonText()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Hook for biometric authentication management
export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isLoading, setIsLoading] = useState(false);

  // Check biometric availability
  const checkAvailability = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled && supportedTypes.length > 0) {
        setIsAvailable(true);
        
        // Determine biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('iris');
        }
        
        return true;
      } else {
        setIsAvailable(false);
        setBiometricType('none');
        return false;
      }
    } catch (error) {
      setIsAvailable(false);
      setBiometricType('none');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate with biometrics
  const authenticate = async (options?: {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isAvailable) {
      return { success: false, error: 'Biometric authentication not available' };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage || 'Authenticate with biometrics',
        cancelLabel: options?.cancelLabel || 'Cancel',
        fallbackLabel: options?.fallbackLabel || 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        const errorMessage = result.error === 'user_cancel' 
          ? 'Authentication was cancelled' 
          : 'Authentication failed';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication error occurred';
      return { success: false, error: errorMessage };
    }
  };

  return {
    isAvailable,
    biometricType,
    isLoading,
    checkAvailability,
    authenticate,
  };
};

export default BiometricButton;