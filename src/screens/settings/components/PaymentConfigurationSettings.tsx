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
import { PaymentConfiguration } from '@/types/settings.types';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';

interface PaymentConfigurationSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

export default function PaymentConfigurationSettings({ onChangesDetected }: PaymentConfigurationSettingsProps) {
  // Theme hook FIRST (REQUIRED per CLAUDE.md)
  const { theme } = useTheme();

  const [config, setConfig] = useState<PaymentConfiguration>({
    enabled_methods: ['card', 'cash'],
    card_processing: {
      processor: 'VP3350',
      merchant_id: 'MERCH_001',
      terminal_id: 'TERM_001',
      enable_tips: true,
      tip_percentages: [15, 18, 20, 25],
    },
    cash_management: {
      starting_cash: 200,
      enable_cash_drawer: true,
      require_manager_approval: false,
    },
    settings: {
      auto_settle: true,
      receipt_printing: true,
      signature_threshold: 25.00,
    },
  });

  const handleMethodToggle = (method: string) => {
    const newMethods = config.enabled_methods.includes(method)
      ? config.enabled_methods.filter(m => m !== method)
      : [...config.enabled_methods, method];
    
    setConfig({ ...config, enabled_methods: newMethods });
    onChangesDetected(true);
  };

  const handleConfigChange = (section: string, field: string, value: any) => {
    setConfig({
      ...config,
      [section]: {
        ...config[section as keyof PaymentConfiguration],
        [field]: value,
      },
    });
    onChangesDetected(true);
  };

  const handleTestPayment = () => {
    Alert.alert('Test Payment', 'Running test payment transaction...');
  };

  const handleSaveConfiguration = () => {
    Alert.alert('Save Configuration', 'Payment configuration saved successfully.');
    onChangesDetected(false);
  };

  // StyleSheet AFTER hooks and handlers, BEFORE return (REQUIRED per CLAUDE.md)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
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
      color: theme.colors.text,
      marginBottom: 15,
    },
    methodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    methodInfo: {
      flex: 1,
    },
    methodLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    methodDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    configRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    configLabel: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    configValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    tipsContainer: {
      paddingVertical: 10,
    },
    tipsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    tipTag: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tipText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 15,
      marginTop: 20,
      marginBottom: 30,
    },
    testButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    testButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.colors.success,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Payment Configuration</Text>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enabled Payment Methods</Text>
        {[
          { id: 'card', iconName: 'credit-card', label: 'Credit/Debit Cards', desc: 'VP3350 Card Reader' },
          { id: 'cash', iconName: 'cash', label: 'Cash Payments', desc: 'Cash drawer integration' },
          { id: 'split', iconName: 'swap-horizontal', label: 'Split Payments', desc: 'Multiple payment methods' },
          { id: 'gift_card', iconName: 'gift', label: 'Gift Cards', desc: 'Digital gift card system' },
        ].map(method => (
          <View key={method.id} style={styles.methodRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <Icon name={method.iconName} size={20} color={theme.colors.primary} />
              <View style={styles.methodInfo}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </View>
            </View>
            <Switch
              value={config.enabled_methods.includes(method.id)}
              onValueChange={() => handleMethodToggle(method.id)}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={theme.colors.white}
            />
          </View>
        ))}
      </View>

      {/* Card Processing Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Processing Settings</Text>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Processor</Text>
          <Text style={styles.configValue}>VP3350 Card Reader</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Merchant ID</Text>
          <Text style={styles.configValue}>{config.card_processing.merchant_id}</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Terminal ID</Text>
          <Text style={styles.configValue}>{config.card_processing.terminal_id}</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Enable Tips</Text>
          <Switch
            value={config.card_processing.enable_tips}
            onValueChange={(value) => handleConfigChange('card_processing', 'enable_tips', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>
        <View style={styles.tipsContainer}>
          <Text style={styles.configLabel}>Tip Percentages</Text>
          <View style={styles.tipsRow}>
            {config.card_processing.tip_percentages.map((tip, index) => (
              <View key={index} style={styles.tipTag}>
                <Text style={styles.tipText}>{tip}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Cash Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cash Management</Text>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Starting Cash Amount</Text>
          <Text style={styles.configValue}>${config.cash_management.starting_cash}</Text>
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Enable Cash Drawer</Text>
          <Switch
            value={config.cash_management.enable_cash_drawer}
            onValueChange={(value) => handleConfigChange('cash_management', 'enable_cash_drawer', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Require Manager Approval</Text>
          <Switch
            value={config.cash_management.require_manager_approval}
            onValueChange={(value) => handleConfigChange('cash_management', 'require_manager_approval', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>
      </View>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Settings</Text>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Auto Settlement</Text>
          <Switch
            value={config.settings.auto_settle}
            onValueChange={(value) => handleConfigChange('settings', 'auto_settle', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Receipt Printing</Text>
          <Switch
            value={config.settings.receipt_printing}
            onValueChange={(value) => handleConfigChange('settings', 'receipt_printing', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.white}
          />
        </View>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Signature Threshold</Text>
          <Text style={styles.configValue}>${config.settings.signature_threshold}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestPayment}
          accessibilityRole="button"
          accessibilityLabel="Test payment"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Icon name="flask" size={16} color={theme.colors.white} />
            <Text style={styles.testButtonText}>Test Payment</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveConfiguration}
          accessibilityRole="button"
          accessibilityLabel="Save configuration"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Icon name="content-save" size={16} color={theme.colors.white} />
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}