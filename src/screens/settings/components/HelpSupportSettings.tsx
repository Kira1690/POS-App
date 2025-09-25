import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { theme } from '@/constants/theme';

interface HelpSupportSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

const HELP_SECTIONS = [
  {
    id: 'getting_started',
    title: '🚀 Getting Started',
    description: 'Learn the basics of using your POS system',
    items: [
      'Setting up your restaurant profile',
      'Adding menu items and categories',
      'Managing tables and orders',
      'Processing payments',
    ],
  },
  {
    id: 'user_guides',
    title: '📖 User Guides',
    description: 'Step-by-step instructions for common tasks',
    items: [
      'Staff management and permissions',
      'Kitchen operations workflow',
      'Inventory management',
      'Reports and analytics',
    ],
  },
  {
    id: 'troubleshooting',
    title: '🔧 Troubleshooting',
    description: 'Solutions to common problems',
    items: [
      'Payment processing issues',
      'Printer connection problems',
      'Network connectivity',
      'Performance optimization',
    ],
  },
  {
    id: 'integrations',
    title: '🔗 Integrations',
    description: 'Connect with third-party services',
    items: [
      'Delivery platform setup',
      'Accounting software integration',
      'Marketing tools connection',
      'Analytics platforms',
    ],
  },
];

const SUPPORT_CONTACTS = [
  {
    type: 'phone',
    label: '📞 Phone Support',
    value: '+1 (555) 123-HELP',
    description: 'Available 24/7 for urgent issues',
    action: () => Linking.openURL('tel:+15551234357'),
  },
  {
    type: 'email',
    label: '📧 Email Support',
    value: 'support@possystem.com',
    description: 'Response within 24 hours',
    action: () => Linking.openURL('mailto:support@possystem.com'),
  },
  {
    type: 'chat',
    label: '💬 Live Chat',
    value: 'Start Chat',
    description: 'Online Mon-Fri 9AM-6PM EST',
    action: () => Alert.alert('Live Chat', 'Opening live chat...'),
  },
  {
    type: 'remote',
    label: '🖥️ Remote Support',
    value: 'Request Session',
    description: 'Screen sharing assistance',
    action: () => Alert.alert('Remote Support', 'Requesting remote support session...'),
  },
];

export default function HelpSupportSettings({ onChangesDetected }: HelpSupportSettingsProps) {
  const handleSectionPress = (sectionId: string) => {
    Alert.alert('Help Section', `Opening ${sectionId} documentation...`);
  };

  const handleSearchKnowledgeBase = () => {
    Alert.alert('Knowledge Base', 'Opening searchable knowledge base...');
  };

  const handleVideoTutorials = () => {
    Alert.alert('Video Tutorials', 'Opening video tutorial library...');
  };

  const handleSystemDiagnostics = () => {
    Alert.alert(
      'System Diagnostics',
      'This will generate a diagnostic report to help support troubleshoot issues.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate Report', onPress: () => Alert.alert('Success', 'Diagnostic report generated.') },
      ]
    );
  };

  const handleFeedback = () => {
    Alert.alert('Send Feedback', 'Opening feedback form...');
  };

  const renderHelpSection = (section: any) => (
    <TouchableOpacity
      key={section.id}
      style={styles.helpSection}
      onPress={() => handleSectionPress(section.id)}
    >
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionDescription}>{section.description}</Text>
      <View style={styles.sectionItems}>
        {section.items.map((item: string, index: number) => (
          <Text key={index} style={styles.sectionItem}>• {item}</Text>
        ))}
      </View>
      <Text style={styles.sectionLink}>View Documentation →</Text>
    </TouchableOpacity>
  );

  const renderSupportContact = (contact: any) => (
    <TouchableOpacity
      key={contact.type}
      style={styles.contactCard}
      onPress={contact.action}
    >
      <Text style={styles.contactLabel}>{contact.label}</Text>
      <Text style={styles.contactValue}>{contact.value}</Text>
      <Text style={styles.contactDescription}>{contact.description}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Help & Support</Text>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleSearchKnowledgeBase}>
            <Text style={styles.quickActionIcon}>🔍</Text>
            <Text style={styles.quickActionText}>Search Knowledge Base</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleVideoTutorials}>
            <Text style={styles.quickActionIcon}>🎥</Text>
            <Text style={styles.quickActionText}>Video Tutorials</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleSystemDiagnostics}>
            <Text style={styles.quickActionIcon}>🔧</Text>
            <Text style={styles.quickActionText}>System Diagnostics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handleFeedback}>
            <Text style={styles.quickActionIcon}>💭</Text>
            <Text style={styles.quickActionText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help Documentation */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Documentation</Text>
        {HELP_SECTIONS.map(renderHelpSection)}
      </View>

      {/* Support Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Contact Support</Text>
        <View style={styles.contactGrid}>
          {SUPPORT_CONTACTS.map(renderSupportContact)}
        </View>
      </View>

      {/* System Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>System Information</Text>
        <View style={styles.systemInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>2.1.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>20240120</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device Model</Text>
            <Text style={styles.infoValue}>iPad Pro 12.9"</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>OS Version</Text>
            <Text style={styles.infoValue}>iOS 17.2</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Restaurant ID</Text>
            <Text style={styles.infoValue}>rest_001</Text>
          </View>
        </View>
      </View>

      {/* Legal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Legal</Text>
        <View style={styles.legalLinks}>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>📄 Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>🔒 Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>⚖️ Software License</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>🏢 About Company</Text>
          </TouchableOpacity>
        </View>
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  helpSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  sectionItems: {
    marginBottom: 10,
  },
  sectionItem: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  sectionLink: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  contactValue: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 5,
  },
  contactDescription: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  systemInfo: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  legalLinks: {
    gap: 10,
  },
  legalLink: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legalLinkText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});