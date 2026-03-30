/**
 * ComboCard Component
 * Displays a single combo deal with its items and pricing
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ComboDeal } from '@/types/menu-management-extended.types';

interface ComboCardProps {
  combo: ComboDeal;
  isSelected?: boolean;
  onPress?: (combo: ComboDeal) => void;
  onEdit?: (combo: ComboDeal) => void;
  onDelete?: (combo: ComboDeal) => void;
  onToggleStatus?: (combo: ComboDeal) => void;
  onDuplicate?: (combo: ComboDeal) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({
  combo,
  isSelected = false,
  onPress,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
}) => {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(combo);
  }, [onPress, combo]);

  const handleEdit = useCallback(() => {
    onEdit?.(combo);
  }, [onEdit, combo]);

  const handleDelete = useCallback(() => {
    onDelete?.(combo);
  }, [onDelete, combo]);

  const handleToggleStatus = useCallback(() => {
    onToggleStatus?.(combo);
  }, [onToggleStatus, combo]);

  const handleDuplicate = useCallback(() => {
    onDuplicate?.(combo);
  }, [onDuplicate, combo]);

  const getAvailabilityText = () => {
    const { availability } = combo;
    if (availability.always_available) return 'Always Available';

    const parts: string[] = [];

    if (availability.days_of_week && availability.days_of_week.length < 7) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = availability.days_of_week.map(d => dayNames[d]).join(', ');
      parts.push(days);
    }

    if (availability.start_time && availability.end_time) {
      parts.push(`${availability.start_time} - ${availability.end_time}`);
    }

    if (availability.start_date && availability.end_date) {
      parts.push(`${availability.start_date} to ${availability.end_date}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'Limited Availability';
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      padding: theme.spacing.md,
    },
    imageContainer: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      marginRight: theme.spacing.md,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.xs,
      backgroundColor: combo.is_active ? theme.colors.success : theme.colors.onSurfaceSecondary,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    description: {
      fontSize: 13,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.sm,
    },
    pricingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    comboPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    regularPrice: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      textDecorationLine: 'line-through',
    },
    savingsBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.successLight,
    },
    savingsText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.success,
    },
    itemsSection: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      padding: theme.spacing.md,
    },
    itemsSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    itemsSectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
      textTransform: 'uppercase',
      marginLeft: theme.spacing.xs,
    },
    itemsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    itemChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    itemChipText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    itemChipQuantity: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
      marginLeft: theme.spacing.xs,
    },
    itemCategoryChip: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    itemCategoryText: {
      color: theme.colors.primary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    availabilityInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    availabilityText: {
      fontSize: 11,
      color: theme.colors.onSurfaceSecondary,
      marginLeft: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    actionButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    actionButtonDanger: {
      backgroundColor: theme.colors.errorLight,
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'main': return 'food';
      case 'side': return 'french-fries';
      case 'drink': return 'cup';
      case 'dessert': return 'ice-cream';
      case 'addon': return 'plus-circle';
      default: return 'food-variant';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`Combo: ${combo.name}`}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {combo.image_url ? (
            <Image source={{ uri: combo.image_url }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="food-variant"
                size={32}
                color={theme.colors.onSurfaceSecondary}
              />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.statusIndicator} />
            <Text style={styles.title} numberOfLines={1}>{combo.name}</Text>
          </View>

          {combo.description && (
            <Text style={styles.description} numberOfLines={2}>
              {combo.description}
            </Text>
          )}

          <View style={styles.pricingRow}>
            <Text style={styles.comboPrice}>${(Number(combo.combo_price) || 0).toFixed(2)}</Text>
            <Text style={styles.regularPrice}>${(Number(combo.regular_price) || 0).toFixed(2)}</Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>
                Save {(Number(combo.savings_percentage) || 0).toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.itemsSection}>
        <View style={styles.itemsSectionHeader}>
          <MaterialCommunityIcons
            name="package-variant"
            size={14}
            color={theme.colors.onSurfaceSecondary}
          />
          <Text style={styles.itemsSectionTitle}>
            Includes ({combo.combo_items.length} items)
          </Text>
        </View>
        <View style={styles.itemsList}>
          {combo.combo_items.slice(0, 5).map((item, index) => (
            <View
              key={item.id || index}
              style={[
                styles.itemChip,
                item.category_choice && styles.itemCategoryChip,
              ]}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(item.item_category)}
                size={12}
                color={item.category_choice ? theme.colors.primary : theme.colors.onSurfaceSecondary}
              />
              <Text style={[
                styles.itemChipText,
                item.category_choice && styles.itemCategoryText,
              ]}>
                {item.category_choice || `Item ${index + 1}`}
              </Text>
              {item.quantity > 1 && (
                <Text style={styles.itemChipQuantity}>x{item.quantity}</Text>
              )}
            </View>
          ))}
          {combo.combo_items.length > 5 && (
            <View style={styles.itemChip}>
              <Text style={styles.itemChipText}>
                +{combo.combo_items.length - 5} more
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.availabilityInfo}>
          <MaterialCommunityIcons
            name={combo.availability.always_available ? 'clock-check' : 'clock-alert'}
            size={14}
            color={theme.colors.onSurfaceSecondary}
          />
          <Text style={styles.availabilityText} numberOfLines={1}>
            {getAvailabilityText()}
          </Text>
        </View>

        <View style={styles.actions}>
          {onDuplicate && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDuplicate}
              accessibilityLabel="Duplicate combo"
            >
              <MaterialCommunityIcons name="content-copy" size={18} color={theme.colors.onSurfaceSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleStatus}
            accessibilityLabel={combo.is_active ? 'Deactivate' : 'Activate'}
          >
            <MaterialCommunityIcons
              name={combo.is_active ? 'eye' : 'eye-off'}
              size={18}
              color={theme.colors.onSurfaceSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEdit}
            accessibilityLabel="Edit combo"
          >
            <MaterialCommunityIcons name="pencil" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleDelete}
            accessibilityLabel="Delete combo"
          >
            <MaterialCommunityIcons name="delete" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ComboCard;
