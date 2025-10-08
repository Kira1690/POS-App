/**
 * Tables Settings Component
 * Table grid view with filters and management
 * Standalone version for Settings (doesn't require TableManagementProvider)
 * Following SOLID principles and theme system
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleCard, AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';

interface TablesSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

// Mock table data for settings preview
const MOCK_TABLES = [
  { id: '1', number: 'T-1', capacity: 4, status: 'available', area: 'Main Dining' },
  { id: '2', number: 'T-2', capacity: 2, status: 'occupied', area: 'Main Dining' },
  { id: '3', number: 'T-3', capacity: 6, status: 'available', area: 'Main Dining' },
  { id: '4', number: 'T-4', capacity: 4, status: 'occupied', area: 'Main Dining' },
  { id: '5', number: 'T-5', capacity: 8, status: 'reserved', area: 'VIP Lounge' },
  { id: '6', number: 'T-6', capacity: 2, status: 'available', area: 'Patio' },
  { id: '7', number: 'T-7', capacity: 4, status: 'available', area: 'Patio' },
  { id: '8', number: 'T-8', capacity: 6, status: 'occupied', area: 'Main Dining' },
  { id: '9', number: 'T-9', capacity: 4, status: 'available', area: 'Bar Seating' },
  { id: '10', number: 'T-10', capacity: 2, status: 'available', area: 'Bar Seating' },
  { id: '11', number: 'T-11', capacity: 4, status: 'cleaning', area: 'Main Dining' },
  { id: '12', number: 'T-12', capacity: 6, status: 'available', area: 'VIP Lounge' },
];

const TablesSettings: React.FC<TablesSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Filter tables based on active filter
  const filteredTables = activeFilter === 'all'
    ? MOCK_TABLES
    : MOCK_TABLES.filter(t => t.status === activeFilter);

  // Calculate stats
  const totalTables = MOCK_TABLES.length;
  const totalCapacity = MOCK_TABLES.reduce((sum, t) => sum + t.capacity, 0);
  const availableCount = MOCK_TABLES.filter(t => t.status === 'available').length;
  const occupiedCount = MOCK_TABLES.filter(t => t.status === 'occupied').length;
  const reservedCount = MOCK_TABLES.filter(t => t.status === 'reserved').length;
  const cleaningCount = MOCK_TABLES.filter(t => t.status === 'cleaning').length;

  // Filter buttons data
  const filterButtons = [
    { label: 'All Tables', value: 'all', count: totalTables, color: theme.colors.primary },
    { label: 'Available', value: 'available', count: availableCount, color: theme.colors.success },
    { label: 'Occupied', value: 'occupied', count: occupiedCount, color: theme.colors.error },
    { label: 'Reserved', value: 'reserved', count: reservedCount, color: theme.colors.warning },
    { label: 'Cleaning', value: 'cleaning', count: cleaningCount, color: theme.colors.info },
  ];

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleTablePress = (tableId: string) => {
    setSelectedTableId(tableId === selectedTableId ? null : tableId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return theme.colors.success;
      case 'occupied': return theme.colors.error;
      case 'reserved': return theme.colors.warning;
      case 'cleaning': return theme.colors.info;
      default: return theme.colors.outline;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.md,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...typography.headlineMedium,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    statLabel: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
      marginBottom: spacing.md,
    },
    filterButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md as number,
      borderWidth: 2,
      minWidth: 100,
      alignItems: 'center',
    },
    filterButtonText: {
      ...typography.bodyMedium,
      fontWeight: '600',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      padding: spacing.md,
    },
    tableCard: {
      width: '22%',
      aspectRatio: 1,
      borderRadius: borderRadius.lg as number,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    tableNumber: {
      ...typography.titleLarge,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    tableCapacity: {
      ...typography.bodySmall,
    },
    tableArea: {
      ...typography.labelSmall,
      marginTop: spacing.xs,
    },
    actionsBar: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Stats Row */}
      <AppleCard layer="surface" size="large" style={{ marginBottom: spacing.md }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalTables}</Text>
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
      </AppleCard>

      {/* Filters */}
      <AppleCard layer="surface" size="large" style={{ marginBottom: spacing.md }}>
        <View style={styles.filterRow}>
          {filterButtons.map((button) => {
            const isActive = activeFilter === button.value;
            return (
              <TouchableOpacity
                key={button.value}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isActive ? button.color : theme.colors.surface,
                    borderColor: button.color,
                  },
                ]}
                onPress={() => handleFilterChange(button.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: isActive ? theme.colors.white : button.color,
                    },
                  ]}
                >
                  {button.label} ({button.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppleCard>

      {/* Table Grid */}
      <AppleCard layer="surface" size="large" style={{ marginBottom: spacing.md }}>
        <View style={styles.gridContainer}>
          {filteredTables.map((table) => {
            const isSelected = table.id === selectedTableId;
            const statusColor = getStatusColor(table.status);

            return (
              <TouchableOpacity
                key={table.id}
                style={[
                  styles.tableCard,
                  {
                    backgroundColor: statusColor + '20', // 20% opacity
                    borderColor: isSelected ? theme.colors.primary : statusColor,
                  },
                ]}
                onPress={() => handleTablePress(table.id)}
              >
                <Text style={[styles.tableNumber, { color: statusColor }]}>
                  {table.number}
                </Text>
                <Text style={[styles.tableCapacity, { color: theme.colors.onSurface }]}>
                  {table.capacity} seats
                </Text>
                <Text style={[styles.tableArea, { color: theme.colors.onSurfaceVariant }]}>
                  {table.area}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppleCard>

      {/* Action Bar */}
      <View style={styles.actionsBar}>
        <AppleButton
          title="➕ Add Table"
          variant="primary"
          size="medium"
          onPress={() => console.log('Add table')}
          style={{ flex: 1 }}
        />
        <AppleButton
          title="📍 Floor Plan"
          variant="secondary"
          size="medium"
          onPress={() => console.log('Floor plan')}
          style={{ flex: 1 }}
        />
        <AppleButton
          title="🔧 Configure"
          variant="secondary"
          size="medium"
          onPress={() => console.log('Configure')}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
};

export default TablesSettings;
