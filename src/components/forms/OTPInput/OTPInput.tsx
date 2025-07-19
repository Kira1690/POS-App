import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius, touchTargets } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export interface OTPInputProps {
  /** Number of OTP digits */
  length: number;
  /** Current OTP value */
  value: string;
  /** Value change handler */
  onChangeText: (text: string) => void;
  /** Auto focus first input on mount */
  autoFocus?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Show/hide input values */
  secureTextEntry?: boolean;
  /** Keyboard type */
  keyboardType?: 'numeric' | 'number-pad';
  /** Auto submit when complete */
  autoSubmit?: boolean;
  /** Submit handler (called when OTP is complete) */
  onSubmit?: (otp: string) => void;
  /** Custom placeholder character */
  placeholder?: string;
  /** Input size variant */
  size?: 'small' | 'medium' | 'large';
  /** Spacing between inputs */
  spacing?: 'tight' | 'normal' | 'loose';
  /** Show resend timer */
  showResendTimer?: boolean;
  /** Resend timeout in seconds */
  resendTimeout?: number;
  /** Resend handler */
  onResend?: () => void;
  /** Timer completion handler */
  onTimerComplete?: () => void;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChangeText,
  autoFocus = true,
  disabled = false,
  error,
  secureTextEntry = false,
  keyboardType = 'number-pad',
  autoSubmit = true,
  onSubmit,
  placeholder = '',
  size = 'medium',
  spacing: spacingVariant = 'normal',
  showResendTimer = false,
  resendTimeout = 60,
  onResend,
  onTimerComplete,
  accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const [timer, setTimer] = useState(resendTimeout);
  const [isResendAvailable, setIsResendAvailable] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = Array(length).fill(null);
  }, [length]);

  // Timer countdown
  useEffect(() => {
    if (showResendTimer && timer > 0 && !isResendAvailable) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsResendAvailable(true);
            onTimerComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, isResendAvailable, showResendTimer, onTimerComplete]);

  // Auto submit when OTP is complete
  useEffect(() => {
    if (autoSubmit && value.length === length && onSubmit) {
      onSubmit(value);
    }
  }, [value, length, autoSubmit, onSubmit]);

  // Shake animation for errors
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, shakeAnimation]);

  // Handle text change for individual input
  const handleChangeText = (text: string, index: number) => {
    if (disabled) return;

    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Handle multiple character paste
    if (numericText.length > 1) {
      const newValue = numericText.slice(0, length);
      onChangeText(newValue);
      
      // Focus last filled input or next empty input
      const nextIndex = Math.min(newValue.length, length - 1);
      focusInput(nextIndex);
      return;
    }

    // Handle single character input
    const currentValue = value.split('');
    currentValue[index] = numericText;
    
    // Remove empty slots at the end
    while (currentValue.length > 0 && currentValue[currentValue.length - 1] === '') {
      currentValue.pop();
    }
    
    const newValue = currentValue.join('');
    onChangeText(newValue);

    // Auto focus next input
    if (numericText && index < length - 1) {
      focusInput(index + 1);
    }
  };

  // Handle key press (for backspace)
  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace') {
      const currentValue = value.split('');
      
      // If current cell is empty, move to previous and clear it
      if (!currentValue[index] && index > 0) {
        currentValue[index - 1] = '';
        onChangeText(currentValue.join(''));
        focusInput(index - 1);
      } else {
        // Clear current cell
        currentValue[index] = '';
        onChangeText(currentValue.join(''));
      }
    }
  };

  // Focus specific input
  const focusInput = (index: number) => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
      setFocusedIndex(index);
    }
  };

  // Handle input focus
  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  // Handle input blur
  const handleBlur = () => {
    setFocusedIndex(null);
  };

  // Handle resend
  const handleResend = () => {
    if (isResendAvailable && onResend) {
      onResend();
      setTimer(resendTimeout);
      setIsResendAvailable(false);
    }
  };

  // Get input size dimensions
  const getInputSize = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 40,
          fontSize: 16,
        };
      case 'medium':
        return {
          width: 48,
          height: 48,
          fontSize: 18,
        };
      case 'large':
        return {
          width: 56,
          height: 56,
          fontSize: 20,
        };
      default:
        return {
          width: 48,
          height: 48,
          fontSize: 18,
        };
    }
  };

  // Get spacing between inputs
  const getInputSpacing = () => {
    switch (spacingVariant) {
      case 'tight':
        return spacing.xs;
      case 'normal':
        return spacing.sm;
      case 'loose':
        return spacing.md;
      default:
        return spacing.sm;
    }
  };

  // Get container styles
  const getContainerStyles = (): ViewStyle => ({
    alignItems: 'center',
  });

  // Get inputs container styles
  const getInputsContainerStyles = (): ViewStyle => ({
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: getInputSpacing(),
  });

  // Get individual input styles
  const getInputStyles = (index: number): ViewStyle => {
    const inputSize = getInputSize();
    const isFocused = focusedIndex === index;
    const hasValue = value[index] !== undefined && value[index] !== '';
    const hasError = !!error;

    return {
      width: inputSize.width,
      height: inputSize.height,
      borderWidth: 2,
      borderRadius: borderRadius.input,
      borderColor: hasError
        ? theme.colors.authInputError
        : isFocused
        ? theme.colors.authInputFocused
        : hasValue
        ? theme.colors.success
        : theme.colors.authInputBorder,
      backgroundColor: disabled
        ? theme.colors.surfaceDisabled
        : theme.colors.authInputBackground,
      textAlign: 'center' as const,
      fontSize: inputSize.fontSize,
      fontFamily: typography.authInput.fontFamily,
      color: disabled
        ? theme.colors.onSurfaceDisabled
        : theme.colors.onSurface,
      includeFontPadding: false,
      textAlignVertical: 'center',
    };
  };

  // Get timer text styles
  const getTimerTextStyles = (): TextStyle => ({
    ...typography.authHelper,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
  });

  // Get resend button styles
  const getResendButtonStyles = (): ViewStyle => ({
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: isResendAvailable
      ? theme.colors.authPrimary
      : theme.colors.surfaceDisabled,
    borderRadius: borderRadius.button,
    alignSelf: 'center',
  });

  // Get resend button text styles
  const getResendButtonTextStyles = (): TextStyle => ({
    ...typography.authButton,
    color: isResendAvailable
      ? theme.colors.onPrimary
      : theme.colors.onSurfaceDisabled,
    textAlign: 'center',
  });

  // Get error text styles
  const getErrorTextStyles = (): TextStyle => ({
    ...typography.authHelper,
    color: theme.colors.authInputError,
    textAlign: 'center',
    marginTop: spacing.sm,
  });

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View
      style={getContainerStyles()}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `Enter ${length} digit code`}
    >
      {/* OTP Input Fields */}
      <Animated.View
        style={[
          getInputsContainerStyles(),
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        {Array.from({ length }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={getInputStyles(index)}
            value={value[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            keyboardType={keyboardType}
            maxLength={1}
            selectTextOnFocus
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            accessibilityLabel={`Digit ${index + 1} of ${length}`}
            testID={`${testID}-input-${index}`}
          />
        ))}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Text style={getErrorTextStyles()}>
          {error}
        </Text>
      )}

      {/* Resend Timer and Button */}
      {showResendTimer && (
        <View style={{ alignItems: 'center' }}>
          {!isResendAvailable ? (
            <Text style={getTimerTextStyles()}>
              Resend code in {formatTimer(timer)}
            </Text>
          ) : (
            <TouchableOpacity
              style={getResendButtonStyles()}
              onPress={handleResend}
              disabled={!isResendAvailable}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
            >
              <Text style={getResendButtonTextStyles()}>
                Resend Code
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// Hook for OTP management
export const useOTPInput = (
  length: number = 6,
  autoSubmit: boolean = true
) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Update completion status
  useEffect(() => {
    setIsComplete(otp.length === length);
    if (otp.length === length) {
      setError(null);
    }
  }, [otp, length]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError(null);
  };

  const validateOTP = (): boolean => {
    if (otp.length !== length) {
      setError(`Please enter all ${length} digits`);
      return false;
    }
    return true;
  };

  const resetOTP = () => {
    setOtp('');
    setError(null);
    setIsComplete(false);
  };

  const setOTPError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return {
    otp,
    error,
    isComplete,
    handleOTPChange,
    validateOTP,
    resetOTP,
    setOTPError,
  };
};

export default OTPInput;