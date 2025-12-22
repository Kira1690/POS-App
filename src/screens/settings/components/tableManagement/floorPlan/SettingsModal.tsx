/**
 * SettingsModal Component
 * Unified settings modal for Table Management configuration
 * Combines General and Advanced settings in a tabbed interface
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { AppleButton } from '@/components/apple';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

type SettingsTab = 'general' | 'advanced';

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // General settings state
  const [defaultCapacity, setDefaultCapacity] = useState('4');
  const [tablePrefix, setTablePrefix] = useState('T-');
  const [autoAssign, setAutoAssign] = useState(true);
  const [timeLimit, setTimeLimit] = useState('120');
  const [showCapacity, setShowCapacity] = useState(true);
  const [colorCode, setColorCode] = useState(true);
  const [showDuration, setShowDuration] = useState(true);

  // Advanced settings state
  const [autoCleaningAfterCheckout, setAutoCleaningAfterCheckout] = useState(true);
  const [cleaningDuration, setCleaningDuration] = useState('15');
  const [autoClearReservations, setAutoClearReservations] = useState('30');
  const [notifyLongOccupancy, setNotifyLongOccupancy] = useState(true);
  const [longOccupancyThreshold, setLongOccupancyThreshold] = useState('90');
  const [allowOverlapping, setAllowOverlapping] = useState(false);
  const [bufferTime, setBufferTime] = useState('15');
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState('60');
  const [requireDeposit, setRequireDeposit] = useState(true);
  const [minPartySize, setMinPartySize] = useState('8');
  const [syncWithPOS, setSyncWithPOS] = useState(true);
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);
  const [kitchenIntegration, setKitchenIntegration] = useState(true);

  const handleSave = useCallback(() => {
    // TODO: Save settings to backend/state
    console.log('Saving settings...');
    onSave();
    onClose();
  }, [onSave, onClose]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 600,
      maxHeight: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.xl as number,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerTitleText: {
      ...typography.titleLarge,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: spacing.xs,
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      ...typography.labelLarge,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
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
      marginBottom: spacing.md,
    },
    formRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    formLabel: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      flex: 1,
    },
    formInput: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surfaceContainerHigh,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md as number,
      minWidth: 80,
      textAlign: 'center',
    },
    dangerZone: {
      backgroundColor: theme.colors.errorContainer,
      borderWidth: 1,
      borderColor: theme.colors.error,
      borderRadius: borderRadius.lg as number,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    dangerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    dangerTitleText: {
      ...typography.titleSmall,
      fontWeight: '600',
      color: theme.colors.error,
    },
    dangerText: {
      ...typography.bodySmall,
      color: theme.colors.onErrorContainer,
      marginBottom: spacing.md,
    },
    dangerActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    colorBox: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm as number,
      marginLeft: spacing.sm,
    },
    colorRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  const renderGeneralSettings = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {/* Table Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Table Configuration</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Default Capacity</Text>
          <TextInput
            style={styles.formInput}
            value={defaultCapacity}
            onChangeText={setDefaultCapacity}
            keyboardType="number-pad"
            placeholder="4"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Table Prefix</Text>
          <TextInput
            style={styles.formInput}
            value={tablePrefix}
            onChangeText={setTablePrefix}
            placeholder="T-"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Auto-assign Tables</Text>
          <Switch
            value={autoAssign}
            onValueChange={setAutoAssign}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Time Limit (min)</Text>
          <TextInput
            style={styles.formInput}
            value={timeLimit}
            onChangeText={setTimeLimit}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>

      {/* Display Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Preferences</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Show Capacity</Text>
          <Switch
            value={showCapacity}
            onValueChange={setShowCapacity}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Color Code by Status</Text>
          <Switch
            value={colorCode}
            onValueChange={setColorCode}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Show Duration</Text>
          <Switch
            value={showDuration}
            onValueChange={setShowDuration}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>
      </View>

      {/* Status Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Colors</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Available</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.success }]} />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Occupied</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.error }]} />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Reserved</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.warning }]} />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Cleaning</Text>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.info }]} />
        </View>
      </View>
    </ScrollView>
  );

  const renderAdvancedSettings = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {/* Auto-Status Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto-Status Management</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Auto cleaning after checkout</Text>
          <Switch
            value={autoCleaningAfterCheckout}
            onValueChange={setAutoCleaningAfterCheckout}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Cleaning duration (min)</Text>
          <TextInput
            style={styles.formInput}
            value={cleaningDuration}
            onChangeText={setCleaningDuration}
            keyboardType="number-pad"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Auto-clear reservations (min)</Text>
          <TextInput
            style={styles.formInput}
            value={autoClearReservations}
            onChangeText={setAutoClearReservations}
            keyboardType="number-pad"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Notify long occupancy</Text>
          <Switch
            value={notifyLongOccupancy}
            onValueChange={setNotifyLongOccupancy}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Alert threshold (min)</Text>
          <TextInput
            style={styles.formInput}
            value={longOccupancyThreshold}
            onChangeText={setLongOccupancyThreshold}
            keyboardType="number-pad"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>

      {/* Reservation Rules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservation Rules</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Allow overlapping</Text>
          <Switch
            value={allowOverlapping}
            onValueChange={setAllowOverlapping}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Buffer time (min)</Text>
          <TextInput
            style={styles.formInput}
            value={bufferTime}
            onChangeText={setBufferTime}
            keyboardType="number-pad"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Max advance booking (days)</Text>
          <TextInput
            style={styles.formInput}
            value={maxAdvanceBooking}
            onChangeText={setMaxAdvanceBooking}
            keyboardType="number-pad"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Require deposit (large groups)</Text>
          <Switch
            value={requireDeposit}
            onValueChange={setRequireDeposit}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Min party size for deposit</Text>
          <TextInput
            style={styles.formInput}
            value={minPartySize}
            onChangeText={setMinPartySize}
            keyboardType="number-pad"
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>

      {/* Integration Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integration Settings</Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Sync with POS</Text>
          <Switch
            value={syncWithPOS}
            onValueChange={setSyncWithPOS}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Real-time updates</Text>
          <Switch
            value={realtimeUpdates}
            onValueChange={setRealtimeUpdates}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Kitchen display</Text>
          <Switch
            value={kitchenIntegration}
            onValueChange={setKitchenIntegration}
            trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <View style={styles.dangerTitle}>
          <Icon name="alert" size={18} color={theme.colors.error} accessibilityLabel="Warning" />
          <Text style={styles.dangerTitleText}>Danger Zone</Text>
        </View>
        <Text style={styles.dangerText}>These actions cannot be undone</Text>
        <View style={styles.dangerActions}>
          <AppleButton
            title="Reset Tables"
            variant="destructive"
            size="small"
            onPress={() => { }}
          />
          <AppleButton
            title="Clear Reservations"
            variant="destructive"
            size="small"
            onPress={() => { }}
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Icon name="cog" size={24} color={theme.colors.primary} accessibilityLabel="Settings" />
                <Text style={styles.headerTitleText}>Settings</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color={theme.colors.onSurfaceVariant} accessibilityLabel="Close" />
              </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'general' && styles.tabActive]}
                onPress={() => setActiveTab('general')}
              >
                <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>
                  General
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'advanced' && styles.tabActive]}
                onPress={() => setActiveTab('advanced')}
              >
                <Text style={[styles.tabText, activeTab === 'advanced' && styles.tabTextActive]}>
                  Advanced
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'general' ? renderGeneralSettings() : renderAdvancedSettings()}

            {/* Footer */}
            <View style={styles.footer}>
              <AppleButton
                title="Cancel"
                variant="secondary"
                size="medium"
                onPress={onClose}
              />
              <AppleButton
                title="Save Changes"
                variant="primary"
                size="medium"
                onPress={handleSave}
              />
            </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default React.memo(SettingsModal);
