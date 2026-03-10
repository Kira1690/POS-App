/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Use FloorPlanSettings which now provides a unified table management interface.
 * Tables are now managed directly on the floor plan canvas with the same modals.
 *
 * Tables Settings Component
 * Complete table management with all modals integrated
 * Phase 2 - All wireframe features connected
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleCard, AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import {
  MOCK_TABLES,
  MockTable,
  filterTablesByStatus,
  calculateStatusCounts,
  getStatusColorKey
} from '@/data/tables';
import {
  AddTableModalEnhanced,
  EditTableModal,
  DeleteTableDialog,
  TableHistoryModal,
  ReservationModal,
  AddAreaModal,
  EditAreaModal,
  type ReservationData,
  type AreaData,
  type AreaUpdates,
  type BulkAction,
} from './modals';

interface TablesSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const TablesSettings: React.FC<TablesSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Table state
  const [tables, setTables] = useState<MockTable[]>(MOCK_TABLES);
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Modal visibility state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isReservationModalVisible, setIsReservationModalVisible] = useState(false);
  const [isAddAreaModalVisible, setIsAddAreaModalVisible] = useState(false);
  const [isEditAreaModalVisible, setIsEditAreaModalVisible] = useState(false);

  // Currently selected/editing IDs
  const [editingTableId, setEditingTableId] = useState<string>('');
  const [deletingTableId, setDeletingTableId] = useState<string>('');
  const [viewingHistoryTableId, setViewingHistoryTableId] = useState<string>('');
  const [reservationTableId, setReservationTableId] = useState<string>('');
  const [editingAreaId, setEditingAreaId] = useState<string>('');

  // Filter tables
  const filteredTables = filterTablesByStatus(tables, activeFilter as any);

  // Calculate stats
  const totalTables = tables.length;
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const { available: availableCount, occupied: occupiedCount, reserved: reservedCount, cleaning: cleaningCount } = calculateStatusCounts(tables);

  // Filter buttons
  const filterButtons = [
    { label: 'All Tables', value: 'all', count: totalTables, color: theme.colors.primary },
    { label: 'Available', value: 'available', count: availableCount, color: theme.colors.success },
    { label: 'Occupied', value: 'occupied', count: occupiedCount, color: theme.colors.error },
    { label: 'Reserved', value: 'reserved', count: reservedCount, color: theme.colors.warning },
    { label: 'Cleaning', value: 'cleaning', count: cleaningCount, color: theme.colors.info },
  ];

  // Handlers
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleTablePress = (tableId: string) => {
    // Open edit modal when clicking on a table
    setEditingTableId(tableId);
    setIsEditModalVisible(true);
  };

  const handleAddTable = (newTable: Omit<MockTable, 'id'>) => {
    const newTableWithId: MockTable = {
      ...newTable,
      id: `t-${Date.now()}`,
    };
    setTables((prevTables) => [...prevTables, newTableWithId]);
    if (onChangesDetected) {
      onChangesDetected(true);
    }
    Alert.alert('Success', `Table ${newTable.number} added successfully!`);
  };

  const handleEditTable = (tableId: string, updates: Partial<MockTable>) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId ? { ...table, ...updates } : table
      )
    );
    if (onChangesDetected) {
      onChangesDetected(true);
    }
    Alert.alert('Success', 'Table updated successfully!');
  };

  const handleDeleteTable = (tableId: string) => {
    setTables((prevTables) => prevTables.filter((table) => table.id !== tableId));
    if (onChangesDetected) {
      onChangesDetected(true);
    }
    Alert.alert('Success', 'Table deleted successfully!');
  };

  const handleChangeReservation = (tableId: string) => {
    setReservationTableId(tableId);
    setIsReservationModalVisible(true);
    setIsEditModalVisible(false); // Close edit modal
  };

  const handleViewHistory = (tableId: string) => {
    setViewingHistoryTableId(tableId);
    setIsHistoryModalVisible(true);
    setIsEditModalVisible(false); // Close edit modal
  };

  const handleSaveReservation = (reservationData: ReservationData) => {
    // In a real app, this would save to backend
    Alert.alert('Success', 'Reservation saved successfully!');
    if (onChangesDetected) {
      onChangesDetected(true);
    }
  };

  const handleAddArea = (areaData: AreaData) => {
    // In a real app, this would save to backend
    Alert.alert('Success', `Area "${areaData.name}" added successfully!`);
    if (onChangesDetected) {
      onChangesDetected(true);
    }
  };

  const handleEditArea = (areaId: string, updates: AreaUpdates) => {
    // In a real app, this would update in backend
    Alert.alert('Success', 'Area updated successfully!');
    if (onChangesDetected) {
      onChangesDetected(true);
    }
  };

  const handleDeleteArea = (areaId: string) => {
    // In a real app, this would delete from backend
    Alert.alert('Success', 'Area deleted successfully!');
    if (onChangesDetected) {
      onChangesDetected(true);
    }
  };

  const handleAddTableToArea = (areaId: string) => {
    // Pre-fill area when adding table
    setIsEditAreaModalVisible(false);
    setIsAddModalVisible(true);
  };

  const handleBulkAction = (areaId: string, action: BulkAction) => {
    // In a real app, this would update all tables in area

    let message = '';
    switch (action) {
      case 'reset':
        message = 'All tables reset to Available';
        break;
      case 'clear_reservations':
        message = 'All reservations cleared';
        break;
      case 'mark_cleaning':
        message = 'All tables marked as Cleaning';
        break;
    }

    Alert.alert('Success', message);
    if (onChangesDetected) {
      onChangesDetected(true);
    }
  };

  const getStatusColor = (status: string) => {
    const colorKey = getStatusColorKey(status as any);
    return (theme.colors as any)[colorKey] || theme.colors.outline;
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
            const statusColor = getStatusColor(table.status);

            return (
              <TouchableOpacity
                key={table.id}
                style={[
                  styles.tableCard,
                  {
                    backgroundColor: statusColor + '20',
                    borderColor: statusColor,
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
          title="Add Table"
          variant="primary"
          size="medium"
          icon={<Icon name="plus" size={18} color={theme.colors.onPrimary} accessibilityLabel="Add table" />}
          iconPosition="left"
          onPress={() => setIsAddModalVisible(true)}
          style={{ flex: 1 }}
        />
        <AppleButton
          title="Manage Areas"
          variant="secondary"
          size="medium"
          icon={<Icon name="map-marker-plus" size={18} color={theme.colors.onSurface} accessibilityLabel="Manage areas" />}
          iconPosition="left"
          onPress={() => setIsAddAreaModalVisible(true)}
          style={{ flex: 1 }}
        />
        <AppleButton
          title="Floor Plan"
          variant="secondary"
          size="medium"
          icon={<Icon name="floor-plan" size={18} color={theme.colors.onSurface} accessibilityLabel="Floor plan" />}
          iconPosition="left"
          onPress={() => Alert.alert('Coming Soon', 'Floor Plan Editor (Phase 3)')}
          style={{ flex: 1 }}
        />
      </View>

      {/* ALL MODALS */}

      {/* Add Table Modal */}
      <AddTableModalEnhanced
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleAddTable}
      />

      {/* Edit Table Modal */}
      {editingTableId && (
        <EditTableModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setEditingTableId('');
          }}
          onSave={handleEditTable}
          onDelete={(tableId) => {
            setDeletingTableId(tableId);
            setIsDeleteDialogVisible(true);
            setIsEditModalVisible(false);
          }}
          onChangeReservation={handleChangeReservation}
          onViewHistory={handleViewHistory}
          tableId={editingTableId}
        />
      )}

      {/* Delete Table Dialog */}
      {deletingTableId && (
        <DeleteTableDialog
          visible={isDeleteDialogVisible}
          onClose={() => {
            setIsDeleteDialogVisible(false);
            setDeletingTableId('');
          }}
          onConfirm={() => {
            handleDeleteTable(deletingTableId);
            setIsDeleteDialogVisible(false);
            setDeletingTableId('');
          }}
          tableId={deletingTableId}
        />
      )}

      {/* Table History Modal */}
      {viewingHistoryTableId && (
        <TableHistoryModal
          visible={isHistoryModalVisible}
          onClose={() => {
            setIsHistoryModalVisible(false);
            setViewingHistoryTableId('');
          }}
          tableId={viewingHistoryTableId}
        />
      )}

      {/* Reservation Modal */}
      {reservationTableId && (
        <ReservationModal
          visible={isReservationModalVisible}
          onClose={() => {
            setIsReservationModalVisible(false);
            setReservationTableId('');
          }}
          onSave={handleSaveReservation}
          tableNumber={tables.find(t => t.id === reservationTableId)?.number || ''}
          tableCapacity={tables.find(t => t.id === reservationTableId)?.capacity || 4}
        />
      )}

      {/* Add Area Modal */}
      <AddAreaModal
        visible={isAddAreaModalVisible}
        onClose={() => setIsAddAreaModalVisible(false)}
        onSave={handleAddArea}
      />

      {/* Edit Area Modal */}
      {editingAreaId && (
        <EditAreaModal
          visible={isEditAreaModalVisible}
          onClose={() => {
            setIsEditAreaModalVisible(false);
            setEditingAreaId('');
          }}
          onSave={handleEditArea}
          onDelete={handleDeleteArea}
          onAddTable={handleAddTableToArea}
          onBulkAction={handleBulkAction}
          areaId={editingAreaId}
        />
      )}
    </ScrollView>
  );
};

export default TablesSettings;
