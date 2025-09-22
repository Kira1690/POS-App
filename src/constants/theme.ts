/**
 * Professional POS Theme System
 * Charcoal palette replacing bright Material Design colors
 * Following CLAUDE.md professional design standards
 */

export const ProfessionalTheme = {
  colors: {
    // Primary charcoal palette
    primary: '#1A1D21',
    primaryLight: '#2C3136',
    primaryDark: '#0F1114',
    
    // Background colors
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceLight: '#FAFBFC',
    
    // Text colors
    text: '#1A1D21',
    textSecondary: '#6C757D',
    textLight: '#ADB5BD',
    textOnPrimary: '#FFFFFF',
    
    // Status colors
    success: '#28A745',
    successLight: '#D4EDDA',
    warning: '#FFC107',
    warningLight: '#FFF3CD',
    error: '#DC3545',
    errorLight: '#F8D7DA',
    info: '#17A2B8',
    infoLight: '#D1ECF1',
    
    // UI elements
    border: '#DEE2E6',
    borderLight: '#E9ECEF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(26, 29, 33, 0.5)',
    
    // Chart colors
    chart: {
      primary: '#1A1D21',
      secondary: '#6C757D',
      accent: '#17A2B8',
      success: '#28A745',
      warning: '#FFC107',
      gradient: ['#1A1D21', '#2C3136', '#495057'],
    },
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 28,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
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
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
  
  // Dashboard specific styles
  dashboard: {
    kpiCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    chart: {
      backgroundColor: 'transparent',
      color: (opacity = 1) => `rgba(26, 29, 33, ${opacity})`,
      strokeWidth: 2,
      fillShadowGradient: '#E9ECEF',
      backgroundGradientFrom: '#FFFFFF',
      backgroundGradientTo: '#F8F9FA',
    },
    
    quickAction: {
      backgroundColor: '#F8F9FA',
      borderColor: '#E9ECEF',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
    },
    
    header: {
      backgroundColor: '#1A1D21',
      height: 80,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
  },
};

// Professional component styles
export const DashboardStyles = {
  screen: {
    flex: 1,
    backgroundColor: ProfessionalTheme.colors.background,
  },
  
  header: {
    ...ProfessionalTheme.dashboard.header,
  },
  
  headerTitle: {
    ...ProfessionalTheme.typography.h3,
    color: ProfessionalTheme.colors.textOnPrimary,
  },
  
  headerSubtitle: {
    ...ProfessionalTheme.typography.body2,
    color: ProfessionalTheme.colors.textLight,
    marginTop: 4,
  },
  
  content: {
    flex: 1,
    padding: ProfessionalTheme.spacing.md,
  },
  
  section: {
    marginBottom: ProfessionalTheme.spacing.lg,
  },
  
  sectionTitle: {
    ...ProfessionalTheme.typography.h4,
    color: ProfessionalTheme.colors.text,
    marginBottom: ProfessionalTheme.spacing.md,
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ProfessionalTheme.spacing.sm,
  },
  
  gridItem: {
    flex: 1,
    marginHorizontal: ProfessionalTheme.spacing.sm,
    minWidth: '45%',
  },
  
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.background,
  },
  
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ProfessionalTheme.colors.background,
    padding: ProfessionalTheme.spacing.lg,
  },
  
  errorText: {
    ...ProfessionalTheme.typography.body1,
    color: ProfessionalTheme.colors.error,
    textAlign: 'center',
    marginBottom: ProfessionalTheme.spacing.md,
  },
};