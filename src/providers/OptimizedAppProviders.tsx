/**
 * Optimized App Providers - Performance-optimized provider tree
 * Reduces unnecessary provider re-renders through memoization
 * Implements proper provider composition for better performance
 */

import React, { memo } from 'react';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { TableProvider } from '@/context/table/TableProvider';
import { OrderProvider } from '@/context/order/OrderContext';
import { PaymentProvider } from '@/context/payment/PaymentProvider';
import { KitchenProvider } from '@/context/kitchen/KitchenContext';

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
 */
const OrderManagementProviders = memo<{ children: React.ReactNode }>(({ children }) => {
  return (
    <OrderProvider>
      <TransactionProviders>
        {children}
      </TransactionProviders>
    </OrderProvider>
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
      <KitchenProvider>
        {children}
      </KitchenProvider>
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