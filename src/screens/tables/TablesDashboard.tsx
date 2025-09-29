/**
 * Tables Dashboard - Visual floor plan management and table operations according to wireframes
 * Features: Interactive restaurant layout, color-coded status, table details panel, section management
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import {
  AppleDashboardPanel,
  AppleCard,
  AppleButton,
  AppleStatusPill,
  AppleInteractive,
} from '@/components/apple';
import {
  TABLES_DASHBOARD_DATA,
  Table,
  TableSection,
  getTablesByStatus,
  getTablesBySection,
  getLongestWaitingTable,
} from '@/data/dashboard/tablesDashboard';

const { width } = Dimensions.get('window');
const FLOOR_PLAN_WIDTH = width - 32; // Account for padding
const FLOOR_PLAN_HEIGHT = 400;

interface TableComponentProps {
  table: Table;
  isSelected: boolean;
  onPress: (table: Table) => void;
  scale: number;
}

const TableComponent: React.FC<TableComponentProps> = ({ table, isSelected, onPress, scale }) => {
  const { theme } = useTheme();

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'occupied': return '#FF6B6B';
      case 'available': return '#32CD32';
      case 'cleaning': return '#FFB347';
      case 'reserved': return '#4A90E2';
      default: return theme.colors.outline;
    }
  };

  const getTableShape = () => {
    const size = table.capacity <= 2 ? 40 : table.capacity <= 4 ? 50 : 60;
    const scaledSize = size * scale;

    const baseStyle = {
      width: scaledSize,
      height: scaledSize,
      backgroundColor: getStatusColor(table.status),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: isSelected ? 3 : 1,
      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
      position: 'absolute' as const,
      left: table.position.x * scale,
      top: table.position.y * scale,
    };

    if (table.shape === 'round') {
      return {
        ...baseStyle,
        borderRadius: scaledSize / 2,
      };
    } else if (table.shape === 'rectangle') {
      return {
        ...baseStyle,
        width: scaledSize * 1.5,
        borderRadius: theme.borderRadius.sm,
      };
    } else {
      return {
        ...baseStyle,
        borderRadius: theme.borderRadius.sm,
      };
    }
  };

  return (
    <TouchableOpacity
      style={getTableShape()}
      onPress={() => onPress(table)}
      activeOpacity={0.7}
    >
      <Text style={{
        fontSize: 12 * scale,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
      }}>
        {table.number}
      </Text>
      {table.capacity && (
        <Text style={{
          fontSize: 8 * scale,
          color: '#FFFFFF',
          textAlign: 'center',
        }}>
          ({table.capacity})
        </Text>
      )}
    </TouchableOpacity>
  );
};

interface FloorPlanProps {
  selectedTable: Table | null;
  onTableSelect: (table: Table) => void;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ selectedTable, onTableSelect }) => {
  const { theme } = useTheme();

  // Calculate scale to fit floor plan
  const scale = Math.min(FLOOR_PLAN_WIDTH / 800, FLOOR_PLAN_HEIGHT / 500);

  const styles = {
    container: {
      width: FLOOR_PLAN_WIDTH,
      height: FLOOR_PLAN_HEIGHT,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.lg,
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    specialArea: {
      position: 'absolute' as const,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    specialAreaText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
  };

  const { floorPlan } = TABLES_DASHBOARD_DATA;
  const allTables = floorPlan.sections.flatMap(section => section.tables);

  return (
    <View style={styles.container}>
      {/* Special Areas */}
      <View style={[
        styles.specialArea,
        {
          left: floorPlan.specialAreas.kitchen.x * scale,
          top: floorPlan.specialAreas.kitchen.y * scale,
          width: floorPlan.specialAreas.kitchen.width * scale,
          height: floorPlan.specialAreas.kitchen.height * scale,
        }
      ]}>
        <Text style={styles.specialAreaText}>🍳 Kitchen</Text>
      </View>

      <View style={[
        styles.specialArea,
        {
          left: floorPlan.specialAreas.bar.x * scale,
          top: floorPlan.specialAreas.bar.y * scale,
          width: floorPlan.specialAreas.bar.width * scale,
          height: floorPlan.specialAreas.bar.height * scale,
        }
      ]}>
        <Text style={styles.specialAreaText}>🍸 Bar</Text>
      </View>

      <View style={[
        styles.specialArea,
        {
          left: floorPlan.specialAreas.entrance.x * scale,
          top: floorPlan.specialAreas.entrance.y * scale,
          width: floorPlan.specialAreas.entrance.width * scale,
          height: floorPlan.specialAreas.entrance.height * scale,
        }
      ]}>
        <Text style={styles.specialAreaText}>🚪 Entrance</Text>
      </View>

      {/* Tables */}
      {allTables.map((table) => (
        <TableComponent
          key={table.id}
          table={table}
          isSelected={selectedTable?.id === table.id}
          onPress={onTableSelect}
          scale={scale}
        />
      ))}
    </View>
  );
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
          title="✕"
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
                    • {request}
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
                    • {request}
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
  const { theme, isDark } = useTheme();
  const [data, setData] = useState(TABLES_DASHBOARD_DATA);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setData({ ...TABLES_DASHBOARD_DATA, lastUpdated: new Date().toISOString() });
      setRefreshing(false);
    }, 1000);
  };

  // Handle table selection
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table.id === selectedTable?.id ? null : table);
  };

  // Handle table actions
  const handleTableAction = (action: string, table: Table) => {
    Alert.alert('Table Action', `Action: ${action} for Table ${table.number}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => {
        // Update table status based on action
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
        setSelectedTable(null);
      }}
    ]);
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background,
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
  };

  // Status legend
  const statusLegend = [
    { status: 'occupied', color: '#FF6B6B', label: 'Occupied' },
    { status: 'available', color: '#32CD32', label: 'Available' },
    { status: 'cleaning', color: '#FFB347', label: 'Cleaning' },
    { status: 'reserved', color: '#4A90E2', label: 'Reserved' },
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
        title="🔄 Refresh"
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
        subtitle={`${data.summary.occupied}/${data.summary.total} Tables Occupied • ${data.floorPlan.sections.length} Sections`}
        headerActions={headerActions}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Table Status Summary */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>📊 Table Status Summary</Text>
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
          <Text style={styles.sectionTitle}>🎨 Status Legend</Text>
          <View style={styles.legendContainer}>
            {statusLegend.map((item) => (
              <View key={item.status} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </AppleCard>

        {/* Floor Plan */}
        <AppleCard layer="surface" size="large" style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>🏪 Restaurant Floor Plan</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 16 }}
          >
            <FloorPlan
              selectedTable={selectedTable}
              onTableSelect={handleTableSelect}
            />
          </ScrollView>
        </AppleCard>

        {/* Table Details */}
        <TableDetails
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onAction={handleTableAction}
        />
      </AppleDashboardPanel>
    </View>
  );
};

export default TablesDashboard;