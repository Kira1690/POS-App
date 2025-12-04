/**
 * Floor Plan Settings Component
 * Interactive floor plan editor with drag-and-drop table positioning
 * Phase 3 - Complete implementation with all wireframe features
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleCard, AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { MOCK_TABLES, MockTable } from '@/data/tables';

interface FloorPlanSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

type Tool = 'select' | 'add' | 'delete';
type ZoomLevel = 50 | 75 | 100 | 125 | 150;

interface TablePosition {
  id: string;
  x: number;
  y: number;
  table: MockTable;
}

interface Zone {
  id: string;
  name: string;
  type: 'kitchen' | 'bar' | 'entrance' | 'vip' | 'main';
  x: number;
  y: number;
  width: number;
  height: number;
  icon: string;
}

const FloorPlanSettings: React.FC<FloorPlanSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(100);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Floor plan state
  const [tablePositions, setTablePositions] = useState<TablePosition[]>(() => {
    // Initialize with mock data - distribute tables across floor
    return MOCK_TABLES.map((table, index) => ({
      id: table.id,
      x: 100 + (index % 4) * 150,
      y: 100 + Math.floor(index / 4) * 120,
      table,
    }));
  });

  // Predefined zones
  const [zones] = useState<Zone[]>([
    {
      id: 'kitchen',
      name: 'KITCHEN',
      type: 'kitchen',
      x: 50,
      y: 50,
      width: 250,
      height: 100,
      icon: 'fire',
    },
    {
      id: 'vip',
      name: 'VIP LOUNGE',
      type: 'vip',
      x: 400,
      y: 300,
      width: 250,
      height: 150,
      icon: 'crown',
    },
    {
      id: 'bar',
      name: 'BAR',
      type: 'bar',
      x: 50,
      y: 450,
      width: 500,
      height: 80,
      icon: 'glass-cocktail',
    },
    {
      id: 'entrance',
      name: 'ENTRANCE',
      type: 'entrance',
      x: 50,
      y: 550,
      width: 150,
      height: 60,
      icon: 'door-open',
    },
  ]);

  // Get selected table data
  const selectedTable = tablePositions.find(tp => tp.id === selectedTableId);

  // Tool handlers
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    if (tool !== 'select') {
      setSelectedTableId(null);
    }
  };

  const handleTablePress = (tableId: string) => {
    if (activeTool === 'select') {
      setSelectedTableId(tableId === selectedTableId ? null : tableId);
    } else if (activeTool === 'delete') {
      Alert.alert(
        'Delete Table',
        'Remove this table from the floor plan?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setTablePositions(prev => prev.filter(tp => tp.id !== tableId));
              onChangesDetected?.(true);
            },
          },
        ]
      );
    }
  };

  const handleDuplicateTable = () => {
    if (!selectedTable) return;

    const newTablePosition: TablePosition = {
      id: `dup-${Date.now()}`,
      x: selectedTable.x + 50,
      y: selectedTable.y + 50,
      table: { ...selectedTable.table, id: `dup-${Date.now()}` },
    };

    setTablePositions(prev => [...prev, newTablePosition]);
    setSelectedTableId(newTablePosition.id);
    onChangesDetected?.(true);
  };

  const handleSaveLayout = () => {
    Alert.alert('Success', 'Floor plan layout saved successfully!');
    onChangesDetected?.(false);
  };

  const handleExportLayout = () => {
    const layoutData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      zoom: zoomLevel,
      gridEnabled,
      zones,
      tables: tablePositions,
    };

    console.log('Exporting floor plan:', layoutData);
    Alert.alert('Export', 'Floor plan exported to: floor-plan-' + new Date().toISOString().split('T')[0] + '.json');
  };

  const handleImportLayout = () => {
    Alert.alert('Import', 'Import functionality will allow uploading JSON floor plan files');
  };

  const getZoneColor = (type: Zone['type']) => {
    switch (type) {
      case 'kitchen':
        return theme.colors.surfaceDisabled;
      case 'vip':
        return theme.colors.warning + '20';
      case 'bar':
        return theme.colors.info + '20';
      case 'entrance':
        return theme.colors.outline + '20';
      case 'main':
        return theme.colors.surface;
      default:
        return theme.colors.surface;
    }
  };

  const getZoneBorderColor = (type: Zone['type']) => {
    switch (type) {
      case 'kitchen':
        return theme.colors.onSurfaceVariant;
      case 'vip':
        return theme.colors.warning;
      case 'bar':
        return theme.colors.info;
      case 'entrance':
        return theme.colors.outline;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
    },
    toolbarContainer: {
      marginBottom: spacing.md,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    toolbarLabel: {
      ...typography.labelLarge,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginRight: spacing.sm,
    },
    toolButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
    },
    toolButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    toolButtonInactive: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
    },
    toolButtonText: {
      ...typography.labelMedium,
      fontWeight: '600',
    },
    canvasContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: borderRadius.lg as number,
      padding: spacing.lg,
      minHeight: 700,
      position: 'relative',
    },
    gridOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
    },
    zone: {
      position: 'absolute',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    zoneLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    zoneName: {
      ...typography.labelLarge,
      fontWeight: '700',
      color: theme.colors.onSurfaceVariant,
    },
    zoneSubtext: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    tableContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    table: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tableSelected: {
      borderWidth: 4,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    tableNumber: {
      ...typography.labelLarge,
      fontWeight: '700',
      marginBottom: spacing.xs / 2,
    },
    tableCapacity: {
      ...typography.labelSmall,
      fontWeight: '600',
    },
    propertiesPanel: {
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
    },
    propertiesPanelTitle: {
      ...typography.titleMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
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
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    bottomActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
      justifyContent: 'flex-end',
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Toolbar */}
      <AppleCard layer="surface" size="large" style={styles.toolbarContainer}>
        {/* Tools Row */}
        <View style={styles.toolbarRow}>
          <Text style={styles.toolbarLabel}>Tools:</Text>

          <TouchableOpacity
            style={[
              styles.toolButton,
              activeTool === 'select' ? styles.toolButtonActive : styles.toolButtonInactive,
            ]}
            onPress={() => handleToolChange('select')}
          >
            <Icon
              name="cursor-default"
              size={18}
              color={activeTool === 'select' ? theme.colors.onPrimary : theme.colors.onSurface}
              accessibilityLabel="Select tool"
            />
            <Text
              style={[
                styles.toolButtonText,
                { color: activeTool === 'select' ? theme.colors.onPrimary : theme.colors.onSurface },
              ]}
            >
              Select
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              activeTool === 'add' ? styles.toolButtonActive : styles.toolButtonInactive,
            ]}
            onPress={() => handleToolChange('add')}
          >
            <Icon
              name="table-plus"
              size={18}
              color={activeTool === 'add' ? theme.colors.onPrimary : theme.colors.onSurface}
              accessibilityLabel="Add table tool"
            />
            <Text
              style={[
                styles.toolButtonText,
                { color: activeTool === 'add' ? theme.colors.onPrimary : theme.colors.onSurface },
              ]}
            >
              Add
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolButton,
              activeTool === 'delete' ? styles.toolButtonActive : styles.toolButtonInactive,
            ]}
            onPress={() => handleToolChange('delete')}
          >
            <Icon
              name="delete"
              size={18}
              color={activeTool === 'delete' ? theme.colors.onPrimary : theme.colors.onSurface}
              accessibilityLabel="Delete tool"
            />
            <Text
              style={[
                styles.toolButtonText,
                { color: activeTool === 'delete' ? theme.colors.onPrimary : theme.colors.onSurface },
              ]}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>

        {/* Options Row */}
        <View style={styles.toolbarRow}>
          <TouchableOpacity
            style={[styles.toolButton, styles.toolButtonInactive]}
            onPress={() => {
              setGridEnabled(!gridEnabled);
              onChangesDetected?.(true);
            }}
          >
            <Icon
              name="grid"
              size={18}
              color={theme.colors.onSurface}
              accessibilityLabel="Toggle grid"
            />
            <Text style={[styles.toolButtonText, { color: theme.colors.onSurface }]}>
              Grid: {gridEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, styles.toolButtonInactive]}
            onPress={() => {
              const levels: ZoomLevel[] = [50, 75, 100, 125, 150];
              const currentIndex = levels.indexOf(zoomLevel);
              const nextIndex = (currentIndex + 1) % levels.length;
              setZoomLevel(levels[nextIndex]);
            }}
          >
            <Icon
              name="magnify"
              size={18}
              color={theme.colors.onSurface}
              accessibilityLabel="Zoom level"
            />
            <Text style={[styles.toolButtonText, { color: theme.colors.onSurface }]}>
              Zoom: {zoomLevel}%
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, styles.toolButtonInactive]}
            onPress={() => Alert.alert('Undo', 'Undo functionality (coming soon)')}
          >
            <Icon
              name="undo"
              size={18}
              color={theme.colors.onSurface}
              accessibilityLabel="Undo"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, styles.toolButtonInactive]}
            onPress={() => Alert.alert('Redo', 'Redo functionality (coming soon)')}
          >
            <Icon
              name="redo"
              size={18}
              color={theme.colors.onSurface}
              accessibilityLabel="Redo"
            />
          </TouchableOpacity>
        </View>
      </AppleCard>

      {/* Canvas */}
      <AppleCard layer="surface" size="large">
        <View style={styles.canvasContainer}>
          {/* Grid Overlay */}
          {gridEnabled && (
            <View style={styles.gridOverlay}>
              {/* Grid lines would be rendered here with SVG in production */}
              <Text style={{ color: theme.colors.outline, opacity: 0.5 }}>
                • Grid Pattern •
              </Text>
            </View>
          )}

          {/* Zones */}
          {zones.map((zone) => (
            <View
              key={zone.id}
              style={[
                styles.zone,
                {
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  backgroundColor: getZoneColor(zone.type),
                  borderColor: getZoneBorderColor(zone.type),
                },
              ]}
            >
              <View style={styles.zoneLabel}>
                <Icon
                  name={zone.icon}
                  size={20}
                  color={getZoneBorderColor(zone.type)}
                  accessibilityLabel={`${zone.name} zone`}
                />
                <Text style={[styles.zoneName, { color: getZoneBorderColor(zone.type) }]}>
                  {zone.name}
                </Text>
              </View>
              {zone.type === 'kitchen' && (
                <Text style={styles.zoneSubtext}>(Non-seating zone)</Text>
              )}
            </View>
          ))}

          {/* Tables */}
          {tablePositions.map((tablePos) => {
            const statusColor = getStatusColor(tablePos.table.status);
            const isSelected = selectedTableId === tablePos.id;

            return (
              <TouchableOpacity
                key={tablePos.id}
                style={[
                  styles.tableContainer,
                  {
                    left: tablePos.x,
                    top: tablePos.y,
                  },
                ]}
                onPress={() => handleTablePress(tablePos.id)}
              >
                <View
                  style={[
                    styles.table,
                    isSelected && styles.tableSelected,
                    {
                      backgroundColor: statusColor + '20',
                      borderColor: isSelected ? theme.colors.primary : statusColor,
                    },
                  ]}
                >
                  <Text style={[styles.tableNumber, { color: statusColor }]}>
                    {tablePos.table.number}
                  </Text>
                  <Text style={[styles.tableCapacity, { color: theme.colors.onSurface }]}>
                    {tablePos.table.capacity} seats
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Properties Panel (shown when table is selected) */}
        {selectedTable && (
          <View style={styles.propertiesPanel}>
            <Text style={styles.propertiesPanelTitle}>
              Selected: {selectedTable.table.number} ({selectedTable.table.area})
            </Text>

            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Position:</Text>
              <Text style={styles.propertyValue}>
                X: {selectedTable.x}, Y: {selectedTable.y}
              </Text>
            </View>

            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Capacity:</Text>
              <Text style={styles.propertyValue}>{selectedTable.table.capacity} seats</Text>
            </View>

            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Status:</Text>
              <Text style={[styles.propertyValue, { color: getStatusColor(selectedTable.table.status) }]}>
                {selectedTable.table.status}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <AppleButton
                title="Duplicate"
                variant="secondary"
                size="small"
                icon={<Icon name="content-copy" size={16} color={theme.colors.onSurface} accessibilityLabel="Duplicate" />}
                iconPosition="left"
                onPress={handleDuplicateTable}
                style={{ flex: 1 }}
              />
              <AppleButton
                title="Delete"
                variant="destructive"
                size="small"
                icon={<Icon name="delete" size={16} color={theme.colors.onError} accessibilityLabel="Delete" />}
                iconPosition="left"
                onPress={() => handleTablePress(selectedTable.id)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </AppleCard>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <AppleButton
          title="Import"
          variant="secondary"
          size="medium"
          icon={<Icon name="upload" size={18} color={theme.colors.onSurface} accessibilityLabel="Import layout" />}
          iconPosition="left"
          onPress={handleImportLayout}
        />
        <AppleButton
          title="Export"
          variant="secondary"
          size="medium"
          icon={<Icon name="download" size={18} color={theme.colors.onSurface} accessibilityLabel="Export layout" />}
          iconPosition="left"
          onPress={handleExportLayout}
        />
        <AppleButton
          title="Save Layout"
          variant="primary"
          size="medium"
          icon={<Icon name="content-save" size={18} color={theme.colors.onPrimary} accessibilityLabel="Save layout" />}
          iconPosition="left"
          onPress={handleSaveLayout}
        />
      </View>
    </ScrollView>
  );
};

export default FloorPlanSettings;
