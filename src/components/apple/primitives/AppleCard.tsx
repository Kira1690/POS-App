import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, shadows } from '@/design-system/theme/spacing';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple card styling and layout
// - Open/Closed: Extensible through props without modification
// - Liskov Substitution: Can replace any existing card component
// - Interface Segregation: Small, focused interface
// - Dependency Inversion: Depends on theme abstractions

interface AppleCardProps {
  children: React.ReactNode;

  // APPLE LAYER SYSTEM (from 5 reference images analysis)
  layer?: 'background' | 'surface' | 'surfaceVariant' | 'surfaceElevated';

  // UNIVERSAL SIZING SYSTEM (reusable across all screens)
  size?: 'small' | 'medium' | 'large' | 'hero';

  // UNIVERSAL INTERACTION SYSTEM (works everywhere)
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;

  // UNIVERSAL STYLING SYSTEM (extensible without modification)
  radius?: keyof typeof borderRadius;
  shadow?: boolean;
  style?: ViewStyle;
}

// UNIVERSAL APPLE CARD COMPONENT (Single Responsibility)
// This replaces ALL card-specific styling throughout the app
export const AppleCard: React.FC<AppleCardProps> = ({
  children,
  layer = 'surface',
  size = 'medium',
  interactive = false,
  onPress,
  onLongPress,
  radius = 'universalCard',
  shadow = true,
  style,
}) => {
  const { theme, isDark } = useTheme();

  // APPLE LAYER COLOR MAPPING (from 4-layer depth system)
  const getLayerColor = () => {
    if (isDark) {
      switch (layer) {
        case 'background': return theme.colors.layer0; // Pure black background
        case 'surface': return theme.colors.layer1; // Primary surface (#1C1C1E)
        case 'surfaceVariant': return theme.colors.layer2; // Secondary surface (#2C2C2E)
        case 'surfaceElevated': return theme.colors.layer3; // Interactive surface (#3A3A3C)
        default: return theme.colors.layer1;
      }
    }
    // Light theme - proper layer mapping
    switch (layer) {
      case 'background': return theme.colors.background; // Apple's light gray (#F2F2F7)
      case 'surface': return theme.colors.surface; // Pure white (#FFFFFF)
      case 'surfaceVariant': return theme.colors.surfaceVariant; // Alternative (#F2F2F7)
      case 'surfaceElevated': return theme.colors.surfaceLight; // Elevated (#FAFAFA)
      default: return theme.colors.surface;
    }
  };

  // UNIVERSAL SIZING SYSTEM (Interface Segregation)
  const getSizePadding = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 16;
      case 'large': return 20;
      case 'hero': return 24;
      default: return 16;
    }
  };

  const cardStyles = StyleSheet.create({
    container: {
      backgroundColor: getLayerColor(),
      borderRadius: borderRadius[radius] as number,
      padding: getSizePadding(),
      ...(shadow && shadows.apple.card),
      ...style,
    },
    interactive: {
      // Apple-style interactive feedback
      opacity: 0.9,
    },
  });

  // UNIVERSAL INTERACTIVE COMPONENT (Open/Closed Principle)
  if (interactive || onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          cardStyles.container,
          pressed && cardStyles.interactive,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  // STATIC CARD VERSION (Liskov Substitution)
  return (
    <View style={cardStyles.container}>
      {children}
    </View>
  );
};

// USAGE EXAMPLES (shows universal reusability):
// Settings screen: <AppleCard layer="surface" size="large">
// Dashboard: <AppleCard layer="surfaceVariant" size="medium" interactive>
// Table cards: <AppleCard layer="surface" size="small" onPress={handleSelect}>
// Order cards: <AppleCard layer="surfaceElevated" size="medium">
// Payment interface: <AppleCard layer="surface" size="hero" shadow>