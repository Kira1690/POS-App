/**
 * Stats Card - Reusable KPI card component for dashboards
 * Under 200 lines, single responsibility for displaying metrics
 */

import React, { memo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

export interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  emoji?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  emoji,
  trend,
  trendValue,
  color,
  backgroundColor,
  onPress,
  style,
  size = 'medium'
}) => {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: backgroundColor || theme.colors.surface,
    borderColor: theme.colors.outline,
    ...styles.container,
    ...styles[`container${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    ...style,
  };

  const valueColor = color || theme.colors.onSurface;
  const trendColor = trend === 'up' ? '#28a745' : trend === 'down' ? '#dc3545' : theme.colors.onSurfaceVariant;

  const renderIcon = () => {
    if (emoji) {
      return <Text style={styles.emoji}>{emoji}</Text>;
    }
    if (icon) {
      return <MaterialIcons name={icon as any} size={24} color={theme.colors.onSurfaceVariant} />;
    }
    return null;
  };

  const renderTrend = () => {
    if (!trend || !trendValue) return null;
    
    const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat';
    const trendPrefix = trend === 'up' ? '↗️ ' : trend === 'down' ? '↘️ ' : '';
    
    return (
      <View style={styles.trendContainer}>
        <MaterialIcons name={trendIcon} size={16} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {trendPrefix}{trendValue}
        </Text>
      </View>
    );
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={cardStyle}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      accessible={true}
      accessibilityLabel={`${title}: ${value}`}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      <View style={styles.header}>
        {renderIcon()}
        <Text 
          style={[
            styles.title, 
            { color: theme.colors.onSurface },
            styles[`title${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      
      <Text 
        style={[
          styles.value, 
          { color: valueColor },
          styles[`value${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      
      {subtitle && (
        <Text 
          style={[
            styles.subtitle, 
            { color: theme.colors.onSurfaceVariant },
            styles[`subtitle${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]
          ]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      )}
      
      {renderTrend()}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  containerSmall: {
    padding: spacing.md,
    minHeight: 100,
  },
  containerMedium: {
    padding: spacing.lg,
    minHeight: 140,
  },
  containerLarge: {
    padding: spacing.xl,
    minHeight: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.titleMedium,
    fontWeight: '600',
    flex: 1,
  },
  titleSmall: {
    ...typography.titleSmall,
  },
  titleMedium: {
    ...typography.titleMedium,
  },
  titleLarge: {
    ...typography.titleLarge,
  },
  value: {
    ...typography.headlineMedium,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  valueSmall: {
    ...typography.headlineSmall,
  },
  valueMedium: {
    ...typography.headlineMedium,
  },
  valueLarge: {
    ...typography.headlineLarge,
  },
  subtitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.sm,
  },
  subtitleSmall: {
    ...typography.bodySmall,
  },
  subtitleMedium: {
    ...typography.bodyMedium,
  },
  subtitleLarge: {
    ...typography.bodyLarge,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  trendText: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default memo(StatsCard);