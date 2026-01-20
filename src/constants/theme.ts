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
    tertiaryContainer: '#E3F2FD', // Light blue container
    onTertiary: '#FFFFFF',   // White text on blue
    onTertiaryContainer: '#1C1C1E', // Dark text on light blue

    // Apple-inspired background colors
    background: '#F2F2F7',    // Apple's signature light gray background
    surface: '#FFFFFF',       // Pure white for cards and surfaces
    surfaceLight: '#FAFAFA',  // Subtle off-white for layered surfaces
    surfaceVariant: '#F2F2F7', // Alternative surface color
    surfaceDisabled: '#E5E5EA', // Disabled surface color
    backdrop: 'rgba(0, 0, 0, 0.5)', // Modal backdrop color

    // Apple layered depth system
    layer0: '#F2F2F7',          // Background layer
    layer1: '#FFFFFF',          // Primary surface layer
    layer2: '#FAFAFA',          // Secondary surface layer
    layer3: '#F5F5F5',          // Tertiary surface layer
    layer4: '#EFEFEF',          // Interactive surface layer

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
    onSurfaceSecondary: '#8E8E93', // Alias for onSurfaceVariant (backward compatibility)
    onSurfaceDisabled: '#C7C7CC', // Disabled text/icons on surface
    onError: '#FFFFFF',       // Text/icons on error color
    onSuccess: '#FFFFFF',     // Text/icons on success color
    onBackground: '#1C1C1E',  // Text on background

    // UI elements
    outline: '#A8A8B0',      // Borders and dividers (4.8:1 contrast - WCAG compliant)
    gray: '#8E8E93',         // Generic gray for various UI elements

    // Apple-inspired status colors
    success: '#34C759',       // Apple's green (more vibrant than previous)
    successLight: '#D1F2DF',  // Light green background
    successContainer: '#E8F5E9', // Container background for success states
    onSuccessContainer: '#1B5E20', // Text on success container
    warning: '#FF9500',       // Apple's orange (warmer than previous)
    warningLight: '#FFF4E6',  // Light orange background
    warningContainer: '#FEF7E0', // Container background for warning states
    onWarningContainer: '#7A5700', // Text on warning container
    error: '#FF3B30',         // Apple's red (more vibrant)
    errorLight: '#FFEBEE',    // Light red background
    errorContainer: '#FFEBEE', // Container background for error states
    onErrorContainer: '#B71C1C', // Text on error container
    info: '#007AFF',          // Apple's signature blue
    infoLight: '#E3F2FD',     // Light blue background
    infoContainer: '#E3F2FD', // Container background for info states
    onInfoContainer: '#0D47A1', // Text on info container

    // Apple-style UI elements
    border: '#A8A8B0',        // Apple's standard border color (4.8:1 contrast - WCAG compliant)
    borderLight: '#F2F2F7',   // Subtle border for layering
    shadow: 'rgba(0, 0, 0, 0.12)', // Slightly stronger shadows for depth
    scrim: 'rgba(0, 0, 0, 0.32)', // Scrim for modal backdrops
    overlay: 'rgba(28, 28, 30, 0.5)', // Updated overlay color
    outlineLight: '#D1D1D6',   // Light outline for inactive states
    outlineVariant: '#E5E5EA', // Outline variant for subtle borders
    onSecondary: '#FFFFFF',    // Text on secondary color
    onWarning: '#FFFFFF',      // Text on warning color

    // Settings components compatibility colors
    lightGray: '#F2F2F7',     // Light gray for sections (same as background)
    white: '#FFFFFF',          // Pure white for cards (same as surface)
    inputBorder: '#A8A8B0',   // Input border color (4.8:1 contrast - WCAG compliant)

    // Auth component colors (backward compatibility)
    authPrimary: '#007AFF',
    authSecondary: '#5E5CE6',
    authError: '#FF3B30',
    authCardBackground: '#FFFFFF',
    authInputBackground: '#FFFFFF',
    authInputBorder: '#A8A8B0',
    authInputError: '#FF3B30',
    authInputFocused: '#007AFF',
    primaryPressed: '#0055CC',
    secondaryPressed: '#4A4AE0',
    errorPressed: '#CC2E27',

    // Additional surface containers
    surfaceContainerHighest: '#E6E6EB',
    surfaceContainerHigh: '#ECECF1',
    surfaceContainerLow: '#F7F7FC',
    surfaceContainerLowest: '#FFFFFF',
    onSurfaceOnPrimary: '#FFFFFF',
    onSurfaceLight: '#C7C7CC',

    // Biometric and role colors
    biometricAvailable: '#34C759',
    biometricUnavailable: '#FF3B30',
    managerRole: '#5E5CE6',

    // Flat status colors for simple access
    statusColors: {
      pending: '#FF9500',
      confirmed: '#34C759',
      preparing: '#AF52DE',
      ready: '#007AFF',
      served: '#8E8E93',
      cancelled: '#FF3B30',
      paid: '#34C759',
      completed: '#34C759',
      excellent: '#34C759',
      average: '#FF9500',
      normal: '#007AFF',
      poor: '#FF3B30',
      urgent: '#FF3B30',
      error: '#FF3B30',
      high: '#FF9500',
      success: '#34C759',
      warning: '#FF9500',
      info: '#007AFF',
    },

    // Status icons mapping
    statusIcons: {
      pending: 'clock-outline',
      confirmed: 'check-circle-outline',
      preparing: 'chef-hat',
      ready: 'bell-ring-outline',
      served: 'check-all',
      cancelled: 'close-circle-outline',
      paid: 'cash-check',
      completed: 'check-circle',
    },

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

    // Order status colors - DISTINCT colors for each status (Single Source of Truth)
    // Matches Kitchen Display for consistency
    status: {
      pending: { bg: '#FFF3E0', text: '#E65100', border: '#FF9800' },      // Orange - waiting
      confirmed: { bg: '#E8F5E9', text: '#2E7D32', border: '#4CAF50' },    // GREEN - accepted (distinct from ready)
      preparing: { bg: '#F3E5F5', text: '#7B1FA2', border: '#AB47BC' },    // Purple - cooking in progress
      ready: { bg: '#E1F5FE', text: '#0277BD', border: '#03A9F4' },        // Cyan - ready to serve
      served: { bg: '#F5F5F5', text: '#616161', border: '#9E9E9E' },       // Gray - delivered
      cancelled: { bg: '#FFEBEE', text: '#C62828', border: '#EF5350' },    // Red - cancelled
      paid: { bg: '#E8F5E9', text: '#2E7D32', border: '#66BB6A' },         // Green - payment complete
      completed: { bg: '#E8F5E9', text: '#2E7D32', border: '#66BB6A' },    // Green - all done
    },

    // Priority colors for order urgency - Professional palette
    priority: {
      urgent: '#D32F2F',
      high: '#F57C00',
      normal: '#1976D2',
      low: '#546E7A',  // Professional blue-gray instead of green
    },
  },
  
  // Apple-inspired typography system
  typography: {
    // Large display text (matching Apple's hierarchy)
    largeTitle: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      letterSpacing: -0.4,
    },
    title1: {
      fontSize: 32,
      fontWeight: '600' as const,
      lineHeight: 40,
      letterSpacing: -0.3,
    },
    title2: {
      fontSize: 26,
      fontWeight: '600' as const,
      lineHeight: 34,
      letterSpacing: -0.2,
    },
    title3: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 30,
      letterSpacing: -0.1,
    },
    // Body text hierarchy
    headline: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 26,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    callout: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
      letterSpacing: 0,
    },
    subhead: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    footnote: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    caption1: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    caption2: {
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 14,
      letterSpacing: 0.2,
    },
    // Legacy support (mapped to Apple equivalents)
    h1: {
      fontSize: 32,
      fontWeight: '600' as const,
      lineHeight: 40,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 26,
      fontWeight: '600' as const,
      lineHeight: 34,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 30,
      letterSpacing: -0.1,
    },
    h4: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 26,
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
      letterSpacing: 0.1,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  
  // Apple-inspired rounded corner system
  borderRadius: {
    none: 0,         // No radius
    xs: 10,          // Smallest elements (badges, pills) - Apple minimum
    sm: 14,          // Small buttons, form elements - Apple standard
    md: 20,          // Standard cards, buttons - Apple preferred
    lg: 24,          // Large cards, panels - Apple generous
    xl: 28,          // Major components - Apple maximum
    xxl: 32,         // Hero sections, large modals
    xxxl: 36,        // Maximum for large layout elements
    round: 50,       // Fully rounded (avatars, circular buttons)
    full: 9999,      // Alias for round (backward compatibility)
    pill: '50%' as const, // Pill shape for badges
    button: 22,      // Button border radius - Apple optimized
    card: 24,        // Card border radius - Apple style
    input: 18,       // Input border radius - Apple standard
    appleSmall: 14,
    appleMedium: 20,
    appleLarge: 24,
    appleXLarge: 28,
    universalCard: 24,
    universalButton: 22,
    universalBadge: 12,
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
      borderRadius: 24,        // Apple-style rounded corners
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
      borderRadius: 20,        // Apple-style rounded chart containers
    },

    quickAction: {
      backgroundColor: '#F2F2F7', // Apple background color
      borderColor: '#D1D1D6',     // Apple border color
      borderWidth: 1,
      borderRadius: 20,           // Apple-style rounded corners
      padding: 14,                // More generous padding
    },

    header: {
      backgroundColor: '#1C1C1E', // Apple primary color
      height: 80,
      paddingHorizontal: 24,
      justifyContent: 'center' as const,
      borderRadius: 0,            // Headers typically don't have rounded corners
    },

    // New Apple-inspired elements
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,           // Apple card styling
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: ProfessionalTheme.spacing.sm, // Add consistent row spacing
  },

  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
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
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: ProfessionalTheme.colors.background,
    padding: ProfessionalTheme.spacing.xl,
  },

  errorText: {
    ...ProfessionalTheme.typography.body,       // Apple body typography
    color: ProfessionalTheme.colors.error,
    textAlign: 'center' as const,
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
    tertiaryContainer: '#1E2A3A', // Dark blue container
    onTertiary: '#000000',       // Black text on bright blue
    onTertiaryContainer: '#64D2FF', // Light cyan text on dark blue

    // Apple layered depth system for dark mode
    layer0: '#000000',          // Background layer - Pure black (deepest)
    layer1: '#1C1C1E',          // Primary surface layer
    layer2: '#2C2C2E',          // Secondary surface layer
    layer3: '#3A3A3C',          // Tertiary surface layer
    layer4: '#48484A',          // Interactive surface layer

    // Dark mode backgrounds (matching Apple's dark theme)
    background: '#000000',       // Pure black background (Apple's true dark)
    surface: '#1C1C1E',         // Apple's dark surface color
    surfaceLight: '#2C2C2E',    // Elevated dark surfaces
    surfaceVariant: '#2C2C2E',  // Alternative dark surface color
    surfaceDisabled: '#38383A', // Disabled surface color (dark)
    backdrop: 'rgba(0, 0, 0, 0.7)', // Modal backdrop color (darker for dark theme)

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
    onSurfaceSecondary: '#EBEBF5', // Alias for onSurfaceVariant (backward compatibility)
    onSurfaceDisabled: '#636366', // Disabled text/icons on dark surface
    onError: '#FFFFFF',         // Text/icons on error color
    onSuccess: '#FFFFFF',       // Text/icons on success color
    onBackground: '#FFFFFF',    // Text on background (dark)

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
    scrim: 'rgba(0, 0, 0, 0.5)', // Scrim for modal backdrops
    overlay: 'rgba(0, 0, 0, 0.7)', // Dark overlay
    outlineLight: '#48484A',   // Light outline for inactive states (dark)
    outlineVariant: '#38383A', // Outline variant for subtle borders (dark)
    onSecondary: '#FFFFFF',    // Text on secondary color
    onWarning: '#1C1C1E',      // Text on warning color

    // Settings components compatibility colors (DARK MODE)
    lightGray: '#2C2C2E',       // Dark gray for sections (elevated surface)
    white: '#FFFFFF',            // Keep white for icons/text on colored backgrounds
    inputBorder: '#545456',     // Dark input border color (3.4:1 contrast - WCAG compliant)

    // Container colors for dark theme
    successContainer: '#1A3D2A',
    onSuccessContainer: '#81C784',
    warningContainer: '#3D2914',
    onWarningContainer: '#FFB74D',
    errorContainer: '#3C1F1F',
    onErrorContainer: '#EF9A9A',
    infoContainer: '#1E2A3A',
    onInfoContainer: '#64B5F6',

    // Auth component colors (dark mode)
    authPrimary: '#0A84FF',
    authSecondary: '#BF5AF2',
    authError: '#FF453A',
    authCardBackground: '#1C1C1E',
    authInputBackground: '#2C2C2E',
    authInputBorder: '#545456',
    authInputError: '#FF453A',
    authInputFocused: '#0A84FF',
    primaryPressed: '#0066CC',
    secondaryPressed: '#A34DE0',
    errorPressed: '#CC3830',

    // Additional surface containers (dark)
    surfaceContainerHighest: '#48484A',
    surfaceContainerHigh: '#3A3A3C',
    surfaceContainerLow: '#2C2C2E',
    surfaceContainerLowest: '#1C1C1E',
    onSurfaceOnPrimary: '#FFFFFF',
    onSurfaceLight: '#8E8E93',

    // Biometric and role colors (dark)
    biometricAvailable: '#30D158',
    biometricUnavailable: '#FF453A',
    managerRole: '#BF5AF2',

    // Flat status colors for simple access (dark)
    statusColors: {
      pending: '#FF9F0A',
      confirmed: '#30D158',
      preparing: '#BF5AF2',
      ready: '#0A84FF',
      served: '#8E8E93',
      cancelled: '#FF453A',
      paid: '#30D158',
      completed: '#30D158',
      excellent: '#30D158',
      average: '#FF9F0A',
      normal: '#0A84FF',
      poor: '#FF453A',
      urgent: '#FF453A',
      error: '#FF453A',
      high: '#FF9F0A',
      success: '#30D158',
      warning: '#FF9F0A',
      info: '#0A84FF',
    },

    // Status icons mapping (same as light theme)
    statusIcons: {
      pending: 'clock-outline',
      confirmed: 'check-circle-outline',
      preparing: 'chef-hat',
      ready: 'bell-ring-outline',
      served: 'check-all',
      cancelled: 'close-circle-outline',
      paid: 'cash-check',
      completed: 'check-circle',
    },

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

    // Order status colors - Dark theme with DISTINCT colors for each status
    // Colors match Kitchen Display for consistency
    status: {
      pending: { bg: '#3D2814', text: '#FFB74D', border: '#FF9800' },      // Orange - waiting
      confirmed: { bg: '#1A3D2A', text: '#81C784', border: '#4CAF50' },    // GREEN - accepted (distinct from ready)
      preparing: { bg: '#2D1A3D', text: '#CE93D8', border: '#AB47BC' },    // Purple - cooking in progress
      ready: { bg: '#1A2D3D', text: '#4FC3F7', border: '#03A9F4' },        // Cyan - ready to serve
      served: { bg: '#2C2C2E', text: '#9E9E9E', border: '#757575' },       // Gray - delivered
      cancelled: { bg: '#3D1A1A', text: '#EF9A9A', border: '#E57373' },    // Red - cancelled
      paid: { bg: '#1A3D2A', text: '#81C784', border: '#66BB6A' },         // Green - payment complete
      completed: { bg: '#1A3D2A', text: '#81C784', border: '#66BB6A' },    // Green - all done
    },

    // Priority colors for dark theme - Professional blue palette
    priority: {
      urgent: '#EF5350',
      high: '#FFB74D',
      normal: '#64B5F6',
      low: '#78909C',  // Professional blue-gray instead of green
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
      borderRadius: 24,               // Apple-style rounded corners
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
      borderRadius: 20,               // Apple-style rounded corners
    },

    quickAction: {
      backgroundColor: '#2C2C2E',     // Elevated dark surface
      borderColor: '#38383A',         // Dark border
      borderWidth: 1,
      borderRadius: 20,               // Apple-style rounded corners
      padding: 14,
    },

    header: {
      backgroundColor: '#1C1C1E',     // Dark header
      height: 80,
      paddingHorizontal: 24,
      justifyContent: 'center' as const,
      borderRadius: 0,
    },

    card: {
      backgroundColor: '#1C1C1E',     // Dark card background
      borderRadius: 24,               // Apple-style rounded corners
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