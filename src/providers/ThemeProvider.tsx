import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeContext as CustomThemeContext } from '../hooks/useTheme';
import { themes, createTheme, getResponsiveTheme, type Theme } from '../design-system/theme';
import { lightTheme, darkTheme } from '../design-system/theme/colors';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  // DEFAULT TO DARK MODE as requested by user
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');

  // Comment out system color scheme sync to maintain dark mode default
  // useEffect(() => {
  //   if (systemColorScheme) {
  //     setColorScheme(systemColorScheme);
  //   }
  // }, [systemColorScheme]);

  const theme = createTheme(colorScheme);
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Create react-native-paper theme compatible with our design system
  const paperTheme = {
    dark: isDark,
    version: 3 as const,
    colors: {
      primary: theme.colors.primary,
      onPrimary: theme.colors.onPrimary,
      primaryContainer: theme.colors.primaryContainer,
      onPrimaryContainer: theme.colors.onPrimaryContainer,
      secondary: theme.colors.secondary,
      onSecondary: theme.colors.onSecondary,
      secondaryContainer: theme.colors.secondaryContainer,
      onSecondaryContainer: theme.colors.onSecondaryContainer,
      tertiary: theme.colors.tertiary,
      onTertiary: theme.colors.onTertiary,
      tertiaryContainer: theme.colors.tertiaryContainer,
      onTertiaryContainer: theme.colors.onTertiaryContainer,
      error: theme.colors.error,
      onError: theme.colors.onError,
      errorContainer: theme.colors.errorContainer,
      onErrorContainer: theme.colors.onErrorContainer,
      background: theme.colors.background,
      onBackground: theme.colors.onBackground,
      surface: theme.colors.surface,
      onSurface: theme.colors.onSurface,
      surfaceVariant: theme.colors.surfaceVariant,
      onSurfaceVariant: theme.colors.onSurfaceVariant,
      outline: theme.colors.outline,
      outlineVariant: theme.colors.outlineVariant,
      shadow: theme.colors.shadow,
      scrim: theme.colors.scrim,
      inverseSurface: isDark ? lightTheme.surface : darkTheme.surface,
      inverseOnSurface: isDark ? lightTheme.onSurface : darkTheme.onSurface,
      inversePrimary: isDark ? lightTheme.primary : darkTheme.primary,
      elevation: {
        level0: theme.colors.surface,
        level1: theme.colors.surfaceVariant,
        level2: theme.colors.surfaceVariant,
        level3: theme.colors.surfaceVariant,
        level4: theme.colors.surfaceVariant,
        level5: theme.colors.surfaceVariant,
      },
      surfaceDisabled: theme.colors.surfaceDisabled,
      onSurfaceDisabled: theme.colors.onSurfaceDisabled,
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
    fonts: {
      default: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      displayLarge: {
        fontFamily: 'System',
        fontSize: 57,
        fontWeight: '400' as const,
        lineHeight: 64,
        letterSpacing: -0.25,
      },
      displayMedium: {
        fontFamily: 'System',
        fontSize: 45,
        fontWeight: '400' as const,
        lineHeight: 52,
        letterSpacing: 0,
      },
      displaySmall: {
        fontFamily: 'System',
        fontSize: 36,
        fontWeight: '400' as const,
        lineHeight: 44,
        letterSpacing: 0,
      },
      headlineLarge: {
        fontFamily: 'System',
        fontSize: 32,
        fontWeight: '400' as const,
        lineHeight: 40,
        letterSpacing: 0,
      },
      headlineMedium: {
        fontFamily: 'System',
        fontSize: 28,
        fontWeight: '400' as const,
        lineHeight: 36,
        letterSpacing: 0,
      },
      headlineSmall: {
        fontFamily: 'System',
        fontSize: 24,
        fontWeight: '400' as const,
        lineHeight: 32,
        letterSpacing: 0,
      },
      titleLarge: {
        fontFamily: 'System',
        fontSize: 22,
        fontWeight: '500' as const,
        lineHeight: 28,
        letterSpacing: 0,
      },
      titleMedium: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '500' as const,
        lineHeight: 24,
        letterSpacing: 0.15,
      },
      titleSmall: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '500' as const,
        lineHeight: 20,
        letterSpacing: 0.1,
      },
      labelLarge: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '500' as const,
        lineHeight: 20,
        letterSpacing: 0.1,
      },
      labelMedium: {
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '500' as const,
        lineHeight: 16,
        letterSpacing: 0.5,
      },
      labelSmall: {
        fontFamily: 'System',
        fontSize: 11,
        fontWeight: '500' as const,
        lineHeight: 16,
        letterSpacing: 0.5,
      },
      bodyLarge: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
        letterSpacing: 0.15,
      },
      bodyMedium: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
        letterSpacing: 0.25,
      },
      bodySmall: {
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
        letterSpacing: 0.4,
      },
    },
  };

  const themeContextValue = {
    theme,
    isDark,
    toggleTheme,
  };

  return (
    <CustomThemeContext.Provider value={themeContextValue}>
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>
    </CustomThemeContext.Provider>
  );
}; 