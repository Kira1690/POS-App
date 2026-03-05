/**
 * PrinterSettingsPanel - Epson network printer configuration.
 * Follows exact same pattern as TRXSettingsPanel.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { printerStorageService, PrinterConfig } from '@/services/storage/PrinterStorageService';
import { epsonPrinterService } from '@/services/printer/EpsonPrinterService';
import { showToast } from '@/utils/toast';

interface PrinterSettingsPanelProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'ok' | 'error';

export default function PrinterSettingsPanel({ onChangesDetected }: PrinterSettingsPanelProps) {
  const { theme } = useTheme();

  const [receiptEnabled, setReceiptEnabled] = useState(false);
  const [receiptIP, setReceiptIP] = useState('192.168.1.105');
  const [receiptPort, setReceiptPort] = useState('9100');
  const [receiptPaper, setReceiptPaper] = useState<'58mm' | '80mm'>('80mm');
  const [kitchenEnabled, setKitchenEnabled] = useState(false);
  const [kitchenIP, setKitchenIP] = useState('');
  const [kitchenPort, setKitchenPort] = useState('9100');
  const [receiptStatus, setReceiptStatus] = useState<ConnectionStatus>('idle');
  const [kitchenStatus, setKitchenStatus] = useState<ConnectionStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    printerStorageService.getConfig().then(config => {
      setReceiptEnabled(config.receipt_printer.enabled);
      setReceiptIP(config.receipt_printer.ip_address);
      setReceiptPort(String(config.receipt_printer.port));
      setReceiptPaper(config.receipt_printer.paper_size);
      setKitchenEnabled(config.kitchen_printer.enabled);
      setKitchenIP(config.kitchen_printer.ip_address);
      setKitchenPort(String(config.kitchen_printer.port));
    }).catch(() => { /* use defaults */ });
  }, []);

  const markChanged = useCallback(() => onChangesDetected(true), [onChangesDetected]);

  const handleTestReceipt = useCallback(async () => {
    setReceiptStatus('testing');
    const ok = await epsonPrinterService.testConnection(receiptIP, parseInt(receiptPort, 10) || 9100);
    setReceiptStatus(ok ? 'ok' : 'error');
    if (!ok) {
      showToast({ type: 'error', title: 'Connection Failed', message: `Cannot reach ${receiptIP}` });
    }
  }, [receiptIP, receiptPort]);

  const handleTestKitchen = useCallback(async () => {
    setKitchenStatus('testing');
    const ok = await epsonPrinterService.testConnection(kitchenIP, parseInt(kitchenPort, 10) || 9100);
    setKitchenStatus(ok ? 'ok' : 'error');
    if (!ok) {
      showToast({ type: 'error', title: 'Connection Failed', message: `Cannot reach ${kitchenIP}` });
    }
  }, [kitchenIP, kitchenPort]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const config: PrinterConfig = {
        receipt_printer: {
          enabled: receiptEnabled,
          ip_address: receiptIP,
          port: parseInt(receiptPort, 10) || 9100,
          paper_size: receiptPaper,
        },
        kitchen_printer: {
          enabled: kitchenEnabled,
          ip_address: kitchenIP,
          port: parseInt(kitchenPort, 10) || 9100,
        },
      };
      await printerStorageService.saveConfig(config);
      onChangesDetected(false);
      showToast({ type: 'success', title: 'Saved', message: 'Printer settings saved' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save printer settings' });
    } finally {
      setIsSaving(false);
    }
  }, [receiptEnabled, receiptIP, receiptPort, receiptPaper, kitchenEnabled, kitchenIP, kitchenPort, onChangesDetected]);

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
    lastRow: { borderBottomWidth: 0 },
    rowLabel: { flex: 1, ...theme.typography.body1, color: theme.colors.onSurface },
    textInput: {
      flex: 1,
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      textAlign: 'right',
      paddingVertical: theme.spacing.xs,
    },
    chipRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    chip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    chipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    chipText: { ...theme.typography.caption, color: theme.colors.onSurface },
    chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    testButtonText: { ...theme.typography.body2, color: theme.colors.onSurface },
    statusOk: { color: theme.colors.success },
    statusError: { color: theme.colors.error },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    saveButtonText: { ...theme.typography.button, color: theme.colors.onPrimary },
  });

  const statusIcon = (status: ConnectionStatus) => {
    if (status === 'testing') return <ActivityIndicator size="small" color={theme.colors.primary} />;
    if (status === 'ok') return <Text style={styles.statusOk}>✓ Connected</Text>;
    if (status === 'error') return <Text style={styles.statusError}>✗ Failed</Text>;
    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* RECEIPT PRINTER */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Receipt Printer</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Enable Receipt Printer</Text>
          <Switch
            value={receiptEnabled}
            onValueChange={v => { setReceiptEnabled(v); markChanged(); }}
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            testID="toggle-receipt-printer"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>IP Address</Text>
          <TextInput
            style={styles.textInput}
            value={receiptIP}
            onChangeText={v => { setReceiptIP(v); markChanged(); }}
            placeholder="192.168.1.105"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            keyboardType="decimal-pad"
            testID="input-receipt-ip"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Port</Text>
          <TextInput
            style={styles.textInput}
            value={receiptPort}
            onChangeText={v => { setReceiptPort(v); markChanged(); }}
            placeholder="9100"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            keyboardType="numeric"
            testID="input-receipt-port"
          />
        </View>

        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.rowLabel}>Paper Size</Text>
          <View style={styles.chipRow}>
            {(['58mm', '80mm'] as const).map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.chip, receiptPaper === size && styles.chipActive]}
                onPress={() => { setReceiptPaper(size); markChanged(); }}
                testID={`chip-paper-${size.replace('mm', '')}`}
              >
                <Text style={[styles.chipText, receiptPaper === size && styles.chipTextActive]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.testButton}
        onPress={handleTestReceipt}
        disabled={receiptStatus === 'testing'}
        testID="btn-test-receipt"
      >
        <Icon name="printer" size={18} color={theme.colors.primary} accessibilityLabel="Test receipt printer" />
        <Text style={styles.testButtonText}>Test Receipt Printer</Text>
        {statusIcon(receiptStatus)}
      </TouchableOpacity>

      {/* KITCHEN PRINTER */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kitchen Printer</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Enable Kitchen Printer</Text>
          <Switch
            value={kitchenEnabled}
            onValueChange={v => { setKitchenEnabled(v); markChanged(); }}
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            testID="toggle-kitchen-printer"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>IP Address</Text>
          <TextInput
            style={styles.textInput}
            value={kitchenIP}
            onChangeText={v => { setKitchenIP(v); markChanged(); }}
            placeholder="192.168.1.106"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            keyboardType="decimal-pad"
            testID="input-kitchen-ip"
          />
        </View>

        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.rowLabel}>Port</Text>
          <TextInput
            style={styles.textInput}
            value={kitchenPort}
            onChangeText={v => { setKitchenPort(v); markChanged(); }}
            placeholder="9100"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            keyboardType="numeric"
            testID="input-kitchen-port"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.testButton}
        onPress={handleTestKitchen}
        disabled={kitchenStatus === 'testing'}
        testID="btn-test-kitchen"
      >
        <Icon name="printer" size={18} color={theme.colors.primary} accessibilityLabel="Test kitchen printer" />
        <Text style={styles.testButtonText}>Test Kitchen Printer</Text>
        {statusIcon(kitchenStatus)}
      </TouchableOpacity>

      {/* SAVE */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
        testID="btn-save-printer-settings"
      >
        {isSaving
          ? <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          : <Icon name="content-save" size={20} color={theme.colors.onPrimary} accessibilityLabel="Save printer settings" />
        }
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
