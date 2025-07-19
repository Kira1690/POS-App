import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { DashboardScreen } from '@/screens/dashboard';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens
const OrdersScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Orders Screen</Text>
  </View>
);

const TablesScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Tables Screen</Text>
  </View>
);

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
      initialRouteName="Dashboard"
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Tables" component={TablesScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};