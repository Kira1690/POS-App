/**
 * ComboGridSection Component
 * Displays combo deals in a grid layout for the POS ordering screen
 * Optimized for tablet displays with touch-friendly cards
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ComboDeal } from '@/types/menu-management-extended.types';
import { formatPrice } from '@/utils/currency';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { cardDimensions, iconSizes, elevations } from '@/design-system/theme/layout';

interface ComboGridSectionProps {
  combos: ComboDeal[];
  onComboPress: (combo: ComboDeal) => void;
}

export const ComboGridSection: React.FC<ComboGridSectionProps> = ({
  combos,
  onComboPress,
}) => {
  const { theme } = useTheme();

  // Filter to only active combos
  const activeCombos = useMemo(() => {
    return (combos || []).filter(combo => combo.is_active);
  }, [combos]);

  const renderComboCard = useCallback(({ item: combo }: { item: ComboDeal }) => {
    const savingsPercent = Math.round(combo.savings_percentage);

    const styles = StyleSheet.create({
      card: {
        flex: 1,
        margin: spacing.xs,
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        overflow: 'hidden',
        minHeight: cardDimensions.menuItemCard.defaultHeight + 20,
      },
      imageContainer: {
        width: '100%',
        height: 100,
        backgroundColor: theme.colors.surfaceLight,
        position: 'relative',
      },
      image: {
        width: '100%',
        height: '100%',
      },
      savingsBadge: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: theme.colors.success,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: borderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      savingsText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.white,
      },
      placeholderImage: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryContainer,
      },
      content: {
        padding: spacing.sm,
      },
      comboName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: spacing.xs / 2,
      },
      description: {
        fontSize: 11,
        color: theme.colors.onSurfaceSecondary,
        marginBottom: spacing.sm,
        lineHeight: 15,
      },
      priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
      },
      priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.xs,
      },
      comboPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
      },
      regularPrice: {
        fontSize: 12,
        color: theme.colors.onSurfaceSecondary,
        textDecorationLine: 'line-through',
      },
      itemCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      itemCountText: {
        fontSize: 11,
        color: theme.colors.onSurfaceSecondary,
      },
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onComboPress(combo)}
        activeOpacity={0.7}
        accessibilityLabel={`${combo.name}, ${formatPrice(combo.combo_price)}, save ${savingsPercent}%`}
        accessibilityRole="button"
      >
        {/* Image or Placeholder */}
        <View style={styles.imageContainer}>
          {combo.image_url ? (
            <Image
              source={{ uri: combo.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons
                name="food"
                size={40}
                color={theme.colors.onPrimaryContainer}
              />
            </View>
          )}

          {/* Savings Badge */}
          <View style={styles.savingsBadge}>
            <MaterialCommunityIcons
              name="tag"
              size={12}
              color={theme.colors.white}
            />
            <Text style={styles.savingsText}>
              Save {savingsPercent}%
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.comboName} numberOfLines={1}>
            {combo.name}
          </Text>

          {combo.description && (
            <Text style={styles.description} numberOfLines={2}>
              {combo.description}
            </Text>
          )}

          {/* Price Row */}
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.comboPrice}>
                {formatPrice(combo.combo_price)}
              </Text>
              <Text style={styles.regularPrice}>
                {formatPrice(combo.regular_price)}
              </Text>
            </View>

            <View style={styles.itemCount}>
              <MaterialCommunityIcons
                name="package-variant"
                size={iconSizes.sm}
                color={theme.colors.onSurfaceSecondary}
              />
              <Text style={styles.itemCountText}>
                {combo.combo_items.length} items
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [theme, onComboPress]);

  const keyExtractor = useCallback((item: ComboDeal) => item.id, []);

  const styles = StyleSheet.create({
    container: {
      marginTop: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    headerCount: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginLeft: spacing.xs,
    },
    listContent: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing['3xl'],
    },
    emptyIcon: {
      marginBottom: spacing.md,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
    },
  });

  if (activeCombos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="package-variant"
                size={iconSizes.md}
                color={theme.colors.onPrimaryContainer}
              />
            </View>
            <Text style={styles.headerTitle}>Combo Deals</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={48}
            color={theme.colors.onSurfaceSecondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>
            No combo deals available at this time
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="package-variant"
              size={iconSizes.md}
              color={theme.colors.onPrimaryContainer}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              Combo Deals
              <Text style={styles.headerCount}>({activeCombos.length})</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Combo Grid */}
      <FlatList
        data={activeCombos}
        renderItem={renderComboCard}
        keyExtractor={keyExtractor}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={9}
        windowSize={5}
      />
    </View>
  );
};

export default ComboGridSection;
