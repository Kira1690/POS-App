import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppleCard } from '../primitives/AppleCard';
import { useTheme } from '@/hooks/useTheme';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Specialized stats display wrapper for AppleCard
// - Open/Closed: Extensible through props without modification
// - Liskov Substitution: Can replace existing StatsCard components
// - Interface Segregation: Focused interface for stats-specific needs
// - Dependency Inversion: Depends on AppleCard and theme abstractions

interface AppleStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  emoji?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;

  // Apple Card system integration
  layer?: 'background' | 'surface' | 'surfaceVariant' | 'surfaceElevated';
  size?: 'small' | 'medium' | 'large' | 'hero';
  interactive?: boolean;
}

// APPLE STATS CARD WRAPPER (Single Responsibility)
// Combines AppleCard design system with stats-specific functionality
export const AppleStatsCard: React.FC<AppleStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  emoji,
  trend,
  trendValue,
  color,
  onPress,
  style,
  layer = 'surface',
  size = 'medium',
  interactive = !!onPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      minHeight: getMinHeight(size),
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },

    iconContainer: {
      marginRight: theme.spacing.sm,
    },

    emoji: {
      fontSize: getEmojiSize(size),
    },

    title: {
      ...theme.typography.label,
      color: theme.colors.onSurfaceVariant,
      fontSize: getTitleSize(size),
      fontWeight: '500',
      flex: 1,
    },

    value: {
      ...theme.typography.h3,
      color: color || theme.colors.onSurface,
      fontSize: getValueSize(size),
      fontWeight: '700',
      marginBottom: subtitle ? theme.spacing.xs : theme.spacing.sm,
    },

    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      fontSize: getSubtitleSize(size),
      marginBottom: theme.spacing.sm,
      lineHeight: 16,
    },

    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 'auto',
    },

    trendIcon: {
      marginRight: theme.spacing.xs,
    },

    trendText: {
      ...theme.typography.caption,
      fontSize: getTrendSize(size),
      fontWeight: '600',
    },
  });

  // TREND COLOR MAPPING (consistent across themes)
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.error;
      case 'neutral': return theme.colors.onSurfaceSecondary;
      default: return theme.colors.onSurfaceSecondary;
    }
  };

  // ICON RENDERING (Interface Segregation)
  const renderIcon = () => {
    if (emoji) {
      return (
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      );
    }
    if (icon) {
      return (
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={icon as any}
            size={getIconSize(size)}
            color={theme.colors.onSurfaceSecondary}
          />
        </View>
      );
    }
    return null;
  };

  // TREND RENDERING (Open/Closed Principle)
  const renderTrend = () => {
    if (!trend || !trendValue) return null;

    const trendIcon = trend === 'up' ? 'trending-up' :
                     trend === 'down' ? 'trending-down' :
                     'trending-flat';
    const trendColor = getTrendColor();

    return (
      <View style={styles.trendContainer}>
        <MaterialIcons
          name={trendIcon}
          size={getTrendIconSize(size)}
          color={trendColor}
          style={styles.trendIcon}
        />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {trendValue}
        </Text>
      </View>
    );
  };

  // APPLE CARD WRAPPER (Dependency Inversion)
  return (
    <AppleCard
      layer={layer}
      size={size}
      interactive={interactive}
      onPress={onPress}
      style={style}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {renderIcon()}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}

        {renderTrend()}
      </View>
    </AppleCard>
  );
};

// UNIVERSAL SIZING SYSTEM (Interface Segregation)
function getMinHeight(size: string): number {
  switch (size) {
    case 'small': return 80;
    case 'medium': return 120;
    case 'large': return 140;
    case 'hero': return 180;
    default: return 120;
  }
}

function getEmojiSize(size: string): number {
  switch (size) {
    case 'small': return 18;
    case 'medium': return 24;
    case 'large': return 28;
    case 'hero': return 32;
    default: return 24;
  }
}

function getIconSize(size: string): number {
  switch (size) {
    case 'small': return 18;
    case 'medium': return 24;
    case 'large': return 28;
    case 'hero': return 32;
    default: return 24;
  }
}

function getTitleSize(size: string): number {
  switch (size) {
    case 'small': return 12;
    case 'medium': return 14;
    case 'large': return 16;
    case 'hero': return 18;
    default: return 14;
  }
}

function getValueSize(size: string): number {
  switch (size) {
    case 'small': return 20;
    case 'medium': return 28;
    case 'large': return 32;
    case 'hero': return 36;
    default: return 28;
  }
}

function getSubtitleSize(size: string): number {
  switch (size) {
    case 'small': return 11;
    case 'medium': return 12;
    case 'large': return 13;
    case 'hero': return 14;
    default: return 12;
  }
}

function getTrendSize(size: string): number {
  switch (size) {
    case 'small': return 10;
    case 'medium': return 11;
    case 'large': return 12;
    case 'hero': return 13;
    default: return 11;
  }
}

function getTrendIconSize(size: string): number {
  switch (size) {
    case 'small': return 12;
    case 'medium': return 14;
    case 'large': return 16;
    case 'hero': return 18;
    default: return 14;
  }
}

// USAGE EXAMPLES (shows universal reusability):
// Dashboard KPIs: <AppleStatsCard title="Revenue" value="$1,234" trend="up" trendValue="12%" />
// Menu stats: <AppleStatsCard title="Items Sold" value="42" emoji="🍕" size="small" />
// Order stats: <AppleStatsCard title="Active Orders" value="8" icon="receipt" layer="surfaceElevated" />
// Hero metrics: <AppleStatsCard title="Daily Revenue" value="$12,456" size="hero" onPress={viewDetails} />