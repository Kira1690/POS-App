import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius, touchTargets } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export type AuthInputVariant = 'text' | 'email' | 'password' | 'phone' | 'search';

export interface AuthInputProps {
  /** Input variant for different use cases */
  variant?: AuthInputVariant;
  /** Label text (optional - can use just placeholder) */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Value change handler */
  onChangeText: (text: string) => void;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Secure text entry (password) */
  secureTextEntry?: boolean;
  /** Keyboard type */
  keyboardType?: KeyboardTypeOptions;
  /** Return key type */
  returnKeyType?: ReturnKeyTypeOptions;
  /** Submit handler */
  onSubmitEditing?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Custom left icon */
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  /** Custom right icon */
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  /** Right icon press handler */
  onRightIconPress?: () => void;
  /** Custom styles */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
  /** Auto capitalize setting */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Auto complete type */
  autoComplete?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  variant = 'text',
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  disabled = false,
  required = false,
  autoFocus = false,
  secureTextEntry = false,
  keyboardType,
  returnKeyType = 'done',
  onSubmitEditing,
  onFocus,
  onBlur,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  accessibilityLabel,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnimation = useRef(new Animated.Value(0)).current;

  // Handle focus state
  const handleFocus = () => {
    setIsFocused(true);
    
    // Animate label up
    Animated.timing(labelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Animate border color
    Animated.timing(borderAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    onFocus?.();
  };

  // Handle blur state
  const handleBlur = () => {
    setIsFocused(false);
    
    // Animate label down if no value
    if (!value) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    // Animate border color back
    Animated.timing(borderAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    onBlur?.();
  };

  // Handle text change
  const handleChangeText = (text: string) => {
    onChangeText(text);
    
    // Animate label if text changes
    if (text) {
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else if (!text && !isFocused) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Get keyboard type based on variant
  const getKeyboardType = (): KeyboardTypeOptions => {
    if (keyboardType) return keyboardType;
    
    switch (variant) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'search':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get auto-complete type
  const getAutoCompleteType = () => {
    switch (variant) {
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      case 'phone':
        return 'tel';
      default:
        return 'off';
    }
  };

  // Get container styles
  const getContainerStyles = (): ViewStyle => ({
    width: '100%',
    marginVertical: spacing.sm,
  });

  // Get input container styles
  const getInputContainerStyles = (): ViewStyle => {
    const borderColor = borderAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? theme.colors.authInputError : theme.colors.authInputBorder,
        error ? theme.colors.authInputError : theme.colors.authInputFocused,
      ],
    });

    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.authInputBackground,
      borderWidth: 2,
      borderColor: error ? theme.colors.authInputError : theme.colors.authInputBorder,
      borderRadius: borderRadius.input,
      paddingHorizontal: spacing.lg,
      minHeight: touchTargets.formInput,
      position: 'relative',
    };
  };

  // Get animated input container styles
  const getAnimatedInputContainerStyles = () => {
    const borderColor = borderAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? theme.colors.authInputError : theme.colors.authInputBorder,
        error ? theme.colors.authInputError : theme.colors.authInputFocused,
      ],
    });

    return {
      borderColor,
    };
  };

  // Get input styles
  const getInputStyles = (): TextStyle => ({
    ...typography.authInput,
    flex: 1,
    color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface,
    paddingVertical: spacing.md,
    paddingLeft: leftIcon ? spacing.sm : 0,
    paddingRight: (rightIcon || variant === 'password') ? spacing.sm : 0,
  });

  // Get label styles
  const getLabelStyles = () => {
    const translateY = labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -32],
    });

    const scale = labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.85],
    });

    const color = labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        theme.colors.onSurfaceVariant,
        error ? theme.colors.authInputError : isFocused ? theme.colors.authInputFocused : theme.colors.onSurfaceVariant,
      ],
    });

    return {
      position: 'absolute' as const,
      left: spacing.lg,
      top: spacing.lg,
      ...typography.authLabel,
      color,
      backgroundColor: theme.colors.authInputBackground,
      paddingHorizontal: spacing.xs,
      transform: [{ translateY }, { scale }],
      zIndex: 1,
    };
  };

  // Get icon color
  const getIconColor = (): string => {
    if (disabled) return theme.colors.onSurfaceDisabled;
    if (error) return theme.colors.authInputError;
    if (isFocused) return theme.colors.authInputFocused;
    return theme.colors.onSurfaceVariant;
  };

  // Get error/helper text styles
  const getHelperTextStyles = (): TextStyle => ({
    ...typography.authHelper,
    color: error ? theme.colors.authInputError : theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
    marginHorizontal: spacing.sm,
  });

  return (
    <View style={[getContainerStyles(), style]}>
      {/* Input Container */}
      <Animated.View 
        style={[
          getInputContainerStyles(), 
          getAnimatedInputContainerStyles()
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={{ marginRight: spacing.sm }}
          />
        )}

        {/* Animated Label */}
        <Animated.Text style={getLabelStyles()}>
          {label}{required && ' *'}
        </Animated.Text>

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={getInputStyles()}
          editable={!disabled}
          autoFocus={autoFocus}
          secureTextEntry={variant === 'password' ? !isPasswordVisible : secureTextEntry}
          keyboardType={getKeyboardType()}
          returnKeyType={returnKeyType}
          autoComplete={getAutoCompleteType()}
          accessibilityLabel={accessibilityLabel || label}
          testID={testID}
        />

        {/* Right Icon or Password Toggle */}
        {variant === 'password' ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{ padding: spacing.xs }}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ padding: spacing.xs }}
            disabled={!onRightIconPress}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={rightIcon}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <Text style={getHelperTextStyles()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default AuthInput;