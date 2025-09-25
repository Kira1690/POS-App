import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';

interface QuickReportsPanelProps {
  onQuickReport: (reportType: string) => void;
}

const QUICK_REPORTS = [
  {
    id: 'daily_summary',
    title: 'Daily Summary',
    description: 'Today\'s complete performance overview',
    icon: '📅',
    color: theme.colors.primary,
    bgColor: '#E3F2FD',
  },
  {
    id: 'inventory_alert',
    title: 'Inventory Alerts',
    description: 'Low stock and reorder notifications',
    icon: '📦',
    color: theme.colors.warning,
    bgColor: '#FFF3E0',
  },
  {
    id: 'staff_schedule',
    title: 'Staff Schedule',
    description: 'Current shift and scheduling overview',
    icon: '📅',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
  },
  {
    id: 'tax_report',
    title: 'Tax Report',
    description: 'Tax calculations and summaries',
    icon: '📊',
    color: theme.colors.success,
    bgColor: '#E8F5E8',
  },
  {
    id: 'customer_insights',
    title: 'Customer Insights',
    description: 'Customer behavior and analytics',
    icon: '👥',
    color: '#FF7043',
    bgColor: '#FFF3E0',
  },
  {
    id: 'kitchen_performance',
    title: 'Kitchen Performance',
    description: 'Order timing and kitchen metrics',
    icon: '🍳',
    color: '#4CAF50',
    bgColor: '#E8F5E8',
  },
];

const ADVANCED_REPORTS = [
  {
    id: 'profit_loss',
    title: 'P&L Statement',
    description: 'Comprehensive profit & loss analysis',
    icon: '💹',
    premium: true,
  },
  {
    id: 'comparative_analysis',
    title: 'Comparative Analysis',
    description: 'Month-over-month comparisons',
    icon: '📈',
    premium: true,
  },
  {
    id: 'forecasting',
    title: 'Revenue Forecasting',
    description: 'Predictive revenue analysis',
    icon: '🔮',
    premium: true,
  },
];

export default function QuickReportsPanel({ onQuickReport }: QuickReportsPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Quick Reports</Text>
        <Text style={styles.subtitle}>Generate reports instantly</Text>
      </View>

      {/* Quick Reports Grid */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickReportsScroll}
      >
        <View style={styles.quickReportsGrid}>
          {QUICK_REPORTS.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[
                styles.quickReportCard,
                { backgroundColor: report.bgColor, borderColor: report.color }
              ]}
              onPress={() => onQuickReport(report.id)}
            >
              <View style={styles.quickReportHeader}>
                <Text style={styles.quickReportIcon}>{report.icon}</Text>
                <View style={[styles.quickReportBadge, { backgroundColor: report.color }]}>
                  <Text style={styles.quickReportBadgeText}>Quick</Text>
                </View>
              </View>
              
              <Text style={[styles.quickReportTitle, { color: report.color }]}>
                {report.title}
              </Text>
              
              <Text style={styles.quickReportDescription}>
                {report.description}
              </Text>
              
              <View style={styles.quickReportFooter}>
                <Text style={[styles.generateText, { color: report.color }]}>
                  🚀 Generate Now
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Advanced Reports */}
      <View style={styles.advancedSection}>
        <Text style={styles.advancedTitle}>🎆 Advanced Reports</Text>
        
        <View style={styles.advancedGrid}>
          {ADVANCED_REPORTS.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.advancedReportCard}
              onPress={() => onQuickReport(report.id)}
            >
              <View style={styles.advancedReportHeader}>
                <Text style={styles.advancedReportIcon}>{report.icon}</Text>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>✨ PRO</Text>
                </View>
              </View>
              
              <Text style={styles.advancedReportTitle}>{report.title}</Text>
              <Text style={styles.advancedReportDescription}>{report.description}</Text>
              
              <View style={styles.advancedReportFooter}>
                <Text style={styles.upgradeText}>🔓 Upgrade to Access</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Report Templates */}
      <View style={styles.templatesSection}>
        <Text style={styles.templatesTitle}>📄 Report Templates</Text>
        
        <View style={styles.templatesList}>
          <TouchableOpacity 
            style={styles.templateItem}
            onPress={() => onQuickReport('custom_template')}
          >
            <Text style={styles.templateIcon}>📩</Text>
            <View style={styles.templateContent}>
              <Text style={styles.templateTitle}>Create Custom Template</Text>
              <Text style={styles.templateDescription}>Build your own report template</Text>
            </View>
            <Text style={styles.templateArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.templateItem}
            onPress={() => onQuickReport('scheduled_reports')}
          >
            <Text style={styles.templateIcon}>⏰</Text>
            <View style={styles.templateContent}>
              <Text style={styles.templateTitle}>Scheduled Reports</Text>
              <Text style={styles.templateDescription}>Manage automated report delivery</Text>
            </View>
            <Text style={styles.templateArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.templateItem}
            onPress={() => onQuickReport('report_history')}
          >
            <Text style={styles.templateIcon}>📁</Text>
            <View style={styles.templateContent}>
              <Text style={styles.templateTitle}>Report Archive</Text>
              <Text style={styles.templateDescription}>Access previously generated reports</Text>
            </View>
            <Text style={styles.templateArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  quickReportsScroll: {
    paddingHorizontal: 15,
  },
  quickReportsGrid: {
    flexDirection: 'row',
    gap: 15,
    paddingVertical: 20,
  },
  quickReportCard: {
    width: 180,
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
  },
  quickReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  quickReportIcon: {
    fontSize: 24,
  },
  quickReportBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quickReportBadgeText: {
    fontSize: 9,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  quickReportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  quickReportDescription: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  quickReportFooter: {
    alignItems: 'center',
  },
  generateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  advancedSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  advancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  advancedReportCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    opacity: 0.8,
  },
  advancedReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  advancedReportIcon: {
    fontSize: 18,
  },
  premiumBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 8,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  advancedReportTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  advancedReportDescription: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    lineHeight: 14,
    marginBottom: 8,
  },
  advancedReportFooter: {
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 9,
    color: '#9C27B0',
    fontWeight: '600',
  },
  templatesSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  templatesList: {
    gap: 12,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  templateIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  templateArrow: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
});