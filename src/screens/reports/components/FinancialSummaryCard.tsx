import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FinancialSummary } from '@/types/reports.types';
import { theme } from '@/constants/theme';

interface FinancialSummaryCardProps {
  summary: FinancialSummary;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export default function FinancialSummaryCard({ summary, onExport }: FinancialSummaryCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const getMarginColor = (margin: number) => {
    if (margin >= 30) return theme.colors.success;
    if (margin >= 20) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>💰 Financial Summary</Text>
          <Text style={styles.subtitle}>Revenue, expenses & profitability</Text>
        </View>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => onExport('pdf')}
        >
          <Text style={styles.exportButtonText}>📊 Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Revenue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Revenue</Text>
          <View style={styles.financialGrid}>
            <View style={[styles.financialCard, styles.grossRevenueCard]}>
              <Text style={styles.cardIcon}>💵</Text>
              <Text style={styles.cardLabel}>Gross Revenue</Text>
              <Text style={[styles.cardValue, { color: theme.colors.success }]}>
                {formatCurrency(summary.revenue.gross)}
              </Text>
            </View>
            
            <View style={[styles.financialCard, styles.netRevenueCard]}>
              <Text style={styles.cardIcon}>💳</Text>
              <Text style={styles.cardLabel}>Net Revenue</Text>
              <Text style={[styles.cardValue, { color: '#4CAF50' }]}>
                {formatCurrency(summary.revenue.net)}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tax</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(summary.revenue.tax)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Discounts</Text>
              <Text style={[styles.detailValue, { color: theme.colors.warning }]}>
                -{formatCurrency(summary.revenue.discounts)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Refunds</Text>
              <Text style={[styles.detailValue, { color: theme.colors.error }]}>
                -{formatCurrency(summary.revenue.refunds)}
              </Text>
            </View>
          </View>
        </View>

        {/* Expenses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📉 Expenses</Text>
          <View style={styles.expenseCard}>
            <View style={styles.totalExpenses}>
              <Text style={styles.totalExpensesLabel}>Total Expenses</Text>
              <Text style={[styles.totalExpensesValue, { color: theme.colors.error }]}>
                {formatCurrency(summary.expenses.total)}
              </Text>
            </View>
            
            <View style={styles.expenseBreakdown}>
              <View style={styles.expenseItem}>
                <View style={styles.expenseBar}>
                  <View style={[styles.expenseBarFill, { 
                    width: `${(summary.expenses.food_cost / summary.expenses.total * 100)}%`,
                    backgroundColor: '#FF6B6B' 
                  }]} />
                </View>
                <Text style={styles.expenseLabel}>Food Cost</Text>
                <Text style={styles.expenseValue}>
                  {formatCurrency(summary.expenses.food_cost)}
                </Text>
              </View>
              
              <View style={styles.expenseItem}>
                <View style={styles.expenseBar}>
                  <View style={[styles.expenseBarFill, { 
                    width: `${(summary.expenses.labor / summary.expenses.total * 100)}%`,
                    backgroundColor: '#4ECDC4' 
                  }]} />
                </View>
                <Text style={styles.expenseLabel}>Labor</Text>
                <Text style={styles.expenseValue}>
                  {formatCurrency(summary.expenses.labor)}
                </Text>
              </View>
              
              <View style={styles.expenseItem}>
                <View style={styles.expenseBar}>
                  <View style={[styles.expenseBarFill, { 
                    width: `${(summary.expenses.overhead / summary.expenses.total * 100)}%`,
                    backgroundColor: '#45B7D1' 
                  }]} />
                </View>
                <Text style={styles.expenseLabel}>Overhead</Text>
                <Text style={styles.expenseValue}>
                  {formatCurrency(summary.expenses.overhead)}
                </Text>
              </View>
              
              <View style={styles.expenseItem}>
                <View style={styles.expenseBar}>
                  <View style={[styles.expenseBarFill, { 
                    width: `${(summary.expenses.other / summary.expenses.total * 100)}%`,
                    backgroundColor: '#F7B731' 
                  }]} />
                </View>
                <Text style={styles.expenseLabel}>Other</Text>
                <Text style={styles.expenseValue}>
                  {formatCurrency(summary.expenses.other)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profitability Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Profitability</Text>
          <View style={styles.profitabilityGrid}>
            <View style={[styles.profitCard, styles.grossProfitCard]}>
              <Text style={styles.profitIcon}>💚</Text>
              <Text style={styles.profitLabel}>Gross Profit</Text>
              <Text style={[styles.profitValue, { color: theme.colors.success }]}>
                {formatCurrency(summary.profitability.gross_profit)}
              </Text>
            </View>
            
            <View style={[styles.profitCard, styles.netProfitCard]}>
              <Text style={styles.profitIcon}>🎯</Text>
              <Text style={styles.profitLabel}>Net Profit</Text>
              <Text style={[styles.profitValue, { color: getMarginColor(summary.profitability.profit_margin) }]}>
                {formatCurrency(summary.profitability.net_profit)}
              </Text>
            </View>
          </View>
          
          {/* Profit Margin */}
          <View style={styles.marginCard}>
            <View style={styles.marginHeader}>
              <Text style={styles.marginLabel}>Profit Margin</Text>
              <Text style={[styles.marginValue, { color: getMarginColor(summary.profitability.profit_margin) }]}>
                {summary.profitability.profit_margin.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.marginBar}>
              <View style={[styles.marginBarFill, {
                width: `${Math.min(summary.profitability.profit_margin, 100)}%`,
                backgroundColor: getMarginColor(summary.profitability.profit_margin)
              }]} />
            </View>
            <View style={styles.marginBenchmarks}>
              <Text style={styles.benchmarkText}>Poor: &lt;20%</Text>
              <Text style={styles.benchmarkText}>Good: 20-30%</Text>
              <Text style={styles.benchmarkText}>Excellent: &gt;30%</Text>
            </View>
          </View>
        </View>

        {/* Financial Health */}
        <View style={styles.healthSection}>
          <Text style={styles.healthTitle}>💊 Financial Health</Text>
          <View style={styles.healthIndicators}>
            <View style={styles.healthIndicator}>
              <Text style={styles.healthLabel}>Revenue Trend</Text>
              <Text style={[styles.healthStatus, { color: theme.colors.success }]}>📈 Strong</Text>
            </View>
            
            <View style={styles.healthIndicator}>
              <Text style={styles.healthLabel}>Cost Control</Text>
              <Text style={[styles.healthStatus, { color: theme.colors.warning }]}>⚠️ Monitor</Text>
            </View>
            
            <View style={styles.healthIndicator}>
              <Text style={styles.healthLabel}>Profitability</Text>
              <Text style={[styles.healthStatus, { color: getMarginColor(summary.profitability.profit_margin) }]}>
                {summary.profitability.profit_margin >= 30 ? '✅ Excellent' : 
                 summary.profitability.profit_margin >= 20 ? '⚠️ Good' : '❌ Poor'}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
  exportButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exportButtonText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  financialGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  financialCard: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  grossRevenueCard: {
    borderLeftColor: theme.colors.success,
  },
  netRevenueCard: {
    borderLeftColor: '#4CAF50',
  },
  cardIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  detailItem: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  expenseCard: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
  },
  totalExpenses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  totalExpensesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalExpensesValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseBreakdown: {
    gap: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expenseBar: {
    width: 60,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  expenseBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  expenseLabel: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
  },
  expenseValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 80,
    textAlign: 'right',
  },
  profitabilityGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  profitCard: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  grossProfitCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  netProfitCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  profitIcon: {
    fontSize: 18,
    marginBottom: 8,
  },
  profitLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  profitValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  marginCard: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
  },
  marginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  marginLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  marginValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  marginBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  marginBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  marginBenchmarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benchmarkText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  healthSection: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  healthIndicators: {
    gap: 8,
  },
  healthIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  healthStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});