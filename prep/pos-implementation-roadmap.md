# POS Implementation Roadmap

## Overview

This roadmap provides step-by-step implementation guidance for transforming the existing table management system into a full-featured POS order interface, maintaining your existing architecture patterns and performance standards.

## Phase 1: Foundation Setup (Days 1-2)

### 1.1 Create New Types and Interfaces

#### Order Types Enhancement
```typescript
// src/types/order.types.ts (extend existing)
export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  description?: string;
  basePrice: number;
  quantity: number;
  modifications: OrderItemModification[];
  specialInstructions?: string;
  totalPrice: number;
  addedAt: string;
  kitchenStatus?: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface OrderItemModification {
  id: string;
  modifierGroupId: string;
  modifierId: string;
  name: string;
  priceAdjustment: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableName: string;
  restaurantId: string;
  customerId?: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  guestCount?: number;
  estimatedCompletionTime?: string;
}

export enum OrderStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  KITCHEN = 'kitchen',
  READY = 'ready',
  SERVED = 'served',
  PAID = 'paid',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  VOIDED = 'voided'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  DIGITAL_WALLET = 'digital_wallet',
  UPI = 'upi',
  SPLIT = 'split'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

#### Menu Types Enhancement  
```typescript
// src/types/menu.types.ts (extend existing)
export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  image?: string;
  images?: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spiceLevel?: 1 | 2 | 3;
  preparationTime: number; // minutes
  calories?: number;
  rating: number;
  reviewCount: number;
  popularityRank: number;
  dietaryTags: DietaryTag[];
  allergenTags: AllergenTag[];
  modifierGroups: ModifierGroup[];
  variants: MenuItemVariant[];
  isChefRecommended: boolean;
  isTodaySpecial: boolean;
  availableTime?: {
    start: string; // "09:00"
    end: string;   // "22:00"
  };
  createdAt: string;
  updatedAt: string;
}

export interface ModifierGroup {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  allowMultiple: boolean;
  minSelection: number;
  maxSelection: number;
  modifiers: Modifier[];
  sortOrder: number;
}

export interface Modifier {
  id: string;
  name: string;
  description?: string;
  priceAdjustment: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface MenuItemVariant {
  id: string;
  name: string; // "Small", "Medium", "Large"
  priceAdjustment: number;
  isDefault: boolean;
  description?: string;
}

export interface DietaryTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}
```

### 1.2 Create POS-Specific Services

#### OrderService Enhancement
```typescript
// src/services/order/OrderService.ts
import { IOrderService } from '@/interfaces/services/order.interface';
import { Order, OrderItem, CreateOrderRequest, UpdateOrderRequest } from '@/types/order.types';
import { orderApiClient } from '../api/order';

