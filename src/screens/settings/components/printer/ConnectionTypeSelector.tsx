/**
 * ConnectionTypeSelector — chip row for selecting printer connection type.
 * Only shows chips for transports whose native module is loaded.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { printerTransportManager } from '@/services/printer/PrinterTransportManager';
import type { ConnectionType } from '@/services/printer/PrinterTransportManager';

const CONNECTION_LABELS: Record<ConnectionType, string> = {
  lan: 'LAN',
  bluetooth: 'Bluetooth',
  ble: 'BLE',
  usb: 'USB',
};

const ALL_TYPES: ConnectionType[] = ['lan', 'bluetooth', 'ble', 'usb'];

interface ConnectionTypeSelectorProps {
  value: ConnectionType;
  onChange: (type: ConnectionType) => void;
}

export const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = ({ value, onChange }) => {
  const { theme } = useTheme();

  // Always show LAN; show others only if native module is loaded
  const available = ALL_TYPES.filter(t => {
    if (t === 'lan') return true;
    return printerTransportManager.getTransport(t).isAvailable();
  });

  // If only LAN is available, render nothing (no choice to make)
  if (available.length <= 1) return null;

  return (
    <View style={{
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    }}>
      {available.map(type => {
        const active = value === type;
        return (
          <TouchableOpacity
            key={type}
            onPress={() => onChange(type)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.sm,
              borderWidth: 1,
              borderColor: active ? theme.colors.primary : theme.colors.outline,
              backgroundColor: active ? theme.colors.primaryContainer : undefined,
            }}
            testID={`chip-connection-${type}`}
          >
            <Text style={{
              ...theme.typography.body2,
              color: active ? theme.colors.primary : theme.colors.onSurface,
              fontWeight: active ? '600' : '400',
            }}>
              {CONNECTION_LABELS[type]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
