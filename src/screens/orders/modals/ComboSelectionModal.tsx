/**
 * ComboSelectionModal - Select combo deal items and substitutions
 *
 * Features:
 * - Display combo items with menu item details
 * - Allow substitutions when available
 * - Show price adjustments for substitutions
 * - Summary with total combo price
 *
 * Uses proper types from menu-management-extended.types
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useMenuContext } from '@/context/menu';
import {
  ComboDeal,
  ComboItem,
  ComboItemCategory,
} from '@/types/menu-management-extended.types';
import { MenuItem } from '@/types/menu.types';

// ============== LOCAL TYPES FOR MODAL STATE ==============

/**
 * Tracks user's selection for each combo item
 * - Uses original menu_item_id or a substituted one
 */
export interface ComboItemSelection {
  comboItemId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  priceAdjustment: number;
  isSubstitution: boolean;
  itemCategory: ComboItemCategory;
}

export interface ComboSelectionResult {
  combo: ComboDeal;
  selections: ComboItemSelection[];
  totalPrice: number;
  totalQuantity: number;
}

export interface ComboSelectionModalProps {
  visible: boolean;
  combo: ComboDeal | null;
  onConfirm: (result: ComboSelectionResult) => void;
  onCancel: () => void;
}

// ============== COMPONENT ==============

