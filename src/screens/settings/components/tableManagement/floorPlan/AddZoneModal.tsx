/**
 * AddZoneModal Component
 * Modal for configuring a new zone when adding to the floor plan
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
  Switch,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { AppleButton, AppleCard } from '@/components/apple';
import { ZoneType, ZoneBounds } from '@/types/settings/table-management.types';

interface AddZoneModalProps {
  visible: boolean;
  bounds: ZoneBounds;
  floorId: string;
  onConfirm: (zoneConfig: NewZoneConfig) => void;
  onCancel: () => void;
}

export interface NewZoneConfig {
  name: string;
  type: ZoneType;
  bounds: ZoneBounds;
  floorId: string;
  isSeatingArea: boolean;
  icon: string;
}

interface ZoneTypeOption {
  value: ZoneType;
  label: string;
  icon: string;
  color: string;
}

const ZONE_TYPE_OPTIONS: ZoneTypeOption[] = [
  { value: 'kitchen', label: 'Kitchen', icon: 'chef-hat', color: 'outline' },
  { value: 'bar', label: 'Bar', icon: 'glass-cocktail', color: 'info' },
  { value: 'entrance', label: 'Entrance', icon: 'door-open', color: 'outline' },
  { value: 'vip', label: 'VIP', icon: 'crown', color: 'warning' },
  { value: 'outdoor', label: 'Outdoor', icon: 'umbrella', color: 'success' },
  { value: 'custom', label: 'Custom', icon: 'shape', color: 'primary' },
];

const AddZoneModal: React.FC<AddZoneModalProps> = ({
  visible,
  bounds,
  floorId,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  // Form state
  const [zoneName, setZoneName] = useState('');
  const [selectedType, setSelectedType] = useState<ZoneType>('custom');
  const [isSeatingArea, setIsSeatingArea] = useState(true);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      setZoneName('');
      setSelectedType('custom');
      setIsSeatingArea(true);
    }
  }, [visible]);

  // Update name when type changes (for convenience)
  const handleTypeSelect = useCallback((type: ZoneType) => {
    setSelectedType(type);
    const option = ZONE_TYPE_OPTIONS.find(o => o.value === type);
    if (option && !zoneName) {
      setZoneName(option.label);
    }
    // Non-seating zones by default
    if (type === 'kitchen' || type === 'entrance') {
      setIsSeatingArea(false);
    } else {
      setIsSeatingArea(true);
    }
  }, [zoneName]);

  const handleConfirm = useCallback(() => {
    const selectedOption = ZONE_TYPE_OPTIONS.find(o => o.value === selectedType);
    const config: NewZoneConfig = {
      name: zoneName.trim() || selectedOption?.label || 'New Zone',
      type: selectedType,
      bounds,
      floorId,
      isSeatingArea,
      icon: selectedOption?.icon || 'shape',
    };
    onConfirm(config);
  }, [zoneName, selectedType, bounds, floorId, isSeatingArea, onConfirm]);

  const handleCancel = useCallback(() => {
    setZoneName('');
    setSelectedType('custom');
    setIsSeatingArea(true);
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
      maxWidth: 420,
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
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    typeOption: {
      width: '31%',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    typeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    typeLabel: {
      ...typography.labelSmall,
      color: theme.colors.onSurface,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    typeLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
    },
    switchLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    switchHint: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    boundsInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    boundsItem: {
      flex: 1,
      minWidth: 80,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.sm as number,
    },
    boundsLabel: {
      ...typography.labelMedium,
      color: theme.colors.onSurfaceVariant,
    },
    boundsValue: {
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
                <Text style={styles.title}>Add New Zone</Text>
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

              {/* Zone Name */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zone Name</Text>
                <TextInput
                  style={styles.input}
                  value={zoneName}
                  onChangeText={setZoneName}
                  placeholder="e.g., Main Dining, VIP Lounge"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  accessibilityLabel="Zone name input"
                />
              </View>

              {/* Zone Type */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zone Type</Text>
                <View style={styles.typeGrid}>
                  {ZONE_TYPE_OPTIONS.map((option) => {
                    const isSelected = selectedType === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.typeOption,
                          isSelected && styles.typeOptionSelected,
                        ]}
                        onPress={() => handleTypeSelect(option.value)}
                        accessibilityLabel={`${option.label} zone type`}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Icon
                          name={option.icon}
                          size={24}
                          color={isSelected ? theme.colors.primary : theme.colors.onSurface}
                          accessibilityLabel={option.label}
                        />
                        <Text
                          style={[
                            styles.typeLabel,
                            isSelected && styles.typeLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Seating Area Toggle */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zone Settings</Text>
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchLabel}>Seating Area</Text>
                    <Text style={styles.switchHint}>
                      Tables can be placed in this zone
                    </Text>
                  </View>
                  <Switch
                    value={isSeatingArea}
                    onValueChange={setIsSeatingArea}
                    trackColor={{
                      false: theme.colors.outline,
                      true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.surface}
                    accessibilityLabel="Toggle seating area"
                  />
                </View>
              </View>

              {/* Bounds Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zone Bounds</Text>
                <View style={styles.boundsInfo}>
                  <View style={styles.boundsItem}>
                    <Text style={styles.boundsLabel}>X:</Text>
                    <Text style={styles.boundsValue}>{Math.round(bounds.x)}</Text>
                  </View>
                  <View style={styles.boundsItem}>
                    <Text style={styles.boundsLabel}>Y:</Text>
                    <Text style={styles.boundsValue}>{Math.round(bounds.y)}</Text>
                  </View>
                  <View style={styles.boundsItem}>
                    <Text style={styles.boundsLabel}>W:</Text>
                    <Text style={styles.boundsValue}>{Math.round(bounds.width)}</Text>
                  </View>
                  <View style={styles.boundsItem}>
                    <Text style={styles.boundsLabel}>H:</Text>
                    <Text style={styles.boundsValue}>{Math.round(bounds.height)}</Text>
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
                  title="Add Zone"
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

export default React.memo(AddZoneModal);
