/**
 * OrderCart - Right panel for cart and order actions
 * Displays cart items, totals, and action buttons
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ExtendedOrderItem } from '@/types/order-extended.types';

interface OrderCartProps {
  items: ExtendedOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  tableName: string;
  guestCount?: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: ExtendedOrderItem) => void;
  onClearCart: () => void;
  onSendToKitchen: () => void;
  isSubmitting?: boolean;
}

interface CartItemRowProps {
  item: ExtendedOrderItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onEdit: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = React.memo(
  ({ item, onUpdateQuantity, onRemove, onEdit }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xs,
      },
      nameContainer: {
        flex: 1,
        marginRight: theme.spacing.sm,
      },
      name: {
        ...theme.typography.body2,
        fontWeight: '600',
        color: theme.colors.onSurface,
      },
      price: {
        ...theme.typography.body2,
        fontWeight: '600',
        color: theme.colors.primary,
      },
      modifiers: {
        marginTop: 4,
      },
      modifier: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
        marginLeft: theme.spacing.sm,
      },
      notes: {
        ...theme.typography.caption,
        color: theme.colors.warning,
        fontStyle: 'italic',
        marginTop: 4,
      },
      footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
      },
      quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: theme.borderRadius.sm,
      },
      quantityButton: {
        padding: theme.spacing.xs,
      },
      quantity: {
        ...theme.typography.body2,
        fontWeight: '600',
        color: theme.colors.onSurface,
        minWidth: 24,
        textAlign: 'center',
      },
      actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
      },
      actionButton: {
        padding: theme.spacing.xs,
      },
      itemTotal: {
        ...theme.typography.body2,
        fontWeight: '700',
        color: theme.colors.primary,
      },
    });

    const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.selectedModifiers && item.selectedModifiers.length > 0 && (
              <View style={styles.modifiers}>
                {item.selectedModifiers.map((mod, index) => (
                  <Text key={index} style={styles.modifier}>
                    + {mod.name}
                    {mod.priceAdjustment > 0 && ` (+${formatPrice(mod.priceAdjustment)})`}
                  </Text>
                ))}
              </View>
            )}
            {item.notes && (
              <Text style={styles.notes} numberOfLines={1}>
                Note: {item.notes}
              </Text>
            )}
          </View>
          <Text style={styles.price}>{formatPrice(item.unitPrice)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.quantity - 1)}
            >
              <MaterialCommunityIcons
                name="minus"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onRemove}>
              <MaterialCommunityIcons
                name="delete"
                size={18}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemTotal}>{formatPrice(item.totalPrice)}</Text>
        </View>
      </View>
    );
  }
);

CartItemRow.displayName = 'CartItemRow';

export const OrderCart: React.FC<OrderCartProps> = ({
  items,
  subtotal,
  taxAmount,
  discountAmount,
  total,
  tableName,
  guestCount,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onClearCart,
  onSendToKitchen,
  isSubmitting = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surfaceLight,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.outline,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tableInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tableIcon: {
      marginRight: theme.spacing.xs,
    },
    tableName: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
    },
    guestCount: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    itemCount: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginTop: theme.spacing.xs,
    },
    listContainer: {
      flex: 1,
      padding: theme.spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    summary: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    summaryValue: {
      ...theme.typography.body2,
      color: theme.colors.onSurface,
    },
    discountRow: {
      backgroundColor: theme.colors.successContainer,
      marginHorizontal: -theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    discountLabel: {
      ...theme.typography.body2,
      color: theme.colors.success,
    },
    discountValue: {
      ...theme.typography.body2,
      color: theme.colors.success,
      fontWeight: '600',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      marginTop: theme.spacing.xs,
    },
    totalLabel: {
      ...theme.typography.h3,
      color: theme.colors.onSurface,
    },
    totalValue: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    actions: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    sendButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.outline,
    },
    sendButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
    secondaryActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    secondaryButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceLight,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    secondaryButtonText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginLeft: theme.spacing.xs,
    },
  });

  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const renderItem = useCallback(
    ({ item }: { item: ExtendedOrderItem }) => (
      <CartItemRow
        item={item}
        onUpdateQuantity={(quantity) => onUpdateQuantity(item.id, quantity)}
        onRemove={() => onRemoveItem(item.id)}
        onEdit={() => onEditItem(item)}
      />
    ),
    [onUpdateQuantity, onRemoveItem, onEditItem]
  );

  const keyExtractor = useCallback((item: ExtendedOrderItem) => item.id, []);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="cart-outline"
          size={64}
          color={theme.colors.onSurfaceVariant}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyText}>
          Cart is empty{'\n'}Select items from the menu
        </Text>
      </View>
    ),
    [theme, styles]
  );

  const isEmpty = items.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.tableInfo}>
            <MaterialCommunityIcons
              name="table-furniture"
              size={24}
              color={theme.colors.primary}
              style={styles.tableIcon}
            />
            <View>
              <Text style={styles.tableName}>{tableName}</Text>
              {guestCount !== undefined && guestCount > 0 && (
                <Text style={styles.guestCount}>
                  {guestCount} guest{guestCount !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
          {!isEmpty && (
            <TouchableOpacity style={styles.clearButton} onPress={onClearCart}>
              <MaterialCommunityIcons
                name="delete-sweep"
                size={24}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.itemCount}>
          {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
        </Text>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {!isEmpty && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={[styles.summaryRow, styles.discountRow]}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>-{formatPrice(discountAmount)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatPrice(taxAmount)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.sendButton, isEmpty && styles.sendButtonDisabled]}
          onPress={onSendToKitchen}
          disabled={isEmpty || isSubmitting}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={theme.colors.onPrimary}
          />
          <Text style={styles.sendButtonText}>
            {isSubmitting ? 'Sending...' : 'Send to Kitchen'}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton}>
            <MaterialCommunityIcons
              name="content-save"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.secondaryButtonText}>Save Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <MaterialCommunityIcons
              name="printer"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.secondaryButtonText}>Print</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OrderCart;
