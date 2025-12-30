/**
 * AddComboModal Component
 * Multi-step wizard for creating a new combo deal
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  ComboAvailability,
  CreateComboRequest,
  CreateComboItemRequest,
  ComboItemCategory,
  MenuItemExtended,
} from '@/types/menu-management-extended.types';
import { CategoryWithStats } from '@/types/menu-management.types';
import ComboItemSelector from '../components/ComboItemSelector';
import ComboAvailabilityEditor from '../components/ComboAvailabilityEditor';

interface SelectedComboItem {
  menu_item_id?: string;
  category_choice?: string;
  quantity: number;
  is_substitutable: boolean;
  substitution_options: string[];
  price_override?: number;
  item_category: ComboItemCategory;
}

export interface ComboFormData {
  name: string;
  description: string;
  image_url?: string;
  combo_items: SelectedComboItem[];
  combo_price: number;
  availability: ComboAvailability;
}

interface AddComboModalProps {
  visible: boolean;
  menuItems: MenuItemExtended[];
  categories: CategoryWithStats[];
  onClose: () => void;
  onSave: (data: CreateComboRequest) => Promise<void>;
  restaurantId?: string;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: 'information' },
  { id: 2, title: 'Select Items', icon: 'food-variant' },
  { id: 3, title: 'Pricing & Availability', icon: 'cash-multiple' },
];

export const AddComboModal: React.FC<AddComboModalProps> = ({
  visible,
  menuItems,
  categories,
  onClose,
  onSave,
  restaurantId = 'rest_001',
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedComboItem[]>([]);
  const [comboPrice, setComboPrice] = useState('');
  const [availability, setAvailability] = useState<ComboAvailability>({
    always_available: true,
  });

  // Calculate regular price from selected items
  const regularPrice = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      if (item.menu_item_id) {
        const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
        return total + (menuItem?.price || 0) * item.quantity;
      }
      // For category choices, use average price of category
      if (item.category_choice) {
        const categoryItems = menuItems.filter(mi => {
          const cat = categories.find(c => c.name === item.category_choice);
          return cat && mi.category_id === cat.id;
        });
        const avgPrice = categoryItems.length > 0
          ? categoryItems.reduce((sum, i) => sum + i.price, 0) / categoryItems.length
          : 0;
        return total + avgPrice * item.quantity;
      }
      return total;
    }, 0);
  }, [selectedItems, menuItems, categories]);

  const savings = useMemo(() => {
    const price = parseFloat(comboPrice) || 0;
    const amount = regularPrice - price;
    const percentage = regularPrice > 0 ? (amount / regularPrice) * 100 : 0;
    return { amount, percentage };
  }, [regularPrice, comboPrice]);

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setName('');
    setDescription('');
    setImageUrl('');
    setSelectedItems([]);
    setComboPrice('');
    setAvailability({ always_available: true });
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) {
        newErrors.name = 'Combo name is required';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }

    if (step === 2) {
      if (selectedItems.length === 0) {
        newErrors.items = 'Please add at least one item to the combo';
      }
    }

    if (step === 3) {
      const price = parseFloat(comboPrice);
      if (!comboPrice || isNaN(price)) {
        newErrors.comboPrice = 'Combo price is required';
      } else if (price <= 0) {
        newErrors.comboPrice = 'Price must be greater than 0';
      } else if (price >= regularPrice) {
        newErrors.comboPrice = 'Combo price should be less than regular price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, selectedItems, comboPrice, regularPrice]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSave = useCallback(async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const comboItems: CreateComboItemRequest[] = selectedItems.map((item, index) => ({
        menu_item_id: item.menu_item_id,
        category_choice: item.category_choice,
        quantity: item.quantity,
        is_substitutable: item.is_substitutable,
        substitution_options: item.substitution_options,
        price_override: item.price_override,
        item_category: item.item_category,
      }));

      const formData: CreateComboRequest = {
        restaurant_id: restaurantId,
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        combo_items: comboItems,
        combo_price: parseFloat(comboPrice),
        availability,
        is_active: true,
      };

      await onSave(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Failed to create combo. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateStep,
    selectedItems,
    restaurantId,
    name,
    description,
    imageUrl,
    comboPrice,
    availability,
    onSave,
    handleClose,
  ]);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
            )}
            <TouchableOpacity
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted,
              ]}
              onPress={() => {
                if (isCompleted || step.id <= currentStep) {
                  setCurrentStep(step.id);
                }
              }}
              disabled={step.id > currentStep && !isCompleted}
            >
              <MaterialCommunityIcons
                name={isCompleted ? 'check' : step.icon as any}
                size={16}
                color={isActive || isCompleted ? theme.colors.onPrimary : theme.colors.onSurfaceSecondary}
              />
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>
        Give your combo deal a name and description
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Combo Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Family Meal Deal, Lunch Special"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          maxLength={60}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what's included in this combo"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          multiline
          maxLength={200}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          keyboardType="url"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Combo Items</Text>
      <Text style={styles.stepSubtitle}>
        Choose the items to include in this combo
      </Text>

      {errors.items && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errors.items}</Text>
        </View>
      )}

      <ComboItemSelector
        menuItems={menuItems}
        categories={categories}
        selectedItems={selectedItems}
        onItemsChange={setSelectedItems}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Pricing & Availability</Text>
      <Text style={styles.stepSubtitle}>
        Set the combo price and when it's available
      </Text>

      {/* Pricing Section */}
      <View style={styles.pricingCard}>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Regular Price (total)</Text>
          <Text style={styles.pricingValue}>${regularPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Combo Price *</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.pricePrefix}>$</Text>
            <TextInput
              style={[styles.input, styles.priceInput, errors.comboPrice && styles.inputError]}
              value={comboPrice}
              onChangeText={setComboPrice}
              placeholder="0.00"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              keyboardType="decimal-pad"
            />
          </View>
          {errors.comboPrice && <Text style={styles.errorText}>{errors.comboPrice}</Text>}
        </View>

        {savings.amount > 0 && (
          <View style={styles.savingsRow}>
            <MaterialCommunityIcons name="sale" size={18} color={theme.colors.success} />
            <Text style={styles.savingsText}>
              Customers save ${savings.amount.toFixed(2)} ({savings.percentage.toFixed(0)}% off)
            </Text>
          </View>
        )}
      </View>

      {/* Availability Section */}
      <View style={styles.availabilitySection}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <ComboAvailabilityEditor
          availability={availability}
          onChange={setAvailability}
        />
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '95%',
      maxWidth: 600,
      height: '85%',
      minHeight: 500,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      flexDirection: 'column',
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
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.outline,
    },
    stepCircleActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    stepCircleCompleted: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    stepLine: {
      width: 60,
      height: 2,
      backgroundColor: theme.colors.outline,
    },
    stepLineCompleted: {
      backgroundColor: theme.colors.success,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    stepContent: {
      gap: theme.spacing.md,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    stepSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
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
    errorBox: {
      backgroundColor: theme.colors.errorLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    pricingCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    pricingLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
    },
    pricingValue: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pricePrefix: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginRight: theme.spacing.xs,
    },
    priceInput: {
      flex: 1,
    },
    savingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.successLight,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    savingsText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.success,
    },
    availabilitySection: {
      marginTop: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      gap: theme.spacing.xs,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    footerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    cancelButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      gap: theme.spacing.xs,
    },
    nextButtonDisabled: {
      backgroundColor: theme.colors.onSurfaceSecondary,
    },
    nextButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
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
            <Text style={styles.headerTitle}>Create Combo Deal</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </ScrollView>

          <View style={styles.footer}>
            {currentStep > 1 ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <MaterialCommunityIcons name="arrow-left" size={18} color={theme.colors.onSurface} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {currentStep < 3 ? (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
                  onPress={handleSave}
                  disabled={isSubmitting}
                >
                  <Text style={styles.nextButtonText}>
                    {isSubmitting ? 'Creating...' : 'Create Combo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddComboModal;
