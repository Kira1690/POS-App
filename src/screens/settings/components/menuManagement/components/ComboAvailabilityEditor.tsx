/**
 * ComboAvailabilityEditor Component
 * Allows editing combo deal availability settings
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ComboAvailability, DayOfWeek } from '@/types/menu-management-extended.types';

interface ComboAvailabilityEditorProps {
  availability: ComboAvailability;
  onChange: (availability: ComboAvailability) => void;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export const ComboAvailabilityEditor: React.FC<ComboAvailabilityEditorProps> = ({
  availability,
  onChange,
}) => {
  const { theme } = useTheme();

  const handleAlwaysAvailableChange = useCallback((value: boolean) => {
    onChange({
      ...availability,
      always_available: value,
      days_of_week: value ? undefined : [0, 1, 2, 3, 4, 5, 6],
      start_time: value ? undefined : undefined,
      end_time: value ? undefined : undefined,
      start_date: value ? undefined : undefined,
      end_date: value ? undefined : undefined,
    });
  }, [availability, onChange]);

  const handleDayToggle = useCallback((day: DayOfWeek) => {
    const currentDays = availability.days_of_week || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);

    onChange({
      ...availability,
      days_of_week: newDays,
    });
  }, [availability, onChange]);

  const handleSelectAllDays = useCallback(() => {
    onChange({
      ...availability,
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
    });
  }, [availability, onChange]);

  const handleSelectWeekdays = useCallback(() => {
    onChange({
      ...availability,
      days_of_week: [1, 2, 3, 4, 5],
    });
  }, [availability, onChange]);

  const handleSelectWeekends = useCallback(() => {
    onChange({
      ...availability,
      days_of_week: [0, 6],
    });
  }, [availability, onChange]);

  const handleTimeChange = useCallback((field: 'start_time' | 'end_time', value: string) => {
    onChange({
      ...availability,
      [field]: value || undefined,
    });
  }, [availability, onChange]);

  const handleDateChange = useCallback((field: 'start_date' | 'end_date', value: string) => {
    onChange({
      ...availability,
      [field]: value || undefined,
    });
  }, [availability, onChange]);

  const handleClearTimeRange = useCallback(() => {
    onChange({
      ...availability,
      start_time: undefined,
      end_time: undefined,
    });
  }, [availability, onChange]);

  const handleClearDateRange = useCallback(() => {
    onChange({
      ...availability,
      start_date: undefined,
      end_date: undefined,
    });
  }, [availability, onChange]);

  const isDaySelected = useCallback((day: DayOfWeek) => {
    return availability.days_of_week?.includes(day) ?? false;
  }, [availability.days_of_week]);

  const hasTimeRange = availability.start_time || availability.end_time;
  const hasDateRange = availability.start_date || availability.end_date;

  const styles = StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
    },
    section: {
      gap: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    clearButtonText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    switchLabel: {
      flex: 1,
    },
    switchTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    switchDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    quickSelectors: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    quickSelectorButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    quickSelectorButtonActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    quickSelectorText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    quickSelectorTextActive: {
      color: theme.colors.primary,
      fontWeight: '500',
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    dayButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    dayButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dayButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    dayButtonTextSelected: {
      color: theme.colors.onPrimary,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    timeInputContainer: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.xs,
    },
    timeInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    timeSeparator: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
      marginTop: theme.spacing.lg,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    dateInputContainer: {
      flex: 1,
    },
    dateInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.primaryLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.primary,
      lineHeight: 18,
    },
    previewSection: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    previewTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
      textTransform: 'uppercase',
      marginBottom: theme.spacing.sm,
    },
    previewText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    disabledSection: {
      opacity: 0.5,
    },
  });

  const getAvailabilityPreview = () => {
    if (availability.always_available) {
      return 'This combo is available at all times.';
    }

    const parts: string[] = [];

    if (availability.days_of_week && availability.days_of_week.length > 0) {
      if (availability.days_of_week.length === 7) {
        parts.push('Every day');
      } else if (
        availability.days_of_week.length === 5 &&
        availability.days_of_week.every(d => d >= 1 && d <= 5)
      ) {
        parts.push('Weekdays only');
      } else if (
        availability.days_of_week.length === 2 &&
        availability.days_of_week.includes(0) &&
        availability.days_of_week.includes(6)
      ) {
        parts.push('Weekends only');
      } else {
        const dayNames = availability.days_of_week.map(d =>
          DAYS_OF_WEEK.find(day => day.value === d)?.label
        );
        parts.push(dayNames.join(', '));
      }
    }

    if (availability.start_time && availability.end_time) {
      parts.push(`from ${availability.start_time} to ${availability.end_time}`);
    } else if (availability.start_time) {
      parts.push(`starting at ${availability.start_time}`);
    } else if (availability.end_time) {
      parts.push(`until ${availability.end_time}`);
    }

    if (availability.start_date && availability.end_date) {
      parts.push(`between ${availability.start_date} and ${availability.end_date}`);
    } else if (availability.start_date) {
      parts.push(`starting ${availability.start_date}`);
    } else if (availability.end_date) {
      parts.push(`until ${availability.end_date}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No availability restrictions set.';
  };

  const isAllDays = availability.days_of_week?.length === 7;
  const isWeekdays = availability.days_of_week?.length === 5 &&
    availability.days_of_week.every(d => d >= 1 && d <= 5);
  const isWeekends = availability.days_of_week?.length === 2 &&
    availability.days_of_week?.includes(0) &&
    availability.days_of_week?.includes(6);

  return (
    <View style={styles.container}>
      {/* Always Available Toggle */}
      <View style={styles.switchRow}>
        <View style={styles.switchLabel}>
          <Text style={styles.switchTitle}>Always Available</Text>
          <Text style={styles.switchDescription}>
            No time or date restrictions
          </Text>
        </View>
        <Switch
          value={availability.always_available}
          onValueChange={handleAlwaysAvailableChange}
          trackColor={{
            false: theme.colors.outline,
            true: theme.colors.primaryLight,
          }}
          thumbColor={availability.always_available ? theme.colors.primary : theme.colors.surface}
        />
      </View>

      {/* Days of Week */}
      <View style={[styles.section, availability.always_available && styles.disabledSection]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Days of Week</Text>
            <Text style={styles.sectionSubtitle}>Select when this combo is available</Text>
          </View>
        </View>

        <View style={styles.quickSelectors}>
          <TouchableOpacity
            style={[styles.quickSelectorButton, isAllDays && styles.quickSelectorButtonActive]}
            onPress={handleSelectAllDays}
            disabled={availability.always_available}
          >
            <Text style={[styles.quickSelectorText, isAllDays && styles.quickSelectorTextActive]}>
              All Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickSelectorButton, isWeekdays && styles.quickSelectorButtonActive]}
            onPress={handleSelectWeekdays}
            disabled={availability.always_available}
          >
            <Text style={[styles.quickSelectorText, isWeekdays && styles.quickSelectorTextActive]}>
              Weekdays
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickSelectorButton, isWeekends && styles.quickSelectorButtonActive]}
            onPress={handleSelectWeekends}
            disabled={availability.always_available}
          >
            <Text style={[styles.quickSelectorText, isWeekends && styles.quickSelectorTextActive]}>
              Weekends
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysGrid}>
          {DAYS_OF_WEEK.map(day => {
            const selected = isDaySelected(day.value);
            return (
              <TouchableOpacity
                key={day.value}
                style={[styles.dayButton, selected && styles.dayButtonSelected]}
                onPress={() => handleDayToggle(day.value)}
                disabled={availability.always_available}
                accessibilityLabel={`${day.label}, ${selected ? 'selected' : 'not selected'}`}
              >
                <Text style={[styles.dayButtonText, selected && styles.dayButtonTextSelected]}>
                  {day.short}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Time Range */}
      <View style={[styles.section, availability.always_available && styles.disabledSection]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Time Range</Text>
            <Text style={styles.sectionSubtitle}>Optional daily time window</Text>
          </View>
          {hasTimeRange && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearTimeRange}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeInputContainer}>
            <Text style={styles.inputLabel}>Start Time</Text>
            <TextInput
              style={styles.timeInput}
              value={availability.start_time || ''}
              onChangeText={(value) => handleTimeChange('start_time', value)}
              placeholder="e.g., 11:00"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              editable={!availability.always_available}
            />
          </View>
          <Text style={styles.timeSeparator}>to</Text>
          <View style={styles.timeInputContainer}>
            <Text style={styles.inputLabel}>End Time</Text>
            <TextInput
              style={styles.timeInput}
              value={availability.end_time || ''}
              onChangeText={(value) => handleTimeChange('end_time', value)}
              placeholder="e.g., 14:00"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              editable={!availability.always_available}
            />
          </View>
        </View>
      </View>

      {/* Date Range */}
      <View style={[styles.section, availability.always_available && styles.disabledSection]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <Text style={styles.sectionSubtitle}>Optional promotional period</Text>
          </View>
          {hasDateRange && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearDateRange}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <TextInput
              style={styles.dateInput}
              value={availability.start_date || ''}
              onChangeText={(value) => handleDateChange('start_date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              editable={!availability.always_available}
            />
          </View>
          <Text style={styles.timeSeparator}>to</Text>
          <View style={styles.dateInputContainer}>
            <Text style={styles.inputLabel}>End Date</Text>
            <TextInput
              style={styles.dateInput}
              value={availability.end_date || ''}
              onChangeText={(value) => handleDateChange('end_date', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              editable={!availability.always_available}
            />
          </View>
        </View>
      </View>

      {/* Preview */}
      <View style={styles.previewSection}>
        <Text style={styles.previewTitle}>Preview</Text>
        <Text style={styles.previewText}>{getAvailabilityPreview()}</Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={18} color={theme.colors.primary} />
        <Text style={styles.infoText}>
          Limited-time combos create urgency and can drive sales. Use time and date restrictions
          for lunch specials, happy hour deals, or seasonal promotions.
        </Text>
      </View>
    </View>
  );
};

export default ComboAvailabilityEditor;
