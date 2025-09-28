import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAvailabilityColor = () => {
    return item.is_available ? theme.colors.success : theme.colors.error;
  };

  const getAvailabilityBgColor = () => {
    return item.is_available ? theme.colors.successLight : theme.colors.errorLight;
  };

  const getRatingStars = (rating: number) => {
    const stars = Math.round(rating);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const styles = StyleSheet.create({
    // Grid View Styles
    gridCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginHorizontal: '1%',
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      minHeight: 280,
    },

    selectedCard: {
      borderColor: theme.colors.info,
      backgroundColor: theme.colors.infoLight,
    },

    selectionIndicator: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },

    selectedIndicator: {
      borderColor: theme.colors.info,
      backgroundColor: theme.colors.info,
    },

    selectionIcon: {
      fontSize: 12,
      color: theme.colors.onSurfaceOnPrimary,
      fontWeight: '600',
    },

    availabilityBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },

    availabilityText: {
      ...theme.typography.caption,
      fontSize: 8,
      fontWeight: '600',
    },

    itemImage: {
      width: '100%',
      height: 80,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },

    imagePlaceholder: {
      width: '100%',
      height: 80,
      backgroundColor: theme.colors.outlineLight,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },

    imagePlaceholderText: {
      fontSize: 24,
    },

    gridItemInfo: {
      flex: 1,
    },

    itemName: {
      ...theme.typography.label,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },

    disabledText: {
      color: theme.colors.onSurfaceSecondary,
    },

    itemDescription: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
      lineHeight: 14,
    },

    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },

    itemPrice: {
      ...theme.typography.body1,
      fontWeight: '700',
    },

    prepTime: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
    },

    quickStats: {
      marginBottom: theme.spacing.sm,
    },

    statText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 10,
      marginBottom: 2,
    },

    gridActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },

    gridActionButton: {
      flex: 1,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },

    editButton: {
      backgroundColor: theme.colors.info,
    },

    toggleButton: {
      backgroundColor: theme.colors.warning,
    },

    gridActionText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceOnPrimary,
      fontSize: 10,
      fontWeight: '600',
    },

    // List View Styles
    listCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      minHeight: 70,
    },

    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },

    checkedCheckbox: {
      borderColor: theme.colors.info,
      backgroundColor: theme.colors.info,
    },

    checkboxIcon: {
      fontSize: 12,
      color: theme.colors.onSurfaceOnPrimary,
      fontWeight: '600',
    },

    listItemImage: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
    },

    listImagePlaceholder: {
      width: 50,
      height: 50,
      backgroundColor: theme.colors.outlineLight,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },

    listImagePlaceholderText: {
      fontSize: 20,
    },

    listItemDetails: {
      flex: 2,
      marginRight: theme.spacing.sm,
    },

    listItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },

    listItemName: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      fontWeight: '600',
      flex: 1,
    },

    listAvailabilityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },

    listAvailabilityText: {
      ...theme.typography.caption,
      fontSize: 8,
      fontWeight: '600',
    },

    listItemDescription: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: 4,
    },

    listItemMeta: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },

    categoryText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceLight,
      fontSize: 10,
    },

    prepTimeText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceLight,
      fontSize: 10,
    },

    dietaryText: {
      ...theme.typography.caption,
      color: theme.colors.warning,
      fontSize: 10,
    },

    priceColumn: {
      width: 80,
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },

    listItemPrice: {
      ...theme.typography.body2,
      fontWeight: '700',
    },

    statsColumn: {
      width: 70,
      marginRight: theme.spacing.sm,
    },

    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceSecondary,
      fontSize: 9,
    },

    statValue: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
      fontWeight: '600',
      fontSize: 10,
      marginBottom: 2,
    },

    ratingColumn: {
      width: 60,
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },

    ratingStars: {
      fontSize: 10,
      color: theme.colors.warning,
      marginBottom: 2,
    },

    ratingValue: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
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
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },

    editActionButton: {
      backgroundColor: theme.colors.info,
    },

    duplicateActionButton: {
      backgroundColor: theme.colors.primary,
    },

    toggleActionButton: {
      backgroundColor: theme.colors.warning,
    },

    actionButtonText: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceOnPrimary,
      fontSize: 9,
      fontWeight: '600',
    },
  });

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
        <Text style={[styles.statValue, { color: theme.colors.success }]}>
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