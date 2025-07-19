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
import { spacing } from '../../design-system/theme/spacing';
import { typography } from '../../design-system/theme/typography';

interface StaffLoginForm {
  employeeId: string;
  password: string;
}

interface StaffLoginScreenProps {
  // Navigation will be typed properly in navigation setup
}

export const StaffLoginScreen: React.FC<StaffLoginScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  
  // Form state
  const [form, setForm] = useState<StaffLoginForm>({
    employeeId: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<StaffLoginForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Biometric authentication
  const { isAvailable: biometricAvailable, authenticate: authenticateBiometric } = useBiometricAuth();
  
  // Toast notifications
  const { toastProps, success, error, ToastComponent } = useToast();

  // Initialize biometric check
  useEffect(() => {
    // Check biometric availability on mount
  }, []);

  // Handle form field changes
  const handleFieldChange = (field: keyof StaffLoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<StaffLoginForm> = {};

    if (!form.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (form.employeeId.length < 3) {
      newErrors.employeeId = 'Employee ID must be at least 3 characters';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle staff login
  const handleStaffLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Integrate with actual authentication service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock successful login
      success('Welcome back! Logging you in...');
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        // navigation.navigate('Dashboard');
        console.log('Navigate to Dashboard');
      }, 1000);
      
    } catch (err) {
      error('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          console.log('Navigate to Dashboard');
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
    console.log('Navigate to Forgot Password');
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
    justifyContent: 'center',
  });

  // Get header styles
  const getHeaderStyles = () => ({
    alignItems: 'center',
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
    alignItems: 'center',
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
              error={errors.employeeId}
              helpText="Your unique employee identifier"
            >
              <AuthInput
                placeholder="Enter your employee ID"
                value={form.employeeId}
                onChangeText={(text) => handleFieldChange('employeeId', text)}
                leftIcon="badge"
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
                error={errors.employeeId}
                testID="employee-id-input"
              />
            </FormField>

            {/* Password Field */}
            <FormField
              label="Password"
              required
              error={errors.password}
            >
              <PasswordInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(text) => handleFieldChange('password', text)}
                showStrength={false}
                showRequirements={false}
                returnKeyType="done"
                onSubmitEditing={handleStaffLogin}
                error={errors.password}
                testID="password-input"
              />
            </FormField>

            {/* Login Button */}
            <AuthButton
              variant="primary"
              size={isTablet ? 'large' : 'medium'}
              onPress={handleStaffLogin}
              loading={isLoading}
              disabled={isLoading}
              icon="login"
              accessibilityLabel="Login to staff account"
              testID="login-button"
              style={{ marginTop: spacing.md }}
            >
              Clock In
            </AuthButton>

            {/* Biometric Login */}
            {biometricAvailable && (
              <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
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

        {/* Footer Actions */}
        <View style={getFooterStyles()}>
          <AuthButton
            variant="ghost"
            size="small"
            onPress={handleForgotPassword}
            icon="help"
            accessibilityLabel="Forgot password help"
            testID="forgot-password-button"
          >
            Forgot Password?
          </AuthButton>

          <AuthButton
            variant="ghost"
            size="small"
            onPress={handleBack}
            icon="arrow-back"
            accessibilityLabel="Go back to welcome screen"
            testID="back-button"
          >
            Back to Welcome
          </AuthButton>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        message="Authenticating..."
        testID="loading-overlay"
      />

      {/* Toast Notifications */}
      {ToastComponent}
    </SafeAreaView>
  );
};

export default StaffLoginScreen;