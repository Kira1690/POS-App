import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
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
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },

    grid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    widget: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      flex: 1,
      marginHorizontal: 4,
      minHeight: 100,
    },

    widgetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },

    widgetIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },

    widgetTitle: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
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
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },

    statusValue: {
      ...theme.typography.caption,
      fontWeight: '600',
    },

    totalText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceLight,
      marginTop: 4,
    },

    alertText: {
      ...theme.typography.caption,
      fontWeight: '600',
      marginTop: 4,
    },

    // Loading state
    loadingWidget: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      flex: 1,
      marginHorizontal: 4,
      height: 100,
      opacity: 0.5,
    },
  });

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
            <MaterialIcons name="table-restaurant" size={20} color={theme.colors.primary} />
            <Text style={styles.widgetTitle}>Tables</Text>
          </View>
          <View style={styles.widgetContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Occupied:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.warning }]}>
                {data.tables.occupied}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Available:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.success }]}>
                {data.tables.available}
              </Text>
            </View>
            <Text style={styles.totalText}>Total: {data.tables.total} tables</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.widget} onPress={onNavigateToKitchen}>
          <View style={styles.widgetHeader}>
            <MaterialIcons name="restaurant" size={20} color={theme.colors.primary} />
            <Text style={styles.widgetTitle}>Kitchen</Text>
          </View>
          <View style={styles.widgetContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Pending:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.error }]}>
                {data.kitchen.pendingOrders}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Avg Time:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.info }]}>
                {data.kitchen.avgCookTime}
              </Text>
            </View>
            {data.kitchen.alerts > 0 && (
              <Text style={[styles.alertText, { color: theme.colors.error }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialIcons name="warning" size={14} color={theme.colors.error} />
                  <Text>{data.kitchen.alerts} alerts</Text>
                </View>
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.widget} onPress={onNavigateToStaff}>
          <View style={styles.widgetHeader}>
            <MaterialIcons name="group" size={20} color={theme.colors.primary} />
            <Text style={styles.widgetTitle}>Staff</Text>
          </View>
          <View style={styles.widgetContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>On Duty:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.success }]}>
                {data.staff.onDuty}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>On Break:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.warning }]}>
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