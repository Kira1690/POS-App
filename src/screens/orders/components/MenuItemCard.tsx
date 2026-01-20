/**
 * MenuItemCard - Card component for displaying menu items
 * Shows item info, price, dietary tags, and allergen warnings
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { MenuItemExtended, DIETARY_TAGS_CONFIG, DietaryTag } from '@/types/menu-management-extended.types';

interface MenuItemCardProps {
  item: MenuItemExtended;
  onPress: (item: MenuItemExtended) => void;
  isCompact?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(
  ({ item, onPress, isCompact = false }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        overflow: 'hidden',
        margin: theme.spacing.xs,
        flex: 1,
        minWidth: isCompact ? 150 : 200,
        maxWidth: isCompact ? 180 : 250,
      },
      unavailable: {
        opacity: 0.5,
      },
      imageContainer: {
        height: isCompact ? 80 : 120,
        backgroundColor: theme.colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      content: {
        padding: theme.spacing.sm,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xs,
      },
      name: {
        ...theme.typography.body1,
        fontWeight: '600',
        color: theme.colors.onSurface,
        flex: 1,
        marginRight: theme.spacing.xs,
      },
      price: {
        ...theme.typography.body1,
        fontWeight: '700',
        color: theme.colors.primary,
      },
      description: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
        marginBottom: theme.spacing.xs,
        lineHeight: 16,
      },
      footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
      },
      tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        flex: 1,
      },
      tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.xs,
      },
      tagText: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.onSurfaceVariant,
        marginLeft: 2,
      },
      allergenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.errorContainer,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.xs,
      },
      allergenText: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.error,
        marginLeft: 2,
      },
      modifierIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
      },
      modifierText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        marginLeft: 4,
      },
      unavailableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      unavailableText: {
        ...theme.typography.body2,
        color: theme.colors.onError,
        backgroundColor: theme.colors.error,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        fontWeight: '600',
      },
    });

    const formatPrice = (price: number): string => {
      return `$${price.toFixed(2)}`;
    };

    const renderDietaryTags = () => {
      if (!item.dietary_tags || item.dietary_tags.length === 0) return null;

      return item.dietary_tags.slice(0, 3).map((tag) => {
        const tagInfo = DIETARY_TAGS_CONFIG[tag as DietaryTag];
        if (!tagInfo) return null;

        return (
          <View key={tag} style={styles.tag}>
            <MaterialCommunityIcons
              name={tagInfo.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={12}
              color={theme.colors.success}
            />
            <Text style={styles.tagText}>{tagInfo.shortLabel}</Text>
          </View>
        );
      });
    };

    const renderAllergenWarning = () => {
      if (!item.allergens || item.allergens.length === 0) return null;

      return (
        <View style={styles.allergenBadge}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={12}
            color={theme.colors.error}
          />
          <Text style={styles.allergenText}>
            {item.allergens.length} allergen{item.allergens.length > 1 ? 's' : ''}
          </Text>
        </View>
      );
    };

    // Check if item has modifier groups WITH options (not just empty groups)
    const hasModifiers = item.modifier_groups?.some(
      (group) => group.options && group.options.length > 0
    ) ?? false;
    const isAvailable = item.is_available !== false;

    return (
      <TouchableOpacity
        style={[styles.container, !isAvailable && styles.unavailable]}
        onPress={() => isAvailable && onPress(item)}
        activeOpacity={isAvailable ? 0.7 : 1}
        disabled={!isAvailable}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.imageContainer, styles.placeholderImage]}>
              <MaterialCommunityIcons
                name="food"
                size={40}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
          </View>

          {!isCompact && item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.tagsRow}>
              {renderDietaryTags()}
              {renderAllergenWarning()}
            </View>
          </View>

          {hasModifiers && (
            <View style={styles.modifierIndicator}>
              <MaterialCommunityIcons
                name="tune-variant"
                size={14}
                color={theme.colors.primary}
              />
              <Text style={styles.modifierText}>Customizable</Text>
            </View>
          )}
        </View>

        {!isAvailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

MenuItemCard.displayName = 'MenuItemCard';

export default MenuItemCard;
