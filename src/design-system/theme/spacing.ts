// Base unit for spacing (4px)
const BASE_UNIT = 4;

// Spacing scale using 4px base unit
export const spacing = {
  none: 0,
  xs: BASE_UNIT * 1,      // 4px
  sm: BASE_UNIT * 2,      // 8px
  md: BASE_UNIT * 3,      // 12px
  lg: BASE_UNIT * 4,      // 16px
  xl: BASE_UNIT * 5,      // 20px
  '2xl': BASE_UNIT * 6,   // 24px
  '3xl': BASE_UNIT * 8,   // 32px
  '4xl': BASE_UNIT * 10,  // 40px
  '5xl': BASE_UNIT * 12,  // 48px
  '6xl': BASE_UNIT * 16,  // 64px
  '7xl': BASE_UNIT * 20,  // 80px
  '8xl': BASE_UNIT * 24,  // 96px
} as const;

// Enhanced Border radius scale for POS rounded design language
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,    // Cards and containers
  xl: 16,
  '2xl': 20,
  '3xl': 24,  // Pill-shaped buttons
  '4xl': 32,  // Bottom sheets and modals
  full: 9999,
  
  // POS-specific radius tokens
  button: 24,      // Pill-shaped buttons
  input: 12,       // Form inputs
  card: 16,        // Auth cards
  modal: 28,       // Modals and sheets
  badge: 16,       // Role badges
} as const;

// Professional Shadow/elevation definitions for enterprise environment
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Professional subtle shadows
  xs: {
    shadowColor: '#1A1D21', // Professional charcoal shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, // More subtle for professional look
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1A1D21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, // Professional opacity
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1D21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Enterprise-appropriate subtlety
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1A1D21',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10, // Professional shadow depth
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#1A1D21',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12, // Sophisticated elevation
    shadowRadius: 16,
    elevation: 6,
  },
  '2xl': {
    shadowColor: '#1A1D21',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15, // Maximum professional shadow
    shadowRadius: 24,
    elevation: 8,
  },
  
  // Professional component-specific shadows
  professional: {
    card: {
      shadowColor: '#1A1D21',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    button: {
      shadowColor: '#1A1D21',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    modal: {
      shadowColor: '#1A1D21',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 6,
    },
  },
} as const;

// Component-specific spacing
export const componentSpacing = {
  // Button spacing
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  buttonLarge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  buttonSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },

  // Card spacing
  card: {
    padding: spacing.lg,
    margin: spacing.md,
    gap: spacing.md,
  },
  cardLarge: {
    padding: spacing.xl,
    margin: spacing.lg,
    gap: spacing.lg,
  },

  // Input spacing
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.sm,
  },

  // Screen/Container spacing
  screen: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  // Payment-specific spacing
  dialPad: {
    padding: spacing.md,
    buttonGap: spacing.md,
    rowGap: spacing.lg,
  },
  amountDisplay: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickAmounts: {
    gap: spacing.sm,
    marginVertical: spacing.md,
  },

  // POS Authentication-specific spacing
  authCard: {
    padding: spacing.xl,
    margin: spacing.lg,
    gap: spacing.lg,
  },
  authButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  authInput: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginVertical: spacing.sm,
  },
  formSection: {
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  roleSelector: {
    padding: spacing.md,
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  biometricButton: {
    padding: spacing.lg,
    marginVertical: spacing.xl,
  },
} as const;

// Responsive spacing helpers
export const getResponsiveSpacing = (screenWidth: number) => {
  const isSmallScreen = screenWidth < 380;
  const isLargeScreen = screenWidth > 420;
  
  const scale = isSmallScreen ? 0.8 : isLargeScreen ? 1.2 : 1;
  
  return {
    container: {
      paddingHorizontal: Math.round(spacing.md * scale),
      paddingVertical: Math.round(spacing.md * scale),
    },
    card: {
      padding: Math.round(spacing.lg * scale),
      margin: Math.round(spacing.md * scale),
    },
    dialPad: {
      padding: Math.round(spacing.md * scale),
      buttonGap: Math.round(spacing.md * scale),
      rowGap: Math.round(spacing.lg * scale),
    },
    amountDisplay: {
      paddingHorizontal: Math.round(spacing.xl * scale),
      paddingVertical: Math.round(spacing.lg * scale),
      marginBottom: Math.round(spacing.lg * scale),
    },
  };
};

// Touch target sizes (accessibility and POS optimization)
export const touchTargets = {
  minimum: 44, // iOS HIG minimum
  comfortable: 48, // Android minimum
  large: 56, // Large touch target
  
  // POS-specific touch targets
  pos: 56, // POS device minimum (tablets)
  posLarge: 64, // Primary actions on POS
  posHuge: 72, // Emergency/critical actions
  
  // Component-specific targets
  authButton: 56, // Authentication buttons
  formInput: 56, // Form input fields
  roleButton: 48, // Role selection buttons
  biometricButton: 72, // Biometric authentication
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows; 