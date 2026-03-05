import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DashboardMetrics,
  ReportFilters,
  SalesReport,
  ItemPerformance,
  StaffPerformance,
  FinancialSummary,
  ReportExport,
} from '@/types/reports.types';
import { MockReportsService } from '@/services/reports/MockReportsService';
import {
  MetricsDashboard,
  ReportFiltersBar,
  SalesReportCard,
  TopItemsCard,
  StaffPerformanceCard,
  FinancialSummaryCard,
  QuickReportsPanel,
} from './components';
import { useTheme } from '@/hooks/useTheme';

export default function ReportsScreen() {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [topItems, setTopItems] = useState<ItemPerformance[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const reportsService = MockReportsService.getInstance();

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      const filters: ReportFilters = {
        date_range: {
          start: getDateRange().start,
          end: getDateRange().end,
        },
        period: selectedPeriod,
        categories: selectedCategory === 'all' ? undefined : [selectedCategory],
      };

      const [metricsData, salesData, itemsData, staffData, financialData] = await Promise.all([
        reportsService.getDashboardMetrics(),
        reportsService.getSalesReport(filters),
        reportsService.getItemPerformance(filters),
        reportsService.getStaffPerformance(filters),
        reportsService.getFinancialSummary(filters),
      ]);

      setMetrics(metricsData);
      setSalesReport(salesData);
      setTopItems(itemsData);
      setStaffPerformance(staffData);
      setFinancialSummary(financialData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const today = new Date();
    const start = new Date(today);
    
    switch (selectedPeriod) {
      case 'weekly':
        start.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(today.getMonth() - 1);
        break;
      default: // daily
        start.setDate(today.getDate() - 1);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  };

  const handleFilterChange = (period: 'daily' | 'weekly' | 'monthly', category: string) => {
    setSelectedPeriod(period);
    setSelectedCategory(category);
  };

  const handleExportReport = async (type: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      const filters: ReportFilters = {
        date_range: getDateRange(),
        period: selectedPeriod,
        categories: selectedCategory === 'all' ? undefined : [selectedCategory],
      };

      const exportConfig: ReportExport = { format };
      
      Alert.alert('Export Report', `Generating ${type} report...`);
      
      const filename = await reportsService.exportReport(type, filters, exportConfig);
      Alert.alert('Success', `Report exported as ${filename}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const handleQuickReport = (reportType: string) => {
    switch (reportType) {
      case 'daily_summary':
        Alert.alert('Daily Summary', 'Opening daily summary report...');
        break;
      case 'inventory_alert':
        Alert.alert('Inventory Alert', 'Checking low stock items...');
        break;
      case 'staff_schedule':
        Alert.alert('Staff Schedule', 'Loading staff schedule...');
        break;
      case 'tax_report':
        Alert.alert('Tax Report', 'Generating tax report...');
        break;
      default:
        Alert.alert('Report', `Opening ${reportType} report...`);
    }
  };

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
      color: theme.colors.onSurfaceVariant,
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
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    refreshButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.sm,
    },
    refreshButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    reportsGrid: {
      padding: 20,
      gap: 20,
    },
    bottomActions: {
      flexDirection: 'row',
      gap: 15,
      paddingHorizontal: 30,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    scheduleButton: {
      backgroundColor: theme.colors.warning,
    },
    historyButton: {
      backgroundColor: theme.colors.outline,
    },
    actionButtonText: {
      fontSize: 14,
      color: theme.colors.white,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Performance insights and business analytics
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadReportsData}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <ReportFiltersBar
          selectedPeriod={selectedPeriod}
          selectedCategory={selectedCategory}
          onFilterChange={handleFilterChange}
        />

        {/* Dashboard Metrics */}
        {metrics && (
          <MetricsDashboard
            metrics={metrics}
            selectedPeriod={selectedPeriod}
          />
        )}

        {/* Report Cards Grid */}
        <View style={styles.reportsGrid}>
          {/* Sales Report */}
          {salesReport && (
            <SalesReportCard
              report={salesReport}
              onExport={(format) => handleExportReport('sales', format)}
            />
          )}

          {/* Top Items */}
          <TopItemsCard
            items={topItems}
            onExport={(format) => handleExportReport('items', format)}
          />

          {/* Staff Performance */}
          <StaffPerformanceCard
            performance={staffPerformance}
            onExport={(format) => handleExportReport('staff', format)}
          />

          {/* Financial Summary */}
          {financialSummary && (
            <FinancialSummaryCard
              summary={financialSummary}
              onExport={(format) => handleExportReport('financial', format)}
            />
          )}
        </View>

        {/* Quick Reports */}
        <QuickReportsPanel
          onQuickReport={handleQuickReport}
        />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleExportReport('comprehensive', 'pdf')}
        >
          <Text style={styles.actionButtonText}>Full Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.scheduleButton]}
          onPress={() => Alert.alert('Schedule Reports', 'Configure automated reports')}
        >
          <Text style={styles.actionButtonText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.historyButton]}
          onPress={() => Alert.alert('Report History', 'View past reports')}
        >
          <Text style={styles.actionButtonText}>History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}