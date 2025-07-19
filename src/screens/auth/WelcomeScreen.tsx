import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/types';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  AuthButton, 
  AuthCard,
  type AuthButtonProps 
} from '../../components/auth';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '../../design-system/theme/spacing';
import { typography } from '../../design-system/theme/typography';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  // Navigation will be typed properly in navigation setup
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const isLandscape = screenWidth > screenHeight;

  // Handle navigation to different auth flows
  const handleStaffLogin = () => {
    navigation.navigate('StaffLogin');
  };

  const handleManagerLogin = () => {
    navigation.navigate('ManagerLogin');
  };

  const handleDeviceSetup = () => {
    // navigation.navigate('DeviceSetup');
    console.log('Navigate to Device Setup');
  };

  const handleSettings = () => {
    // navigation.navigate('Settings');
    console.log('Navigate to Settings');
  };

  const handleHelp = () => {
    // navigation.navigate('Help');
    console.log('Navigate to Help');
  };

  // Get container styles
  const getContainerStyles = () => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  });

  // Get content container styles
  const getContentStyles = () => ({
    flex: 1,
    padding: isTablet ? spacing['2xl'] : spacing.lg,
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
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
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
    maxWidth: isTablet ? 600 : 300,
  });

  // Get buttons container styles
  const getButtonsContainerStyles = (): ViewStyle => ({
    width: '100%',
    maxWidth: isTablet ? 500 : 350,
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
                size={isTablet ? 48 : 32}
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

          {/* Main Action Buttons */}
          <AuthCard
            glassmorphism={true}
            padding={isTablet ? 'large' : 'medium'}
            style={{ width: '100%', maxWidth: isTablet ? 500 : 350 }}
          >
            <View style={getButtonsContainerStyles()}>
              {/* Staff Login Button */}
              <AuthButton
                variant="primary"
                size={isTablet ? 'large' : 'medium'}
                icon="people"
                onPress={handleStaffLogin}
                accessibilityLabel="Continue as staff member"
                testID="staff-login-button"
              >
                Continue as Staff Member
              </AuthButton>

              {/* Manager Login Button */}
              <AuthButton
                variant="secondary"
                size={isTablet ? 'large' : 'medium'}
                icon="admin-panel-settings"
                onPress={handleManagerLogin}
                accessibilityLabel="Manager login"
                testID="manager-login-button"
              >
                Manager Login
              </AuthButton>

              {/* Device Setup Button */}
              <AuthButton
                variant="ghost"
                size={isTablet ? 'medium' : 'small'}
                icon="settings"
                onPress={handleDeviceSetup}
                accessibilityLabel="Setup new device"
                testID="device-setup-button"
              >
                Setup New Device
              </AuthButton>
            </View>
          </AuthCard>
        </View>

        {/* Footer with Settings and Help */}
        <View style={getFooterStyles()}>
          <AuthButton
            variant="ghost"
            size="small"
            icon="settings"
            onPress={handleSettings}
            accessibilityLabel="Open settings"
            testID="settings-button"
            style={{ flex: 1, marginRight: spacing.sm }}
          >
            Settings
          </AuthButton>

          <AuthButton
            variant="ghost"
            size="small"
            icon="help"
            onPress={handleHelp}
            accessibilityLabel="Get help"
            testID="help-button"
            style={{ flex: 1, marginLeft: spacing.sm }}
          >
            Help
          </AuthButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;