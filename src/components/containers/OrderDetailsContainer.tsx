/**
 * OrderDetailsContainer - Container component for order details layout
 * Clean separation of layout concerns from business logic
 * Follows container/presentational pattern
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/design-system/theme/spacing';

interface OrderDetailsContainerProps {
  children: React.ReactNode;
  testID?: string;
}

/**
 * Container component for order details screen layout
 * Provides consistent spacing, background, and safe area handling
 * 
 * @param children - Child components to render
 * @param testID - Test identifier for testing
 */
export const OrderDetailsContainer: React.FC<OrderDetailsContainerProps> = ({
  children,
  testID = 'order-details-container',
}) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.background }
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});