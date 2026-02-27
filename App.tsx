import React from 'react';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { DatabaseProvider } from '@/services/database';
import { OptimizedAppProviders } from '@/providers/OptimizedAppProviders';
import { MenuProvider } from '@/context/menu';

// Toast configuration with 'warning' type support
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#34C759' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '600' }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF3B30' }}
      text1Style={{ fontSize: 15, fontWeight: '600' }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#007AFF' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '600' }}
      text2Style={{ fontSize: 13 }}
    />
  ),
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FF9500' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '600' }}
      text2Style={{ fontSize: 13 }}
    />
  ),
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <ThemeProvider>
            <OptimizedAppProviders>
            <MenuProvider>
              <NavigationContainer>
                <RootNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </MenuProvider>
            </OptimizedAppProviders>
          </ThemeProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
