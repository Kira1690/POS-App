/**
 * EditMenuItemModal Component
 * Modal for editing an existing menu item with tabbed navigation
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon, ImagePicker } from '@/components/common';
import { CategoryWithStats } from '@/types/menu-management.types';
import { MenuItemExtended, DietaryTag, AllergenType, DIETARY_TAGS_CONFIG, ALLERGEN_LABELS, ModifierGroup, ModifierGroupWithStats, KitchenStation } from '@/types/menu-management-extended.types';
import { ModifierSelectionList } from '../components/ModifierSelectionList';
import { useKitchenConfig } from '@/context/kitchen';
import { getStationForCategory } from '@/types/order-extended.types';

interface EditMenuItemModalProps {
  visible: boolean;
  item: MenuItemExtended | null;
  categories: CategoryWithStats[];
  modifierGroups: (ModifierGroup | ModifierGroupWithStats)[];
  onClose: () => void;
  onSave: (itemId: string, updates: MenuItemUpdateData) => Promise<void>;
}

export interface MenuItemUpdateData {
  name?: string;
  description?: string;
  category_id?: string;
  price?: number;
  cost_price?: number;
  tax_rate?: number;
  is_available?: boolean;
  preparation_time?: number;
  dietary_tags?: DietaryTag[];
  allergens?: AllergenType[];
  calories?: number;
  image_url?: string;
  modifier_group_ids?: string[];
  kitchen_station?: KitchenStation;
}

type EditTab = 'basic' | 'pricing' | 'modifiers' | 'nutritional';

const EDIT_TABS: { id: EditTab; label: string; icon: string }[] = [
  { id: 'basic', label: 'Basic', icon: 'information-outline' },
  { id: 'pricing', label: 'Pricing', icon: 'currency-usd' },
  { id: 'modifiers', label: 'Modifiers', icon: 'tune-variant' },
  { id: 'nutritional', label: 'Nutrition', icon: 'food-apple-outline' },
];

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  visible,
  item,
  categories,
  modifierGroups,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const { stations } = useKitchenConfig();

  const activeStations = useMemo(
    () => stations.filter((s) => s.isActive).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [stations]
  );

  const [activeTab, setActiveTab] = useState<EditTab>('basic');
  const [formData, setFormData] = useState<MenuItemUpdateData>({});
  const [kitchenStation, setKitchenStation] = useState<KitchenStation | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate string states for decimal input fields to preserve decimal points while typing
  const [priceText, setPriceText] = useState('');
  const [costPriceText, setCostPriceText] = useState('');
  const [taxRateText, setTaxRateText] = useState('');

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      // Extract modifier group IDs from assignments
      const modifierGroupIds = item.modifier_assignments?.map(a => a.modifier_group_id) || [];

      setFormData({
        name: item.name,
        description: item.description || '',
        category_id: item.category_id,
        price: item.price,
        cost_price: item.cost_price || 0,
        tax_rate: item.tax_rate || 0,
        is_available: item.is_available,
        preparation_time: item.preparation_time || 15,
        dietary_tags: (item.dietary_tags || []) as DietaryTag[],
        allergens: (item.allergens || []) as AllergenType[],
        calories: item.nutritional_info?.calories || 0,
        image_url: item.image_url || item.image,
        modifier_group_ids: modifierGroupIds,
      });
      // Initialize price text states
      setPriceText(item.price > 0 ? item.price.toString() : '');
      setCostPriceText(item.cost_price && item.cost_price > 0 ? item.cost_price.toString() : '');
      setTaxRateText(item.tax_rate && item.tax_rate > 0 ? item.tax_rate.toString() : '');
      setKitchenStation(item.kitchen_station);
      setActiveTab('basic');
      setErrors({});
    }
  }, [item]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if ((formData.price ?? 0) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!item || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(item.id, { ...formData, kitchen_station: kitchenStation });
      onClose();
    } catch (error) {
      setErrors({ name: 'Failed to update item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [item, formData, validateForm, onSave, onClose]);

  const updateFormData = useCallback((updates: Partial<MenuItemUpdateData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleDietaryTag = useCallback((tag: DietaryTag) => {
    setFormData((prev) => ({
      ...prev,
      dietary_tags: (prev.dietary_tags || []).includes(tag)
        ? (prev.dietary_tags || []).filter((t) => t !== tag)
        : [...(prev.dietary_tags || []), tag],
    }));
  }, []);

  const toggleAllergen = useCallback((allergen: AllergenType) => {
    setFormData((prev) => ({
      ...prev,
      allergens: (prev.allergens || []).includes(allergen)
        ? (prev.allergens || []).filter((a) => a !== allergen)
        : [...(prev.allergens || []), allergen],
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
      flex: 1,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceLight,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
    },
    tabActive: {
      backgroundColor: theme.colors.surface,
    },
    tabText: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
    },
    tabTextActive: {
      color: theme.colors.tertiary,
      fontWeight: '600',
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
      borderColor: theme.colors.tertiary,
      backgroundColor: theme.colors.tertiaryContainer,
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
      backgroundColor: theme.colors.tertiary,
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
      backgroundColor: theme.colors.tertiaryContainer,
      borderColor: theme.colors.tertiary,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    stationScrollRow: {
      flexDirection: 'row',
    },
    stationChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.full,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      marginRight: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    stationChipSelected: {
      borderColor: theme.colors.tertiary,
    },
    stationChipText: {
      fontSize: 13,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    stationSubtitle: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
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
    buttonDisabled: {
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

  const renderBasicTab = () => (
    <>
      {/* Item Image */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Item Image</Text>
        <ImagePicker
          value={formData.image_url}
          onChange={(image) => updateFormData({ image_url: image })}
          placeholder="Add item image"
        />
        <Text style={styles.helperText}>
          Optional. Tap to change or remove.
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
          value={formData.name || ''}
          onChangeText={(text) => updateFormData({ name: text })}
          maxLength={100}
          accessibilityLabel="Item name"
          testID="input-edit-item-name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter item description"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          value={formData.description || ''}
          onChangeText={(text) => updateFormData({ description: text })}
          maxLength={500}
          multiline
          numberOfLines={3}
          accessibilityLabel="Item description"
        />
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
              accessibilityLabel={`Select ${category.name}`}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: category.color || theme.colors.tertiary },
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
          value={(formData.preparation_time || 0).toString()}
          onChangeText={(text) => updateFormData({ preparation_time: parseInt(text) || 0 })}
          keyboardType="numeric"
          accessibilityLabel="Preparation time"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Kitchen Station</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stationScrollRow}>
          {/* Auto chip */}
          {(() => {
            const autoStation = activeStations.find(
              (s) => s.station === getStationForCategory(formData.category_id || '', formData.category_id || '')
            );
            const isAutoSelected = kitchenStation === undefined;
            return (
              <TouchableOpacity
                style={[styles.stationChip, isAutoSelected && styles.stationChipSelected]}
                onPress={() => setKitchenStation(undefined)}
                accessibilityLabel="Auto station"
                testID="btn-station-auto"
              >
                <Icon
                  name="auto-fix"
                  size={16}
                  color={isAutoSelected ? theme.colors.tertiary : theme.colors.onSurfaceSecondary}
                  accessibilityLabel=""
                />
                <View>
                  <Text style={[styles.stationChipText, { color: isAutoSelected ? theme.colors.tertiary : theme.colors.onSurface }]}>
                    Auto
                  </Text>
                  <Text style={styles.stationSubtitle}>{autoStation?.name ?? 'Hot Kitchen'}</Text>
                </View>
              </TouchableOpacity>
            );
          })()}
          {/* Active station chips */}
          {activeStations.map((s) => {
            const isSelected = kitchenStation === s.station;
            return (
              <TouchableOpacity
                key={s.station}
                style={[
                  styles.stationChip,
                  isSelected && { borderColor: s.color },
                ]}
                onPress={() => setKitchenStation(s.station)}
                accessibilityLabel={`Select ${s.name}`}
                testID={`btn-station-${s.station}`}
              >
                <Icon
                  name={s.icon}
                  size={16}
                  color={isSelected ? s.color : theme.colors.onSurfaceSecondary}
                  accessibilityLabel=""
                />
                <Text style={[styles.stationChipText, { color: isSelected ? s.color : theme.colors.onSurface }]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.helperText}>
          Override which kitchen station prepares this item. "Auto" derives from category.
        </Text>
      </View>
    </>
  );

  const renderPricingTab = () => (
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
          <View style={styles.priceInputField}>
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
              accessibilityLabel="Tax rate"
            />
            <Text style={styles.currencySymbol}>%</Text>
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Available for Sale</Text>
          <TouchableOpacity
            style={[styles.switch, formData.is_available ? styles.switchOn : styles.switchOff]}
            onPress={() => updateFormData({ is_available: !formData.is_available })}
            accessibilityLabel="Toggle availability"
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

  const renderModifiersTab = () => (
    <View style={styles.modifiersContainer}>
      <ModifierSelectionList
        modifierGroups={modifierGroups}
        selectedGroupIds={formData.modifier_group_ids || []}
        onSelectionChange={(ids) => updateFormData({ modifier_group_ids: ids })}
        title="Assigned Modifiers"
      />
      <Text style={styles.modifiersHelperText}>
        Select which modifier groups apply to this item
      </Text>
    </View>
  );

  const renderNutritionalTab = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Calories</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          value={(formData.calories ?? 0) > 0 ? (formData.calories ?? 0).toString() : ''}
          onChangeText={(text) => updateFormData({ calories: parseInt(text) || 0 })}
          keyboardType="numeric"
          accessibilityLabel="Calories"
        />
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
                  (formData.dietary_tags || []).includes(tag) && styles.tagOptionSelected,
                ]}
                onPress={() => toggleDietaryTag(tag)}
                accessibilityLabel={`Toggle ${config.label}`}
              >
                <Icon
                  name={config.icon}
                  size={16}
                  color={
                    (formData.dietary_tags || []).includes(tag)
                      ? theme.colors.tertiary
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
                (formData.allergens || []).includes(allergen) && styles.tagOptionSelected,
              ]}
              onPress={() => toggleAllergen(allergen)}
              accessibilityLabel={`Toggle ${label}`}
            >
              <Icon
                name="alert-circle-outline"
                size={16}
                color={
                  (formData.allergens || []).includes(allergen)
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

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Edit: {item.name}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close modal"
            >
              <Icon name="close" size={24} color={theme.colors.onSurface} accessibilityLabel="" />
            </TouchableOpacity>
          </View>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            {EDIT_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
                accessibilityLabel={`${tab.label} tab`}
                accessibilityState={{ selected: activeTab === tab.id }}
                testID={`tab-edit-item-${tab.id}`}
              >
                <Icon
                  name={tab.icon}
                  size={18}
                  color={activeTab === tab.id ? theme.colors.tertiary : theme.colors.onSurfaceSecondary}
                  accessibilityLabel=""
                />
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'pricing' && renderPricingTab()}
            {activeTab === 'modifiers' && renderModifiersTab()}
            {activeTab === 'nutritional' && renderNutritionalTab()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              accessibilityLabel="Cancel"
              testID="btn-cancel-edit-item"
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
              accessibilityLabel="Save changes"
              testID="btn-save-item-changes"
            >
              {isSubmitting ? (
                <Icon name="loading" size={18} color={theme.colors.white} accessibilityLabel="" />
              ) : (
                <Icon name="check" size={18} color={theme.colors.white} accessibilityLabel="" />
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

export default EditMenuItemModal;
