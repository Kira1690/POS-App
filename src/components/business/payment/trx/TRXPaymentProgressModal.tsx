import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentState } from '@/services/trx/interfaces/IPaymentProcessor';
import { useTheme } from '@/hooks/useTheme';

interface TRXPaymentProgressModalProps {
  visible: boolean;
  currentState: PaymentState;
  amount: string;
  startTime?: Date;
  approvalCode?: string;
  cardBrand?: string;
  lastFour?: string;
  errorMessage?: string;
  onDismiss?: () => void;
  onCancel?: () => void;
}

interface StateConfig {
  icon: keyof typeof Ionicons.glyphMap;
  colorKey: 'info' | 'success' | 'error' | 'warning';
  text: string;
  animate: 'rotate' | 'pulse' | 'scale' | 'shake' | 'none';
}

const STATE_CONFIG: Record<PaymentState, StateConfig> = {
  [PaymentState.IDLE]: {
    icon: 'hourglass-outline',
    colorKey: 'info',
    text: 'Preparing...',
    animate: 'none',
  },
  [PaymentState.BUILDING_MESSAGE]: {
    icon: 'hammer-outline',
    colorKey: 'info',
    text: 'Building transaction...',
    animate: 'rotate',
  },
  [PaymentState.CONNECTING]: {
    icon: 'wifi-outline',
    colorKey: 'info',
    text: 'Connecting to terminal...',
    animate: 'pulse',
  },
  [PaymentState.SENDING]: {
    icon: 'arrow-up-circle-outline',
    colorKey: 'info',
    text: 'Sending payment...',
    animate: 'rotate',
  },
  [PaymentState.PROCESSING]: {
    icon: 'hourglass-outline',
    colorKey: 'info',
    text: 'Processing payment...',
    animate: 'rotate',
  },
  [PaymentState.SUCCESS]: {
    icon: 'checkmark-circle',
    colorKey: 'success',
    text: 'Approved!',
    animate: 'scale',
  },
  [PaymentState.FAILED]: {
    icon: 'close-circle',
    colorKey: 'error',
    text: 'Transaction Failed',
    animate: 'shake',
  },
  [PaymentState.CANCELLED]: {
    icon: 'close-circle-outline',
    colorKey: 'warning',
    text: 'Cancelled',
    animate: 'none',
  },
};

