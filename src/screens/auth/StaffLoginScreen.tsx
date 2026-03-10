import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  AuthButton, 
  AuthInput, 
  AuthCard,
  LoadingOverlay,
  Toast,
  useToast
} from '../../components/auth';
import { 
  FormField, 
  PasswordInput, 
  BiometricButton, 
  useBiometricAuth 
} from '../../components/forms';
import { useTheme } from '../../hooks/useTheme';
import { useStaffAuthForm, useAuthStatus } from '@/hooks/auth';
import { spacing } from '../../design-system/theme/spacing';
import { typography } from '../../design-system/theme/typography';

interface StaffLoginScreenProps {
  // Navigation will be typed properly in navigation setup
}

export const StaffLoginScreen: React.FC<StaffLoginScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  
  // Auth hooks
  const authStatus = useAuthStatus();
  const staffAuthForm = useStaffAuthForm({
    onSuccess: () => {
      success('Welcome back! Logging you in...');
      setTimeout(() => {
        // navigation.navigate('Dashboard');
      }, 1000);
    },
    onError: (errorMessage) => {
      error(errorMessage);
    }
  });
  
  // Biometric authentication
  const { isAvailable: biometricAvailable, authenticate: authenticateBiometric } = useBiometricAuth();
  
  // Toast notifications
  const { toastProps, success, error, ToastComponent } = useToast();

  // Initialize biometric check
  useEffect(() => {
    // Check biometric availability on mount
  }, []);

  // Handle staff login
  const handleStaffLogin = async () => {
    await staffAuthForm.handleLogin();
  };

  // Handle biometric authentication
  const handleBiometricLogin = async () => {
    try {
      const result = await authenticateBiometric({
        promptMessage: 'Use your biometric to login quickly',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        success('Biometric authentication successful!');
        setTimeout(() => {
          // navigation.navigate('Dashboard');
        }, 1000);
      } else {
        error(result.error || 'Biometric authentication failed');
      }
    } catch (err) {
      error('Biometric authentication error occurred');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack();
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // navigation.navigate('ForgotPassword');
  };

  // Get container styles
  const getContainerStyles = () => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  });

  // Get content styles
  const getContentStyles = () => ({
    flexGrow: 1,
    padding: isTablet ? spacing['2xl'] : spacing.lg,
    justifyContent: 'center' as const,
  });

  // Get header styles
  const getHeaderStyles = () => ({
    alignItems: 'center' as const,
    marginBottom: spacing['2xl'],
  });

  // Get title styles
  const getTitleStyles = () => ({
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
  });

  // Get form styles
  const getFormStyles = () => ({
    gap: spacing.lg,
  });

  // Get footer styles
  const getFooterStyles = () => ({
    alignItems: 'center' as const,
    marginTop: spacing['2xl'],
    gap: spacing.lg,
  });

  return (
    <SafeAreaView style={getContainerStyles()}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      <ScrollView 
        contentContainerStyle={getContentStyles()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={getHeaderStyles()}>
          <MaterialIcons
            name="badge"
            size={isTablet ? 64 : 48}
            color={theme.colors.primary}
            style={{ marginBottom: spacing.lg }}
          />
          <Text style={getTitleStyles()}>Staff Login</Text>
          <Text style={getSubtitleStyles()}>
            Enter your employee credentials to clock in
          </Text>
        </View>

        {/* Login Form */}
        <AuthCard
          glassmorphism={true}
          padding={isTablet ? 'large' : 'medium'}
        >
          <View style={getFormStyles()}>
            {/* Employee ID Field */}
            <FormField
              label="Employee ID"
              required
              error={staffAuthForm.error}
              helpText="Your unique employee identifier"
            >
              <AuthInput
                placeholder="Enter your employee ID"
                value={staffAuthForm.employeeId}
                onChangeText={staffAuthForm.setEmployeeId}
                leftIcon="badge"
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
                error={staffAuthForm.error}
                testID="employee-id-input"
              />
            </FormField>

            {/* Password Field */}
            <FormField
              label="Password"
              required
              error={staffAuthForm.error}
            >
              <PasswordInput
                placeholder="Enter your password"
                value={staffAuthForm.password}
                onChangeText={staffAuthForm.setPassword}
                showStrength={false}
                showRequirements={false}
                returnKeyType="done"
                onSubmitEditing={handleStaffLogin}
                error={staffAuthForm.error}
                testID="password-input"
              />
            </FormField>

            {/* LOGIN BUTTON */}
            <AuthButton
              title="⏰ Clock In"
              variant="primary"
              size={isTablet ? 'large' : 'medium'}
              onPress={handleStaffLogin}
              disabled={staffAuthForm.isLoading || !staffAuthForm.isValid}
              loading={staffAuthForm.isLoading}
              fullWidth={true}
              style={{ marginTop: spacing.md }}
            />

            {/* Biometric Login */}
            {biometricAvailable && (
              <View style={{ alignItems: 'center' as const, marginTop: spacing.lg }}>
                <Text style={{
                  ...typography.authHelper,
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: spacing.md,
                  textAlign: 'center',
                }}>
                  Or use biometric authentication
                </Text>
                <BiometricButton
                  variant="ghost"
                  size="medium"
                  onSuccess={handleBiometricLogin}
                  onError={(err) => error(err)}
                  promptMessage="Use your biometric to login quickly"
                  testID="biometric-login-button"
                />
              </View>
            )}
          </View>
        </AuthCard>

        {/* FOOTER ACTIONS */}
        <View style={getFooterStyles()}>
          <AuthButton
            title="❓ Forgot Password?"
            variant="ghost"
            size="small"
            onPress={handleForgotPassword}
          />

          <AuthButton
            title="⬅️ Back to Welcome"
            variant="ghost"
            size="small"
            onPress={handleBack}
          />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={staffAuthForm.isLoading}
        message="Authenticating..."
        testID="loading-overlay"
      />

      {/* Toast Notifications */}
      {ToastComponent}
    </SafeAreaView>
  );
};

export default StaffLoginScreen;