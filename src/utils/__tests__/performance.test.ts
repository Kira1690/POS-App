/**
 * Professional Performance Utilities Test Suite
 * Enterprise-grade testing for performance monitoring
 */

import { performanceMonitor, performantDebounce, performantThrottle, MemoryTracker } from '../performance';

// Mock performance API
const mockPerformance = {
  now: jest.fn(),
  memory: {
    usedJSHeapSize: 150 * 1024 * 1024, // 150MB
    totalJSHeapSize: 250 * 1024 * 1024,
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024,
  },
};

Object.defineProperty(global, 'performance', {
  writable: true,
  value: mockPerformance,
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(0);
  });

  describe('Render Tracking', () => {
    it('should track component render time', () => {
      const componentName = 'TestComponent';
      
      mockPerformance.now
        .mockReturnValueOnce(0)    // Start time
        .mockReturnValueOnce(50);  // End time (50ms render)

      performanceMonitor.startRenderTracking(componentName);
      const metrics = performanceMonitor.endRenderTracking(componentName);

      expect(metrics).toEqual({
        componentName,
        renderTime: 50,
        timestamp: expect.any(Number),
        memoryUsage: 150 * 1024 * 1024,
      });
    });

    it('should warn about slow renders', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const componentName = 'SlowComponent';
      
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(100); // 100ms > 16ms threshold

      performanceMonitor.startRenderTracking(componentName);
      performanceMonitor.endRenderTracking(componentName);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow render detected: SlowComponent'),
        expect.objectContaining({
          renderTime: '100.00ms',
          threshold: '16ms',
        })
      );

      consoleSpy.mockRestore();
    });

    it('should handle missing start tracking', () => {
      const metrics = performanceMonitor.endRenderTracking('NonExistentComponent');
      expect(metrics).toBeNull();
    });
  });

  describe('Performance Summary', () => {
    it('should calculate performance summary correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(0).mockReturnValueOnce(10)   // Component A: 10ms
        .mockReturnValueOnce(0).mockReturnValueOnce(20)   // Component B: 20ms
        .mockReturnValueOnce(0).mockReturnValueOnce(5);   // Component C: 5ms

      performanceMonitor.startRenderTracking('ComponentA');
      performanceMonitor.endRenderTracking('ComponentA');
      
      performanceMonitor.startRenderTracking('ComponentB');
      performanceMonitor.endRenderTracking('ComponentB');
      
      performanceMonitor.startRenderTracking('ComponentC');
      performanceMonitor.endRenderTracking('ComponentC');

      const summary = performanceMonitor.getPerformanceSummary();

      expect(summary).toEqual({
        averageRenderTime: (10 + 20 + 5) / 3,
        slowComponents: ['ComponentB'], // Only B > 16ms threshold
        totalMetrics: 3,
        memoryPeak: 150 * 1024 * 1024,
      });
    });

    it('should handle empty metrics', () => {
      const summary = performanceMonitor.getPerformanceSummary();
      
      expect(summary).toEqual({
        averageRenderTime: 0,
        slowComponents: [],
        totalMetrics: 0,
        memoryPeak: undefined,
      });
    });
  });
});

describe('Performance Utilities', () => {
  describe('Debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = performantDebounce(mockFn, 1000, 'test-debounce');

      // Call multiple times rapidly
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      // Should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      // Should be called once with last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    it('should log efficiency in development', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockFn = jest.fn();
      const debouncedFn = performantDebounce(mockFn, 1000, 'efficiency-test');

      // Call 6 times to trigger efficiency logging
      for (let i = 0; i < 6; i++) {
        debouncedFn(`arg${i}`);
      }

      jest.advanceTimersByTime(1000);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Debounce efficiency: efficiency-test batched 6 calls')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Throttle', () => {
    jest.useFakeTimers();

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = performantThrottle(mockFn, 1000, 'test-throttle');

      // First call should execute immediately
      throttledFn('arg1');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');

      // Subsequent calls should be skipped
      throttledFn('arg2');
      throttledFn('arg3');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // After delay, throttling should reset
      jest.advanceTimersByTime(1000);
      throttledFn('arg4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('arg4');
    });

    it('should log skipped calls in development', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockFn = jest.fn();
      const throttledFn = performantThrottle(mockFn, 1000, 'efficiency-test');

      throttledFn('arg1'); // Executes
      throttledFn('arg2'); // Skipped
      throttledFn('arg3'); // Skipped

      jest.advanceTimersByTime(1000);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Throttle efficiency: efficiency-test skipped 2 calls')
      );

      consoleSpy.mockRestore();
    });
  });
});

describe('Memory Tracker', () => {
  let memoryTracker: MemoryTracker;

  beforeEach(() => {
    memoryTracker = MemoryTracker.getInstance();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    memoryTracker.stopTracking();
    jest.useRealTimers();
  });

  it('should be a singleton', () => {
    const tracker1 = MemoryTracker.getInstance();
    const tracker2 = MemoryTracker.getInstance();
    expect(tracker1).toBe(tracker2);
  });

  it('should get current memory usage', () => {
    const usage = memoryTracker.getCurrentUsage();
    expect(usage).toBe(150 * 1024 * 1024);
  });

  it('should format memory usage', () => {
    const formatted = memoryTracker.getFormattedUsage();
    expect(formatted).toBe('150MB');
  });

  it('should track memory usage over time', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    memoryTracker.startTracking(1000); // 1 second interval

    // Advance time to trigger memory check
    jest.advanceTimersByTime(1000);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Memory usage: 150MB')
    );

    consoleSpy.mockRestore();
  });

  it('should handle missing performance.memory', () => {
    const originalMemory = (global.performance as any).memory;
    delete (global.performance as any).memory;

    const usage = memoryTracker.getCurrentUsage();
    expect(usage).toBeNull();

    const formatted = memoryTracker.getFormattedUsage();
    expect(formatted).toBe('Unknown');

    // Restore
    (global.performance as any).memory = originalMemory;
  });

  it('should prevent duplicate tracking', () => {
    memoryTracker.startTracking(1000);
    memoryTracker.startTracking(500); // Should not start a new interval

    // Should only have one timer running
    expect(jest.getTimerCount()).toBe(1);
  });
});