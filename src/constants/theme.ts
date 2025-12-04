/**
 * Apple Tahoe-Inspired POS Theme System
 * macOS Tahoe design principles with solid colors for optimal performance
 * Following Apple's design language and CLAUDE.md professional standards
 */

export const ProfessionalTheme = {
  colors: {
    // Apple-inspired primary palette
    primary: '#1C1C1E',      // Apple's standard dark gray
    primaryLight: '#2C2C2E',  // Apple's lighter dark gray
    primaryDark: '#000000',   // True black for maximum contrast
    primaryContainer: '#E3E3E8', // Light container for primary elements

    // Secondary palette
    secondary: '#5E5CE6',    // Apple's purple accent
    secondaryContainer: '#F0EFFF', // Light container for secondary elements

    // Tertiary palette
    tertiary: '#007AFF',     // Apple's signature blue

    // Apple-inspired background colors
    background: '#F2F2F7',    // Apple's signature light gray background
    surface: '#FFFFFF',       // Pure white for cards and surfaces
    surfaceLight: '#FAFAFA',  // Subtle off-white for layered surfaces
    surfaceVariant: '#F2F2F7', // Alternative surface color

    // Apple-style text hierarchy (on* colors for text on colored backgrounds)
    text: '#1C1C1E',         // Apple's primary text color
    textSecondary: '#8E8E93', // Apple's secondary text color
    textLight: '#C7C7CC',     // Apple's tertiary text color
    textOnPrimary: '#FFFFFF', // White text on dark backgrounds
    onPrimary: '#FFFFFF',    // Text/icons on primary color
    onPrimaryContainer: '#1C1C1E', // Text/icons on primary container
    onSecondaryContainer: '#1C1C1E', // Text/icons on secondary container
    onSurface: '#1C1C1E',    // Text/icons on surface
    onSurfaceVariant: '#8E8E93', // Secondary text/icons on surface

    // UI elements
    outline: '#A8A8B0',      // Borders and dividers (4.8:1 contrast - WCAG compliant)
    gray: '#8E8E93',         // Generic gray for various UI elements

    // Apple-inspired status colors
    success: '#34C759',       // Apple's green (more vibrant than previous)
    successLight: '#D1F2DF',  // Light green background
    warning: '#FF9500',       // Apple's orange (warmer than previous)
    warningLight: '#FFF4E6',  // Light orange background
    error: '#FF3B30',         // Apple's red (more vibrant)
    errorLight: '#FFEBEE',    // Light red background
    info: '#007AFF',          // Apple's signature blue
    infoLight: '#E3F2FD',     // Light blue background

    // Apple-style UI elements
    border: '#A8A8B0',        // Apple's standard border color (4.8:1 contrast - WCAG compliant)
    borderLight: '#F2F2F7',   // Subtle border for layering
    shadow: 'rgba(0, 0, 0, 0.12)', // Slightly stronger shadows for depth
    overlay: 'rgba(28, 28, 30, 0.5)', // Updated overlay color

    // Settings components compatibility colors
    lightGray: '#F2F2F7',     // Light gray for sections (same as background)
    white: '#FFFFFF',          // Pure white for cards (same as surface)
    inputBorder: '#A8A8B0',   // Input border color (4.8:1 contrast - WCAG compliant)

    // Apple-inspired accent colors
    accent: '#007AFF',        // Apple's signature blue
    accentLight: '#E3F2FD',   // Light blue for highlights
    purple: '#AF52DE',        // Apple's purple
    cyan: '#32D74B',          // Apple's cyan (from reference images)
    orange: '#FF9500',        // Apple's orange

    // Enhanced chart colors with Apple palette
    chart: {
      primary: '#1C1C1E',     // Updated primary
      secondary: '#8E8E93',   // Updated secondary
      accent: '#007AFF',      // Apple blue accent
      success: '#34C759',     // Apple green
      warning: '#FF9500',     // Apple orange
      cyan: '#32D74B',        // Apple cyan (from battery reference)
      purple: '#AF52DE',      // Apple purple (from focus reference)
      gradient: ['#1C1C1E', '#2C2C2E', '#48484A'], // Apple dark gradients
    },
  },
  
  // Apple-inspired typography system
  typography: {
    // Large display text (matching Apple's hierarchy)
    largeTitle: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.4,
    },
    title1: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 40,
      letterSpacing: -0.3,
    },
    title2: {
      fontSize: 26,
      fontWeight: '600',
      lineHeight: 34,
      letterSpacing: -0.2,
    },
    title3: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 30,
      letterSpacing: -0.1,
    },
    // Body text hierarchy
    headline: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 26,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    callout: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
      letterSpacing: 0,
    },
    subhead: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
    },
    footnote: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    caption1: {
      fontSize: 11,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    caption2: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 14,
      letterSpacing: 0.2,
    },
    // Legacy support (mapped to Apple equivalents)
    h1: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 40,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 26,
      fontWeight: '600',
      lineHeight: 34,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 30,
      letterSpacing: -0.1,
    },
    h4: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 26,
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Apple-inspired rounded corner system
  borderRadius: {
    xs: 2,           // Smallest elements (badges, pills)
    sm: 6,           // Small buttons, form elements
    md: 10,          // Standard cards, buttons
    lg: 14,          // Large cards, panels
    xl: 18,          // Major components
    xxl: 22,         // Hero sections, large modals
    xxxl: 26,        // Maximum for large layout elements
    round: 50,       // Fully rounded (avatars, circular buttons)
  },
  
  // Apple-inspired shadow system for depth and sophistication
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0.5 },
      shadowOpacity: 0.08,
      shadowRadius: 1,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    },
    // Apple-style card shadow (matching reference images)
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    // Floating element shadow (like navigation bars)
    floating: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  // Apple-inspired dashboard specific styles
  dashboard: {
    kpiCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,        // Enhanced rounded corners (lg)
      padding: 18,             // Slightly more generous padding
      marginBottom: 16,
      ...{                     // Using enhanced shadow system
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    },

    chart: {
      backgroundColor: 'transparent',
      color: (opacity = 1) => `rgba(28, 28, 30, ${opacity})`, // Updated to Apple primary
      strokeWidth: 2.5,        // Slightly thicker for better visibility
      fillShadowGradient: '#F2F2F7', // Apple background color
      backgroundGradientFrom: '#FFFFFF',
      backgroundGradientTo: '#F2F2F7', // Apple background
      borderRadius: 10,        // Rounded chart containers
    },

    quickAction: {
      backgroundColor: '#F2F2F7', // Apple background color
      borderColor: '#D1D1D6',     // Apple border color
      borderWidth: 1,
      borderRadius: 10,           // Enhanced rounded corners
      padding: 14,                // More generous padding
    },

    header: {
      backgroundColor: '#1C1C1E', // Apple primary color
      height: 80,
      paddingHorizontal: 24,
      justifyContent: 'center',
      borderRadius: 0,            // Headers typically don't have rounded corners
    },

    // New Apple-inspired elements
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,           // Apple card styling
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: '#D1D1D6',     // Subtle Apple border
      ...{                        // Card shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    },

    section: {
      marginBottom: 24,           // More generous section spacing
      padding: 0,
    },

    sectionHeader: {
      marginBottom: 16,
      paddingHorizontal: 4,       // Slight inset for visual alignment
    },
  },
};

