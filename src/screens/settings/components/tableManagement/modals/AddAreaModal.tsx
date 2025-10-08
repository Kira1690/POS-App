/**
 * Add Area Modal
 * Create new dining areas/sections with icon and color pickers
 * Phase 2 - Complete Modal System
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { CapacityStepper } from '../components/CapacityStepper';

interface AddAreaModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (area: AreaData) => void;
}

export interface AreaData {
  name: string;
  icon: string;
  color: string;
  description: string;
  defaultCapacity: number;
  defaultShape: 'square' | 'round' | 'rectangle';
  autoNumbering: boolean;
  numberPrefix: string;
}

// Icon options
const ICON_OPTIONS = [
  { name: 'silverware-fork-knife', label: 'Main Dining' },
  { name: 'glass-cocktail', label: 'Bar' },
  { name: 'weather-sunny', label: 'Outdoor' },
  { name: 'crown', label: 'VIP' },
  { name: 'sofa', label: 'Lounge' },
  { name: 'office-building', label: 'Private Room' },
  { name: 'fireplace', label: 'Cozy' },
  { name: 'water', label: 'Waterfront' },
];

// Color options with theme mapping
interface ColorOption {
  key: string;
  label: string;
  themeKey: 'success' | 'info' | 'warning' | 'error' | 'purple' | 'primary';
}

const COLOR_OPTIONS: ColorOption[] = [
  { key: 'success', label: 'Success', themeKey: 'success' },
  { key: 'info', label: 'Info', themeKey: 'info' },
  { key: 'warning', label: 'Warning', themeKey: 'warning' },
  { key: 'error', label: 'Error', themeKey: 'error' },
  { key: 'purple', label: 'Purple', themeKey: 'purple' },
  { key: 'primary', label: 'Primary', themeKey: 'primary' },
];

export const AddAreaModal: React.FC<AddAreaModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  // Form state
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('silverware-fork-knife');
  const [selectedColor, setSelectedColor] = useState('success');
  const [description, setDescription] = useState('');
  const [defaultCapacity, setDefaultCapacity] = useState(4);
  const [defaultShape, setDefaultShape] = useState<'square' | 'round' | 'rectangle'>('round');
  const [autoNumbering, setAutoNumbering] = useState(true);
  const [numberPrefix, setNumberPrefix] = useState('T-');

  // Error state
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setName('');
      setSelectedIcon('silverware-fork-knife');
      setSelectedColor('success');
      setDescription('');
      setDefaultCapacity(4);
      setDefaultShape('round');
      setAutoNumbering(true);
      setNumberPrefix('T-');
      setErrors({});
    }
  }, [visible]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Section name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Section name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    const areaData: AreaData = {
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      description: description.trim(),
      defaultCapacity,
      defaultShape,
      autoNumbering,
      numberPrefix,
    };

    onSave(areaData);
    onClose();
  };

  // Get color value from theme
  const getThemeColor = (colorKey: string): string => {
    const colorOption = COLOR_OPTIONS.find((c) => c.key === colorKey);
    if (!colorOption) return theme.colors.primary;
    return (theme.colors as any)[colorOption.themeKey] || theme.colors.primary;
  };

  const descriptionLength = description.length;
  const descriptionMaxLength = 200;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 650,
      maxHeight: '90%',
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.xl as number,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      backgroundColor: theme.colors.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    headerTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      padding: spacing.lg,
    },
    sectionTitle: {
      ...typography.titleMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    fieldGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.bodyMedium,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: spacing.xs,
    },
    requiredIndicator: {
      color: theme.colors.error,
    },
    hint: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    input: {
      ...typography.bodyMedium,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.md,
      color: theme.colors.onSurface,
      minHeight: 56,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: 2,
    },
    errorText: {
      ...typography.bodySmall,
      color: theme.colors.error,
      marginTop: spacing.xs,
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    iconOption: {
      width: 70,
      height: 70,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '15',
    },
    iconLabel: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    selectedInfo: {
      ...typography.bodySmall,
      color: theme.colors.onSurface,
      marginTop: spacing.sm,
      fontWeight: '500',
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    colorOption: {
      width: 90,
      height: 60,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    colorOptionSelected: {
      borderWidth: 3,
    },
    colorCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    colorLabel: {
      ...typography.bodySmall,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    notesInput: {
      ...typography.bodyMedium,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.md,
      color: theme.colors.onSurface,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    characterCounter: {
      ...typography.bodySmall,
      color: descriptionLength > descriptionMaxLength ? theme.colors.error : theme.colors.onSurfaceVariant,
      textAlign: 'right',
      marginTop: spacing.xs,
    },
    configRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
      padding: spacing.md,
      borderRadius: borderRadius.md as number,
    },
    configLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    configValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    shapeDropdown: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.sm as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minWidth: 100,
    },
    shapeDropdownText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    toggleButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm as number,
      borderWidth: 1,
    },
    toggleButtonOn: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    toggleButtonOff: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
    },
    toggleButtonText: {
      ...typography.bodySmall,
      fontWeight: '600',
    },
    prefixInput: {
      ...typography.bodyMedium,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.sm as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.sm,
      color: theme.colors.onSurface,
      minWidth: 60,
      textAlign: 'center',
    },
    previewSection: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
    },
    previewCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.lg as number,
      borderLeftWidth: 4,
      padding: spacing.md,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    previewTitle: {
      ...typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    previewStats: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon
                name="map-marker-plus"
                size={24}
                color={theme.colors.onPrimary}
                accessibilityLabel="Add section"
              />
              <Text style={styles.headerTitle}>Add New Section</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon
                name="close"
                size={24}
                color={theme.colors.onPrimary}
                accessibilityLabel="Close"
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Section Information</Text>

            {/* Section Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Section Name <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Main Dining, VIP Lounge, Outdoor Patio"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              <Text style={styles.hint}>Example: Main Dining, VIP Lounge, Outdoor Patio</Text>
            </View>

            {/* Icon Picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Icon <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon.name && styles.iconOptionSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon.name)}
                  >
                    <Icon
                      name={icon.name}
                      size={32}
                      color={
                        selectedIcon === icon.name ? theme.colors.primary : theme.colors.onSurface
                      }
                      accessibilityLabel={icon.label}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.selectedInfo}>
                Selected: {ICON_OPTIONS.find((i) => i.name === selectedIcon)?.label}
              </Text>
            </View>

            {/* Color Picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Color Indicator <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color.key}
                    style={[
                      styles.colorOption,
                      {
                        borderColor:
                          selectedColor === color.key
                            ? getThemeColor(color.key)
                            : theme.colors.outline,
                      },
                      selectedColor === color.key && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color.key)}
                  >
                    <View
                      style={[styles.colorCircle, { backgroundColor: getThemeColor(color.key) }]}
                    />
                    <Text style={styles.colorLabel}>{color.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.selectedInfo}>
                Selected: {COLOR_OPTIONS.find((c) => c.key === selectedColor)?.label}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about this section..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                maxLength={descriptionMaxLength}
              />
              <Text style={styles.characterCounter}>
                {descriptionLength}/{descriptionMaxLength}
              </Text>
            </View>

            {/* Default Table Configuration */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Default Table Configuration</Text>

              {/* Default Capacity */}
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Default Capacity:</Text>
                <View style={styles.configValue}>
                  <TouchableOpacity
                    onPress={() => setDefaultCapacity(Math.max(1, defaultCapacity - 1))}
                  >
                    <Icon
                      name="minus-circle"
                      size={24}
                      color={theme.colors.primary}
                      accessibilityLabel="Decrease"
                    />
                  </TouchableOpacity>
                  <Text style={styles.configLabel}>{defaultCapacity}</Text>
                  <TouchableOpacity
                    onPress={() => setDefaultCapacity(Math.min(20, defaultCapacity + 1))}
                  >
                    <Icon
                      name="plus-circle"
                      size={24}
                      color={theme.colors.primary}
                      accessibilityLabel="Increase"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Default Shape */}
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Default Shape:</Text>
                <TouchableOpacity
                  style={styles.shapeDropdown}
                  onPress={() => {
                    const shapes: Array<'square' | 'round' | 'rectangle'> = [
                      'square',
                      'round',
                      'rectangle',
                    ];
                    const currentIndex = shapes.indexOf(defaultShape);
                    const nextIndex = (currentIndex + 1) % shapes.length;
                    setDefaultShape(shapes[nextIndex]);
                  }}
                >
                  <Text style={styles.shapeDropdownText}>
                    {defaultShape.charAt(0).toUpperCase() + defaultShape.slice(1)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Auto-numbering */}
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Auto-numbering:</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    autoNumbering ? styles.toggleButtonOn : styles.toggleButtonOff,
                  ]}
                  onPress={() => setAutoNumbering(!autoNumbering)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      { color: autoNumbering ? theme.colors.white : theme.colors.onSurface },
                    ]}
                  >
                    {autoNumbering ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Number Prefix */}
              {autoNumbering && (
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>Number Prefix:</Text>
                  <TextInput
                    style={styles.prefixInput}
                    value={numberPrefix}
                    onChangeText={setNumberPrefix}
                    placeholder="T-"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              )}
            </View>

            {/* Preview */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Preview</Text>
              <View style={styles.previewSection}>
                <View
                  style={[styles.previewCard, { borderLeftColor: getThemeColor(selectedColor) }]}
                >
                  <View style={styles.previewHeader}>
                    <Icon
                      name={selectedIcon}
                      size={24}
                      color={getThemeColor(selectedColor)}
                      accessibilityLabel="Section icon"
                    />
                    <Text style={styles.previewTitle}>{name || 'SECTION NAME'}</Text>
                  </View>
                  <Text style={styles.previewStats}>Tables: 0 | Capacity: 0 | Available: 0</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <AppleButton
              title="Cancel"
              variant="secondary"
              size="medium"
              icon={
                <Icon
                  name="cancel-outline"
                  size={18}
                  color={theme.colors.onSurface}
                  accessibilityLabel="Cancel"
                />
              }
              iconPosition="left"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <AppleButton
              title="Add Section"
              variant="success"
              size="medium"
              icon={
                <Icon
                  name="check-circle"
                  size={18}
                  color={theme.colors.white}
                  accessibilityLabel="Add"
                />
              }
              iconPosition="left"
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
