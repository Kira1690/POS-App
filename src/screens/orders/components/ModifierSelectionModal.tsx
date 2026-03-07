/**
 * ModifierSelectionModal - Modal for selecting item modifiers
 * Supports single and multiple selection modifier groups
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { MenuItemExtended, ModifierGroup, ModifierOption } from '@/types/menu-management-extended.types';
import { SelectedModifier, SelectedModifierOption } from '@/types/order-extended.types';

// Internal type for tracking selections during editing
interface InternalSelection {
  optionId: string;
  optionName: string;
  priceAdjustment: number;
  quantity: number;
}

interface ModifierSelectionModalProps {
  visible: boolean;
  item: MenuItemExtended | null;
  onClose: () => void;
  onConfirm: (
    item: MenuItemExtended,
    modifiers: SelectedModifier[],
    quantity: number,
    notes?: string
  ) => void;
  initialModifiers?: SelectedModifier[];
  initialQuantity?: number;
  initialNotes?: string;
  isEditing?: boolean; // Show "Update Cart" instead of "Add to Cart"
}

export const ModifierSelectionModal: React.FC<ModifierSelectionModalProps> = ({
  visible,
  item,
  onClose,
  onConfirm,
  initialModifiers = [],
  initialQuantity = 1,
  initialNotes = '',
  isEditing = false,
}) => {
  const { theme } = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  // Internal state tracks selections per group using simpler InternalSelection type
  const [selectedOptions, setSelectedOptions] = useState<Map<string, InternalSelection[]>>(
    new Map()
  );
  const [quantity, setQuantity] = useState(initialQuantity);
  const [notes, setNotes] = useState(initialNotes);

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      const initialMap = new Map<string, InternalSelection[]>();

      // Set initial modifiers from props (convert from SelectedModifier to InternalSelection)
      initialModifiers.forEach((mod) => {
        if (!mod.options) return; // Skip if options is undefined
        const existing = initialMap.get(mod.groupId) || [];
        // Convert each option in the SelectedModifier to InternalSelection
        const newSelections = mod.options.map((opt) => ({
          optionId: opt.optionId,
          optionName: opt.optionName,
          priceAdjustment: opt.priceAdjustment,
          quantity: opt.quantity,
        }));
        initialMap.set(mod.groupId, [...existing, ...newSelections]);
      });

      // Set default modifiers if no initial modifiers
      if (initialModifiers.length === 0 && item.modifier_groups) {
        item.modifier_groups.forEach((group) => {
          if (!group.options) return; // Skip if options is undefined
          const defaults = group.options
            .filter((opt) => opt.is_default && opt.is_available !== false)
            .map((opt): InternalSelection => ({
              optionId: opt.id,
              optionName: opt.name,
              priceAdjustment: opt.price_adjustment,
              quantity: 1,
            }));
          if (defaults.length > 0) {
            initialMap.set(group.id, defaults);
          }
        });
      }

      setSelectedOptions(initialMap);
      setQuantity(initialQuantity);
      setNotes(initialNotes);
    }
  }, [item, initialModifiers, initialQuantity, initialNotes]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      maxWidth: 600,
      height: windowHeight * 0.82,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.primaryContainer,
    },
    headerInfo: {
      flex: 1,
    },
    itemName: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
    },
    itemPrice: {
      ...theme.typography.body1,
      color: theme.colors.primary,
      marginTop: 4,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.md,
      flexGrow: 1,
    },
    modifierGroup: {
      marginBottom: theme.spacing.lg,
    },
    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    groupName: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
    },
    groupRequired: {
      ...theme.typography.caption,
      color: theme.colors.error,
      fontWeight: '600',
    },
    groupHint: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.xs,
    },
    optionsContainer: {
      gap: theme.spacing.xs,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    optionRowSelected: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    optionRowUnavailable: {
      opacity: 0.5,
    },
    optionCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    optionCheckboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionInfo: {
      flex: 1,
    },
    optionName: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
    },
    optionDescription: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    optionPrice: {
      ...theme.typography.body2,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    notesSection: {
      marginTop: theme.spacing.lg,
    },
    notesLabel: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    notesInput: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: theme.spacing.sm,
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceLight,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    footerTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    footerBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantitySection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    quantityLabel: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginRight: theme.spacing.sm,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    quantityButton: {
      padding: theme.spacing.sm,
    },
    quantityValue: {
      ...theme.typography.body1,
      fontWeight: '600',
      color: theme.colors.onSurface,
      minWidth: 32,
      textAlign: 'center',
    },
    totalSection: {
      alignItems: 'flex-end',
    },
    totalLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    totalValue: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    confirmButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    confirmButtonDisabled: {
      backgroundColor: theme.colors.outline,
    },
    confirmButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
    validationError: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  });

  const handleSelectOption = useCallback(
    (group: ModifierGroup, option: ModifierOption) => {
      if (option.is_available === false) return;

      setSelectedOptions((prev) => {
        const newMap = new Map(prev);
        const currentGroupSelections = newMap.get(group.id) || [];

        const newSelection: InternalSelection = {
          optionId: option.id,
          optionName: option.name,
          priceAdjustment: option.price_adjustment,
          quantity: 1,
        };

        if (group.selection_type === 'single') {
          // Single selection - replace existing
          newMap.set(group.id, [newSelection]);
        } else {
          // Multiple selection - toggle
          const existingIndex = currentGroupSelections.findIndex(
            (s) => s.optionId === option.id
          );

          if (existingIndex >= 0) {
            // Remove if exists
            const updated = [...currentGroupSelections];
            updated.splice(existingIndex, 1);
            if (updated.length === 0) {
              newMap.delete(group.id);
            } else {
              newMap.set(group.id, updated);
            }
          } else {
            // Add if within max selections
            const maxSelections = group.max_selections || Infinity;
            if (currentGroupSelections.length < maxSelections) {
              newMap.set(group.id, [...currentGroupSelections, newSelection]);
            }
          }
        }

        return newMap;
      });
    },
    []
  );

  const isOptionSelected = useCallback(
    (groupId: string, optionId: string) => {
      const groupSelections = selectedOptions.get(groupId) || [];
      return groupSelections.some((s) => s.optionId === optionId);
    },
    [selectedOptions]
  );

  const { isValid, validationErrors } = useMemo(() => {
    if (!item?.modifier_groups) return { isValid: true, validationErrors: [] };

    const errors: string[] = [];

    item.modifier_groups.forEach((group) => {
      if (group.is_required) {
        const selections = selectedOptions.get(group.id) || [];
        const minRequired = group.min_selections || 1;

        if (selections.length < minRequired) {
          errors.push(`Select at least ${minRequired} option(s) for ${group.name}`);
        }
      }
    });

    return { isValid: errors.length === 0, validationErrors: errors };
  }, [item, selectedOptions]);

  const totalPrice = useMemo(() => {
    if (!item) return 0;

    let total = item.price;
    selectedOptions.forEach((selections) => {
      selections.forEach((s) => {
        total += s.priceAdjustment * s.quantity;
      });
    });

    return total * quantity;
  }, [item, selectedOptions, quantity]);

  const handleConfirm = useCallback(() => {
    if (!item || !isValid) return;

    // Build properly structured SelectedModifier objects
    const allModifiers: SelectedModifier[] = [];

    // Iterate over modifier groups to build correct structure
    item.modifier_groups?.forEach((group) => {
      const selections = selectedOptions.get(group.id);
      if (selections && selections.length > 0) {
        // Convert InternalSelection[] to SelectedModifierOption[]
        const options: SelectedModifierOption[] = selections.map((sel) => ({
          optionId: sel.optionId,
          optionName: sel.optionName,
          priceAdjustment: sel.priceAdjustment,
          quantity: sel.quantity,
          totalPrice: sel.priceAdjustment * sel.quantity,
        }));

        // Create properly structured SelectedModifier
        const modifier: SelectedModifier = {
          groupId: group.id,
          groupName: group.name,
          selectionType: group.selection_type,
          isRequired: group.is_required,
          options,
        };

        allModifiers.push(modifier);
      }
    });

    onConfirm(item, allModifiers, quantity, notes || undefined);
    onClose();
  }, [item, selectedOptions, quantity, notes, isValid, onConfirm, onClose]);

  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} testID="btn-modifier-modal-close">
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            {item.modifier_groups?.map((group) => (
              <View key={group.id} style={styles.modifierGroup}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.is_required && (
                    <Text style={styles.groupRequired}>Required</Text>
                  )}
                </View>
                <Text style={styles.groupHint}>
                  {group.selection_type === 'single'
                    ? 'Select one'
                    : `Select ${group.min_selections || 0} - ${group.max_selections || 'any'}`}
                </Text>

                <View style={styles.optionsContainer}>
                  {(group.options || []).map((option) => {
                    const isSelected = isOptionSelected(group.id, option.id);
                    const isAvailable = option.is_available !== false; // default true if undefined
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.optionRow,
                          isSelected && styles.optionRowSelected,
                          !isAvailable && styles.optionRowUnavailable,
                        ]}
                        onPress={() => handleSelectOption(group, option)}
                        disabled={!isAvailable}
                        testID={`btn-modifier-option-${option.id}`}
                      >
                        <View
                          style={[
                            styles.optionCheckbox,
                            isSelected && styles.optionCheckboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <MaterialCommunityIcons
                              name="check"
                              size={16}
                              color={theme.colors.onPrimary}
                            />
                          )}
                        </View>
                        <View style={styles.optionInfo}>
                          <Text style={styles.optionName}>{option.name}</Text>
                          {option.description && (
                            <Text style={styles.optionDescription}>
                              {option.description}
                            </Text>
                          )}
                        </View>
                        {option.price_adjustment !== 0 && (
                          <Text style={styles.optionPrice}>
                            {option.price_adjustment > 0 ? '+' : ''}
                            {formatPrice(option.price_adjustment)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Special Instructions</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add special instructions..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={notes}
                onChangeText={setNotes}
                multiline
                testID="input-modifier-notes"
              />
            </View>

            {validationErrors.length > 0 && (
              <View>
                {validationErrors.map((error, index) => (
                  <Text key={index} style={styles.validationError}>
                    {error}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {/* Row 1: Total */}
            <View style={styles.footerTotalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
            </View>

            {/* Row 2: Qty controls + Add to Cart */}
            <View style={styles.footerBottomRow}>
              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Qty:</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    testID="btn-modifier-qty-decrease"
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity((q) => q + 1)}
                    testID="btn-modifier-qty-increase"
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmButton, !isValid && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={!isValid}
                testID="btn-modifier-confirm"
              >
                <MaterialCommunityIcons
                  name={isEditing ? 'cart-check' : 'cart-plus'}
                  size={20}
                  color={theme.colors.onPrimary}
                />
                <Text style={styles.confirmButtonText}>
                  {isEditing ? 'Update Cart' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModifierSelectionModal;
