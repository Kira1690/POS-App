/**
 * Table Management Screen - Apple-style table management interface
 * Now with ExistingOrderModal for occupied tables.
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Text,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TablesStackParamList } from '@/navigation/types';
import { useTable } from '@/context/table';
import { useUnifiedOrder } from '@/context/unified-order';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Table } from '@/types/table.types';
import { UnifiedOrder } from '@/types/unified-order.types';
import { TableStatus } from '@/types/common.types';
import { TableGrid } from '@/components/business/table';
import { showToast } from '@/utils/toast';
import { formatPrice } from '@/utils/currency';
import { ExistingOrderModal } from '@/components/modals/ExistingOrderModal';
import { OrderPickerModal } from '@/components/modals/OrderPickerModal';

// APPLE COMPONENT SYSTEM (Universal Reusable Components)
import {
  AppleCard,
  AppleButton,
  AppleStatusPill,
  AppleDashboardPanel,
} from '@/components/apple';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Navigation type
type TableManagementScreenNavigationProp = StackNavigationProp<TablesStackParamList>;

const TableManagementScreen: React.FC = () => {
  const navigation = useNavigation<TableManagementScreenNavigationProp>();
  const { theme, isDark } = useTheme();
  const { state: authState } = useAuth();
  const {
    state: tableState,
    selectTable,
    updateTableStatus,
    connectToUpdates,
    refreshTables,
    clearError
  } = useTable();

  const { getActiveOrdersForTable, cancelOrder } = useUnifiedOrder();

  const [sidebarVisible, setSidebarVisible] = useState(isTablet);
  const [existingOrderModalVisible, setExistingOrderModalVisible] = useState(false);
  const [orderPickerVisible, setOrderPickerVisible] = useState(false);
  const [selectedTableForModal, setSelectedTableForModal] = useState<Table | null>(null);
  const [tableActiveOrders, setTableActiveOrders] = useState<UnifiedOrder[]>([]);
  const hasInitialized = useRef(false);

  // Load tables and connect to updates when screen mounts
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const restaurantId = authState.restaurant?.id || 'rest_001';
    refreshTables().catch(() => {});
    connectToUpdates(restaurantId);
  }, [authState.restaurant?.id, refreshTables, connectToUpdates]);

  // Handle errors
  useEffect(() => {
    if (tableState.error) {
      showToast({ type: 'error', title: 'Error', message: tableState.error });
      clearError();
    }
  }, [tableState.error, clearError]);

  const handleTableSelect = useCallback((table: Table) => {
    selectTable(table);

    if (table.status === TableStatus.AVAILABLE) {
      Alert.alert(
        'Start New Order',
        `Create a new order for Table ${table.table_number}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Order',
            style: 'default',
            onPress: () => navigation.navigate('POSOrder', { table }),
          },
        ]
      );
    } else if (table.status === TableStatus.OCCUPIED) {
      const activeOrders = getActiveOrdersForTable(table.id);
      if (activeOrders.length === 0) {
        // Occupied but no tracked order — navigate as new order
        navigation.navigate('POSOrder', { table });
      } else {
        setSelectedTableForModal(table);
        setTableActiveOrders(activeOrders);
        setExistingOrderModalVisible(true);
      }
    } else {
      showToast({
        type: 'warning',
        title: 'Table Not Available',
        message: `Table ${table.table_number} is currently ${table.status.toLowerCase()}`,
      });
    }
  }, [selectTable, navigation, getActiveOrdersForTable]);

  const handleTableLongPress = useCallback(async (table: Table) => {
    const newStatus = table.status === TableStatus.AVAILABLE
      ? TableStatus.OCCUPIED
      : TableStatus.AVAILABLE;
    try {
      await updateTableStatus(table.id, {
        status: newStatus,
        notes: `Status changed via long press at ${new Date().toLocaleTimeString()}`
      });
    } catch { /* silent */ }
  }, [updateTableStatus]);

  const handleRefresh = useCallback(async () => {
    try { await refreshTables(); } catch { /* silent */ }
  }, [refreshTables]);

  const toggleSidebar = useCallback(() => setSidebarVisible(prev => !prev), []);

  // ExistingOrderModal callbacks
  const handleUpdateOrder = useCallback(() => {
    setExistingOrderModalVisible(false);
    if (!selectedTableForModal) return;

    if (tableActiveOrders.length === 1) {
      navigation.navigate('POSOrder', {
        table: selectedTableForModal,
        editOrderId: tableActiveOrders[0].id,
      });
    } else {
      // Multiple orders — show picker
      setOrderPickerVisible(true);
    }
  }, [selectedTableForModal, tableActiveOrders, navigation]);

  const handleShiftTable = useCallback(() => {
    setExistingOrderModalVisible(false);
    showToast({ type: 'info', title: 'Shift Table', message: 'Table shift not yet implemented.' });
  }, []);

  const handleCancelAndNew = useCallback(async () => {
    setExistingOrderModalVisible(false);
    if (!selectedTableForModal || tableActiveOrders.length === 0) return;
    try {
      await cancelOrder(tableActiveOrders[0].id, 'Cancelled to start new order');
      navigation.navigate('POSOrder', { table: selectedTableForModal });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to cancel existing order.' });
    }
  }, [selectedTableForModal, tableActiveOrders, cancelOrder, navigation]);

  const handleSplitTable = useCallback(() => {
    setExistingOrderModalVisible(false);
    if (!selectedTableForModal) return;
    navigation.navigate('POSOrder', { table: selectedTableForModal });
  }, [selectedTableForModal, navigation]);

  const handleOrderPickerSelect = useCallback((order: UnifiedOrder) => {
    setOrderPickerVisible(false);
    if (!selectedTableForModal) return;
    navigation.navigate('POSOrder', {
      table: selectedTableForModal,
      editOrderId: order.id,
    });
  }, [selectedTableForModal, navigation]);

  const handleCloseExistingOrderModal = useCallback(() => {
    setExistingOrderModalVisible(false);
    setSelectedTableForModal(null);
    setTableActiveOrders([]);
  }, []);

  const handleCloseOrderPicker = useCallback(() => {
    setOrderPickerVisible(false);
  }, []);

  // Header actions
  const headerActions = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <AppleStatusPill status="online" text="Live Updates" size="small" />
      <AppleButton
        title="🔄 Refresh"
        variant="primary"
        size="medium"
        onPress={handleRefresh}
      />
      {!isTablet && (
        <AppleButton
          title="📋 Menu"
          variant="secondary"
          size="medium"
          onPress={toggleSidebar}
        />
      )}
    </View>
  );

  const renderSidebarContent = () => (
    <AppleCard layer="surface" size="large" style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.onSurface, marginBottom: 16 }}>
        Status Indicators
      </Text>
      <View style={{ gap: 12 }}>
        {(['available', 'occupied', 'reserved', 'cleaning'] as const).map(status => (
          <View key={status} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppleStatusPill status={status} size="small" />
            <Text style={{ color: theme.colors.onSurface }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 16, textAlign: 'center', fontStyle: 'italic' }}>
        Tap to select • Long press to change status
      </Text>
    </AppleCard>
  );

  const renderOrderPanel = () => (
    <AppleCard layer="surface" size="large" style={{ width: 320, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.primary, marginBottom: 20 }}>
        KOT #{tableState.activeOrder?.id?.slice(-4) || '----'}
      </Text>
      {tableState.selectedTable && (
        <AppleCard layer="surfaceVariant" size="medium" style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            Table: {tableState.selectedTable.table_number}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '500', color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            Capacity: {tableState.selectedTable.capacity}
          </Text>
          <AppleStatusPill status={tableState.selectedTable.status.toLowerCase() as any} size="small" />
        </AppleCard>
      )}
      <View style={{ flex: 1, marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.onSurface, marginBottom: 12 }}>
          Order Items
        </Text>
        {!tableState.activeOrder?.items?.length ? (
          <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
            No items in order
          </Text>
        ) : (
          tableState.activeOrder.items.map((item, index) => (
            <AppleCard key={index} layer="surfaceVariant" size="small" style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}>
                {item.name} x {item.quantity}
              </Text>
            </AppleCard>
          ))
        )}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.primary, textAlign: 'center', marginBottom: 16 }}>
          Total: {formatPrice(tableState.activeOrder?.total || 0)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <AppleButton title="📄 Print" variant="secondary" size="medium" onPress={() => {}} style={{ flex: 1 }} />
          <AppleButton title="💾 Save" variant="primary" size="medium" onPress={() => {}} style={{ flex: 1 }} />
        </View>
      </View>
    </AppleCard>
  );

  const renderContent = () => {
    if (isTablet) {
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {sidebarVisible && (
            <View style={{ width: 240, padding: 20 }}>
              {renderSidebarContent()}
            </View>
          )}
          <View style={{ flex: 1 }}>
            <TableGrid
              tables={tableState.tables}
              selectedTableId={tableState.selectedTable?.id}
              onTableSelect={handleTableSelect}
              onTableLongPress={handleTableLongPress}
              isLoading={tableState.isLoading}
            />
          </View>
          {renderOrderPanel()}
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, position: 'relative' }}>
          <TableGrid
            tables={tableState.tables}
            selectedTableId={tableState.selectedTable?.id}
            onTableSelect={handleTableSelect}
            onTableLongPress={handleTableLongPress}
            isLoading={tableState.isLoading}
            numColumns={3}
          />
          {sidebarVisible && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.surface, zIndex: 1000, padding: 20 }}>
              {renderSidebarContent()}
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? theme.colors.layer0 : theme.colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />

      <AppleDashboardPanel
        title="Table Management"
        subtitle={`Restaurant • ${tableState.tables.length} Tables`}
        headerActions={headerActions}
      >
        {renderContent()}
      </AppleDashboardPanel>

      {/* Existing Order Modal */}
      <ExistingOrderModal
        visible={existingOrderModalVisible}
        table={selectedTableForModal}
        existingOrder={tableActiveOrders[0] ?? null}
        onUpdateOrder={handleUpdateOrder}
        onShiftTable={handleShiftTable}
        onCancelAndNew={handleCancelAndNew}
        onClose={handleCloseExistingOrderModal}
        onSplitTable={handleSplitTable}
        splitAvailable={(selectedTableForModal?.capacity ?? 0) > tableActiveOrders.reduce((s, o) => s + (o.guestCount || 1), 0)}
        remainingSeats={Math.max(0, (selectedTableForModal?.capacity ?? 0) - tableActiveOrders.reduce((s, o) => s + (o.guestCount || 1), 0))}
        activeOrderCount={tableActiveOrders.length}
      />

      {/* Order Picker Modal (for multi-order tables) */}
      <OrderPickerModal
        visible={orderPickerVisible}
        table={selectedTableForModal}
        orders={tableActiveOrders}
        onSelect={handleOrderPickerSelect}
        onClose={handleCloseOrderPicker}
      />
    </SafeAreaView>
  );
};

export default TableManagementScreen;
