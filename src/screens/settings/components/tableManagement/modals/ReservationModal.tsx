/**
 * Reservation Modal
 * Create or modify table reservations with time picker
 * Phase 2 - Complete Modal System
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { CapacityStepper } from '../components/CapacityStepper';

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reservation: ReservationData) => void;
  tableNumber: string;
  tableCapacity: number;
  existingReservation?: ReservationData;
}

export interface ReservationData {
  customerName: string;
  guestCount: number;
  contactPhone: string;
  reservationDate: string;
  reservationTime: string;
  duration: number; // in minutes
  specialRequests: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  visible,
  onClose,
  onSave,
  tableNumber,
  tableCapacity,
  existingReservation,
}) => {
  const { theme } = useTheme();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [contactPhone, setContactPhone] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [duration, setDuration] = useState(90); // Default 90 minutes
  const [specialRequests, setSpecialRequests] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Error state
  const [errors, setErrors] = useState<{
    customerName?: string;
    contactPhone?: string;
    reservationDate?: string;
    reservationTime?: string;
  }>({});

  // Initialize form with existing reservation data
  useEffect(() => {
    if (existingReservation && visible) {
      setCustomerName(existingReservation.customerName);
      setGuestCount(existingReservation.guestCount);
      setContactPhone(existingReservation.contactPhone);
      setReservationDate(existingReservation.reservationDate);
      setReservationTime(existingReservation.reservationTime);
      setDuration(existingReservation.duration);
      setSpecialRequests(existingReservation.specialRequests);
    } else if (visible) {
      // Reset form for new reservation
      setCustomerName('');
      setGuestCount(2);
      setContactPhone('');
      setReservationDate(getTodayDate());
      setReservationTime('');
      setDuration(90);
      setSpecialRequests('');
    }
    setErrors({});
  }, [existingReservation, visible]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Time slots for quick selection
  const timeSlots = [
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '5:00 PM',
    '5:30 PM',
    '6:00 PM',
    '6:30 PM',
    '7:00 PM',
    '7:30 PM',
    '8:00 PM',
    '8:30 PM',
    '9:00 PM',
  ];

  // Duration options
  const durationOptions = [60, 90, 120, 150, 180];

  // Validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(contactPhone)) {
      newErrors.contactPhone = 'Invalid phone number format';
    }

    if (!reservationDate) {
      newErrors.reservationDate = 'Reservation date is required';
    }

    if (!reservationTime) {
      newErrors.reservationTime = 'Reservation time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    const reservationData: ReservationData = {
      customerName,
      guestCount,
      contactPhone,
      reservationDate,
      reservationTime,
      duration,
      specialRequests,
    };

    onSave(reservationData);
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 600,
      maxHeight: '90%',
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.xl as number,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      backgroundColor: theme.colors.warning,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    headerTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      color: theme.colors.white,
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: theme.colors.white,
      opacity: 0.9,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      padding: spacing.lg,
    },
    sectionTitle: {
      ...typography.titleMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    fieldGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.bodyMedium,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: spacing.xs,
    },
    requiredIndicator: {
      color: theme.colors.error,
    },
    input: {
      ...typography.bodyMedium,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.md,
      color: theme.colors.onSurface,
      minHeight: 56,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: 2,
    },
    errorText: {
      ...typography.bodySmall,
      color: theme.colors.error,
      marginTop: spacing.xs,
    },
    timePickerContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.sm,
    },
    timeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    timeSlot: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      minWidth: 80,
      alignItems: 'center',
    },
    timeSlotSelected: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
    },
    timeSlotText: {
      ...typography.bodySmall,
      color: theme.colors.onSurface,
    },
    timeSlotTextSelected: {
      color: theme.colors.white,
      fontWeight: '600',
    },
    durationContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    durationOption: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      flex: 1,
      minWidth: 70,
      alignItems: 'center',
    },
    durationOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    durationText: {
      ...typography.bodySmall,
      color: theme.colors.onSurface,
    },
    durationTextSelected: {
      color: theme.colors.white,
      fontWeight: '600',
    },
    notesInput: {
      ...typography.bodyMedium,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      padding: spacing.md,
      color: theme.colors.onSurface,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    infoBox: {
      backgroundColor: theme.colors.info + '15',
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.info,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    infoText: {
      ...typography.bodySmall,
      color: theme.colors.info,
      flex: 1,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon
                name="calendar-clock"
                size={24}
                color={theme.colors.white}
                accessibilityLabel="Reservation"
              />
              <View>
                <Text style={styles.headerTitle}>
                  {existingReservation ? 'Edit Reservation' : 'New Reservation'}
                </Text>
                <Text style={styles.headerSubtitle}>Table {tableNumber}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon
                name="close"
                size={24}
                color={theme.colors.white}
                accessibilityLabel="Close"
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Customer Information</Text>

            {/* Customer Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Customer Name <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.customerName && styles.inputError]}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter customer name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              {errors.customerName && (
                <Text style={styles.errorText}>{errors.customerName}</Text>
              )}
            </View>

            {/* Number of Guests */}
            <View style={styles.fieldGroup}>
              <CapacityStepper
                value={guestCount}
                onChange={setGuestCount}
                min={1}
                max={tableCapacity}
                label={`Number of Guests * (Max: ${tableCapacity})`}
              />
            </View>

            {/* Contact Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Contact Phone <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.contactPhone && styles.inputError]}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="phone-pad"
              />
              {errors.contactPhone && (
                <Text style={styles.errorText}>{errors.contactPhone}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Reservation Details</Text>

            {/* Reservation Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Reservation Date <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.reservationDate && styles.inputError]}
                value={reservationDate}
                onChangeText={setReservationDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              {errors.reservationDate && (
                <Text style={styles.errorText}>{errors.reservationDate}</Text>
              )}
            </View>

            {/* Reservation Time */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Reservation Time <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <View style={styles.timePickerContainer}>
                <View style={styles.timeGrid}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        reservationTime === time && styles.timeSlotSelected,
                      ]}
                      onPress={() => setReservationTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          reservationTime === time && styles.timeSlotTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {errors.reservationTime && (
                <Text style={styles.errorText}>{errors.reservationTime}</Text>
              )}
            </View>

            {/* Expected Duration */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Expected Duration</Text>
              <View style={styles.durationContainer}>
                {durationOptions.map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.durationOption,
                      duration === mins && styles.durationOptionSelected,
                    ]}
                    onPress={() => setDuration(mins)}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        duration === mins && styles.durationTextSelected,
                      ]}
                    >
                      {mins} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Special Requests */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Special Requests</Text>
              <TextInput
                style={styles.notesInput}
                value={specialRequests}
                onChangeText={setSpecialRequests}
                placeholder="Birthday celebration, dietary restrictions, etc."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                maxLength={200}
              />
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon
                name="information-outline"
                size={20}
                color={theme.colors.info}
                accessibilityLabel="Info"
              />
              <Text style={styles.infoText}>
                Reservation will be held for 15 minutes past scheduled time. Please arrive on time
                to avoid cancellation.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <AppleButton
              title="Cancel"
              variant="secondary"
              size="medium"
              icon={
                <Icon
                  name="close"
                  size={18}
                  color={theme.colors.onSurface}
                  accessibilityLabel="Cancel"
                />
              }
              iconPosition="left"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <AppleButton
              title="Save Reservation"
              variant="success"
              size="medium"
              icon={
                <Icon name="check" size={18} color={theme.colors.white} accessibilityLabel="Save" />
              }
              iconPosition="left"
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
