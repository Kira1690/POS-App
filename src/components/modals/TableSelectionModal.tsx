/**
 * Table Selection Modal - Professional modal for table selection
 * Groups tables by area for easy navigation
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@/components/common';
import { tableStorageService, StoredArea } from '@/services/storage';
import { MOCK_AREAS } from '@/data/tables/mockAreas';
import { showToast } from '@/utils/toast';

// Map common server section names to MOCK_AREAS IDs
const SECTION_ALIASES: Record<string, string> = {
  'main floor': 'area-1',
  'main dining': 'area-1',
  'vip lounge': 'area-2',
  'vip': 'area-2',
  'patio': 'area-3',
  'outdoor patio': 'area-3',
  'bar': 'area-4',
  'bar seating': 'area-4',
  'bar area': 'area-4',
};

// Helper to check if status matches (handles both string and enum)
const isStatusMatch = (status: TableStatus | string, target: TableStatus | string): boolean => {
  return String(status).toLowerCase() === String(target).toLowerCase();
};

/** Per-table split info passed from the caller (computed from active orders) */
export interface TableSplitInfo {
  orderCount: number;
  occupiedSeats: number;
}

interface TableSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onTableSelect: (table: Table) => void;
  tables: Table[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  /** Allow selecting occupied tables (caller handles existing-order logic) */
  allowOccupied?: boolean;
  /** Split info keyed by table ID — shows order count & seat usage on occupied tables */
  tableSplitInfo?: Record<string, TableSplitInfo>;
}

interface AreaWithTables {
  area: StoredArea;
  tables: Table[];
  availableCount: number;
}

