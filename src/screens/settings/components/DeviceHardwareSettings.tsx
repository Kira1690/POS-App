import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { DeviceSettings } from '@/types/settings.types';
import { MockSettingsService } from '@/services/settings/MockSettingsService';
import { useTheme } from '@/hooks/useTheme';
import { Icon, StatusIndicator } from '@/components/common';

interface DeviceHardwareSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

interface DeviceCard {
  id: string;
  name: string;
  type: 'payment' | 'printer' | 'drawer';
  status: 'connected' | 'disconnected' | 'error';
  iconName: string;
  details: string;
  connection: string;
}

const MOCK_DEVICES: DeviceCard[] = [
  {
    id: 'vp3350',
    name: 'VP3350 Card Reader',
    type: 'payment',
    status: 'connected',
    iconName: 'credit-card',
    details: 'Serial: VP3350-001-NYC',
    connection: 'Last Used: 15 mins ago',
  },
  {
    id: 'cash_drawer',
    name: 'Cash Drawer',
    type: 'drawer',
    status: 'disconnected',
    iconName: 'package-variant',
    details: 'Model: APG Vasario 1616',
    connection: 'Port: USB-Serial',
  },
  {
    id: 'receipt_printer',
    name: 'Receipt Printer',
    type: 'printer',
    status: 'connected',
    iconName: 'receipt',
    details: 'Epson TM-T88VI',
    connection: 'IP: 192.168.1.105',
  },
  {
    id: 'kitchen_printer',
    name: 'Kitchen Printer',
    type: 'printer',
    status: 'connected',
    iconName: 'chef-hat',
    details: 'Star TSP143IIIU',
    connection: 'USB Connected',
  },
];

const API_CONNECTIONS = [
  {
    id: 'backend_api',
    name: 'POS Backend API',
    status: 'connected',
    iconName: 'api',
    url: 'api.pos.local:4000',
  },
  {
    id: 'websocket',
    name: 'Real-time Updates',
    status: 'connected',
    iconName: 'flash',
    url: 'ws://pos.local:4001',
  },
  {
    id: 'delivery_platforms',
    name: 'Delivery Platforms',
    status: 'disconnected',
    iconName: 'link-variant',
    url: 'UberEats, DoorDash, etc.',
  },
];

