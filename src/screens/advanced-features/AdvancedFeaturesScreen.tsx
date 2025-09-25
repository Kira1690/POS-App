import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ManagerPerformanceMetrics,
  StaffMember,
  SystemHealthItem,
  SystemAlert,
  OverrideType,
} from '@/types/advanced-features.types';
import { MockAdvancedFeaturesService } from '@/services/advanced-features/MockAdvancedFeaturesService';
import {
  PerformanceMetricsCards,
  StaffManagementPanel,
  SystemOverridesPanel,
  SystemStatusPanel,
  SystemAlertsPanel,
} from './components';
import { theme } from '@/constants/theme';

export default function AdvancedFeaturesScreen() {
  const [metrics, setMetrics] = useState<ManagerPerformanceMetrics | null>(null);
  const [staffOnDuty, setStaffOnDuty] = useState<StaffMember[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthItem[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentShift, setCurrentShift] = useState('Evening (3:00 PM - 11:00 PM)');

  const advancedService = MockAdvancedFeaturesService.getInstance();

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      const [metricsData, staffData, healthData, alertsData] = await Promise.all([
        advancedService.getManagerMetrics(),
        advancedService.getStaffOnDuty(),
        advancedService.getSystemHealth(),
        advancedService.getSystemAlerts(),
      ]);

      setMetrics(metricsData);
      setStaffOnDuty(staffData);
      setSystemHealth(healthData);
      setSystemAlerts(alertsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load manager dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = () => {
    Alert.alert(
      'End Shift',
      'Are you sure you want to end the current shift? This will close all active sessions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Shift', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Shift ended successfully')
        },
      ]
    );
  };

  const handleEmergencyOverride = () => {
    Alert.alert(
      'Emergency Override',
      'This will grant temporary full system access. Use only in emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate', 
          style: 'destructive',
          onPress: () => Alert.alert('Emergency Mode', 'Emergency override activated')
        },
      ]
    );
  };

  const handleStaffAction = async (action: string, staffId: string) => {
    try {
      switch (action) {
        case 'break':
          await advancedService.sendStaffBreak(staffId);
          await loadManagerData();
          break;
        case 'clock_in':
          await advancedService.clockInStaff(staffId);
          break;
        case 'performance':
          Alert.alert('Staff Performance', 'Performance details will be implemented');
          break;
        case 'schedule':
          Alert.alert('Staff Schedule', 'Schedule management will be implemented');
          break;
        case 'alerts':
          Alert.alert('Staff Alert', 'Enter message to send to all staff:', [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Send', 
              onPress: () => advancedService.sendStaffAlert('Important announcement from management')
            },
          ]);
          break;
        case 'emergency_contact':
          Alert.alert('Emergency Contact', 'Emergency contact system activated');
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to perform staff action');
    }
  };

  const handleSystemOverride = async (type: OverrideType) => {
    const promptPin = () => {
      Alert.prompt(
        'Manager PIN Required',
        `Enter your manager PIN to authorize ${type.replace('_', ' ')}:`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Authorize', 
            onPress: async (pin) => {
              try {
                switch (type) {
                  case 'price':
                    await advancedService.priceOverride('item_001', 15.99, pin || '');
                    Alert.alert('Success', 'Price override authorized');
                    break;
                  case 'discount':
                    await advancedService.applyDiscount('order_001', 20, pin || '');
                    Alert.alert('Success', 'Discount applied');
                    break;
                  case 'void':
                    await advancedService.voidTransaction('trans_001', 'Manager void', pin || '');
                    Alert.alert('Success', 'Transaction voided');
                    break;
                  case 'comp':
                    await advancedService.compItem('item_001', 'Customer satisfaction', pin || '');
                    Alert.alert('Success', 'Item comped');
                    break;
                  case 'cash_drawer':
                    await advancedService.forceOpenCashDrawer(pin || '');
                    Alert.alert('Success', 'Cash drawer opened');
                    break;
                }
              } catch (error) {
                Alert.alert('Error', 'Invalid PIN or operation failed');
              }
            }
          },
        ],
        'secure-text'
      );
    };

    promptPin();
  };

  const handleSystemOperation = async (operation: string) => {
    try {
      switch (operation) {
        case 'backup':
          Alert.alert('Backup', 'Starting system backup...');
          await advancedService.backupNow();
          Alert.alert('Success', 'System backup completed');
          break;
        case 'sync':
          Alert.alert('Sync', 'Synchronizing data...');
          await advancedService.syncData();
          Alert.alert('Success', 'Data synchronization completed');
          break;
        case 'logs':
          Alert.alert('System Logs', 'Opening system logs...');
          break;
        case 'close_day':
          Alert.alert(
            'Close Business Day',
            'This will finalize today\'s transactions and generate reports. Continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Close Day', 
                onPress: async () => {
                  await advancedService.closeBusinessDay();
                  Alert.alert('Success', 'Business day closed successfully');
                }
              },
            ]
          );
          break;
        case 'daily_report':
          Alert.alert('Generating Report', 'Creating daily sales report...');
          await advancedService.generateDailyReport();
          Alert.alert('Success', 'Daily report generated');
          break;
        case 'cash_count':
          Alert.alert('Cash Count', 'Starting cash count and reconciliation...');
          await advancedService.cashCountReconciliation();
          Alert.alert('Success', 'Cash reconciliation completed');
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Operation failed');
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await advancedService.acknowledgeAlert(alertId);
      await loadManagerData();
    } catch (error) {
      Alert.alert('Error', 'Failed to acknowledge alert');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading manager dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Manager Dashboard</Text>
          <Text style={styles.shiftInfo}>Current Shift: {currentShift}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.endShiftButton} onPress={handleEndShift}>
            <Text style={styles.endShiftButtonText}>🔚 End Shift</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyOverride}>
            <Text style={styles.emergencyButtonText}>🚨 Emergency Override</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Performance Metrics */}
        {metrics && (
          <PerformanceMetricsCards 
            metrics={metrics} 
            alerts={systemAlerts.filter(a => !a.acknowledged)}
            onViewAlerts={() => Alert.alert('System Alerts', 'Viewing all system alerts')}
          />
        )}

        {/* Main Control Panels */}
        <Text style={styles.controlsTitle}>Manager Controls</Text>
        
        <View style={styles.controlPanels}>
          {/* Staff Management Panel */}
          <StaffManagementPanel
            staffMembers={staffOnDuty}
            onStaffAction={handleStaffAction}
          />

          {/* System Overrides Panel */}
          <SystemOverridesPanel
            onOverride={handleSystemOverride}
          />

          {/* System Status Panel */}
          <SystemStatusPanel
            systemHealth={systemHealth}
            onSystemOperation={handleSystemOperation}
          />
        </View>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <SystemAlertsPanel
            alerts={systemAlerts}
            onAcknowledge={handleAcknowledgeAlert}
          />
        )}
      </ScrollView>

      {/* Navigation Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Dashboard &gt; Manager Controls</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    height: 80,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 2,
  },
  shiftInfo: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  endShiftButton: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endShiftButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emergencyButton: {
    backgroundColor: '#C62828',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  controlsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: 30,
    marginVertical: 20,
  },
  controlPanels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  breadcrumb: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
  },
  breadcrumbText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});