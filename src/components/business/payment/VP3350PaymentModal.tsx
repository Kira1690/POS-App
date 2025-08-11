/**
 * VP3350PaymentModal
 * Professional VP3350 payment device integration modal
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useVP3350Device } from '@/context/payment';
import { VP3350DeviceStatus } from '@/types/payment.types';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';

interface VP3350PaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onPayment: (result: any) => void;
  onCancel: () => void;
}

export const VP3350PaymentModal: React.FC<VP3350PaymentModalProps> = ({
  visible,
  totalAmount,
  onPayment,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { 
    vp3350Status, 
    vp3350Config,
    connectVP3350Device,
    processVP3350Payment 
  } = useVP3350Device();

  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-connect when modal opens if not connected
  useEffect(() => {
    if (visible && vp3350Status === VP3350DeviceStatus.DISCONNECTED && !vp3350Config) {
      // Mock device configuration for demonstration
      const mockConfig = {
        deviceName: 'VP3350-Demo',
        bluetoothId: 'VP3350_001',
        terminalId: 'TERM001',
        merchantId: 'MERCH001',
        currency: 'USD',
        timeout: 30,
        autoConnect: true,
        enableContactless: true,
        enableChip: true,
        enableSwipe: true,
        enablePin: true,
      };
      
      connectVP3350Device(mockConfig).catch(console.error);
    }
  }, [visible, vp3350Status, vp3350Config, connectVP3350Device]);

  // Handle VP3350 payment
  const handleVP3350Payment = async () => {
    if (vp3350Status !== VP3350DeviceStatus.CONNECTED) {
      return;
    }

    try {
      setIsProcessing(true);
      await processVP3350Payment(totalAmount);
      
      // Mock successful payment result
      const mockPaymentResult = {
        id: 'vp3350_' + Date.now(),
        success: true,
        amount: totalAmount,
        transactionId: 'TXN' + Date.now(),
        authorizationCode: 'AUTH123',
        cardLast4: '1234',
        cardType: 'VISA',
      };
      
      onPayment(mockPaymentResult);
    } catch (error) {
      console.error('VP3350 payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get status message
  const getStatusMessage = () => {
    switch (vp3350Status) {
      case VP3350DeviceStatus.DISCONNECTED:
        return 'Searching for VP3350 device...';
      case VP3350DeviceStatus.CONNECTING:
        return 'Connecting to VP3350 device...';
      case VP3350DeviceStatus.CONNECTED:
        return 'VP3350 device ready for payment';
      case VP3350DeviceStatus.PROCESSING:
        return 'Processing payment on VP3350 device...';
      case VP3350DeviceStatus.ERROR:
        return 'VP3350 device error. Please try again.';
      default:
        return 'VP3350 device status unknown';
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (vp3350Status) {
      case VP3350DeviceStatus.CONNECTED:
        return '#4CAF50'; // Green
      case VP3350DeviceStatus.PROCESSING:
        return theme.colors.primary;
      case VP3350DeviceStatus.ERROR:
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (vp3350Status) {
      case VP3350DeviceStatus.DISCONNECTED:
        return 'bluetooth';
      case VP3350DeviceStatus.CONNECTING:
        return 'bluetooth-connected';
      case VP3350DeviceStatus.CONNECTED:
        return 'bluetooth-connected';
      case VP3350DeviceStatus.PROCESSING:
        return 'sync';
      case VP3350DeviceStatus.ERROR:
        return 'bluetooth-disabled';
      default:
        return 'bluetooth';
    }
  };

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
        <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
        VP3350 Payment
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  // Render device status
  const renderDeviceStatus = () => (
    <View style={[styles.statusContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor()}15` }]}>
        {vp3350Status === VP3350DeviceStatus.PROCESSING || isProcessing ? (
          <ActivityIndicator size="large" color={getStatusColor()} />
        ) : (
          <MaterialIcons name={getStatusIcon()} size={48} color={getStatusColor()} />
        )}
      </View>
      
      <Text style={[styles.statusMessage, { color: getStatusColor() }]}>
        {getStatusMessage()}
      </Text>
      
      {vp3350Config && (
        <Text style={[styles.deviceName, { color: theme.colors.onSurfaceVariant }]}>
          Device: {vp3350Config.deviceName}
        </Text>
      )}
      
      <Text style={[styles.paymentAmount, { color: theme.colors.primary }]}>
        Amount: {formatCurrency(totalAmount)}
      </Text>
    </View>
  );

  // Render instructions
  const renderInstructions = () => {
    if (vp3350Status === VP3350DeviceStatus.CONNECTED && !isProcessing) {
      return (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.onSurface }]}>
            Payment Instructions
          </Text>
          
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <MaterialIcons name="credit-card" size={20} color={theme.colors.primary} />
              <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                Insert, tap, or swipe card on VP3350 device
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <MaterialIcons name="nfc" size={20} color={theme.colors.primary} />
              <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                Contactless payments supported
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <MaterialIcons name="security" size={20} color={theme.colors.primary} />
              <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
                Follow prompts on the device screen
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (vp3350Status === VP3350DeviceStatus.PROCESSING || isProcessing) {
      return (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.processingTitle, { color: theme.colors.primary }]}>
            Processing Payment...
          </Text>
          <Text style={[styles.processingText, { color: theme.colors.onSurfaceVariant }]}>
            Please wait and do not remove your card
          </Text>
        </View>
      );
    }

    return null;
  };

  // Render action buttons
  const renderActionButtons = () => {
    const canProcess = vp3350Status === VP3350DeviceStatus.CONNECTED && !isProcessing;
    
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.cancelButton,
            { borderColor: theme.colors.outline },
          ]}
          onPress={onCancel}
          disabled={isProcessing}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onSurfaceVariant }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.processButton,
            {
              backgroundColor: canProcess ? theme.colors.primary : theme.colors.surfaceVariant,
              opacity: canProcess ? 1 : 0.5,
            },
          ]}
          onPress={handleVP3350Payment}
          disabled={!canProcess}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          ) : (
            <MaterialIcons 
              name="nfc" 
              size={20} 
              color={canProcess ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
            />
          )}
          <Text style={[
            styles.actionButtonText,
            { 
              color: canProcess ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
              marginLeft: spacing.sm,
            },
          ]}>
            {isProcessing ? 'Processing...' : 'Start Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        
        <View style={styles.content}>
          {renderDeviceStatus()}
          {renderInstructions()}
        </View>
        
        {renderActionButtons()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.headlineSmall,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  statusContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statusMessage: {
    ...typography.titleMedium,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  deviceName: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  paymentAmount: {
    ...typography.headlineSmall,
    fontWeight: '700',
    textAlign: 'center',
  },
  instructionsContainer: {
    padding: spacing.md,
  },
  instructionsTitle: {
    ...typography.titleMedium,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  instructionsList: {
    // List styling
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  instructionText: {
    ...typography.bodyMedium,
    marginLeft: spacing.md,
    flex: 1,
  },
  processingTitle: {
    ...typography.titleLarge,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  processingText: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs / 2,
  },
  cancelButton: {
    borderWidth: 1,
  },
  processButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
});