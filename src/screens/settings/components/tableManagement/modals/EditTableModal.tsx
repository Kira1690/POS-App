/**
 * Edit Table Modal
 * Complete implementation with ALL wireframe features
 * Phase 2 - Complete Modal System
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  isValidTableNumber,
  isTableNumberUnique,
  isValidCapacity,
} from '@/data/tables';

interface EditTableModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tableId: string, updates: Partial<MockTable>) => void;
  onDelete: (tableId: string) => void;
  onChangeReservation: (tableId: string) => void;
  onViewHistory: (tableId: string) => void;
  tableId: string;
}

type TableShape = 'square' | 'round' | 'rectangle';

export const EditTableModal: React.FC<EditTableModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  onChangeReservation,
  onViewHistory,
  tableId,
}) => {
  const { theme } = useTheme();

  // Find the table being edited
  const table = useMemo(
    () => MOCK_TABLES.find((t) => t.id === tableId),
    [tableId]
  );

  // Form state (initialized from table data)
  const [tableNumber, setTableNumber] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(4);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedShape, setSelectedShape] = useState<TableShape>('round');
  const [notes, setNotes] = useState<string>('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // Error state
  const [errors, setErrors] = useState<{
    tableNumber?: string;
    capacity?: string;
    area?: string;
  }>({});

  // Initialize form with table data when modal opens
  useEffect(() => {
    if (table && visible) {
      setTableNumber(table.number);
      setCapacity(table.capacity);
      setSelectedAreaId(table.areaId || MOCK_AREAS[0]?.id || '');
      setSelectedShape((table.shape as TableShape) || 'round');
      setNotes(table.notes || '');
      setErrors({});
    }
  }, [table, visible]);

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
    } else if (tableNumber !== table?.number && !isTableNumberUnique(MOCK_TABLES, tableNumber)) {
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
    if (!validateForm() || !table) return;

    const updates: Partial<MockTable> = {
      number: tableNumber,
      capacity,
      areaId: selectedAreaId,
      area: selectedArea?.name || '',
      shape: selectedShape,
      notes,
    };

    onSave(tableId, updates);
    onClose();
  };

  // Handle delete
  const handleDelete = () => {
    onDelete(tableId);
    onClose();
  };

  // Get status color
  const getStatusColor = (status: TableStatus): string => {
    switch (status) {
      case 'available':
        return theme.colors.success;
      case 'occupied':
        return theme.colors.error;
      case 'reserved':
        return theme.colors.warning;
      case 'cleaning':
        return theme.colors.info;
      default:
        return theme.colors.outline;
    }
  };

  // Get status label
  const getStatusLabel = (status: TableStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate character count for notes
  const notesLength = notes.length;
  const notesMaxLength = 200;

  if (!table) return null;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
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
    dropdown: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56,
    },
    dropdownText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    dropdownList: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      maxHeight: 200,
      zIndex: 1000,
      elevation: 5,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    dropdownItem: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    dropdownItemText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    shapeSelector: {
      flexDirection: 'column',
      gap: spacing.sm,
    },
    shapeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
    },
    shapeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    shapeOptionText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      marginLeft: spacing.sm,
    },
    statusSection: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      gap: spacing.sm,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    statusText: {
      ...typography.bodyMedium,
      fontWeight: '600',
    },
    statusDetail: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    actionButtonText: {
      ...typography.bodyMedium,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    positionSection: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      gap: spacing.sm,
    },
    positionText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    notesInput: {
      ...typography.bodyMedium,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.md,
      color: theme.colors.onSurface,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    characterCounter: {
      ...typography.bodySmall,
      color: notesLength > notesMaxLength ? theme.colors.error : theme.colors.onSurfaceVariant,
      textAlign: 'right',
      marginTop: spacing.xs,
    },
    historySection: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      gap: spacing.sm,
    },
    historyText: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
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
                name="table-furniture"
                size={24}
                color={theme.colors.onPrimary}
                accessibilityLabel="Edit table"
              />
              <Text style={styles.headerTitle}>Edit Table {table.number}</Text>
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
            <Text style={styles.sectionTitle}>Table Information</Text>

            {/* Table Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Table Number <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.tableNumber && styles.inputError]}
                value={tableNumber}
                onChangeText={setTableNumber}
                placeholder="e.g., T-1"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              {errors.tableNumber && (
                <Text style={styles.errorText}>{errors.tableNumber}</Text>
              )}
            </View>

            {/* Seating Capacity */}
            <View style={styles.fieldGroup}>
              <CapacityStepper
                value={capacity}
                onChange={setCapacity}
                min={1}
                max={20}
                label="Seating Capacity *"
                error={errors.capacity}
              />
            </View>

            {/* Area/Section */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Area/Section <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowAreaDropdown(!showAreaDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {selectedArea?.name || 'Select Area'}
                </Text>
                <Icon
                  name="chevron-down"
                  size={20}
                  color={theme.colors.onSurface}
                  accessibilityLabel="Dropdown"
                />
              </TouchableOpacity>
              {showAreaDropdown && (
                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                  {MOCK_AREAS.map((area) => (
                    <TouchableOpacity
                      key={area.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedAreaId(area.id);
                        setShowAreaDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{area.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
            </View>

            {/* Table Shape */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Table Shape</Text>
              <View style={styles.shapeSelector}>
                <TouchableOpacity
                  style={[
                    styles.shapeOption,
                    selectedShape === 'square' && styles.shapeOptionSelected,
                  ]}
                  onPress={() => setSelectedShape('square')}
                >
                  <Icon
                    name="square-outline"
                    size={20}
                    color={
                      selectedShape === 'square' ? theme.colors.primary : theme.colors.onSurface
                    }
                    accessibilityLabel="Square"
                  />
                  <Text style={styles.shapeOptionText}>Square</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.shapeOption,
                    selectedShape === 'round' && styles.shapeOptionSelected,
                  ]}
                  onPress={() => setSelectedShape('round')}
                >
                  <Icon
                    name="circle-outline"
                    size={20}
                    color={
                      selectedShape === 'round' ? theme.colors.primary : theme.colors.onSurface
                    }
                    accessibilityLabel="Round"
                  />
                  <Text style={styles.shapeOptionText}>Round</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.shapeOption,
                    selectedShape === 'rectangle' && styles.shapeOptionSelected,
                  ]}
                  onPress={() => setSelectedShape('rectangle')}
                >
                  <Icon
                    name="rectangle-outline"
                    size={20}
                    color={
                      selectedShape === 'rectangle' ? theme.colors.primary : theme.colors.onSurface
                    }
                    accessibilityLabel="Rectangle"
                  />
                  <Text style={styles.shapeOptionText}>Rectangle</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Status */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Current Status</Text>
              <View style={styles.statusSection}>
                <View style={styles.statusRow}>
                  <Icon
                    name="circle"
                    size={16}
                    color={getStatusColor(table.status)}
                    accessibilityLabel={`Status ${table.status}`}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(table.status) }]}>
                    {getStatusLabel(table.status)}
                  </Text>
                </View>
                {table.status === 'reserved' && (
                  <>
                    <Text style={styles.statusDetail}>Reserved until: 7:30 PM</Text>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onChangeReservation(tableId)}
                    >
                      <Icon
                        name="calendar-clock"
                        size={18}
                        color={theme.colors.primary}
                        accessibilityLabel="Change reservation"
                      />
                      <Text style={styles.actionButtonText}>Change Reservation</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Position */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Position</Text>
              <View style={styles.positionSection}>
                <Text style={styles.positionText}>
                  X: {table.positionX ?? 0}, Y: {table.positionY ?? 0}
                </Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => { /* TODO: Adjust position */ }}>
                  <Icon
                    name="cursor-move"
                    size={18}
                    color={theme.colors.primary}
                    accessibilityLabel="Adjust position"
                  />
                  <Text style={styles.actionButtonText}>Adjust Position on Floor Plan</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about this table..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                maxLength={notesMaxLength}
              />
              <Text style={styles.characterCounter}>
                {notesLength}/{notesMaxLength}
              </Text>
            </View>

            {/* Table History */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Table History</Text>
              <View style={styles.historySection}>
                <Text style={styles.historyText}>Last cleaned: Today at 2:15 PM</Text>
                <Text style={styles.historyText}>
                  Last used: Today at 1:45 PM (85 min duration)
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onViewHistory(tableId)}
                >
                  <Icon
                    name="history"
                    size={18}
                    color={theme.colors.primary}
                    accessibilityLabel="View history"
                  />
                  <Text style={styles.actionButtonText}>View Full History</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <AppleButton
              title="Delete"
              variant="destructive"
              size="medium"
              icon={
                <Icon
                  name="delete"
                  size={18}
                  color={theme.colors.white}
                  accessibilityLabel="Delete"
                />
              }
              iconPosition="left"
              onPress={handleDelete}
              style={{ flex: 1 }}
            />
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
              title="Save"
              variant="success"
              size="medium"
              icon={
                <Icon name="check" size={18} color={theme.colors.white} accessibilityLabel="Save" />
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
