import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfessionalTheme } from '@/constants/theme';
import { KPICardProps } from '@/types/dashboard.types';

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeDirection,
  period,
  icon,
  color,
  loading = false,
}) => {
  const getChangeColor = () => {
    switch (changeDirection) {
      case 'up':
        return ProfessionalTheme.colors.success;
      case 'down':
        return ProfessionalTheme.colors.error;
      default:
        return ProfessionalTheme.colors.textSecondary;
    }
  };

  const getChangeIcon = () => {
    switch (changeDirection) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingBar, { backgroundColor: color }]} />
          <View style={styles.loadingText} />
          <View style={styles.loadingSubtext} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.changeContainer}>
          <Text style={[styles.changeIcon, { color: getChangeColor() }]}>
            {getChangeIcon()}
          </Text>
          <Text style={[styles.changeText, { color: getChangeColor() }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...ProfessionalTheme.dashboard.kpiCard,
    minHeight: 120,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ProfessionalTheme.spacing.sm,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: ProfessionalTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  icon: {
    fontSize: 20,
  },
  
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  changeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  
  changeText: {
    ...ProfessionalTheme.typography.caption,
    fontWeight: '600',
  },
  
  content: {
    flex: 1,
  },
  
  value: {
    ...ProfessionalTheme.typography.h2,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  title: {
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  
  period: {
    ...ProfessionalTheme.typography.caption,
    color: ProfessionalTheme.colors.textSecondary,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
  },
  
  loadingBar: {
    width: 40,
    height: 40,
    borderRadius: ProfessionalTheme.borderRadius.md,
    opacity: 0.3,
    marginBottom: ProfessionalTheme.spacing.sm,
  },
  
  loadingText: {
    height: 24,
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: 4,
    marginBottom: 8,
    opacity: 0.5,
  },
  
  loadingSubtext: {
    height: 16,
    width: '60%',
    backgroundColor: ProfessionalTheme.colors.borderLight,
    borderRadius: 4,
    opacity: 0.3,
  },
});