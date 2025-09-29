import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  MainTabParamList,
  TablesStackParamList,
  OrdersStackParamList,
  KitchenStackParamList
} from './types';
// Import the new dashboard navigator
import { DashboardNavigator } from './DashboardNavigator';
import { DashboardProvider } from '@/context/dashboard/DashboardContext';
import TableManagementScreen from '@/screens/tables/TableManagementScreen';
// Direct imports for order screens
import POSOrderScreen from '@/screens/orders/POSOrderScreen';
import OrderManagementScreen from '@/screens/orders/OrderManagementScreen';
import OrderDetailsScreen from '@/screens/orders/OrderDetailsScreen';
import KitchenDisplayScreen from '@/screens/orders/KitchenDisplayScreen';
// Direct imports for payment screens
import PaymentProcessingScreen from '@/screens/payment/PaymentProcessingScreen';
import PaymentConfirmationScreen from '@/screens/payment/PaymentConfirmationScreen';
import { TableProvider } from '@/context/table';
import { OrderProvider } from '@/context/order';
import { OrderManagementProvider } from '@/context/orderManagement';
import { PaymentProvider } from '@/context/payment';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TablesStack = createStackNavigator<TablesStackParamList>();
const OrdersStack = createStackNavigator<OrdersStackParamList>();
const KitchenStack = createStackNavigator<KitchenStackParamList>();

// Tables Stack Navigator - includes TableManagement and POSOrder
const TablesStackNavigator = () => (
  <TableProvider>
    <OrderProvider>
      <TablesStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <TablesStack.Screen 
          name="TableManagement" 
          component={TableManagementScreen} 
        />
        <TablesStack.Screen 
          name="POSOrder" 
          component={POSOrderScreen}
        />
      </TablesStack.Navigator>
    </OrderProvider>
  </TableProvider>
);

// Orders Stack Navigator - Professional order management
const OrdersStackNavigator = () => (
  <PaymentProvider>
    <OrderProvider>
      <OrderManagementProvider>
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
            name="PaymentProcessing" 
            component={PaymentProcessingScreen}
          />
          <OrdersStack.Screen 
            name="PaymentConfirmation" 
            component={PaymentConfirmationScreen}
          />
        </OrdersStack.Navigator>
      </OrderManagementProvider>
    </OrderProvider>
  </PaymentProvider>
);

// Kitchen Stack Navigator - Kitchen operations
const KitchenStackNavigator = () => (
  <OrderProvider>
    <OrderManagementProvider>
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
    </OrderManagementProvider>
  </OrderProvider>
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

const SettingsScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant }]}>Settings Screen</Text>
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
            case 'Tables':
              iconName = 'table-restaurant';
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
        name="Tables" 
        component={TablesStackNavigator}
        options={{ title: 'Table Management', headerShown: false }}
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
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};