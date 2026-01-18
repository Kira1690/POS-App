/**
 * MainNavigator - Bottom tab navigation with stack navigators
 *
 * NOTE: All business providers (Order, Kitchen, Payment, etc.) are in OptimizedAppProviders.
 * DO NOT add provider wrappers here - they're already at the app root level.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  MainTabParamList,
  OrdersStackParamList,
  KitchenStackParamList
} from './types';
// Import the new dashboard navigator
import { DashboardNavigator } from './DashboardNavigator';
import { DashboardProvider } from '@/context/dashboard/DashboardContext';
import { FloorPlanProvider } from '@/context/floorPlan';
// Direct imports for order screens
import POSOrderScreen from '@/screens/orders/POSOrderScreen';
import OrderManagementScreen from '@/screens/orders/OrderManagementScreen';
import OrderDetailsScreen from '@/screens/orders/OrderDetailsScreen';
import KitchenDisplayScreen from '@/screens/orders/KitchenDisplayScreen';
// Enhanced ordering screen
import OrderingScreen from '@/screens/orders/OrderingScreen';
// Direct imports for payment screens
import PaymentProcessingScreen from '@/screens/payment/PaymentProcessingScreen';
import PaymentConfirmationScreen from '@/screens/payment/PaymentConfirmationScreen';
// Billing screens
import BillScreen from '@/screens/billing/BillScreen';
import BillSplitScreen from '@/screens/billing/BillSplitScreen';
// Receipt screens
import { ReceiptPreviewScreen } from '@/screens/receipt';
// Import actual Settings screen
import SettingsScreen from '@/screens/settings/SettingsScreen';

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

const MenuScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant }]}>Menu Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
  },
});

export const MainNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <FloorPlanProvider>
    <Tab.Navigator
      initialRouteName="Orders"
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
            case 'Menu':
              iconName = 'menu-book';
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
        },
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardWithProvider}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStackNavigator}
        options={{ title: 'Order Management', headerShown: false }}
      />
      <Tab.Screen
        name="Kitchen" 
        component={KitchenStackNavigator}
        options={{ title: 'Kitchen Operations', headerShown: false }}
      />
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen}
        options={{ title: 'Menu Management' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', headerShown: false }}
      />
    </Tab.Navigator>
    </FloorPlanProvider>
  );
};