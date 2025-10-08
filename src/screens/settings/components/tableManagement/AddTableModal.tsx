/**
 * Add Table Modal Component
 * Modal for adding new tables to the system
 * Following SOLID principles and theme system
 */

import React, { useState, useMemo } from 'react';
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
import { AppleCard, AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import {
  MOCK_TABLES,
  MOCK_AREAS,
  MockTable,
  TableStatus,
  generateNextTableNumber,
  isValidTableNumber,
  isTableNumberUnique,
  isValidCapacity,
} from '@/data/tables';

interface AddTableModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (table: Omit<MockTable, 'id'>) => void;
}

type TableShape = 'square' | 'round' | 'rectangle';

const AddTableModal: React.FC<AddTableModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  // Form state
  const [tableNumber, setTableNumber] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('4');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(
    MOCK_AREAS[0]?.id || ''
  );
  const [positionX, setPositionX] = useState<string>('0');
  const [positionY, setPositionY] = useState<string>('0');
  const [selectedShape, setSelectedShape] = useState<TableShape>('square');
  const [status, setStatus] = useState<TableStatus>('available');

  // Error state
  const [errors, setErrors] = useState<{
    tableNumber?: string;
    capacity?: string;
    area?: string;
  }>({});

  // Get selected area details
  const selectedArea = useMemo(
    () => MOCK_AREAS.find((area) => area.id === selectedAreaId),
    [selectedAreaId]
  );

  // Validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate table number
    if (!tableNumber.trim()) {
      newErrors.tableNumber = 'Table number is required';
    } else if (!isValidTableNumber(tableNumber)) {
      newErrors.tableNumber = 'Invalid format. Use: PREFIX-NUMBER (e.g., T-1)';
    } else if (!isTableNumberUnique(MOCK_TABLES, tableNumber)) {
      newErrors.tableNumber = 'Table number already exists';
    }

    // Validate capacity
    const capacityNum = parseInt(capacity, 10);
    if (!capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    } else if (!isValidCapacity(capacityNum)) {
      newErrors.capacity = 'Capacity must be between 1 and 20';
    }

    // Validate area
    if (!selectedAreaId) {
      newErrors.area = 'Please select an area';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const newTable: Omit<MockTable, 'id'> = {
      number: tableNumber,
      capacity: parseInt(capacity, 10),
      status,
      area: selectedArea?.name || '',
      areaId: selectedAreaId,
      positionX: parseInt(positionX, 10) || 0,
      positionY: parseInt(positionY, 10) || 0,
      shape: selectedShape,
    };

    onSave(newTable);
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    // Reset form
    setTableNumber('');
    setCapacity('4');
    setSelectedAreaId(MOCK_AREAS[0]?.id || '');
    setPositionX('0');
    setPositionY('0');
    setSelectedShape('square');
    setStatus('available');
    setErrors({});
    onClose();
  };

  // Auto-generate table number
  const handleAutoGenerate = () => {
    if (selectedArea) {
      const prefix = selectedArea.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase();
      const nextNumber = generateNextTableNumber(MOCK_TABLES, prefix);
      setTableNumber(nextNumber);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.backdrop,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContainer: {
      width: '90%',
      maxWidth: 600,
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
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      ...typography.headlineSmall,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    closeButton: {
      padding: spacing.sm,
    },
    content: {
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.titleMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: spacing.sm,
    },
    inputGroup: {
      marginBottom: spacing.md,
    },
    label: {
      ...typography.bodyMedium,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: spacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      ...typography.bodySmall,
      color: theme.colors.error,
      marginTop: spacing.xs,
    },
    generateButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    optionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    optionButton: {
      flex: 1,
      minWidth: 100,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    optionText: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    optionTextActive: {
      color: theme.colors.primary,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    footerButton: {
      flex: 1,
    },
    areaOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      marginBottom: spacing.sm,
    },
    areaOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    areaOptionContent: {
      flex: 1,
    },
    areaOptionName: {
      ...typography.bodyLarge,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    areaOptionNameActive: {
      color: theme.colors.primary,
    },
    areaOptionDesc: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
  });

  const shapeOptions: TableShape[] = ['square', 'round', 'rectangle'];
  const statusOptions: { value: TableStatus; label: string; icon: string }[] = [
    { value: 'available', label: 'Available', icon: 'check-circle' },
    { value: 'occupied', label: 'Occupied', icon: 'account-group' },
    { value: 'reserved', label: 'Reserved', icon: 'bookmark' },
    { value: 'cleaning', label: 'Cleaning', icon: 'broom' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Icon
              name="plus-circle"
              size={24}
              color={theme.colors.primary}
              accessibilityLabel="Add table icon"
            />
            <Text style={styles.headerTitle}>Add New Table</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <Icon
                name="close"
                size={24}
                color={theme.colors.onSurface}
                accessibilityLabel="Close icon"
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Table Number */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Table Number *</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, errors.tableNumber && styles.inputError]}
                    value={tableNumber}
                    onChangeText={setTableNumber}
                    placeholder="e.g., T-1, VIP-1"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    accessibilityLabel="Table number input"
                  />
                  <AppleButton
                    title="Auto"
                    variant="secondary"
                    size="small"
                    onPress={handleAutoGenerate}
                    style={styles.generateButton}
                    icon={
                      <Icon
                        name="auto-fix"
                        size={16}
                        color={theme.colors.onSurface}
                        accessibilityLabel="Auto-generate icon"
                      />
                    }
                    iconPosition="left"
                  />
                </View>
                {errors.tableNumber && (
                  <Text style={styles.errorText}>{errors.tableNumber}</Text>
                )}
              </View>

              {/* Capacity */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Capacity (Seats) *</Text>
                <TextInput
                  style={[styles.input, errors.capacity && styles.inputError]}
                  value={capacity}
                  onChangeText={setCapacity}
                  placeholder="Number of seats (1-20)"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  keyboardType="number-pad"
                  accessibilityLabel="Capacity input"
                />
                {errors.capacity && (
                  <Text style={styles.errorText}>{errors.capacity}</Text>
                )}
              </View>
            </View>

            {/* Area Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Area Selection *</Text>
              {MOCK_AREAS.map((area) => {
                const isActive = area.id === selectedAreaId;
                return (
                  <TouchableOpacity
                    key={area.id}
                    style={[
                      styles.areaOption,
                      isActive && styles.areaOptionActive,
                    ]}
                    onPress={() => setSelectedAreaId(area.id)}
                    accessibilityLabel={`Select ${area.name} area`}
                  >
                    <Icon
                      name={area.icon}
                      size={24}
                      color={
                        isActive ? theme.colors.primary : theme.colors.onSurface
                      }
                      accessibilityLabel={`${area.name} icon`}
                    />
                    <View style={styles.areaOptionContent}>
                      <Text
                        style={[
                          styles.areaOptionName,
                          isActive && styles.areaOptionNameActive,
                        ]}
                      >
                        {area.name}
                      </Text>
                      <Text style={styles.areaOptionDesc}>
                        {area.description}
                      </Text>
                    </View>
                    {isActive && (
                      <Icon
                        name="check"
                        size={24}
                        color={theme.colors.primary}
                        accessibilityLabel="Selected checkmark"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              {errors.area && (
                <Text style={styles.errorText}>{errors.area}</Text>
              )}
            </View>

            {/* Table Shape */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Table Shape</Text>
              <View style={styles.optionRow}>
                {shapeOptions.map((shape) => {
                  const isActive = shape === selectedShape;
                  return (
                    <TouchableOpacity
                      key={shape}
                      style={[
                        styles.optionButton,
                        isActive && styles.optionButtonActive,
                      ]}
                      onPress={() => setSelectedShape(shape)}
                      accessibilityLabel={`Select ${shape} shape`}
                    >
                      <Icon
                        name={
                          shape === 'square'
                            ? 'square'
                            : shape === 'round'
                            ? 'circle'
                            : 'rectangle'
                        }
                        size={24}
                        color={
                          isActive
                            ? theme.colors.primary
                            : theme.colors.onSurface
                        }
                        accessibilityLabel={`${shape} shape icon`}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          isActive && styles.optionTextActive,
                        ]}
                      >
                        {shape.charAt(0).toUpperCase() + shape.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Initial Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Initial Status</Text>
              <View style={styles.optionRow}>
                {statusOptions.map((option) => {
                  const isActive = option.value === status;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        isActive && styles.optionButtonActive,
                      ]}
                      onPress={() => setStatus(option.value)}
                      accessibilityLabel={`Set status to ${option.label}`}
                    >
                      <Icon
                        name={option.icon}
                        size={20}
                        color={
                          isActive
                            ? theme.colors.primary
                            : theme.colors.onSurface
                        }
                        accessibilityLabel={`${option.label} icon`}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          isActive && styles.optionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Floor Plan Position */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Floor Plan Position</Text>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>X Position</Text>
                  <TextInput
                    style={styles.input}
                    value={positionX}
                    onChangeText={setPositionX}
                    placeholder="0"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    keyboardType="number-pad"
                    accessibilityLabel="X position input"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Y Position</Text>
                  <TextInput
                    style={styles.input}
                    value={positionY}
                    onChangeText={setPositionY}
                    placeholder="0"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    keyboardType="number-pad"
                    accessibilityLabel="Y position input"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <AppleButton
              title="Cancel"
              variant="secondary"
              size="large"
              onPress={handleClose}
              style={styles.footerButton}
            />
            <AppleButton
              title="Add Table"
              variant="primary"
              size="large"
              onPress={handleSave}
              style={styles.footerButton}
              icon={
                <Icon
                  name="check"
                  size={18}
                  color={theme.colors.onPrimary}
                  accessibilityLabel="Save icon"
                />
              }
              iconPosition="left"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddTableModal;
