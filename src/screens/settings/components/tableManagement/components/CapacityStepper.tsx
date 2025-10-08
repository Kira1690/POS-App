/**
 * Capacity Stepper Component
 * Reusable stepper for table capacity selection
 * Phase 2 - Complete Modal System
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';

interface CapacityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  error?: string;
}

export const CapacityStepper: React.FC<CapacityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 20,
  step = 1,
  label,
  error,
}) => {
  const { theme } = useTheme();

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const handleTextChange = (text: string) => {
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    } else if (text === '') {
      onChange(min);
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    label: {
      ...typography.bodyMedium,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: spacing.xs,
    },
    stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.lg as number,
      borderWidth: error ? 2 : 1,
      borderColor: error ? theme.colors.error : theme.colors.outline,
      padding: spacing.sm,
      height: 56,
    },
    button: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md as number,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.outline,
      opacity: 0.5,
    },
    valueContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: spacing.md,
    },
    valueInput: {
      ...typography.headlineMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
      textAlign: 'center',
      minWidth: 60,
      padding: 0,
    },
    errorText: {
      ...typography.bodySmall,
      color: theme.colors.error,
      marginTop: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepperContainer}>
        {/* Decrement Button */}
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
          accessibilityLabel="Decrease capacity"
          accessibilityRole="button"
        >
          <Icon
            name="minus"
            size={24}
            color={value <= min ? theme.colors.onSurfaceVariant : theme.colors.onSurface}
            accessibilityLabel="Minus icon"
          />
        </TouchableOpacity>

        {/* Value Display/Input */}
        <View style={styles.valueContainer}>
          <TextInput
            style={styles.valueInput}
            value={value.toString()}
            onChangeText={handleTextChange}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel={`Capacity: ${value} seats`}
          />
        </View>

        {/* Increment Button */}
        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
          accessibilityLabel="Increase capacity"
          accessibilityRole="button"
        >
          <Icon
            name="plus"
            size={24}
            color={value >= max ? theme.colors.onSurfaceVariant : theme.colors.onSurface}
            accessibilityLabel="Plus icon"
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
