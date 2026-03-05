/**
 * AddModifierOptionModal Component
 * Modal for adding a new option to a modifier group
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  ModifierGroup,
  ModifierOption,
  CreateModifierOptionRequest,
  UpdateModifierOptionRequest,
} from '@/types/menu-management-extended.types';

export interface ModifierOptionFormData {
  name: string;
  description: string;
  price_adjustment: number;
  is_default: boolean;
  is_available: boolean;
  max_quantity?: number;
}

interface AddModifierOptionModalProps {
  visible: boolean;
  group: ModifierGroup | null;
  existingOption?: ModifierOption | null; // For edit mode
  onClose: () => void;
  onSave: (groupId: string, data: CreateModifierOptionRequest) => Promise<void>;
  onUpdate?: (optionId: string, data: UpdateModifierOptionRequest) => Promise<void>;
}

export const AddModifierOptionModal: React.FC<AddModifierOptionModalProps> = ({
  visible,
  group,
  existingOption,
  onClose,
  onSave,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!existingOption;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceAdjustment, setPriceAdjustment] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [maxQuantity, setMaxQuantity] = useState('');

  // Reset or populate form
  useEffect(() => {
    if (visible) {
      if (existingOption) {
        setName(existingOption.name);
        setDescription(existingOption.description || '');
        setPriceAdjustment(existingOption.price_adjustment.toString());
        setIsDefault(existingOption.is_default);
        setIsAvailable(existingOption.is_available);
        setMaxQuantity(existingOption.max_quantity?.toString() || '');
      } else {
        setName('');
        setDescription('');
        setPriceAdjustment('0');
        setIsDefault(false);
        setIsAvailable(true);
        setMaxQuantity('');
      }
      setErrors({});
    }
  }, [visible, existingOption]);

  const handleClose = useCallback(() => {
    setErrors({});
    onClose();
  }, [onClose]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    const price = parseFloat(priceAdjustment);
    if (isNaN(price)) {
      newErrors.priceAdjustment = 'Price must be a valid number';
    }

    if (maxQuantity) {
      const qty = parseInt(maxQuantity, 10);
      if (isNaN(qty) || qty < 1) {
        newErrors.maxQuantity = 'Max quantity must be at least 1';
      }
    }

    // Check for duplicate names in the same group
    if (group && !isEditMode) {
      const nameExists = group.options.some(
        opt => opt.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (nameExists) {
        newErrors.name = 'An option with this name already exists';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, priceAdjustment, maxQuantity, group, isEditMode]);

  const handleSave = useCallback(async () => {
    if (!validateForm() || !group) return;

    setIsSubmitting(true);
    try {
      const formData = {
        name: name.trim(),
        description: description.trim() || undefined,
        price_adjustment: parseFloat(priceAdjustment) || 0,
        is_default: isDefault,
        is_available: isAvailable,
        max_quantity: maxQuantity ? parseInt(maxQuantity, 10) : undefined,
      };

      if (isEditMode && existingOption && onUpdate) {
        await onUpdate(existingOption.id, formData);
      } else {
        await onSave(group.id, {
          ...formData,
          modifier_group_id: group.id,
        });
      }
      handleClose();
    } catch (error) {
      setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'add'} option. Please try again.` });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    group,
    name,
    description,
    priceAdjustment,
    isDefault,
    isAvailable,
    maxQuantity,
    isEditMode,
    existingOption,
    onUpdate,
    onSave,
    handleClose,
  ]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      maxWidth: 440,
      maxHeight: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitleContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      padding: theme.spacing.md,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    textArea: {
      height: 70,
      textAlignVertical: 'top',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pricePrefix: {
      position: 'absolute',
      left: theme.spacing.md,
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      zIndex: 1,
    },
    priceInput: {
      paddingLeft: theme.spacing.xl,
    },
    priceButtons: {
      flexDirection: 'row',
      marginLeft: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    priceButton: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priceButtonActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    switchLabel: {
      flex: 1,
    },
    switchTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    switchDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    previewSection: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    previewTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
      textTransform: 'uppercase',
      marginBottom: theme.spacing.sm,
    },
    previewContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    previewName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    previewPrice: {
      fontSize: 14,
      fontWeight: '600',
    },
    previewPricePositive: {
      color: theme.colors.success,
    },
    previewPriceNegative: {
      color: theme.colors.error,
    },
    previewPriceZero: {
      color: theme.colors.onSurfaceSecondary,
    },
    previewBadges: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    previewBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
    previewBadgeDefault: {
      backgroundColor: theme.colors.primaryLight,
    },
    previewBadgeText: {
      fontSize: 10,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    previewBadgeTextDefault: {
      color: theme.colors.primary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    button: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.onSurfaceSecondary,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    submitError: {
      backgroundColor: theme.colors.errorLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    submitErrorText: {
      fontSize: 14,
      color: theme.colors.error,
      textAlign: 'center',
    },
  });

  if (!group) return null;

  const priceValue = parseFloat(priceAdjustment) || 0;
  const priceText = priceValue > 0
    ? `+$${priceValue.toFixed(2)}`
    : priceValue < 0
      ? `-$${Math.abs(priceValue).toFixed(2)}`
      : 'No extra charge';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Edit Option' : 'Add Option'}
              </Text>
              <Text style={styles.headerSubtitle}>{group.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
            {errors.submit && (
              <View style={styles.submitError}>
                <Text style={styles.submitErrorText}>{errors.submit}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Option Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Large, Extra Cheese, Spicy"
                placeholderTextColor={theme.colors.onSurfaceSecondary}
                maxLength={50}
                accessibilityLabel="Option name"
                testID="input-modifier-option-name"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                placeholderTextColor={theme.colors.onSurfaceSecondary}
                multiline
                maxLength={150}
                accessibilityLabel="Option description"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price Adjustment</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.pricePrefix}>$</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.priceInput,
                    { flex: 1 },
                    errors.priceAdjustment && styles.inputError,
                  ]}
                  value={priceAdjustment}
                  onChangeText={setPriceAdjustment}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.onSurfaceSecondary}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Price adjustment"
                  testID="input-modifier-option-price"
                />
                <View style={styles.priceButtons}>
                  <TouchableOpacity
                    style={[
                      styles.priceButton,
                      priceValue > 0 && styles.priceButtonActive,
                    ]}
                    onPress={() => {
                      const current = Math.abs(parseFloat(priceAdjustment) || 0);
                      setPriceAdjustment(current.toString());
                    }}
                    accessibilityLabel="Set positive price"
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={18}
                      color={priceValue > 0 ? theme.colors.primary : theme.colors.onSurfaceSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priceButton,
                      priceValue < 0 && styles.priceButtonActive,
                    ]}
                    onPress={() => {
                      const current = Math.abs(parseFloat(priceAdjustment) || 0);
                      setPriceAdjustment((-current).toString());
                    }}
                    accessibilityLabel="Set negative price"
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={18}
                      color={priceValue < 0 ? theme.colors.primary : theme.colors.onSurfaceSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {errors.priceAdjustment && (
                <Text style={styles.errorText}>{errors.priceAdjustment}</Text>
              )}
            </View>

            {group.selection_type === 'multiple' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Max Quantity per Order</Text>
                <TextInput
                  style={[styles.input, errors.maxQuantity && styles.inputError]}
                  value={maxQuantity}
                  onChangeText={setMaxQuantity}
                  placeholder="No limit"
                  placeholderTextColor={theme.colors.onSurfaceSecondary}
                  keyboardType="number-pad"
                  accessibilityLabel="Maximum quantity"
                />
                {errors.maxQuantity && (
                  <Text style={styles.errorText}>{errors.maxQuantity}</Text>
                )}
              </View>
            )}

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.switchTitle}>Available</Text>
                <Text style={styles.switchDescription}>
                  Show this option to customers
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{
                  false: theme.colors.outline,
                  true: theme.colors.primaryLight,
                }}
                thumbColor={isAvailable ? theme.colors.primary : theme.colors.surface}
                accessibilityLabel="Available toggle"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.switchTitle}>Default Selection</Text>
                <Text style={styles.switchDescription}>
                  Pre-select this option for customers
                </Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{
                  false: theme.colors.outline,
                  true: theme.colors.primaryLight,
                }}
                thumbColor={isDefault ? theme.colors.primary : theme.colors.surface}
                accessibilityLabel="Default selection toggle"
              />
            </View>

            {/* Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewName}>{name || 'Option Name'}</Text>
                <Text style={[
                  styles.previewPrice,
                  priceValue > 0 && styles.previewPricePositive,
                  priceValue < 0 && styles.previewPriceNegative,
                  priceValue === 0 && styles.previewPriceZero,
                ]}>
                  {priceText}
                </Text>
              </View>
              <View style={styles.previewBadges}>
                {isDefault && (
                  <View style={[styles.previewBadge, styles.previewBadgeDefault]}>
                    <Text style={[styles.previewBadgeText, styles.previewBadgeTextDefault]}>
                      Default
                    </Text>
                  </View>
                )}
                {!isAvailable && (
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>Unavailable</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isSubmitting}
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isSubmitting && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
              accessibilityLabel={isEditMode ? 'Save changes' : 'Add option'}
              testID="btn-save-modifier-option"
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting
                  ? (isEditMode ? 'Saving...' : 'Adding...')
                  : (isEditMode ? 'Save Changes' : 'Add Option')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddModifierOptionModal;