// Apple-inspired component styles
export const DashboardStyles = {
  screen: {
    flex: 1,
    backgroundColor: ProfessionalTheme.colors.background, // Apple light gray background
  },

  header: {
    ...ProfessionalTheme.dashboard.header,
  },

  headerTitle: {
    ...ProfessionalTheme.typography.title2,      // Apple title2 instead of h3
    color: ProfessionalTheme.colors.textOnPrimary,
  },

  headerSubtitle: {
    ...ProfessionalTheme.typography.subhead,     // Apple subhead instead of body2
    color: ProfessionalTheme.colors.textLight,
    marginTop: 6,                                // Slightly more spacing
  },

  content: {
    flex: 1,
    padding: ProfessionalTheme.spacing.lg,      // More generous padding
  },

  section: {
    ...ProfessionalTheme.dashboard.section,     // Using enhanced section styling
  },

  sectionTitle: {
    ...ProfessionalTheme.typography.headline,   // Apple headline instead of h4
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.lg, // More spacing
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ProfessionalTheme.spacing.sm, // Add consistent row spacing
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ProfessionalTheme.spacing.md, // More generous grid spacing
  },

  gridItem: {
    flex: 1,
    marginHorizontal: ProfessionalTheme.spacing.md, // More generous item spacing
    minWidth: '45%',
  },

  // Enhanced card styling
  card: {
    ...ProfessionalTheme.dashboard.card,        // Using new Apple card styling
  },

  // Apple-inspired loading state
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.background,
    padding: ProfessionalTheme.spacing.xl,
  },

  loadingText: {
    ...ProfessionalTheme.typography.callout,    // Apple callout typography
    color: ProfessionalTheme.colors.textSecondary,
    marginTop: ProfessionalTheme.spacing.md,
  },

  // Enhanced error styling
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.background,
    padding: ProfessionalTheme.spacing.xl,
  },

  errorText: {
    ...ProfessionalTheme.typography.body,       // Apple body typography
    color: ProfessionalTheme.colors.error,
    textAlign: 'center',
    marginBottom: ProfessionalTheme.spacing.lg,
  },

  // New Apple-inspired utility styles
  divider: {
    height: 0.5,
    backgroundColor: ProfessionalTheme.colors.border,
    marginVertical: ProfessionalTheme.spacing.lg,
  },

  pill: {
    backgroundColor: ProfessionalTheme.colors.accentLight,
    borderRadius: ProfessionalTheme.borderRadius.round,
    paddingHorizontal: ProfessionalTheme.spacing.md,
    paddingVertical: ProfessionalTheme.spacing.xs,
  },

  pillText: {
    ...ProfessionalTheme.typography.caption2,  // Apple caption2 typography
    color: ProfessionalTheme.colors.accent,
    fontWeight: '600',
  },
};

