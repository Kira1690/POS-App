import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTRXTerminalConnection } from '@/hooks/trx/useTRXTerminalConnection';
import { TRXTerminalList } from '@/components/business/payment/trx/TRXTerminalList';
import { TRXManualIPInput } from '@/components/business/payment/trx/TRXManualIPInput';
import { isTcpSocketAvailable } from '@/services/trx/pos/TcpSocketWrapper';

interface TRXTerminalScreenProps {
  onClose?: () => void;
}

export const TRXTerminalScreen: React.FC<TRXTerminalScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const tcpAvailable = isTcpSocketAvailable();

  const {
    isScanning,
    discoveredTerminals,
    currentTerminal,
    isConnected,
    isConnecting,
    isAddingManualTerminal,
    scanForTerminals,
    addManualTerminal,
    connectToTerminal,
    connectionStatus,
  } = useTRXTerminalConnection();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.headline,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    headerSpacer: {
      width: 48,
    },
    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: isConnected ? theme.colors.successContainer : theme.colors.surfaceLight,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isConnected ? theme.colors.success : theme.colors.error,
    },
    statusText: {
      ...theme.typography.body1,
      color: isConnected ? theme.colors.success : theme.colors.onSurfaceSecondary,
      flex: 1,
    },
    currentTerminalText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceSecondary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.title2,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    unavailableBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.warningContainer,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    unavailableBannerText: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Terminal Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Connection Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{connectionStatus}</Text>
        {currentTerminal && (
          <Text style={styles.currentTerminalText}>
            {currentTerminal.ip}:{currentTerminal.port}
          </Text>
        )}
      </View>

      {/* Expo Go / native module unavailable banner */}
      {!tcpAvailable && (
        <View style={styles.unavailableBanner}>
          <MaterialIcons name="warning" size={18} color={theme.colors.warning} />
          <Text style={styles.unavailableBannerText}>
            TRX Terminal requires a custom dev build — not available in Expo Go.
            Run: eas build --profile development --platform android
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Terminal Discovery List */}
        <TRXTerminalList
          isScanning={isScanning}
          terminals={discoveredTerminals}
          preferredTerminal={currentTerminal}
          isConnecting={isConnecting}
          onSelectPreferred={connectToTerminal}
          onScanTerminals={() => scanForTerminals()}
        />

        {/* Manual IP Input */}
        <TRXManualIPInput
          onAddTerminal={addManualTerminal}
          isAdding={isAddingManualTerminal}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TRXTerminalScreen;
