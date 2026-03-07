import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { reportsApiService } from '@/services/api/ReportsApiService';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { paymentStorageService } from '@/services/storage';
import {
  SalesSummary, DailySummary, TopItem, StaffPerf, PaymentBreak,
} from '@/types/reports-api.types';
import { SimpleChart } from '../dashboard/components/SimpleChart';
import { ChartDataPoint } from '@/types/dashboard.types';
import { useSyncContext } from '@/context/sync/SyncContext';

type Period = '1D' | '1W' | '1M' | '3M' | '1Y';

const PERIODS: { key: Period; label: string; days: number }[] = [
  { key: '1D', label: '1D', days: 0 },
  { key: '1W', label: '1W', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '1Y', label: '1Y', days: 365 },
];

const fmt = (d: Date) => d.toISOString().split('T')[0];
const curr = (v: number) => `$${Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

function getRange(period: Period) {
  const today = new Date();
  const start = new Date(today);
  const days = PERIODS.find((p) => p.key === period)?.days ?? 7;
  if (days > 0) start.setDate(today.getDate() - days);
  return { start: fmt(start), end: fmt(today) };
}

function getPreviousRange(period: Period) {
  const days = PERIODS.find((p) => p.key === period)?.days ?? 7;
  const effectiveDays = days === 0 ? 1 : days;
  const end = new Date();
  end.setDate(end.getDate() - effectiveDays - (days === 0 ? 0 : 1));
  const start = new Date(end);
  if (effectiveDays > 1) start.setDate(end.getDate() - effectiveDays + 1);
  return { start: fmt(start), end: fmt(end) };
}

function getDateLabel(period: Period): { main: string; compare: string } {
  const today = new Date();
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  switch (period) {
    case '1D':
      return {
        main: `Today, ${today.toLocaleDateString('en-US', opts)}`,
        compare: 'vs Same Day Previous Week',
      };
    case '1W':
      return { main: 'Last 7 Days', compare: 'vs Previous 7 Days' };
    case '1M':
      return { main: 'Last 30 Days', compare: 'vs Previous 30 Days' };
    case '3M':
      return { main: 'Last 90 Days', compare: 'vs Previous 90 Days' };
    case '1Y':
      return { main: 'Last 365 Days', compare: 'vs Previous 365 Days' };
  }
}


/** Build report data from local SQLite orders when API is unavailable */
async function buildLocalReports(period: Period): Promise<{
  summary: SalesSummary;
  topItems: TopItem[];
  payments: PaymentBreak[];
}> {
  const orders = await unifiedOrderStorageService.getAllOrders();
  const { start } = getRange(period);
  const startDate = new Date(start);
  const paid = orders.filter((o) => {
    if (o.status !== 'paid') return false;
    const d = new Date(o.paidAt || o.createdAt);
    return d >= startDate;
  });

  const byDate: Record<string, { orders: number; revenue: number; tax: number }> = {};
  let totalRevenue = 0;
  let totalTax = 0;
  for (const o of paid) {
    const key = fmt(new Date(o.paidAt || o.createdAt));
    if (!byDate[key]) byDate[key] = { orders: 0, revenue: 0, tax: 0 };
    byDate[key].orders++;
    byDate[key].revenue += o.totalAmount;
    byDate[key].tax += o.taxAmount;
    totalRevenue += o.totalAmount;
    totalTax += o.taxAmount;
  }
  const data: DailySummary[] = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, orders: d.orders, revenue: d.revenue, tax: d.tax, discounts: 0 }));

  const itemMap: Record<string, { qty: number; rev: number; cat: string }> = {};
  for (const o of paid) {
    for (const i of o.items) {
      if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, rev: 0, cat: i.category || '' };
      itemMap[i.name].qty += i.quantity;
      itemMap[i.name].rev += i.itemTotal;
    }
  }
  const topItems: TopItem[] = Object.entries(itemMap)
    .sort(([, a], [, b]) => b.qty - a.qty)
    .slice(0, 10)
    .map(([name, d]) => ({
      itemId: name, itemName: name, categoryName: d.cat,
      quantitySold: d.qty, totalRevenue: d.rev,
    }));

  let payBreak: PaymentBreak[] = [];
  try {
    const stats = await paymentStorageService.getStats(start, fmt(new Date()));
    payBreak = Object.entries(stats.byMethod).map(([method, d]) => ({
      method, count: d.count, totalAmount: d.total,
    }));
  } catch { /* ignore */ }
  if (payBreak.length === 0 && paid.length > 0) {
    payBreak = [{ method: 'Cash', count: paid.length, totalAmount: totalRevenue }];
  }

  return {
    summary: {
      totalOrders: paid.length, totalRevenue, totalTax,
      totalDiscounts: 0, netRevenue: totalRevenue - totalTax, data,
    },
    topItems,
    payments: payBreak,
  };
}

function calcChange(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

// ───────────────────────────────────────────────────

export default function ReportsScreen() {
  const { theme } = useTheme();
  const {
    isPhone, isSmallTablet,
    contentPadding, sectionGap,
    bodySize, captionSize, headingSize,
  } = useResponsive();
  const { syncStatus } = useSyncContext();
  const isOnline = syncStatus === 'syncing' || syncStatus === 'idle';
  const [period, setPeriod] = useState<Period>('1W');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [prevSummary, setPrevSummary] = useState<SalesSummary | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [staffPerf, setStaffPerf] = useState<StaffPerf[]>([]);
  const [payments, setPayments] = useState<PaymentBreak[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setIsOffline(false);
    const { start, end } = getRange(period);
    const prev = getPreviousRange(period);

    // Skip API calls when offline — go straight to local data
    if (!isOnline) {
      setIsOffline(true);
      try {
        const local = await buildLocalReports(period);
        setSummary(local.summary);
        setPrevSummary(null);
        setTopItems(local.topItems);
        setPayments(local.payments);
        setStaffPerf([]);
      } catch (localErr) {
        if (__DEV__) console.warn('[Reports] Local fallback failed:', localErr);
      }
      setLoading(false);
      return;
    }

    try {
      const [sum, prevSum, items, staff, pay] = await Promise.all([
        reportsApiService.getSalesSummary(start, end),
        reportsApiService.getSalesSummary(prev.start, prev.end).catch(() => null),
        reportsApiService.getTopSellingItems(start, end, 10),
        reportsApiService.getStaffPerformance(start, end),
        reportsApiService.getPaymentBreakdown(start, end),
      ]);
      setSummary(sum);
      setPrevSummary(prevSum);
      setTopItems(items);
      setStaffPerf(staff);
      setPayments(pay);
    } catch {
      setIsOffline(true);
      try {
        const local = await buildLocalReports(period);
        setSummary(local.summary);
        setPrevSummary(null);
        setTopItems(local.topItems);
        setPayments(local.payments);
        setStaffPerf([]);
      } catch (localErr) {
        if (__DEV__) console.warn('[Reports] Local fallback failed:', localErr);
      }
    } finally {
      setLoading(false);
    }
  }, [period, isOnline]);

  useEffect(() => { loadData(); }, [loadData]);

  const chartH = isPhone ? 180 : isSmallTablet ? 210 : 260;
  const kpiCols = isPhone ? 2 : 3;
  const trendData: ChartDataPoint[] = (summary?.data ?? []).map((d) => ({
    date: d.date, value: d.revenue, label: d.date.slice(5),
  }));

  const dateLabel = useMemo(() => getDateLabel(period), [period]);

  // Compute KPI % changes
  const kpiChanges = useMemo(() => {
    if (!summary || !prevSummary) return { revenue: null, orders: null, avg: null, net: null, refunds: null, discounts: null };
    const avgCurr = summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0;
    const avgPrev = prevSummary.totalOrders > 0 ? prevSummary.totalRevenue / prevSummary.totalOrders : 0;
    return {
      revenue: calcChange(summary.totalRevenue, prevSummary.totalRevenue),
      orders: calcChange(summary.totalOrders, prevSummary.totalOrders),
      avg: calcChange(avgCurr, avgPrev),
      net: calcChange(summary.netRevenue, prevSummary.netRevenue),
      refunds: null,
      discounts: calcChange(summary.totalDiscounts, prevSummary.totalDiscounts),
    };
  }, [summary, prevSummary]);

  // Payment totals
  const paymentTotal = useMemo(() => payments.reduce((s, p) => s + p.totalAmount, 0), [payments]);

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    // Header
    header: {
      paddingHorizontal: contentPadding + 4,
      paddingTop: isPhone ? 8 : 12,
      paddingBottom: isPhone ? 4 : 6,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: headingSize,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    offlinePill: {
      position: 'absolute',
      right: contentPadding + 4,
      top: isPhone ? 8 : 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.warning,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    offlineText: {
      fontSize: captionSize,
      color: '#000',
      fontWeight: '700',
    },
    // Date label
    dateWrap: {
      alignItems: 'center',
      paddingBottom: isPhone ? 6 : 8,
    },
    dateMain: {
      fontSize: bodySize,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    dateCompare: {
      fontSize: captionSize - 1,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    // Period tabs (underline style)
    periodRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: contentPadding,
      marginBottom: isPhone ? 10 : 14,
      gap: isPhone ? 16 : 24,
    },
    periodTab: {
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    periodTabActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.onSurface,
    },
    periodText: {
      fontSize: isPhone ? 13 : 14,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
    periodTextActive: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    // Content
    content: {
      paddingHorizontal: contentPadding,
      paddingBottom: 32,
    },
    // Section header (ALL CAPS)
    sectionHeader: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
      marginTop: sectionGap,
    },
    // KPI Grid
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    kpiCell: {
      width: `${100 / kpiCols}%` as unknown as number,
      paddingVertical: isPhone ? 8 : 12,
      paddingHorizontal: isPhone ? 6 : 10,
    },
    kpiValue: {
      fontSize: isPhone ? 20 : 26,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    kpiLabel: {
      fontSize: captionSize - 1,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    kpiChange: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    kpiDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.outline,
      marginVertical: isPhone ? 2 : 4,
    },
    // Data row (payment breakdown)
    dataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outline,
    },
    dataLabel: {
      fontSize: bodySize,
      color: theme.colors.onSurface,
    },
    dataValue: {
      fontSize: bodySize,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    dataValueNeg: {
      color: theme.colors.error,
    },
    progressBarBg: {
      height: 4,
      backgroundColor: theme.colors.surfaceContainerHigh,
      borderRadius: 2,
      marginTop: 4,
      marginBottom: 2,
    },
    progressBarFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    // Table
    tableCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    tRow: {
      flexDirection: 'row',
      paddingVertical: isPhone ? 10 : 12,
      paddingHorizontal: isPhone ? 10 : 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outline,
    },
    tHead: {
      backgroundColor: theme.colors.primaryContainer,
    },
    tHeadText: {
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    cell: {
      flex: 1,
      fontSize: isPhone ? 12 : 13,
      color: theme.colors.onSurface,
    },
    cellRight: { textAlign: 'right' },
    // Rank badge
    rankBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    rankText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFF',
    },
    // Empty state
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: bodySize,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
    },
    // Loading skeleton
    skeleton: {
      height: chartH,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      opacity: 0.5,
    },
  });

  const ChangeLabel = ({ value }: { value: number | null }) => {
    if (value === null) return null;
    const isPositive = value >= 0;
    return (
      <Text style={[s.kpiChange, { color: isPositive ? theme.colors.success : theme.colors.error }]}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </Text>
    );
  };

  const TableRow = ({ cells, isHeader, rank }: { cells: string[]; isHeader?: boolean; rank?: number }) => (
    <View style={[s.tRow, isHeader && s.tHead]}>
      {rank !== undefined && !isHeader && (
        <View style={s.rankBadge}><Text style={s.rankText}>{rank}</Text></View>
      )}
      {rank !== undefined && isHeader && <View style={{ width: 30 }} />}
      {cells.map((c, i) => (
        <Text
          key={i}
          style={[s.cell, isHeader && s.tHeadText, i === cells.length - 1 && s.cellRight]}
          numberOfLines={1}
        >
          {c}
        </Text>
      ))}
    </View>
  );

  const EmptyState = ({ icon, msg }: { icon: keyof typeof MaterialIcons.glyphMap; msg: string }) => (
    <View style={s.emptyWrap}>
      <MaterialIcons name={icon} size={40} color={theme.colors.onSurfaceVariant} />
      <Text style={s.emptyText}>{msg}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={s.safe}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Reports & Analytics</Text>
        </View>
        <View style={[s.content, { gap: 12 }]}>
          <View style={s.skeleton} />
          <View style={[s.skeleton, { height: 80 }]} />
        </View>
      </View>
    );
  }

  const avgSale = summary && summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0;

  return (
    <View style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Reports & Analytics</Text>
        {isOffline && (
          <View style={s.offlinePill}>
            <MaterialIcons name="cloud-off" size={12} color="#000" />
            <Text style={s.offlineText}>Offline</Text>
          </View>
        )}
      </View>

      {/* Date label */}
      <View style={s.dateWrap}>
        <Text style={s.dateMain}>{dateLabel.main}</Text>
        <Text style={s.dateCompare}>{dateLabel.compare}</Text>
      </View>

      {/* Period underline tabs */}
      <View style={s.periodRow}>
        {PERIODS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[s.periodTab, period === key && s.periodTabActive]}
            onPress={() => setPeriod(key)}
          >
            <Text style={[s.periodText, period === key && s.periodTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content — single scrollable page */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={s.content}>
          {/* ── SALES SUMMARY: OVERVIEW ── */}
          <Text style={[s.sectionHeader, { marginTop: 0 }]}>Sales Summary: Overview</Text>

          {summary && summary.totalOrders > 0 ? (
            <>
              {/* Row 1 */}
              <View style={s.kpiGrid}>
                <View style={s.kpiCell}>
                  <Text style={s.kpiValue}>{curr(summary.totalRevenue)}</Text>
                  <Text style={s.kpiLabel}>Gross Sales</Text>
                  <ChangeLabel value={kpiChanges.revenue} />
                </View>
                <View style={s.kpiCell}>
                  <Text style={s.kpiValue}>{summary.totalOrders}</Text>
                  <Text style={s.kpiLabel}>Sales</Text>
                  <ChangeLabel value={kpiChanges.orders} />
                </View>
                <View style={s.kpiCell}>
                  <Text style={s.kpiValue}>{curr(avgSale)}</Text>
                  <Text style={s.kpiLabel}>Average Sale</Text>
                  <ChangeLabel value={kpiChanges.avg} />
                </View>
              </View>

              <View style={s.kpiDivider} />

              {/* Row 2 */}
              <View style={s.kpiGrid}>
                <View style={s.kpiCell}>
                  <Text style={s.kpiValue}>{curr(summary.netRevenue)}</Text>
                  <Text style={s.kpiLabel}>Net Sales</Text>
                  <ChangeLabel value={kpiChanges.net} />
                </View>
                <View style={s.kpiCell}>
                  <Text style={s.kpiValue}>{curr(0)}</Text>
                  <Text style={s.kpiLabel}>Refunds</Text>
                </View>
                <View style={s.kpiCell}>
                  <Text style={s.kpiValue}>{curr(summary.totalDiscounts)}</Text>
                  <Text style={s.kpiLabel}>Discounts</Text>
                  <ChangeLabel value={kpiChanges.discounts} />
                </View>
              </View>

              {/* ── REVENUE TREND ── */}
              {trendData.length > 1 && (
                <>
                  <Text style={s.sectionHeader}>Revenue Trend</Text>
                  <SimpleChart data={trendData} title="Daily Revenue" color={theme.colors.primary} height={chartH} />
                </>
              )}
            </>
          ) : (
            <EmptyState icon="insights" msg="No sales data for this period" />
          )}

          {/* ── SALES BY PAYMENT TYPES ── */}
          <Text style={s.sectionHeader}>Sales by Payment Types</Text>
          {payments.length > 0 ? (
            <View>
              <View style={s.dataRow}>
                <Text style={[s.dataLabel, { fontWeight: '600' }]}>Total Collected</Text>
                <Text style={s.dataValue}>{curr(paymentTotal)}</Text>
              </View>
              {payments.map((p, i) => {
                const proportion = paymentTotal > 0 ? p.totalAmount / paymentTotal : 0;
                return (
                  <View key={i}>
                    <View style={s.dataRow}>
                      <Text style={s.dataLabel}>{p.method}</Text>
                      <Text style={s.dataValue}>{curr(p.totalAmount)}</Text>
                    </View>
                    <View style={s.progressBarBg}>
                      <View style={[s.progressBarFill, { width: `${proportion * 100}%` }]} />
                    </View>
                  </View>
                );
              })}
              {summary && summary.totalTax > 0 && (
                <View style={s.dataRow}>
                  <Text style={s.dataLabel}>Fees</Text>
                  <Text style={[s.dataValue, s.dataValueNeg]}>({curr(summary.totalTax)})</Text>
                </View>
              )}
              <View style={[s.dataRow, { borderBottomWidth: 0 }]}>
                <Text style={[s.dataLabel, { fontWeight: '700' }]}>Net Total</Text>
                <Text style={[s.dataValue, { fontWeight: '700' }]}>
                  {curr(summary ? summary.netRevenue : paymentTotal)}
                </Text>
              </View>
            </View>
          ) : (
            <EmptyState icon="credit-card-off" msg="No payment data for this period" />
          )}

          {/* ── TOP ITEMS ── */}
          <Text style={s.sectionHeader}>Top Items</Text>
          {topItems.length > 0 ? (
            <View style={s.tableCard}>
              <TableRow cells={['Item', 'Gross', 'Count']} isHeader rank={0} />
              {topItems.map((it, i) => (
                <TableRow
                  key={it.itemId}
                  cells={[it.itemName, curr(it.totalRevenue), String(it.quantitySold)]}
                  rank={i + 1}
                />
              ))}
            </View>
          ) : (
            <EmptyState icon="restaurant-menu" msg="No item data for this period" />
          )}

          {/* ── STAFF PERFORMANCE ── */}
          <Text style={s.sectionHeader}>Staff Performance</Text>
          {staffPerf.length > 0 ? (
            <View style={s.tableCard}>
              <TableRow cells={['Staff Member', 'Orders', 'Sales']} isHeader />
              {staffPerf.map((st) => (
                <TableRow key={st.staffId} cells={[st.staffName, String(st.ordersHandled), curr(st.totalSales)]} />
              ))}
            </View>
          ) : (
            <EmptyState icon="people-outline" msg="No staff data for this period" />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
