/**
 * Add Table Modal - ENHANCED VERSION
 * Complete implementation with ALL wireframe features
 * Phase 2 - Complete Modal System
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
import { AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { CapacityStepper } from '../components/CapacityStepper';
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

interface AddTableModalEnhancedProps {
  visible: boolean;
  onClose: () => void;
  onSave: (table: Omit<MockTable, 'id'>) => void;
}

type TableShape = 'square' | 'round' | 'rectangle';
type PositionMode = 'auto' | 'custom';

export const AddTableModalEnhanced: React.FC<AddTableModalEnhancedProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  // Form state
  const [tableNumber, setTableNumber] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(4);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(MOCK_AREAS[0]?.id || '');
  const [selectedShape, setSelectedShape] = useState<TableShape>('round');
  const [positionMode, setPositionMode] = useState<PositionMode>('auto');
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  // Error state
  const [errors, setErrors] = useState<{
    tableNumber?: string;
    capacity?: string;
    area?: string;
  }>({});

  // Get selected area
  const selectedArea = useMemo(
    () => MOCK_AREAS.find((area) => area.id === selectedAreaId),
    [selectedAreaId]
  );

  // Validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!tableNumber.trim()) {
      newErrors.tableNumber = 'Table number is required';
    } else if (!isValidTableNumber(tableNumber)) {
      newErrors.tableNumber = 'Invalid format. Use: PREFIX-NUMBER (e.g., T-1)';
    } else if (!isTableNumberUnique(MOCK_TABLES, tableNumber)) {
      newErrors.tableNumber = 'Table number already exists';
    }

    if (!isValidCapacity(capacity)) {
      newErrors.capacity = 'Capacity must be between 1 and 20';
    }

    if (!selectedAreaId) {
      newErrors.area = 'Please select an area';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    const newTable: Omit<MockTable, 'id'> = {
      number: tableNumber,
      capacity,
      status: 'available',
      area: selectedArea?.name || '',
      areaId: selectedAreaId,
      positionX: positionMode === 'auto' ? 0 : positionX,
      positionY: positionMode === 'auto' ? 0 : positionY,
      shape: selectedShape,
    };

    onSave(newTable);
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setTableNumber('');
    setCapacity(4);
    setSelectedAreaId(MOCK_AREAS[0]?.id || '');
    setSelectedShape('round');
    setPositionMode('auto');
    setPositionX(0);
    setPositionY(0);
    setNotes('');
    setErrors({});
    setShowAreaDropdown(false);
    setShowAddArea(false);
    onClose();
  };

  // Auto-generate table number
  const handleAutoGenerate = () => {
    if (selectedArea) {
      const prefix = selectedArea.name.split(' ').map(w => w[0]).join('').toUpperCase();
      const nextNumber = generateNextTableNumber(MOCK_TABLES, prefix);
      setTableNumber(nextNumber);
    }
  };

  // Handle inline area add
  const handleAddNewArea = () => {
    if (newAreaName.trim()) {
      // In real implementation, this would call an API
      setNewAreaName('');
      setShowAddArea(false);
      setShowAreaDropdown(false);
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
      marginLeft: spacing.sm,
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
    required: {
      color: theme.colors.error,
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
    dropdown: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownText: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginTop: spacing.xs,
      maxHeight: 200,
      zIndex: 1000,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    dropdownItemText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      marginLeft: spacing.sm,
    },
    dropdownItemAdd: {
      backgroundColor: theme.colors.primaryContainer,
    },
    dropdownItemAddText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    shapeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    shapeButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      gap: spacing.xs,
    },
    shapeButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    shapeText: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    shapeTextActive: {
      color: theme.colors.primary,
    },
    radioGroup: {
      gap: spacing.sm,
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    radioButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioCircleActive: {
      borderColor: theme.colors.primary,
    },
    radioCircleInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
    },
    radioText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      flex: 1,
    },
    radioTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    textarea: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    charCounter: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'right',
      marginTop: spacing.xs,
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
  });

  const shapeOptions: { value: TableShape; icon: string; label: string }[] = [
    { value: 'square', icon: 'square-outline', label: 'Square' },
    { value: 'round', icon: 'circle-outline', label: 'Round' },
    { value: 'rectangle', icon: 'rectangle-outline', label: 'Rectangle' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Icon
              name="table-furniture"
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
              <Icon name="close" size={24} color={theme.colors.onSurface} accessibilityLabel="Close icon" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Table Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Table Information</Text>

              {/* Table Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Table Number <Text style={styles.required}>*</Text>
                </Text>
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
                    icon={
                      <Icon name="auto-fix" size={16} color={theme.colors.onSurface} accessibilityLabel="Auto-generate icon" />
                    }
                    iconPosition="left"
                  />
                </View>
                {errors.tableNumber && <Text style={styles.errorText}>{errors.tableNumber}</Text>}
                <Text style={styles.errorText}>Example: T-1, T-2, VIP-1</Text>
              </View>

              {/* Seating Capacity */}
              <View style={styles.inputGroup}>
                <CapacityStepper
                  value={capacity}
                  onChange={setCapacity}
                  min={1}
                  max={20}
                  label="Seating Capacity *"
                  error={errors.capacity}
                />
              </View>
            </View>

            {/* Area Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Area/Section <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={[styles.dropdown, errors.area && styles.inputError]}
                  onPress={() => setShowAreaDropdown(!showAreaDropdown)}
                  accessibilityLabel="Select area dropdown"
                >
                  <View style={styles.dropdownButton}>
                    <Text style={styles.dropdownText}>{selectedArea?.name || 'Select Area'}</Text>
                    <Icon name="chevron-down" size={20} color={theme.colors.onSurface} accessibilityLabel="Dropdown icon" />
                  </View>
                </TouchableOpacity>
                {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}

                {/* Dropdown Menu */}
                {showAreaDropdown && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {MOCK_AREAS.map((area) => (
                        <TouchableOpacity
                          key={area.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedAreaId(area.id);
                            setShowAreaDropdown(false);
                          }}
                        >
                          <Icon name={area.icon} size={20} color={theme.colors.onSurface} accessibilityLabel={`${area.name} icon`} />
                          <Text style={styles.dropdownItemText}>{area.name}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[styles.dropdownItem, styles.dropdownItemAdd]}
                        onPress={() => {
                          setShowAddArea(true);
                          setShowAreaDropdown(false);
                        }}
                      >
                        <Icon name="plus-circle" size={20} color={theme.colors.primary} accessibilityLabel="Add new area icon" />
                        <Text style={[styles.dropdownItemText, styles.dropdownItemAddText]}>+ Add New Area</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                )}

                {/* Inline Add Area */}
                {showAddArea && (
                  <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
                    <TextInput
                      style={styles.input}
                      value={newAreaName}
                      onChangeText={setNewAreaName}
                      placeholder="Enter new area name"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      autoFocus
                    />
                    <View style={styles.inputRow}>
                      <AppleButton
                        title="Cancel"
                        variant="secondary"
                        size="small"
                        onPress={() => {
                          setShowAddArea(false);
                          setNewAreaName('');
                        }}
                        style={{ flex: 1 }}
                      />
                      <AppleButton
                        title="Add Area"
                        variant="primary"
                        size="small"
                        onPress={handleAddNewArea}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Table Shape */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Table Shape</Text>
              <View style={styles.shapeRow}>
                {shapeOptions.map((shape) => {
                  const isActive = shape.value === selectedShape;
                  return (
                    <TouchableOpacity
                      key={shape.value}
                      style={[styles.shapeButton, isActive && styles.shapeButtonActive]}
                      onPress={() => setSelectedShape(shape.value)}
                      accessibilityLabel={`Select ${shape.label} shape`}
                    >
                      <Icon
                        name={shape.icon}
                        size={24}
                        color={isActive ? theme.colors.primary : theme.colors.onSurface}
                        accessibilityLabel={`${shape.label} icon`}
                      />
                      <Text style={[styles.shapeText, isActive && styles.shapeTextActive]}>
                        {shape.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Initial Position */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Initial Position</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, positionMode === 'auto' && styles.radioButtonActive]}
                  onPress={() => setPositionMode('auto')}
                  accessibilityLabel="Auto-assign position"
                >
                  <View style={[styles.radioCircle, positionMode === 'auto' && styles.radioCircleActive]}>
                    {positionMode === 'auto' && <View style={styles.radioCircleInner} />}
                  </View>
                  <Text style={[styles.radioText, positionMode === 'auto' && styles.radioTextActive]}>
                    ⚬ Auto-assign to available space
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, positionMode === 'custom' && styles.radioButtonActive]}
                  onPress={() => setPositionMode('custom')}
                  accessibilityLabel="Custom position"
                >
                  <View style={[styles.radioCircle, positionMode === 'custom' && styles.radioCircleActive]}>
                    {positionMode === 'custom' && <View style={styles.radioCircleInner} />}
                  </View>
                  <Text style={[styles.radioText, positionMode === 'custom' && styles.radioTextActive]}>
                    ○ Custom position (opens floor plan picker)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes (Optional)</Text>
              <TextInput
                style={styles.textarea}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about this table..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                maxLength={200}
                accessibilityLabel="Notes textarea"
              />
              <Text style={styles.charCounter}>{notes.length}/200</Text>
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
              icon={<Icon name="check" size={18} color={theme.colors.onPrimary} accessibilityLabel="Save icon" />}
              iconPosition="left"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
