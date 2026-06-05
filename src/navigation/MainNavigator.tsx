/**
 * MainNavigator - Bottom tab navigation with stack navigators
 *
 * NOTE: All business providers (Order, Kitchen, Payment, etc.) are in OptimizedAppProviders.
 * DO NOT add provider wrappers here - they're already at the app root level.
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';
import {
  MainTabParamList,
  OrdersStackParamList,
  KitchenStackParamList
} from './types';
// Import the new dashboard navigator
import { DashboardNavigator } from './DashboardNavigator';
import { DashboardProvider } from '@/context/dashboard/DashboardContext';
import { FloorPlanProvider } from '@/context/floorPlan';

// --- Lazy loading wrapper for React Navigation compatibility ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LazyScreen(importFn: () => Promise<{ default: ComponentType<any> }>) {
  const Component = lazy(importFn);
  return function LazyWrapper(props: Record<string, unknown>) {
    return (
      <Suspense
        fallback={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

// --- Eager imports (initial screens users see immediately) ---
import OrderManagementScreen from '@/screens/orders/OrderManagementScreen';
import KitchenDisplayScreen from '@/screens/orders/KitchenDisplayScreen';

// --- Lazy imports (loaded on first navigation) ---
const POSOrderScreen = LazyScreen(() => import('@/screens/orders/POSOrderScreen'));
const OrderDetailsScreen = LazyScreen(() => import('@/screens/orders/OrderDetailsScreen'));
const OrderingScreen = LazyScreen(() => import('@/screens/orders/OrderingScreen'));
const PaymentProcessingScreen = LazyScreen(() => import('@/screens/payment/PaymentProcessingScreen'));
const PaymentConfirmationScreen = LazyScreen(() => import('@/screens/payment/PaymentConfirmationScreen'));
const BillScreen = LazyScreen(() => import('@/screens/billing/BillScreen'));
const BillSplitScreen = LazyScreen(() => import('@/screens/billing/BillSplitScreen'));
const ReceiptPreviewScreen = LazyScreen(() => import('@/screens/receipt/ReceiptPreviewScreen'));
const SettingsScreen = LazyScreen(() => import('@/screens/settings/SettingsScreen'));

const Tab = createBottomTabNavigator<MainTabParamList>();
const OrdersStack = createStackNavigator<OrdersStackParamList>();
const KitchenStack = createStackNavigator<KitchenStackParamList>();

/**
 * Orders Stack Navigator
 * All providers are at app root level in OptimizedAppProviders
 */
const OrdersStackNavigator = () => (
  <OrdersStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <OrdersStack.Screen
      name="OrderManagement"
      component={OrderManagementScreen}
    />
    <OrdersStack.Screen
      name="OrderDetails"
      component={OrderDetailsScreen}
    />
    <OrdersStack.Screen
      name="POSOrder"
      component={POSOrderScreen}
    />
    <OrdersStack.Screen
      name="Ordering"
      component={OrderingScreen}
    />
    <OrdersStack.Screen
      name="Bill"
      component={BillScreen}
    />
    <OrdersStack.Screen
      name="BillSplit"
      component={BillSplitScreen}
    />
    <OrdersStack.Screen
      name="PaymentProcessing"
      component={PaymentProcessingScreen}
    />
    <OrdersStack.Screen
      name="PaymentConfirmation"
      component={PaymentConfirmationScreen}
    />
    <OrdersStack.Screen
      name="Receipt"
      component={ReceiptPreviewScreen}
    />
  </OrdersStack.Navigator>
);

/**
 * Kitchen Stack Navigator
 * All providers are at app root level in OptimizedAppProviders
 */
const KitchenStackNavigator = () => (
  <KitchenStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <KitchenStack.Screen
      name="KitchenDisplay"
      component={KitchenDisplayScreen}
    />
    <KitchenStack.Screen
      name="OrderDetails"
      component={OrderDetailsScreen}
    />
  </KitchenStack.Navigator>
);

// Dashboard with Provider wrapper
const DashboardWithProvider = () => (
  <DashboardProvider>
    <DashboardNavigator />
  </DashboardProvider>
);

// Remove old OrdersScreen as we now use OrdersStackNavigator


export const MainNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isPhone } = useResponsive();
  const insets = useSafeAreaInsets();
  const { isKitchenStaff, isManagementLevel, canAccessKitchen, canCreateOrders, isCashier } = useAuthStatus();

  // Tab visibility by role
  const showOrdersTab = canCreateOrders || isCashier;     // waiter, manager, store_admin, cashier, self_order
  const showKitchenTab = canAccessKitchen;                 // kitchen_staff, manager, store_admin
  const showSettingsTab = isManagementLevel;                // store_admin, manager

  // Initial route: kitchen staff → Kitchen, everyone else → Orders
  const initialRoute = isKitchenStaff ? 'Kitchen' : 'Orders';

  return (
    <FloorPlanProvider>
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Orders':
              iconName = 'receipt';
              break;
            case 'Kitchen':
              iconName = 'restaurant';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'dashboard';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          height: (isPhone ? 56 : 64) + insets.bottom,
          paddingBottom: insets.bottom + (isPhone ? 4 : 8),
        },
        tabBarLabelStyle: {
          fontSize: isPhone ? 10 : 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardWithProvider}
        options={{ title: 'Dashboard', headerShown: false, tabBarTestID: 'tab-nav-dashboard' }}
      />
      {showOrdersTab && (
        <Tab.Screen
          name="Orders"
          component={OrdersStackNavigator}
          options={{ title: 'Order Management', headerShown: false, tabBarTestID: 'tab-nav-orders' }}
        />
      )}
      {showKitchenTab && (
        <Tab.Screen
          name="Kitchen"
          component={KitchenStackNavigator}
          options={{ title: 'Kitchen Operations', headerShown: false, tabBarTestID: 'tab-nav-kitchen' }}
        />
      )}
      {showSettingsTab && (
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings', headerShown: false, tabBarTestID: 'tab-nav-settings' }}
        />
      )}
    </Tab.Navigator>
    </FloorPlanProvider>
  );
};