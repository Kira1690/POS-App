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
import { Icon } from '@/components/common';
import { tableStorageService, StoredArea } from '@/services/storage';
import { showToast } from '@/utils/toast';

// Helper to check if status matches (handles both string and enum)
const isStatusMatch = (status: TableStatus | string, target: TableStatus | string): boolean => {
  return String(status).toLowerCase() === String(target).toLowerCase();
};

interface TableSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onTableSelect: (table: Table) => void;
  tables: Table[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
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
}) => {
  const { theme } = useTheme();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [areas, setAreas] = useState<StoredArea[]>([]);

  // Load areas from storage
  useEffect(() => {
    const loadAreas = async () => {
      const storedAreas = await tableStorageService.getAreas();
      setAreas(storedAreas);
      if (__DEV__) {
        console.log(`[TableSelectionModal] Loaded ${storedAreas.length} areas, received ${tables.length} tables as prop`);
      }
    };
    if (visible) {
      loadAreas();
    }
  }, [visible, tables.length]);

  // Group tables by area
  const areasWithTables = useMemo((): AreaWithTables[] => {
    const grouped: AreaWithTables[] = [];

    for (const area of areas) {
      const areaTables = tables.filter(t => t.section === area.id);
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
      t => !t.section || !areas.find(a => a.id === t.section)
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
    return tables.filter(t => t.section === selectedAreaId || (selectedAreaId === 'other' && !t.section));
  }, [tables, selectedAreaId]);

  const handleTableSelect = useCallback((table: Table) => {
    if (!isStatusMatch(table.status, TableStatus.AVAILABLE)) {
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
  }, [onTableSelect, onClose]);

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
    const statusColor = getStatusColor(String(table.status));

    return (
      <TouchableOpacity
        style={[
          styles.tableCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isAvailable ? theme.colors.success : theme.colors.outline,
            opacity: isAvailable ? 1 : 0.6,
          },
        ]}
        onPress={() => handleTableSelect(table)}
        activeOpacity={isAvailable ? 0.7 : 0.6}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.tableNumber, { color: theme.colors.onSurface }]}>
          {table.table_number}
        </Text>
        <View style={styles.tableInfo}>
          <Icon name="account-multiple" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.capacityText, { color: theme.colors.onSurfaceVariant }]}>
            {table.capacity}
          </Text>
        </View>
        {table.location && (
          <Text style={[styles.locationText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {table.location}
          </Text>
        )}
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
      marginTop: 60,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    subtitle: {
      fontSize: 14,
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
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
    },
    areaTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      gap: 8,
    },
    areaTabText: {
      fontSize: 14,
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
      padding: 16,
    },
    tableCard: {
      width: 100,
      height: 100,
      margin: 6,
      borderRadius: 12,
      borderWidth: 2,
      padding: 10,
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
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    statLabel: {
      fontSize: 11,
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
          <View style={styles.tablesContainer}>
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
                numColumns={3}
                contentContainerStyle={{ paddingBottom: 16, alignItems: 'center' }}
                columnWrapperStyle={{ justifyContent: 'flex-start', gap: 8 }}
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
