import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface IconProps {
  /**
   * Icon name from MaterialCommunityIcons
   * @see https://pictogrammers.com/library/mdi/
   */
  name: string;

  /**
   * Icon size in pixels
   * @default 24
   */
  size?: number;

  /**
   * Icon color (defaults to theme.colors.onSurface)
   */
  color?: string;

  /**
   * Additional styles
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
}

/**
 * Reusable Icon component wrapping MaterialCommunityIcons
 * Automatically uses theme colors and supports accessibility
 *
 * @example
 * <Icon name="account" size={24} color={theme.colors.primary} />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color || theme.colors.onSurface}
      style={style}
      accessibilityLabel={accessibilityLabel || `${name} icon`}
      accessible={true}
    />
  );
};
