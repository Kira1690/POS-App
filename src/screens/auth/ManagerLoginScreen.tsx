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
  AuthInput,
  LoadingOverlay,
  Toast,
  useToast
} from '../../components/auth';
import {
  FormField,
  PasswordInput,
  OTPInput,
  useOTPInput,
  BiometricButton,
  useBiometricAuth
} from '../../components/forms';
import { useTheme } from '../../hooks/useTheme';
import { useAuthForm, useAuthStatus } from '@/hooks/auth';
import { spacing } from '../../design-system/theme/spacing';
import { typography } from '../../design-system/theme/typography';

// APPLE COMPONENT SYSTEM (Universal Auth Components)
import {
  AppleCard,
  AppleButton,
  AppleToggle,
} from '@/components/apple';

interface ManagerLoginScreenProps {
  // Navigation will be typed properly in navigation setup
}

export const ManagerLoginScreen: React.FC<ManagerLoginScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  
  // Auth hooks
  const authStatus = useAuthStatus();
  const authForm = useAuthForm({
    onSuccess: () => {
      success('Welcome back, Manager!');
      setTimeout(() => {
        // navigation.navigate('ManagerDashboard');
        console.log('Navigate to Manager Dashboard');
      }, 1000);
    },
    onError: (errorMessage) => {
      error(errorMessage);
    }
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [requireMFA, setRequireMFA] = useState(false);
  
  // MFA/OTP state
  const {
    otp,
    error: otpError,
    isComplete: otpComplete,
    handleOTPChange,
    validateOTP,
    resetOTP,
    setOTPError,
  } = useOTPInput(6, true);
  
  // Biometric authentication
  const { isAvailable: biometricAvailable, authenticate: authenticateBiometric } = useBiometricAuth();
  
  // Toast notifications
  const { toastProps, success, error, ToastComponent } = useToast();

  // Handle initial login (credentials validation)
  const handleInitialLogin = async () => {
    await authForm.handleLogin();
  };

  // Handle MFA verification
  const handleMFAVerification = async () => {
    if (!validateOTP()) return;

    // TODO: Implement MFA verification with real API
    try {
      // TODO: Integrate with actual MFA verification service
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Mock verification
      if (otp === '123456') {
        success('Multi-factor authentication successful!');
        setTimeout(() => {
          // navigation.navigate('ManagerDashboard');
          console.log('Navigate to Manager Dashboard');
        }, 1000);
      } else {
        setOTPError('Invalid verification code. Please try again.');
      }
      
    } catch (err) {
      setOTPError('Verification failed. Please try again.');
    }
  };

  // Handle biometric authentication
  const handleBiometricLogin = async () => {
    try {
      const result = await authenticateBiometric({
        promptMessage: 'Use your biometric for manager access',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        success('Biometric authentication successful!');
        setTimeout(() => {
          // navigation.navigate('ManagerDashboard');
          console.log('Navigate to Manager Dashboard');
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
    if (requireMFA) {
      setRequireMFA(false);
      resetOTP();
    } else {
      navigation.goBack();
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // navigation.navigate('ForgotPassword');
    console.log('Navigate to Forgot Password');
  };

  // Handle resend MFA code
  const handleResendMFA = () => {
    resetOTP();
    success('Verification code resent to your device.');
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

  // Get remember me styles
  const getRememberMeStyles = () => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: spacing.sm,
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
            name="admin-panel-settings"
            size={isTablet ? 64 : 48}
            color={theme.colors.managerRole}
            style={{ marginBottom: spacing.lg }}
          />
          <Text style={getTitleStyles()}>
            {requireMFA ? 'Verify Identity' : 'Manager Login'}
          </Text>
          <Text style={getSubtitleStyles()}>
            {requireMFA 
              ? 'Enter the 6-digit verification code' 
              : 'Access management features and oversight tools'
            }
          </Text>
        </View>

        {/* APPLE LOGIN FORM CARD */}
        <AppleCard
          layer="surface"
          size={isTablet ? 'large' : 'medium'}
          shadow={true}
          style={{ marginBottom: spacing.lg }}
        >
          {!requireMFA ? (
            // Initial Login Form
            <View style={getFormStyles()}>
              {/* Email Field */}
              <FormField
                label="Email Address"
                required
                error={authForm.error}
                helpText="Your manager account email"
              >
                <AuthInput
                  variant="email"
                  placeholder="manager@restaurant.com"
                  value={authForm.email}
                  onChangeText={authForm.setEmail}
                  leftIcon="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  error={authForm.error}
                  testID="email-input"
                />
              </FormField>

              {/* Password Field */}
              <FormField
                label="Password"
                required
                error={authForm.error}
              >
                <PasswordInput
                  placeholder="Enter your password"
                  value={authForm.password}
                  onChangeText={authForm.setPassword}
                  showStrength={false}
                  showRequirements={false}
                  returnKeyType="done"
                  onSubmitEditing={handleInitialLogin}
                  error={authForm.error}
                  testID="password-input"
                />
              </FormField>

              {/* APPLE REMEMBER ME TOGGLE */}
              <View style={getRememberMeStyles()}>
                <Text style={{
                  ...typography.authBody,
                  color: theme.colors.onSurface,
                }}>
                  Remember me on this device
                </Text>
                <AppleToggle
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  variant="default"
                  activeColor="primary"
                  accessibilityLabel="Toggle remember me"
                />
              </View>

              {/* APPLE LOGIN BUTTON */}
              <AppleButton
                title="🔐 Sign In"
                variant="primary"
                size={isTablet ? 'large' : 'medium'}
                onPress={handleInitialLogin}
                disabled={authForm.isLoading || !authForm.isValid}
                loading={authForm.isLoading}
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
                    promptMessage="Use your biometric for manager access"
                    testID="biometric-login-button"
                  />
                </View>
              )}
            </View>
          ) : (
            // MFA Verification Form
            <View style={getFormStyles()}>
              <Text style={{
                ...typography.authBody,
                color: theme.colors.onSurface,
                textAlign: 'center',
                marginBottom: spacing.lg,
              }}>
                We've sent a verification code to your registered device.
              </Text>

              {/* OTP Input */}
              <FormField
                label="Verification Code"
                required
                error={otpError}
              >
                <OTPInput
                  length={6}
                  value={otp}
                  onChangeText={handleOTPChange}
                  autoFocus={true}
                  showResendTimer={true}
                  resendTimeout={30}
                  onResend={handleResendMFA}
                  onSubmit={handleMFAVerification}
                  error={otpError}
                  testID="mfa-otp-input"
                />
              </FormField>

              {/* APPLE VERIFY BUTTON */}
              <AppleButton
                title="✅ Verify & Continue"
                variant="primary"
                size={isTablet ? 'large' : 'medium'}
                onPress={handleMFAVerification}
                disabled={authForm.isLoading || !otpComplete}
                loading={authForm.isLoading}
                fullWidth={true}
                style={{ marginTop: spacing.md }}
              />
            </View>
          )}
        </AppleCard>

        {/* APPLE FOOTER ACTIONS */}
        <View style={getFooterStyles()}>
          {!requireMFA && (
            <AppleButton
              title="❓ Forgot Password?"
              variant="ghost"
              size="small"
              onPress={handleForgotPassword}
            />
          )}

          <AppleButton
            title={requireMFA ? '⬅️ Back to Login' : '⬅️ Back to Welcome'}
            variant="ghost"
            size="small"
            onPress={handleBack}
          />
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={authForm.isLoading}
        message={requireMFA ? 'Verifying code...' : 'Authenticating...'}
        testID="loading-overlay"
      />

      {/* Toast Notifications */}
      {ToastComponent}
    </SafeAreaView>
  );
};

export default ManagerLoginScreen;