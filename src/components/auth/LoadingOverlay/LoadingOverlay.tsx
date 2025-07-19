import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export interface LoadingOverlayProps {
  /** Whether the loading overlay is visible */
  visible: boolean;
  /** Loading message to display */
  message?: string;
  /** Make background transparent (less opacity) */
  transparent?: boolean;
  /** Allow dismissing by tapping outside */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Custom spinner size */
  spinnerSize?: 'small' | 'large';
  /** Custom spinner color */
  spinnerColor?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  transparent = false,
  dismissible = false,
  onDismiss,
  spinnerSize = 'large',
  spinnerColor,
  showCloseButton = false,
  accessibilityLabel,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const spinnerRotation = useRef(new Animated.Value(0)).current;

  // Screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Animate overlay visibility
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start spinner rotation
      startSpinnerAnimation();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Custom spinner animation
  const startSpinnerAnimation = () => {
    spinnerRotation.setValue(0);
    Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (dismissible && onDismiss) {
      onDismiss();
    }
  };

  // Handle close button press
  const handleClosePress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // Get overlay styles
  const getOverlayStyles = (): ViewStyle => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: transparent 
      ? isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.3)'
      : isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    paddingTop: StatusBar.currentHeight || 0,
  });

  // Get content container styles
  const getContentStyles = (): ViewStyle => ({
    backgroundColor: isDark 
      ? theme.colors.surfaceVariant 
      : theme.colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    maxWidth: screenWidth * 0.8,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  });

  // Get spinner rotation
  const getSpinnerRotation = () => {
    return spinnerRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  };

  // Get message text styles
  const getMessageStyles = (): TextStyle => ({
    ...typography.authBody,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginTop: spacing.lg,
    maxWidth: screenWidth * 0.6,
  });

  // Get close button styles
  const getCloseButtonStyles = (): ViewStyle => ({
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark 
      ? theme.colors.surfaceVariant 
      : theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  });

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        getOverlayStyles(),
        {
          opacity: fadeAnim,
        },
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Loading'}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={handleBackdropPress}
        activeOpacity={1}
        disabled={!dismissible}
        accessibilityLabel={dismissible ? 'Tap to dismiss loading' : undefined}
      />

      {/* Content Container */}
      <Animated.View
        style={[
          getContentStyles(),
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Close Button */}
        {showCloseButton && onDismiss && (
          <TouchableOpacity
            style={getCloseButtonStyles()}
            onPress={handleClosePress}
            accessibilityLabel="Close loading overlay"
            accessibilityRole="button"
          >
            <MaterialIcons
              name="close"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}

        {/* Custom Spinner */}
        <Animated.View
          style={{
            transform: [{ rotate: getSpinnerRotation() }],
          }}
        >
          <ActivityIndicator
            size={spinnerSize}
            color={spinnerColor || theme.colors.primary}
          />
        </Animated.View>

        {/* Loading Message */}
        {message && (
          <Text style={getMessageStyles()}>
            {message}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
};

// Hook for managing loading state
export const useLoadingOverlay = () => {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string>('');

  const showLoading = (loadingMessage?: string) => {
    setMessage(loadingMessage || '');
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
    setMessage('');
  };

  return {
    loading,
    message,
    showLoading,
    hideLoading,
  };
};

export default LoadingOverlay;