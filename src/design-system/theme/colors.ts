export const colors = {
  // Professional Primary Colors (Charcoal Theme)
  primary: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#6C757D',
    500: '#1A1D21', // Professional Charcoal
    600: '#161A1D',
    700: '#121619',
    800: '#0E1214',
    900: '#0A0C0F',
  },

  // Professional Secondary Colors (Gray Accent)
  secondary: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#4A4A4A', // Professional Gray
    600: '#404040',
    700: '#363636',
    800: '#2C2C2C',
    900: '#222222',
  },

  // Professional Success Colors
  success: {
    50: '#F0F9F0',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#4CAF50',
    500: '#1E7E34', // Professional Green
    600: '#1B5E20',
    700: '#2E7D32',
    800: '#388E3C',
    900: '#43A047',
  },

  // Professional Error Colors
  error: {
    50: '#FFF5F5',
    100: '#FED7D7',
    200: '#FEB2B2',
    300: '#FC8181',
    400: '#F56565',
    500: '#B71C1C', // Professional Dark Red
    600: '#C53030',
    700: '#9B2C2C',
    800: '#822727',
    900: '#63171B',
  },

  // Professional Warning Colors
  warning: {
    50: '#FFFBF0',
    100: '#FEF5E7',
    200: '#FAE5B7',
    300: '#F6D55C',
    400: '#ECC94B',
    500: '#B8860B', // Professional Gold
    600: '#D69E2E',
    700: '#B7791F',
    800: '#975A16',
    900: '#744210',
  },

  // Neutral/Gray Colors
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Glass/Frosted Colors (for glassmorphism)
  glass: {
    white: 'rgba(255, 255, 255, 0.25)',
    whiteDark: 'rgba(255, 255, 255, 0.15)',
    black: 'rgba(0, 0, 0, 0.25)',
    blackDark: 'rgba(0, 0, 0, 0.15)',
    primary: 'rgba(33, 150, 243, 0.25)',
    secondary: 'rgba(156, 39, 176, 0.25)',
  },

  // Professional Gradient Colors
  gradients: {
    primary: ['#1A1D21', '#161A1D'],
    secondary: ['#4A4A4A', '#363636'],
    success: ['#1E7E34', '#2E7D32'],
    error: ['#B71C1C', '#9B2C2C'],
    warning: ['#B8860B', '#B7791F'],
    neutral: ['#E0E0E0', '#BDBDBD'],
    glass: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)'],
  },

  // Professional Accent Colors
  accent: {
    50: '#F0F7FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#2C5AA0', // Professional Blue Accent
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const;

// Professional Light Theme Colors
export const lightTheme = {
  primary: colors.primary[500], // Professional Charcoal
  primaryContainer: colors.primary[50], // Light Gray Container
  onPrimary: colors.neutral[0], // White on charcoal
  onPrimaryContainer: colors.primary[500], // Charcoal on light

  secondary: colors.secondary[500], // Professional Gray
  secondaryContainer: colors.secondary[100], // Light gray container
  onSecondary: colors.neutral[0], // White on gray
  onSecondaryContainer: colors.secondary[900], // Dark on light

  tertiary: colors.accent[500], // Professional Blue Accent
  tertiaryContainer: colors.accent[100], // Light blue container
  onTertiary: colors.neutral[0], // White on blue
  onTertiaryContainer: colors.accent[900], // Dark blue on light

  error: colors.error[500], // Professional Dark Red
  errorContainer: colors.error[50], // Light error container
  onError: colors.neutral[0], // White on error
  onErrorContainer: colors.error[900], // Dark red on light

  background: '#F5F6F7', // Off-white professional background
  onBackground: colors.primary[500], // Professional charcoal text
  surface: colors.neutral[0], // Clean white surface
  onSurface: colors.primary[500], // Professional charcoal text
  surfaceVariant: '#F8F9FA', // Light gray variant
  onSurfaceVariant: colors.secondary[700], // Professional gray text
  surfaceDisabled: colors.neutral[200],
  onSurfaceDisabled: colors.neutral[400],

  outline: colors.neutral[300],
  outlineVariant: colors.neutral[200],
  shadow: colors.neutral[1000],
  scrim: colors.neutral[1000],

  // Professional Status Colors
  success: colors.success[500], // Professional Green
  successContainer: colors.success[50], // Light green container
  onSuccess: colors.neutral[0], // White on green
  onSuccessContainer: colors.success[900], // Dark green on light

  warning: colors.warning[500], // Professional Gold
  warningContainer: colors.warning[50], // Light gold container
  onWarning: colors.neutral[0], // White on gold
  onWarningContainer: colors.warning[900], // Dark gold on light

  // Professional Glass/Frosted elements
  glass: colors.glass.white,
  glassStrong: colors.glass.whiteDark,
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // Professional Payment colors
  amount: colors.primary[500], // Professional charcoal
  currencySymbol: colors.secondary[600], // Professional gray
  dialButton: colors.neutral[0],
  dialButtonActive: colors.primary[50],
  payButton: colors.success[500], // Professional green
  clearButton: colors.error[500], // Professional red

  // Professional POS Authentication colors
  authPrimary: colors.primary[500], // Professional charcoal
  authSecondary: colors.secondary[500], // Professional gray
  authSuccess: colors.success[500], // Professional green
  authError: colors.error[500], // Professional red
  authWarning: colors.warning[500], // Professional gold
  
  // Professional Staff role colors
  staffRole: colors.secondary[600], // Professional gray for staff
  managerRole: colors.accent[600], // Professional blue for managers
  adminRole: colors.primary[600], // Professional charcoal for admin
  
  // Professional Authentication states
  authCardBackground: colors.neutral[0],
  authInputBackground: colors.primary[50], // Light professional background
  authInputBorder: colors.neutral[300],
  authInputFocused: colors.primary[500], // Professional charcoal focus
  authInputError: colors.error[500], // Professional red error
  
  // Professional Biometric colors
  biometricAvailable: colors.success[500], // Professional green
  biometricUnavailable: colors.neutral[400],
  biometricError: colors.error[500], // Professional red

  // Professional Pressed states
  successPressed: colors.success[600],
  primaryPressed: colors.primary[600], // Professional charcoal pressed
  secondaryPressed: colors.secondary[600], // Professional gray pressed
  errorPressed: colors.error[600], // Professional red pressed
} as const;

// Professional Dark Theme Colors (for future implementation)
export const darkTheme = {
  primary: colors.primary[300], // Lighter charcoal for dark theme
  primaryContainer: colors.primary[800], // Dark charcoal container
  onPrimary: colors.neutral[0], // White on charcoal
  onPrimaryContainer: colors.primary[100], // Light on dark

  secondary: colors.secondary[300], // Lighter gray for dark theme
  secondaryContainer: colors.secondary[800], // Dark gray container
  onSecondary: colors.neutral[0], // White on gray
  onSecondaryContainer: colors.secondary[100], // Light on dark

  tertiary: colors.accent[300], // Lighter professional blue
  tertiaryContainer: colors.accent[800], // Dark blue container
  onTertiary: colors.neutral[0], // White on blue
  onTertiaryContainer: colors.accent[100], // Light on dark

  error: colors.error[300], // Lighter professional red
  errorContainer: colors.error[800], // Dark red container
  onError: colors.neutral[0], // White on red
  onErrorContainer: colors.error[100], // Light on dark

  background: colors.primary[900], // Deep professional charcoal
  onBackground: colors.neutral[100], // Light text on dark
  surface: colors.primary[800], // Professional dark surface
  onSurface: colors.neutral[100], // Light text
  surfaceVariant: colors.neutral[700], // Professional dark variant
  onSurfaceVariant: colors.neutral[300], // Medium text
  surfaceDisabled: colors.neutral[700],
  onSurfaceDisabled: colors.neutral[600],

  outline: colors.neutral[600],
  outlineVariant: colors.neutral[700],
  shadow: colors.neutral[1000],
  scrim: colors.neutral[1000],

  // Professional Dark Status Colors
  success: colors.success[300], // Professional green for dark
  successContainer: colors.success[800], // Dark green container
  onSuccess: colors.neutral[0], // White on green
  onSuccessContainer: colors.success[100], // Light on dark

  warning: colors.warning[300], // Professional gold for dark
  warningContainer: colors.warning[800], // Dark gold container
  onWarning: colors.neutral[0], // White on gold
  onWarningContainer: colors.warning[100], // Light on dark

  // Professional Dark Glass/Frosted elements
  glass: colors.glass.black,
  glassStrong: colors.glass.blackDark,
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Professional Dark Payment colors
  amount: colors.primary[300], // Light charcoal for dark theme
  currencySymbol: colors.secondary[400], // Light gray for dark
  dialButton: colors.neutral[800],
  dialButtonActive: colors.primary[900],
  payButton: colors.success[300], // Professional green for dark
  clearButton: colors.error[300], // Professional red for dark

  // Professional Dark POS Authentication colors
  authPrimary: colors.primary[300], // Light charcoal for dark
  authSecondary: colors.secondary[300], // Light gray for dark
  authSuccess: colors.success[300], // Professional green for dark
  authError: colors.error[300], // Professional red for dark
  authWarning: colors.warning[300], // Professional gold for dark
  
  // Professional Dark Staff role colors
  staffRole: colors.secondary[400], // Professional gray for staff
  managerRole: colors.accent[400], // Professional blue for managers
  adminRole: colors.primary[300], // Light charcoal for admin
  
  // Professional Dark Authentication states
  authCardBackground: colors.primary[800], // Professional dark card
  authInputBackground: colors.primary[700], // Professional dark input
  authInputBorder: colors.neutral[600],
  authInputFocused: colors.primary[300], // Light charcoal focus
  authInputError: colors.error[300], // Professional red error
  
  // Professional Dark Biometric colors
  biometricAvailable: colors.success[300], // Professional green
  biometricUnavailable: colors.neutral[600],
  biometricError: colors.error[300], // Professional red

  // Professional Dark Pressed states
  successPressed: colors.success[400],
  primaryPressed: colors.primary[400], // Professional charcoal pressed
  secondaryPressed: colors.secondary[400], // Professional gray pressed
  errorPressed: colors.error[400], // Professional red pressed
} as const;

export type ColorTheme = typeof lightTheme | typeof darkTheme; 