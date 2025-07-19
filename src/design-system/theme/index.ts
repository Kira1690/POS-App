import { Dimensions } from 'react-native';
import { lightTheme, darkTheme, type ColorTheme } from './colors';
import { typography, getResponsiveTypography } from './typography';
import { spacing, borderRadius, shadows, componentSpacing, getResponsiveSpacing, touchTargets } from './spacing';

// Enhanced animation system for POS UI
export const animations = {
  duration: {
    fastest: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slowest: 1000,
    
    // POS-specific durations
    microInteraction: 150,
    buttonPress: 200,
    inputFocus: 250,
    cardTransition: 300,
    pageTransition: 400,
    modalTransition: 350,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Enhanced easing functions
    springGentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    springBouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smoothOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  
  // POS-specific animation configs
  buttonPress: {
    scale: 0.95,
    duration: 150,
    easing: 'springGentle',
  },
  inputFocus: {
    borderWidth: 2,
    duration: 250,
    easing: 'smoothOut',
  },
  cardAppear: {
    translateY: 20,
    opacity: 0,
    duration: 300,
    easing: 'springGentle',
  },
  toastSlide: {
    translateY: -100,
    duration: 350,
    easing: 'springBouncy',
  },
  modalSlide: {
    translateY: '100%',
    duration: 350,
    easing: 'springGentle',
  },
} as const;

// Enhanced breakpoints for responsive design including POS devices
export const breakpoints = {
  // Mobile devices
  small: 380,
  medium: 420,
  
  // Tablet devices (common POS sizes)
  large: 768,    // iPad standard
  xlarge: 1024,  // iPad Pro
  
  // POS-specific breakpoints
  posTablet: 768,      // 7-10" POS tablets
  posLarge: 1024,      // 10-13" POS tablets
  posDesktop: 1366,    // Counter-top POS systems
  
  // Portrait/Landscape considerations
  mobilePortrait: 480,
  tabletPortrait: 768,
  tabletLandscape: 1024,
} as const;

// Main theme interface
export interface Theme {
  colors: ColorTheme;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  componentSpacing: typeof componentSpacing;
  touchTargets: typeof touchTargets;
  animations: typeof animations;
  breakpoints: typeof breakpoints;
}

// Create theme factory
export const createTheme = (colorScheme: 'light' | 'dark' = 'light'): Theme => {
  const colors = colorScheme === 'light' ? lightTheme : darkTheme;
  
  return {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    componentSpacing,
    touchTargets,
    animations,
    breakpoints,
  };
};

// Default themes
export const themes = {
  light: createTheme('light'),
  dark: createTheme('dark'),
} as const;

// Responsive theme hook helper
export const getResponsiveTheme = (theme: Theme, screenDimensions?: { width: number; height: number }) => {
  const { width } = screenDimensions || Dimensions.get('window');
  
  return {
    ...theme,
    typography: {
      ...theme.typography,
      ...getResponsiveTypography(width),
    },
    spacing: {
      ...theme.spacing,
      responsive: getResponsiveSpacing(width),
    },
    screen: {
      width,
      isSmall: width < breakpoints.small,
      isMedium: width >= breakpoints.small && width < breakpoints.medium,
      isLarge: width >= breakpoints.medium && width < breakpoints.large,
      isXLarge: width >= breakpoints.large,
    },
  };
};

// Enhanced glassmorphism styles for POS authentication
export const glassStyles = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  primary: {
    backgroundColor: 'rgba(33, 150, 243, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  
  // POS-specific glass effects
  authCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
  },
  authCardDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
  },
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
  },
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(25px)',
  },
} as const;

// Export everything
export * from './colors';
export * from './typography';
export * from './spacing';

// Default export
export default themes.light; 