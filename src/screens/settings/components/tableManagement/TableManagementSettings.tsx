/**
 * Table Management Settings Component
 * Main settings interface for table configuration
 * Following SOLID principles and theme system
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { useAuth } from '@/context/auth/AuthContext';
import { useTableManagement } from '@/context/tableManagement';
import { TableStatus } from '@/types/settings/table-management.types';
import { TableGrid } from './TableGrid';
import { AppleCard, AppleButton, AppleStatusPill } from '@/components/apple';

interface TableManagementSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const TableManagementSettings: React.FC<
  TableManagementSettingsProps
> = ({ onChangesDetected }) => {
  const { theme } = useTheme();
  const { state: authState } = useAuth();
  const {
    state,
    loadTables,
    loadAreas,
    selectTable,
    setFilters,
    setSearchQuery,
  } = useTableManagement();

  const [activeFilter, setActiveFilter] = useState<'all' | TableStatus>('all');

  // Load tables and areas on mount
  useEffect(() => {
    const restaurantId = authState.restaurant?.id || 'rest_001';
    loadTables(restaurantId);
    loadAreas(restaurantId);
  }, [authState.restaurant?.id, loadTables, loadAreas]);

  // Filter buttons data
  const filterButtons = [
    {
      label: 'All Tables',
      value: 'all' as const,
      count: state.tables.length,
      color: theme.colors.primary,
    },
    {
      label: 'Available',
      value: TableStatus.AVAILABLE,
      count: state.tables.filter((t) => t.status === TableStatus.AVAILABLE)
        .length,
      color: theme.colors.success,
    },
    {
      label: 'Occupied',
      value: TableStatus.OCCUPIED,
      count: state.tables.filter((t) => t.status === TableStatus.OCCUPIED)
        .length,
      color: theme.colors.error,
    },
    {
      label: 'Reserved',
      value: TableStatus.RESERVED,
      count: state.tables.filter((t) => t.status === TableStatus.RESERVED)
        .length,
      color: theme.colors.warning,
    },
  ];

  const handleFilterChange = useCallback(
    (filter: 'all' | TableStatus) => {
      setActiveFilter(filter);
      setFilters({ status: filter });
    },
    [setFilters]
  );

  const handleTablePress = useCallback(
    (table: any) => {
      selectTable(table);
    },
    [selectTable]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    title: {
      ...typography.headlineMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    filtersContainer: {
      padding: spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    filterButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      minWidth: 100,
      alignItems: 'center',
    },
    filterButtonText: {
      ...typography.bodyMedium,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    actionsBar: {
      padding: spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: spacing.sm,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...typography.headlineSmall,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    statLabel: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
  });

  // Calculate stats
  const totalCapacity = state.tables.reduce((sum, t) => sum + t.capacity, 0);
  const availableCount = state.tables.filter(
    (t) => t.status === TableStatus.AVAILABLE
  ).length;
  const occupiedCount = state.tables.filter(
    (t) => t.status === TableStatus.OCCUPIED
  ).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🪑 Table Management</Text>
        <Text style={styles.subtitle}>
          Configure and manage restaurant tables
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{state.tables.length}</Text>
          <Text style={styles.statLabel}>Total Tables</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCapacity}</Text>
          <Text style={styles.statLabel}>Total Seats</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{availableCount}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{occupiedCount}</Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          {filterButtons.map((button) => {
            const isActive = activeFilter === button.value;
            return (
              <TouchableOpacity
                key={button.value}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isActive
                      ? button.color
                      : theme.colors.surface,
                    borderColor: button.color,
                  },
                ]}
                onPress={() => handleFilterChange(button.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: isActive ? theme.colors.onPrimary : button.color,
                    },
                  ]}
                >
                  {button.label} ({button.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Table Grid */}
      <View style={styles.content}>
        <TableGrid
          tables={state.tables}
          filters={state.filters}
          searchQuery={state.searchQuery}
          selectedTableId={state.selectedTable?.id}
          onTablePress={handleTablePress}
          numColumns={4}
        />
      </View>

      {/* Action Bar */}
      <View style={styles.actionsBar}>
        <AppleButton
          title="➕ Add Table"
          variant="primary"
          size="medium"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
        <AppleButton
          title="📍 Floor Plan"
          variant="secondary"
          size="medium"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
        <AppleButton
          title="🔧 Configure"
          variant="secondary"
          size="medium"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

export default TableManagementSettings;