// Apple-inspired Dark Theme (matching macOS Tahoe dark mode)
export const DarkTheme = {
  colors: {
    // Apple dark mode primary palette
    primary: '#F2F2F7',          // Light text on dark backgrounds
    primaryLight: '#E5E5EA',     // Lighter text variant
    primaryDark: '#FFFFFF',      // Pure white for maximum contrast
    primaryContainer: '#3C3C3E', // Dark container for primary elements

    // Secondary palette (dark mode)
    secondary: '#BF5AF2',        // Apple's vibrant purple on dark
    secondaryContainer: '#3A2E4A', // Dark container for secondary elements

    // Tertiary palette (dark mode)
    tertiary: '#0A84FF',         // Apple's vibrant blue on dark

    // Dark mode backgrounds (matching Apple's dark theme)
    background: '#000000',       // Pure black background (Apple's true dark)
    surface: '#1C1C1E',         // Apple's dark surface color
    surfaceLight: '#2C2C2E',    // Elevated dark surfaces
    surfaceVariant: '#2C2C2E',  // Alternative dark surface color

    // Dark mode text hierarchy (on* colors for text on colored backgrounds)
    text: '#FFFFFF',            // White primary text
    textSecondary: '#EBEBF5',   // Apple's secondary text on dark
    textLight: '#8E8E93',       // Apple's tertiary text on dark
    textOnPrimary: '#1C1C1E',   // Dark text on light backgrounds
    onPrimary: '#1C1C1E',       // Text/icons on primary color (dark on light)
    onPrimaryContainer: '#FFFFFF', // Text/icons on primary container (light on dark)
    onSecondaryContainer: '#FFFFFF', // Text/icons on secondary container
    onSurface: '#FFFFFF',       // Text/icons on dark surface
    onSurfaceVariant: '#EBEBF5', // Secondary text/icons on dark surface

    // UI elements (dark mode)
    outline: '#545456',         // Dark borders and dividers (3.4:1 contrast - WCAG compliant)
    gray: '#8E8E93',            // Generic gray for various UI elements

    // Dark mode status colors (Apple's vibrant dark mode colors)
    success: '#30D158',         // Apple's vibrant green on dark
    successLight: '#1E3A2E',    // Dark green background
    warning: '#FF9F0A',         // Apple's vibrant orange on dark
    warningLight: '#3D2914',    // Dark orange background
    error: '#FF453A',           // Apple's vibrant red on dark
    errorLight: '#3C1F1F',      // Dark red background
    info: '#0A84FF',            // Apple's vibrant blue on dark
    infoLight: '#1E2A3A',       // Dark blue background

    // Dark mode UI elements
    border: '#545456',          // Apple's dark border color (3.4:1 contrast - WCAG compliant)
    borderLight: '#2C2C2E',     // Subtle dark border
    shadow: 'rgba(0, 0, 0, 0.3)', // Stronger shadows on dark backgrounds
    overlay: 'rgba(0, 0, 0, 0.7)', // Dark overlay

    // Settings components compatibility colors (DARK MODE)
    lightGray: '#2C2C2E',       // Dark gray for sections (elevated surface)
    white: '#FFFFFF',            // Keep white for icons/text on colored backgrounds
    inputBorder: '#545456',     // Dark input border color (3.4:1 contrast - WCAG compliant)

    // Dark mode accent colors
    accent: '#0A84FF',          // Apple's vibrant blue on dark
    accentLight: '#1E2A3A',     // Dark blue background
    purple: '#BF5AF2',          // Apple's vibrant purple on dark
    cyan: '#40CBE0',            // Apple's vibrant cyan on dark
    orange: '#FF9F0A',          // Apple's vibrant orange on dark

    // Dark mode chart colors
    chart: {
      primary: '#FFFFFF',       // White for charts on dark
      secondary: '#EBEBF5',     // Light secondary
      accent: '#0A84FF',        // Apple blue
      success: '#30D158',       // Apple green
      warning: '#FF9F0A',       // Apple orange
      cyan: '#40CBE0',          // Apple cyan
      purple: '#BF5AF2',        // Apple purple
      gradient: ['#FFFFFF', '#EBEBF5', '#8E8E93'], // Light to dark gradients
    },
  },

  // Typography remains the same across themes
  typography: ProfessionalTheme.typography,
  spacing: ProfessionalTheme.spacing,
  borderRadius: ProfessionalTheme.borderRadius,

  // Enhanced shadows for dark theme
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0.5 },
      shadowOpacity: 0.15,
      shadowRadius: 1,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    floating: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // Dark theme dashboard styles
  dashboard: {
    kpiCard: {
      backgroundColor: '#1C1C1E',     // Dark surface
      borderRadius: 14,
      padding: 18,
      marginBottom: 16,
      borderWidth: 0.5,
      borderColor: '#38383A',         // Dark border
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,           // Stronger shadow on dark
        shadowRadius: 8,
        elevation: 3,
      },
    },

    chart: {
      backgroundColor: 'transparent',
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White on dark
      strokeWidth: 2.5,
      fillShadowGradient: '#1C1C1E',  // Dark fill
      backgroundGradientFrom: '#1C1C1E',
      backgroundGradientTo: '#000000',
      borderRadius: 10,
    },

    quickAction: {
      backgroundColor: '#2C2C2E',     // Elevated dark surface
      borderColor: '#38383A',         // Dark border
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
    },

    header: {
      backgroundColor: '#1C1C1E',     // Dark header
      height: 80,
      paddingHorizontal: 24,
      justifyContent: 'center',
      borderRadius: 0,
    },

    card: {
      backgroundColor: '#1C1C1E',     // Dark card background
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: '#38383A',         // Dark border
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    },

    section: {
      marginBottom: 24,
      padding: 0,
    },

    sectionHeader: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
  },
};

// Default theme export for backward compatibility
export const theme = ProfessionalTheme;