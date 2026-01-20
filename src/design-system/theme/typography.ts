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

// Professional Font weights for enterprise environment
export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const, // Added for professional headers
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

  // Professional Title styles for enterprise environment
  titleLarge: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold, // Increased weight for professional hierarchy
    fontSize: getFontSize(22),
    lineHeight: getFontSize(28),
    letterSpacing: -0.15, // Tighter spacing for professional look
  },
  titleMedium: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.semibold, // Professional weight
    fontSize: getFontSize(18),
    lineHeight: getFontSize(24),
    letterSpacing: -0.1, // Professional letter spacing
  },
  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold, // Professional weight
    fontSize: getFontSize(16),
    lineHeight: getFontSize(20),
    letterSpacing: 0,
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

  // Professional POS Authentication typography for enterprise
  authTitle: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.black, // Professional header weight
    fontSize: getFontSize(32),
    lineHeight: getFontSize(40),
    letterSpacing: -0.75, // Tighter professional spacing
  },
  authSubtitle: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium, // Professional subtitle weight
    fontSize: getFontSize(18),
    lineHeight: getFontSize(24),
    letterSpacing: -0.1, // Professional spacing
  },
  authBody: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(24),
    letterSpacing: 0,
  },
  authButton: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold, // Professional button weight
    fontSize: getFontSize(16), // Slightly smaller for professional look
    lineHeight: getFontSize(22),
    letterSpacing: 0.5, // Wide spacing for buttons
    textTransform: 'uppercase' as const, // Professional button style
  },
  authInput: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(24),
    letterSpacing: 0,
  },
  authLabel: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold, // Professional label weight
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    letterSpacing: 0.2, // Professional spacing
  },
  authError: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium, // Professional error weight
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.2,
  },
  authHelper: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.1,
  },
  roleTitle: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold, // Professional role title weight
    fontSize: getFontSize(16),
    lineHeight: getFontSize(22),
    letterSpacing: 0,
  },
  roleDescription: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium, // Professional description weight
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.1,
  },
  otpDigit: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.extrabold, // Professional OTP weight
    fontSize: getFontSize(24),
    lineHeight: getFontSize(32),
    letterSpacing: 2, // Wide spacing for OTP digits
  },

  // Professional POS-specific typography
  posHeader: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.black, // Strong professional header
    fontSize: getFontSize(24),
    lineHeight: getFontSize(30),
    letterSpacing: -0.5,
  },
  posSubheader: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(18),
    lineHeight: getFontSize(24),
    letterSpacing: -0.2,
  },
  posButtonPrimary: {
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeights.bold,
    fontSize: getFontSize(16),
    lineHeight: getFontSize(22),
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  posButtonSecondary: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.semibold,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  posCaption: {
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeights.medium,
    fontSize: getFontSize(12),
    lineHeight: getFontSize(16),
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
  },

  // Caption style for small descriptive text
  caption: {
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeights.regular,
    fontSize: getFontSize(11),
    lineHeight: getFontSize(14),
    letterSpacing: 0.4,
  },
} as const;

// Professional responsive typography helpers for enterprise environment
export const getResponsiveTypography = (screenWidth: number) => {
  const isSmallScreen = screenWidth < 380;
  const isLargeScreen = screenWidth > 420;
  const isTablet = screenWidth >= 768;
  
  // Professional scaling factors
  const scale = isSmallScreen ? 0.9 : isLargeScreen ? 1.05 : 1; // More conservative scaling
  const tabletScale = isTablet ? 1.1 : 1;
  
  return {
    // Professional responsive amount styling
    amount: {
      ...typography.amount,
      fontSize: getFontSize(
        isSmallScreen ? 36 : isTablet ? 52 : isLargeScreen ? 52 : 48, 
        scale * tabletScale
      ),
    },
    currency: {
      ...typography.currency,
      fontSize: getFontSize(
        isSmallScreen ? 28 : isTablet ? 40 : isLargeScreen ? 40 : 36, 
        scale * tabletScale
      ),
    },
    dialButton: {
      ...typography.dialButton,
      fontSize: getFontSize(
        isSmallScreen ? 20 : isTablet ? 26 : isLargeScreen ? 26 : 24, 
        scale * tabletScale
      ),
    },
    // Professional title responsive sizing
    title: {
      ...typography.posHeader, // Use professional header style
      fontSize: getFontSize(
        isSmallScreen ? 20 : isTablet ? 28 : isLargeScreen ? 26 : 24, 
        scale * tabletScale
      ),
    },
    // Professional POS-specific responsive styles
    posHeader: {
      ...typography.posHeader,
      fontSize: getFontSize(
        isSmallScreen ? 20 : isTablet ? 28 : isLargeScreen ? 26 : 24,
        scale * tabletScale
      ),
    },
    posButton: {
      ...typography.posButtonPrimary,
      fontSize: getFontSize(
        isSmallScreen ? 14 : isTablet ? 18 : isLargeScreen ? 17 : 16,
        scale * tabletScale
      ),
    },
  };
};

export type TypographyVariant = keyof typeof typography;

// Professional typography constants for consistent enterprise styling
export const professionalTypographyConstants = {
  // Enterprise-appropriate line heights
  tightLineHeight: 1.2, // For headers
  normalLineHeight: 1.4, // For body text
  relaxedLineHeight: 1.6, // For descriptions
  
  // Professional letter spacing
  tightSpacing: -0.5,
  normalSpacing: 0,
  wideSpacing: 0.5,
  buttonSpacing: 1.0, // For uppercase buttons
  
  // Professional font size scales
  scaleMinor: 1.125, // Minor second (9:8)
  scaleMajor: 1.25,  // Major third (5:4)
  scaleAugmented: 1.414, // Augmented fourth (√2:1)
} as const; 