/**
 * Tables Dashboard - Visual floor plan management and table operations
 * Features: Interactive restaurant layout, color-coded status, table details panel
 * Uses shared FloorPlanCanvas from Settings for consistent floor plan display
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleCard,
  AppleButton,
  AppleStatusPill,
} from '@/components/apple';
import {
  TABLES_DASHBOARD_DATA,
  Table,
  getTableById as getTableByIdFromDashboard,
} from '@/data/dashboard/tablesDashboard';
import { DashboardFloorPlanViewer } from './components';
import { useFloorPlan } from '@/context/floorPlan';
import { MOCK_TABLES } from '@/data/tables';
import { TableStatus } from '@/types/settings/table-management.types';

/**
 * Map string status to TableStatus enum for floor plan
 */
const mapStringToStatus = (status: string): TableStatus => {
  const statusMap: Record<string, TableStatus> = {
    available: TableStatus.AVAILABLE,
    occupied: TableStatus.OCCUPIED,
    reserved: TableStatus.RESERVED,
    cleaning: TableStatus.CLEANING,
    out_of_service: TableStatus.OUT_OF_SERVICE,
  };
  return statusMap[status.toLowerCase()] || TableStatus.AVAILABLE;
};

interface TableDetailsProps {
  table: Table | null;
  onClose: () => void;
  onAction: (action: string, table: Table) => void;
}

