/**
 * QuantityModal - Adjust item quantity with quick actions
 *
 * Features:
 * - Numeric keypad for quantity input
 * - Quick increment/decrement buttons
 * - Preset quantity options
 * - Remove item option when quantity is 0
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface QuantityModalProps {
  visible: boolean;
  itemName: string;
  currentQuantity: number;
  maxQuantity?: number;
  minQuantity?: number;
  allowRemove?: boolean;
  onConfirm: (quantity: number) => void;
  onRemove?: () => void;
  onCancel: () => void;
}

const PRESET_QUANTITIES = [1, 2, 3, 5, 10];

export const QuantityModal: React.FC<QuantityModalProps> = ({
  visible,
  itemName,
  currentQuantity,
  maxQuantity = 99,
  minQuantity = 1,
  allowRemove = true,
  onConfirm,
  onRemove,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(currentQuantity);
  const [inputMode, setInputMode] = useState<'buttons' | 'keypad'>('buttons');

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      width: '85%',
      maxWidth: 360,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerContent: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
    },
    itemName: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    content: {
      padding: theme.spacing.md,
    },
    quantityDisplay: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    quantityButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonDisabled: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.5,
    },
    quantityValue: {
      ...theme.typography.h1,
      color: theme.colors.onSurface,
      fontSize: 48,
      fontWeight: '700',
      minWidth: 80,
      textAlign: 'center',
    },
    presetSection: {
      marginTop: theme.spacing.md,
    },
    presetLabel: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    presetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
    },
    presetButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    presetButtonActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    presetButtonText: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    presetButtonTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    keypadToggle: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
    },
    keypadToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    keypadToggleText: {
      ...theme.typography.body2,
      color: theme.colors.primary,
    },
    keypad: {
      marginTop: theme.spacing.md,
    },
    keypadRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    keypadButton: {
      flex: 1,
      aspectRatio: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
    },
    keypadButtonText: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
    },
    keypadClear: {
      backgroundColor: theme.colors.errorContainer || '#FFEBEE',
    },
    keypadClearText: {
      color: theme.colors.error,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    removeButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.errorContainer || '#FFEBEE',
      gap: theme.spacing.xs,
    },
    removeButtonText: {
      ...theme.typography.button,
      color: theme.colors.error,
    },
    cancelButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSurface,
    },
    confirmButton: {
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      gap: theme.spacing.xs,
    },
    confirmButtonDisabled: {
      backgroundColor: theme.colors.outline,
    },
    confirmButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
    },
  });

  useEffect(() => {
    if (visible) {
      setQuantity(currentQuantity);
      setInputMode('buttons');
    }
  }, [visible, currentQuantity]);

  const handleIncrement = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, maxQuantity));
  }, [maxQuantity]);

  const handleDecrement = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, allowRemove ? 0 : minQuantity));
  }, [minQuantity, allowRemove]);

  const handlePresetSelect = useCallback((value: number) => {
    setQuantity(Math.min(value, maxQuantity));
  }, [maxQuantity]);

  const handleKeypadPress = useCallback(
    (key: string) => {
      if (key === 'C') {
        setQuantity(0);
      } else if (key === 'DEL') {
        setQuantity((prev) => Math.floor(prev / 10));
      } else {
        const digit = parseInt(key, 10);
        setQuantity((prev) => {
          const newValue = prev * 10 + digit;
          return Math.min(newValue, maxQuantity);
        });
      }
    },
    [maxQuantity]
  );

  const handleConfirm = useCallback(() => {
    if (quantity === 0 && allowRemove && onRemove) {
      onRemove();
    } else if (quantity >= minQuantity) {
      onConfirm(quantity);
    }
  }, [quantity, allowRemove, minQuantity, onConfirm, onRemove]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  const canConfirm = quantity >= minQuantity || (quantity === 0 && allowRemove);
  const canDecrement = quantity > (allowRemove ? 0 : minQuantity);
  const canIncrement = quantity < maxQuantity;

  const renderButtonMode = () => (
    <>
      <View style={styles.quantityDisplay}>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[styles.quantityButton, !canDecrement && styles.quantityButtonDisabled]}
            onPress={handleDecrement}
            disabled={!canDecrement}
          >
            <MaterialCommunityIcons
              name="minus"
              size={28}
              color={canDecrement ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, !canIncrement && styles.quantityButtonDisabled]}
            onPress={handleIncrement}
            disabled={!canIncrement}
          >
            <MaterialCommunityIcons
              name="plus"
              size={28}
              color={canIncrement ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.presetSection}>
        <Text style={styles.presetLabel}>Quick Select</Text>
        <View style={styles.presetRow}>
          {PRESET_QUANTITIES.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                quantity === preset && styles.presetButtonActive,
              ]}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  quantity === preset && styles.presetButtonTextActive,
                ]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.keypadToggle}>
        <TouchableOpacity
          style={styles.keypadToggleButton}
          onPress={() => setInputMode('keypad')}
        >
          <MaterialCommunityIcons name="dialpad" size={18} color={theme.colors.primary} />
          <Text style={styles.keypadToggleText}>Use Keypad</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderKeypadMode = () => (
    <>
      <View style={styles.quantityDisplay}>
        <Text style={styles.quantityValue}>{quantity}</Text>
      </View>

      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['C', '0', 'DEL'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keypadButton,
                  key === 'C' && styles.keypadClear,
                ]}
                onPress={() => handleKeypadPress(key)}
              >
                {key === 'DEL' ? (
                  <MaterialCommunityIcons
                    name="backspace-outline"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                ) : (
                  <Text
                    style={[
                      styles.keypadButtonText,
                      key === 'C' && styles.keypadClearText,
                    ]}
                  >
                    {key}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.keypadToggle}>
        <TouchableOpacity
          style={styles.keypadToggleButton}
          onPress={() => setInputMode('buttons')}
        >
          <MaterialCommunityIcons name="plus-minus" size={18} color={theme.colors.primary} />
          <Text style={styles.keypadToggleText}>Use Buttons</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Adjust Quantity</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {itemName}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {inputMode === 'buttons' ? renderButtonMode() : renderKeypadMode()}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {allowRemove && onRemove && (
              <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
                <Text style={styles.removeButtonText}>Remove Item</Text>
              </TouchableOpacity>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !canConfirm && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!canConfirm}
              >
                <MaterialCommunityIcons name="check" size={20} color={theme.colors.onPrimary} />
                <Text style={styles.confirmButtonText}>
                  {quantity === 0 ? 'Remove' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default QuantityModal;
