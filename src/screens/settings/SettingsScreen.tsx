import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  RestaurantProfileSettings,
  UserManagementSettings,
  DeviceHardwareSettings,
  PaymentConfigurationSettings,
  IntegrationsSettings,
  SecurityBackupSettings,
  SystemLogsSettings,
  HelpSupportSettings,
} from './components';
import { SettingsCategory } from '@/types/settings.types';
import { theme } from '@/constants/theme';

const SETTINGS_CATEGORIES = [
  { id: 'restaurant_profile', label: '🏪 Restaurant Profile', icon: '🏪' },
  { id: 'user_management', label: '👥 User Management', icon: '👥' },
  { id: 'device_hardware', label: '📱 Device & Hardware', icon: '📱' },
  { id: 'payment_config', label: '💳 Payment Configuration', icon: '💳' },
  { id: 'integrations', label: '🔗 Integrations', icon: '🔗' },
  { id: 'security_backup', label: '🔒 Security & Backup', icon: '🔒' },
  { id: 'system_logs', label: '📊 System Logs', icon: '📊' },
  { id: 'help_support', label: '❓ Help & Support', icon: '❓' },
] as const;

export default function SettingsScreen() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('restaurant_profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleCategoryChange = (category: SettingsCategory) => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setHasUnsavedChanges(false);
              setActiveCategory(category);
            }
          },
        ]
      );
    } else {
      setActiveCategory(category);
    }
  };

  const handleSaveAllChanges = () => {
    Alert.alert(
      'Save All Changes',
      'This will save all pending changes across all settings categories.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save All', 
          onPress: () => {
            setHasUnsavedChanges(false);
            Alert.alert('Success', 'All settings have been saved successfully.');
          }
        },
      ]
    );
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'restaurant_profile':
        return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'user_management':
        return <UserManagementSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'device_hardware':
        return <DeviceHardwareSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'payment_config':
        return <PaymentConfigurationSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'integrations':
        return <IntegrationsSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'security_backup':
        return <SecurityBackupSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'system_logs':
        return <SystemLogsSettings onChangesDetected={setHasUnsavedChanges} />;
      case 'help_support':
        return <HelpSupportSettings onChangesDetected={setHasUnsavedChanges} />;
      default:
        return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, styles.saveButton]}
            onPress={handleSaveAllChanges}
          >
            <Text style={styles.saveButtonText}>💾 Save All Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, styles.backButton]}>
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Left Panel - Categories */}
        <View style={styles.leftPanel}>
          <Text style={styles.categoriesTitle}>Settings Categories</Text>
          <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
            {SETTINGS_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  activeCategory === category.id && styles.categoryItemActive
                ]}
                onPress={() => handleCategoryChange(category.id)}
              >
                <Text style={[
                  styles.categoryItemText,
                  activeCategory === category.id && styles.categoryItemTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Panel - Category Content */}
        <View style={styles.rightPanel}>
          <ScrollView 
            style={styles.categoryContent}
            showsVerticalScrollIndicator={false}
          >
            {renderCategoryContent()}
          </ScrollView>
        </View>
      </View>

      {/* Navigation Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>
          Dashboard &gt; Settings &gt; {SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.label.replace(/\p{Emoji}/gu, '').trim()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 80,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: theme.colors.gray,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: 30,
    paddingTop: 30,
    gap: 20,
  },
  leftPanel: {
    width: 280,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 460,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: theme.colors.lightGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryItemText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'left',
  },
  categoryItemTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 460,
  },
  categoryContent: {
    flex: 1,
    padding: 30,
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