const TableDetails: React.FC<TableDetailsProps> = ({ table, onClose, onAction }) => {
  const { theme } = useTheme();

  if (!table) return null;

  const styles = {
    container: {
      marginTop: 16,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 16,
    },
    tableNumber: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: theme.colors.onSurface,
    },
    statusBadge: {
      marginLeft: 8,
    },
    infoRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    value: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: theme.colors.onSurface,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginTop: 16,
      marginBottom: 8,
    },
    orderInfo: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: theme.borderRadius.md,
      marginBottom: 12,
    },
    actionsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
      marginTop: 16,
    },
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'occupied': return 'error';
      case 'available': return 'success';
      case 'cleaning': return 'warning';
      case 'reserved': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <AppleCard layer="surface" size="large" style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.tableNumber}>Table {table.number}</Text>
          <AppleStatusPill
            status={getStatusColor(table.status)}
            text={table.status.toUpperCase()}
            size="small"
            style={styles.statusBadge}
          />
        </View>
        <AppleButton
          title="Close"
          variant="ghost"
          size="small"
          onPress={onClose}
        />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Section:</Text>
        <Text style={styles.value}>{table.section.replace('-', ' ').toUpperCase()}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Capacity:</Text>
        <Text style={styles.value}>{table.capacity} guests</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Shape:</Text>
        <Text style={styles.value}>{table.shape}</Text>
      </View>

      {table.serviceDuration && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Service Duration:</Text>
          <Text style={styles.value}>{table.serviceDuration} minutes</Text>
        </View>
      )}

      {/* Current Order Info */}
      {table.currentOrder && (
        <>
          <Text style={styles.sectionTitle}>Current Order</Text>
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{table.currentOrder.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Order Total:</Text>
              <Text style={styles.value}>${table.currentOrder.totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Items:</Text>
              <Text style={styles.value}>{table.currentOrder.itemCount} items</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Server:</Text>
              <Text style={styles.value}>{table.currentOrder.serverName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Started:</Text>
              <Text style={styles.value}>
                {new Date(table.currentOrder.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {table.currentOrder.specialRequests && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Special Requests:</Text>
                {table.currentOrder.specialRequests.map((request, index) => (
                  <Text key={index} style={[styles.value, { fontStyle: 'italic' }]}>
                    - {request}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </>
      )}

      {/* Reservation Info */}
      {table.reservationInfo && (
        <>
          <Text style={styles.sectionTitle}>Reservation</Text>
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{table.reservationInfo.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {new Date(table.reservationInfo.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Party Size:</Text>
              <Text style={styles.value}>{table.reservationInfo.partySize} guests</Text>
            </View>
            {table.reservationInfo.specialRequests && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Special Requests:</Text>
                {table.reservationInfo.specialRequests.map((request, index) => (
                  <Text key={index} style={[styles.value, { fontStyle: 'italic' }]}>
                    - {request}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {table.status === 'occupied' && (
          <>
            <AppleButton title="View Order" variant="primary" size="small" onPress={() => onAction('view-order', table)} />
            <AppleButton title="Process Payment" variant="secondary" size="small" onPress={() => onAction('payment', table)} />
            <AppleButton title="Mark for Cleaning" variant="ghost" size="small" onPress={() => onAction('cleaning', table)} />
          </>
        )}
        {table.status === 'available' && (
          <>
            <AppleButton title="Seat Guests" variant="primary" size="small" onPress={() => onAction('seat', table)} />
            <AppleButton title="Reserve Table" variant="secondary" size="small" onPress={() => onAction('reserve', table)} />
          </>
        )}
        {table.status === 'cleaning' && (
          <AppleButton title="Mark Available" variant="primary" size="small" onPress={() => onAction('available', table)} />
        )}
        {table.status === 'reserved' && (
          <>
            <AppleButton title="Check In" variant="primary" size="small" onPress={() => onAction('checkin', table)} />
            <AppleButton title="Cancel Reservation" variant="ghost" size="small" onPress={() => onAction('cancel-reservation', table)} />
          </>
        )}
      </View>
    </AppleCard>
  );
};

const TablesDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState(TABLES_DASHBOARD_DATA);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Build status map from mock data for floor plan coloring
  const tableStatusMap = useMemo(() => {
    const statusMap: Record<string, TableStatus> = {};
    MOCK_TABLES.forEach(table => {
      statusMap[table.id] = mapStringToStatus(table.status);
    });
    return statusMap;
  }, []);

  // Get selected table data for details panel
  const selectedTable = useMemo(() => {
    if (!selectedTableId) return null;
    // Try to find in dashboard data first (has order info)
    const allTables = data.floorPlan.sections.flatMap(section => section.tables);
    return allTables.find(t => t.id === selectedTableId) || null;
  }, [selectedTableId, data]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setData({ ...TABLES_DASHBOARD_DATA, lastUpdated: new Date().toISOString() });
      setRefreshing(false);
    }, 1000);
  }, []);

  // Handle table selection from floor plan
  const handleTableSelect = useCallback((tableId: string | null) => {
    setSelectedTableId(tableId);
  }, []);

  // Handle table actions
  const handleTableAction = useCallback((action: string, table: Table) => {
    Alert.alert('Table Action', `Action: ${action} for Table ${table.number}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => {
        let newStatus = table.status;
        switch (action) {
          case 'cleaning':
            newStatus = 'cleaning';
            break;
          case 'available':
            newStatus = 'available';
            break;
          case 'seat':
            newStatus = 'occupied';
            break;
          case 'reserve':
            newStatus = 'reserved';
            break;
          case 'checkin':
            newStatus = 'occupied';
            break;
          case 'cancel-reservation':
            newStatus = 'available';
            break;
        }

        // Update data
        const updatedSections = data.floorPlan.sections.map(section => ({
          ...section,
          tables: section.tables.map(t =>
            t.id === table.id ? { ...t, status: newStatus } : t
          )
        }));

        setData({
          ...data,
          floorPlan: { ...data.floorPlan, sections: updatedSections }
        });
        setSelectedTableId(null);
      }}
    ]);
  }, [data]);

  const styles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    summaryContainer: {
      flexDirection: 'row' as const,
      gap: 12,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      alignItems: 'center' as const,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: theme.colors.primary,
    },
    summaryLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center' as const,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    legendContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 12,
      marginBottom: 16,
    },
    legendItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    legendText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    floorPlanContainer: {
      height: 500,
      marginBottom: 16,
    },
  };

  // Status legend - maps to theme colors
  const statusLegend = [
    { status: 'occupied', color: theme.colors.error, label: 'Occupied' },
    { status: 'available', color: theme.colors.success, label: 'Available' },
    { status: 'cleaning', color: theme.colors.warning, label: 'Cleaning' },
    { status: 'reserved', color: theme.colors.info, label: 'Reserved' },
  ];

  // Header actions
  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleStatusPill
        status="success"
        text={`${data.summary.occupancyRate.toFixed(1)}% Full`}
        size="small"
      />
      <AppleButton
        title="Refresh"
        icon={<MaterialIcons name="refresh" size={16} color={theme.colors.onPrimary} />}
        variant="secondary"
        size="medium"
        onPress={handleRefresh}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppleDashboardPanel
        title="Tables Dashboard"
        subtitle={`${data.summary.occupied}/${data.summary.total} Tables Occupied`}
        headerActions={headerActions}
      >
        {/* Table Status Summary */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MaterialIcons name="table-restaurant" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Table Status Summary</Text>
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{data.summary.occupied}</Text>
              <Text style={styles.summaryLabel}>Occupied</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{data.summary.available}</Text>
              <Text style={styles.summaryLabel}>Available</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{data.summary.cleaning}</Text>
              <Text style={styles.summaryLabel}>Cleaning</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{data.summary.reserved}</Text>
              <Text style={styles.summaryLabel}>Reserved</Text>
            </View>
          </View>
        </AppleCard>

        {/* Status Legend */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Status Legend</Text>
          <View style={styles.legendContainer}>
            {statusLegend.map((item) => (
              <View key={item.status} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </AppleCard>

        {/* Floor Plan - Shared with Settings */}
        <AppleCard layer="surface" size="large" style={styles.floorPlanContainer}>
          <DashboardFloorPlanViewer
            selectedTableId={selectedTableId}
            onTableSelect={handleTableSelect}
            tableStatusMap={tableStatusMap}
          />
        </AppleCard>

        {/* Table Details */}
        <TableDetails
          table={selectedTable}
          onClose={() => setSelectedTableId(null)}
          onAction={handleTableAction}
        />
      </AppleDashboardPanel>
    </View>
  );
};

export default TablesDashboard;