export const TableSelectionModal: React.FC<TableSelectionModalProps> = ({
  visible,
  onClose,
  onTableSelect,
  tables,
  isLoading = false,
  title = 'Select Table',
  subtitle = 'Choose a table to start a new order',
  allowOccupied = false,
  tableSplitInfo = {},
}) => {
  const { theme } = useTheme();
  const { isPhone, isSmallTablet, tableGridColumns, captionSize } = useResponsive();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [areas, setAreas] = useState<StoredArea[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  // Responsive table card sizing — fill available width instead of fixed 100px
  const useCompactLayout = isPhone || isSmallTablet;
  const gridPadding = useCompactLayout ? 12 : 16;
  const gridGap = useCompactLayout ? 6 : 8;
  const numCols = useCompactLayout ? 3 : tableGridColumns;
  // Use measured container width for accurate card sizing; fall back to 100px
  const cardSize = containerWidth > 0
    ? Math.floor((containerWidth - gridGap * (numCols - 1)) / numCols)
    : 100;

  // Use MOCK_AREAS as canonical area list (deduplicated, correct names)
  useEffect(() => {
    if (visible) {
      const canonicalAreas: StoredArea[] = MOCK_AREAS.map(a => ({
        id: String(a.id),
        name: a.name,
        icon: a.icon,
        description: a.description,
        isActive: a.isActive,
      }));
      setAreas(canonicalAreas);
      if (__DEV__) {
        console.log(`[TableSelectionModal] Using ${canonicalAreas.length} canonical areas, received ${tables.length} tables`);
      }
    }
  }, [visible, tables.length]);

  // Match table section to area by ID, name, or alias (API returns names, SQLite stores IDs)
  const tableMatchesArea = useCallback((table: Table, area: StoredArea): boolean => {
    const section = table.section;
    if (!section || typeof section !== 'string') return false;
    // Direct ID match (e.g., "area-1" === "area-1")
    if (section === area.id) return true;
    // Direct name match (e.g., "Main Dining" === "Main Dining")
    if (section === area.name) return true;
    // Alias match (e.g., "Main Floor" → "area-1" === area.id)
    const aliasedId = SECTION_ALIASES[section.toLowerCase()];
    if (aliasedId && aliasedId === area.id) return true;
    return false;
  }, []);

  // Group tables by area
  const areasWithTables = useMemo((): AreaWithTables[] => {
    const grouped: AreaWithTables[] = [];

    for (const area of areas) {
      const areaTables = tables.filter(t => tableMatchesArea(t, area));
      const availableCount = areaTables.filter(
        t => isStatusMatch(t.status, TableStatus.AVAILABLE)
      ).length;

      if (areaTables.length > 0) {
        grouped.push({
          area,
          tables: areaTables,
          availableCount,
        });
      }
    }

    // Add tables without area assignment
    const unassignedTables = tables.filter(
      t => !t.section || !areas.find(a => tableMatchesArea(t, a))
    );
    if (unassignedTables.length > 0) {
      grouped.push({
        area: {
          id: 'other',
          name: 'Other',
          icon: 'table-furniture',
          description: 'Unassigned tables',
          isActive: true,
        },
        tables: unassignedTables,
        availableCount: unassignedTables.filter(
          t => isStatusMatch(t.status, TableStatus.AVAILABLE)
        ).length,
      });
    }

    return grouped;
  }, [tables, areas]);

  // Filter tables based on selected area
  const filteredTables = useMemo(() => {
    if (selectedAreaId === 'all') {
      return tables;
    }
    if (selectedAreaId === 'other') {
      return tables.filter(t => !t.section || !areas.find(a => tableMatchesArea(t, a)));
    }
    const selectedArea = areas.find(a => a.id === selectedAreaId);
    if (!selectedArea) return tables;
    return tables.filter(t => tableMatchesArea(t, selectedArea));
  }, [tables, selectedAreaId, areas, tableMatchesArea]);

  const handleTableSelect = useCallback((table: Table) => {
    const isOccupied = isStatusMatch(table.status, TableStatus.OCCUPIED);
    if (!isStatusMatch(table.status, TableStatus.AVAILABLE) && !(allowOccupied && isOccupied)) {
      // Show feedback for why table can't be selected
      const statusMessages: Record<string, string> = {
        [TableStatus.OCCUPIED]: 'This table has an active order. Please select a different table.',
        [TableStatus.RESERVED]: 'This table is reserved. Please select a different table.',
        [TableStatus.CLEANING]: 'This table is being cleaned. Please select a different table.',
      };

      const message = statusMessages[table.status] || 'This table is not available.';
      showToast({
        type: 'warning',
        title: 'Table Unavailable',
        message,
      });
      return;
    }
    onTableSelect(table);
    onClose();
  }, [onTableSelect, onClose, allowOccupied]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case TableStatus.AVAILABLE:
        return theme.colors.success;
      case 'occupied':
      case TableStatus.OCCUPIED:
        return theme.colors.error;
      case 'reserved':
      case TableStatus.RESERVED:
        return theme.colors.warning;
      case 'cleaning':
      case TableStatus.CLEANING:
        return theme.colors.info || theme.colors.primary;
      default:
        return theme.colors.outline;
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const available = tables.filter(t => isStatusMatch(t.status, TableStatus.AVAILABLE)).length;
    const occupied = tables.filter(t => isStatusMatch(t.status, TableStatus.OCCUPIED)).length;
    const reserved = tables.filter(t => isStatusMatch(t.status, TableStatus.RESERVED)).length;
    return { total: tables.length, available, occupied, reserved };
  }, [tables]);

  // Render table card
  const renderTableCard = ({ item: table }: { item: Table }) => {
    const isAvailable = isStatusMatch(table.status, TableStatus.AVAILABLE);
    const isOccupied = isStatusMatch(table.status, TableStatus.OCCUPIED);
    const isReserved = isStatusMatch(table.status, TableStatus.RESERVED);
    const statusColor = getStatusColor(String(table.status));
    const splitInfo = tableSplitInfo[table.id];

    // Background tint makes status immediately obvious regardless of allowOccupied
    const bgColor = isAvailable
      ? theme.colors.success + '12'
      : isOccupied
        ? theme.colors.error + '18'
        : isReserved
          ? (theme.colors.warning ?? theme.colors.outline) + '18'
          : theme.colors.surface;

    const borderColor = isAvailable
      ? theme.colors.success
      : isOccupied
        ? theme.colors.error
        : isReserved
          ? (theme.colors.warning ?? theme.colors.outline)
          : theme.colors.outline;

    // Non-selectable states (e.g. cleaning) get reduced opacity
    const opacity = isAvailable || isOccupied || isReserved ? 1 : 0.45;

    return (
      <TouchableOpacity
        style={[
          styles.tableCard,
          { backgroundColor: bgColor, borderColor, opacity },
        ]}
        onPress={() => handleTableSelect(table)}
        activeOpacity={0.75}
        testID={`btn-table-select-${table.table_number}`}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.tableNumber, { color: theme.colors.onSurface }]}>
          {table.table_number}
        </Text>
        {isOccupied && splitInfo && (
          <View style={styles.splitInfoContainer}>
            <Text style={[styles.splitInfoText, { color: theme.colors.error }]}>
              {splitInfo.orderCount > 1
                ? `Split ${splitInfo.orderCount}x`
                : 'Occupied'}
            </Text>
            <Text style={[styles.splitSeatsText, { color: theme.colors.onSurfaceVariant }]}>
              {splitInfo.occupiedSeats}/{table.capacity} seats
            </Text>
          </View>
        )}
        {isOccupied && !splitInfo && (
          <Text style={[styles.locationText, { color: theme.colors.error, fontWeight: '600' }]}>
            Occupied
          </Text>
        )}
        {isReserved && (
          <Text style={[styles.locationText, { color: theme.colors.warning ?? theme.colors.outline, fontWeight: '600' }]}>
            Reserved
          </Text>
        )}
        <View style={styles.tableInfo}>
          <Icon name="account-multiple" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.capacityText, { color: theme.colors.onSurfaceVariant }]}>
            {table.capacity}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginTop: useCompactLayout ? 0 : 60,
      borderTopLeftRadius: useCompactLayout ? 0 : 20,
      borderTopRightRadius: useCompactLayout ? 0 : 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: useCompactLayout ? 12 : 20,
      paddingVertical: useCompactLayout ? 10 : 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: useCompactLayout ? 16 : 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    subtitle: {
      fontSize: captionSize,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    areaTabsContainer: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    areaTabsContent: {
      paddingHorizontal: useCompactLayout ? 8 : 12,
      paddingVertical: useCompactLayout ? 6 : 8,
      gap: useCompactLayout ? 6 : 8,
    },
    areaTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: useCompactLayout ? 10 : 16,
      paddingVertical: useCompactLayout ? 7 : 10,
      borderRadius: 20,
      gap: useCompactLayout ? 5 : 8,
    },
    areaTabText: {
      fontSize: useCompactLayout ? 12 : 14,
      fontWeight: '500',
    },
    areaTabBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 24,
      alignItems: 'center',
    },
    areaTabBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    tablesContainer: {
      flex: 1,
      padding: gridPadding,
    },
    tableCard: {
      width: cardSize,
      height: Math.min(cardSize, useCompactLayout ? 120 : 160),
      borderRadius: 12,
      borderWidth: 2,
      padding: useCompactLayout ? 8 : 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    tableNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    tableInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    capacityText: {
      fontSize: 12,
    },
    locationText: {
      fontSize: 10,
      marginTop: 4,
    },
    splitInfoContainer: {
      alignItems: 'center',
      marginTop: 2,
    },
    splitInfoText: {
      fontSize: 10,
      fontWeight: '700',
    },
    splitSeatsText: {
      fontSize: 9,
      marginTop: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingVertical: useCompactLayout ? 8 : 12,
      paddingHorizontal: useCompactLayout ? 8 : 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: useCompactLayout ? 15 : 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    statLabel: {
      fontSize: useCompactLayout ? 10 : 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginTop: 12,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              testID="btn-table-modal-close"
            >
              <Icon name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Area Tabs */}
          <View style={styles.areaTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.areaTabsContent}
            >
              {/* All Tables Tab */}
              <TouchableOpacity
                style={[
                  styles.areaTab,
                  {
                    backgroundColor:
                      selectedAreaId === 'all'
                        ? theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => setSelectedAreaId('all')}
                testID="btn-area-tab-all"
              >
                <Icon
                  name="view-grid"
                  size={18}
                  color={selectedAreaId === 'all' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.areaTabText,
                    {
                      color:
                        selectedAreaId === 'all'
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  All
                </Text>
                <View
                  style={[
                    styles.areaTabBadge,
                    {
                      backgroundColor:
                        selectedAreaId === 'all'
                          ? theme.colors.primary
                          : theme.colors.outline,
                    },
                  ]}
                >
                  <Text style={[styles.areaTabBadgeText, { color: theme.colors.white }]}>
                    {stats.available}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Area Tabs */}
              {areasWithTables.map(({ area, availableCount }) => (
                <TouchableOpacity
                  key={area.id}
                  testID={`btn-area-tab-${area.id}`}
                  style={[
                    styles.areaTab,
                    {
                      backgroundColor:
                        selectedAreaId === area.id
                          ? theme.colors.primaryContainer
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setSelectedAreaId(area.id)}
                >
                  <Icon
                    name={area.icon as any}
                    size={18}
                    color={
                      selectedAreaId === area.id
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                  />
                  <Text
                    style={[
                      styles.areaTabText,
                      {
                        color:
                          selectedAreaId === area.id
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {area.name}
                  </Text>
                  <View
                    style={[
                      styles.areaTabBadge,
                      {
                        backgroundColor:
                          availableCount > 0
                            ? theme.colors.success
                            : theme.colors.outline,
                      },
                    ]}
                  >
                    <Text style={[styles.areaTabBadgeText, { color: theme.colors.white }]}>
                      {availableCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tables Grid */}
          <View
            style={styles.tablesContainer}
            onLayout={(e) => {
              const inner = e.nativeEvent.layout.width - gridPadding * 2;
              if (Math.abs(inner - containerWidth) > 2) setContainerWidth(inner);
            }}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading tables...</Text>
              </View>
            ) : filteredTables.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="table-furniture" size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyText}>
                  No tables available in this area
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredTables}
                renderItem={renderTableCard}
                keyExtractor={item => item.id}
                numColumns={numCols}
                key={`grid-${numCols}`}
                contentContainerStyle={{ paddingBottom: 16, gap: gridGap }}
                columnWrapperStyle={{ justifyContent: 'flex-start', gap: gridGap }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Stats Footer */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {stats.available}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.error }]}>
                {stats.occupied}
              </Text>
              <Text style={styles.statLabel}>Occupied</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {stats.reserved}
              </Text>
              <Text style={styles.statLabel}>Reserved</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TableSelectionModal;
