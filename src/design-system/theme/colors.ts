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

  // CENTRALIZED STATUS COLOR SYSTEM (Single Source of Truth)
  // Professional status colors for all UI states across the application
  status: {
    // Order Status Colors
    pending: '#FF453A',     // Apple red - urgent/pending
    preparing: '#FF9500',   // Apple orange - in progress
    ready: '#32D74B',       // Apple green - completed/ready
    served: '#007AFF',      // Apple blue - delivered/served
    cancelled: '#8E8E93',   // Apple gray - cancelled/inactive

    // Priority Status Colors
    urgent: '#FF453A',      // Apple red - high priority
    high: '#FF9500',        // Apple orange - medium-high priority
    normal: '#32D74B',      // Apple green - normal priority
    low: '#8E8E93',         // Apple gray - low priority

    // Table Status Colors
    occupied: '#FF6B6B',    // Red variant - table in use
    available: '#32CD32',   // Green variant - table free
    cleaning: '#FFB347',    // Orange variant - being cleaned
    reserved: '#4A90E2',    // Blue variant - reserved

    // Kitchen Status Colors
    active: '#32D74B',      // Green - station active
    busy: '#FF9500',        // Orange - station busy
    break: '#8E8E93',       // Gray - on break
    offline: '#FF453A',     // Red - offline/unavailable

    // System Status Colors
    online: '#32D74B',      // Green - system online
    offline: '#FF453A',     // Red - system offline
    warning: '#FF9500',     // Orange - warning state
    error: '#FF453A',       // Red - error state
    success: '#32D74B',     // Green - success state
    info: '#007AFF',        // Blue - informational

    // Performance Status Colors
    excellent: '#32D74B',   // Green - 90%+ performance
    good: '#32CD32',        // Light green - 75-89% performance
    average: '#FF9500',     // Orange - 60-74% performance
    poor: '#FF453A',        // Red - <60% performance
  },

  // STATUS ICONS MAPPING (Vector Icons Replace Emojis)
  // Material Icons mapping for consistent premium UI
  statusIcons: {
    // Order Status Icons
    pending: 'schedule',           // clock icon
    preparing: 'restaurant',       // kitchen icon
    ready: 'check-circle',         // checkmark icon
    served: 'delivery-dining',     // delivery icon
    cancelled: 'cancel',           // cancel icon

    // Priority Icons
    urgent: 'priority-high',       // high priority icon
    high: 'keyboard-arrow-up',     // up arrow
    normal: 'remove',              // horizontal line
    low: 'keyboard-arrow-down',    // down arrow

    // Table Status Icons
    occupied: 'people',            // people icon
    available: 'event-available',  // available icon
    cleaning: 'cleaning-services', // cleaning icon
    reserved: 'event-seat',        // reserved seat icon

    // Kitchen Icons
    active: 'check-circle',        // active/ready icon
    busy: 'access-time',           // busy/time icon
    break: 'coffee',               // break icon
    offline: 'error',              // error/offline icon

    // System Icons
    online: 'wifi',                // online icon
    offline: 'wifi-off',           // offline icon
    warning: 'warning',            // warning icon
    error: 'error',                // error icon
    success: 'check-circle',       // success icon
    info: 'info',                  // info icon

    // Performance Icons
    excellent: 'star',             // star icon
    good: 'thumb-up',              // thumbs up
    average: 'remove',             // neutral
    poor: 'thumb-down',            // thumbs down

    // Dashboard Section Icons
    orders: 'receipt',             // orders icon
    tables: 'table-restaurant',    // tables icon
    kitchen: 'restaurant',         // kitchen icon
    reports: 'analytics',          // reports icon
    overview: 'dashboard',         // overview icon
    export: 'file-download',       // export icon
    refresh: 'refresh',            // refresh icon
    search: 'search',              // search icon
    filter: 'filter-list',         // filter icon
    settings: 'settings',          // settings icon
  },
} as const;

