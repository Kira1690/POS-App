import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { spacing, borderRadius } from '../../design-system/theme/spacing';
import { typography } from '../../design-system/theme/typography';

// APPLE COMPONENT SYSTEM (Universal Welcome Components)
import {
  AppleCard,
  AppleButton,
} from '@/components/apple';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  // Navigation will be typed properly in navigation setup
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { isLargeTablet, isLandscape, isPhone } = useResponsive();

  // Handle navigation to different auth flows
  const handleStaffLogin = () => {
    navigation.navigate('StaffLogin');
  };

  const handleManagerLogin = () => {
    navigation.navigate('ManagerLogin');
  };

  const handleDeviceSetup = () => {
    // navigation.navigate('DeviceSetup');
  };

  const handleSettings = () => {
    // navigation.navigate('Settings');
  };

  const handleHelp = () => {
    // navigation.navigate('Help');
  };

  // Get container styles
  const getContainerStyles = () => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  });

  // Get content container styles
  const getContentStyles = () => ({
    flex: 1,
    padding: isLargeTablet ? spacing['2xl'] : spacing.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  });

  // Get logo container styles
  const getLogoContainerStyles = () => ({
    alignItems: 'center' as const,
    marginBottom: spacing['3xl'],
  });

  // Get logo styles
  const getLogoStyles = () => ({
    width: isLargeTablet ? 120 : 80,
    height: isLargeTablet ? 120 : 80,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.card,
  });

  // Get welcome text styles
  const getWelcomeTextStyles = () => ({
    ...typography.authTitle,
    color: theme.colors.onBackground,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
  });

  // Get subtitle styles
  const getSubtitleStyles = () => ({
    ...typography.authSubtitle,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center' as const,
    marginBottom: spacing['2xl'],
    maxWidth: isLargeTablet ? 600 : 300,
  });

  // Get buttons container styles
  const getButtonsContainerStyles = (): ViewStyle => ({
    width: '100%',
    maxWidth: isLargeTablet ? 500 : 350,
  });

  // Get footer container styles
  const getFooterStyles = () => ({
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: 'auto' as const,
  });

  // Get footer button styles
  const getFooterButtonStyles = () => ({
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: spacing.sm,
  });

  // Get footer text styles
  const getFooterTextStyles = () => ({
    ...typography.authHelper,
    color: theme.colors.onSurfaceVariant,
    marginLeft: spacing.xs,
  });

  return (
    <SafeAreaView style={getContainerStyles()}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={getContentStyles()}>
          {/* Logo and Branding Section */}
          <View style={getLogoContainerStyles()}>
            {/* Placeholder for restaurant logo */}
            <View
              style={[
                getLogoStyles(),
                {
                  backgroundColor: theme.colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <MaterialIcons
                name="restaurant"
                size={isLargeTablet ? 48 : 32}
                color={theme.colors.onPrimary}
              />
            </View>
            
            <Text style={getWelcomeTextStyles()}>
              Welcome to FoodPOS
            </Text>
            
            <Text style={getSubtitleStyles()}>
              Professional Point of Sale System for Modern Restaurants
            </Text>
          </View>

          {/* APPLE MAIN ACTION BUTTONS CARD */}
          <AppleCard
            layer="surface"
            size={isLargeTablet ? 'large' : 'medium'}
            shadow={true}
            style={{ width: '100%', maxWidth: isLargeTablet ? 500 : 350 }}
          >
            <View style={getButtonsContainerStyles()}>
              {/* APPLE STAFF LOGIN BUTTON */}
              <AppleButton
                title="👥 Continue as Staff Member"
                variant="primary"
                size={isLargeTablet ? 'large' : 'medium'}
                onPress={handleStaffLogin}
                fullWidth={true}
                testID="btn-welcome-staff-login"
              />

              {/* APPLE MANAGER LOGIN BUTTON */}
              <AppleButton
                title="🛡️ Manager Login"
                variant="secondary"
                size={isLargeTablet ? 'large' : 'medium'}
                onPress={handleManagerLogin}
                fullWidth={true}
                testID="btn-welcome-manager-login"
              />

              {/* APPLE DEVICE SETUP BUTTON */}
              <AppleButton
                title="⚙️ Setup New Device"
                variant="ghost"
                size={isLargeTablet ? 'medium' : 'small'}
                onPress={handleDeviceSetup}
                fullWidth={true}
              />
            </View>
          </AppleCard>
        </View>

        {/* APPLE FOOTER WITH SETTINGS AND HELP */}
        <View style={getFooterStyles()}>
          <AppleButton
            title="⚙️ Settings"
            variant="ghost"
            size="small"
            onPress={handleSettings}
            style={{ flex: 1, marginRight: spacing.sm }}
          />

          <AppleButton
            title="❓ Help"
            variant="ghost"
            size="small"
            onPress={handleHelp}
            style={{ flex: 1, marginLeft: spacing.sm }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;