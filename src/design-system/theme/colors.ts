export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary Colors
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Main secondary
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },

  // Success Colors
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Error Colors
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main error
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Warning Colors
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main warning
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
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

  // Gradient Colors
  gradients: {
    primary: ['#2196F3', '#1976D2'],
    secondary: ['#9C27B0', '#7B1FA2'],
    success: ['#4CAF50', '#388E3C'],
    error: ['#F44336', '#D32F2F'],
    warning: ['#FFC107', '#FFA000'],
    neutral: ['#E0E0E0', '#BDBDBD'],
    glass: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)'],
  },
} as const;

// Light Theme Colors
export const lightTheme = {
  primary: colors.primary[500],
  primaryContainer: colors.primary[100],
  onPrimary: colors.neutral[0],
  onPrimaryContainer: colors.primary[900],

  secondary: colors.secondary[500],
  secondaryContainer: colors.secondary[100],
  onSecondary: colors.neutral[0],
  onSecondaryContainer: colors.secondary[900],

  tertiary: colors.warning[500],
  tertiaryContainer: colors.warning[100],
  onTertiary: colors.neutral[0],
  onTertiaryContainer: colors.warning[900],

  error: colors.error[500],
  errorContainer: colors.error[100],
  onError: colors.neutral[0],
  onErrorContainer: colors.error[900],

  background: colors.neutral[50],
  onBackground: colors.neutral[900],
  surface: colors.neutral[0],
  onSurface: colors.neutral[900],
  surfaceVariant: colors.neutral[100],
  onSurfaceVariant: colors.neutral[700],
  surfaceDisabled: colors.neutral[200],
  onSurfaceDisabled: colors.neutral[400],

  outline: colors.neutral[300],
  outlineVariant: colors.neutral[200],
  shadow: colors.neutral[1000],
  scrim: colors.neutral[1000],

  // Custom colors for payment app
  success: colors.success[500],
  successContainer: colors.success[100],
  onSuccess: colors.neutral[0],
  onSuccessContainer: colors.success[900],

  warning: colors.warning[500],
  warningContainer: colors.warning[100],
  onWarning: colors.neutral[0],
  onWarningContainer: colors.warning[900],

  // Glass/Frosted elements
  glass: colors.glass.white,
  glassStrong: colors.glass.whiteDark,
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // Payment specific colors
  amount: colors.primary[700],
  currencySymbol: colors.primary[600],
  dialButton: colors.neutral[0],
  dialButtonActive: colors.primary[50],
  payButton: colors.success[500],
  clearButton: colors.error[500],

  // POS Authentication specific colors
  authPrimary: colors.primary[500],
  authSecondary: colors.secondary[500],
  authSuccess: colors.success[500],
  authError: colors.error[500],
  authWarning: colors.warning[500],
  
  // Staff role colors
  staffRole: colors.primary[500],
  managerRole: colors.warning[600],
  adminRole: colors.error[600],
  
  // Authentication states
  authCardBackground: colors.neutral[0],
  authInputBackground: colors.neutral[50],
  authInputBorder: colors.neutral[300],
  authInputFocused: colors.primary[500],
  authInputError: colors.error[500],
  
  // Biometric colors
  biometricAvailable: colors.success[500],
  biometricUnavailable: colors.neutral[400],
  biometricError: colors.error[500],

  // Pressed states
  successPressed: colors.success[600],
  primaryPressed: colors.primary[600],
  secondaryPressed: colors.secondary[600],
  errorPressed: colors.error[600],
} as const;

// Dark Theme Colors (for future implementation)
export const darkTheme = {
  primary: colors.primary[400],
  primaryContainer: colors.primary[800],
  onPrimary: colors.neutral[900],
  onPrimaryContainer: colors.primary[100],

  secondary: colors.secondary[400],
  secondaryContainer: colors.secondary[800],
  onSecondary: colors.neutral[900],
  onSecondaryContainer: colors.secondary[100],

  tertiary: colors.warning[400],
  tertiaryContainer: colors.warning[800],
  onTertiary: colors.neutral[900],
  onTertiaryContainer: colors.warning[100],

  error: colors.error[400],
  errorContainer: colors.error[800],
  onError: colors.neutral[900],
  onErrorContainer: colors.error[100],

  background: colors.neutral[900],
  onBackground: colors.neutral[100],
  surface: colors.neutral[800],
  onSurface: colors.neutral[100],
  surfaceVariant: colors.neutral[700],
  onSurfaceVariant: colors.neutral[300],
  surfaceDisabled: colors.neutral[700],
  onSurfaceDisabled: colors.neutral[600],

  outline: colors.neutral[600],
  outlineVariant: colors.neutral[700],
  shadow: colors.neutral[1000],
  scrim: colors.neutral[1000],

  // Custom colors for payment app
  success: colors.success[400],
  successContainer: colors.success[800],
  onSuccess: colors.neutral[900],
  onSuccessContainer: colors.success[100],

  warning: colors.warning[400],
  warningContainer: colors.warning[800],
  onWarning: colors.neutral[900],
  onWarningContainer: colors.warning[100],

  // Glass/Frosted elements
  glass: colors.glass.black,
  glassStrong: colors.glass.blackDark,
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Payment specific colors
  amount: colors.primary[300],
  currencySymbol: colors.primary[400],
  dialButton: colors.neutral[800],
  dialButtonActive: colors.primary[900],
  payButton: colors.success[400],
  clearButton: colors.error[400],

  // POS Authentication specific colors
  authPrimary: colors.primary[400],
  authSecondary: colors.secondary[400],
  authSuccess: colors.success[400],
  authError: colors.error[400],
  authWarning: colors.warning[400],
  
  // Staff role colors
  staffRole: colors.primary[400],
  managerRole: colors.warning[400],
  adminRole: colors.error[400],
  
  // Authentication states
  authCardBackground: colors.neutral[800],
  authInputBackground: colors.neutral[700],
  authInputBorder: colors.neutral[600],
  authInputFocused: colors.primary[400],
  authInputError: colors.error[400],
  
  // Biometric colors
  biometricAvailable: colors.success[400],
  biometricUnavailable: colors.neutral[600],
  biometricError: colors.error[400],

  // Pressed states
  successPressed: colors.success[500],
  primaryPressed: colors.primary[500],
  secondaryPressed: colors.secondary[500],
  errorPressed: colors.error[500],
} as const;

export type ColorTheme = typeof lightTheme | typeof darkTheme; 