import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MenuManagementStats } from '@/types/menu-management.types';

interface MenuStatsPanelProps {
  stats: MenuManagementStats | null;
  loading: boolean;
  onBulkActions: () => void;
  onImportMenu: () => void;
}

export const MenuStatsPanel: React.FC<MenuStatsPanelProps> = ({
  stats,
  loading,
  onBulkActions,
  onImportMenu,
}) => {
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    loadingContent: {
      gap: theme.spacing.sm,
    },
    loadingTitle: {
      height: 24,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
      width: '60%',
    },
    loadingStat: {
      height: 20,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
    },
    loadingActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    loadingButton: {
      flex: 1,
      height: 40,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    statsContainer: {
      marginBottom: theme.spacing.md,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    highlightRow: {
      backgroundColor: theme.colors.primaryContainer,
      marginHorizontal: -theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    statLabel: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceSecondary,
    },
    statValue: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    revenueValue: {
      color: theme.colors.success,
      fontWeight: '700',
    },
    performanceSection: {
      marginBottom: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    performanceTitle: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    performanceBar: {
      marginBottom: theme.spacing.sm,
    },
    performanceLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    performanceLabelText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
    },
    performancePercentage: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.round,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.round,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    bulkButton: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    bulkButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
    },
    importButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    importButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
    },
    quickActions: {
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    quickActionsTitle: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    quickAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    quickActionIcon: {
      fontSize: 16,
      marginRight: theme.spacing.sm,
    },
    quickActionText: {
      ...theme.typography.body2,
      color: theme.colors.tertiary,
    },
  });

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingTitle} />
          <View style={styles.loadingStat} />
          <View style={styles.loadingStat} />
          <View style={styles.loadingStat} />
          <View style={styles.loadingActions}>
            <View style={styles.loadingButton} />
            <View style={styles.loadingButton} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Stats</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Categories:</Text>
          <Text style={styles.statValue}>{stats.totalCategories}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active:</Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {stats.activeCategories}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Inactive:</Text>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {stats.inactiveCategories}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Items:</Text>
          <Text style={styles.statValue}>{stats.totalItems}</Text>
        </View>

        <View style={[styles.statRow, styles.highlightRow]}>
          <Text style={styles.statLabel}>Today's Revenue:</Text>
          <Text style={[styles.statValue, styles.revenueValue]}>
            {formatCurrency(stats.todayRevenue)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Top Performer:</Text>
          <Text style={[styles.statValue, { color: theme.colors.info }]}>
            {stats.topPerformer}
          </Text>
        </View>
      </View>

      {/* Performance Indicators */}
      <View style={styles.performanceSection}>
        <Text style={styles.performanceTitle}>Performance</Text>

        <View style={styles.performanceBar}>
          <View style={styles.performanceLabel}>
            <Text style={styles.performanceLabelText}>Active Categories</Text>
            <Text style={styles.performancePercentage}>
              {Math.round((stats.activeCategories / stats.totalCategories) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(stats.activeCategories / stats.totalCategories) * 100}%` }
              ]}
            />
          </View>
        </View>

        <View style={styles.performanceBar}>
          <View style={styles.performanceLabel}>
            <Text style={styles.performanceLabelText}>Revenue Target</Text>
            <Text style={styles.performancePercentage}>
              {Math.round((stats.todayRevenue / 10000) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((stats.todayRevenue / 10000) * 100, 100)}%`,
                  backgroundColor: stats.todayRevenue > 10000
                    ? theme.colors.success
                    : theme.colors.warning
                }
              ]}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.bulkButton} onPress={onBulkActions}>
          <Text style={styles.bulkButtonText}>Bulk Actions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.importButton} onPress={onImportMenu}>
          <Text style={styles.importButtonText}>Import Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>View Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>Pricing Rules</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>Manage Tags</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
