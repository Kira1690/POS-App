import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
          <Text style={[styles.statValue, { color: ProfessionalTheme.colors.success }]}>
            {stats.activeCategories}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Inactive:</Text>
          <Text style={[styles.statValue, { color: ProfessionalTheme.colors.error }]}>
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
          <Text style={[styles.statValue, { color: ProfessionalTheme.colors.info }]}>
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
                    ? ProfessionalTheme.colors.success 
                    : ProfessionalTheme.colors.warning
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.bulkButton} onPress={onBulkActions}>
          <Text style={styles.bulkButtonText}>Bulk Actions ▼</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.importButton} onPress={onImportMenu}>
          <Text style={styles.importButtonText}>Import Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionText}>View Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={styles.quickActionText}>Pricing Rules</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>🏷️</Text>
          <Text style={styles.quickActionText}>Manage Tags</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalTheme.colors.surfaceLight,
    borderRadius: ProfessionalTheme.borderRadius.md,
    padding: ProfessionalTheme.spacing.md,
    ...ProfessionalTheme.shadows.sm,
    maxWidth: 300,
  },

  title: {
    ...ProfessionalTheme.typography.h4,
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.md,
  },

  statsContainer: {
    marginBottom: ProfessionalTheme.spacing.lg,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ProfessionalTheme.spacing.sm,
    paddingVertical: 2,
  },

  highlightRow: {
    backgroundColor: ProfessionalTheme.colors.surface,
    marginHorizontal: -ProfessionalTheme.spacing.sm,
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    paddingVertical: ProfessionalTheme.spacing.sm,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    marginVertical: ProfessionalTheme.spacing.xs,
  },

  statLabel: {
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.textSecondary,
  },

  statValue: {
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
  },

  revenueValue: {
    color: ProfessionalTheme.colors.success,
    fontSize: 16,
    fontWeight: '700',
  },

  performanceSection: {
    marginBottom: ProfessionalTheme.spacing.lg,
  },

  performanceTitle: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.md,
  },

  performanceBar: {
    marginBottom: ProfessionalTheme.spacing.md,
  },

  performanceLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  performanceLabelText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
  },

  performancePercentage: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
  },

  progressBar: {
    height: 6,
    backgroundColor: ProfessionalTheme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: ProfessionalTheme.colors.success,
    borderRadius: 3,
  },

  actionsContainer: {
    flexDirection: 'row',
    gap: ProfessionalTheme.spacing.sm,
    marginBottom: ProfessionalTheme.spacing.lg,
  },

  bulkButton: {
    flex: 1,
    backgroundColor: ProfessionalTheme.colors.primary,
    paddingVertical: ProfessionalTheme.spacing.sm,
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    borderRadius: ProfessionalTheme.borderRadius.md,
    alignItems: 'center',
  },

  bulkButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontWeight: '600',
  },

  importButton: {
    flex: 1,
    backgroundColor: ProfessionalTheme.colors.info,
    paddingVertical: ProfessionalTheme.spacing.sm,
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    borderRadius: ProfessionalTheme.borderRadius.md,
    alignItems: 'center',
  },

  importButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontWeight: '600',
  },

  quickActions: {
    marginBottom: ProfessionalTheme.spacing.md,
  },

  quickActionsTitle: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.sm,
  },

  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ProfessionalTheme.spacing.sm,
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    marginBottom: ProfessionalTheme.spacing.xs,
  },

  quickActionIcon: {
    fontSize: 16,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  quickActionText: {
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.text,
  },

  // Loading states
  loadingContent: {
    flex: 1,
  },

  loadingTitle: {
    height: 20,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: 4,
    marginBottom: ProfessionalTheme.spacing.md,
    opacity: 0.5,
  },

  loadingStat: {
    height: 16,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: 4,
    marginBottom: ProfessionalTheme.spacing.sm,
    opacity: 0.3,
  },

  loadingActions: {
    flexDirection: 'row',
    gap: ProfessionalTheme.spacing.sm,
    marginTop: ProfessionalTheme.spacing.lg,
  },

  loadingButton: {
    flex: 1,
    height: 32,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: ProfessionalTheme.borderRadius.md,
    opacity: 0.4,
  },
});