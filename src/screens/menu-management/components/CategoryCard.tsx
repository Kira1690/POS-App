import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';
import { CategoryWithStats } from '@/types/menu-management.types';

interface CategoryCardProps {
  category: CategoryWithStats;
  onAction: (categoryId: string, action: 'edit' | 'items' | 'toggle' | 'delete') => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onAction }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = () => {
    return category.is_active ? ProfessionalTheme.colors.success : ProfessionalTheme.colors.error;
  };

  const getStatusBgColor = () => {
    return category.is_active ? ProfessionalTheme.colors.successLight : ProfessionalTheme.colors.errorLight;
  };

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
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.md,
    padding: ProfessionalTheme.spacing.md,
    marginHorizontal: ProfessionalTheme.spacing.sm,
    marginBottom: ProfessionalTheme.spacing.md,
    ...ProfessionalTheme.shadows.sm,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
    minHeight: 220,
  },

  inactiveCard: {
    opacity: 0.8,
    borderColor: ProfessionalTheme.colors.borderLight,
  },

  statusBadge: {
    position: 'absolute',
    top: ProfessionalTheme.spacing.sm,
    right: ProfessionalTheme.spacing.sm,
    paddingHorizontal: ProfessionalTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: ProfessionalTheme.borderRadius.xl,
  },

  statusText: {
    ...ProfessionalTheme.typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },

  header: {
    marginBottom: ProfessionalTheme.spacing.sm,
    marginTop: ProfessionalTheme.spacing.xs,
  },

  categoryName: {
    ...ProfessionalTheme.typography.h4,
    color: ProfessionalTheme.colors.text,
    marginBottom: 4,
  },

  inactiveText: {
    color: ProfessionalTheme.colors.textSecondary,
  },

  itemCount: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
  },

  description: {
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.textSecondary,
    marginBottom: ProfessionalTheme.spacing.sm,
    lineHeight: 16,
  },

  statsContainer: {
    marginBottom: ProfessionalTheme.spacing.sm,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  statLabel: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    flex: 1,
  },

  statValue: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  popularItems: {
    marginBottom: ProfessionalTheme.spacing.sm,
  },

  popularTitle: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },

  popularList: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontSize: 10,
    lineHeight: 12,
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ProfessionalTheme.spacing.xs,
    gap: 4,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: ProfessionalTheme.colors.info,
  },

  editButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  itemsButton: {
    backgroundColor: ProfessionalTheme.colors.primary,
  },

  itemsButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  toggleButton: {
    backgroundColor: ProfessionalTheme.colors.warning,
  },

  toggleButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  deleteArea: {
    alignItems: 'center',
    paddingVertical: 4,
  },

  deleteHint: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textLight,
    fontSize: 9,
    fontStyle: 'italic',
  },
});