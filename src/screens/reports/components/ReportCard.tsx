import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

interface ReportCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number; // positive = up, negative = down
  icon?: keyof typeof MaterialIcons.glyphMap;
  accentColor?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor,
}) => {
  const { theme } = useTheme();
  const { isPhone, isSmallTablet, cardPadding, bodySize, captionSize } = useResponsive();

  const hasTrend = trend !== undefined && trend !== 0;
  const trendUp = (trend ?? 0) >= 0;
  const trendColor = trendUp ? theme.colors.success : theme.colors.error;
  const accent = accentColor ?? theme.colors.primary;

  const valueSize = isPhone ? 20 : isSmallTablet ? 24 : 28;
  const titleSize = bodySize;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: cardPadding,
      ...theme.shadows.sm,
      borderLeftWidth: 3,
      borderLeftColor: accent,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    title: {
      fontSize: titleSize,
      color: theme.colors.onSurfaceSecondary,
      fontWeight: '500',
      flex: 1,
    },
    value: {
      fontSize: valueSize,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    trend: {
      fontSize: captionSize,
      fontWeight: '600',
      color: trendColor,
    },
    subtitle: {
      fontSize: captionSize,
      color: theme.colors.onSurfaceSecondary,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && (
          <MaterialIcons name={icon} size={16} color={accent} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {(hasTrend || subtitle) && (
        <View style={styles.footer}>
          {hasTrend && (
            <MaterialIcons
              name={trendUp ? 'trending-up' : 'trending-down'}
              size={14}
              color={trendColor}
            />
          )}
          {hasTrend && (
            <Text style={styles.trend}>
              {trendUp ? '+' : ''}{trend?.toFixed(1)}%
            </Text>
          )}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
};
