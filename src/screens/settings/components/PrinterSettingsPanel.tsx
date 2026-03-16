/**
 * PrinterSettingsPanel - Full printer configuration UI.
 * Receipt printer, default kitchen printer, and per-station printers.
 * Supports LAN, Bluetooth, BLE, and USB connection types.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { useKitchenConfig } from '@/context/kitchen/KitchenConfigContext';
import { usePrinterSettings, type ConnectionStatus } from '@/hooks/usePrinterSettings';
import { ConnectionTypeSelector } from './printer/ConnectionTypeSelector';
import { TransportAddressFields } from './printer/TransportAddressFields';
import { StationPrinterRow } from './printer/StationPrinterRow';
import type { KitchenStation } from '@/types/order-extended.types';
import type { DiscoveredPrinter } from '@/services/printer/PrinterTransportManager';

interface PrinterSettingsPanelProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

const STATION_COLORS: Record<string, string> = {
  hot_kitchen: '#E53935',
  cold_kitchen: '#1E88E5',
  grill: '#FB8C00',
  desserts: '#D81B60',
  beverages: '#43A047',
  bar: '#8E24AA',
};

export default function PrinterSettingsPanel({ onChangesDetected }: PrinterSettingsPanelProps) {
  const { theme } = useTheme();
  const { stations } = useKitchenConfig();
  const settings = usePrinterSettings(onChangesDetected);

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
    chipRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    chipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    chipText: { ...theme.typography.body2, color: theme.colors.onSurface },
    chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
    connectionTypeRow: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    connectionTypeLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.xs,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    actionButtonText: { ...theme.typography.body2, color: theme.colors.onSurface },
    statusOk: { color: theme.colors.success },
    statusError: { color: theme.colors.error },
    statusTimestamp: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, marginLeft: theme.spacing.xs },
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
    infoText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      lineHeight: 20,
    },
  });

  const statusIcon = (status: ConnectionStatus, timestamp?: number) => {
    if (status === 'testing') return <ActivityIndicator size="small" color={theme.colors.primary} />;
    if (status === 'ok') return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.statusOk}>Connected</Text>
        {timestamp && <Text style={styles.statusTimestamp}>{settings.formatStatusTimestamp(timestamp)}</Text>}
      </View>
    );
    if (status === 'error') return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.statusError}>Failed</Text>
        {timestamp && <Text style={styles.statusTimestamp}>{settings.formatStatusTimestamp(timestamp)}</Text>}
      </View>
    );
    return null;
  };

  const activeStations = stations.filter(s => s.isActive);

  const handleReceiptDiscovered = (printer: DiscoveredPrinter) => {
    settings.selectDiscoveredPrinter(printer, 'receipt');
  };

  const handleKitchenDiscovered = (printer: DiscoveredPrinter) => {
    settings.selectDiscoveredPrinter(printer, 'kitchen');
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
            value={settings.receiptEnabled}
            onValueChange={settings.setReceiptEnabled}
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            testID="toggle-receipt-printer"
          />
        </View>

        <View style={styles.connectionTypeRow}>
          <Text style={styles.connectionTypeLabel}>Connection Type</Text>
          <ConnectionTypeSelector
            value={settings.receiptConnectionType}
            onChange={settings.setReceiptConnectionType}
          />
        </View>

        <TransportAddressFields
          connectionType={settings.receiptConnectionType}
          ip={settings.receiptIP}
          port={settings.receiptPort}
          onIpChange={settings.setReceiptIP}
          onPortChange={settings.setReceiptPort}
          macAddress={settings.receiptMacAddress}
          deviceName={settings.receiptDeviceName}
          bleDeviceId={settings.receiptBleDeviceId}
          usbDeviceName={settings.receiptUsbDeviceName}
          onDiscovered={handleReceiptDiscovered}
          testID="receipt"
        />

        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.rowLabel}>Paper Size</Text>
          <View style={styles.chipRow}>
            {(['58mm', '80mm'] as const).map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.chip, settings.receiptPaper === size && styles.chipActive]}
                onPress={() => settings.setReceiptPaper(size)}
                testID={`chip-paper-${size.replace('mm', '')}`}
              >
                <Text style={[styles.chipText, settings.receiptPaper === size && styles.chipTextActive]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={settings.testReceipt}
            disabled={settings.receiptStatus.status === 'testing'}
            testID="btn-test-receipt"
          >
            <Icon name="connection" size={16} color={theme.colors.primary} accessibilityLabel="Test receipt" />
            <Text style={styles.actionButtonText}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => settings.printTestPage(settings.buildReceiptAddress())}
            testID="btn-print-test-receipt"
          >
            <Icon name="printer" size={16} color={theme.colors.primary} accessibilityLabel="Print test page" />
            <Text style={styles.actionButtonText}>Print Test Page</Text>
          </TouchableOpacity>
          {statusIcon(settings.receiptStatus.status, settings.receiptStatus.timestamp)}
        </View>
      </View>

      {/* DEFAULT KITCHEN PRINTER */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Default Kitchen Printer</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Enable Kitchen Printer</Text>
          <Switch
            value={settings.kitchenEnabled}
            onValueChange={settings.setKitchenEnabled}
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            testID="toggle-kitchen-printer"
          />
        </View>

        <View style={styles.connectionTypeRow}>
          <Text style={styles.connectionTypeLabel}>Connection Type</Text>
          <ConnectionTypeSelector
            value={settings.kitchenConnectionType}
            onChange={settings.setKitchenConnectionType}
          />
        </View>

        <TransportAddressFields
          connectionType={settings.kitchenConnectionType}
          ip={settings.kitchenIP}
          port={settings.kitchenPort}
          onIpChange={settings.setKitchenIP}
          onPortChange={settings.setKitchenPort}
          macAddress={settings.kitchenMacAddress}
          deviceName={settings.kitchenDeviceName}
          bleDeviceId={settings.kitchenBleDeviceId}
          usbDeviceName={settings.kitchenUsbDeviceName}
          onDiscovered={handleKitchenDiscovered}
          testID="kitchen"
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={settings.testKitchen}
            disabled={settings.kitchenStatus.status === 'testing'}
            testID="btn-test-kitchen"
          >
            <Icon name="connection" size={16} color={theme.colors.primary} accessibilityLabel="Test kitchen" />
            <Text style={styles.actionButtonText}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => settings.printTestPage(settings.buildKitchenAddress())}
            testID="btn-print-test-kitchen"
          >
            <Icon name="printer" size={16} color={theme.colors.primary} accessibilityLabel="Print test page" />
            <Text style={styles.actionButtonText}>Print Test Page</Text>
          </TouchableOpacity>
          {statusIcon(settings.kitchenStatus.status, settings.kitchenStatus.timestamp)}
        </View>
      </View>

      {/* STATION PRINTERS */}
      {activeStations.length === 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Station Printers</Text>
          </View>
          <Text style={styles.infoText}>
            No active kitchen stations configured. Go to Kitchen Management to add stations, then return here to assign dedicated printers.
          </Text>
        </View>
      )}
      {activeStations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Station Printers</Text>
          </View>

          <Text style={styles.infoText}>
            Assign dedicated printers to kitchen stations. Unassigned stations use the default kitchen printer above.
          </Text>

          {activeStations.map(station => (
            <StationPrinterRow
              key={station.station}
              station={station.station as KitchenStation}
              stationColor={STATION_COLORS[station.station] || theme.colors.primary}
              existing={settings.stationPrinters.find(sp => sp.station === station.station)}
              onSave={settings.saveStationPrinter}
              onDelete={settings.deleteStationPrinter}
              onTest={settings.testStation}
              onPrintTest={settings.printTestPage}
            />
          ))}
        </View>
      )}

      {/* SAVE */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={settings.save}
        disabled={settings.isSaving}
        testID="btn-save-printer-settings"
      >
        {settings.isSaving
          ? <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          : <Icon name="content-save" size={20} color={theme.colors.onPrimary} accessibilityLabel="Save printer settings" />
        }
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
