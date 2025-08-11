/**
 * Table Management Screen - Main table management interface
 * Under 300 lines, focused on table management UI coordination
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TablesStackParamList } from '@/navigation/types';
import { useTable } from '@/context/table';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { TableGrid } from '@/components/business/table';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { showToast } from '@/utils/toast';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Navigation type
type TableManagementScreenNavigationProp = StackNavigationProp<TablesStackParamList>;

const TableManagementScreen: React.FC = () => {
  const navigation = useNavigation<TableManagementScreenNavigationProp>();
  const { theme } = useTheme();
  const { state: authState } = useAuth();
  const { 
    state: tableState, 
    selectTable, 
    updateTableStatus,
    createOrderForTable,
    connectToUpdates,
    refreshTables,
    clearError
  } = useTable();

  const [sidebarVisible, setSidebarVisible] = useState(isTablet);
  const hasInitialized = useRef(false);

  // Load tables and connect to updates when screen mounts
  useEffect(() => {
    if (hasInitialized.current) {
      return; // Already initialized
    }
    
    hasInitialized.current = true;
    const restaurantId = authState.restaurant?.id || 'rest_001';
    
    // Load tables on mount
    refreshTables().catch(error => {
      console.error('Failed to load tables:', error);
    });
    
    // Connect to real-time updates
    connectToUpdates(restaurantId);
    
    // No cleanup needed - provider handles it on unmount
  }, [authState.restaurant?.id, refreshTables, connectToUpdates]); // Proper dependencies

  // Handle errors
  useEffect(() => {
    if (tableState.error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: tableState.error,
      });
      clearError();
    }
  }, [tableState.error, clearError]);

  const handleTableSelect = useCallback(async (table: Table) => {
    selectTable(table);
    
    // Navigate to POS Order Screen for professional menu browsing workflow
    if (table.status === TableStatus.AVAILABLE) {
      // Show confirmation for starting new order
      Alert.alert(
        'Start New Order',
        `Create a new order for Table ${table.table_number}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Start Order',
            style: 'default',
            onPress: () => {
              navigation.navigate('POSOrder', { table });
            },
          },
        ]
      );
    } else if (table.status === TableStatus.OCCUPIED) {
      // For occupied tables, go directly to continue order
      navigation.navigate('POSOrder', { table });
    } else {
      // Table is reserved or not available
      showToast({
        type: 'warning',
        title: 'Table Not Available',
        message: `Table ${table.table_number} is currently ${table.status.toLowerCase()}`,
      });
    }
  }, [selectTable, navigation]);

  const handleTableLongPress = useCallback(async (table: Table) => {
    // Toggle table status on long press
    const newStatus = table.status === TableStatus.AVAILABLE 
      ? TableStatus.OCCUPIED 
      : TableStatus.AVAILABLE;
      
    try {
      await updateTableStatus(table.id, { 
        status: newStatus,
        notes: `Status changed via long press at ${new Date().toLocaleTimeString()}`
      });
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  }, [updateTableStatus]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshTables();
    } catch (error) {
      console.error('Failed to refresh tables:', error);
    }
  }, [refreshTables]);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  const renderHeader = () => (
    <View style={[
      styles.header, 
      { 
        backgroundColor: theme.colors.surface, // Clean white surface
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, // Subtle professional shadow
        shadowRadius: 4,
        elevation: 2,
      }
    ]}>
      <Text style={[
        styles.headerTitle, 
        { color: theme.colors.onSurface } // Professional charcoal text
      ]}>
        Table Management
      </Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[
            styles.headerButton, 
            styles.primaryButton,
            { backgroundColor: theme.colors.primary } // Professional charcoal
          ]}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.headerButtonText, 
            styles.primaryButtonText,
            { color: theme.colors.onPrimary } // White text
          ]}>
            REFRESH
          </Text>
        </TouchableOpacity>
        
        {!isTablet && (
          <TouchableOpacity
            style={[
              styles.headerButton, 
              styles.secondaryButton,
              { 
                backgroundColor: theme.colors.surface, // White background
                borderColor: theme.colors.primary, // Professional charcoal border
                borderWidth: 1.5,
              }
            ]}
            onPress={toggleSidebar}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.headerButtonText, 
              styles.secondaryButtonText,
              { color: theme.colors.primary } // Professional charcoal text
            ]}>
              MENU
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSidebar = () => (
    <View style={[styles.sidebar, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={[styles.sidebarTitle, { color: theme.colors.onSurfaceVariant }]}>
        Table Status Legend
      </Text>
      
      {/* Table status indicators */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#38a169' }]} />
          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
            Available
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#e53e3e' }]} />
          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
            Occupied
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#d69e2e' }]} />
          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
            Reserved
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#718096' }]} />
          <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
            Cleaning
          </Text>
        </View>
      </View>
      
      <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
        Tap to select a table for ordering.{'\n'}Long press to change table status.
      </Text>
    </View>
  );

  const renderOrderPanel = () => (
    <View style={[
      styles.orderPanel, 
      { 
        backgroundColor: theme.colors.surface, // Clean white
        borderLeftColor: theme.colors.outline, // Professional border
      }
    ]}>
      <Text style={[
        styles.orderTitle, 
        { color: theme.colors.primary } // Professional charcoal for KOT
      ]}>
        KOT #{tableState.activeOrder?.id?.slice(-4) || '----'}
      </Text>
      
      {tableState.selectedTable && (
        <View style={[
          styles.orderInfo, 
          { 
            backgroundColor: theme.colors.surfaceVariant, // Light gray background
            borderRadius: borderRadius.md, // Professional radius
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }
        ]}>
          <Text style={[
            styles.orderInfoText, 
            { color: theme.colors.onSurfaceVariant } // Professional gray text
          ]}>
            Table: {tableState.selectedTable.table_number}
          </Text>
          <Text style={[
            styles.orderInfoText, 
            { color: theme.colors.onSurfaceVariant }
          ]}>
            Capacity: {tableState.selectedTable.capacity}
          </Text>
          <Text style={[
            styles.orderInfoText, 
            { color: theme.colors.onSurfaceVariant }
          ]}>
            Status: {tableState.selectedTable.status}
          </Text>
        </View>
      )}
      
      <View style={styles.orderItems}>
        <Text style={[styles.orderItemsTitle, { color: theme.colors.onSurface }]}>
          Order Items
        </Text>
        
        {!tableState.activeOrder?.items?.length ? (
          <Text style={[styles.emptyOrderText, { color: theme.colors.onSurfaceVariant }]}>
            No items in order
          </Text>
        ) : (
          tableState.activeOrder.items.map((item, index) => (
            <View key={index} style={[styles.orderItem, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.orderItemText, { color: theme.colors.onSurfaceVariant }]}>
                {item.name} x {item.quantity}
              </Text>
            </View>
          ))
        )}
      </View>
      
      <View style={styles.orderActions}>
        <Text style={[styles.orderTotal, { color: theme.colors.primary }]}>
          Total: ₹{tableState.activeOrder?.total || 0}
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.secondaryActionButton,
              { 
                backgroundColor: theme.colors.surface, // White background
                borderColor: theme.colors.primary, // Professional charcoal border
                borderWidth: 1.5,
              }
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.actionButtonText, 
              { color: theme.colors.primary } // Professional charcoal text
            ]}>
              PRINT
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.primaryActionButton,
              { 
                backgroundColor: theme.colors.success, // Professional green
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.actionButtonText, 
              { color: theme.colors.onSuccess } // White text on green
            ]}>
              SAVE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isTablet) {
      // Tablet layout: three panels
      return (
        <View style={styles.tabletContent}>
          {sidebarVisible && renderSidebar()}
          
          <View style={styles.mainContent}>
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
      // Mobile layout: single panel with overlay
      return (
        <View style={styles.mobileContent}>
          <TableGrid
            tables={tableState.tables}
            selectedTableId={tableState.selectedTable?.id}
            onTableSelect={handleTableSelect}
            onTableLongPress={handleTableLongPress}
            isLoading={tableState.isLoading}
            numColumns={3}
          />
          
          {sidebarVisible && (
            <View style={[styles.mobileSidebar, { backgroundColor: theme.colors.surface }]}>
              {renderSidebar()}
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl, // Professional spacing
    paddingVertical: spacing.lg, // Professional padding
    borderBottomWidth: 0, // Remove border, use shadow instead
  },
  headerTitle: {
    ...typography.posHeader, // Professional header typography
    fontSize: 24,
    fontWeight: '700', // Professional weight
    letterSpacing: -0.5, // Professional spacing
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md, // Professional spacing
  },
  headerButton: {
    paddingHorizontal: spacing.lg, // Professional padding
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md, // Professional radius
    minWidth: 80, // Professional minimum width
    alignItems: 'center',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    // Professional outline button styling
  },
  headerButtonText: {
    ...typography.posButtonPrimary, // Professional button typography
    fontSize: 14,
    fontWeight: '700', // Professional weight
  },
  primaryButtonText: {
    // Professional primary button text
  },
  secondaryButtonText: {
    // Professional secondary button text
  },
  tabletContent: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileContent: {
    flex: 1,
    position: 'relative',
  },
  sidebar: {
    width: 240,
    padding: spacing.lg,
  },
  sidebarTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  categoryItem: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  categoryText: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  orderPanel: {
    width: 320,
    padding: spacing.xl, // Professional padding
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.08)', // Subtle professional border
  },
  orderTitle: {
    ...typography.posSubheader, // Professional subheader typography
    fontSize: 20,
    fontWeight: '700', // Professional weight
    marginBottom: spacing.lg, // Professional spacing
    letterSpacing: -0.2, // Professional letter spacing
  },
  orderInfo: {
    padding: spacing.lg, // Professional padding
    marginBottom: spacing.lg, // Professional spacing
  },
  orderInfoText: {
    ...typography.posCaption, // Professional caption typography
    fontSize: 13,
    fontWeight: '500', // Professional weight
    marginBottom: spacing.sm, // Professional spacing
    lineHeight: 18, // Professional line height
  },
  orderItems: {
    flex: 1,
    marginBottom: spacing.md,
  },
  orderItemsTitle: {
    ...typography.posSubheader, // Professional subheader
    fontSize: 16,
    fontWeight: '600', // Professional weight
    marginBottom: spacing.md, // Professional spacing
    color: '#1A1D21', // Professional charcoal color direct reference
  },
  emptyOrderText: {
    ...typography.bodyMedium,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  orderItem: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  orderItemText: {
    ...typography.bodyMedium,
  },
  orderActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: spacing.md,
  },
  orderTotal: {
    ...typography.headlineSmall,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    padding: spacing.lg, // Professional padding
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minHeight: 48, // Professional minimum touch target
  },
  primaryActionButton: {
    // Professional primary action button styling
  },
  secondaryActionButton: {
    // Professional secondary action button styling
  },
  actionButtonText: {
    ...typography.posButtonPrimary, // Professional button typography
    fontSize: 14,
    fontWeight: '700', // Professional weight
    letterSpacing: 0.5, // Professional spacing
  },
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  // Legend styles
  legendContainer: {
    marginBottom: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.bodyMedium,
    fontSize: 14,
  },
  instructionText: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default TableManagementScreen;