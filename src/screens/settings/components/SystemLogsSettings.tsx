/**
 * SystemLogsSettings - Live activity log viewer.
 * Reads real events from ActivityLogService (SQLite activity_logs table).
 * Includes printer events + Export via native Share sheet for remote debugging.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  activityLogService,
  ActivityEvent,
  ActivityEventType,
} from '@/services/storage/ActivityLogService';

interface SystemLogsSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

type TimeFilter = 'today' | '1h' | 'week';
type TypeFilter = 'ALL' | 'Orders' | 'Kitchen' | 'Payment' | 'Printer';

const EVENT_COLORS: Record<ActivityEventType, string> = {
  order_created:      '#3498db',
  sent_to_kitchen:    '#9b59b6',
  ready:              '#27ae60',
  served:             '#e67e22',
  paid:               '#27ae60',
  cancelled:          '#e74c3c',
  items_transferred:  '#3498db',
  discount_applied:   '#f39c12',
  item_removed:       '#e74c3c',
  item_modified:      '#f39c12',
  print_receipt_ok:   '#27ae60',
  print_receipt_fail: '#e74c3c',
  print_kot_ok:       '#27ae60',
  print_kot_fail:     '#e74c3c',
  printer_test_ok:    '#27ae60',
  printer_test_fail:  '#e74c3c',
};

const EVENT_ICONS: Record<ActivityEventType, string> = {
  order_created:      'receipt',
  sent_to_kitchen:    'chef-hat',
  ready:              'check-circle',
  served:             'silverware',
  paid:               'cash-check',
  cancelled:          'close-circle',
  items_transferred:  'transfer',
  discount_applied:   'tag',
  item_removed:       'minus-circle',
  item_modified:      'pencil',
  print_receipt_ok:   'printer-check',
  print_receipt_fail: 'printer-alert',
  print_kot_ok:       'printer-check',
  print_kot_fail:     'printer-alert',
  printer_test_ok:    'printer-check',
  printer_test_fail:  'printer-off',
};

const EVENT_LABELS: Record<ActivityEventType, string> = {
  order_created:      'Order Created',
  sent_to_kitchen:    'Sent to Kitchen',
  ready:              'Ready',
  served:             'Served',
  paid:               'Paid',
  cancelled:          'Cancelled',
  items_transferred:  'Items Transferred',
  discount_applied:   'Discount Applied',
  item_removed:       'Item Removed',
  item_modified:      'Item Modified',
  print_receipt_ok:   'Receipt Printed',
  print_receipt_fail: 'Receipt Print Failed',
  print_kot_ok:       'KOT Printed',
  print_kot_fail:     'KOT Print Failed',
  printer_test_ok:    'Printer Test OK',
  printer_test_fail:  'Printer Test Failed',
};

const TYPE_MAP: Record<ActivityEventType, TypeFilter> = {
  order_created:      'Orders',
  cancelled:          'Orders',
  items_transferred:  'Orders',
  discount_applied:   'Orders',
  item_removed:       'Orders',
  item_modified:      'Orders',
  sent_to_kitchen:    'Kitchen',
  ready:              'Kitchen',
  served:             'Kitchen',
  paid:               'Payment',
  print_receipt_ok:   'Printer',
  print_receipt_fail: 'Printer',
  print_kot_ok:       'Printer',
  print_kot_fail:     'Printer',
  printer_test_ok:    'Printer',
  printer_test_fail:  'Printer',
};

const getLevel = (type: ActivityEventType): 'ERROR' | 'WARNING' | 'INFO' => {
  if (type === 'cancelled' || type.endsWith('_fail')) return 'ERROR';
  if (type === 'discount_applied') return 'WARNING';
  return 'INFO';
};

const getSince = (filter: TimeFilter): Date => {
  const now = new Date();
  if (filter === '1h') return new Date(now.getTime() - 60 * 60 * 1000);
  if (filter === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

const TIME_LABELS: Record<TimeFilter, string> = { today: 'Today', '1h': 'Last 1h', week: 'This Week' };

const buildExportText = (events: ActivityEvent[], timeFilter: TimeFilter, typeFilter: TypeFilter): string => {
  const now = new Date().toLocaleString();
  const lines: string[] = [
    '=== POS ACTIVITY LOG ===',
    `Exported: ${now}`,
    `Period: ${TIME_LABELS[timeFilter]} | Category: ${typeFilter}`,
    `Total: ${events.length} event(s)`,
    '─'.repeat(48),
  ];
  for (const e of events) {
    const level = getLevel(e.eventType);
    const label = EVENT_LABELS[e.eventType] ?? e.eventType;
    const time = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ctx = [e.tableName, e.orderNumber].filter(Boolean).join(' · ');
    lines.push(`[${time}] [${level}] ${label}${ctx ? `  |  ${ctx}` : ''}`);
    if (e.description) lines.push(`  ${e.description}`);
    if (e.metadata) {
      const m = e.metadata as Record<string, unknown>;
      if (m.ip)    lines.push(`  IP: ${m.ip}:${m.port ?? 9100}`);
      if (m.station && m.station !== 'default') lines.push(`  Station: ${m.station}`);
      if (m.error) lines.push(`  Error: ${m.error}`);
    }
    lines.push('');
  }
  lines.push('─'.repeat(48));
  lines.push('End of log. Send this to your support team.');
  return lines.join('\n');
};

export default function SystemLogsSettings({ onChangesDetected: _ }: SystemLogsSettingsProps) {
  const { theme } = useTheme();

  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [search, setSearch] = useState('');

  const loadEvents = useCallback(async (tf: TimeFilter) => {
    setIsLoading(true);
    try {
      const data = await activityLogService.getEvents(getSince(tf), 200);
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(timeFilter); }, [timeFilter, loadEvents]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(e => {
      const matchType = typeFilter === 'ALL' || TYPE_MAP[e.eventType] === typeFilter;
      const matchSearch = !q || (
        e.description.toLowerCase().includes(q) ||
        (e.orderNumber ?? '').toLowerCase().includes(q) ||
        (e.tableName ?? '').toLowerCase().includes(q) ||
        EVENT_LABELS[e.eventType].toLowerCase().includes(q)
      );
      return matchType && matchSearch;
    });
  }, [events, typeFilter, search]);

  const stats = useMemo(() => ({
    total:    filtered.length,
    errors:   filtered.filter(e => getLevel(e.eventType) === 'ERROR').length,
    warnings: filtered.filter(e => getLevel(e.eventType) === 'WARNING').length,
    info:     filtered.filter(e => getLevel(e.eventType) === 'INFO').length,
  }), [filtered]);

  const handleExport = useCallback(() => {
    const text = buildExportText(filtered, timeFilter, typeFilter);
    Share.share({ message: text, title: 'POS Activity Log' });
  }, [filtered, timeFilter, typeFilter]);

  const styles = StyleSheet.create({
    container: { flex: 1 },
    sectionTitle: { ...theme.typography.title3, color: theme.colors.onSurfaceSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xs },
    card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
    searchInput: { flex: 1, ...theme.typography.body1, color: theme.colors.onSurface, paddingVertical: theme.spacing.xs },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm },
    chip: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.outline },
    chipActive: { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary },
    chipText: { ...theme.typography.body2, color: theme.colors.onSurface },
    chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.md },
    statCard: { flex: 1, backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.sm, padding: theme.spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.outline },
    statNum: { ...theme.typography.h3, color: theme.colors.onSurface },
    statLabel: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, marginTop: 2 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
    listHeaderText: { ...theme.typography.body1, color: theme.colors.onSurface, fontWeight: '600' },
    headerBtns: { flexDirection: 'row', gap: theme.spacing.xs },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.primaryContainer },
    actionBtnText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' },
    eventRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, gap: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
    eventContent: { flex: 1 },
    eventLabel: { ...theme.typography.body2, fontWeight: '600' },
    eventDetail: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary, marginTop: 1 },
    eventMeta: { alignItems: 'flex-end', gap: 2 },
    eventTime: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary },
    eventDate: { ...theme.typography.caption, color: theme.colors.onSurfaceSecondary },
    levelBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
    levelText: { fontSize: 9, fontWeight: '700', color: '#fff' },
    empty: { ...theme.typography.body1, color: theme.colors.onSurfaceSecondary, textAlign: 'center', padding: theme.spacing.xl },
  });

  const renderEvent = useCallback(({ item }: { item: ActivityEvent }) => {
    const color = EVENT_COLORS[item.eventType] ?? theme.colors.primary;
    const icon  = EVENT_ICONS[item.eventType]  ?? 'circle-outline';
    const label = EVENT_LABELS[item.eventType] ?? item.eventType;
    const level = getLevel(item.eventType);
    const levelColor = level === 'ERROR' ? theme.colors.error : level === 'WARNING' ? '#f39c12' : theme.colors.primary;
    const meta = item.metadata as Record<string, unknown> | undefined;

    return (
      <View style={styles.eventRow}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} style={{ marginTop: 1 }} />
        <View style={styles.eventContent}>
          <Text style={[styles.eventLabel, { color }]}>{label}</Text>
          {(item.tableName || item.orderNumber) ? (
            <Text style={styles.eventDetail}>
              {[item.tableName, item.orderNumber].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          {item.description ? (
            <Text style={styles.eventDetail} numberOfLines={2}>{item.description}</Text>
          ) : null}
          {/* Show IP for printer events so it's visible without exporting */}
          {meta?.ip ? (
            <Text style={styles.eventDetail}>
              {`IP: ${meta.ip}:${meta.port ?? 9100}${meta.station && meta.station !== 'default' ? ` · ${meta.station}` : ''}`}
            </Text>
          ) : null}
        </View>
        <View style={styles.eventMeta}>
          <Text style={styles.eventTime}>{formatTime(item.timestamp)}</Text>
          {timeFilter === 'week' && (
            <Text style={styles.eventDate}>{formatDate(item.timestamp)}</Text>
          )}
          <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>
      </View>
    );
  }, [styles, theme, timeFilter]);

  const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: '1h',    label: 'Last 1h' },
    { key: 'week',  label: 'This Week' },
  ];

  const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
    { key: 'ALL',     label: 'All' },
    { key: 'Orders',  label: 'Orders' },
    { key: 'Kitchen', label: 'Kitchen' },
    { key: 'Payment', label: 'Payment' },
    { key: 'Printer', label: 'Printer' },
  ];

  return (
    <FlatList
      data={filtered}
      keyExtractor={e => e.id}
      renderItem={renderEvent}
      showsVerticalScrollIndicator={false}
      testID="system-logs-list"
      ListEmptyComponent={
        isLoading
          ? <ActivityIndicator style={{ margin: 32 }} color={theme.colors.primary} />
          : <Text style={styles.empty}>No activity found for this period</Text>
      }
      ListHeaderComponent={
        <>
          {/* Search */}
          <Text style={styles.sectionTitle}>Search</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.onSurfaceSecondary} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search logs, table, order, IP address..."
                placeholderTextColor={theme.colors.onSurfaceSecondary}
                testID="logs-search-input"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.onSurfaceSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Time filter */}
          <Text style={styles.sectionTitle}>Time Range</Text>
          <View style={[styles.card, { paddingVertical: theme.spacing.sm }]}>
            <View style={styles.chipRow}>
              {TIME_FILTERS.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.chip, timeFilter === f.key && styles.chipActive]}
                  onPress={() => setTimeFilter(f.key)}
                  testID={`logs-filter-time-${f.key}`}
                >
                  <Text style={[styles.chipText, timeFilter === f.key && styles.chipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Type filter */}
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={[styles.card, { paddingVertical: theme.spacing.sm }]}>
            <View style={styles.chipRow}>
              {TYPE_FILTERS.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.chip, typeFilter === f.key && styles.chipActive]}
                  onPress={() => setTypeFilter(f.key)}
                  testID={`logs-filter-type-${f.key}`}
                >
                  <Text style={[styles.chipText, typeFilter === f.key && styles.chipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats */}
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.card}>
            <View style={styles.statsRow}>
              {[
                { num: stats.total,    label: 'Total',    color: theme.colors.onSurface },
                { num: stats.errors,   label: 'Errors',   color: theme.colors.error },
                { num: stats.warnings, label: 'Warnings', color: '#f39c12' },
                { num: stats.info,     label: 'Info',     color: theme.colors.primary },
              ].map(s => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* List header */}
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              Activity Events ({filtered.length})
            </Text>
            <View style={styles.headerBtns}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => loadEvents(timeFilter)}
                disabled={isLoading}
                testID="logs-refresh-btn"
              >
                {isLoading
                  ? <ActivityIndicator size="small" color={theme.colors.primary} />
                  : <MaterialCommunityIcons name="refresh" size={14} color={theme.colors.primary} />
                }
                <Text style={styles.actionBtnText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleExport}
                disabled={filtered.length === 0}
                testID="logs-export-btn"
              >
                <MaterialCommunityIcons name="export-variant" size={14} color={theme.colors.primary} />
                <Text style={styles.actionBtnText}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      }
    />
  );
}
