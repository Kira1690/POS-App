import React from 'react';
import { Pressable, ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

// SOLID PRINCIPLES IMPLEMENTATION:
// - Single Responsibility: Only handles Apple-style interactive feedback
// - Open/Closed: Extensible through props without modification
// - Liskov Substitution: Can wrap any component to make it interactive
// - Interface Segregation: Small, focused interface for interactions
// - Dependency Inversion: Depends on theme abstractions

interface AppleInteractiveProps {
  children: React.ReactNode;

  // UNIVERSAL INTERACTION SYSTEM (works everywhere)
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;

  // APPLE FEEDBACK SYSTEM (from reference images analysis)
  feedbackType?: 'opacity' | 'scale' | 'highlight' | 'subtle';

  // UNIVERSAL STATE SYSTEM (reusable across all screens)
  disabled?: boolean;
  selected?: boolean;

  // APPLE TOUCH TARGET OPTIMIZATION (44pt minimum)
  touchTarget?: 'small' | 'medium' | 'large' | 'auto';

  // UNIVERSAL STYLING SYSTEM (extensible)
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;

  // ACCESSIBILITY SYSTEM
  accessibilityRole?: string;
  accessibilityState?: Record<string, boolean | string>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// UNIVERSAL APPLE INTERACTIVE COMPONENT (Single Responsibility)
// This adds Apple-style touch feedback to ANY component
export const AppleInteractive: React.FC<AppleInteractiveProps> = ({
  children,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  feedbackType = 'opacity',
  disabled = false,
  selected = false,
  touchTarget = 'auto',
  style,
  pressedStyle,
}) => {
  const { theme } = useTheme();

  // APPLE FEEDBACK ANIMATIONS (from reference images analysis)
  const getFeedbackStyle = (pressed: boolean) => {
    if (!pressed || disabled) return {};

    switch (feedbackType) {
      case 'opacity':
        return { opacity: 0.6 }; // Apple standard opacity feedback
      case 'scale':
        return { transform: [{ scale: 0.96 }] }; // Apple scale feedback
      case 'highlight':
        return {
          backgroundColor: theme.colors.layer4, // Apple highlight overlay
          opacity: 0.8,
        };
      case 'subtle':
        return { opacity: 0.8 }; // Subtle Apple feedback
      default:
        return { opacity: 0.6 };
    }
  };

  // APPLE TOUCH TARGET SYSTEM (44pt minimum from Apple HIG)
  const getTouchTargetStyle = () => {
    switch (touchTarget) {
      case 'small':
        return { minWidth: 44, minHeight: 44 }; // Apple minimum
      case 'medium':
        return { minWidth: 48, minHeight: 48 }; // Comfortable
      case 'large':
        return { minWidth: 56, minHeight: 56 }; // POS optimized
      case 'auto':
      default:
        return {}; // Use natural size
    }
  };

  // APPLE SELECTION STATE (for toggles, tabs, etc.)
  const getSelectionStyle = () => {
    if (!selected) return {};

    return {
      backgroundColor: theme.colors.layer2, // Apple selection background
      borderRadius: 8, // Apple selection corners
    };
  };

  const baseStyle = [
    getTouchTargetStyle(),
    getSelectionStyle(),
    style,
  ];

  // UNIVERSAL INTERACTIVE WRAPPER (Open/Closed Principle)
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
      style={({ pressed }) => [
        ...baseStyle,
        getFeedbackStyle(pressed),
        pressed && pressedStyle,
        disabled && { opacity: 0.5 }, // Apple disabled state
      ]}
    >
      {children}
    </Pressable>
  );
};

// USAGE EXAMPLES (shows universal reusability):
// Settings item: <AppleInteractive onPress={navigate} feedbackType="highlight">
// Dashboard card: <AppleInteractive onPress={openDetail} feedbackType="scale">
// Table selection: <AppleInteractive onPress={selectTable} selected={isSelected}>
// Menu item: <AppleInteractive onLongPress={showOptions} feedbackType="opacity">
// Button wrapper: <AppleInteractive onPress={submit} touchTarget="large">