/**
 * Optimized App Providers - Flattened provider tree with compose helper
 *
 * UNIFIED ORDER SYSTEM:
 * - UnifiedOrderProvider is the SINGLE source of truth for all order state
 * - No more duplicate order contexts (legacy OrderContext, EnhancedOrderContext removed)
 * - Kitchen updates flow through unified order events
 * - Clear data resets BOTH storage AND context state
 *
 * Provider groups (2 memoization boundaries):
 *   Auth → Sync → [BusinessProviders (memo): Table, Order, BillSplit, Payment, KitchenConfig, Printer]
 */

import React, { memo, useEffect, FC, ReactNode } from 'react';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { SyncProvider } from '@/context/sync/SyncProvider';
import { TableProvider } from '@/context/table/TableProvider';
import { UnifiedOrderProvider } from '@/context/unified-order';
import { BillSplitProvider } from '@/context/billing/BillSplitContext';
import { PaymentProvider } from '@/context/payment/PaymentProvider';
import { KitchenConfigProvider } from '@/context/kitchen';
import { PrinterProvider } from '@/context/printer/PrinterContext';
import {
  tableStorageService,
  kitchenStorageService,
  authStorageService,
} from '@/services/storage';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * composeProviders — reduces N nested providers into a single wrapper component.
 * Providers are applied outermost-first (first in the array wraps everything).
 */
function composeProviders(...providers: FC<{ children: ReactNode }>[]) {
  return providers.reduce(
    (Acc, Curr) =>
      function Composed({ children }: { children: ReactNode }) {
        return (
          <Acc>
            <Curr>{children}</Curr>
          </Acc>
        );
      }
  );
}

/**
 * Optimized App Providers
 * - Auth and Sync at the top (auth changes rarely, sync depends on auth)
 * - All business providers composed flat inside a single memo boundary
 */
export const OptimizedAppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <SyncProvider>
        <BusinessProviders>
          {children}
        </BusinessProviders>
      </SyncProvider>
    </AuthProvider>
  );
};

/**
 * Composed business providers — flattened from 3 nesting levels to 1 memo boundary.
 * Order matters: TableProvider must wrap UnifiedOrderProvider (orders reference tables).
 * UnifiedOrderProvider must wrap BillSplitProvider and PaymentProvider (they read order state).
 */
const ComposedBusinessProviders = composeProviders(
  TableProvider,
  UnifiedOrderProvider,
  BillSplitProvider,
  PaymentProvider,
  KitchenConfigProvider,
  PrinterProvider,
);

/**
 * BusinessProviders - Single memoized boundary for all business state.
 * Prevents auth/sync changes from re-creating business context providers.
 */
const BusinessProviders = memo<{ children: React.ReactNode }>(({ children }) => {
  // Initialize storage services that need seeding on mount
  useEffect(() => {
    const initializeStorageServices = async () => {
      const restaurantId = 'rest_001';

      try {
        const session = await authStorageService.getSession();
        const isDummy = session?.accessToken?.startsWith('dummy_') ?? false;

        const tasks: Promise<unknown>[] = [
          kitchenStorageService.initialize(),
          authStorageService.seedDummyUsers(),
        ];
        if (isDummy) {
          tasks.push(tableStorageService.initialize(restaurantId));
        }
        await Promise.all(tasks);

        if (__DEV__) {
          console.log('[OptimizedAppProviders] Storage services initialized (seeding complete)');
        }
      } catch { /* silent — storage errors shown via app state */ }
    };

    initializeStorageServices();
  }, []);

  return (
    <ComposedBusinessProviders>
      {children}
    </ComposedBusinessProviders>
  );
});

BusinessProviders.displayName = 'BusinessProviders';

/**
 * Context Performance Monitor - Development helper
 * Logs provider re-renders to help identify performance issues
 */
export const ContextPerformanceMonitor: React.FC<{ children: React.ReactNode }> =
  memo(({ children }) => {
    if (__DEV__) {
      console.log('[Context Performance] Provider tree rendered at:', new Date().toISOString());
    }

    return <>{children}</>;
  });

ContextPerformanceMonitor.displayName = 'ContextPerformanceMonitor';

/**
 * Development Provider Wrapper - Includes performance monitoring in dev
 */
export const DevOptimizedAppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  if (__DEV__) {
    return (
      <ContextPerformanceMonitor>
        <OptimizedAppProviders>
          {children}
        </OptimizedAppProviders>
      </ContextPerformanceMonitor>
    );
  }

  return (
    <OptimizedAppProviders>
      {children}
    </OptimizedAppProviders>
  );
};

/**
 * Provider Tree Analysis - Development utility
 * Helps analyze provider re-render patterns
 */
export const analyzeProviderPerformance = () => {
  if (__DEV__) {
    console.group('Provider Tree Analysis');
    console.log('AuthProvider: Top-level, changes rarely');
    console.log('SyncProvider: Starts/stops SyncEngine on auth change');
    console.log('BusinessProviders (memo): Single boundary, flattened via composeProviders');
    console.log('  Table → UnifiedOrder → BillSplit → Payment → KitchenConfig → Printer');
    console.log('');
    console.log('UNIFIED ORDER SYSTEM:');
    console.log('- Status flow: draft -> confirmed -> preparing -> ready -> served -> paid');
    console.log('- Kitchen is the ONLY source of status updates (except payment)');
    console.log('- Clear data resets BOTH storage AND context state via SYSTEM_RESET event');
    console.log('');
    console.log('Performance Benefits:');
    console.log('- Auth changes do not recreate business providers (memo boundary)');
    console.log('- composeProviders flattens 6 providers into a single composed component');
    console.log('- Screens lazy-loaded: Settings, OrderDetails, POS, Ordering, Payment, Billing, Receipt');
    console.groupEnd();
  }
};

// Export for development debugging
if (__DEV__) {
  (window as unknown as Record<string, unknown>).analyzeProviderPerformance = analyzeProviderPerformance;
}
