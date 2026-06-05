import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { SimpleChart } from './SimpleChart';
import { ChartDataPoint } from '@/types/dashboard.types';
import { reportsApiService } from '@/services/api/ReportsApiService';
import { RevenueTrend, HourlyRevenue, TopItem, PaymentBreak } from '@/types/reports-api.types';
import { UnifiedOrder } from '@/types/unified-order.types';
import { useSyncContext } from '@/context/sync/SyncContext';

interface ChartsSectionProps {
  restaurantId: string;
  loading?: boolean;
  offlineOrders?: UnifiedOrder[];
}

type Period = 'today' | 'week' | 'month';

const fmt = (d: Date) => d.toISOString().split('T')[0];
const today = () => fmt(new Date());
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };

function formatHourLabel(raw: string): string {
  const h = parseInt(raw, 10);
  if (isNaN(h)) return raw;
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function buildOfflineData(orders: UnifiedOrder[], period: Period) {
  const paid = orders.filter((o) => o.status === 'paid');
  const grouped: Record<string, number> = {};
  const hours: Record<number, number> = {};
  const items: Record<string, { qty: number; rev: number }> = {};
  for (const o of paid) {
    const d = new Date(o.createdAt);
    const key = period === 'today' ? d.getHours().toString() : fmt(d);
    grouped[key] = (grouped[key] ?? 0) + o.totalAmount;
    hours[d.getHours()] = (hours[d.getHours()] ?? 0) + o.totalAmount;
    for (const i of o.items) {
      if (!items[i.name]) items[i.name] = { qty: 0, rev: 0 };
      items[i.name].qty += i.quantity;
      items[i.name].rev += i.itemTotal;
    }
  }
  const trends: RevenueTrend[] = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue, orders: 0 }));
  const hourly: HourlyRevenue[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h, orders: 0, revenue: hours[h] ?? 0,
  }));
  const topItems: TopItem[] = Object.entries(items)
    .sort(([, a], [, b]) => b.qty - a.qty)
    .slice(0, 5)
    .map(([n, d]) => ({ itemId: n, itemName: n, categoryName: '', quantitySold: d.qty, totalRevenue: d.rev }));
  return { trends, hourly, topItems };
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  loading = false,
  offlineOrders = [],
}) => {
  const { theme } = useTheme();
  const { isPhone, isSmallTablet, cardPadding, captionSize } = useResponsive();
  const { syncStatus } = useSyncContext();
  const isOnline = syncStatus === 'syncing' || syncStatus === 'idle';
  const chartHeight = isPhone ? 160 : isSmallTablet ? 200 : 240;

  const [period, setPeriod] = useState<Period>('today');
  const [chartLoading, setChartLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [trends, setTrends] = useState<RevenueTrend[]>([]);
  const [hourly, setHourly] = useState<HourlyRevenue[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [payments, setPayments] = useState<PaymentBreak[]>([]);

  // Use a ref so loadData doesn't re-create on every orders change (avoids infinite loop)
  const offlineOrdersRef = useRef(offlineOrders);
  useEffect(() => { offlineOrdersRef.current = offlineOrders; }, [offlineOrders]);

  const loadData = useCallback(async () => {
    setChartLoading(true);
    setIsOffline(false);
    const start = period === 'today' ? today() : period === 'week' ? daysAgo(7) : daysAgo(30);

    // Skip API calls entirely when offline — go straight to local data
    if (!isOnline) {
      setIsOffline(true);
      const { trends: t, hourly: h, topItems: i } = buildOfflineData(offlineOrdersRef.current, period);
      setTrends(t); setHourly(h); setTopItems(i); setPayments([]);
      setChartLoading(false);
      return;
    }

    try {
      if (period === 'today') {
        const [hr, it, pay] = await Promise.all([
          reportsApiService.getRevenueHourly(today()),
          reportsApiService.getTopSellingItems(start, today(), 5),
          reportsApiService.getPaymentBreakdown(start, today()),
        ]);
        const tr = hr.map((r) => ({ date: `${r.hour}h`, revenue: r.revenue, orders: r.orders }));
        setTrends(tr); setHourly(hr); setTopItems(it); setPayments(pay);
      } else {
        const [tr, hr, it, pay] = await Promise.all([
          reportsApiService.getRevenueTrends(start, today(), 'day'),
          reportsApiService.getRevenueHourly(today()),
          reportsApiService.getTopSellingItems(start, today(), 5),
          reportsApiService.getPaymentBreakdown(start, today()),
        ]);
        setTrends(tr); setHourly(hr); setTopItems(it); setPayments(pay);
      }
      setIsOffline(false);
    } catch {
      if (!isOnline) {
        setIsOffline(true);
        const { trends: t, hourly: h, topItems: i } = buildOfflineData(offlineOrdersRef.current, period);
        setTrends(t); setHourly(h); setTopItems(i); setPayments([]);
      } else {
        setIsOffline(false);
        setTrends([]); setHourly([]); setTopItems([]); setPayments([]);
      }
    } finally {
      setChartLoading(false);
    }
  }, [period, isOnline]);

  useEffect(() => { loadData(); }, [loadData]);

  // Re-fetch chart data when sync engine completes a sync cycle
  const prevSyncStatus = useRef(syncStatus);
  useEffect(() => {
    if (prevSyncStatus.current === 'syncing' && syncStatus === 'idle') {
      loadData();
    }
    prevSyncStatus.current = syncStatus;
  }, [syncStatus, loadData]);

  const trendData = useMemo((): ChartDataPoint[] =>
    trends.map((t) => ({ date: t.date, value: t.revenue, label: period === 'today' ? formatHourLabel(t.date.replace('h', '')) : t.date.slice(5) })),
  [trends, period]);

  const topData = useMemo((): ChartDataPoint[] =>
    topItems.map((i) => ({ date: i.itemName, value: i.quantitySold, label: i.itemName.slice(0, 8) })),
  [topItems]);

  const payData = useMemo((): ChartDataPoint[] =>
    payments.map((p) => ({ date: p.method, value: p.totalAmount, label: p.method })),
  [payments]);

  const maxHourly = useMemo(() => Math.max(...hourly.map((h) => h.revenue), 1), [hourly]);

  const styles = StyleSheet.create({
    container: { paddingHorizontal: cardPadding, marginBottom: theme.spacing.lg },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
    title: { ...theme.typography.h4, color: theme.colors.onSurface },
    badge: { backgroundColor: theme.colors.warning, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.sm },
    badgeText: { fontSize: captionSize, color: theme.colors.onSurface, fontWeight: '600' },
    pills: { flexDirection: 'row', backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.md, padding: 3, marginBottom: theme.spacing.md },
    pill: { flex: 1, paddingVertical: 6, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
    pillActive: { backgroundColor: theme.colors.tertiary },
    pillText: { fontSize: captionSize + 1, color: theme.colors.onSurfaceSecondary, fontWeight: '500' },
    pillTextActive: { color: '#FFFFFF' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    cell: { width: isPhone ? '100%' : '49%' },
    hourlyCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, ...theme.shadows.sm, marginBottom: theme.spacing.sm },
    hourlyTitle: { fontSize: captionSize + 1, color: theme.colors.onSurface, fontWeight: '600', marginBottom: theme.spacing.sm, textAlign: 'center' },
    barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: isPhone ? 80 : 100 },
    bar: { flex: 1, marginHorizontal: 1, borderRadius: 2, minHeight: 2 },
    skeleton: { height: chartHeight, backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.md, opacity: 0.5, marginBottom: theme.spacing.sm },
  });

  if (loading || chartLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { marginBottom: theme.spacing.md }]}>Analytics Overview</Text>
        <View style={styles.grid}>
          <View style={[styles.cell, styles.skeleton]} />
          <View style={[styles.cell, styles.skeleton]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Analytics Overview</Text>
        {isOffline && <View style={styles.badge}><Text style={styles.badgeText}>Offline data</Text></View>}
      </View>

      <View style={styles.pills}>
        {(['today', 'week', 'month'] as Period[]).map((p) => (
          <TouchableOpacity key={p} style={[styles.pill, period === p && styles.pillActive]} onPress={() => setPeriod(p)}>
            <Text style={[styles.pillText, period === p && styles.pillTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.grid}>
        <View style={styles.cell}>
          <SimpleChart
            data={trendData}
            title={period === 'today' ? 'Hourly Revenue' : 'Revenue Trend'}
            color={theme.colors.primary}
            height={chartHeight}
            yAxisLabel="Revenue ($)"
          />
        </View>

        {period === 'today' && (
          <View style={styles.cell}>
            <SimpleChart
              data={hourly.map((h) => ({ date: String(h.hour), value: h.revenue, label: formatHourLabel(String(h.hour)) }))}
              title="Hourly Performance"
              color={theme.colors.secondary}
              height={chartHeight}
              yAxisLabel="Revenue ($)"
            />
          </View>
        )}

        <View style={styles.cell}>
          <SimpleChart
            data={topData}
            title="Top Items (qty)"
            color={theme.colors.tertiary}
            height={chartHeight}
            yAxisLabel="Qty"
          />
        </View>

        {payData.length > 0 && (
          <View style={styles.cell}>
            <SimpleChart data={payData} title="Payment Methods" color={theme.colors.info} height={chartHeight} />
          </View>
        )}
      </View>
    </View>
  );
};
