/**
 * Professional Performance Monitoring Hook
 * Enterprise-grade React Hook for component performance tracking
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor, MemoryTracker } from '@/utils/performance';

interface UsePerformanceMonitoringOptions {
  componentName: string;
  enableMemoryTracking?: boolean;
  trackReRenders?: boolean;
  logThreshold?: number; // milliseconds
}

interface PerformanceHookResult {
  startTracking: () => void;
  endTracking: () => void;
  getMetrics: () => any;
  memoryUsage: string;
}

/**
 * Professional performance monitoring hook for components
 */
export const usePerformanceMonitoring = (
  options: UsePerformanceMonitoringOptions
): PerformanceHookResult => {
  const {
    componentName,
    enableMemoryTracking = false,
    trackReRenders = __DEV__,
    logThreshold = 16
  } = options;

  const renderCount = useRef(0);
  const memoryTracker = useRef<MemoryTracker | undefined>(undefined);

  // Initialize memory tracking if enabled
  useEffect(() => {
    if (enableMemoryTracking) {
      memoryTracker.current = MemoryTracker.getInstance();
      memoryTracker.current.startTracking();
    }

    return () => {
      if (memoryTracker.current) {
        memoryTracker.current.stopTracking();
      }
    };
  }, [enableMemoryTracking]);

  // Track re-renders in development
  useEffect(() => {
    if (trackReRenders) {
      renderCount.current += 1;
      
    }
  });

  const startTracking = useCallback(() => {
    performanceMonitor.startRenderTracking(componentName);
  }, [componentName]);

  const endTracking = useCallback(() => {
    const metrics = performanceMonitor.endRenderTracking(componentName);
    
    if (metrics && metrics.renderTime > logThreshold && __DEV__) {
      console.warn(`[Perf] Slow: ${componentName} ${metrics.renderTime.toFixed(2)}ms`);
    }

    return metrics;
  }, [componentName, logThreshold]);

  const getMetrics = useCallback(() => {
    return {
      componentName,
      renderCount: renderCount.current,
      memoryUsage: memoryTracker.current?.getFormattedUsage() || 'Unknown',
      summary: performanceMonitor.getPerformanceSummary(),
    };
  }, [componentName]);

  const memoryUsage = memoryTracker.current?.getFormattedUsage() || 'Unknown';

  return {
    startTracking,
    endTracking,
    getMetrics,
    memoryUsage,
  };
};

/**
 * Professional hook for FlatList performance optimization
 */
export const useFlatListOptimization = (itemCount: number, itemHeight?: number) => {
  const getOptimalBatchSize = useCallback(() => {
    // Adjust batch size based on item count and complexity
    if (itemCount < 50) return Math.min(itemCount, 10);
    if (itemCount < 200) return 15;
    return 20;
  }, [itemCount]);

  const getOptimalWindowSize = useCallback(() => {
    // Adjust window size based on item count
    if (itemCount < 100) return 5;
    if (itemCount < 500) return 10;
    return 15;
  }, [itemCount]);

  const getItemLayout = useCallback((data: any, index: number) => {
    const height = itemHeight || 120; // Default height if not provided
    
    return {
      length: height,
      offset: height * index,
      index,
    };
  }, [itemHeight]);

  const keyExtractor = useCallback((item: any, index: number) => {
    return item?.id?.toString() || `item_${index}`;
  }, []);

  return {
    maxToRenderPerBatch: getOptimalBatchSize(),
    windowSize: getOptimalWindowSize(),
    initialNumToRender: Math.min(getOptimalBatchSize(), 10),
    updateCellsBatchingPeriod: 50,
    removeClippedSubviews: itemCount > 50,
    getItemLayout: getItemLayout,
    keyExtractor,
    // Professional scroll performance
    scrollEventThrottle: 16, // 60fps
  };
};

/**
 * Professional hook for component memoization optimization
 */
export const useMemoizationOptimization = <T>(
  computation: () => T,
  deps: React.DependencyList,
  debugName?: string
) => {
  const lastDeps = useRef<React.DependencyList | undefined>(undefined);
  const lastResult = useRef<T | undefined>(undefined);
  const computationCount = useRef(0);

  // Check if dependencies have changed
  const depsChanged = !lastDeps.current || 
    deps.length !== lastDeps.current.length ||
    deps.some((dep, index) => dep !== lastDeps.current![index]);

  if (depsChanged) {
    computationCount.current += 1;
    lastResult.current = computation();
    lastDeps.current = deps;

    if (__DEV__ && debugName && computationCount.current % 10 === 0) {
      console.log(`🧮 Memoization: ${debugName} computed ${computationCount.current} times`);
    }
  }

  return lastResult.current!;
};

/**
 * Professional hook for callback optimization
 */
export const useCallbackOptimization = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  debugName?: string
): T => {
  const callCount = useRef(0);
  const lastCallback = useRef<T | undefined>(undefined);
  const lastDeps = useRef<React.DependencyList | undefined>(undefined);

  // Check if dependencies have changed
  const depsChanged = !lastDeps.current || 
    deps.length !== lastDeps.current.length ||
    deps.some((dep, index) => dep !== lastDeps.current![index]);

  if (depsChanged || !lastCallback.current) {
    lastCallback.current = ((...args: any[]) => {
      callCount.current += 1;
      
      if (__DEV__ && debugName && callCount.current % 50 === 0) {
        console.log(`📞 Callback optimization: ${debugName} called ${callCount.current} times`);
      }
      
      return callback(...args);
    }) as T;
    
    lastDeps.current = deps;
  }

  return lastCallback.current;
};