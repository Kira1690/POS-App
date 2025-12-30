/**
 * AddModifierGroupModal Component
 * Modal for creating a new modifier group
 */

import React, { useState, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  ModifierSelectionType,
  CreateModifierGroupRequest,
} from '@/types/menu-management-extended.types';

export interface ModifierGroupFormData {
  name: string;
  description: string;
  selection_type: ModifierSelectionType;
  is_required: boolean;
  min_selections?: number;
  max_selections?: number;
}

interface AddModifierGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateModifierGroupRequest) => Promise<void>;
  restaurantId?: string;
}

export const AddModifierGroupModal: React.FC<AddModifierGroupModalProps> = ({
  visible,
  onClose,
  onSave,
  restaurantId = 'rest_001',
}) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectionType, setSelectionType] = useState<ModifierSelectionType>('single');
  const [isRequired, setIsRequired] = useState(false);
  const [minSelections, setMinSelections] = useState('');
  const [maxSelections, setMaxSelections] = useState('');

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setSelectionType('single');
    setIsRequired(false);
    setMinSelections('');
    setMaxSelections('');
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (selectionType === 'multiple') {
      const min = minSelections ? parseInt(minSelections, 10) : undefined;
      const max = maxSelections ? parseInt(maxSelections, 10) : undefined;

      if (min !== undefined && max !== undefined && min > max) {
        newErrors.minSelections = 'Min cannot be greater than max';
      }

      if (min !== undefined && min < 0) {
        newErrors.minSelections = 'Min must be 0 or greater';
      }

      if (max !== undefined && max < 1) {
        newErrors.maxSelections = 'Max must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, selectionType, minSelections, maxSelections]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formData: CreateModifierGroupRequest = {
        restaurant_id: restaurantId,
        name: name.trim(),
        description: description.trim() || undefined,
        selection_type: selectionType,
        is_required: isRequired,
        min_selections: selectionType === 'multiple' && minSelections
          ? parseInt(minSelections, 10)
          : undefined,
        max_selections: selectionType === 'multiple' && maxSelections
          ? parseInt(maxSelections, 10)
          : undefined,
      };

      await onSave(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Failed to create modifier group. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    restaurantId,
    name,
    description,
    selectionType,
    isRequired,
    minSelections,
    maxSelections,
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
      maxWidth: 480,
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
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
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
      height: 80,
      textAlignVertical: 'top',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    selectionTypeContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    selectionTypeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    selectionTypeButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    selectionTypeIcon: {
      marginRight: theme.spacing.xs,
    },
    selectionTypeText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    selectionTypeTextActive: {
      color: theme.colors.primary,
    },
    selectionTypeDescription: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
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
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    halfInput: {
      flex: 1,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.primaryLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.primary,
      lineHeight: 18,
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Modifier Group</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {errors.submit && (
              <View style={styles.submitError}>
                <Text style={styles.submitErrorText}>{errors.submit}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Group Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Size, Toppings, Spice Level"
                  placeholderTextColor={theme.colors.onSurfaceSecondary}
                  maxLength={50}
                  accessibilityLabel="Modifier group name"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optional description for this modifier group"
                  placeholderTextColor={theme.colors.onSurfaceSecondary}
                  multiline
                  maxLength={200}
                  accessibilityLabel="Modifier group description"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selection Type</Text>

              <View style={styles.selectionTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.selectionTypeButton,
                    selectionType === 'single' && styles.selectionTypeButtonActive,
                  ]}
                  onPress={() => setSelectionType('single')}
                  accessibilityLabel="Single selection"
                  accessibilityState={{ selected: selectionType === 'single' }}
                >
                  <MaterialCommunityIcons
                    name="radiobox-marked"
                    size={24}
                    color={selectionType === 'single' ? theme.colors.primary : theme.colors.onSurfaceSecondary}
                  />
                  <View>
                    <Text style={[
                      styles.selectionTypeText,
                      selectionType === 'single' && styles.selectionTypeTextActive,
                    ]}>
                      Single
                    </Text>
                    <Text style={styles.selectionTypeDescription}>Select one option</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectionTypeButton,
                    selectionType === 'multiple' && styles.selectionTypeButtonActive,
                  ]}
                  onPress={() => setSelectionType('multiple')}
                  accessibilityLabel="Multiple selection"
                  accessibilityState={{ selected: selectionType === 'multiple' }}
                >
                  <MaterialCommunityIcons
                    name="checkbox-marked"
                    size={24}
                    color={selectionType === 'multiple' ? theme.colors.primary : theme.colors.onSurfaceSecondary}
                  />
                  <View>
                    <Text style={[
                      styles.selectionTypeText,
                      selectionType === 'multiple' && styles.selectionTypeTextActive,
                    ]}>
                      Multiple
                    </Text>
                    <Text style={styles.selectionTypeDescription}>Select many options</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>

              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchTitle}>Required Selection</Text>
                  <Text style={styles.switchDescription}>
                    Customer must select at least one option
                  </Text>
                </View>
                <Switch
                  value={isRequired}
                  onValueChange={setIsRequired}
                  trackColor={{
                    false: theme.colors.outline,
                    true: theme.colors.primaryLight,
                  }}
                  thumbColor={isRequired ? theme.colors.primary : theme.colors.surface}
                  accessibilityLabel="Required selection toggle"
                />
              </View>

              {selectionType === 'multiple' && (
                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <Text style={styles.label}>Min Selections</Text>
                    <TextInput
                      style={[styles.input, errors.minSelections && styles.inputError]}
                      value={minSelections}
                      onChangeText={setMinSelections}
                      placeholder="0"
                      placeholderTextColor={theme.colors.onSurfaceSecondary}
                      keyboardType="number-pad"
                      accessibilityLabel="Minimum selections"
                    />
                    {errors.minSelections && (
                      <Text style={styles.errorText}>{errors.minSelections}</Text>
                    )}
                  </View>

                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <Text style={styles.label}>Max Selections</Text>
                    <TextInput
                      style={[styles.input, errors.maxSelections && styles.inputError]}
                      value={maxSelections}
                      onChangeText={setMaxSelections}
                      placeholder="No limit"
                      placeholderTextColor={theme.colors.onSurfaceSecondary}
                      keyboardType="number-pad"
                      accessibilityLabel="Maximum selections"
                    />
                    {errors.maxSelections && (
                      <Text style={styles.errorText}>{errors.maxSelections}</Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <MaterialCommunityIcons
                name="information"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.infoText}>
                After creating the modifier group, you can add options like sizes, toppings,
                or customizations. You can also assign this group to specific menu items.
              </Text>
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
              accessibilityLabel="Create modifier group"
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddModifierGroupModal;