export default function DeviceHardwareSettings({ onChangesDetected }: DeviceHardwareSettingsProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [devices, setDevices] = useState<DeviceCard[]>(MOCK_DEVICES);
  const [apiConnections, setApiConnections] = useState(API_CONNECTIONS);
  const [networkInfo, setNetworkInfo] = useState({
    status: 'connected',
    wifi: 'RestaurantPOS_5G',
    ip: '192.168.1.100',
    signal: 'Excellent',
  });
  const [systemHealth, setSystemHealth] = useState({
    cpu: '15%',
    memory: '2.1GB / 8GB',
    storage: '45GB / 256GB',
  });

  const settingsService = MockSettingsService.getInstance();

  const handleTestAllConnections = async () => {
    Alert.alert('Testing Connections', 'Testing all device and API connections...');
    // Mock testing delay
    setTimeout(() => {
      Alert.alert('Test Complete', 'All connections tested successfully');
    }, 2000);
  };

  const handleDeviceAction = (deviceId: string, action: 'configure' | 'test' | 'setup') => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      Alert.alert(
        `${action.charAt(0).toUpperCase() + action.slice(1)} Device`,
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${device.name}`
      );
    }
  };

  const handleAddDevice = (type: 'payment' | 'printer') => {
    Alert.alert('Add Device', `Add new ${type} device functionality will be implemented.`);
  };

  const handleApiTest = (apiId: string) => {
    const api = apiConnections.find(a => a.id === apiId);
    if (api) {
      Alert.alert('Testing Connection', `Testing ${api.name}...`);
    }
  };

  const handleNetworkAction = (action: 'change' | 'troubleshoot') => {
    Alert.alert(
      action === 'change' ? 'Change Network' : 'Network Troubleshoot',
      `${action} network functionality will be implemented.`
    );
  };

  const handleSystemAction = (action: 'optimize' | 'diagnostics') => {
    Alert.alert(
      action === 'optimize' ? 'System Optimization' : 'System Diagnostics',
      `${action} functionality will be implemented.`
    );
  };

  const renderDeviceCard = (device: DeviceCard) => (
    <View key={device.id} style={styles.deviceCard}>
      <View style={[styles.deviceIcon, styles[`deviceIcon${device.type}`]]}>
        <Icon name={device.iconName} size={20} color={theme.colors.onPrimary} />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <StatusIndicator
          status={device.status === 'connected' ? 'connected' : device.status === 'disconnected' ? 'disconnected' : 'error'}
          textSize={12}
          iconSize={14}
        />
        <Text style={styles.deviceDetails}>{device.details}</Text>
        <Text style={styles.deviceConnection}>{device.connection}</Text>
      </View>
      <View style={styles.deviceActions}>
        <TouchableOpacity
          style={[styles.deviceButton, styles.configureButton]}
          onPress={() => handleDeviceAction(device.id, device.status === 'disconnected' ? 'setup' : 'configure')}
        >
          <Text style={styles.configureButtonText}>
            {device.status === 'disconnected' ? 'Setup' : 'Configure'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deviceButton, styles.testButton]}
          onPress={() => handleDeviceAction(device.id, 'test')}
        >
          <Text style={styles.testButtonText}>
            {device.type === 'printer' ? 'Print Test' : 'Test'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApiCard = (api: any) => (
    <View key={api.id} style={styles.apiCard}>
      <View style={styles.apiIcon}>
        <Icon name={api.iconName} size={16} color={theme.colors.onPrimary} />
      </View>
      <View style={styles.apiInfo}>
        <Text style={styles.apiName}>{api.name}</Text>
        <StatusIndicator
          status={api.status === 'connected' ? 'connected' : 'disconnected'}
          label={api.status === 'connected' ? 'Connected' : 'Not Configured'}
          textSize={11}
          iconSize={12}
        />
        <Text style={styles.apiUrl}>{api.url}</Text>
      </View>
      <TouchableOpacity
        style={[styles.apiButton, api.status === 'connected' && styles.apiButtonconnected]}
        onPress={() => handleApiTest(api.id)}
      >
        <Text style={styles.apiButtonText}>
          {api.status === 'connected' ? 'Test' : 'Setup'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 25,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    testAllButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 12,
    },
    testAllButtonText: {
      color: theme.colors.white, // White text on success buttons (WCAG compliant for 14px+ bold)
      fontSize: 14,
      fontWeight: 'bold',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 15,
    },
    devicesGrid: {
      gap: 15,
    },
    deviceCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    deviceIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    deviceIconpayment: {
      backgroundColor: theme.colors.primary,
    },
    deviceIconprinter: {
      backgroundColor: theme.colors.success,
    },
    deviceIcondrawer: {
      backgroundColor: theme.colors.warning,
    },
    deviceIconText: {
      fontSize: 20,
      color: theme.colors.onPrimary,
    },
    deviceInfo: {
      flex: 1,
    },
    deviceName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    deviceStatus: {
      fontSize: 12,
      marginBottom: 4,
    },
    deviceStatusconnected: {
      color: theme.colors.success,
    },
    deviceStatusdisconnected: {
      color: theme.colors.error,
    },
    deviceDetails: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    deviceConnection: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    deviceActions: {
      gap: 5,
    },
    deviceButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignItems: 'center',
      minWidth: 70,
    },
    configureButton: {
      backgroundColor: theme.colors.primary,
    },
    configureButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 11,
    },
    testButton: {
      backgroundColor: theme.colors.success,
    },
    testButtonText: {
      color: theme.colors.white, // White text on success buttons (WCAG compliant for 14px+ bold)
      fontSize: 11,
    },
    addDeviceCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 15,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderStyle: 'dashed',
      alignItems: 'center',
      marginTop: 10,
    },
    addDeviceText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    apiGrid: {
      flexDirection: 'row',
      gap: 15,
    },
    apiCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    apiIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    apiIconbackend_api: {
      backgroundColor: theme.colors.success,
    },
    apiIconwebsocket: {
      backgroundColor: theme.colors.primary,
    },
    apiIcondelivery_platforms: {
      backgroundColor: theme.colors.warning,
    },
    apiIconText: {
      fontSize: 16,
      color: theme.colors.onPrimary,
    },
    apiInfo: {
      alignItems: 'center',
      marginBottom: 8,
    },
    apiName: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: 2,
    },
    apiStatus: {
      fontSize: 11,
      marginBottom: 4,
    },
    apiStatusconnected: {
      color: theme.colors.success,
    },
    apiStatusdisconnected: {
      color: theme.colors.error,
    },
    apiUrl: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    apiButton: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    apiButtonconnected: {
      backgroundColor: theme.colors.success,
    },
    apiButtondisconnected: {
      backgroundColor: theme.colors.warning,
    },
    apiButtonText: {
      fontSize: 10,
      color: theme.colors.white, // White text on success buttons (WCAG compliant for 14px+ bold)
    },
    networkRow: {
      flexDirection: 'row',
      gap: 15,
    },
    networkCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 15,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    networkIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    networkIconText: {
      fontSize: 20,
      color: theme.colors.white, // White text on success buttons (WCAG compliant for 14px+ bold)
    },
    networkStatus: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    networkInfo: {
      flex: 1,
      marginBottom: 10,
    },
    networkDetail: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    networkSignal: {
      color: theme.colors.success,
    },
    networkActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    networkButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    networkButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
    },
    troubleshootButton: {
      backgroundColor: theme.colors.warning,
    },
    troubleshootButtonText: {
      color: theme.colors.onSurface, // Dark text on warning for WCAG AA compliance
      fontSize: 12,
    },
    healthCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 15,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    healthIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    healthIconText: {
      fontSize: 20,
      color: theme.colors.white, // White text on success buttons (WCAG compliant for 14px+ bold)
    },
    healthTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    healthInfo: {
      flex: 1,
      marginBottom: 10,
    },
    healthDetail: {
      fontSize: 12,
      color: theme.colors.success,
      marginBottom: 4,
    },
    healthActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    optimizeButton: {
      flex: 1,
      backgroundColor: theme.colors.success,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    optimizeButtonText: {
      color: theme.colors.white, // White text on success buttons (WCAG compliant for 14px+ bold)
      fontSize: 12,
    },
    diagnosticsButton: {
      flex: 1,
      backgroundColor: theme.colors.warning,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    diagnosticsButtonText: {
      color: theme.colors.onSurface, // Dark text on warning for WCAG AA compliance
      fontSize: 12,
    },
    // Theme toggle styles
    themeCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    themeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    themeIconText: {
      fontSize: 20,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    themeNote: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    themeActions: {
      marginLeft: 10,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Device & Integration Configuration</Text>
        <TouchableOpacity
          style={styles.testAllButton}
          onPress={handleTestAllConnections}
          accessibilityRole="button"
          accessibilityLabel="Test all connections"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="flask" size={16} color={theme.colors.white} />
            <Text style={styles.testAllButtonText}>Test All Connections</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Display & Theme Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display & Theme Settings</Text>
        <View style={styles.themeCard}>
          <View style={styles.themeIcon}>
            <Icon
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={20}
              color={theme.colors.onPrimary}
            />
          </View>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>Dark Mode</Text>
            <Text style={styles.themeDescription}>
              {isDark ? 'Currently using dark theme with Apple design' : 'Currently using light theme with Apple design'}
            </Text>
            <Text style={styles.themeNote}>
              Apple Tahoe design system with professional rounded corners and sophisticated colors
            </Text>
          </View>
          <View style={styles.themeActions}>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.outline,
                true: theme.colors.primary
              }}
              thumbColor={isDark ? theme.colors.surface : theme.colors.surface}
              ios_backgroundColor={theme.colors.outline}
            />
          </View>
        </View>
      </View>

      {/* Payment Devices Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Devices</Text>
        <View style={styles.devicesGrid}>
          {devices.filter(d => d.type === 'payment' || d.type === 'drawer').map(renderDeviceCard)}
        </View>
        <TouchableOpacity
          style={styles.addDeviceCard}
          onPress={() => handleAddDevice('payment')}
        >
          <Text style={styles.addDeviceText}>+ Add New Payment Device</Text>
        </TouchableOpacity>
      </View>

      {/* Printer Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Printer Configuration</Text>
        <View style={styles.devicesGrid}>
          {devices.filter(d => d.type === 'printer').map(renderDeviceCard)}
        </View>
        <TouchableOpacity
          style={styles.addDeviceCard}
          onPress={() => handleAddDevice('printer')}
        >
          <Text style={styles.addDeviceText}>+ Add New Printer</Text>
        </TouchableOpacity>
      </View>

      {/* API Integrations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Integrations</Text>
        <View style={styles.apiGrid}>
          {apiConnections.map(renderApiCard)}
        </View>
      </View>

      {/* Network Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Configuration</Text>
        <View style={styles.networkRow}>
          <View style={styles.networkCard}>
            <View style={styles.networkIcon}>
              <Icon name="wifi" size={20} color={theme.colors.white} />
            </View>
            <View style={styles.networkInfo}>
              <Text style={styles.networkStatus}>Network Status: Connected</Text>
              <Text style={styles.networkDetail}>WiFi: {networkInfo.wifi}</Text>
              <Text style={styles.networkDetail}>IP Address: {networkInfo.ip}</Text>
              <Text style={[styles.networkDetail, styles.networkSignal]}>
                Signal Strength: {networkInfo.signal}
              </Text>
            </View>
            <View style={styles.networkActions}>
              <TouchableOpacity
                style={styles.networkButton}
                onPress={() => handleNetworkAction('change')}
              >
                <Text style={styles.networkButtonText}>Change Network</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.networkButton, styles.troubleshootButton]}
                onPress={() => handleNetworkAction('troubleshoot')}
              >
                <Text style={styles.troubleshootButtonText}>Troubleshoot</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthIcon}>
              <Icon name="monitor" size={20} color={theme.colors.white} />
            </View>
            <View style={styles.healthInfo}>
              <Text style={styles.healthTitle}>System Health</Text>
              <Text style={styles.healthDetail}>CPU Usage: {systemHealth.cpu}</Text>
              <Text style={styles.healthDetail}>Memory: {systemHealth.memory}</Text>
              <Text style={styles.healthDetail}>Storage: {systemHealth.storage}</Text>
            </View>
            <View style={styles.healthActions}>
              <TouchableOpacity
                style={styles.optimizeButton}
                onPress={() => handleSystemAction('optimize')}
              >
                <Text style={styles.optimizeButtonText}>Optimize</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.diagnosticsButton}
                onPress={() => handleSystemAction('diagnostics')}
              >
                <Text style={styles.diagnosticsButtonText}>Run Diagnostics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}