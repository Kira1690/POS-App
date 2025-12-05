/**
 * TablePropertiesPanel Component
 * Side panel showing selected table properties
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { AppleCard, AppleButton } from '@/components/apple';
import { FloorPlanTablePosition, TableStatus } from '@/types/settings/table-management.types';
import { MockTable } from '@/data/tables';

interface TablePropertiesPanelProps {
  table: MockTable;
  position: FloorPlanTablePosition;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRotate: () => void;
  onEdit: () => void;
}

/**
 * Get status color from theme
 */
const getStatusColor = (
  status: string,
  theme: ReturnType<typeof useTheme>['theme']
): string => {
  const statusColorMap: Record<string, string> = {
    available: theme.colors.success,
    occupied: theme.colors.error,
    reserved: theme.colors.warning,
    cleaning: theme.colors.info,
    out_of_service: theme.colors.outline,
  };
  return statusColorMap[status.toLowerCase()] || theme.colors.outline;
};

const TablePropertiesPanel: React.FC<TablePropertiesPanelProps> = ({
  table,
  position,
  onClose,
  onDuplicate,
  onDelete,
  onRotate,
  onEdit,
}) => {
  const { theme } = useTheme();
  const statusColor = getStatusColor(table.status, theme);

  const styles = StyleSheet.create({
    panel: {
      marginTop: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
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
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.labelLarge,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.sm,
    },
    propertyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    propertyLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    propertyValue: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm as number,
      backgroundColor: `${statusColor}20`,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: statusColor,
    },
    statusText: {
      ...typography.labelMedium,
      fontWeight: '600',
      color: statusColor,
      textTransform: 'capitalize',
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    actionButton: {
      flex: 1,
      minWidth: 100,
    },
  });

  return (
    <AppleCard layer="surface" size="large" style={styles.panel}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{table.number}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Close properties panel"
        >
          <Icon
            name="close"
            size={24}
            color={theme.colors.onSurface}
            accessibilityLabel="Close"
          />
        </TouchableOpacity>
      </View>

      {/* Position Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Position</Text>
        <View style={styles.propertyRow}>
          <Text style={styles.propertyLabel}>X</Text>
          <Text style={styles.propertyValue}>{Math.round(position.x)}</Text>
        </View>
        <View style={styles.propertyRow}>
          <Text style={styles.propertyLabel}>Y</Text>
          <Text style={styles.propertyValue}>{Math.round(position.y)}</Text>
        </View>
        <View style={styles.propertyRow}>
          <Text style={styles.propertyLabel}>Rotation</Text>
          <Text style={styles.propertyValue}>{position.rotation}deg</Text>
        </View>
      </View>

      {/* Table Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Table Info</Text>
        <View style={styles.propertyRow}>
          <Text style={styles.propertyLabel}>Area</Text>
          <Text style={styles.propertyValue}>{table.area}</Text>
        </View>
        <View style={styles.propertyRow}>
          <Text style={styles.propertyLabel}>Capacity</Text>
          <Text style={styles.propertyValue}>{table.capacity} seats</Text>
        </View>
        <View style={styles.propertyRow}>
          <Text style={styles.propertyLabel}>Shape</Text>
          <Text style={styles.propertyValue}>{table.shape || 'Round'}</Text>
        </View>
        <View style={styles.propertyRow}>
          <Text style={styles.propertyLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{table.status}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <AppleButton
          title="Edit"
          variant="secondary"
          size="small"
          icon={
            <Icon
              name="pencil"
              size={16}
              color={theme.colors.onSurface}
              accessibilityLabel="Edit"
            />
          }
          iconPosition="left"
          onPress={onEdit}
          style={styles.actionButton}
        />
        <AppleButton
          title="Rotate"
          variant="secondary"
          size="small"
          icon={
            <Icon
              name="rotate-right"
              size={16}
              color={theme.colors.onSurface}
              accessibilityLabel="Rotate"
            />
          }
          iconPosition="left"
          onPress={onRotate}
          style={styles.actionButton}
        />
        <AppleButton
          title="Duplicate"
          variant="secondary"
          size="small"
          icon={
            <Icon
              name="content-copy"
              size={16}
              color={theme.colors.onSurface}
              accessibilityLabel="Duplicate"
            />
          }
          iconPosition="left"
          onPress={onDuplicate}
          style={styles.actionButton}
        />
        <AppleButton
          title="Delete"
          variant="destructive"
          size="small"
          icon={
            <Icon
              name="delete"
              size={16}
              color={theme.colors.surface}
              accessibilityLabel="Delete"
            />
          }
          iconPosition="left"
          onPress={onDelete}
          style={styles.actionButton}
        />
      </View>
    </AppleCard>
  );
};

export default React.memo(TablePropertiesPanel);
