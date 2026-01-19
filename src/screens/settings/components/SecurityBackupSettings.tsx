import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { clearAllOrderAndTicketData, verifyRemainingData } from '@/utils/clearOrderData';

interface SecurityBackupSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

export default function SecurityBackupSettings({ onChangesDetected }: SecurityBackupSettingsProps) {
  // Theme hook FIRST (REQUIRED per CLAUDE.md)
  const { theme } = useTheme();

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: false,
    session_timeout: 30,
    password_complexity: true,
    failed_login_limit: 5,
    audit_logging: true,
  });

  const [backupSettings, setBackupSettings] = useState({
    auto_backup: true,
    backup_frequency: 'daily',
    cloud_backup: true,
    local_backup: false,
    retention_days: 30,
  });

  const handleSecurityChange = (setting: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
    onChangesDetected(true);
  };

  const handleBackupChange = (setting: string, value: any) => {
    setBackupSettings(prev => ({ ...prev, [setting]: value }));
    onChangesDetected(true);
  };

  const handleBackupNow = () => {
    Alert.alert('Manual Backup', 'Starting manual backup process...');
  };

  const handleRestoreData = () => {
    Alert.alert(
      'Restore Data',
      'Are you sure you want to restore data from backup? This will overwrite current data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive' },
      ]
    );
  };

  const handleClearOrderData = () => {
    console.log('[SecurityBackupSettings] Clear button pressed!');
    Alert.alert(
      '⚠️ Clear All Order Data',
      'This will permanently delete:\n\n• All orders (active & history)\n• All kitchen tickets\n• All payment records\n• All receipts\n\nThis will KEEP:\n✅ Menu items\n✅ Tables & areas\n✅ Settings\n✅ User data\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Orders',
          style: 'destructive',
          onPress: async () => {
            console.log('[SecurityBackupSettings] User confirmed - starting clear...');
            try {
              await clearAllOrderAndTicketData();
              console.log('[SecurityBackupSettings] Clear completed successfully!');
              Alert.alert(
                '✅ Success',
                'All order data has been cleared!\n\n• Orders cleared\n• Tables reset to AVAILABLE\n• Menu and settings preserved\n\nNo restart required.',
                [{ text: 'OK' }]
              );
              // Optionally verify what's left
              await verifyRemainingData();
            } catch (error) {
              console.error('[SecurityBackupSettings] Clear failed:', error);
              Alert.alert(
                '❌ Error',
                `Failed to clear order data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // StyleSheet AFTER hooks and handlers, BEFORE return (REQUIRED per CLAUDE.md)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 25,
    },
    section: {
      backgroundColor: theme.colors.lightGray,
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 15,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    settingDesc: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    valueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    valueLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    valueText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
    backupRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backupInfo: {
      flex: 1,
    },
    backupDate: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    backupDetails: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    backupStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusSuccess: {
      backgroundColor: theme.colors.successLight, // Fixed: was hardcoded '#E8F5E8'
    },
    backupStatusText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.success, // Fixed: was hardcoded '#2E7D32'
    },
    encryptionInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    encryptionLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    encryptionStatus: {
      fontSize: 12,
      color: theme.colors.success,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 15,
      marginTop: 20,
      marginBottom: 30,
    },
    backupButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    backupButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    restoreButton: {
      flex: 1,
      backgroundColor: theme.colors.warning,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    restoreButtonText: {
      color: theme.colors.onSurface, // Dark text on warning for WCAG AA compliance
      fontSize: 14,
      fontWeight: 'bold',
    },
    dangerSection: {
      backgroundColor: theme.colors.error + '10', // 10% opacity red background
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: theme.colors.error,
    },
    dangerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.error,
      marginBottom: 10,
    },
    dangerDesc: {
      fontSize: 13,
      color: theme.colors.onSurface,
      marginBottom: 15,
      lineHeight: 20,
    },
    clearButton: {
      backgroundColor: theme.colors.error,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    clearButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Security & Backup</Text>

      {/* Security Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Settings</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
            <Text style={styles.settingDesc}>Require SMS or app verification for login</Text>
          </View>
          <Switch
            value={securitySettings.two_factor_auth}
            onValueChange={(value) => handleSecurityChange('two_factor_auth', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Password Complexity</Text>
            <Text style={styles.settingDesc}>Enforce strong password requirements</Text>
          </View>
          <Switch
            value={securitySettings.password_complexity}
            onValueChange={(value) => handleSecurityChange('password_complexity', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Audit Logging</Text>
            <Text style={styles.settingDesc}>Log all user actions and system events</Text>
          </View>
          <Switch
            value={securitySettings.audit_logging}
            onValueChange={(value) => handleSecurityChange('audit_logging', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Session Timeout (minutes)</Text>
          <Text style={styles.valueText}>{securitySettings.session_timeout}</Text>
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Failed Login Limit</Text>
          <Text style={styles.valueText}>{securitySettings.failed_login_limit}</Text>
        </View>
      </View>

      {/* Backup Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup Configuration</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Automatic Backup</Text>
            <Text style={styles.settingDesc}>Enable scheduled automatic backups</Text>
          </View>
          <Switch
            value={backupSettings.auto_backup}
            onValueChange={(value) => handleBackupChange('auto_backup', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Cloud Backup</Text>
            <Text style={styles.settingDesc}>Store backups in secure cloud storage</Text>
          </View>
          <Switch
            value={backupSettings.cloud_backup}
            onValueChange={(value) => handleBackupChange('cloud_backup', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Local Backup</Text>
            <Text style={styles.settingDesc}>Store backups on local device storage</Text>
          </View>
          <Switch
            value={backupSettings.local_backup}
            onValueChange={(value) => handleBackupChange('local_backup', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Backup Frequency</Text>
          <Text style={styles.valueText}>{backupSettings.backup_frequency}</Text>
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Retention Period (days)</Text>
          <Text style={styles.valueText}>{backupSettings.retention_days}</Text>
        </View>
      </View>

      {/* Recent Backups */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Backups</Text>
        {[
          { date: '2024-01-20 02:30', type: 'Automatic', size: '45.2 MB', status: 'Success' },
          { date: '2024-01-19 02:30', type: 'Automatic', size: '44.8 MB', status: 'Success' },
          { date: '2024-01-18 14:15', type: 'Manual', size: '43.9 MB', status: 'Success' },
        ].map((backup, index) => (
          <View key={index} style={styles.backupRow}>
            <View style={styles.backupInfo}>
              <Text style={styles.backupDate}>{backup.date}</Text>
              <Text style={styles.backupDetails}>{backup.type} • {backup.size}</Text>
            </View>
            <View style={[styles.backupStatus, styles[`status${backup.status}`]]}>
              <Text style={styles.backupStatusText}>{backup.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Data Encryption */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Encryption</Text>
        <View style={styles.encryptionInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="lock" size={16} color={theme.colors.success} />
            <Text style={styles.encryptionLabel}>Database Encryption</Text>
          </View>
          <Text style={styles.encryptionStatus}>Enabled (AES-256)</Text>
        </View>
        <View style={styles.encryptionInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="lock-check" size={16} color={theme.colors.success} />
            <Text style={styles.encryptionLabel}>Backup Encryption</Text>
          </View>
          <Text style={styles.encryptionStatus}>Enabled (AES-256)</Text>
        </View>
        <View style={styles.encryptionInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="broadcast" size={16} color={theme.colors.success} />
            <Text style={styles.encryptionLabel}>Data Transmission</Text>
          </View>
          <Text style={styles.encryptionStatus}>TLS 1.3</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.backupButton}
          onPress={handleBackupNow}
          accessibilityRole="button"
          accessibilityLabel="Backup now"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Icon name="content-save" size={16} color={theme.colors.white} />
            <Text style={styles.backupButtonText}>Backup Now</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestoreData}
          accessibilityRole="button"
          accessibilityLabel="Restore data"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Icon name="restore" size={16} color={theme.colors.white} />
            <Text style={styles.restoreButtonText}>Restore Data</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* DANGER ZONE - Clear Order Data */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>⚠️ DANGER ZONE</Text>
        <Text style={styles.dangerDesc}>
          Clear all order and ticket data to get a fresh start. This will delete all orders, kitchen tickets, and payments, but will keep your menu, tables, and settings intact.{'\n\n'}
          <Text style={{ fontWeight: 'bold' }}>This action cannot be undone!</Text>
        </Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearOrderData}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Clear all order data"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Icon name="delete-forever" size={16} color={theme.colors.white} />
            <Text style={styles.clearButtonText}>Clear All Order Data</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}