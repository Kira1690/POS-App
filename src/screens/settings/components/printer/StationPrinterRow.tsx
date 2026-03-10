/**
 * StationPrinterRow - Expandable row for per-station printer assignment.
 * Collapsed: station name + connection info or "(uses default)" + [Edit]
 * Expanded: ConnectionTypeSelector + TransportAddressFields + [Test] + [Print Test] + [Save] + [Remove]
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@/components/common';
import { ConnectionTypeSelector } from './ConnectionTypeSelector';
import { TransportAddressFields } from './TransportAddressFields';
import { toPrinterAddress } from '@/services/storage/PrinterStorageService';
import { KITCHEN_STATION_LABELS } from '@/types/order-extended.types';
import type { KitchenStation } from '@/types/order-extended.types';
import type { StationPrinter, ConnectionType } from '@/services/storage/PrinterStorageService';
import type { PrinterAddress, DiscoveredPrinter } from '@/services/printer/PrinterTransportManager';

interface StationPrinterRowProps {
  station: KitchenStation;
  stationColor: string;
  existing: StationPrinter | undefined;
  onSave: (printer: Omit<StationPrinter, 'updated_at'>) => Promise<void>;
  onDelete: (station: KitchenStation) => Promise<void>;
  onTest: (address: PrinterAddress) => Promise<boolean>;
  onPrintTest: (address: PrinterAddress) => Promise<void>;
}

function addressLabel(printer: StationPrinter): string {
  switch (printer.connection_type) {
    case 'lan':       return printer.ip_address || '(no IP)';
    case 'bluetooth': return printer.device_name ? `${printer.device_name} (BT)` : (printer.mac_address || 'BT');
    case 'ble':       return printer.device_name ? `${printer.device_name} (BLE)` : 'BLE';
    case 'usb':       return printer.usb_device_name ? `${printer.usb_device_name} (USB)` : 'USB';
    default:          return printer.ip_address;
  }
}

export const StationPrinterRow: React.FC<StationPrinterRowProps> = ({
  station,
  stationColor,
  existing,
  onSave,
  onDelete,
  onTest,
  onPrintTest,
}) => {
  const { theme } = useTheme();
  const { isPhone } = useResponsive();
  const [expanded, setExpanded] = useState(false);

  // Local edit state — mirrors StationPrinter fields
  const [connectionType, setConnectionType] = useState<ConnectionType>(existing?.connection_type ?? 'lan');
  const [ip, setIP] = useState(existing?.ip_address ?? '');
  const [port, setPort] = useState(String(existing?.port ?? 9100));
  const [macAddress, setMacAddress] = useState(existing?.mac_address ?? '');
  const [deviceName, setDeviceName] = useState(existing?.device_name ?? '');
  const [bleDeviceId, setBleDeviceId] = useState(existing?.ble_device_id ?? '');
  const [usbDeviceName, setUsbDeviceName] = useState(existing?.usb_device_name ?? '');
  const [name, setName] = useState(existing?.printer_name ?? `${KITCHEN_STATION_LABELS[station]} Printer`);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const buildAddress = useCallback((): PrinterAddress => ({
    connectionType,
    ip: ip || undefined,
    port: parseInt(port, 10) || 9100,
    macAddress: macAddress || undefined,
    deviceName: deviceName || undefined,
    bleDeviceId: bleDeviceId || undefined,
    usbDeviceName: usbDeviceName || undefined,
  }), [connectionType, ip, port, macAddress, deviceName, bleDeviceId, usbDeviceName]);

  const hasAddress = useCallback((): boolean => {
    switch (connectionType) {
      case 'lan':       return !!ip;
      case 'bluetooth': return !!macAddress;
      case 'ble':       return !!bleDeviceId;
      case 'usb':       return !!usbDeviceName;
      default:          return false;
    }
  }, [connectionType, ip, macAddress, bleDeviceId, usbDeviceName]);

  const handleTest = useCallback(async () => {
    if (!hasAddress()) return;
    setTesting(true);
    const ok = await onTest(buildAddress());
    setTestResult(ok);
    setTesting(false);
  }, [hasAddress, buildAddress, onTest]);

  const handlePrintTest = useCallback(async () => {
    if (!hasAddress()) return;
    await onPrintTest(buildAddress());
  }, [hasAddress, buildAddress, onPrintTest]);

  const handleSave = useCallback(async () => {
    if (!hasAddress()) return;
    await onSave({
      id: existing?.id ?? `sp_${station}_${Date.now()}`,
      station,
      printer_name: name,
      connection_type: connectionType,
      ip_address: ip,
      port: parseInt(port, 10) || 9100,
      mac_address: macAddress,
      device_name: deviceName,
      ble_device_id: bleDeviceId,
      usb_vendor_id: existing?.usb_vendor_id ?? 0,
      usb_product_id: existing?.usb_product_id ?? 0,
      usb_device_name: usbDeviceName,
      enabled: true,
    });
    setExpanded(false);
  }, [existing, station, name, connectionType, ip, port, macAddress, deviceName, bleDeviceId, usbDeviceName, hasAddress, onSave]);

  const handleRemove = useCallback(async () => {
    await onDelete(station);
    setIP('');
    setPort('9100');
    setMacAddress('');
    setDeviceName('');
    setBleDeviceId('');
    setUsbDeviceName('');
    setConnectionType('lan');
    setTestResult(null);
    setExpanded(false);
  }, [station, onDelete]);

  const handleDiscovered = useCallback((printer: DiscoveredPrinter) => {
    const a = printer.address;
    setConnectionType(a.connectionType);
    if (a.ip) setIP(a.ip);
    if (a.port) setPort(String(a.port));
    if (a.macAddress) setMacAddress(a.macAddress);
    if (a.deviceName) setDeviceName(a.deviceName);
    if (a.bleDeviceId) setBleDeviceId(a.bleDeviceId);
    if (a.usbDeviceName) setUsbDeviceName(a.usbDeviceName);
    if (printer.name) setName(printer.name);
  }, []);

  const stationLabel = KITCHEN_STATION_LABELS[station] || station;

  const nameInputStyle = {
    ...theme.typography.body1,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  };

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
      {/* Collapsed row */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: 52,
        }}
        onPress={() => setExpanded(!expanded)}
        testID={`btn-station-printer-${station}`}
      >
        <View style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: stationColor,
          marginRight: theme.spacing.sm,
        }} />
        <Text style={{ ...theme.typography.body1, color: theme.colors.onSurface, flex: 1 }}>
          {stationLabel}
        </Text>
        <Text style={{
          ...theme.typography.body2,
          color: existing ? theme.colors.onSurface : theme.colors.onSurfaceSecondary,
          marginRight: theme.spacing.sm,
        }}>
          {existing ? addressLabel(existing) : '(uses default)'}
        </Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.onSurfaceSecondary}
          accessibilityLabel={expanded ? 'Collapse' : 'Expand'}
        />
      </TouchableOpacity>

      {/* Expanded editor */}
      {expanded && (
        <View style={{ paddingBottom: theme.spacing.md }}>
          {/* Printer name */}
          <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
            <Text style={{ ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, marginBottom: theme.spacing.xs }}>
              Printer Name
            </Text>
            <TextInput
              style={nameInputStyle}
              value={name}
              onChangeText={setName}
              placeholder="Station Printer"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              testID={`input-station-name-${station}`}
            />
          </View>

          {/* Connection type */}
          <View style={{
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
          }}>
            <Text style={{ ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, marginBottom: theme.spacing.xs }}>
              Connection Type
            </Text>
            <ConnectionTypeSelector value={connectionType} onChange={setConnectionType} />
          </View>

          {/* Address fields */}
          <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.outline }}>
            <TransportAddressFields
              connectionType={connectionType}
              ip={ip}
              port={port}
              onIpChange={setIP}
              onPortChange={setPort}
              macAddress={macAddress}
              deviceName={deviceName}
              bleDeviceId={bleDeviceId}
              usbDeviceName={usbDeviceName}
              onDiscovered={handleDiscovered}
              testID={`station-${station}`}
            />
          </View>

          {/* Action buttons */}
          <View style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            flexWrap: 'wrap',
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.sm,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.xs,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
              onPress={handleTest}
              disabled={testing || !hasAddress()}
              testID={`btn-test-station-${station}`}
            >
              {testing
                ? <ActivityIndicator size="small" color={theme.colors.tertiary} />
                : <Icon name="connection" size={16} color={theme.colors.tertiary} accessibilityLabel="Test" />
              }
              <Text style={{ ...theme.typography.body2, color: theme.colors.onSurface }}>Test</Text>
              {testResult !== null && (
                <Text style={{ ...theme.typography.caption, color: testResult ? theme.colors.success : theme.colors.error }}>
                  {testResult ? '✓' : '✗'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.xs,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
              onPress={handlePrintTest}
              disabled={!hasAddress()}
              testID={`btn-print-test-station-${station}`}
            >
              <Icon name="printer" size={16} color={theme.colors.tertiary} accessibilityLabel="Print test page" />
              <Text style={{ ...theme.typography.body2, color: theme.colors.onSurface }}>Print Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.xs,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.tertiaryContainer,
                borderWidth: 1,
                borderColor: theme.colors.tertiary,
              }}
              onPress={handleSave}
              disabled={!hasAddress()}
              testID={`btn-save-station-${station}`}
            >
              <Icon name="content-save" size={16} color={theme.colors.tertiary} accessibilityLabel="Save" />
              <Text style={{ ...theme.typography.body2, color: theme.colors.tertiary, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>

            {existing && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.sm,
                  borderWidth: 1,
                  borderColor: theme.colors.error,
                }}
                onPress={handleRemove}
                testID={`btn-remove-station-${station}`}
              >
                <Icon name="delete-outline" size={16} color={theme.colors.error} accessibilityLabel="Remove" />
                <Text style={{ ...theme.typography.body2, color: theme.colors.error }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
