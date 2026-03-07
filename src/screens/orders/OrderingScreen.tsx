/**
 * OrderingScreen - Main 3-panel ordering interface
 * Left: Category Sidebar | Center: Menu Item Grid | Right: Order Cart
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/hooks/useTheme';
import { OrdersStackParamList } from '@/navigation/types';
import { useUnifiedOrder, useUnifiedCart } from '@/context/unified-order';
import { MenuItemExtended } from '@/types/menu-management-extended.types';
import { MenuCategory } from '@/types/menu.types';
import { useAuth } from '@/context/auth';
import { menuApiClient } from '@/services/api/menu';
import { authStorageService } from '@/services/storage';
import { SelectedModifier } from '@/types/unified-order.types';
import { getStationForCategory } from '@/types/order-extended.types';
import { TableStatus } from '@/types/common.types';

// Components
import { CategorySidebar } from './components/CategorySidebar';
import { MenuItemGrid } from './components/MenuItemGrid';
import { OrderCart } from './components/OrderCart';
import { ModifierSelectionModal } from './components/ModifierSelectionModal';
import { SendToKitchenModal } from './components/SendToKitchenModal';

type OrderingScreenNavigationProp = StackNavigationProp<OrdersStackParamList, 'Ordering'>;
type OrderingScreenRouteProp = RouteProp<OrdersStackParamList, 'Ordering'>;

// Mock data for development - will be replaced with real API data
const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 'cat1', restaurant_id: 'rest1', name: 'Appetizers', description: 'Start your meal', sort_order: 1, is_active: true, item_count: 8, created_at: '', updated_at: '' },
  { id: 'cat2', restaurant_id: 'rest1', name: 'Main Course', description: 'Main dishes', sort_order: 2, is_active: true, item_count: 12, created_at: '', updated_at: '' },
  { id: 'cat3', restaurant_id: 'rest1', name: 'Salads', description: 'Fresh salads', sort_order: 3, is_active: true, item_count: 6, created_at: '', updated_at: '' },
  { id: 'cat4', restaurant_id: 'rest1', name: 'Desserts', description: 'Sweet treats', sort_order: 4, is_active: true, item_count: 5, created_at: '', updated_at: '' },
  { id: 'cat5', restaurant_id: 'rest1', name: 'Beverages', description: 'Drinks', sort_order: 5, is_active: true, item_count: 10, created_at: '', updated_at: '' },
  { id: 'cat6', restaurant_id: 'rest1', name: 'Specials', description: 'Chef specials', sort_order: 6, is_active: true, item_count: 4, created_at: '', updated_at: '' },
];

const MOCK_MENU_ITEMS: MenuItemExtended[] = [
  {
    id: 'item1', restaurant_id: 'rest1', category_id: 'cat1', name: 'Spring Rolls',
    description: 'Crispy vegetable spring rolls with sweet chili sauce',
    price: 8.99, is_available: true, sort_order: 1, created_at: '', updated_at: '',
    dietary_tags: ['vegetarian'], allergens: [], modifier_assignments: [],
    modifier_groups: [
      {
        id: 'mod1', restaurant_id: 'rest1', name: 'Size', selection_type: 'single',
        is_required: true, is_active: true, sort_order: 1, created_at: '', updated_at: '',
        options: [
          { id: 'opt1', modifier_group_id: 'mod1', name: 'Regular (4 pcs)', price_adjustment: 0, is_default: true, is_available: true, sort_order: 1, created_at: '', updated_at: '' },
          { id: 'opt2', modifier_group_id: 'mod1', name: 'Large (6 pcs)', price_adjustment: 3.00, is_default: false, is_available: true, sort_order: 2, created_at: '', updated_at: '' },
        ],
      },
    ],
  },
  {
    id: 'item2', restaurant_id: 'rest1', category_id: 'cat1', name: 'Chicken Wings',
    description: 'Crispy fried chicken wings with your choice of sauce',
    price: 12.99, is_available: true, sort_order: 2, created_at: '', updated_at: '',
    dietary_tags: [], allergens: ['gluten'], modifier_assignments: [],
    modifier_groups: [
      {
        id: 'mod2', restaurant_id: 'rest1', name: 'Sauce', selection_type: 'single',
        is_required: true, is_active: true, sort_order: 1, created_at: '', updated_at: '',
        options: [
          { id: 'opt3', modifier_group_id: 'mod2', name: 'BBQ', price_adjustment: 0, is_default: true, is_available: true, sort_order: 1, created_at: '', updated_at: '' },
          { id: 'opt4', modifier_group_id: 'mod2', name: 'Buffalo', price_adjustment: 0, is_default: false, is_available: true, sort_order: 2, created_at: '', updated_at: '' },
          { id: 'opt5', modifier_group_id: 'mod2', name: 'Honey Garlic', price_adjustment: 0.50, is_default: false, is_available: true, sort_order: 3, created_at: '', updated_at: '' },
        ],
      },
    ],
  },
  {
    id: 'item3', restaurant_id: 'rest1', category_id: 'cat2', name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    price: 24.99, is_available: true, sort_order: 1, created_at: '', updated_at: '',
    dietary_tags: ['gluten_free'], allergens: ['fish'], modifier_assignments: [],
    modifier_groups: [
      {
        id: 'mod3', restaurant_id: 'rest1', name: 'Side', selection_type: 'single',
        is_required: true, is_active: true, sort_order: 1, created_at: '', updated_at: '',
        options: [
          { id: 'opt6', modifier_group_id: 'mod3', name: 'Mashed Potatoes', price_adjustment: 0, is_default: true, is_available: true, sort_order: 1, created_at: '', updated_at: '' },
          { id: 'opt7', modifier_group_id: 'mod3', name: 'Steamed Vegetables', price_adjustment: 0, is_default: false, is_available: true, sort_order: 2, created_at: '', updated_at: '' },
          { id: 'opt8', modifier_group_id: 'mod3', name: 'Garden Salad', price_adjustment: 1.50, is_default: false, is_available: true, sort_order: 3, created_at: '', updated_at: '' },
        ],
      },
    ],
  },
  {
    id: 'item4', restaurant_id: 'rest1', category_id: 'cat2', name: 'Ribeye Steak',
    description: '12oz prime ribeye, cooked to perfection',
    price: 34.99, is_available: true, sort_order: 2, created_at: '', updated_at: '',
    dietary_tags: [], allergens: [], modifier_assignments: [], modifier_groups: [],
  },
  {
    id: 'item5', restaurant_id: 'rest1', category_id: 'cat3', name: 'Caesar Salad',
    description: 'Classic Caesar with romaine, croutons, and parmesan',
    price: 11.99, is_available: true, sort_order: 1, created_at: '', updated_at: '',
    dietary_tags: ['vegetarian'], allergens: ['dairy', 'gluten'], modifier_assignments: [],
    modifier_groups: [],
  },
  {
    id: 'item6', restaurant_id: 'rest1', category_id: 'cat4', name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center',
    price: 9.99, is_available: true, sort_order: 1, created_at: '', updated_at: '',
    dietary_tags: [], allergens: ['dairy', 'eggs', 'gluten'], modifier_assignments: [],
    modifier_groups: [],
  },
  {
    id: 'item7', restaurant_id: 'rest1', category_id: 'cat5', name: 'Fresh Lemonade',
    description: 'House-made lemonade with fresh lemons',
    price: 4.99, is_available: true, sort_order: 1, created_at: '', updated_at: '',
    dietary_tags: ['vegan', 'gluten_free'], allergens: [], modifier_assignments: [],
    modifier_groups: [],
  },
];

export const OrderingScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<OrderingScreenNavigationProp>();
  const route = useRoute<OrderingScreenRouteProp>();

  const { tableId, tableName, guestCount } = route.params;

  // Context hooks - using unified order system
  const {
    state,
    setSelectedTable,
    submitToKitchen,
    isSubmitting,
  } = useUnifiedOrder();

  const {
    items: cart,
    subtotal: cartTotal,
    addItem: addToCart,
    updateQuantity: updateCartItemQuantity,
    removeItem: removeFromCart,
    clear: clearCart,
  } = useUnifiedCart();

  const { state: authState } = useAuth();
  const rawRestaurantId = authState.restaurant?.id || (authState.user as any)?.default_restaurant_id || '';
  // Menu Service uses numeric BigInt IDs; Auth Service may return UUID — fall back to '1'
  const restaurantId = /^\d+$/.test(rawRestaurantId) ? rawRestaurantId : '1';

  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemExtended | null>(null);
  const [isModifierModalVisible, setIsModifierModalVisible] = useState(false);
  const [isSendModalVisible, setIsSendModalVisible] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>(MOCK_CATEGORIES);
  const [allItems, setAllItems] = useState<MenuItemExtended[]>(MOCK_MENU_ITEMS);

  // Load real categories from API (skip for dummy/offline credentials)
  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    authStorageService.getSession().then(session => {
      if (cancelled || session?.accessToken?.startsWith('dummy_')) return;
      menuApiClient.getCategories(restaurantId)
        .then(cats => { if (!cancelled && cats && cats.length > 0) setCategories(cats); })
        .catch(() => {});
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [restaurantId]);

  // Load items when category selected (skip for dummy/offline credentials)
  useEffect(() => {
    if (!restaurantId || !selectedCategoryId) return;
    let cancelled = false;
    authStorageService.getSession().then(session => {
      if (cancelled || session?.accessToken?.startsWith('dummy_')) return;
      menuApiClient.getMenuByCategory(restaurantId, selectedCategoryId)
        .then(items => {
          if (cancelled) return;
          const arr = Array.isArray(items) ? items : (items as any)?.items || [];
          if (arr.length > 0) {
            setAllItems(prev => {
              const filtered = prev.filter(i => i.category_id !== selectedCategoryId);
              return [...filtered, ...(arr as MenuItemExtended[])];
            });
          }
        })
        .catch(() => {});
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [restaurantId, selectedCategoryId]);

  // Initialize order when screen mounts
  useEffect(() => {
    // Create order for the table
    setSelectedTable({
      id: tableId,
      table_number: tableName,
      capacity: guestCount || 4,
      status: TableStatus.OCCUPIED,
      restaurant_id: 'rest1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }, [tableId, tableName, guestCount, setSelectedTable]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
      flex: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    headerButton: {
      padding: theme.spacing.xs,
    },
    mainContent: {
      flex: 1,
      flexDirection: 'row',
    },
    categoryPanel: {
      width: 200,
    },
    menuPanel: {
      flex: 1,
    },
    cartPanel: {
      width: 320,
    },
  });

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) return allItems;
    return allItems.filter((item) => item.category_id === selectedCategoryId);
  }, [selectedCategoryId, allItems]);

  // Get current category name
  const currentCategoryName = useMemo(() => {
    if (!selectedCategoryId) return 'All Items';
    const category = categories.find((c) => c.id === selectedCategoryId);
    return category?.name || 'All Items';
  }, [selectedCategoryId, categories]);

  // Handler for category selection
  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId || null);
  }, []);

  // Handler for item press - open modifier modal or add directly
  const handleItemPress = useCallback((item: MenuItemExtended) => {
    if (item.modifier_groups && item.modifier_groups.length > 0) {
      setSelectedItem(item);
      setIsModifierModalVisible(true);
    } else {
      // Add directly to cart with no modifiers
      addToCart(item, [], 1);
    }
  }, [addToCart]);

  // Handler for adding item with modifiers
  const handleAddToCart = useCallback(
    (item: MenuItemExtended, modifiers: SelectedModifier[], quantity: number, notes?: string) => {
      addToCart(item, modifiers, quantity, notes);
      setSelectedItem(null);
      setIsModifierModalVisible(false);
    },
    [addToCart]
  );

  // Handler for updating cart item quantity
  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        updateCartItemQuantity(itemId, quantity);
      }
    },
    [removeFromCart, updateCartItemQuantity]
  );

  // Handler for removing item from cart
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      removeFromCart(itemId);
    },
    [removeFromCart]
  );

  // Handler for editing cart item
  const handleEditItem = useCallback((item: any) => {
    // Find the original menu item
    const menuItem = MOCK_MENU_ITEMS.find((m) => m.id === item.menuItemId);
    if (menuItem) {
      setSelectedItem(menuItem);
      setIsModifierModalVisible(true);
    }
  }, []);

  // Handler for clearing cart
  const handleClearCart = useCallback(() => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from the cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  }, [clearCart]);

  // Handler for send to kitchen button
  const handleSendToKitchen = useCallback(() => {
    if (cart.length === 0) return;
    setIsSendModalVisible(true);
  }, [cart]);

  // Handler for confirming send to kitchen
  const handleConfirmSend = useCallback(async () => {
    try {
      const result = await submitToKitchen();
      setIsSendModalVisible(false);

      if (result.success) {
        Alert.alert(
          'Order Sent',
          `Order #${result.orderNumber} has been sent to the kitchen.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send order to kitchen');
      }
    } catch (error) {
      setIsSendModalVisible(false);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  }, [submitToKitchen, navigation]);

  // Handler for back button
  const handleBack = useCallback(() => {
    if (cart.length > 0) {
      Alert.alert(
        'Unsaved Order',
        'You have items in your cart. Do you want to save as draft or discard?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              clearCart();
              navigation.goBack();
            },
          },
          {
            text: 'Save Draft',
            onPress: async () => {
              // TODO: Implement save draft functionality
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [cart, clearCart, navigation]);

  // Calculate cart values
  const subtotal = state.cartSubtotal;
  const taxAmount = state.cartTaxAmount;
  const discountAmount = state.cartDiscountAmount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Order - {tableName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.categoryPanel}>
          <CategorySidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            showAllOption={true}
          />
        </View>

        <View style={styles.menuPanel}>
          <MenuItemGrid
            items={filteredItems}
            onItemPress={handleItemPress}
            categoryName={currentCategoryName}
          />
        </View>

        <View style={styles.cartPanel}>
          <OrderCart
            items={cart}
            subtotal={subtotal}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            total={cartTotal}
            tableName={tableName}
            guestCount={guestCount}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onEditItem={handleEditItem}
            onClearCart={handleClearCart}
            onSendToKitchen={handleSendToKitchen}
            isSubmitting={isSubmitting}
          />
        </View>
      </View>

      <ModifierSelectionModal
        visible={isModifierModalVisible}
        item={selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setIsModifierModalVisible(false);
        }}
        onConfirm={handleAddToCart}
      />

      <SendToKitchenModal
        visible={isSendModalVisible}
        items={cart}
        tableName={tableName}
        total={cartTotal}
        onClose={() => setIsSendModalVisible(false)}
        onConfirm={handleConfirmSend}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
};

export default OrderingScreen;
