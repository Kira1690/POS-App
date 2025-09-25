import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { InventoryItem } from '@/types/inventory.types';
import { theme } from '@/constants/theme';

interface InventoryItemsListProps {
  items: InventoryItem[];
  onStockAdjustment: (itemId: string, quantity: number, reason: string) => void;
  onWasteRecord: (itemId: string, quantity: number, reason: string) => void;
  onRefresh: () => void;
}

export default function InventoryItemsList({ 
  items, 
  onStockAdjustment, 
  onWasteRecord, 
  onRefresh 
}: InventoryItemsListProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return theme.colors.success;
      case 'low_stock': return theme.colors.warning;
      case 'out_of_stock': return theme.colors.error;
      case 'overstock': return theme.colors.primary;
      case 'expired': return '#9C27B0';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return '✅';
      case 'low_stock': return '⚠️';
      case 'out_of_stock': return '🚫';
      case 'overstock': return '📦';
      case 'expired': return '🗓️';
      default: return '❓';
    }
  };

  const handleQuickActions = (item: InventoryItem) => {
    Alert.alert(
      `${item.name} - Quick Actions`,
      'Choose an action:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Stock (+10)',
          onPress: () => onStockAdjustment(item.id, 10, 'Manual adjustment - restocking')
        },
        {
          text: 'Remove Stock (-5)',
          onPress: () => onStockAdjustment(item.id, -5, 'Manual adjustment - usage')
        },
        {
          text: 'Record Waste',
          style: 'destructive',
          onPress: () => onWasteRecord(item.id, 1, 'damaged')
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => handleQuickActions(item)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text style={styles.statusText}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemSKU}>SKU: {item.sku}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemSupplier}>📦 {item.supplier_name}</Text>
        </View>
      </View>

      <View style={styles.stockInfo}>
        <View style={styles.stockLevels}>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Current</Text>
            <Text style={[styles.stockValue, { color: getStatusColor(item.status) }]}>
              {item.current_stock} {item.unit}
            </Text>
          </View>
          
          <View style={styles.stockDivider} />
          
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Min</Text>
            <Text style={styles.stockValue}>{item.minimum_stock}</Text>
          </View>
          
          <View style={styles.stockDivider} />
          
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Reorder</Text>
            <Text style={styles.stockValue}>{item.reorder_point}</Text>
          </View>
        </View>
        
        <View style={styles.stockProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((item.current_stock / item.maximum_stock) * 100, 100)}%`,
                  backgroundColor: getStatusColor(item.status)
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {((item.current_stock / item.maximum_stock) * 100).toFixed(0)}% capacity
          </Text>
        </View>
      </View>

      <View style={styles.itemMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Cost/Unit</Text>
          <Text style={styles.metricValue}>{formatCurrency(item.cost_per_unit)}</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Total Value</Text>
          <Text style={[styles.metricValue, { color: theme.colors.success }]}>
            {formatCurrency(item.current_stock * item.cost_per_unit)}
          </Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Usage/Day</Text>
          <Text style={styles.metricValue}>{item.usage_rate}</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Location</Text>
          <Text style={styles.metricValue}>{item.location}</Text>
        </View>
      </View>

      {item.expiry_date && (
        <View style={styles.expiryInfo}>
          <Text style={styles.expiryIcon}>📅</Text>
          <Text style={styles.expiryLabel}>Expires:</Text>
          <Text style={[styles.expiryDate, {
            color: new Date(item.expiry_date) < new Date() ? theme.colors.error : theme.colors.textSecondary
          }]}>
            {new Date(item.expiry_date).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.actionHint}>
        <Text style={styles.actionHintText}>💡 Tap for quick actions</Text>
      </View>
    </TouchableOpacity>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No inventory items found</Text>
        <Text style={styles.emptySubtitle}>Adjust your filters or add new items</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshing={false}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 15,
    gap: 15,
  },
  itemCard: {
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
  itemHeader: {
    marginBottom: 12,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  itemInfo: {
    gap: 2,
  },
  itemSKU: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  itemCategory: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  itemSupplier: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  stockInfo: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  stockLevels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  stockItem: {
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  stockDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 10,
  },
  stockProgress: {
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  itemMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  expiryIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  expiryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  expiryDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionHint: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionHintText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '600',
  },
});