import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { useTRXSettings } from '@/hooks/trx/useTRXSettings';
import { TRXTerminalScreen } from '@/screens/settings/TRXTerminalScreen';

interface TRXSettingsPanelProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

const TIP_PRESETS = [15, 18, 20, 25];

export default function TRXSettingsPanel({ onChangesDetected }: TRXSettingsPanelProps) {
  const { theme } = useTheme();
  const { settings, updateSetting, resetToDefaults, loading } = useTRXSettings();
  const [showTerminalScreen, setShowTerminalScreen] = useState(false);

  const styles = StyleSheet.create({
    container: { flex: 1 },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
    },
    sectionHeader: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    sectionTitle: {
      ...theme.typography.title3,
      color: theme.colors.onSurfaceSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: 52,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      flex: 1,
      ...theme.typography.body1,
      color: theme.colors.onSurface,
    },
    rowValue: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceSecondary,
      marginRight: theme.spacing.xs,
    },
    textInput: {
      flex: 1,
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      textAlign: 'right',
      paddingVertical: theme.spacing.xs,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    buttonText: {
      ...theme.typography.label,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    resetButton: {
      backgroundColor: theme.colors.errorContainer,
      marginTop: theme.spacing.sm,
    },
    resetButtonText: {
      color: theme.colors.error,
    },
    tipPresetsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    tipPreset: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceLight,
    },
    tipPresetActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tipPresetText: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
    },
    tipPresetTextActive: {
      color: theme.colors.onPrimary,
    },
    infoText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      fontStyle: 'italic',
    },
  });

  const handleUpdate = async (field: keyof typeof settings, value: unknown) => {
    const success = await updateSetting(field as keyof typeof settings, value as never);
    if (success) onChangesDetected(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Store & Tax */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Store & Tax</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Store Name</Text>
          <TextInput
            style={styles.textInput}
            value={settings.storeName}
            onChangeText={(v) => handleUpdate('storeName', v)}
            placeholder="Store name"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
          />
        </View>
        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.rowLabel}>Tax Rate</Text>
          <TextInput
            style={styles.textInput}
            value={String((settings.taxRate * 100).toFixed(1))}
            onChangeText={(v) => handleUpdate('taxRate', parseFloat(v) / 100 || 0)}
            keyboardType="decimal-pad"
            placeholder="8.0"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
          />
          <Text style={styles.rowValue}>%</Text>
        </View>
      </View>

      {/* CC Surcharge */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CC Surcharge</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Enable CC Surcharge</Text>
          <Switch
            value={settings.ccSurchargeEnabled}
            onValueChange={(v) => handleUpdate('ccSurchargeEnabled', v)}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
        {settings.ccSurchargeEnabled && (
          <>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Processing Fee</Text>
              <TextInput
                style={styles.textInput}
                value={String((settings.ccProcessingFee * 100).toFixed(1))}
                onChangeText={(v) => handleUpdate('ccProcessingFee', parseFloat(v) / 100 || 0)}
                keyboardType="decimal-pad"
                placeholder="2.9"
                placeholderTextColor={theme.colors.onSurfaceSecondary}
              />
              <Text style={styles.rowValue}>%</Text>
            </View>
            <Text style={styles.infoText}>Applied to card transactions (subtotal + tax)</Text>
          </>
        )}
        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.rowLabel}>Show Itemized Breakdown</Text>
          <Switch
            value={settings.showItemizedBreakdown}
            onValueChange={(v) => handleUpdate('showItemizedBreakdown', v)}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
      </View>

      {/* Gratuity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gratuity (Tip)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Enable Tip/Gratuity</Text>
          <Switch
            value={settings.gratuityEnabled}
            onValueChange={(v) => handleUpdate('gratuityEnabled', v)}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
        {settings.gratuityEnabled && (
          <>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Allow Custom Tip</Text>
              <Switch
                value={settings.allowCustomTip}
                onValueChange={(v) => handleUpdate('allowCustomTip', v)}
                trackColor={{ true: theme.colors.primary }}
              />
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.rowLabel}>Default Tip Presets</Text>
            </View>
            <View style={styles.tipPresetsRow}>
              {TIP_PRESETS.map((pct) => {
                const isActive = (settings.defaultTipRates ?? []).includes(pct);
                return (
                  <TouchableOpacity
                    key={pct}
                    style={[styles.tipPreset, isActive && styles.tipPresetActive]}
                    onPress={() => {
                      const current = settings.defaultTipRates ?? [];
                      const next = isActive
                        ? current.filter((r: number) => r !== pct)
                        : [...current, pct].sort((a, b) => a - b);
                      handleUpdate('defaultTipRates', next);
                    }}
                  >
                    <Text style={[styles.tipPresetText, isActive && styles.tipPresetTextActive]}>
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

      {/* Terminal Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Terminal Management</Text>
        </View>
        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.rowLabel}>Preferred Port</Text>
          <TextInput
            style={styles.textInput}
            value={String(settings.preferredPort || 1180)}
            onChangeText={(v) => handleUpdate('preferredPort', parseInt(v, 10) || 1180)}
            keyboardType="number-pad"
            placeholder="1180"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setShowTerminalScreen(true)}>
        <Icon name="lan-connect" size={20} color={theme.colors.onPrimary} accessibilityLabel="Manage terminals" />
        <Text style={styles.buttonText}>Manage Terminals</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={resetToDefaults}
      >
        <Text style={[styles.buttonText, styles.resetButtonText]}>Reset TRX to Defaults</Text>
      </TouchableOpacity>

      {/* Terminal Management Modal */}
      <Modal
        visible={showTerminalScreen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTerminalScreen(false)}
      >
        <TRXTerminalScreen onClose={() => setShowTerminalScreen(false)} />
      </Modal>
    </ScrollView>
  );
}
