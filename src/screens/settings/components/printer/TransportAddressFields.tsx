/**
 * TransportAddressFields — renders address fields appropriate for the selected ConnectionType.
 * LAN: IP + Port text inputs. BT/BLE/USB: read-only device info + Scan button.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { PrinterDiscoveryModal } from './PrinterDiscoveryModal';
import type { ConnectionType } from '@/services/printer/PrinterTransportManager';
import type { DiscoveredPrinter } from '@/services/printer/PrinterTransportManager';

interface TransportAddressFieldsProps {
  connectionType: ConnectionType;
  // LAN
  ip: string;
  port: string;
  onIpChange: (v: string) => void;
  onPortChange: (v: string) => void;
  // BT
  macAddress: string;
  deviceName: string;
  // BLE
  bleDeviceId: string;
  // USB
  usbDeviceName: string;
  // Discovery callback
  onDiscovered: (printer: DiscoveredPrinter) => void;
  testID?: string;
}

export const TransportAddressFields: React.FC<TransportAddressFieldsProps> = ({
  connectionType,
  ip, port, onIpChange, onPortChange,
  macAddress, deviceName, bleDeviceId, usbDeviceName,
  onDiscovered,
  testID = '',
}) => {
  const { theme } = useTheme();
  const [scanOpen, setScanOpen] = useState(false);

  const inputStyle = {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.onSurface,
    textAlign: 'right' as const,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  };

  const readOnlyStyle = {
    ...inputStyle,
    color: theme.colors.onSurfaceSecondary,
  };

  const scanButton = (label: string) => (
    <TouchableOpacity
      onPress={() => setScanOpen(true)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryContainer,
        marginTop: theme.spacing.sm,
      }}
      testID={`btn-scan-${testID}`}
    >
      <Icon name="magnify" size={16} color={theme.colors.primary} accessibilityLabel="Scan" />
      <Text style={{ ...theme.typography.body2, color: theme.colors.primary, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );

  const rowLabel = (label: string) => (
    <Text style={{ ...theme.typography.body1, color: theme.colors.onSurface, flex: 1 }}>
      {label}
    </Text>
  );

  const row = (children: React.ReactNode) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: 52,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    }}>
      {children}
    </View>
  );

  if (connectionType === 'lan') {
    return (
      <>
        {row(<>
          {rowLabel('IP Address')}
          <TextInput
            style={inputStyle}
            value={ip}
            onChangeText={onIpChange}
            placeholder="192.168.1.105"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            keyboardType="decimal-pad"
            testID={`input-ip-${testID}`}
          />
        </>)}
        {row(<>
          {rowLabel('Port')}
          <TextInput
            style={inputStyle}
            value={port}
            onChangeText={onPortChange}
            placeholder="9100"
            placeholderTextColor={theme.colors.onSurfaceSecondary}
            keyboardType="numeric"
            testID={`input-port-${testID}`}
          />
        </>)}
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          {scanButton('Scan Network')}
        </View>
        <PrinterDiscoveryModal
          visible={scanOpen}
          connectionType="lan"
          onSelect={onDiscovered}
          onClose={() => setScanOpen(false)}
        />
      </>
    );
  }

  if (connectionType === 'bluetooth') {
    return (
      <>
        {row(<>
          {rowLabel('Device Name')}
          <TextInput style={readOnlyStyle} value={deviceName || '(not set)'} editable={false} />
        </>)}
        {row(<>
          {rowLabel('MAC Address')}
          <TextInput style={readOnlyStyle} value={macAddress || '(not set)'} editable={false} />
        </>)}
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          {scanButton('Scan for Bluetooth Printers')}
        </View>
        <PrinterDiscoveryModal
          visible={scanOpen}
          connectionType="bluetooth"
          onSelect={onDiscovered}
          onClose={() => setScanOpen(false)}
        />
      </>
    );
  }

  if (connectionType === 'ble') {
    return (
      <>
        {row(<>
          {rowLabel('Device Name')}
          <TextInput style={readOnlyStyle} value={deviceName || '(not set)'} editable={false} />
        </>)}
        {row(<>
          {rowLabel('Device ID')}
          <TextInput style={readOnlyStyle} value={bleDeviceId || '(not set)'} editable={false} />
        </>)}
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          {scanButton('Scan for BLE Printers')}
        </View>
        <PrinterDiscoveryModal
          visible={scanOpen}
          connectionType="ble"
          onSelect={onDiscovered}
          onClose={() => setScanOpen(false)}
        />
      </>
    );
  }

  // USB
  return (
    <>
      {row(<>
        {rowLabel('USB Device')}
        <TextInput style={readOnlyStyle} value={usbDeviceName || '(not connected)'} editable={false} />
      </>)}
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
        {scanButton('Detect USB Printer')}
      </View>
      <PrinterDiscoveryModal
        visible={scanOpen}
        connectionType="usb"
        onSelect={onDiscovered}
        onClose={() => setScanOpen(false)}
      />
    </>
  );
};
