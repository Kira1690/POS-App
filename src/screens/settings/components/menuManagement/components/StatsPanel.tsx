/**
 * StatsPanel Component
 * Right panel showing selected item details and menu statistics
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';
import { MenuItemExtended } from '@/types/menu-management-extended.types';
import { CategoryWithStats } from '@/types/menu-management.types';

interface StatsPanelProps {
  selectedItem: MenuItemExtended | null;
  selectedCategory: CategoryWithStats | null;
  totalItems: number;
  totalCategories: number;
  availableItems: number;
  unavailableItems: number;
  onEditItem?: () => void;
  onDeleteItem?: () => void;
  onDuplicateItem?: () => void;
  onToggleAvailability?: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  selectedItem,
  selectedCategory,
  totalItems,
  totalCategories,
  availableItems,
  unavailableItems,
  onEditItem,
  onDeleteItem,
  onDuplicateItem,
  onToggleAvailability,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: 280,
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.outline,
      flexDirection: 'column',
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    scrollContent: {
      flex: 1,
    },
    statsSection: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.colors.surfaceLight,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    itemSection: {
      padding: theme.spacing.md,
    },
    itemImageContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      marginBottom: theme.spacing.md,
    },
    itemImage: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    itemPrice: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    itemDescription: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 18,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      gap: theme.spacing.xs,
    },
    availableBadge: {
      backgroundColor: theme.colors.success + '20',
    },
    unavailableBadge: {
      backgroundColor: theme.colors.error + '20',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    availableText: {
      color: theme.colors.success,
    },
    unavailableText: {
      color: theme.colors.error,
    },
    detailsGrid: {
      gap: theme.spacing.sm,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      width: 80,
    },
    detailValue: {
      fontSize: 12,
      color: theme.colors.onSurface,
      fontWeight: '500',
      flex: 1,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: theme.spacing.sm,
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
    actionsSection: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    primaryAction: {
      backgroundColor: theme.colors.primary,
    },
    secondaryAction: {
      backgroundColor: theme.colors.surfaceLight,
    },
    dangerAction: {
      backgroundColor: theme.colors.error + '20',
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    primaryActionText: {
      color: theme.colors.white,
    },
    secondaryActionText: {
      color: theme.colors.onSurface,
    },
    dangerActionText: {
      color: theme.colors.error,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const renderStats = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Menu Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCategories}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {availableItems}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {unavailableItems}
          </Text>
          <Text style={styles.statLabel}>Unavailable</Text>
        </View>
      </View>
    </View>
  );

  const renderSelectedItem = () => {
    if (!selectedItem) {
      return (
        <View style={styles.emptyState}>
          <Icon
            name="cursor-default-click-outline"
            size={48}
            color={theme.colors.onSurfaceSecondary}
            accessibilityLabel=""
          />
          <Text style={styles.emptyText}>
            Select an item to view details and quick actions
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.itemSection}>
          {/* Image */}
          <View style={styles.itemImageContainer}>
            {selectedItem.image ? (
              <Image
                source={{ uri: selectedItem.image }}
                style={styles.itemImage}
                resizeMode="cover"
                accessibilityLabel={`Image of ${selectedItem.name}`}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon
                  name="food-outline"
                  size={48}
                  color={theme.colors.onSurfaceSecondary}
                  accessibilityLabel=""
                />
              </View>
            )}
          </View>

          {/* Name & Price */}
          <Text style={styles.itemName}>{selectedItem.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(selectedItem.price)}</Text>

          {/* Status */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                selectedItem.is_available ? styles.availableBadge : styles.unavailableBadge,
              ]}
            >
              <Icon
                name={selectedItem.is_available ? 'check-circle' : 'close-circle'}
                size={14}
                color={selectedItem.is_available ? theme.colors.success : theme.colors.error}
                accessibilityLabel=""
              />
              <Text
                style={[
                  styles.statusText,
                  selectedItem.is_available ? styles.availableText : styles.unavailableText,
                ]}
              >
                {selectedItem.is_available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>

          {/* Description */}
          {selectedItem.description && (
            <Text style={styles.itemDescription}>{selectedItem.description}</Text>
          )}

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>
                {selectedCategory?.name || 'Uncategorized'}
              </Text>
            </View>
            {selectedItem.modifier_groups && selectedItem.modifier_groups.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Modifiers</Text>
                <Text style={styles.detailValue}>
                  {selectedItem.modifier_groups.length} group(s)
                </Text>
              </View>
            )}
            {selectedItem.preparation_time && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prep Time</Text>
                <Text style={styles.detailValue}>{selectedItem.preparation_time} min</Text>
              </View>
            )}
          </View>

          {/* Dietary Tags */}
          {selectedItem.dietary_tags && selectedItem.dietary_tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {selectedItem.dietary_tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={onEditItem}
            accessibilityLabel={`Edit ${selectedItem.name}`}
            accessibilityRole="button"
          >
            <Icon name="pencil" size={18} color={theme.colors.white} accessibilityLabel="" />
            <Text style={[styles.actionText, styles.primaryActionText]}>Edit Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={onToggleAvailability}
            accessibilityLabel={`Toggle availability for ${selectedItem.name}`}
            accessibilityRole="button"
          >
            <Icon
              name={selectedItem.is_available ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={theme.colors.onSurface}
              accessibilityLabel=""
            />
            <Text style={[styles.actionText, styles.secondaryActionText]}>
              {selectedItem.is_available ? 'Mark Unavailable' : 'Mark Available'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={onDuplicateItem}
            accessibilityLabel={`Duplicate ${selectedItem.name}`}
            accessibilityRole="button"
          >
            <Icon
              name="content-copy"
              size={18}
              color={theme.colors.onSurface}
              accessibilityLabel=""
            />
            <Text style={[styles.actionText, styles.secondaryActionText]}>Duplicate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerAction]}
            onPress={onDeleteItem}
            accessibilityLabel={`Delete ${selectedItem.name}`}
            accessibilityRole="button"
          >
            <Icon name="delete-outline" size={18} color={theme.colors.error} accessibilityLabel="" />
            <Text style={[styles.actionText, styles.dangerActionText]}>Delete Item</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedItem ? 'Item Details' : 'Overview'}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStats()}
        {renderSelectedItem()}
      </ScrollView>
    </View>
  );
};

export default StatsPanel;
