import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

  const getIconName = (iconName: string) => {
    // Return the icon name directly since we're now passing proper MaterialIcons names
    const validIcons = ['attach-money', 'analytics', 'access-time', 'diamond', 'trending-up'];
    return validIcons.includes(iconName) ? iconName : 'trending-up';
  };

  const getChangeColor = () => {
    switch (changeDirection) {
      case 'up':
        return theme.colors.success;
      case 'down':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getChangeIcon = () => {
    const iconName = changeDirection === 'up' ? 'trending-up' :
                    changeDirection === 'down' ? 'trending-down' : 'trending-flat';

    return <MaterialIcons name={iconName as any} size={14} color={getChangeColor()} />;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      minHeight: 140,
      elevation: 4,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },

    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
      color: theme.colors.onSurface,
    },

    title: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      fontWeight: '600',
      marginBottom: 4,
    },

    period: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
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
          <MaterialIcons name={getIconName(icon)} size={24} color={theme.colors.onPrimary} />
        </View>
        <View style={styles.changeContainer}>
          {getChangeIcon()}
          <Text style={[styles.changeText, { color: getChangeColor() }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>
    </View>
  );
};