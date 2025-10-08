/**
 * Edit Area Modal
 * Edit existing dining areas/sections with statistics and bulk actions
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
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { MOCK_TABLES, MOCK_AREAS, MockTable, TableStatus } from '@/data/tables';

interface EditAreaModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (areaId: string, updates: AreaUpdates) => void;
  onDelete: (areaId: string) => void;
  onAddTable: (areaId: string) => void;
  onBulkAction: (areaId: string, action: BulkAction) => void;
  areaId: string;
}

export interface AreaUpdates {
  name: string;
  icon: string;
  color: string;
}

export type BulkAction = 'reset' | 'clear_reservations' | 'mark_cleaning';

// Icon options (same as AddAreaModal)
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

// Color options (same as AddAreaModal)
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

export const EditAreaModal: React.FC<EditAreaModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  onAddTable,
  onBulkAction,
  areaId,
}) => {
  const { theme } = useTheme();

  // Find the area being edited
  const area = useMemo(
    () => MOCK_AREAS.find((a) => a.id === areaId),
    [areaId]
  );

  // Get tables for this area
  const areaTables = useMemo(
    () => MOCK_TABLES.filter((t) => t.areaId === areaId),
    [areaId]
  );

  // Form state
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('silverware-fork-knife');
  const [selectedColor, setSelectedColor] = useState('success');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Error state
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // Initialize form with area data
  useEffect(() => {
    if (area && visible) {
      setName(area.name);
      setSelectedIcon(area.icon || 'silverware-fork-knife');
      setSelectedColor(area.color || 'success');
      setErrors({});
    }
  }, [area, visible]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalTables = areaTables.length;
    const totalCapacity = areaTables.reduce((sum, t) => sum + t.capacity, 0);
    const available = areaTables.filter((t) => t.status === 'available').length;
    const occupied = areaTables.filter((t) => t.status === 'occupied').length;
    const reserved = areaTables.filter((t) => t.status === 'reserved').length;
    const cleaning = areaTables.filter((t) => t.status === 'cleaning').length;

    return {
      totalTables,
      totalCapacity,
      available,
      occupied,
      reserved,
      cleaning,
    };
  }, [areaTables]);

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
    if (!validateForm() || !area) return;

    const updates: AreaUpdates = {
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
    };

    onSave(areaId, updates);
    onClose();
  };

  // Handle delete
  const handleDelete = () => {
    if (areaTables.length > 0) {
      Alert.alert(
        'Cannot Delete Section',
        `This section contains ${areaTables.length} table(s). Please remove or reassign all tables before deleting the section.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Section',
      `Are you sure you want to delete "${area?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(areaId);
            onClose();
          },
        },
      ]
    );
  };

  // Handle bulk actions
  const handleBulkAction = (action: BulkAction) => {
    let title = '';
    let message = '';

    switch (action) {
      case 'reset':
        title = 'Reset All Tables';
        message = `Reset all ${areaTables.length} tables in "${area?.name}" to Available status?`;
        break;
      case 'clear_reservations':
        title = 'Clear All Reservations';
        message = `Clear all reservations in "${area?.name}"? This will set reserved tables to Available.`;
        break;
      case 'mark_cleaning':
        title = 'Mark All as Cleaning';
        message = `Mark all ${areaTables.length} tables in "${area?.name}" as Cleaning?`;
        break;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => onBulkAction(areaId, action),
      },
    ]);
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

  // Get theme color
  const getThemeColor = (colorKey: string): string => {
    const colorOption = COLOR_OPTIONS.find((c) => c.key === colorKey);
    if (!colorOption) return theme.colors.primary;
    return (theme.colors as any)[colorOption.themeKey] || theme.colors.primary;
  };

  if (!area) return null;

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
    iconSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    iconDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    statisticsSection: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      gap: spacing.xs,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    statValue: {
      ...typography.bodyMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    tablesSection: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      maxHeight: 200,
    },
    tableItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    tableInfo: {
      flex: 1,
    },
    tableNumber: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    tableCapacity: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    tableStatus: {
      ...typography.bodySmall,
      fontWeight: '500',
    },
    addTableButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    addTableText: {
      ...typography.bodyMedium,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    bulkActionsSection: {
      gap: spacing.sm,
    },
    bulkActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    bulkActionText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
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
                name="map-marker"
                size={24}
                color={theme.colors.onPrimary}
                accessibilityLabel="Edit section"
              />
              <Text style={styles.headerTitle}>Edit Section: {area.name}</Text>
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
                placeholder="Section name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Icon Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Icon <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.iconSelector}
                onPress={() => setShowIconPicker(!showIconPicker)}
              >
                <View style={styles.iconDisplay}>
                  <Icon
                    name={selectedIcon}
                    size={24}
                    color={theme.colors.primary}
                    accessibilityLabel="Selected icon"
                  />
                  <Text style={styles.iconText}>
                    {ICON_OPTIONS.find((i) => i.name === selectedIcon)?.label}
                  </Text>
                </View>
                <Icon
                  name="chevron-down"
                  size={20}
                  color={theme.colors.onSurface}
                  accessibilityLabel="Change icon"
                />
              </TouchableOpacity>
            </View>

            {/* Color Display */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Color Indicator:</Text>
              <View style={styles.iconSelector}>
                <View style={styles.iconDisplay}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: getThemeColor(selectedColor),
                    }}
                  />
                  <Text style={styles.iconText}>
                    {COLOR_OPTIONS.find((c) => c.key === selectedColor)?.label}
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Statistics */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Current Statistics</Text>
              <View style={styles.statisticsSection}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Tables:</Text>
                  <Text style={styles.statValue}>{statistics.totalTables}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Capacity:</Text>
                  <Text style={styles.statValue}>{statistics.totalCapacity} seats</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Currently Available:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>
                    {statistics.available}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Currently Occupied:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.error }]}>
                    {statistics.occupied}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Reserved:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                    {statistics.reserved}
                  </Text>
                </View>
              </View>
            </View>

            {/* Assigned Tables */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Assigned Tables</Text>
              <ScrollView
                style={styles.tablesSection}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {areaTables.map((table) => (
                  <View key={table.id} style={styles.tableItem}>
                    <Icon
                      name="table-furniture"
                      size={20}
                      color={getStatusColor(table.status)}
                      accessibilityLabel="Table"
                    />
                    <View style={styles.tableInfo}>
                      <Text style={styles.tableNumber}>{table.number}</Text>
                      <Text style={styles.tableCapacity}>({table.capacity} seats)</Text>
                    </View>
                    <Text
                      style={[styles.tableStatus, { color: getStatusColor(table.status) }]}
                    >
                      {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addTableButton}
                  onPress={() => onAddTable(areaId)}
                >
                  <Icon
                    name="plus-circle"
                    size={20}
                    color={theme.colors.primary}
                    accessibilityLabel="Add table"
                  />
                  <Text style={styles.addTableText}>Add New Table to Section</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Bulk Actions */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bulk Actions</Text>
              <View style={styles.bulkActionsSection}>
                <TouchableOpacity
                  style={styles.bulkActionButton}
                  onPress={() => handleBulkAction('reset')}
                >
                  <Icon
                    name="table-refresh"
                    size={20}
                    color={theme.colors.info}
                    accessibilityLabel="Reset"
                  />
                  <Text style={styles.bulkActionText}>Reset All Tables</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bulkActionButton}
                  onPress={() => handleBulkAction('clear_reservations')}
                >
                  <Icon
                    name="table-remove"
                    size={20}
                    color={theme.colors.warning}
                    accessibilityLabel="Clear reservations"
                  />
                  <Text style={styles.bulkActionText}>Clear All Reservations</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bulkActionButton}
                  onPress={() => handleBulkAction('mark_cleaning')}
                >
                  <Icon
                    name="broom"
                    size={20}
                    color={theme.colors.success}
                    accessibilityLabel="Mark cleaning"
                  />
                  <Text style={styles.bulkActionText}>Mark All as Cleaning</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <AppleButton
              title="Delete"
              variant="danger"
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
