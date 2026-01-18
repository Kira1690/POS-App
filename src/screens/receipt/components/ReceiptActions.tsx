/**
 * ReceiptActions - Action buttons for receipt operations
 *
 * Provides:
 * - Print receipt
 * - Email receipt
 * - SMS receipt
 * - Share receipt
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface ReceiptActionsProps {
  onPrint: () => Promise<void>;
  onEmail: (email: string) => Promise<void>;
  onSms: (phone: string) => Promise<void>;
  onShare?: () => void;
  onDone: () => void;
  isLoading?: boolean;
}

export const ReceiptActions: React.FC<ReceiptActionsProps> = memo(
  ({ onPrint, onEmail, onSms, onShare, onDone, isLoading = false }) => {
    const { theme } = useTheme();
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    const styles = StyleSheet.create({
      container: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
      },
      actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
      },
      actionButton: {
        flex: 1,
        minWidth: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        backgroundColor: theme.colors.surface,
      },
      actionButtonActive: {
        backgroundColor: theme.colors.primaryContainer,
        borderColor: theme.colors.primary,
      },
      actionButtonDisabled: {
        opacity: 0.5,
      },
      actionIcon: {
        marginRight: theme.spacing.xs,
      },
      actionText: {
        ...theme.typography.body2,
        color: theme.colors.onSurface,
        fontWeight: '500',
      },
      doneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
      },
      doneButtonText: {
        ...theme.typography.button,
        color: theme.colors.onPrimary,
        marginLeft: theme.spacing.xs,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        width: '85%',
        maxWidth: 400,
      },
      modalTitle: {
        ...theme.typography.h4,
        color: theme.colors.onSurface,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
      },
      inputContainer: {
        marginBottom: theme.spacing.md,
      },
      inputLabel: {
        ...theme.typography.caption,
        color: theme.colors.onSurfaceVariant,
        marginBottom: theme.spacing.xs,
      },
      input: {
        borderWidth: 1,
        borderColor: theme.colors.outline,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.typography.body1,
        color: theme.colors.onSurface,
      },
      modalActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
      },
      modalButton: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
      },
      cancelButton: {
        backgroundColor: theme.colors.surfaceLight,
      },
      confirmButton: {
        backgroundColor: theme.colors.primary,
      },
      cancelButtonText: {
        ...theme.typography.button,
        color: theme.colors.onSurface,
      },
      confirmButtonText: {
        ...theme.typography.button,
        color: theme.colors.onPrimary,
      },
    });

    const handlePrint = useCallback(async () => {
      setProcessingAction('print');
      try {
        await onPrint();
      } catch (error) {
        Alert.alert('Error', 'Failed to print receipt');
      } finally {
        setProcessingAction(null);
      }
    }, [onPrint]);

    const handleEmailSubmit = useCallback(async () => {
      if (!email.trim()) {
        Alert.alert('Error', 'Please enter an email address');
        return;
      }

      setProcessingAction('email');
      try {
        await onEmail(email);
        setShowEmailModal(false);
        setEmail('');
      } catch (error) {
        Alert.alert('Error', 'Failed to send email');
      } finally {
        setProcessingAction(null);
      }
    }, [email, onEmail]);

    const handleSmsSubmit = useCallback(async () => {
      if (!phone.trim()) {
        Alert.alert('Error', 'Please enter a phone number');
        return;
      }

      setProcessingAction('sms');
      try {
        await onSms(phone);
        setShowSmsModal(false);
        setPhone('');
      } catch (error) {
        Alert.alert('Error', 'Failed to send SMS');
      } finally {
        setProcessingAction(null);
      }
    }, [phone, onSms]);

    const isActionDisabled = isLoading || processingAction !== null;

    return (
      <View style={styles.container}>
        {/* Action Buttons */}
        <View style={styles.actionsGrid}>
          {/* Print */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              processingAction === 'print' && styles.actionButtonActive,
              isActionDisabled && styles.actionButtonDisabled,
            ]}
            onPress={handlePrint}
            disabled={isActionDisabled}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={processingAction === 'print' ? 'printer-check' : 'printer'}
              size={20}
              color={theme.colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>
              {processingAction === 'print' ? 'Printing...' : 'Print'}
            </Text>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              processingAction === 'email' && styles.actionButtonActive,
              isActionDisabled && styles.actionButtonDisabled,
            ]}
            onPress={() => setShowEmailModal(true)}
            disabled={isActionDisabled}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={processingAction === 'email' ? 'email-check' : 'email-outline'}
              size={20}
              color={theme.colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>
              {processingAction === 'email' ? 'Sending...' : 'Email'}
            </Text>
          </TouchableOpacity>

          {/* SMS */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              processingAction === 'sms' && styles.actionButtonActive,
              isActionDisabled && styles.actionButtonDisabled,
            ]}
            onPress={() => setShowSmsModal(true)}
            disabled={isActionDisabled}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={processingAction === 'sms' ? 'message-check' : 'message-text-outline'}
              size={20}
              color={theme.colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>
              {processingAction === 'sms' ? 'Sending...' : 'SMS'}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          {onShare && (
            <TouchableOpacity
              style={[styles.actionButton, isActionDisabled && styles.actionButtonDisabled]}
              onPress={onShare}
              disabled={isActionDisabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color={theme.colors.primary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Done Button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onDone}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="check" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

        {/* Email Modal */}
        <Modal
          visible={showEmailModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEmailModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Email Receipt</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="customer@email.com"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEmailModal(false);
                    setEmail('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleEmailSubmit}
                  disabled={processingAction === 'email'}
                >
                  <Text style={styles.confirmButtonText}>
                    {processingAction === 'email' ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* SMS Modal */}
        <Modal
          visible={showSmsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSmsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>SMS Receipt</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  keyboardType="phone-pad"
                  autoFocus
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowSmsModal(false);
                    setPhone('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleSmsSubmit}
                  disabled={processingAction === 'sms'}
                >
                  <Text style={styles.confirmButtonText}>
                    {processingAction === 'sms' ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

ReceiptActions.displayName = 'ReceiptActions';

export default ReceiptActions;
