/**
 * ActivityLogsSheet - Bottom sheet showing timeline of order events.
 * Displays color-coded activity events with time filters.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { activityLogService, ActivityEvent, ActivityEventType } from '@/services/storage/ActivityLogService';

interface ActivityLogsSheetProps {
  visible: boolean;
  onClose: () => void;
}

type FilterMode = 'today' | '1h' | 'week';

const EVENT_COLORS: Record<ActivityEventType, string> = {
  order_created:    '#3498db',
  sent_to_kitchen:  '#9b59b6',
  ready:            '#27ae60',
  served:           '#e67e22',
  paid:             '#27ae60',
  cancelled:        '#e74c3c',
  items_transferred:'#3498db',
  discount_applied: '#f39c12',
};

const EVENT_ICONS: Record<ActivityEventType, string> = {
  order_created:    'receipt',
  sent_to_kitchen:  'chef-hat',
  ready:            'check-circle',
  served:           'silverware',
  paid:             'cash-check',
  cancelled:        'close-circle',
  items_transferred:'transfer',
  discount_applied: 'tag',
};

const EVENT_LABELS: Record<ActivityEventType, string> = {
  order_created:    'Order Created',
  sent_to_kitchen:  'Sent to Kitchen',
  ready:            'Ready',
  served:           'Served',
  paid:             'Paid ✓',
  cancelled:        'Cancelled',
  items_transferred:'Items Transferred',
  discount_applied: 'Discount Applied',
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getSinceDateForFilter = (filter: FilterMode): Date => {
  const now = new Date();
  if (filter === '1h') return new Date(now.getTime() - 60 * 60 * 1000);
  if (filter === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  // 'today'
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
};

const ActivityLogsSheet: React.FC<ActivityLogsSheetProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<FilterMode>('today');
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = useCallback(async (f: FilterMode) => {
    setIsLoading(true);
    try {
      const since = getSinceDateForFilter(f);
      const data = await activityLogService.getEvents(since, 150);
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) loadEvents(filter);
  }, [visible, filter, loadEvents]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: screenHeight * 0.78,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.outline,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      flex: 1,
    },
    closeBtn: { padding: theme.spacing.xs },
    filterRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    filterChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    filterChipText: { ...theme.typography.caption, color: theme.colors.onSurface },
    filterChipTextActive: { color: theme.colors.primary, fontWeight: '600' },
    eventRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    eventDotCol: { alignItems: 'center', paddingTop: 2 },
    eventContent: { flex: 1 },
    eventType: { ...theme.typography.body2, fontWeight: '600' },
    eventDetail: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, marginTop: 1 },
    eventTime: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, minWidth: 44, textAlign: 'right' },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      padding: theme.spacing.xl,
    },
  });

  const renderEvent = useCallback(({ item }: { item: ActivityEvent }) => {
    const color = EVENT_COLORS[item.eventType] ?? theme.colors.primary;
    const icon = EVENT_ICONS[item.eventType] ?? 'circle';
    const label = EVENT_LABELS[item.eventType] ?? item.eventType;

    return (
      <View style={styles.eventRow}>
        <View style={styles.eventDotCol}>
          <MaterialCommunityIcons name={icon as any} size={18} color={color} />
        </View>
        <View style={styles.eventContent}>
          <Text style={[styles.eventType, { color }]}>{label}</Text>
          <Text style={styles.eventDetail}>
            {item.tableName ? `${item.tableName} · ` : ''}{item.orderNumber ?? ''}
          </Text>
          {item.description ? (
            <Text style={styles.eventDetail} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>
        <Text style={styles.eventTime}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  }, [styles, theme]);

  const FILTERS: { key: FilterMode; label: string; testID: string }[] = [
    { key: 'today', label: 'Today', testID: 'filter-today' },
    { key: '1h',    label: 'Last 1h', testID: 'filter-1h' },
    { key: 'week',  label: 'This Week', testID: 'filter-week' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Activity Log</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                onPress={() => setFilter(f.key)}
                testID={f.testID}
              >
                <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <ActivityIndicator style={{ margin: 32 }} color={theme.colors.primary} />
          ) : (
            <FlatList
              data={events}
              keyExtractor={e => e.id}
              renderItem={renderEvent}
              testID="activity-log-list"
              ListEmptyComponent={
                <Text style={styles.emptyText}>No activity found for this period</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ActivityLogsSheet;
