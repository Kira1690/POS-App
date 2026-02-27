import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PaymentState } from '@/services/trx/interfaces/IPaymentProcessor';
import { useTheme } from '@/hooks/useTheme';

interface TRXStatusHeaderProps {
  title?: string;
  posConnected?: boolean;
  transactionStatus?: PaymentState;
  transactionResult?: string;
  isConnecting?: boolean;
  statusText?: string;
  statusColor?: string;
  showThreeDotsMenu?: boolean;
  onMenuPress?: () => void;
  status?: string;
  terminalConnected?: boolean;
  onReconnect?: () => void;
}

export const TRXStatusHeader: React.FC<TRXStatusHeaderProps> = ({
  title,
  posConnected,
  transactionStatus,
  transactionResult,
  isConnecting,
  statusText,
  statusColor,
  showThreeDotsMenu,
  onMenuPress,
}) => {
  const { theme } = useTheme();

  const connectionStatus = {
    text: statusText || (posConnected ? 'POS Connected' : 'POS Disconnected'),
    color: statusColor || (posConnected ? theme.colors.success : theme.colors.error),
  };

  const styles = StyleSheet.create({
    header: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: theme.spacing.lg,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      ...theme.typography.title2,
      fontWeight: '700',
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    menuButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusTextContainer: {
      flex: 1,
    },
    statusText: {
      ...theme.typography.footnote,
      color: theme.colors.onSurfaceSecondary,
    },
    transactionStatus: {
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
    },
    processingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    processingText: {
      color: theme.colors.onSurface,
      marginLeft: theme.spacing.sm,
      ...theme.typography.callout,
    },
    transactionResultText: {
      ...theme.typography.footnote,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {showThreeDotsMenu && onMenuPress && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="more-vert" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: connectionStatus.color }]}>
          {isConnecting && (
            <ActivityIndicator size="small" color={theme.colors.onSurface} />
          )}
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusText, { color: connectionStatus.color }]}>
            {connectionStatus.text}
          </Text>
        </View>
      </View>

      {transactionStatus !== PaymentState.IDLE && (
        <View style={styles.transactionStatus}>
          {transactionStatus === PaymentState.PROCESSING ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator color={theme.colors.onSurface} size="small" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <Text style={[
              styles.transactionResultText,
              { color: transactionStatus === PaymentState.SUCCESS ? theme.colors.success : theme.colors.error },
            ]}>
              {transactionResult}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
