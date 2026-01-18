/**
 * Order Cart Panel - Professional right panel for order management
 * Running cart with real-time totals, tax calculation, and action buttons
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  IconButton,
  Button,
  Divider,
  Badge,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { UnifiedOrderItem, UnifiedOrder } from '@/types/unified-order.types';
import { Table } from '@/types/table.types';
import { useUnifiedCart } from '@/context/unified-order';
import { formatPrice } from '@/utils/currency';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { touchTargets, iconSizes, dividers, elevations } from '@/design-system/theme/layout';

interface OrderCartPanelProps {
  cart: UnifiedOrderItem[];
  cartTotal: number;
  cartItemCount: number;
  currentOrder: UnifiedOrder | null;
  table: Table;
  taxRate?: number; // Tax rate from context/settings (single source of truth)
}

// Default tax rate fallback (only used if not provided via props)
const DEFAULT_TAX_RATE = 0.0825; // 8.25% standard restaurant tax

export const OrderCartPanel: React.FC<OrderCartPanelProps> = ({
  cart,
  cartTotal,
  cartItemCount,
  currentOrder,
  table,
  taxRate = DEFAULT_TAX_RATE,
}) => {
  const theme = useTheme();
  const { updateQuantity: updateCartItemQuantity, removeItem: removeFromCart, clear: clearCart } = useUnifiedCart();

  // Calculate totals with tax (using provided tax rate as single source of truth)
  const calculations = useMemo(() => {
    const subtotal = cartTotal;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      total,
      taxPercentage: taxRate * 100,
    };
  }, [cartTotal, taxRate]);

  const renderCartItem = ({ item }: { item: UnifiedOrderItem }) => (
    <Surface
      style={[
        styles.cartItem,
        { backgroundColor: theme.colors.surfaceVariant }
      ]}
      elevation={1}
    >
      <View style={styles.cartItemHeader}>
        <View style={styles.cartItemInfo}>
          <Text
            variant="titleSmall"
            style={[
              styles.cartItemName,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            {item.name}
          </Text>

          {/* Display Modifiers */}
          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
            <View style={styles.modifiersList}>
              {item.selectedModifiers.map((modifier, modIndex) => (
                <View key={modIndex} style={styles.modifierGroup}>
                  {(modifier.options || []).map((option, optIndex) => (
                    <View key={optIndex} style={styles.modifierOption}>
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.modifierText,
                          { color: theme.colors.onSurfaceVariant }
                        ]}
                      >
                        • {option.optionName}
                        {option.quantity > 1 && ` x${option.quantity}`}
                      </Text>
                      {option.priceAdjustment !== 0 && (
                        <Text
                          variant="bodySmall"
                          style={[
                            styles.modifierPrice,
                            { color: theme.colors.outline }
                          ]}
                        >
                          +{formatPrice(option.totalPrice)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {item.specialInstructions && (
            <Text
              variant="bodySmall"
              style={[
                styles.cartItemNotes,
                { color: theme.colors.outline }
              ]}
            >
              Note: {item.specialInstructions}
            </Text>
          )}
        </View>

        {/* Remove Item Button */}
        <IconButton
          icon="close"
          size={16}
          onPress={() => removeFromCart(item.id)}
          style={styles.removeButton}
          iconColor={theme.colors.error}
        />
      </View>

      <View style={styles.cartItemActions}>
        {/* Quantity Controls */}
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => updateCartItemQuantity(item.id, item.quantity - 1)}
          >
            <MaterialIcons
              name="remove"
              size={16}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>

          <Text
            variant="titleMedium"
            style={[
              styles.quantityText,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            {item.quantity}
          </Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => updateCartItemQuantity(item.id, item.quantity + 1)}
          >
            <MaterialIcons
              name="add"
              size={16}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Item Total */}
        <View style={styles.itemTotalContainer}>
          <Text
            variant="bodySmall"
            style={[
              styles.itemPrice,
              { color: theme.colors.outline }
            ]}
          >
            {formatPrice(item.basePrice)} base
            {item.modifierTotal > 0 && ` + ${formatPrice(item.modifierTotal)} mods`}
          </Text>
          <Text
            variant="titleMedium"
            style={[
              styles.itemTotal,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            {formatPrice(item.itemTotal)}
          </Text>
        </View>
      </View>
    </Surface>
  );

  const renderOrderSummary = () => (
    <Surface 
      style={[
        styles.orderSummary,
        { backgroundColor: theme.colors.primaryContainer }
      ]}
      elevation={2}
    >
      <Text 
        variant="titleMedium"
        style={[
          styles.summaryTitle,
          { color: theme.colors.onPrimaryContainer }
        ]}
      >
        Order Summary
      </Text>
      
      <View style={styles.summaryRow}>
        <Text 
          variant="bodyMedium"
          style={[
            styles.summaryLabel,
            { color: theme.colors.onPrimaryContainer }
          ]}
        >
          Subtotal:
        </Text>
        <Text 
          variant="bodyMedium"
          style={[
            styles.summaryValue,
            { color: theme.colors.onPrimaryContainer }
          ]}
        >
          {formatPrice(calculations.subtotal)}
        </Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text 
          variant="bodyMedium"
          style={[
            styles.summaryLabel,
            { color: theme.colors.onPrimaryContainer }
          ]}
        >
          Tax ({calculations.taxPercentage.toFixed(2)}%):
        </Text>
        <Text 
          variant="bodyMedium"
          style={[
            styles.summaryValue,
            { color: theme.colors.onPrimaryContainer }
          ]}
        >
          {formatPrice(calculations.taxAmount)}
        </Text>
      </View>
      
      <Divider style={[
        styles.summaryDivider,
        { backgroundColor: theme.colors.outline }
      ]} />
      
      <View style={styles.summaryRow}>
        <Text 
          variant="titleMedium"
          style={[
            styles.totalLabel,
            { color: theme.colors.onPrimaryContainer }
          ]}
        >
          Total:
        </Text>
        <Text 
          variant="titleLarge"
          style={[
            styles.totalValue,
            { color: theme.colors.onPrimaryContainer }
          ]}
        >
          {formatPrice(calculations.total)}
        </Text>
      </View>
    </Surface>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {/* Place Order Button */}
      <Button
        mode="contained"
        style={[
          styles.actionButton,
          styles.primaryAction,
          { backgroundColor: theme.colors.primary }
        ]}
        contentStyle={styles.actionButtonContent}
        labelStyle={[
          styles.actionButtonLabel,
          { color: theme.colors.onPrimary }
        ]}
        icon="restaurant"
        disabled={cartItemCount === 0}
        onPress={() => {
          // TODO: Implement place order
          console.log('Place Order pressed');
        }}
      >
        Place Order
      </Button>

      {/* Print KOT Button */}
      <Button
        mode="contained-tonal"
        style={[
          styles.actionButton,
          { backgroundColor: theme.colors.secondaryContainer }
        ]}
        contentStyle={styles.actionButtonContent}
        labelStyle={[
          styles.actionButtonLabel,
          { color: theme.colors.onSecondaryContainer }
        ]}
        icon="print"
        disabled={cartItemCount === 0}
        onPress={() => {
          // TODO: Implement print KOT
          console.log('Print KOT pressed');
        }}
      >
        Print KOT
      </Button>

      {/* Process Payment Button */}
      <Button
        mode="contained"
        style={[
          styles.actionButton,
          { backgroundColor: theme.colors.tertiary }
        ]}
        contentStyle={styles.actionButtonContent}
        labelStyle={[
          styles.actionButtonLabel,
          { color: theme.colors.onTertiary }
        ]}
        icon="payment"
        disabled={cartItemCount === 0}
        onPress={() => {
          // TODO: Implement payment processing
          console.log('Process Payment pressed');
        }}
      >
        Process Payment
      </Button>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <MaterialIcons 
        name="shopping-cart"
        size={64}
        color={theme.colors.outline}
      />
      <Text 
        variant="titleMedium"
        style={[
          styles.emptyCartTitle,
          { color: theme.colors.onSurface }
        ]}
      >
        Your cart is empty
      </Text>
      <Text
        variant="bodyMedium"
        style={[
          styles.emptyCartDescription,
          { color: theme.colors.onSurfaceVariant }
        ]}
      >
        Add items from the menu to start building your order
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text 
            variant="titleMedium"
            style={[
              styles.orderTitle,
              { color: theme.colors.onSurface }
            ]}
          >
            Order #{currentOrder?.orderNumber || '----'}
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.tableInfo,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            Table {table.table_number} • {table.capacity} seats
          </Text>
        </View>
        
        {cartItemCount > 0 && (
          <View style={styles.headerActions}>
            <Badge 
              style={[
                styles.itemCountBadge,
                { backgroundColor: theme.colors.primary }
              ]}
            >
              {cartItemCount}
            </Badge>
            <IconButton
              icon="delete-outline"
              size={20}
              onPress={clearCart}
              iconColor={theme.colors.error}
              style={styles.clearButton}
            />
          </View>
        )}
      </View>

      <Divider style={[
        styles.headerDivider,
        { backgroundColor: theme.colors.outline }
      ]} />

      {/* Cart Content */}
      {cart.length === 0 ? (
        renderEmptyCart()
      ) : (
        <ScrollView style={styles.cartContent} showsVerticalScrollIndicator={false}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.cartItemSeparator} />}
            contentContainerStyle={styles.cartItemsList}
          />
          
          {renderOrderSummary()}
        </ScrollView>
      )}

      {/* Action Buttons */}
      {cart.length > 0 && renderActionButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  orderTitle: {
    fontWeight: '700',
  },
  tableInfo: {
    marginTop: spacing.xs / 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCountBadge: {
    marginRight: spacing.sm,
  },
  clearButton: {
    margin: 0,
  },
  headerDivider: {
    height: dividers.default,
  },

  // Cart content
  cartContent: {
    flex: 1,
  },
  cartItemsList: {
    padding: spacing.lg,
  },
  cartItemSeparator: {
    height: spacing.md,
  },

  // Cart item
  cartItem: {
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  modifiersList: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  modifierGroup: {
    marginBottom: spacing.xs / 2,
  },
  modifierOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 1,
  },
  modifierText: {
    flex: 1,
  },
  modifierPrice: {
    marginLeft: spacing.sm,
  },
  cartItemNotes: {
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  removeButton: {
    margin: 0,
    marginLeft: spacing.sm,
  },
  cartItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: touchTargets.quantityButton,
    height: touchTargets.quantityButton,
    borderRadius: touchTargets.quantityButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: spacing.lg,
    fontWeight: '600',
    minWidth: spacing['2xl'],
    textAlign: 'center',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    marginBottom: spacing.xs / 2,
  },
  itemTotal: {
    fontWeight: '700',
  },

  // Order summary
  orderSummary: {
    margin: spacing.lg,
    marginTop: spacing['2xl'],
    padding: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  summaryTitle: {
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    flex: 1,
  },
  summaryValue: {
    fontWeight: '600',
  },
  summaryDivider: {
    height: dividers.default,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalValue: {
    fontWeight: '700',
  },

  // Action buttons
  actionButtons: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  primaryAction: {
    elevation: elevations.md,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm - spacing.xs,
  },
  actionButtonLabel: {
    fontWeight: '600',
  },

  // Empty cart
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['5xl'],
  },
  emptyCartTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyCartDescription: {
    textAlign: 'center',
    lineHeight: spacing.xl,
  },
});