import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthInput, type AuthInputProps } from '../../auth/AuthInput';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordInputProps extends Omit<AuthInputProps, 'variant' | 'secureTextEntry'> {
  /** Show password strength indicator */
  showStrength?: boolean;
  /** Minimum password length */
  minLength?: number;
  /** Require special characters */
  requireSpecialChars?: boolean;
  /** Require uppercase letters */
  requireUppercase?: boolean;
  /** Require lowercase letters */
  requireLowercase?: boolean;
  /** Require numbers */
  requireNumbers?: boolean;
  /** Show password requirements list */
  showRequirements?: boolean;
  /** Callback when password strength changes */
  onStrengthChange?: (strength: PasswordStrength) => void;
  /** Custom strength messages */
  strengthMessages?: {
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showStrength = true,
  minLength = 8,
  requireSpecialChars = true,
  requireUppercase = true,
  requireLowercase = true,
  requireNumbers = true,
  showRequirements = true,
  onStrengthChange,
  strengthMessages = {
    weak: 'Weak password',
    fair: 'Fair password',
    good: 'Good password',
    strong: 'Strong password',
  },
  value,
  onChangeText,
  ...props
}) => {
  const { theme } = useTheme();
  
  // Calculate password strength and requirements
  const passwordAnalysis = useMemo(() => {
    if (!value) {
      return {
        strength: 'weak' as PasswordStrength,
        score: 0,
        requirements: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumbers: false,
          hasSpecialChars: false,
        },
      };
    }

    const requirements = {
      minLength: value.length >= minLength,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumbers: /\d/.test(value),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };

    // Calculate score based on requirements
    let score = 0;
    if (requirements.minLength) score += 1;
    if (requirements.hasUppercase && requireUppercase) score += 1;
    if (requirements.hasLowercase && requireLowercase) score += 1;
    if (requirements.hasNumbers && requireNumbers) score += 1;
    if (requirements.hasSpecialChars && requireSpecialChars) score += 1;

    // Bonus points for extra length
    if (value.length >= minLength + 4) score += 0.5;
    if (value.length >= minLength + 8) score += 0.5;

    // Determine strength
    let strength: PasswordStrength;
    if (score <= 1) strength = 'weak';
    else if (score <= 2.5) strength = 'fair';
    else if (score <= 4) strength = 'good';
    else strength = 'strong';

    return { strength, score, requirements };
  }, [value, minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars]);

  // Notify parent of strength changes
  React.useEffect(() => {
    onStrengthChange?.(passwordAnalysis.strength);
  }, [passwordAnalysis.strength, onStrengthChange]);

  // Get strength indicator styles
  const getStrengthIndicatorStyles = (): ViewStyle => ({
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  });

  // Get strength bar styles
  const getStrengthBarStyles = (index: number): ViewStyle => {
    const isActive = index < passwordAnalysis.score;
    const colors = {
      weak: theme.colors.error,
      fair: theme.colors.warning,
      good: theme.colors.primary,
      strong: theme.colors.success,
    };

    return {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: isActive 
        ? colors[passwordAnalysis.strength] 
        : theme.colors.surfaceVariant,
    };
  };

  // Get strength text styles
  const getStrengthTextStyles = (): TextStyle => {
    const colors = {
      weak: theme.colors.error,
      fair: theme.colors.warning,
      good: theme.colors.primary,
      strong: theme.colors.success,
    };

    return {
      ...typography.authHelper,
      color: colors[passwordAnalysis.strength],
      marginTop: spacing.xs,
      fontWeight: '500',
    };
  };

  // Get requirements list styles
  const getRequirementsContainerStyles = (): ViewStyle => ({
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: borderRadius.input,
  });

  // Get requirement item styles
  const getRequirementItemStyles = (met: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  });

  // Get requirement text styles
  const getRequirementTextStyles = (met: boolean): TextStyle => ({
    ...typography.authHelper,
    color: met ? theme.colors.success : theme.colors.onSurfaceVariant,
    marginLeft: spacing.sm,
    flex: 1,
  });

  // Get requirement icon color
  const getRequirementIconColor = (met: boolean): string => {
    return met ? theme.colors.success : theme.colors.onSurfaceVariant;
  };

  // Handle text change
  const handleChangeText = (text: string) => {
    onChangeText(text);
  };

  // Build requirements list
  const requirements = [
    {
      key: 'minLength',
      met: passwordAnalysis.requirements.minLength,
      text: `At least ${minLength} characters`,
      show: true,
    },
    {
      key: 'uppercase',
      met: passwordAnalysis.requirements.hasUppercase,
      text: 'One uppercase letter',
      show: requireUppercase,
    },
    {
      key: 'lowercase',
      met: passwordAnalysis.requirements.hasLowercase,
      text: 'One lowercase letter',
      show: requireLowercase,
    },
    {
      key: 'numbers',
      met: passwordAnalysis.requirements.hasNumbers,
      text: 'One number',
      show: requireNumbers,
    },
    {
      key: 'special',
      met: passwordAnalysis.requirements.hasSpecialChars,
      text: 'One special character',
      show: requireSpecialChars,
    },
  ].filter(req => req.show);

  return (
    <View>
      {/* Password Input */}
      <AuthInput
        {...props}
        variant="password"
        value={value}
        onChangeText={handleChangeText}
        secureTextEntry={true}
      />

      {/* Password Strength Indicator */}
      {showStrength && value && (
        <View>
          {/* Strength Bars */}
          <View style={getStrengthIndicatorStyles()}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={index}
                style={getStrengthBarStyles(index)}
              />
            ))}
          </View>
          
          {/* Strength Text */}
          <Text style={getStrengthTextStyles()}>
            {strengthMessages[passwordAnalysis.strength]}
          </Text>
        </View>
      )}

      {/* Password Requirements */}
      {showRequirements && value && (
        <View style={getRequirementsContainerStyles()}>
          <Text 
            style={{
              ...typography.authLabel,
              color: theme.colors.onSurfaceVariant,
              marginBottom: spacing.xs,
            }}
          >
            Password Requirements:
          </Text>
          
          {requirements.map((requirement) => (
            <View
              key={requirement.key}
              style={getRequirementItemStyles(requirement.met)}
            >
              <MaterialIcons
                name={requirement.met ? 'check-circle' : 'radio-button-unchecked'}
                size={16}
                color={getRequirementIconColor(requirement.met)}
              />
              <Text style={getRequirementTextStyles(requirement.met)}>
                {requirement.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Hook for password validation
export const usePasswordValidation = (
  minLength: number = 8,
  requireSpecialChars: boolean = true,
  requireUppercase: boolean = true,
  requireLowercase: boolean = true,
  requireNumbers: boolean = true
) => {
  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    
    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    if (requireNumbers && !/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    
    return null;
  };

  return { validatePassword };
};

export default PasswordInput;