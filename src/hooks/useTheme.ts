import { useContext, createContext } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type Theme } from '../design-system/theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback for when context is not available
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? themes.dark : themes.light;
    
    return {
      theme,
      isDark,
      toggleTheme: () => {},
    };
  }
  return context;
}; 