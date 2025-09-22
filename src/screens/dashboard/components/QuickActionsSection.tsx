import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';
import { QuickActionData } from '@/types/dashboard.types';

interface QuickActionsSectionProps {
  data: QuickActionData | null;
  onNavigateToTables: () => void;
  onNavigateToKitchen: () => void;
  onNavigateToStaff: () => void;
  loading?: boolean;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  data,
  onNavigateToTables,
  onNavigateToKitchen,
  onNavigateToStaff,
  loading = false,
}) => {
  if (loading || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <View style={styles.loadingWidget} />
          <View style={styles.loadingWidget} />
          <View style={styles.loadingWidget} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.widget} onPress={onNavigateToTables}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetIcon}>🏪</Text>
            <Text style={styles.widgetTitle}>Tables</Text>
          </View>
          <View style={styles.widgetContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Occupied:</Text>
              <Text style={[styles.statusValue, { color: ProfessionalTheme.colors.warning }]}>
                {data.tables.occupied}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Available:</Text>
              <Text style={[styles.statusValue, { color: ProfessionalTheme.colors.success }]}>
                {data.tables.available}
              </Text>
            </View>
            <Text style={styles.totalText}>Total: {data.tables.total} tables</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.widget} onPress={onNavigateToKitchen}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetIcon}>🍳</Text>
            <Text style={styles.widgetTitle}>Kitchen</Text>
          </View>
          <View style={styles.widgetContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Pending:</Text>
              <Text style={[styles.statusValue, { color: ProfessionalTheme.colors.error }]}>
                {data.kitchen.pendingOrders}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Avg Time:</Text>
              <Text style={[styles.statusValue, { color: ProfessionalTheme.colors.info }]}>
                {data.kitchen.avgCookTime}
              </Text>
            </View>
            {data.kitchen.alerts > 0 && (
              <Text style={[styles.alertText, { color: ProfessionalTheme.colors.error }]}>
                ⚠️ {data.kitchen.alerts} alerts
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.widget} onPress={onNavigateToStaff}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetIcon}>👥</Text>
            <Text style={styles.widgetTitle}>Staff</Text>
          </View>
          <View style={styles.widgetContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>On Duty:</Text>
              <Text style={[styles.statusValue, { color: ProfessionalTheme.colors.success }]}>
                {data.staff.onDuty}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>On Break:</Text>
              <Text style={[styles.statusValue, { color: ProfessionalTheme.colors.warning }]}>
                {data.staff.breaks}
              </Text>
            </View>
            <Text style={styles.totalText}>Total: {data.staff.total} staff</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ProfessionalTheme.spacing.md,
    marginBottom: ProfessionalTheme.spacing.lg,
  },
  
  sectionTitle: {
    ...ProfessionalTheme.typography.h4,
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.md,
  },
  
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  widget: {
    ...ProfessionalTheme.dashboard.quickAction,
    flex: 1,
    marginHorizontal: 4,
    minHeight: 100,
  },
  
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ProfessionalTheme.spacing.sm,
  },
  
  widgetIcon: {
    fontSize: 20,
    marginRight: ProfessionalTheme.spacing.sm,
  },
  
  widgetTitle: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.text,
  },
  
  widgetContent: {
    flex: 1,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  statusLabel: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
  },
  
  statusValue: {
    ...ProfessionalTheme.typography.caption,
    fontWeight: '600',
  },
  
  totalText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textLight,
    marginTop: 4,
  },
  
  alertText: {
    ...ProfessionalTheme.typography.caption,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Loading state
  loadingWidget: {
    ...ProfessionalTheme.dashboard.quickAction,
    flex: 1,
    marginHorizontal: 4,
    height: 100,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    opacity: 0.5,
  },
});