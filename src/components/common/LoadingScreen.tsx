/**
 * Loading Screen - Professional loading component for dashboard
 * Under 200 lines, single responsibility for loading states
 */

import React from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  size = 'large',
  color 
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator 
        size={size} 
        color={color || theme.colors.primary} 
        style={styles.spinner}
      />
      <Text style={[
        styles.message, 
        { color: theme.colors.onBackground }
      ]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  message: {
    ...typography.bodyLarge,
    textAlign: 'center',
    fontWeight: '500',
  },
});