// Apple Tahoe Light Theme Colors
export const lightTheme = {
  primary: '#1C1C1E', // Apple's standard dark gray
  primaryContainer: '#F2F2F7', // Apple's signature light gray background
  onPrimary: '#FFFFFF', // White on dark gray
  onPrimaryContainer: '#1C1C1E', // Dark gray on light background

  secondary: '#8E8E93', // Apple's secondary text color
  secondaryContainer: '#F2F2F7', // Light gray container
  onSecondary: '#FFFFFF', // White on gray
  onSecondaryContainer: '#1C1C1E', // Dark on light

  tertiary: '#007AFF', // Apple's signature blue
  tertiaryContainer: '#E3F2FD', // Light blue container
  onTertiary: '#FFFFFF', // White on blue
  onTertiaryContainer: '#1C1C1E', // Dark on light blue

  error: '#FF3B30', // Apple's vibrant red
  errorContainer: '#FFEBEE', // Light red container
  onError: '#FFFFFF', // White on red
  onErrorContainer: '#1C1C1E', // Dark on light red

  background: '#F2F2F7', // Apple's signature light gray background
  onBackground: '#1C1C1E', // Apple's primary text color
  surface: '#FFFFFF', // Pure white surface
  onSurface: '#1C1C1E', // Apple's primary text color
  surfaceVariant: '#FAFAFA', // Subtle off-white for layered surfaces
  onSurfaceVariant: '#8E8E93', // Apple's secondary text color
  surfaceDisabled: '#F2F2F7',
  onSurfaceDisabled: '#C7C7CC',

  outline: '#D1D1D6', // Apple's standard border color
  outlineVariant: '#F2F2F7', // Subtle border for layering
  shadow: '#000000',
  scrim: '#000000',

  // Backward compatibility colors (aliases for settings components)
  border: '#D1D1D6',           // Alias for outline
  inputBorder: '#D1D1D6',      // Alias for authInputBorder
  lightGray: '#F2F2F7',        // Alias for background
  white: '#FFFFFF',            // Pure white for surfaces

  // Apple Status Colors
  success: '#34C759', // Apple's vibrant green
  successContainer: '#D1F2DF', // Light green background
  onSuccess: '#FFFFFF', // White on green
  onSuccessContainer: '#1C1C1E', // Dark on light green

  warning: '#FF9500', // Apple's orange
  warningContainer: '#FFF4E6', // Light orange background
  onWarning: '#FFFFFF', // White on orange
  onWarningContainer: '#1C1C1E', // Dark on light orange

  // Apple Glass/Frosted elements
  glass: colors.glass.white,
  glassStrong: colors.glass.whiteDark,
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // Apple Payment colors
  amount: '#1C1C1E', // Apple's primary dark gray
  currencySymbol: '#8E8E93', // Apple's secondary gray
  dialButton: '#FFFFFF',
  dialButtonActive: '#F2F2F7',
  payButton: '#34C759', // Apple's green
  clearButton: '#FF3B30', // Apple's red

  // Apple POS Authentication colors
  authPrimary: '#1C1C1E', // Apple's primary dark gray
  authSecondary: '#8E8E93', // Apple's secondary gray
  authSuccess: '#34C759', // Apple's green
  authError: '#FF3B30', // Apple's red
  authWarning: '#FF9500', // Apple's orange

  // Apple Staff role colors
  staffRole: '#8E8E93', // Apple's secondary gray for staff
  managerRole: '#007AFF', // Apple's blue for managers
  adminRole: '#1C1C1E', // Apple's primary for admin

  // Apple Authentication states
  authCardBackground: '#FFFFFF',
  authInputBackground: '#F2F2F7', // Apple's light gray background
  authInputBorder: '#D1D1D6', // Apple's border color
  authInputFocused: '#007AFF', // Apple's blue focus
  authInputError: '#FF3B30', // Apple's red error

  // Apple Biometric colors
  biometricAvailable: '#34C759', // Apple's green
  biometricUnavailable: '#C7C7CC', // Apple's tertiary text
  biometricError: '#FF3B30', // Apple's red

  // Apple Pressed states
  successPressed: '#28A745', // Darker green
  primaryPressed: '#000000', // True black pressed
  secondaryPressed: '#636366', // Darker gray pressed
  errorPressed: '#D70015', // Darker red pressed

  // CENTRALIZED STATUS COLORS (Single Source of Truth)
  statusColors: colors.status,

  // STATUS ICONS MAPPING (Premium Vector Icons)
  statusIcons: colors.statusIcons,

  // Order status colors (for components) - light mode
  status: {
    pending: { bg: '#FFF8E1', text: '#E65100', border: '#FFB74D' },
    confirmed: { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
    preparing: { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' },
    ready: { bg: '#F3E5F5', text: '#7B1FA2', border: '#BA68C8' },
    served: { bg: '#E0F7FA', text: '#00838F', border: '#4DD0E1' },
    cancelled: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
    paid: { bg: '#E8F5E9', text: '#1B5E20', border: '#66BB6A' },
    completed: { bg: '#E8F5E9', text: '#1B5E20', border: '#66BB6A' },
  },

  // Priority colors for order urgency
  priority: {
    urgent: '#D32F2F',
    high: '#F57C00',
    normal: '#1976D2',
    low: '#388E3C',
  },
} as const;

// Apple Tahoe Dark Theme Colors - Authentic Apple Design
export const darkTheme = {
  // APPLE LAYERED DEPTH SYSTEM (Based on 5 Reference Images Analysis)
  // This creates Apple's sophisticated layered visual hierarchy
  layer0: '#000000', // Background layer - Pure black (deepest)
  layer1: '#1C1C1E', // Primary surface layer - Main content panels, sidebar
  layer2: '#2C2C2E', // Secondary surface layer - Selected states, nested cards
  layer3: '#3A3A3C', // Interactive surface layer - Hover states, deeper nesting
  layer4: 'rgba(255, 255, 255, 0.05)', // Accent overlay layer - Subtle highlights

  // AUTHENTIC APPLE DARK MODE COLORS
  primary: '#007AFF', // Apple's signature blue
  primaryContainer: '#1C1C1E', // Apple's dark surface color
  onPrimary: '#FFFFFF', // White text on blue
  onPrimaryContainer: '#FFFFFF', // White text on dark

  secondary: '#8E8E93', // Apple's secondary gray on dark
  secondaryContainer: '#2C2C2E', // Elevated dark surface
  onSecondary: '#FFFFFF', // White on secondary
  onSecondaryContainer: '#EBEBF5', // Light text on dark

  tertiary: '#64D2FF', // Apple's cyan accent on dark
  tertiaryContainer: '#1E2A3A', // Dark blue background
  onTertiary: '#000000', // Black on cyan
  onTertiaryContainer: '#64D2FF', // Cyan text on dark

  error: '#FF453A', // Apple's vibrant red on dark
  errorContainer: '#3C1F1F', // Dark red background
  onError: '#FFFFFF', // White on red
  onErrorContainer: '#FF453A', // Red text on dark

  background: '#000000', // Pure black background (Apple's true dark) - uses layer0
  onBackground: '#FFFFFF', // White primary text
  surface: '#1C1C1E', // Apple's dark surface color - uses layer1
  onSurface: '#FFFFFF', // White text on dark surface
  surfaceVariant: '#2C2C2E', // Elevated dark surfaces - uses layer2
  surfaceElevated: '#3A3A3C', // Interactive surfaces - uses layer3
  onSurfaceVariant: '#EBEBF5', // Apple's secondary text on dark
  onSurfaceSecondary: '#EBEBF5', // Secondary text color for dark theme
  surfaceDisabled: '#2C2C2E',
  onSurfaceDisabled: '#8E8E93',

  outline: '#545456', // Apple's dark border color (WCAG 3.4:1 contrast)
  outlineVariant: '#2C2C2E', // Subtle dark border
  shadow: '#000000',
  scrim: '#000000',

  // Backward compatibility colors (aliases for settings components)
  border: '#545456',           // Alias for outline (high contrast for dark mode)
  inputBorder: '#545456',      // Alias for authInputBorder (high contrast)
  lightGray: '#2C2C2E',        // Alias for surfaceVariant
  white: '#FFFFFF',            // Keep white for text on colored backgrounds

  // Apple Dark Status Colors - Vibrant and Authentic
  success: '#30D158', // Apple's vibrant green on dark
  successContainer: '#1E3A2E', // Dark green background
  onSuccess: '#FFFFFF', // White on green
  onSuccessContainer: '#30D158', // Green text on dark

  warning: '#FF9500', // Apple's orange (matching reference images)
  warningContainer: '#3D2914', // Dark orange background
  onWarning: '#FFFFFF', // White on orange
  onWarningContainer: '#FF9500', // Orange text on dark

  // Apple Dark Glass/Frosted elements
  glass: colors.glass.black,
  glassStrong: colors.glass.blackDark,
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Apple Dark Payment colors
  amount: '#FFFFFF', // White for dark theme
  currencySymbol: '#EBEBF5', // Apple's secondary text on dark
  dialButton: '#2C2C2E',
  dialButtonActive: '#1C1C1E',
  payButton: '#30D158', // Apple's vibrant green on dark
  clearButton: '#FF453A', // Apple's vibrant red on dark

  // Apple Dark POS Authentication colors
  authPrimary: '#007AFF', // Apple blue for primary auth elements
  authSecondary: '#EBEBF5', // Apple's secondary text on dark
  authSuccess: '#30D158', // Apple's vibrant green on dark
  authError: '#FF453A', // Apple's vibrant red on dark
  authWarning: '#FF9500', // Apple's orange on dark

  // Apple Dark Staff role colors
  staffRole: '#8E8E93', // Apple's secondary gray for staff
  managerRole: '#007AFF', // Apple's blue for managers
  adminRole: '#FFFFFF', // White text for admin

  // Apple Dark Authentication states
  authCardBackground: '#1C1C1E', // Apple's dark surface
  authInputBackground: '#2C2C2E', // Elevated dark surface
  authInputBorder: '#38383A', // Apple's dark border
  authInputFocused: '#007AFF', // Apple's blue focus
  authInputError: '#FF453A', // Apple's vibrant red error

  // Apple Dark Biometric colors
  biometricAvailable: '#30D158', // Apple's vibrant green
  biometricUnavailable: '#8E8E93', // Apple's tertiary text on dark
  biometricError: '#FF453A', // Apple's vibrant red

  // Apple Dark Pressed states
  successPressed: '#248A3D', // Darker green for dark theme
  primaryPressed: '#0051D5', // Darker blue pressed state
  secondaryPressed: '#636366', // Darker gray pressed
  errorPressed: '#D70015', // Darker red for dark theme

  // CENTRALIZED STATUS COLORS (Single Source of Truth)
  statusColors: colors.status,

  // STATUS ICONS MAPPING (Premium Vector Icons)
  statusIcons: colors.statusIcons,

  // Order status colors (for components) - dark mode optimized
  status: {
    pending: { bg: '#3D2814', text: '#FFCC80', border: '#8D6E63' },
    confirmed: { bg: '#1A3A1A', text: '#81C784', border: '#4CAF50' },
    preparing: { bg: '#1A2A3D', text: '#90CAF9', border: '#42A5F5' },
    ready: { bg: '#2A1A3D', text: '#CE93D8', border: '#AB47BC' },
    served: { bg: '#1A3A3D', text: '#80CBC4', border: '#26A69A' },
    cancelled: { bg: '#3D1A1A', text: '#EF9A9A', border: '#E57373' },
    paid: { bg: '#1A3A1A', text: '#A5D6A7', border: '#66BB6A' },
    completed: { bg: '#1A3A1A', text: '#A5D6A7', border: '#66BB6A' },
  },

  // Priority colors for dark theme (vibrant but not harsh)
  priority: {
    urgent: '#EF5350',
    high: '#FFB74D',
    normal: '#64B5F6',
    low: '#81C784',
  },
} as const;

export type ColorTheme = typeof lightTheme | typeof darkTheme; 