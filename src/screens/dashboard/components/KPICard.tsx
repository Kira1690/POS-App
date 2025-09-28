import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { KPICardProps } from '@/types/dashboard.types';

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeDirection,
  period,
  icon,
  color,
  loading = false,
}) => {
  const { theme } = useTheme();
  const getChangeColor = () => {
    switch (changeDirection) {
      case 'up':
        return theme.colors.success;
      case 'down':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceSecondary;
    }
  };

  const getChangeIcon = () => {
    switch (changeDirection) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      minHeight: 120,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },

    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },

    icon: {
      fontSize: 20,
    },

    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    changeIcon: {
      fontSize: 14,
      marginRight: 4,
    },

    changeText: {
      ...theme.typography.caption,
      fontWeight: '600',
    },

    content: {
      flex: 1,
    },

    value: {
      ...theme.typography.h2,
      fontWeight: '700',
      marginBottom: 4,
    },

    title: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      fontWeight: '500',
      marginBottom: 2,
    },

    period: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
    },

    // Loading states
    loadingContainer: {
      flex: 1,
    },

    loadingBar: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      opacity: 0.3,
      marginBottom: theme.spacing.sm,
    },

    loadingText: {
      height: 24,
      backgroundColor: theme.colors.outlineLight,
      borderRadius: 4,
      marginBottom: 8,
      opacity: 0.5,
    },

    loadingSubtext: {
      height: 16,
      width: '60%',
      backgroundColor: theme.colors.outlineLight,
      borderRadius: 4,
      opacity: 0.3,
    },
  });

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingBar, { backgroundColor: color }]} />
          <View style={styles.loadingText} />
          <View style={styles.loadingSubtext} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.changeContainer}>
          <Text style={[styles.changeIcon, { color: getChangeColor() }]}>
            {getChangeIcon()}
          </Text>
          <Text style={[styles.changeText, { color: getChangeColor() }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>
    </View>
  );
};