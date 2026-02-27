import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');

interface TRXNumberPadProps {
  onNumberPress: (number: string) => void;
  onDecimal: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export const TRXNumberPad: React.FC<TRXNumberPadProps> = ({
  onNumberPress,
  onDecimal,
  onDelete,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    dialerContainer: {
      marginBottom: theme.spacing.xl,
    },
    dialerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    dialerButton: {
      width: (width - 60) / 3,
      height: 70,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceLight,
      ...theme.shadows.sm,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialerButtonText: {
      ...theme.typography.title2,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    decimalButton: {
      backgroundColor: theme.colors.tertiary,
    },
    deleteButton: {
      backgroundColor: theme.colors.warning,
    },
  });

  const renderButton = (value: string, onPress: () => void, extraStyle?: object) => (
    <TouchableOpacity
      style={[styles.dialerButton, extraStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContainer}>
        {value === 'delete' ? (
          <MaterialIcons name="backspace" size={24} color={theme.colors.onSurface} />
        ) : (
          <Text style={styles.dialerButtonText}>{value}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.dialerContainer}>
      <View style={styles.dialerRow}>
        {renderButton('1', () => onNumberPress('1'))}
        {renderButton('2', () => onNumberPress('2'))}
        {renderButton('3', () => onNumberPress('3'))}
      </View>
      <View style={styles.dialerRow}>
        {renderButton('4', () => onNumberPress('4'))}
        {renderButton('5', () => onNumberPress('5'))}
        {renderButton('6', () => onNumberPress('6'))}
      </View>
      <View style={styles.dialerRow}>
        {renderButton('7', () => onNumberPress('7'))}
        {renderButton('8', () => onNumberPress('8'))}
        {renderButton('9', () => onNumberPress('9'))}
      </View>
      <View style={styles.dialerRow}>
        {renderButton('.', onDecimal, styles.decimalButton)}
        {renderButton('0', () => onNumberPress('0'))}
        {renderButton('delete', onDelete, styles.deleteButton)}
      </View>
    </View>
  );
};
