/**
 * Reports Dashboard - Comprehensive analytics and business intelligence according to wireframes
 * Features: KPIs, interactive charts, date range filtering, performance reports, export options
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleCard,
  AppleButton,
  AppleStatusPill,
  AppleInteractive,
  AppleProgressBar,
} from '@/components/apple';
import {
  REPORTS_DASHBOARD_DATA,
  KPIMetric,
  ChartDataPoint,
  PerformanceReport,
  DateRangeFilter,
  formatCurrency,
  formatPercentage,
  getKPIByLabel,
  getTopPerformingMenuItems,
  getPeakHour,
  getTopCategory,
} from '@/data/dashboard/reportsDashboard';

const { width } = Dimensions.get('window');

interface KPICardProps {
  kpi: KPIMetric;
}

const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const { theme } = useTheme();

  const getTrendIcon = (trend?: string) => {
    const iconName = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat';
    const iconColor = trend === 'up' ? theme.colors.statusColors.success :
                     trend === 'down' ? theme.colors.statusColors.error :
                     theme.colors.onSurfaceVariant;

    return <MaterialIcons name={iconName as any} size={16} color={iconColor} />;
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase': return theme.colors.statusColors.success;
      case 'decrease': return theme.colors.statusColors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const styles = {
    container: {
      flex: 1,
      alignItems: 'center' as const,
      padding: 16,
    },
    icon: {
      fontSize: 24,
      marginBottom: 8,
    },
    label: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center' as const,
      marginBottom: 4,
    },
    value: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: theme.colors.onSurface,
      textAlign: 'center' as const,
      marginBottom: 4,
    },
    changeContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
    },
    changeText: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
    trendIcon: {
      fontSize: 12,
    },
  };

  return (
    <AppleCard layer="surface" size="medium" style={styles.container}>
      <Text style={styles.icon}>{kpi.icon}</Text>
      <Text style={styles.label}>{kpi.label}</Text>
      <Text style={styles.value}>{kpi.value}</Text>
      {kpi.change !== undefined && (
        <View style={styles.changeContainer}>
          {getTrendIcon(kpi.trend)}
          <Text style={[styles.changeText, { color: getChangeColor(kpi.changeType) }]}>
            {formatPercentage(kpi.change)}
          </Text>
        </View>
      )}
    </AppleCard>
  );
};

interface SimpleChartProps {
  data: ChartDataPoint[];
  title: string;
  type: 'line' | 'bar' | 'pie';
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, title, type, height = 200 }) => {
  const { theme } = useTheme();

  const maxValue = Math.max(...data.map(d => d.value));

  const styles = {
    container: {
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: 12,
      textAlign: 'center' as const,
    },
    chartContainer: {
      height,
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      justifyContent: 'space-around' as const,
      paddingHorizontal: 8,
    },
    barContainer: {
      alignItems: 'center' as const,
      flex: 1,
      marginHorizontal: 2,
    },
    bar: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      minHeight: 4,
      width: '80%',
      marginBottom: 4,
    },
    barLabel: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center' as const,
    },
    barValue: {
      fontSize: 10,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
      textAlign: 'center' as const,
      marginBottom: 4,
    },
    pieContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    pieItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      marginBottom: 8,
    },
    pieColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    pieLabel: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    pieValue: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
    },
  };

  if (type === 'pie') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.pieContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.pieItem}>
              <View style={[styles.pieColor, { backgroundColor: item.color || theme.colors.primary }]} />
              <Text style={styles.pieLabel}>{item.label}:</Text>
              <Text style={styles.pieValue}>{formatCurrency(item.value)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40);
          return (
            <View key={index} style={styles.barContainer}>
              <Text style={styles.barValue}>{typeof item.value === 'number' && item.value > 1000 ?
                formatCurrency(item.value) : item.value.toString()}</Text>
              <View style={[styles.bar, { height: barHeight }]} />
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface PerformanceReportCardProps {
  report: PerformanceReport;
}

const PerformanceReportCard: React.FC<PerformanceReportCardProps> = ({ report }) => {
  const { theme } = useTheme();

  const getTrendIcon = (trend: string) => {
    const iconName = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat';
    const iconColor = trend === 'up' ? theme.colors.statusColors.success :
                     trend === 'down' ? theme.colors.statusColors.error :
                     theme.colors.onSurfaceVariant;

    return <MaterialIcons name={iconName as any} size={16} color={iconColor} />;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return theme.colors.statusColors.success;
      case 'down': return theme.colors.statusColors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const styles = {
    container: {
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    itemContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
      marginBottom: 4,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
      flex: 1,
    },
    itemValue: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginRight: 8,
    },
    trendContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
    },
    trendText: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{report.category}</Text>
      {report.items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemValue}>
            {typeof item.value === 'number' && item.value > 100 ?
              formatCurrency(item.value) :
              `${item.value}${report.category.includes('Performance') ? '%' : ''}`}
          </Text>
          <View style={styles.trendContainer}>
            {getTrendIcon(item.trend)}
            <Text style={[styles.trendText, { color: getTrendColor(item.trend) }]}>
              {formatPercentage(item.change)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const ReportsDashboard: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState(REPORTS_DASHBOARD_DATA);
  const [selectedDateRange, setSelectedDateRange] = useState(data.selectedDateRange);
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setData({ ...REPORTS_DASHBOARD_DATA, lastUpdated: new Date().toISOString() });
      setRefreshing(false);
    }, 1000);
  };

  // Handle export
  const handleExport = (format: string) => {
    Alert.alert('Export Report', `Exporting report in ${format.toUpperCase()} format...`, [
      { text: 'OK' }
    ]);
  };

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    // In real app, this would trigger data reload
    Alert.alert('Date Range Updated', `Showing data for: ${range}`);
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
    },
    kpiContainer: {
      flexDirection: 'row' as const,
      gap: 8,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    dateRangeContainer: {
      flexDirection: 'row' as const,
      gap: 8,
      marginBottom: 16,
    },
    exportContainer: {
      flexDirection: 'row' as const,
      gap: 8,
      marginTop: 16,
    },
    chartsGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 16,
    },
    chartCard: {
      flex: 1,
      minWidth: width > 768 ? (width - 64) / 2 : width - 32,
    },
  };

  // Header actions
  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleStatusPill
        status="success"
        text={`${formatPercentage(data.kpis.find(k => k.label === 'Revenue')?.change || 0)} Growth`}
        size="small"
      />
      <AppleButton
        title="Export"
        icon={<MaterialIcons name="file-download" size={16} color={theme.colors.onPrimary} />}
        variant="secondary"
        size="medium"
        onPress={() => handleExport('pdf')}
      />
      <AppleButton
        title="Refresh"
        icon={<MaterialIcons name="refresh" size={16} color={theme.colors.onPrimary} />}
        variant="primary"
        size="medium"
        onPress={handleRefresh}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppleDashboardPanel
        title="Reports Dashboard"
        subtitle={`Analytics & Business Intelligence • ${data.selectedDateRange.replace('-', ' ').toUpperCase()}`}
        headerActions={headerActions}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Date Range Filters */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="date-range" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Date Range</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateRangeContainer}>
              {data.dateRangeFilters.map((filter) => (
                <AppleInteractive
                  key={filter.value}
                  onPress={() => handleDateRangeChange(filter.value)}
                  feedbackType="scale"
                >
                  <AppleCard
                    layer={selectedDateRange === filter.value ? "primary" : "surfaceVariant"}
                    size="small"
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: selectedDateRange === filter.value ? theme.colors.onPrimary : theme.colors.onSurface,
                    }}>
                      {filter.label}
                    </Text>
                  </AppleCard>
                </AppleInteractive>
              ))}
            </View>
          </ScrollView>
        </AppleCard>

        {/* Key Performance Indicators */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="analytics" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.kpiContainer}>
              {data.kpis.map((kpi, index) => (
                <KPICard key={index} kpi={kpi} />
              ))}
            </View>
          </ScrollView>
        </AppleCard>

        {/* Interactive Charts */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Performance Charts</Text>
          </View>

          <SimpleChart
            data={data.revenueChart}
            title="Revenue Trend (7 Days)"
            type="bar"
            height={200}
          />

          <SimpleChart
            data={data.hourlyOrderChart}
            title="Hourly Order Distribution"
            type="bar"
            height={180}
          />

          <SimpleChart
            data={data.categoryPerformanceChart}
            title="Category Performance"
            type="pie"
          />
        </AppleCard>

        {/* Performance Reports */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="assessment" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Detailed Performance Reports</Text>
          </View>

          <PerformanceReportCard report={data.salesPerformanceReport} />
          <PerformanceReportCard report={data.menuPerformanceReport} />
          <PerformanceReportCard report={data.operationsReport} />
          <PerformanceReportCard report={data.staffPerformanceReport} />
        </AppleCard>

        {/* Quick Insights */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="lightbulb" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Quick Insights</Text>
          </View>

          <View style={{ gap: 12 }}>
            <AppleCard layer="surfaceVariant" size="medium" style={{ padding: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Top Performing Hour
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
              }}>
                {getPeakHour()?.label} with {getPeakHour()?.value} orders
              </Text>
            </AppleCard>

            <AppleCard layer="surfaceVariant" size="medium" style={{ padding: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Best Category
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
              }}>
                {getTopCategory()?.label} generating {formatCurrency(getTopCategory()?.value || 0)}
              </Text>
            </AppleCard>

            <AppleCard layer="surfaceVariant" size="medium" style={{ padding: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Top Menu Items
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
              }}>
                {getTopPerformingMenuItems(3).map(item => item.name).join(', ')}
              </Text>
            </AppleCard>
          </View>
        </AppleCard>

        {/* Export Options */}
        <AppleCard layer="surface" size="large">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="share" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Export & Share</Text>
          </View>
          <Text style={{
            fontSize: 14,
            color: theme.colors.onSurfaceVariant,
            marginBottom: 16,
          }}>
            Export reports for external analysis or sharing with stakeholders
          </Text>

          <View style={styles.exportContainer}>
            <AppleButton
              title="PDF Report"
              icon={<MaterialIcons name="picture-as-pdf" size={16} color={theme.colors.onPrimary} />}
              variant="primary"
              size="medium"
              onPress={() => handleExport('pdf')}
            />
            <AppleButton
              title="Excel Data"
              icon={<MaterialIcons name="table-chart" size={16} color={theme.colors.onSurface} />}
              variant="secondary"
              size="medium"
              onPress={() => handleExport('excel')}
            />
            <AppleButton
              title="Email Report"
              icon={<MaterialIcons name="email" size={16} color={theme.colors.onSurface} />}
              variant="ghost"
              size="medium"
              onPress={() => handleExport('email')}
            />
          </View>
        </AppleCard>
      </AppleDashboardPanel>
    </View>
  );
};

export default ReportsDashboard;