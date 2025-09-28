import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { CategoryWithStats, CreateMenuItemRequest } from '@/types/menu-management.types';

interface AddMenuItemModalProps {
  visible: boolean;
  categories: CategoryWithStats[];
  defaultCategoryId?: string;
  onSubmit: (data: CreateMenuItemRequest) => Promise<void>;
  onClose: () => void;
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  visible,
  categories,
  defaultCategoryId,
  onSubmit,
  onClose,
}) => {
  const { theme } = useTheme();

  // Form state
  const [formData, setFormData] = useState<CreateMenuItemRequest>({
    restaurant_id: 'rest_001', // Would come from auth context
    category_id: defaultCategoryId || categories[0]?.id || '',
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_available: true,
    preparation_time_minutes: 10,
    dietary_info: [],
    ingredients: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Update form field
   */
  const updateField = (field: keyof CreateMenuItemRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.preparation_time_minutes && formData.preparation_time_minutes < 1) {
      newErrors.preparation_time_minutes = 'Prep time must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setFormData({
      restaurant_id: 'rest_001',
      category_id: defaultCategoryId || categories[0]?.id || '',
      name: '',
      description: '',
      price: 0,
      image_url: '',
      is_available: true,
      preparation_time_minutes: 10,
      dietary_info: [],
      ingredients: [],
    });
    setErrors({});
    onClose();
  };

  /**
   * Handle dietary info toggle
   */
  const toggleDietaryInfo = (info: string) => {
    const current = formData.dietary_info || [];
    if (current.includes(info)) {
      updateField('dietary_info', current.filter(item => item !== info));
    } else {
      updateField('dietary_info', [...current, info]);
    }
  };

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Spicy'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.lg,
      paddingTop: 50,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurfaceOnPrimary,
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      color: theme.colors.onSurfaceOnPrimary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    fieldContainer: {
      marginBottom: theme.spacing.md,
    },
    fieldLabel: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      minHeight: 44,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    errorInput: {
      borderColor: theme.colors.error,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: 4,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    categoryOption: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    selectedCategoryOption: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryOptionText: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
    },
    selectedCategoryOptionText: {
      color: theme.colors.onSurfaceOnPrimary,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    dietaryOptionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    dietaryOption: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    selectedDietaryOption: {
      backgroundColor: theme.colors.successLight,
      borderColor: theme.colors.success,
    },
    dietaryOptionText: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
    },
    selectedDietaryOptionText: {
      color: theme.colors.success,
      fontWeight: '600',
    },
    bottomSpacing: {
      height: 100,
    },
    actionButtons: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.md,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
    },
    submitButton: {
      flex: 1,
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: theme.colors.outlineLight,
    },
    submitButtonText: {
      ...theme.typography.label,
      color: theme.colors.onSurfaceOnPrimary,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Menu Item</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            {/* Item Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Item Name *</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.errorInput]}
                placeholder="Enter item name"
                placeholderTextColor={theme.colors.onSurfaceLight}
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                editable={!loading}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Category */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Category *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.category_id === category.id && styles.selectedCategoryOption,
                    ]}
                    onPress={() => updateField('category_id', category.id)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formData.category_id === category.id && styles.selectedCategoryOptionText,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category_id && <Text style={styles.errorText}>{errors.category_id}</Text>}
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter item description"
                placeholderTextColor={theme.colors.onSurfaceLight}
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          </View>

          {/* Pricing and Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing & Availability</Text>

            {/* Price */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Price *</Text>
              <TextInput
                style={[styles.textInput, errors.price && styles.errorInput]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.onSurfaceLight}
                value={formData.price.toString()}
                onChangeText={(text) => updateField('price', parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                editable={!loading}
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            {/* Preparation Time */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Preparation Time (minutes)</Text>
              <TextInput
                style={[styles.textInput, errors.preparation_time_minutes && styles.errorInput]}
                placeholder="10"
                placeholderTextColor={theme.colors.onSurfaceLight}
                value={formData.preparation_time_minutes?.toString() || ''}
                onChangeText={(text) => updateField('preparation_time_minutes', parseInt(text) || undefined)}
                keyboardType="number-pad"
                editable={!loading}
              />
              {errors.preparation_time_minutes && <Text style={styles.errorText}>{errors.preparation_time_minutes}</Text>}
            </View>

            {/* Available Toggle */}
            <View style={styles.fieldContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.fieldLabel}>Available for ordering</Text>
                <Switch
                  value={formData.is_available}
                  onValueChange={(value) => updateField('is_available', value)}
                  trackColor={{
                    false: theme.colors.outline,
                    true: theme.colors.success,
                  }}
                  thumbColor={theme.colors.surface}
                  disabled={loading}
                />
              </View>
            </View>
          </View>

          {/* Dietary Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Information</Text>
            <View style={styles.dietaryOptionsContainer}>
              {dietaryOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dietaryOption,
                    formData.dietary_info?.includes(option) && styles.selectedDietaryOption,
                  ]}
                  onPress={() => toggleDietaryInfo(option)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.dietaryOptionText,
                      formData.dietary_info?.includes(option) && styles.selectedDietaryOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Optional Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            {/* Image URL */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Image URL</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={theme.colors.onSurfaceLight}
                value={formData.image_url}
                onChangeText={(text) => updateField('image_url', text)}
                keyboardType="url"
                editable={!loading}
              />
            </View>

            {/* Ingredients */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Ingredients (comma-separated)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="ingredient1, ingredient2, ingredient3"
                placeholderTextColor={theme.colors.onSurfaceLight}
                value={formData.ingredients?.join(', ') || ''}
                onChangeText={(text) => updateField('ingredients', text.split(',').map(item => item.trim()).filter(Boolean))}
                multiline
                numberOfLines={2}
                editable={!loading}
              />
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
