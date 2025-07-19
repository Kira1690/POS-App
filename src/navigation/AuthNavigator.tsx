import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import { WelcomeScreen, StaffLoginScreen, ManagerLoginScreen } from '@/screens/auth';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
      <Stack.Screen name="ManagerLogin" component={ManagerLoginScreen} />
    </Stack.Navigator>
  );
};