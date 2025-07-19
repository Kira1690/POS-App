import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export interface FormFieldProps {
  /** Field label */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the field */
  helpText?: string;
  /** Children components (typically form inputs) */
  children: React.ReactNode;
  /** Custom container styles */
  style?: ViewStyle;
  /** Custom label styles */
  labelStyle?: TextStyle;
  /** Show info icon next to label */
  showInfoIcon?: boolean;
  /** Info icon press handler */
  onInfoPress?: () => void;
  /** Field is disabled */
  disabled?: boolean;
  /** Accessibility label for the field */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  children,
  style,
  labelStyle,
  showInfoIcon = false,
  onInfoPress,
  disabled = false,
  accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();

  // Get container styles
  const getContainerStyles = (): ViewStyle => ({
    width: '100%',
    marginVertical: spacing.sm,
  });

  // Get label container styles
  const getLabelContainerStyles = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  });

  // Get label text styles
  const getLabelStyles = (): TextStyle => ({
    ...typography.authLabel,
    color: disabled 
      ? theme.colors.onSurfaceDisabled 
      : error 
        ? theme.colors.authInputError 
        : theme.colors.onSurface,
    flex: 1,
  });

  // Get required indicator styles
  const getRequiredStyles = (): TextStyle => ({
    ...typography.authLabel,
    color: theme.colors.authInputError,
    marginLeft: spacing.xs,
  });

  // Get info icon styles
  const getInfoIconStyles = (): ViewStyle => ({
    marginLeft: spacing.xs,
    padding: spacing.xs,
  });

  // Get field container styles
  const getFieldContainerStyles = (): ViewStyle => ({
    width: '100%',
  });

  // Get help text styles
  const getHelpTextStyles = (): TextStyle => ({
    ...typography.authHelper,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
    marginHorizontal: spacing.sm,
  });

  // Get error text styles
  const getErrorTextStyles = (): TextStyle => ({
    ...typography.authHelper,
    color: theme.colors.authInputError,
    marginTop: spacing.xs,
    marginHorizontal: spacing.sm,
  });

  // Get icon color
  const getIconColor = (): string => {
    if (disabled) return theme.colors.onSurfaceDisabled;
    if (error) return theme.colors.authInputError;
    return theme.colors.onSurfaceVariant;
  };

  return (
    <View 
      style={[getContainerStyles(), style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {/* Label Section */}
      <View style={getLabelContainerStyles()}>
        <Text style={[getLabelStyles(), labelStyle]}>
          {label}
        </Text>
        
        {/* Required Indicator */}
        {required && (
          <Text style={getRequiredStyles()}>
            *
          </Text>
        )}
        
        {/* Info Icon */}
        {showInfoIcon && (
          <View style={getInfoIconStyles()}>
            <MaterialIcons
              name="info-outline"
              size={16}
              color={getIconColor()}
              onPress={onInfoPress}
            />
          </View>
        )}
      </View>

      {/* Field Container */}
      <View style={getFieldContainerStyles()}>
        {children}
      </View>

      {/* Error Message */}
      {error && (
        <Text 
          style={getErrorTextStyles()}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}

      {/* Help Text (only show if no error) */}
      {!error && helpText && (
        <Text style={getHelpTextStyles()}>
          {helpText}
        </Text>
      )}
    </View>
  );
};

// Higher-order component for enhanced form field wrapper
export const withFormField = <P extends object>(
  Component: React.ComponentType<P>,
  defaultFieldProps?: Partial<FormFieldProps>
) => {
  const WrappedComponent = React.forwardRef<any, P & FormFieldProps>((props, ref) => {
    const { 
      label, 
      required, 
      error, 
      helpText, 
      style, 
      labelStyle, 
      showInfoIcon, 
      onInfoPress, 
      disabled, 
      accessibilityLabel, 
      testID,
      ...componentProps 
    } = props;

    const fieldProps: FormFieldProps = {
      label,
      required,
      error,
      helpText,
      style,
      labelStyle,
      showInfoIcon,
      onInfoPress,
      disabled,
      accessibilityLabel,
      testID,
      ...defaultFieldProps,
      children: <Component {...(componentProps as P)} ref={ref} />,
    };

    return <FormField {...fieldProps} />;
  });

  WrappedComponent.displayName = `withFormField(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Form field validation helpers
export const FormFieldValidation = {
  // Required field validation
  required: (value: any, message?: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message || 'This field is required';
    }
    return null;
  },

  // Email validation
  email: (value: string, message?: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message || 'Please enter a valid email address';
    }
    return null;
  },

  // Minimum length validation
  minLength: (value: string, minLength: number, message?: string) => {
    if (value && value.length < minLength) {
      return message || `Must be at least ${minLength} characters`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value: string, maxLength: number, message?: string) => {
    if (value && value.length > maxLength) {
      return message || `Must be no more than ${maxLength} characters`;
    }
    return null;
  },

  // Phone number validation
  phone: (value: string, message?: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
      return message || 'Please enter a valid phone number';
    }
    return null;
  },

  // Password strength validation
  passwordStrength: (value: string, message?: string) => {
    if (value) {
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLongEnough = value.length >= 8;
      
      if (!isLongEnough || !hasLower || !hasUpper || !hasNumber || !hasSpecial) {
        return message || 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
      }
    }
    return null;
  },

  // Combine multiple validations
  combine: (...validators: Array<(value: any) => string | null>) => {
    return (value: any) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    };
  },
};

export default FormField;