export const TRXPaymentProgressModal: React.FC<TRXPaymentProgressModalProps> = ({
  visible,
  currentState,
  amount,
  startTime,
  approvalCode,
  cardBrand,
  lastFour,
  errorMessage,
  onDismiss,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasDismissed, setHasDismissed] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(0))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  const config = STATE_CONFIG[currentState];
  const stateColor = theme.colors[config.colorKey];

  useEffect(() => {
    if (visible && currentState === PaymentState.PROCESSING) {
      setHasDismissed(false);
    }
  }, [visible, currentState]);

  useEffect(() => {
    if (!visible || !onDismiss || hasDismissed) return;

    let dismissTimer: ReturnType<typeof setTimeout> | undefined;

    if (currentState === PaymentState.SUCCESS) {
      dismissTimer = setTimeout(() => {
        setHasDismissed(true);
        onDismiss();
      }, 3000);
    } else if (currentState === PaymentState.FAILED) {
      dismissTimer = setTimeout(() => {
        setHasDismissed(true);
        onDismiss();
      }, 5000);
    }

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [visible, currentState, onDismiss, hasDismissed]);

  useEffect(() => {
    if (!startTime || !visible) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, visible]);

  useEffect(() => {
    if (config.animate === 'rotate') {
      rotateAnim.setValue(0);
      const animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
    return undefined;
  }, [config.animate, rotateAnim]);

  useEffect(() => {
    if (config.animate === 'pulse') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
    return undefined;
  }, [config.animate, pulseAnim]);

  useEffect(() => {
    if (config.animate === 'scale') {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [config.animate, scaleAnim]);

  useEffect(() => {
    if (config.animate === 'shake') {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [config.animate, shakeAnim]);

  const getAnimatedTransform = useMemo(() => {
    switch (config.animate) {
      case 'rotate':
        return [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }];
      case 'pulse':
        return [{ scale: pulseAnim }];
      case 'scale':
        return [{ scale: scaleAnim }];
      case 'shake':
        return [{ translateX: shakeAnim }];
      default:
        return [];
    }
  }, [config.animate, rotateAnim, pulseAnim, scaleAnim, shakeAnim]);

  const canDismiss = [PaymentState.SUCCESS, PaymentState.FAILED, PaymentState.CANCELLED].includes(currentState);

  const handleDismiss = () => {
    if (canDismiss && onDismiss && !hasDismissed) {
      setHasDismissed(true);
      onDismiss();
    }
  };

  // Always allow back/cancel escape — hardware back or Cancel button during processing
  const handleCancel = () => {
    if (canDismiss) {
      handleDismiss();
    } else if (onCancel) {
      onCancel();
    }
  };

  const { width } = Dimensions.get('window');

  const styles = StyleSheet.create({
    blurContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    card: {
      width: width * 0.85,
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xxl,
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.md,
      ...theme.shadows.lg,
    },
    iconContainer: {
      marginBottom: theme.spacing.sm,
    },
    primaryText: {
      ...theme.typography.title3,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 24,
    },
    amountText: {
      ...theme.typography.largeTitle,
      fontWeight: '700',
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginVertical: theme.spacing.xs,
    },
    secondaryInfo: {
      marginTop: theme.spacing.xs,
      gap: theme.spacing.xs,
      alignItems: 'center',
    },
    secondaryText: {
      ...theme.typography.subhead,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
    },
    timerText: {
      ...theme.typography.subhead,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    hintText: {
      ...theme.typography.footnote,
      color: theme.colors.textLight,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    cancelButton: {
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
    },
    cancelButtonText: {
      ...theme.typography.subhead,
      fontWeight: '600',
    },
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          <View style={styles.card}>
            <Animated.View style={[styles.iconContainer, { transform: getAnimatedTransform }]}>
              <Ionicons name={config.icon} size={64} color={stateColor} />
            </Animated.View>

            <Text
              style={[
                styles.primaryText,
                { color: currentState === PaymentState.SUCCESS ? stateColor : theme.colors.onSurface },
              ]}
            >
              {config.text}
            </Text>

            <Text style={styles.amountText}>{amount}</Text>

            {currentState === PaymentState.SUCCESS && (
              <View style={styles.secondaryInfo}>
                {approvalCode && (
                  <Text style={styles.secondaryText}>Approval: {approvalCode}</Text>
                )}
                {cardBrand && lastFour && (
                  <Text style={styles.secondaryText}>{cardBrand} ****{lastFour}</Text>
                )}
                <Text style={styles.hintText}>Auto-closing in 3 seconds...</Text>
              </View>
            )}

            {currentState === PaymentState.FAILED && (
              <View style={styles.secondaryInfo}>
                {errorMessage && (
                  <Text style={[styles.secondaryText, { color: stateColor }]}>{errorMessage}</Text>
                )}
                <Text style={styles.hintText}>Auto-closing in 5 seconds...</Text>
              </View>
            )}

            {startTime &&
              [PaymentState.BUILDING_MESSAGE, PaymentState.CONNECTING, PaymentState.SENDING, PaymentState.PROCESSING].includes(currentState) && (
                <Text style={styles.timerText}>{elapsedSeconds}s</Text>
              )}

            {/* Cancel escape — always available during processing states */}
            {!canDismiss && onCancel && (
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
                onPress={handleCancel}
                testID="btn-trx-progress-cancel"
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.onSurfaceVariant }]}>
                  Cancel Payment
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
