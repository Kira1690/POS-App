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
import { theme } from '@/constants/theme';

interface IntegrationsSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

const INTEGRATIONS = [
  {
    id: 'ubereats',
    name: 'Uber Eats',
    category: 'Delivery',
    status: 'disconnected',
    icon: '🍔',
    description: 'Order management and menu sync',
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    category: 'Delivery',
    status: 'connected',
    icon: '🚗',
    description: 'Delivery order integration',
  },
  {
    id: 'grubhub',
    name: 'GrubHub',
    category: 'Delivery',
    status: 'disconnected',
    icon: '📱',
    description: 'Online ordering platform',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'Accounting',
    status: 'connected',
    icon: '📊',
    description: 'Financial reporting and accounting',
  },
  {
    id: 'mailchimp',
    name: 'MailChimp',
    category: 'Marketing',
    status: 'disconnected',
    icon: '📧',
    description: 'Customer email marketing',
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    category: 'Analytics',
    status: 'connected',
    icon: '📈',
    description: 'Website and app analytics',
  },
];

export default function IntegrationsSettings({ onChangesDetected }: IntegrationsSettingsProps) {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [syncSettings, setSyncSettings] = useState({
    auto_menu_sync: true,
    real_time_orders: true,
    inventory_sync: false,
    customer_data_sync: true,
  });

  const handleToggleIntegration = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (integration?.status === 'connected') {
      Alert.alert(
        'Disconnect Integration',
        `Are you sure you want to disconnect ${integration.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disconnect', 
            style: 'destructive',
            onPress: () => {
              setIntegrations(prev => 
                prev.map(i => i.id === id ? { ...i, status: 'disconnected' } : i)
              );
              onChangesDetected(true);
            }
          },
        ]
      );
    } else {
      Alert.alert('Connect Integration', `Connect to ${integration?.name}?`);
    }
  };

  const handleSyncSettingChange = (setting: string, value: boolean) => {
    setSyncSettings(prev => ({ ...prev, [setting]: value }));
    onChangesDetected(true);
  };

  const renderIntegrationCard = (integration: any) => (
    <View key={integration.id} style={styles.integrationCard}>
      <View style={[styles.integrationIcon, integration.status === 'connected' && styles.integrationIconConnected]}>
        <Text style={styles.integrationIconText}>{integration.icon}</Text>
      </View>
      <View style={styles.integrationInfo}>
        <View style={styles.integrationHeader}>
          <Text style={styles.integrationName}>{integration.name}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{integration.category}</Text>
          </View>
        </View>
        <Text style={styles.integrationDescription}>{integration.description}</Text>
        <Text style={[
          styles.integrationStatus,
          integration.status === 'connected' ? styles.statusConnected : styles.statusDisconnected
        ]}>
          {integration.status === 'connected' ? '🔘 Connected' : '⚪ Disconnected'}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.integrationButton,
          integration.status === 'connected' ? styles.disconnectButton : styles.connectButton
        ]}
        onPress={() => handleToggleIntegration(integration.id)}
      >
        <Text style={[
          styles.integrationButtonText,
          integration.status === 'connected' ? styles.disconnectButtonText : styles.connectButtonText
        ]}>
          {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    const category = integration.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(integration);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Integrations</Text>

      {/* Sync Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synchronization Settings</Text>
        {[
          { key: 'auto_menu_sync', label: 'Automatic Menu Sync', desc: 'Sync menu changes across all platforms' },
          { key: 'real_time_orders', label: 'Real-time Order Updates', desc: 'Instant order notifications and updates' },
          { key: 'inventory_sync', label: 'Inventory Synchronization', desc: 'Sync stock levels with delivery platforms' },
          { key: 'customer_data_sync', label: 'Customer Data Sync', desc: 'Share customer profiles across platforms' },
        ].map(setting => (
          <View key={setting.key} style={styles.syncRow}>
            <View style={styles.syncInfo}>
              <Text style={styles.syncLabel}>{setting.label}</Text>
              <Text style={styles.syncDesc}>{setting.desc}</Text>
            </View>
            <Switch
              value={syncSettings[setting.key as keyof typeof syncSettings]}
              onValueChange={(value) => handleSyncSettingChange(setting.key, value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={theme.colors.white}
            />
          </View>
        ))}
      </View>

      {/* Integrations by Category */}
      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.sectionTitle}>{category} Integrations</Text>
          {categoryIntegrations.map(renderIntegrationCard)}
        </View>
      ))}

      {/* API Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <View style={styles.apiInfo}>
          <Text style={styles.apiLabel}>Webhook URL</Text>
          <Text style={styles.apiValue}>https://pos.restaurant.com/webhooks</Text>
        </View>
        <View style={styles.apiInfo}>
          <Text style={styles.apiLabel}>API Key</Text>
          <Text style={styles.apiValue}>••••••••••••••••</Text>
        </View>
        <View style={styles.apiActions}>
          <TouchableOpacity style={styles.apiButton}>
            <Text style={styles.apiButtonText}>Generate New Key</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.apiButton}>
            <Text style={styles.apiButtonText}>Test Webhook</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 Save Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton}>
          <Text style={styles.testButtonText}>🧪 Test All Connections</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

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
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  syncInfo: {
    flex: 1,
  },
  syncLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  syncDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  integrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  integrationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  integrationIconConnected: {
    backgroundColor: theme.colors.success,
  },
  integrationIconText: {
    fontSize: 18,
    color: theme.colors.white,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  integrationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 10,
  },
  categoryTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryTagText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '600',
  },
  integrationDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  integrationStatus: {
    fontSize: 11,
  },
  statusConnected: {
    color: theme.colors.success,
  },
  statusDisconnected: {
    color: theme.colors.error,
  },
  integrationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectButton: {
    backgroundColor: theme.colors.primary,
  },
  disconnectButton: {
    backgroundColor: theme.colors.error,
  },
  integrationButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  connectButtonText: {
    color: theme.colors.white,
  },
  disconnectButtonText: {
    color: theme.colors.white,
  },
  apiInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  apiLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  apiValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  apiActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  apiButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  apiButtonText: {
    color: theme.colors.white,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 30,
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
});