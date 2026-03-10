/**
 * Professional Performance Monitoring Utilities
 * Enterprise-grade performance tracking and optimization for POS system
 */

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
  memoryUsage?: number;
  networkRequests?: number;
}

export interface PerformanceConfig {
  enableLogging: boolean;
  renderTimeThreshold: number; // 16ms for 60fps
  memoryThreshold: number; // 200MB
  enableAnalytics: boolean;
}

class PerformanceMonitor {
  private config: PerformanceConfig = {
    enableLogging: __DEV__,
    renderTimeThreshold: 16,
    memoryThreshold: 200 * 1024 * 1024, // 200MB in bytes
    enableAnalytics: true,
  };

  private metrics: PerformanceMetrics[] = [];
  private renderStartTimes = new Map<string, number>();

  /**
   * Start tracking component render performance
   */
  startRenderTracking(componentName: string): void {
    if (!this.config.enableLogging) return;
    
    this.renderStartTimes.set(componentName, performance.now());
  }

  /**
   * End tracking and log performance metrics
   */
  endRenderTracking(componentName: string): PerformanceMetrics | null {
    if (!this.config.enableLogging) return null;
    
    const startTime = this.renderStartTimes.get(componentName);
    if (!startTime) return null;

    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
      memoryUsage: this.getMemoryUsage(),
    };

    this.metrics.push(metrics);
    this.renderStartTimes.delete(componentName);

    // Log performance issues
    if (renderTime > this.config.renderTimeThreshold) {
      if (__DEV__) {
        console.warn(`[Perf] Slow render: ${componentName} ${renderTime.toFixed(2)}ms`);
      }

      // Send to analytics if enabled
      if (this.config.enableAnalytics) {
        this.trackPerformanceIssue(metrics);
      }
    }

    return metrics;
  }

  /**
   * Get current memory usage (approximation)
   */
  private getMemoryUsage(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Track performance issue for analytics
   */
  private trackPerformanceIssue(metrics: PerformanceMetrics): void {
    // In a real app, this would send to analytics service
    if (__DEV__) {
      console.log('📊 Performance Issue Tracked:', {
        component: metrics.componentName,
        renderTime: metrics.renderTime,
        memoryUsage: metrics.memoryUsage,
        timestamp: new Date(metrics.timestamp).toISOString(),
      });
    }
  }

  /**
   * Get performance summary for monitoring
   */
  getPerformanceSummary(): {
    averageRenderTime: number;
    slowComponents: string[];
    totalMetrics: number;
    memoryPeak: number | undefined;
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        slowComponents: [],
        totalMetrics: 0,
        memoryPeak: undefined,
      };
    }

    const totalRenderTime = this.metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    const averageRenderTime = totalRenderTime / this.metrics.length;
    
    const slowComponents = this.metrics
      .filter(metric => metric.renderTime > this.config.renderTimeThreshold)
      .map(metric => metric.componentName)
      .filter((name, index, array) => array.indexOf(name) === index);

    const memoryPeak = this.metrics
      .filter(metric => metric.memoryUsage !== undefined)
      .reduce((max, metric) => Math.max(max, metric.memoryUsage!), 0);

    return {
      averageRenderTime,
      slowComponents,
      totalMetrics: this.metrics.length,
      memoryPeak: memoryPeak || undefined,
    };
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
    this.renderStartTimes.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Professional performance timing decorator
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    if (__DEV__ && duration > 10) {
      console.log(`[Perf] ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
}

/**
 * Debounce function with performance tracking
 */
export function performantDebounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
  name: string = 'anonymous'
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  let callCount = 0;
  
  return ((...args: any[]) => {
    callCount++;
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      if (__DEV__ && callCount > 5) {
        console.log(`🔄 Debounce efficiency: ${name} batched ${callCount} calls`);
      }
      callCount = 0;
      func(...args);
    }, delay);
  }) as T;
}

/**
 * Throttle function with performance tracking
 */
export function performantThrottle<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
  name: string = 'anonymous'
): T {
  let isThrottled = false;
  let skippedCalls = 0;
  
  return ((...args: any[]) => {
    if (isThrottled) {
      skippedCalls++;
      return;
    }
    
    func(...args);
    isThrottled = true;
    
    setTimeout(() => {
      isThrottled = false;
      if (__DEV__ && skippedCalls > 0) {
        console.log(`🛑 Throttle efficiency: ${name} skipped ${skippedCalls} calls`);
        skippedCalls = 0;
      }
    }, delay);
  }) as T;
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  private static instance: MemoryTracker;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private thresholdWarnings = new Set<string>();

  static getInstance(): MemoryTracker {
    if (!MemoryTracker.instance) {
      MemoryTracker.instance = new MemoryTracker();
    }
    return MemoryTracker.instance;
  }

  startTracking(intervalMs: number = 30000): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      const usage = this.getCurrentUsage();
      if (usage && usage > 150 * 1024 * 1024) { // 150MB warning threshold
        const key = `memory_${Math.floor(usage / (1024 * 1024))}MB`;
        if (!this.thresholdWarnings.has(key)) {
          if (__DEV__) {
            console.warn(`[Perf] Memory: ${Math.round(usage / (1024 * 1024))}MB`);
          }
          this.thresholdWarnings.add(key);
        }
      }
    }, intervalMs);
  }

  stopTracking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getCurrentUsage(): number | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize || null;
    }
    return null;
  }

  getFormattedUsage(): string {
    const usage = this.getCurrentUsage();
    if (!usage) return 'Unknown';
    return `${Math.round(usage / (1024 * 1024))}MB`;
  }
}