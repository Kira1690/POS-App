import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
} from 'react-native';
import { theme } from '@/constants/theme';

interface SystemLogsSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

const MOCK_LOGS = [
  { id: '1', timestamp: '2024-01-20 14:30:15', level: 'INFO', category: 'Authentication', message: 'User alice@foodcorner.com logged in successfully' },
  { id: '2', timestamp: '2024-01-20 14:28:42', level: 'INFO', category: 'Orders', message: 'Order #ORD-001 created for Table 5' },
  { id: '3', timestamp: '2024-01-20 14:25:18', level: 'WARNING', category: 'Payment', message: 'Payment declined for Order #ORD-001, retrying...' },
  { id: '4', timestamp: '2024-01-20 14:22:55', level: 'ERROR', category: 'Printer', message: 'Kitchen printer connection failed' },
  { id: '5', timestamp: '2024-01-20 14:20:33', level: 'INFO', category: 'Menu', message: 'Menu item "Chicken Burger" updated' },
  { id: '6', timestamp: '2024-01-20 14:18:21', level: 'INFO', category: 'Tables', message: 'Table 3 status changed to AVAILABLE' },
  { id: '7', timestamp: '2024-01-20 14:15:44', level: 'WARNING', category: 'System', message: 'High memory usage detected: 85%' },
  { id: '8', timestamp: '2024-01-20 14:12:17', level: 'INFO', category: 'Authentication', message: 'User john.doe logged out' },
];

export default function SystemLogsSettings({ onChangesDetected }: SystemLogsSettingsProps) {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return theme.colors.error;
      case 'WARNING': return theme.colors.warning;
      case 'INFO': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return '🔴';
      case 'WARNING': return '🟡';
      case 'INFO': return '🔵';
      default: return '⚪';
    }
  };

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={styles.logLevel}>
          <Text style={styles.logIcon}>{getLogIcon(item.level)}</Text>
          <Text style={[styles.logLevelText, { color: getLogLevelColor(item.level) }]}>
            {item.level}
          </Text>
        </View>
        <Text style={styles.logTimestamp}>{item.timestamp}</Text>
      </View>
      <View style={styles.logContent}>
        <Text style={styles.logCategory}>{item.category}</Text>
        <Text style={styles.logMessage}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>System Logs</Text>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Search logs..."
        />
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Level: {levelFilter} ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Category: {categoryFilter} ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Today ▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Log Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Log Statistics (Last 24 Hours)</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={[styles.statCard, styles.errorStat]}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Errors</Text>
          </View>
          <View style={[styles.statCard, styles.warningStat]}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Warnings</Text>
          </View>
          <View style={[styles.statCard, styles.infoStat]}>
            <Text style={styles.statNumber}>127</Text>
            <Text style={styles.statLabel}>Info</Text>
          </View>
        </View>
      </View>

      {/* Logs List */}
      <View style={styles.logsSection}>
        <View style={styles.logsHeader}>
          <Text style={styles.logsTitle}>Recent Logs ({filteredLogs.length})</Text>
          <View style={styles.logsActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📤 Export</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.logsContainer}>
          <FlatList
            data={filteredLogs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            style={styles.logsList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
        </View>
      </View>

      {/* Log Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Log Configuration</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Log Level</Text>
          <Text style={styles.settingValue}>DEBUG</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Max Log Files</Text>
          <Text style={styles.settingValue}>50</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Retention Period</Text>
          <Text style={styles.settingValue}>30 days</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Log Rotation</Text>
          <Text style={styles.settingValue}>Daily</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 Save Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>📥 Download All Logs</Text>
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
  filtersSection: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  statsSection: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  errorStat: {
    backgroundColor: '#FFEBEE',
    borderColor: theme.colors.error,
  },
  warningStat: {
    backgroundColor: '#FFF8E1',
    borderColor: theme.colors.warning,
  },
  infoStat: {
    backgroundColor: '#E3F2FD',
    borderColor: theme.colors.primary,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  logsSection: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  logsActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 11,
  },
  logsContainer: {
    height: 300,
  },
  logsList: {
    flex: 1,
  },
  logItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logIcon: {
    fontSize: 8,
  },
  logLevelText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  logTimestamp: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  logContent: {
    gap: 4,
  },
  logCategory: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  logMessage: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  settingsSection: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
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
  downloadButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});