/**
 * AddTableModal Component
 * Modal for configuring a new table when adding to the floor plan
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
  Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { AppleButton, AppleCard } from '@/components/apple';
import { TableShape, TableSize } from '@/types/settings/table-management.types';

interface AddTableModalProps {
  visible: boolean;
  position: { x: number; y: number };
  floorId: string;
  onConfirm: (tableConfig: NewTableConfig) => void;
  onCancel: () => void;
}

export interface NewTableConfig {
  tableNumber: string;
  shape: TableShape;
  size: TableSize;
  capacity: number;
  floorId: string;
  x: number;
  y: number;
}

interface ShapeOption {
  value: TableShape;
  label: string;
  icon: string;
}

const SHAPE_OPTIONS: ShapeOption[] = [
  { value: TableShape.ROUND, label: 'Round', icon: 'circle-outline' },
  { value: TableShape.SQUARE, label: 'Square', icon: 'square-outline' },
  { value: TableShape.RECTANGLE, label: 'Rectangle', icon: 'rectangle-outline' },
  { value: TableShape.OVAL, label: 'Oval', icon: 'ellipse-outline' },
];

const CAPACITY_OPTIONS = [2, 4, 6, 8, 10, 12];

const AddTableModal: React.FC<AddTableModalProps> = ({
  visible,
  position,
  floorId,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  // Form state
  const [tableNumber, setTableNumber] = useState('');
  const [selectedShape, setSelectedShape] = useState<TableShape>(TableShape.ROUND);
  const [selectedCapacity, setSelectedCapacity] = useState(4);

  // Generate auto table number
  React.useEffect(() => {
    if (visible) {
      const timestamp = Date.now().toString().slice(-4);
      setTableNumber(`T-${timestamp}`);
    }
  }, [visible]);

  const handleConfirm = useCallback(() => {
    const config: NewTableConfig = {
      tableNumber: tableNumber.trim() || `T-${Date.now().toString().slice(-4)}`,
      shape: selectedShape,
      size: TableSize.MEDIUM,
      capacity: selectedCapacity,
      floorId,
      x: position.x,
      y: position.y,
    };
    onConfirm(config);
    // Reset form
    setTableNumber('');
    setSelectedShape(TableShape.ROUND);
    setSelectedCapacity(4);
  }, [tableNumber, selectedShape, selectedCapacity, floorId, position, onConfirm]);

  const handleCancel = useCallback(() => {
    setTableNumber('');
    setSelectedShape(TableShape.ROUND);
    setSelectedCapacity(4);
    onCancel();
  }, [onCancel]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
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
    shapeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    shapeOption: {
      flex: 1,
      minWidth: 80,
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    shapeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    shapeLabel: {
      ...typography.labelMedium,
      color: theme.colors.onSurface,
      marginTop: spacing.xs,
    },
    shapeLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    capacityGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    capacityOption: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    capacityOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    capacityText: {
      ...typography.titleMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    capacityTextSelected: {
      color: theme.colors.primary,
    },
    positionInfo: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    positionItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.sm as number,
    },
    positionLabel: {
      ...typography.labelMedium,
      color: theme.colors.onSurfaceVariant,
    },
    positionValue: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    actionButton: {
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
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <AppleCard layer="surface" size="large" style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Add New Table</Text>
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

              {/* Table Number */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Table Number</Text>
                <TextInput
                  style={styles.input}
                  value={tableNumber}
                  onChangeText={setTableNumber}
                  placeholder="e.g., T-1, VIP-1"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  accessibilityLabel="Table number input"
                />
              </View>

              {/* Shape Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Table Shape</Text>
                <View style={styles.shapeGrid}>
                  {SHAPE_OPTIONS.map((shape) => {
                    const isSelected = selectedShape === shape.value;
                    return (
                      <TouchableOpacity
                        key={shape.value}
                        style={[
                          styles.shapeOption,
                          isSelected && styles.shapeOptionSelected,
                        ]}
                        onPress={() => setSelectedShape(shape.value)}
                        accessibilityLabel={`${shape.label} table shape`}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Icon
                          name={shape.icon}
                          size={28}
                          color={isSelected ? theme.colors.primary : theme.colors.onSurface}
                          accessibilityLabel={shape.label}
                        />
                        <Text
                          style={[
                            styles.shapeLabel,
                            isSelected && styles.shapeLabelSelected,
                          ]}
                        >
                          {shape.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Capacity Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seating Capacity</Text>
                <View style={styles.capacityGrid}>
                  {CAPACITY_OPTIONS.map((capacity) => {
                    const isSelected = selectedCapacity === capacity;
                    return (
                      <TouchableOpacity
                        key={capacity}
                        style={[
                          styles.capacityOption,
                          isSelected && styles.capacityOptionSelected,
                        ]}
                        onPress={() => setSelectedCapacity(capacity)}
                        accessibilityLabel={`${capacity} seats`}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Text
                          style={[
                            styles.capacityText,
                            isSelected && styles.capacityTextSelected,
                          ]}
                        >
                          {capacity}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Position Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Position</Text>
                <View style={styles.positionInfo}>
                  <View style={styles.positionItem}>
                    <Text style={styles.positionLabel}>X:</Text>
                    <Text style={styles.positionValue}>{Math.round(position.x)}</Text>
                  </View>
                  <View style={styles.positionItem}>
                    <Text style={styles.positionLabel}>Y:</Text>
                    <Text style={styles.positionValue}>{Math.round(position.y)}</Text>
                  </View>
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
                  title="Add Table"
                  variant="primary"
                  size="medium"
                  icon={
                    <Icon
                      name="plus"
                      size={18}
                      color={theme.colors.onPrimary}
                      accessibilityLabel="Add"
                    />
                  }
                  iconPosition="left"
                  onPress={handleConfirm}
                  style={styles.actionButton}
                />
              </View>
            </ScrollView>
          </AppleCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default React.memo(AddTableModal);
