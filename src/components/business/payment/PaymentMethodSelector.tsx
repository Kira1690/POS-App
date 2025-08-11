/**
 * PaymentMethodSelector
 * Professional payment method selection component
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useVP3350Device } from '@/context/payment';
import { ProfessionalPaymentMethod, VP3350DeviceStatus } from '@/types/payment.types';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';

interface PaymentMethodSelectorProps {
  selectedMethod: ProfessionalPaymentMethod | null;
  onMethodSelect: (method: ProfessionalPaymentMethod) => void;
  disabled?: boolean;
  total: number;
}

interface PaymentMethodOption {
  method: ProfessionalPaymentMethod;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  enabled: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  disabled = false,
  total,
}) => {
  const { theme } = useTheme();
  const { vp3350Status } = useVP3350Device();

  // Define payment method options
  const paymentMethods: PaymentMethodOption[] = [
    {
      method: ProfessionalPaymentMethod.CARD,
      title: 'Card Payment',
      subtitle: 'Credit/Debit Card',
      icon: 'credit-card',
      color: theme.colors.primary,
      enabled: true,
    },
    {
      method: ProfessionalPaymentMethod.CASH,
      title: 'Cash Payment',
      subtitle: 'Cash Transaction',
      icon: 'attach-money',
      color: theme.colors.secondary,
      enabled: true,
    },
    {
      method: ProfessionalPaymentMethod.SPLIT,
      title: 'Split Payment',
      subtitle: 'Multiple Methods',
      icon: 'call-split',
      color: theme.colors.tertiary,
      enabled: true,
    },
    {
      method: ProfessionalPaymentMethod.VP3350,
      title: 'VP3350 Device',
      subtitle: vp3350Status === VP3350DeviceStatus.CONNECTED ? 'Device Ready' : 'Device Not Connected',
      icon: 'nfc',
      color: vp3350Status === VP3350DeviceStatus.CONNECTED ? '#4CAF50' : theme.colors.outline,
      enabled: vp3350Status === VP3350DeviceStatus.CONNECTED,
    },
  ];

  // Render payment method button
  const renderPaymentMethod = (option: PaymentMethodOption) => {
    const isSelected = selectedMethod === option.method;
    const isDisabled = disabled || !option.enabled;
    
    return (
      <TouchableOpacity
        key={option.method}
        style={[
          styles.paymentMethodButton,
          {
            backgroundColor: isSelected 
              ? `${option.color}15` 
              : theme.colors.surface,
            borderColor: isSelected 
              ? option.color 
              : theme.colors.outline,
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
        onPress={() => !isDisabled && onMethodSelect(option.method)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View style={styles.methodContent}>
          <View style={[
            styles.methodIcon, 
            { backgroundColor: isSelected ? option.color : theme.colors.surfaceVariant }
          ]}>
            <MaterialIcons 
              name={option.icon} 
              size={28} 
              color={isSelected ? theme.colors.onPrimary : option.color} 
            />
          </View>
          
          <View style={styles.methodInfo}>
            <Text style={[
              styles.methodTitle, 
              { 
                color: isSelected ? option.color : theme.colors.onSurface,
                fontWeight: isSelected ? '700' : '600',
              }
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.methodSubtitle, 
              { color: theme.colors.onSurfaceVariant }
            ]}>
              {option.subtitle}
            </Text>
          </View>
          
          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: option.color }]}>
              <MaterialIcons name="check" size={16} color={theme.colors.onPrimary} />
            </View>
          )}
        </View>
        
        {/* Show amount for non-split payments */}
        {option.method !== ProfessionalPaymentMethod.SPLIT && (
          <View style={styles.amountContainer}>
            <Text style={[
              styles.amountText, 
              { 
                color: isSelected ? option.color : theme.colors.onSurfaceVariant,
                fontWeight: isSelected ? '700' : '500',
              }
            ]}>
              {formatCurrency(total)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.methodsGrid}>
        {paymentMethods.map(renderPaymentMethod)}
      </View>
      
      {/* Payment method descriptions */}
      <View style={styles.descriptionsContainer}>
        <View style={styles.descriptionRow}>
          <MaterialIcons name="info-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Select your preferred payment method
          </Text>
        </View>
        
        {vp3350Status !== VP3350DeviceStatus.CONNECTED && (
          <View style={styles.descriptionRow}>
            <MaterialIcons name="bluetooth-disabled" size={16} color={theme.colors.error} />
            <Text style={[styles.descriptionText, { color: theme.colors.error }]}>
              VP3350 device not connected. Use Settings to connect device.
            </Text>
          </View>
        )}
        
        <View style={styles.descriptionRow}>
          <MaterialIcons name="security" size={16} color={theme.colors.primary} />
          <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            All payments are secure and encrypted
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs / 2,
  },
  paymentMethodButton: {
    width: '48%',
    margin: spacing.xs / 2,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  methodContent: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  methodInfo: {
    alignItems: 'center',
    minHeight: 40,
  },
  methodTitle: {
    ...typography.titleMedium,
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
  },
  methodSubtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  amountText: {
    ...typography.titleMedium,
  },
  descriptionsContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
    flex: 1,
  },
});