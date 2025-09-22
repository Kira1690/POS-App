import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KPICard } from './KPICard';
import { ProfessionalTheme } from '@/constants/theme';
import { KPIMetrics } from '@/types/dashboard.types';

interface KPISectionProps {
  kpis: KPIMetrics | null;
  loading?: boolean;
}

export const KPISection: React.FC<KPISectionProps> = ({ kpis, loading = false }) => {
  if (loading || !kpis) {
    return (
      <View style={styles.container}>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <KPICard
              title="Today's Revenue"
              value="$0.00"
              change={0}
              changeDirection="neutral"
              period="Loading..."
              icon="💰"
              color={ProfessionalTheme.colors.success}
              loading={true}
            />
          </View>
          <View style={styles.gridItem}>
            <KPICard
              title="Orders Processed"
              value="0"
              change={0}
              changeDirection="neutral"
              period="Loading..."
              icon="📊"
              color={ProfessionalTheme.colors.info}
              loading={true}
            />
          </View>
        </View>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <KPICard
              title="Average Order Value"
              value="$0.00"
              change={0}
              changeDirection="neutral"
              period="Loading..."
              icon="⏱️"
              color={ProfessionalTheme.colors.warning}
              loading={true}
            />
          </View>
          <View style={styles.gridItem}>
            <KPICard
              title="Total Revenue"
              value="$0.00"
              change={0}
              changeDirection="neutral"
              period="Loading..."
              icon="💎"
              color={ProfessionalTheme.colors.chart.accent}
              loading={true}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <KPICard
            title="Today's Sales"
            value={kpis.sales.value}
            change={kpis.sales.change}
            changeDirection={kpis.sales.changeDirection}
            period={kpis.sales.period}
            icon="💰"
            color={ProfessionalTheme.colors.success}
          />
        </View>
        <View style={styles.gridItem}>
          <KPICard
            title="Orders Processed"
            value={kpis.orders.value.toString()}
            change={kpis.orders.change}
            changeDirection={kpis.orders.changeDirection}
            period={kpis.orders.period}
            icon="📊"
            color={ProfessionalTheme.colors.info}
          />
        </View>
      </View>
      
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <KPICard
            title="Total Revenue"
            value={kpis.revenue.value}
            change={kpis.revenue.change}
            changeDirection={kpis.revenue.changeDirection}
            period={kpis.revenue.period}
            icon="💎"
            color={ProfessionalTheme.colors.chart.accent}
          />
        </View>
        <View style={styles.gridItem}>
          <KPICard
            title="Avg Order Value"
            value={kpis.averageOrderValue.value}
            change={kpis.averageOrderValue.change}
            changeDirection={kpis.averageOrderValue.changeDirection}
            period={kpis.averageOrderValue.period}
            icon="⏱️"
            color={ProfessionalTheme.colors.warning}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ProfessionalTheme.spacing.md,
  },
  
  grid: {
    flexDirection: 'row',
    marginHorizontal: -ProfessionalTheme.spacing.sm,
    marginBottom: ProfessionalTheme.spacing.sm,
  },
  
  gridItem: {
    flex: 1,
    marginHorizontal: ProfessionalTheme.spacing.sm,
  },
});