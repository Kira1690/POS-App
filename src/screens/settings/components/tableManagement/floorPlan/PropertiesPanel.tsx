/**
 * PropertiesPanel Component
 * Unified panel showing floor stats, table properties, or zone properties
 * Based on current selection state
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { AppleButton } from '@/components/apple';
import { FloorPlanTablePosition, FloorZone, Floor } from '@/types/settings/table-management.types';
import { MockTable, calculateStatusCounts } from '@/data/tables';

type PanelMode = 'stats' | 'table' | 'zone';

interface FloorStats {
  totalTables: number;
  totalCapacity: number;
  statusCounts: {
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
  };
  zones: Array<{ name: string; tableCount: number }>;
}

interface PropertiesPanelProps {
  // Mode determination
  selectedTable?: MockTable | null;
  selectedTablePosition?: FloorPlanTablePosition | null;
  selectedZone?: FloorZone | null;

  // Floor stats data
  floor: Floor;
  tables: MockTable[];
  zones: FloorZone[];
  tablePositions: FloorPlanTablePosition[];

  // Actions
  onCloseSelection: () => void;
  onDuplicateTable?: () => void;
  onDeleteTable?: () => void;
  onRotateTable?: () => void;
  onEditTable?: () => void;
  onDeleteZone?: () => void;
  onEditZone?: () => void;
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

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedTable,
  selectedTablePosition,
  selectedZone,
  floor,
  tables,
  zones,
  tablePositions,
  onCloseSelection,
  onDuplicateTable,
  onDeleteTable,
  onRotateTable,
  onEditTable,
  onDeleteZone,
  onEditZone,
}) => {
  const { theme } = useTheme();

  // Determine panel mode
  const mode: PanelMode = useMemo(() => {
    if (selectedTable && selectedTablePosition) return 'table';
    if (selectedZone) return 'zone';
    return 'stats';
  }, [selectedTable, selectedTablePosition, selectedZone]);

  // Calculate floor stats
  const floorStats: FloorStats = useMemo(() => {
    const currentFloorTables = tables.filter(t =>
      tablePositions.some(tp => tp.table_id === t.id && tp.floor_id === floor.id)
    );
    const statusCounts = calculateStatusCounts(currentFloorTables);

    const zoneStats = zones.map(zone => ({
      name: zone.name,
      tableCount: tablePositions.filter(tp => {
        const table = tables.find(t => t.id === tp.table_id);
        return tp.floor_id === floor.id && table;
      }).length,
    }));

    return {
      totalTables: currentFloorTables.length,
      totalCapacity: currentFloorTables.reduce((sum, t) => sum + t.capacity, 0),
      statusCounts,
      zones: zoneStats,
    };
  }, [tables, tablePositions, zones, floor.id]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    headerTitle: {
      ...typography.titleMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      flex: 1,
      padding: spacing.md,
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
    // Stats mode styles
    statCard: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: borderRadius.lg as number,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    statLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    statValue: {
      ...typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    statusLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      flex: 1,
    },
    statusCount: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    zoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    zoneIcon: {
      marginRight: spacing.sm,
    },
    zoneName: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      flex: 1,
    },
    zoneCount: {
      ...typography.labelMedium,
      color: theme.colors.onSurfaceVariant,
    },
    // Property rows
    propertyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
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
    },
    statusText: {
      ...typography.labelMedium,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    // Actions
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    actionButton: {
      flex: 1,
      minWidth: 80,
    },
  });

  // Render floor stats view
  const renderStatsMode = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Overview Card */}
      <View style={styles.statCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Floor</Text>
          <Text style={styles.statValue}>{floor.name}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Tables</Text>
          <Text style={styles.statValue}>{floorStats.totalTables}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Capacity</Text>
          <Text style={styles.statValue}>{floorStats.totalCapacity} seats</Text>
        </View>
      </View>

      {/* Status Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Breakdown</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.statusLabel}>Available</Text>
          <Text style={styles.statusCount}>{floorStats.statusCounts.available}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: theme.colors.error }]} />
          <Text style={styles.statusLabel}>Occupied</Text>
          <Text style={styles.statusCount}>{floorStats.statusCounts.occupied}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={styles.statusLabel}>Reserved</Text>
          <Text style={styles.statusCount}>{floorStats.statusCounts.reserved}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: theme.colors.info }]} />
          <Text style={styles.statusLabel}>Cleaning</Text>
          <Text style={styles.statusCount}>{floorStats.statusCounts.cleaning}</Text>
        </View>
      </View>

      {/* Zones */}
      {zones.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zones</Text>
          {zones.map(zone => (
            <View key={zone.id} style={styles.zoneRow}>
              <Icon
                name="map-marker"
                size={16}
                color={zone.color || theme.colors.primary}
                accessibilityLabel={zone.name}
                style={styles.zoneIcon}
              />
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneCount}>
                {zone.is_seating_area ? 'Seating' : 'Non-seating'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // Render table properties view
  const renderTableMode = () => {
    if (!selectedTable || !selectedTablePosition) return null;
    const statusColor = getStatusColor(selectedTable.status, theme);

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Position Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position</Text>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>X</Text>
            <Text style={styles.propertyValue}>{Math.round(selectedTablePosition.x)}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Y</Text>
            <Text style={styles.propertyValue}>{Math.round(selectedTablePosition.y)}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Rotation</Text>
            <Text style={styles.propertyValue}>{selectedTablePosition.rotation}°</Text>
          </View>
        </View>

        {/* Table Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Table Info</Text>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Area</Text>
            <Text style={styles.propertyValue}>{selectedTable.area}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Capacity</Text>
            <Text style={styles.propertyValue}>{selectedTable.capacity} seats</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Shape</Text>
            <Text style={styles.propertyValue}>{selectedTable.shape || 'Round'}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {selectedTable.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AppleButton
            title="Edit"
            variant="secondary"
            size="small"
            icon={<Icon name="pencil" size={14} color={theme.colors.onSurface} accessibilityLabel="Edit" />}
            iconPosition="left"
            onPress={onEditTable}
            style={styles.actionButton}
          />
          <AppleButton
            title="Rotate"
            variant="secondary"
            size="small"
            icon={<Icon name="rotate-right" size={14} color={theme.colors.onSurface} accessibilityLabel="Rotate" />}
            iconPosition="left"
            onPress={onRotateTable}
            style={styles.actionButton}
          />
          <AppleButton
            title="Copy"
            variant="secondary"
            size="small"
            icon={<Icon name="content-copy" size={14} color={theme.colors.onSurface} accessibilityLabel="Duplicate" />}
            iconPosition="left"
            onPress={onDuplicateTable}
            style={styles.actionButton}
          />
          <AppleButton
            title="Delete"
            variant="destructive"
            size="small"
            icon={<Icon name="delete" size={14} color={theme.colors.surface} accessibilityLabel="Delete" />}
            iconPosition="left"
            onPress={onDeleteTable}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    );
  };

  // Render zone properties view
  const renderZoneMode = () => {
    if (!selectedZone) return null;

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone Properties</Text>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Type</Text>
            <Text style={styles.propertyValue}>{selectedZone.type}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Seating Area</Text>
            <Text style={styles.propertyValue}>
              {selectedZone.is_seating_area ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Color</Text>
            <View style={[styles.statusDot, { backgroundColor: selectedZone.color, width: 20, height: 20, borderRadius: 4 }]} />
          </View>
        </View>

        {/* Zone Position */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position & Size</Text>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>X</Text>
            <Text style={styles.propertyValue}>{Math.round(selectedZone.bounds.x)}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Y</Text>
            <Text style={styles.propertyValue}>{Math.round(selectedZone.bounds.y)}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Width</Text>
            <Text style={styles.propertyValue}>{Math.round(selectedZone.bounds.width)}</Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Height</Text>
            <Text style={styles.propertyValue}>{Math.round(selectedZone.bounds.height)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <AppleButton
            title="Edit"
            variant="secondary"
            size="small"
            icon={<Icon name="pencil" size={14} color={theme.colors.onSurface} accessibilityLabel="Edit" />}
            iconPosition="left"
            onPress={onEditZone}
            style={styles.actionButton}
          />
          <AppleButton
            title="Delete"
            variant="destructive"
            size="small"
            icon={<Icon name="delete" size={14} color={theme.colors.surface} accessibilityLabel="Delete" />}
            iconPosition="left"
            onPress={onDeleteZone}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    );
  };

  // Get header title based on mode
  const getHeaderTitle = () => {
    switch (mode) {
      case 'table':
        return selectedTable?.number || 'Table';
      case 'zone':
        return selectedZone?.name || 'Zone';
      default:
        return 'Floor Overview';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onCloseSelection}
          accessibilityLabel="Close properties"
        >
          <Icon name="close" size={20} color={theme.colors.onSurfaceVariant} accessibilityLabel="Close" />
        </TouchableOpacity>
      </View>

      {/* Content based on mode */}
      {mode === 'stats' && renderStatsMode()}
      {mode === 'table' && renderTableMode()}
      {mode === 'zone' && renderZoneMode()}
    </View>
  );
};

export default React.memo(PropertiesPanel);
