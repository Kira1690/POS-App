/**
 * Optimized App Providers - Performance-optimized provider tree
 * Reduces unnecessary provider re-renders through memoization
 * Implements proper provider composition for better performance
 */

import React, { memo, useEffect } from 'react';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { TableProvider } from '@/context/table/TableProvider';
import { EnhancedOrderProvider } from '@/context/order/EnhancedOrderContext';
import { BillSplitProvider } from '@/context/billing/BillSplitContext';
import { PaymentProvider } from '@/context/payment/PaymentProvider';
import { EnhancedKitchenProvider } from '@/context/kitchen';
import {
  orderStorageService,
  kitchenStorageService,
  tableStorageService,
  paymentStorageService,
  syncQueueService,
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
      <BusinessStateProviders>
        {children}
      </BusinessStateProviders>
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
 * Order Management Providers - Further memoized grouping
 * Prevents table changes from affecting payment/kitchen contexts
 * Uses EnhancedOrderProvider for kitchen ticket creation and modifier support
 */
const OrderManagementProviders = memo<{ children: React.ReactNode }>(({ children }) => {
  // Initialize ALL storage services on mount for data persistence
  useEffect(() => {
    const initializeAllStorage = async () => {
      const restaurantId = 'rest_001'; // Default restaurant ID

      try {
        // Initialize all storage services in parallel
        await Promise.all([
          orderStorageService.initialize(),
          kitchenStorageService.initialize(),
          tableStorageService.initialize(restaurantId),
          paymentStorageService.initialize(),
          syncQueueService.initialize(),
        ]);

        if (__DEV__) {
          console.log('[OptimizedAppProviders] All storage services initialized:');
          console.log('  - orderStorageService: ready');
          console.log('  - kitchenStorageService: ready');
          console.log('  - tableStorageService: ready');
          console.log('  - paymentStorageService: ready');
          console.log('  - syncQueueService: ready');
        }
      } catch (error) {
        console.error('[OptimizedAppProviders] Storage initialization failed:', error);
        // Log which service failed if possible
        if (error instanceof Error) {
          console.error('  Error details:', error.message);
        }
      }
    };

    initializeAllStorage();
  }, []);

  return (
    <EnhancedOrderProvider>
      <BillSplitProvider>
        <TransactionProviders>
          {children}
        </TransactionProviders>
      </BillSplitProvider>
    </EnhancedOrderProvider>
  );
});

OrderManagementProviders.displayName = 'OrderManagementProviders';

/**
 * Transaction Providers - Payment and kitchen operations
 * Final level of provider memoization
 */
const TransactionProviders = memo<{ children: React.ReactNode }>(({ children }) => {
  return (
    <PaymentProvider>
      <EnhancedKitchenProvider>
        {children}
      </EnhancedKitchenProvider>
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
    console.log('✅ BusinessStateProviders: Memoized, isolated from auth changes');
    console.log('✅ OrderManagementProviders: Memoized, isolated from table changes');
    console.log('✅ TransactionProviders: Memoized, isolated from order changes');
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
  (window as any).analyzeProviderPerformance = analyzeProviderPerformance;
}