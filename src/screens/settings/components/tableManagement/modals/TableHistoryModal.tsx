/**
 * Table History Modal
 * Full event log display for table activities
 * Phase 2 - Complete Modal System
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { MOCK_TABLES } from '@/data/tables';

interface TableHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  tableId: string;
}

interface HistoryEvent {
  id: string;
  timestamp: string;
  eventType: 'status_change' | 'cleaning' | 'reservation' | 'order' | 'maintenance';
  description: string;
  duration?: string;
  staffMember?: string;
  details?: string;
}

export const TableHistoryModal: React.FC<TableHistoryModalProps> = ({
  visible,
  onClose,
  tableId,
}) => {
  const { theme } = useTheme();

  // Find the table
  const table = useMemo(
    () => MOCK_TABLES.find((t) => t.id === tableId),
    [tableId]
  );

  // Mock history events (in production, this would come from API)
  const historyEvents: HistoryEvent[] = useMemo(() => [
    {
      id: 'e1',
      timestamp: 'Today at 2:15 PM',
      eventType: 'cleaning',
      description: 'Table cleaned',
      staffMember: 'John Doe',
      details: 'Regular cleaning after customer departure',
    },
    {
      id: 'e2',
      timestamp: 'Today at 1:45 PM',
      eventType: 'status_change',
      description: 'Status changed to Available',
      duration: '85 minutes',
      staffMember: 'Jane Smith',
      details: 'Order completed and customer departed',
    },
    {
      id: 'e3',
      timestamp: 'Today at 12:20 PM',
      eventType: 'order',
      description: 'Order #1234 completed',
      duration: '85 minutes',
      details: 'Total: $125.50 - Party of 4',
    },
    {
      id: 'e4',
      timestamp: 'Today at 12:20 PM',
      eventType: 'status_change',
      description: 'Status changed to Occupied',
      staffMember: 'Jane Smith',
      details: 'Customer seated - Party of 4',
    },
    {
      id: 'e5',
      timestamp: 'Today at 11:30 AM',
      eventType: 'reservation',
      description: 'Reservation confirmed',
      staffMember: 'Sarah Johnson',
      details: 'Reserved for Smith party - 4 guests at 12:15 PM',
    },
    {
      id: 'e6',
      timestamp: 'Today at 10:00 AM',
      eventType: 'cleaning',
      description: 'Opening preparation',
      staffMember: 'John Doe',
      details: 'Table setup and cleaning for opening',
    },
    {
      id: 'e7',
      timestamp: 'Yesterday at 9:45 PM',
      eventType: 'status_change',
      description: 'Status changed to Available',
      staffMember: 'Mike Wilson',
      details: 'Last customer of the day departed',
    },
    {
      id: 'e8',
      timestamp: 'Yesterday at 7:30 PM',
      eventType: 'order',
      description: 'Order #1189 completed',
      duration: '135 minutes',
      details: 'Total: $245.00 - Party of 6',
    },
  ], []);

  // Get icon and color for event type
  const getEventIcon = (eventType: HistoryEvent['eventType']): string => {
    switch (eventType) {
      case 'status_change':
        return 'circle-edit-outline';
      case 'cleaning':
        return 'broom';
      case 'reservation':
        return 'calendar-clock';
      case 'order':
        return 'receipt';
      case 'maintenance':
        return 'tools';
      default:
        return 'information-outline';
    }
  };

  const getEventColor = (eventType: HistoryEvent['eventType']): string => {
    switch (eventType) {
      case 'status_change':
        return theme.colors.primary;
      case 'cleaning':
        return theme.colors.info;
      case 'reservation':
        return theme.colors.warning;
      case 'order':
        return theme.colors.success;
      case 'maintenance':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  if (!table) return null;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 650,
      maxHeight: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.xl as number,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      backgroundColor: theme.colors.primary,
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
      color: theme.colors.onPrimary,
    },
    headerSubtitle: {
      ...typography.bodySmall,
      color: theme.colors.onPrimary,
      opacity: 0.9,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      padding: spacing.lg,
    },
    summarySection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      ...typography.titleMedium,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    summaryLabel: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
    },
    timelineContainer: {
      paddingLeft: spacing.md,
    },
    eventItem: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      position: 'relative',
    },
    eventIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
      zIndex: 2,
    },
    timeline: {
      position: 'absolute',
      left: 17,
      top: 36,
      bottom: -spacing.lg,
      width: 2,
      backgroundColor: theme.colors.outline,
    },
    eventContent: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md as number,
      padding: spacing.md,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    eventDescription: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    eventTimestamp: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    eventDetails: {
      ...typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacing.xs,
      lineHeight: 18,
    },
    eventMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    eventMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    eventMetaText: {
      ...typography.labelSmall,
      color: theme.colors.onSurfaceVariant,
    },
    footer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyStateText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: spacing.md,
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
                name="history"
                size={24}
                color={theme.colors.onPrimary}
                accessibilityLabel="History"
              />
              <View>
                <Text style={styles.headerTitle}>Table History</Text>
                <Text style={styles.headerSubtitle}>
                  {table.number} - {table.area}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon
                name="close"
                size={24}
                color={theme.colors.onPrimary}
                accessibilityLabel="Close"
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary Statistics */}
            <View style={styles.summarySection}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>24</Text>
                <Text style={styles.summaryLabel}>Total Events</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>8</Text>
                <Text style={styles.summaryLabel}>Orders Today</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>95%</Text>
                <Text style={styles.summaryLabel}>Occupancy Rate</Text>
              </View>
            </View>

            {/* Timeline */}
            {historyEvents.length > 0 ? (
              <View style={styles.timelineContainer}>
                {historyEvents.map((event, index) => (
                  <View key={event.id} style={styles.eventItem}>
                    {/* Timeline line */}
                    {index < historyEvents.length - 1 && <View style={styles.timeline} />}

                    {/* Event Icon */}
                    <View
                      style={[
                        styles.eventIconContainer,
                        { backgroundColor: getEventColor(event.eventType) },
                      ]}
                    >
                      <Icon
                        name={getEventIcon(event.eventType)}
                        size={20}
                        color={theme.colors.white}
                        accessibilityLabel={event.eventType}
                      />
                    </View>

                    {/* Event Content */}
                    <View style={styles.eventContent}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventDescription}>{event.description}</Text>
                        <Text style={styles.eventTimestamp}>{event.timestamp}</Text>
                      </View>

                      {event.details && (
                        <Text style={styles.eventDetails}>{event.details}</Text>
                      )}

                      <View style={styles.eventMeta}>
                        {event.staffMember && (
                          <View style={styles.eventMetaItem}>
                            <Icon
                              name="account"
                              size={14}
                              color={theme.colors.onSurfaceVariant}
                              accessibilityLabel="Staff"
                            />
                            <Text style={styles.eventMetaText}>{event.staffMember}</Text>
                          </View>
                        )}
                        {event.duration && (
                          <View style={styles.eventMetaItem}>
                            <Icon
                              name="clock-outline"
                              size={14}
                              color={theme.colors.onSurfaceVariant}
                              accessibilityLabel="Duration"
                            />
                            <Text style={styles.eventMetaText}>{event.duration}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon
                  name="history"
                  size={64}
                  color={theme.colors.onSurfaceVariant}
                  accessibilityLabel="No history"
                />
                <Text style={styles.emptyStateText}>
                  No history available for this table yet.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <AppleButton
              title="Close"
              variant="secondary"
              size="medium"
              icon={
                <Icon
                  name="close"
                  size={18}
                  color={theme.colors.onSurface}
                  accessibilityLabel="Close"
                />
              }
              iconPosition="left"
              onPress={onClose}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
