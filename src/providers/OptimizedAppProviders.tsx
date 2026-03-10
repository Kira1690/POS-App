/**
 * Optimized App Providers - Performance-optimized provider tree
 * Reduces unnecessary provider re-renders through memoization
 * Implements proper provider composition for better performance
 */

/**
 * Optimized App Providers - Clean unified provider tree
 *
 * UNIFIED ORDER SYSTEM:
 * - UnifiedOrderProvider is the SINGLE source of truth for all order state
 * - No more duplicate order contexts (legacy OrderContext, EnhancedOrderContext removed)
 * - Kitchen updates flow through unified order events
 * - Clear data resets BOTH storage AND context state
 */

import React, { memo, useEffect } from 'react';
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
 * Optimized App Providers with performance optimizations
 * - Memoized provider composition
 * - Reduced re-render cascade
 * - Proper provider separation
 */
export const OptimizedAppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <SyncProvider>
        <BusinessStateProviders>
          {children}
        </BusinessStateProviders>
      </SyncProvider>
    </AuthProvider>
  );
};

/**
 * Business State Providers - Memoized to prevent auth changes from
 * causing unnecessary re-creation of business context providers
 */
const BusinessStateProviders = memo<{ children: React.ReactNode }>(({ children }) => {
  return (
    <TableProvider>
      <OrderManagementProviders>
        {children}
      </OrderManagementProviders>
    </TableProvider>
  );
});

BusinessStateProviders.displayName = 'BusinessStateProviders';

/**
 * Order Management Providers - Unified order system
 *
 * UNIFIED ORDER SYSTEM:
 * - UnifiedOrderProvider: SINGLE source of truth for all order state
 * - Status flow: draft -> confirmed -> preparing -> ready -> served -> paid
 * - Kitchen updates flow through unified order events
 */
const OrderManagementProviders = memo<{ children: React.ReactNode }>(({ children }) => {
  // Initialize storage services that need seeding on mount
  // Database tables are created by DatabaseService; these calls seed mock/default data
  useEffect(() => {
    const initializeStorageServices = async () => {
      const restaurantId = 'rest_001'; // Default restaurant ID

      try {
        await Promise.all([
          tableStorageService.initialize(restaurantId),
          kitchenStorageService.initialize(),
          authStorageService.seedDummyUsers(),
          // menuStorageService.initialize() is called by MenuContext.refreshMenu()
          // — removed here to eliminate double-initialization race condition
        ]);

        if (__DEV__) {
          console.log('[OptimizedAppProviders] Storage services initialized (seeding complete)');
        }
      } catch { /* silent — storage errors shown via app state */ }
    };

    initializeStorageServices();
  }, []);

  return (
    <UnifiedOrderProvider>
      <BillSplitProvider>
        <TransactionProviders>
          {children}
        </TransactionProviders>
      </BillSplitProvider>
    </UnifiedOrderProvider>
  );
});

OrderManagementProviders.displayName = 'OrderManagementProviders';

/**
 * Transaction Providers - Payment and kitchen config
 * Final level of provider memoization
 */
const TransactionProviders = memo<{ children: React.ReactNode }>(({ children }) => {
  return (
    <PaymentProvider>
      <KitchenConfigProvider>
        <PrinterProvider>
          {children}
        </PrinterProvider>
      </KitchenConfigProvider>
    </PaymentProvider>
  );
});

TransactionProviders.displayName = 'TransactionProviders';

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
    console.log('✅ AuthProvider: Top-level, changes rarely');
    console.log('✅ SyncProvider: Starts/stops SyncEngine on auth change');
    console.log('✅ BusinessStateProviders: Memoized, isolated from auth changes');
    console.log('✅ OrderManagementProviders: Memoized, isolated from table changes');
    console.log('   └─ UnifiedOrderProvider: NEW single source of truth for orders');
    console.log('✅ TransactionProviders: Memoized, isolated from order changes');
    console.log('');
    console.log('UNIFIED ORDER SYSTEM:');
    console.log('- Status flow: draft → confirmed → preparing → ready → served → paid');
    console.log('- Kitchen is the ONLY source of status updates (except payment)');
    console.log('- Payment button appears ONLY after status is "served"');
    console.log('- Clear data resets BOTH storage AND context state via SYSTEM_RESET event');
    console.log('');
    console.log('Performance Benefits:');
    console.log('- Auth changes don\'t recreate business providers');
    console.log('- Table changes don\'t recreate payment/kitchen providers');
    console.log('- Proper provider isolation reduces cascade re-renders');
    console.groupEnd();
  }
};

// Export for development debugging
if (__DEV__) {
  (window as unknown as Record<string, unknown>).analyzeProviderPerformance = analyzeProviderPerformance;
}
