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

