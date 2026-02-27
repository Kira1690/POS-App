/**
 * AddCategoryModal Component
 * Modal for creating a new menu category
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (category: CategoryFormData) => Promise<void>;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  display_order: number;
}

const CATEGORY_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
];

const CATEGORY_ICONS = [
  'food-outline',
  'food-apple-outline',
  'food-drumstick-outline',
  'food-steak-outline',
  'fish',
  'food-turkey',
  'pizza',
  'hamburger',
  'french-fries',
  'noodles',
  'rice',
  'bread-slice-outline',
  'cupcake',
  'ice-cream',
  'coffee-outline',
  'beer-outline',
  'glass-cocktail',
  'fruit-grapes-outline',
  'leaf',
  'egg-outline',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
    display_order: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      setErrors({ name: 'Failed to create category. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  const handleClose = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
      display_order: 0,
    });
    setErrors({});
    onClose();
  }, [onClose]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      maxWidth: 500,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
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
      borderRadius: theme.borderRadius.full,
    },
    content: {
      padding: theme.spacing.lg,
    },
    previewSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    previewBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
    },
    previewText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.white,
    },
    formGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    required: {
      color: theme.colors.error,
    },
    input: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: theme.spacing.xs,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    colorOption: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorOptionSelected: {
      borderWidth: 3,
      borderColor: theme.colors.onSurface,
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    iconOption: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    iconOptionSelected: {
      borderColor: theme.colors.tertiary,
      backgroundColor: theme.colors.tertiaryContainer,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceLight,
    },
    saveButton: {
      backgroundColor: theme.colors.tertiary,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.onSurface,
    },
    saveButtonText: {
      color: theme.colors.white,
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <Icon
                name="close"
                size={24}
                color={theme.colors.onSurface}
                accessibilityLabel=""
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Preview */}
            <View style={styles.previewSection}>
              <View style={[styles.previewBadge, { backgroundColor: formData.color }]}>
                <Icon
                  name={formData.icon}
                  size={24}
                  color={theme.colors.white}
                  accessibilityLabel=""
                />
                <Text style={styles.previewText}>
                  {formData.name || 'Category Name'}
                </Text>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter category name"
                placeholderTextColor={theme.colors.onSurfaceSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                maxLength={50}
                accessibilityLabel="Category name"
                testID="input-category-name"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : (
                <Text style={styles.helperText}>{formData.name.length}/50 characters</Text>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                placeholder="Enter category description (optional)"
                placeholderTextColor={theme.colors.onSurfaceSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                maxLength={200}
                multiline
                numberOfLines={3}
                accessibilityLabel="Category description"
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : (
                <Text style={styles.helperText}>{formData.description.length}/200 characters</Text>
              )}
            </View>

            {/* Color Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setFormData((prev) => ({ ...prev, color }))}
                    accessibilityLabel={`Select color ${color}`}
                    accessibilityRole="button"
                  >
                    {formData.color === color && (
                      <Icon
                        name="check"
                        size={18}
                        color={theme.colors.white}
                        accessibilityLabel=""
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Icon Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      formData.icon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => setFormData((prev) => ({ ...prev, icon }))}
                    accessibilityLabel={`Select icon ${icon}`}
                    accessibilityRole="button"
                  >
                    <Icon
                      name={icon}
                      size={22}
                      color={
                        formData.icon === icon
                          ? theme.colors.tertiary
                          : theme.colors.onSurfaceSecondary
                      }
                      accessibilityLabel=""
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isSubmitting && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
              accessibilityLabel="Save category"
              accessibilityRole="button"
              testID="btn-save-category"
            >
              {isSubmitting ? (
                <Icon
                  name="loading"
                  size={18}
                  color={theme.colors.white}
                  accessibilityLabel=""
                />
              ) : (
                <Icon
                  name="check"
                  size={18}
                  color={theme.colors.white}
                  accessibilityLabel=""
                />
              )}
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                {isSubmitting ? 'Saving...' : 'Save Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddCategoryModal;
