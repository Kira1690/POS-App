import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { DiscoveredTerminal } from '@/services/trx/pos/TerminalDiscoveryService';

interface TRXTerminalListProps {
  isScanning: boolean;
  terminals: DiscoveredTerminal[];
  preferredTerminal: DiscoveredTerminal | null;
  isConnecting: boolean;
  onSelectPreferred: (ip: string, port: number) => void;
  onScanTerminals: () => void;
}

export const TRXTerminalList: React.FC<TRXTerminalListProps> = ({
  isScanning,
  terminals,
  preferredTerminal,
  isConnecting,
  onSelectPreferred,
  onScanTerminals,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    terminalListContainer: {
      flex: 1,
    },
    sectionTitle: {
      ...theme.typography.headline,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    scanButton: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    scanningButton: {
      opacity: 0.6,
    },
    scanButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSuccess,
    },
    scanningContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    scanningText: {
      ...theme.typography.body,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
    },
    resultsContainer: {
      marginTop: theme.spacing.md,
    },
    resultsTitle: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    terminalItem: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outlineLight,
    },
    preferredTerminal: {
      backgroundColor: theme.colors.successContainer,
      borderColor: theme.colors.success,
    },
    offlineTerminal: {
      opacity: 0.6,
    },
    terminalInfo: {
      flex: 1,
    },
    terminalIp: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    preferredText: {
      color: theme.colors.success,
    },
    terminalStatus: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
    },
    terminalActions: {
      marginLeft: theme.spacing.md,
    },
    selectButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xs,
      minWidth: 80,
      alignItems: 'center',
    },
    preferredButton: {
      backgroundColor: theme.colors.success,
    },
    disabledButton: {
      backgroundColor: theme.colors.surfaceDisabled,
    },
    selectButtonText: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.onSuccess,
    },
    preferredButtonText: {
      color: theme.colors.onSuccess,
    },
    disabledButtonText: {
      color: theme.colors.onSurfaceDisabled,
    },
  });

  const renderTerminal = (item: DiscoveredTerminal) => {
    const isPreferred = preferredTerminal?.ip === item.ip && preferredTerminal?.port === item.port;
    const isCurrentlyConnecting = isConnecting && item.ip === preferredTerminal?.ip;

    return (
      <View
        key={`${item.ip}:${item.port}`}
        testID={`terminal-item-${item.ip}`}
        style={[
          styles.terminalItem,
          isPreferred && styles.preferredTerminal,
          !item.isOnline && styles.offlineTerminal,
        ]}
      >
        <View style={styles.terminalInfo}>
          <Text testID={`terminal-ip-${item.ip}`} style={[styles.terminalIp, isPreferred && styles.preferredText]}>
            {item.ip}:{item.port}
          </Text>
          <Text style={[styles.terminalStatus, isPreferred && styles.preferredText]}>
            {item.isOnline ? 'Online' : 'Offline'}
            {item.responseTime && ` - ${item.responseTime}ms`}
            {isPreferred && ' - Preferred'}
          </Text>
        </View>

        <View style={styles.terminalActions}>
          {isCurrentlyConnecting ? (
            <ActivityIndicator color={theme.colors.success} size="small" />
          ) : (
            <TouchableOpacity
              style={[
                styles.selectButton,
                isPreferred && styles.preferredButton,
                !item.isOnline && styles.disabledButton,
              ]}
              onPress={() => !isCurrentlyConnecting && onSelectPreferred(item.ip, item.port)}
              disabled={isCurrentlyConnecting || !item.isOnline}
            >
              <Text style={[
                styles.selectButtonText,
                isPreferred && styles.preferredButtonText,
                !item.isOnline && styles.disabledButtonText,
              ]}>
                {isPreferred ? 'Preferred' : 'Select'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.terminalListContainer}>
      <Text style={styles.sectionTitle}>Discover New Terminals</Text>

      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanningButton]}
        onPress={onScanTerminals}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator color={theme.colors.onSuccess} size="small" />
        ) : (
          <>
            <MaterialIcons name="search" size={20} color={theme.colors.onSuccess} />
            <Text style={styles.scanButtonText}>Scan Network</Text>
          </>
        )}
      </TouchableOpacity>

      {isScanning && (
        <View style={styles.scanningContainer}>
          <Text style={styles.scanningText}>Scanning network...</Text>
        </View>
      )}

      {terminals.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Found Terminals:</Text>
          {terminals.map((terminal) => renderTerminal(terminal))}
        </View>
      )}
    </View>
  );
};
