/**
 * POS Order Screen - Modern SkyTab-style POS interface
 * Integrates table selection with menu browsing and order management
 */

import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,

} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUnifiedOrder, useUnifiedCart } from '@/context/unified-order';
import { useTable } from '@/context/table';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { MenuItemExtended, ComboDeal } from '@/types/menu-management-extended.types';
import { SelectedModifier } from '@/types/unified-order.types';
import { MenuItem } from '@/types/menu.types';
import { useMenuContext } from '@/context/menu';
import { Table } from '@/types/table.types';
import { BillPanel } from '@/components/business/order';
import { DiscountModal, type DiscountData } from '@/screens/orders/modals/DiscountModal';
import TableSelectionModal from '@/components/modals/TableSelectionModal';
import ModifierSelectionModal from '@/screens/orders/components/ModifierSelectionModal';
import ComboSelectionModal, { ComboSelectionResult } from '@/screens/orders/modals/ComboSelectionModal';
import { ComboGridSection } from '@/components/business/menu/ComboGridSection';
import { spacing, borderRadius, shadows, touchTargets } from '@/design-system/theme/spacing';
import { panelWidths, cardDimensions, iconSizes, elevations, dividers } from '@/design-system/theme/layout';
import { typography } from '@/design-system/theme/typography';
import { showToast } from '@/utils/toast';
import { formatPrice } from '@/utils/currency';
import { usePayment } from '@/context/payment/PaymentContext';

const POSOrderScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    screenWidth,
    isPhone,
    isLargeTablet,
    isPortrait,
    menuGridColumns,
    tableGridColumns,
    billPanelWidth,
    showPersistentSidebar,
  } = useResponsive();
  const route = useRoute();
  const navigation = useNavigation();

  // Get table from navigation params
  const routeTable = (route.params as any)?.table as Table | undefined;
  const editOrderId = (route.params as any)?.editOrderId as string | undefined;

  // Use Unified Order Context hooks
  const {
    submitToKitchen,
    setError,
    clearError,
    setSelectedTable,
    getActiveOrderForTable,
    getOrderById,
    addItemsToOrder,
    applyOrderDiscount,
    applyItemDiscount,
    state: orderState,
  } = useUnifiedOrder();
  const {
    items: cart,
    addItem: addToCart,
    updateQuantity: updateCartItemQuantity,
    removeItem: removeFromCart,
    clear: clearCart,
    subtotal: cartTotal,
    discountAmount: cartDiscountAmount,
    itemCount: cartItemCount,
    orderNumber: cartOrderNumber,
    selectedTable,
    setDiscount: setCartDiscount,
    setItemDiscount: setCartItemDiscount,
  } = useUnifiedCart();

  // Derive currentOrder from state (unified context doesn't have a separate "currentOrder" during cart mode)
  const currentOrder = orderState.currentOrder;

  // Get tax rate from payment context (single source of truth)
  const { taxRate: contextTaxRate } = usePayment();

  const { state: tableState, selectTable, refreshTables } = useTable();

  // Use MenuContext as single source of truth for menu items
  // This ensures real-time sync with Settings > Menu Management
  const menuContext = useMenuContext();
  const menuItems = menuContext.menuItemsExtended; // Real-time sync with assigned modifiers
  const categories = menuContext.categoriesWithStats;
  const combos = menuContext.combos || [];
  const isLoading = menuContext.isLoading;

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  // In edit mode (editOrderId set), skip table selector
  const [showTableSelector, setShowTableSelector] = useState(!routeTable && !editOrderId);

  // Modifier modal state
  const [isModifierModalVisible, setIsModifierModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemExtended | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null); // Track cart item being edited
  const [editingModifiers, setEditingModifiers] = useState<SelectedModifier[]>([]); // Pre-fill modifiers when editing

  // Combo modal state
  const [isComboModalVisible, setIsComboModalVisible] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboDeal | null>(null);

  // Discount modal state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountingItem, setDiscountingItem] = useState<{ id: string; name: string; price: number } | null>(null);

  // Edit mode: the existing order being updated
  const editingOrder = useMemo(
    () => (editOrderId ? getOrderById(editOrderId) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editOrderId, orderState.orders]
  );

  // Prevent the table-init effect from re-firing after CLEAR_CURRENT_ORDER resets selectedTable
  const tableInitializedRef = useRef(false);
  // Track whether a table was selected so onClose doesn't navigate back due to stale closure
  const tableWasSelectedRef = useRef(false);

  // Refresh table statuses whenever the table selector is shown to avoid stale data
  useEffect(() => {
    if (showTableSelector) {
      refreshTables().catch(() => {});
    }
  }, [showTableSelector, refreshTables]);

  // Initialize order when table is provided via navigation
  // Note: Uses handleTableSelect to check for existing orders
  // tableInitializedRef prevents re-triggering after CLEAR_CURRENT_ORDER resets selectedTable to null
  // Table is always pre-validated before navigation (ExistingOrderModal handles conflicts).
  // Simply select the table when arriving at this screen.
  useEffect(() => {
    if (routeTable && !selectedTable && !tableInitializedRef.current) {
      tableInitializedRef.current = true;
      selectTable(routeTable);
      setSelectedTable(routeTable);
      setShowTableSelector(false);
    }
  }, [routeTable, selectedTable, selectTable, setSelectedTable]);

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

  // Handle table selection - check for existing active orders first
  const handleTableSelect = useCallback((table: Table) => {
    const existingOrder = getActiveOrderForTable(table.id);
    tableWasSelectedRef.current = true;
    selectTable(table);
    setSelectedTable(table);
    setShowTableSelector(false);
    if (existingOrder) {
      showToast({
        type: 'info',
        title: 'Existing Order',
        message: `Continuing order ${existingOrder.orderNumber} for ${table.table_number}.`,
      });
    }
  }, [selectTable, setSelectedTable, getActiveOrderForTable]);

  // Handle menu item selection
  const handleMenuItemSelect = useCallback((menuItem: MenuItem) => {
    // In edit mode (editOrderId set), we don't need a selectedTable
    if (!selectedTable && !editOrderId) {
      setError('Please select a table first');
      return;
    }

    try {
      // Convert MenuItem to MenuItemExtended for addToCart
      const extendedItem = menuItem as MenuItemExtended;

      // Check if item has modifier groups assigned
      // Show modal if ANY modifier groups assigned (allows viewing even if no options yet)
      const hasModifiers = extendedItem.modifier_groups &&
                          extendedItem.modifier_groups.length > 0;

      if (hasModifiers) {
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
        // No modifiers with options - add directly to cart
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
  }, [selectedTable, editOrderId, addToCart, setError]);

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

    // Check if item has modifier groups WITH options
    const hasModifiersWithOptions = menuItem?.modifier_groups?.some(
      (group) => group.options && group.options.length > 0
    );

    if (!menuItem || !hasModifiersWithOptions) {
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
    if (!selectedTable) {
      setError('Please select a table first');
      return;
    }

    setSelectedCombo(combo);
    setIsComboModalVisible(true);
  }, [selectedTable, setError]);

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

  // Render category sidebar (landscape) — vertical list
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
        testID="tab-category-all"
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
          testID={`tab-category-${category.id}`}
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

  // Render category chips row (portrait) — horizontal scroll
  const renderCategoryRow = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.categoryRow, { backgroundColor: theme.colors.surfaceVariant }]}
      contentContainerStyle={styles.categoryRowContent}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          { backgroundColor: selectedCategory === 'ALL' ? theme.colors.primary : theme.colors.surface }
        ]}
        onPress={() => setSelectedCategory('ALL')}
        testID="tab-category-chip-all"
      >
        <Text style={[
          styles.categoryChipText,
          { color: selectedCategory === 'ALL' ? theme.colors.onPrimary : theme.colors.onSurface }
        ]}>
          All Items
        </Text>
      </TouchableOpacity>

      {(categories || []).map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            { backgroundColor: selectedCategory === category.id ? theme.colors.primary : theme.colors.surface }
          ]}
          onPress={() => setSelectedCategory(category.id)}
          testID={`tab-category-chip-${category.id}`}
        >
          <Text style={[
            styles.categoryChipText,
            { color: selectedCategory === category.id ? theme.colors.onPrimary : theme.colors.onSurface }
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render menu item grid
  const menuColumns = menuGridColumns;
  const renderMenuGrid = () => (
    <View style={styles.menuGrid}>
      {/* Search bar + table info — shown in landscape only (portrait has it in posLayout header) */}
      {!isPortrait && (
        <View style={[styles.menuHeader, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.colors.surfaceVariant }]}
            placeholder="Search menu items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            testID="input-menu-search"
          />

          {selectedTable && (
            <View style={styles.tableInfo}>
              <Text style={[styles.tableInfoText, { color: theme.colors.onSurface }]}>
                Table {selectedTable.table_number} • {selectedTable.capacity} seats
              </Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={filteredMenuItems}
        keyExtractor={(item) => item.id}
        numColumns={menuColumns}
        key={`menu-grid-${menuColumns}-columns`} // Force re-render on column count change
        contentContainerStyle={styles.menuItemsContainer}
        columnWrapperStyle={styles.menuItemRow} // Professional row styling
        renderItem={({ item }) => (
          <View style={styles.menuItemWrapper}>
            <TouchableOpacity
              style={[styles.menuItemCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleMenuItemSelect(item)}
              activeOpacity={0.8} // Professional interaction feedback
              testID={`btn-menu-item-${item.id}`}
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

    // Calculate bill data — use discount from submitted order or cart
    const subtotal = cartTotal;
    const discountAmount = editingOrder?.discountAmount ?? currentOrder?.discountAmount ?? cartDiscountAmount;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * taxRate;
    const total = taxableAmount + taxAmount;

    // Transform cart items to BillItem format (using correct ExtendedOrderItem properties)
    const billItems = (cart || []).map(item => {
      // Check if the original menu item has modifier groups WITH options
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      const hasModifiers = menuItem?.modifier_groups?.some(
        (group) => group.options && group.options.length > 0
      ) ?? false;

      // Transform selectedModifiers to BillItem format
      const modifiers = item.selectedModifiers?.map(mod => ({
        groupName: mod.groupName,
        options: mod.options?.map(opt => opt.optionName) || [],
      })).filter(mod => mod.options.length > 0) || [];

      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        // Use effective unit price: itemTotal already reflects any item-level discount
        price: item.quantity > 0 ? item.itemTotal / item.quantity : (item.basePrice + item.modifierTotal),
        notes: item.specialInstructions,
        category: item.category,
        hasModifiers, // Pass to BillPanel for edit button visibility
        modifiers, // Pass selected modifier options for display
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
      if (cart.length === 0) {
        showToast({
          type: 'warning',
          title: 'Empty Order',
          message: 'Add items before sending to kitchen',
        });
        return;
      }

      // Edit mode: add new items to an existing order
      if (editOrderId) {
        try {
          await addItemsToOrder(editOrderId, cart);
          showToast({
            type: 'success',
            title: 'Order Updated',
            message: 'New items sent to kitchen',
          });
          navigation.goBack();
        } catch (error) {
          showToast({
            type: 'error',
            title: 'Update Error',
            message: 'Failed to add items to order. Please try again.',
          });
        }
        return;
      }

      try {
        // Submit order to kitchen system (KOT) using Unified context
        const result = await submitToKitchen();

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
      if (!currentOrder && !editingOrder && cart.length === 0) {
        showToast({ type: 'warning', title: 'No Order', message: 'Add items first to apply a discount' });
        return;
      }
      setShowDiscountModal(true);
    };

    const handleItemDiscount = (itemId: string) => {
      const item = billItems.find(i => i.id === itemId);
      if (item) {
        setDiscountingItem({ id: item.id, name: item.name, price: item.price * item.quantity });
      }
    };

    const handleSplit = () => {
      const orderId = editingOrder?.id || currentOrder?.id;
      if (!orderId) {
        showToast({ type: 'warning', title: 'No Order', message: 'Create an order first' });
        return;
      }
      (navigation as any).navigate('BillSplit', { orderId });
    };

    // Build read-only "Already Ordered" items for edit mode
    const alreadyOrderedItems = editingOrder
      ? editingOrder.items.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.unitPrice,
        }))
      : undefined;

    return (
      <BillPanel
        orderNumber={editingOrder?.orderNumber || currentOrder?.orderNumber || cartOrderNumber || '----'}
        tableName={editingOrder?.tableName || selectedTable?.table_number || 'No Table'}
        tableCapacity={selectedTable?.capacity || 0}
        items={billItems}
        subtotal={subtotal}
        discountAmount={discountAmount}
        taxRate={taxRate}
        taxAmount={taxAmount}
        total={total}
        orderTime={editingOrder?.createdAt || currentOrder?.createdAt || new Date().toISOString()}
        onItemQuantityChange={handleItemQuantityChange}
        onItemRemove={handleItemRemove}
        onAddItem={handleAddItem}
        onPrint={handlePrint}
        onSendToKitchen={handleSendToKitchen}
        onDiscount={handleDiscount}
        onSplit={handleSplit}
        onEditItemModifiers={handleEditCartItemModifiers}
        onItemDiscount={handleItemDiscount}
        isProcessing={false}
        panelWidth={isPhone || isPortrait ? screenWidth : billPanelWidth}
        isPortrait={isPortrait}
        alreadyOrderedItems={alreadyOrderedItems}
        sendToKitchenLabel={editOrderId ? 'Add to Order' : 'Send to Kitchen'}
        sendToKitchenTestID={editOrderId ? 'btn-add-to-order' : 'btn-cart-send-to-kitchen'}
      />
    );
  };


  // Main render method
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <TableSelectionModal
        visible={showTableSelector}
        onClose={() => {
          setShowTableSelector(false);
          if (!tableWasSelectedRef.current) navigation.goBack();
        }}
        onTableSelect={handleTableSelect}
        tables={tableState.tables}
        isLoading={tableState.isLoading}
        title="Select a Table"
        subtitle="Choose an area and table to start order"
        allowOccupied
      />

      {!showTableSelector && isPortrait && (
        // Portrait layout: vertical stack
        <View style={styles.posLayoutPortrait}>
          {/* Top bar: search + table info */}
          <View style={[styles.menuHeader, { backgroundColor: theme.colors.surface }]}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.colors.surfaceVariant }]}
              placeholder="Search menu items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              testID="input-menu-search-portrait"
            />
            {selectedTable && (
              <View style={styles.tableInfo}>
                <Text style={[styles.tableInfoText, { color: theme.colors.onSurface }]}>
                  T{selectedTable.table_number}
                </Text>
              </View>
            )}
          </View>

          {/* Horizontal category chips */}
          {renderCategoryRow()}

          {/* Menu grid — takes remaining space above bill panel */}
          <View style={styles.menuGridPortrait}>
            {renderMenuGrid()}
          </View>

          {/* Bill panel — fixed height at bottom */}
          <View style={[styles.billPanelPortrait, { borderTopColor: theme.colors.outline }]}>
            {renderBillPanel()}
          </View>
        </View>
      )}

      {!showTableSelector && !isPortrait && (
        // Landscape layout: 3-column side-by-side
        <View style={styles.posLayout}>
          {showPersistentSidebar && renderCategorySidebar()}

          <View style={styles.mainContent}>
            {/* Category chips row when sidebar isn't shown (small tablet landscape) */}
            {!showPersistentSidebar && renderCategoryRow()}
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

      {/* Discount Modal */}
      <DiscountModal
        visible={showDiscountModal || !!discountingItem}
        currentAmount={discountingItem ? discountingItem.price : cartTotal}
        itemName={discountingItem?.name}
        currentDiscount={editingOrder?.discountType ? {
          type: editingOrder.discountType,
          value: editingOrder.discountValue || 0,
          reason: '',
          requiresApproval: false,
        } : undefined}
        onApply={async (discount: DiscountData) => {
          const orderId = editingOrder?.id || currentOrder?.id;
          if (discountingItem) {
            if (orderId) {
              await applyItemDiscount(orderId, discountingItem.id, discount.type, discount.value);
            } else {
              // Cart-only item — update itemTotal in cart state directly
              setCartItemDiscount(discountingItem.id, discount.type, discount.value);
            }
            setDiscountingItem(null);
          } else if (orderId) {
            await applyOrderDiscount(orderId, discount.type, discount.value);
            setShowDiscountModal(false);
          } else {
            // Cart-only order (not yet submitted) — apply to cart state
            setCartDiscount(discount.type, discount.value);
            setShowDiscountModal(false);
          }
        }}
        onRemove={() => {
          const orderId = editingOrder?.id || currentOrder?.id;
          if (discountingItem) {
            if (orderId) applyItemDiscount(orderId, discountingItem.id, 'percentage', 0);
            else setCartItemDiscount(discountingItem.id, 'percentage', 0);
            setDiscountingItem(null);
          } else if (orderId) {
            applyOrderDiscount(orderId, 'percentage', 0);
            setShowDiscountModal(false);
          } else {
            setCartDiscount('percentage', 0);
            setShowDiscountModal(false);
          }
        }}
        onCancel={() => {
          setShowDiscountModal(false);
          setDiscountingItem(null);
        }}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // POS Layout — landscape (3-panel horizontal)
  posLayout: {
    flex: 1,
    flexDirection: 'row',
  },

  // POS Layout — portrait (stacked vertical)
  posLayoutPortrait: {
    flex: 1,
    flexDirection: 'column',
  },

  // Portrait: menu grid gets less space so bill panel has room for totals + send button
  menuGridPortrait: {
    flex: 45,
  },

  // Portrait: bill panel gets more space — scrollable cart + totals + send button
  billPanelPortrait: {
    flex: 55,
    borderTopWidth: 1,
  },

  // Portrait: horizontal category scroll row — fixed height to prevent vertical stretch
  categoryRow: {
    height: 52,
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  categoryChipText: {
    ...typography.labelMedium,
    fontWeight: '600',
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
    paddingBottom: spacing.xl,
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