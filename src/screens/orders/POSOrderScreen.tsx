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
import { useEnhancedOrder, useCart, useCurrentOrder } from '@/context/order';
import { useTable } from '@/context/table';
import { useTheme } from '@/hooks/useTheme';
import { useMenu } from '@/hooks/useMenu';
import { MenuItemExtended, SelectedModifier, ComboDeal } from '@/types/menu-management-extended.types';
import { MenuItem } from '@/types/menu.types';
import { useMenuContext } from '@/context/menu';
import { Table } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';
import { BillPanel } from '@/components/business/order';
import ModifierSelectionModal from '@/screens/orders/components/ModifierSelectionModal';
import ComboSelectionModal, { ComboSelectionResult } from '@/screens/orders/modals/ComboSelectionModal';
import { ComboGridSection } from '@/components/business/menu/ComboGridSection';
import { spacing, borderRadius, shadows } from '@/design-system/theme/spacing';
import { panelWidths, cardDimensions, touchTargets, iconSizes, elevations, dividers } from '@/design-system/theme/layout';
import { typography } from '@/design-system/theme/typography';
import { showToast } from '@/utils/toast';
import { formatPrice } from '@/utils/currency';
import { usePayment } from '@/context/payment/PaymentContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const POSOrderScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();

  // Get table from navigation params
  const routeTable = (route.params as any)?.table as Table | undefined;

  // Use Enhanced Order Context hooks
  const { createOrder, submitOrderToKitchen, setError, clearError, setSelectedTable } = useEnhancedOrder();
  const { cart, addToCart, updateCartItemQuantity, removeFromCart, clearCart, cartSubtotal: cartTotal, cartItemCount } = useCart();
  const { currentOrder, selectedTable } = useCurrentOrder();

  // Get tax rate from payment context (single source of truth)
  const { taxRate: contextTaxRate } = usePayment();

  const { state: tableState, selectTable } = useTable();
  const { menuItems, categories, searchMenuItems, isLoading } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTableSelector, setShowTableSelector] = useState(!routeTable);

  // Modifier modal state
  const [isModifierModalVisible, setIsModifierModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemExtended | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null); // Track cart item being edited
  const [editingModifiers, setEditingModifiers] = useState<SelectedModifier[]>([]); // Pre-fill modifiers when editing

  // Combo modal state
  const [isComboModalVisible, setIsComboModalVisible] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboDeal | null>(null);

  // Get combos from menu context
  const menuContext = useMenuContext();
  const combos = menuContext.combos || [];

  // Initialize order when table is provided or selected
  useEffect(() => {
    if (routeTable && !currentOrder) {
      selectTable(routeTable);
      setSelectedTable(routeTable);
      createOrder(routeTable, 1); // Create with default guest count of 1
      setShowTableSelector(false);
    }
  }, [routeTable, currentOrder, selectTable, setSelectedTable, createOrder]);

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
    setSelectedTable(table);
    createOrder(table, 1); // Create with default guest count of 1
    setShowTableSelector(false);
  }, [selectTable, setSelectedTable, createOrder]);

  // Handle menu item selection
  const handleMenuItemSelect = useCallback((menuItem: MenuItem) => {
    if (!currentOrder) {
      setError('Please select a table first');
      return;
    }

    try {
      // Convert MenuItem to MenuItemExtended for addToCart
      const extendedItem = menuItem as MenuItemExtended;

      // Check if item has modifiers
      if (extendedItem.modifier_groups && extendedItem.modifier_groups.length > 0) {
        // Show toast that item has add-ons
        showToast({
          type: 'info',
          title: 'Customize Item',
          message: `${menuItem.name} has add-ons. Select your preferences.`,
        });

        // Clear editing state (this is a new item, not editing existing)
        setEditingCartItemId(null);
        setEditingModifiers([]);

        // Open modifier modal for customization
        setSelectedItem(extendedItem);
        setIsModifierModalVisible(true);
      } else {
        // No modifiers - add directly to cart
        addToCart(extendedItem, [], 1);
        showToast({
          type: 'success',
          title: 'Item Added',
          message: `${menuItem.name} added to order`,
        });
      }
    } catch (error) {
      setError(`Failed to add item: ${error}`);
    }
  }, [currentOrder, addToCart, setError]);

  // Handle modifier confirmation (for both new items and editing existing)
  const handleModifierConfirm = useCallback(
    (item: MenuItemExtended, modifiers: SelectedModifier[], quantity: number, notes?: string) => {
      try {
        if (editingCartItemId) {
          // EDITING: Remove old item and add updated one
          removeFromCart(editingCartItemId);
          addToCart(item, modifiers, quantity, notes);
          showToast({
            type: 'success',
            title: 'Item Updated',
            message: `${item.name} customizations updated`,
          });
        } else {
          // NEW ITEM: Add to cart
          addToCart(item, modifiers, quantity, notes);
          showToast({
            type: 'success',
            title: 'Item Added',
            message: `${item.name} added to order with customizations`,
          });
        }

        // Reset modal state
        setIsModifierModalVisible(false);
        setSelectedItem(null);
        setEditingCartItemId(null);
        setEditingModifiers([]);
      } catch (error) {
        setError(`Failed to ${editingCartItemId ? 'update' : 'add'} item: ${error}`);
      }
    },
    [addToCart, removeFromCart, editingCartItemId, setError]
  );

  // Handle modifier cancel
  const handleModifierCancel = useCallback(() => {
    setIsModifierModalVisible(false);
    setSelectedItem(null);
    setEditingCartItemId(null);
    setEditingModifiers([]);
  }, []);

  // Handle editing cart item modifiers
  const handleEditCartItemModifiers = useCallback((cartItemId: string) => {
    // Find the cart item
    const cartItem = (cart || []).find(item => item.id === cartItemId);
    if (!cartItem) {
      showToast({
        type: 'error',
        title: 'Item Not Found',
        message: 'Could not find item to edit',
      });
      return;
    }

    // Find the original menu item to get modifier groups
    const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
    if (!menuItem || !menuItem.modifier_groups || menuItem.modifier_groups.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Add-ons',
        message: 'This item has no add-ons to edit',
      });
      return;
    }

    // Set editing state
    setEditingCartItemId(cartItemId);
    setEditingModifiers(cartItem.selectedModifiers || []);
    setSelectedItem(menuItem);
    setIsModifierModalVisible(true);

    showToast({
      type: 'info',
      title: 'Edit Add-ons',
      message: `Editing add-ons for ${cartItem.name}`,
    });
  }, [cart, menuItems]);

  // Handle combo selection
  const handleComboSelect = useCallback((combo: ComboDeal) => {
    if (!currentOrder) {
      setError('Please select a table first');
      return;
    }

    setSelectedCombo(combo);
    setIsComboModalVisible(true);
  }, [currentOrder, setError]);

  // Handle combo confirm - add all combo items to cart
  const handleComboConfirm = useCallback((result: ComboSelectionResult) => {
    try {
      const { combo, selections, totalQuantity } = result;

      // Add each combo item selection to cart
      for (const selection of selections) {
        // Find the menu item from context
        const menuItem = menuItems.find(item => item.id === selection.menuItemId);

        if (menuItem) {
          // Convert to MenuItemExtended and add to cart
          const extendedItem = menuItem as MenuItemExtended;

          // Add with combo quantity multiplied by item quantity
          const itemQuantity = selection.quantity * totalQuantity;

          // Add to cart with combo metadata
          addToCart(
            {
              ...extendedItem,
              // Override price if there's a combo adjustment
              price: selection.priceAdjustment > 0
                ? extendedItem.price + selection.priceAdjustment
                : extendedItem.price,
            },
            [], // No modifiers for combo items (could be enhanced later)
            itemQuantity,
            `Combo: ${combo.name}${selection.isSubstitution ? ' (Substitution)' : ''}`
          );
        }
      }

      setIsComboModalVisible(false);
      setSelectedCombo(null);

      showToast({
        type: 'success',
        title: 'Combo Added',
        message: `${combo.name}${totalQuantity > 1 ? ` x${totalQuantity}` : ''} added to order`,
      });
    } catch (error) {
      console.error('Failed to add combo:', error);
      setError(`Failed to add combo: ${error}`);
    }
  }, [menuItems, addToCart, setError]);

  // Handle combo cancel
  const handleComboCancel = useCallback(() => {
    setIsComboModalVisible(false);
    setSelectedCombo(null);
  }, []);

  // Handle cart item quantity change
  const handleCartItemUpdate = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItemQuantity(itemId, quantity);
    }
  }, [updateCartItemQuantity, removeFromCart]);

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
      
      {(categories || []).map((category) => (
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
                {formatPrice(item.price)}
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
        ListFooterComponent={
          combos.length > 0 ? (
            <ComboGridSection
              combos={combos}
              onComboPress={handleComboSelect}
            />
          ) : null
        }
      />
    </View>
  );

  // Professional Bill Panel - SkyTab style
  const renderBillPanel = () => {
    // Use tax rate from payment context (single source of truth)
    const taxRate = contextTaxRate || 0.0825; // Default 8.25% if not configured

    // Calculate bill data
    const subtotal = cartTotal;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Transform cart items to BillItem format (using correct ExtendedOrderItem properties)
    const billItems = (cart || []).map(item => {
      // Check if the original menu item has modifiers
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      const hasModifiers = menuItem?.modifier_groups && menuItem.modifier_groups.length > 0;

      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.basePrice + item.modifierTotal, // Total unit price including modifiers
        notes: item.specialInstructions,
        category: item.category,
        hasModifiers, // Pass to BillPanel for edit button visibility
      };
    });

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
        // Submit order to kitchen system (KOT) using Enhanced context
        const result = await submitOrderToKitchen();

        if (result.success) {
          showToast({
            type: 'success',
            title: 'Order Sent to Kitchen',
            message: `Order ${result.orderNumber} has been sent to kitchen for preparation`,
          });

          // Navigate back to table management or order tracking
          navigation.goBack();
        } else {
          throw new Error(result.error || 'Unknown error');
        }
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
        orderNumber={currentOrder?.orderNumber || '----'}
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
        onEditItemModifiers={handleEditCartItemModifiers}
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

      {/* Modifier Selection Modal */}
      {selectedItem && (
        <ModifierSelectionModal
          visible={isModifierModalVisible}
          item={selectedItem}
          onConfirm={handleModifierConfirm}
          onClose={handleModifierCancel}
          initialModifiers={editingModifiers}
          initialQuantity={editingCartItemId ? (cart || []).find(i => i.id === editingCartItemId)?.quantity : 1}
          initialNotes={editingCartItemId ? (cart || []).find(i => i.id === editingCartItemId)?.specialInstructions : ''}
          isEditing={!!editingCartItemId}
        />
      )}

      {/* Combo Selection Modal */}
      {selectedCombo && (
        <ComboSelectionModal
          visible={isComboModalVisible}
          combo={selectedCombo}
          onConfirm={handleComboConfirm}
          onCancel={handleComboCancel}
        />
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
    minHeight: cardDimensions.tableCard.minHeight,
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
    width: panelWidths.sidebarDefault,
    padding: spacing.md,
    borderRightWidth: dividers.default,
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
    borderBottomWidth: dividers.default,
  },
  searchInput: {
    flex: 1,
    height: touchTargets.searchInput,
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
    height: cardDimensions.menuItemCard.defaultHeight,
    margin: 0,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    borderWidth: dividers.default,
    ...shadows.xs,
  },
  menuItemName: {
    ...typography.titleSmall,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'left',
  },
  menuItemDescription: {
    ...typography.bodySmall,
    flex: 1,
    marginBottom: spacing.md,
  },
  menuItemPrice: {
    ...typography.titleMedium,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 'auto',
  },
  
});

export { POSOrderScreen };
export default POSOrderScreen;