export class OrderService implements IOrderService {
  
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    try {
      const order = await orderApiClient.createOrder(request);
      
      if (__DEV__) {
        console.log(`[OrderService] Created order ${order.orderNumber} for table ${request.tableId}`);
      }
      
      return order;
    } catch (error: any) {
      console.error('[OrderService] Failed to create order:', error.message);
      throw new Error(error.message || 'Failed to create order');
    }
  }

  async addItemToOrder(orderId: string, item: Partial<OrderItem>): Promise<Order> {
    try {
      return await orderApiClient.addItemToOrder(orderId, item);
    } catch (error: any) {
      console.error('[OrderService] Failed to add item to order:', error.message);
      throw new Error(error.message || 'Failed to add item');
    }
  }

  async updateOrderItem(orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<Order> {
    try {
      return await orderApiClient.updateOrderItem(orderId, itemId, updates);
    } catch (error: any) {
      console.error('[OrderService] Failed to update order item:', error.message);
      throw new Error(error.message || 'Failed to update item');
    }
  }

  async removeItemFromOrder(orderId: string, itemId: string): Promise<Order> {
    try {
      return await orderApiClient.removeItemFromOrder(orderId, itemId);
    } catch (error: any) {
      console.error('[OrderService] Failed to remove item from order:', error.message);
      throw new Error(error.message || 'Failed to remove item');
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      return await orderApiClient.updateOrderStatus(orderId, { status });
    } catch (error: any) {
      console.error('[OrderService] Failed to update order status:', error.message);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  async sendOrderToKitchen(orderId: string): Promise<Order> {
    try {
      return await this.updateOrderStatus(orderId, OrderStatus.KITCHEN);
    } catch (error: any) {
      console.error('[OrderService] Failed to send order to kitchen:', error.message);
      throw new Error(error.message || 'Failed to send to kitchen');
    }
  }

  async calculateOrderTotal(order: Partial<Order>): Promise<{ subtotal: number; tax: number; total: number; serviceCharge: number }> {
    try {
      return await orderApiClient.calculateOrderTotal(order);
    } catch (error: any) {
      console.error('[OrderService] Failed to calculate order total:', error.message);
      throw new Error(error.message || 'Failed to calculate total');
    }
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    try {
      return await orderApiClient.getOrdersByTable(tableId);
    } catch (error: any) {
      console.error('[OrderService] Failed to get orders by table:', error.message);
      throw new Error(error.message || 'Failed to get table orders');
    }
  }

  async getActiveOrders(restaurantId: string): Promise<Order[]> {
    try {
      return await orderApiClient.getActiveOrders(restaurantId);
    } catch (error: any) {
      console.error('[OrderService] Failed to get active orders:', error.message);
      throw new Error(error.message || 'Failed to get active orders');
    }
  }
}

export const orderService = new OrderService();
```

#### Order Context Provider
```typescript
// src/context/order/OrderProvider.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Order, OrderItem, OrderStatus, CreateOrderRequest } from '@/types/order.types';
import { orderService } from '@/services/order';

interface OrderState {
  currentOrder: Order | null;
  activeOrders: Order[];
  isLoading: boolean;
  error: string | null;
  orderHistory: Order[];
}

type OrderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_ORDER'; payload: Order | null }
  | { type: 'UPDATE_CURRENT_ORDER'; payload: Order }
  | { type: 'SET_ACTIVE_ORDERS'; payload: Order[] }
  | { type: 'ADD_ITEM_TO_ORDER'; payload: { orderId: string; item: OrderItem } }
  | { type: 'UPDATE_ORDER_ITEM'; payload: { orderId: string; itemId: string; item: OrderItem } }
  | { type: 'REMOVE_ITEM_FROM_ORDER'; payload: { orderId: string; itemId: string } }
  | { type: 'CLEAR_ERROR' };

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload, error: null };
    
    case 'UPDATE_CURRENT_ORDER':
      return { 
        ...state, 
        currentOrder: action.payload,
        activeOrders: state.activeOrders.map(order => 
          order.id === action.payload.id ? action.payload : order
        )
      };
    
    case 'SET_ACTIVE_ORDERS':
      return { ...state, activeOrders: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

interface OrderContextType {
  state: OrderState;
  createOrder: (request: CreateOrderRequest) => Promise<Order>;
  addItemToOrder: (menuItemId: string, quantity: number, modifications?: any[]) => Promise<void>;
  updateOrderItem: (itemId: string, updates: Partial<OrderItem>) => Promise<void>;
  removeItemFromOrder: (itemId: string) => Promise<void>;
  sendOrderToKitchen: () => Promise<void>;
  saveOrder: () => Promise<void>;
  loadActiveOrders: (restaurantId: string) => Promise<void>;
  clearCurrentOrder: () => void;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, {
    currentOrder: null,
    activeOrders: [],
    isLoading: false,
    error: null,
    orderHistory: [],
  });

  const createOrder = useCallback(async (request: CreateOrderRequest): Promise<Order> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const order = await orderService.createOrder(request);
      dispatch({ type: 'SET_CURRENT_ORDER', payload: order });
      return order;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const addItemToOrder = useCallback(async (menuItemId: string, quantity: number, modifications: any[] = []) => {
    if (!state.currentOrder) {
      throw new Error('No active order');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedOrder = await orderService.addItemToOrder(state.currentOrder.id, {
        menuItemId,
        quantity,
        modifications,
      } as Partial<OrderItem>);
      
      dispatch({ type: 'UPDATE_CURRENT_ORDER', payload: updatedOrder });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [state.currentOrder]);

  const sendOrderToKitchen = useCallback(async () => {
    if (!state.currentOrder) {
      throw new Error('No active order');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedOrder = await orderService.sendOrderToKitchen(state.currentOrder.id);
      dispatch({ type: 'UPDATE_CURRENT_ORDER', payload: updatedOrder });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [state.currentOrder]);

  const clearCurrentOrder = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_ORDER', payload: null });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Additional methods implementation...
  
  const contextValue: OrderContextType = {
    state,
    createOrder,
    addItemToOrder,
    updateOrderItem: async () => {}, // Implement
    removeItemFromOrder: async () => {}, // Implement  
    sendOrderToKitchen,
    saveOrder: async () => {}, // Implement
    loadActiveOrders: async () => {}, // Implement
    clearCurrentOrder,
    clearError,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
```

### 1.3 Create Mock Order Service for Development

```typescript
// src/services/api/order/MockOrderApiClient.ts
import { Order, OrderItem, CreateOrderRequest, OrderStatus, PaymentStatus } from '@/types/order.types';

export class MockOrderApiClient {
  private orders: Map<string, Order> = new Map();
  private nextOrderNumber = 26018;

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    console.log('[MockOrderApiClient] Creating order for table:', request.tableId);
    
    const order: Order = {
      id: `order_${Date.now()}`,
      orderNumber: `${this.nextOrderNumber++}`,
      tableId: request.tableId,
      tableName: `Table ${request.tableId.replace('table_', '')}`,
      restaurantId: request.restaurantId,
      items: [],
      status: OrderStatus.DRAFT,
      subtotal: 0,
      tax: 0,
      serviceCharge: 0,
      discount: 0,
      total: 0,
      paymentStatus: PaymentStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: request.createdBy,
      guestCount: request.guestCount,
    };

    this.orders.set(order.id, order);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return order;
  }

  async addItemToOrder(orderId: string, item: Partial<OrderItem>): Promise<Order> {
    console.log('[MockOrderApiClient] Adding item to order:', orderId, item);
    
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const newItem: OrderItem = {
      id: `item_${Date.now()}`,
      menuItemId: item.menuItemId!,
      name: item.name || `Menu Item ${item.menuItemId}`,
      description: item.description,
      basePrice: item.basePrice || 10,
      quantity: item.quantity || 1,
      modifications: item.modifications || [],
      specialInstructions: item.specialInstructions,
      totalPrice: (item.basePrice || 10) * (item.quantity || 1),
      addedAt: new Date().toISOString(),
      kitchenStatus: 'pending',
    };

    order.items.push(newItem);
    order.updatedAt = new Date().toISOString();
    
    // Recalculate totals
    this.recalculateOrderTotals(order);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return order;
  }

  async updateOrderItem(orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const itemIndex = order.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Order item not found');
    }

    order.items[itemIndex] = { ...order.items[itemIndex], ...updates };
    order.updatedAt = new Date().toISOString();
    
    this.recalculateOrderTotals(order);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return order;
  }

  async removeItemFromOrder(orderId: string, itemId: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.items = order.items.filter(item => item.id !== itemId);
    order.updatedAt = new Date().toISOString();
    
    this.recalculateOrderTotals(order);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return order;
  }

  async updateOrderStatus(orderId: string, updates: { status: OrderStatus }): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = updates.status;
    order.updatedAt = new Date().toISOString();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return order;
  }

  private recalculateOrderTotals(order: Order): void {
    order.subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    order.tax = order.subtotal * 0.0825; // 8.25% tax
    order.serviceCharge = order.subtotal * 0.05; // 5% service charge
    order.total = order.subtotal + order.tax + order.serviceCharge - order.discount;
  }

  // Additional mock methods...
  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values())
      .filter(order => order.tableId === tableId);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    return orders;
  }

  async getActiveOrders(restaurantId: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values())
      .filter(order => 
        order.restaurantId === restaurantId && 
        [OrderStatus.DRAFT, OrderStatus.ACTIVE, OrderStatus.KITCHEN].includes(order.status)
      );
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return orders;
  }
}

export const mockOrderApiClient = new MockOrderApiClient();
```

## Phase 2: Core Component Implementation (Days 3-5)

### 2.1 Transform TableManagementScreen to POSOrderScreen

```typescript
// src/screens/pos/POSOrderScreen.tsx
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTable } from '@/context/table';
import { useOrder } from '@/context/order/OrderProvider';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Table } from '@/types/table.types';
import { MenuItem } from '@/types/menu.types';
import { POSScreenMode } from '@/types/pos.types';
import { TableGrid } from '@/components/business/table';
import { MenuCategoryPanel } from '@/components/business/menu/MenuCategoryPanel';
import { MenuItemGrid } from '@/components/business/menu/MenuItemGrid';
import { OrderCartPanel } from '@/components/business/order/OrderCartPanel';
import { POSHeader } from '@/components/business/pos/POSHeader';
import { POSActionBar } from '@/components/business/pos/POSActionBar';
import { spacing } from '@/design-system/theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

