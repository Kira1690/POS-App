/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Use SettingsModal from './floorPlan/SettingsModal' instead.
 * The Advanced settings are now integrated into the unified table management interface.
 *
 * Advanced Table Settings Component
 * Automation rules, reservation settings, and danger zone
 * Following SOLID principles and theme system
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleCard, AppleButton } from '@/components/apple';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';

interface AdvancedSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Automation state
  const [autoCleaningAfterCheckout, setAutoCleaningAfterCheckout] = useState(true);
  const [cleaningDuration, setCleaningDuration] = useState('15');
  const [autoClearReservations, setAutoClearReservations] = useState('30');
  const [notifyLongOccupancy, setNotifyLongOccupancy] = useState(true);
  const [longOccupancyThreshold, setLongOccupancyThreshold] = useState('90');

  // Reservation rules state
  const [allowOverlapping, setAllowOverlapping] = useState(false);
  const [bufferTime, setBufferTime] = useState('15');
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState('60');
  const [requireDeposit, setRequireDeposit] = useState(true);
  const [minPartySize, setMinPartySize] = useState('8');

  // Integration state
  const [syncWithPOS, setSyncWithPOS] = useState(true);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [kitchenIntegration, setKitchenIntegration] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
    },
    sectionTitle: {
      ...typography.headlineSmall,
      fontWeight: '600',
      color: theme.colors.onSurface,
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
    dangerZone: {
      backgroundColor: theme.colors.errorContainer,
      borderWidth: 2,
      borderColor: theme.colors.error,
      borderRadius: borderRadius.lg as number,
      padding: spacing.lg,
    },
    dangerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    dangerTitleText: {
      ...typography.headlineSmall,
      fontWeight: '700',
      color: theme.colors.error,
    },
    dangerText: {
      ...typography.bodyMedium,
      color: theme.colors.onErrorContainer,
      marginBottom: spacing.lg,
    },
    dangerActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xl,
      justifyContent: 'flex-end',
    },
  });

  const handleSave = () => {
    console.log('Saving advanced settings...');
    onChangesDetected?.(false);
  };

  const handleCancel = () => {
    console.log('Cancelling changes...');
    onChangesDetected?.(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Auto-Status Management */}
      <AppleCard layer="surface" size="large">
        <Text style={styles.sectionTitle}>Auto-Status Management</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Auto-mark cleaning after checkout:</Text>
          <Switch
            value={autoCleaningAfterCheckout}
            onValueChange={(value) => {
              setAutoCleaningAfterCheckout(value);
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
          <Text style={styles.formLabel}>Cleaning duration estimate (min):</Text>
          <TextInput
            style={styles.formInput}
            value={cleaningDuration}
            onChangeText={(text) => {
              setCleaningDuration(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="15"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Auto-clear reservations after (min):</Text>
          <TextInput
            style={styles.formInput}
            value={autoClearReservations}
            onChangeText={(text) => {
              setAutoClearReservations(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="30"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Notify on long table occupancy:</Text>
          <Switch
            value={notifyLongOccupancy}
            onValueChange={(value) => {
              setNotifyLongOccupancy(value);
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
          <Text style={styles.formLabel}>Alert after (min):</Text>
          <TextInput
            style={styles.formInput}
            value={longOccupancyThreshold}
            onChangeText={(text) => {
              setLongOccupancyThreshold(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="90"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </AppleCard>

      {/* Reservation Rules */}
      <AppleCard layer="surface" size="large" style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Reservation Rules</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Allow overlapping reservations:</Text>
          <Switch
            value={allowOverlapping}
            onValueChange={(value) => {
              setAllowOverlapping(value);
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
          <Text style={styles.formLabel}>Buffer time between seatings (min):</Text>
          <TextInput
            style={styles.formInput}
            value={bufferTime}
            onChangeText={(text) => {
              setBufferTime(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="15"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Maximum advance booking (days):</Text>
          <TextInput
            style={styles.formInput}
            value={maxAdvanceBooking}
            onChangeText={(text) => {
              setMaxAdvanceBooking(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="60"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Require deposit for large groups:</Text>
          <Switch
            value={requireDeposit}
            onValueChange={(value) => {
              setRequireDeposit(value);
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
          <Text style={styles.formLabel}>Minimum party size for deposit:</Text>
          <TextInput
            style={styles.formInput}
            value={minPartySize}
            onChangeText={(text) => {
              setMinPartySize(text);
              onChangesDetected?.(true);
            }}
            keyboardType="number-pad"
            placeholder="8"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </AppleCard>

      {/* Integration Settings */}
      <AppleCard layer="surface" size="large" style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Integration Settings</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.formLabel}>Sync with POS system:</Text>
          <Switch
            value={syncWithPOS}
            onValueChange={(value) => {
              setSyncWithPOS(value);
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
          <Text style={styles.formLabel}>Real-time status updates:</Text>
          <Switch
            value={realtimeUpdates}
            onValueChange={(value) => {
              setRealtimeUpdates(value);
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
          <Text style={styles.formLabel}>Kitchen display integration:</Text>
          <Switch
            value={kitchenIntegration}
            onValueChange={(value) => {
              setKitchenIntegration(value);
              onChangesDetected?.(true);
            }}
            trackColor={{
              false: theme.colors.surfaceDisabled,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>
      </AppleCard>

      {/* Danger Zone */}
      <View style={[styles.dangerZone, { marginTop: spacing.xl }]}>
        <View style={styles.dangerTitle}>
          <Icon name="alert" size={24} color={theme.colors.error} accessibilityLabel="Danger zone warning icon" />
          <Text style={styles.dangerTitleText}>Danger Zone</Text>
        </View>
        <Text style={styles.dangerText}>
          CAUTION: These actions cannot be undone
        </Text>
        <View style={styles.dangerActions}>
          <AppleButton
            title="Reset All Tables"
            variant="destructive"
            size="small"
            onPress={() => {}}
          />
          <AppleButton
            title="Clear All Reservations"
            variant="destructive"
            size="small"
            onPress={() => {}}
          />
          <AppleButton
            title="Export Configuration"
            variant="secondary"
            size="small"
            onPress={() => {}}
          />
          <AppleButton
            title="Import Configuration"
            variant="secondary"
            size="small"
            onPress={() => {}}
          />
        </View>
      </View>

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

export default AdvancedSettings;
