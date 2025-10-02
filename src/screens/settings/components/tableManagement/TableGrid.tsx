/**
 * TableGrid Component
 * Grid layout for displaying multiple tables
 * Following SOLID principles and theme system
 */

import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Table, TableFilters } from '@/types/settings/table-management.types';
import { TableCard } from './TableCard';

interface TableGridProps {
  tables: Table[];
  filters?: TableFilters;
  searchQuery?: string;
  selectedTableId?: string | null;
  onTablePress?: (table: Table) => void;
  onTableLongPress?: (table: Table) => void;
  numColumns?: number;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  filters,
  searchQuery = '',
  selectedTableId,
  onTablePress,
  onTableLongPress,
  numColumns = 3,
}) => {
  const { theme } = useTheme();

  // Filter and search tables
  const filteredTables = useMemo(() => {
    let filtered = [...tables];

    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Apply area filter
    if (filters?.areaId) {
      filtered = filtered.filter((t) => t.area_id === filters.areaId);
    }

    // Apply capacity filter
    if (filters?.capacityMin) {
      filtered = filtered.filter((t) => t.capacity >= filters.capacityMin!);
    }
    if (filters?.capacityMax) {
      filtered = filtered.filter((t) => t.capacity <= filters.capacityMax!);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.table_number.toLowerCase().includes(query) ||
          t.customer_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tables, filters, searchQuery]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      ...typography.bodyLarge,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    contentContainer: {
      padding: spacing.md,
    },
    columnWrapper: {
      gap: spacing.md,
    },
  });

  const renderItem = ({ item }: { item: Table }) => (
    <TableCard
      table={item}
      isSelected={item.id === selectedTableId}
      onPress={onTablePress}
      onLongPress={onTableLongPress}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={{ fontSize: 48 }}>🪑</Text>
      <Text style={styles.emptyText}>
        No tables found{'\n'}
        {searchQuery
          ? 'Try adjusting your search'
          : 'Try changing the filters'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTables}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