enum POSScreenMode {
  TABLE_SELECTION = 'table_selection',
  ORDER_TAKING = 'order_taking',
}

const POSOrderScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state: authState } = useAuth();
  const { state: tableState, selectTable, refreshTables } = useTable();
  const { state: orderState, createOrder, addItemToOrder } = useOrder();
  
  const [screenMode, setScreenMode] = useState<POSScreenMode>(POSScreenMode.TABLE_SELECTION);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTableSelect = useCallback(async (table: Table) => {
    selectTable(table);
    
    try {
      // Create new order for the table
      await createOrder({
        tableId: table.id,
        restaurantId: authState.restaurant?.id || 'rest_001',
        createdBy: authState.user?.id || 'user_001',
        guestCount: table.capacity,
      });
      
      // Switch to order taking mode
      setScreenMode(POSScreenMode.ORDER_TAKING);
    } catch (error) {
      console.error('Failed to create order for table:', error);
    }
  }, [selectTable, createOrder, authState]);

  const handleMenuItemAdd = useCallback(async (item: MenuItem, quantity: number = 1) => {
    try {
      await addItemToOrder(item.id, quantity);
    } catch (error) {
      console.error('Failed to add item to order:', error);
    }
  }, [addItemToOrder]);

  const handleBackToTables = useCallback(() => {
    setScreenMode(POSScreenMode.TABLE_SELECTION);
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  const renderTableSelection = () => (
    <View style={styles.container}>
      <POSHeader
        mode="table_selection"
        title="Select Table"
        onRefresh={refreshTables}
      />
      
      <TableGrid
        tables={tableState.tables}
        selectedTableId={tableState.selectedTable?.id}
        onTableSelect={handleTableSelect}
        onTableLongPress={() => {}} // Disable long press in POS mode
        isLoading={tableState.isLoading}
      />
    </View>
  );

  const renderOrderTaking = () => {
    if (!tableState.selectedTable || !orderState.currentOrder) {
      return renderTableSelection();
    }

    const DesktopLayout = () => (
      <View style={styles.desktopLayout}>
        <MenuCategoryPanel
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <MenuItemGrid
          categoryId={selectedCategory}
          searchQuery={searchQuery}
          onItemAdd={handleMenuItemAdd}
          style={styles.menuItemGrid}
        />
        
        <OrderCartPanel
          order={orderState.currentOrder}
          isLoading={orderState.isLoading}
          style={styles.orderPanel}
        />
      </View>
    );

    const MobileLayout = () => (
      <View style={styles.mobileLayout}>
        <MenuItemGrid
          categoryId={selectedCategory}
          searchQuery={searchQuery}
          onItemAdd={handleMenuItemAdd}
          style={styles.mobileMenuGrid}
        />
        
        {/* Mobile order cart will be a bottom sheet */}
      </View>
    );

    return (
      <View style={styles.container}>
        <POSHeader
          mode="order_taking"
          table={tableState.selectedTable}
          order={orderState.currentOrder}
          onBackToTables={handleBackToTables}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {isTablet ? <DesktopLayout /> : <MobileLayout />}
        
        <POSActionBar
          order={orderState.currentOrder}
          onSaveOrder={() => {}}
          onSendToKitchen={() => {}}
          onPayment={() => {}}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      {screenMode === POSScreenMode.TABLE_SELECTION ? renderTableSelection() : renderOrderTaking()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileLayout: {
    flex: 1,
  },
  menuItemGrid: {
    flex: 1,
  },
  mobileMenuGrid: {
    flex: 1,
  },
  orderPanel: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
});

export default POSOrderScreen;
```

### 2.2 Create MenuItemGrid Component

```typescript
// src/components/business/menu/MenuItemGrid.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Dimensions,
  ListRenderItem,
  ActivityIndicator 
} from 'react-native';
import { MenuItem } from '@/types/menu.types';
import { useTheme } from '@/hooks/useTheme';
import { useMenu } from '@/hooks/useMenu';
import { spacing } from '@/design-system/theme/spacing';
import { MenuItemCard } from './MenuItemCard';

interface MenuItemGridProps {
  categoryId?: string;
  searchQuery?: string;
  onItemAdd: (item: MenuItem, quantity?: number) => void;
  onItemDetails?: (item: MenuItem) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

const MenuItemGrid: React.FC<MenuItemGridProps> = memo(({
  categoryId,
  searchQuery,
  onItemAdd,
  onItemDetails,
  style,
}) => {
  const { theme } = useTheme();
  const { menuItems, isLoading, error } = useMenu({ 
    categoryId, 
    searchQuery 
  });

  // Calculate optimal number of columns
  const numColumns = useMemo(() => {
    const minCardWidth = screenWidth >= 1024 ? 140 : screenWidth >= 768 ? 160 : 180;
    const totalPadding = spacing.lg * 2;
    const availableWidth = screenWidth - totalPadding;
    const cardSpacing = spacing.md;
    
    const cols = Math.floor((availableWidth + cardSpacing) / (minCardWidth + cardSpacing));
    return Math.max(2, Math.min(cols, screenWidth >= 1024 ? 4 : 3));
  }, []);

  const renderMenuItem: ListRenderItem<MenuItem> = useCallback(({ item }) => {
    return (
      <View style={[styles.itemContainer, { width: `${100 / numColumns}%` }]}>
        <MenuItemCard
          item={item}
          onAdd={(quantity) => onItemAdd(item, quantity)}
          onDetails={onItemDetails ? () => onItemDetails(item) : undefined}
        />
      </View>
    );
  }, [numColumns, onItemAdd, onItemDetails]);

  const keyExtractor = useCallback((item: MenuItem) => item.id, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={numColumns * 3}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={numColumns * 5}
      />
    </View>
  );
});

MenuItemGrid.displayName = 'MenuItemGrid';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: spacing.md,
  },
  itemContainer: {
    padding: spacing.sm,
  },
});

