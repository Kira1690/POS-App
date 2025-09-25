import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ItemPerformance } from '@/types/reports.types';
import { theme } from '@/constants/theme';

interface TopItemsCardProps {
  items: ItemPerformance[];
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export default function TopItemsCard({ items, onExport }: TopItemsCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const getTrendIcon = (trend: number) => trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→';
  
  const getTrendColor = (trend: number) => trend > 0 ? theme.colors.success : 
                                          trend < 0 ? theme.colors.error : 
                                          theme.colors.textSecondary;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'pizza': return '🍕';
      case 'salads': return '🥗';
      case 'main course': return '🍽️';
      case 'desserts': return '🍰';
      case 'beverages': return '🥤';
      case 'appetizers': return '🥨';
      default: return '🍴';
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return theme.colors.gray;
    }
  };

  const getRankText = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>🏆 Top Performing Items</Text>
          <Text style={styles.subtitle}>Best sellers by revenue and profit</Text>
        </View>
        <View style={styles.exportButtons}>
          <TouchableOpacity 
            style={[styles.exportButton, styles.csvButton]}
            onPress={() => onExport('csv')}
          >
            <Text style={styles.exportButtonText}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.exportButton, styles.excelButton]}
            onPress={() => onExport('excel')}
          >
            <Text style={styles.exportButtonText}>Excel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} nestedScrollEnabled>
        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{items.length}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(items.reduce((sum, item) => sum + item.revenue, 0))}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg Profit Margin</Text>
            <Text style={styles.summaryValue}>
              {(items.reduce((sum, item) => sum + item.profit_margin, 0) / items.length).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={item.item_id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{getRankText(index)}</Text>
                </View>
                
                <View style={styles.itemInfo}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
                    <Text style={styles.itemName}>{item.item_name}</Text>
                    <View style={styles.trendIndicator}>
                      <Text style={[styles.trendText, { color: getTrendColor(item.trend) }]}>
                        {getTrendIcon(item.trend)} {Math.abs(item.trend)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.categoryName}>{item.category}</Text>
                </View>
              </View>

              <View style={styles.itemStats}>
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Qty Sold</Text>
                  <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                    {item.quantity_sold}
                  </Text>
                </View>
                
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Revenue</Text>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>
                    {formatCurrency(item.revenue)}
                  </Text>
                </View>
                
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Profit</Text>
                  <Text style={[styles.statValue, { color: '#9C27B0' }]}>
                    {formatCurrency(item.profit)}
                  </Text>
                </View>
                
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>Margin</Text>
                  <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                    {item.profit_margin.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Profit Margin Bar */}
              <View style={styles.profitMarginBar}>
                <View style={styles.profitMarginTrack}>
                  <View 
                    style={[
                      styles.profitMarginFill, 
                      { 
                        width: `${Math.min(item.profit_margin, 100)}%`,
                        backgroundColor: item.profit_margin >= 50 ? theme.colors.success : 
                                       item.profit_margin >= 30 ? theme.colors.warning : 
                                       theme.colors.error
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.profitMarginText}>{item.profit_margin.toFixed(1)}% margin</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Insights */}
        <View style={styles.insights}>
          <Text style={styles.insightsTitle}>🔍 Performance Insights</Text>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Best Seller:</Text>
            <Text style={styles.insightValue}>
              {items[0]?.item_name} ({items[0]?.quantity_sold} sold)
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Highest Revenue:</Text>
            <Text style={styles.insightValue}>
              {items.reduce((max, item) => item.revenue > max.revenue ? item : max, items[0])?.item_name}
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Best Margin:</Text>
            <Text style={styles.insightValue}>
              {items.reduce((max, item) => item.profit_margin > max.profit_margin ? item : max, items[0])?.item_name}
              {' '}({items.reduce((max, item) => item.profit_margin > max.profit_margin ? item : max, items[0])?.profit_margin.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  csvButton: {
    backgroundColor: '#38A169',
  },
  excelButton: {
    backgroundColor: '#319795',
  },
  exportButtonText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  trendIndicator: {
    marginLeft: 8,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  itemStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  profitMarginBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profitMarginTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  profitMarginFill: {
    height: '100%',
    borderRadius: 2,
  },
  profitMarginText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  insights: {
    marginTop: 20,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 15,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  insightLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  insightValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
});