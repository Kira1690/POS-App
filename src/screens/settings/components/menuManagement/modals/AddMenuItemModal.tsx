/**
 * AddMenuItemModal Component
 * Multi-step wizard for creating a new menu item
 * Steps: Basic Info -> Pricing -> Modifiers -> Nutritional
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
import { Icon, ImagePicker } from '@/components/common';
import { CategoryWithStats } from '@/types/menu-management.types';
import { DietaryTag, AllergenType, DIETARY_TAGS_CONFIG, ALLERGEN_LABELS, ModifierGroup, ModifierGroupWithStats } from '@/types/menu-management-extended.types';
import { ModifierSelectionList } from '../components/ModifierSelectionList';

interface AddMenuItemModalProps {
  visible: boolean;
  categories: CategoryWithStats[];
  modifierGroups: (ModifierGroup | ModifierGroupWithStats)[];
  onClose: () => void;
  onSave: (item: MenuItemFormData) => Promise<void>;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  category_id: string;
  price: number;
  cost_price: number;
  tax_rate: number;
  is_available: boolean;
  preparation_time: number;
  dietary_tags: DietaryTag[];
  allergens: AllergenType[];
  calories: number;
  image?: string;
  modifier_group_ids: string[];
}

type WizardStep = 'basic' | 'pricing' | 'modifiers' | 'nutritional';

const WIZARD_STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: 'basic', label: 'Basic Info', icon: 'information-outline' },
  { id: 'pricing', label: 'Pricing', icon: 'currency-usd' },
  { id: 'modifiers', label: 'Modifiers', icon: 'tune-variant' },
  { id: 'nutritional', label: 'Nutrition', icon: 'food-apple-outline' },
];

const INITIAL_FORM_DATA: MenuItemFormData = {
  name: '',
  description: '',
  category_id: '',
  price: 0,
  cost_price: 0,
  tax_rate: 0,
  is_available: true,
  preparation_time: 15,
  dietary_tags: [],
  allergens: [],
  calories: 0,
  modifier_group_ids: [],
};

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  visible,
  categories,
  modifierGroups,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [formData, setFormData] = useState<MenuItemFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof MenuItemFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate string states for decimal input fields to preserve decimal points while typing
  const [priceText, setPriceText] = useState('');
  const [costPriceText, setCostPriceText] = useState('');
  const [taxRateText, setTaxRateText] = useState('');

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  const validateStep = useCallback((step: WizardStep) => {
    const newErrors: Partial<Record<keyof MenuItemFormData, string>> = {};

    switch (step) {
      case 'basic':
        if (!formData.name.trim()) {
          newErrors.name = 'Item name is required';
        } else if (formData.name.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }
        if (!formData.category_id) {
          newErrors.category_id = 'Please select a category';
        }
        break;
      case 'pricing':
        if (formData.price <= 0) {
          newErrors.price = 'Price must be greater than 0';
        }
        if (formData.tax_rate < 0 || formData.tax_rate > 100) {
          newErrors.tax_rate = 'Tax rate must be between 0 and 100';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (!validateStep(currentStep)) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < WIZARD_STEPS.length) {
      setCurrentStep(WIZARD_STEPS[nextIndex].id);
    }
  }, [currentStep, currentStepIndex, validateStep]);

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(WIZARD_STEPS[prevIndex].id);
    }
  }, [currentStepIndex]);

  const handleSave = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      setErrors({ name: 'Failed to create item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, currentStep, validateStep, onSave]);

  const handleClose = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep('basic');
    setErrors({});
    // Reset price text states
    setPriceText('');
    setCostPriceText('');
    setTaxRateText('');
    onClose();
  }, [onClose]);

  const updateFormData = useCallback((updates: Partial<MenuItemFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleDietaryTag = useCallback((tag: DietaryTag) => {
    setFormData((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag],
    }));
  }, []);

  const toggleAllergen = useCallback((allergen: AllergenType) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  }, []);

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
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      maxHeight: '90%',
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
    },
    stepper: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    stepItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    stepCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
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
    stepNumber: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
    },
    stepNumberActive: {
      color: theme.colors.white,
    },
    stepLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    stepLabelActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    stepConnector: {
      width: 20,
      height: 2,
      backgroundColor: theme.colors.outline,
    },
    stepConnectorCompleted: {
      backgroundColor: theme.colors.success,
    },
    content: {
      padding: theme.spacing.lg,
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
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
      gap: theme.spacing.xs,
    },
    categoryOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    categoryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    categoryName: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    priceRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    priceInput: {
      flex: 1,
    },
    priceInputField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingLeft: theme.spacing.md,
    },
    currencySymbol: {
      fontSize: 16,
      color: theme.colors.onSurfaceSecondary,
    },
    priceTextInput: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    switchLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    switch: {
      width: 50,
      height: 28,
      borderRadius: 14,
      padding: 2,
    },
    switchOn: {
      backgroundColor: theme.colors.primary,
    },
    switchOff: {
      backgroundColor: theme.colors.outline,
    },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.white,
    },
    switchThumbOn: {
      alignSelf: 'flex-end',
    },
    switchThumbOff: {
      alignSelf: 'flex-start',
    },
    tagGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    tagOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      gap: theme.spacing.xs,
    },
    tagOptionSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    modifiersContainer: {
      flex: 1,
      minHeight: 200,
    },
    modifiersHelperText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: theme.spacing.sm,
      fontStyle: 'italic',
    },
    placeholderText: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      marginTop: theme.spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
    backButton: {
      backgroundColor: theme.colors.surfaceLight,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    backButtonText: {
      color: theme.colors.onSurface,
    },
    nextButtonText: {
      color: theme.colors.white,
    },
  });

  const renderBasicStep = () => (
    <>
      {/* Item Image */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Item Image</Text>
        <ImagePicker
          value={formData.image}
          onChange={(image) => updateFormData({ image })}
          placeholder="Add item image"
        />
        <Text style={styles.helperText}>
          Optional. Tap to capture or select from gallery.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Item Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Enter item name"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          value={formData.name}
          onChangeText={(text) => updateFormData({ name: text })}
          maxLength={100}
          accessibilityLabel="Item name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter item description (optional)"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          value={formData.description}
          onChangeText={(text) => updateFormData({ description: text })}
          maxLength={500}
          multiline
          numberOfLines={3}
          accessibilityLabel="Item description"
        />
        <Text style={styles.helperText}>{formData.description.length}/500 characters</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Category <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                formData.category_id === category.id && styles.categoryOptionSelected,
              ]}
              onPress={() => updateFormData({ category_id: category.id })}
              accessibilityLabel={`Select ${category.name} category`}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: category.color || theme.colors.primary },
                ]}
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category_id && <Text style={styles.errorText}>{errors.category_id}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Preparation Time (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="15"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          value={formData.preparation_time.toString()}
          onChangeText={(text) => updateFormData({ preparation_time: parseInt(text) || 0 })}
          keyboardType="numeric"
          accessibilityLabel="Preparation time in minutes"
        />
      </View>
    </>
  );

  const renderPricingStep = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Selling Price <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.priceInputField, errors.price && styles.inputError]}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.priceTextInput}
            placeholder="0.00"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            value={priceText}
            onChangeText={(text) => {
              setPriceText(text);
              updateFormData({ price: parseFloat(text) || 0 });
            }}
            keyboardType="decimal-pad"
            accessibilityLabel="Selling price"
          />
        </View>
        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
      </View>

      <View style={styles.priceRow}>
        <View style={[styles.formGroup, styles.priceInput]}>
          <Text style={styles.label}>Cost Price</Text>
          <View style={styles.priceInputField}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.priceTextInput}
              placeholder="0.00"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              value={costPriceText}
              onChangeText={(text) => {
                setCostPriceText(text);
                updateFormData({ cost_price: parseFloat(text) || 0 });
              }}
              keyboardType="decimal-pad"
              accessibilityLabel="Cost price"
            />
          </View>
        </View>

        <View style={[styles.formGroup, styles.priceInput]}>
          <Text style={styles.label}>Tax Rate (%)</Text>
          <View style={[styles.priceInputField, errors.tax_rate && styles.inputError]}>
            <TextInput
              style={styles.priceTextInput}
              placeholder="0"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              value={taxRateText}
              onChangeText={(text) => {
                setTaxRateText(text);
                updateFormData({ tax_rate: parseFloat(text) || 0 });
              }}
              keyboardType="decimal-pad"
              accessibilityLabel="Tax rate percentage"
            />
            <Text style={styles.currencySymbol}>%</Text>
          </View>
          {errors.tax_rate && <Text style={styles.errorText}>{errors.tax_rate}</Text>}
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Available for Sale</Text>
          <TouchableOpacity
            style={[styles.switch, formData.is_available ? styles.switchOn : styles.switchOff]}
            onPress={() => updateFormData({ is_available: !formData.is_available })}
            accessibilityLabel="Toggle item availability"
            accessibilityRole="switch"
          >
            <View
              style={[
                styles.switchThumb,
                formData.is_available ? styles.switchThumbOn : styles.switchThumbOff,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderModifiersStep = () => (
    <View style={styles.modifiersContainer}>
      <ModifierSelectionList
        modifierGroups={modifierGroups}
        selectedGroupIds={formData.modifier_group_ids}
        onSelectionChange={(ids) => updateFormData({ modifier_group_ids: ids })}
        title="Assign Modifiers"
      />
      <Text style={styles.modifiersHelperText}>
        Select modifier groups that apply to this item (e.g., Size, Toppings)
      </Text>
    </View>
  );

  const renderNutritionalStep = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Calories</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          value={formData.calories > 0 ? formData.calories.toString() : ''}
          onChangeText={(text) => updateFormData({ calories: parseInt(text) || 0 })}
          keyboardType="numeric"
          accessibilityLabel="Calories"
        />
        <Text style={styles.helperText}>Enter 0 if unknown</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Dietary Tags</Text>
        <View style={styles.tagGrid}>
          {(Object.entries(DIETARY_TAGS_CONFIG) as [DietaryTag, { label: string; icon: string }][]).map(
            ([tag, config]) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagOption,
                  formData.dietary_tags.includes(tag) && styles.tagOptionSelected,
                ]}
                onPress={() => toggleDietaryTag(tag)}
                accessibilityLabel={`Toggle ${config.label}`}
              >
                <Icon
                  name={config.icon}
                  size={16}
                  color={
                    formData.dietary_tags.includes(tag)
                      ? theme.colors.primary
                      : theme.colors.onSurfaceSecondary
                  }
                  accessibilityLabel=""
                />
                <Text style={styles.tagText}>{config.label}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Allergens</Text>
        <View style={styles.tagGrid}>
          {(Object.entries(ALLERGEN_LABELS) as [AllergenType, string][]).map(([allergen, label]) => (
            <TouchableOpacity
              key={allergen}
              style={[
                styles.tagOption,
                formData.allergens.includes(allergen) && styles.tagOptionSelected,
              ]}
              onPress={() => toggleAllergen(allergen)}
              accessibilityLabel={`Toggle ${label} allergen`}
            >
              <Icon
                name="alert-circle-outline"
                size={16}
                color={
                  formData.allergens.includes(allergen)
                    ? theme.colors.warning
                    : theme.colors.onSurfaceSecondary
                }
                accessibilityLabel=""
              />
              <Text style={styles.tagText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicStep();
      case 'pricing':
        return renderPricingStep();
      case 'modifiers':
        return renderModifiersStep();
      case 'nutritional':
        return renderNutritionalStep();
      default:
        return null;
    }
  };

  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

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
            <Text style={styles.headerTitle}>Add Menu Item</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <Icon name="close" size={24} color={theme.colors.onSurface} accessibilityLabel="" />
            </TouchableOpacity>
          </View>

          {/* Stepper */}
          <View style={styles.stepper}>
            {WIZARD_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      index === currentStepIndex && styles.stepCircleActive,
                      index < currentStepIndex && styles.stepCircleCompleted,
                    ]}
                  >
                    {index < currentStepIndex ? (
                      <Icon name="check" size={14} color={theme.colors.white} accessibilityLabel="" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          index === currentStepIndex && styles.stepNumberActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      index === currentStepIndex && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
                {index < WIZARD_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      index < currentStepIndex && styles.stepConnectorCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderCurrentStep()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.backButton, currentStepIndex === 0 && styles.buttonDisabled]}
              onPress={currentStepIndex === 0 ? handleClose : handleBack}
              accessibilityLabel={currentStepIndex === 0 ? 'Cancel' : 'Go back'}
            >
              <Icon
                name={currentStepIndex === 0 ? 'close' : 'arrow-left'}
                size={18}
                color={theme.colors.onSurface}
                accessibilityLabel=""
              />
              <Text style={[styles.buttonText, styles.backButtonText]}>
                {currentStepIndex === 0 ? 'Cancel' : 'Back'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.nextButton, isSubmitting && styles.buttonDisabled]}
              onPress={isLastStep ? handleSave : handleNext}
              disabled={isSubmitting}
              accessibilityLabel={isLastStep ? 'Create item' : 'Next step'}
            >
              {isSubmitting ? (
                <Icon name="loading" size={18} color={theme.colors.white} accessibilityLabel="" />
              ) : (
                <Icon
                  name={isLastStep ? 'check' : 'arrow-right'}
                  size={18}
                  color={theme.colors.white}
                  accessibilityLabel=""
                />
              )}
              <Text style={[styles.buttonText, styles.nextButtonText]}>
                {isSubmitting ? 'Creating...' : isLastStep ? 'Create Item' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddMenuItemModal;