export default MenuItemGrid;
```

### 2.3 Create MenuItemCard Component

```typescript
// src/components/business/menu/MenuItemCard.tsx
import React, { memo, useState } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';
import { MenuItem } from '@/types/menu.types';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (quantity: number) => void;
  onDetails?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const MenuItemCard: React.FC<MenuItemCardProps> = memo(({
  item,
  onAdd,
  onDetails,
}) => {
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const getDietaryIndicators = () => {
    const indicators = [];
    if (item.isVegetarian) indicators.push('🥗');
    if (item.isVegan) indicators.push('🌱');
    if (item.isGlutenFree) indicators.push('GF');
    if (item.isSpicy) indicators.push('🌶️');
    if (item.isChefRecommended) indicators.push('⭐');
    return indicators;
  };

  const handleAdd = () => {
    onAdd(quantity);
    // Reset quantity after adding
    setQuantity(1);
  };

  const cardWidth = isTablet ? 160 : 180;
  const imageHeight = isTablet ? 90 : 100;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          width: cardWidth,
        }
      ]}
      onPress={onDetails}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={[styles.image, { height: imageHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { 
            height: imageHeight,
            backgroundColor: theme.colors.surfaceVariant 
          }]}>
            <Text style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant }]}>
              No Image
            </Text>
          </View>
        )}
        
        {/* Availability indicator */}
        {!item.isAvailable && (
          <View style={[styles.unavailableOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <Text style={[styles.unavailableText, { color: theme.colors.onSurface }]}>
              Unavailable
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text 
          style={[styles.title, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Dietary indicators & rating */}
        <View style={styles.indicators}>
          <View style={styles.dietaryTags}>
            {getDietaryIndicators().map((indicator, index) => (
              <Text key={index} style={styles.indicator}>
                {indicator}
              </Text>
            ))}
          </View>
          
          {item.rating > 0 && (
            <Text style={[styles.rating, { color: theme.colors.onSurfaceVariant }]}>
              ⭐ {item.rating.toFixed(1)}
            </Text>
          )}
        </View>

        {/* Price */}
        <Text style={[styles.price, { color: theme.colors.primary }]}>
          {formatPrice(item.price)}
        </Text>

        {/* Action buttons */}
        <View style={styles.actions}>
          {isTablet && (
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={[styles.quantityButtonText, { color: theme.colors.onSurfaceVariant }]}>-</Text>
              </TouchableOpacity>
              
              <Text style={[styles.quantity, { color: theme.colors.onSurface }]}>
                {quantity}
              </Text>
              
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={[styles.quantityButtonText, { color: theme.colors.onSurfaceVariant }]}>+</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.addButton, { 
              backgroundColor: item.isAvailable ? theme.colors.success : theme.colors.surfaceDisabled,
              flex: isTablet ? 1 : undefined,
            }]}
            onPress={handleAdd}
            disabled={!item.isAvailable}
          >
            <Text style={[styles.addButtonText, { 
              color: item.isAvailable ? theme.colors.onSuccess : theme.colors.onSurfaceDisabled 
            }]}>
              {isTablet ? 'ADD' : '+ ADD'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

MenuItemCard.displayName = 'MenuItemCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  placeholderImage: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodySmall,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  content: {
    padding: spacing.sm,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dietaryTags: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  indicator: {
    fontSize: 12,
  },
  rating: {
    ...typography.bodySmall,
  },
  price: {
    ...typography.labelLarge,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  quantity: {
    ...typography.bodyMedium,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
});

export default MenuItemCard;
```

## Phase 3: Enhanced Features (Days 6-8)

### 3.1 OrderCartPanel Implementation

```typescript
// src/components/business/order/OrderCartPanel.tsx
import React, { memo, useCallback } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ListRenderItem
} from 'react-native';
import { Order, OrderItem } from '@/types/order.types';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { OrderItemRow } from './OrderItemRow';

interface OrderCartPanelProps {
  order: Order;
  onItemUpdate?: (itemId: string, updates: Partial<OrderItem>) => void;
  onItemRemove?: (itemId: string) => void;
  onItemDuplicate?: (itemId: string) => void;
  isLoading?: boolean;
  style?: any;
}

const OrderCartPanel: React.FC<OrderCartPanelProps> = memo(({
  order,
  onItemUpdate,
  onItemRemove,
  onItemDuplicate,
  isLoading = false,
  style,
}) => {
  const { theme } = useTheme();

  const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;

  const renderOrderItem: ListRenderItem<OrderItem> = useCallback(({ item }) => (
    <OrderItemRow
      item={item}
      onUpdate={onItemUpdate}
      onRemove={onItemRemove}
      onDuplicate={onItemDuplicate}
    />
  ), [onItemUpdate, onItemRemove, onItemDuplicate]);

  const keyExtractor = useCallback((item: OrderItem) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
          Order #{order.orderNumber}
        </Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={{ color: theme.colors.onSurface }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      {/* Table Info */}
      <View style={[styles.tableInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.tableInfoText, { color: theme.colors.onSurfaceVariant }]}>
          {order.tableName} • Guests: {order.guestCount || 'N/A'}
        </Text>
        <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
          Started: {new Date(order.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>

      {/* Order Items */}
      <View style={styles.itemsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          ORDER ITEMS
        </Text>
        
        {order.items.length === 0 ? (
          <View style={styles.emptyOrder}>
            <Text style={[styles.emptyOrderText, { color: theme.colors.onSurfaceVariant }]}>
              No items in order
            </Text>
            <Text style={[styles.emptyOrderSubtext, { color: theme.colors.onSurfaceVariant }]}>
              Select items from the menu to add them to this order
            </Text>
          </View>
        ) : (
          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
          />
        )}
      </View>

      {/* Order Summary */}
      {order.items.length > 0 && (
        <>
          <View style={styles.specialInstructions}>
            <TouchableOpacity style={styles.addInstructionsButton}>
              <Text style={[styles.addInstructionsText, { color: theme.colors.primary }]}>
                + Add Special Instructions
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.pricingSection, { borderTopColor: theme.colors.outline }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              PRICING BREAKDOWN
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.colors.onSurface }]}>
                Subtotal:
              </Text>
              <Text style={[styles.priceValue, { color: theme.colors.onSurface }]}>
                {formatPrice(order.subtotal)}
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.colors.onSurface }]}>
                Tax ({((order.tax / order.subtotal) * 100).toFixed(1)}%):
              </Text>
              <Text style={[styles.priceValue, { color: theme.colors.onSurface }]}>
                {formatPrice(order.tax)}
              </Text>
            </View>
            
            {order.serviceCharge > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.colors.onSurface }]}>
                  Service Charge:
                </Text>
                <Text style={[styles.priceValue, { color: theme.colors.onSurface }]}>
                  {formatPrice(order.serviceCharge)}
                </Text>
              </View>
            )}
            
            <View style={[styles.totalRow, { borderTopColor: theme.colors.outline }]}>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
                TOTAL:
              </Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                {formatPrice(order.total)}
              </Text>
            </View>
            
            {order.paymentMethod && (
              <View style={styles.paymentMethod}>
                <Text style={[styles.paymentText, { color: theme.colors.onSurfaceVariant }]}>
                  💰 Payment Method: {order.paymentMethod}
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          ORDER ACTIONS
        </Text>
        
        <View style={styles.primaryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            disabled={isLoading}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
              💾 SAVE ORDER
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.primaryButton, 
              { backgroundColor: order.items.length > 0 ? theme.colors.success : theme.colors.surfaceDisabled }
            ]}
            disabled={order.items.length === 0 || isLoading}
          >
            <Text style={[
              styles.actionButtonText, 
              { color: order.items.length > 0 ? theme.colors.onSuccess : theme.colors.onSurfaceDisabled }
            ]}>
              🍴 SEND TO KITCHEN
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.primaryButton, 
              { backgroundColor: order.total > 0 ? theme.colors.success : theme.colors.surfaceDisabled }
            ]}
            disabled={order.total === 0 || isLoading}
          >
            <Text style={[
              styles.actionButtonText, 
              { color: order.total > 0 ? theme.colors.onSuccess : theme.colors.onSurfaceDisabled }
            ]}>
              💳 PAYMENT
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.secondaryButtonText, { color: theme.colors.onSurfaceVariant }]}>
              ✂️ SPLIT
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.secondaryButtonText, { color: theme.colors.onSurfaceVariant }]}>
              🎫 DISCOUNT
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.secondaryButtonText, { color: theme.colors.onSurfaceVariant }]}>
              🖨️ PRINT
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={[styles.secondaryButtonText, { color: theme.colors.onErrorContainer }]}>
              ❌ VOID
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

