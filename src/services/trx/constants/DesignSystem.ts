/**
 * Design System - Single Source of Truth for TRX components
 * Apple-inspired dark mode design system for TRX payment UI
 */

import { ViewStyle, TextStyle } from 'react-native';

export const Colors = {
  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    quaternary: '#3A3A3C',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#AEAEB2',
    quaternary: '#8E8E93',
    disabled: '#636366',
  },
  system: {
    blue: '#007AFF',
    blueLight: '#0A84FF',
    green: '#34C759',
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    purple: '#AF52DE',
    indigo: '#5856D6',
  },
  separator: '#38383A',
  separatorOpaque: '#48484A',
  fill: {
    primary: '#787880',
    secondary: '#787880',
    tertiary: '#767680',
    quaternary: '#747480',
  },
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  gradients: {
    primary: ['#1C1C1E', '#2C2C2E'],
    secondary: ['#2C2C2E', '#3A3A3C'],
    accent: ['#007AFF', '#0A84FF'],
  },
} as const;

export const Typography = {
  fonts: {
    system: 'System',
    monospace: 'Courier New',
  },
  fontSize: {
    caption2: 11,
    caption1: 12,
    footnote: 13,
    subheadline: 15,
    callout: 16,
    body: 17,
    headline: 17,
    title3: 20,
    title2: 22,
    title1: 28,
    largeTitle: 34,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

export const Spacing = {
  unit: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  padding: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  margin: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  component: {
    buttonPadding: 16,
    cardPadding: 20,
    screenPadding: 20,
    sectionSpacing: 32,
    rowHeight: 56,
    iconSize: 24,
    borderRadius: 12,
    borderRadiusSmall: 8,
    borderRadiusLarge: 16,
  },
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const ComponentStyles = {
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Spacing.component.borderRadius,
    padding: Spacing.component.cardPadding,
    ...Shadows.card,
  } as ViewStyle,
  button: {
    primary: {
      backgroundColor: Colors.system.blue,
      borderRadius: Spacing.component.borderRadius,
      paddingVertical: Spacing.component.buttonPadding,
      paddingHorizontal: Spacing.lg,
      ...Shadows.small,
    } as ViewStyle,
    secondary: {
      backgroundColor: Colors.background.quaternary,
      borderRadius: Spacing.component.borderRadius,
      paddingVertical: Spacing.component.buttonPadding,
      paddingHorizontal: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.separator,
    } as ViewStyle,
  },
  input: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: Spacing.component.borderRadiusSmall,
    borderWidth: 1,
    borderColor: Colors.separator,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  } as ViewStyle & TextStyle,
  sectionHeader: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.component.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  } as ViewStyle,
  row: {
    backgroundColor: Colors.background.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.component.screenPadding,
    minHeight: Spacing.component.rowHeight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
} as const;

export const Animations = {
  timing: { fast: 150, normal: 250, slow: 350 },
  easing: {
    standard: [0.4, 0.0, 0.2, 1.0],
    accelerate: [0.4, 0.0, 1.0, 1.0],
    decelerate: [0.0, 0.0, 0.2, 1.0],
  },
} as const;

export const Breakpoints = {
  small: 0, medium: 768, large: 1024, extraLarge: 1440,
} as const;

export const IconSizes = {
  xs: 16, sm: 20, md: 24, lg: 32, xl: 40, xxl: 48,
} as const;

export const BorderRadius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999,
} as const;

export const DesignSystem = {
  Colors, Typography, Spacing, Shadows, ComponentStyles,
  Animations, Breakpoints, IconSizes, BorderRadius,
} as const;

export default DesignSystem;
