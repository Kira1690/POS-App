import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StaffPerformance } from '@/types/reports.types';
import { theme } from '@/constants/theme';

interface StaffPerformanceCardProps {
  performance: StaffPerformance[];
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export default function StaffPerformanceCard({ performance, onExport }: StaffPerformanceCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'server': return '👨‍💼';
      case 'chef': return '👨‍🍳';
      case 'cashier': return '👩‍💻';
      case 'manager': return '👩‍💼';
      default: return '👤';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return theme.colors.success;
    if (score >= 80) return theme.colors.warning;
    if (score >= 70) return theme.colors.primary;
    return theme.colors.error;
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    return stars.padEnd(5, '☆');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>👥 Staff Performance</Text>
          <Text style={styles.subtitle}>Individual performance metrics</Text>
        </View>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => onExport('excel')}
        >
          <Text style={styles.exportButtonText}>📊 Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} nestedScrollEnabled>
        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Staff On Duty</Text>
            <Text style={styles.summaryValue}>{performance.length}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg Satisfaction</Text>
            <Text style={styles.summaryValue}>
              {(performance.reduce((sum, staff) => sum + staff.customer_satisfaction, 0) / performance.length).toFixed(1)}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg Efficiency</Text>
            <Text style={styles.summaryValue}>
              {Math.round(performance.reduce((sum, staff) => sum + staff.efficiency_score, 0) / performance.length)}%
            </Text>
          </View>
        </View>

        {/* Staff List */}
        <View style={styles.staffList}>
          {performance.map((staff, index) => (
            <View key={staff.staff_id} style={styles.staffCard}>
              <View style={styles.staffHeader}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.roleIcon}>{getRoleIcon(staff.role)}</Text>
                </View>
                
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffRole}>{staff.role.toUpperCase()}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStars}>{getRatingStars(staff.customer_satisfaction)}</Text>
                    <Text style={styles.ratingText}>{staff.customer_satisfaction.toFixed(1)}</Text>
                  </View>
                </View>
                
                <View style={styles.efficiencyBadge}>
                  <Text style={[
                    styles.efficiencyText, 
                    { color: getPerformanceColor(staff.efficiency_score) }
                  ]}>
                    {staff.efficiency_score}%
                  </Text>
                </View>
              </View>

              <View style={styles.staffMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Hours</Text>
                  <Text style={styles.metricValue}>{staff.hours_worked}</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Orders</Text>
                  <Text style={styles.metricValue}>{staff.orders_served}</Text>
                </View>
                
                {staff.revenue_generated > 0 && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Revenue</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.success }]}>
                      {formatCurrency(staff.revenue_generated)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Orders/Hr</Text>
                  <Text style={styles.metricValue}>
                    {(staff.orders_served / staff.hours_worked).toFixed(1)}
                  </Text>
                </View>
              </View>

              {/* Performance Bar */}
              <View style={styles.performanceBar}>
                <Text style={styles.performanceLabel}>Efficiency Score</Text>
                <View style={styles.performanceTrack}>
                  <View 
                    style={[
                      styles.performanceFill, 
                      { 
                        width: `${staff.efficiency_score}%`,
                        backgroundColor: getPerformanceColor(staff.efficiency_score)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.performanceText}>{staff.efficiency_score}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Insights */}
        <View style={styles.insights}>
          <Text style={styles.insightsTitle}>🏆 Performance Highlights</Text>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Top Performer:</Text>
            <Text style={styles.insightValue}>
              {performance.reduce((best, staff) => 
                staff.efficiency_score > best.efficiency_score ? staff : best, performance[0]
              )?.name} ({performance.reduce((best, staff) => 
                staff.efficiency_score > best.efficiency_score ? staff : best, performance[0]
              )?.efficiency_score}%)
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Most Orders:</Text>
            <Text style={styles.insightValue}>
              {performance.reduce((best, staff) => 
                staff.orders_served > best.orders_served ? staff : best, performance[0]
              )?.name} ({performance.reduce((best, staff) => 
                staff.orders_served > best.orders_served ? staff : best, performance[0]
              )?.orders_served} orders)
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Best Rating:</Text>
            <Text style={styles.insightValue}>
              {performance.reduce((best, staff) => 
                staff.customer_satisfaction > best.customer_satisfaction ? staff : best, performance[0]
              )?.name} ({performance.reduce((best, staff) => 
                staff.customer_satisfaction > best.customer_satisfaction ? staff : best, performance[0]
              )?.customer_satisfaction.toFixed(1)} ★)
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
  exportButton: {
    backgroundColor: theme.colors.primary,
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
  staffList: {
    gap: 12,
  },
  staffCard: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleIcon: {
    fontSize: 18,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  staffRole: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  efficiencyBadge: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  efficiencyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  staffMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  performanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  performanceLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    minWidth: 60,
  },
  performanceTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  performanceFill: {
    height: '100%',
    borderRadius: 3,
  },
  performanceText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
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