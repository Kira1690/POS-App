import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { KPICard } from './KPICard';
import { KPIMetrics } from '@/types/dashboard.types';

interface KPISectionProps {
  kpis: KPIMetrics | null;
  loading?: boolean;
}

export const KPISection: React.FC<KPISectionProps> = ({ kpis, loading = false }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
    },

    grid: {
      flexDirection: 'row',
      marginHorizontal: -theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },

    gridItem: {
      flex: 1,
      marginHorizontal: theme.spacing.sm,
    },
  });

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
              color={theme.colors.success}
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
              color={theme.colors.info}
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
              color={theme.colors.warning}
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
              color={theme.colors.info}
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
            color={theme.colors.success}
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
            color={theme.colors.info}
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
            color={theme.colors.info}
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
            color={theme.colors.warning}
          />
        </View>
      </View>
    </View>
  );
};