export const ComboSelectionModal: React.FC<ComboSelectionModalProps> = ({
  visible,
  combo,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const menuContext = useMenuContext();

  // Get menu items from context to lookup details
  const menuItems = menuContext.menuItemsExtended || [];

  // Track selections for each combo item (keyed by combo_item.id)
  const [selections, setSelections] = useState<Map<string, ComboItemSelection>>(new Map());

  // Quantity for entire combo (how many combos to order)
  const [comboQuantity, setComboQuantity] = useState(1);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      marginTop: 60,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
    },
    header: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerContent: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
    },
    headerSubtitle: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginTop: theme.spacing.xs,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    originalPrice: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textDecorationLine: 'line-through',
      marginRight: theme.spacing.sm,
    },
    comboPrice: {
      ...theme.typography.h4,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    savingsBadge: {
      backgroundColor: theme.colors.successContainer || '#E8F5E9',
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginLeft: theme.spacing.sm,
    },
    savingsText: {
      ...theme.typography.caption,
      color: theme.colors.success,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    itemCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceVariant,
    },
    itemImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemContent: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    itemName: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    itemDescription: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    itemCategory: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
      marginTop: 4,
    },
    quantityBadge: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
    },
    substitutionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    substitutionTitle: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      marginLeft: theme.spacing.xs,
    },
    substitutionOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginLeft: theme.spacing.lg,
    },
    substitutionOptionSelected: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: theme.borderRadius.sm,
      marginHorizontal: theme.spacing.md,
    },
    substitutionName: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
      flex: 1,
    },
    priceAdjustment: {
      ...theme.typography.body2,
      color: theme.colors.error,
      fontWeight: '600',
    },
    checkCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    checkCircleSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    quantitySection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    quantityLabel: {
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      marginRight: theme.spacing.md,
    },
    quantityButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityValue: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      marginHorizontal: theme.spacing.md,
      minWidth: 32,
      textAlign: 'center',
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    totalLabel: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
    },
    totalAmount: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    cancelButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSurface,
    },
    confirmButton: {
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    confirmButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyStateText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
  });

  // Helper: Get menu item details by ID
  const getMenuItem = useCallback((menuItemId: string): MenuItem | undefined => {
    return menuItems.find(item => item.id === menuItemId);
  }, [menuItems]);

  // Helper: Get category label
  const getCategoryLabel = (category: ComboItemCategory): string => {
    const labels: Record<ComboItemCategory, string> = {
      main: 'Main Course',
      side: 'Side',
      drink: 'Drink',
      dessert: 'Dessert',
      addon: 'Add-on',
    };
    return labels[category] || category;
  };

  // Initialize selections when combo changes
  useEffect(() => {
    if (visible && combo && combo.combo_items) {
      const initialSelections = new Map<string, ComboItemSelection>();

      combo.combo_items.forEach((comboItem) => {
        const menuItem = comboItem.menu_item_id
          ? getMenuItem(comboItem.menu_item_id)
          : undefined;

        initialSelections.set(comboItem.id, {
          comboItemId: comboItem.id,
          menuItemId: comboItem.menu_item_id || '',
          menuItemName: menuItem?.name || `Choose ${getCategoryLabel(comboItem.item_category)}`,
          quantity: comboItem.quantity,
          priceAdjustment: comboItem.price_override || 0,
          isSubstitution: false,
          itemCategory: comboItem.item_category,
        });
      });

      setSelections(initialSelections);
      setComboQuantity(1);
    }
  }, [visible, combo, getMenuItem]);

  // Handle substitution selection
  const handleSubstitutionSelect = useCallback((
    comboItem: ComboItem,
    substituteMenuItemId: string,
    priceAdjustment: number = 0
  ) => {
    const menuItem = getMenuItem(substituteMenuItemId);
    if (!menuItem) return;

    setSelections(prev => {
      const newSelections = new Map(prev);
      newSelections.set(comboItem.id, {
        comboItemId: comboItem.id,
        menuItemId: substituteMenuItemId,
        menuItemName: menuItem.name,
        quantity: comboItem.quantity,
        priceAdjustment,
        isSubstitution: substituteMenuItemId !== comboItem.menu_item_id,
        itemCategory: comboItem.item_category,
      });
      return newSelections;
    });
  }, [getMenuItem]);

  // Handle quantity change
  const handleQuantityChange = useCallback((delta: number) => {
    setComboQuantity(prev => Math.max(1, prev + delta));
  }, []);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!combo) return 0;

    let basePrice = combo.combo_price;

    // Add any price adjustments from substitutions
    selections.forEach(sel => {
      basePrice += sel.priceAdjustment;
    });

    return basePrice * comboQuantity;
  }, [combo, selections, comboQuantity]);

  // Check if all selections are complete
  const isComplete = useMemo(() => {
    if (!combo || !combo.combo_items) return false;

    // All combo items must have a valid selection
    return combo.combo_items.every(item => {
      const selection = selections.get(item.id);
      return selection && selection.menuItemId;
    });
  }, [combo, selections]);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (!combo || !isComplete) return;

    const result: ComboSelectionResult = {
      combo,
      selections: Array.from(selections.values()),
      totalPrice,
      totalQuantity: comboQuantity,
    };

    onConfirm(result);
  }, [combo, selections, totalPrice, comboQuantity, isComplete, onConfirm]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (!combo) return null;

  const savings = combo.regular_price - combo.combo_price;

  // Group combo items by category
  const itemsByCategory = useMemo(() => {
    const groups: Record<string, ComboItem[]> = {};
    if (combo?.combo_items) {
      combo.combo_items.forEach(item => {
        const category = item.item_category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      });
    }
    return groups;
  }, [combo]);

  // Render a combo item row
  const renderComboItem = (comboItem: ComboItem) => {
    const selection = selections.get(comboItem.id);
    const menuItem = comboItem.menu_item_id ? getMenuItem(comboItem.menu_item_id) : undefined;
    const isSelected = selection && selection.menuItemId === comboItem.menu_item_id;

    return (
      <View key={comboItem.id}>
        {/* Main item */}
        <TouchableOpacity
          style={[styles.itemCard, isSelected && styles.itemCardSelected]}
          onPress={() => {
            if (comboItem.menu_item_id) {
              handleSubstitutionSelect(comboItem, comboItem.menu_item_id, 0);
            }
          }}
          activeOpacity={0.7}
        >
          {menuItem?.image_url ? (
            <Image source={{ uri: menuItem.image_url }} style={styles.itemImage} />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <MaterialCommunityIcons
                name="food"
                size={28}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>
              {menuItem?.name || `Choose ${getCategoryLabel(comboItem.item_category)}`}
            </Text>
            {menuItem?.description && (
              <Text style={styles.itemDescription} numberOfLines={1}>
                {menuItem.description}
              </Text>
            )}
            {comboItem.quantity > 1 && (
              <Text style={styles.quantityBadge}>Qty: {comboItem.quantity}</Text>
            )}
          </View>
          {comboItem.menu_item_id && (
            <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
              {isSelected && (
                <MaterialCommunityIcons name="check" size={14} color={theme.colors.onPrimary} />
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Substitution options if available */}
        {comboItem.is_substitutable && comboItem.substitution_options && comboItem.substitution_options.length > 0 && (
          <>
            <View style={styles.substitutionHeader}>
              <MaterialCommunityIcons
                name="swap-horizontal"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.substitutionTitle}>Or substitute with:</Text>
            </View>
            {comboItem.substitution_options.map(subId => {
              const subMenuItem = getMenuItem(subId);
              if (!subMenuItem) return null;

              const isSubSelected = selection?.menuItemId === subId;
              // Calculate price difference (substitute price - original price, if any)
              const originalMenuItem = comboItem.menu_item_id ? getMenuItem(comboItem.menu_item_id) : undefined;
              const priceDiff = originalMenuItem
                ? subMenuItem.price - originalMenuItem.price
                : subMenuItem.price;

              return (
                <TouchableOpacity
                  key={subId}
                  style={[
                    styles.substitutionOption,
                    isSubSelected && styles.substitutionOptionSelected,
                  ]}
                  onPress={() => handleSubstitutionSelect(comboItem, subId, priceDiff > 0 ? priceDiff : 0)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkCircle, isSubSelected && styles.checkCircleSelected]}>
                    {isSubSelected && (
                      <MaterialCommunityIcons name="check" size={14} color={theme.colors.onPrimary} />
                    )}
                  </View>
                  <Text style={styles.substitutionName}>{subMenuItem.name}</Text>
                  {priceDiff > 0 && (
                    <Text style={styles.priceAdjustment}>+{formatCurrency(priceDiff)}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{combo.name}</Text>
                {combo.description && (
                  <Text style={styles.headerSubtitle}>{combo.description}</Text>
                )}
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>{formatCurrency(combo.regular_price)}</Text>
              <Text style={styles.comboPrice}>{formatCurrency(combo.combo_price)}</Text>
              {savings > 0 && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save {formatCurrency(savings)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Combo Items */}
          <ScrollView style={styles.content}>
            {!combo.combo_items || combo.combo_items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No items in this combo
                </Text>
              </View>
            ) : (
              Object.entries(itemsByCategory).map(([category, items]) => (
                <View key={category}>
                  <Text style={styles.sectionTitle}>
                    {getCategoryLabel(category as ComboItemCategory)} ({items.length})
                  </Text>
                  {items.map(renderComboItem)}
                </View>
              ))
            )}
          </ScrollView>

          {/* Quantity Section */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>How many combos?</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
              disabled={comboQuantity <= 1}
            >
              <MaterialCommunityIcons
                name="minus"
                size={20}
                color={comboQuantity <= 1 ? theme.colors.outline : theme.colors.onSurface}
              />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{comboQuantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalPrice)}</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <MaterialCommunityIcons name="check" size={20} color={theme.colors.onPrimary} />
                <Text style={styles.confirmButtonText}>Add to Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default ComboSelectionModal;