OrderCartPanel.displayName = 'OrderCartPanel';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    ...typography.titleLarge,
    fontWeight: '600',
  },
  settingsButton: {
    padding: spacing.xs,
  },
  tableInfo: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  tableInfoText: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  timeText: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  itemsSection: {
    flex: 1,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.labelLarge,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyOrder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyOrderText: {
    ...typography.bodyLarge,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyOrderSubtext: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  itemsList: {
    paddingBottom: spacing.md,
  },
  specialInstructions: {
    marginBottom: spacing.md,
  },
  addInstructionsButton: {
    padding: spacing.sm,
  },
  addInstructionsText: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  pricingSection: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceLabel: {
    ...typography.bodyMedium,
  },
  priceValue: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.titleMedium,
    fontWeight: '700',
  },
  totalValue: {
    ...typography.titleMedium,
    fontWeight: '700',
  },
  paymentMethod: {
    marginTop: spacing.sm,
  },
  paymentText: {
    ...typography.bodyMedium,
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: spacing.md,
  },
  primaryActions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    // Full width for primary actions
  },
  secondaryButton: {
    flex: 1,
    minWidth: 70,
  },
  actionButtonText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...typography.labelSmall,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default OrderCartPanel;
```

## Phase 4: Integration & Testing (Days 9-10)

### 4.1 Update Navigation
```typescript
// src/navigation/MainNavigator.tsx - Update the tables tab
import POSOrderScreen from '@/screens/pos/POSOrderScreen';

