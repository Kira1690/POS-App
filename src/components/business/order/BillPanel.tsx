/**
 * Professional Bill Panel Component
 * SkyTab-style receipt format with running totals and professional layout
 * Under 400 lines, focused on bill/receipt display and calculations
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { panelWidths } from '@/design-system/theme/layout';
import { typography } from '@/design-system/theme/typography';

interface BillItemModifier {
  groupName: string;
  options: string[];
}

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  category?: string;
  hasModifiers?: boolean; // Indicates if item has editable modifiers
  modifiers?: BillItemModifier[]; // Selected modifier groups with option names
}

interface BillPanelProps {
  orderNumber: string;
  tableName: string;
  tableCapacity: number;
  items: BillItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  orderTime: string;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
  onItemRemove: (itemId: string) => void;
  onAddItem: () => void;
  onPrint: () => void;
  onSendToKitchen: () => void; // Renamed from onPayment - proper restaurant workflow
  onDiscount: () => void;
  onSplit: () => void;
  onEditItemModifiers?: (itemId: string) => void; // Optional: Edit modifiers for cart item
  onItemDiscount?: (itemId: string) => void; // Optional: Apply discount to individual item
  isProcessing?: boolean;
  panelWidth?: number; // Override default fixed width (for portrait full-width layout)
  isPortrait?: boolean; // Hide secondary actions in portrait to save space for cart items
  // Edit mode: show read-only items from existing order above the new-items cart
  alreadyOrderedItems?: BillItem[];
  sendToKitchenLabel?: string; // Override button label in edit mode
  sendToKitchenTestID?: string; // Override testID in edit mode
  onRemoveExistingItem?: (itemId: string) => void;   // undefined = read-only
  onEditExistingItem?: (item: BillItem) => void;
  sendToKitchenDisabled?: boolean;  // explicit override for disabled state
}


export const BillPanel: React.FC<BillPanelProps> = memo(({
  orderNumber,
  tableName,
  tableCapacity,
  items,
  subtotal,
  taxRate,
  taxAmount,
  discountAmount = 0,
  total,
  orderTime,
  onItemQuantityChange,
  onItemRemove,
  onAddItem,
  onPrint,
  onSendToKitchen,
  onDiscount,
  onSplit,
  onEditItemModifiers,
  onItemDiscount,
  isProcessing = false,
  panelWidth,
  isPortrait = false,
  alreadyOrderedItems,
  sendToKitchenLabel = 'Send to Kitchen',
  sendToKitchenTestID = 'btn-cart-send-to-kitchen',
  onRemoveExistingItem,
  onEditExistingItem,
  sendToKitchenDisabled,
}) => {
  const { theme } = useTheme();

  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + delta);
      onItemQuantityChange(itemId, newQuantity);
    }
  }, [items, onItemQuantityChange]);

  const handleRemoveItem = useCallback((itemId: string) => {
    onItemRemove(itemId);
  }, [onItemRemove]);

  const handleEditModifiers = useCallback((itemId: string) => {
    if (onEditItemModifiers) {
      onEditItemModifiers(itemId);
    }
  }, [onEditItemModifiers]);

  // Render bill header with order info
  const renderBillHeader = () => (
    <View style={[styles.billHeader, { borderBottomColor: theme.colors.outline, padding: isPortrait ? spacing.xs : spacing.md, paddingHorizontal: isPortrait ? spacing.sm : spacing.md }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.orderNumber, { color: theme.colors.primary }]}>
          Order #{orderNumber}
        </Text>
        <Text style={[styles.orderTime, { color: theme.colors.onSurfaceVariant }]}>
          {formatDateTime(orderTime)}
        </Text>
      </View>
      
      <View style={styles.tableInfo}>
        <MaterialIcons name="table-restaurant" size={16} color={theme.colors.onSurfaceVariant} />
        <Text style={[styles.tableText, { color: theme.colors.onSurfaceVariant }]}>
          {tableName} • {tableCapacity} seats
        </Text>
      </View>
    </View>
  );

  // Render individual bill item
  const renderBillItem = (item: BillItem, index: number) => (
    <View key={item.id} style={[styles.billItem, { borderBottomColor: theme.colors.outline }]}>
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.itemActions}>
          {/* Edit modifiers button - shown if item has modifiers and callback provided */}
          {item.hasModifiers && onEditItemModifiers && (
            <TouchableOpacity
              onPress={() => handleEditModifiers(item.id)}
              style={[styles.editButton, { backgroundColor: theme.colors.primaryContainer }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="edit" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          {/* Item discount button */}
          {onItemDiscount && (
            <TouchableOpacity
              onPress={() => onItemDiscount(item.id)}
              style={[styles.editButton, { backgroundColor: theme.colors.primaryContainer }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="local-offer" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleRemoveItem(item.id)}
            style={styles.removeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="close" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Display selected modifiers */}
      {item.modifiers && item.modifiers.length > 0 && (
        <View style={styles.modifiersContainer}>
          {item.modifiers.map((mod, modIndex) => (
            <Text
              key={modIndex}
              style={[styles.modifierText, { color: theme.colors.primary }]}
              numberOfLines={1}
            >
              + {mod.options.join(', ')}
            </Text>
          ))}
        </View>
      )}

      {item.notes && (
        <Text style={[styles.itemNotes, { color: theme.colors.onSurfaceVariant }]}>
          Note: {item.notes}
        </Text>
      )}

      <View style={styles.itemDetails}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => handleQuantityChange(item.id, -1)}
            style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <MaterialIcons name="remove" size={16} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: theme.colors.onSurface }]}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => handleQuantityChange(item.id, 1)}
            style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <MaterialIcons name="add" size={16} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.priceInfo}>
          <Text style={[styles.unitPrice, { color: theme.colors.onSurfaceVariant }]}>
            {formatCurrency(item.price)} each
          </Text>
          <Text style={[styles.lineTotal, { color: theme.colors.onSurface }]}>
            {formatCurrency(item.price * item.quantity)}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render bill totals section
  const renderBillTotals = () => (
    <View style={[styles.billTotals, { borderTopColor: theme.colors.outline, padding: isPortrait ? spacing.xs : spacing.md }]}>
      {/* In portrait, show a compact single-row summary: Subtotal | Tax | Total */}
      {isPortrait ? (
        <View style={styles.compactTotalsRow}>
          <View style={styles.compactTotalItem}>
            <Text style={[styles.compactTotalLabel, { color: theme.colors.onSurfaceVariant }]}>Subtotal</Text>
            <Text style={[styles.compactTotalValue, { color: theme.colors.onSurface }]}>{formatCurrency(subtotal)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.compactTotalItem}>
              <Text style={[styles.compactTotalLabel, { color: theme.colors.onSurfaceVariant }]}>Discount</Text>
              <Text style={[styles.compactTotalValue, { color: theme.colors.error }]}>-{formatCurrency(discountAmount)}</Text>
            </View>
          )}
          <View style={styles.compactTotalItem}>
            <Text style={[styles.compactTotalLabel, { color: theme.colors.onSurfaceVariant }]}>Tax</Text>
            <Text style={[styles.compactTotalValue, { color: theme.colors.onSurface }]}>{formatCurrency(taxAmount)}</Text>
          </View>
          <View style={[styles.compactTotalItem, styles.compactGrandTotal]}>
            <Text style={[styles.compactTotalLabel, { color: theme.colors.primary, fontWeight: '700' }]}>Total</Text>
            <Text style={[styles.compactTotalValue, { color: theme.colors.primary, fontWeight: '700', fontSize: 16 }]}>{formatCurrency(total)}</Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Subtotal
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(subtotal)}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
                Discount
              </Text>
              <Text style={[styles.totalValue, styles.discountValue, { color: theme.colors.error }]}>
                -{formatCurrency(discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Tax ({(taxRate * 100).toFixed(1)}%)
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(taxAmount)}
            </Text>
          </View>

          <View style={[styles.totalRow, styles.grandTotalRow, { borderTopColor: theme.colors.outline }]}>
            <Text style={[styles.grandTotalLabel, { color: theme.colors.primary }]}>
              Total
            </Text>
            <Text style={[styles.grandTotalValue, { color: theme.colors.primary }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  // Render action buttons - Restaurant workflow focused
  // In portrait mode, hide secondary buttons to give more space for the cart items list
  const renderActionButtons = () => (
    <View style={[styles.actionButtons, isPortrait && { padding: spacing.xs, paddingHorizontal: spacing.sm, paddingBottom: spacing.xl }]}>
      {!isPortrait && (
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
            onPress={onDiscount}
          >
            <MaterialIcons name="local-offer" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.onSurfaceVariant }]}>
              Discount
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
            onPress={onPrint}
          >
            <MaterialIcons name="print" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.onSurfaceVariant }]}>
              Print KOT
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Primary Kitchen Action - Restaurant Workflow */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.primaryButton,
          styles.kitchenButton,
          { backgroundColor: theme.colors.primary, paddingVertical: isPortrait ? spacing.sm : spacing.lg, minHeight: isPortrait ? 44 : 52 },
          (isProcessing || (sendToKitchenDisabled !== undefined ? sendToKitchenDisabled : items.length === 0)) && { opacity: 0.45 }
        ]}
        onPress={onSendToKitchen}
        disabled={sendToKitchenDisabled !== undefined ? sendToKitchenDisabled : (isProcessing || items.length === 0)}
        testID={sendToKitchenTestID}
      >
        <MaterialIcons
          name="restaurant"
          size={22}
          color={theme.colors.onPrimary}
        />
        <Text style={[styles.primaryButtonText, { color: theme.colors.onPrimary }]}>
          {isProcessing ? 'Sending...' : sendToKitchenLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.outline, width: panelWidth ?? panelWidths.billPanelDefault }]}>
      {renderBillHeader()}
      
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {/* Edit mode: read-only already-ordered items section */}
        {alreadyOrderedItems && alreadyOrderedItems.length > 0 && (
          <View
            style={[styles.alreadyOrderedSection, { backgroundColor: theme.colors.surfaceVariant, borderBottomColor: theme.colors.outline }]}
            testID="section-already-ordered"
          >
            <Text style={[styles.alreadyOrderedTitle, { color: theme.colors.onSurfaceVariant }]}>
              Already Ordered
            </Text>
            {alreadyOrderedItems.map((item) => (
              <View key={item.id} style={[styles.alreadyOrderedItem, onRemoveExistingItem && { paddingVertical: spacing.xs }]}>
                <Text style={[styles.alreadyOrderedItemName, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={[styles.alreadyOrderedItemPrice, { color: theme.colors.onSurfaceVariant }]}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                  {onEditExistingItem && item.hasModifiers && (
                    <TouchableOpacity
                      onPress={() => onEditExistingItem(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      testID={`btn-edit-existing-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <MaterialIcons name="edit" size={16} color={theme.colors.tertiary} />
                    </TouchableOpacity>
                  )}
                  {onRemoveExistingItem && (
                    <TouchableOpacity
                      onPress={() => onRemoveExistingItem(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      testID={`btn-remove-existing-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <MaterialIcons name="close" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* New items cart section label in edit mode */}
        {alreadyOrderedItems && (
          <View style={[styles.newItemsLabel, { borderBottomColor: theme.colors.outline }]}>
            <Text style={[styles.newItemsLabelText, { color: theme.colors.onSurfaceSecondary }]}>
              New Items
            </Text>
          </View>
        )}

        {items.length > 0 ? (
          items.map((item, index) => renderBillItem(item, index))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt" size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
              No items in order
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
              Select items from the menu to get started
            </Text>
          </View>
        )}
      </ScrollView>
      
      {items.length > 0 && renderBillTotals()}
      {renderActionButtons()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderLeftWidth: 1,
  },
  
  // Bill Header
  billHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderNumber: {
    ...typography.titleMedium,
    fontWeight: '700',
    fontSize: 16,
  },
  orderTime: {
    ...typography.bodySmall,
    fontSize: 12,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tableText: {
    ...typography.bodyMedium,
    fontSize: 14,
  },
  
  // Bill Items
  itemsContainer: {
    flex: 1,
  },
  billItem: {
    padding: spacing.md,
    borderBottomWidth: 0.5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemName: {
    ...typography.bodyLarge,
    fontWeight: '500',
    flex: 1,
    marginRight: spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  removeButton: {
    padding: spacing.xs / 2,
  },
  modifiersContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  modifierText: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemNotes: {
    ...typography.bodySmall,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    ...typography.bodySmall,
    fontSize: 12,
  },
  lineTotal: {
    ...typography.bodyLarge,
    fontWeight: '600',
    marginTop: 2,
  },
  
  // Bill Totals
  billTotals: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.bodyMedium,
    fontSize: 14,
  },
  totalValue: {
    ...typography.bodyMedium,
    fontWeight: '500',
    fontSize: 14,
  },
  discountValue: {
    fontWeight: '600',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  grandTotalLabel: {
    ...typography.titleMedium,
    fontWeight: '700',
    fontSize: 18,
  },
  grandTotalValue: {
    ...typography.titleMedium,
    fontWeight: '700',
    fontSize: 18,
  },

  // Compact portrait totals — horizontal single row
  compactTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compactTotalItem: {
    alignItems: 'center',
  },
  compactTotalLabel: {
    ...typography.bodySmall,
    fontSize: 10,
    marginBottom: 1,
  },
  compactTotalValue: {
    ...typography.bodyMedium,
    fontWeight: '500',
    fontSize: 13,
  },
  compactGrandTotal: {
    paddingLeft: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(128,128,128,0.2)',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    ...typography.titleMedium,
    fontWeight: '500',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    ...typography.bodyMedium,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  // Action Buttons - Restaurant workflow layout
  actionButtons: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    minHeight: 42, // Professional minimum touch target
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kitchenButton: {
    // Prominent kitchen action button
    paddingVertical: spacing.lg,
    minHeight: 52, // Larger for primary action
    marginTop: spacing.sm, // Separate from secondary actions
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  secondaryButtonText: {
    ...typography.labelSmall,
    fontWeight: '500',
  },

  // Edit mode: already-ordered read-only section
  alreadyOrderedSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  alreadyOrderedTitle: {
    ...typography.labelMedium,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alreadyOrderedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs / 2,
  },
  alreadyOrderedItemName: {
    ...typography.bodySmall,
    flex: 1,
    marginRight: spacing.sm,
  },
  alreadyOrderedItemPrice: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  newItemsLabel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 0.5,
  },
  newItemsLabelText: {
    ...typography.labelSmall,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

BillPanel.displayName = 'BillPanel';

export default BillPanel;