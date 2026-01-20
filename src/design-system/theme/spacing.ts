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

// APPLE BORDER RADIUS SYSTEM (SOLID Principles - Based on 5 Reference Images)
// Universal, reusable border radius tokens following Apple's design language
export const borderRadius = {
  // CORE UNIVERSAL TOKENS (Single Responsibility - each serves one purpose)
  none: 0,
  xs: 10,    // Small elements (badges, small pills) - Apple minimum
  sm: 14,    // Medium elements (search bars, small buttons) - Apple standard
  md: 20,    // Large elements (standard cards, inputs) - Apple preferred
  lg: 24,    // Extra large elements (large cards, panels) - Apple generous
  xl: 28,    // Hero elements (modals, major panels) - Apple maximum
  pill: '50%', // Perfect pills (toggles, status indicators) - Apple signature
  full: 9999,  // Circular elements (avatars, circular buttons)

  // APPLE REFERENCE IMAGE SPECIFICATIONS (Open/Closed - extensible)
  // Based on direct measurements from the 5 Apple reference images
  appleSmall: 14,    // Small Apple elements (icons, badges)
  appleMedium: 20,   // Medium Apple elements (buttons, inputs)
  appleLarge: 24,    // Large Apple elements (cards, panels)
  appleXLarge: 28,   // Extra large Apple elements (modals, hero sections)
  applePill: '50%',  // Apple perfect pills (toggles, status)

  // UNIVERSAL COMPONENT TOKENS (Interface Segregation - focused purposes)
  // These can be used anywhere without component-specific dependencies
  universalCard: 24,        // Universal card radius - works everywhere
  universalButton: 22,      // Universal button radius - Apple optimized
  universalInput: 18,       // Universal input radius - Apple standard
  universalModal: 28,       // Universal modal radius - Apple hero
  universalToggle: '50%',   // Universal toggle radius - Apple pill
  universalBadge: 12,       // Universal badge radius - Apple small

  // Backward compatibility aliases
  button: 22,               // Alias for universalButton
  card: 24,                 // Alias for universalCard
  input: 18,                // Alias for universalInput
} as const;

// Apple Tahoe Shadow system following Apple's design language
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Apple-style subtle shadows
  xs: {
    shadowColor: '#000000', // Apple uses true black for shadows
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08, // Apple's subtle shadow opacity
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, // Apple's light shadow
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, // Apple's standard shadow
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, // Apple's prominent shadow
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, // Apple's strong shadow
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, // Apple's maximum shadow
    shadowRadius: 24,
    elevation: 10,
  },

  // Apple component-specific shadows
  apple: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, // Apple card shadow
      shadowRadius: 8,
      elevation: 3,
    },
    button: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, // Apple button shadow
      shadowRadius: 4,
      elevation: 2,
    },
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15, // Apple modal shadow
      shadowRadius: 20,
      elevation: 8,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12, // Apple floating element shadow
      shadowRadius: 12,
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
  quantityButton: 28, // Cart quantity buttons
  iconButton: 36, // Icon-only buttons
  searchInput: 40, // Search input height
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows; 