/**
 * PaymentProgressIndicator
 * Professional payment processing status indicator with animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { PaymentProcessingStatus } from '@/types/payment.types';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface PaymentProgressIndicatorProps {
  status: PaymentProcessingStatus;
  isLoading: boolean;
}

interface StatusConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  animated: boolean;
}

export const PaymentProgressIndicator: React.FC<PaymentProgressIndicatorProps> = ({
  status,
  isLoading,
}) => {
  const { theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Configure status display
  const getStatusConfig = (): StatusConfig => {
    switch (status) {
      case PaymentProcessingStatus.IDLE:
        return {
          icon: 'payment',
          title: 'Ready to Process Payment',
          subtitle: 'Select a payment method to continue',
          color: theme.colors.onSurfaceVariant,
          animated: false,
        };
      
      case PaymentProcessingStatus.CONNECTING:
        return {
          icon: 'bluetooth-searching',
          title: 'Connecting to Payment Device',
          subtitle: 'Please wait while we connect to your payment device...',
          color: theme.colors.primary,
          animated: true,
        };
      
      case PaymentProcessingStatus.PROCESSING:
        return {
          icon: 'sync',
          title: 'Processing Payment',
          subtitle: 'Please wait while your payment is being processed...',
          color: theme.colors.primary,
          animated: true,
        };
      
      case PaymentProcessingStatus.COMPLETED:
        return {
          icon: 'check-circle',
          title: 'Payment Successful',
          subtitle: 'Your payment has been processed successfully',
          color: '#4CAF50', // Green
          animated: false,
        };
      
      case PaymentProcessingStatus.FAILED:
        return {
          icon: 'error',
          title: 'Payment Failed',
          subtitle: 'There was an error processing your payment',
          color: theme.colors.error,
          animated: false,
        };
      
      case PaymentProcessingStatus.CANCELLED:
        return {
          icon: 'cancel',
          title: 'Payment Cancelled',
          subtitle: 'The payment process has been cancelled',
          color: theme.colors.onSurfaceVariant,
          animated: false,
        };
      
      case PaymentProcessingStatus.REFUNDING:
        return {
          icon: 'undo',
          title: 'Processing Refund',
          subtitle: 'Please wait while your refund is being processed...',
          color: theme.colors.secondary,
          animated: true,
        };
      
      case PaymentProcessingStatus.REFUNDED:
        return {
          icon: 'check-circle-outline',
          title: 'Refund Completed',
          subtitle: 'Your refund has been processed successfully',
          color: theme.colors.secondary,
          animated: false,
        };
      
      default:
        return {
          icon: 'help-outline',
          title: 'Unknown Status',
          subtitle: 'Please try again',
          color: theme.colors.onSurfaceVariant,
          animated: false,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Animation effects
  useEffect(() => {
    if (statusConfig.animated || isLoading) {
      // Continuous rotation animation for processing states
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Pulse animation for emphasis
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      rotateAnimation.start();
      pulseAnimation.start();

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
      };
    } else {
      // Stop animations for non-processing states
      rotateAnim.stopAnimation();
      scaleAnim.stopAnimation();
      
      // Reset animations
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Return empty cleanup function for consistency
      return () => {};
    }
  }, [statusConfig.animated, isLoading, rotateAnim, scaleAnim]);

  // Success/Error animation
  useEffect(() => {
    if (status === PaymentProcessingStatus.COMPLETED) {
      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (status === PaymentProcessingStatus.FAILED) {
      // Error shake animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status, scaleAnim]);

  // Calculate rotation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Render progress dots for processing states
  const renderProgressDots = () => {
    if (!statusConfig.animated && !isLoading) return null;

    return (
      <View style={styles.progressDots}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: statusConfig.color,
                opacity: fadeAnim,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statusContainer}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${statusConfig.color}15`,
              transform: [
                { rotate: statusConfig.animated ? rotate : '0deg' },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <MaterialIcons 
            name={statusConfig.icon} 
            size={40} 
            color={statusConfig.color} 
          />
        </Animated.View>

        {/* Status Text */}
        <View style={styles.textContainer}>
          <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
            {statusConfig.title}
          </Text>
          <Text style={[styles.statusSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {statusConfig.subtitle}
          </Text>
        </View>

        {/* Progress Dots */}
        {renderProgressDots()}
      </View>

      {/* Progress Bar for Processing States */}
      {(statusConfig.animated || isLoading) && (
        <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: statusConfig.color,
                opacity: fadeAnim,
              },
            ]}
          />
        </View>
      )}

      {/* Additional Status Information */}
      {status === PaymentProcessingStatus.PROCESSING && (
        <View style={styles.additionalInfo}>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
            💳 Do not remove your card or close this screen
          </Text>
        </View>
      )}

      {status === PaymentProcessingStatus.CONNECTING && (
        <View style={styles.additionalInfo}>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
            🔵 Ensure your payment device is powered on and nearby
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.titleLarge,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    ...typography.bodyMedium,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  progressDots: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.xs / 2,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '60%',
    borderRadius: 2,
  },
  additionalInfo: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});