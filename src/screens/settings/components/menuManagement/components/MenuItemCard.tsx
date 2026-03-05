/**
 * MenuItemCard Component
 * Individual menu item card for grid view display
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@/components/common';
import { MenuItemExtended } from '@/types/menu-management-extended.types';

interface MenuItemCardProps {
  item: MenuItemExtended;
  isSelected: boolean;
  isMultiSelectMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onEditPress: () => void;
  onDeletePress: () => void;
  onAssignModifiersPress?: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isSelected,
  isMultiSelectMode,
  onPress,
  onLongPress,
  onEditPress,
  onDeletePress,
  onAssignModifiersPress,
}) => {
  const { theme } = useTheme();
  const { subheadingSize, bodySize } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor: theme.colors.surfaceLight,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceLight,
    },
    statusBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    availableBadge: {
      backgroundColor: theme.colors.success,
    },
    unavailableBadge: {
      backgroundColor: theme.colors.error,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.white,
    },
    checkboxOverlay: {
      position: 'absolute',
      top: theme.spacing.xs,
      left: theme.spacing.xs,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
      borderWidth: 2,
      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: theme.spacing.sm,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    name: {
      flex: 1,
      fontSize: subheadingSize,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    price: {
      fontSize: bodySize,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    description: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.xs,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: theme.spacing.xs,
    },
    tag: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.sm,
    },
    tagText: {
      fontSize: 10,
      color: theme.colors.onSurfaceSecondary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    modifierCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    modifierText: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
    },
    actions: {
      flexDirection: 'row',
      gap: 4,
    },
    actionButton: {
      padding: 6,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
  });

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      accessibilityLabel={`${item.name}, ${formatPrice(item.price)}, ${item.is_available ? 'available' : 'unavailable'}`}
      accessibilityRole="button"
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`Image of ${item.name}`}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon
              name="food-outline"
              size={40}
              color={theme.colors.onSurfaceSecondary}
              accessibilityLabel=""
            />
          </View>
        )}

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            item.is_available ? styles.availableBadge : styles.unavailableBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>

        {/* Multi-select Checkbox */}
        {isMultiSelectMode && (
          <View style={styles.checkboxOverlay}>
            {isSelected && (
              <Icon name="check" size={14} color={theme.colors.white} accessibilityLabel="" />
            )}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Dietary Tags */}
        {item.dietary_tags && item.dietary_tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.dietary_tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.dietary_tags.length > 3 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{item.dietary_tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.modifierCount}>
            {item.modifier_groups && item.modifier_groups.length > 0 && (
              <>
                <Icon
                  name="tune-variant"
                  size={14}
                  color={theme.colors.onSurfaceSecondary}
                  accessibilityLabel=""
                />
                <Text style={styles.modifierText}>
                  {item.modifier_groups.length} modifier{item.modifier_groups.length !== 1 ? 's' : ''}
                </Text>
              </>
            )}
          </View>

          <View style={styles.actions}>
            {onAssignModifiersPress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onAssignModifiersPress();
                }}
                accessibilityLabel={`Assign modifiers to ${item.name}`}
                accessibilityRole="button"
                testID={`btn-assign-modifiers-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon
                  name="tune-variant"
                  size={16}
                  color={theme.colors.secondary}
                  accessibilityLabel=""
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onEditPress();
              }}
              accessibilityLabel={`Edit ${item.name}`}
              accessibilityRole="button"
              testID={`btn-edit-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon
                name="pencil-outline"
                size={16}
                color={theme.colors.primary}
                accessibilityLabel=""
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onDeletePress();
              }}
              accessibilityLabel={`Delete ${item.name}`}
              accessibilityRole="button"
            >
              <Icon
                name="delete-outline"
                size={16}
                color={theme.colors.error}
                accessibilityLabel=""
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MenuItemCard;
