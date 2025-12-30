/**
 * EditCategoryModal Component
 * Modal for editing an existing menu category
 */

import React, { useState, useCallback, useEffect } from 'react';
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
  Switch,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { CategoryWithStats } from '@/types/menu-management.types';

interface EditCategoryModalProps {
  visible: boolean;
  category: CategoryWithStats | null;
  onClose: () => void;
  onSave: (categoryId: string, updates: CategoryUpdateData) => Promise<void>;
}

export interface CategoryUpdateData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

const CATEGORY_ICONS = [
  'food-outline', 'food-apple-outline', 'food-drumstick-outline', 'food-steak-outline',
  'fish', 'food-turkey', 'pizza', 'hamburger',
  'french-fries', 'noodles', 'rice', 'bread-slice-outline',
  'cupcake', 'ice-cream', 'coffee-outline', 'beer-outline',
  'glass-cocktail', 'fruit-grapes-outline', 'leaf', 'egg-outline',
];

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  visible,
  category,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        color: category.color || CATEGORY_COLORS[0],
        icon: category.icon || CATEGORY_ICONS[0],
        is_active: category.is_active !== false,
      });
      setErrors({});
    }
  }, [category]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

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
    if (!category || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(category.id, formData);
      onClose();
    } catch (error) {
      setErrors({ name: 'Failed to update category. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [category, formData, validateForm, onSave, onClose]);

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
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
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
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surfaceLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    toggleLabel: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    toggleSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
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
      backgroundColor: theme.colors.primary,
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

  if (!category) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
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
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{category.stats?.itemCount || 0}</Text>
                  <Text style={styles.statLabel}>Items</Text>
                </View>
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
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      accessibilityLabel=""
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Active Status Toggle */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </Text>
                  <Text style={styles.toggleSubtitle}>
                    {formData.is_active
                      ? 'Category is visible to customers'
                      : 'Category is hidden from customers'}
                  </Text>
                </View>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, is_active: value }))}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primaryLight }}
                  thumbColor={formData.is_active ? theme.colors.primary : theme.colors.surface}
                  accessibilityLabel="Toggle category active status"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
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
              accessibilityLabel="Save changes"
              accessibilityRole="button"
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditCategoryModal;
