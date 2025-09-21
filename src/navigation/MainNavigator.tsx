import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  MainTabParamList, 
  TablesStackParamList, 
  OrdersStackParamList,
  KitchenStackParamList 
} from './types';
import { DashboardScreen } from '@/screens/dashboard';
import { TableManagementScreen } from '@/screens/tables';
import { 
  POSOrderScreen, 
  OrderManagementScreen, 
  OrderDetailsScreen,
  KitchenDisplayScreen 
} from '@/screens/orders';
import {
  PaymentProcessingScreen,
  PaymentConfirmationScreen,
} from '@/screens/payment';
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

// Remove old OrdersScreen as we now use OrdersStackNavigator

const MenuScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Menu Screen</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Settings Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
  },
});

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Orders"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
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