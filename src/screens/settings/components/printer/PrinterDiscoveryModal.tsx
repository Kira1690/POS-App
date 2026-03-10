/**
 * PrinterDiscoveryModal — scan for printers and let user select one.
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { printerTransportManager } from '@/services/printer/PrinterTransportManager';
import { requestBluetoothPermissions, requestBlePermissions } from '@/services/printer/PrinterPermissions';
import type { DiscoveredPrinter, ConnectionType } from '@/services/printer/PrinterTransportManager';

interface PrinterDiscoveryModalProps {
  visible: boolean;
  connectionType: ConnectionType;
  onSelect: (printer: DiscoveredPrinter) => void;
  onClose: () => void;
}

export const PrinterDiscoveryModal: React.FC<PrinterDiscoveryModalProps> = ({
  visible,
  connectionType,
  onSelect,
  onClose,
}) => {
  const { theme } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<DiscoveredPrinter[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setScanning(true);
    setError(null);
    setFound([]);

    try {
      // Request permissions for BT/BLE before scanning
      if (connectionType === 'bluetooth') {
        const { granted } = await requestBluetoothPermissions();
        if (!granted) {
          setError('Bluetooth permission denied. Please enable in system settings.');
          setScanning(false);
          return;
        }
      } else if (connectionType === 'ble') {
        const { granted } = await requestBlePermissions();
        if (!granted) {
          setError('Location/BLE permission denied. Please enable in system settings.');
          setScanning(false);
          return;
        }
      }

      const results = await printerTransportManager.discoverAll(connectionType, 10_000);
      setFound(results);
      if (results.length === 0) setError('No printers found. Ensure printer is powered on and connected.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  }, [connectionType]);

  const handleSelect = useCallback((printer: DiscoveredPrinter) => {
    onSelect(printer);
    onClose();
  }, [onSelect, onClose]);

  const signalLabel = (printer: DiscoveredPrinter): string => {
    if (printer.responseTime !== undefined) return `${printer.responseTime}ms`;
    if (printer.rssi !== undefined) return `${printer.rssi} dBm`;
    return '';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
      }}>
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          width: '100%',
          maxWidth: 480,
          maxHeight: '80%',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}>
            <Text style={{ ...theme.typography.title2, color: theme.colors.onSurface, flex: 1 }}>
              Scan for Printers
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.onSurfaceSecondary} accessibilityLabel="Close" />
            </TouchableOpacity>
          </View>

          {/* Results */}
          <FlatList
            data={found}
            keyExtractor={item => item.address.bleDeviceId ?? item.address.macAddress ?? item.address.ip ?? item.name}
            style={{ flexGrow: 0, maxHeight: 300 }}
            contentContainerStyle={{ padding: theme.spacing.sm }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', padding: theme.spacing.lg }}>
                {scanning ? (
                  <>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ ...theme.typography.body2, color: theme.colors.onSurfaceSecondary, marginTop: theme.spacing.sm }}>
                      Scanning…
                    </Text>
                  </>
                ) : error ? (
                  <Text style={{ ...theme.typography.body2, color: theme.colors.error, textAlign: 'center' }}>
                    {error}
                  </Text>
                ) : (
                  <Text style={{ ...theme.typography.body2, color: theme.colors.onSurfaceSecondary }}>
                    Tap "Scan" to find printers
                  </Text>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.sm,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  marginBottom: theme.spacing.xs,
                }}
              >
                <Icon name="printer" size={20} color={theme.colors.primary} accessibilityLabel="Printer" />
                <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                  <Text style={{ ...theme.typography.body1, color: theme.colors.onSurface }}>
                    {item.name}
                  </Text>
                  <Text style={{ ...theme.typography.caption, color: theme.colors.onSurfaceSecondary }}>
                    {item.address.ip ?? item.address.macAddress ?? item.address.bleDeviceId ?? item.address.usbDeviceName}
                    {signalLabel(item) ? `  •  ${signalLabel(item)}` : ''}
                  </Text>
                </View>
                <Icon name="chevron-right" size={16} color={theme.colors.onSurfaceSecondary} accessibilityLabel="Select" />
              </TouchableOpacity>
            )}
          />

          {/* Footer */}
          <View style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
          }}>
            <TouchableOpacity
              onPress={scan}
              disabled={scanning}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.xs,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.primaryContainer,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              }}
            >
              {scanning
                ? <ActivityIndicator size="small" color={theme.colors.primary} />
                : <Icon name="magnify" size={18} color={theme.colors.primary} accessibilityLabel="Scan" />
              }
              <Text style={{ ...theme.typography.body2, color: theme.colors.primary, fontWeight: '600' }}>
                {scanning ? 'Scanning…' : found.length > 0 ? 'Rescan' : 'Scan'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
            >
              <Text style={{ ...theme.typography.body2, color: theme.colors.onSurface }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
