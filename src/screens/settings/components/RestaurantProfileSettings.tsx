import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { RestaurantProfile } from '@/types/settings.types';
import { MockSettingsService } from '@/services/settings/MockSettingsService';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/common';

interface RestaurantProfileSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

const BUSINESS_TYPES = [
  { value: 'quick_service', label: 'Quick Service Restaurant' },
  { value: 'casual_dining', label: 'Casual Dining' },
  { value: 'fine_dining', label: 'Fine Dining' },
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'cafe', label: 'Cafe' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/Denver', label: 'America/Denver' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
];

export default function RestaurantProfileSettings({ onChangesDetected }: RestaurantProfileSettingsProps) {
  // Theme hook FIRST (REQUIRED per CLAUDE.md)
  const { theme } = useTheme();

  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const settingsService = MockSettingsService.getInstance();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile && originalProfile) {
      const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);
      onChangesDetected(hasChanges);
    }
  }, [profile, originalProfile, onChangesDetected]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await settingsService.getRestaurantProfile('rest_001');
      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurant profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      await settingsService.updateRestaurantProfile('rest_001', profile);
      setOriginalProfile(profile);
      Alert.alert('Success', 'Restaurant profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update restaurant profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetChanges = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
  };

  const handleUploadLogo = async () => {
    try {
      // Mock file upload
      const mockFile = new File([''], 'logo.png', { type: 'image/png' });
      const logoUrl = await settingsService.uploadLogo(mockFile);
      
      if (profile) {
        setProfile({ ...profile, logo_url: logoUrl });
      }
      
      Alert.alert('Success', 'Logo uploaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload logo');
    }
  };

  const updateProfile = (field: keyof RestaurantProfile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  // StyleSheet AFTER hooks and handlers, BEFORE return (REQUIRED per CLAUDE.md)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 25,
    },
    section: {
      backgroundColor: theme.colors.lightGray,
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 15,
    },
    formRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 15,
    },
    formGroup: {
      flex: 1,
    },
    formGroupHalf: {
      flex: 0.5,
    },
    formGroupThird: {
      flex: 0.33,
    },
    formGroupQuarter: {
      flex: 0.25,
    },
    label: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 5,
    },
    input: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 8,
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    inputCenter: {
      textAlign: 'center',
    },
    selectInput: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 8,
      justifyContent: 'center',
    },
    selectText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
    hoursContainer: {
      gap: 15,
    },
    hoursRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dayLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      width: 120,
    },
    timeInputs: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    timeInput: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 12,
      textAlign: 'center',
      width: 60,
    },
    timeDash: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    sameAsMonday: {
      backgroundColor: theme.colors.successLight, // Fixed: was hardcoded '#E8F5E8'
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    sameAsMondayText: {
      fontSize: 11,
      color: theme.colors.success, // Fixed: was hardcoded '#2E7D32'
    },
    holidayHours: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    holidayHoursText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    configureButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    configureButtonText: {
      fontSize: 11,
      color: theme.colors.white,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 20,
      marginTop: 20,
      marginBottom: 30,
    },
    button: {
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    updateButton: {
      backgroundColor: theme.colors.success,
    },
    updateButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    resetButton: {
      backgroundColor: theme.colors.warning,
    },
    resetButtonText: {
      color: theme.colors.onSurface, // Dark text on warning for WCAG AA compliance
      fontSize: 12,
    },
    logoButton: {
      backgroundColor: theme.colors.primary,
    },
    logoButtonText: {
      color: theme.colors.white,
      fontSize: 12,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading restaurant profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load restaurant profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Restaurant Profile</Text>

      {/* Basic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(value) => updateProfile('name', value)}
              placeholder="Enter restaurant name"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Business Type</Text>
            <View style={styles.selectInput}>
              <Text style={styles.selectText}>
                {BUSINESS_TYPES.find(type => type.value === profile.business_type)?.label} ▼
              </Text>
            </View>
          </View>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Cuisine Type</Text>
            <View style={styles.selectInput}>
              <Text style={styles.selectText}>Multi-Cuisine ▼</Text>
            </View>
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(value) => updateProfile('phone', value)}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(value) => updateProfile('email', value)}
              placeholder="contact@restaurant.com"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Timezone</Text>
            <View style={styles.selectInput}>
              <Text style={styles.selectText}>
                {TIMEZONES.find(tz => tz.value === profile.timezone)?.label} ▼
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Location Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Details</Text>
        
        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={profile.street_address}
              onChangeText={(value) => updateProfile('street_address', value)}
              placeholder="123 Main Street"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupThird]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={profile.city}
              onChangeText={(value) => updateProfile('city', value)}
              placeholder="New York"
            />
          </View>
          <View style={[styles.formGroup, styles.formGroupThird]}>
            <Text style={styles.label}>State</Text>
            <View style={styles.selectInput}>
              <Text style={styles.selectText}>{profile.state} ▼</Text>
            </View>
          </View>
          <View style={[styles.formGroup, styles.formGroupThird]}>
            <Text style={styles.label}>ZIP Code</Text>
            <TextInput
              style={styles.input}
              value={profile.zip_code}
              onChangeText={(value) => updateProfile('zip_code', value)}
              placeholder="10001"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Tax ID/EIN</Text>
            <TextInput
              style={styles.input}
              value={profile.tax_id}
              onChangeText={(value) => updateProfile('tax_id', value)}
              placeholder="12-3456789"
            />
          </View>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.label}>Business License</Text>
            <TextInput
              style={styles.input}
              value={profile.business_license}
              onChangeText={(value) => updateProfile('business_license', value)}
              placeholder="BL-NYC-2023-001"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupQuarter]}>
            <Text style={styles.label}>Sales Tax Rate (%)</Text>
            <TextInput
              style={[styles.input, styles.inputCenter]}
              value={profile.sales_tax_rate.toString()}
              onChangeText={(value) => updateProfile('sales_tax_rate', parseFloat(value) || 0)}
              placeholder="8.25"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      {/* Operating Hours Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operating Hours</Text>
        
        <View style={styles.hoursContainer}>
          <View style={styles.hoursRow}>
            <Text style={styles.dayLabel}>Monday</Text>
            <View style={styles.timeInputs}>
              <TextInput
                style={styles.timeInput}
                value={profile.operating_hours.monday.open}
                placeholder="08:00"
              />
              <Text style={styles.timeDash}>—</Text>
              <TextInput
                style={styles.timeInput}
                value={profile.operating_hours.monday.close}
                placeholder="22:00"
              />
            </View>
          </View>

          <View style={styles.hoursRow}>
            <Text style={styles.dayLabel}>Tuesday - Friday</Text>
            <View style={styles.sameAsMonday}>
              <Text style={styles.sameAsMondayText}>✓ Same as Monday</Text>
            </View>
          </View>

          <View style={styles.hoursRow}>
            <Text style={styles.dayLabel}>Saturday - Sunday</Text>
            <View style={styles.timeInputs}>
              <TextInput
                style={styles.timeInput}
                value={profile.operating_hours.saturday.open}
                placeholder="09:00"
              />
              <Text style={styles.timeDash}>—</Text>
              <TextInput
                style={styles.timeInput}
                value={profile.operating_hours.saturday.close}
                placeholder="23:00"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.holidayHours}>
            <Text style={styles.holidayHoursText}>📅 Special Holiday Hours</Text>
            <TouchableOpacity style={styles.configureButton}>
              <Text style={styles.configureButtonText}>Configure</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={handleUpdateProfile}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={saving ? 'Updating profile' : 'Update profile'}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {!saving && <Icon name="content-save" size={16} color={theme.colors.white} />}
            <Text style={styles.updateButtonText}>
              {saving ? 'Updating...' : 'Update Profile'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleResetChanges}
          accessibilityRole="button"
          accessibilityLabel="Reset changes"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="refresh" size={16} color={theme.colors.white} />
            <Text style={styles.resetButtonText}>Reset Changes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoButton]}
          onPress={handleUploadLogo}
          accessibilityRole="button"
          accessibilityLabel="Upload logo"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="camera" size={16} color={theme.colors.white} />
            <Text style={styles.logoButtonText}>Upload Logo</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}