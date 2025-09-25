/**
 * Quick Action Button - Reusable action button for dashboard interfaces
 * Under 200 lines, focused on consistent action button styling and behavior
 */

import React, { memo } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ViewStyle,
  View
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

export interface QuickActionButtonProps {
  label: string;
  icon?: string;
  emoji?: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  badge?: string | number;
  style?: ViewStyle;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  emoji,
  onPress,
  color,
  backgroundColor,
  variant = 'filled',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  badge,
  style
}) => {
  const { theme } = useTheme();

  // Determine colors based on variant
  const getButtonStyle = (): ViewStyle => {
    const baseColor = backgroundColor || theme.colors.primary;
    const textColor = color || (variant === 'filled' ? 'white' : baseColor);

    const baseStyle: ViewStyle = {
      ...styles.container,
      ...styles[`container${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: baseColor,
          borderColor: baseColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: baseColor,
          borderWidth: 2,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: `${baseColor}20`,
          borderColor: 'transparent',
          borderWidth: 1,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseColor = backgroundColor || theme.colors.primary;
    const textColor = variant === 'filled' ? 'white' : baseColor;
    
    return {
      ...styles.text,
      ...styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
      color: color || textColor,
    };
  };

  const getIconColor = () => {
    const baseColor = backgroundColor || theme.colors.primary;
    return color || (variant === 'filled' ? 'white' : baseColor);
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 28;
      default: return 20;
    }
  };

  const renderIcon = () => {
    if (emoji) {
      return (
        <Text style={[
          styles.emoji,
          styles[`emoji${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]
        ]}>
          {emoji}
        </Text>
      );
    }
    
    if (icon) {
      return (
        <MaterialIcons 
          name={icon as any} 
          size={getIconSize()} 
          color={getIconColor()} 
        />
      );
    }
    
    return null;
  };

  const renderBadge = () => {
    if (!badge) return null;
    
    return (
      <View style={[
        styles.badge,
        { backgroundColor: theme.colors.error }
      ]}>
        <Text style={styles.badgeText}>
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <MaterialIcons 
          name="hourglass-empty" 
          size={getIconSize()} 
          color={getIconColor()} 
        />
      ) : (
        renderIcon()
      )}
      
      <Text 
        style={getTextStyle()}
        numberOfLines={size === 'small' ? 1 : 2}
      >
        {loading ? 'Loading...' : label}
      </Text>
      
      {renderBadge()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
    position: 'relative',
  },
  containerSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  containerMedium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  containerLarge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.bodyMedium,
    fontWeight: '700',
    marginLeft: spacing.sm,
    textAlign: 'center',
    flex: 1,
  },
  textSmall: {
    ...typography.bodySmall,
    fontSize: 12,
  },
  textMedium: {
    ...typography.bodyMedium,
  },
  textLarge: {
    ...typography.bodyLarge,
  },
  emoji: {
    marginRight: spacing.xs,
  },
  emojiSmall: {
    fontSize: 16,
  },
  emojiMedium: {
    fontSize: 20,
  },
  emojiLarge: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    ...typography.bodySmall,
    color: 'white',
    fontWeight: '700',
    fontSize: 10,
  },
});

export default memo(QuickActionButton);