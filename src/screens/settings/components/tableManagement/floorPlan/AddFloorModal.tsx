/**
 * AddFloorModal Component
 * Modal for creating a new floor in the floor plan
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { AppleButton, AppleCard } from '@/components/apple';

interface AddFloorModalProps {
  visible: boolean;
  onConfirm: (config: NewFloorConfig) => void;
  onCancel: () => void;
}

export interface NewFloorConfig {
  name: string;
  canvas_width: number;
  canvas_height: number;
  grid_size: number;
}

interface SizePreset {
  label: string;
  width: number;
  height: number;
  icon: string;
}

const SIZE_PRESETS: SizePreset[] = [
  { label: 'Small', width: 800, height: 600, icon: 'view-grid-outline' },
  { label: 'Medium', width: 1200, height: 800, icon: 'view-grid' },
  { label: 'Large', width: 1600, height: 1000, icon: 'view-grid-plus' },
  { label: 'Custom', width: 0, height: 0, icon: 'pencil-ruler' },
];

const GRID_SIZE_OPTIONS = [25, 50, 75, 100];

const AddFloorModal: React.FC<AddFloorModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  // Form state
  const [floorName, setFloorName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('Medium');
  const [customWidth, setCustomWidth] = useState('1200');
  const [customHeight, setCustomHeight] = useState('800');
  const [gridSize, setGridSize] = useState(50);
  const [nameError, setNameError] = useState('');

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      setFloorName('');
      setSelectedPreset('Medium');
      setCustomWidth('1200');
      setCustomHeight('800');
      setGridSize(50);
      setNameError('');
    }
  }, [visible]);

  const handlePresetSelect = useCallback((preset: SizePreset) => {
    setSelectedPreset(preset.label);
    if (preset.label !== 'Custom') {
      setCustomWidth(preset.width.toString());
      setCustomHeight(preset.height.toString());
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!floorName.trim()) {
      setNameError('Floor name is required');
      return false;
    }
    if (floorName.trim().length < 2) {
      setNameError('Floor name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  }, [floorName]);

  const handleConfirm = useCallback(() => {
    if (!validateForm()) return;

    const width = parseInt(customWidth, 10) || 1200;
    const height = parseInt(customHeight, 10) || 800;

    const config: NewFloorConfig = {
      name: floorName.trim(),
      canvas_width: Math.max(400, Math.min(2000, width)),
      canvas_height: Math.max(300, Math.min(1500, height)),
      grid_size: gridSize,
    };

    onConfirm(config);
  }, [floorName, customWidth, customHeight, gridSize, validateForm, onConfirm]);

  const handleCancel = useCallback(() => {
    setFloorName('');
    setNameError('');
    onCancel();
  }, [onCancel]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyboardAvoidingView: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 550,
    },
    modalContent: {
      width: '100%',
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.titleLarge,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: spacing.xs,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.labelLarge,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      ...typography.labelSmall,
      color: theme.colors.error,
      marginTop: spacing.xs,
    },
    presetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    presetOption: {
      flex: 1,
      minWidth: 90,
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    presetOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    presetLabel: {
      ...typography.labelMedium,
      color: theme.colors.onSurface,
      marginTop: spacing.xs,
    },
    presetLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    presetSize: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    dimensionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    dimensionInput: {
      flex: 1,
    },
    dimensionLabel: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.xs,
    },
    gridOptions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    gridOption: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    gridOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    gridText: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    gridTextSelected: {
      color: theme.colors.primary,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    actionButton: {
      flex: 1,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      marginBottom: spacing.lg,
    },
    infoText: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); handleCancel(); }}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.modalContainer}>
                <AppleCard layer="surface" size="large" style={styles.modalContent}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={styles.title}>Add New Floor</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleCancel}
                      accessibilityLabel="Close modal"
                    >
                      <Icon
                        name="close"
                        size={24}
                        color={theme.colors.onSurface}
                        accessibilityLabel="Close"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Info Box */}
                  <View style={styles.infoBox}>
                    <Icon
                      name="information-outline"
                      size={20}
                      color={theme.colors.primary}
                      accessibilityLabel="Info"
                    />
                    <Text style={styles.infoText}>
                      Create a new floor to organize your restaurant layout. Each floor has its own canvas for tables and zones.
                    </Text>
                  </View>

                  {/* Floor Name */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Floor Name</Text>
                    <TextInput
                      style={[styles.input, nameError ? styles.inputError : null]}
                      value={floorName}
                      onChangeText={(text) => {
                        setFloorName(text);
                        if (nameError) setNameError('');
                      }}
                      placeholder="e.g., Main Floor, Patio, 2nd Floor"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      accessibilityLabel="Floor name input"
                      autoFocus
                    />
                    {nameError ? (
                      <Text style={styles.errorText}>{nameError}</Text>
                    ) : null}
                  </View>

                  {/* Size Presets */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Canvas Size</Text>
                    <View style={styles.presetGrid}>
                      {SIZE_PRESETS.map((preset) => {
                        const isSelected = selectedPreset === preset.label;
                        return (
                          <TouchableOpacity
                            key={preset.label}
                            style={[
                              styles.presetOption,
                              isSelected && styles.presetOptionSelected,
                            ]}
                            onPress={() => handlePresetSelect(preset)}
                            accessibilityLabel={`${preset.label} size preset`}
                            accessibilityState={{ selected: isSelected }}
                          >
                            <Icon
                              name={preset.icon}
                              size={24}
                              color={isSelected ? theme.colors.primary : theme.colors.onSurface}
                              accessibilityLabel={preset.label}
                            />
                            <Text
                              style={[
                                styles.presetLabel,
                                isSelected && styles.presetLabelSelected,
                              ]}
                            >
                              {preset.label}
                            </Text>
                            {preset.label !== 'Custom' && (
                              <Text style={styles.presetSize}>
                                {preset.width}x{preset.height}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Custom Dimensions (only shown when Custom is selected) */}
                  {selectedPreset === 'Custom' && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Custom Dimensions</Text>
                      <View style={styles.dimensionsRow}>
                        <View style={styles.dimensionInput}>
                          <Text style={styles.dimensionLabel}>Width (px)</Text>
                          <TextInput
                            style={styles.input}
                            value={customWidth}
                            onChangeText={setCustomWidth}
                            keyboardType="numeric"
                            placeholder="1200"
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            accessibilityLabel="Canvas width"
                          />
                        </View>
                        <View style={styles.dimensionInput}>
                          <Text style={styles.dimensionLabel}>Height (px)</Text>
                          <TextInput
                            style={styles.input}
                            value={customHeight}
                            onChangeText={setCustomHeight}
                            keyboardType="numeric"
                            placeholder="800"
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            accessibilityLabel="Canvas height"
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Grid Size */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Grid Size</Text>
                    <View style={styles.gridOptions}>
                      {GRID_SIZE_OPTIONS.map((size) => {
                        const isSelected = gridSize === size;
                        return (
                          <TouchableOpacity
                            key={size}
                            style={[
                              styles.gridOption,
                              isSelected && styles.gridOptionSelected,
                            ]}
                            onPress={() => setGridSize(size)}
                            accessibilityLabel={`${size}px grid size`}
                            accessibilityState={{ selected: isSelected }}
                          >
                            <Text
                              style={[
                                styles.gridText,
                                isSelected && styles.gridTextSelected,
                              ]}
                            >
                              {size}px
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <AppleButton
                      title="Cancel"
                      variant="secondary"
                      size="medium"
                      onPress={handleCancel}
                      style={styles.actionButton}
                    />
                    <AppleButton
                      title="Create Floor"
                      variant="primary"
                      size="medium"
                      icon={
                        <Icon
                          name="plus"
                          size={18}
                          color={theme.colors.onPrimary}
                          accessibilityLabel="Create"
                        />
                      }
                      iconPosition="left"
                      onPress={handleConfirm}
                      style={styles.actionButton}
                    />
                  </View>
                  </ScrollView>
                </AppleCard>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(AddFloorModal);
