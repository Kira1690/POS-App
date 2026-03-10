/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Use SettingsModal from './floorPlan/SettingsModal' instead.
 * The General settings are now integrated into the unified table management interface.
 *
 * General Table Settings Component
 * Default configurations, display preferences, and status colors
 * Following SOLID principles and theme system
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleCard, AppleButton } from '@/components/apple';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface GeneralSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Form state
  const [defaultCapacity, setDefaultCapacity] = useState('4');
  const [tablePrefix, setTablePrefix] = useState('T-');
  const [autoAssign, setAutoAssign] = useState(true);
  const [timeLimit, setTimeLimit] = useState('120');
  const [showCapacity, setShowCapacity] = useState(true);
  const [colorCode, setColorCode] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [gridColumnsTablet, setGridColumnsTablet] = useState('4');
  const [gridColumnsMobile, setGridColumnsMobile] = useState('2');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
    },
    sectionTitle: {
      ...typography.headlineSmall,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    formRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    formLabel: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      flex: 1,
    },
    formInput: {
      ...typography.bodyLarge,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md as number,
      minWidth: 100,
      textAlign: 'center',
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    colorBox: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md as number,
      marginLeft: spacing.md,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xl,
      justifyContent: 'flex-end',
    },
  });

  const handleSave = () => {
    // TODO: Implement save logic
    onChangesDetected?.(false);
  };

  const handleCancel = () => {
    // TODO: Reset to original values
    onChangesDetected?.(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Table Configuration */}
      <AppleCard layer="surface" size="large">
        <Text style={styles.sectionTitle}>Table Configuration</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Default Table Capacity:</Text>
          <TextInput
            style={styles.formInput}
            value={defaultCapacity}
            onChangeText={(text) => {
              setDefaultCapacity(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="4"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Table Number Prefix:</Text>
          <TextInput
            style={styles.formInput}
            value={tablePrefix}
            onChangeText={(text) => {
              setTablePrefix(text);
              onChangesDetected?.(true);
            }}
            placeholder="T-"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Auto-assign Tables:</Text>
          <Switch
            value={autoAssign}
            onValueChange={(value) => {
              setAutoAssign(value);
              onChangesDetected?.(true);
            }}
            trackColor={{
              false: theme.colors.surfaceDisabled,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Table Time Limits (minutes):</Text>
          <TextInput
            style={styles.formInput}
            value={timeLimit}
            onChangeText={(text) => {
              setTimeLimit(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </AppleCard>

      {/* Display Preferences */}
      <AppleCard layer="surface" size="large" style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Display Preferences</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Show Table Capacity:</Text>
          <Switch
            value={showCapacity}
            onValueChange={(value) => {
              setShowCapacity(value);
              onChangesDetected?.(true);
            }}
            trackColor={{
              false: theme.colors.surfaceDisabled,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Color Code by Status:</Text>
          <Switch
            value={colorCode}
            onValueChange={(value) => {
              setColorCode(value);
              onChangesDetected?.(true);
            }}
            trackColor={{
              false: theme.colors.surfaceDisabled,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Show Service Duration:</Text>
          <Switch
            value={showDuration}
            onValueChange={(value) => {
              setShowDuration(value);
              onChangesDetected?.(true);
            }}
            trackColor={{
              false: theme.colors.surfaceDisabled,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Grid Columns (Tablet):</Text>
          <TextInput
            style={styles.formInput}
            value={gridColumnsTablet}
            onChangeText={(text) => {
              setGridColumnsTablet(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="4"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Grid Columns (Mobile):</Text>
          <TextInput
            style={styles.formInput}
            value={gridColumnsMobile}
            onChangeText={(text) => {
              setGridColumnsMobile(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="2"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </AppleCard>

      {/* Status Management */}
      <AppleCard layer="surface" size="large" style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Status Colors</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Available Color:</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.success }]} />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Occupied Color:</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.error }]} />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Reserved Color:</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.info }]} />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Cleaning Color:</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.warning }]} />
        </View>
      </AppleCard>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <AppleButton
          title="Cancel"
          variant="secondary"
          size="medium"
          onPress={handleCancel}
        />
        <AppleButton
          title="Save Changes"
          variant="primary"
          size="medium"
          onPress={handleSave}
        />
      </View>
    </ScrollView>
  );
};

export default GeneralSettings;
