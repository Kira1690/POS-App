import { useContext, createContext } from 'react';
import { useColorScheme } from 'react-native';
import { ProfessionalTheme, DarkTheme } from '../constants/theme';

// Use the old theme system that settings components expect
type Theme = typeof ProfessionalTheme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: ProfessionalTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback for when context is not available
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DarkTheme : ProfessionalTheme;

    return {
      theme,
      isDark,
      toggleTheme: () => {},
    };
  }
  return context;
}; 