import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';
import { MenuItemWithStats } from '@/types/menu-management.types';

interface MenuItemCardProps {
  item: MenuItemWithStats;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (itemId: string, action: 'edit' | 'duplicate' | 'toggle' | 'delete') => void;
  viewMode: 'list' | 'grid';
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isSelected,
  onSelect,
  onAction,
  viewMode,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAvailabilityColor = () => {
    return item.is_available ? ProfessionalTheme.colors.success : ProfessionalTheme.colors.error;
  };

  const getAvailabilityBgColor = () => {
    return item.is_available ? ProfessionalTheme.colors.successLight : ProfessionalTheme.colors.errorLight;
  };

  const getRatingStars = (rating: number) => {
    const stars = Math.round(rating);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  if (viewMode === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.gridCard, isSelected && styles.selectedCard]}
        onPress={onSelect}
      >
        {/* Selection Indicator */}
        <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
          <Text style={styles.selectionIcon}>{isSelected ? '✓' : ''}</Text>
        </View>

        {/* Availability Badge */}
        <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityBgColor() }]}>
          <Text style={[styles.availabilityText, { color: getAvailabilityColor() }]}>
            {item.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
          </Text>
        </View>

        {/* Item Image */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🍽️</Text>
          </View>
        )}

        {/* Item Info */}
        <View style={styles.gridItemInfo}>
          <Text style={[styles.itemName, !item.is_available && styles.disabledText]} numberOfLines={2}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.priceRow}>
            <Text style={[styles.itemPrice, { color: getAvailabilityColor() }]}>
              {formatCurrency(item.price)}
            </Text>
            <Text style={styles.prepTime}>
              {item.preparation_time_minutes || 10}min
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <Text style={styles.statText}>
              {item.stats.todayOrders} orders
            </Text>
            <Text style={styles.statText}>
              {getRatingStars(item.stats.customerRating)} ({item.stats.customerRating.toFixed(1)})
            </Text>
          </View>
        </View>

        {/* Grid Actions */}
        <View style={styles.gridActions}>
          <TouchableOpacity
            style={[styles.gridActionButton, styles.editButton]}
            onPress={() => onAction(item.id, 'edit')}
          >
            <Text style={styles.gridActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridActionButton, styles.toggleButton]}
            onPress={() => onAction(item.id, 'toggle')}
          >
            <Text style={styles.gridActionText}>
              {item.is_available ? 'Disable' : 'Enable'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // List View
  return (
    <TouchableOpacity
      style={[styles.listCard, isSelected && styles.selectedCard]}
      onPress={onSelect}
    >
      {/* Selection Checkbox */}
      <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
        <Text style={styles.checkboxIcon}>{isSelected ? '✓' : ''}</Text>
      </View>

      {/* Item Image */}
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.listItemImage} />
      ) : (
        <View style={styles.listImagePlaceholder}>
          <Text style={styles.listImagePlaceholderText}>🍽️</Text>
        </View>
      )}

      {/* Item Details */}
      <View style={styles.listItemDetails}>
        <View style={styles.listItemHeader}>
          <Text style={[styles.listItemName, !item.is_available && styles.disabledText]}>
            {item.name}
          </Text>
          <View style={[styles.listAvailabilityBadge, { backgroundColor: getAvailabilityBgColor() }]}>
            <Text style={[styles.listAvailabilityText, { color: getAvailabilityColor() }]}>
              {item.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.listItemDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}

        <View style={styles.listItemMeta}>
          <Text style={styles.categoryText}>Category: {item.category_id}</Text>
          <Text style={styles.prepTimeText}>Prep: {item.preparation_time_minutes || 10}min</Text>
          {item.dietary_info && item.dietary_info.length > 0 && (
            <Text style={styles.dietaryText}>
              {item.dietary_info.join(', ')}
            </Text>
          )}
        </View>
      </View>

      {/* Price Column */}
      <View style={styles.priceColumn}>
        <Text style={[styles.listItemPrice, { color: getAvailabilityColor() }]}>
          {formatCurrency(item.price)}
        </Text>
      </View>

      {/* Stats Column */}
      <View style={styles.statsColumn}>
        <Text style={styles.statLabel}>Orders:</Text>
        <Text style={styles.statValue}>{item.stats.todayOrders}</Text>
        <Text style={styles.statLabel}>Revenue:</Text>
        <Text style={[styles.statValue, { color: ProfessionalTheme.colors.success }]}>
          {formatCurrency(item.stats.todayRevenue)}
        </Text>
      </View>

      {/* Rating Column */}
      <View style={styles.ratingColumn}>
        <Text style={styles.ratingStars}>
          {getRatingStars(item.stats.customerRating)}
        </Text>
        <Text style={styles.ratingValue}>
          {item.stats.customerRating.toFixed(1)}
        </Text>
      </View>

      {/* Actions Column */}
      <View style={styles.actionsColumn}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editActionButton]}
          onPress={() => onAction(item.id, 'edit')}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.duplicateActionButton]}
          onPress={() => onAction(item.id, 'duplicate')}
        >
          <Text style={styles.actionButtonText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleActionButton]}
          onPress={() => onAction(item.id, 'toggle')}
        >
          <Text style={styles.actionButtonText}>
            {item.is_available ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid View Styles
  gridCard: {
    width: '48%',
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.md,
    padding: ProfessionalTheme.spacing.md,
    marginHorizontal: '1%',
    marginBottom: ProfessionalTheme.spacing.md,
    ...ProfessionalTheme.shadows.sm,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
    minHeight: 280,
  },

  selectedCard: {
    borderColor: ProfessionalTheme.colors.info,
    backgroundColor: ProfessionalTheme.colors.infoLight,
  },

  selectionIndicator: {
    position: 'absolute',
    top: ProfessionalTheme.spacing.sm,
    left: ProfessionalTheme.spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ProfessionalTheme.colors.border,
    backgroundColor: ProfessionalTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  selectedIndicator: {
    borderColor: ProfessionalTheme.colors.info,
    backgroundColor: ProfessionalTheme.colors.info,
  },

  selectionIcon: {
    fontSize: 12,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontWeight: '600',
  },

  availabilityBadge: {
    position: 'absolute',
    top: ProfessionalTheme.spacing.sm,
    right: ProfessionalTheme.spacing.sm,
    paddingHorizontal: ProfessionalTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: ProfessionalTheme.borderRadius.sm,
  },

  availabilityText: {
    ...ProfessionalTheme.typography.caption,
    fontSize: 8,
    fontWeight: '600',
  },

  itemImage: {
    width: '100%',
    height: 80,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    marginTop: ProfessionalTheme.spacing.lg,
    marginBottom: ProfessionalTheme.spacing.sm,
  },

  imagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ProfessionalTheme.spacing.lg,
    marginBottom: ProfessionalTheme.spacing.sm,
  },

  imagePlaceholderText: {
    fontSize: 24,
  },

  gridItemInfo: {
    flex: 1,
  },

  itemName: {
    ...ProfessionalTheme.typography.label,
    color: ProfessionalTheme.colors.text,
    marginBottom: 4,
  },

  disabledText: {
    color: ProfessionalTheme.colors.textSecondary,
  },

  itemDescription: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    marginBottom: ProfessionalTheme.spacing.sm,
    lineHeight: 14,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ProfessionalTheme.spacing.sm,
  },

  itemPrice: {
    ...ProfessionalTheme.typography.body1,
    fontWeight: '700',
  },

  prepTime: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
  },

  quickStats: {
    marginBottom: ProfessionalTheme.spacing.sm,
  },

  statText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },

  gridActions: {
    flexDirection: 'row',
    gap: ProfessionalTheme.spacing.xs,
  },

  gridActionButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: ProfessionalTheme.colors.info,
  },

  toggleButton: {
    backgroundColor: ProfessionalTheme.colors.warning,
  },

  gridActionText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },

  // List View Styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.surface,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    padding: ProfessionalTheme.spacing.sm,
    marginBottom: ProfessionalTheme.spacing.xs,
    borderWidth: 1,
    borderColor: ProfessionalTheme.colors.border,
    minHeight: 70,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ProfessionalTheme.colors.border,
    marginRight: ProfessionalTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkedCheckbox: {
    borderColor: ProfessionalTheme.colors.info,
    backgroundColor: ProfessionalTheme.colors.info,
  },

  checkboxIcon: {
    fontSize: 12,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontWeight: '600',
  },

  listItemImage: {
    width: 50,
    height: 50,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  listImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ProfessionalTheme.spacing.sm,
  },

  listImagePlaceholderText: {
    fontSize: 20,
  },

  listItemDetails: {
    flex: 2,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  listItemName: {
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
    flex: 1,
  },

  listAvailabilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ProfessionalTheme.borderRadius.sm,
  },

  listAvailabilityText: {
    ...ProfessionalTheme.typography.caption,
    fontSize: 8,
    fontWeight: '600',
  },

  listItemDescription: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    marginBottom: 4,
  },

  listItemMeta: {
    flexDirection: 'row',
    gap: ProfessionalTheme.spacing.sm,
  },

  categoryText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textLight,
    fontSize: 10,
  },

  prepTimeText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textLight,
    fontSize: 10,
  },

  dietaryText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.warning,
    fontSize: 10,
  },

  priceColumn: {
    width: 80,
    alignItems: 'center',
    marginRight: ProfessionalTheme.spacing.sm,
  },

  listItemPrice: {
    ...ProfessionalTheme.typography.body2,
    fontWeight: '700',
  },

  statsColumn: {
    width: 70,
    marginRight: ProfessionalTheme.spacing.sm,
  },

  statLabel: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
    fontSize: 9,
  },

  statValue: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
    fontSize: 10,
    marginBottom: 2,
  },

  ratingColumn: {
    width: 60,
    alignItems: 'center',
    marginRight: ProfessionalTheme.spacing.sm,
  },

  ratingStars: {
    fontSize: 10,
    color: ProfessionalTheme.colors.warning,
    marginBottom: 2,
  },

  ratingValue: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.text,
    fontWeight: '600',
    fontSize: 10,
  },

  actionsColumn: {
    width: 100,
    gap: 2,
  },

  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ProfessionalTheme.borderRadius.sm,
    alignItems: 'center',
  },

  editActionButton: {
    backgroundColor: ProfessionalTheme.colors.info,
  },

  duplicateActionButton: {
    backgroundColor: ProfessionalTheme.colors.primary,
  },

  toggleActionButton: {
    backgroundColor: ProfessionalTheme.colors.warning,
  },

  actionButtonText: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textOnPrimary,
    fontSize: 9,
    fontWeight: '600',
  },
});