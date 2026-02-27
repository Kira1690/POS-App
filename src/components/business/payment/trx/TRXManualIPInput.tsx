import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { LoggerFactory } from '@/services/trx/logging/LoggingService';

interface TRXManualIPInputProps {
  onAddTerminal: (ip: string, port: number) => Promise<boolean>;
  isAdding: boolean;
}

export const TRXManualIPInput: React.FC<TRXManualIPInputProps> = ({
  onAddTerminal,
  isAdding,
}) => {
  const { theme } = useTheme();
  const [ipAddress, setIPAddress] = useState('');
  const [port, setPort] = useState('1180');
  const [showInput, setShowInput] = useState(false);

  const logger = LoggerFactory.createLogger('ManualIPInput');

  const validateIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const validatePort = (portStr: string): boolean => {
    const portNum = parseInt(portStr, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const handleAddTerminal = async () => {
    const trimmedIP = ipAddress.trim();
    const trimmedPort = port.trim();

    if (!trimmedIP) {
      Alert.alert('Invalid Input', 'Please enter an IP address');
      return;
    }

    if (!validateIP(trimmedIP)) {
      Alert.alert('Invalid IP Address', 'Please enter a valid IP address (e.g., 192.168.1.100)');
      return;
    }

    if (!validatePort(trimmedPort)) {
      Alert.alert('Invalid Port', 'Please enter a valid port number (1-65535)');
      return;
    }

    logger.info('Attempting to add manual terminal', `${trimmedIP}:${trimmedPort}`);

    try {
      const success = await onAddTerminal(trimmedIP, parseInt(trimmedPort, 10));
      if (success) {
        setIPAddress('');
        setPort('1180');
        setShowInput(false);
        Alert.alert('Success', `Terminal ${trimmedIP}:${trimmedPort} added successfully`);
      } else {
        Alert.alert('Connection Failed', `Unable to connect to terminal at ${trimmedIP}:${trimmedPort}. Please check the IP address and ensure the terminal is online.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to add manual terminal', error instanceof Error ? error : new Error(String(error)));
      Alert.alert('Error', `Failed to add terminal: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    setIPAddress('');
    setPort('1180');
    setShowInput(false);
  };

  const commonIPs = [
    '192.168.1.12',
    '192.168.1.100',
    '192.168.1.101',
    '10.236.1.128',
    '10.0.0.100',
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.card,
    },
    showInputButton: {
      backgroundColor: theme.colors.tertiary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    showInputText: {
      ...theme.typography.button,
      color: theme.colors.onTertiary,
    },
    inputContainer: {
      width: '100%',
    },
    title: {
      ...theme.typography.headline,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    inputRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    ipInputContainer: {
      flex: 3,
      marginRight: theme.spacing.sm,
    },
    portInputContainer: {
      flex: 1,
    },
    inputLabel: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: theme.borderRadius.input,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      ...theme.typography.body,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
    },
    commonIPsContainer: {
      marginBottom: theme.spacing.md,
    },
    commonIPsTitle: {
      ...theme.typography.label,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
    },
    commonIPsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    commonIPButton: {
      backgroundColor: theme.colors.surfaceLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.xs,
      borderWidth: 1,
      borderColor: theme.colors.outlineLight,
    },
    commonIPText: {
      ...theme.typography.caption,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    button: {
      flex: 1,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: theme.colors.outlineLight,
    },
    cancelButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.sm,
    },
    addButton: {
      backgroundColor: theme.colors.success,
    },
    addButtonInner: {
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSuccess,
    },
  });

  if (!showInput) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.showInputButton} onPress={() => setShowInput(true)}>
          <Text style={styles.showInputText}>Add Terminal Manually</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.title}>Add Terminal Manually</Text>

        <View style={styles.inputRow}>
          <View style={styles.ipInputContainer}>
            <Text style={styles.inputLabel}>IP Address</Text>
            <TextInput
              style={styles.textInput}
              value={ipAddress}
              onChangeText={setIPAddress}
              placeholder="192.168.1.100"
              placeholderTextColor={theme.colors.onSurfaceDisabled}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isAdding}
            />
          </View>

          <View style={styles.portInputContainer}>
            <Text style={styles.inputLabel}>Port</Text>
            <TextInput
              style={styles.textInput}
              value={port}
              onChangeText={setPort}
              placeholder="1180"
              placeholderTextColor={theme.colors.onSurfaceDisabled}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isAdding}
            />
          </View>
        </View>

        <View style={styles.commonIPsContainer}>
          <Text style={styles.commonIPsTitle}>Common Terminal IPs:</Text>
          <View style={styles.commonIPsList}>
            {commonIPs.map((ip, index) => (
              <TouchableOpacity
                key={index}
                style={styles.commonIPButton}
                onPress={() => setIPAddress(ip)}
              >
                <Text style={styles.commonIPText}>{ip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isAdding}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddTerminal}
            disabled={isAdding || !ipAddress.trim()}
          >
            <View style={styles.addButtonInner}>
              {isAdding ? (
                <ActivityIndicator color={theme.colors.onSuccess} size="small" />
              ) : (
                <Text style={styles.addButtonText}>Add Terminal</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
