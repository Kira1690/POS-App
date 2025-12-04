/**
 * POS Order Screen - Modern SkyTab-style POS interface
 * Integrates table selection with menu browsing and order management
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrder } from '@/context/order';
import { useTable } from '@/context/table';
import { useTheme } from '@/hooks/useTheme';
import { useMenu } from '@/hooks/useMenu';
import { MenuItem } from '@/types/menu.types';
import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { BillPanel } from '@/components/business/order';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { showToast } from '@/utils/toast';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Layout constants based on SkyTab design
const CATEGORY_PANEL_WIDTH = 240;

const POSOrderScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  
  // Get table from navigation params
  const routeTable = (route.params as any)?.table as Table | undefined;
  const {
    currentOrder,
    cart,
    cartTotal,
    cartItemCount,
    selectedTable,
    createOrder,
    addItemToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    submitOrderToKitchen,
    setError,
    clearError,
  } = useOrder();
  
  const { state: tableState, selectTable } = useTable();
  const { menuItems, categories, searchMenuItems, isLoading } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTableSelector, setShowTableSelector] = useState(!routeTable);

  // Initialize order when table is provided or selected
  useEffect(() => {
    if (routeTable && !currentOrder) {
      selectTable(routeTable);
      createOrder(routeTable);
      setShowTableSelector(false);
    }
  }, [routeTable, currentOrder, selectTable, createOrder]);

  // Filter menu items based on category and search
  const filteredMenuItems = useMemo(() => {
    let items = menuItems;
    
    if (selectedCategory !== 'ALL') {
      items = items.filter(item => item.category_id === selectedCategory);
    }
    
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  // Handle table selection
  const handleTableSelect = useCallback((table: Table) => {
    selectTable(table);
    createOrder(table);
    setShowTableSelector(false);
  }, [selectTable, createOrder]);

  // Handle menu item selection
  const handleMenuItemSelect = useCallback((menuItem: MenuItem) => {
    if (!currentOrder) {
      setError('Please select a table first');
      return;
    }
    
    try {
      addItemToCart(menuItem, 1);
      showToast({
        type: 'success',
        title: 'Item Added',
        message: `${menuItem.name} added to order`,
      });
    } catch (error) {
      setError(`Failed to add item: ${error}`);
    }
  }, [currentOrder, addItemToCart, setError]);

  // Handle cart item quantity change
  const handleCartItemUpdate = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, quantity);
    }
  }, [updateCartItem, removeFromCart]);

  // Render table selector overlay
  const renderTableSelector = () => (
    <View style={[styles.tableSelector, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.tableSelectorTitle, { color: theme.colors.onSurface }]}>
        Select a Table
      </Text>
      <FlatList
        data={tableState.tables.filter(t => t.status === TableStatus.AVAILABLE)}
        keyExtractor={(item) => item.id}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tableItem, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => handleTableSelect(item)}
          >
            <Text style={[styles.tableNumber, { color: theme.colors.onPrimaryContainer }]}>
              {item.table_number}
            </Text>
            <Text style={[styles.tableCapacity, { color: theme.colors.onPrimaryContainer }]}>
              {item.capacity} seats
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // Render category sidebar
  const renderCategorySidebar = () => (
    <View style={[styles.categorySidebar, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={[styles.categoryTitle, { color: theme.colors.onSurfaceVariant }]}>
        Categories
      </Text>
      
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { backgroundColor: selectedCategory === 'ALL' ? theme.colors.primary : theme.colors.surface }
        ]}
        onPress={() => setSelectedCategory('ALL')}
      >
        <Text style={[
          styles.categoryText,
          { color: selectedCategory === 'ALL' ? theme.colors.onPrimary : theme.colors.onSurface }
        ]}>
          ALL ITEMS
        </Text>
      </TouchableOpacity>
      
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            { backgroundColor: selectedCategory === category.id ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={[
            styles.categoryText,
            { color: selectedCategory === category.id ? theme.colors.onPrimary : theme.colors.onSurface }
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render menu item grid
  const renderMenuGrid = () => (
    <View style={styles.menuGrid}>
      <View style={[styles.menuHeader, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.surfaceVariant }]}
          placeholder="Search menu items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
        
        {selectedTable && (
          <View style={styles.tableInfo}>
            <Text style={[styles.tableInfoText, { color: theme.colors.onSurface }]}>
              Table {selectedTable.table_number} • {selectedTable.capacity} seats
            </Text>
          </View>
        )}
      </View>
      
      <FlatList
        data={filteredMenuItems}
        keyExtractor={(item) => item.id}
        numColumns={3} // Professional three-column layout
        key="menu-grid-3-columns" // Force re-render for consistent layout
        contentContainerStyle={styles.menuItemsContainer}
        columnWrapperStyle={styles.menuItemRow} // Professional row styling
        renderItem={({ item }) => (
          <View style={styles.menuItemWrapper}>
            <TouchableOpacity
              style={[styles.menuItemCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleMenuItemSelect(item)}
              activeOpacity={0.8} // Professional interaction feedback
            >
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemName, { color: theme.colors.onSurface }]}>
                  {item.name}
                </Text>
                <Text 
                  style={[styles.menuItemDescription, { color: theme.colors.onSurfaceVariant }]}
                  numberOfLines={2} // Professional line limiting
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.menuItemPrice, { color: theme.colors.primary }]}>
                ₹{item.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        // Professional performance optimizations
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={undefined} // Let FlatList handle dynamic layouts
      />
    </View>
  );

  // Professional Bill Panel - SkyTab style
  const renderBillPanel = () => {
    // Calculate bill data
    const subtotal = cartTotal;
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    // Transform cart items to BillItem format
    const billItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
      category: item.category,
    }));

    // Handle bill panel callbacks
    const handleItemQuantityChange = (itemId: string, quantity: number) => {
      handleCartItemUpdate(itemId, quantity);
    };

    const handleItemRemove = (itemId: string) => {
      removeFromCart(itemId);
    };

    const handleAddItem = () => {
      showToast({
        type: 'info',
        title: 'Add Item',
        message: 'Select items from menu to add to order',
      });
    };

    const handlePrint = () => {
      showToast({
        type: 'info',
        title: 'Print KOT',
        message: 'Printing Kitchen Order Ticket',
      });
    };

    const handleSendToKitchen = async () => {
      // Restaurant workflow: Send order to kitchen for preparation
      if (cart.length === 0) {
        showToast({
          type: 'warning',
          title: 'Empty Order',
          message: 'Add items before sending to kitchen',
        });
        return;
      }
      
      try {
        // Submit order to kitchen system (KOT)
        await submitOrderToKitchen();
        
        showToast({
          type: 'success',
          title: 'Order Sent to Kitchen',
          message: `Order ${currentOrder?.order_number} has been sent to kitchen for preparation`,
        });
        
        // Navigate back to table management or order tracking
        navigation.goBack();
        
      } catch (error) {
        console.error('Failed to send order to kitchen:', error);
        showToast({
          type: 'error',
          title: 'Kitchen Error',
          message: 'Failed to send order to kitchen. Please try again.',
        });
      }
    };

    const handleDiscount = () => {
      showToast({
        type: 'info',
        title: 'Apply Discount',
        message: 'Discount feature coming soon',
      });
    };

    const handleSplit = () => {
      showToast({
        type: 'info',
        title: 'Split Bill',
        message: 'Split bill feature coming soon',
      });
    };

    return (
      <BillPanel
        orderNumber={currentOrder?.order_number || '----'}
        tableName={selectedTable?.table_number || 'No Table'}
        tableCapacity={selectedTable?.capacity || 0}
        items={billItems}
        subtotal={subtotal}
        taxRate={taxRate}
        taxAmount={taxAmount}
        total={total}
        orderTime={currentOrder?.created_at || new Date().toISOString()}
        onItemQuantityChange={handleItemQuantityChange}
        onItemRemove={handleItemRemove}
        onAddItem={handleAddItem}
        onPrint={handlePrint}
        onSendToKitchen={handleSendToKitchen}
        onDiscount={handleDiscount}
        onSplit={handleSplit}
        isProcessing={false}
      />
    );
  };


  // Main render method
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      {showTableSelector && renderTableSelector()}
      
      {!showTableSelector && (
        <View style={styles.posLayout}>
          {isTablet && renderCategorySidebar()}
          
          <View style={styles.mainContent}>
            {renderMenuGrid()}
          </View>
          
          {renderBillPanel()}
        </View>
      )}
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Table selector overlay
  tableSelector: {
    flex: 1,
    padding: spacing.lg,
  },
  tableSelectorTitle: {
    ...typography.headlineMedium,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  tableItem: {
    flex: 1,
    margin: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minHeight: 80,
  },
  tableNumber: {
    ...typography.titleLarge,
    fontWeight: '700',
  },
  tableCapacity: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  
  // POS Layout
  posLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  
  // Category sidebar
  categorySidebar: {
    width: CATEGORY_PANEL_WIDTH,
    padding: spacing.md,
    borderRightWidth: 1,
  },
  categoryTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  categoryItem: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  categoryText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  
  // Main content area
  mainContent: {
    flex: 1,
  },
  
  // Menu grid
  menuGrid: {
    flex: 1,
  },
  menuHeader: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  tableInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tableInfoText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  
  menuItemsContainer: {
    padding: spacing.md,
    alignItems: 'stretch', // Professional alignment
  },
  menuItemRow: {
    justifyContent: 'space-between', // Professional spacing between columns
    alignItems: 'stretch', // Professional alignment
    paddingHorizontal: 0, // Remove extra padding
  },
  menuItemWrapper: {
    flex: 1, // Professional flex layout
    minWidth: 0, // Prevent flex shrinking issues
    marginHorizontal: spacing.xs / 2, // Professional spacing
  },
  menuItemContent: {
    flex: 1, // Professional content layout
    marginBottom: spacing.sm,
  },
  menuItemCard: {
    height: 130, // Fixed height for consistent three-column layout
    margin: 0, // Remove margin, use wrapper for spacing
    padding: spacing.md, // Professional padding
    borderRadius: borderRadius.md, // Professional radius
    alignItems: 'stretch', // Professional alignment
    justifyContent: 'space-between', // Professional layout
    borderWidth: 1, // Professional subtle border
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, // More subtle shadow for grid
    shadowRadius: 3,
  },
  menuItemName: {
    ...typography.titleSmall,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 15, // Professional size
    lineHeight: 20, // Professional line height
    textAlign: 'left', // Professional alignment
  },
  menuItemDescription: {
    ...typography.bodySmall,
    flex: 1,
    marginBottom: spacing.md,
    fontSize: 12, // Professional size
    lineHeight: 16, // Professional line height
    opacity: 0.8, // Professional subtle opacity
  },
  menuItemPrice: {
    ...typography.titleMedium,
    fontWeight: '700',
    fontSize: 16, // Professional size
    textAlign: 'right', // Professional alignment
    marginTop: 'auto', // Push to bottom
  },
  
});

export { POSOrderScreen };
export default POSOrderScreen;