// Replace TableManagementScreen with POSOrderScreen in the navigator
<Tab.Screen
  name="POS"
  component={POSOrderScreen}
  options={{
    tabBarLabel: 'POS',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="restaurant" size={size} color={color} />
    ),
  }}
/>
```

### 4.2 Add Provider Integration
```typescript
// src/App.tsx - Add OrderProvider
import { OrderProvider } from '@/context/order/OrderProvider';

function App() {
  return (
    <AuthProvider>
      <TableProvider>
        <OrderProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </OrderProvider>
      </TableProvider>
    </AuthProvider>
  );
}
```

### 4.3 Performance Optimizations
- Use React.memo for all components
- Implement proper key props for lists
- Add image lazy loading for menu items
- Use FlatList with proper optimization props
- Implement search debouncing (300ms delay)
- Add loading states for all async operations

## Success Metrics & Testing

### User Experience Goals
- Order creation: <30 seconds for 5 items
- Menu navigation: <1 second category switching
- Search results: <500ms response time
- Cart updates: <200ms real-time updates

### Technical Performance Targets
- Component render time: <16ms for smooth 60fps
- Memory usage: <200MB peak on mobile devices
- Bundle size increase: <500KB additional
- Battery usage: No significant impact during normal usage

### Testing Approach
1. **Unit Tests**: All service methods and utility functions
2. **Component Tests**: User interaction flows
3. **Integration Tests**: Full order creation workflow
4. **Performance Tests**: Memory leaks and render performance
5. **User Testing**: Staff workflow validation

This implementation roadmap provides a complete path from the current table management system to a full-featured POS order system while maintaining your existing architecture, performance standards, and code quality requirements.