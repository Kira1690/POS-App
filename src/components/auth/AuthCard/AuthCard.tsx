import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius, shadows } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { glassStyles } from '../../../design-system/theme';

export type AuthCardPadding = 'small' | 'medium' | 'large';

export interface AuthCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Enable glassmorphism effect */
  glassmorphism?: boolean;
  /** Padding size */
  padding?: AuthCardPadding;
  /** Elevation level */
  elevation?: number;
  /** Show entrance animation */
  animated?: boolean;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Custom styles */
  style?: ViewStyle;
  /** Custom title styles */
  titleStyle?: TextStyle;
  /** Custom subtitle styles */
  subtitleStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  subtitle,
  glassmorphism = true,
  padding = 'medium',
  elevation = 3,
  animated = true,
  animationDelay = 0,
  style,
  titleStyle,
  subtitleStyle,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 20 : 0)).current;
  const scale = useRef(new Animated.Value(animated ? 0.95 : 1)).current;

  // Animate entrance
  useEffect(() => {
    if (animated) {
      const animations = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          delay: animationDelay,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          delay: animationDelay,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]);

      animations.start();
    }
  }, [animated, animationDelay]);

  // Get padding based on size
  const getPadding = () => {
    switch (padding) {
      case 'small':
        return spacing.lg;
      case 'medium':
        return spacing.xl;
      case 'large':
        return spacing['2xl'];
      default:
        return spacing.xl;
    }
  };

  // Get card styles
  const getCardStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: borderRadius.card,
      padding: getPadding(),
      width: '100%',
      maxWidth: 480, // Optimal width for forms
      alignSelf: 'center',
    };

    // Glassmorphism or solid background
    const backgroundStyles: ViewStyle = glassmorphism 
      ? {
          ...(isDark ? glassStyles.authCardDark : glassStyles.authCard),
          backgroundColor: isDark ? glassStyles.authCardDark.backgroundColor : glassStyles.authCard.backgroundColor,
        }
      : {
          backgroundColor: theme.colors.authCardBackground,
          ...shadows[`level${Math.min(elevation, 5)}` as keyof typeof shadows] || shadows.md,
        };

    return {
      ...baseStyles,
      ...backgroundStyles,
    };
  };

  // Get title styles
  const getTitleStyles = (): TextStyle => ({
    ...typography.authTitle,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: subtitle ? spacing.sm : spacing.lg,
  });

  // Get subtitle styles
  const getSubtitleStyles = (): TextStyle => ({
    ...typography.authSubtitle,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
  });

  // Get content container styles
  const getContentStyles = (): ViewStyle => ({
    width: '100%',
  });

  return (
    <Animated.View
      style={[
        getCardStyles(),
        {
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
        style,
      ]}
      testID={testID}
    >
      {/* Header Section */}
      {(title || subtitle) && (
        <View style={{ marginBottom: spacing.lg }}>
          {title && (
            <Text style={[getTitleStyles(), titleStyle]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[getSubtitleStyles(), subtitleStyle]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Content Section */}
      <View style={getContentStyles()}>
        {children}
      </View>
    </Animated.View>
  );
};

// Responsive wrapper for different screen sizes
export const ResponsiveAuthCard: React.FC<AuthCardProps> = (props) => {
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const isLargeTablet = screenWidth >= 1024;

  // Adjust padding for larger screens
  const responsivePadding: AuthCardPadding = (() => {
    if (isLargeTablet) return 'large';
    if (isTablet) return 'medium';
    return props.padding || 'medium';
  })();

  // Responsive styles
  const responsiveStyle: ViewStyle = {
    marginHorizontal: isTablet ? spacing['4xl'] : spacing.lg,
    maxWidth: isLargeTablet ? 600 : isTablet ? 480 : undefined,
  };

  return (
    <AuthCard
      {...props}
      padding={responsivePadding}
      style={StyleSheet.flatten([responsiveStyle, props.style])}
    />
  );
};

export default AuthCard;