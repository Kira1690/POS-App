/**
 * BulkEditModal Component
 * Modal for bulk editing multiple menu items
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
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { CategoryWithStats } from '@/types/menu-management.types';

interface BulkEditModalProps {
  visible: boolean;
  selectedCount: number;
  categories: CategoryWithStats[];
  onClose: () => void;
  onApply: (changes: BulkEditChanges) => Promise<void>;
}

export interface BulkEditChanges {
  category_id?: string;
  is_available?: boolean;
  price_adjustment?: {
    type: 'fixed' | 'percentage';
    value: number;
    operation: 'increase' | 'decrease' | 'set';
  };
  tax_rate?: number;
}

type FieldKey = 'category' | 'availability' | 'price' | 'tax';

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  visible,
  selectedCount,
  categories,
  onClose,
  onApply,
}) => {
  const { theme } = useTheme();

  const [enabledFields, setEnabledFields] = useState<Set<FieldKey>>(new Set());
  const [categoryId, setCategoryId] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [priceOperation, setPriceOperation] = useState<'increase' | 'decrease' | 'set'>('set');
  const [priceType, setPriceType] = useState<'fixed' | 'percentage'>('fixed');
  const [priceValue, setPriceValue] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleField = useCallback((field: FieldKey) => {
    setEnabledFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  const handleApply = useCallback(async () => {
    const changes: BulkEditChanges = {};

    if (enabledFields.has('category') && categoryId) {
      changes.category_id = categoryId;
    }

    if (enabledFields.has('availability')) {
      changes.is_available = isAvailable;
    }

    if (enabledFields.has('price') && priceValue) {
      changes.price_adjustment = {
        type: priceType,
        value: parseFloat(priceValue) || 0,
        operation: priceOperation,
      };
    }

    if (enabledFields.has('tax') && taxRate) {
      changes.tax_rate = parseFloat(taxRate) || 0;
    }

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onApply(changes);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [enabledFields, categoryId, isAvailable, priceOperation, priceType, priceValue, taxRate, onApply]);

  const handleClose = useCallback(() => {
    setEnabledFields(new Set());
    setCategoryId('');
    setIsAvailable(true);
    setPriceOperation('set');
    setPriceType('fixed');
    setPriceValue('');
    setTaxRate('');
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
      maxHeight: '80%',
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
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      padding: theme.spacing.lg,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.primary,
      lineHeight: 18,
    },
    fieldSection: {
      marginBottom: theme.spacing.lg,
    },
    fieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    fieldContent: {
      paddingLeft: theme.spacing.md,
      opacity: 1,
    },
    fieldContentDisabled: {
      opacity: 0.4,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
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
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    toggleOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
      gap: theme.spacing.xs,
    },
    toggleOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    toggleText: {
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    priceRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    priceButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
    },
    priceButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    priceButtonText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    priceInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: theme.spacing.md,
    },
    priceSymbol: {
      fontSize: 16,
      color: theme.colors.onSurfaceSecondary,
    },
    priceTextInput: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      fontSize: 16,
      color: theme.colors.onSurface,
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
    applyButton: {
      backgroundColor: theme.colors.primary,
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
    applyButtonText: {
      color: theme.colors.white,
    },
  });

  const hasChanges = enabledFields.size > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Bulk Edit</Text>
              <Text style={styles.headerSubtitle}>
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <Icon name="close" size={24} color={theme.colors.onSurface} accessibilityLabel="" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBox}>
              <Icon
                name="information-outline"
                size={20}
                color={theme.colors.primary}
                accessibilityLabel=""
              />
              <Text style={styles.infoText}>
                Select the fields you want to update. Only enabled fields will be changed for all
                selected items.
              </Text>
            </View>

            {/* Category Field */}
            <View style={styles.fieldSection}>
              <TouchableOpacity
                style={styles.fieldHeader}
                onPress={() => toggleField('category')}
                accessibilityLabel="Toggle category field"
              >
                <Text style={styles.fieldLabel}>Change Category</Text>
                <View style={[styles.checkbox, enabledFields.has('category') && styles.checkboxChecked]}>
                  {enabledFields.has('category') && (
                    <Icon name="check" size={14} color={theme.colors.white} accessibilityLabel="" />
                  )}
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.fieldContent,
                  !enabledFields.has('category') && styles.fieldContentDisabled,
                ]}
                pointerEvents={enabledFields.has('category') ? 'auto' : 'none'}
              >
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        categoryId === category.id && styles.categoryOptionSelected,
                      ]}
                      onPress={() => setCategoryId(category.id)}
                      accessibilityLabel={`Select ${category.name}`}
                    >
                      <View
                        style={[styles.categoryDot, { backgroundColor: category.color || theme.colors.primary }]}
                      />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Availability Field */}
            <View style={styles.fieldSection}>
              <TouchableOpacity
                style={styles.fieldHeader}
                onPress={() => toggleField('availability')}
                accessibilityLabel="Toggle availability field"
              >
                <Text style={styles.fieldLabel}>Set Availability</Text>
                <View style={[styles.checkbox, enabledFields.has('availability') && styles.checkboxChecked]}>
                  {enabledFields.has('availability') && (
                    <Icon name="check" size={14} color={theme.colors.white} accessibilityLabel="" />
                  )}
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.fieldContent,
                  !enabledFields.has('availability') && styles.fieldContentDisabled,
                ]}
                pointerEvents={enabledFields.has('availability') ? 'auto' : 'none'}
              >
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleOption, isAvailable && styles.toggleOptionSelected]}
                    onPress={() => setIsAvailable(true)}
                    accessibilityLabel="Mark as available"
                  >
                    <Icon
                      name="eye-outline"
                      size={18}
                      color={isAvailable ? theme.colors.primary : theme.colors.onSurfaceSecondary}
                      accessibilityLabel=""
                    />
                    <Text style={styles.toggleText}>Available</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleOption, !isAvailable && styles.toggleOptionSelected]}
                    onPress={() => setIsAvailable(false)}
                    accessibilityLabel="Mark as unavailable"
                  >
                    <Icon
                      name="eye-off-outline"
                      size={18}
                      color={!isAvailable ? theme.colors.primary : theme.colors.onSurfaceSecondary}
                      accessibilityLabel=""
                    />
                    <Text style={styles.toggleText}>Unavailable</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Price Field */}
            <View style={styles.fieldSection}>
              <TouchableOpacity
                style={styles.fieldHeader}
                onPress={() => toggleField('price')}
                accessibilityLabel="Toggle price field"
              >
                <Text style={styles.fieldLabel}>Adjust Price</Text>
                <View style={[styles.checkbox, enabledFields.has('price') && styles.checkboxChecked]}>
                  {enabledFields.has('price') && (
                    <Icon name="check" size={14} color={theme.colors.white} accessibilityLabel="" />
                  )}
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.fieldContent,
                  !enabledFields.has('price') && styles.fieldContentDisabled,
                ]}
                pointerEvents={enabledFields.has('price') ? 'auto' : 'none'}
              >
                <View style={styles.priceRow}>
                  {(['increase', 'decrease', 'set'] as const).map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.priceButton, priceOperation === op && styles.priceButtonSelected]}
                      onPress={() => setPriceOperation(op)}
                      accessibilityLabel={`${op} price`}
                    >
                      <Text style={styles.priceButtonText}>
                        {op.charAt(0).toUpperCase() + op.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.priceRow}>
                  <TouchableOpacity
                    style={[styles.priceButton, priceType === 'fixed' && styles.priceButtonSelected]}
                    onPress={() => setPriceType('fixed')}
                    accessibilityLabel="Fixed amount"
                  >
                    <Text style={styles.priceButtonText}>$ Fixed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.priceButton, priceType === 'percentage' && styles.priceButtonSelected]}
                    onPress={() => setPriceType('percentage')}
                    accessibilityLabel="Percentage"
                  >
                    <Text style={styles.priceButtonText}>% Percentage</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceSymbol}>{priceType === 'fixed' ? '$' : ''}</Text>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.onSurfaceSecondary}
                    value={priceValue}
                    onChangeText={setPriceValue}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Price value"
                  />
                  <Text style={styles.priceSymbol}>{priceType === 'percentage' ? '%' : ''}</Text>
                </View>
              </View>
            </View>

            {/* Tax Rate Field */}
            <View style={styles.fieldSection}>
              <TouchableOpacity
                style={styles.fieldHeader}
                onPress={() => toggleField('tax')}
                accessibilityLabel="Toggle tax field"
              >
                <Text style={styles.fieldLabel}>Set Tax Rate</Text>
                <View style={[styles.checkbox, enabledFields.has('tax') && styles.checkboxChecked]}>
                  {enabledFields.has('tax') && (
                    <Icon name="check" size={14} color={theme.colors.white} accessibilityLabel="" />
                  )}
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.fieldContent,
                  !enabledFields.has('tax') && styles.fieldContentDisabled,
                ]}
                pointerEvents={enabledFields.has('tax') ? 'auto' : 'none'}
              >
                <View style={styles.priceInput}>
                  <TextInput
                    style={styles.priceTextInput}
                    placeholder="0"
                    placeholderTextColor={theme.colors.onSurfaceSecondary}
                    value={taxRate}
                    onChangeText={setTaxRate}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Tax rate"
                  />
                  <Text style={styles.priceSymbol}>%</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.applyButton,
                (!hasChanges || isSubmitting) && styles.buttonDisabled,
              ]}
              onPress={handleApply}
              disabled={!hasChanges || isSubmitting}
              accessibilityLabel="Apply changes"
            >
              {isSubmitting ? (
                <Icon name="loading" size={18} color={theme.colors.white} accessibilityLabel="" />
              ) : (
                <Icon name="check" size={18} color={theme.colors.white} accessibilityLabel="" />
              )}
              <Text style={[styles.buttonText, styles.applyButtonText]}>
                {isSubmitting ? 'Applying...' : 'Apply Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BulkEditModal;
