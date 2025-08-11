/**
 * SplitPaymentModal
 * Professional split payment interface for multiple payment methods
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { formatCurrency } from '@/utils/currency';

interface SplitPaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onPayment: (splitPayments: any[]) => void;
  onCancel: () => void;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  visible,
  totalAmount,
  onPayment,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [splitItems, setSplitItems] = useState<any[]>([]);

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
        <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
        Split Payment
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );

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
          <View style={styles.comingSoon}>
            <MaterialIcons name="construction" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.comingSoonText, { color: theme.colors.onSurfaceVariant }]}>
              Split Payment Coming Soon
            </Text>
            <Text style={[styles.comingSoonSubtext, { color: theme.colors.onSurfaceVariant }]}>
              This feature will allow splitting payments across multiple methods
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onCancel}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  comingSoonText: {
    ...typography.headlineSmall,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    ...typography.bodyMedium,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
});