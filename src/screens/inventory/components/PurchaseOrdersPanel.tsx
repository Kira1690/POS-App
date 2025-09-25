import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { PurchaseOrder, Supplier } from '@/types/inventory.types';
import { theme } from '@/constants/theme';

interface PurchaseOrdersPanelProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  onRefresh: () => void;
}

export default function PurchaseOrdersPanel({ purchaseOrders, suppliers, onRefresh }: PurchaseOrdersPanelProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return theme.colors.textSecondary;
      case 'sent': return theme.colors.primary;
      case 'confirmed': return theme.colors.warning;
      case 'received': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'sent': return '📤';
      case 'confirmed': return '✅';
      case 'received': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const renderPurchaseOrder = ({ item: order }: { item: PurchaseOrder }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.supplierName}>{order.supplier_name}</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(order.status) }
        ]}>
          <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
          <Text style={styles.statusText}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDates}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Ordered:</Text>
          <Text style={styles.dateValue}>
            {new Date(order.order_date).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Expected:</Text>
          <Text style={styles.dateValue}>
            {new Date(order.expected_delivery).toLocaleDateString()}
          </Text>
        </View>
        
        {order.actual_delivery && (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Delivered:</Text>
            <Text style={[styles.dateValue, { color: theme.colors.success }]}>
              {new Date(order.actual_delivery).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.itemsPreview}>
        <Text style={styles.itemsLabel}>Items ({order.items.length}):</Text>
        <View style={styles.itemsList}>
          {order.items.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.itemPreview}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text style={styles.itemQuantity}>
                {item.quantity_ordered} {item.unit}
                {item.quantity_received !== undefined && 
                  item.quantity_received !== item.quantity_ordered && (
                  <Text style={styles.receivedQuantity}>
                    {' '}(received: {item.quantity_received})
                  </Text>
                )}
              </Text>
            </View>
          ))}
          
          {order.items.length > 3 && (
            <Text style={styles.moreItems}>+{order.items.length - 3} more items</Text>
          )}
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalAmount}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={[styles.totalValue, { color: theme.colors.success }]}>
            {formatCurrency(order.total_amount)}
          </Text>
        </View>
        
        <View style={styles.orderActions}>
          {order.status === 'draft' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📤 Send</Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'confirmed' && (
            <TouchableOpacity style={[styles.actionButton, styles.receiveButton]}>
              <Text style={styles.actionButtonText}>📦 Receive</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
            <Text style={styles.actionButtonText}>👁️ View</Text>
          </TouchableOpacity>
        </View>
      </View>

      {order.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Purchase Orders ({purchaseOrders.length})</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create Order</Text>
        </TouchableOpacity>
      </View>

      {/* Status Summary */}
      <View style={styles.statusSummary}>
        {['draft', 'sent', 'confirmed', 'received'].map((status) => {
          const count = purchaseOrders.filter(order => order.status === status).length;
          return (
            <View key={status} style={styles.statusSummaryItem}>
              <Text style={styles.statusSummaryIcon}>{getStatusIcon(status)}</Text>
              <Text style={styles.statusSummaryCount}>{count}</Text>
              <Text style={styles.statusSummaryLabel}>{status}</Text>
            </View>
          );
        })}
      </View>

      <FlatList
        data={purchaseOrders}
        renderItem={renderPurchaseOrder}
        keyExtractor={(item) => item.id}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersContent}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  createButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  statusSummary: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusSummaryIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statusSummaryCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statusSummaryLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    padding: 15,
    gap: 15,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  orderDates: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 12,
  },
  dateItem: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
  },
  itemsPreview: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
  },
  itemsList: {
    gap: 4,
  },
  itemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 11,
    color: theme.colors.text,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  receivedQuantity: {
    color: theme.colors.warning,
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  receiveButton: {
    backgroundColor: theme.colors.success,
  },
  viewButton: {
    backgroundColor: theme.colors.gray,
  },
  actionButtonText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '600',
  },
  notesSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  notesLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
  },
});