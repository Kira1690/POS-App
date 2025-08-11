/**
 * Professional Animations & Micro-interactions
 * 60fps enterprise-grade animations with haptic feedback
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  Pressable,
  Dimensions,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

interface ProfessionalButtonProps {
  onPress: () => void | Promise<void>;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection';
  animationType?: 'scale' | 'opacity' | 'both';
  theme?: {
    colors: {
      primary: string;
      onPrimary: string;
      surface: string;
      outline: string;
    };
  };
}

/**
 * Professional Button with 60fps animations and haptic feedback
 */
export const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({
  onPress,
  children,
  style,
  disabled = false,
  loading = false,
  hapticFeedback = 'light',
  animationType = 'both',
  theme,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const getHapticType = () => {
    switch (hapticFeedback) {
      case 'light': return Haptics.ImpactFeedbackStyle.Light;
      case 'medium': return Haptics.ImpactFeedbackStyle.Medium;
      case 'heavy': return Haptics.ImpactFeedbackStyle.Heavy;
      case 'selection': return null; // selection doesn't use ImpactFeedbackStyle
      default: return Haptics.ImpactFeedbackStyle.Light;
    }
  };

  const animateIn = () => {
    const animations = [];
    
    if (animationType === 'scale' || animationType === 'both') {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        })
      );
    }
    
    if (animationType === 'opacity' || animationType === 'both') {
      animations.push(
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const animateOut = () => {
    const animations = [];
    
    if (animationType === 'scale' || animationType === 'both') {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        })
      );
    }
    
    if (animationType === 'opacity' || animationType === 'both') {
      animations.push(
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePressIn = async () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    animateIn();
    
    // Haptic feedback
    if (hapticFeedback === 'selection') {
      await Haptics.selectionAsync();
    } else {
      const hapticType = getHapticType();
      if (hapticType !== null) {
        await Haptics.impactAsync(hapticType);
      }
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    animateOut();
  };

  const handlePress = async () => {
    if (disabled || loading) return;
    
    try {
      await onPress();
    } finally {
      // Ensure animation completes
      setTimeout(() => {
        if (isPressed) {
          handlePressOut();
        }
      }, 50);
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.professionalButton,
        style,
        disabled && styles.disabledButton,
      ]}
    >
      <Animated.View
        style={[
          styles.buttonContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme?.colors.onPrimary} />
            <Text style={[styles.loadingText, { color: theme?.colors.onPrimary }]}>
              Loading...
            </Text>
          </View>
        ) : (
          children
        )}
      </Animated.View>
    </Pressable>
  );
};

/**
 * Professional Fade In Animation
 */
interface FadeInAnimationProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeInAnimation: React.FC<FadeInAnimationProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
};

/**
 * Professional Slide In Animation
 */
interface SlideInAnimationProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const SlideInAnimation: React.FC<SlideInAnimationProps> = ({
  children,
  direction = 'right',
  distance = 50,
  duration = 300,
  delay = 0,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, opacityAnim, duration, delay]);

  const getTranslateStyle = () => {
    switch (direction) {
      case 'left':
        return { translateX: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        })};
      case 'right':
        return { translateX: slideAnim };
      case 'up':
        return { translateY: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        })};
      case 'down':
        return { translateY: slideAnim };
      default:
        return { translateX: slideAnim };
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: opacityAnim,
          transform: [getTranslateStyle()],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Professional Scale Animation
 */
interface ScaleAnimationProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const ScaleAnimation: React.FC<ScaleAnimationProps> = ({
  children,
  scale = 0.8,
  duration = 300,
  delay = 0,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(scale)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Professional Status Transition Animation
 */
interface StatusTransitionProps {
  children: React.ReactNode;
  status: string;
  colors: Record<string, string>;
  style?: ViewStyle;
}

export const StatusTransitionAnimation: React.FC<StatusTransitionProps> = ({
  children,
  status,
  colors,
  style,
}) => {
  const colorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [currentColor, setCurrentColor] = useState(colors[status] || colors.default || '#000');

  useEffect(() => {
    const newColor = colors[status] || colors.default || '#000';
    
    if (newColor !== currentColor) {
      // Scale animation for status change
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentColor(newColor);
    }
  }, [status, colors, currentColor]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: currentColor,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Professional Loading Dots Animation
 */
interface LoadingDotsProps {
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export const LoadingDotsAnimation: React.FC<LoadingDotsProps> = ({
  color = '#007AFF',
  size = 8,
  style,
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 200),
      createDotAnimation(dot3Anim, 400),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const getDotStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.loadingDots, style]}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size },
          getDotStyle(dot1Anim),
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size },
          getDotStyle(dot2Anim),
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size },
          getDotStyle(dot3Anim),
        ]}
      />
    </View>
  );
};

/**
 * Professional Shimmer Animation
 */
interface ShimmerAnimationProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  shimmerColor?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ShimmerAnimation: React.FC<ShimmerAnimationProps> = ({
  children,
  width = 200,
  height = 20,
  shimmerColor = '#ffffff40',
  backgroundColor = '#f0f0f0',
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.shimmerContainer, { width, height, backgroundColor }, style]}>
      {children}
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            backgroundColor: shimmerColor,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Professional Button
  professionalButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
  },

  // Loading Dots
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 2,
  },

  // Shimmer
  shimmerContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default {
  ProfessionalButton,
  FadeInAnimation,
  SlideInAnimation,
  ScaleAnimation,
  StatusTransitionAnimation,
  LoadingDotsAnimation,
  ShimmerAnimation,
};