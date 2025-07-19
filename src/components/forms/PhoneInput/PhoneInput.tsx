import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthInput, type AuthInputProps } from '../../auth/AuthInput';
import { useTheme } from '../../../hooks/useTheme';
import { spacing, borderRadius, touchTargets } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';

export interface Country {
  code: string; // ISO 3166-1 alpha-2 country code
  name: string;
  dialCode: string;
  flag: string; // Emoji flag
}

export interface PhoneInputProps extends Omit<AuthInputProps, 'variant' | 'leftIcon' | 'keyboardType'> {
  /** Current phone number value */
  value: string;
  /** Phone number change handler */
  onChangeNumber: (number: string) => void;
  /** Country change handler */
  onChangeCountry: (country: Country) => void;
  /** Default country code (ISO 3166-1 alpha-2) */
  defaultCountry?: string;
  /** Selected country */
  selectedCountry?: Country;
  /** Show country picker */
  showCountryPicker?: boolean;
  /** Custom countries list */
  countries?: Country[];
  /** Disable country selection */
  disableCountrySelection?: boolean;
  /** Auto format phone number */
  autoFormat?: boolean;
  /** Validation mode */
  validationMode?: 'strict' | 'lenient' | 'none';
}

// Common countries with their dial codes and flags
const DEFAULT_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeNumber,
  onChangeCountry,
  defaultCountry = 'US',
  selectedCountry,
  showCountryPicker = true,
  countries = DEFAULT_COUNTRIES,
  disableCountrySelection = false,
  autoFormat = true,
  validationMode = 'lenient',
  ...props
}) => {
  const { theme } = useTheme();
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current country
  const currentCountry = useMemo(() => {
    if (selectedCountry) return selectedCountry;
    return countries.find(country => country.code === defaultCountry) || countries[0];
  }, [selectedCountry, defaultCountry, countries]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countries, searchQuery]);

  // Format phone number
  const formatPhoneNumber = (number: string, country: Country): string => {
    if (!autoFormat) return number;
    
    // Remove all non-digits
    const digits = number.replace(/\D/g, '');
    
    // Apply basic formatting based on country
    switch (country.code) {
      case 'US':
      case 'CA':
        // Format: (XXX) XXX-XXXX
        if (digits.length >= 6) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        } else if (digits.length >= 3) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        return digits;
      default:
        // Basic formatting with spaces every 3-4 digits
        return digits.replace(/(\d{3,4})(?=\d)/g, '$1 ');
    }
  };

  // Validate phone number
  const validatePhoneNumber = (number: string, country: Country): boolean => {
    if (validationMode === 'none') return true;
    
    const digits = number.replace(/\D/g, '');
    
    if (validationMode === 'strict') {
      // Strict validation based on country
      switch (country.code) {
        case 'US':
        case 'CA':
          return digits.length === 10;
        default:
          return digits.length >= 7 && digits.length <= 15;
      }
    } else {
      // Lenient validation
      return digits.length >= 4;
    }
  };

  // Handle phone number change
  const handleNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text, currentCountry);
    onChangeNumber(formatted);
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    onChangeCountry(country);
    setIsCountryPickerVisible(false);
    setSearchQuery('');
  };

  // Get country picker button styles
  const getCountryPickerButtonStyles = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: theme.colors.authInputBorder,
    marginRight: spacing.sm,
  });

  // Get country picker text styles
  const getCountryPickerTextStyles = (): TextStyle => ({
    ...typography.authInput,
    color: theme.colors.onSurface,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  });

  // Get modal styles
  const getModalStyles = (): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.surface,
    marginTop: 50,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
  });

  // Get modal header styles
  const getModalHeaderStyles = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  });

  // Get modal title styles
  const getModalTitleStyles = (): TextStyle => ({
    ...typography.authTitle,
    color: theme.colors.onSurface,
    fontSize: 18,
  });

  // Get country item styles
  const getCountryItemStyles = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
    minHeight: touchTargets.comfortable,
  });

  // Get country flag styles
  const getCountryFlagStyles = (): TextStyle => ({
    fontSize: 24,
    marginRight: spacing.md,
  });

  // Get country info styles
  const getCountryInfoStyles = (): ViewStyle => ({
    flex: 1,
  });

  // Get country name styles
  const getCountryNameStyles = (): TextStyle => ({
    ...typography.authBody,
    color: theme.colors.onSurface,
    fontWeight: '500',
  });

  // Get country dial code styles
  const getCountryDialCodeStyles = (): TextStyle => ({
    ...typography.authHelper,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  });

  // Render country item
  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={getCountryItemStyles()}
      onPress={() => handleCountrySelect(item)}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.name}, ${item.dialCode}`}
    >
      <Text style={getCountryFlagStyles()}>{item.flag}</Text>
      <View style={getCountryInfoStyles()}>
        <Text style={getCountryNameStyles()}>{item.name}</Text>
        <Text style={getCountryDialCodeStyles()}>{item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  // Get error message for validation
  const getValidationError = (): string | undefined => {
    if (!value || validatePhoneNumber(value, currentCountry)) {
      return props.error;
    }
    return 'Please enter a valid phone number';
  };

  return (
    <View>
      {/* Phone Input with Country Picker */}
      <AuthInput
        {...props}
        variant="phone"
        value={value}
        onChangeText={handleNumberChange}
        keyboardType="phone-pad"
        error={getValidationError()}
        leftIcon={showCountryPicker ? undefined : 'phone'}
        style={{
          paddingLeft: showCountryPicker ? 0 : spacing.lg,
        }}
      />

      {/* Country Picker Button Overlay */}
      {showCountryPicker && (
        <View
          style={{
            position: 'absolute',
            left: spacing.lg,
            top: '50%',
            transform: [{ translateY: -12 }],
            zIndex: 1,
          }}
        >
          <TouchableOpacity
            style={getCountryPickerButtonStyles()}
            onPress={() => setIsCountryPickerVisible(true)}
            disabled={disableCountrySelection}
            accessibilityRole="button"
            accessibilityLabel={`Selected country: ${currentCountry.name}. Tap to change.`}
          >
            <Text style={getCountryFlagStyles()}>{currentCountry.flag}</Text>
            <Text style={getCountryPickerTextStyles()}>{currentCountry.dialCode}</Text>
            {!disableCountrySelection && (
              <MaterialIcons
                name="keyboard-arrow-down"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Country Picker Modal */}
      <Modal
        visible={isCountryPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCountryPickerVisible(false)}
      >
        <View style={getModalStyles()}>
          {/* Modal Header */}
          <View style={getModalHeaderStyles()}>
            <Text style={getModalTitleStyles()}>Select Country</Text>
            <TouchableOpacity
              onPress={() => setIsCountryPickerVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close country picker"
            >
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={{ padding: spacing.lg }}>
            <AuthInput
              label="Search countries"
              placeholder="Search by name or code"
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="search"
              variant="search"
            />
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </View>
  );
};

// Hook for phone number validation
export const usePhoneValidation = (
  country: Country,
  validationMode: 'strict' | 'lenient' | 'none' = 'lenient'
) => {
  const validatePhone = (phoneNumber: string): string | null => {
    if (!phoneNumber) return 'Phone number is required';
    
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (validationMode === 'none') return null;
    
    if (validationMode === 'strict') {
      switch (country.code) {
        case 'US':
        case 'CA':
          if (digits.length !== 10) {
            return 'Phone number must be 10 digits';
          }
          break;
        default:
          if (digits.length < 7 || digits.length > 15) {
            return 'Phone number must be between 7 and 15 digits';
          }
      }
    } else {
      // Lenient validation
      if (digits.length < 4) {
        return 'Phone number is too short';
      }
      if (digits.length > 15) {
        return 'Phone number is too long';
      }
    }
    
    return null;
  };

  const formatPhoneForAPI = (phoneNumber: string): string => {
    const digits = phoneNumber.replace(/\D/g, '');
    return `${country.dialCode}${digits}`;
  };

  return { validatePhone, formatPhoneForAPI };
};

export default PhoneInput;