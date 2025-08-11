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

import { CartItem } from '@/context/order/OrderContext';
import { Order } from '@/types/order.types';
import { Table } from '@/types/table.types';
import { useOrder } from '@/context/order/OrderContext';

interface OrderCartPanelProps {
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  currentOrder: Order | null;
  table: Table;
}

// Tax rate configuration (should come from restaurant settings)
const TAX_RATE = 0.0825; // 8.25% standard restaurant tax

export const OrderCartPanel: React.FC<OrderCartPanelProps> = ({
  cart,
  cartTotal,
  cartItemCount,
  currentOrder,
  table,
}) => {
  const theme = useTheme();
  const { updateCartItem, removeFromCart, clearCart } = useOrder();

  // Calculate totals with tax
  const calculations = useMemo(() => {
    const subtotal = cartTotal;
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + taxAmount;
    
    return {
      subtotal,
      taxAmount,
      total,
      taxPercentage: TAX_RATE * 100,
    };
  }, [cartTotal]);

  const renderCartItem = ({ item }: { item: CartItem }) => (
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
          
          {item.notes && (
            <Text 
              variant="bodySmall"
              style={[
                styles.cartItemNotes,
                { color: theme.colors.onSurfaceVariant + 'CC' }
              ]}
            >
              Note: {item.notes}
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
            onPress={() => updateCartItem(item.id, item.quantity - 1)}
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
            onPress={() => updateCartItem(item.id, item.quantity + 1)}
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
              { color: theme.colors.onSurfaceVariant + 'CC' }
            ]}
          >
            ₹{item.price.toFixed(2)} each
          </Text>
          <Text 
            variant="titleMedium"
            style={[
              styles.itemTotal,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            ₹{(item.price * item.quantity).toFixed(2)}
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
          ₹{calculations.subtotal.toFixed(2)}
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
          ₹{calculations.taxAmount.toFixed(2)}
        </Text>
      </View>
      
      <Divider style={[
        styles.summaryDivider,
        { backgroundColor: theme.colors.onPrimaryContainer + '40' }
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
          ₹{calculations.total.toFixed(2)}
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
          { color: theme.colors.onSurface + 'AA' }
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
            Order #{currentOrder?.order_number || '----'}
          </Text>
          <Text 
            variant="bodySmall"
            style={[
              styles.tableInfo,
              { color: theme.colors.onSurface + 'CC' }
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerInfo: {
    flex: 1,
  },
  orderTitle: {
    fontWeight: '700',
  },
  tableInfo: {
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCountBadge: {
    marginRight: 8,
  },
  clearButton: {
    margin: 0,
  },
  headerDivider: {
    height: 1,
  },

  // Cart content
  cartContent: {
    flex: 1,
  },
  cartItemsList: {
    padding: 16,
  },
  cartItemSeparator: {
    height: 12,
  },

  // Cart item
  cartItem: {
    borderRadius: 12,
    padding: 12,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cartItemNotes: {
    fontStyle: 'italic',
  },
  removeButton: {
    margin: 0,
    marginLeft: 8,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    marginBottom: 2,
  },
  itemTotal: {
    fontWeight: '700',
  },

  // Order summary
  orderSummary: {
    margin: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    flex: 1,
  },
  summaryValue: {
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalValue: {
    fontWeight: '700',
  },

  // Action buttons
  actionButtons: {
    padding: 16,
    paddingTop: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  primaryAction: {
    elevation: 4,
  },
  actionButtonContent: {
    paddingVertical: 6,
  },
  actionButtonLabel: {
    fontWeight: '600',
  },

  // Empty cart
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyCartTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyCartDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
});