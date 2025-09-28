import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CategoryWithStats } from '@/types/menu-management.types';

interface CategoryCardProps {
  category: CategoryWithStats;
  onAction: (categoryId: string, action: 'edit' | 'items' | 'toggle' | 'delete') => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onAction }) => {
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = () => {
    return category.is_active ? theme.colors.success : theme.colors.error;
  };

  const getStatusBgColor = () => {
    return category.is_active ? theme.colors.successLight : theme.colors.errorLight;
  };

  const styles = StyleSheet.create({
    card: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      minHeight: 220,
    },
    inactiveCard: {
      opacity: 0.8,
      borderColor: theme.colors.outlineLight,
    },
    statusBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.xl,
    },
    statusText: {
      ...theme.typography.caption,
      fontSize: 10,
      fontWeight: '600',
    },
    header: {
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    categoryName: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    inactiveText: {
      color: theme.colors.onSurfaceSecondary,
    },
    itemCount: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
      lineHeight: 16,
    },
    statsContainer: {
      marginBottom: theme.spacing.sm,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      flex: 1,
    },
    statValue: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    popularItems: {
      marginBottom: theme.spacing.sm,
    },
    popularTitle: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
      fontWeight: '600',
      marginBottom: 2,
    },
    popularList: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 10,
      lineHeight: 12,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
      gap: 4,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: theme.colors.info,
    },
    editButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceOnPrimary,
      fontSize: 10,
      fontWeight: '600',
    },
    itemsButton: {
      backgroundColor: theme.colors.primary,
    },
    itemsButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceOnPrimary,
      fontSize: 10,
      fontWeight: '600',
    },
    toggleButton: {
      backgroundColor: theme.colors.warning,
    },
    toggleButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceOnPrimary,
      fontSize: 10,
      fontWeight: '600',
    },
    deleteArea: {
      alignItems: 'center',
      paddingVertical: 4,
    },
    deleteHint: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceLight,
      fontSize: 9,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={[styles.card, !category.is_active && styles.inactiveCard]}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor() }]}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {category.is_active ? 'ACTIVE' : 'INACTIVE'}
        </Text>
      </View>

      {/* Category Header */}
      <View style={styles.header}>
        <Text style={[styles.categoryName, !category.is_active && styles.inactiveText]}>
          {category.name}
        </Text>
        <Text style={styles.itemCount}>{category.stats.itemCount} Items</Text>
      </View>

      {/* Description */}
      {category.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {category.description}
        </Text>
      ) : null}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Today's Revenue:</Text>
          <Text style={[styles.statValue, { color: getStatusColor() }]}>
            {formatCurrency(category.stats.todayRevenue)}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Avg Price:</Text>
          <Text style={styles.statValue}>
            {formatCurrency(category.stats.avgPrice)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Last Updated:</Text>
          <Text style={styles.statValue}>
            {new Date(category.stats.lastUpdated).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Popular Items */}
      {category.stats.popularItems.length > 0 && (
        <View style={styles.popularItems}>
          <Text style={styles.popularTitle}>Popular Items:</Text>
          <Text style={styles.popularList} numberOfLines={2}>
            {category.stats.popularItems.join(', ')}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onAction(category.id, 'edit')}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.itemsButton]}
          onPress={() => onAction(category.id, 'items')}
        >
          <Text style={styles.itemsButtonText}>Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => onAction(category.id, 'toggle')}
        >
          <Text style={styles.toggleButtonText}>
            {category.is_active ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Long press menu for delete */}
      <TouchableOpacity
        style={styles.deleteArea}
        onLongPress={() => onAction(category.id, 'delete')}
        delayLongPress={1000}
      >
        <Text style={styles.deleteHint}>Hold to delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    minHeight: 220,
  },

  inactiveCard: {
    opacity: 0.8,
    borderColor: theme.colors.outlineLight,
  },

  statusBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xl,
  },

  statusText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },

  header: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },

  categoryName: {
    ...theme.typography.h4,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },

  inactiveText: {
    color: theme.colors.onSurfaceSecondary,
  },

  itemCount: {
    ...theme.typography.caption,
    color: theme.colors.onSurfaceSecondary,
  },

  description: {
    ...theme.typography.body2,
    color: theme.colors.onSurfaceSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },

  statsContainer: {
    marginBottom: theme.spacing.sm,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.onSurfaceSecondary,
    flex: 1,
  },

  statValue: {
    ...theme.typography.caption,
    color: theme.colors.onSurface,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  popularItems: {
    marginBottom: theme.spacing.sm,
  },

  popularTitle: {
    ...theme.typography.caption,
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: 2,
  },

  popularList: {
    ...theme.typography.caption,
    color: theme.colors.onSurfaceSecondary,
    fontSize: 10,
    lineHeight: 12,
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    gap: 4,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: theme.colors.info,
  },

  editButtonText: {
    ...theme.typography.caption,
    color: theme.colors.onSurfaceOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  itemsButton: {
    backgroundColor: theme.colors.primary,
  },

  itemsButtonText: {
    ...theme.typography.caption,
    color: theme.colors.onSurfaceOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  toggleButton: {
    backgroundColor: theme.colors.warning,
  },

  toggleButtonText: {
    ...theme.typography.caption,
    color: theme.colors.onSurfaceOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  deleteArea: {
    alignItems: 'center',
    paddingVertical: 4,
  },

  deleteHint: {
    ...theme.typography.caption,
    color: theme.colors.onSurfaceLight,
    fontSize: 9,
    fontStyle: 'italic',
  },
});