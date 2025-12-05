/**
 * FloorPlanToolbar Component
 * Compact tool palette for the floor plan editor (desktop app style)
 * All tools in a single row with icon-only buttons and compact toggles
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { FloorPlanTool } from '@/types/settings/table-management.types';

interface FloorPlanToolbarProps {
  activeTool: FloorPlanTool;
  gridEnabled: boolean;
  snapToGrid: boolean;
  showChairs: boolean;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: FloorPlanTool) => void;
  onGridToggle: () => void;
  onSnapToggle: () => void;
  onChairsToggle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  // New props for unified toolbar
  onSettingsPress: () => void;
  onImport: () => void;
  onExport: () => void;
  onSave: () => void;
}

interface ToolConfig {
  id: FloorPlanTool;
  icon: string;
  label: string;
}

const TOOLS: ToolConfig[] = [
  { id: 'select', icon: 'cursor-default', label: 'Select' },
  { id: 'move', icon: 'drag', label: 'Move' },
  { id: 'add_table', icon: 'table-plus', label: 'Add Table' },
  { id: 'add_zone', icon: 'shape-rectangle-plus', label: 'Add Zone' },
  { id: 'delete', icon: 'delete', label: 'Delete' },
  { id: 'rotate', icon: 'rotate-right', label: 'Rotate' },
];

interface ToggleConfig {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

const FloorPlanToolbar: React.FC<FloorPlanToolbarProps> = ({
  activeTool,
  gridEnabled,
  snapToGrid,
  showChairs,
  zoom,
  canUndo,
  canRedo,
  onToolChange,
  onGridToggle,
  onSnapToggle,
  onChairsToggle,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onSettingsPress,
  onImport,
  onExport,
  onSave,
}) => {
  const { theme } = useTheme();

  const toggles: ToggleConfig[] = [
    { icon: 'grid', label: 'Grid', active: gridEnabled, onPress: onGridToggle },
    { icon: 'magnet', label: 'Snap', active: snapToGrid, onPress: onSnapToggle },
    { icon: 'seat', label: 'Chairs', active: showChairs, onPress: onChairsToggle },
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: borderRadius.md as number,
      marginBottom: spacing.sm,
    },
    // Tool buttons group
    toolGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    toolButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm as number,
      borderWidth: 1.5,
    },
    toolButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    toolButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    // Divider between sections
    divider: {
      width: 1,
      height: 28,
      backgroundColor: theme.colors.outline,
      marginHorizontal: spacing.sm,
    },
    // Toggle buttons (compact chip style)
    toggleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    toggleChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: borderRadius.full as number,
      borderWidth: 1.5,
    },
    toggleChipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    toggleChipInactive: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.outline,
    },
    toggleLabel: {
      ...typography.labelSmall,
      fontWeight: '500',
    },
    // Zoom controls
    zoomGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    zoomButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm as number,
    },
    zoomText: {
      ...typography.labelSmall,
      fontWeight: '600',
      color: theme.colors.onSurface,
      minWidth: 44,
      textAlign: 'center',
    },
    // History buttons
    historyGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    historyButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm as number,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    // Settings button
    settingsButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm as number,
      backgroundColor: theme.colors.surfaceContainerHigh,
    },
    // File operations group
    fileGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    fileButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm as number,
    },
    saveButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm as number,
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Tool buttons - icon only */}
      <View style={styles.toolGroup}>
        {TOOLS.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolButton,
                isActive ? styles.toolButtonActive : styles.toolButtonInactive,
              ]}
              onPress={() => onToolChange(tool.id)}
              accessibilityLabel={tool.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                name={tool.icon}
                size={20}
                color={isActive ? theme.colors.onPrimary : theme.colors.onSurface}
                accessibilityLabel={tool.label}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Toggle options - compact chips */}
      <View style={styles.toggleGroup}>
        {toggles.map(toggle => (
          <TouchableOpacity
            key={toggle.label}
            style={[
              styles.toggleChip,
              toggle.active ? styles.toggleChipActive : styles.toggleChipInactive,
            ]}
            onPress={toggle.onPress}
            accessibilityLabel={`${toggle.label}: ${toggle.active ? 'ON' : 'OFF'}`}
            accessibilityRole="switch"
            accessibilityState={{ checked: toggle.active }}
          >
            <Icon
              name={toggle.icon}
              size={14}
              color={toggle.active ? theme.colors.primary : theme.colors.onSurfaceVariant}
              accessibilityLabel={toggle.label}
            />
            <Text
              style={[
                styles.toggleLabel,
                { color: toggle.active ? theme.colors.primary : theme.colors.onSurfaceVariant },
              ]}
            >
              {toggle.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Zoom controls - compact */}
      <View style={styles.zoomGroup}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={onZoomOut}
          accessibilityLabel="Zoom out"
        >
          <Icon name="minus" size={16} color={theme.colors.onSurface} accessibilityLabel="Zoom out" />
        </TouchableOpacity>
        <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={onZoomIn}
          accessibilityLabel="Zoom in"
        >
          <Icon name="plus" size={16} color={theme.colors.onSurface} accessibilityLabel="Zoom in" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Undo/Redo - compact */}
      <View style={styles.historyGroup}>
        <TouchableOpacity
          style={[styles.historyButton, !canUndo && styles.buttonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          accessibilityLabel="Undo"
        >
          <Icon
            name="undo"
            size={18}
            color={canUndo ? theme.colors.onSurface : theme.colors.outline}
            accessibilityLabel="Undo"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.historyButton, !canRedo && styles.buttonDisabled]}
          onPress={onRedo}
          disabled={!canRedo}
          accessibilityLabel="Redo"
        >
          <Icon
            name="redo"
            size={18}
            color={canRedo ? theme.colors.onSurface : theme.colors.outline}
            accessibilityLabel="Redo"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Settings */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        accessibilityLabel="Settings"
      >
        <Icon
          name="cog"
          size={18}
          color={theme.colors.onSurface}
          accessibilityLabel="Settings"
        />
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* File operations */}
      <View style={styles.fileGroup}>
        <TouchableOpacity
          style={styles.fileButton}
          onPress={onImport}
          accessibilityLabel="Import layout"
        >
          <Icon
            name="upload"
            size={18}
            color={theme.colors.onSurface}
            accessibilityLabel="Import"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fileButton}
          onPress={onExport}
          accessibilityLabel="Export layout"
        >
          <Icon
            name="download"
            size={18}
            color={theme.colors.onSurface}
            accessibilityLabel="Export"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          accessibilityLabel="Save layout"
        >
          <Icon
            name="content-save"
            size={18}
            color={theme.colors.onPrimary}
            accessibilityLabel="Save"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(FloorPlanToolbar);
