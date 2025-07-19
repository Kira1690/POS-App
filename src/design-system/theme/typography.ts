import { Platform, PixelRatio } from 'react-native';

// Font families
export const fontFamilies = {
  // System fonts for better performance and native feel
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

// Font weights
export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// Base font size (16px)
const BASE_FONT_SIZE = 16;

// Responsive font scaling
export const getFontSize = (size: number, scale: number = 1): number => {
  const scaledSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

// Typography scale (Material Design Type Scale)
export const typography = {
  // Display styles (largest)
  displayLarge: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(57),
    lineHeight: getFontSize(64),
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(45),
    lineHeight: getFontSize(52),
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(36),
    lineHeight: getFontSize(44),
    letterSpacing: 0,
  },

  // Headline styles
  headlineLarge: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(32),
    lineHeight: getFontSize(40),
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(28),
    lineHeight: getFontSize(36),
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(24),
    lineHeight: getFontSize(32),
    letterSpacing: 0,
  },

  // Title styles
  titleLarge: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(22),
    lineHeight: getFontSize(28),
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(18),
    lineHeight: getFontSize(24),
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(20),
    letterSpacing: 0.1,
  },

  // Body styles
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(24),
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.4,
  },

  // Label styles
  labelLarge: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(10),
    lineHeight: getFontSize(14),
    letterSpacing: 0.5,
  },

  // Custom payment-specific styles
  amount: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold,
    fontSize: getFontSize(48),
    lineHeight: getFontSize(56),
    letterSpacing: -0.5,
  },
  amountLarge: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold,
    fontSize: getFontSize(64),
    lineHeight: getFontSize(72),
    letterSpacing: -1,
  },
  amountSmall: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold,
    fontSize: getFontSize(32),
    lineHeight: getFontSize(40),
    letterSpacing: -0.25,
  },
  currency: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold,
    fontSize: getFontSize(36),
    lineHeight: getFontSize(44),
    letterSpacing: 0,
  },
  dialButton: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(24),
    lineHeight: getFontSize(32),
    letterSpacing: 0,
  },
  quickAmount: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    letterSpacing: 0.1,
  },
  buttonLarge: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(18),
    lineHeight: getFontSize(24),
    letterSpacing: 0.1,
  },
  buttonMedium: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(22),
    letterSpacing: 0.1,
  },
  buttonSmall: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    letterSpacing: 0.1,
  },

  // POS Authentication-specific typography
  authTitle: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold,
    fontSize: getFontSize(32),
    lineHeight: getFontSize(40),
    letterSpacing: -0.5,
  },
  authSubtitle: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(18),
    lineHeight: getFontSize(24),
    letterSpacing: 0.15,
  },
  authBody: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(24),
    letterSpacing: 0.15,
  },
  authButton: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(18),
    lineHeight: getFontSize(24),
    letterSpacing: 0.1,
  },
  authInput: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(24),
    letterSpacing: 0.15,
  },
  authLabel: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    letterSpacing: 0.1,
  },
  authError: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.4,
  },
  authHelper: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.4,
  },
  roleTitle: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(22),
    letterSpacing: 0.1,
  },
  roleDescription: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.4,
  },
  otpDigit: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold,
    fontSize: getFontSize(24),
    lineHeight: getFontSize(32),
    letterSpacing: 0,
  },
} as const;

// Responsive typography helpers
export const getResponsiveTypography = (screenWidth: number) => {
  const isSmallScreen = screenWidth < 380;
  const isLargeScreen = screenWidth > 420;
  
  const scale = isSmallScreen ? 0.9 : isLargeScreen ? 1.1 : 1;
  
  return {
    amount: {
      ...typography.amount,
      fontSize: getFontSize(isSmallScreen ? 36 : isLargeScreen ? 56 : 48, scale),
    },
    currency: {
      ...typography.currency,
      fontSize: getFontSize(isSmallScreen ? 28 : isLargeScreen ? 42 : 36, scale),
    },
    dialButton: {
      ...typography.dialButton,
      fontSize: getFontSize(isSmallScreen ? 20 : isLargeScreen ? 28 : 24, scale),
    },
    title: {
      ...typography.headlineMedium,
      fontSize: getFontSize(isSmallScreen ? 24 : isLargeScreen ? 32 : 28, scale),
    },
  };
};

export type TypographyVariant = keyof typeof typography; 